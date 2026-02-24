package com.eventra.service;

import com.eventra.config.PaymentProperties;
import com.eventra.exception.PaymentException;
import com.razorpay.Order;
import com.razorpay.Payment;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Refund;
import com.razorpay.Utils;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * Low-level Razorpay gateway integration.
 *
 * <p>This service is the ONLY place that talks to the Razorpay SDK.
 * All financial services compose this instead of using RazorpayClient directly.</p>
 *
 * <h3>Security principles:</h3>
 * <ul>
 *   <li>Backend creates orders — frontend NEVER specifies amount to Razorpay</li>
 *   <li>Webhook signature verification uses HMAC-SHA256</li>
 *   <li>Payment amount is re-verified after capture against our DB</li>
 *   <li>All errors are logged with structured fields for audit</li>
 * </ul>
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class RazorpayGatewayService {

    private final PaymentProperties paymentProperties;
    private RazorpayClient razorpayClient;

    @PostConstruct
    public void init() {
        try {
            this.razorpayClient = new RazorpayClient(
                    paymentProperties.getRazorpayKeyId(),
                    paymentProperties.getRazorpayKeySecret()
            );
            log.info("RazorpayClient initialized successfully");
        } catch (RazorpayException e) {
            log.error("Failed to initialize RazorpayClient: {}", e.getMessage());
            throw new PaymentException("Razorpay initialization failed", e);
        }
    }

    /**
     * Create a Razorpay order. Amount is in paise (INR smallest unit).
     *
     * @param amountInPaise  amount in paise (₹100 = 10000 paise)
     * @param currency       currency code (INR)
     * @param receiptId      internal receipt/payment ID
     * @param notes          metadata to attach to the order
     * @return Razorpay Order object
     */
    public Order createOrder(long amountInPaise, String currency, String receiptId, JSONObject notes) {
        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", currency);
            orderRequest.put("receipt", receiptId);
            orderRequest.put("payment_capture", 1); // Auto-capture
            if (notes != null) {
                orderRequest.put("notes", notes);
            }

            Order order = razorpayClient.orders.create(orderRequest);
            log.info("Razorpay order created: orderId={}, amount={}, receipt={}",
                    order.get("id"), amountInPaise, receiptId);
            return order;
        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed: receipt={}, error={}", receiptId, e.getMessage());
            throw new PaymentException("Failed to create Razorpay order: " + e.getMessage(), e);
        }
    }

    /**
     * Verify Razorpay payment signature (HMAC-SHA256).
     *
     * @return true if signature is valid
     */
    public boolean verifyPaymentSignature(String orderId, String paymentId, String signature) {
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", orderId);
            attributes.put("razorpay_payment_id", paymentId);
            attributes.put("razorpay_signature", signature);

            boolean valid = Utils.verifyPaymentSignature(attributes, paymentProperties.getRazorpayKeySecret());
            log.info("Signature verification: orderId={}, paymentId={}, valid={}", orderId, paymentId, valid);
            return valid;
        } catch (RazorpayException e) {
            log.error("Signature verification error: orderId={}, error={}", orderId, e.getMessage());
            return false;
        }
    }

    /**
     * Verify webhook signature.
     */
    public boolean verifyWebhookSignature(String payload, String signature) {
        try {
            return Utils.verifyWebhookSignature(payload, signature,
                    paymentProperties.getRazorpayWebhookSecret());
        } catch (RazorpayException e) {
            log.error("Webhook signature verification failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Fetch payment details from Razorpay.
     */
    public Payment fetchPayment(String razorpayPaymentId) {
        try {
            return razorpayClient.payments.fetch(razorpayPaymentId);
        } catch (RazorpayException e) {
            log.error("Failed to fetch Razorpay payment: paymentId={}, error={}",
                    razorpayPaymentId, e.getMessage());
            throw new PaymentException("Failed to fetch payment from Razorpay: " + e.getMessage(), e);
        }
    }

    /**
     * Initiate a refund via Razorpay.
     *
     * @param razorpayPaymentId the Razorpay payment ID to refund
     * @param amountInPaise     refund amount in paise (null for full refund)
     * @param reason            refund reason
     * @return Razorpay Refund object
     */
    public Refund createRefund(String razorpayPaymentId, Long amountInPaise, String reason) {
        try {
            JSONObject refundRequest = new JSONObject();
            if (amountInPaise != null) {
                refundRequest.put("amount", amountInPaise);
            }
            refundRequest.put("speed", "normal");
            JSONObject notes = new JSONObject();
            notes.put("reason", reason);
            refundRequest.put("notes", notes);

            Refund refund = razorpayClient.payments.refund(razorpayPaymentId, refundRequest);
            log.info("Razorpay refund created: refundId={}, paymentId={}, amount={}",
                    refund.get("id"), razorpayPaymentId, amountInPaise);
            return refund;
        } catch (RazorpayException e) {
            log.error("Razorpay refund failed: paymentId={}, amount={}, error={}",
                    razorpayPaymentId, amountInPaise, e.getMessage());
            throw new PaymentException("Failed to process refund: " + e.getMessage(), e);
        }
    }

    /**
     * Convert BigDecimal amount (rupees) to paise (long).
     */
    public static long toPaise(BigDecimal amount) {
        return amount.multiply(BigDecimal.valueOf(100)).longValueExact();
    }

    /**
     * Convert paise (long) to BigDecimal amount (rupees).
     */
    public static BigDecimal fromPaise(long paise) {
        return BigDecimal.valueOf(paise).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
    }

    public String getKeyId() {
        return paymentProperties.getRazorpayKeyId();
    }
}
