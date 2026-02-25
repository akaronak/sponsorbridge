package com.eventra.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.RedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Redis-backed cache configuration with per-cache TTL strategy.
 *
 * <h3>Cache names and their TTLs:</h3>
 * <table>
 *   <tr><td>sponsors</td><td>10 min</td><td>Company/sponsor listings (high read, low write)</td></tr>
 *   <tr><td>sponsor-detail</td><td>5 min</td><td>Individual sponsor profile</td></tr>
 *   <tr><td>match-results</td><td>15 min</td><td>AI match/recommendation results</td></tr>
 *   <tr><td>organizer-detail</td><td>5 min</td><td>Individual organizer profile</td></tr>
 *   <tr><td>platform-stats</td><td>30 min</td><td>Dashboard aggregate stats</td></tr>
 *   <tr><td>user-sessions</td><td>24 hr</td><td>Optional session cache for JWT validation</td></tr>
 * </table>
 *
 * <h3>Eviction strategy:</h3>
 * <p>Cache entries are evicted on write operations via {@code @CacheEvict} in service layer.
 * TTL provides a safety net for stale data. No explicit cache warming needed;
 * entries are created lazily on first read (@Cacheable).</p>
 */
@Configuration
@EnableCaching
public class CacheConfig {

    /**
     * Custom CacheManager with per-cache TTL configuration.
     * Falls back to a default TTL of 10 minutes for unnamed caches.
     */
    @Bean
    public CacheManager cacheManager(
            RedisConnectionFactory connectionFactory,
            RedisSerializer<Object> redisJsonSerializer) {

        // Default configuration: 10 min TTL, no null values
        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(10))
                .disableCachingNullValues()
                .prefixCacheNameWith("eventra:")
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(redisJsonSerializer));

        // Per-cache TTL overrides
        Map<String, RedisCacheConfiguration> cacheConfigs = new HashMap<>();
        cacheConfigs.put("sponsors", defaultConfig.entryTtl(Duration.ofMinutes(10)));
        cacheConfigs.put("sponsor-detail", defaultConfig.entryTtl(Duration.ofMinutes(5)));
        cacheConfigs.put("match-results", defaultConfig.entryTtl(Duration.ofMinutes(15)));
        cacheConfigs.put("organizer-detail", defaultConfig.entryTtl(Duration.ofMinutes(5)));
        cacheConfigs.put("platform-stats", defaultConfig.entryTtl(Duration.ofMinutes(30)));
        cacheConfigs.put("user-sessions", defaultConfig.entryTtl(Duration.ofHours(24)));
        cacheConfigs.put("notifications-count", defaultConfig.entryTtl(Duration.ofSeconds(30)));
        cacheConfigs.put("revenue-stats", defaultConfig.entryTtl(Duration.ofMinutes(5)));
        cacheConfigs.put("payment-detail", defaultConfig.entryTtl(Duration.ofMinutes(2)));

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(cacheConfigs)
                .transactionAware()
                .build();
    }
}
