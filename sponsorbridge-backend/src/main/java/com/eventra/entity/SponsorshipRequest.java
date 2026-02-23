package com.eventra.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "sponsorship_requests", indexes = {
    @Index(name = "idx_requests_organizer", columnList = "organizer_id"),
    @Index(name = "idx_requests_company", columnList = "company_id"),
    @Index(name = "idx_requests_status", columnList = "status"),
    @Index(name = "idx_requests_created_at", columnList = "created_at DESC")
})
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SponsorshipRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "organizer_id", nullable = false)
    @NotNull(message = "Organizer cannot be null")
    private Organizer organizer;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    @NotNull(message = "Company cannot be null")
    private Company company;

    @Column(name = "event_summary", nullable = false, columnDefinition = "TEXT")
    @NotBlank(message = "Event summary cannot be blank")
    private String eventSummary;

    @Column(name = "expected_audience_size", nullable = false)
    @NotNull(message = "Expected audience size cannot be null")
    @Positive(message = "Expected audience size must be positive")
    private Integer expectedAudienceSize;

    @Column(nullable = false, columnDefinition = "TEXT")
    @NotBlank(message = "Offering cannot be blank")
    private String offering;

    @Column(name = "sponsorship_ask", nullable = false, columnDefinition = "TEXT")
    @NotBlank(message = "Sponsorship ask cannot be blank")
    private String sponsorshipAsk;

    @Column(name = "proposal_url")
    private String proposalUrl;

    @Column(name = "preferred_communication_mode")
    private String preferredCommunicationMode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RequestStatus status = RequestStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> messages;

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
