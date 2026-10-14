package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Comment;

@Entity
@Comment("메일 설정: 메일 전송에 필요한 SMTP 서버 설정 정보")
@Table(name = "mail_settings")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MailSettings {

  @Comment("식별자: 메일 설정을 구분하는 일련번호")
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Comment("메일 활성화 여부: 메일 전송 기능의 사용 여부 (값 영역: true, false)")
  @Column(name = "mail_enabled", nullable = false)
  @Builder.Default
  private Boolean mailEnabled = false;

  @Comment("SMTP 호스트: 메일을 전송할 SMTP 서버 주소")
  @Column(name = "smtp_host", nullable = false)
  @Builder.Default
  private String smtpHost = "smtp.gmail.com";

  @Comment("SMTP 포트: SMTP 서버 연결 포트 (값 영역: 587(TLS), 465(SSL), 25)")
  @Column(name = "smtp_port", nullable = false)
  @Builder.Default
  private Integer smtpPort = 587;

  @Comment("사용자명: SMTP 서버 인증에 사용하는 계정")
  @Column(name = "username", nullable = false)
  private String username;

  @Comment("암호: SMTP 서버 인증에 사용하는 암호 (값 영역: 암호문)")
  @Column(name = "password", nullable = false)
  private String password; // 암호화되어 저장됨

  @Comment("발신자 명: 메일 From 헤더에 표시될 이름")
  @Column(name = "from_name", nullable = false)
  @Builder.Default
  private String fromName = "TestCase Manager";

  @Comment("인증 사용 여부: SMTP 인증 사용 여부 (값 영역: true, false)")
  @Column(name = "use_auth", nullable = false)
  @Builder.Default
  private Boolean useAuth = true;

  @Comment("TLS 사용 여부: TLS 암호화 연결 사용 여부 (값 영역: true, false)")
  @Column(name = "use_tls", nullable = false)
  @Builder.Default
  private Boolean useTLS = true;

  @Comment("생성 일시: 이 행이 처음 저장된 일시")
  @Column(name = "created_at")
  private LocalDateTime createdAt;

  @Comment("수정 일시: 이 행이 마지막으로 변경된 일시")
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @Comment("수정자: 이 행을 마지막으로 변경한 사용자")
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
