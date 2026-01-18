// src/main/java/com/testcase/testcasemanagement/dto/BatchSaveResult.java

package com.testcase.testcasemanagement.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * 배치 저장 결과 DTO
 * ICT-373: 스프레드시트 일괄 저장 배치 처리 최적화
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchSaveResult {

    /**
     * 성공적으로 저장된 테스트케이스 수
     */
    private int successCount;

    /**
     * 실패한 테스트케이스 수
     */
    private int failureCount;

    /**
     * 전체 처리된 테스트케이스 수
     */
    private int totalCount;

    /**
     * 성공적으로 저장된 테스트케이스 목록
     */
    @Builder.Default
    private List<TestCaseDto> savedTestCases = new ArrayList<>();

    /**
     * 실패한 항목의 에러 정보
     */
    @Builder.Default
    private List<BatchError> errors = new ArrayList<>();

    /**
     * 배치 저장이 완전히 성공했는지 여부
     */
    public boolean isSuccess() {
        return failureCount == 0;
    }

    /**
     * 배치 에러 정보
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BatchError {
        /**
         * 실패한 테스트케이스의 인덱스
         */
        private int index;

        /**
         * 실패한 테스트케이스의 이름
         */
        private String testCaseName;

        /**
         * 에러 메시지
         */
        private String errorMessage;

        /**
         * 에러 상세 정보
         */
        private String errorDetails;
    }
}
