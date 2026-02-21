package com.sponsorbridge.controller;

import com.sponsorbridge.dto.OrganizerDTO;
import com.sponsorbridge.dto.OrganizerRequest;
import com.sponsorbridge.service.OrganizerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/organizers")
@RequiredArgsConstructor
public class OrganizerController {
    private final OrganizerService organizerService;

    @PostMapping(consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<OrganizerDTO> createOrganizer(
            @Valid @ModelAttribute OrganizerRequest request,
            @RequestParam(required = false) MultipartFile proposalFile,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        OrganizerDTO organizer = organizerService.createOrganizer(userId, request, proposalFile);
        return ResponseEntity.status(HttpStatus.CREATED).body(organizer);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrganizerDTO> getOrganizerById(@PathVariable Long id) {
        OrganizerDTO organizer = organizerService.getOrganizerById(id);
        return ResponseEntity.ok(organizer);
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<OrganizerDTO> updateOrganizer(
            @PathVariable Long id,
            @Valid @ModelAttribute OrganizerRequest request,
            @RequestParam(required = false) MultipartFile proposalFile,
            Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        OrganizerDTO organizer = organizerService.updateOrganizer(id, userId, request, proposalFile);
        return ResponseEntity.ok(organizer);
    }
}
