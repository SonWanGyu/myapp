package com.example.app.domain;

import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;
import java.time.LocalDateTime;

@Entity
@Table(name = "BOARDS")
@SQLDelete(sql = "UPDATE BOARDS SET is_deleted = 'Y' WHERE id = ?")
@Where(clause = "is_deleted = 'N'")
@Getter
@Setter
@NoArgsConstructor
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
    
    @Column(nullable = false)
    private String authorEmail;
    
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "is_deleted", nullable = false, length = 1)
    private String isDeleted = "N";
}
