package com.eventra.service;

import com.eventra.dto.*;
import com.eventra.entity.*;
import com.eventra.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
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
    private final MongoTemplate mongoTemplate;

    // ── Conversation Management ──────────────────────────────────

    @Transactional(readOnly = true)
    public List<ConversationDTO> getConversations(String userId) {
        List<Conversation> conversations = conversationRepository
                .findByUserIdOrderByLastMessageAtDesc(userId);

        // Batch fetch all user participants
        Set<String> userIds = new HashSet<>();
        conversations.forEach(c -> {
            userIds.add(c.getCompanyId());
            userIds.add(c.getOrganizerId());
        });
        Map<String, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        return conversations.stream()
                .map(c -> toConversationDTO(c, userId, userMap))
                .collect(Collectors.toList());
    }

    @Transactional
    public ConversationDTO getOrCreateConversation(String userId, CreateConversationRequest request) {
        User currentUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        User participant = userRepository.findById(request.getParticipantId())
                .orElseThrow(() -> new RuntimeException("Participant not found: " + request.getParticipantId()));

        // Determine who is company vs organizer
        String companyUserId, organizerUserId;
        if (currentUser.getRole() == Role.COMPANY) {
            companyUserId = currentUser.getId();
            organizerUserId = participant.getId();
        } else {
            companyUserId = participant.getId();
            organizerUserId = currentUser.getId();
        }

        // Check for existing conversation
        Optional<Conversation> existing = conversationRepository.findExistingConversation(
                companyUserId, organizerUserId, request.getEventName());

        if (existing.isPresent()) {
            Map<String, User> userMap = Map.of(
                    currentUser.getId(), currentUser,
                    participant.getId(), participant);
            return toConversationDTO(existing.get(), userId, userMap);
        }

        // Create new conversation
        Conversation conversation = Conversation.builder()
                .companyId(companyUserId)
                .organizerId(organizerUserId)
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
                conversation.getId(), companyUserId, organizerUserId, request.getEventName());

        Map<String, User> userMap = Map.of(
                currentUser.getId(), currentUser,
                participant.getId(), participant);
        return toConversationDTO(conversation, userId, userMap);
    }

    @Transactional(readOnly = true)
    public ConversationDTO getConversation(String conversationId, String userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found: " + conversationId));

        validateAccess(conversation, userId);

        Map<String, User> userMap = userRepository.findAllById(
                        List.of(conversation.getCompanyId(), conversation.getOrganizerId())).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        return toConversationDTO(conversation, userId, userMap);
    }

    // ── Message Operations ───────────────────────────────────────

    @Transactional
    public ConversationMessageDTO sendMessage(String senderId, SendMessageRequest request) {
        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new RuntimeException("Conversation not found: " + request.getConversationId()));

        validateAccess(conversation, senderId);

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("User not found: " + senderId));

        MessageType messageType = MessageType.TEXT;
        if (request.getMessageType() != null) {
            try {
                messageType = MessageType.valueOf(request.getMessageType());
            } catch (IllegalArgumentException e) {
                log.warn("Unknown message type: {}. Defaulting to TEXT.", request.getMessageType());
            }
        }

        ConversationMessage message = ConversationMessage.builder()
                .conversationId(conversation.getId())
                .senderId(senderId)
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

        ConversationMessageDTO dto = toMessageDTO(message, sender);

        // Broadcast via WebSocket
        broadcastMessage(conversation, dto, senderId);

        // Create notification for recipient
        createMessageNotification(conversation, sender, message);

        log.info("Message {} sent in conversation {} by user {}",
                message.getId(), conversation.getId(), senderId);

        return dto;
    }

    @Transactional(readOnly = true)
    public List<ConversationMessageDTO> getMessages(String conversationId, String userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found: " + conversationId));

        validateAccess(conversation, userId);

        List<ConversationMessage> messages = messageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversationId);

        // Batch fetch all senders
        Set<String> senderIds = messages.stream()
                .map(ConversationMessage::getSenderId)
                .collect(Collectors.toSet());
        Map<String, User> userMap = userRepository.findAllById(senderIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        return messages.stream()
                .map(m -> toMessageDTO(m, userMap.get(m.getSenderId())))
                .collect(Collectors.toList());
    }

    @Transactional
    public void markConversationAsRead(String conversationId, String userId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found: " + conversationId));

        validateAccess(conversation, userId);

        // Bulk update messages using MongoTemplate
        Query query = new Query(Criteria.where("conversationId").is(conversationId)
                .and("senderId").ne(userId)
                .and("status").ne(MessageStatus.READ.name()));
        Update update = new Update()
                .set("status", MessageStatus.READ.name())
                .set("readAt", LocalDateTime.now());
        var result = mongoTemplate.updateMulti(query, update, ConversationMessage.class);
        int updated = (int) result.getModifiedCount();

        conversation.markReadForUser(userId);
        conversationRepository.save(conversation);

        messagingTemplate.convertAndSend(
                "/topic/conversation/" + conversationId + "/read",
                new ReadReceiptDTO(conversationId, userId, updated));

        log.debug("Marked {} messages as read in conversation {} for user {}", updated, conversationId, userId);
    }

    @Transactional(readOnly = true)
    public int getTotalUnreadCount(String userId) {
        List<Conversation> conversations = conversationRepository
                .findByUserIdOrderByLastMessageAtDesc(userId);

        return conversations.stream()
                .mapToInt(c -> c.getUnreadCountForUser(userId))
                .sum();
    }

    // ── Typing Indicator ─────────────────────────────────────────

    public void broadcastTypingIndicator(TypingIndicatorDTO typing) {
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + typing.getConversationId() + "/typing",
                typing);
    }

    // ── WebSocket Broadcasting ───────────────────────────────────

    private void broadcastMessage(Conversation conversation, ConversationMessageDTO dto, String senderId) {
        messagingTemplate.convertAndSend(
                "/topic/conversation/" + conversation.getId(),
                dto);

        String recipientId = conversation.getCompanyId().equals(senderId)
                ? conversation.getOrganizerId()
                : conversation.getCompanyId();

        messagingTemplate.convertAndSendToUser(
                recipientId,
                "/queue/messages",
                dto);
    }

    private void createMessageNotification(Conversation conversation, User sender, ConversationMessage message) {
        String recipientId = conversation.getCompanyId().equals(sender.getId())
                ? conversation.getOrganizerId()
                : conversation.getCompanyId();

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
                .userId(recipientId)
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

        NotificationDTO notifDTO = toNotificationDTO(notification);
        messagingTemplate.convertAndSendToUser(
                recipientId,
                "/queue/notifications",
                notifDTO);
    }

    // ── Helper Methods ───────────────────────────────────────────

    private void validateAccess(Conversation conversation, String userId) {
        boolean isCompany = conversation.getCompanyId().equals(userId);
        boolean isOrganizer = conversation.getOrganizerId().equals(userId);
        if (!isCompany && !isOrganizer) {
            throw new RuntimeException("Access denied to conversation " + conversation.getId());
        }
    }

    private ConversationDTO toConversationDTO(Conversation c, String userId, Map<String, User> userMap) {
        String participantId;
        String participantName;
        String participantRole;

        User companyUser = userMap.get(c.getCompanyId());
        User organizerUser = userMap.get(c.getOrganizerId());

        if (c.getCompanyId().equals(userId)) {
            participantId = c.getOrganizerId();
            participantName = organizerUser != null ? organizerUser.getName() : null;
            participantRole = "ORGANIZER";
        } else {
            participantId = c.getCompanyId();
            participantName = companyUser != null ? companyUser.getName() : null;
            participantRole = "COMPANY";
        }

        return ConversationDTO.builder()
                .id(c.getId())
                .companyId(c.getCompanyId())
                .companyName(companyUser != null ? companyUser.getName() : null)
                .organizerId(c.getOrganizerId())
                .organizerName(organizerUser != null ? organizerUser.getName() : null)
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

    private ConversationMessageDTO toMessageDTO(ConversationMessage m, User sender) {
        return ConversationMessageDTO.builder()
                .id(m.getId())
                .conversationId(m.getConversationId())
                .senderId(m.getSenderId())
                .senderName(sender != null ? sender.getName() : null)
                .senderRole(sender != null ? sender.getRole().name() : null)
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
        private String conversationId;
        private String userId;
        private int messagesRead;
    }
}
