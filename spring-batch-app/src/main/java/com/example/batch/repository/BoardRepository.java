package com.example.batch.repository;

import com.example.batch.entity.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {
    
    @Transactional
    @Modifying
    @Query("DELETE FROM Board b WHERE b.createdAt < :time")
    int deleteByCreatedAtBefore(@Param("time") LocalDateTime time);
}
