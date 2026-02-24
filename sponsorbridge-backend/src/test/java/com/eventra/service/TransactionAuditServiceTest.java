package com.eventra.service;

import com.eventra.dto.RevenueStatsDTO;
import com.eventra.entity.Payment;
import com.eventra.entity.PaymentStatus;
import com.eventra.entity.Transaction;
import com.eventra.entity.Transaction.TransactionType;
import com.eventra.repository.DisputeRepository;
import com.eventra.repository.PaymentRepository;
import com.eventra.repository.TransactionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TransactionAuditService")
class TransactionAuditServiceTest {

    @Mock private TransactionRepository transactionRepository;
    @Mock private PaymentRepository paymentRepository;
    @Mock private DisputeRepository disputeRepository;

    @InjectMocks
    private TransactionAuditService auditService;

    @Test
    @DisplayName("getRevenueStats calculates correct GMV and platform revenue")
    void revenueStatsCalculation() {
        LocalDateTime from = LocalDateTime.of(2026, 1, 1, 0, 0);
        LocalDateTime to = LocalDateTime.of(2026, 12, 31, 23, 59);

        // Captures
        Transaction capture1 = Transaction.builder()
                .type(TransactionType.CAPTURE)
                .amount(BigDecimal.valueOf(5000))
                .build();
        Transaction capture2 = Transaction.builder()
                .type(TransactionType.CAPTURE)
                .amount(BigDecimal.valueOf(3000))
                .build();
        when(transactionRepository.findByTypeAndCreatedAtBetween(TransactionType.CAPTURE, from, to))
                .thenReturn(List.of(capture1, capture2));

        // Commissions
        Transaction commission1 = Transaction.builder()
                .type(TransactionType.COMMISSION_DEDUCTION)
                .amount(BigDecimal.valueOf(500))
                .build();
        Transaction commission2 = Transaction.builder()
                .type(TransactionType.COMMISSION_DEDUCTION)
                .amount(BigDecimal.valueOf(300))
                .build();
        when(transactionRepository.findCommissionsBetween(from, to))
                .thenReturn(List.of(commission1, commission2));

        // No reversals
        when(transactionRepository.findByTypeAndCreatedAtBetween(TransactionType.COMMISSION_REVERSAL, from, to))
                .thenReturn(List.of());

        // Escrow balance — actual payment amounts, not just count
        Payment escrowPayment = Payment.builder()
                .id("p1")
                .amount(BigDecimal.valueOf(2000))
                .status(PaymentStatus.IN_ESCROW)
                .build();
        when(paymentRepository.findByStatus(PaymentStatus.IN_ESCROW))
                .thenReturn(List.of(escrowPayment));

        // No refunds
        when(transactionRepository.findByTypeAndCreatedAtBetween(TransactionType.REFUND, from, to))
                .thenReturn(List.of());
        when(transactionRepository.findByTypeAndCreatedAtBetween(TransactionType.PARTIAL_REFUND, from, to))
                .thenReturn(List.of());

        // No settlements
        when(transactionRepository.findByTypeAndCreatedAtBetween(TransactionType.SETTLEMENT, from, to))
                .thenReturn(List.of());

        when(paymentRepository.countCompletedPaymentsBetween(from, to)).thenReturn(2L);
        when(disputeRepository.countByStatus(any())).thenReturn(0L);
        when(paymentRepository.countByStatus(PaymentStatus.FAILED)).thenReturn(0L);

        RevenueStatsDTO stats = auditService.getRevenueStats(from, to);

        assertEquals(BigDecimal.valueOf(8000), stats.getGmv());
        assertEquals(BigDecimal.valueOf(800), stats.getPlatformRevenue());
        assertEquals(BigDecimal.valueOf(2000), stats.getEscrowBalance()); // actual amount, not count
        assertEquals(2L, stats.getCompletedPayments());
    }

    @Test
    @DisplayName("getRevenueStats subtracts commission reversals from revenue")
    void deductsReversals() {
        LocalDateTime from = LocalDateTime.of(2026, 1, 1, 0, 0);
        LocalDateTime to = LocalDateTime.of(2026, 12, 31, 23, 59);

        when(transactionRepository.findByTypeAndCreatedAtBetween(TransactionType.CAPTURE, from, to))
                .thenReturn(List.of());
        when(transactionRepository.findCommissionsBetween(from, to))
                .thenReturn(List.of(Transaction.builder().amount(BigDecimal.valueOf(500)).build()));
        when(transactionRepository.findByTypeAndCreatedAtBetween(TransactionType.COMMISSION_REVERSAL, from, to))
                .thenReturn(List.of(Transaction.builder().amount(BigDecimal.valueOf(200)).build()));
        when(paymentRepository.findByStatus(PaymentStatus.IN_ESCROW)).thenReturn(List.of());
        when(transactionRepository.findByTypeAndCreatedAtBetween(TransactionType.REFUND, from, to))
                .thenReturn(List.of());
        when(transactionRepository.findByTypeAndCreatedAtBetween(TransactionType.PARTIAL_REFUND, from, to))
                .thenReturn(List.of());
        when(transactionRepository.findByTypeAndCreatedAtBetween(TransactionType.SETTLEMENT, from, to))
                .thenReturn(List.of());
        when(paymentRepository.countCompletedPaymentsBetween(from, to)).thenReturn(0L);
        when(disputeRepository.countByStatus(any())).thenReturn(0L);

        RevenueStatsDTO stats = auditService.getRevenueStats(from, to);

        // 500 - 200 = 300
        assertEquals(BigDecimal.valueOf(300), stats.getPlatformRevenue());
    }

    @Test
    @DisplayName("getTransactionsByPayment returns paginated results")
    void transactionsByPayment() {
        Transaction txn = Transaction.builder()
                .id("txn-1")
                .paymentId("pay-1")
                .amount(BigDecimal.valueOf(5000))
                .type(TransactionType.CAPTURE)
                .build();
        Page<Transaction> page = new PageImpl<>(List.of(txn));
        when(transactionRepository.findByPaymentIdOrderByCreatedAtDesc("pay-1", PageRequest.of(0, 50)))
                .thenReturn(page);

        Page<Transaction> result = auditService.getTransactionsByPayment("pay-1", PageRequest.of(0, 50));

        assertEquals(1, result.getTotalElements());
    }
}
