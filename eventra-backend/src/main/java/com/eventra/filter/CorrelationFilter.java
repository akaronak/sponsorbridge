package com.eventra.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Injects correlation context into every HTTP request via SLF4J MDC.
 *
 * <h3>MDC fields set:</h3>
 * <ul>
 *   <li><b>requestId</b>   — UUID per request (or forwarded from X-Request-Id header)</li>
 *   <li><b>userId</b>      — Authenticated user ID (from SecurityContext, set after JWT filter)</li>
 *   <li><b>userRole</b>    — User role (ORGANIZER, COMPANY, ADMIN)</li>
 *   <li><b>clientIp</b>    — Client IP (respects X-Forwarded-For / X-Real-IP)</li>
 *   <li><b>method</b>      — HTTP method</li>
 *   <li><b>uri</b>         — Request URI</li>
 * </ul>
 *
 * <h3>Ordering:</h3>
 * <p>Runs at {@code HIGHEST_PRECEDENCE + 5}, <b>before</b> Spring Security and
 * RateLimitFilter, so that the requestId is available in all downstream logs.
 * The userId/userRole are populated in a second pass via a
 * {@link SecurityContextEnricher} that runs after authentication.</p>
 *
 * <h3>Response header:</h3>
 * <p>The {@code X-Request-Id} response header is always set so clients
 * can reference the correlation ID in support requests.</p>
 *
 * <h3>Security:</h3>
 * <p>No JWT tokens, passwords, or secrets are ever placed in MDC.</p>
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE + 5)
public class CorrelationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(CorrelationFilter.class);

    private static final String REQUEST_ID_HEADER = "X-Request-Id";
    private static final String MDC_REQUEST_ID = "requestId";
    private static final String MDC_USER_ID = "userId";
    private static final String MDC_USER_ROLE = "userRole";
    private static final String MDC_CLIENT_IP = "clientIp";
    private static final String MDC_METHOD = "method";
    private static final String MDC_URI = "uri";

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Skip static assets & favicon
        return path.equals("/favicon.ico");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        long startTime = System.currentTimeMillis();

        try {
            // ── Generate or accept correlation ID ──
            String requestId = request.getHeader(REQUEST_ID_HEADER);
            if (requestId == null || requestId.isBlank()) {
                requestId = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
            }

            // ── Populate MDC (pre-auth fields) ──
            MDC.put(MDC_REQUEST_ID, requestId);
            MDC.put(MDC_CLIENT_IP, resolveClientIp(request));
            MDC.put(MDC_METHOD, request.getMethod());
            MDC.put(MDC_URI, request.getRequestURI());

            // ── Set response header for client correlation ──
            response.setHeader(REQUEST_ID_HEADER, requestId);

            // ── Execute filter chain (auth happens inside) ──
            filterChain.doFilter(request, response);

        } finally {
            // ── Post-auth MDC enrichment (userId/role now available) ──
            enrichFromSecurityContext();

            // ── Log completed request ──
            long duration = System.currentTimeMillis() - startTime;
            int status = response.getStatus();

            if (status >= 500) {
                log.error("HTTP {} {} → {} ({}ms)", request.getMethod(), request.getRequestURI(), status, duration);
            } else if (status >= 400) {
                log.warn("HTTP {} {} → {} ({}ms)", request.getMethod(), request.getRequestURI(), status, duration);
            } else if (!request.getRequestURI().startsWith("/actuator")) {
                log.info("HTTP {} {} → {} ({}ms)", request.getMethod(), request.getRequestURI(), status, duration);
            }

            // ── Always clear MDC to prevent thread-pool leakage ──
            MDC.clear();
        }
    }

    /**
     * Enrich MDC with authenticated user context from SecurityContextHolder.
     * Called after the filter chain has executed (JWT filter will have run).
     */
    private void enrichFromSecurityContext() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            MDC.put(MDC_USER_ID, auth.getPrincipal().toString());
            String role = auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .filter(r -> r.startsWith("ROLE_"))
                    .map(r -> r.substring(5))
                    .findFirst()
                    .orElse("UNKNOWN");
            MDC.put(MDC_USER_ROLE, role);
        }
    }

    /**
     * Extract client IP, respecting reverse proxy headers.
     */
    private String resolveClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
}
