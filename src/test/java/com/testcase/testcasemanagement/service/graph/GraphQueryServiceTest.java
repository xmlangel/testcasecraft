package com.testcase.testcasemanagement.service.graph;

import static org.testng.Assert.*;

import org.testng.annotations.Test;

/** GraphQueryService 기능 테스트 — ID 검증, isValidId, validateId 메서드에 대한 단위 테스트. */
public class GraphQueryServiceTest {

  @Test(description = "validateId는 유효한 UUID를 허용한다")
  public void acceptsValidUUID() {
    String validUUID = "550e8400-e29b-41d4-a716-446655440000";
    try {
      GraphQueryService.validateId(validUUID);
    } catch (IllegalArgumentException e) {
      fail("Should accept valid UUID: " + e.getMessage());
    }
  }

  @Test(description = "validateId는 영숫자-하이픈 조합을 허용한다")
  public void acceptsAlphanumericWithHyphens() {
    String validId = "tc-001";
    try {
      GraphQueryService.validateId(validId);
    } catch (IllegalArgumentException e) {
      fail("Should accept alphanumeric ID with hyphens: " + e.getMessage());
    }
  }

  @Test(description = "validateId는 SQL 인젝션 문자를 거부한다")
  public void rejectsSqlInjectionAttempts() {
    assertThrows(
        IllegalArgumentException.class, () -> GraphQueryService.validateId("x' OR 1=1 --"));
  }

  @Test(description = "validateId는 Cypher 인젝션 문자를 거부한다")
  public void rejectsCypherInjectionAttempts() {
    assertThrows(
        IllegalArgumentException.class,
        () -> GraphQueryService.validateId("a\"}) MATCH (n) DETACH DELETE n //"));
  }

  @Test(description = "validateId는 null을 거부한다")
  public void rejectsNull() {
    assertThrows(IllegalArgumentException.class, () -> GraphQueryService.validateId(null));
  }

  @Test(description = "validateId는 빈 문자열을 거부한다")
  public void rejectsEmptyString() {
    assertThrows(IllegalArgumentException.class, () -> GraphQueryService.validateId(""));
  }

  @Test(description = "validateId는 64자 초과 길이를 거부한다")
  public void rejectsLongIdentifiers() {
    String longId = "a".repeat(65);
    assertThrows(IllegalArgumentException.class, () -> GraphQueryService.validateId(longId));
  }

  @Test(description = "isValidId는 유효한 ID에 true를 반환한다")
  public void isValidIdReturnsTrueForValidIds() {
    assertTrue(GraphQueryService.isValidId("tc-001"));
    assertTrue(GraphQueryService.isValidId("proj-001"));
    assertTrue(GraphQueryService.isValidId("550e8400-e29b-41d4-a716-446655440000"));
    assertTrue(GraphQueryService.isValidId("ABC123"));
  }

  @Test(description = "isValidId는 유효하지 않은 ID에 false를 반환한다")
  public void isValidIdReturnsFalseForInvalidIds() {
    assertFalse(GraphQueryService.isValidId("x' OR 1=1"));
    assertFalse(GraphQueryService.isValidId("a\"}) DELETE"));
    assertFalse(GraphQueryService.isValidId(null));
    assertFalse(GraphQueryService.isValidId(""));
    assertFalse(GraphQueryService.isValidId("a".repeat(65)));
    assertFalse(GraphQueryService.isValidId("invalid_char$"));
  }
}
