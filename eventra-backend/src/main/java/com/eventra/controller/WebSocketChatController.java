package com.eventra.controller;

import com.eventra.dto.ConversationMessageDTO;
import com.eventra.dto.SendMessageRequest;
import com.eventra.dto.TypingIndicatorDTO;
import com.eventra.service.ConversationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.security.Principal;

/**
 * WebSocket (STOMP) controller for real-time chat operations.
 * 
 * Client destinations:
 * - /app/chat.send       → Send a message in a conversation
 * - /app/chat.typing     → Broadcast typing indicator
 * 
 * Server broadcasts to:
 * - /topic/conversation/{id}          → New messages
 * - /topic/conversation/{id}/typing   → Typing indicators
 * - /topic/conversation/{id}/read     → Read receipts
 * - /user/{userId}/queue/messages     → Direct message delivery
 * - /user/{userId}/queue/notifications → Notification delivery
 */
@Controller
@RequiredArgsConstructor
@Slf4j
public class WebSocketChatController {

    private final ConversationService conversationService;

    /**
     * Handle incoming chat messages via WebSocket.
     * Client sends to: /app/chat.send
     */
    @MessageMapping("/chat.send")
    public void sendMessage(@Payload SendMessageRequest request, Principal principal) {
        if (principal == null) {
            log.warn("Received WebSocket message without authentication");
            return;
        }

        String userId = principal.getName();
        log.debug("WebSocket message from user {} in conversation {}", userId, request.getConversationId());

        ConversationMessageDTO dto = conversationService.sendMessage(userId, request);
        log.info("WebSocket message {} delivered in conversation {}", dto.getId(), request.getConversationId());
    }

    /**
     * Handle typing indicator events via WebSocket.
     * Client sends to: /app/chat.typing
     */
    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload TypingIndicatorDTO typingIndicator, Principal principal) {
        if (principal == null) {
            log.warn("Received typing indicator without authentication");
            return;
        }

        String userId = principal.getName();
        typingIndicator.setUserId(userId);

        log.debug("Typing indicator from user {} in conversation {}: {}",
                userId, typingIndicator.getConversationId(), typingIndicator.isTyping());

        conversationService.broadcastTypingIndicator(typingIndicator);
    }
}
