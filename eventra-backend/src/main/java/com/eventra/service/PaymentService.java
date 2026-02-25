package com.eventra.service;

import com.eventra.config.PaymentProperties;
import com.eventra.dto.*;
import com.eventra.entity.*;
import com.eventra.entity.Transaction.TransactionType;
import com.eventra.exception.*;
import com.eventra.infrastructure.IdempotencyService;
import com.eventra.repository.*;
import com.razorpay.Order;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Core payment orchestration service.
 *
 * <h3>Responsibilities:</h3>
 * <ul>
 *   <li>Create Razorpay orders (with idempotency)</li>
 *   <li>Verify and process payments</li>
 *   <li>Commission calculation</li>
 *   <li>Escrow lifecycle management</li>
 *   <li>Transaction audit trail creation</li>
 * </ul>
 *
 * <h3>Concurrency safety:</h3>
 * <ul>
 *   <li>Idempotency via Redis (order creation, webhook processing)</li>
 *   <li>Optimistic locking via @Version (payment state transitions)</li>
 *   <li>Distributed locks via Redis (settlement, auto-release)</li>
 * </ul>
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final TransactionRepository transactionRepository;
    private final SponsorshipRequestRepository requestRepository;
    private final CompanyRepository companyRepository;
    private final OrganizerRepository organizerRepository;
    private final RazorpayGatewayService razorpayGateway;
    private final IdempotencyService idempotencyService;
    private final PaymentProperties paymentProperties;

    // ═══════════════════════════════════════════════════
    //  Order Creation
    // ═══════════════════════════════════════════════════

    /**
     * Create a Razorpay order for a sponsorship payment.
     *
     * <p>Financial flow:
     * 1. Validate request exists and is ACCEPTED
     * 2. Check idempotency (prevent duplicate orders)
     * 3. Validate amount against fraud limits
     * 4. Create Payment record (status=CREATED)
     * 5. Create Razorpay order
     * 6. Update Payment with razorpayOrderId
     * 7. Return order details for frontend checkout widget
     */
    public PaymentOrderResponse createOrder(String userId, CreatePaymentOrderRequest request) {
        // 1. Validate sponsorship request
        SponsorshipRequest sponsorshipRequest = requestRepository.findById(request.getRequestId())
                .orElseThrow(() -> new ResourceNotFoundException("Sponsorship request not found"));

        if (sponsorshipRequest.getStatus() != RequestStatus.ACCEPTED) {
            throw new BadRequestException("Payment can only be initiated for ACCEPTED sponsorship requests");
        }

        // Verify the user is the company associated with this request
        companyRepository.findById(sponsorshipRequest.getCompanyId())
                .filter(c -> c.getUserId().equals(userId))
                .orElseThrow(() -> new UnauthorizedException("Only the sponsoring company can initiate payment"));

        // 2. Idempotency check
        String idempotencyKey = request.getIdempotencyKey();
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            idempotencyKey = UUID.randomUUID().toString();
        }

        var existingPayment = paymentRepository.findByIdempotencyKey(idempotencyKey);
        if (existingPayment.isPresent()) {
            Payment existing = existingPayment.get();
            log.warn("Duplicate order request detected: idempotencyKey={}, existingPaymentId={}",
                    idempotencyKey, existing.getId());
            return PaymentOrderResponse.builder()
                    .paymentId(existing.getId())
                    .razorpayOrderId(existing.getRazorpayOrderId())
                    .razorpayKeyId(razorpayGateway.getKeyId())
                    .amount(existing.getAmount())
                    .currency(existing.getCurrency())
                    .status(existing.getStatus().name())
                    .build();
        }

        // 3. Amount validation (fraud guard)
        if (request.getAmount().compareTo(paymentProperties.getMaxPaymentAmount()) > 0) {
            throw new BadRequestException("Payment amount exceeds maximum allowed: " +
                    paymentProperties.getMaxPaymentAmount());
        }

        // 4. Create Payment record
        Payment payment = Payment.builder()
                .requestId(request.getRequestId())
                .companyId(sponsorshipRequest.getCompanyId())
                .organizerId(sponsorshipRequest.getOrganizerId())
                .idempotencyKey(idempotencyKey)
                .amount(request.getAmount())
                .currency(request.getCurrency() != null ? request.getCurrency() : "INR")
                .status(PaymentStatus.CREATED)
                .description(request.getDescription())
                .build();

        payment.calculateCommission(paymentProperties.getCommissionPercent());
        payment = paymentRepository.save(payment);

        // 5. Create Razorpay order
        long amountInPaise = RazorpayGatewayService.toPaise(request.getAmount());
        JSONObject notes = new JSONObject();
        notes.put("paymentId", payment.getId());
        notes.put("requestId", request.getRequestId());
        notes.put("companyId", sponsorshipRequest.getCompanyId());

        Order razorpayOrder = razorpayGateway.createOrder(
                amountInPaise, payment.getCurrency(), payment.getId(), notes);

        // 6. Update payment with Razorpay order ID
        payment.setRazorpayOrderId(razorpayOrder.get("id"));
        payment = paymentRepository.save(payment);

        log.info("Payment order created: paymentId={}, razorpayOrderId={}, amount={}",
                payment.getId(), payment.getRazorpayOrderId(), payment.getAmount());

        // 7. Return response
        return PaymentOrderResponse.builder()
                .paymentId(payment.getId())
                .razorpayOrderId(payment.getRazorpayOrderId())
                .razorpayKeyId(razorpayGateway.getKeyId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus().name())
                .build();
    }

    // ═══════════════════════════════════════════════════
    //  Payment Verification (Frontend callback)
    // ═══════════════════════════════════════════════════

    /**
     * Verify payment after frontend checkout.
     *
     * <p>This is a SECONDARY verification — the primary source of truth
     * is the Razorpay webhook. This endpoint provides immediate feedback
     * to the user while the webhook handles the actual state transition.</p>
     */
    public PaymentDTO verifyPayment(PaymentVerificationRequest verificationRequest) {
        // Verify signature
        boolean signatureValid = razorpayGateway.verifyPaymentSignature(
                verificationRequest.getRazorpayOrderId(),
                verificationRequest.getRazorpayPaymentId(),
                verificationRequest.getRazorpaySignature()
        );

        if (!signatureValid) {
            log.error("Payment signature verification failed: orderId={}, paymentId={}",
                    verificationRequest.getRazorpayOrderId(),
                    verificationRequest.getRazorpayPaymentId());
            throw new PaymentException("Payment signature verification failed");
        }

        // Find payment by Razorpay order ID
        Payment payment = paymentRepository.findByRazorpayOrderId(verificationRequest.getRazorpayOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for order"));

        // Only process if still in CREATED state (webhook may have already processed)
        if (payment.getStatus() == PaymentStatus.CREATED) {
            payment.setRazorpayPaymentId(verificationRequest.getRazorpayPaymentId());
            payment.setRazorpaySignature(verificationRequest.getRazorpaySignature());
            payment.transitionTo(PaymentStatus.AUTHORIZED, "Signature verified", "SYSTEM", "VERIFICATION");
            payment = paymentRepository.save(payment);
        }

        return toDTO(payment);
    }

    // ═══════════════════════════════════════════════════
    //  Webhook Processing (Source of Truth)
    // ═══════════════════════════════════════════════════

    /**
     * Process Razorpay webhook event.
     *
     * <p>The webhook is the canonical source of truth for payment status.
     * This method is idempotent — processing the same event twice is a no-op.</p>
     *
     * <h3>Events handled:</h3>
     * <ul>
     *   <li>payment.captured → AUTHORIZED → CAPTURED → IN_ESCROW</li>
     *   <li>payment.failed → FAILED</li>
     *   <li>refund.created → records refund</li>
     * </ul>
     */
    public void processWebhookEvent(String eventType, JSONObject payload) {
        switch (eventType) {
            case "payment.captured" -> processPaymentCaptured(payload);
            case "payment.failed" -> processPaymentFailed(payload);
            case "refund.created" -> processRefundCreated(payload);
            default -> log.info("Ignoring unhandled webhook event: {}", eventType);
        }
    }

    private void processPaymentCaptured(JSONObject payload) {
        JSONObject paymentData = payload.getJSONObject("payload")
                .getJSONObject("payment").getJSONObject("entity");

        String razorpayPaymentId = paymentData.getString("id");
        String razorpayOrderId = paymentData.getString("order_id");

        // Idempotency — skip if already processed
        if (!idempotencyService.markWebhookProcessed("captured:" + razorpayPaymentId)) {
            log.info("Webhook already processed: payment.captured, paymentId={}", razorpayPaymentId);
            return;
        }

        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> {
                    log.error("Payment not found for webhook: orderId={}", razorpayOrderId);
                    return new ResourceNotFoundException("Payment not found for Razorpay order: " + razorpayOrderId);
                });

        // Verify amount matches (zero-trust: never trust gateway callback amount)
        long capturedAmountPaise = paymentData.getLong("amount");
        long expectedAmountPaise = RazorpayGatewayService.toPaise(payment.getAmount());
        if (capturedAmountPaise != expectedAmountPaise) {
            log.error("CRITICAL: Amount mismatch! expected={}, captured={}, paymentId={}",
                    expectedAmountPaise, capturedAmountPaise, payment.getId());
            payment.transitionTo(PaymentStatus.FAILED,
                    "Amount mismatch: expected=%d, got=%d".formatted(expectedAmountPaise, capturedAmountPaise),
                    "WEBHOOK", "WEBHOOK");
            paymentRepository.save(payment);
            return;
        }

        // Transition through states: CREATED/AUTHORIZED → CAPTURED → IN_ESCROW
        try {
            payment.setRazorpayPaymentId(razorpayPaymentId);
            payment.setPaymentMethod(paymentData.optString("method", "unknown"));

            if (payment.getStatus() == PaymentStatus.CREATED) {
                payment.transitionTo(PaymentStatus.AUTHORIZED, "Payment captured via webhook", "WEBHOOK", "WEBHOOK");
            }
            if (payment.getStatus() == PaymentStatus.AUTHORIZED) {
                payment.transitionTo(PaymentStatus.CAPTURED, "Funds captured by Razorpay", "WEBHOOK", "WEBHOOK");
            }

            // Move to escrow
            payment.getEscrowDetails().setHoldDays(paymentProperties.getEscrowHoldDays());
            payment.transitionTo(PaymentStatus.IN_ESCROW, "Funds placed in escrow", "SYSTEM", "WEBHOOK");
            payment = paymentRepository.save(payment);

            // Create audit trail
            createTransaction(payment, TransactionType.CAPTURE, payment.getAmount(),
                    "Payment captured", razorpayPaymentId);
            createTransaction(payment, TransactionType.ESCROW_HOLD, payment.getAmount(),
                    "Funds placed in escrow for " + paymentProperties.getEscrowHoldDays() + " days", null);
            createTransaction(payment, TransactionType.COMMISSION_DEDUCTION, payment.getPlatformCommission(),
                    "Platform commission at " + payment.getCommissionRate().multiply(BigDecimal.valueOf(100)) + "%",
                    null);

            log.info("Payment captured and placed in escrow: paymentId={}, amount={}, commission={}",
                    payment.getId(), payment.getAmount(), payment.getPlatformCommission());

        } catch (IllegalStateException e) {
            log.warn("Invalid state transition during webhook: paymentId={}, currentStatus={}, error={}",
                    payment.getId(), payment.getStatus(), e.getMessage());
        } catch (OptimisticLockingFailureException e) {
            log.warn("Concurrent modification during webhook processing: paymentId={}", payment.getId());
        }
    }

    private void processPaymentFailed(JSONObject payload) {
        JSONObject paymentData = payload.getJSONObject("payload")
                .getJSONObject("payment").getJSONObject("entity");

        String razorpayOrderId = paymentData.getString("order_id");
        String razorpayPaymentId = paymentData.getString("id");
        String errorDescription = paymentData.has("error_description")
                ? paymentData.getString("error_description") : "Payment failed";

        if (!idempotencyService.markWebhookProcessed("failed:" + razorpayPaymentId)) {
            return;
        }

        paymentRepository.findByRazorpayOrderId(razorpayOrderId).ifPresent(payment -> {
            try {
                payment.setRazorpayPaymentId(razorpayPaymentId);
                payment.transitionTo(PaymentStatus.FAILED, errorDescription, "WEBHOOK", "WEBHOOK");
                paymentRepository.save(payment);
                log.info("Payment marked failed: paymentId={}, reason={}", payment.getId(), errorDescription);
            } catch (IllegalStateException e) {
                log.warn("Cannot transition to FAILED: paymentId={}, currentStatus={}",
                        payment.getId(), payment.getStatus());
            }
        });
    }

    private void processRefundCreated(JSONObject payload) {
        JSONObject refundData = payload.getJSONObject("payload")
                .getJSONObject("refund").getJSONObject("entity");

        String razorpayPaymentId = refundData.getString("payment_id");
        String refundId = refundData.getString("id");
        long refundAmountPaise = refundData.getLong("amount");

        if (!idempotencyService.markWebhookProcessed("refund:" + refundId)) {
            return;
        }

        paymentRepository.findByRazorpayPaymentId(razorpayPaymentId).ifPresent(payment -> {
            BigDecimal refundAmount = RazorpayGatewayService.fromPaise(refundAmountPaise);
            payment.addRefundAmount(refundAmount);
            payment.getRazorpayRefundIds().add(refundId);

            if (payment.isFullyRefunded()) {
                payment.transitionTo(PaymentStatus.REFUNDED, "Full refund processed", "WEBHOOK", "WEBHOOK");
            } else {
                try {
                    payment.transitionTo(PaymentStatus.PARTIALLY_REFUNDED,
                            "Partial refund: " + refundAmount, "WEBHOOK", "WEBHOOK");
                } catch (IllegalStateException ignored) {
                    // Already in PARTIALLY_REFUNDED — that's fine
                }
            }
            paymentRepository.save(payment);

            createTransaction(payment,
                    payment.isFullyRefunded() ? TransactionType.REFUND : TransactionType.PARTIAL_REFUND,
                    refundAmount, "Refund processed via Razorpay", refundId);

            log.info("Refund recorded: paymentId={}, refundId={}, amount={}",
                    payment.getId(), refundId, refundAmount);
        });
    }

    // ═══════════════════════════════════════════════════
    //  Queries
    // ═══════════════════════════════════════════════════

    public PaymentDTO getPaymentById(String paymentId) {
        return toDTO(paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found")));
    }

    public Page<PaymentDTO> getPaymentsByCompany(String companyId, Pageable pageable) {
        return paymentRepository.findByCompanyIdOrderByCreatedAtDesc(companyId, pageable)
                .map(this::toDTO);
    }

    public Page<PaymentDTO> getPaymentsByOrganizer(String organizerId, Pageable pageable) {
        return paymentRepository.findByOrganizerIdOrderByCreatedAtDesc(organizerId, pageable)
                .map(this::toDTO);
    }

    // ═══════════════════════════════════════════════════
    //  Helpers
    // ═══════════════════════════════════════════════════

    private void createTransaction(com.eventra.entity.Payment payment, TransactionType type,
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

    private PaymentDTO toDTO(com.eventra.entity.Payment payment) {
        var builder = PaymentDTO.builder()
                .id(payment.getId())
                .requestId(payment.getRequestId())
                .companyId(payment.getCompanyId())
                .organizerId(payment.getOrganizerId())
                .amount(payment.getAmount())
                .platformCommission(payment.getPlatformCommission())
                .organizerPayout(payment.getOrganizerPayout())
                .refundedAmount(payment.getRefundedAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .razorpayOrderId(payment.getRazorpayOrderId())
                .description(payment.getDescription())
                .paymentMethod(payment.getPaymentMethod())
                .capturedAt(payment.getCapturedAt())
                .releasedAt(payment.getReleasedAt())
                .settledAt(payment.getSettledAt())
                .createdAt(payment.getCreatedAt());

        if (payment.getEscrowDetails() != null) {
            builder.escrowStartedAt(payment.getEscrowDetails().getEscrowStartedAt())
                    .releaseEligibleAt(payment.getEscrowDetails().getReleaseEligibleAt())
                    .escrowHoldDays(payment.getEscrowDetails().getHoldDays());
        }

        return builder.build();
    }
}
