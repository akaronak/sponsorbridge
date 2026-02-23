package com.eventra.dto;

import lombok.*;

/**
 * WebSocket payload for typing indicator events.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TypingIndicatorDTO {
    private Long conversationId;
    private Long userId;
    private String userName;
    private boolean typing;
}
