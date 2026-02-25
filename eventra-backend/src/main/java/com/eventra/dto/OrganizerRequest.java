package com.eventra.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizerRequest {
    @NotBlank(message = "Organizer name cannot be blank")
    private String organizerName;

    @NotBlank(message = "Institution cannot be blank")
    private String institution;

    @NotBlank(message = "Event name cannot be blank")
    private String eventName;

    @NotBlank(message = "Event type cannot be blank")
    private String eventType;

    @NotNull(message = "Event date cannot be null")
    @FutureOrPresent(message = "Event date must be in the present or future")
    private LocalDate eventDate;

    @NotNull(message = "Expected footfall cannot be null")
    @Positive(message = "Expected footfall must be positive")
    private Integer expectedFootfall;

    private String[] socialMediaLinks;
}
