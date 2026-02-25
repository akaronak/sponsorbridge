package com.eventra.repository;

import com.eventra.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends MongoRepository<Transaction, String> {

    List<Transaction> findByPaymentIdOrderByCreatedAtAsc(String paymentId);

    Page<Transaction> findByPaymentIdOrderByCreatedAtDesc(String paymentId, Pageable pageable);

    Page<Transaction> findByCompanyIdOrderByCreatedAtDesc(String companyId, Pageable pageable);

    Page<Transaction> findByOrganizerIdOrderByCreatedAtDesc(String organizerId, Pageable pageable);

    List<Transaction> findByTypeOrderByCreatedAtDesc(Transaction.TransactionType type);

    List<Transaction> findByTypeAndCreatedAtBetween(
            Transaction.TransactionType type, LocalDateTime from, LocalDateTime to);

    @Query("{'type': 'COMMISSION_DEDUCTION', 'createdAt': {'$gte': ?0, '$lte': ?1}}")
    List<Transaction> findCommissionsBetween(LocalDateTime from, LocalDateTime to);
}
