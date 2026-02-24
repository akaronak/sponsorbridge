package com.eventra.config;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.CompoundIndexDefinition;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.data.mongodb.core.index.TextIndexDefinition;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Sort;

/**
 * Programmatic index creation for MongoDB.
 *
 * <h3>When to use programmatic vs annotation indexes:</h3>
 * <ul>
 *   <li><b>Annotation (@Indexed, @CompoundIndex)</b>: Simple indexes on entity fields.
 *       Auto-created when {@code spring.data.mongodb.auto-index-creation=true}</li>
 *   <li><b>Programmatic (this class)</b>: Text indexes, partial indexes, TTL indexes,
 *       and any index that can't be expressed with annotations</li>
 * </ul>
 *
 * <h3>Index strategy for high-read endpoints:</h3>
 * <pre>
 * GET /api/companies/search       → companies: {verified, industry, location}
 * GET /api/companies/{id}         → companies: {_id} (default)
 * GET /api/requests/organizer/x   → sponsorship_requests: {organizerId, createdAt}
 * GET /api/requests/company/x     → sponsorship_requests: {companyId, createdAt}
 * GET /api/conversations          → conversations: {companyId/organizerId, lastMessageAt}
 * GET /api/notifications          → notifications: {userId, createdAt}
 * GET /api/notifications/unread   → notifications: {userId, isRead}
 * </pre>
 *
 * <p>Only active in non-prod profiles. In production, indexes should be created
 * by a migration script or during deployment via {@code mongosh}.</p>
 */
@Configuration
@Profile("!prod")
@RequiredArgsConstructor
@Slf4j
public class MongoIndexConfig {

    private final MongoTemplate mongoTemplate;

    @PostConstruct
    public void createIndexes() {
        log.info("Creating MongoDB indexes...");

        // ─── Companies ──────────────────────────────────
        // Full-text search on company name + industry (for search endpoint)
        mongoTemplate.indexOps("companies").ensureIndex(
                TextIndexDefinition.builder()
                        .onField("companyName", 10F)
                        .onField("industry", 5F)
                        .onField("location", 3F)
                        .build()
        );

        // Compound index for filtered search queries
        mongoTemplate.indexOps("companies").ensureIndex(
                new CompoundIndexDefinition(
                        new Document()
                                .append("verified", 1)
                                .append("industry", 1)
                                .append("location", 1)
                ).named("idx_company_search")
        );

        mongoTemplate.indexOps("companies").ensureIndex(
                new CompoundIndexDefinition(
                        new Document()
                                .append("verified", 1)
                                .append("budgetMin", 1)
                                .append("budgetMax", 1)
                ).named("idx_company_budget_range")
        );

        // ─── Sponsorship Requests ──────────────────────
        // Status-based queries (admin dashboard, filtering)
        mongoTemplate.indexOps("sponsorship_requests").ensureIndex(
                new CompoundIndexDefinition(
                        new Document()
                                .append("status", 1)
                                .append("createdAt", -1)
                ).named("idx_req_status_created")
        );

        // ─── Messages ──────────────────────────────────
        // Pagination for message history
        mongoTemplate.indexOps("messages").ensureIndex(
                new CompoundIndexDefinition(
                        new Document()
                                .append("requestId", 1)
                                .append("createdAt", 1)
                ).named("idx_msg_request_created")
        );

        // ─── Notifications ─────────────────────────────
        // TTL index: auto-delete notifications older than 90 days
        mongoTemplate.indexOps("notifications").ensureIndex(
                new Index()
                        .on("createdAt", Sort.Direction.ASC)
                        .expire(90 * 24 * 60 * 60)  // 90 days in seconds
                        .named("idx_notif_ttl")
        );

        // ─── Payments ──────────────────────────────────
        // Status-based queries for batch processing
        mongoTemplate.indexOps("payments").ensureIndex(
                new CompoundIndexDefinition(
                        new Document()
                                .append("status", 1)
                                .append("createdAt", -1)
                ).named("idx_payment_status_created")
        );

        // ─── Transactions ──────────────────────────────
        // Payment audit trail
        mongoTemplate.indexOps("transactions").ensureIndex(
                new CompoundIndexDefinition(
                        new Document()
                                .append("paymentId", 1)
                                .append("type", 1)
                ).named("idx_txn_payment_type")
        );

        mongoTemplate.indexOps("transactions").ensureIndex(
                new CompoundIndexDefinition(
                        new Document()
                                .append("type", 1)
                                .append("createdAt", -1)
                ).named("idx_txn_type_created")
        );

        mongoTemplate.indexOps("transactions").ensureIndex(
                new CompoundIndexDefinition(
                        new Document()
                                .append("companyId", 1)
                                .append("createdAt", -1)
                ).named("idx_txn_company_created")
        );

        mongoTemplate.indexOps("transactions").ensureIndex(
                new CompoundIndexDefinition(
                        new Document()
                                .append("organizerId", 1)
                                .append("createdAt", -1)
                ).named("idx_txn_organizer_created")
        );

        // ─── Disputes ──────────────────────────────────
        mongoTemplate.indexOps("disputes").ensureIndex(
                new CompoundIndexDefinition(
                        new Document()
                                .append("status", 1)
                                .append("createdAt", -1)
                ).named("idx_dispute_status_created")
        );

        mongoTemplate.indexOps("disputes").ensureIndex(
                new CompoundIndexDefinition(
                        new Document()
                                .append("status", 1)
                                .append("autoResolveAt", 1)
                ).named("idx_dispute_auto_resolve")
        );

        log.info("MongoDB indexes created successfully");
    }
}
