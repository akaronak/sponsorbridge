package com.eventra.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Request to raise a dispute.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisputeRequest {

    @NotBlank(message = "Payment ID is required")
    private String paymentId;

    @NotBlank(message = "Reason is required")
    private String reason;

    private String category;

    private BigDecimal disputedAmount;

    /** Optional initial evidence */
    private List<EvidenceEntry> evidence;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EvidenceEntry {
        private String description;
        private String attachmentUrl;
    }
}
