package com.sponsorbridge.controller;

import com.sponsorbridge.dto.MessageDTO;
import com.sponsorbridge.dto.MessageRequest;
import com.sponsorbridge.service.MessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {
    private final MessageService messageService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageDTO> sendMessage(@Valid @RequestBody MessageRequest request, Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        MessageDTO message = messageService.sendMessage(userId, request.getRequestId(), request.getContent());
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }

    @GetMapping("/request/{requestId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MessageDTO>> getMessagesByRequest(@PathVariable Long requestId) {
        List<MessageDTO> messages = messageService.getMessagesByRequest(requestId);
        return ResponseEntity.ok(messages);
    }
}
