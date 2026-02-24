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

import java.util.Map;

/**
 * REST controller for sponsorship request management.
 */
@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {

    private final RequestService requestService;

    /**
     * POST /api/requests — Create a new sponsorship request.
     * Only organizers can create requests.
     */
    @PostMapping
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<RequestDTO> createRequest(
            @Valid @RequestBody RequestRequest request,
            Authentication authentication) {
        String userId = authentication.getName();
        RequestDTO dto = requestService.createRequest(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    /**
     * GET /api/requests/{id} — Get a specific sponsorship request by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<RequestDTO> getRequestById(@PathVariable String id) {
        RequestDTO dto = requestService.getRequestById(id);
        return ResponseEntity.ok(dto);
    }

    /**
     * GET /api/requests/organizer/{organizerId} — Get requests by organizer.
     * Supports optional status filter and pagination.
     */
    @GetMapping("/organizer/{organizerId}")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<Page<RequestDTO>> getRequestsByOrganizer(
            @PathVariable String organizerId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<RequestDTO> requests = requestService.getRequestsByOrganizer(organizerId, status, pageable);
        return ResponseEntity.ok(requests);
    }

    /**
     * GET /api/requests/company/{companyId} — Get requests by company.
     * Supports optional status filter and pagination.
     */
    @GetMapping("/company/{companyId}")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<Page<RequestDTO>> getRequestsByCompany(
            @PathVariable String companyId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<RequestDTO> requests = requestService.getRequestsByCompany(companyId, status, pageable);
        return ResponseEntity.ok(requests);
    }

    /**
     * PUT /api/requests/{id}/status — Update sponsorship request status.
     * Only the target company can update the status.
     */
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<RequestDTO> updateRequestStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String userId = authentication.getName();
        String newStatus = body.get("status");
        RequestDTO dto = requestService.updateRequestStatus(id, userId, newStatus);
        return ResponseEntity.ok(dto);
    }

    /**
     * GET /api/requests/check-duplicate — Check for duplicate requests.
     */
    @GetMapping("/check-duplicate")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<Map<String, Boolean>> checkDuplicate(
            @RequestParam String organizerId,
            @RequestParam String companyId) {
        boolean isDuplicate = requestService.isDuplicateRequest(organizerId, companyId);
        return ResponseEntity.ok(Map.of("duplicate", isDuplicate));
    }
}
