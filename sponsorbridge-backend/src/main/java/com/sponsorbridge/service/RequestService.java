package com.sponsorbridge.service;

import com.sponsorbridge.dto.RequestDTO;
import com.sponsorbridge.dto.RequestRequest;
import com.sponsorbridge.entity.Company;
import com.sponsorbridge.entity.Organizer;
import com.sponsorbridge.entity.RequestStatus;
import com.sponsorbridge.entity.SponsorshipRequest;
import com.sponsorbridge.mapper.RequestMapper;
import com.sponsorbridge.repository.CompanyRepository;
import com.sponsorbridge.repository.OrganizerRepository;
import com.sponsorbridge.repository.SponsorshipRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RequestService {
    private final SponsorshipRequestRepository requestRepository;
    private final OrganizerRepository organizerRepository;
    private final CompanyRepository companyRepository;
    private final RequestMapper requestMapper;

    public RequestDTO createRequest(Long organizerId, RequestRequest request) {
        Organizer organizer = organizerRepository.findById(organizerId)
                .orElseThrow(() -> new RuntimeException("Organizer not found"));
        
        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Company not found"));
        
        // Check for duplicate request within 30 days
        if (isDuplicateRequest(organizerId, request.getCompanyId())) {
            throw new RuntimeException("Duplicate request: You already sent a request to this company within the last 30 days");
        }
        
        SponsorshipRequest sponsorshipRequest = requestMapper.toEntity(request);
        sponsorshipRequest.setOrganizer(organizer);
        sponsorshipRequest.setCompany(company);
        sponsorshipRequest.setStatus(RequestStatus.PENDING);
        
        SponsorshipRequest saved = requestRepository.save(sponsorshipRequest);
        return requestMapper.toDTO(saved);
    }

    public RequestDTO getRequestById(Long requestId) {
        SponsorshipRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        return requestMapper.toDTO(request);
    }

    public Page<RequestDTO> getRequestsByOrganizer(Long organizerId, String status, Pageable pageable) {
        Page<SponsorshipRequest> requests;
        
        if (status != null && !status.isEmpty()) {
            RequestStatus requestStatus = RequestStatus.valueOf(status.toUpperCase());
            requests = requestRepository.findByOrganizerIdAndStatusOrderByCreatedAtDesc(organizerId, requestStatus, pageable);
        } else {
            requests = requestRepository.findByOrganizerIdOrderByCreatedAtDesc(organizerId, pageable);
        }
        
        return requests.map(requestMapper::toDTO);
    }

    public Page<RequestDTO> getRequestsByCompany(Long companyId, String status, Pageable pageable) {
        Page<SponsorshipRequest> requests;
        
        if (status != null && !status.isEmpty()) {
            RequestStatus requestStatus = RequestStatus.valueOf(status.toUpperCase());
            requests = requestRepository.findByCompanyIdAndStatusOrderByCreatedAtDesc(companyId, requestStatus, pageable);
        } else {
            requests = requestRepository.findByCompanyIdOrderByCreatedAtDesc(companyId, pageable);
        }
        
        return requests.map(requestMapper::toDTO);
    }

    public RequestDTO updateRequestStatus(Long requestId, Long userId, String newStatus) {
        SponsorshipRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        
        // Verify that the user is the company owner
        if (!request.getCompany().getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only update requests for your company");
        }
        
        RequestStatus status = RequestStatus.valueOf(newStatus.toUpperCase());
        request.setStatus(status);
        
        SponsorshipRequest updated = requestRepository.save(request);
        return requestMapper.toDTO(updated);
    }

    public boolean isDuplicateRequest(Long organizerId, Long companyId) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        return requestRepository.existsDuplicateRequest(organizerId, companyId, thirtyDaysAgo);
    }
}
