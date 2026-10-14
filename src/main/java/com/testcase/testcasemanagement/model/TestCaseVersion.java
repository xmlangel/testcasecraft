// src/main/java/com/testcase/testcasemanagement/model/TestCaseVersion.java

package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.*;
import org.hibernate.annotations.Comment;

/**
 * ICT-349: 테스트케이스 버전 관리 시스템 - TestCaseVersion 엔티티
 *
 * <p>테스트케이스의 모든 버전을 저장하고 관리하는 엔티티입니다. 테스트케이스가 수정될 때마다 자동으로 새로운 버전이 생성됩니다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Comment("테스트 케이스 버전: 저장 시점마다 남긴 테스트 케이스 내용의 사본")
@Table(
    name = "testcase_versions",
    indexes = {
      @Index(name = "idx_version_testcase_id", columnList = "testcase_id"),
      @Index(name = "idx_version_number", columnList = "version_number"),
      @Index(name = "idx_version_testcase_version", columnList = "testcase_id, version_number"),
      @Index(name = "idx_version_created_at", columnList = "created_at"),
      @Index(name = "idx_version_is_current", columnList = "is_current_version"),
      @Index(name = "idx_version_project_id", columnList = "project_id")
    })
public class TestCaseVersion {

  @Comment("버전 식별자: 이 행을 유일하게 가리키는 값 (값 영역: UUID 36자)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(columnDefinition = "VARCHAR(36)", updatable = false)
  private String id;

  /** 연관된 테스트케이스 ID (원본 테스트케이스) */
  @Comment("테스트 케이스 식별자: 이 버전이 속한 테스트 케이스를 가리키는 값 (값 영역: testcases.id 참조)")
  @Column(name = "testcase_id", nullable = false)
  private String testCaseId;

  /** 프로젝트 ID (성능 최적화를 위한 중복 저장) */
  @Comment("프로젝트 식별자: 조회 성능 최적화를 위해 복제한 프로젝트 식별자 (값 영역: projects.id 참조)")
  @Column(name = "project_id", nullable = false)
  private String projectId;

  /** 버전 번호 (1부터 시작하는 순차 번호) */
  @Comment("버전 번호: 같은 테스트 케이스 내에서 순차적으로 증가하는 번호")
  @Column(name = "version_number", nullable = false)
  private Integer versionNumber;

  /** 버전 제목/라벨 (사용자가 지정 가능, 예: "v1.0", "Initial Version", "Bug Fix") */
  @Comment("버전 라벨: 사용자가 지정한 버전 이름 (예: v1.0, Initial Version)")
  @Column(name = "version_label", length = 100)
  private String versionLabel;

  /** 버전 설명/변경 사항 요약 */
  @Comment("버전 설명: 이 버전의 주요 변경 사항 요약")
  @Column(name = "version_description", columnDefinition = "TEXT")
  private String versionDescription;

  /** 현재 활성 버전 여부 (테스트 실행 시 사용되는 버전) 각 테스트케이스마다 하나의 버전만 true */
  @Comment("현재 버전 여부: 테스트 실행 시 사용되는 활성 버전인지 여부 (값 영역: true, false)")
  @Column(name = "is_current_version", nullable = false)
  private Boolean isCurrentVersion = false;

  // ============ 테스트케이스 데이터 스냅샷 (버전별 저장) ============

  @Comment("명칭: 테스트 케이스의 이름")
  @Column(columnDefinition = "TEXT", nullable = false)
  private String name;

  @Comment("유형: 테스트 케이스의 분류 (예: testcase, folder)")
  @Column(columnDefinition = "TEXT")
  private String type;

  @Comment("설명: 테스트 케이스의 상세 설명")
  @Column(columnDefinition = "TEXT")
  private String description;

  @Comment("사전 조건: 테스트 케이스 실행 전 만족해야 할 조건")
  @Column(columnDefinition = "TEXT")
  private String preCondition;

  @Comment("사후 조건: 테스트 케이스 실행 후 검증할 상태")
  @Column(columnDefinition = "TEXT", name = "post_condition")
  private String postCondition;

  @Comment("자동화 여부: 이 테스트 케이스를 자동화 테스트로 실행하는지 여부 (값 영역: true, false)")
  @Column(name = "is_automated")
  private Boolean isAutomated = Boolean.FALSE;

  @Comment("실행 유형: 테스트 실행 방식 (값 영역: Manual, Automation, Hybrid)")
  @Column(name = "execution_type", length = 50)
  private String executionType = "Manual";

  @Comment("테스트 기법: 이 테스트 케이스에 적용된 테스트 기법")
  @Column(columnDefinition = "TEXT", name = "test_technique")
  private String testTechnique;

  @Comment("부모 식별자: 상위 폴더를 가리키는 테스트 케이스 식별자 (값 영역: testcases.id 참조)")
  @Column(name = "parent_id")
  private String parentId;

  /** 테스트 스텝 (JSON 형태로 저장) TestStep 리스트를 JSON으로 직렬화하여 저장 */
  @Comment("테스트 스텝: JSON 형식으로 저장된 테스트 스텝 목록")
  @Column(name = "steps_json", columnDefinition = "TEXT")
  private String stepsJson;

  @Comment("기대 결과: 테스트 케이스의 기대 결과")
  @Column(columnDefinition = "TEXT", name = "expected_results")
  private String expectedResults;

  @Comment("표시 순서: 같은 폴더 내에서 나타나는 순서")
  @Column(name = "display_order")
  private Integer displayOrder;

  @Comment("우선순위: 테스트 케이스의 우선순위")
  @Column(name = "priority")
  private String priority;

  @Comment("순차 번호: 시스템에서 자동 생성하는 순차 번호")
  @Column(name = "sequential_id")
  private Integer sequentialId;

  @Comment("표시 ID: 사용자가 보는 테스트 케이스 ID")
  @Column(name = "display_id", length = 50)
  private String displayId;

  // ============ 버전 메타데이터 ============

  /** 버전 생성 시점 */
  @Comment("생성 일시: 이 버전이 처음 저장된 일시")
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  /** 버전 생성자 (사용자 ID) */
  @Comment("생성자 식별자: 이 버전을 생성한 사용자 (값 영역: users.id 참조)")
  @Column(name = "created_by", length = 36)
  private String createdBy;

  /** 버전 생성자 이름 (성능 최적화를 위한 중복 저장) */
  @Comment("생성자명: 조회 성능 최적화를 위해 복제한 생성자의 사용자명")
  @Column(name = "created_by_name", length = 100)
  private String createdByName;

  /** 원본 테스트케이스의 해당 시점 updatedAt */
  @Comment("원본 수정 일시: 이 버전이 생성될 당시 원본 테스트 케이스의 수정 일시")
  @Column(name = "original_updated_at")
  private LocalDateTime originalUpdatedAt;

  /** 변경 유형 (CREATE, UPDATE, MANUAL_SAVE) */
  @Comment("변경 유형: 버전이 생성된 이유 (값 영역: CREATE, UPDATE, MANUAL_SAVE, RESTORE)")
  @Column(name = "change_type", length = 20)
  private String changeType = "UPDATE";

  /** 이전 버전과의 주요 차이점 (자동 감지 또는 사용자 입력) */
  @Comment("변경 요약: 이전 버전과의 주요 변경 사항")
  @Column(name = "change_summary", columnDefinition = "TEXT")
  private String changeSummary;

  /** 버전 태그 (STABLE, DRAFT, ARCHIVED 등) */
  @Comment("버전 태그: 버전의 상태를 나타내는 태그 (값 영역: STABLE, DRAFT, ARCHIVED)")
  @Column(name = "version_tag", length = 20)
  private String versionTag = "STABLE";

  /** 복원/선택된 횟수 (사용 빈도 추적) */
  @Comment("사용 횟수: 이 버전이 테스트 실행에 선택된 횟수")
  @Column(name = "usage_count", nullable = false)
  private Integer usageCount = 0;

  @PrePersist
  protected void onCreate() {
    if (this.createdAt == null) this.createdAt = LocalDateTime.now();
    if (this.isCurrentVersion == null) this.isCurrentVersion = false;
    if (this.usageCount == null) this.usageCount = 0;
    if (this.changeType == null) this.changeType = "UPDATE";
    if (this.versionTag == null) this.versionTag = "STABLE";
  }

  /** 현재 버전으로 설정 (다른 버전들은 자동으로 false가 됨) */
  public void setAsCurrentVersion() {
    this.isCurrentVersion = true;
    this.usageCount = this.usageCount != null ? this.usageCount + 1 : 1;
  }

  /** 버전 사용 횟수 증가 */
  public void incrementUsageCount() {
    this.usageCount = this.usageCount != null ? this.usageCount + 1 : 1;
  }

  /** 버전 요약 정보 생성 */
  public String getVersionSummary() {
    StringBuilder summary = new StringBuilder();
    summary.append("v").append(versionNumber);

    if (versionLabel != null && !versionLabel.trim().isEmpty()) {
      summary.append(" (").append(versionLabel).append(")");
    }

    if (isCurrentVersion) {
      summary.append(" [현재]");
    }

    return summary.toString();
  }

  @Override
  public String toString() {
    return "TestCaseVersion{"
        + "id='"
        + id
        + '\''
        + ", testCaseId='"
        + testCaseId
        + '\''
        + ", versionNumber="
        + versionNumber
        + ", isCurrentVersion="
        + isCurrentVersion
        + ", name='"
        + name
        + '\''
        + '}';
  }
}
