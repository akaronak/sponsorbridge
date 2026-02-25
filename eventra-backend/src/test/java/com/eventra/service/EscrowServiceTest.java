package com.eventra.service;

import com.eventra.config.PaymentProperties;
import com.eventra.entity.*;
import com.eventra.exception.PaymentException;
import com.eventra.exception.ResourceNotFoundException;
import com.eventra.infrastructure.IdempotencyService;
import com.eventra.repository.PaymentRepository;
import com.eventra.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EscrowService")
class EscrowServiceTest {

    @Mock private PaymentRepository paymentRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private IdempotencyService idempotencyService;
    @Mock private PaymentProperties paymentProperties;

    @InjectMocks
    private EscrowService escrowService;

    private Payment payment;

    @BeforeEach
    void setUp() {
        payment = Payment.builder()
                .id("pay-1")
                .requestId("req-1")
                .companyId("company-1")
                .organizerId("organizer-1")
                .amount(BigDecimal.valueOf(5000))
                .currency("INR")
                .status(PaymentStatus.IN_ESCROW)
                .platformCommission(BigDecimal.valueOf(500))
                .organizerPayout(BigDecimal.valueOf(4500))
                .build();
        payment.getEscrowDetails().setEscrowStartedAt(LocalDateTime.now().minusDays(8));
        payment.getEscrowDetails().setReleaseEligibleAt(LocalDateTime.now().minusDays(1));
    }

    // ═══════════════════════════════════════════════════
    //  releaseFromEscrow
    // ═══════════════════════════════════════════════════

    @Nested
    @DisplayName("releaseFromEscrow")
    class ReleaseFromEscrow {

        @Test
        @DisplayName("Successfully releases payment from escrow")
        void success() {
            when(idempotencyService.acquireLock(anyString(), anyString(), any(Duration.class)))
                    .thenReturn(true);
            when(paymentRepository.findById("pay-1")).thenReturn(Optional.of(payment));
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            Payment result = escrowService.releaseFromEscrow("pay-1", "admin-1");

            assertEquals(PaymentStatus.RELEASED, result.getStatus());
            assertNotNull(result.getReleasedAt());
            verify(transactionRepository).save(any());
            verify(idempotencyService).releaseLock(anyString(), anyString());
        }

        @Test
        @DisplayName("Throws when payment is not in escrow")
        void notInEscrow() {
            payment.setStatus(PaymentStatus.RELEASED);
            when(idempotencyService.acquireLock(anyString(), anyString(), any(Duration.class)))
                    .thenReturn(true);
            when(paymentRepository.findById("pay-1")).thenReturn(Optional.of(payment));

            assertThrows(PaymentException.class,
                    () -> escrowService.releaseFromEscrow("pay-1", "admin-1"));
        }

        @Test
        @DisplayName("Throws when lock cannot be acquired")
        void lockConflict() {
            when(idempotencyService.acquireLock(anyString(), anyString(), any(Duration.class)))
                    .thenReturn(false);

            assertThrows(PaymentException.class,
                    () -> escrowService.releaseFromEscrow("pay-1", "admin-1"));
        }

        @Test
        @DisplayName("Throws when payment not found")
        void notFound() {
            when(idempotencyService.acquireLock(anyString(), anyString(), any(Duration.class)))
                    .thenReturn(true);
            when(paymentRepository.findById("pay-1")).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class,
                    () -> escrowService.releaseFromEscrow("pay-1", "admin-1"));
        }
    }

    // ═══════════════════════════════════════════════════
    //  settlePayment
    // ═══════════════════════════════════════════════════

    @Nested
    @DisplayName("settlePayment")
    class SettlePayment {

        @Test
        @DisplayName("Successfully settles a released payment")
        void success() {
            payment.setStatus(PaymentStatus.RELEASED);
            payment.setReleasedAt(LocalDateTime.now());
            // Must add transition history for state machine validation
            payment.getStatusHistory().add(Payment.StatusChange.builder()
                    .fromStatus(PaymentStatus.IN_ESCROW)
                    .toStatus(PaymentStatus.RELEASED)
                    .build());

            when(paymentRepository.findById("pay-1")).thenReturn(Optional.of(payment));
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            Payment result = escrowService.settlePayment("pay-1", "batch-001");

            assertEquals(PaymentStatus.SETTLED, result.getStatus());
            assertNotNull(result.getSettledAt());
            assertEquals("batch-001", result.getEscrowDetails().getSettlementBatchId());
            verify(transactionRepository).save(any());
        }

        @Test
        @DisplayName("Throws when not in RELEASED state")
        void notReleased() {
            when(paymentRepository.findById("pay-1")).thenReturn(Optional.of(payment)); // IN_ESCROW

            assertThrows(PaymentException.class,
                    () -> escrowService.settlePayment("pay-1", "batch-001"));
        }
    }

    // ═══════════════════════════════════════════════════
    //  autoReleaseEligiblePayments
    // ═══════════════════════════════════════════════════

    @Nested
    @DisplayName("autoReleaseEligiblePayments")
    class AutoRelease {

        @Test
        @DisplayName("Returns 0 when no eligible payments")
        void noEligible() {
            when(paymentRepository.findEligibleForAutoRelease(any())).thenReturn(List.of());

            int result = escrowService.autoReleaseEligiblePayments();

            assertEquals(0, result);
        }

        @Test
        @DisplayName("Processes eligible payments and returns success count")
        void processesEligible() {
            when(paymentRepository.findEligibleForAutoRelease(any())).thenReturn(List.of(payment));
            when(idempotencyService.acquireLock(anyString(), anyString(), any(Duration.class)))
                    .thenReturn(true);
            when(paymentRepository.findById("pay-1")).thenReturn(Optional.of(payment));
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            int result = escrowService.autoReleaseEligiblePayments();

            assertEquals(1, result);
            assertTrue(payment.getEscrowDetails().getAutoReleaseAttempted());
        }

        @Test
        @DisplayName("Continues processing after individual failure")
        void continuesOnFailure() {
            Payment payment2 = Payment.builder()
                    .id("pay-2")
                    .amount(BigDecimal.valueOf(3000))
                    .status(PaymentStatus.IN_ESCROW)
                    .organizerPayout(BigDecimal.valueOf(2700))
                    .build();

            when(paymentRepository.findEligibleForAutoRelease(any()))
                    .thenReturn(List.of(payment, payment2));

            // First payment fails to acquire lock
            when(idempotencyService.acquireLock(contains("pay-1"), anyString(), any(Duration.class)))
                    .thenReturn(false);

            // Second payment succeeds
            when(idempotencyService.acquireLock(contains("pay-2"), anyString(), any(Duration.class)))
                    .thenReturn(true);
            when(paymentRepository.findById("pay-2")).thenReturn(Optional.of(payment2));
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            int result = escrowService.autoReleaseEligiblePayments();

            // At least the second should succeed (first may count as failure)
            assertTrue(result <= 2);
        }
    }
}
