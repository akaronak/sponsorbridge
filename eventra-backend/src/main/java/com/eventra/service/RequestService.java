package com.eventra.service;

import com.eventra.dto.RequestDTO;
import com.eventra.dto.RequestRequest;
import com.eventra.entity.Company;
import com.eventra.entity.Organizer;
import com.eventra.entity.RequestStatus;
import com.eventra.entity.SponsorshipRequest;
import com.eventra.mapper.RequestMapper;
import com.eventra.repository.CompanyRepository;
import com.eventra.repository.OrganizerRepository;
import com.eventra.repository.SponsorshipRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RequestService {
    private final SponsorshipRequestRepository requestRepository;
    private final OrganizerRepository organizerRepository;
    private final CompanyRepository companyRepository;
    private final RequestMapper requestMapper;

    public RequestDTO createRequest(String userId, RequestRequest request) {
        Organizer organizer = organizerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Organizer not found for user"));

        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Company not found"));

        if (isDuplicateRequest(organizer.getId(), request.getCompanyId())) {
            throw new RuntimeException("Duplicate request: You already sent a request to this company within the last 30 days");
        }

        SponsorshipRequest sponsorshipRequest = requestMapper.toEntity(request);
        sponsorshipRequest.setOrganizerId(organizer.getId());
        sponsorshipRequest.setCompanyId(company.getId());
        sponsorshipRequest.setStatus(RequestStatus.PENDING);

        SponsorshipRequest saved = requestRepository.save(sponsorshipRequest);
        return requestMapper.toDTO(saved, organizer, company);
    }

    public RequestDTO getRequestById(String requestId) {
        SponsorshipRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        Organizer organizer = organizerRepository.findById(request.getOrganizerId()).orElse(null);
        Company company = companyRepository.findById(request.getCompanyId()).orElse(null);
        return requestMapper.toDTO(request, organizer, company);
    }

    public Page<RequestDTO> getRequestsByOrganizer(String organizerId, String status, Pageable pageable) {
        Page<SponsorshipRequest> requests;

        if (status != null && !status.isEmpty()) {
            RequestStatus requestStatus = RequestStatus.valueOf(status.toUpperCase());
            requests = requestRepository.findByOrganizerIdAndStatusOrderByCreatedAtDesc(organizerId, requestStatus, pageable);
        } else {
            requests = requestRepository.findByOrganizerIdOrderByCreatedAtDesc(organizerId, pageable);
        }

        return enrichRequestPage(requests);
    }

    public Page<RequestDTO> getRequestsByCompany(String companyId, String status, Pageable pageable) {
        Page<SponsorshipRequest> requests;

        if (status != null && !status.isEmpty()) {
            RequestStatus requestStatus = RequestStatus.valueOf(status.toUpperCase());
            requests = requestRepository.findByCompanyIdAndStatusOrderByCreatedAtDesc(companyId, requestStatus, pageable);
        } else {
            requests = requestRepository.findByCompanyIdOrderByCreatedAtDesc(companyId, pageable);
        }

        return enrichRequestPage(requests);
    }

    public RequestDTO updateRequestStatus(String requestId, String userId, String newStatus) {
        SponsorshipRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Company not found"));

        if (!company.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only update requests for your company");
        }

        RequestStatus status = RequestStatus.valueOf(newStatus.toUpperCase());
        request.setStatus(status);

        SponsorshipRequest updated = requestRepository.save(request);
        Organizer organizer = organizerRepository.findById(request.getOrganizerId()).orElse(null);
        return requestMapper.toDTO(updated, organizer, company);
    }

    public boolean isDuplicateRequest(String organizerId, String companyId) {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        return requestRepository.countDuplicateRequests(organizerId, companyId, thirtyDaysAgo) > 0;
    }

    /**
     * Batch-fetch Organizers and Companies for a page of requests to avoid N+1.
     */
    private Page<RequestDTO> enrichRequestPage(Page<SponsorshipRequest> requests) {
        Set<String> organizerIds = requests.stream()
                .map(SponsorshipRequest::getOrganizerId)
                .collect(Collectors.toSet());
        Set<String> companyIds = requests.stream()
                .map(SponsorshipRequest::getCompanyId)
                .collect(Collectors.toSet());

        Map<String, Organizer> organizerMap = organizerRepository.findAllById(organizerIds).stream()
                .collect(Collectors.toMap(Organizer::getId, o -> o));
        Map<String, Company> companyMap = companyRepository.findAllById(companyIds).stream()
                .collect(Collectors.toMap(Company::getId, c -> c));

        return requests.map(r -> requestMapper.toDTO(r,
                organizerMap.get(r.getOrganizerId()),
                companyMap.get(r.getCompanyId())));
    }
}
