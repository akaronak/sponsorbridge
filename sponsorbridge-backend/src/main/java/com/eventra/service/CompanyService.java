package com.eventra.service;

import com.eventra.dto.CompanyDTO;
import com.eventra.dto.CompanyRequest;
import com.eventra.entity.Company;
import com.eventra.entity.User;
import com.eventra.mapper.CompanyMapper;
import com.eventra.repository.CompanyRepository;
import com.eventra.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CompanyService {
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final CompanyMapper companyMapper;

    public CompanyDTO createCompany(Long userId, CompanyRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (companyRepository.findByUserId(userId).isPresent()) {
            throw new RuntimeException("User already has a company profile");
        }
        
        Company company = companyMapper.toEntity(request);
        company.setUser(user);
        company.setVerified(false);
        
        Company saved = companyRepository.save(company);
        return companyMapper.toDTO(saved);
    }

    public CompanyDTO getCompanyById(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        return companyMapper.toDTO(company);
    }

    public CompanyDTO updateCompany(Long companyId, Long userId, CompanyRequest request) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        
        if (!company.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized: You can only update your own company profile");
        }
        
        companyMapper.updateEntityFromRequest(request, company);
        Company updated = companyRepository.save(company);
        return companyMapper.toDTO(updated);
    }

    public Page<CompanyDTO> searchCompanies(String location, String industry, String eventType, Pageable pageable) {
        Page<Company> companies = companyRepository.searchCompanies(location, industry, eventType, pageable);
        return companies.map(companyMapper::toDTO);
    }

    public Page<CompanyDTO> searchCompaniesByFilters(String location, String industry, String sponsorshipType, 
                                                      BigDecimal budgetMin, BigDecimal budgetMax, Pageable pageable) {
        Page<Company> companies = companyRepository.searchCompaniesByFilters(location, industry, sponsorshipType, budgetMin, budgetMax, pageable);
        return companies.map(companyMapper::toDTO);
    }

    public Page<CompanyDTO> getAllVerifiedCompanies(Pageable pageable) {
        Page<Company> companies = companyRepository.findByVerifiedTrue(pageable);
        return companies.map(companyMapper::toDTO);
    }

    public List<CompanyDTO> getPendingCompanies() {
        List<Company> companies = companyRepository.findByVerifiedFalse();
        return companies.stream()
                .map(companyMapper::toDTO)
                .collect(Collectors.toList());
    }

    public CompanyDTO approveCompany(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        company.setVerified(true);
        Company updated = companyRepository.save(company);
        return companyMapper.toDTO(updated);
    }

    public CompanyDTO rejectCompany(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        company.setVerified(false);
        Company updated = companyRepository.save(company);
        return companyMapper.toDTO(updated);
    }
}
