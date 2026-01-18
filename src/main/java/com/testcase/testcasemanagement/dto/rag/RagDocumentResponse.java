package com.testcase.testcasemanagement.dto.rag;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.testcase.testcasemanagement.config.LocalDateTimeArrayDeserializer;
import com.testcase.testcasemanagement.config.LocalDateTimeArraySerializer;
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
     * FastAPI: id (upload response) 또는 document_id (analysis response)
     * @JsonAlias를 사용하여 두 필드명 모두 매핑
     */
    @JsonProperty("id")
    @com.fasterxml.jackson.annotation.JsonAlias({"document_id"})
    private UUID id;

    /**
     * 프로젝트 ID
     * Frontend: projectId (camelCase)
     * FastAPI: project_id (snake_case) - JsonAlias로 매핑
     */
    @JsonProperty("projectId")
    @com.fasterxml.jackson.annotation.JsonAlias({"project_id"})
    private UUID projectId;

    /**
     * 파일명
     * Frontend: fileName (camelCase)
     * FastAPI: file_name (snake_case) - JsonAlias로 매핑
     */
    @JsonProperty("fileName")
    @com.fasterxml.jackson.annotation.JsonAlias({"file_name"})
    private String fileName;

    /**
     * 파일 경로
     * Frontend: filePath (camelCase)
     * FastAPI: file_path (snake_case) - JsonAlias로 매핑
     */
    @JsonProperty("filePath")
    @com.fasterxml.jackson.annotation.JsonAlias({"file_path"})
    private String filePath;

    /**
     * 파일 타입 (확장자)
     * Frontend: fileType (camelCase)
     * FastAPI: file_type (snake_case) - JsonAlias로 매핑
     */
    @JsonProperty("fileType")
    @com.fasterxml.jackson.annotation.JsonAlias({"file_type"})
    private String fileType;

    /**
     * 파일 크기 (bytes)
     * Frontend: fileSize (camelCase)
     * FastAPI: file_size (snake_case) - JsonAlias로 매핑
     */
    @JsonProperty("fileSize")
    @com.fasterxml.jackson.annotation.JsonAlias({"file_size"})
    private Long fileSize;

    /**
     * 업로더 사용자명
     * Frontend: uploadedBy (camelCase)
     * FastAPI: uploaded_by (snake_case) - JsonAlias로 매핑
     */
    @JsonProperty("uploadedBy")
    @com.fasterxml.jackson.annotation.JsonAlias({"uploaded_by"})
    private String uploadedBy;

    /**
     * MinIO 버킷명
     * Frontend: minioBucket (camelCase)
     * FastAPI: minio_bucket (snake_case) - JsonAlias로 매핑
     */
    @JsonProperty("minioBucket")
    @com.fasterxml.jackson.annotation.JsonAlias({"minio_bucket"})
    private String minioBucket;

    /**
     * MinIO 객체 키
     * Frontend: minioObjectKey (camelCase)
     * FastAPI: minio_object_key (snake_case) - JsonAlias로 매핑
     */
    @JsonProperty("minioObjectKey")
    @com.fasterxml.jackson.annotation.JsonAlias({"minio_object_key"})
    private String minioObjectKey;

    /**
     * 업로드 날짜
     * Frontend: uploadDate (camelCase)
     * FastAPI: upload_date (snake_case) - JsonAlias로 매핑
     * FastAPI는 배열 또는 ISO 8601 형태로 전송
     * Frontend로는 ISO 8601 문자열 형태로 전송
     */
    @JsonProperty("uploadDate")
    @com.fasterxml.jackson.annotation.JsonAlias({"upload_date"})
    @JsonDeserialize(using = LocalDateTimeArrayDeserializer.class)
    @JsonSerialize(using = LocalDateTimeArraySerializer.class)
    private LocalDateTime uploadDate;

    /**
     * 분석 상태 (pending, analyzing, completed, failed)
     * Frontend: analysisStatus (camelCase)
     * FastAPI: analysis_status (document response) 또는 status (analysis response) - JsonAlias로 매핑
     */
    @JsonProperty("analysisStatus")
    @com.fasterxml.jackson.annotation.JsonAlias({"analysis_status", "status"})
    private String analysisStatus;

    /**
     * 분석 완료 날짜
     * Frontend: analysisDate (camelCase)
     * FastAPI: analysis_date (snake_case) - JsonAlias로 매핑
     * FastAPI는 배열 또는 ISO 8601 형태로 전송
     * Frontend로는 ISO 8601 문자열 형태로 전송
     */
    @JsonProperty("analysisDate")
    @com.fasterxml.jackson.annotation.JsonAlias({"analysis_date"})
    @JsonDeserialize(using = LocalDateTimeArrayDeserializer.class)
    @JsonSerialize(using = LocalDateTimeArraySerializer.class)
    private LocalDateTime analysisDate;

    /**
     * 전체 청크 수
     * Frontend: totalChunks (camelCase)
     * FastAPI: total_chunks (snake_case) - JsonAlias로 매핑
     */
    @JsonProperty("totalChunks")
    @com.fasterxml.jackson.annotation.JsonAlias({"total_chunks"})
    private Integer totalChunks;

    /**
     * 메타데이터
     * Frontend: metaData (camelCase)
     * FastAPI: meta_data (document response) 또는 analysis_result (analysis response) - JsonAlias로 매핑
     */
    @JsonProperty("metaData")
    @com.fasterxml.jackson.annotation.JsonAlias({"meta_data", "analysis_result"})
    private Map<String, Object> metaData;

    /**
     * 생성 시각
     * Frontend: createdAt (camelCase)
     * FastAPI: created_at (snake_case) - JsonAlias로 매핑
     * FastAPI는 배열 또는 ISO 8601 형태로 전송
     * Frontend로는 ISO 8601 문자열 형태로 전송
     */
    @JsonProperty("createdAt")
    @com.fasterxml.jackson.annotation.JsonAlias({"created_at"})
    @JsonDeserialize(using = LocalDateTimeArrayDeserializer.class)
    @JsonSerialize(using = LocalDateTimeArraySerializer.class)
    private LocalDateTime createdAt;

    /**
     * 마지막 업데이트 시각
     * Frontend: updatedAt (camelCase)
     * FastAPI: updated_at (snake_case) - JsonAlias로 매핑
     * FastAPI는 배열 또는 ISO 8601 형태로 전송
     * Frontend로는 ISO 8601 문자열 형태로 전송
     */
    @JsonProperty("updatedAt")
    @com.fasterxml.jackson.annotation.JsonAlias({"updated_at"})
    @JsonDeserialize(using = LocalDateTimeArrayDeserializer.class)
    @JsonSerialize(using = LocalDateTimeArraySerializer.class)
    private LocalDateTime updatedAt;

    /**
     * 응답 메시지 (업로드 성공 시 등)
     */
    private String message;
}
