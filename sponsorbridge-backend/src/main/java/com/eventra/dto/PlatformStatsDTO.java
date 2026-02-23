package com.eventra.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlatformStatsDTO {
    private Long totalUsers;
    private Long totalCompanies;
    private Long totalOrganizers;
    private Long totalRequests;
    private Map<String, Long> requestsByStatus;
}
