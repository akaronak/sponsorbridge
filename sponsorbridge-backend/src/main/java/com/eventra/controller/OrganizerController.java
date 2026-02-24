package com.eventra.controller;

import com.eventra.dto.OrganizerDTO;
import com.eventra.dto.OrganizerRequest;
import com.eventra.service.OrganizerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

/**
 * REST controller for organizer profile management.
 */
@RestController
@RequestMapping("/api/organizers")
@RequiredArgsConstructor
public class OrganizerController {

    private final OrganizerService organizerService;

    /**
     * POST /api/organizers — Create a new organizer profile.
     * Accepts multipart form with organizer data and optional proposal file.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<OrganizerDTO> createOrganizer(
            @Valid @RequestPart("organizer") OrganizerRequest request,
            @RequestPart(value = "proposal", required = false) MultipartFile proposalFile,
            Authentication authentication) {
        String userId = authentication.getName();
        OrganizerDTO organizer = organizerService.createOrganizer(userId, request, proposalFile);
        return ResponseEntity.status(HttpStatus.CREATED).body(organizer);
    }

    /**
     * GET /api/organizers/{id} — Get organizer profile by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<OrganizerDTO> getOrganizerById(@PathVariable String id) {
        OrganizerDTO organizer = organizerService.getOrganizerById(id);
        return ResponseEntity.ok(organizer);
    }

    /**
     * PUT /api/organizers/{id} — Update an organizer profile.
     */
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<OrganizerDTO> updateOrganizer(
            @PathVariable String id,
            @Valid @RequestPart("organizer") OrganizerRequest request,
            @RequestPart(value = "proposal", required = false) MultipartFile proposalFile,
            Authentication authentication) {
        String userId = authentication.getName();
        OrganizerDTO organizer = organizerService.updateOrganizer(id, userId, request, proposalFile);
        return ResponseEntity.ok(organizer);
    }

    /**
     * GET /api/organizers/pending — Get all pending (unverified) organizer profiles.
     * Admin-only endpoint.
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrganizerDTO>> getPendingOrganizers() {
        List<OrganizerDTO> organizers = organizerService.getPendingOrganizers();
        return ResponseEntity.ok(organizers);
    }

    /**
     * POST /api/organizers/{id}/approve — Approve an organizer profile.
     * Admin-only endpoint.
     */
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrganizerDTO> approveOrganizer(@PathVariable String id) {
        OrganizerDTO organizer = organizerService.approveOrganizer(id);
        return ResponseEntity.ok(organizer);
    }

    /**
     * POST /api/organizers/{id}/reject — Reject an organizer profile.
     * Admin-only endpoint.
     */
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrganizerDTO> rejectOrganizer(@PathVariable String id) {
        OrganizerDTO organizer = organizerService.rejectOrganizer(id);
        return ResponseEntity.ok(organizer);
    }
}
