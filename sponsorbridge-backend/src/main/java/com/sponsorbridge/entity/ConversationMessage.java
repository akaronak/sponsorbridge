package com.sponsorbridge.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ConversationMessage — a single message within a conversation thread.
 * Supports text, proposals, counter-offers, and system events.
 */
@Entity
@Table(name = "conversation_messages", indexes = {
    @Index(name = "idx_cmsg_conversation", columnList = "conversation_id"),
    @Index(name = "idx_cmsg_sender", columnList = "sender_id"),
    @Index(name = "idx_cmsg_created", columnList = "created_at"),
    @Index(name = "idx_cmsg_status", columnList = "status"),
    @Index(name = "idx_cmsg_type", columnList = "message_type")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    @NotNull
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    @NotNull
    private User sender;

    @Enumerated(EnumType.STRING)
    @Column(name = "message_type", nullable = false)
    @Builder.Default
    private MessageType messageType = MessageType.TEXT;

    @Column(nullable = false, columnDefinition = "TEXT")
    @NotBlank(message = "Content cannot be blank")
    @Size(max = 10000, message = "Content cannot exceed 10000 characters")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MessageStatus status = MessageStatus.SENT;

    // ── Proposal-specific fields (nullable for non-proposal messages) ──

    /**
     * Monetary amount for PROPOSAL / COUNTER_OFFER messages.
     */
    @Column(name = "proposal_amount", precision = 12, scale = 2)
    private BigDecimal proposalAmount;

    /**
     * Sponsorship type for the proposal.
     */
    @Column(name = "sponsorship_type", length = 50)
    private String sponsorshipType;

    /**
     * Terms/conditions attached to the proposal.
     */
    @Column(name = "proposal_terms", columnDefinition = "TEXT")
    private String proposalTerms;

    /**
     * Optional goodies description for HYBRID/GOODIES proposals.
     */
    @Column(name = "goodies_description", columnDefinition = "TEXT")
    private String goodiesDescription;

    /**
     * Deadline for the proposal to be accepted.
     */
    @Column(name = "proposal_deadline")
    private LocalDateTime proposalDeadline;

    /**
     * ID of the original proposal this counter-offer references.
     */
    @Column(name = "parent_message_id")
    private Long parentMessageId;

    // ── Metadata ──

    @Column(name = "attachment_url", length = 500)
    private String attachmentUrl;

    @Column(name = "attachment_name", length = 255)
    private String attachmentName;

    /**
     * For system events: JSON metadata about what happened.
     */
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;

    @Column(name = "edited")
    @Builder.Default
    private Boolean edited = false;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    /**
     * Mark this message as delivered.
     */
    public void markDelivered() {
        if (this.status == MessageStatus.SENT) {
            this.status = MessageStatus.DELIVERED;
            this.deliveredAt = LocalDateTime.now();
        }
    }

    /**
     * Mark this message as read.
     */
    public void markRead() {
        this.status = MessageStatus.READ;
        this.readAt = LocalDateTime.now();
        if (this.deliveredAt == null) {
            this.deliveredAt = LocalDateTime.now();
        }
    }
}
