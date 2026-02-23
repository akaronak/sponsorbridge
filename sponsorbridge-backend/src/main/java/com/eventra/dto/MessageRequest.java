package com.eventra.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
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
public class MessageRequest {
    @NotNull(message = "Request ID cannot be null")
    @Positive(message = "Request ID must be positive")
    private Long requestId;

    @NotBlank(message = "Content cannot be blank")
    @Size(max = 5000, message = "Content cannot exceed 5000 characters")
    private String content;
}
