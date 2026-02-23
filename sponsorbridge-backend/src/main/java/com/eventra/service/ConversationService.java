package com.eventra.service;

import com.eventra.dto.*;
import com.eventra.entity.*;
import com.eventra.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Core service for the real-time messaging system.
 * Handles conversation lifecycle, message CRUD, and WebSocket broadcasts.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ConversationService {

    private final ConversationRepository conversationRepository;
    private final ConversationMessageRepository messageRepository;
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // ── Conversation Management ──────────────────────────────────

    /**
     * Get all conversations for a user.
     */
    @Transactional(readOnly = true)
    public List<ConversationDTO> getConversations(Long userId) {
        List<Conversation> conversations = conversationRepository
                .findByUserIdOrderByLastMessageAtDesc(userId);

        return conversations.stream()
                .map(c -> toConversationDTO(c, userId))
                .collect(Collectors.toList());
    }

    /**
     * Get or create a conversation between two users for an event.
     */
    @Transactional
    public ConversationDTO getOrCreateConversation(Long userId, CreateConversationRequest request) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        User participant = userRepository.findById(request.getParticipantId())
                .orElseThrow(() -> new RuntimeException("Participant not found: " + request.getParticipantId()));

        // Determine who is company vs organizer
        User companyUser, organizerUser;
        if (currentUser.getRole() == Role.COMPANY) {
            companyUser = currentUser;
            organizerUser = participant;
        } else {
            companyUser = participant;
            organizerUser = currentUser;
        }

        // Check for existing conversation
        Optional<Conversation> existing = conversationRepository.findExistingConversation(
                companyUser.getId(), organizerUser.getId(), request.getEventName());

        if (existing.isPresent()) {
            return toConversationDTO(existing.get(), userId);
        }

        // Create new conversation
        Conversation conversation = Conversation.builder()
                .company(companyUser)
                .organizer(organizerUser)
                .eventName(request.getEventName())
                .subject(request.getSubject() != null ? request.getSubject() : "Re: " + request.getEventName())
                .status(ConversationStatus.ACTIVE)
                .build();

        conversation = conversationRepository.save(conversation);

        // Send initial message if provided
        if (request.getInitialMessage() != null && !request.getInitialMessage().isBlank()) {
            sendMessage(userId, SendMessageRequest.builder()
                    .conversationId(conversation.getId())
                    .content(request.getInitialMessage())
                    .messageType("TEXT")
                    .build());
        }

        log.info("Created conversation {} between user {} and user {} for event {}",
                conversation.getId(), companyUser.getId(), organizerUser.getId(), request.getEventName());

        return toConversationDTO(conversation, userId);
    }

    /**
     * Get a single conversation by ID with authorization check.
     */
    @Transactional(readOnly = true)
    public ConversationDTO getConversation(Long conversationId, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found: " + conversationId));

        validateAccess(conversation, userId);
        return toConversationDTO(conversation, userId);
    }

    // ── Message Operations ───────────────────────────────────────

    /**
     * Send a message in a conversation.
     */
    @Transactional
    public ConversationMessageDTO sendMessage(Long senderId, SendMessageRequest request) {
        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new RuntimeException("Conversation not found: " + request.getConversationId()));

        validateAccess(conversation, senderId);

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("User not found: " + senderId));

        // Determine message type
        MessageType messageType = MessageType.TEXT;
        if (request.getMessageType() != null) {
            try {
                messageType = MessageType.valueOf(request.getMessageType());
            } catch (IllegalArgumentException e) {
                log.warn("Unknown message type: {}. Defaulting to TEXT.", request.getMessageType());
            }
        }

        // Build message
        ConversationMessage message = ConversationMessage.builder()
                .conversation(conversation)
                .sender(sender)
                .messageType(messageType)
                .content(request.getContent())
                .status(MessageStatus.SENT)
                .proposalAmount(request.getProposalAmount())
                .sponsorshipType(request.getSponsorshipType())
                .proposalTerms(request.getProposalTerms())
                .goodiesDescription(request.getGoodiesDescription())
                .proposalDeadline(request.getProposalDeadline())
                .parentMessageId(request.getParentMessageId())
                .attachmentUrl(request.getAttachmentUrl())
                .attachmentName(request.getAttachmentName())
                .build();

        message = messageRepository.save(message);

        // Update conversation metadata
        String preview = request.getContent().length() > 100
                ? request.getContent().substring(0, 100) + "..."
                : request.getContent();
        conversation.setLastMessagePreview(preview);
        conversation.setLastMessageAt(message.getCreatedAt());
        conversation.incrementUnreadForRecipient(senderId);
        conversationRepository.save(conversation);

        // Build DTO
        ConversationMessageDTO dto = toMessageDTO(message);

        // Broadcast via WebSocket
        broadcastMessage(conversation, dto, senderId);

        // Create notification for recipient
        createMessageNotification(conversation, sender, message);

        log.info("Message {} sent in conversation {} by user {}",
                message.getId(), conversation.getId(), senderId);

        return dto;
    }

    /**
     * Get messages for a conversation.
     */
    @Transactional(readOnly = true)
    public List<ConversationMessageDTO> getMessages(Long conversationId, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found: " + conversationId));

        validateAccess(conversation, userId);

        return messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId)
                .stream()
                .map(this::toMessageDTO)
                .collect(Collectors.toList());
    }

    /**
     * Mark all messages in a conversation as read for a user.
     */
    @Transactional
    public void markConversationAsRead(Long conversationId, Long userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found: " + conversationId));

        validateAccess(conversation, userId);

        int updated = messageRepository.markAllAsRead(conversationId, userId);
        conversation.markReadForUser(userId);
        conversationRepository.save(conversation);

        // Broadcast read receipt via WebSocket
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + conversationId + "/read",
                new ReadReceiptDTO(conversationId, userId, updated));

        log.debug("Marked {} messages as read in conversation {} for user {}", updated, conversationId, userId);
    }

    /**
     * Get total unread message count for a user across all conversations.
     */
    @Transactional(readOnly = true)
    public int getTotalUnreadCount(Long userId) {
        return conversationRepository.getTotalUnreadCount(userId);
    }

    // ── Typing Indicator ─────────────────────────────────────────

    /**
     * Broadcast typing status to conversation participants.
     */
    public void broadcastTypingIndicator(TypingIndicatorDTO typing) {
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + typing.getConversationId() + "/typing",
                typing);
    }

    // ── WebSocket Broadcasting ───────────────────────────────────

    private void broadcastMessage(Conversation conversation, ConversationMessageDTO dto, Long senderId) {
        // Broadcast to conversation topic
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + conversation.getId(),
                dto);

        // Send to recipient's personal queue for unread badge updates
        Long recipientId = conversation.getCompany().getId().equals(senderId)
                ? conversation.getOrganizer().getId()
                : conversation.getCompany().getId();

        messagingTemplate.convertAndSendToUser(
                recipientId.toString(),
                "/queue/messages",
                dto);
    }

    private void createMessageNotification(Conversation conversation, User sender, ConversationMessage message) {
        Long recipientId = conversation.getCompany().getId().equals(sender.getId())
                ? conversation.getOrganizer().getId()
                : conversation.getCompany().getId();

        User recipient = userRepository.findById(recipientId).orElse(null);
        if (recipient == null) return;

        NotificationType notifType;
        String title;
        switch (message.getMessageType()) {
            case PROPOSAL:
                notifType = NotificationType.PROPOSAL_RECEIVED;
                title = "New sponsorship proposal";
                break;
            case COUNTER_OFFER:
                notifType = NotificationType.COUNTER_OFFER;
                title = "Counter-offer received";
                break;
            case DEAL_ACCEPTED:
                notifType = NotificationType.DEAL_CREATED;
                title = "Deal accepted!";
                break;
            default:
                notifType = NotificationType.NEW_MESSAGE;
                title = "New message from " + sender.getName();
        }

        Notification notification = Notification.builder()
                .user(recipient)
                .notificationType(notifType)
                .title(title)
                .message(message.getContent().length() > 200
                        ? message.getContent().substring(0, 200) + "..."
                        : message.getContent())
                .conversationId(conversation.getId())
                .actorId(sender.getId())
                .actorName(sender.getName())
                .build();

        notification = notificationRepository.save(notification);

        // Push notification via WebSocket
        NotificationDTO notifDTO = toNotificationDTO(notification);
        messagingTemplate.convertAndSendToUser(
                recipientId.toString(),
                "/queue/notifications",
                notifDTO);
    }

    // ── Helper Methods ───────────────────────────────────────────

    private void validateAccess(Conversation conversation, Long userId) {
        boolean isCompany = conversation.getCompany().getId().equals(userId);
        boolean isOrganizer = conversation.getOrganizer().getId().equals(userId);
        if (!isCompany && !isOrganizer) {
            throw new RuntimeException("Access denied to conversation " + conversation.getId());
        }
    }

    private ConversationDTO toConversationDTO(Conversation c, Long userId) {
        Long participantId;
        String participantName;
        String participantRole;

        if (c.getCompany().getId().equals(userId)) {
            participantId = c.getOrganizer().getId();
            participantName = c.getOrganizer().getName();
            participantRole = "ORGANIZER";
        } else {
            participantId = c.getCompany().getId();
            participantName = c.getCompany().getName();
            participantRole = "COMPANY";
        }

        return ConversationDTO.builder()
                .id(c.getId())
                .companyId(c.getCompany().getId())
                .companyName(c.getCompany().getName())
                .organizerId(c.getOrganizer().getId())
                .organizerName(c.getOrganizer().getName())
                .eventName(c.getEventName())
                .subject(c.getSubject())
                .status(c.getStatus())
                .lastMessagePreview(c.getLastMessagePreview())
                .lastMessageAt(c.getLastMessageAt())
                .unreadCount(c.getUnreadCountForUser(userId))
                .participantId(participantId)
                .participantName(participantName)
                .participantRole(participantRole)
                .createdAt(c.getCreatedAt())
                .build();
    }

    private ConversationMessageDTO toMessageDTO(ConversationMessage m) {
        return ConversationMessageDTO.builder()
                .id(m.getId())
                .conversationId(m.getConversation().getId())
                .senderId(m.getSender().getId())
                .senderName(m.getSender().getName())
                .senderRole(m.getSender().getRole().name())
                .messageType(m.getMessageType())
                .content(m.getContent())
                .status(m.getStatus())
                .proposalAmount(m.getProposalAmount())
                .sponsorshipType(m.getSponsorshipType())
                .proposalTerms(m.getProposalTerms())
                .goodiesDescription(m.getGoodiesDescription())
                .proposalDeadline(m.getProposalDeadline())
                .parentMessageId(m.getParentMessageId())
                .attachmentUrl(m.getAttachmentUrl())
                .attachmentName(m.getAttachmentName())
                .metadata(m.getMetadata())
                .edited(m.getEdited())
                .deliveredAt(m.getDeliveredAt())
                .readAt(m.getReadAt())
                .createdAt(m.getCreatedAt())
                .build();
    }

    private NotificationDTO toNotificationDTO(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .type(n.getNotificationType())
                .title(n.getTitle())
                .message(n.getMessage())
                .conversationId(n.getConversationId())
                .actionUrl(n.getActionUrl())
                .actorId(n.getActorId())
                .actorName(n.getActorName())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .build();
    }

    // ── Inner DTOs ───────────────────────────────────────────────

    @lombok.Data
    @lombok.AllArgsConstructor
    public static class ReadReceiptDTO {
        private Long conversationId;
        private Long userId;
        private int messagesRead;
    }
}
