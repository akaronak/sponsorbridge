package com.eventra.service;

import com.eventra.config.PaymentProperties;
import com.eventra.dto.RefundRequest;
import com.eventra.entity.*;
import com.eventra.entity.Transaction.TransactionType;
import com.eventra.exception.BadRequestException;
import com.eventra.exception.PaymentException;
import com.eventra.exception.ResourceNotFoundException;
import com.eventra.infrastructure.IdempotencyService;
import com.eventra.repository.PaymentRepository;
import com.eventra.repository.TransactionRepository;
import com.razorpay.Refund;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("RefundService")
class RefundServiceTest {

    @Mock private PaymentRepository paymentRepository;
    @Mock private TransactionRepository transactionRepository;
    @Mock private RazorpayGatewayService razorpayGateway;
    @Mock private IdempotencyService idempotencyService;
    @Mock private PaymentProperties paymentProperties;

    @InjectMocks
    private RefundService refundService;

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
                .razorpayPaymentId("pay_rzp_1")
                .platformCommission(BigDecimal.valueOf(500))
                .commissionRate(BigDecimal.valueOf(0.1))
                .organizerPayout(BigDecimal.valueOf(4500))
                .build();
    }

    // ═══════════════════════════════════════════════════
    //  Full Refund
    // ═══════════════════════════════════════════════════

    @Nested
    @DisplayName("Full Refund")
    class FullRefund {

        @Test
        @DisplayName("Successfully processes full refund with commission reversal")
        void success() throws Exception {
            RefundRequest request = RefundRequest.builder()
                    .paymentId("pay-1")
                    .amount(BigDecimal.valueOf(5000))
                    .reason("Customer requested")
                    .partial(false)
                    .build();

            when(idempotencyService.acquireLock(anyString(), anyString(), any(Duration.class)))
                    .thenReturn(true);
            when(paymentRepository.findById("pay-1")).thenReturn(Optional.of(payment));
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            Refund mockRefund = mock(Refund.class);
            when(mockRefund.get("id")).thenReturn("rfnd_rzp_1");
            when(razorpayGateway.createRefund(eq("pay_rzp_1"), eq(500000L), anyString()))
                    .thenReturn(mockRefund);

            Payment result = refundService.initiateRefund(request, "user-1");

            assertNotNull(result);
            assertEquals(PaymentStatus.REFUNDED, result.getStatus());
            assertTrue(result.isFullyRefunded());
            // 2 transactions: COMMISSION_REVERSAL + REFUND
            verify(transactionRepository, times(2)).save(any());
            verify(idempotencyService).releaseLock(anyString(), anyString());
        }

        @Test
        @DisplayName("Records commission reversal on full refund")
        void commissionReversal() throws Exception {
            RefundRequest request = RefundRequest.builder()
                    .paymentId("pay-1")
                    .amount(BigDecimal.valueOf(5000))
                    .reason("Full refund")
                    .partial(false)
                    .build();

            when(idempotencyService.acquireLock(anyString(), anyString(), any(Duration.class)))
                    .thenReturn(true);
            when(paymentRepository.findById("pay-1")).thenReturn(Optional.of(payment));
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            Refund mockRefund = mock(Refund.class);
            when(mockRefund.get("id")).thenReturn("rfnd_rzp_1");
            when(razorpayGateway.createRefund(any(), anyLong(), anyString())).thenReturn(mockRefund);

            refundService.initiateRefund(request, "user-1");

            // Verify commission reversal transaction was created
            verify(transactionRepository, atLeastOnce()).save(argThat(txn ->
                    txn instanceof Transaction && ((Transaction) txn).getType() == TransactionType.COMMISSION_REVERSAL));
        }
    }

    // ═══════════════════════════════════════════════════
    //  Partial Refund
    // ═══════════════════════════════════════════════════

    @Nested
    @DisplayName("Partial Refund")
    class PartialRefund {

        @Test
        @DisplayName("Successfully processes partial refund")
        void success() throws Exception {
            RefundRequest request = RefundRequest.builder()
                    .paymentId("pay-1")
                    .amount(BigDecimal.valueOf(2000))
                    .reason("Partial service")
                    .partial(true)
                    .build();

            when(idempotencyService.acquireLock(anyString(), anyString(), any(Duration.class)))
                    .thenReturn(true);
            when(paymentRepository.findById("pay-1")).thenReturn(Optional.of(payment));
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            Refund mockRefund = mock(Refund.class);
            when(mockRefund.get("id")).thenReturn("rfnd_rzp_2");
            when(razorpayGateway.createRefund(eq("pay_rzp_1"), eq(200000L), anyString()))
                    .thenReturn(mockRefund);

            Payment result = refundService.initiateRefund(request, "user-1");

            assertFalse(result.isFullyRefunded());
            assertEquals(BigDecimal.valueOf(2000), result.getRefundedAmount());
        }
    }

    // ═══════════════════════════════════════════════════
    //  Error Handling
    // ═══════════════════════════════════════════════════

    @Nested
    @DisplayName("Error Handling")
    class ErrorHandling {

        @Test
        @DisplayName("Throws when lock cannot be acquired")
        void lockConflict() {
            RefundRequest request = RefundRequest.builder()
                    .paymentId("pay-1")
                    .amount(BigDecimal.valueOf(5000))
                    .reason("test")
                    .build();

            when(idempotencyService.acquireLock(anyString(), anyString(), any(Duration.class)))
                    .thenReturn(false);

            assertThrows(PaymentException.class,
                    () -> refundService.initiateRefund(request, "user-1"));
        }

        @Test
        @DisplayName("Throws when payment not found")
        void paymentNotFound() {
            RefundRequest request = RefundRequest.builder()
                    .paymentId("missing")
                    .amount(BigDecimal.valueOf(5000))
                    .reason("test")
                    .build();

            when(idempotencyService.acquireLock(anyString(), anyString(), any(Duration.class)))
                    .thenReturn(true);
            when(paymentRepository.findById("missing")).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class,
                    () -> refundService.initiateRefund(request, "user-1"));
            verify(idempotencyService).releaseLock(anyString(), anyString());
        }

        @Test
        @DisplayName("Rejects refund on non-refundable state")
        void nonRefundableState() {
            RefundRequest request = RefundRequest.builder()
                    .paymentId("pay-1")
                    .amount(BigDecimal.valueOf(5000))
                    .reason("test")
                    .build();

            payment.setStatus(PaymentStatus.CREATED); // Not refundable
            when(idempotencyService.acquireLock(anyString(), anyString(), any(Duration.class)))
                    .thenReturn(true);
            when(paymentRepository.findById("pay-1")).thenReturn(Optional.of(payment));

            assertThrows(PaymentException.class,
                    () -> refundService.initiateRefund(request, "user-1"));
        }

        @Test
        @DisplayName("Rejects refund amount exceeding refundable balance")
        void exceedsBalance() {
            RefundRequest request = RefundRequest.builder()
                    .paymentId("pay-1")
                    .amount(BigDecimal.valueOf(6000))
                    .reason("too much")
                    .partial(true)
                    .build();

            when(idempotencyService.acquireLock(anyString(), anyString(), any(Duration.class)))
                    .thenReturn(true);
            when(paymentRepository.findById("pay-1")).thenReturn(Optional.of(payment));

            assertThrows(BadRequestException.class,
                    () -> refundService.initiateRefund(request, "user-1"));
        }
    }
}
