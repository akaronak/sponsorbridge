package com.eventra.dto;

import com.eventra.entity.PaymentStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDTO {
    private String id;
    private String requestId;
    private String companyId;
    private String organizerId;
    private BigDecimal amount;
    private BigDecimal platformCommission;
    private BigDecimal organizerPayout;
    private BigDecimal refundedAmount;
    private String currency;
    private PaymentStatus status;
    private String razorpayOrderId;
    private String description;
    private String paymentMethod;

    // Escrow info
    private LocalDateTime escrowStartedAt;
    private LocalDateTime releaseEligibleAt;
    private Integer escrowHoldDays;

    // Timestamps
    private LocalDateTime capturedAt;
    private LocalDateTime releasedAt;
    private LocalDateTime settledAt;
    private LocalDateTime createdAt;
}
