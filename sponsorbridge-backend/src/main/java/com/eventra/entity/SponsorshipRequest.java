package com.eventra.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "sponsorship_requests")
@CompoundIndexes({
    @CompoundIndex(name = "idx_req_organizer_created", def = "{'organizerId': 1, 'createdAt': -1}"),
    @CompoundIndex(name = "idx_req_company_created", def = "{'companyId': 1, 'createdAt': -1}"),
    @CompoundIndex(name = "idx_req_duplicate_check", def = "{'organizerId': 1, 'companyId': 1, 'createdAt': -1}")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SponsorshipRequest {

    @Id
    private String id;

    @Indexed
    @NotNull
    private String organizerId;

    @Indexed
    @NotNull
    private String companyId;

    @NotBlank(message = "Event summary cannot be blank")
    private String eventSummary;

    @NotNull(message = "Expected audience size cannot be null")
    @Positive(message = "Expected audience size must be positive")
    private Integer expectedAudienceSize;

    @NotBlank(message = "Offering cannot be blank")
    private String offering;

    @NotBlank(message = "Sponsorship ask cannot be blank")
    private String sponsorshipAsk;

    private String proposalUrl;

    private String preferredCommunicationMode;

    @Indexed
    @Builder.Default
    private RequestStatus status = RequestStatus.PENDING;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
