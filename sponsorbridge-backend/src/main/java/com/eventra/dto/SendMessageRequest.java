package com.eventra.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Request payload for sending a message in a conversation.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendMessageRequest {

    @NotNull(message = "Conversation ID is required")
    private Long conversationId;

    @NotBlank(message = "Content cannot be blank")
    @Size(max = 10000, message = "Content cannot exceed 10000 characters")
    private String content;

    /**
     * Message type: TEXT, PROPOSAL, COUNTER_OFFER, SYSTEM_EVENT
     * Defaults to TEXT if not specified.
     */
    private String messageType;

    // ── Optional proposal fields ──

    private BigDecimal proposalAmount;
    private String sponsorshipType;
    private String proposalTerms;
    private String goodiesDescription;
    private LocalDateTime proposalDeadline;
    private Long parentMessageId;

    // ── Optional attachment ──

    private String attachmentUrl;
    private String attachmentName;
}
