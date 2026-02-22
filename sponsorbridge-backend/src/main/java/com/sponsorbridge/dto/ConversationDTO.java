package com.sponsorbridge.dto;

import com.sponsorbridge.entity.ConversationStatus;
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
    private Long id;
    private Long companyId;
    private String companyName;
    private Long organizerId;
    private String organizerName;
    private String eventName;
    private String subject;
    private ConversationStatus status;
    private String lastMessagePreview;
    private LocalDateTime lastMessageAt;
    private int unreadCount;
    private Long participantId;
    private String participantName;
    private String participantRole;
    private LocalDateTime createdAt;
}
