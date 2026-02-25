package com.eventra.config;

import com.eventra.filter.WebSocketMdcInterceptor;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.concurrent.atomic.AtomicLong;

/**
 * Central observability configuration for the Eventra platform.
 *
 * <h3>Responsibilities:</h3>
 * <ul>
 *   <li>Custom Micrometer metrics (payments, messaging, security, escrow)</li>
 *   <li>WebSocket MDC interceptor registration</li>
 *   <li>Atomic gauges for real-time connection tracking</li>
 * </ul>
 *
 * <h3>Metric naming convention:</h3>
 * <pre>
 *   eventra.{domain}.{action}
 *   e.g. eventra.payment.created, eventra.ws.messages.sent
 * </pre>
 *
 * <h3>Tags:</h3>
 * <ul>
 *   <li><b>status</b> — success, failure, timeout</li>
 *   <li><b>type</b>   — domain-specific discriminator</li>
 *   <li><b>tier</b>   — rate limit tier</li>
 * </ul>
 */
@Configuration
public class ObservabilityConfig implements WebSocketMessageBrokerConfigurer {

    // ── Atomic gauges for real-time tracking ──────────────────────
    private final AtomicLong activeWsSessions = new AtomicLong(0);
    private final AtomicLong activeConversations = new AtomicLong(0);

