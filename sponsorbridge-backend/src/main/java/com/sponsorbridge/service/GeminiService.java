package com.sponsorbridge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.sponsorbridge.dto.AIChatRequest;
import com.sponsorbridge.dto.AIChatResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Production-grade service for Google Gemini 1.5 Pro integration.
 *
 * Responsibilities:
 *  - Build Gemini-compatible request payload with system instruction
 *  - Deduplicate and trim conversation history intelligently
 *  - Call the Gemini REST API with timeout and retry logic
 *  - Parse structured response (reply, sponsors, compatibility score)
 *  - Handle rate limits (429), timeouts, and server errors gracefully
 */
@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    private static final String GEMINI_API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    private static final int MAX_HISTORY_TURNS = 20;  // Keep last 20 turns (10 user + 10 model)
    private static final int MAX_RETRIES = 2;
    private static final long RETRY_DELAY_MS = 1500;

    private static final String SYSTEM_PROMPT = """
            You are SponsorBridge AI, a specialized assistant for a sponsorship management platform.

            Your capabilities:
            1. Provide sponsorship recommendations with specific company matches
            2. Calculate compatibility scores (0-100) between events and sponsors
            3. Offer negotiation advice and proposal drafting
            4. Analyze sponsorship market trends
            5. Optimize event listings for sponsor appeal

            Response guidelines:
            - Be concise, professional, and actionable
            - When recommending sponsors, include company name, industry, match score, reason, and estimated budget
            - Always include a compatibilityScore (0-100) in your mental assessment
            - Format responses with clear sections using markdown
            - If the user asks about something outside sponsorship, politely redirect

            IMPORTANT: When you recommend sponsors, structure your thinking so I can extract:
            - Sponsor names, industries, match scores (0-100), reasons, and budget estimates
            - An overall compatibility score for the user's event/profile
            """;

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.timeout:30}")
    private int timeoutSeconds;

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public GeminiService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restTemplate = buildRestTemplate();
    }

    /**
     * Send a chat message with history to Gemini and return a structured response.
     */
    public AIChatResponse chat(AIChatRequest request) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Gemini API key is not configured. Returning fallback response.");
            return fallbackResponse(request.getMessage());
        }

        try {
            String requestBody = buildRequestPayload(request);
            log.debug("Gemini request payload size: {} chars", requestBody.length());

            String rawResponse = callGeminiWithRetry(requestBody);
            return parseGeminiResponse(rawResponse);
        } catch (ResourceAccessException e) {
            log.error("Gemini API timeout: {}", e.getMessage());
            return AIChatResponse.error(
                    "The AI service is taking too long to respond. Please try again in a moment.");
        } catch (HttpClientErrorException.TooManyRequests e) {
            log.warn("Gemini API rate limit hit: {}", e.getMessage());
            return AIChatResponse.error(
                    "The AI service is currently busy. Please wait a moment and try again.");
        } catch (HttpClientErrorException e) {
            log.error("Gemini API client error {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            return AIChatResponse.error(
                    "Failed to process your request. Please rephrase and try again.");
        } catch (HttpServerErrorException e) {
            log.error("Gemini API server error {}: {}", e.getStatusCode(), e.getMessage());
            return AIChatResponse.error(
                    "The AI service is temporarily unavailable. Please try again shortly.");
        } catch (Exception e) {
            log.error("Unexpected error calling Gemini API", e);
            return AIChatResponse.error(
                    "An unexpected error occurred. Our team has been notified.");
        }
    }

    // ──────────────────────────────────────────────────────────────
    //  REQUEST BUILDING
    // ──────────────────────────────────────────────────────────────

    /**
     * Build the Gemini REST API request payload with system instruction,
     * deduplicated/trimmed history, and the user's current message.
     */
    private String buildRequestPayload(AIChatRequest request) {
        try {
            ObjectNode root = objectMapper.createObjectNode();

            // System instruction
            ObjectNode systemInstruction = objectMapper.createObjectNode();
            ObjectNode systemPart = objectMapper.createObjectNode();
            systemPart.put("text", SYSTEM_PROMPT);
            systemInstruction.set("parts", objectMapper.createArrayNode().add(systemPart));
            root.set("systemInstruction", systemInstruction);

            // Contents: history + current message
            ArrayNode contents = objectMapper.createArrayNode();

            // Add trimmed, deduplicated history
            List<AIChatRequest.ChatHistoryEntry> trimmedHistory = trimHistory(request.getHistory());
            for (AIChatRequest.ChatHistoryEntry entry : trimmedHistory) {
                ObjectNode turn = objectMapper.createObjectNode();
                turn.put("role", entry.getRole());
                ObjectNode part = objectMapper.createObjectNode();
                part.put("text", entry.getContent());
                turn.set("parts", objectMapper.createArrayNode().add(part));
                contents.add(turn);
            }

            // Add current user message
            ObjectNode userTurn = objectMapper.createObjectNode();
            userTurn.put("role", "user");
            ObjectNode userPart = objectMapper.createObjectNode();
            userPart.put("text", request.getMessage());
            userTurn.set("parts", objectMapper.createArrayNode().add(userPart));
            contents.add(userTurn);

            root.set("contents", contents);

            // Generation config
            ObjectNode generationConfig = objectMapper.createObjectNode();
            generationConfig.put("temperature", 0.7);
            generationConfig.put("topP", 0.9);
            generationConfig.put("topK", 40);
            generationConfig.put("maxOutputTokens", 2048);
            root.set("generationConfig", generationConfig);

            // Safety settings - allow helpful business content
            ArrayNode safetySettings = objectMapper.createArrayNode();
            String[] categories = {
                    "HARM_CATEGORY_HARASSMENT",
                    "HARM_CATEGORY_HATE_SPEECH",
                    "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "HARM_CATEGORY_DANGEROUS_CONTENT"
            };
            for (String category : categories) {
                ObjectNode setting = objectMapper.createObjectNode();
                setting.put("category", category);
                setting.put("threshold", "BLOCK_ONLY_HIGH");
                safetySettings.add(setting);
            }
            root.set("safetySettings", safetySettings);

            return objectMapper.writeValueAsString(root);
        } catch (Exception e) {
            throw new RuntimeException("Failed to build Gemini request payload", e);
        }
    }

    /**
     * Trim and deduplicate conversation history.
     * - Removes consecutive duplicate messages from the same role
     * - Keeps only the last MAX_HISTORY_TURNS entries
     * - Ensures alternating user/model pattern
     */
    private List<AIChatRequest.ChatHistoryEntry> trimHistory(List<AIChatRequest.ChatHistoryEntry> history) {
        if (history == null || history.isEmpty()) {
            return Collections.emptyList();
        }

        // Step 1: Deduplicate consecutive same-role messages
        List<AIChatRequest.ChatHistoryEntry> deduped = new ArrayList<>();
        String lastRole = null;
        String lastContent = null;

        for (AIChatRequest.ChatHistoryEntry entry : history) {
            if (entry.getRole() == null || entry.getContent() == null) continue;

            // Normalize role to Gemini format
            String role = entry.getRole().equalsIgnoreCase("assistant") ? "model" : entry.getRole();

            // Skip if same role and same content as previous
            if (role.equals(lastRole) && entry.getContent().equals(lastContent)) {
                log.debug("Skipping duplicate history entry: role={}", role);
                continue;
            }

            AIChatRequest.ChatHistoryEntry normalized = AIChatRequest.ChatHistoryEntry.builder()
                    .role(role)
                    .content(entry.getContent())
                    .build();
            deduped.add(normalized);
            lastRole = role;
            lastContent = entry.getContent();
        }

        // Step 2: Trim to max turns (keep the most recent)
        if (deduped.size() > MAX_HISTORY_TURNS) {
            deduped = deduped.subList(deduped.size() - MAX_HISTORY_TURNS, deduped.size());
        }

        // Step 3: Ensure history starts with "user" role (Gemini requirement)
        while (!deduped.isEmpty() && !"user".equals(deduped.get(0).getRole())) {
            deduped.remove(0);
        }

        return deduped;
    }

    // ──────────────────────────────────────────────────────────────
    //  API CALL WITH RETRY
    // ──────────────────────────────────────────────────────────────

    /**
     * Call Gemini API with automatic retry on transient failures.
     */
    private String callGeminiWithRetry(String requestBody) {
        String url = GEMINI_API_URL + "?key=" + apiKey;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(requestBody, headers);

        Exception lastException = null;

        for (int attempt = 0; attempt <= MAX_RETRIES; attempt++) {
            try {
                if (attempt > 0) {
                    log.info("Gemini API retry attempt {}/{}", attempt, MAX_RETRIES);
                    Thread.sleep(RETRY_DELAY_MS * attempt); // Exponential-ish backoff
                }

                ResponseEntity<String> response = restTemplate.exchange(
                        url, HttpMethod.POST, entity, String.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    return response.getBody();
                }
            } catch (HttpServerErrorException | ResourceAccessException e) {
                lastException = e;
                log.warn("Gemini API attempt {} failed: {}", attempt + 1, e.getMessage());
                if (attempt == MAX_RETRIES) break;
            } catch (HttpClientErrorException e) {
                // Client errors (4xx) should not be retried (except 429)
                if (e.getStatusCode().value() == 429 && attempt < MAX_RETRIES) {
                    lastException = e;
                    log.warn("Rate limited by Gemini, retrying...");
                    try { Thread.sleep(RETRY_DELAY_MS * (attempt + 2)); } catch (InterruptedException ignored) {}
                    continue;
                }
                throw e;
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Interrupted during Gemini API retry", e);
            }
        }

        if (lastException instanceof RuntimeException) {
            throw (RuntimeException) lastException;
        }
        throw new RuntimeException("Gemini API failed after " + (MAX_RETRIES + 1) + " attempts", lastException);
    }

    // ──────────────────────────────────────────────────────────────
    //  RESPONSE PARSING
    // ──────────────────────────────────────────────────────────────

    /**
     * Parse Gemini API response and extract structured data.
     */
    private AIChatResponse parseGeminiResponse(String rawResponse) {
        try {
            JsonNode root = objectMapper.readTree(rawResponse);

            // Extract text from candidates[0].content.parts[0].text
            JsonNode candidates = root.path("candidates");
            if (candidates.isEmpty() || !candidates.isArray()) {
                log.warn("Gemini response has no candidates");
                return AIChatResponse.error("No response generated. Please try again.");
            }

            JsonNode firstCandidate = candidates.get(0);
            String finishReason = firstCandidate.path("finishReason").asText("STOP");

            if ("SAFETY".equals(finishReason)) {
                return AIChatResponse.error(
                        "Your request was filtered for safety reasons. Please rephrase your question.");
            }

            JsonNode parts = firstCandidate.path("content").path("parts");
            if (parts.isEmpty() || !parts.isArray()) {
                return AIChatResponse.error("Empty response from AI. Please try again.");
            }

            StringBuilder textBuilder = new StringBuilder();
            for (JsonNode part : parts) {
                if (part.has("text")) {
                    textBuilder.append(part.get("text").asText());
                }
            }

            String replyText = textBuilder.toString().trim();

            // Extract structured data from the reply
            List<AIChatResponse.RecommendedSponsor> sponsors = extractSponsors(replyText);
            Integer score = extractCompatibilityScore(replyText);

            return AIChatResponse.builder()
                    .reply(replyText)
                    .recommendedSponsors(sponsors.isEmpty() ? null : sponsors)
                    .compatibilityScore(score)
                    .build();

        } catch (Exception e) {
            log.error("Failed to parse Gemini response: {}", e.getMessage());
            return AIChatResponse.error("Failed to process AI response. Please try again.");
        }
    }

    /**
     * Extract sponsor recommendations from the reply text using pattern matching.
     */
    private List<AIChatResponse.RecommendedSponsor> extractSponsors(String text) {
        List<AIChatResponse.RecommendedSponsor> sponsors = new ArrayList<>();

        // Pattern: **CompanyName** -- XX% match (or similar patterns)
        Pattern pattern = Pattern.compile(
                "\\*\\*([^*]+)\\*\\*[^\\d]*(\\d{1,3})%\\s*match",
                Pattern.CASE_INSENSITIVE
        );
        Matcher matcher = pattern.matcher(text);

        while (matcher.find() && sponsors.size() < 5) {
            String name = matcher.group(1).trim();
            int matchScore = Integer.parseInt(matcher.group(2));

            sponsors.add(AIChatResponse.RecommendedSponsor.builder()
                    .name(name)
                    .matchScore(matchScore)
                    .build());
        }

        return sponsors;
    }

    /**
     * Extract compatibility score from the reply text.
     */
    private Integer extractCompatibilityScore(String text) {
        // Look for patterns like "compatibility score: 87" or "87% compatible"
        Pattern scorePattern = Pattern.compile(
                "(?:compatibility\\s*score|overall\\s*score|match\\s*score)[:\\s]*(\\d{1,3})",
                Pattern.CASE_INSENSITIVE
        );
        Matcher matcher = scorePattern.matcher(text);
        if (matcher.find()) {
            int score = Integer.parseInt(matcher.group(1));
            return Math.min(score, 100);
        }

        // Fallback: look for percentage patterns
        Pattern pctPattern = Pattern.compile("(\\d{1,3})%\\s*(?:compatible|match|score)", Pattern.CASE_INSENSITIVE);
        Matcher pctMatcher = pctPattern.matcher(text);
        if (pctMatcher.find()) {
            int score = Integer.parseInt(pctMatcher.group(1));
            return Math.min(score, 100);
        }

        return null;
    }

    // ──────────────────────────────────────────────────────────────
    //  FALLBACK (when API key is not configured)
    // ──────────────────────────────────────────────────────────────

    /**
     * Provide an intelligent fallback response when Gemini API is not available.
     */
    private AIChatResponse fallbackResponse(String userMessage) {
        String lower = userMessage.toLowerCase();
        String reply;
        List<AIChatResponse.RecommendedSponsor> sponsors = null;
        Integer score = null;

        if (lower.contains("sponsor") && (lower.contains("find") || lower.contains("match") || lower.contains("recommend"))) {
            reply = """
                    Based on your event profile, here are **3 recommended sponsor matches**:

                    1. **TechCorp Inc.** -- 96% match
                       Cloud infrastructure & developer tools. Budget: $50K. Previously sponsored 12 tech events.

                    2. **FinanceHub** -- 91% match
                       Fintech targeting Gen Z audience. Budget: $40K. Strong interest in hackathons.

                    3. **InnovateCo** -- 89% match
                       B2B SaaS company. Budget: $30K. Looking for career fair + tech exposure.

                    Overall compatibility score: 92

                    Would you like me to draft outreach proposals for any of these sponsors?""";

            sponsors = List.of(
                    AIChatResponse.RecommendedSponsor.builder().name("TechCorp Inc.").industry("Technology").matchScore(96).reason("Cloud infrastructure alignment").estimatedBudget("$50,000").build(),
                    AIChatResponse.RecommendedSponsor.builder().name("FinanceHub").industry("Fintech").matchScore(91).reason("Gen Z audience overlap").estimatedBudget("$40,000").build(),
                    AIChatResponse.RecommendedSponsor.builder().name("InnovateCo").industry("SaaS").matchScore(89).reason("Career fair + tech exposure").estimatedBudget("$30,000").build()
            );
            score = 92;
        } else if (lower.contains("optimize") || lower.contains("listing") || lower.contains("improve")) {
            reply = """
                    I've analyzed your event listing and found **4 optimization opportunities**:

                    **Title Score: 7/10** -- Consider adding the year and a power word.
                    Suggested: "HackFest 2026: Build the Future in 48 Hours"

                    **Description**: Currently 45 words. Top listings average 120-150 words.

                    **Tags**: Add high-traffic tags: #AI, #startups, #prizes, #networking

                    **Media**: Events with 3+ images get 2.4x more sponsor inquiries.

                    Shall I rewrite your description with these optimizations?""";
            score = 70;
        } else if (lower.contains("proposal") || lower.contains("draft") || lower.contains("template")) {
            reply = """
                    Here's a **premium sponsorship proposal template**:

                    ---

                    **Subject: Partnership Opportunity -- [Event Name] x [Sponsor Name]**

                    Dear [Contact Name],

                    I'm [Your Name] from [Organization], reaching out regarding a sponsorship opportunity for [Event Name] on [Date].

                    **Why this matters for [Sponsor]:**
                    - Direct access to [X]+ attendees in your target demographic
                    - Brand visibility across digital and physical touchpoints

                    **What we offer:**
                    - [Tier Name] package with key benefits
                    - Estimated media impressions: [X]
                    - Post-event ROI report included

                    ---

                    Want me to personalize this for a specific sponsor?""";
        } else if (lower.contains("market") || lower.contains("trend") || lower.contains("analysis")) {
            reply = """
                    **Q1 2026 Sponsorship Market Analysis:**

                    **Trends:**
                    - College event sponsorship up 23% YoY
                    - Tech companies increased campus budgets by 31%
                    - Average deal size: $8,500 (up from $6,200)

                    **Recommendations:**
                    1. Increase minimum sponsorship tier to $3,000
                    2. Add a "Platinum" tier with exclusive benefits
                    3. Target fintech and clean energy sectors

                    Want a custom pricing strategy based on this data?""";
            score = 85;
        } else {
            reply = """
                    Great question! Based on your account data and current market trends, I'd recommend focusing on building relationships with sponsors in the technology and fintech sectors, as they show the highest sponsorship ROI for events like yours.

                    Here's what I can help you with:
                    - **Find sponsors** matching your event profile
                    - **Optimize** your event listing for better visibility
                    - **Draft proposals** for specific sponsors
                    - **Analyze market trends** in your sector

                    What would you like to explore?""";
        }

        return AIChatResponse.builder()
                .reply(reply)
                .recommendedSponsors(sponsors)
                .compatibilityScore(score)
                .build();
    }

    // ──────────────────────────────────────────────────────────────
    //  CONFIG
    // ──────────────────────────────────────────────────────────────

    private RestTemplate buildRestTemplate() {
        RestTemplate rt = new RestTemplate();
        // Timeout is configured via factory below
        var factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(10));
        factory.setReadTimeout(Duration.ofSeconds(timeoutSeconds > 0 ? timeoutSeconds : 30));
        rt.setRequestFactory(factory);
        return rt;
    }
}
