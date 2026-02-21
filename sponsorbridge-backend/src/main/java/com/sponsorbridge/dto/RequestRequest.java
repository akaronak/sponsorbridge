package com.sponsorbridge.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestRequest {
    @NotNull(message = "Company ID cannot be null")
    @Positive(message = "Company ID must be positive")
    private Long companyId;

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
}
