// src/main/java/com/testcase/testcasemanagement/dto/PageVisitRecordRequest.java

package com.testcase.testcasemanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 페이지 방문 기록 요청 DTO.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageVisitRecordRequest {

    @NotBlank(message = "pagePath must not be blank")
    @Size(max = 200, message = "pagePath must not exceed 200 characters")
    private String pagePath;

    @Size(max = 120, message = "pageTitle must not exceed 120 characters")
    private String pageTitle;

    @Size(max = 120, message = "visitorId must not exceed 120 characters")
    private String visitorId;
}
