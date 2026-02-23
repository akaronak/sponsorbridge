package com.eventra.service;

import com.eventra.dto.OrganizerDTO;
import com.eventra.dto.OrganizerRequest;
import com.eventra.entity.Organizer;
import com.eventra.entity.Role;
import com.eventra.entity.User;
import com.eventra.mapper.OrganizerMapper;
import com.eventra.repository.OrganizerRepository;
import com.eventra.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrganizerServiceTest {
    @Mock
    private OrganizerRepository organizerRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private OrganizerMapper organizerMapper;
    @Mock
    private FileUploadService fileUploadService;
    @InjectMocks
    private OrganizerService organizerService;

    private User testUser;
    private OrganizerRequest organizerRequest;
    private Organizer testOrganizer;
    private OrganizerDTO organizerDTO;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("organizer@test.com")
                .name("Test Organizer")
                .role(Role.ORGANIZER)
                .build();

        organizerRequest = OrganizerRequest.builder()
                .organizerName("Tech Community")
                .institution("University XYZ")
                .eventName("Tech Fest 2024")
                .eventType("Conference")
                .eventDate(LocalDate.of(2024, 12, 15))
                .expectedFootfall(500)
                .socialMediaLinks(new String[]{"https://twitter.com/techfest"})
                .build();

        testOrganizer = Organizer.builder()
                .id(1L)
                .user(testUser)
                .organizerName("Tech Community")
                .institution("University XYZ")
                .eventName("Tech Fest 2024")
                .eventType("Conference")
                .eventDate(LocalDate.of(2024, 12, 15))
                .expectedFootfall(500)
                .socialMediaLinks(new String[]{"https://twitter.com/techfest"})
                .verified(false)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        organizerDTO = OrganizerDTO.builder()
                .id(1L)
                .organizerName("Tech Community")
                .institution("University XYZ")
                .eventName("Tech Fest 2024")
                .eventType("Conference")
                .eventDate(LocalDate.of(2024, 12, 15))
                .expectedFootfall(500)
                .socialMediaLinks(new String[]{"https://twitter.com/techfest"})
                .verified(false)
                .build();
    }

    @Test
    void testCreateOrganizerSuccess() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(organizerRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(organizerMapper.toEntity(organizerRequest)).thenReturn(testOrganizer);
        when(organizerRepository.save(any(Organizer.class))).thenReturn(testOrganizer);
        when(organizerMapper.toDTO(testOrganizer)).thenReturn(organizerDTO);

        OrganizerDTO result = organizerService.createOrganizer(1L, organizerRequest, null);

        assertNotNull(result);
        assertEquals("Tech Community", result.getOrganizerName());
        assertEquals("University XYZ", result.getInstitution());
        assertFalse(result.getVerified());
        verify(organizerRepository, times(1)).save(any(Organizer.class));
    }

    @Test
    void testCreateOrganizerWithProposal() {
        MultipartFile mockFile = mock(MultipartFile.class);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(organizerRepository.findByUserId(1L)).thenReturn(Optional.empty());
        when(organizerMapper.toEntity(organizerRequest)).thenReturn(testOrganizer);
        when(fileUploadService.uploadProposal(mockFile)).thenReturn("https://cloudinary.com/proposal.pdf");
        when(organizerRepository.save(any(Organizer.class))).thenReturn(testOrganizer);
        when(organizerMapper.toDTO(testOrganizer)).thenReturn(organizerDTO);

        OrganizerDTO result = organizerService.createOrganizer(1L, organizerRequest, mockFile);

        assertNotNull(result);
        verify(fileUploadService, times(1)).uploadProposal(mockFile);
        verify(organizerRepository, times(1)).save(any(Organizer.class));
    }

    @Test
    void testCreateOrganizerUserNotFound() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> organizerService.createOrganizer(1L, organizerRequest, null));
    }

    @Test
    void testCreateOrganizerAlreadyExists() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(organizerRepository.findByUserId(1L)).thenReturn(Optional.of(testOrganizer));

        assertThrows(RuntimeException.class, () -> organizerService.createOrganizer(1L, organizerRequest, null));
    }

    @Test
    void testGetOrganizerByIdSuccess() {
        when(organizerRepository.findById(1L)).thenReturn(Optional.of(testOrganizer));
        when(organizerMapper.toDTO(testOrganizer)).thenReturn(organizerDTO);

        OrganizerDTO result = organizerService.getOrganizerById(1L);

        assertNotNull(result);
        assertEquals("Tech Community", result.getOrganizerName());
    }

    @Test
    void testGetOrganizerByIdNotFound() {
        when(organizerRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> organizerService.getOrganizerById(1L));
    }

    @Test
    void testUpdateOrganizerSuccess() {
        when(organizerRepository.findById(1L)).thenReturn(Optional.of(testOrganizer));
        when(organizerRepository.save(any(Organizer.class))).thenReturn(testOrganizer);
        when(organizerMapper.toDTO(testOrganizer)).thenReturn(organizerDTO);

        OrganizerDTO result = organizerService.updateOrganizer(1L, 1L, organizerRequest, null);

        assertNotNull(result);
        verify(organizerRepository, times(1)).save(any(Organizer.class));
    }

    @Test
    void testUpdateOrganizerUnauthorized() {
        User differentUser = User.builder().id(2L).build();
        testOrganizer.setUser(differentUser);
        when(organizerRepository.findById(1L)).thenReturn(Optional.of(testOrganizer));

        assertThrows(RuntimeException.class, () -> organizerService.updateOrganizer(1L, 1L, organizerRequest, null));
    }

    @Test
    void testUpdateOrganizerWithProposal() {
        MultipartFile mockFile = mock(MultipartFile.class);
        when(organizerRepository.findById(1L)).thenReturn(Optional.of(testOrganizer));
        when(fileUploadService.uploadProposal(mockFile)).thenReturn("https://cloudinary.com/new-proposal.pdf");
        when(organizerRepository.save(any(Organizer.class))).thenReturn(testOrganizer);
        when(organizerMapper.toDTO(testOrganizer)).thenReturn(organizerDTO);

        OrganizerDTO result = organizerService.updateOrganizer(1L, 1L, organizerRequest, mockFile);

        assertNotNull(result);
        verify(fileUploadService, times(1)).uploadProposal(mockFile);
    }

    @Test
    void testGetPendingOrganizers() {
        List<Organizer> pendingOrganizers = Arrays.asList(testOrganizer);
        when(organizerRepository.findByVerifiedFalse()).thenReturn(pendingOrganizers);
        when(organizerMapper.toDTO(testOrganizer)).thenReturn(organizerDTO);

        List<OrganizerDTO> result = organizerService.getPendingOrganizers();

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(organizerRepository, times(1)).findByVerifiedFalse();
    }

    @Test
    void testApproveOrganizerSuccess() {
        when(organizerRepository.findById(1L)).thenReturn(Optional.of(testOrganizer));
        when(organizerRepository.save(any(Organizer.class))).thenReturn(testOrganizer);
        organizerDTO.setVerified(true);
        when(organizerMapper.toDTO(testOrganizer)).thenReturn(organizerDTO);

        OrganizerDTO result = organizerService.approveOrganizer(1L);

        assertNotNull(result);
        assertTrue(result.getVerified());
        verify(organizerRepository, times(1)).save(any(Organizer.class));
    }

    @Test
    void testRejectOrganizerSuccess() {
        when(organizerRepository.findById(1L)).thenReturn(Optional.of(testOrganizer));
        when(organizerRepository.save(any(Organizer.class))).thenReturn(testOrganizer);
        when(organizerMapper.toDTO(testOrganizer)).thenReturn(organizerDTO);

        OrganizerDTO result = organizerService.rejectOrganizer(1L);

        assertNotNull(result);
        assertFalse(result.getVerified());
        verify(organizerRepository, times(1)).save(any(Organizer.class));
    }
}
