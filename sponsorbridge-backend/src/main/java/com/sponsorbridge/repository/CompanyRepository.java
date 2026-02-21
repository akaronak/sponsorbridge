package com.sponsorbridge.repository;

import com.sponsorbridge.entity.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByUserId(Long userId);
    
    Page<Company> findByVerifiedTrue(Pageable pageable);
    
    @Query("SELECT c FROM Company c WHERE c.verified = true " +
           "AND (:location IS NULL OR c.location = :location) " +
           "AND (:industry IS NULL OR c.industry = :industry) " +
           "AND (:eventType IS NULL OR :eventType = ANY(c.preferredEventTypes))")
    Page<Company> searchCompanies(
        @Param("location") String location,
        @Param("industry") String industry,
        @Param("eventType") String eventType,
        Pageable pageable
    );
    
    @Query("SELECT c FROM Company c WHERE c.verified = true " +
           "AND (:location IS NULL OR c.location = :location) " +
           "AND (:industry IS NULL OR c.industry = :industry) " +
           "AND (:sponsorshipType IS NULL OR :sponsorshipType = ANY(c.sponsorshipTypes)) " +
           "AND (:budgetMin IS NULL OR c.budgetMax >= :budgetMin) " +
           "AND (:budgetMax IS NULL OR c.budgetMin <= :budgetMax)")
    Page<Company> searchCompaniesByFilters(
        @Param("location") String location,
        @Param("industry") String industry,
        @Param("sponsorshipType") String sponsorshipType,
        @Param("budgetMin") BigDecimal budgetMin,
        @Param("budgetMax") BigDecimal budgetMax,
        Pageable pageable
    );
    
    List<Company> findByVerifiedFalse();
}
