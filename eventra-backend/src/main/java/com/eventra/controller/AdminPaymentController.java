package com.eventra.controller;

import com.eventra.dto.DisputeDTO;
import com.eventra.dto.DisputeRequest;
import com.eventra.dto.PaymentDTO;
import com.eventra.dto.RevenueStatsDTO;
import com.eventra.entity.Dispute.DisputeStatus;
import com.eventra.entity.Transaction;
import com.eventra.service.DisputeService;
import com.eventra.service.EscrowService;
import com.eventra.service.PaymentService;
import com.eventra.service.TransactionAuditService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Admin endpoints for payment management, dispute resolution, and analytics.
 *
 * <h3>Access:</h3>
 * Restricted to ADMIN role via SecurityConfig.
 */
@RestController
@RequestMapping("/api/admin/payments")
@Slf4j
@RequiredArgsConstructor
public class AdminPaymentController {

    private final PaymentService paymentService;
    private final EscrowService escrowService;
    private final DisputeService disputeService;
    private final TransactionAuditService auditService;

    // ═══════════════════════════════════════════════════
    //  Revenue & Analytics
    // ═══════════════════════════════════════════════════

    /**
     * Get platform revenue statistics for a date range.
     */
    @GetMapping("/stats")
    public ResponseEntity<RevenueStatsDTO> getRevenueStats(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return ResponseEntity.ok(auditService.getRevenueStats(from, to));
    }

    /**
     * Get transaction audit trail for a payment.
     */
    @GetMapping("/{paymentId}/transactions")
    public ResponseEntity<Page<Transaction>> getTransactionHistory(
            @PathVariable String paymentId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(auditService.getTransactionsByPayment(paymentId, PageRequest.of(page, size)));
    }

    // ═══════════════════════════════════════════════════
    //  Escrow Management
    // ═══════════════════════════════════════════════════

    /**
     * Manually release a payment from escrow (admin override).
     */
    @PostMapping("/{paymentId}/release")
    public ResponseEntity<PaymentDTO> releaseEscrow(
            @PathVariable String paymentId,
            Authentication authentication) {
        escrowService.releaseFromEscrow(paymentId, authentication.getName());
        return ResponseEntity.ok(paymentService.getPaymentById(paymentId));
    }

    /**
     * Manually settle a released payment.
     */
    @PostMapping("/{paymentId}/settle")
    public ResponseEntity<PaymentDTO> settlePayment(
            @PathVariable String paymentId,
            @RequestParam(required = false) String batchId,
            Authentication authentication) {
        escrowService.settlePayment(paymentId, batchId);
        return ResponseEntity.ok(paymentService.getPaymentById(paymentId));
    }

    // ═══════════════════════════════════════════════════
    //  Dispute Management
    // ═══════════════════════════════════════════════════

    /**
     * Raise a dispute on behalf of a participant.
     */
    @PostMapping("/disputes")
    public ResponseEntity<DisputeDTO> raiseDispute(
            @Valid @RequestBody DisputeRequest request,
            @RequestParam String raisedByRole,
            Authentication authentication) {
        DisputeDTO dto = disputeService.raiseDispute(request, authentication.getName(), raisedByRole);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    /**
     * Get all disputes by status.
     */
    @GetMapping("/disputes")
    public ResponseEntity<Page<DisputeDTO>> getDisputes(
            @RequestParam DisputeStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(disputeService.getDisputesByStatus(status, PageRequest.of(page, size)));
    }

    /**
     * Get dispute details.
     */
    @GetMapping("/disputes/{disputeId}")
    public ResponseEntity<DisputeDTO> getDispute(@PathVariable String disputeId) {
        return ResponseEntity.ok(disputeService.getDispute(disputeId));
    }

    /**
     * Get dispute by payment ID.
     */
    @GetMapping("/{paymentId}/dispute")
    public ResponseEntity<DisputeDTO> getDisputeByPayment(@PathVariable String paymentId) {
        return ResponseEntity.ok(disputeService.getDisputeByPaymentId(paymentId));
    }

    /**
     * Mark dispute as under review.
     */
    @PutMapping("/disputes/{disputeId}/review")
    public ResponseEntity<DisputeDTO> markUnderReview(
            @PathVariable String disputeId,
            Authentication authentication) {
        return ResponseEntity.ok(disputeService.markUnderReview(disputeId, authentication.getName()));
    }

    /**
     * Resolve dispute in favor of company (triggers refund).
     */
    @PostMapping("/disputes/{disputeId}/resolve/company")
    public ResponseEntity<DisputeDTO> resolveForCompany(
            @PathVariable String disputeId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String notes = body.getOrDefault("notes", "");
        return ResponseEntity.ok(
                disputeService.resolveForCompany(disputeId, authentication.getName(), notes));
    }

    /**
     * Resolve dispute in favor of organizer (releases escrow).
     */
    @PostMapping("/disputes/{disputeId}/resolve/organizer")
    public ResponseEntity<DisputeDTO> resolveForOrganizer(
            @PathVariable String disputeId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String notes = body.getOrDefault("notes", "");
        return ResponseEntity.ok(
                disputeService.resolveForOrganizer(disputeId, authentication.getName(), notes));
    }

    /**
     * Add evidence to a dispute.
     */
    @PostMapping("/disputes/{disputeId}/evidence")
    public ResponseEntity<DisputeDTO> addEvidence(
            @PathVariable String disputeId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        return ResponseEntity.ok(disputeService.addEvidence(
                disputeId,
                authentication.getName(),
                body.getOrDefault("role", "ADMIN"),
                body.getOrDefault("description", ""),
                body.get("attachmentUrl")));
    }
}
