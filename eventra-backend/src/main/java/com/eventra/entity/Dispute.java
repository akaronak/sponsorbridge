package com.eventra.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Version;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Dispute between company and organizer over a payment.
 *
 * <p>A dispute blocks escrow auto-release. Resolution triggers
 * either RELEASED (organizer wins) or REFUNDED (company wins).</p>
 *
 * <h3>Schema design:</h3>
 * <ul>
 *   <li>Separate collection — disputes have different lifecycle than payments</li>
 *   <li>Embedded: evidence entries — bounded list, always read with dispute</li>
 *   <li>References paymentId — 1:1 relationship enforced by unique index</li>
 * </ul>
 */
@Document(collection = "disputes")
@CompoundIndexes({
    @CompoundIndex(name = "idx_dispute_status_created", def = "{'status': 1, 'createdAt': -1}"),
    @CompoundIndex(name = "idx_dispute_payment", def = "{'paymentId': 1}", unique = true)
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Dispute {

    @Id
    private String id;

    @Version
    private Long version;

    @Indexed(unique = true)
    @NotNull
    private String paymentId;

    @Indexed
    @NotNull
    private String requestId;

    @Indexed
    @NotNull
    private String raisedBy;

    @NotNull
    private DisputeRaisedByRole raisedByRole;

    @NotNull
    private String companyId;

    @NotNull
    private String organizerId;

    @Indexed
    @Builder.Default
    private DisputeStatus status = DisputeStatus.OPEN;

    @NotBlank
    private String reason;

    private String category;

    private BigDecimal disputedAmount;

    /** Admin resolution notes */
    private String resolutionNotes;

    private String resolvedBy;

    private LocalDateTime resolvedAt;

    /** Auto-close deadline — if not resolved, system auto-resolves in organizer's favor */
    private LocalDateTime autoResolveAt;

    /** Evidence submitted by participants */
    @Builder.Default
    private List<Evidence> evidence = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // ─── Embedded value objects ─────────────────────

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Evidence {
        private String submittedBy;
        private String submittedByRole;
        private String description;
        private String attachmentUrl;
        private LocalDateTime submittedAt;
    }

    // ─── Enums ──────────────────────────────────────

    public enum DisputeStatus {
        OPEN,
        UNDER_REVIEW,
        RESOLVED_COMPANY_FAVOR,
        RESOLVED_ORGANIZER_FAVOR,
        AUTO_RESOLVED,
        CANCELLED;

        public boolean isResolved() {
            return this == RESOLVED_COMPANY_FAVOR || this == RESOLVED_ORGANIZER_FAVOR || this == AUTO_RESOLVED;
        }
    }

    public enum DisputeRaisedByRole {
        COMPANY,
        ORGANIZER
    }
}
