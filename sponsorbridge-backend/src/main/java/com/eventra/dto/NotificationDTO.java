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
    private Long id;
    private NotificationType type;
    private String title;
    private String message;
    private Long conversationId;
    private String actionUrl;
    private Long actorId;
    private String actorName;
    private boolean isRead;
    private LocalDateTime createdAt;
}
