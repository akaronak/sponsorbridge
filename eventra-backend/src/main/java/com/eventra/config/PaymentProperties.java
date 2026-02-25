package com.eventra.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

import java.math.BigDecimal;

/**
 * Razorpay & escrow configuration properties.
 *
 * <p>All secrets must be injected via environment variables in production:</p>
 * <pre>
 * RAZORPAY_KEY_ID=rzp_live_xxx
 * RAZORPAY_KEY_SECRET=xxx
 * RAZORPAY_WEBHOOK_SECRET=xxx
 * </pre>
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "payment")
@Validated
public class PaymentProperties {

    // ─── Razorpay credentials ───────────────────────

    private String razorpayKeyId;
    private String razorpayKeySecret;
    private String razorpayWebhookSecret;

    // ─── Escrow configuration ───────────────────────

    /** Days to hold funds in escrow before auto-release (default: 7) */
    private int escrowHoldDays = 7;

    /** Days before a dispute auto-resolves if no admin action (default: 14) */
    private int disputeAutoResolveDays = 14;

    // ─── Commission ─────────────────────────────────

    /** Platform commission percentage (e.g., 10.0 = 10%) */
    private BigDecimal commissionPercent = new BigDecimal("10.0");

    /** Minimum commission amount per transaction */
    private BigDecimal minCommission = new BigDecimal("1.00");

    // ─── Safety ─────────────────────────────────────

    /** Maximum single payment amount (fraud guard) */
    private BigDecimal maxPaymentAmount = new BigDecimal("10000000.00");

    /** Idempotency key TTL in hours (Redis) */
    private int idempotencyKeyTtlHours = 48;

    /** Maximum webhook replay window in seconds */
    private int webhookReplayWindowSeconds = 300;
}
