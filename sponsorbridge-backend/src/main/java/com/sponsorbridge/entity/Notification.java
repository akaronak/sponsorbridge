package com.sponsorbridge.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Notification entity — tracks real-time alerts for users.
 * Each notification is tied to a user and optionally a conversation.
 */
@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_notif_user", columnList = "user_id"),
    @Index(name = "idx_notif_read", columnList = "is_read"),
    @Index(name = "idx_notif_created", columnList = "created_at DESC"),
    @Index(name = "idx_notif_type", columnList = "notification_type")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "notification_type", nullable = false)
    private NotificationType notificationType;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    /**
     * Optional conversation link for message-related notifications.
     */
    @Column(name = "conversation_id")
    private Long conversationId;

    /**
     * Optional action URL for clickable notifications.
     */
    @Column(name = "action_url", length = 500)
    private String actionUrl;

    /**
     * ID of the user who triggered this notification (e.g., message sender).
     */
    @Column(name = "actor_id")
    private Long actorId;

    @Column(name = "actor_name", length = 255)
    private String actorName;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
