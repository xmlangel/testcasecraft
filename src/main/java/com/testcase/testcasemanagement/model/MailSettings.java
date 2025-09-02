package com.testcase.testcasemanagement.model;

import lombok.Getter;
import lombok.Setter;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mail_settings")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MailSettings {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "mail_enabled", nullable = false)
    @Builder.Default
    private Boolean mailEnabled = false;
    
    @Column(name = "smtp_host", nullable = false)
    @Builder.Default
    private String smtpHost = "smtp.gmail.com";
    
    @Column(name = "smtp_port", nullable = false)
    @Builder.Default
    private Integer smtpPort = 587;
    
    @Column(name = "username", nullable = false)
    private String username;
    
    @Column(name = "password", nullable = false)
    private String password; // 암호화되어 저장됨
    
    @Column(name = "from_name", nullable = false)
    @Builder.Default
    private String fromName = "TestCase Manager";
    
    @Column(name = "use_auth", nullable = false)
    @Builder.Default
    private Boolean useAuth = true;
    
    @Column(name = "use_tls", nullable = false)
    @Builder.Default
    private Boolean useTLS = true;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "updated_by")
    private String updatedBy;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}