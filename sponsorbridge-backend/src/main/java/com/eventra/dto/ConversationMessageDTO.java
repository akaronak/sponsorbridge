package com.eventra.dto;

import com.eventra.entity.MessageStatus;
import com.eventra.entity.MessageType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO for individual messages within a conversation.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationMessageDTO {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderName;
    private String senderRole;
    private MessageType messageType;
    private String content;
    private MessageStatus status;

    // Proposal fields
    private BigDecimal proposalAmount;
    private String sponsorshipType;
    private String proposalTerms;
    private String goodiesDescription;
    private LocalDateTime proposalDeadline;
    private Long parentMessageId;

    // Attachment
    private String attachmentUrl;
    private String attachmentName;

    // Metadata
    private String metadata;
    private Boolean edited;
    private LocalDateTime deliveredAt;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}
