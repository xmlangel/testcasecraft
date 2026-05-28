// src/main/java/com/testcase/testcasemanagement/service/TestCaseConstants.java

package com.testcase.testcasemanagement.service;

/**
 * TestCase 도메인 전용 상수.
 *
 * <p>{@link TestCaseService} 전반에서 반복되던 매직 스트링/넘버를 중앙화한다. 의미가 같은 문자열이 코드 곳곳에 흩어져 있던 문제를 해소하고, 값 변경 시
 * 영향 범위를 한 파일로 제한한다.
 */
public final class TestCaseConstants {

  // ===== TestCase Types =====
  public static final String TYPE_FOLDER = "folder";
  public static final String TYPE_TESTCASE = "testcase";

  // ===== Special Folder Identifiers =====
  /** 프론트엔드에서 전달하는 고아 노드 가상 폴더 ID. */
  public static final String ORPHANED_ITEMS_FOLDER_ID = "orphaned-items-folder";

  /** Import 폴더의 시스템 description. 폴더 삭제 제한 판별에 사용. */
  public static final String SYSTEM_DEFAULT_FOLDER_DESCRIPTION = "[SYSTEM] 기본 폴더 - 삭제불가";

  // ===== Sentinel Strings From Frontend =====
  /** 일부 프론트엔드 폼이 미설정 값을 문자 "null" 로 보내는 경우 처리용. */
  public static final String SENTINEL_NULL = "null";

  public static final String SENTINEL_UNDEFINED = "undefined";

  // ===== DB Constraint Detection (PostgreSQL) =====
  /** PostgreSQL unique constraint violation SQLState. */
  public static final String PG_UNIQUE_VIOLATION_SQLSTATE = "23505";

  /** TestCase displayOrder 유니크 제약 이름. */
  public static final String DISPLAY_ORDER_UNIQUE_CONSTRAINT = "UKL7WIR8HGJNYHVRMU717NSRTYY";

  private TestCaseConstants() {
    // utility class
  }
}
