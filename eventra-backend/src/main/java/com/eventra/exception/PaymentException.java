package com.eventra.exception;

/**
 * Thrown when a payment operation fails (gateway error, validation failure, etc.).
 */
public class PaymentException extends RuntimeException {

    private final String paymentId;
    private final String errorCode;

    public PaymentException(String message) {
        super(message);
        this.paymentId = null;
        this.errorCode = "PAYMENT_ERROR";
    }

    public PaymentException(String message, String paymentId) {
        super(message);
        this.paymentId = paymentId;
        this.errorCode = "PAYMENT_ERROR";
    }

    public PaymentException(String message, String paymentId, String errorCode) {
        super(message);
        this.paymentId = paymentId;
        this.errorCode = errorCode;
    }

    public PaymentException(String message, Throwable cause) {
        super(message, cause);
        this.paymentId = null;
        this.errorCode = "PAYMENT_ERROR";
    }

    public String getPaymentId() {
        return paymentId;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
