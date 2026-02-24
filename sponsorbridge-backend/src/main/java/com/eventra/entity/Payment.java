package com.eventra.entity;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Core payment entity for escrow-based marketplace transactions.
 *
 * <h3>Financial lifecycle:</h3>
 * <pre>
 * CREATED → AUTHORIZED → CAPTURED → IN_ESCROW → RELEASED → SETTLED
 *                                       │             │
 *                                  DISPUTE_OPEN   REFUND_REQUESTED
 * </pre>
 *
 * <h3>Schema decisions:</h3>
 * <ul>
 *   <li><b>Referenced</b> from SponsorshipRequest — separate lifecycle, full audit trail</li>
 *   <li><b>Embedded</b>: statusHistory — bounded array (~20 max), always read with payment</li>
 *   <li><b>Embedded</b>: escrowDetails — single sub-document, 1:1 with payment</li>
 *   <li>Write concern: MAJORITY (MongoConfig) for financial consistency</li>
 *   <li>Optimistic concurrency via @Version field — prevents double-release/refund</li>
 * </ul>
 *
 * <h3>Indexing strategy:</h3>
 * <ul>
 *   <li>{requestId, status} — filter payments per request</li>
 *   <li>{companyId, createdAt} — company payment history</li>
 *   <li>{organizerId, createdAt} — organizer payment history</li>
 *   <li>{status, escrowDetails.releaseEligibleAt} — scheduled auto-release scan</li>
 *   <li>idempotencyKey (unique, sparse) — prevent duplicate payments</li>
 *   <li>razorpayOrderId (unique, sparse) — gateway reconciliation</li>
 *   <li>razorpayPaymentId (unique, sparse) — capture reconciliation</li>
 * </ul>
 */
