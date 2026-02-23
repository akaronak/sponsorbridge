package com.eventra.controller;

import com.eventra.dto.NotificationDTO;
import com.eventra.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for notification management.
 */
@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * GET /api/notifications — Get paginated notifications.
     */
    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(notificationService.getNotifications(userId, page, size));
    }

    /**
     * GET /api/notifications/unread — Get unread notifications.
     */
    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    /**
     * GET /api/notifications/count — Get unread notification count.
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Integer>> getUnreadCount(Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(Map.of("count", notificationService.getUnreadCount(userId)));
    }

    /**
     * POST /api/notifications/{id}/read — Mark a notification as read.
     */
    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            Authentication auth,
            @PathVariable Long id) {
        Long userId = Long.parseLong(auth.getName());
        notificationService.markAsRead(id, userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * POST /api/notifications/read-all — Mark all notifications as read.
     */
    @PostMapping("/read-all")
    public ResponseEntity<Map<String, Integer>> markAllAsRead(Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        int count = notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("marked", count));
    }
}
