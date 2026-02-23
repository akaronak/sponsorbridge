package com.eventra.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AIChatResponse {

    private String reply;
    private List<RecommendedSponsor> recommendedSponsors;
    private Integer compatibilityScore;
    private String error;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecommendedSponsor {
        private String name;
        private String industry;
        private int matchScore;
        private String reason;
        private String estimatedBudget;
    }

    /** Convenience factory for error responses */
    public static AIChatResponse error(String message) {
        return AIChatResponse.builder()
                .reply(message)
                .error(message)
                .build();
    }
}
