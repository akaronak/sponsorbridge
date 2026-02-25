package com.eventra.repository;

import com.eventra.entity.Conversation;
import com.eventra.entity.ConversationStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {

    @Query(value = "{'$or': [{'companyId': ?0}, {'organizerId': ?0}]}", sort = "{'lastMessageAt': -1}")
    List<Conversation> findByUserIdOrderByLastMessageAtDesc(String userId);

    @Query(value = "{'$or': [{'companyId': ?0}, {'organizerId': ?0}], 'status': ?1}", sort = "{'lastMessageAt': -1}")
    List<Conversation> findByUserIdAndStatus(String userId, ConversationStatus status);

    @Query("{'companyId': ?0, 'organizerId': ?1, 'eventName': ?2, 'status': {'$ne': 'CLOSED'}}")
    Optional<Conversation> findExistingConversation(String companyId, String organizerId, String eventName);
}
