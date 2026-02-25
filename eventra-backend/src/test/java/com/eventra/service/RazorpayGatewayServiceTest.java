package com.eventra.service;

import com.eventra.config.PaymentProperties;
import com.eventra.exception.PaymentException;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Refund;
import org.json.JSONObject;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.math.RoundingMode;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for RazorpayGatewayService utility methods.
 * (Integration tests for actual Razorpay API calls would use test keys.)
 */
@DisplayName("RazorpayGatewayService")
class RazorpayGatewayServiceTest {

    @Test
    @DisplayName("toPaise converts rupees to paise correctly")
    void toPaiseConversion() {
        assertEquals(10000L, RazorpayGatewayService.toPaise(BigDecimal.valueOf(100)));
        assertEquals(999L, RazorpayGatewayService.toPaise(new BigDecimal("9.99")));
        assertEquals(50000L, RazorpayGatewayService.toPaise(BigDecimal.valueOf(500)));
        assertEquals(0L, RazorpayGatewayService.toPaise(BigDecimal.ZERO));
        assertEquals(1L, RazorpayGatewayService.toPaise(new BigDecimal("0.01")));
    }

    @Test
    @DisplayName("fromPaise converts paise to rupees correctly with proper scale")
    void fromPaiseConversion() {
        assertEquals(new BigDecimal("100.00"), RazorpayGatewayService.fromPaise(10000));
        assertEquals(new BigDecimal("9.99"), RazorpayGatewayService.fromPaise(999));
        assertEquals(new BigDecimal("0.01"), RazorpayGatewayService.fromPaise(1));
        assertEquals(new BigDecimal("0.00"), RazorpayGatewayService.fromPaise(0));
    }

    @Test
    @DisplayName("fromPaise returns BigDecimal with scale 2")
    void fromPaiseScale() {
        BigDecimal result = RazorpayGatewayService.fromPaise(10000);
        assertEquals(2, result.scale());
    }

    @Test
    @DisplayName("toPaise → fromPaise roundtrip preserves value")
    void roundTrip() {
        BigDecimal original = new BigDecimal("123.45");
        long paise = RazorpayGatewayService.toPaise(original);
        BigDecimal roundTripped = RazorpayGatewayService.fromPaise(paise);
        assertEquals(0, original.compareTo(roundTripped));
    }

    @Test
    @DisplayName("toPaise with large amount")
    void toPaiseLargeAmount() {
        BigDecimal largeAmount = new BigDecimal("10000000.00");
        long paise = RazorpayGatewayService.toPaise(largeAmount);
        assertEquals(1000000000L, paise);
    }
}
