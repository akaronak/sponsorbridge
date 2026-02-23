package com.eventra.controller;

import com.eventra.dto.ConversationMessageDTO;
import com.eventra.dto.SendMessageRequest;
import com.eventra.dto.TypingIndicatorDTO;
import com.eventra.service.ConversationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.security.Principal;

/**
 * WebSocket STOMP controller for real-time messaging.
 *
 * Client subscription topics:
 * - /topic/conversation/{id}         → New messages in conversation
 * - /topic/conversation/{id}/typing  → Typing indicators
 * - /topic/conversation/{id}/read    → Read receipts
 * - /user/queue/messages             → Personal message delivery
 * - /user/queue/notifications        → Personal notifications
 *
 * Client send destinations:
 * - /app/chat.send/{conversationId}  → Send a message
 * - /app/chat.typing/{conversationId} → Typing indicator
 * - /app/chat.read/{conversationId}  → Mark as read
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketChatController {

    private final ConversationService conversationService;

    /**
     * Handle sending a message via WebSocket.
     * Client sends to: /app/chat.send/{conversationId}
     */
    @MessageMapping("/chat.send/{conversationId}")
    public void sendMessage(
            @DestinationVariable Long conversationId,
            @Payload SendMessageRequest request,
            Principal principal) {

        if (principal == null) {
            log.warn("Unauthenticated WebSocket message rejected");
            return;
        }

        Long userId = Long.parseLong(principal.getName());
        request.setConversationId(conversationId);

        ConversationMessageDTO dto = conversationService.sendMessage(userId, request);
        log.debug("WebSocket message {} sent in conversation {} by user {}",
                dto.getId(), conversationId, userId);
    }

    /**
     * Handle typing indicator via WebSocket.
     * Client sends to: /app/chat.typing/{conversationId}
     */
    @MessageMapping("/chat.typing/{conversationId}")
    public void handleTyping(
            @DestinationVariable Long conversationId,
            @Payload TypingIndicatorDTO typing,
            Principal principal) {

        if (principal == null) return;

        typing.setConversationId(conversationId);
        typing.setUserId(Long.parseLong(principal.getName()));
        conversationService.broadcastTypingIndicator(typing);
    }

    /**
     * Handle mark-as-read via WebSocket.
     * Client sends to: /app/chat.read/{conversationId}
     */
    @MessageMapping("/chat.read/{conversationId}")
    public void markAsRead(
            @DestinationVariable Long conversationId,
            Principal principal) {

        if (principal == null) return;

        Long userId = Long.parseLong(principal.getName());
        conversationService.markConversationAsRead(conversationId, userId);
    }
}
