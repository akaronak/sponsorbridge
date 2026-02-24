package com.eventra.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Frontend sends this after Razorpay checkout completes.
 * Backend verifies the signature — NEVER trusts the client's success callback alone.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentVerificationRequest {

    @NotBlank(message = "Razorpay order ID is required")
    private String razorpayOrderId;

    @NotBlank(message = "Razorpay payment ID is required")
    private String razorpayPaymentId;

    @NotBlank(message = "Razorpay signature is required")
    private String razorpaySignature;
}
