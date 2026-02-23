package com.eventra.repository;

import com.eventra.entity.Organizer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizerRepository extends JpaRepository<Organizer, Long> {
    Optional<Organizer> findByUserId(Long userId);
    
    List<Organizer> findByVerifiedFalse();
}
