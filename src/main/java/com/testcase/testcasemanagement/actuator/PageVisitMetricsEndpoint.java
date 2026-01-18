// src/main/java/com/testcase/testcasemanagement/actuator/PageVisitMetricsEndpoint.java

package com.testcase.testcasemanagement.actuator;

import com.testcase.testcasemanagement.dto.PageVisitMetricsDto;
import com.testcase.testcasemanagement.service.PageVisitMetricsService;
import org.springframework.boot.actuate.endpoint.annotation.Endpoint;
import org.springframework.boot.actuate.endpoint.annotation.ReadOperation;
import org.springframework.stereotype.Component;

/**
 * 페이지 방문 메트릭을 노출하는 커스텀 Actuator 엔드포인트.
 */
@Component
@Endpoint(id = "pagevisits")
public class PageVisitMetricsEndpoint {

    private final PageVisitMetricsService pageVisitMetricsService;

    public PageVisitMetricsEndpoint(PageVisitMetricsService pageVisitMetricsService) {
        this.pageVisitMetricsService = pageVisitMetricsService;
    }

    @ReadOperation
    public PageVisitMetricsDto pageVisitMetrics() {
        return pageVisitMetricsService.getCurrentMetrics();
    }
}
