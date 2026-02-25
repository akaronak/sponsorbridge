package com.eventra.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for the PaymentStatus finite state machine.
 */
@DisplayName("PaymentStatus FSM")
class PaymentStatusTest {

    // ═══════════════════════════════════════════════════
    //  Happy path transitions
    // ═══════════════════════════════════════════════════

    @Test
    @DisplayName("Full lifecycle: CREATED → AUTHORIZED → CAPTURED → IN_ESCROW → RELEASED → SETTLED")
    void fullLifecycle() {
        assertTrue(PaymentStatus.CREATED.canTransitionTo(PaymentStatus.AUTHORIZED));
        assertTrue(PaymentStatus.AUTHORIZED.canTransitionTo(PaymentStatus.CAPTURED));
        assertTrue(PaymentStatus.CAPTURED.canTransitionTo(PaymentStatus.IN_ESCROW));
        assertTrue(PaymentStatus.IN_ESCROW.canTransitionTo(PaymentStatus.RELEASED));
        assertTrue(PaymentStatus.RELEASED.canTransitionTo(PaymentStatus.SETTLED));
    }

    @Test
    @DisplayName("Dispute path: IN_ESCROW → DISPUTE_OPEN → DISPUTE_WON → RELEASED")
    void disputeOrganizerWins() {
        assertTrue(PaymentStatus.IN_ESCROW.canTransitionTo(PaymentStatus.DISPUTE_OPEN));
        assertTrue(PaymentStatus.DISPUTE_OPEN.canTransitionTo(PaymentStatus.DISPUTE_WON));
        assertTrue(PaymentStatus.DISPUTE_WON.canTransitionTo(PaymentStatus.RELEASED));
    }

    @Test
    @DisplayName("Dispute path: IN_ESCROW → DISPUTE_OPEN → DISPUTE_LOST → REFUND_REQUESTED → REFUNDED")
    void disputeCompanyWins() {
        assertTrue(PaymentStatus.IN_ESCROW.canTransitionTo(PaymentStatus.DISPUTE_OPEN));
        assertTrue(PaymentStatus.DISPUTE_OPEN.canTransitionTo(PaymentStatus.DISPUTE_LOST));
        assertTrue(PaymentStatus.DISPUTE_LOST.canTransitionTo(PaymentStatus.REFUND_REQUESTED));
        assertTrue(PaymentStatus.REFUND_REQUESTED.canTransitionTo(PaymentStatus.REFUNDED));
    }

    @Test
    @DisplayName("DISPUTE_LOST can also transition directly to REFUNDED")
    void disputeLostDirectRefund() {
        assertTrue(PaymentStatus.DISPUTE_LOST.canTransitionTo(PaymentStatus.REFUNDED));
    }

    @Test
    @DisplayName("Refund path: IN_ESCROW → REFUND_REQUESTED → PARTIALLY_REFUNDED → REFUNDED")
    void refundPath() {
        assertTrue(PaymentStatus.IN_ESCROW.canTransitionTo(PaymentStatus.REFUND_REQUESTED));
        assertTrue(PaymentStatus.REFUND_REQUESTED.canTransitionTo(PaymentStatus.PARTIALLY_REFUNDED));
        assertTrue(PaymentStatus.PARTIALLY_REFUNDED.canTransitionTo(PaymentStatus.REFUNDED));
    }

    @Test
    @DisplayName("Partial refund can request more refunds")
    void partialRefundReEntry() {
        assertTrue(PaymentStatus.PARTIALLY_REFUNDED.canTransitionTo(PaymentStatus.REFUND_REQUESTED));
    }

    // ═══════════════════════════════════════════════════
    //  Invalid transitions
    // ═══════════════════════════════════════════════════

    @Test
    @DisplayName("Cannot go backwards: AUTHORIZED → CREATED")
    void noBackwards() {
        assertFalse(PaymentStatus.AUTHORIZED.canTransitionTo(PaymentStatus.CREATED));
    }

