package com.eventra.repository;

import com.eventra.entity.RequestStatus;
import com.eventra.entity.SponsorshipRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface SponsorshipRequestRepository extends MongoRepository<SponsorshipRequest, String> {

    Page<SponsorshipRequest> findByOrganizerIdOrderByCreatedAtDesc(String organizerId, Pageable pageable);

    Page<SponsorshipRequest> findByOrganizerIdAndStatusOrderByCreatedAtDesc(
        String organizerId, RequestStatus status, Pageable pageable);

    Page<SponsorshipRequest> findByCompanyIdOrderByCreatedAtDesc(String companyId, Pageable pageable);

    Page<SponsorshipRequest> findByCompanyIdAndStatusOrderByCreatedAtDesc(
        String companyId, RequestStatus status, Pageable pageable);

    @Query(value = "{'organizerId': ?0, 'companyId': ?1, 'createdAt': {'$gte': ?2}}", count = true)
    long countDuplicateRequests(String organizerId, String companyId, LocalDateTime thirtyDaysAgo);

    Optional<SponsorshipRequest> findByIdAndCompanyId(String requestId, String companyId);
}
