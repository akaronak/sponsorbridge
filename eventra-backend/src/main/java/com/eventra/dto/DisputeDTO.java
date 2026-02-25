package com.eventra.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisputeDTO {
    private String id;
    private String paymentId;
    private String requestId;
    private String raisedBy;
    private String raisedByRole;
    private String companyId;
    private String organizerId;
    private String status;
    private String reason;
    private String category;
    private BigDecimal disputedAmount;
    private String resolutionNotes;
    private String resolvedBy;
    private LocalDateTime resolvedAt;
    private LocalDateTime autoResolveAt;
    private List<EvidenceDTO> evidence;
    private LocalDateTime createdAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EvidenceDTO {
        private String submittedBy;
        private String submittedByRole;
        private String description;
        private String attachmentUrl;
        private LocalDateTime submittedAt;
    }
}
