package com.eventra.mapper;

import com.eventra.dto.CompanyDTO;
import com.eventra.dto.CompanyRequest;
import com.eventra.entity.Company;
import org.springframework.stereotype.Component;

@Component
public class CompanyMapper {

    public CompanyDTO toDTO(Company company) {
        if (company == null) return null;

        return CompanyDTO.builder()
                .id(company.getId())
                .companyName(company.getCompanyName())
                .industry(company.getIndustry())
                .location(company.getLocation())
                .website(company.getWebsite())
                .contactPerson(company.getContactPerson())
                .sponsorshipTypes(company.getSponsorshipTypes())
                .budgetMin(company.getBudgetMin())
                .budgetMax(company.getBudgetMax())
                .preferredEventTypes(company.getPreferredEventTypes())
                .companySize(company.getCompanySize())
                .pastSponsorships(company.getPastSponsorships())
                .verified(company.getVerified())
                .build();
    }

    public Company toEntity(CompanyRequest request) {
        if (request == null) return null;

        return Company.builder()
                .companyName(request.getCompanyName())
                .industry(request.getIndustry())
                .location(request.getLocation())
                .website(request.getWebsite())
                .contactPerson(request.getContactPerson())
                .sponsorshipTypes(request.getSponsorshipTypes())
                .budgetMin(request.getBudgetMin())
                .budgetMax(request.getBudgetMax())
                .preferredEventTypes(request.getPreferredEventTypes())
                .companySize(request.getCompanySize())
                .pastSponsorships(request.getPastSponsorships())
                .build();
    }

    public void updateEntityFromRequest(CompanyRequest request, Company company) {
        if (request == null || company == null) return;

        company.setCompanyName(request.getCompanyName());
        company.setIndustry(request.getIndustry());
        company.setLocation(request.getLocation());
        company.setWebsite(request.getWebsite());
        company.setContactPerson(request.getContactPerson());
        company.setSponsorshipTypes(request.getSponsorshipTypes());
        company.setBudgetMin(request.getBudgetMin());
        company.setBudgetMax(request.getBudgetMax());
        company.setPreferredEventTypes(request.getPreferredEventTypes());
        company.setCompanySize(request.getCompanySize());
        company.setPastSponsorships(request.getPastSponsorships());
    }
}
