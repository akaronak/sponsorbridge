package com.sponsorbridge.service;

import com.sponsorbridge.dto.RequestDTO;
import com.sponsorbridge.dto.RequestRequest;
import com.sponsorbridge.entity.Company;
import com.sponsorbridge.entity.Organizer;
import com.sponsorbridge.entity.RequestStatus;
import com.sponsorbridge.entity.Role;
import com.sponsorbridge.entity.SponsorshipRequest;
import com.sponsorbridge.entity.User;
import com.sponsorbridge.mapper.RequestMapper;
import com.sponsorbridge.repository.CompanyRepository;
import com.sponsorbridge.repository.OrganizerRepository;
import com.sponsorbridge.repository.SponsorshipRequestRepository;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RequestServiceTest {
    @Mock
    private SponsorshipRequestRepository requestRepository;
    @Mock
    private OrganizerRepository organizerRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private RequestMapper requestMapper;
    @InjectMocks
    private RequestService requestService;

    private User organizerUser;
    private User companyUser;
    private Organizer testOrganizer;
    private Company testCompany;
    private RequestRequest requestRequest;
    private SponsorshipRequest testRequest;
    private RequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        organizerUser = User.builder()
                .id(1L)
                .email("organizer@test.com")
                .name("Test Organizer")
                .role(Role.ORGANIZER)
                .build();

        companyUser = User.builder()
                .id(2L)
                .email("company@test.com")
                .name("Test Company")
                .role(Role.COMPANY)
                .build();

        testOrganizer = Organizer.builder()
                .id(1L)
                .user(organizerUser)
                .organizerName("Tech Community")
                .institution("University XYZ")
                .eventName("Tech Fest 2024")
                .eventType("Conference")
                .eventDate(LocalDate.of(2024, 12, 15))
                .expectedFootfall(500)
                .verified(true)
                .build();

        testCompany = Company.builder()
                .id(1L)
                .user(companyUser)
                .companyName("Tech Corp")
                .industry("Technology")
                .location("New York")
                .website("https://techcorp.com")
                .contactPerson("John Doe")
                .sponsorshipTypes(new String[]{"Monetary", "Goodies"})
                .verified(true)
                .build();

        requestRequest = RequestRequest.builder()
                .companyId(1L)
                .eventSummary("Annual tech conference")
                .expectedAudienceSize(500)
                .offering("Booth space and networking")
                .sponsorshipAsk("$10,000")
                .preferredCommunicationMode("Email")
                .build();

        testRequest = SponsorshipRequest.builder()
                .id(1L)
                .organizer(testOrganizer)
                .company(testCompany)
                .eventSummary("Annual tech conference")
                .expectedAudienceSize(500)
                .offering("Booth space and networking")
                .sponsorshipAsk("$10,000")
                .preferredCommunicationMode("Email")
                .status(RequestStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        requestDTO = RequestDTO.builder()
                .id(1L)
                .organizerId(1L)
                .organizerName("Tech Community")
                .companyId(1L)
                .companyName("Tech Corp")
                .eventSummary("Annual tech conference")
                .expectedAudienceSize(500)
                .offering("Booth space and networking")
                .sponsorshipAsk("$10,000")
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void testCreateRequestSuccess() {
        when(organizerRepository.findById(1L)).thenReturn(Optional.of(testOrganizer));
        when(companyRepository.findById(1L)).thenReturn(Optional.of(testCompany));
        when(requestRepository.existsDuplicateRequest(anyLong(), anyLong(), any())).thenReturn(false);
        when(requestMapper.toEntity(requestRequest)).thenReturn(testRequest);
        when(requestRepository.save(any(SponsorshipRequest.class))).thenReturn(testRequest);
        when(requestMapper.toDTO(testRequest)).thenReturn(requestDTO);

        RequestDTO result = requestService.createRequest(1L, requestRequest);

        assertNotNull(result);
        assertEquals("Annual tech conference", result.getEventSummary());
        assertEquals(500, result.getExpectedAudienceSize());
        assertEquals("PENDING", result.getStatus());
        verify(requestRepository, times(1)).save(any(SponsorshipRequest.class));
    }

    @Test
    void testCreateRequestOrganizerNotFound() {
        when(organizerRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> requestService.createRequest(1L, requestRequest));
    }

    @Test
    void testCreateRequestCompanyNotFound() {
        when(organizerRepository.findById(1L)).thenReturn(Optional.of(testOrganizer));
        when(companyRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> requestService.createRequest(1L, requestRequest));
    }

    @Test
    void testCreateRequestDuplicate() {
        when(organizerRepository.findById(1L)).thenReturn(Optional.of(testOrganizer));
        when(companyRepository.findById(1L)).thenReturn(Optional.of(testCompany));
        when(requestRepository.existsDuplicateRequest(anyLong(), anyLong(), any())).thenReturn(true);

        assertThrows(RuntimeException.class, () -> requestService.createRequest(1L, requestRequest));
    }

    @Test
    void testGetRequestByIdSuccess() {
        when(requestRepository.findById(1L)).thenReturn(Optional.of(testRequest));
        when(requestMapper.toDTO(testRequest)).thenReturn(requestDTO);

        RequestDTO result = requestService.getRequestById(1L);

        assertNotNull(result);
        assertEquals("Annual tech conference", result.getEventSummary());
    }

    @Test
    void testGetRequestByIdNotFound() {
        when(requestRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> requestService.getRequestById(1L));
    }

    @Test
    void testGetRequestsByOrganizerWithoutStatus() {
        Pageable pageable = PageRequest.of(0, 20);
        List<SponsorshipRequest> requests = Arrays.asList(testRequest);
        Page<SponsorshipRequest> page = new PageImpl<>(requests, pageable, 1);

        when(requestRepository.findByOrganizerIdOrderByCreatedAtDesc(1L, pageable)).thenReturn(page);
        when(requestMapper.toDTO(testRequest)).thenReturn(requestDTO);

        Page<RequestDTO> result = requestService.getRequestsByOrganizer(1L, null, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(requestRepository, times(1)).findByOrganizerIdOrderByCreatedAtDesc(1L, pageable);
    }

    @Test
    void testGetRequestsByOrganizerWithStatus() {
        Pageable pageable = PageRequest.of(0, 20);
        List<SponsorshipRequest> requests = Arrays.asList(testRequest);
        Page<SponsorshipRequest> page = new PageImpl<>(requests, pageable, 1);

        when(requestRepository.findByOrganizerIdAndStatusOrderByCreatedAtDesc(1L, RequestStatus.PENDING, pageable))
                .thenReturn(page);
        when(requestMapper.toDTO(testRequest)).thenReturn(requestDTO);

        Page<RequestDTO> result = requestService.getRequestsByOrganizer(1L, "PENDING", pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(requestRepository, times(1)).findByOrganizerIdAndStatusOrderByCreatedAtDesc(1L, RequestStatus.PENDING, pageable);
    }

    @Test
    void testGetRequestsByCompanyWithoutStatus() {
        Pageable pageable = PageRequest.of(0, 20);
        List<SponsorshipRequest> requests = Arrays.asList(testRequest);
        Page<SponsorshipRequest> page = new PageImpl<>(requests, pageable, 1);

        when(requestRepository.findByCompanyIdOrderByCreatedAtDesc(1L, pageable)).thenReturn(page);
        when(requestMapper.toDTO(testRequest)).thenReturn(requestDTO);

        Page<RequestDTO> result = requestService.getRequestsByCompany(1L, null, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void testUpdateRequestStatusSuccess() {
        when(requestRepository.findById(1L)).thenReturn(Optional.of(testRequest));
        when(requestRepository.save(any(SponsorshipRequest.class))).thenReturn(testRequest);
        requestDTO.setStatus("ACCEPTED");
        when(requestMapper.toDTO(testRequest)).thenReturn(requestDTO);

        RequestDTO result = requestService.updateRequestStatus(1L, 2L, "ACCEPTED");

        assertNotNull(result);
        verify(requestRepository, times(1)).save(any(SponsorshipRequest.class));
    }

    @Test
    void testUpdateRequestStatusUnauthorized() {
        User differentUser = User.builder().id(999L).build();
        testCompany.setUser(differentUser);
        testRequest.setCompany(testCompany);

        when(requestRepository.findById(1L)).thenReturn(Optional.of(testRequest));

        assertThrows(RuntimeException.class, () -> requestService.updateRequestStatus(1L, 2L, "ACCEPTED"));
    }

    @Test
    void testIsDuplicateRequest() {
        when(requestRepository.existsDuplicateRequest(anyLong(), anyLong(), any())).thenReturn(true);

        boolean result = requestService.isDuplicateRequest(1L, 1L);

        assertTrue(result);
        verify(requestRepository, times(1)).existsDuplicateRequest(anyLong(), anyLong(), any());
    }
}
