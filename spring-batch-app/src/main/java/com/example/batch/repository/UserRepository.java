package com.example.batch.repository;

import com.example.batch.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

public interface UserRepository extends JpaRepository<User, Long> {

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.passwordPromptStatus = 'REQUIRED' WHERE u.createdAt <= :targetTime AND u.passwordPromptStatus = 'DEFAULT'")
    int updatePasswordPromptRequired(LocalDateTime targetTime);
}
