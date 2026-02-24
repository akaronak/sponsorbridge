package com.eventra.dto;

import lombok.*;

import java.math.BigDecimal;

/**
 * Revenue analytics response for admin dashboard.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueStatsDTO {
    /** Gross Merchandise Value — total payment volume */
    private BigDecimal gmv;

    /** Total platform commission earned */
    private BigDecimal platformRevenue;

    /** Total currently held in escrow */
    private BigDecimal escrowBalance;

    /** Total refunded amount */
    private BigDecimal totalRefunded;

    /** Total released to organizers */
    private BigDecimal totalPayouts;

    /** Number of completed payments */
    private long completedPayments;

    /** Number of active disputes */
    private long activeDisputes;

    /** Refund rate (refunded / total) */
    private BigDecimal refundRate;

    /** Failed transaction rate */
    private BigDecimal failureRate;
}
