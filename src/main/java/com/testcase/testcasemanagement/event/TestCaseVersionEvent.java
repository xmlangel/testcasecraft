// src/main/java/com/testcase/testcasemanagement/event/TestCaseVersionEvent.java

package com.testcase.testcasemanagement.event;

import com.testcase.testcasemanagement.util.SecurityContextUtil;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * ICT-349: 테스트케이스 버전 관리 이벤트
 *
 * <p>순환 참조를 방지하고 시스템 결합도를 낮추기 위한 이벤트 기반 아키텍처
 */
@Getter
public class TestCaseVersionEvent extends ApplicationEvent {
  private static final long serialVersionUID = 1L;

  private final String testCaseId;
  private final String changeType;
  private final String changeSummary;
  private final Long eventTimestamp;

  /**
   * ICT-451: 변경한 사용자의 username. 리스너는 비동기 스레드에서 돌아 로그인 정보를 읽지 못하므로 이벤트를 만드는 요청 스레드에서 확정해 둔다.
   * 로그인 없이 발행되면 null 이다.
   */
  private final String actorUsername;

  /**
   * 테스트케이스 버전 이벤트 생성자
   *
   * @param source 이벤트 발생원 (보통 서비스 클래스)
   * @param testCaseId 테스트케이스 ID
   * @param changeType 변경 유형 (CREATE, UPDATE, MANUAL_SAVE)
   * @param changeSummary 변경 내용 요약
   */
  public TestCaseVersionEvent(
      Object source, String testCaseId, String changeType, String changeSummary) {
    super(source);
    this.testCaseId = testCaseId;
    this.changeType = changeType;
    this.changeSummary = changeSummary;
    this.eventTimestamp = System.currentTimeMillis();
    this.actorUsername = SecurityContextUtil.getCurrentUsernameStatic();
  }

  @Override
  public String toString() {
    return "TestCaseVersionEvent{"
        + "testCaseId='"
        + testCaseId
        + '\''
        + ", changeType='"
        + changeType
        + '\''
        + ", changeSummary='"
        + changeSummary
        + '\''
        + ", eventTimestamp="
        + eventTimestamp
        + '}';
  }
}
