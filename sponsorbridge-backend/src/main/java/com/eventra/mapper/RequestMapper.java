package com.eventra.mapper;

import com.eventra.dto.RequestDTO;
import com.eventra.dto.RequestRequest;
import com.eventra.entity.SponsorshipRequest;
import org.springframework.stereotype.Component;

@Component
public class RequestMapper {
    
    public RequestDTO toDTO(SponsorshipRequest request) {
        if (request == null) {
            return null;
        }
        
        return RequestDTO.builder()
                .id(request.getId())
                .organizerId(request.getOrganizer().getId())
                .organizerName(request.getOrganizer().getOrganizerName())
                .companyId(request.getCompany().getId())
                .companyName(request.getCompany().getCompanyName())
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
        if (request == null) {
            return null;
        }
        
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
        if (request == null || sponsorshipRequest == null) {
            return;
        }
        
        sponsorshipRequest.setEventSummary(request.getEventSummary());
        sponsorshipRequest.setExpectedAudienceSize(request.getExpectedAudienceSize());
        sponsorshipRequest.setOffering(request.getOffering());
        sponsorshipRequest.setSponsorshipAsk(request.getSponsorshipAsk());
        sponsorshipRequest.setProposalUrl(request.getProposalUrl());
        sponsorshipRequest.setPreferredCommunicationMode(request.getPreferredCommunicationMode());
    }
}
