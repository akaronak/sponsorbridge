package com.sponsorbridge.service;

import com.sponsorbridge.dto.MessageDTO;
import com.sponsorbridge.entity.Message;
import com.sponsorbridge.entity.SponsorshipRequest;
import com.sponsorbridge.entity.User;
import com.sponsorbridge.mapper.MessageMapper;
import com.sponsorbridge.repository.MessageRepository;
import com.sponsorbridge.repository.SponsorshipRequestRepository;
import com.sponsorbridge.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MessageService {
    private final MessageRepository messageRepository;
    private final SponsorshipRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final MessageMapper messageMapper;

    public MessageDTO sendMessage(Long senderId, Long requestId, String content) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        SponsorshipRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        
        // Verify that the sender is part of the request (either organizer or company)
        boolean isOrganizer = request.getOrganizer().getUser().getId().equals(senderId);
        boolean isCompany = request.getCompany().getUser().getId().equals(senderId);
        
        if (!isOrganizer && !isCompany) {
            throw new RuntimeException("Unauthorized: You are not part of this request");
        }
        
        Message message = Message.builder()
                .request(request)
                .sender(sender)
                .content(content)
                .build();
        
        Message saved = messageRepository.save(message);
        return messageMapper.toDTO(saved);
    }

    public List<MessageDTO> getMessagesByRequest(Long requestId) {
        List<Message> messages = messageRepository.findByRequestIdOrderByCreatedAtAsc(requestId);
        return messages.stream()
                .map(messageMapper::toDTO)
                .collect(Collectors.toList());
    }
}
