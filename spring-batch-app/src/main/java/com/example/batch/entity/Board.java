package com.example.batch.entity;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "boards")
@SQLDelete(sql = "UPDATE BOARDS SET is_deleted = 'Y' WHERE id = ?")
@Where(clause = "is_deleted = 'N'")
@Data
public class Board {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false, length = 1000)
    private String content;
    
    @Column(nullable = false)
    private String author;
    
    private String authorEmail;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "is_deleted", nullable = false, length = 1)
    private String isDeleted = "N";
}
