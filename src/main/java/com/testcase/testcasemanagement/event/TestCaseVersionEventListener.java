// src/main/java/com/testcase/testcasemanagement/event/TestCaseVersionEventListener.java

package com.testcase.testcasemanagement.event;

import com.testcase.testcasemanagement.service.TestCaseVersionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * ICT-349: 테스트케이스 버전 이벤트 리스너
 * 
 * 테스트케이스 변경 시 발생하는 이벤트를 처리하여 자동으로 새 버전을 생성합니다.
 * 순환 참조를 방지하고 비동기 처리를 통해 성능을 향상시킵니다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TestCaseVersionEventListener {

    private final TestCaseVersionService versionService;

    /**
     * 테스트케이스 버전 이벤트 처리
     * 
     * @param event 테스트케이스 버전 이벤트
     */
    @Async("generalAsyncExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleTestCaseVersionEvent(TestCaseVersionEvent event) {
        try {
            log.info("ICT-349: 테스트케이스 버전 이벤트 처리 시작 - TestCase: {}, Type: {}",
                    event.getTestCaseId(), event.getChangeType());

            // 새 버전 생성
            versionService.createVersionFromTestCase(
                    event.getTestCaseId(),
                    event.getChangeType(),
                    event.getChangeSummary());

            log.info("ICT-349: 테스트케이스 버전 이벤트 처리 완료 - TestCase: {}, Type: {}",
                    event.getTestCaseId(), event.getChangeType());

        } catch (Exception e) {
            log.error("ICT-349: 테스트케이스 버전 이벤트 처리 실패 - TestCase: {}, Type: {}, Error: {}",
                    event.getTestCaseId(), event.getChangeType(), e.getMessage(), e);
            // 이벤트 처리 실패해도 원본 트랜잭션에는 영향을 주지 않음
        }
    }
}