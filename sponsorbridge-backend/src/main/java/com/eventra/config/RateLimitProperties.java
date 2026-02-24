package com.eventra.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Externalized rate limiting configuration.
 * Maps to rate-limit.* properties in application.properties.
 *
 * <h3>Tiers:</h3>
 * <ul>
 *   <li><b>default</b> — Authenticated users (ORGANIZER, COMPANY): 100 req/min</li>
 *   <li><b>admin</b> — Admin users: 500 req/min</li>
 *   <li><b>anonymous</b> — Unauthenticated IP-based: 30 req/min</li>
 * </ul>
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "rate-limit")
public class RateLimitProperties {

    private BucketSpec defaultSpec = new BucketSpec(100, 100, 60);
    private BucketSpec admin = new BucketSpec(500, 500, 60);
    private BucketSpec anonymous = new BucketSpec(30, 30, 60);

    @Data
    public static class BucketSpec {
        /** Maximum tokens (burst capacity) */
        private int capacity;
        /** Tokens added per refill interval */
        private int refillTokens;
        /** Refill interval in seconds */
        private int refillDuration;

        public BucketSpec() {}

        public BucketSpec(int capacity, int refillTokens, int refillDuration) {
            this.capacity = capacity;
            this.refillTokens = refillTokens;
            this.refillDuration = refillDuration;
        }
    }
}
