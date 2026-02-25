package com.eventra.exception;

/**
 * Thrown when a duplicate payment operation is detected via idempotency key.
 */
public class IdempotencyConflictException extends RuntimeException {

    private final String idempotencyKey;
    private final String existingPaymentId;

    public IdempotencyConflictException(String idempotencyKey, String existingPaymentId) {
        super("Duplicate payment request detected: idempotencyKey=%s, existingPayment=%s"
                .formatted(idempotencyKey, existingPaymentId));
        this.idempotencyKey = idempotencyKey;
        this.existingPaymentId = existingPaymentId;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public String getExistingPaymentId() {
        return existingPaymentId;
    }
}
