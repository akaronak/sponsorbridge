package com.eventra.controller;

import com.eventra.dto.CompanyDTO;
import com.eventra.dto.CompanyRequest;
import com.eventra.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {
    private final CompanyService companyService;

    @PostMapping
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<CompanyDTO> createCompany(@Valid @RequestBody CompanyRequest request, Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        CompanyDTO company = companyService.createCompany(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(company);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyDTO> getCompanyById(@PathVariable Long id) {
        CompanyDTO company = companyService.getCompanyById(id);
        return ResponseEntity.ok(company);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('COMPANY')")
    public ResponseEntity<CompanyDTO> updateCompany(@PathVariable Long id, @Valid @RequestBody CompanyRequest request, Authentication authentication) {
        Long userId = Long.parseLong(authentication.getName());
        CompanyDTO company = companyService.updateCompany(id, userId, request);
        return ResponseEntity.ok(company);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<CompanyDTO>> searchCompanies(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String industry,
            @RequestParam(required = false) String eventType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CompanyDTO> companies = companyService.searchCompanies(location, industry, eventType, pageable);
        return ResponseEntity.ok(companies);
    }

    @GetMapping("/search/filters")
    public ResponseEntity<Page<CompanyDTO>> searchCompaniesByFilters(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String industry,
            @RequestParam(required = false) String sponsorshipType,
            @RequestParam(required = false) BigDecimal budgetMin,
            @RequestParam(required = false) BigDecimal budgetMax,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CompanyDTO> companies = companyService.searchCompaniesByFilters(location, industry, sponsorshipType, budgetMin, budgetMax, pageable);
        return ResponseEntity.ok(companies);
    }

    @GetMapping
    public ResponseEntity<Page<CompanyDTO>> getAllVerifiedCompanies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CompanyDTO> companies = companyService.getAllVerifiedCompanies(pageable);
        return ResponseEntity.ok(companies);
    }
}
