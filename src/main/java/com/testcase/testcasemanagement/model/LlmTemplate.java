package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Comment;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/** LLM 분석 기본 템플릿 설정 UI와 Backend 스케줄러가 공통으로 사용 */
@Entity
@Comment("LLM 분석 템플릿: LLM 분석에 쓰는 프롬프트 템플릿과 호출 설정. 시스템 전체에 한 행만 둔다")
@Table(name = "llm_template")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class LlmTemplate {

  @Comment("템플릿 식별자: LLM 템플릿을 가리키는 고정값")
  @Id
  @Column(length = 50)
  @Builder.Default
  private String id = "default";

  /** 프롬프트 템플릿 ({chunk_text} 플레이스홀더 포함) */
  @Comment("프롬프트 템플릿: LLM에 전달할 기본 프롬프트 텍스트({chunk_text} 플레이스홀더 포함)")
  @Column(length = 2000, nullable = false)
  private String promptTemplate;

  /** 한 번에 처리할 청크 수 (배치 크기) */
  @Comment("배치 청크 수: 한 번의 LLM 요청에 포함할 청크 문서의 개수")
  @Column(nullable = false)
  @Builder.Default
  private Integer chunkBatchSize = 10;

  /** 배치마다 일시정지 여부 */
  @Comment("배치 후 일시정지 여부: 배치 처리 후 잠시 대기할지를 나타내는 값 (값 영역: true, false)")
  @Column(nullable = false)
  @Builder.Default
  private Boolean pauseAfterBatch = false;

  /** LLM 응답 최대 토큰 수 */
  @Comment("최대 토큰 수: LLM의 응답에서 생성할 최대 토큰 개수")
  @Column(nullable = false)
  @Builder.Default
  private Integer maxTokens = 500;

  /** LLM 온도 (0.0 ~ 2.0) */
  @Comment("온도: LLM의 창의성 수준을 제어하는 파라미터 (값 영역: 0.0~2.0)")
  @Column(nullable = false)
  @Builder.Default
  private Double temperature = 0.7;

  /** 생성자 */
  @Comment("생성자 식별자: 이 행을 처음 저장한 사용자의 식별자")
  @CreatedBy
  @Column(updatable = false, length = 100)
  private String createdBy;

  /** 생성 시간 */
  @Comment("생성 일시: 이 행이 처음 저장된 일시")
  @CreatedDate
  @Column(updatable = false)
  private LocalDateTime createdDate;

  /** 마지막 수정자 */
  @Comment("최종 수정자 식별자: 이 행을 마지막으로 수정한 사용자의 식별자")
  @LastModifiedBy
  @Column(length = 100)
  private String lastModifiedBy;

  /** 마지막 수정 시간 */
  @Comment("최종 수정 일시: 이 행이 마지막으로 변경된 일시")
  @LastModifiedDate
  private LocalDateTime lastModifiedDate;
}
