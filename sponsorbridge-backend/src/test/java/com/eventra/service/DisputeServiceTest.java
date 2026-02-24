package com.eventra.service;

import com.eventra.config.PaymentProperties;
import com.eventra.dto.DisputeDTO;
import com.eventra.dto.DisputeRequest;
import com.eventra.entity.*;
import com.eventra.entity.Dispute.DisputeStatus;
import com.eventra.exception.BadRequestException;
import com.eventra.exception.PaymentException;
import com.eventra.exception.ResourceNotFoundException;
import com.eventra.repository.DisputeRepository;
import com.eventra.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("DisputeService")
class DisputeServiceTest {

    @Mock private DisputeRepository disputeRepository;
    @Mock private PaymentRepository paymentRepository;
    @Mock private EscrowService escrowService;
    @Mock private RefundService refundService;
    @Mock private PaymentProperties paymentProperties;

    @InjectMocks
    private DisputeService disputeService;

    private Payment payment;
    private Dispute dispute;

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

        dispute = Dispute.builder()
                .id("dispute-1")
                .paymentId("pay-1")
                .requestId("req-1")
                .companyId("company-1")
                .organizerId("organizer-1")
                .raisedBy("company-user")
                .raisedByRole(Dispute.DisputeRaisedByRole.COMPANY)
                .reason("Service not delivered")
                .category("NON_DELIVERY")
                .disputedAmount(BigDecimal.valueOf(5000))
                .status(DisputeStatus.OPEN)
                .evidence(new ArrayList<>())
                .autoResolveAt(LocalDateTime.now().plusDays(14))
                .createdAt(LocalDateTime.now())
                .build();
    }

    // ═══════════════════════════════════════════════════
    //  raiseDispute
    // ═══════════════════════════════════════════════════

    @Nested
    @DisplayName("raiseDispute")
    class RaiseDispute {

        @Test
        @DisplayName("Successfully raises a dispute on IN_ESCROW payment")
        void success() {
            DisputeRequest request = DisputeRequest.builder()
                    .paymentId("pay-1")
                    .reason("Service not delivered")
                    .category("NON_DELIVERY")
                    .build();

            when(paymentRepository.findById("pay-1")).thenReturn(Optional.of(payment));
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));
            when(disputeRepository.findByPaymentId("pay-1")).thenReturn(Optional.empty());
            when(disputeRepository.save(any(Dispute.class))).thenAnswer(inv -> {
                Dispute d = inv.getArgument(0);
                d.setId("dispute-1");
                return d;
            });
            when(paymentProperties.getDisputeAutoResolveDays()).thenReturn(14);

            DisputeDTO result = disputeService.raiseDispute(request, "company-user", "COMPANY");

            assertNotNull(result);
            assertEquals(PaymentStatus.DISPUTE_OPEN, payment.getStatus());
            verify(disputeRepository).save(any(Dispute.class));
        }

        @Test
        @DisplayName("Rejects dispute on non-IN_ESCROW payment")
        void rejectNonEscrow() {
            payment.setStatus(PaymentStatus.CREATED);
            DisputeRequest request = DisputeRequest.builder()
                    .paymentId("pay-1")
                    .reason("test")
                    .build();

            when(paymentRepository.findById("pay-1")).thenReturn(Optional.of(payment));

            assertThrows(PaymentException.class,
                    () -> disputeService.raiseDispute(request, "user", "COMPANY"));
        }

        @Test
        @DisplayName("Rejects duplicate dispute on same payment")
        void rejectDuplicate() {
            DisputeRequest request = DisputeRequest.builder()
                    .paymentId("pay-1")
                    .reason("test")
                    .build();

            when(paymentRepository.findById("pay-1")).thenReturn(Optional.of(payment));
            when(disputeRepository.findByPaymentId("pay-1")).thenReturn(Optional.of(dispute));

            assertThrows(BadRequestException.class,
                    () -> disputeService.raiseDispute(request, "user", "COMPANY"));
        }
    }

    // ═══════════════════════════════════════════════════
    //  resolveForCompany
    // ═══════════════════════════════════════════════════

    @Nested
    @DisplayName("resolveForCompany")
    class ResolveForCompany {

        @Test
        @DisplayName("Resolves dispute and triggers Razorpay refund")
        void success() {
            // Payment must be in DISPUTE_OPEN for the transition
            payment.transitionTo(PaymentStatus.DISPUTE_OPEN, "test", "test", "SYSTEM");

            when(disputeRepository.findById("dispute-1")).thenReturn(Optional.of(dispute));
            when(disputeRepository.save(any(Dispute.class))).thenAnswer(inv -> inv.getArgument(0));
            when(paymentRepository.findById("pay-1")).thenReturn(Optional.of(payment));
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));
            when(refundService.initiateRefund(any(), anyString())).thenReturn(payment);

            DisputeDTO result = disputeService.resolveForCompany("dispute-1", "admin-1", "Company is right");

            assertEquals("RESOLVED_COMPANY_FAVOR", result.getStatus());
            assertEquals(PaymentStatus.DISPUTE_LOST, payment.getStatus());
            verify(refundService).initiateRefund(any(), eq("admin-1"));
        }

        @Test
        @DisplayName("Rejects resolution of already resolved dispute")
        void alreadyResolved() {
            dispute.setStatus(DisputeStatus.RESOLVED_COMPANY_FAVOR);
            when(disputeRepository.findById("dispute-1")).thenReturn(Optional.of(dispute));

            assertThrows(BadRequestException.class,
                    () -> disputeService.resolveForCompany("dispute-1", "admin", "test"));
        }
    }

    // ═══════════════════════════════════════════════════
    //  resolveForOrganizer
    // ═══════════════════════════════════════════════════

    @Nested
    @DisplayName("resolveForOrganizer")
    class ResolveForOrganizer {

        @Test
        @DisplayName("Resolves dispute and transitions payment to RELEASED")
        void success() {
            payment.transitionTo(PaymentStatus.DISPUTE_OPEN, "test", "test", "SYSTEM");

            when(disputeRepository.findById("dispute-1")).thenReturn(Optional.of(dispute));
            when(disputeRepository.save(any(Dispute.class))).thenAnswer(inv -> inv.getArgument(0));
            when(paymentRepository.findById("pay-1")).thenReturn(Optional.of(payment));
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            DisputeDTO result = disputeService.resolveForOrganizer("dispute-1", "admin-1", "Organizer is right");

            assertEquals("RESOLVED_ORGANIZER_FAVOR", result.getStatus());
            // Should go through DISPUTE_WON → RELEASED
            assertEquals(PaymentStatus.RELEASED, payment.getStatus());
            // Should NOT call escrowService.releaseFromEscrow (direct state transition)
            verifyNoInteractions(escrowService);
        }
    }

    // ═══════════════════════════════════════════════════
    //  markUnderReview
    // ═══════════════════════════════════════════════════

    @Nested
    @DisplayName("markUnderReview")
    class MarkUnderReview {

        @Test
        @DisplayName("Transitions OPEN dispute to UNDER_REVIEW")
        void success() {
            when(disputeRepository.findById("dispute-1")).thenReturn(Optional.of(dispute));
            when(disputeRepository.save(any(Dispute.class))).thenAnswer(inv -> inv.getArgument(0));

            DisputeDTO result = disputeService.markUnderReview("dispute-1", "admin-1");

            assertEquals("UNDER_REVIEW", result.getStatus());
        }

        @Test
        @DisplayName("Rejects non-OPEN dispute")
        void rejectNonOpen() {
            dispute.setStatus(DisputeStatus.UNDER_REVIEW);
            when(disputeRepository.findById("dispute-1")).thenReturn(Optional.of(dispute));

            assertThrows(BadRequestException.class,
                    () -> disputeService.markUnderReview("dispute-1", "admin"));
        }
    }

    // ═══════════════════════════════════════════════════
    //  addEvidence
    // ═══════════════════════════════════════════════════

    @Test
    @DisplayName("addEvidence appends to existing evidence list")
    void addEvidence() {
        when(disputeRepository.findById("dispute-1")).thenReturn(Optional.of(dispute));
        when(disputeRepository.save(any(Dispute.class))).thenAnswer(inv -> inv.getArgument(0));

        DisputeDTO result = disputeService.addEvidence(
                "dispute-1", "user-1", "COMPANY", "Screenshot of issue", "https://example.com/img.png");

        assertEquals(1, result.getEvidence().size());
        assertEquals("Screenshot of issue", result.getEvidence().get(0).getDescription());
    }

    // ═══════════════════════════════════════════════════
    //  autoResolveExpiredDisputes
    // ═══════════════════════════════════════════════════

    @Nested
    @DisplayName("autoResolveExpiredDisputes")
    class AutoResolve {

        @Test
        @DisplayName("Returns 0 when no expired disputes")
        void noExpired() {
            when(disputeRepository.findExpiredOpenDisputes(any())).thenReturn(List.of());

            int result = disputeService.autoResolveExpiredDisputes();

            assertEquals(0, result);
        }

        @Test
        @DisplayName("Auto-resolves expired disputes and transitions payment DISPUTE_WON → RELEASED")
        void resolvesExpired() {
            payment.transitionTo(PaymentStatus.DISPUTE_OPEN, "test", "test", "SYSTEM");

            when(disputeRepository.findExpiredOpenDisputes(any())).thenReturn(List.of(dispute));
            when(disputeRepository.save(any(Dispute.class))).thenAnswer(inv -> inv.getArgument(0));
            when(paymentRepository.findById("pay-1")).thenReturn(Optional.of(payment));
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));
            when(paymentProperties.getDisputeAutoResolveDays()).thenReturn(14);

            int result = disputeService.autoResolveExpiredDisputes();

            assertEquals(1, result);
            assertEquals(DisputeStatus.AUTO_RESOLVED, dispute.getStatus());
            assertEquals(PaymentStatus.RELEASED, payment.getStatus());
        }
    }
}
