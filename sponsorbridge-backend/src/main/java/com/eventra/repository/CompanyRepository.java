package com.eventra.repository;

import com.eventra.entity.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends MongoRepository<Company, String> {
    Optional<Company> findByUserId(String userId);
    Page<Company> findByVerifiedTrue(Pageable pageable);
    List<Company> findByVerifiedFalse();
}
