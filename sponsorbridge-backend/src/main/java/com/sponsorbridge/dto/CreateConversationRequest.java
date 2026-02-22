package com.sponsorbridge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * Request payload for creating a new conversation.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateConversationRequest {

    @NotNull(message = "Participant ID is required")
    private Long participantId;

    @NotBlank(message = "Event name is required")
    private String eventName;

    private String subject;
    private Long requestId;

    /**
     * Optional first message to send when creating the conversation.
     */
    private String initialMessage;
}
