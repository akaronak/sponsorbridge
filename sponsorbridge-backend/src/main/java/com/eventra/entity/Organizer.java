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
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "organizers", indexes = {
    @Index(name = "idx_organizers_verified", columnList = "verified")
})
@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Organizer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    @Column(name = "organizer_name", nullable = false)
    @NotBlank(message = "Organizer name cannot be blank")
    private String organizerName;

    @Column(nullable = false)
    @NotBlank(message = "Institution cannot be blank")
    private String institution;

    @Column(name = "event_name", nullable = false)
    @NotBlank(message = "Event name cannot be blank")
    private String eventName;

    @Column(name = "event_type", nullable = false)
    @NotBlank(message = "Event type cannot be blank")
    private String eventType;

    @Column(name = "event_date", nullable = false)
    @NotNull(message = "Event date cannot be null")
    private LocalDate eventDate;

    @Column(name = "expected_footfall", nullable = false)
    @NotNull(message = "Expected footfall cannot be null")
    @Positive(message = "Expected footfall must be positive")
    private Integer expectedFootfall;

    @Column(name = "proposal_url")
    private String proposalUrl;

    @Column(name = "social_media_links", columnDefinition = "text[]")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private String[] socialMediaLinks;

    @Column(nullable = false)
    @Builder.Default
    private Boolean verified = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "organizer", cascade = CascadeType.ALL, orphanRemoval = true)
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
