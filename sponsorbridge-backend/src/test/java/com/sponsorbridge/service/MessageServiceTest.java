package com.sponsorbridge.service;

import com.sponsorbridge.dto.MessageDTO;
import com.sponsorbridge.entity.Company;
import com.sponsorbridge.entity.Message;
import com.sponsorbridge.entity.Organizer;
import com.sponsorbridge.entity.RequestStatus;
import com.sponsorbridge.entity.Role;
import com.sponsorbridge.entity.SponsorshipRequest;
import com.sponsorbridge.entity.User;
import com.sponsorbridge.mapper.MessageMapper;
import com.sponsorbridge.repository.MessageRepository;
import com.sponsorbridge.repository.SponsorshipRequestRepository;
import com.sponsorbridge.repository.UserRepository;
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
import static org.mockito.ArgumentMatchers.anyLong;
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
                .id(1L)
                .email("company@test.com")
                .passwordHash("hashedPassword")
                .name("Test Company User")
                .role(Role.COMPANY)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        recipient = User.builder()
                .id(2L)
                .email("organizer@test.com")
                .passwordHash("hashedPassword")
                .name("Test Organizer User")
                .role(Role.ORGANIZER)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        organizer = Organizer.builder()
                .id(1L)
                .user(recipient)
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
                .id(1L)
                .user(sender)
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
                .id(1L)
                .organizer(organizer)
                .company(company)
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
                .id(1L)
                .request(sponsorshipRequest)
                .sender(sender)
                .content("Test message content")
                .createdAt(LocalDateTime.now())
                .build();

        testMessageDTO = MessageDTO.builder()
                .id(1L)
                .senderId(1L)
                .senderName("Test Company User")
                .content("Test message content")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void testSendMessageSuccessByCompany() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(sender));
        when(requestRepository.findById(1L)).thenReturn(Optional.of(sponsorshipRequest));
        when(messageRepository.save(any(Message.class))).thenReturn(testMessage);
        when(messageMapper.toDTO(testMessage)).thenReturn(testMessageDTO);

        // Act
        MessageDTO result = messageService.sendMessage(1L, 1L, "Test message content");

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Test message content", result.getContent());
        assertEquals(1L, result.getSenderId());
        assertEquals("Test Company User", result.getSenderName());
        verify(userRepository, times(1)).findById(1L);
        verify(requestRepository, times(1)).findById(1L);
        verify(messageRepository, times(1)).save(any(Message.class));
    }

    @Test
    void testSendMessageSuccessByOrganizer() {
        // Arrange
        when(userRepository.findById(2L)).thenReturn(Optional.of(recipient));
        when(requestRepository.findById(1L)).thenReturn(Optional.of(sponsorshipRequest));
        when(messageRepository.save(any(Message.class))).thenReturn(testMessage);
        when(messageMapper.toDTO(testMessage)).thenReturn(testMessageDTO);

        // Act
        MessageDTO result = messageService.sendMessage(2L, 1L, "Test message content");

        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getId());
        verify(messageRepository, times(1)).save(any(Message.class));
    }

    @Test
    void testSendMessageUserNotFound() {
        // Arrange
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            messageService.sendMessage(999L, 1L, "Test message");
        });
        verify(userRepository, times(1)).findById(999L);
        verify(requestRepository, never()).findById(anyLong());
    }

    @Test
    void testSendMessageRequestNotFound() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(sender));
        when(requestRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            messageService.sendMessage(1L, 999L, "Test message");
        });
        verify(userRepository, times(1)).findById(1L);
        verify(requestRepository, times(1)).findById(999L);
    }

    @Test
    void testSendMessageUnauthorized() {
        // Arrange - Create an unauthorized user who is not part of the request
        User unauthorizedUser = User.builder()
                .id(3L)
                .email("unauthorized@test.com")
                .passwordHash("hashedPassword")
                .name("Unauthorized User")
                .role(Role.COMPANY)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(userRepository.findById(3L)).thenReturn(Optional.of(unauthorizedUser));
        when(requestRepository.findById(1L)).thenReturn(Optional.of(sponsorshipRequest));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            messageService.sendMessage(3L, 1L, "Test message");
        });
        
        verify(userRepository, times(1)).findById(3L);
        verify(requestRepository, times(1)).findById(1L);
        verify(messageRepository, never()).save(any(Message.class));
    }

    @Test
    void testGetMessagesByRequest() {
        // Arrange
        Message message2 = Message.builder()
                .id(2L)
                .request(sponsorshipRequest)
                .sender(recipient)
                .content("Response message")
                .createdAt(LocalDateTime.now().plusHours(1))
                .build();

        MessageDTO messageDTO2 = MessageDTO.builder()
                .id(2L)
                .senderId(2L)
                .senderName("Test Organizer User")
                .content("Response message")
                .createdAt(LocalDateTime.now().plusHours(1))
                .build();

        List<Message> messages = Arrays.asList(testMessage, message2);

        when(messageRepository.findByRequestIdOrderByCreatedAtAsc(1L)).thenReturn(messages);
        when(messageMapper.toDTO(testMessage)).thenReturn(testMessageDTO);
        when(messageMapper.toDTO(message2)).thenReturn(messageDTO2);

        // Act
        List<MessageDTO> result = messageService.getMessagesByRequest(1L);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Test message content", result.get(0).getContent());
        assertEquals("Test Company User", result.get(0).getSenderName());
        assertEquals("Response message", result.get(1).getContent());
        assertEquals("Test Organizer User", result.get(1).getSenderName());
        verify(messageRepository, times(1)).findByRequestIdOrderByCreatedAtAsc(1L);
    }

    @Test
    void testGetMessagesByRequestEmpty() {
        // Arrange
        when(messageRepository.findByRequestIdOrderByCreatedAtAsc(1L)).thenReturn(Arrays.asList());

        // Act
        List<MessageDTO> result = messageService.getMessagesByRequest(1L);

        // Assert
        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(messageRepository, times(1)).findByRequestIdOrderByCreatedAtAsc(1L);
    }
}