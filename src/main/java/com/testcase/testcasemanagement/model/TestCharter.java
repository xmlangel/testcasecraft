package com.testcase.testcasemanagement.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.Comment;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Comment("테스트 차터: 테스트 활동의 목표와 범위를 정의하는 문서")
@Table(
    name = "test_charters",
    indexes = {
      @Index(name = "idx_test_charter_project", columnList = "project_id"),
      @Index(name = "idx_test_charter_status", columnList = "status")
    })
public class TestCharter {

  public enum CharterStatus {
    ACTIVE,
    ARCHIVED
  }

  @Comment("테스트 차터 식별자: 이 테스트 차터를 유일하게 가리키는 값 (값 영역: UUID 36자)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  @Comment(value = "프로젝트 식별자: 이 테스트 차터가 속한 프로젝트를 가리키는 값 (값 영역: projects.id 참조, UUID 36자)", on = "project_id")
  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "project_id", nullable = false)
  private Project project;

  @Comment("차터 제목: 테스트 차터의 이름 또는 제목")
  @Column(nullable = false, length = 200)
  private String title;

  @Comment("미션: 이 테스트 차터의 목표와 목적을 설명하는 내용")
  @Column(nullable = false, columnDefinition = "TEXT")
  private String mission;

  @Comment("테스트 영역: 차터에서 다루는 테스트 범위 또는 기능 영역을 설명하는 내용")
  @Column(name = "areas", columnDefinition = "TEXT")
  private String areas;

  @Comment("태그 목록: 테스트 차터를 분류하는 태그들을 쉼표로 구분하여 저장한 값")
  @Column(name = "tags", columnDefinition = "TEXT")
  private String tags;

  @Comment("생성자 명: 이 테스트 차터를 생성한 사용자의 식별자")
  @Column(name = "created_by", length = 100)
  private String createdBy;

  @Comment("차터 상태: 테스트 차터의 현재 상태 (값 영역: ACTIVE, ARCHIVED)")
  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private CharterStatus status;

  @Comment(value = "생성 일시: 이 행이 처음 저장된 일시", on = "created_at")
  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @Comment(value = "수정 일시: 이 행이 마지막으로 변경된 일시", on = "updated_at")
  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    LocalDateTime now = LocalDateTime.now();
    this.createdAt = now;
    this.updatedAt = now;
    if (this.status == null) {
      this.status = CharterStatus.ACTIVE;
    }
  }

  @PreUpdate
  protected void onUpdate() {
    this.updatedAt = LocalDateTime.now();
  }
}
