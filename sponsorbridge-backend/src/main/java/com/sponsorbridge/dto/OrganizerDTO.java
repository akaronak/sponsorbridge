package com.sponsorbridge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrganizerDTO {
    private Long id;
    private String organizerName;
    private String institution;
    private String eventName;
    private String eventType;
    private LocalDate eventDate;
    private Integer expectedFootfall;
    private String proposalUrl;
    private String[] socialMediaLinks;
    private Boolean verified;
}
