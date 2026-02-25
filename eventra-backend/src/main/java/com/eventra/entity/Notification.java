package com.eventra.entity;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "notifications")
@CompoundIndexes({
    @CompoundIndex(name = "idx_notif_user_read", def = "{'userId': 1, 'isRead': 1}"),
    @CompoundIndex(name = "idx_notif_user_created", def = "{'userId': 1, 'createdAt': -1}")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    private String id;

    @Indexed
    @NotNull
    private String userId;

    @Indexed
    private NotificationType notificationType;

    private String title;

    private String message;

    private String conversationId;

    private String actionUrl;

    private String actorId;

    private String actorName;

    @Indexed
    @Builder.Default
    private Boolean isRead = false;

    @CreatedDate
    private LocalDateTime createdAt;
}