    @Test
    @DisplayName("Cannot skip states: CREATED → CAPTURED")
    void noSkip() {
        assertFalse(PaymentStatus.CREATED.canTransitionTo(PaymentStatus.CAPTURED));
    }

    @ParameterizedTest
    @EnumSource(value = PaymentStatus.class, names = {"REFUNDED", "FAILED", "CANCELLED", "EXPIRED"})
    @DisplayName("Terminal states have no outgoing transitions")
    void terminalStates(PaymentStatus terminal) {
        for (PaymentStatus target : PaymentStatus.values()) {
            assertFalse(terminal.canTransitionTo(target),
                    terminal + " should not transition to " + target);
        }
    }

    // ═══════════════════════════════════════════════════
    //  State machine properties
    // ═══════════════════════════════════════════════════

    @Test
    @DisplayName("Terminal states are correctly identified")
    void isTerminal() {
        assertTrue(PaymentStatus.REFUNDED.isTerminal());
        assertTrue(PaymentStatus.FAILED.isTerminal());
        assertTrue(PaymentStatus.CANCELLED.isTerminal());
        assertTrue(PaymentStatus.EXPIRED.isTerminal());

        assertFalse(PaymentStatus.CREATED.isTerminal());
        assertFalse(PaymentStatus.IN_ESCROW.isTerminal());
    }

    @Test
    @DisplayName("Disputed states are correctly identified")
    void isDisputed() {
        assertTrue(PaymentStatus.DISPUTE_OPEN.isDisputed());
        assertTrue(PaymentStatus.DISPUTE_WON.isDisputed());
        assertTrue(PaymentStatus.DISPUTE_LOST.isDisputed());

        assertFalse(PaymentStatus.IN_ESCROW.isDisputed());
    }

    @Test
    @DisplayName("Refundable states include IN_ESCROW, RELEASED, SETTLED, DISPUTE_LOST")
    void isRefundable() {
        assertTrue(PaymentStatus.IN_ESCROW.isRefundable());
        assertTrue(PaymentStatus.RELEASED.isRefundable());
        assertTrue(PaymentStatus.SETTLED.isRefundable());
        assertTrue(PaymentStatus.DISPUTE_LOST.isRefundable());

        assertFalse(PaymentStatus.CREATED.isRefundable());
        assertFalse(PaymentStatus.AUTHORIZED.isRefundable());
        assertFalse(PaymentStatus.FAILED.isRefundable());
    }

    @Test
    @DisplayName("validateTransition throws on invalid transition")
    void validateTransitionThrows() {
        assertThrows(IllegalStateException.class,
                () -> PaymentStatus.CREATED.validateTransition(PaymentStatus.SETTLED));
    }

    @Test
    @DisplayName("validateTransition returns target on valid transition")
    void validateTransitionReturns() {
        assertEquals(PaymentStatus.AUTHORIZED,
                PaymentStatus.CREATED.validateTransition(PaymentStatus.AUTHORIZED));
    }

    // ═══════════════════════════════════════════════════
    //  Failure transitions
    // ═══════════════════════════════════════════════════

    @Test
    @DisplayName("CREATED, AUTHORIZED, CAPTURED can all fail")
    void failureTransitions() {
        assertTrue(PaymentStatus.CREATED.canTransitionTo(PaymentStatus.FAILED));
        assertTrue(PaymentStatus.AUTHORIZED.canTransitionTo(PaymentStatus.FAILED));
        assertTrue(PaymentStatus.CAPTURED.canTransitionTo(PaymentStatus.FAILED));
    }

    @Test
    @DisplayName("CREATED can be cancelled or expire")
    void createdCancelExpire() {
        assertTrue(PaymentStatus.CREATED.canTransitionTo(PaymentStatus.CANCELLED));
        assertTrue(PaymentStatus.CREATED.canTransitionTo(PaymentStatus.EXPIRED));
    }
}
