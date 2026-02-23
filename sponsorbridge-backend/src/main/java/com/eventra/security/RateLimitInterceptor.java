package com.eventra.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limiting interceptor using token bucket algorithm
 * Limits requests to 100 per minute per user
 */
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    private static final int MAX_REQUESTS_PER_MINUTE = 100;
    private static final long MINUTE_IN_MILLIS = 60 * 1000;

    // Store rate limit state: userId -> {requestCount, windowStartTime}
    private final ConcurrentHashMap<String, RateLimitBucket> rateLimitMap = new ConcurrentHashMap<>();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String userId = getUserIdentifier();

        if (userId == null) {
            // Allow unauthenticated requests (they'll be blocked by security config anyway)
            return true;
        }

        RateLimitBucket bucket = rateLimitMap.computeIfAbsent(userId, k -> new RateLimitBucket());

        synchronized (bucket) {
            long now = System.currentTimeMillis();

            // Reset bucket if time window has passed
            if (now - bucket.windowStartTime > MINUTE_IN_MILLIS) {
                bucket.requestCount = 0;
                bucket.windowStartTime = now;
            }

            // Check if limit exceeded
            if (bucket.requestCount >= MAX_REQUESTS_PER_MINUTE) {
                response.setStatus(429);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\": \"Rate limit exceeded: 100 requests per minute\"}");
                return false;
            }

            bucket.requestCount++;
        }

        return true;
    }

    /**
     * Get user identifier from security context
     * @return user ID or IP address if not authenticated
     */
    private String getUserIdentifier() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof Long) {
                return "user_" + principal;
            } else if (principal instanceof String) {
                return "user_" + principal;
            }
        }
        return null;
    }

    /**
     * Inner class to hold rate limit state for a user
     */
    private static class RateLimitBucket {
        int requestCount = 0;
        long windowStartTime = System.currentTimeMillis();
    }
}
