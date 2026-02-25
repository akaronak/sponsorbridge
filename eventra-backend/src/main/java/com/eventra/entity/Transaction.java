package com.eventra.entity;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Immutable financial transaction record — append-only audit trail.
 *
 * <p>Every financial movement (capture, commission deduction, escrow hold,
 * release, refund) creates a Transaction entry. These are <b>never</b>
 * updated or deleted — they form the compliance audit trail.</p>
 *
 * <h3>Schema decisions:</h3>
 * <ul>
 *   <li>Separate collection from Payment — different access pattern (append-only vs. mutable)</li>
 *   <li>No @Version — immutable documents don't need concurrency control</li>
 *   <li>Indexed for aggregation pipelines (revenue analytics, GMV calculation)</li>
 * </ul>
 */
@Document(collection = "transactions")
@CompoundIndexes({
    @CompoundIndex(name = "idx_txn_payment_type", def = "{'paymentId': 1, 'type': 1}"),
    @CompoundIndex(name = "idx_txn_type_created", def = "{'type': 1, 'createdAt': -1}"),
    @CompoundIndex(name = "idx_txn_company_created", def = "{'companyId': 1, 'createdAt': -1}"),
    @CompoundIndex(name = "idx_txn_organizer_created", def = "{'organizerId': 1, 'createdAt': -1}")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    private String id;

    @Indexed
    @NotNull
    private String paymentId;

    @Indexed
    private String companyId;

    @Indexed
    private String organizerId;

    private String requestId;

    @Indexed
    @NotNull
    private TransactionType type;

    /** Amount of this specific movement (always positive, direction determined by type) */
    @NotNull
    private BigDecimal amount;

    @Builder.Default
    private String currency = "INR";

    /** Balance snapshot for audit — platform's running escrow balance after this txn */
    private BigDecimal escrowBalanceAfter;

    /** Human-readable description for reports */
    private String description;

    /** Reference to external system (Razorpay payment/refund ID, etc.) */
    private String externalReference;

    /** Arbitrary metadata for reconciliation */
    private Map<String, String> metadata;

    @CreatedDate
    private LocalDateTime createdAt;

    // ─── Transaction types ──────────────────────────

    public enum TransactionType {
        /** Company pays → funds captured by Razorpay */
        CAPTURE,

        /** Captured funds move to platform escrow */
        ESCROW_HOLD,

        /** Platform commission deducted from escrow */
        COMMISSION_DEDUCTION,

        /** Organizer payout released from escrow */
        ESCROW_RELEASE,

        /** Settlement to organizer's bank account */
        SETTLEMENT,

        /** Full refund to company */
        REFUND,

        /** Partial refund to company */
        PARTIAL_REFUND,

        /** Commission reversed due to refund */
        COMMISSION_REVERSAL,

        /** Dispute-triggered adjustment */
        DISPUTE_ADJUSTMENT
    }
}
