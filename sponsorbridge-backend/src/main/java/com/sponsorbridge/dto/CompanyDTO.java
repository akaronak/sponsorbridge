package com.sponsorbridge.dto;

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
public class CompanyDTO {
    private Long id;
    private String companyName;
    private String industry;
    private String location;
    private String website;
    private String contactPerson;
    private String[] sponsorshipTypes;
    private BigDecimal budgetMin;
    private BigDecimal budgetMax;
    private String[] preferredEventTypes;
    private String companySize;
    private String[] pastSponsorships;
    private Boolean verified;
}
