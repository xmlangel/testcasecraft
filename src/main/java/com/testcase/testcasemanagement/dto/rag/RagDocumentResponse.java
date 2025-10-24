package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * RAG API 문서 응답 DTO
 *
 * FastAPI DocumentResponse 스키마와 매핑되는 DTO
 * 문서 업로드, 조회, 분석 등의 응답에 사용
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RagDocumentResponse {

    /**
     * 문서 ID
     */
    private UUID id;

    /**
     * 프로젝트 ID
     */
    @JsonProperty("project_id")
    private UUID projectId;

    /**
     * 파일명
     */
    @JsonProperty("file_name")
    private String fileName;

    /**
     * 파일 경로
     */
    @JsonProperty("file_path")
    private String filePath;

    /**
     * 파일 타입 (확장자)
     */
    @JsonProperty("file_type")
    private String fileType;

    /**
     * 파일 크기 (bytes)
     */
    @JsonProperty("file_size")
    private Long fileSize;

    /**
     * 업로더 사용자명
     */
    @JsonProperty("uploaded_by")
    private String uploadedBy;

    /**
     * MinIO 버킷명
     */
    @JsonProperty("minio_bucket")
    private String minioBucket;

    /**
     * MinIO 객체 키
     */
    @JsonProperty("minio_object_key")
    private String minioObjectKey;

    /**
     * 업로드 날짜
     */
    @JsonProperty("upload_date")
    private LocalDateTime uploadDate;

    /**
     * 분석 상태 (pending, analyzing, completed, failed)
     */
    @JsonProperty("analysis_status")
    private String analysisStatus;

    /**
     * 분석 완료 날짜
     */
    @JsonProperty("analysis_date")
    private LocalDateTime analysisDate;

    /**
     * 전체 청크 수
     */
    @JsonProperty("total_chunks")
    private Integer totalChunks;

    /**
     * 메타데이터
     */
    @JsonProperty("meta_data")
    private Map<String, Object> metaData;

    /**
     * 생성 시각
     */
    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    /**
     * 마지막 업데이트 시각
     */
    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    /**
     * 응답 메시지 (업로드 성공 시 등)
     */
    private String message;
}
