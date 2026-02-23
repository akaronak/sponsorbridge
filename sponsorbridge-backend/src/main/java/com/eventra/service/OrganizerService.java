package com.eventra.service;

import com.eventra.dto.OrganizerDTO;
import com.eventra.dto.OrganizerRequest;
import com.eventra.entity.Organizer;
import com.eventra.entity.User;
import com.eventra.mapper.OrganizerMapper;
import com.eventra.repository.OrganizerRepository;
import com.eventra.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class OrganizerService {
    private final OrganizerRepository organizerRepository;
    private final UserRepository userRepository;
    private final OrganizerMapper organizerMapper;
    private final FileUploadService fileUploadService;

    public OrganizerDTO createOrganizer(Long userId, OrganizerRequest request, MultipartFile proposalFile) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (organizerRepository.findByUserId(userId).isPresent()) {
            throw new RuntimeException("User already has an organizer profile");
        }
        
        Organizer organizer = organizerMapper.toEntity(request);
        organizer.setUser(user);
        organizer.setVerified(false);
        
        // Upload proposal if provided
        if (proposalFile != null && !proposalFile.isEmpty()) {
            String proposalUrl = fileUploadService.uploadProposal(proposalFile);
            organizer.setProposalUrl(proposalUrl);
        }
        
        Organizer saved = organizerRepository.save(organizer);
        return organizerMapper.toDTO(saved);
    }

    public OrganizerDTO getOrganizerById(Long organizerId) {
        Organizer organizer = organizerRepository.findById(organizerId)
                .orElseThrow(() -> new RuntimeException("Organizer not found"));
        return organizerMapper.toDTO(organizer);
    }

    public OrganizerDTO updateOrganizer(Long organizerId, Long userId, OrganizerRequest request, MultipartFile proposalFile) {
        Organizer organizer = organizerRepository.findById(organizerId)
                .orElseThrow(() -> new RuntimeException("Organizer not found"));
        
        if (!organizer.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only update your own organizer profile");
        }
        
        organizerMapper.updateEntityFromRequest(request, organizer);
        
        // Upload new proposal if provided
        if (proposalFile != null && !proposalFile.isEmpty()) {
            String proposalUrl = fileUploadService.uploadProposal(proposalFile);
            organizer.setProposalUrl(proposalUrl);
        }
        
        Organizer updated = organizerRepository.save(organizer);
        return organizerMapper.toDTO(updated);
    }

    public List<OrganizerDTO> getPendingOrganizers() {
        List<Organizer> organizers = organizerRepository.findByVerifiedFalse();
        return organizers.stream()
                .map(organizerMapper::toDTO)
                .collect(Collectors.toList());
    }

    public OrganizerDTO approveOrganizer(Long organizerId) {
        Organizer organizer = organizerRepository.findById(organizerId)
                .orElseThrow(() -> new RuntimeException("Organizer not found"));
        organizer.setVerified(true);
        Organizer updated = organizerRepository.save(organizer);
        return organizerMapper.toDTO(updated);
    }

    public OrganizerDTO rejectOrganizer(Long organizerId) {
        Organizer organizer = organizerRepository.findById(organizerId)
                .orElseThrow(() -> new RuntimeException("Organizer not found"));
        organizer.setVerified(false);
        Organizer updated = organizerRepository.save(organizer);
        return organizerMapper.toDTO(updated);
    }
}
