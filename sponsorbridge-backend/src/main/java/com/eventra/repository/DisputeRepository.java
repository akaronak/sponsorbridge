package com.eventra.repository;

import com.eventra.entity.Dispute;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DisputeRepository extends MongoRepository<Dispute, String> {

    Optional<Dispute> findByPaymentId(String paymentId);

    Page<Dispute> findByStatusOrderByCreatedAtDesc(Dispute.DisputeStatus status, Pageable pageable);

    List<Dispute> findByCompanyIdOrderByCreatedAtDesc(String companyId);

    List<Dispute> findByOrganizerIdOrderByCreatedAtDesc(String organizerId);

    @Query("{'status': 'OPEN', 'autoResolveAt': {'$lte': ?0}}")
    List<Dispute> findExpiredOpenDisputes(LocalDateTime now);

    long countByStatus(Dispute.DisputeStatus status);
}
