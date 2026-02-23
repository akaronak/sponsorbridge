package com.eventra.controller;

import com.eventra.dto.*;
import com.eventra.service.ConversationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for conversation and messaging operations.
 * Works alongside the WebSocket controller for real-time features.
 */
@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    /**
     * GET /api/conversations — List all conversations for the current user.
     */
    @GetMapping
    public ResponseEntity<List<ConversationDTO>> getConversations(Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(conversationService.getConversations(userId));
    }

    /**
     * POST /api/conversations — Create a new conversation (or return existing).
     */
    @PostMapping
    public ResponseEntity<ConversationDTO> createConversation(
            Authentication auth,
            @Valid @RequestBody CreateConversationRequest request) {
        Long userId = Long.parseLong(auth.getName());
        ConversationDTO dto = conversationService.getOrCreateConversation(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    /**
     * GET /api/conversations/{id} — Get a specific conversation.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ConversationDTO> getConversation(
            Authentication auth,
            @PathVariable Long id) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(conversationService.getConversation(id, userId));
    }

    /**
     * GET /api/conversations/{id}/messages — Get all messages in a conversation.
     */
    @GetMapping("/{id}/messages")
    public ResponseEntity<List<ConversationMessageDTO>> getMessages(
            Authentication auth,
            @PathVariable Long id) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(conversationService.getMessages(id, userId));
    }

    /**
     * POST /api/conversations/{id}/messages — Send a message in a conversation.
     */
    @PostMapping("/{id}/messages")
    public ResponseEntity<ConversationMessageDTO> sendMessage(
            Authentication auth,
            @PathVariable Long id,
            @Valid @RequestBody SendMessageRequest request) {
        Long userId = Long.parseLong(auth.getName());
        request.setConversationId(id);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(conversationService.sendMessage(userId, request));
    }

    /**
     * POST /api/conversations/{id}/read — Mark all messages in a conversation as read.
     */
    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            Authentication auth,
            @PathVariable Long id) {
        Long userId = Long.parseLong(auth.getName());
        conversationService.markConversationAsRead(id, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/conversations/unread — Get total unread count across all conversations.
     */
    @GetMapping("/unread")
    public ResponseEntity<Map<String, Integer>> getUnreadCount(Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        int count = conversationService.getTotalUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }
}
