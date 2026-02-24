package com.eventra.service;

import com.eventra.dto.MessageDTO;
import com.eventra.entity.Message;
import com.eventra.entity.Organizer;
import com.eventra.entity.SponsorshipRequest;
import com.eventra.entity.User;
import com.eventra.mapper.MessageMapper;
import com.eventra.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MessageService {
    private final MessageRepository messageRepository;
    private final SponsorshipRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final OrganizerRepository organizerRepository;
    private final CompanyRepository companyRepository;
    private final MessageMapper messageMapper;

    public MessageDTO sendMessage(String senderId, String requestId, String content) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SponsorshipRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        // Verify sender is part of the request (organizer or company owner)
        boolean isOrganizer = false;
        boolean isCompany = false;

        var organizer = organizerRepository.findById(request.getOrganizerId());
        if (organizer.isPresent() && organizer.get().getUserId().equals(senderId)) {
            isOrganizer = true;
        }

        var company = companyRepository.findById(request.getCompanyId());
        if (company.isPresent() && company.get().getUserId().equals(senderId)) {
            isCompany = true;
        }

        if (!isOrganizer && !isCompany) {
            throw new RuntimeException("Unauthorized: You are not part of this request");
        }

        Message message = Message.builder()
                .requestId(requestId)
                .senderId(senderId)
                .content(content)
                .build();

        Message saved = messageRepository.save(message);
        return messageMapper.toDTO(saved, sender);
    }

    public List<MessageDTO> getMessagesByRequest(String requestId) {
        List<Message> messages = messageRepository.findByRequestIdOrderByCreatedAtAsc(requestId);

        // Batch fetch all unique senders
        Set<String> senderIds = messages.stream()
                .map(Message::getSenderId)
                .collect(Collectors.toSet());
        Map<String, User> userMap = userRepository.findAllById(senderIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        return messages.stream()
                .map(m -> messageMapper.toDTO(m, userMap.get(m.getSenderId())))
                .collect(Collectors.toList());
    }
}
