package com.eventra.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "organizers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Organizer {

    @Id
    private String id;

    @Indexed(unique = true)
    @NotNull
    private String userId;

    @NotBlank(message = "Organizer name cannot be blank")
    private String organizerName;

    @NotBlank(message = "Institution cannot be blank")
    private String institution;

    @NotBlank(message = "Event name cannot be blank")
    private String eventName;

    @NotBlank(message = "Event type cannot be blank")
    private String eventType;

    @NotNull(message = "Event date cannot be null")
    private LocalDate eventDate;

    @NotNull(message = "Expected footfall cannot be null")
    @Positive(message = "Expected footfall must be positive")
    private Integer expectedFootfall;

    private String proposalUrl;

    private String[] socialMediaLinks;

    @Indexed
    @Builder.Default
    private Boolean verified = false;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
