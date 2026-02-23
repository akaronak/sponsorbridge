package com.eventra.controller;

import com.eventra.dto.RequestDTO;
import com.eventra.dto.RequestRequest;
import com.eventra.service.RequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {
    private final RequestService requestService;

    @PostMapping
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<RequestDTO> createRequest(@Valid @RequestBody RequestRequest request, Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        RequestDTO createdRequest = requestService.createRequest(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRequest);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RequestDTO> getRequestById(@PathVariable Long id) {
        RequestDTO request = requestService.getRequestById(id);
        return ResponseEntity.ok(request);
    }

    @GetMapping("/organizer/{organizerId}")
    public ResponseEntity<Page<RequestDTO>> getRequestsByOrganizer(
            @PathVariable Long organizerId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<RequestDTO> requests = requestService.getRequestsByOrganizer(organizerId, status, pageable);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<Page<RequestDTO>> getRequestsByCompany(
            @PathVariable Long companyId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<RequestDTO> requests = requestService.getRequestsByCompany(companyId, status, pageable);
        return ResponseEntity.ok(requests);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<RequestDTO> updateRequestStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        String newStatus = statusUpdate.get("status");
        RequestDTO updatedRequest = requestService.updateRequestStatus(id, userId, newStatus);
        return ResponseEntity.ok(updatedRequest);
    }
}
