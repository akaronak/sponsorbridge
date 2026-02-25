package com.eventra.entity;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "conversations")
@CompoundIndexes({
    @CompoundIndex(name = "idx_conv_existing", def = "{'companyId': 1, 'organizerId': 1, 'eventName': 1}"),
    @CompoundIndex(name = "idx_conv_user_updated", def = "{'companyId': 1, 'organizerId': 1, 'lastMessageAt': -1}")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {

    @Id
    private String id;

    @Indexed
    @NotNull
    private String companyId;

    @Indexed
    @NotNull
    private String organizerId;

    @Indexed
    private String eventName;

    private String requestId;

    private String subject;

    @Indexed
    @Builder.Default
    private ConversationStatus status = ConversationStatus.ACTIVE;

    private String lastMessagePreview;

    private LocalDateTime lastMessageAt;

    @Builder.Default
    private Integer unreadCompany = 0;

    @Builder.Default
    private Integer unreadOrganizer = 0;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    public int getUnreadCountForUser(String userId) {
        if (userId != null && userId.equals(companyId)) {
            return unreadCompany != null ? unreadCompany : 0;
        }
        if (userId != null && userId.equals(organizerId)) {
            return unreadOrganizer != null ? unreadOrganizer : 0;
        }
        return 0;
    }

    public void incrementUnreadForRecipient(String senderId) {
        if (senderId != null && senderId.equals(companyId)) {
            unreadOrganizer = (unreadOrganizer != null ? unreadOrganizer : 0) + 1;
        } else {
            unreadCompany = (unreadCompany != null ? unreadCompany : 0) + 1;
        }
    }

    public void markReadForUser(String userId) {
        if (userId != null && userId.equals(companyId)) {
            unreadCompany = 0;
        } else if (userId != null && userId.equals(organizerId)) {
            unreadOrganizer = 0;
        }
    }
}
