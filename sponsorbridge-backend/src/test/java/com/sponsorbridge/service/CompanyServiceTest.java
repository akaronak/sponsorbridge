package com.sponsorbridge.service;

import com.sponsorbridge.dto.CompanyDTO;
import com.sponsorbridge.dto.CompanyRequest;
import com.sponsorbridge.entity.Company;
import com.sponsorbridge.entity.Role;
import com.sponsorbridge.entity.User;
import com.sponsorbridge.mapper.CompanyMapper;
import com.sponsorbridge.repository.CompanyRepository;
import com.sponsorbridge.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompanyServiceTest {

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CompanyMapper companyMapper;

    @InjectMocks
    private CompanyService companyService;

    private User testUser;
    private Company testCompany;
    private CompanyDTO testCompanyDTO;
    private CompanyRequest testCompanyRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("company@example.com")
                .passwordHash("hashedPassword")
                .name("Company User")
                .role(Role.COMPANY)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        testCompanyRequest = CompanyRequest.builder()
                .companyName("Tech Corp")
                .industry("Technology")
                .location("San Francisco")
                .website("https://techcorp.com")
                .contactPerson("John Doe")
                .sponsorshipTypes(new String[]{"Gold", "Silver"})
                .budgetMin(BigDecimal.valueOf(10000))
                .budgetMax(BigDecimal.valueOf(50000))
                .preferredEventTypes(new String[]{"Conference", "Meetup"})
                .companySize("100-500")
                .pastSponsorships(new String[]{"Event1", "Event2"})
                .build();

        testCompany = Company.builder()
                .id(1L)
                .user(testUser)
                .companyName("Tech Corp")
                .industry("Technology")
                .location("San Francisco")
                .website("https://techcorp.com")
                .contactPerson("John Doe")
                .sponsorshipTypes(new String[]{"Gold", "Silver"})
                .budgetMin(BigDecimal.valueOf(10000))
                .budgetMax(BigDecimal.valueOf(50000))
                .preferredEventTypes(new String[]{"Conference", "Meetup"})
                .companySize("100-500")
                .pastSponsorships(new String[]{"Event1", "Event2"})
                .verified(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        testCompanyDTO = CompanyDTO.builder()
                .id(1L)
                .companyName("Tech Corp")
                .industry("Technology")
                .location("San Francisco")
                .website("https://techcorp.com")
                .contactPerson("John Doe")
                .sponsorshipTypes(new String[]{"Gold", "Silver"})
                .budgetMin(BigDecimal.valueOf(10000))
                .budgetMax(BigDecimal.valueOf(50000))
                .preferredEventTypes(new String[]{"Conference", "Meetup"})
                .companySize("100-500")
                .pastSponsorships(new String[]{"Event1", "Event2"})
                .verified(false)
                .build();
    }

    @Test
    void testCreateCompanySuccess() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(companyRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(companyRepository.save(any(Company.class))).thenReturn(testCompany);
        when(companyMapper.toEntity(testCompanyRequest)).thenReturn(testCompany);
        when(companyMapper.toDTO(testCompany)).thenReturn(testCompanyDTO);

        // Act
        CompanyDTO result = companyService.createCompany(1L, testCompanyRequest);

        // Assert
        assertNotNull(result);
        assertEquals("Tech Corp", result.getCompanyName());
        assertFalse(result.getVerified());
        verify(companyRepository).save(any(Company.class));
    }

    @Test
    void testGetCompanyById() {
        // Arrange
        when(companyRepository.findById(1L)).thenReturn(Optional.of(testCompany));
        when(companyMapper.toDTO(testCompany)).thenReturn(testCompanyDTO);

        // Act
        CompanyDTO result = companyService.getCompanyById(1L);

        // Assert
        assertNotNull(result);
        assertEquals("Tech Corp", result.getCompanyName());
    }

    @Test
    void testUpdateCompanySuccess() {
        // Arrange
        when(companyRepository.findById(1L)).thenReturn(Optional.of(testCompany));
        when(companyRepository.save(any(Company.class))).thenReturn(testCompany);
        when(companyMapper.toDTO(testCompany)).thenReturn(testCompanyDTO);

        // Act
        CompanyDTO result = companyService.updateCompany(1L, 1L, testCompanyRequest);

        // Assert
        assertNotNull(result);
        verify(companyMapper).updateEntityFromRequest(testCompanyRequest, testCompany);
        verify(companyRepository).save(testCompany);
    }

    @Test
    void testUpdateCompanyUnauthorized() {
        // Arrange
        when(companyRepository.findById(1L)).thenReturn(Optional.of(testCompany));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> companyService.updateCompany(1L, 999L, testCompanyRequest));
    }

    @Test
    void testProfileDataPersistsThroughUpdates() {
        // Validates: Requirements 2.4, 3.8 - Property 12
        CompanyRequest updateRequest = CompanyRequest.builder()
                .companyName("Updated Corp")
                .industry("Finance")
                .location("New York")
                .website("https://updated.com")
                .contactPerson("Jane Doe")
                .sponsorshipTypes(new String[]{"Platinum"})
                .build();

        Company updatedCompany = Company.builder()
                .id(1L)
                .companyName("Updated Corp")
                .industry("Finance")
                .location("New York")
                .website("https://updated.com")
                .contactPerson("Jane Doe")
                .sponsorshipTypes(new String[]{"Platinum"})
                .user(testUser)
                .verified(false)
                .build();

        when(companyRepository.findById(1L)).thenReturn(Optional.of(testCompany));
        when(companyRepository.save(any(Company.class))).thenReturn(updatedCompany);
        when(companyMapper.toDTO(updatedCompany)).thenReturn(CompanyDTO.builder()
                .id(1L)
                .companyName("Updated Corp")
                .industry("Finance")
                .location("New York")
                .website("https://updated.com")
                .contactPerson("Jane Doe")
                .sponsorshipTypes(new String[]{"Platinum"})
                .verified(false)
                .build());

        CompanyDTO result = companyService.updateCompany(1L, 1L, updateRequest);

        assertEquals("Updated Corp", result.getCompanyName());
        assertEquals("Finance", result.getIndustry());
        assertEquals("New York", result.getLocation());
    }

    @Test
    void testApproveCompany() {
        // Arrange
        testCompany.setVerified(false);
        when(companyRepository.findById(1L)).thenReturn(Optional.of(testCompany));
        when(companyRepository.save(any(Company.class))).thenReturn(testCompany);
        testCompanyDTO.setVerified(true);
        when(companyMapper.toDTO(testCompany)).thenReturn(testCompanyDTO);

        // Act
        CompanyDTO result = companyService.approveCompany(1L);

        // Assert
        assertTrue(result.getVerified());
        verify(companyRepository).save(testCompany);
    }

    @Test
    void testGetPendingCompanies() {
        // Arrange
        List<Company> pendingCompanies = Arrays.asList(testCompany);
        when(companyRepository.findByVerifiedFalse()).thenReturn(pendingCompanies);
        when(companyMapper.toDTO(testCompany)).thenReturn(testCompanyDTO);

        // Act
        List<CompanyDTO> result = companyService.getPendingCompanies();

        // Assert
        assertEquals(1, result.size());
        assertEquals("Tech Corp", result.get(0).getCompanyName());
    }

    @Test
    void testSearchCompanies() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Page<Company> page = new PageImpl<>(Arrays.asList(testCompany), pageable, 1);
        when(companyRepository.searchCompanies("San Francisco", "Technology", "Conference", pageable))
                .thenReturn(page);
        when(companyMapper.toDTO(testCompany)).thenReturn(testCompanyDTO);

        // Act
        Page<CompanyDTO> result = companyService.searchCompanies("San Francisco", "Technology", "Conference", pageable);

        // Assert
        assertEquals(1, result.getTotalElements());
        assertEquals("Tech Corp", result.getContent().get(0).getCompanyName());
    }

    @Test
    void testBudgetRangesRoundTripCorrectly() {
        // Validates: Requirements 2.3 - Property 13
        BigDecimal budgetMin = BigDecimal.valueOf(10000);
        BigDecimal budgetMax = BigDecimal.valueOf(50000);

        CompanyRequest request = CompanyRequest.builder()
                .companyName("Tech Corp")
                .industry("Technology")
                .location("San Francisco")
                .website("https://techcorp.com")
                .contactPerson("John Doe")
                .sponsorshipTypes(new String[]{"Gold"})
                .budgetMin(budgetMin)
                .budgetMax(budgetMax)
                .build();

        Company company = Company.builder()
                .companyName("Tech Corp")
                .industry("Technology")
                .location("San Francisco")
                .website("https://techcorp.com")
                .contactPerson("John Doe")
                .sponsorshipTypes(new String[]{"Gold"})
                .budgetMin(budgetMin)
                .budgetMax(budgetMax)
                .user(testUser)
                .verified(false)
                .build();

        when(companyMapper.toEntity(request)).thenReturn(company);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(companyRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(companyRepository.save(any(Company.class))).thenReturn(company);
        when(companyMapper.toDTO(company)).thenReturn(CompanyDTO.builder()
                .companyName("Tech Corp")
                .industry("Technology")
                .location("San Francisco")
                .website("https://techcorp.com")
                .contactPerson("John Doe")
                .sponsorshipTypes(new String[]{"Gold"})
                .budgetMin(budgetMin)
                .budgetMax(budgetMax)
                .verified(false)
                .build());

        CompanyDTO result = companyService.createCompany(1L, request);

        assertEquals(budgetMin, result.getBudgetMin());
        assertEquals(budgetMax, result.getBudgetMax());
    }
}
