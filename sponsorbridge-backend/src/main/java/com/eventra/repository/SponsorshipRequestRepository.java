package com.eventra.repository;

import com.eventra.entity.RequestStatus;
import com.eventra.entity.SponsorshipRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface SponsorshipRequestRepository extends JpaRepository<SponsorshipRequest, Long> {
    Page<SponsorshipRequest> findByOrganizerIdOrderByCreatedAtDesc(Long organizerId, Pageable pageable);
    
    Page<SponsorshipRequest> findByOrganizerIdAndStatusOrderByCreatedAtDesc(
        Long organizerId, 
        RequestStatus status, 
        Pageable pageable
    );
    
    Page<SponsorshipRequest> findByCompanyIdOrderByCreatedAtDesc(Long companyId, Pageable pageable);
    
    Page<SponsorshipRequest> findByCompanyIdAndStatusOrderByCreatedAtDesc(
        Long companyId, 
        RequestStatus status, 
        Pageable pageable
    );
    
    @Query("SELECT COUNT(r) > 0 FROM SponsorshipRequest r " +
           "WHERE r.organizer.id = :organizerId " +
           "AND r.company.id = :companyId " +
           "AND r.createdAt >= :thirtyDaysAgo")
    boolean existsDuplicateRequest(
        @Param("organizerId") Long organizerId,
        @Param("companyId") Long companyId,
        @Param("thirtyDaysAgo") LocalDateTime thirtyDaysAgo
    );
    
    Optional<SponsorshipRequest> findByIdAndCompanyId(Long requestId, Long companyId);
}