@Document(collection = "payments")
@CompoundIndexes({
    @CompoundIndex(name = "idx_payment_request_status", def = "{'requestId': 1, 'status': 1}"),
    @CompoundIndex(name = "idx_payment_company_created", def = "{'companyId': 1, 'createdAt': -1}"),
    @CompoundIndex(name = "idx_payment_organizer_created", def = "{'organizerId': 1, 'createdAt': -1}"),
    @CompoundIndex(name = "idx_payment_escrow_release", def = "{'status': 1, 'escrowDetails.releaseEligibleAt': 1}"),
    @CompoundIndex(name = "idx_payment_status_created", def = "{'status': 1, 'createdAt': -1}")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    private String id;

    /** Optimistic locking — prevents concurrent double-release/refund */
    @Version
    private Long version;

    // ─── Idempotency ────────────────────────────────

    /** Client-generated idempotency key (UUID v4). Prevents duplicate order creation. */
    @Indexed(unique = true, sparse = true)
    private String idempotencyKey;

    // ─── Participant references ─────────────────────

    @Indexed
    @NotNull
    private String requestId;

    @Indexed
    @NotNull
    private String companyId;

    @Indexed
    @NotNull
    private String organizerId;

    // ─── Financial amounts ──────────────────────────

    /** Total amount paid by the company (in smallest currency unit: paise for INR) */
    @NotNull
    @Positive
    private BigDecimal amount;

    /** Platform commission amount (calculated at capture time) */
    @Builder.Default
    private BigDecimal platformCommission = BigDecimal.ZERO;

    /** Amount to be released to organizer (amount - commission) */
    @Builder.Default
    private BigDecimal organizerPayout = BigDecimal.ZERO;

    /** Total refunded amount (for partial refund tracking) */
    @Builder.Default
    private BigDecimal refundedAmount = BigDecimal.ZERO;

    /** Commission rate applied (e.g., 0.10 for 10%) */
    private BigDecimal commissionRate;

    @Builder.Default
    private String currency = "INR";

    // ─── Status ─────────────────────────────────────

    @Indexed
    @Builder.Default
    private PaymentStatus status = PaymentStatus.CREATED;

    // ─── Razorpay gateway fields ────────────────────

    /** Razorpay Order ID — created server-side, never from client */
    @Indexed(unique = true, sparse = true)
    private String razorpayOrderId;

    /** Razorpay Payment ID — received via webhook after capture */
    @Indexed(unique = true, sparse = true)
    private String razorpayPaymentId;

    /** Razorpay signature — for webhook verification */
    private String razorpaySignature;

    /** Razorpay refund IDs (supports partial refunds) */
    @Builder.Default
    private List<String> razorpayRefundIds = new ArrayList<>();

    // ─── Escrow details (embedded sub-document) ─────

    @Builder.Default
    private EscrowDetails escrowDetails = new EscrowDetails();

    // ─── Audit trail (embedded array) ───────────────

    @Builder.Default
    private List<StatusChange> statusHistory = new ArrayList<>();

    // ─── Metadata ───────────────────────────────────

    private String description;

    /** Flexible key-value for gateway data, receipt URLs, etc. */
    @Builder.Default
    private Map<String, String> metadata = new HashMap<>();

    private String paymentMethod;

    // ─── Timestamps ─────────────────────────────────

    private LocalDateTime authorizedAt;
    private LocalDateTime capturedAt;
    private LocalDateTime escrowStartedAt;
    private LocalDateTime releasedAt;
    private LocalDateTime settledAt;
    private LocalDateTime failedAt;
    private String failureReason;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // ═══════════════════════════════════════════════════
    //  Embedded value objects
    // ═══════════════════════════════════════════════════

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EscrowDetails {
        /** When escrow hold started */
        private LocalDateTime escrowStartedAt;

        /** When auto-release becomes eligible (escrowStartedAt + holdDays) */
        private LocalDateTime releaseEligibleAt;

        /** Days to hold before auto-release (configurable, default 7) */
        @Builder.Default
        private Integer holdDays = 7;

        /** Whether auto-release has been attempted */
        @Builder.Default
        private Boolean autoReleaseAttempted = false;

        /** ID of the settlement batch (for reconciliation) */
        private String settlementBatchId;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StatusChange {
        private PaymentStatus fromStatus;
        private PaymentStatus toStatus;
        private String reason;
        private LocalDateTime changedAt;
        private String changedBy;
        /** Actor type: SYSTEM, USER, WEBHOOK, SCHEDULER */
        private String actorType;
    }

    // ═══════════════════════════════════════════════════
    //  Domain methods
    // ═══════════════════════════════════════════════════

    /**
     * Transition payment to a new status with full validation and audit.
     *
     * @throws IllegalStateException if the transition is invalid
     */
    public void transitionTo(PaymentStatus newStatus, String reason, String changedBy, String actorType) {
        this.status.validateTransition(newStatus);

        StatusChange change = StatusChange.builder()
                .fromStatus(this.status)
                .toStatus(newStatus)
                .reason(reason)
                .changedAt(LocalDateTime.now())
                .changedBy(changedBy)
                .actorType(actorType)
                .build();
        this.statusHistory.add(change);
        this.status = newStatus;

        // Set lifecycle timestamps
        switch (newStatus) {
            case AUTHORIZED -> this.authorizedAt = LocalDateTime.now();
            case CAPTURED -> this.capturedAt = LocalDateTime.now();
            case IN_ESCROW -> {
                this.escrowStartedAt = LocalDateTime.now();
                if (this.escrowDetails == null) {
                    this.escrowDetails = new EscrowDetails();
                }
                this.escrowDetails.setEscrowStartedAt(LocalDateTime.now());
                this.escrowDetails.setReleaseEligibleAt(
                        LocalDateTime.now().plusDays(this.escrowDetails.getHoldDays()));
            }
            case RELEASED -> this.releasedAt = LocalDateTime.now();
            case SETTLED -> this.settledAt = LocalDateTime.now();
            case FAILED -> {
                this.failedAt = LocalDateTime.now();
                this.failureReason = reason;
            }
            default -> { /* no-op */ }
        }
    }

    /**
     * Calculate and set commission amounts.
     *
     * @param commissionPercent e.g., 10.0 for 10%
     */
    public void calculateCommission(BigDecimal commissionPercent) {
        this.commissionRate = commissionPercent.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        this.platformCommission = this.amount.multiply(this.commissionRate).setScale(2, RoundingMode.HALF_UP);

        // Enforce minimum commission
        BigDecimal minCommission = new BigDecimal("1.00");
        if (this.platformCommission.compareTo(minCommission) < 0) {
            this.platformCommission = minCommission;
        }

        this.organizerPayout = this.amount.subtract(this.platformCommission).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Record a partial or full refund amount.
     *
     * @return remaining refundable amount
     */
    public BigDecimal addRefundAmount(BigDecimal refundAmount) {
        this.refundedAmount = this.refundedAmount.add(refundAmount);
        return getRefundableAmount();
    }

    /**
     * Get the maximum amount that can still be refunded.
     */
    public BigDecimal getRefundableAmount() {
        return this.amount.subtract(this.refundedAmount);
    }

    /**
     * Whether this payment is fully refunded.
     */
    public boolean isFullyRefunded() {
        return this.refundedAmount.compareTo(this.amount) >= 0;
    }

    /**
     * Whether this payment is eligible for auto-release from escrow.
     */
    public boolean isEligibleForAutoRelease() {
        return this.status == PaymentStatus.IN_ESCROW
                && this.escrowDetails != null
                && this.escrowDetails.getReleaseEligibleAt() != null
                && LocalDateTime.now().isAfter(this.escrowDetails.getReleaseEligibleAt())
                && !Boolean.TRUE.equals(this.escrowDetails.getAutoReleaseAttempted());
    }
}

