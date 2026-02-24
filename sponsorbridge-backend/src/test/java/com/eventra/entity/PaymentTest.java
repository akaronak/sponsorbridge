package com.eventra.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for the Payment entity domain methods.
 */
@DisplayName("Payment Entity")
class PaymentTest {

    // ═══════════════════════════════════════════════════
    //  transitionTo
    // ═══════════════════════════════════════════════════

    @Test
    @DisplayName("transitionTo changes status and adds history entry")
    void transitionToValid() {
        Payment payment = Payment.builder()
                .amount(BigDecimal.valueOf(1000))
                .status(PaymentStatus.CREATED)
                .build();

        payment.transitionTo(PaymentStatus.AUTHORIZED, "test reason", "user1", "USER");

        assertEquals(PaymentStatus.AUTHORIZED, payment.getStatus());
        assertEquals(1, payment.getStatusHistory().size());
        assertEquals(PaymentStatus.CREATED, payment.getStatusHistory().get(0).getFromStatus());
        assertEquals(PaymentStatus.AUTHORIZED, payment.getStatusHistory().get(0).getToStatus());
        assertEquals("test reason", payment.getStatusHistory().get(0).getReason());
        assertNotNull(payment.getAuthorizedAt());
    }

    @Test
    @DisplayName("transitionTo sets capturedAt timestamp")
    void transitionToCaptured() {
        Payment payment = Payment.builder()
                .amount(BigDecimal.valueOf(1000))
                .status(PaymentStatus.AUTHORIZED)
                .build();

        payment.transitionTo(PaymentStatus.CAPTURED, "captured", "WEBHOOK", "WEBHOOK");

        assertNotNull(payment.getCapturedAt());
    }

    @Test
    @DisplayName("transitionTo IN_ESCROW initializes escrow details")
    void transitionToInEscrow() {
        Payment payment = Payment.builder()
                .amount(BigDecimal.valueOf(1000))
                .status(PaymentStatus.CAPTURED)
                .build();

        payment.transitionTo(PaymentStatus.IN_ESCROW, "escrow", "SYSTEM", "WEBHOOK");

        assertNotNull(payment.getEscrowStartedAt());
        assertNotNull(payment.getEscrowDetails());
        assertNotNull(payment.getEscrowDetails().getEscrowStartedAt());
        assertNotNull(payment.getEscrowDetails().getReleaseEligibleAt());
    }

    @Test
    @DisplayName("transitionTo FAILED sets failure reason and timestamp")
    void transitionToFailed() {
        Payment payment = Payment.builder()
                .amount(BigDecimal.valueOf(1000))
                .status(PaymentStatus.CREATED)
                .build();

        payment.transitionTo(PaymentStatus.FAILED, "declined by bank", "WEBHOOK", "WEBHOOK");

        assertNotNull(payment.getFailedAt());
        assertEquals("declined by bank", payment.getFailureReason());
    }

    @Test
    @DisplayName("transitionTo throws on invalid transition")
    void transitionToInvalid() {
        Payment payment = Payment.builder()
                .amount(BigDecimal.valueOf(1000))
                .status(PaymentStatus.CREATED)
                .build();

        assertThrows(IllegalStateException.class,
                () -> payment.transitionTo(PaymentStatus.SETTLED, "skip", "user", "USER"));
    }

    // ═══════════════════════════════════════════════════
    //  Commission calculation
    // ═══════════════════════════════════════════════════

    @Test
    @DisplayName("calculateCommission computes correct amounts for 10% rate")
    void calculateCommission() {
        Payment payment = Payment.builder()
                .amount(BigDecimal.valueOf(10000))
                .build();

        payment.calculateCommission(BigDecimal.valueOf(10));

        assertEquals(new BigDecimal("0.1000"), payment.getCommissionRate());
        assertEquals(new BigDecimal("1000.00"), payment.getPlatformCommission());
        assertEquals(new BigDecimal("9000.00"), payment.getOrganizerPayout());
    }

