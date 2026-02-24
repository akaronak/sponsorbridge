package com.eventra.service;

import com.eventra.config.PaymentProperties;
import com.eventra.entity.*;
import com.eventra.entity.Transaction.TransactionType;
import com.eventra.exception.PaymentException;
import com.eventra.exception.ResourceNotFoundException;
import com.eventra.infrastructure.IdempotencyService;
import com.eventra.repository.PaymentRepository;
import com.eventra.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Escrow lifecycle management.
 *
 * <h3>Settlement flow:</h3>
 * <pre>
 *   IN_ESCROW ──(hold period expires)──▶ RELEASED ──▶ SETTLED
 * </pre>
 *
 * <h3>Concurrency:</h3>
 * <ul>
 *   <li>Auto-release uses distributed lock per payment to prevent double-release</li>
 *   <li>Optimistic locking (@Version) as a second guard against concurrent updates</li>
 * </ul>
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class EscrowService {

    private final PaymentRepository paymentRepository;
    private final TransactionRepository transactionRepository;
    private final IdempotencyService idempotencyService;
    private final PaymentProperties paymentProperties;

    /**
     * Release funds from escrow (manual/admin or automated).
     * Transitions: IN_ESCROW → RELEASED
     */
    public Payment releaseFromEscrow(String paymentId, String releasedBy) {
        String lockKey = "escrow-release:" + paymentId;
        String lockOwner = "release-" + Thread.currentThread().threadId();

        if (!idempotencyService.acquireLock(lockKey, lockOwner, Duration.ofSeconds(30))) {
            throw new PaymentException("Payment release already in progress", paymentId, "LOCK_CONFLICT");
        }

        try {
            Payment payment = paymentRepository.findById(paymentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

            if (payment.getStatus() != PaymentStatus.IN_ESCROW) {
                throw new PaymentException("Payment is not in escrow. Current status: " + payment.getStatus(),
                        paymentId, "INVALID_STATE");
            }

            payment.transitionTo(PaymentStatus.RELEASED, "Escrow hold released", releasedBy, "SYSTEM");
            payment = paymentRepository.save(payment);

            // Record audit trail
            createTransaction(payment, TransactionType.ESCROW_RELEASE, payment.getOrganizerPayout(),
                    "Escrow released — organizer payout: " + payment.getOrganizerPayout(), null);

            log.info("Escrow released: paymentId={}, organizerPayout={}", paymentId, payment.getOrganizerPayout());
            return payment;

        } catch (OptimisticLockingFailureException e) {
            log.warn("Optimistic lock failure during escrow release: paymentId={}", paymentId);
            throw new PaymentException("Concurrent modification — retry", paymentId, "CONCURRENT_MODIFICATION");
        } finally {
            idempotencyService.releaseLock(lockKey, lockOwner);
        }
    }

    /**
     * Settle a released payment (funds transferred to organizer).
     * Transitions: RELEASED → SETTLED
     */
    public Payment settlePayment(String paymentId, String settlementBatchId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        if (payment.getStatus() != PaymentStatus.RELEASED) {
            throw new PaymentException("Payment must be in RELEASED state for settlement. Current: " + payment.getStatus(),
                    paymentId, "INVALID_STATE");
        }

        payment.transitionTo(PaymentStatus.SETTLED, "Settlement processed", "SYSTEM", "SYSTEM");
        if (settlementBatchId != null) {
            payment.getEscrowDetails().setSettlementBatchId(settlementBatchId);
        }
        payment = paymentRepository.save(payment);

        createTransaction(payment, TransactionType.SETTLEMENT, payment.getOrganizerPayout(),
                "Settlement completed — batch: " + settlementBatchId, settlementBatchId);

        log.info("Payment settled: paymentId={}, batchId={}", paymentId, settlementBatchId);
        return payment;
    }

    /**
     * Automatically release all eligible escrowed payments.
     * Called by the scheduled job. Each payment is released independently —
     * one failure does not block others.
     *
     * @return number of successfully released payments
     */
    public int autoReleaseEligiblePayments() {
        List<Payment> eligible = paymentRepository.findEligibleForAutoRelease(LocalDateTime.now());

        if (eligible.isEmpty()) {
            return 0;
        }

        log.info("Found {} payments eligible for auto-release", eligible.size());
        int successCount = 0;

        for (Payment payment : eligible) {
            try {
                releaseFromEscrow(payment.getId(), "SCHEDULER");

                // Mark auto-release attempted so we don't retry on failure
                payment = paymentRepository.findById(payment.getId()).orElse(payment);
                payment.getEscrowDetails().setAutoReleaseAttempted(true);
                paymentRepository.save(payment);

                successCount++;
            } catch (Exception e) {
                log.error("Auto-release failed for paymentId={}: {}", payment.getId(), e.getMessage());
                // Mark attempted so we don't keep retrying bad payments
                try {
                    payment.getEscrowDetails().setAutoReleaseAttempted(true);
                    paymentRepository.save(payment);
                } catch (Exception inner) {
                    log.error("Failed to mark autoReleaseAttempted for paymentId={}", payment.getId());
                }
            }
        }

        log.info("Auto-release completed: {}/{} successful", successCount, eligible.size());
        return successCount;
    }

    private void createTransaction(Payment payment, TransactionType type,
                                   BigDecimal amount, String description, String externalRef) {
        Transaction txn = Transaction.builder()
                .paymentId(payment.getId())
                .companyId(payment.getCompanyId())
                .organizerId(payment.getOrganizerId())
                .requestId(payment.getRequestId())
                .type(type)
                .amount(amount)
                .currency(payment.getCurrency())
                .description(description)
                .externalReference(externalRef)
                .build();
        transactionRepository.save(txn);
    }
}
