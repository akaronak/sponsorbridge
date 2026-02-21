package com.sponsorbridge.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyRequest {
    @NotBlank(message = "Company name cannot be blank")
    private String companyName;

    @NotBlank(message = "Industry cannot be blank")
    private String industry;

    @NotBlank(message = "Location cannot be blank")
    private String location;

    @NotBlank(message = "Website cannot be blank")
    @Pattern(regexp = "^(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})([/\\w .-]*)*/?$", 
             message = "Website must be a valid URL")
    private String website;

    @NotBlank(message = "Contact person cannot be blank")
    private String contactPerson;

    @NotNull(message = "Sponsorship types cannot be null")
    @Size(min = 1, message = "At least one sponsorship type must be selected")
    private String[] sponsorshipTypes;

    @DecimalMin(value = "0", inclusive = true, message = "Budget minimum must be non-negative")
    private BigDecimal budgetMin;

    @DecimalMin(value = "0", inclusive = true, message = "Budget maximum must be non-negative")
    private BigDecimal budgetMax;

    private String[] preferredEventTypes;

    private String companySize;

    private String[] pastSponsorships;
}
