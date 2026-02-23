package com.eventra.repository;

import com.eventra.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    @Query("SELECT m FROM Message m WHERE m.request.id = :requestId ORDER BY m.createdAt ASC")
    List<Message> findByRequestIdOrderByCreatedAtAsc(@Param("requestId") Long requestId);
}
