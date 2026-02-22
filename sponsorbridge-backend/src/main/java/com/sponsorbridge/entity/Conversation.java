package com.sponsorbridge.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "conversations", indexes = {
    @Index(name = "idx_conv_company", columnList = "company_id"),
    @Index(name = "idx_conv_organizer", columnList = "organizer_id"),
    @Index(name = "idx_conv_event", columnList = "event_name"),
    @Index(name = "idx_conv_updated", columnList = "updated_at DESC"),
    @Index(name = "idx_conv_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The company (sponsor) participating in this conversation.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    @NotNull
    private User company;

    /**
     * The organizer participating in this conversation.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    @NotNull
    private User organizer;

    /**
     * The event this conversation is about (denormalized for quick display).
     */
    @Column(name = "event_name", nullable = false)
    private String eventName;

    /**
     * Optional link to the sponsorship request that triggered this conversation.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "request_id")
    private SponsorshipRequest request;

    /**
     * Subject/title for the conversation thread.
     */
    @Column(length = 500)
    private String subject;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ConversationStatus status = ConversationStatus.ACTIVE;

    /**
     * Cached last message content for conversation list display.
     */
    @Column(name = "last_message_preview", length = 255)
    private String lastMessagePreview;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    /**
     * Unread counts for each side.
     */
    @Column(name = "unread_company", nullable = false)
    @Builder.Default
    private Integer unreadCompany = 0;

    @Column(name = "unread_organizer", nullable = false)
    @Builder.Default
    private Integer unreadOrganizer = 0;

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    @Builder.Default
    private List<ConversationMessage> messages = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        lastMessageAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Get the unread count for a specific user.
     */
    public int getUnreadCountForUser(Long userId) {
        if (company != null && company.getId().equals(userId)) {
            return unreadCompany != null ? unreadCompany : 0;
        }
        if (organizer != null && organizer.getId().equals(userId)) {
            return unreadOrganizer != null ? unreadOrganizer : 0;
        }
        return 0;
    }

    /**
     * Increment unread for the other party when a message is sent.
     */
    public void incrementUnreadForRecipient(Long senderId) {
        if (company != null && company.getId().equals(senderId)) {
            unreadOrganizer = (unreadOrganizer != null ? unreadOrganizer : 0) + 1;
        } else {
            unreadCompany = (unreadCompany != null ? unreadCompany : 0) + 1;
        }
    }

    /**
     * Reset unread count when user reads messages.
     */
    public void markReadForUser(Long userId) {
        if (company != null && company.getId().equals(userId)) {
            unreadCompany = 0;
        } else if (organizer != null && organizer.getId().equals(userId)) {
            unreadOrganizer = 0;
        }
    }
}
