package com.eventra.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Temporary diagnostic endpoint for production incident triage.
 * Exposes runtime health of MongoDB, Redis, and critical env vars
 * WITHOUT leaking secrets.
 *
 * ⚠️  Remove or secure behind ADMIN role after the incident is resolved.
 */
@RestController
@RequestMapping("/api/diagnostic")
@Slf4j
public class DiagnosticController {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired(required = false)
    private RedisConnectionFactory redisConnectionFactory;

    @Value("${spring.data.mongodb.uri:NOT_SET}")
    private String mongoUri;

    @Value("${jwt.secret:NOT_SET}")
    private String jwtSecret;

    @Value("${jwt.expiration:NOT_SET}")
    private String jwtExpiration;

    @Value("${spring.data.redis.host:NOT_SET}")
    private String redisHost;

    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("timestamp", LocalDateTime.now().toString());
        report.put("profile", activeProfile);

        // ── MongoDB ─────────────────────────────────────
        try {
            mongoTemplate.getDb().runCommand(new org.bson.Document("ping", 1));
            report.put("mongodb", "CONNECTED");
            report.put("mongodb_db", mongoTemplate.getDb().getName());
        } catch (Exception e) {
            log.error("MongoDB diagnostic failed", e);
            report.put("mongodb", "FAILED: " + e.getClass().getSimpleName() + " — " + e.getMessage());
        }

        // ── Environment Variables (safe: no secret values) ──
        report.put("MONGODB_URI_set", !mongoUri.equals("NOT_SET") && !mongoUri.isBlank());
        report.put("MONGODB_URI_prefix", mongoUri.length() > 20
                ? mongoUri.substring(0, 20) + "***" : "(short/missing)");
        report.put("JWT_SECRET_set", !jwtSecret.equals("NOT_SET") && !jwtSecret.isBlank());
        report.put("JWT_SECRET_length", jwtSecret.length());
        report.put("JWT_EXPIRATION", jwtExpiration);
        report.put("REDIS_HOST", redisHost);

        // ── Redis ───────────────────────────────────────
        if (redisConnectionFactory != null) {
            try {
                redisConnectionFactory.getConnection().ping();
                report.put("redis", "CONNECTED");
            } catch (Exception e) {
                report.put("redis", "FAILED: " + e.getClass().getSimpleName() + " — " + e.getMessage());
            }
        } else {
            report.put("redis", "NOT_CONFIGURED (no RedisConnectionFactory bean)");
        }

        log.info("Diagnostic report: {}", report);
        return ResponseEntity.ok(report);
    }
}
