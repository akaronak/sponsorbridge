package com.eventra.service;

import com.eventra.dto.MessageDTO;
import com.eventra.entity.Company;
import com.eventra.entity.Message;
import com.eventra.entity.Organizer;
import com.eventra.entity.RequestStatus;
import com.eventra.entity.Role;
import com.eventra.entity.SponsorshipRequest;
import com.eventra.entity.User;
import com.eventra.mapper.MessageMapper;
import com.eventra.repository.CompanyRepository;
import com.eventra.repository.MessageRepository;
import com.eventra.repository.OrganizerRepository;
import com.eventra.repository.SponsorshipRequestRepository;
import com.eventra.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

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
class MessageServiceTest {

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private SponsorshipRequestRepository requestRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrganizerRepository organizerRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private MessageMapper messageMapper;

    @InjectMocks
    private MessageService messageService;

    private User sender;
    private User recipient;
    private Organizer organizer;
    private Company company;
    private SponsorshipRequest sponsorshipRequest;
    private Message testMessage;
    private MessageDTO testMessageDTO;

    @BeforeEach
    void setUp() {
        // Initialize test data
        sender = User.builder()
                .id("1")
                .email("company@test.com")
                .passwordHash("hashedPassword")
                .name("Test Company User")
                .role(Role.COMPANY)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        recipient = User.builder()
                .id("2")
                .email("organizer@test.com")
                .passwordHash("hashedPassword")
                .name("Test Organizer User")
                .role(Role.ORGANIZER)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        organizer = Organizer.builder()
                .id("1")
                .userId("2")
                .organizerName("Test Event Organizer")
                .institution("Test University")
                .eventName("Tech Conference 2024")
                .eventType("Conference")
                .eventDate(LocalDate.of(2024, 12, 15))
                .expectedFootfall(500)
                .verified(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        company = Company.builder()
                .id("1")
                .userId("1")
                .companyName("Test Tech Company")
                .industry("Technology")
                .location("New York")
                .website("https://techcompany.com")
                .contactPerson("John Sponsor")
                .sponsorshipTypes(new String[]{"Monetary", "Goodies"})
                .verified(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        sponsorshipRequest = SponsorshipRequest.builder()
                .id("1")
                .organizerId("1")
                .companyId("1")
                .eventSummary("Annual tech conference for students")
                .expectedAudienceSize(500)
                .offering("Booth space and networking opportunities")
                .sponsorshipAsk("$10,000 sponsorship package")
                .preferredCommunicationMode("Email")
                .status(RequestStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        testMessage = Message.builder()
                .id("1")
                .requestId("1")
                .senderId("1")
                .content("Test message content")
                .createdAt(LocalDateTime.now())
                .build();

        testMessageDTO = MessageDTO.builder()
                .id("1")
                .senderId("1")
                .senderName("Test Company User")
                .content("Test message content")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void testSendMessageSuccessByCompany() {
        // Arrange
        when(userRepository.findById("1")).thenReturn(Optional.of(sender));
        when(requestRepository.findById("1")).thenReturn(Optional.of(sponsorshipRequest));
        when(organizerRepository.findById("1")).thenReturn(Optional.of(organizer));
        when(companyRepository.findById("1")).thenReturn(Optional.of(company));
        when(messageRepository.save(any(Message.class))).thenReturn(testMessage);
        when(messageMapper.toDTO(testMessage, sender)).thenReturn(testMessageDTO);

        // Act
        MessageDTO result = messageService.sendMessage("1", "1", "Test message content");

        // Assert
        assertNotNull(result);
        assertEquals("1", result.getId());
        assertEquals("Test message content", result.getContent());
        assertEquals("1", result.getSenderId());
        assertEquals("Test Company User", result.getSenderName());
        verify(userRepository, times(1)).findById("1");
        verify(requestRepository, times(1)).findById("1");
        verify(messageRepository, times(1)).save(any(Message.class));
    }

    @Test
    void testSendMessageSuccessByOrganizer() {
        // Arrange
        when(userRepository.findById("2")).thenReturn(Optional.of(recipient));
        when(requestRepository.findById("1")).thenReturn(Optional.of(sponsorshipRequest));
        when(organizerRepository.findById("1")).thenReturn(Optional.of(organizer));
        when(companyRepository.findById("1")).thenReturn(Optional.of(company));
        when(messageRepository.save(any(Message.class))).thenReturn(testMessage);
        when(messageMapper.toDTO(testMessage, recipient)).thenReturn(testMessageDTO);

        // Act
        MessageDTO result = messageService.sendMessage("2", "1", "Test message content");

        // Assert
        assertNotNull(result);
        assertEquals("1", result.getId());
        verify(messageRepository, times(1)).save(any(Message.class));
    }

    @Test
    void testSendMessageUserNotFound() {
        // Arrange
        when(userRepository.findById("999")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            messageService.sendMessage("999", "1", "Test message");
        });
        verify(userRepository, times(1)).findById("999");
        verify(requestRepository, never()).findById(anyString());
    }

    @Test
    void testSendMessageRequestNotFound() {
        // Arrange
        when(userRepository.findById("1")).thenReturn(Optional.of(sender));
        when(requestRepository.findById("999")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            messageService.sendMessage("1", "999", "Test message");
        });
        verify(userRepository, times(1)).findById("1");
        verify(requestRepository, times(1)).findById("999");
    }

    @Test
    void testSendMessageUnauthorized() {
        // Arrange - Create an unauthorized user who is not part of the request
        User unauthorizedUser = User.builder()
                .id("3")
                .email("unauthorized@test.com")
                .passwordHash("hashedPassword")
                .name("Unauthorized User")
                .role(Role.COMPANY)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(userRepository.findById("3")).thenReturn(Optional.of(unauthorizedUser));
        when(requestRepository.findById("1")).thenReturn(Optional.of(sponsorshipRequest));
        when(organizerRepository.findById("1")).thenReturn(Optional.of(organizer));
        when(companyRepository.findById("1")).thenReturn(Optional.of(company));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            messageService.sendMessage("3", "1", "Test message");
        });
        
        verify(userRepository, times(1)).findById("3");
        verify(requestRepository, times(1)).findById("1");
        verify(messageRepository, never()).save(any(Message.class));
    }

