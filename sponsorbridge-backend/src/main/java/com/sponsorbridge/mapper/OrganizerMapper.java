package com.sponsorbridge.mapper;

import com.sponsorbridge.dto.OrganizerDTO;
import com.sponsorbridge.dto.OrganizerRequest;
import com.sponsorbridge.entity.Organizer;
import org.springframework.stereotype.Component;

@Component
public class OrganizerMapper {
    
    public OrganizerDTO toDTO(Organizer organizer) {
        if (organizer == null) {
            return null;
        }
        
        return OrganizerDTO.builder()
                .id(organizer.getId())
                .organizerName(organizer.getOrganizerName())
                .institution(organizer.getInstitution())
                .eventName(organizer.getEventName())
                .eventType(organizer.getEventType())
                .eventDate(organizer.getEventDate())
                .expectedFootfall(organizer.getExpectedFootfall())
                .proposalUrl(organizer.getProposalUrl())
                .socialMediaLinks(organizer.getSocialMediaLinks())
                .verified(organizer.getVerified())
                .build();
    }
    
    public Organizer toEntity(OrganizerRequest request) {
        if (request == null) {
            return null;
        }
        
        return Organizer.builder()
                .organizerName(request.getOrganizerName())
                .institution(request.getInstitution())
                .eventName(request.getEventName())
                .eventType(request.getEventType())
                .eventDate(request.getEventDate())
                .expectedFootfall(request.getExpectedFootfall())
                .socialMediaLinks(request.getSocialMediaLinks())
                .build();
    }
    
    public void updateEntityFromRequest(OrganizerRequest request, Organizer organizer) {
        if (request == null || organizer == null) {
            return;
        }
        
        organizer.setOrganizerName(request.getOrganizerName());
        organizer.setInstitution(request.getInstitution());
        organizer.setEventName(request.getEventName());
        organizer.setEventType(request.getEventType());
        organizer.setEventDate(request.getEventDate());
        organizer.setExpectedFootfall(request.getExpectedFootfall());
        organizer.setSocialMediaLinks(request.getSocialMediaLinks());
    }
}
