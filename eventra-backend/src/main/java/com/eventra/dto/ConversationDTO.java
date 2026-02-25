package com.eventra.dto;

import com.eventra.entity.ConversationStatus;
import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO for conversation list display.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConversationDTO {
    private String id;
    private String companyId;
    private String companyName;
    private String organizerId;
    private String organizerName;
    private String eventName;
    private String subject;
    private ConversationStatus status;
    private String lastMessagePreview;
    private LocalDateTime lastMessageAt;
    private int unreadCount;
    private String participantId;
    private String participantName;
    private String participantRole;
    private LocalDateTime createdAt;
}
