package com.eventra.mapper;

import com.eventra.dto.MessageDTO;
import com.eventra.entity.Message;
import com.eventra.entity.User;
import org.springframework.stereotype.Component;

@Component
public class MessageMapper {

    /**
     * Convert Message document to DTO.
     * Requires pre-fetched sender User for name resolution.
     */
    public MessageDTO toDTO(Message message, User sender) {
        if (message == null) return null;

        return MessageDTO.builder()
                .id(message.getId())
                .senderId(message.getSenderId())
                .senderName(sender != null ? sender.getName() : null)
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .build();
    }

    public Message toEntity(MessageDTO dto) {
        if (dto == null) return null;

        return Message.builder()
                .id(dto.getId())
                .content(dto.getContent())
                .build();
    }
}
