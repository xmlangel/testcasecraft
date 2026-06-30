package com.testcase.testcasemanagement.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 크로스 프로젝트 이동/복사 결과.
 *
 * <p>{@code mode}는 "move" 또는 "copy". 이동은 {@code sourceId == targetId}이고, 복사는 새 ID가 부여되므로 다르다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrossProjectTransferResultDto {
  private String mode; // "move" | "copy"
  private String targetProjectId;
  private String targetParentId;

  @Builder.Default private List<NodeMapping> nodes = List.of();

  private int testCaseCount; // 이동/복사된 testcase 타입 수
  private int folderCount; // 이동/복사된 folder 타입 수
  private int movedResultCount; // 함께 이동한 테스트 결과 수 (copy=0)
  private int mirroredExecutionCount; // 생성된 미러 실행 수 (copy=0)
  private int removedFromPlanCount; // 출발 프로젝트 플랜에서 제거된 멤버십 수 (copy=0)

  private String batchGroupId;
  @Builder.Default private List<String> auditLogIds = List.of();

  @Getter
  @Setter
  @NoArgsConstructor
  @AllArgsConstructor
  @Builder
  public static class NodeMapping {
    private String sourceId;
    private String targetId; // move: == sourceId, copy: 새 ID
    private String type;
    private String parentId;
    private Integer displayOrder;
    private String displayId;
  }
}
