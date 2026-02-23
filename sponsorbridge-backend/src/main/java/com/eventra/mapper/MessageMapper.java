package com.eventra.mapper;

import com.eventra.dto.MessageDTO;
import com.eventra.entity.Message;
import org.springframework.stereotype.Component;

@Component
public class MessageMapper {
    
    public MessageDTO toDTO(Message message) {
        if (message == null) {
            return null;
        }
        
        return MessageDTO.builder()
                .id(message.getId())
                .senderId(message.getSender().getId())
                .senderName(message.getSender().getName())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .build();
    }
    
    public Message toEntity(MessageDTO dto) {
        if (dto == null) {
            return null;
        }
        
        return Message.builder()
                .id(dto.getId())
                .content(dto.getContent())
                .build();
    }
}
