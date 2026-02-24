package com.eventra.infrastructure;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Redis-based idempotency guard for financial operations.
 *
 * <p>Stores idempotency keys in Redis with TTL. Prevents:
 * <ul>
 *   <li>Duplicate order creation (same idempotencyKey)</li>
 *   <li>Duplicate webhook processing (razorpayPaymentId)</li>
 *   <li>Duplicate refund initiation</li>
 * </ul>
 *
 * <h3>Failure scenario:</h3>
 * <p>If Redis is down, throws exception → fails closed (safe for financial ops).
 * Unlike rate limiting which fails open, idempotency must fail closed.</p>
 *
 * <h3>TTL strategy:</h3>
 * <ul>
 *   <li>Order creation: 48h (covers payment window)</li>
 *   <li>Webhook processing: 7d (covers settlement period)</li>
 *   <li>Distributed locks: 300s max (auto-expire as safety net)</li>
 * </ul>
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class IdempotencyService {

    private final StringRedisTemplate redisTemplate;

    private static final String IDEMPOTENCY_PREFIX = "eventra:idempotency:";
    private static final String WEBHOOK_PREFIX = "eventra:webhook:";
    private static final String LOCK_PREFIX = "eventra:lock:";

    /**
     * Check and set an idempotency key. Returns true if this is a NEW operation.
     *
     * @param key   unique operation key
     * @param value value to store (e.g., paymentId)
     * @param ttl   how long to remember this key
     * @return true if key was set (new operation), false if already exists (duplicate)
     */
    public boolean checkAndSet(String key, String value, Duration ttl) {
        String redisKey = IDEMPOTENCY_PREFIX + key;
        Boolean result = redisTemplate.opsForValue().setIfAbsent(redisKey, value, ttl);
        if (Boolean.TRUE.equals(result)) {
            log.debug("Idempotency key set: {}", key);
            return true;
        }
        log.warn("Duplicate operation detected: key={}", key);
        return false;
    }

    /**
     * Get the value stored for an idempotency key.
     */
    public String getExistingValue(String key) {
        return redisTemplate.opsForValue().get(IDEMPOTENCY_PREFIX + key);
    }

    /**
     * Check if a webhook event has already been processed.
     *
     * @param eventId unique event identifier (e.g., razorpay payment ID)
     * @return true if this event is new (not yet processed)
     */
    public boolean markWebhookProcessed(String eventId) {
        String redisKey = WEBHOOK_PREFIX + eventId;
        Boolean result = redisTemplate.opsForValue()
                .setIfAbsent(redisKey, String.valueOf(System.currentTimeMillis()), Duration.ofDays(7));
        return Boolean.TRUE.equals(result);
    }

    /**
     * Acquire a distributed lock.
     *
     * @param lockKey  lock identifier
     * @param owner    who is holding the lock (hostname + threadId)
     * @param ttl      auto-expire to prevent deadlocks
     * @return true if lock acquired
     */
    public boolean acquireLock(String lockKey, String owner, Duration ttl) {
        String redisKey = LOCK_PREFIX + lockKey;
        Boolean acquired = redisTemplate.opsForValue().setIfAbsent(redisKey, owner, ttl);
        if (Boolean.TRUE.equals(acquired)) {
            log.debug("Lock acquired: key={}, owner={}", lockKey, owner);
            return true;
        }
        log.debug("Lock already held: key={}", lockKey);
        return false;
    }

    /**
     * Release a distributed lock (only if we own it).
     */
    public boolean releaseLock(String lockKey, String owner) {
        String redisKey = LOCK_PREFIX + lockKey;
        String currentOwner = redisTemplate.opsForValue().get(redisKey);
        if (owner.equals(currentOwner)) {
            redisTemplate.delete(redisKey);
            log.debug("Lock released: key={}, owner={}", lockKey, owner);
            return true;
        }
        log.warn("Lock release failed — not owner: key={}, expectedOwner={}, actualOwner={}",
                lockKey, owner, currentOwner);
        return false;
    }
}
