package com.eventra.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "companies")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {

    @Id
    private String id;

    @Indexed(unique = true)
    @NotNull
    private String userId;

    @NotBlank(message = "Company name cannot be blank")
    private String companyName;

    @Indexed
    @NotBlank(message = "Industry cannot be blank")
    private String industry;

    @Indexed
    @NotBlank(message = "Location cannot be blank")
    private String location;

    private String website;

    private String contactPerson;

    private String[] sponsorshipTypes;

    private BigDecimal budgetMin;

    private BigDecimal budgetMax;

    private String[] preferredEventTypes;

    private String companySize;

    private String[] pastSponsorships;

    @Indexed
    @Builder.Default
    private Boolean verified = false;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
