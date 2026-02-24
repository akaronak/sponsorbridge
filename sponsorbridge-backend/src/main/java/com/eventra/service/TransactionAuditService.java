package com.eventra.service;

import com.eventra.dto.RevenueStatsDTO;
import com.eventra.entity.PaymentStatus;
import com.eventra.entity.Transaction;
import com.eventra.entity.Transaction.TransactionType;
import com.eventra.repository.DisputeRepository;
import com.eventra.repository.PaymentRepository;
import com.eventra.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Revenue analytics and transaction audit service.
 *
 * <h3>Responsibilities:</h3>
 * <ul>
 *   <li>Revenue statistics aggregation</li>
 *   <li>Transaction history queries</li>
 *   <li>Financial reporting</li>
 * </ul>
 *
 * <p>Results are cached via Redis with appropriate TTLs
 * since financial aggregations can be expensive.</p>
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class TransactionAuditService {

    private final TransactionRepository transactionRepository;
    private final PaymentRepository paymentRepository;
    private final DisputeRepository disputeRepository;

    /**
     * Get platform revenue statistics for a date range.
     * Cached for 5 minutes to avoid heavy aggregation on every request.
     */
    @Cacheable(value = "revenue-stats", key = "#from.toString() + '-' + #to.toString()")
    public RevenueStatsDTO getRevenueStats(LocalDateTime from, LocalDateTime to) {
        // Total GMV (all completed payments)
        List<Transaction> captures = transactionRepository.findByTypeAndCreatedAtBetween(
                TransactionType.CAPTURE, from, to);
        BigDecimal gmv = captures.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Platform commission revenue
        List<Transaction> commissions = transactionRepository.findCommissionsBetween(from, to);
        BigDecimal platformRevenue = commissions.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Commission reversals (subtract from revenue)
        List<Transaction> reversals = transactionRepository.findByTypeAndCreatedAtBetween(
                TransactionType.COMMISSION_REVERSAL, from, to);
        BigDecimal totalReversals = reversals.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        platformRevenue = platformRevenue.subtract(totalReversals);

        // Escrow balance — aggregate actual escrowed amounts, not just count
        List<com.eventra.entity.Payment> escrowedPayments = paymentRepository.findByStatus(PaymentStatus.IN_ESCROW);
        BigDecimal escrowBalance = escrowedPayments.stream()
                .map(com.eventra.entity.Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Refunds
        List<Transaction> refunds = transactionRepository.findByTypeAndCreatedAtBetween(
                TransactionType.REFUND, from, to);
        List<Transaction> partialRefunds = transactionRepository.findByTypeAndCreatedAtBetween(
                TransactionType.PARTIAL_REFUND, from, to);
        BigDecimal totalRefunded = refunds.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .add(partialRefunds.stream()
                        .map(Transaction::getAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add));

        // Payouts (settlements)
        List<Transaction> settlements = transactionRepository.findByTypeAndCreatedAtBetween(
                TransactionType.SETTLEMENT, from, to);
        BigDecimal totalPayouts = settlements.stream()
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Counts for rates
        long completedPayments = paymentRepository.countCompletedPaymentsBetween(from, to);
        long activeDisputes = disputeRepository.countByStatus(
                com.eventra.entity.Dispute.DisputeStatus.OPEN)
                + disputeRepository.countByStatus(
                com.eventra.entity.Dispute.DisputeStatus.UNDER_REVIEW);

        // Rates
        BigDecimal refundRate = BigDecimal.ZERO;
        BigDecimal failureRate = BigDecimal.ZERO;

        if (completedPayments > 0) {
            long refundedCount = refunds.size() + partialRefunds.size();
            refundRate = BigDecimal.valueOf(refundedCount)
                    .divide(BigDecimal.valueOf(completedPayments), 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));

            long failedCount = paymentRepository.countByStatus(PaymentStatus.FAILED);
            long totalAttempted = completedPayments + failedCount;
            if (totalAttempted > 0) {
                failureRate = BigDecimal.valueOf(failedCount)
                        .divide(BigDecimal.valueOf(totalAttempted), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            }
        }

        return RevenueStatsDTO.builder()
                .gmv(gmv)
                .platformRevenue(platformRevenue)
                .escrowBalance(escrowBalance)
                .totalRefunded(totalRefunded)
                .totalPayouts(totalPayouts)
                .completedPayments(completedPayments)
                .activeDisputes(activeDisputes)
                .refundRate(refundRate)
                .failureRate(failureRate)
                .build();
    }

    // ── Transaction history queries ──

    public Page<Transaction> getTransactionsByPayment(String paymentId, Pageable pageable) {
        return transactionRepository.findByPaymentIdOrderByCreatedAtDesc(paymentId, pageable);
    }

    public Page<Transaction> getTransactionsByCompany(String companyId, Pageable pageable) {
        return transactionRepository.findByCompanyIdOrderByCreatedAtDesc(companyId, pageable);
    }

    public Page<Transaction> getTransactionsByOrganizer(String organizerId, Pageable pageable) {
        return transactionRepository.findByOrganizerIdOrderByCreatedAtDesc(organizerId, pageable);
    }
}
