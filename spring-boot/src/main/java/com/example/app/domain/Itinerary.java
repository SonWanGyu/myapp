package com.example.app.domain;

import javax.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "ITINERARIES")
@Getter
@Setter
@NoArgsConstructor
public class Itinerary {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String email; // userEmail to link with User
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false)
    private String startDate;
    
    @Column(nullable = false)
    private String endDate;
    
    @Lob
    @Column(nullable = false)
    private String scheduleJson; // Gemini output JSON
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
