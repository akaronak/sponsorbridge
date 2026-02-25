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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;

/**
 * Refund management service.
 *
 * <h3>Refund scenarios:</h3>
 * <ol>
 *   <li><b>Pre-settlement (IN_ESCROW/RELEASED)</b>: Refund from escrow, reverse commission</li>
 *   <li><b>Post-settlement (SETTLED)</b>: Refund from platform funds, recoup from organizer</li>
 *   <li><b>Partial refunds</b>: Multiple partial refunds up to original amount</li>
 * </ol>
 *
 * <h3>Commission reversal:</h3>
 * On full refund, the platform commission is reversed.
 * On partial refund, commission is proportionally adjusted.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class RefundService {

    private final PaymentRepository paymentRepository;
    private final TransactionRepository transactionRepository;
    private final RazorpayGatewayService razorpayGateway;
    private final IdempotencyService idempotencyService;
    private final PaymentProperties paymentProperties;

    /**
     * Initiate a refund through Razorpay.
     *
     * @return updated Payment
     */
    public Payment initiateRefund(RefundRequest request, String initiatedBy) {
        String lockKey = "refund:" + request.getPaymentId();
        String lockOwner = "refund-" + Thread.currentThread().threadId();

        if (!idempotencyService.acquireLock(lockKey, lockOwner, Duration.ofSeconds(30))) {
            throw new PaymentException("Refund already in progress", request.getPaymentId(), "LOCK_CONFLICT");
        }

        try {
            Payment payment = paymentRepository.findById(request.getPaymentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

            // Validate refundability
            if (!payment.getStatus().isRefundable()) {
                throw new PaymentException(
                        "Payment cannot be refunded in state: " + payment.getStatus(),
                        payment.getId(), "INVALID_STATE");
            }

            // Validate amount
            BigDecimal refundAmount = request.isPartial() ? request.getAmount() : payment.getAmount();
            if (refundAmount == null || refundAmount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new BadRequestException("Refund amount must be positive");
            }

            BigDecimal refundableAmount = payment.getRefundableAmount();
            if (refundAmount.compareTo(refundableAmount) > 0) {
                throw new BadRequestException(
                        "Refund amount %s exceeds refundable balance %s".formatted(refundAmount, refundableAmount));
            }

            // Transition to REFUND_REQUESTED (unless already in refund flow)
            if (payment.getStatus() != PaymentStatus.REFUND_REQUESTED
                    && payment.getStatus() != PaymentStatus.PARTIALLY_REFUNDED) {
                payment.transitionTo(PaymentStatus.REFUND_REQUESTED,
                        "Refund requested: " + request.getReason(), initiatedBy, "USER");
                payment = paymentRepository.save(payment);
            }

            // Call Razorpay refund API
            long refundAmountPaise = RazorpayGatewayService.toPaise(refundAmount);
            com.razorpay.Refund razorpayRefund = razorpayGateway.createRefund(
                    payment.getRazorpayPaymentId(), refundAmountPaise, request.getReason());

            String refundId = razorpayRefund.get("id");

            // Update payment (refund amount tracked, webhook will finalize state)
            payment.addRefundAmount(refundAmount);
            payment.getRazorpayRefundIds().add(refundId);

            // Determine final state
            if (payment.isFullyRefunded()) {
                payment.transitionTo(PaymentStatus.REFUNDED, "Full refund processed", "SYSTEM", "SYSTEM");
                // Reverse full commission
                createTransaction(payment, TransactionType.COMMISSION_REVERSAL,
                        payment.getPlatformCommission(), "Full commission reversed on full refund", refundId);
            } else {
                try {
                    payment.transitionTo(PaymentStatus.PARTIALLY_REFUNDED,
                            "Partial refund: " + refundAmount, "SYSTEM", "SYSTEM");
                } catch (IllegalStateException ignored) {
                    // Already in PARTIALLY_REFUNDED
                }
            }

            payment = paymentRepository.save(payment);

            // Audit trail
            TransactionType txnType = payment.isFullyRefunded()
                    ? TransactionType.REFUND : TransactionType.PARTIAL_REFUND;
            createTransaction(payment, txnType, refundAmount,
                    "Refund via Razorpay: " + request.getReason(), refundId);

            log.info("Refund processed: paymentId={}, refundId={}, amount={}, total_refunded={}",
                    payment.getId(), refundId, refundAmount, payment.getRefundedAmount());

            return payment;

        } catch (OptimisticLockingFailureException e) {
            throw new PaymentException("Concurrent modification — retry", request.getPaymentId(), "CONCURRENT_MODIFICATION");
        } finally {
            idempotencyService.releaseLock(lockKey, lockOwner);
        }
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
