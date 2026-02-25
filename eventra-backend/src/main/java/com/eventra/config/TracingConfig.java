package com.eventra.config;

import io.micrometer.observation.ObservationRegistry;
import io.micrometer.observation.aop.ObservedAspect;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Distributed tracing configuration using Micrometer Tracing + OpenTelemetry.
 *
 * <h3>Architecture:</h3>
 * <pre>
 *   Spring Boot 3 → Micrometer Tracing → OpenTelemetry Bridge → OTLP Exporter → Jaeger
 * </pre>
 *
 * <h3>Trace propagation:</h3>
 * <ul>
 *   <li>HTTP requests: W3C Trace Context headers (traceparent/tracestate)</li>
 *   <li>Mongo operations: Auto-instrumented via Micrometer observation</li>
 *   <li>Redis operations: Auto-instrumented via Lettuce tracing</li>
 *   <li>WebSocket: Manual MDC propagation via WebSocketMdcInterceptor</li>
 * </ul>
 *
 * <h3>Key traced flows:</h3>
 * <ul>
 *   <li>Login → JWT generation</li>
 *   <li>Payment order → Razorpay → verification → escrow hold</li>
 *   <li>Webhook receive → signature verify → payment update</li>
 *   <li>Message send → broker relay → delivery</li>
 *   <li>Escrow auto-release cron job</li>
 * </ul>
 *
 * <h3>Configuration (application.properties):</h3>
 * <pre>
 *   management.tracing.enabled=true
 *   management.tracing.sampling.probability=1.0  (dev) / 0.1 (prod)
 *   management.otlp.tracing.endpoint=http://jaeger:4318/v1/traces
 * </pre>
 */
@Configuration
public class TracingConfig {

    /**
     * Enable @Observed annotation support for custom span creation.
     *
     * Usage:
     * <pre>
     *   @Observed(name = "payment.verify", contextualName = "verify-razorpay-payment")
     *   public PaymentResult verifyPayment(String orderId) { ... }
     * </pre>
     */
    @Bean
    @ConditionalOnMissingBean
    public ObservedAspect observedAspect(ObservationRegistry registry) {
        return new ObservedAspect(registry);
    }
}
