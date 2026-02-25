package com.eventra.infrastructure;

import com.eventra.config.RateLimitProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Distributed rate limiter using token bucket algorithm backed by Redis.
 *
 * <h3>Two-tier architecture for horizontal scaling:</h3>
 * <pre>
 * Request → RateLimitFilter → DistributedRateLimiter
 *                                    │
 *                        ┌───────────┴───────────┐
 *                        ▼                       ▼
 *                  Local TokenBucket        Redis Sorted Set
 *                  (fast path, ~1μs)       (global truth, ~1ms)
 * </pre>
 *
 * <h3>Local bucket (Tier 1):</h3>
 * <p>Self-contained token bucket implementation using greedy refill.
 * Provides sub-microsecond rejection for obvious over-limit clients
 * without hitting Redis. Each JVM instance maintains its own local state.</p>
 *
 * <h3>Redis sliding window (Tier 2):</h3>
 * <p>Atomic Lua script using sorted sets for precise cross-instance rate tracking.
 * Entries auto-expire via PEXPIRE. This is the same algorithm used by
 * Stripe, GitHub, and Cloudflare for production rate limiting.</p>
 *
 * <h3>Failure mode: fail-open</h3>
 * <p>If Redis is unavailable, requests are allowed through. This prevents
 * a Redis outage from taking down the entire API.</p>
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class DistributedRateLimiter {

    private final StringRedisTemplate redisTemplate;
    private final RateLimitProperties properties;

    // Local fast-path buckets (lightweight first-level defense per JVM)
    private final ConcurrentHashMap<String, LocalTokenBucket> localBuckets = new ConcurrentHashMap<>();

    private static final String RATE_LIMIT_KEY_PREFIX = "eventra:ratelimit:";

    /**
     * Atomic Lua script implementing sliding window counter via Redis sorted sets.
     *
     * KEYS[1] = rate limit key
     * ARGV[1] = max tokens (capacity)
     * ARGV[2] = window size in milliseconds
     * ARGV[3] = current timestamp in milliseconds
     * ARGV[4] = unique request ID
     *
     * Returns: remaining tokens (negative = rate limited)
     */
    private static final String SLIDING_WINDOW_SCRIPT =
            """
            local key = KEYS[1]
            local capacity = tonumber(ARGV[1])
            local windowMs = tonumber(ARGV[2])
            local now = tonumber(ARGV[3])
            local requestId = ARGV[4]
            local windowStart = now - windowMs
            redis.call('ZREMRANGEBYSCORE', key, '-inf', windowStart)
            local currentCount = redis.call('ZCARD', key)
            if currentCount < capacity then
                redis.call('ZADD', key, now, requestId)
                redis.call('PEXPIRE', key, windowMs)
                return capacity - currentCount - 1
            else
                redis.call('PEXPIRE', key, windowMs)
                return -1
            end
            """;

    /**
     * Check if a request is allowed under the rate limit.
     *
     * @param key      Unique identifier (user ID or IP address)
     * @param tier     Rate limit tier (DEFAULT, ADMIN, ANONYMOUS)
     * @return true if the request is allowed
     */
    public boolean tryConsume(String key, RateLimitTier tier) {
        RateLimitProperties.BucketSpec spec = resolveSpec(tier);
        String redisKey = RATE_LIMIT_KEY_PREFIX + tier.name().toLowerCase() + ":" + key;

        // Tier 1: Fast path — check local bucket (sub-microsecond, no network hop)
        LocalTokenBucket localBucket = localBuckets.computeIfAbsent(
                redisKey, k -> new LocalTokenBucket(spec.getCapacity(), spec.getRefillTokens(), spec.getRefillDuration()));
        if (!localBucket.tryConsume()) {
            log.debug("Rate limit hit (local fast-path) for key={}", key);
            return false;
        }

        // Tier 2: Slow path — check Redis for global cross-instance consistency
        try {
            long windowMs = spec.getRefillDuration() * 1000L;
            long now = System.currentTimeMillis();
            String requestId = now + "-" + Thread.currentThread().threadId() + "-" + (int) (Math.random() * 100000);

            Long remaining = redisTemplate.execute(
                    org.springframework.data.redis.core.script.RedisScript.of(SLIDING_WINDOW_SCRIPT, Long.class),
                    List.of(redisKey),
                    String.valueOf(spec.getCapacity()),
                    String.valueOf(windowMs),
                    String.valueOf(now),
                    requestId
            );

            if (remaining == null || remaining < 0) {
                log.debug("Rate limit hit (Redis) for key={}, tier={}", key, tier);
                return false;
            }

            return true;
        } catch (Exception e) {
            // Fail-open: Redis unavailable → allow request to prevent total API outage
            log.warn("Redis rate limit check failed, failing open: {}", e.getMessage());
            return true;
        }
    }

    /**
     * Get remaining tokens for a key (for X-RateLimit-Remaining header).
     */
    public long getRemainingTokens(String key, RateLimitTier tier) {
        RateLimitProperties.BucketSpec spec = resolveSpec(tier);
        String redisKey = RATE_LIMIT_KEY_PREFIX + tier.name().toLowerCase() + ":" + key;

        try {
            long windowMs = spec.getRefillDuration() * 1000L;
            long windowStart = System.currentTimeMillis() - windowMs;
            Long count = redisTemplate.opsForZSet().count(redisKey, windowStart, Double.MAX_VALUE);
            return Math.max(0, spec.getCapacity() - (count != null ? count : 0));
        } catch (Exception e) {
            return spec.getCapacity();
        }
    }

    private RateLimitProperties.BucketSpec resolveSpec(RateLimitTier tier) {
        return switch (tier) {
            case ADMIN -> properties.getAdmin();
            case ANONYMOUS -> properties.getAnonymous();
            default -> properties.getDefaultSpec();
        };
    }

    /**
     * Rate limit tiers mapping to user roles.
     */
    public enum RateLimitTier {
        DEFAULT,    // Authenticated users (ORGANIZER, COMPANY): 100 req/min
        ADMIN,      // Admin users: 500 req/min
        ANONYMOUS   // Unauthenticated: IP-based, 30 req/min
    }

    // ═══════════════════════════════════════════════════════
    // Self-contained Token Bucket (local fast-path, no deps)
    // ═══════════════════════════════════════════════════════

    /**
     * Lock-free token bucket implementation using greedy refill.
     * Used as a per-JVM fast-path to avoid unnecessary Redis round-trips.
     *
     * <p>Algorithm: tokens are refilled continuously based on elapsed time.
     * Uses atomic operations for thread safety without locks.</p>
     */
    static class LocalTokenBucket {
        private final long capacity;
        private final long refillTokens;
        private final long refillIntervalNanos;
        private final AtomicLong availableTokens;
        private final AtomicLong lastRefillTimestamp;

        LocalTokenBucket(int capacity, int refillTokens, int refillDurationSeconds) {
            this.capacity = capacity;
            this.refillTokens = refillTokens;
            this.refillIntervalNanos = refillDurationSeconds * 1_000_000_000L;
            this.availableTokens = new AtomicLong(capacity);
            this.lastRefillTimestamp = new AtomicLong(System.nanoTime());
        }

        boolean tryConsume() {
            refill();
            long current = availableTokens.get();
            if (current <= 0) {
                return false;
            }
            return availableTokens.decrementAndGet() >= 0;
        }

        private void refill() {
            long now = System.nanoTime();
            long lastRefill = lastRefillTimestamp.get();
            long elapsed = now - lastRefill;

            if (elapsed <= 0) return;

            long tokensToAdd = (elapsed * refillTokens) / refillIntervalNanos;
            if (tokensToAdd > 0 && lastRefillTimestamp.compareAndSet(lastRefill, now)) {
                long newTokens = Math.min(capacity, availableTokens.get() + tokensToAdd);
                availableTokens.set(newTokens);
            }
        }
    }
}
