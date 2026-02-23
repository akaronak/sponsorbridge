package com.eventra.repository;

import com.eventra.entity.ConversationMessage;
import com.eventra.entity.MessageStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationMessageRepository extends JpaRepository<ConversationMessage, Long> {

    /**
     * Get messages for a conversation, paginated (for infinite scroll).
     */
    Page<ConversationMessage> findByConversationIdOrderByCreatedAtDesc(Long conversationId, Pageable pageable);

    /**
     * Get all messages for a conversation, ordered ASC (for initial load).
     */
    List<ConversationMessage> findByConversationIdOrderByCreatedAtAsc(Long conversationId);

    /**
     * Count unread messages in a conversation for a specific recipient.
     */
    @Query("SELECT COUNT(m) FROM ConversationMessage m WHERE m.conversation.id = :conversationId AND m.sender.id != :userId AND m.status != 'READ'")
    int countUnreadInConversation(@Param("conversationId") Long conversationId, @Param("userId") Long userId);

    /**
     * Mark all messages from a sender as read in a conversation.
     */
    @Modifying
    @Query("UPDATE ConversationMessage m SET m.status = 'READ', m.readAt = CURRENT_TIMESTAMP WHERE m.conversation.id = :conversationId AND m.sender.id != :userId AND m.status != 'READ'")
    int markAllAsRead(@Param("conversationId") Long conversationId, @Param("userId") Long userId);

    /**
     * Mark all messages as delivered when user connects.
     */
    @Modifying
    @Query("UPDATE ConversationMessage m SET m.status = 'DELIVERED', m.deliveredAt = CURRENT_TIMESTAMP WHERE m.conversation.id = :conversationId AND m.sender.id != :userId AND m.status = 'SENT'")
    int markAllAsDelivered(@Param("conversationId") Long conversationId, @Param("userId") Long userId);

    /**
     * Find messages by type in a conversation (e.g., all proposals).
     */
    @Query("SELECT m FROM ConversationMessage m WHERE m.conversation.id = :conversationId AND m.messageType = :type ORDER BY m.createdAt DESC")
    List<ConversationMessage> findByConversationIdAndType(@Param("conversationId") Long conversationId, @Param("type") com.eventra.entity.MessageType type);
}
