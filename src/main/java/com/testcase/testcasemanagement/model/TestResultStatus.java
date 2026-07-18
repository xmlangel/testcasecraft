package com.testcase.testcasemanagement.model;

/**
 * 테스트 결과 판정(verdict)의 단일 정본.
 *
 * <p>이전에는 저장값 "NOT_RUN"(언더스코어)과 프론트 응답 키 "NOTRUN"(언더스코어 없음)이 코드 곳곳에 문자열 리터럴로 흩어져 있었고, 집계 코드가
 * "NOTRUN" 버킷을 읽는 바람에 미실행 건수가 0으로 누락되는 드리프트 버그가 있었다(#76 에서 값은 통일했으나 리터럴은 39곳에 잔존). 이 enum 은
 * <b>저장값({@link #value()})</b>과 <b>프론트 응답 키({@link #responseKey()})</b>를 한 곳에 묶어 그 이원화를 구조적으로 차단한다.
 *
 * <p>레거시 "PASSED"/"FAILED"(삭제된 DatabaseInitializer 유래) 정규화는 <b>의도적으로 포함하지 않는다</b> — 현재 동작(별도 버킷
 * 유지)을 바꾸는 별개 결정이며 그 기준선은 특성화 테스트로 고정돼 있다.
 */
public enum TestResultStatus {
  PASS("PASS", "PASS"),
  FAIL("FAIL", "FAIL"),
  BLOCKED("BLOCKED", "BLOCKED"),
  SKIPPED("SKIPPED", "SKIPPED"),
  NOT_RUN("NOT_RUN", "NOTRUN");

  /** DB 저장·{@code TestResult.getResult()} 비교에 쓰는 정본 문자열. */
  private final String value;

  /** 프론트엔드가 읽는 JSON 응답 키(대시보드 통계 등). */
  private final String responseKey;

  TestResultStatus(String value, String responseKey) {
    this.value = value;
    this.responseKey = responseKey;
  }

  public String value() {
    return value;
  }

  public String responseKey() {
    return responseKey;
  }

  /** null 판정을 저장 정본 NOT_RUN 값으로 정규화한다(미기입 정상 데이터 처리). */
  public static String valueOrNotRun(String raw) {
    return raw != null ? raw : NOT_RUN.value;
  }
}
