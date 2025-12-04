package com.testcase.testcasemanagement.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * LLM 분석 기본 템플릿 설정
 * UI와 Backend 스케줄러가 공통으로 사용
 */
@Entity
@Table(name = "llm_template")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class LlmTemplate {

    @Id
    @Column(length = 50)
    @Builder.Default
    private String id = "default";

    /**
     * 프롬프트 템플릿 ({chunk_text} 플레이스홀더 포함)
     */
    @Column(length = 2000, nullable = false)
    private String promptTemplate;

    /**
     * 한 번에 처리할 청크 수 (배치 크기)
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer chunkBatchSize = 10;

    /**
     * 배치마다 일시정지 여부
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean pauseAfterBatch = false;

    /**
     * LLM 응답 최대 토큰 수
     */
    @Column(nullable = false)
    @Builder.Default
    private Integer maxTokens = 500;

    /**
     * LLM 온도 (0.0 ~ 2.0)
     */
    @Column(nullable = false)
    @Builder.Default
    private Double temperature = 0.7;

    /**
     * 생성자
     */
    @CreatedBy
    @Column(updatable = false, length = 100)
    private String createdBy;

    /**
     * 생성 시간
     */
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdDate;

    /**
     * 마지막 수정자
     */
    @LastModifiedBy
    @Column(length = 100)
    private String lastModifiedBy;

    /**
     * 마지막 수정 시간
     */
    @LastModifiedDate
    private LocalDateTime lastModifiedDate;
}