    @Test
    @DisplayName("calculateCommission enforces minimum commission")
    void calculateCommissionMinimum() {
        Payment payment = Payment.builder()
                .amount(BigDecimal.valueOf(5)) // 10% of 5 = 0.50, below min 1.00
                .build();

        payment.calculateCommission(BigDecimal.valueOf(10));

        assertEquals(new BigDecimal("1.00"), payment.getPlatformCommission());
        assertEquals(new BigDecimal("4.00"), payment.getOrganizerPayout());
    }

    @Test
    @DisplayName("calculateCommission with fractional amounts")
    void calculateCommissionFractional() {
        Payment payment = Payment.builder()
                .amount(new BigDecimal("999.99"))
                .build();

        payment.calculateCommission(BigDecimal.valueOf(10));

        assertEquals(new BigDecimal("100.00"), payment.getPlatformCommission());
        assertEquals(new BigDecimal("899.99"), payment.getOrganizerPayout());
    }

    // ═══════════════════════════════════════════════════
    //  Refund tracking
    // ═══════════════════════════════════════════════════

    @Test
    @DisplayName("addRefundAmount tracks cumulative refunds")
    void addRefundAmount() {
        Payment payment = Payment.builder()
                .amount(BigDecimal.valueOf(1000))
                .build();

        BigDecimal remaining = payment.addRefundAmount(BigDecimal.valueOf(300));

        assertEquals(BigDecimal.valueOf(300), payment.getRefundedAmount());
        assertEquals(BigDecimal.valueOf(700), remaining);
    }

    @Test
    @DisplayName("getRefundableAmount returns remaining balance")
    void refundableAmount() {
        Payment payment = Payment.builder()
                .amount(BigDecimal.valueOf(1000))
                .build();

        payment.addRefundAmount(BigDecimal.valueOf(400));

        assertEquals(BigDecimal.valueOf(600), payment.getRefundableAmount());
    }

    @Test
    @DisplayName("isFullyRefunded returns true when refunded >= amount")
    void isFullyRefunded() {
        Payment payment = Payment.builder()
                .amount(BigDecimal.valueOf(1000))
                .build();

        assertFalse(payment.isFullyRefunded());

        payment.addRefundAmount(BigDecimal.valueOf(1000));
        assertTrue(payment.isFullyRefunded());
    }

    @Test
    @DisplayName("Multiple partial refunds accumulate correctly")
    void multiplePartialRefunds() {
        Payment payment = Payment.builder()
                .amount(BigDecimal.valueOf(1000))
                .build();

        payment.addRefundAmount(BigDecimal.valueOf(200));
        payment.addRefundAmount(BigDecimal.valueOf(300));
        payment.addRefundAmount(BigDecimal.valueOf(500));

        assertTrue(payment.isFullyRefunded());
        assertEquals(BigDecimal.valueOf(1000), payment.getRefundedAmount());
    }

    // ═══════════════════════════════════════════════════
    //  Escrow eligibility
    // ═══════════════════════════════════════════════════

    @Test
    @DisplayName("isEligibleForAutoRelease returns false when not IN_ESCROW")
    void notEligibleWhenNotInEscrow() {
        Payment payment = Payment.builder()
                .amount(BigDecimal.valueOf(1000))
                .status(PaymentStatus.CREATED)
                .build();

        assertFalse(payment.isEligibleForAutoRelease());
    }

    @Test
    @DisplayName("isEligibleForAutoRelease returns false when already attempted")
    void notEligibleWhenAttempted() {
        Payment payment = Payment.builder()
                .amount(BigDecimal.valueOf(1000))
                .status(PaymentStatus.IN_ESCROW)
                .build();
        payment.getEscrowDetails().setAutoReleaseAttempted(true);
        payment.getEscrowDetails().setReleaseEligibleAt(java.time.LocalDateTime.now().minusDays(1));

        assertFalse(payment.isEligibleForAutoRelease());
    }

    @Test
    @DisplayName("isEligibleForAutoRelease returns true when eligible")
    void eligibleForAutoRelease() {
        Payment payment = Payment.builder()
                .amount(BigDecimal.valueOf(1000))
                .status(PaymentStatus.IN_ESCROW)
                .build();
        payment.getEscrowDetails().setReleaseEligibleAt(java.time.LocalDateTime.now().minusHours(1));
        payment.getEscrowDetails().setAutoReleaseAttempted(false);

        assertTrue(payment.isEligibleForAutoRelease());
    }
}
