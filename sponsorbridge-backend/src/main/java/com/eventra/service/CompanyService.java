package com.eventra.service;

import com.eventra.dto.CompanyDTO;
import com.eventra.dto.CompanyRequest;
import com.eventra.entity.Company;
import com.eventra.mapper.CompanyMapper;
import com.eventra.repository.CompanyRepository;
import com.eventra.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.support.PageableExecutionUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Company (Sponsor) management.
 *
 * <h3>Caching strategy:</h3>
 * <ul>
 *   <li>{@code sponsors} cache: All verified companies listing (10 min TTL)</li>
 *   <li>{@code sponsor-detail} cache: Individual company by ID (5 min TTL)</li>
 *   <li>Eviction: On create, update, approve, reject — cascading evict both caches</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
@Transactional
public class CompanyService {
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final CompanyMapper companyMapper;
    private final MongoTemplate mongoTemplate;

    @Caching(evict = {
        @CacheEvict(value = "sponsors", allEntries = true)
    })
    public CompanyDTO createCompany(String userId, CompanyRequest request) {
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (companyRepository.findByUserId(userId).isPresent()) {
            throw new RuntimeException("User already has a company profile");
        }

        Company company = companyMapper.toEntity(request);
        company.setUserId(userId);
        company.setVerified(false);

        Company saved = companyRepository.save(company);
        return companyMapper.toDTO(saved);
    }

    @Cacheable(value = "sponsor-detail", key = "#companyId")
    public CompanyDTO getCompanyById(String companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        return companyMapper.toDTO(company);
    }

    @Caching(evict = {
        @CacheEvict(value = "sponsor-detail", key = "#companyId"),
        @CacheEvict(value = "sponsors", allEntries = true)
    })
    public CompanyDTO updateCompany(String companyId, String userId, CompanyRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));

        if (!company.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only update your own company profile");
        }

        companyMapper.updateEntityFromRequest(request, company);
        Company updated = companyRepository.save(company);
        return companyMapper.toDTO(updated);
    }

    public Page<CompanyDTO> searchCompanies(String location, String industry, String eventType, Pageable pageable) {
        Criteria criteria = Criteria.where("verified").is(true);

        if (location != null) criteria.and("location").is(location);
        if (industry != null) criteria.and("industry").is(industry);
        if (eventType != null) criteria.and("preferredEventTypes").in(eventType);

        Query query = new Query(criteria).with(pageable);
        List<Company> companies = mongoTemplate.find(query, Company.class);
        long count = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Company.class);

        return PageableExecutionUtils.getPage(companies, pageable, () -> count)
                .map(companyMapper::toDTO);
    }

    public Page<CompanyDTO> searchCompaniesByFilters(String location, String industry, String sponsorshipType,
                                                      BigDecimal budgetMin, BigDecimal budgetMax, Pageable pageable) {
        Criteria criteria = Criteria.where("verified").is(true);

        if (location != null) criteria.and("location").is(location);
        if (industry != null) criteria.and("industry").is(industry);
        if (sponsorshipType != null) criteria.and("sponsorshipTypes").in(sponsorshipType);
        if (budgetMin != null) criteria.and("budgetMax").gte(budgetMin);
        if (budgetMax != null) criteria.and("budgetMin").lte(budgetMax);

        Query query = new Query(criteria).with(pageable);
        List<Company> companies = mongoTemplate.find(query, Company.class);
        long count = mongoTemplate.count(Query.of(query).limit(-1).skip(-1), Company.class);

        return PageableExecutionUtils.getPage(companies, pageable, () -> count)
                .map(companyMapper::toDTO);
    }

    public Page<CompanyDTO> getAllVerifiedCompanies(Pageable pageable) {
        Page<Company> companies = companyRepository.findByVerifiedTrue(pageable);
        return companies.map(companyMapper::toDTO);
    }

    public List<CompanyDTO> getPendingCompanies() {
        return companyRepository.findByVerifiedFalse().stream()
                .map(companyMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Caching(evict = {
        @CacheEvict(value = "sponsor-detail", key = "#companyId"),
        @CacheEvict(value = "sponsors", allEntries = true)
    })
    public CompanyDTO approveCompany(String companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        company.setVerified(true);
        return companyMapper.toDTO(companyRepository.save(company));
    }

    @Caching(evict = {
        @CacheEvict(value = "sponsor-detail", key = "#companyId"),
        @CacheEvict(value = "sponsors", allEntries = true)
    })
    public CompanyDTO rejectCompany(String companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        company.setVerified(false);
        return companyMapper.toDTO(companyRepository.save(company));
    }
}
