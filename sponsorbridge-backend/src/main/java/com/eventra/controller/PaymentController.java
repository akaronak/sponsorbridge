package com.eventra.controller;

import com.eventra.dto.*;
import com.eventra.service.PaymentService;
import com.eventra.service.RefundService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Payment REST controller for marketplace participants.
 *
 * <h3>Endpoints:</h3>
 * <ul>
 *   <li>POST /api/payments/order — Create Razorpay order</li>
 *   <li>POST /api/payments/verify — Verify payment (frontend callback)</li>
 *   <li>POST /api/payments/refund — Initiate refund</li>
 *   <li>GET /api/payments/{id} — Get payment details</li>
 *   <li>GET /api/payments/company/{companyId} — Company payment history</li>
 *   <li>GET /api/payments/organizer/{organizerId} — Organizer payment history</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/payments")
@Slf4j
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final RefundService refundService;

    /**
     * Create a Razorpay order for a sponsorship payment.
     * Returns order details needed for the Razorpay checkout widget.
     */
    @PostMapping("/order")
    public ResponseEntity<PaymentOrderResponse> createOrder(
            @Valid @RequestBody CreatePaymentOrderRequest request,
            Authentication authentication) {

        String userId = authentication.getName();
        PaymentOrderResponse response = paymentService.createOrder(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Verify payment after frontend checkout.
     * This is a secondary verification — webhooks are the primary source of truth.
     */
    @PostMapping("/verify")
    public ResponseEntity<PaymentDTO> verifyPayment(
            @Valid @RequestBody PaymentVerificationRequest request) {

        PaymentDTO dto = paymentService.verifyPayment(request);
        return ResponseEntity.ok(dto);
    }

    /**
     * Initiate a refund (full or partial).
     */
    @PostMapping("/refund")
    public ResponseEntity<PaymentDTO> initiateRefund(
            @Valid @RequestBody RefundRequest request,
            Authentication authentication) {

        String userId = authentication.getName();
        var payment = refundService.initiateRefund(request, userId);

        PaymentDTO dto = paymentService.getPaymentById(payment.getId());
        return ResponseEntity.ok(dto);
    }

    /**
     * Get payment details by ID.
     */
    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentDTO> getPayment(@PathVariable String paymentId) {
        return ResponseEntity.ok(paymentService.getPaymentById(paymentId));
    }

    /**
     * Get payment history for a company.
     */
    @GetMapping("/company/{companyId}")
    public ResponseEntity<Page<PaymentDTO>> getCompanyPayments(
            @PathVariable String companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(paymentService.getPaymentsByCompany(companyId, PageRequest.of(page, size)));
    }

    /**
     * Get payment history for an organizer.
     */
    @GetMapping("/organizer/{organizerId}")
    public ResponseEntity<Page<PaymentDTO>> getOrganizerPayments(
            @PathVariable String organizerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(paymentService.getPaymentsByOrganizer(organizerId, PageRequest.of(page, size)));
    }
}