    @Test
    void testGetMessagesByRequest() {
        // Arrange
        Message message2 = Message.builder()
                .id("2")
                .requestId("1")
                .senderId("2")
                .content("Response message")
                .createdAt(LocalDateTime.now().plusHours(1))
                .build();

        MessageDTO messageDTO2 = MessageDTO.builder()
                .id("2")
                .senderId("2")
                .senderName("Test Organizer User")
                .content("Response message")
                .createdAt(LocalDateTime.now().plusHours(1))
                .build();

        List<Message> messages = Arrays.asList(testMessage, message2);

        when(messageRepository.findByRequestIdOrderByCreatedAtAsc("1")).thenReturn(messages);
        when(userRepository.findAllById(any())).thenReturn(Arrays.asList(sender, recipient));
        when(messageMapper.toDTO(testMessage, sender)).thenReturn(testMessageDTO);
        when(messageMapper.toDTO(message2, recipient)).thenReturn(messageDTO2);

        // Act
        List<MessageDTO> result = messageService.getMessagesByRequest("1");

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Test message content", result.get(0).getContent());
        assertEquals("Test Company User", result.get(0).getSenderName());
        assertEquals("Response message", result.get(1).getContent());
        assertEquals("Test Organizer User", result.get(1).getSenderName());
        verify(messageRepository, times(1)).findByRequestIdOrderByCreatedAtAsc("1");
    }

    @Test
    void testGetMessagesByRequestEmpty() {
        // Arrange
        when(messageRepository.findByRequestIdOrderByCreatedAtAsc("1")).thenReturn(Arrays.asList());
        when(userRepository.findAllById(any())).thenReturn(Arrays.asList());

        // Act
        List<MessageDTO> result = messageService.getMessagesByRequest("1");

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(messageRepository, times(1)).findByRequestIdOrderByCreatedAtAsc("1");
    }
}