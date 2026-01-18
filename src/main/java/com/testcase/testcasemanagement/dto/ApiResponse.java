// src/main/java/com/testcase/testcasemanagement/dto/ApiResponse.java

package com.testcase.testcasemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ICT-208: 표준화된 API 응답 래퍼 클래스
 * 모든 API 응답에 일관된 형식을 제공합니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    
    /**
     * 응답 성공 여부
     */
    private boolean success;
    
    /**
     * 응답 데이터 (성공 시)
     */
    private T data;
    
    /**
     * 에러 메시지 (실패 시)
     */
    private String errorMessage;
    
    /**
     * 에러 코드 (실패 시)
     */
    private String errorCode;
    
    /**
     * 응답 시각
     */
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
    
    /**
     * 페이징 정보 (페이징 응답 시)
     */
    private PaginationInfo pagination;
    
    /**
     * 메타데이터 (추가 정보)
     */
    private Object metadata;
    
    /**
     * 성공 응답 생성
     */
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .build();
    }
    
    /**
     * 성공 응답 생성 (메타데이터 포함)
     */
    public static <T> ApiResponse<T> success(T data, Object metadata) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .metadata(metadata)
                .build();
    }
    
    /**
     * 페이징 성공 응답 생성
     */
    public static <T> ApiResponse<List<T>> success(Page<T> page) {
        PaginationInfo pagination = PaginationInfo.builder()
                .currentPage(page.getNumber())
                .totalPages(page.getTotalPages())
                .totalElements(page.getTotalElements())
                .pageSize(page.getSize())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
        
        return ApiResponse.<List<T>>builder()
                .success(true)
                .data(page.getContent())
                .pagination(pagination)
                .build();
    }
    
    /**
     * 실패 응답 생성
     */
    public static <T> ApiResponse<T> error(String errorMessage) {
        return ApiResponse.<T>builder()
                .success(false)
                .errorMessage(errorMessage)
                .build();
    }
    
    /**
     * 실패 응답 생성 (에러 코드 포함)
     */
    public static <T> ApiResponse<T> error(String errorCode, String errorMessage) {
        return ApiResponse.<T>builder()
                .success(false)
                .errorCode(errorCode)
                .errorMessage(errorMessage)
                .build();
    }
    
    /**
     * 페이징 정보 클래스
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaginationInfo {
        private int currentPage;
        private int totalPages;
        private long totalElements;
        private int pageSize;
        private boolean hasNext;
        private boolean hasPrevious;
    }
}