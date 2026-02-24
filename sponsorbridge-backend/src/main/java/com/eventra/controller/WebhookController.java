package com.eventra.controller;

import com.eventra.infrastructure.IdempotencyService;
import com.eventra.service.PaymentService;
import com.eventra.service.RazorpayGatewayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Razorpay webhook controller.
 *
 * <h3>Security:</h3>
 * <ul>
 *   <li>No JWT authentication — webhooks come from Razorpay servers</li>
 *   <li>Request verified via HMAC-SHA256 signature (X-Razorpay-Signature header)</li>
 *   <li>Idempotent — re-processing the same event is safe (Redis dedup)</li>
 * </ul>
 *
 * <h3>Contract:</h3>
 * <ul>
 *   <li>Always return 200 OK to Razorpay (prevent retries unless actually down)</li>
 *   <li>Process asynchronously if needed — never timeout Razorpay webhooks</li>
 * </ul>
 */
@RestController
@RequestMapping("/api/webhooks")
@Slf4j
@RequiredArgsConstructor
public class WebhookController {

    private final PaymentService paymentService;
    private final RazorpayGatewayService razorpayGateway;
    private final IdempotencyService idempotencyService;

    /**
     * Razorpay webhook endpoint.
     *
     * <p>Events handled:
     * <ul>
     *   <li>payment.captured — payment successfully captured</li>
     *   <li>payment.failed — payment failed</li>
     *   <li>refund.created — refund processed</li>
     * </ul>
     *
     * @param payload raw JSON request body
     * @param signature X-Razorpay-Signature header
     */
    @PostMapping("/razorpay")
    public ResponseEntity<String> handleRazorpayWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature) {

        // 1. Verify webhook signature
        if (signature == null || signature.isBlank()) {
            log.warn("Webhook received without signature — rejecting");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing signature");
        }

        if (!razorpayGateway.verifyWebhookSignature(payload, signature)) {
            log.error("Webhook signature verification FAILED — potential tampering");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid signature");
        }

        // 2. Parse event
        JSONObject event;
        try {
            event = new JSONObject(payload);
        } catch (Exception e) {
            log.error("Failed to parse webhook payload: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Invalid JSON");
        }

        String eventType = event.optString("event", "unknown");
        String eventId = event.optString("id", ""); // Razorpay event ID

        // 3. Idempotency check — prevent double-processing
        if (!eventId.isBlank() && !idempotencyService.markWebhookProcessed("event:" + eventId)) {
            log.info("Duplicate webhook event — already processed: eventId={}, type={}", eventId, eventType);
            return ResponseEntity.ok("Already processed");
        }

        // 4. Process event
        try {
            log.info("Processing webhook: eventId={}, type={}", eventId, eventType);
            paymentService.processWebhookEvent(eventType, event);
            return ResponseEntity.ok("OK");
        } catch (Exception e) {
            log.error("Webhook processing error: eventId={}, type={}, error={}",
                    eventId, eventType, e.getMessage(), e);
            // Still return 200 to prevent Razorpay from retrying
            // The error is logged and can be investigated manually
            return ResponseEntity.ok("Processed with errors");
        }
    }
}
