package com.eventra.repository;

import com.eventra.entity.Payment;
import com.eventra.entity.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {

    // ─── Lookup by gateway IDs ──────────────────────

    Optional<Payment> findByRazorpayOrderId(String razorpayOrderId);

    Optional<Payment> findByRazorpayPaymentId(String razorpayPaymentId);

    Optional<Payment> findByIdempotencyKey(String idempotencyKey);

    // ─── By request ─────────────────────────────────

    List<Payment> findByRequestIdOrderByCreatedAtDesc(String requestId);

    List<Payment> findByRequestIdAndStatus(String requestId, PaymentStatus status);

    // ─── By participant ─────────────────────────────

    Page<Payment> findByCompanyIdOrderByCreatedAtDesc(String companyId, Pageable pageable);

    Page<Payment> findByOrganizerIdOrderByCreatedAtDesc(String organizerId, Pageable pageable);

    // ─── By status ──────────────────────────────────

    List<Payment> findByStatus(PaymentStatus status);

    long countByStatus(PaymentStatus status);

    long countByCompanyId(String companyId);

    // ─── Escrow auto-release scan ───────────────────

    @Query("{'status': 'IN_ESCROW', 'escrowDetails.releaseEligibleAt': {'$lte': ?0}, " +
           "'escrowDetails.autoReleaseAttempted': {'$ne': true}}")
    List<Payment> findEligibleForAutoRelease(LocalDateTime now);

    // ─── Revenue aggregation queries ────────────────

    @Query(value = "{'status': {'$in': ['RELEASED', 'SETTLED']}, 'createdAt': {'$gte': ?0, '$lte': ?1}}",
           count = true)
    long countCompletedPaymentsBetween(LocalDateTime from, LocalDateTime to);

    @Query("{'status': {'$in': ['RELEASED', 'SETTLED']}, 'createdAt': {'$gte': ?0, '$lte': ?1}}")
    List<Payment> findCompletedPaymentsBetween(LocalDateTime from, LocalDateTime to);
}
