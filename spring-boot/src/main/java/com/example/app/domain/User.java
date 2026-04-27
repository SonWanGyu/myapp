package com.example.app.domain;

import javax.persistence.*;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "USERS")
@NoArgsConstructor
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(nullable = false)
    private String password;
    
    @Column(nullable = false)
    private String role;
    
    @Column(nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;
    
    // 비밀번호 최종 변경 혹은 다음에 변경하기를 누른 시점 
    @Column(nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime passwordUpdatedAt;
    
    // "DEFAULT", "REQUIRED"
    @Column(nullable = false, columnDefinition = "VARCHAR2(255) DEFAULT 'DEFAULT'")
    private String passwordPromptStatus = "DEFAULT";
    
    // "ACTIVE", "DELETED"
    @Column(nullable = false, columnDefinition = "VARCHAR2(20) DEFAULT 'ACTIVE'")
    private String status = "ACTIVE";
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (passwordUpdatedAt == null) {
            passwordUpdatedAt = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getPasswordUpdatedAt() { return passwordUpdatedAt; }
    public void setPasswordUpdatedAt(LocalDateTime passwordUpdatedAt) { this.passwordUpdatedAt = passwordUpdatedAt; }
    public String getPasswordPromptStatus() { return passwordPromptStatus; }
    public void setPasswordPromptStatus(String passwordPromptStatus) { this.passwordPromptStatus = passwordPromptStatus; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
