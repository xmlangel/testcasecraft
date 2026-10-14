// src/main/java/com/testcase/testcasemanagement/model/GoogleConfig.java
package com.testcase.testcasemanagement.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Comment;

@Entity
@Comment("Google 설정: 사용자의 Google Sheets 연동 인증 정보")
@Table(name = "google_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class GoogleConfig {
  @Comment("식별자: 이 Google 설정 기록을 유일하게 가리키는 값 (값 영역: UUID 36자)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Comment("사용자 식별자: 이 Google 설정을 소유한 사용자 (값 영역: users.id 참조)")
  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  @JsonIgnore
  private User user;

  // 하위 호환성을 위해 userId 게터 추가
  public String getUserId() {
    return user != null ? user.getId() : null;
  }

  @Comment("클라이언트 이메일: Google 서비스 계정 또는 OAuth 사용자 이메일 (값 영역: 200자 이하 이메일)")
  @Column(nullable = false, length = 200)
  private String clientEmail;

  @Comment("프로젝트ID: Google Cloud 프로젝트 또는 스프레드시트 프로젝트 식별자 (값 영역: 100자 이하)")
  @Column(nullable = false, length = 100)
  private String projectId;

  @Comment("JSON 키: Google 인증용 JSON 키 전체 (값 영역: 암호문)")
  @JsonIgnore
  @Column(nullable = false, columnDefinition = "TEXT")
  private String encryptedJsonKey; // 암호화된 JSON 원본

  @Comment("활성 여부: 이 Google 설정을 사용할 수 있는지 (값 영역: true, false)")
  @Column(nullable = false)
  private Boolean isActive = true;

  @Comment("생성 일시: 이 행이 처음 저장된 일시")
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Comment("수정 일시: 이 행이 마지막으로 변경된 일시")
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @Comment("마지막 가져오기 스프레드시트 식별자: 가장 최근에 가져온 Google Sheets의 ID (값 영역: 512자 이하)")
  @Column(name = "last_import_spreadsheet_id", length = 512)
  private String lastImportSpreadsheetId;

  @Comment("마지막 가져오기 시트 명: 가장 최근에 가져온 시트의 이름 (값 영역: 200자 이하)")
  @Column(name = "last_import_sheet_name", length = 200)
  private String lastImportSheetName;

  @Comment("마지막 내보내기 스프레드시트 식별자: 가장 최근에 내보낸 Google Sheets의 ID (값 영역: 512자 이하)")
  @Column(name = "last_export_spreadsheet_id", length = 512)
  private String lastExportSpreadsheetId;

  @Comment("마지막 내보내기 시트 명: 가장 최근에 내보낸 시트의 이름 (값 영역: 200자 이하)")
  @Column(name = "last_export_sheet_name", length = 200)
  private String lastExportSheetName;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
