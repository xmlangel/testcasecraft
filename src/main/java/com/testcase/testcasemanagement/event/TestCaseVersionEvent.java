// src/main/java/com/testcase/testcasemanagement/event/TestCaseVersionEvent.java

package com.testcase.testcasemanagement.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * ICT-349: 테스트케이스 버전 관리 이벤트
 * 
 * 순환 참조를 방지하고 시스템 결합도를 낮추기 위한 이벤트 기반 아키텍처
 */
@Getter
public class TestCaseVersionEvent extends ApplicationEvent {
    
    private final String testCaseId;
    private final String changeType;
    private final String changeSummary;
    private final Long eventTimestamp;

    /**
     * 테스트케이스 버전 이벤트 생성자
     * 
     * @param source 이벤트 발생원 (보통 서비스 클래스)
     * @param testCaseId 테스트케이스 ID
     * @param changeType 변경 유형 (CREATE, UPDATE, MANUAL_SAVE)
     * @param changeSummary 변경 내용 요약
     */
    public TestCaseVersionEvent(Object source, String testCaseId, String changeType, String changeSummary) {
        super(source);
        this.testCaseId = testCaseId;
        this.changeType = changeType;
        this.changeSummary = changeSummary;
        this.eventTimestamp = System.currentTimeMillis();
    }

    @Override
    public String toString() {
        return "TestCaseVersionEvent{" +
                "testCaseId='" + testCaseId + '\'' +
                ", changeType='" + changeType + '\'' +
                ", changeSummary='" + changeSummary + '\'' +
                ", eventTimestamp=" + eventTimestamp +
                '}';
    }
}