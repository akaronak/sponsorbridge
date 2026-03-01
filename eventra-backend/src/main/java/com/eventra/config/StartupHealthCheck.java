package com.eventra.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

/**
 * Runs at startup AFTER Spring context is fully initialized.
 * Validates that critical infrastructure (MongoDB, JWT config) is operational
 * before the application starts accepting traffic.
 *
 * If MongoDB is unreachable, the application will log a FATAL-level message
 * and terminate immediately — preventing a zombie process on Render that
 * passes health checks but fails on every request.
 */
@Component
@Order(1)
@Slf4j
public class StartupHealthCheck implements CommandLineRunner {

    private final MongoTemplate mongoTemplate;

    @Value("${spring.data.mongodb.uri:NOT_SET}")
    private String mongoUri;

    @Value("${jwt.secret:NOT_SET}")
    private String jwtSecret;

    @Value("${jwt.expiration:0}")
    private long jwtExpiration;

    @Value("${spring.profiles.active:default}")
    private String activeProfile;

    public StartupHealthCheck(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public void run(String... args) {
        log.info("═══════════════════════════════════════════════════════");
        log.info("  Eventra Startup Health Check");
        log.info("  Active profile: {}", activeProfile);
        log.info("═══════════════════════════════════════════════════════");

        // ── 1. MongoDB Connection ───────────────────────
        try {
            mongoTemplate.getDb().runCommand(new org.bson.Document("ping", 1));
            String dbName = mongoTemplate.getDb().getName();
            log.info("✓ MongoDB: CONNECTED (database={})", dbName);

            String safeUri = mongoUri.length() > 25
                    ? mongoUri.substring(0, 25) + "***"
                    : "(short URI)";
            log.info("  URI prefix: {}", safeUri);
        } catch (Exception e) {
            log.error("╔══════════════════════════════════════════════════╗");
            log.error("║  FATAL: MongoDB connection FAILED at startup    ║");
            log.error("║  The application cannot serve requests.         ║");
            log.error("╚══════════════════════════════════════════════════╝");
            log.error("Exception: {} — {}", e.getClass().getName(), e.getMessage());
            log.error("MONGODB_URI set? {}", !mongoUri.equals("NOT_SET") && !mongoUri.isBlank());

            // Exit with non-zero code so Render marks the deploy as failed
            // and does NOT route traffic to this instance.
            System.exit(1);
        }

        // ── 2. JWT Configuration ────────────────────────
        if ("NOT_SET".equals(jwtSecret) || jwtSecret.isBlank()) {
            log.error("╔══════════════════════════════════════════════════╗");
            log.error("║  FATAL: JWT_SECRET is not set                   ║");
            log.error("║  Token generation will fail on every request.   ║");
            log.error("╚══════════════════════════════════════════════════╝");
            System.exit(1);
        }

        boolean isDefaultSecret = jwtSecret.contains("dev-only");
        if ("prod".equals(activeProfile) && isDefaultSecret) {
            log.error("╔══════════════════════════════════════════════════╗");
            log.error("║  FATAL: Using default JWT_SECRET in prod!       ║");
            log.error("║  Set a strong JWT_SECRET env var on Render.     ║");
            log.error("╚══════════════════════════════════════════════════╝");
            System.exit(1);
        }

        log.info("✓ JWT: secret={} chars, expiration={}ms, default={}",
                jwtSecret.length(), jwtExpiration, isDefaultSecret);

        // ── 3. Summary ──────────────────────────────────
        log.info("═══════════════════════════════════════════════════════");
        log.info("  Startup checks PASSED — ready to accept traffic");
        log.info("═══════════════════════════════════════════════════════");
    }
}
