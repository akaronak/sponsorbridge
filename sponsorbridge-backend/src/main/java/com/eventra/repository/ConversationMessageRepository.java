package com.eventra.repository;

import com.eventra.entity.ConversationMessage;
import com.eventra.entity.MessageType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConversationMessageRepository extends MongoRepository<ConversationMessage, String> {

    Page<ConversationMessage> findByConversationIdOrderByCreatedAtDesc(String conversationId, Pageable pageable);

    List<ConversationMessage> findByConversationIdOrderByCreatedAtAsc(String conversationId);

    @Query(value = "{'conversationId': ?0, 'senderId': {'$ne': ?1}, 'status': {'$ne': 'READ'}}", count = true)
    int countUnreadInConversation(String conversationId, String userId);

    List<ConversationMessage> findByConversationIdAndMessageTypeOrderByCreatedAtDesc(
        String conversationId, MessageType messageType);
}
