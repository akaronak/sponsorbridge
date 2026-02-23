package com.eventra.controller;

import com.eventra.dto.AIChatRequest;
import com.eventra.dto.AIChatResponse;
import com.eventra.service.GeminiService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for AI chat powered by Google Gemini 1.5 Pro.
 *
 * Endpoint: POST /api/ai/chat
 *
 * Accepts a user message and optional conversation history,
 * returns a structured AI response with optional sponsor
 * recommendations and compatibility scores.
 */
@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AIChatController {

    private static final Logger log = LoggerFactory.getLogger(AIChatController.class);

    private final GeminiService geminiService;

    public AIChatController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    /**
     * Process an AI chat request.
     *
     * @param request contains the user message and optional conversation history
     * @return structured AI response with reply, recommended sponsors, and compatibility score
     */
    @PostMapping("/chat")
    public ResponseEntity<AIChatResponse> chat(@Valid @RequestBody AIChatRequest request) {
        log.info("AI chat request received: message length={}, history size={}",
                request.getMessage().length(),
                request.getHistory() != null ? request.getHistory().size() : 0);

        AIChatResponse response = geminiService.chat(request);

        if (response.getError() != null) {
            log.warn("AI chat returned error: {}", response.getError());
            return ResponseEntity.status(503).body(response);
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Health check for the AI service.
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("{\"status\":\"ok\",\"service\":\"gemini-1.5-pro\"}");
    }
}
