package com.eventra.service;

import com.eventra.dto.RequestDTO;
import com.eventra.dto.RequestRequest;
import com.eventra.entity.Company;
import com.eventra.entity.Organizer;
import com.eventra.entity.RequestStatus;
import com.eventra.entity.SponsorshipRequest;
import com.eventra.mapper.RequestMapper;
import com.eventra.repository.CompanyRepository;
import com.eventra.repository.OrganizerRepository;
import com.eventra.repository.SponsorshipRequestRepository;
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
import static org.mockito.ArgumentMatchers.anyString;
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

    private Organizer testOrganizer;
    private Company testCompany;
    private RequestRequest requestRequest;
    private SponsorshipRequest testRequest;
    private RequestDTO requestDTO;

    @BeforeEach
    void setUp() {
        testOrganizer = Organizer.builder()
                .id("1")
                .userId("1")
                .organizerName("Tech Community")
                .institution("University XYZ")
                .eventName("Tech Fest 2024")
                .eventType("Conference")
                .eventDate(LocalDate.of(2024, 12, 15))
                .expectedFootfall(500)
                .verified(true)
                .build();

        testCompany = Company.builder()
                .id("1")
                .userId("2")
                .companyName("Tech Corp")
                .industry("Technology")
                .location("New York")
                .website("https://techcorp.com")
                .contactPerson("John Doe")
                .sponsorshipTypes(new String[]{"Monetary", "Goodies"})
                .verified(true)
                .build();

        requestRequest = RequestRequest.builder()
                .companyId("1")
                .eventSummary("Annual tech conference")
                .expectedAudienceSize(500)
                .offering("Booth space and networking")
                .sponsorshipAsk("$10,000")
                .preferredCommunicationMode("Email")
                .build();

        testRequest = SponsorshipRequest.builder()
                .id("1")
                .organizerId("1")
                .companyId("1")
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
                .id("1")
                .organizerId("1")
                .organizerName("Tech Community")
                .companyId("1")
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
        when(organizerRepository.findByUserId("1")).thenReturn(Optional.of(testOrganizer));
        when(companyRepository.findById("1")).thenReturn(Optional.of(testCompany));
        when(requestRepository.countDuplicateRequests(anyString(), anyString(), any())).thenReturn(0L);
        when(requestMapper.toEntity(requestRequest)).thenReturn(testRequest);
        when(requestRepository.save(any(SponsorshipRequest.class))).thenReturn(testRequest);
        when(requestMapper.toDTO(testRequest, testOrganizer, testCompany)).thenReturn(requestDTO);

        RequestDTO result = requestService.createRequest("1", requestRequest);

        assertNotNull(result);
        assertEquals("Annual tech conference", result.getEventSummary());
        assertEquals(500, result.getExpectedAudienceSize());
        assertEquals("PENDING", result.getStatus());
        verify(requestRepository, times(1)).save(any(SponsorshipRequest.class));
    }

    @Test
    void testCreateRequestOrganizerNotFound() {
        when(organizerRepository.findByUserId("1")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> requestService.createRequest("1", requestRequest));
    }

    @Test
    void testCreateRequestCompanyNotFound() {
        when(organizerRepository.findByUserId("1")).thenReturn(Optional.of(testOrganizer));
        when(companyRepository.findById("1")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> requestService.createRequest("1", requestRequest));
    }

    @Test
    void testCreateRequestDuplicate() {
        when(organizerRepository.findByUserId("1")).thenReturn(Optional.of(testOrganizer));
        when(companyRepository.findById("1")).thenReturn(Optional.of(testCompany));
        when(requestRepository.countDuplicateRequests(anyString(), anyString(), any())).thenReturn(1L);

        assertThrows(RuntimeException.class, () -> requestService.createRequest("1", requestRequest));
    }

    @Test
    void testGetRequestByIdSuccess() {
        when(requestRepository.findById("1")).thenReturn(Optional.of(testRequest));
        when(organizerRepository.findById("1")).thenReturn(Optional.of(testOrganizer));
        when(companyRepository.findById("1")).thenReturn(Optional.of(testCompany));
        when(requestMapper.toDTO(testRequest, testOrganizer, testCompany)).thenReturn(requestDTO);

        RequestDTO result = requestService.getRequestById("1");

        assertNotNull(result);
        assertEquals("Annual tech conference", result.getEventSummary());
    }

    @Test
    void testGetRequestByIdNotFound() {
        when(requestRepository.findById("1")).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> requestService.getRequestById("1"));
    }

    @Test
    void testGetRequestsByOrganizerWithoutStatus() {
        Pageable pageable = PageRequest.of(0, 20);
        List<SponsorshipRequest> requests = Arrays.asList(testRequest);
        Page<SponsorshipRequest> page = new PageImpl<>(requests, pageable, 1);

        when(requestRepository.findByOrganizerIdOrderByCreatedAtDesc("1", pageable)).thenReturn(page);
        when(organizerRepository.findAllById(any())).thenReturn(Arrays.asList(testOrganizer));
        when(companyRepository.findAllById(any())).thenReturn(Arrays.asList(testCompany));
        when(requestMapper.toDTO(testRequest, testOrganizer, testCompany)).thenReturn(requestDTO);

        Page<RequestDTO> result = requestService.getRequestsByOrganizer("1", null, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(requestRepository, times(1)).findByOrganizerIdOrderByCreatedAtDesc("1", pageable);
    }

    @Test
    void testGetRequestsByOrganizerWithStatus() {
        Pageable pageable = PageRequest.of(0, 20);
        List<SponsorshipRequest> requests = Arrays.asList(testRequest);
        Page<SponsorshipRequest> page = new PageImpl<>(requests, pageable, 1);

        when(requestRepository.findByOrganizerIdAndStatusOrderByCreatedAtDesc("1", RequestStatus.PENDING, pageable))
                .thenReturn(page);
        when(organizerRepository.findAllById(any())).thenReturn(Arrays.asList(testOrganizer));
        when(companyRepository.findAllById(any())).thenReturn(Arrays.asList(testCompany));
        when(requestMapper.toDTO(testRequest, testOrganizer, testCompany)).thenReturn(requestDTO);

        Page<RequestDTO> result = requestService.getRequestsByOrganizer("1", "PENDING", pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(requestRepository, times(1)).findByOrganizerIdAndStatusOrderByCreatedAtDesc("1", RequestStatus.PENDING, pageable);
    }

    @Test
    void testGetRequestsByCompanyWithoutStatus() {
        Pageable pageable = PageRequest.of(0, 20);
        List<SponsorshipRequest> requests = Arrays.asList(testRequest);
        Page<SponsorshipRequest> page = new PageImpl<>(requests, pageable, 1);

        when(requestRepository.findByCompanyIdOrderByCreatedAtDesc("1", pageable)).thenReturn(page);
        when(organizerRepository.findAllById(any())).thenReturn(Arrays.asList(testOrganizer));
        when(companyRepository.findAllById(any())).thenReturn(Arrays.asList(testCompany));
        when(requestMapper.toDTO(testRequest, testOrganizer, testCompany)).thenReturn(requestDTO);

        Page<RequestDTO> result = requestService.getRequestsByCompany("1", null, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }

    @Test
    void testUpdateRequestStatusSuccess() {
        when(requestRepository.findById("1")).thenReturn(Optional.of(testRequest));
        when(companyRepository.findById("1")).thenReturn(Optional.of(testCompany));
        when(requestRepository.save(any(SponsorshipRequest.class))).thenReturn(testRequest);
        when(organizerRepository.findById("1")).thenReturn(Optional.of(testOrganizer));
        requestDTO.setStatus("ACCEPTED");
        when(requestMapper.toDTO(testRequest, testOrganizer, testCompany)).thenReturn(requestDTO);

        RequestDTO result = requestService.updateRequestStatus("1", "2", "ACCEPTED");

        assertNotNull(result);
        verify(requestRepository, times(1)).save(any(SponsorshipRequest.class));
    }

    @Test
    void testUpdateRequestStatusUnauthorized() {
        Company differentCompany = Company.builder()
                .id("1")
                .userId("999")
                .companyName("Tech Corp")
                .build();

        when(requestRepository.findById("1")).thenReturn(Optional.of(testRequest));
        when(companyRepository.findById("1")).thenReturn(Optional.of(differentCompany));

        assertThrows(RuntimeException.class, () -> requestService.updateRequestStatus("1", "2", "ACCEPTED"));
    }

    @Test
    void testIsDuplicateRequest() {
        when(requestRepository.countDuplicateRequests(anyString(), anyString(), any())).thenReturn(1L);

        boolean result = requestService.isDuplicateRequest("1", "1");

        assertTrue(result);
        verify(requestRepository, times(1)).countDuplicateRequests(anyString(), anyString(), any());
    }
}
