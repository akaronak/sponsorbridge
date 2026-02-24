package com.eventra.filter;

import com.eventra.infrastructure.DistributedRateLimiter;
import com.eventra.infrastructure.DistributedRateLimiter.RateLimitTier;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Servlet filter for distributed rate limiting.
 * Runs AFTER Spring Security's authentication filter so we have access
 * to the authenticated principal for user-based throttling.
 *
 * <h3>Throttling strategy:</h3>
 * <ul>
 *   <li><b>Authenticated users</b>: Throttled by User ID (100 req/min default)</li>
 *   <li><b>Admin users</b>: Throttled by User ID (500 req/min)</li>
 *   <li><b>Anonymous requests</b>: Throttled by IP address (30 req/min)</li>
 * </ul>
 *
 * <h3>Response headers (always set):</h3>
 * <ul>
 *   <li>{@code X-RateLimit-Limit}: Maximum requests per window</li>
 *   <li>{@code X-RateLimit-Remaining}: Remaining requests in current window</li>
 *   <li>{@code X-RateLimit-Reset}: Seconds until the window resets</li>
 *   <li>{@code Retry-After}: Seconds to wait (only on 429)</li>
 * </ul>
 *
 * <h3>Excluded paths:</h3>
 * <p>Health checks, actuator endpoints, and WebSocket handshake are excluded.</p>
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 10)
@Slf4j
@RequiredArgsConstructor
public class RateLimitFilter extends OncePerRequestFilter {

    private final DistributedRateLimiter rateLimiter;
    private final ObjectMapper objectMapper;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/actuator")
                || path.startsWith("/ws")
                || path.equals("/health")
                || path.equals("/favicon.ico");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String key = resolveKey(request);
        RateLimitTier tier = resolveTier();

        // Set rate limit headers
        int capacity = resolveCapacity(tier);
        long remaining = rateLimiter.getRemainingTokens(key, tier);

        response.setIntHeader("X-RateLimit-Limit", capacity);
        response.setHeader("X-RateLimit-Remaining", String.valueOf(Math.max(0, remaining)));
        response.setIntHeader("X-RateLimit-Reset", resolveResetSeconds(tier));

        // Try to consume a token
        if (!rateLimiter.tryConsume(key, tier)) {
            log.warn("Rate limit exceeded for key={}, tier={}, ip={}",
                    key, tier, getClientIp(request));

            int retryAfter = resolveResetSeconds(tier);
            response.setIntHeader("Retry-After", retryAfter);
            response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE); // 429
            response.setStatus(429);
            response.setContentType("application/json");

            Map<String, Object> body = Map.of(
                    "timestamp", LocalDateTime.now().toString(),
                    "status", 429,
                    "error", "Too Many Requests",
                    "message", String.format(
                            "Rate limit exceeded: %d requests per minute. Retry after %d seconds.",
                            capacity, retryAfter),
                    "retryAfter", retryAfter
            );

            objectMapper.writeValue(response.getWriter(), body);
            return;
        }

        filterChain.doFilter(request, response);
    }

    /**
     * Resolve rate limit key:
     * - Authenticated: "user:{userId}"
     * - Anonymous: "ip:{clientIp}"
     */
    private String resolveKey(HttpServletRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            return "user:" + auth.getPrincipal().toString();
        }
        return "ip:" + getClientIp(request);
    }

    /**
     * Resolve rate limit tier based on authenticated user's role.
     */
    private RateLimitTier resolveTier() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return RateLimitTier.ANONYMOUS;
        }

        boolean isAdmin = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN"));

        return isAdmin ? RateLimitTier.ADMIN : RateLimitTier.DEFAULT;
    }

    /**
     * Extract client IP, respecting reverse proxy headers.
     * In production behind ALB/nginx, X-Forwarded-For is set.
     */
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            // Take the first IP (client IP) from the chain
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }

    private int resolveCapacity(RateLimitTier tier) {
        return switch (tier) {
            case ADMIN -> 500;
            case ANONYMOUS -> 30;
            default -> 100;
        };
    }

    private int resolveResetSeconds(RateLimitTier tier) {
        return 60; // All tiers use 1-minute windows
    }
}
