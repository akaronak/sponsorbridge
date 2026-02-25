package com.eventra.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.math.BigDecimal;

/**
 * Request to create a Razorpay payment order.
 * Backend is the source of truth — amount is validated server-side against the SponsorshipRequest.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePaymentOrderRequest {

    @NotBlank(message = "Sponsorship request ID is required")
    private String requestId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;

    @Builder.Default
    private String currency = "INR";

    /** Client-generated UUID v4 for idempotency. If omitted, server generates one. */
    private String idempotencyKey;

    private String description;
}
