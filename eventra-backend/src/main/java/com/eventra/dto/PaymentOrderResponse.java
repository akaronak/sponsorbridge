package com.eventra.dto;

import lombok.*;

import java.math.BigDecimal;

/**
 * Response returned after creating a Razorpay order.
 * Frontend uses razorpayOrderId + razorpayKeyId to open the checkout widget.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentOrderResponse {
    private String paymentId;
    private String razorpayOrderId;
    private String razorpayKeyId;
    private BigDecimal amount;
    private String currency;
    private String status;
}
