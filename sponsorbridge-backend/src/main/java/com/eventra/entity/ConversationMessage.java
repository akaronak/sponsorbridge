package com.eventra.entity;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "conversation_messages")
@CompoundIndexes({
    @CompoundIndex(name = "idx_cmsg_conv_created", def = "{'conversationId': 1, 'createdAt': 1}"),
    @CompoundIndex(name = "idx_cmsg_conv_sender_status", def = "{'conversationId': 1, 'senderId': 1, 'status': 1}")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationMessage {

    @Id
    private String id;

    @Indexed
    @NotNull
    private String conversationId;

    @Indexed
    @NotNull
    private String senderId;

    @Indexed
    @Builder.Default
    private MessageType messageType = MessageType.TEXT;

    @NotBlank(message = "Content cannot be blank")
    @Size(max = 10000, message = "Content cannot exceed 10000 characters")
    private String content;

    @Indexed
    @Builder.Default
    private MessageStatus status = MessageStatus.SENT;

    private BigDecimal proposalAmount;

    private String sponsorshipType;

    private String proposalTerms;

    private String goodiesDescription;

    private LocalDateTime proposalDeadline;

    private String parentMessageId;

    private String attachmentUrl;

    private String attachmentName;

    private String metadata;

    @Builder.Default
    private Boolean edited = false;

    private LocalDateTime deliveredAt;

    private LocalDateTime readAt;

    @CreatedDate
    private LocalDateTime createdAt;

    public void markDelivered() {
        if (this.status == MessageStatus.SENT) {
            this.status = MessageStatus.DELIVERED;
            this.deliveredAt = LocalDateTime.now();
        }
    }

    public void markRead() {
        this.status = MessageStatus.READ;
        this.readAt = LocalDateTime.now();
        if (this.deliveredAt == null) {
            this.deliveredAt = LocalDateTime.now();
        }
    }
}
