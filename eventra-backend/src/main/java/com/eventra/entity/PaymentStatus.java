package com.eventra.entity;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Payment status state machine for the escrow-based marketplace model.
 *
 * <pre>
 * Lifecycle:
 *
 *   CREATED ──► AUTHORIZED ──► CAPTURED ──► IN_ESCROW ──► RELEASED ──► SETTLED
 *     │            │              │            │              │
 *     ▼            ▼              ▼            ▼              ▼
 *   FAILED      FAILED         FAILED    DISPUTE_OPEN    REFUND_REQUESTED
 *     │                                     │              │
 *     ▼                                     ▼              ▼
 *  CANCELLED                           DISPUTE_WON     PARTIALLY_REFUNDED
 *                                      DISPUTE_LOST         │
 *                                          │                ▼
 *                                      REFUNDED          REFUNDED
 * </pre>
 */
public enum PaymentStatus {

    // ── Creation & Authorization ─────────────────────────────────
    CREATED,
    AUTHORIZED,

    // ── Capture ──────────────────────────────────────────────────
    CAPTURED,

    // ── Escrow ───────────────────────────────────────────────────
    IN_ESCROW,

    // ── Settlement ───────────────────────────────────────────────
    RELEASED,
    SETTLED,

    // ── Dispute ──────────────────────────────────────────────────
    DISPUTE_OPEN,
    DISPUTE_WON,      // Organizer wins → funds stay released
    DISPUTE_LOST,     // Company wins → refund triggered

    // ── Refund ───────────────────────────────────────────────────
    REFUND_REQUESTED,
    PARTIALLY_REFUNDED,
    REFUNDED,

    // ── Terminal Failure ─────────────────────────────────────────
    FAILED,
    CANCELLED,
    EXPIRED;

    private static final Map<PaymentStatus, Set<PaymentStatus>> VALID_TRANSITIONS = Map.ofEntries(
            Map.entry(CREATED,              EnumSet.of(AUTHORIZED, FAILED, CANCELLED, EXPIRED)),
            Map.entry(AUTHORIZED,           EnumSet.of(CAPTURED, FAILED, CANCELLED)),
            Map.entry(CAPTURED,             EnumSet.of(IN_ESCROW, FAILED)),
            Map.entry(IN_ESCROW,            EnumSet.of(RELEASED, DISPUTE_OPEN, REFUND_REQUESTED)),
            Map.entry(RELEASED,             EnumSet.of(SETTLED, REFUND_REQUESTED)),
            Map.entry(SETTLED,              EnumSet.of(REFUND_REQUESTED)),
            Map.entry(DISPUTE_OPEN,         EnumSet.of(DISPUTE_WON, DISPUTE_LOST)),
            Map.entry(DISPUTE_WON,          EnumSet.of(RELEASED)),
            Map.entry(DISPUTE_LOST,         EnumSet.of(REFUND_REQUESTED, REFUNDED)),
            Map.entry(REFUND_REQUESTED,     EnumSet.of(PARTIALLY_REFUNDED, REFUNDED, FAILED)),
            Map.entry(PARTIALLY_REFUNDED,   EnumSet.of(REFUND_REQUESTED, REFUNDED)),
            Map.entry(REFUNDED,             EnumSet.noneOf(PaymentStatus.class)),
            Map.entry(FAILED,               EnumSet.noneOf(PaymentStatus.class)),
            Map.entry(CANCELLED,            EnumSet.noneOf(PaymentStatus.class)),
            Map.entry(EXPIRED,              EnumSet.noneOf(PaymentStatus.class))
    );

    /**
     * Check if transitioning from this status to target is valid.
     */
    public boolean canTransitionTo(PaymentStatus target) {
        Set<PaymentStatus> allowed = VALID_TRANSITIONS.get(this);
        return allowed != null && allowed.contains(target);
    }

    /**
     * Validate and return the target status, or throw if invalid.
     */
    public PaymentStatus validateTransition(PaymentStatus target) {
        if (!canTransitionTo(target)) {
            throw new IllegalStateException(
                    "Invalid payment status transition: %s → %s".formatted(this, target));
        }
        return target;
    }

    public boolean isTerminal() {
        return this == REFUNDED || this == FAILED || this == CANCELLED || this == EXPIRED;
    }

    public boolean isDisputed() {
        return this == DISPUTE_OPEN || this == DISPUTE_WON || this == DISPUTE_LOST;
    }

    public boolean isRefundable() {
        return this == IN_ESCROW || this == RELEASED || this == SETTLED || this == DISPUTE_LOST;
    }
}
