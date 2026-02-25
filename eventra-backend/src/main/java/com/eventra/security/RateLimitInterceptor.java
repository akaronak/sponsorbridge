package com.eventra.security;

import org.springframework.stereotype.Component;

/**
 * @deprecated Replaced by {@link com.eventra.filter.RateLimitFilter} which uses
 * Redis-backed distributed rate limiting via Bucket4j token buckets.
 *
 * <p>This class is kept as a no-op to avoid breaking any remaining references.
 * It will be removed in the next cleanup pass.</p>
 *
 * @see com.eventra.filter.RateLimitFilter
 * @see com.eventra.infrastructure.DistributedRateLimiter
 */
@Component
@Deprecated(forRemoval = true)
public class RateLimitInterceptor {
    // Intentionally empty — rate limiting is now handled by
    // RateLimitFilter (servlet filter) + DistributedRateLimiter (Redis)
}
