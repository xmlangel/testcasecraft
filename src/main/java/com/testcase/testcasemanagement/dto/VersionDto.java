package com.testcase.testcasemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 애플리케이션 버전 정보 DTO
 * Backend, Frontend, RAG Service의 버전을 포함
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VersionDto {

    /**
     * Backend (Spring Boot) 버전
     */
    private String backendVersion;

    /**
     * Frontend (React) 버전
     */
    private String frontendVersion;

    /**
     * RAG Service (FastAPI) 버전
     */
    private String ragServiceVersion;
}
