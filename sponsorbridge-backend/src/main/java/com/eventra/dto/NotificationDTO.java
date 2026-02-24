package com.eventra.dto;

import com.eventra.entity.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO for notification display.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private String id;
    private NotificationType type;
    private String title;
    private String message;
    private String conversationId;
    private String actionUrl;
    private String actorId;
    private String actorName;
    private boolean isRead;
    private LocalDateTime createdAt;
}
