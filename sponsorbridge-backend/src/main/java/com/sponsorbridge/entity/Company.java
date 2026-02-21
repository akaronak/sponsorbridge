package com.sponsorbridge.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "companies", indexes = {
    @Index(name = "idx_companies_location", columnList = "location"),
    @Index(name = "idx_companies_industry", columnList = "industry"),
    @Index(name = "idx_companies_verified", columnList = "verified")
})
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(name = "company_name", nullable = false)
    @NotBlank(message = "Company name cannot be blank")
    private String companyName;

    @Column(nullable = false)
    @NotBlank(message = "Industry cannot be blank")
    private String industry;

    @Column(nullable = false)
    @NotBlank(message = "Location cannot be blank")
    private String location;

    @Column(nullable = false)
    @NotBlank(message = "Website cannot be blank")
    private String website;

    @Column(name = "contact_person", nullable = false)
    @NotBlank(message = "Contact person cannot be blank")
    private String contactPerson;

    @Column(name = "sponsorship_types", nullable = false, columnDefinition = "text[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    @NotNull(message = "Sponsorship types cannot be null")
    private String[] sponsorshipTypes;

    @Column(name = "budget_min")
    private BigDecimal budgetMin;

    @Column(name = "budget_max")
    private BigDecimal budgetMax;

    @Column(name = "preferred_event_types", columnDefinition = "text[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private String[] preferredEventTypes;

    @Column(name = "company_size")
    private String companySize;

    @Column(name = "past_sponsorships", columnDefinition = "text[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private String[] pastSponsorships;

    @Column(nullable = false)
    @Builder.Default
    private Boolean verified = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SponsorshipRequest> requests;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