    // ═══════════════════════════════════════════════════════════════
    //  WebSocket MDC Interceptor
    // ═══════════════════════════════════════════════════════════════

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new WebSocketMdcInterceptor());
    }

    // ═══════════════════════════════════════════════════════════════
    //  PAYMENT METRICS
    // ═══════════════════════════════════════════════════════════════

    /** Count of payment orders created, tagged by status */
    @Bean
    public Counter paymentCreatedCounter(MeterRegistry registry) {
        return Counter.builder("eventra.payment.created")
                .description("Payment orders created")
                .tag("status", "initiated")
                .register(registry);
    }

    /** Count of payment verifications, tagged by outcome */
    @Bean
    public Counter paymentVerifiedCounter(MeterRegistry registry) {
        return Counter.builder("eventra.payment.verified")
                .description("Payment verifications completed")
                .register(registry);
    }

    /** Count of payment failures */
    @Bean
    public Counter paymentFailedCounter(MeterRegistry registry) {
        return Counter.builder("eventra.payment.failed")
                .description("Payment failures")
                .register(registry);
    }

    /** Timer for payment verification latency */
    @Bean
    public Timer paymentVerificationTimer(MeterRegistry registry) {
        return Timer.builder("eventra.payment.verification.duration")
                .description("Payment verification latency")
                .publishPercentiles(0.5, 0.95, 0.99)
                .register(registry);
    }

    // ═══════════════════════════════════════════════════════════════
    //  ESCROW METRICS
    // ═══════════════════════════════════════════════════════════════

    /** Count of escrow state transitions */
    @Bean
    public Counter escrowHeldCounter(MeterRegistry registry) {
        return Counter.builder("eventra.escrow.held")
                .description("Escrow holds created")
                .register(registry);
    }

    @Bean
    public Counter escrowReleasedCounter(MeterRegistry registry) {
        return Counter.builder("eventra.escrow.released")
                .description("Escrow funds released")
                .register(registry);
    }

    @Bean
    public Counter escrowRefundedCounter(MeterRegistry registry) {
        return Counter.builder("eventra.escrow.refunded")
                .description("Escrow funds refunded")
                .register(registry);
    }

    /** Timer for escrow auto-release cron job duration */
    @Bean
    public Timer escrowAutoReleaseTimer(MeterRegistry registry) {
        return Timer.builder("eventra.escrow.autorelease.duration")
                .description("Escrow auto-release job execution time")
                .register(registry);
    }

    // ═══════════════════════════════════════════════════════════════
    //  WEBHOOK METRICS
    // ═══════════════════════════════════════════════════════════════

    @Bean
    public Counter webhookReceivedCounter(MeterRegistry registry) {
        return Counter.builder("eventra.webhook.received")
                .description("Webhooks received from payment gateway")
                .register(registry);
    }

    @Bean
    public Counter webhookFailedCounter(MeterRegistry registry) {
        return Counter.builder("eventra.webhook.failed")
                .description("Webhook processing failures")
                .register(registry);
    }

    @Bean
    public Counter webhookDuplicateCounter(MeterRegistry registry) {
        return Counter.builder("eventra.webhook.duplicate")
                .description("Duplicate webhooks blocked by idempotency")
                .register(registry);
    }

    // ═══════════════════════════════════════════════════════════════
    //  WEBSOCKET / MESSAGING METRICS
    // ═══════════════════════════════════════════════════════════════

    /** Gauge: currently active WebSocket sessions */
    @Bean
    public AtomicLong activeWebSocketSessions(MeterRegistry registry) {
        Gauge.builder("eventra.ws.sessions.active", activeWsSessions, AtomicLong::get)
                .description("Active WebSocket sessions")
                .register(registry);
        return activeWsSessions;
    }

    /** Gauge: active conversations with subscribers */
    @Bean
    public AtomicLong activeConversationGauge(MeterRegistry registry) {
        Gauge.builder("eventra.ws.conversations.active", activeConversations, AtomicLong::get)
                .description("Active conversations with subscribers")
                .register(registry);
        return activeConversations;
    }

    /** Counter: STOMP messages sent */
    @Bean
    public Counter wsMessagesSentCounter(MeterRegistry registry) {
        return Counter.builder("eventra.ws.messages.sent")
                .description("STOMP messages sent via broker")
                .register(registry);
    }

    /** Counter: STOMP messages received */
    @Bean
    public Counter wsMessagesReceivedCounter(MeterRegistry registry) {
        return Counter.builder("eventra.ws.messages.received")
                .description("STOMP messages received from clients")
                .register(registry);
    }

    /** Counter: WebSocket connection errors */
    @Bean
    public Counter wsConnectionErrorCounter(MeterRegistry registry) {
        return Counter.builder("eventra.ws.connection.errors")
                .description("WebSocket connection failures")
                .register(registry);
    }

    // ═══════════════════════════════════════════════════════════════
    //  SECURITY METRICS
    // ═══════════════════════════════════════════════════════════════

    /** Counter: failed login attempts */
    @Bean
    public Counter authFailedLoginCounter(MeterRegistry registry) {
        return Counter.builder("eventra.auth.login.failed")
                .description("Failed login attempts")
                .register(registry);
    }

    /** Counter: successful logins */
    @Bean
    public Counter authSuccessLoginCounter(MeterRegistry registry) {
        return Counter.builder("eventra.auth.login.success")
                .description("Successful logins")
                .register(registry);
    }

    /** Counter: JWT validation failures */
    @Bean
    public Counter jwtValidationFailedCounter(MeterRegistry registry) {
        return Counter.builder("eventra.auth.jwt.validation.failed")
                .description("JWT validation failures")
                .register(registry);
    }

    /** Counter: rate limit blocks */
    @Bean
    public Counter rateLimitBlockedCounter(MeterRegistry registry) {
        return Counter.builder("eventra.ratelimit.blocked")
                .description("Requests blocked by rate limiting")
                .register(registry);
    }

    /** Counter: rate limit blocks by tier */
    @Bean
    public Counter rateLimitBlockedByTierCounter(MeterRegistry registry) {
        return Counter.builder("eventra.ratelimit.blocked.by_tier")
                .description("Rate limit blocks tagged by tier")
                .register(registry);
    }

    // ═══════════════════════════════════════════════════════════════
    //  REGISTRATION METRICS
    // ═══════════════════════════════════════════════════════════════

    @Bean
    public Counter registrationCounter(MeterRegistry registry) {
        return Counter.builder("eventra.auth.registration")
                .description("User registrations")
                .register(registry);
    }
}
