package com.eventra.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestDTO {
    private Long id;
    private Long organizerId;
    private String organizerName;
    private Long companyId;
    private String companyName;
    private String eventSummary;
    private Integer expectedAudienceSize;
    private String offering;
    private String sponsorshipAsk;
    private String status;
    private LocalDateTime createdAt;
    private String proposalUrl;
}
