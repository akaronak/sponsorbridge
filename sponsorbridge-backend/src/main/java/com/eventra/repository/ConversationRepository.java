package com.eventra.repository;

import com.eventra.entity.Conversation;
import com.eventra.entity.ConversationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    /**
     * Find all conversations for a user (as company or organizer), ordered by most recent activity.
     */
    @Query("SELECT c FROM Conversation c WHERE c.company.id = :userId OR c.organizer.id = :userId ORDER BY c.lastMessageAt DESC")
    List<Conversation> findByUserIdOrderByLastMessageAtDesc(@Param("userId") Long userId);

    /**
     * Find conversations by status for a user.
     */
    @Query("SELECT c FROM Conversation c WHERE (c.company.id = :userId OR c.organizer.id = :userId) AND c.status = :status ORDER BY c.lastMessageAt DESC")
    List<Conversation> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") ConversationStatus status);

    /**
     * Check if a conversation already exists between two users for a specific event.
     */
    @Query("SELECT c FROM Conversation c WHERE c.company.id = :companyId AND c.organizer.id = :organizerId AND c.eventName = :eventName AND c.status != 'CLOSED'")
    Optional<Conversation> findExistingConversation(
            @Param("companyId") Long companyId,
            @Param("organizerId") Long organizerId,
            @Param("eventName") String eventName
    );

    /**
     * Get total unread count for a user across all conversations.
     */
    @Query("SELECT COALESCE(SUM(CASE WHEN c.company.id = :userId THEN c.unreadCompany ELSE c.unreadOrganizer END), 0) FROM Conversation c WHERE c.company.id = :userId OR c.organizer.id = :userId")
    int getTotalUnreadCount(@Param("userId") Long userId);

    /**
     * Reset unread count for company side of a conversation.
     */
    @Modifying
    @Query("UPDATE Conversation c SET c.unreadCompany = 0 WHERE c.id = :conversationId")
    void resetUnreadCompany(@Param("conversationId") Long conversationId);

    /**
     * Reset unread count for organizer side of a conversation.
     */
    @Modifying
    @Query("UPDATE Conversation c SET c.unreadOrganizer = 0 WHERE c.id = :conversationId")
    void resetUnreadOrganizer(@Param("conversationId") Long conversationId);
}
