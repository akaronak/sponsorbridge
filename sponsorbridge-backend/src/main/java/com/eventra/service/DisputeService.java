package com.eventra.service;

import com.eventra.config.PaymentProperties;
import com.eventra.dto.DisputeDTO;
import com.eventra.dto.DisputeRequest;
import com.eventra.dto.RefundRequest;
import com.eventra.entity.*;
import com.eventra.entity.Dispute.DisputeStatus;
import com.eventra.entity.Dispute.DisputeRaisedByRole;
import com.eventra.entity.Dispute.Evidence;
import com.eventra.exception.BadRequestException;
import com.eventra.exception.PaymentException;
import com.eventra.exception.ResourceNotFoundException;
import com.eventra.repository.DisputeRepository;
import com.eventra.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Dispute lifecycle management.
 *
 * <h3>Flow:</h3>
 * <pre>
 *   OPEN → UNDER_REVIEW → RESOLVED_COMPANY_FAVOR | RESOLVED_ORGANIZER_FAVOR
 *   OPEN → AUTO_RESOLVED (after configurable timeout)
 *   OPEN → CANCELLED (by submitter)
 * </pre>
 *
 * <h3>Side effects on Payment:</h3>
 * <ul>
 *   <li>Opening dispute: Payment IN_ESCROW → DISPUTE_OPEN (freezes funds)</li>
 *   <li>Company wins: Payment DISPUTE_OPEN → DISPUTE_LOST → REFUNDED</li>
 *   <li>Organizer wins: Payment DISPUTE_OPEN → DISPUTE_WON → RELEASED</li>
 *   <li>Auto-resolved: Organizer favor (default) → RELEASED</li>
 * </ul>
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class DisputeService {

    private final DisputeRepository disputeRepository;
    private final PaymentRepository paymentRepository;
    private final EscrowService escrowService;
    private final RefundService refundService;
    private final PaymentProperties paymentProperties;

    /**
     * Raise a dispute on a payment.
     * Freezes escrow release until resolution.
     */
    public DisputeDTO raiseDispute(DisputeRequest request, String raisedBy, String raisedByRole) {
        // Validate payment exists and is disputable
        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        if (payment.getStatus() != PaymentStatus.IN_ESCROW) {
            throw new PaymentException("Disputes can only be raised on payments in escrow",
                    payment.getId(), "INVALID_STATE");
        }

        // Check for existing dispute
        if (disputeRepository.findByPaymentId(request.getPaymentId()).isPresent()) {
            throw new BadRequestException("A dispute already exists for this payment");
        }

        // Transition payment to DISPUTE_OPEN
        payment.transitionTo(PaymentStatus.DISPUTE_OPEN, "Dispute raised: " + request.getReason(), raisedBy, "USER");
        paymentRepository.save(payment);

        // Create dispute
        DisputeRaisedByRole role = DisputeRaisedByRole.valueOf(raisedByRole.toUpperCase());

        List<Evidence> evidenceList = List.of();
        if (request.getEvidence() != null) {
            evidenceList = request.getEvidence().stream()
                    .map(e -> Evidence.builder()
                            .submittedBy(raisedBy)
                            .submittedByRole(role.name())
                            .description(e.getDescription())
                            .attachmentUrl(e.getAttachmentUrl())
                            .submittedAt(LocalDateTime.now())
                            .build())
                    .collect(Collectors.toList());
        }

        Dispute dispute = Dispute.builder()
                .paymentId(request.getPaymentId())
                .requestId(payment.getRequestId())
                .companyId(payment.getCompanyId())
                .organizerId(payment.getOrganizerId())
                .raisedBy(raisedBy)
                .raisedByRole(role)
                .reason(request.getReason())
                .category(request.getCategory())
                .disputedAmount(request.getDisputedAmount() != null
                        ? request.getDisputedAmount() : payment.getAmount())
                .evidence(evidenceList)
                .autoResolveAt(LocalDateTime.now().plusDays(paymentProperties.getDisputeAutoResolveDays()))
                .build();

        dispute = disputeRepository.save(dispute);

        log.info("Dispute raised: disputeId={}, paymentId={}, by={}", dispute.getId(), payment.getId(), raisedBy);
        return toDTO(dispute);
    }

    /**
     * Resolve dispute in favor of company (refund).
     * Triggers an actual Razorpay refund so the company's money is returned.
     */
    public DisputeDTO resolveForCompany(String disputeId, String resolvedBy, String notes) {
        Dispute dispute = getDisputeById(disputeId);
        validateOpenOrUnderReview(dispute);

        dispute.setStatus(DisputeStatus.RESOLVED_COMPANY_FAVOR);
        dispute.setResolvedBy(resolvedBy);
        dispute.setResolvedAt(LocalDateTime.now());
        dispute.setResolutionNotes(notes);
        disputeRepository.save(dispute);

        // Transition payment: DISPUTE_OPEN → DISPUTE_LOST
        Payment payment = paymentRepository.findById(dispute.getPaymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        payment.transitionTo(PaymentStatus.DISPUTE_LOST, "Dispute resolved in company's favor", resolvedBy, "SYSTEM");
        paymentRepository.save(payment);

        // Trigger actual Razorpay refund so the company receives their money back
        try {
            RefundRequest refundRequest = RefundRequest.builder()
                    .paymentId(payment.getId())
                    .amount(dispute.getDisputedAmount())
                    .reason("Dispute resolved in company's favor: " + (notes != null ? notes : dispute.getReason()))
                    .partial(dispute.getDisputedAmount().compareTo(payment.getAmount()) < 0)
                    .build();
            refundService.initiateRefund(refundRequest, resolvedBy);
        } catch (Exception e) {
            log.error("Failed to initiate Razorpay refund after dispute resolution: disputeId={}, paymentId={}, error={}",
                    disputeId, payment.getId(), e.getMessage(), e);
            // Payment is already marked DISPUTE_LOST — refund can be manually retried by admin
        }

        log.info("Dispute resolved for company: disputeId={}, paymentId={}", disputeId, dispute.getPaymentId());
        return toDTO(dispute);
    }

    /**
     * Resolve dispute in favor of organizer (release escrow).
     */
    public DisputeDTO resolveForOrganizer(String disputeId, String resolvedBy, String notes) {
        Dispute dispute = getDisputeById(disputeId);
        validateOpenOrUnderReview(dispute);

        dispute.setStatus(DisputeStatus.RESOLVED_ORGANIZER_FAVOR);
        dispute.setResolvedBy(resolvedBy);
        dispute.setResolvedAt(LocalDateTime.now());
        dispute.setResolutionNotes(notes);
        disputeRepository.save(dispute);

        // Transition payment: DISPUTE_OPEN → DISPUTE_WON, then release from escrow
        Payment payment = paymentRepository.findById(dispute.getPaymentId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        payment.transitionTo(PaymentStatus.DISPUTE_WON, "Dispute resolved in organizer's favor", resolvedBy, "SYSTEM");
        // DISPUTE_WON → RELEASED (escrow release)
        payment.transitionTo(PaymentStatus.RELEASED, "Escrow released after dispute won", resolvedBy, "SYSTEM");
        paymentRepository.save(payment);

        log.info("Dispute resolved for organizer: disputeId={}, paymentId={}", disputeId, dispute.getPaymentId());
        return toDTO(dispute);
    }

    /**
     * Move dispute to under review.
     */
    public DisputeDTO markUnderReview(String disputeId, String reviewedBy) {
        Dispute dispute = getDisputeById(disputeId);
        if (dispute.getStatus() != DisputeStatus.OPEN) {
            throw new BadRequestException("Only OPEN disputes can be moved to UNDER_REVIEW");
        }
        dispute.setStatus(DisputeStatus.UNDER_REVIEW);
        dispute = disputeRepository.save(dispute);
        log.info("Dispute marked under review: disputeId={}", disputeId);
        return toDTO(dispute);
    }

    /**
     * Add evidence to a dispute.
     */
    public DisputeDTO addEvidence(String disputeId, String submittedBy, String role,
                                  String description, String attachmentUrl) {
        Dispute dispute = getDisputeById(disputeId);
        validateOpenOrUnderReview(dispute);

        Evidence evidence = Evidence.builder()
                .submittedBy(submittedBy)
                .submittedByRole(role)
                .description(description)
                .attachmentUrl(attachmentUrl)
                .submittedAt(LocalDateTime.now())
                .build();

        dispute.getEvidence().add(evidence);
        dispute = disputeRepository.save(dispute);

        log.info("Evidence added to dispute: disputeId={}, by={}", disputeId, submittedBy);
        return toDTO(dispute);
    }

    /**
     * Auto-resolve expired disputes (organizer-favored by default).
     * Called by scheduled job.
     */
    public int autoResolveExpiredDisputes() {
        List<Dispute> expired = disputeRepository.findExpiredOpenDisputes(LocalDateTime.now());
        if (expired.isEmpty()) return 0;

        log.info("Found {} expired disputes for auto-resolution", expired.size());
        int resolved = 0;

        for (Dispute dispute : expired) {
            try {
                dispute.setStatus(DisputeStatus.AUTO_RESOLVED);
                dispute.setResolvedAt(LocalDateTime.now());
                dispute.setResolutionNotes("Auto-resolved after " + paymentProperties.getDisputeAutoResolveDays()
                        + " days — organizer favored");
                disputeRepository.save(dispute);

                // Release escrow (organizer wins by default)
                Payment payment = paymentRepository.findById(dispute.getPaymentId()).orElse(null);
                if (payment != null && payment.getStatus() == PaymentStatus.DISPUTE_OPEN) {
                    payment.transitionTo(PaymentStatus.DISPUTE_WON, "Auto-resolved in organizer's favor",
                            "SCHEDULER", "SCHEDULER");
                    payment.transitionTo(PaymentStatus.RELEASED, "Escrow released after auto-resolution",
                            "SCHEDULER", "SCHEDULER");
                    paymentRepository.save(payment);
                }

                resolved++;
            } catch (Exception e) {
                log.error("Auto-resolve failed for disputeId={}: {}", dispute.getId(), e.getMessage());
            }
        }

        log.info("Auto-resolution completed: {}/{} resolved", resolved, expired.size());
        return resolved;
    }

    // ── Queries ──

    public DisputeDTO getDispute(String disputeId) {
        return toDTO(getDisputeById(disputeId));
    }

    public DisputeDTO getDisputeByPaymentId(String paymentId) {
        return toDTO(disputeRepository.findByPaymentId(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("No dispute found for payment")));
    }

    public Page<DisputeDTO> getDisputesByStatus(DisputeStatus status, Pageable pageable) {
        return disputeRepository.findByStatusOrderByCreatedAtDesc(status, pageable).map(this::toDTO);
    }

    public List<DisputeDTO> getDisputesByCompany(String companyId) {
        return disputeRepository.findByCompanyIdOrderByCreatedAtDesc(companyId)
                .stream().map(this::toDTO).toList();
    }

    // ── Helpers ──

    private Dispute getDisputeById(String disputeId) {
        return disputeRepository.findById(disputeId)
                .orElseThrow(() -> new ResourceNotFoundException("Dispute not found"));
    }

    private void validateOpenOrUnderReview(Dispute dispute) {
        if (dispute.getStatus() != DisputeStatus.OPEN && dispute.getStatus() != DisputeStatus.UNDER_REVIEW) {
            throw new BadRequestException("Dispute is already resolved: " + dispute.getStatus());
        }
    }

    private DisputeDTO toDTO(Dispute dispute) {
        List<DisputeDTO.EvidenceDTO> evidenceDTOs = dispute.getEvidence().stream()
                .map(e -> DisputeDTO.EvidenceDTO.builder()
                        .submittedBy(e.getSubmittedBy())
                        .submittedByRole(e.getSubmittedByRole())
                        .description(e.getDescription())
                        .attachmentUrl(e.getAttachmentUrl())
                        .submittedAt(e.getSubmittedAt())
                        .build())
                .toList();

        return DisputeDTO.builder()
                .id(dispute.getId())
                .paymentId(dispute.getPaymentId())
                .companyId(dispute.getCompanyId())
                .organizerId(dispute.getOrganizerId())
                .raisedBy(dispute.getRaisedBy())
                .raisedByRole(dispute.getRaisedByRole().name())
                .reason(dispute.getReason())
                .category(dispute.getCategory())
                .disputedAmount(dispute.getDisputedAmount())
                .status(dispute.getStatus().name())
                .evidence(evidenceDTOs)
                .resolutionNotes(dispute.getResolutionNotes())
                .resolvedBy(dispute.getResolvedBy())
                .resolvedAt(dispute.getResolvedAt())
                .autoResolveAt(dispute.getAutoResolveAt())
                .createdAt(dispute.getCreatedAt())
                .build();
    }
}
