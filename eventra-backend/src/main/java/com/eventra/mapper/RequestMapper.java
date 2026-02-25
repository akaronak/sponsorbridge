package com.eventra.mapper;

import com.eventra.dto.RequestDTO;
import com.eventra.dto.RequestRequest;
import com.eventra.entity.Company;
import com.eventra.entity.Organizer;
import com.eventra.entity.SponsorshipRequest;
import org.springframework.stereotype.Component;

@Component
public class RequestMapper {

    /**
     * Convert SponsorshipRequest document to DTO.
     * Requires pre-fetched Organizer and Company for name resolution.
     */
    public RequestDTO toDTO(SponsorshipRequest request, Organizer organizer, Company company) {
        if (request == null) return null;

        return RequestDTO.builder()
                .id(request.getId())
                .organizerId(request.getOrganizerId())
                .organizerName(organizer != null ? organizer.getOrganizerName() : null)
                .companyId(request.getCompanyId())
                .companyName(company != null ? company.getCompanyName() : null)
                .eventSummary(request.getEventSummary())
                .expectedAudienceSize(request.getExpectedAudienceSize())
                .offering(request.getOffering())
                .sponsorshipAsk(request.getSponsorshipAsk())
                .status(request.getStatus().toString())
                .createdAt(request.getCreatedAt())
                .proposalUrl(request.getProposalUrl())
                .build();
    }

    public SponsorshipRequest toEntity(RequestRequest request) {
        if (request == null) return null;

        return SponsorshipRequest.builder()
                .eventSummary(request.getEventSummary())
                .expectedAudienceSize(request.getExpectedAudienceSize())
                .offering(request.getOffering())
                .sponsorshipAsk(request.getSponsorshipAsk())
                .proposalUrl(request.getProposalUrl())
                .preferredCommunicationMode(request.getPreferredCommunicationMode())
                .build();
    }

    public void updateEntityFromRequest(RequestRequest request, SponsorshipRequest sponsorshipRequest) {
        if (request == null || sponsorshipRequest == null) return;

        sponsorshipRequest.setEventSummary(request.getEventSummary());
        sponsorshipRequest.setExpectedAudienceSize(request.getExpectedAudienceSize());
        sponsorshipRequest.setOffering(request.getOffering());
        sponsorshipRequest.setSponsorshipAsk(request.getSponsorshipAsk());
        sponsorshipRequest.setProposalUrl(request.getProposalUrl());
        sponsorshipRequest.setPreferredCommunicationMode(request.getPreferredCommunicationMode());
    }
}
