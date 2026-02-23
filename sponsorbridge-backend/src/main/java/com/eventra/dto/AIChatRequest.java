package com.eventra.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIChatRequest {

    @NotBlank(message = "Message is required")
    @Size(max = 4000, message = "Message cannot exceed 4000 characters")
    private String message;

    private List<ChatHistoryEntry> history;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChatHistoryEntry {
        private String role;   // "user" or "model"
        private String content;
    }
}
