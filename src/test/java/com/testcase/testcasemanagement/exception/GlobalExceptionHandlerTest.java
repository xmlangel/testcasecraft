// src/test/java/com/testcase/testcasemanagement/exception/GlobalExceptionHandlerTest.java
package com.testcase.testcasemanagement.exception;

import static org.testng.Assert.*;

import com.testcase.testcasemanagement.dto.ErrorResponse;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * GlobalExceptionHandler의 DataIntegrityViolation 메시지 친화화 로직 단위 테스트.
 *
 * <p>회원가입·기타 unique 제약 위반 시 PostgreSQL raw 메시지가 그대로 사용자에게 노출되지 않도록 한다.
 */
public class GlobalExceptionHandlerTest {

  private GlobalExceptionHandler handler;

  @BeforeMethod
  public void setUp() {
    handler = new GlobalExceptionHandler(new SimpleMeterRegistry());
  }

  @Test
  public void handleDataIntegrityViolation_pgEmailUnique_returnsFriendlyMessage() {
    String pgMessage =
        "ERROR: duplicate key value violates unique constraint \"uk_6dotkott2kjsp8vw4d0m25fb7\"\n"
            + "  Detail: Key (email)=(km.kim@skaiworldwide.co.kr) already exists.";
    ResponseEntity<ErrorResponse> resp =
        handler.handleDataIntegrityViolation(new DataIntegrityViolationException(pgMessage));

    assertEquals(resp.getStatusCode(), HttpStatus.CONFLICT);
    ErrorResponse body = resp.getBody();
    assertNotNull(body);
    assertEquals(body.getErrorCode(), "DATA_CONFLICT");
    assertEquals(body.getMessage(), "이미 등록된 이메일입니다.");
    assertNotNull(body.getDetails());
    assertEquals(body.getDetails().get("field"), "email");
    assertEquals(body.getDetails().get("value"), "km.kim@skaiworldwide.co.kr");
  }

  @Test
  public void handleDataIntegrityViolation_pgUsernameUnique_usesKoreanLabel() {
    String pgMessage =
        "duplicate key value violates unique constraint \"uk_username\"\n"
            + "  Detail: Key (username)=(testuser) already exists.";
    ResponseEntity<ErrorResponse> resp =
        handler.handleDataIntegrityViolation(new DataIntegrityViolationException(pgMessage));

    assertEquals(resp.getStatusCode(), HttpStatus.CONFLICT);
    assertEquals(resp.getBody().getMessage(), "이미 등록된 사용자 이름입니다.");
    assertEquals(resp.getBody().getDetails().get("field"), "username");
  }

  @Test
  public void handleDataIntegrityViolation_unknownColumnUnique_fallsBackToColumnName() {
    String pgMessage =
        "duplicate key value violates unique constraint \"uk_xxx\"\n"
            + "  Detail: Key (custom_field)=(value1) already exists.";
    ResponseEntity<ErrorResponse> resp =
        handler.handleDataIntegrityViolation(new DataIntegrityViolationException(pgMessage));

    assertEquals(resp.getBody().getMessage(), "이미 등록된 custom_field입니다.");
    assertEquals(resp.getBody().getDetails().get("field"), "custom_field");
  }

  @Test
  public void handleDataIntegrityViolation_duplicateWithoutDetail_returnsGenericDuplicateMessage() {
    String pgMessage = "duplicate key value violates unique constraint \"uk_xxx\"";
    ResponseEntity<ErrorResponse> resp =
        handler.handleDataIntegrityViolation(new DataIntegrityViolationException(pgMessage));

    assertEquals(resp.getBody().getMessage(), "이미 등록된 값입니다. 입력값을 확인해주세요.");
    assertNull(resp.getBody().getDetails(), "Detail이 없으면 details도 null이어야 한다");
  }

  @Test
  public void handleDataIntegrityViolation_foreignKey_returnsReferenceMessage() {
    String pgMessage =
        "update or delete on table \"users\" violates foreign key constraint \"fk_xxx\" on table"
            + " \"orders\"";
    ResponseEntity<ErrorResponse> resp =
        handler.handleDataIntegrityViolation(new DataIntegrityViolationException(pgMessage));

    assertEquals(resp.getBody().getMessage(), "참조 중인 데이터가 있어 작업을 완료할 수 없습니다.");
  }

  @Test
  public void handleDataIntegrityViolation_notNull_returnsRequiredFieldMessage() {
    String pgMessage = "null value in column \"email\" of relation \"users\" violates not-null constraint";
    ResponseEntity<ErrorResponse> resp =
        handler.handleDataIntegrityViolation(new DataIntegrityViolationException(pgMessage));

    assertEquals(resp.getBody().getMessage(), "필수 입력 항목이 누락되었습니다.");
  }

  @Test
  public void handleDataIntegrityViolation_unknownReason_returnsGenericMessage() {
    ResponseEntity<ErrorResponse> resp =
        handler.handleDataIntegrityViolation(new DataIntegrityViolationException("some opaque DB error"));

    assertEquals(resp.getBody().getMessage(), "데이터 무결성 위반이 발생했습니다. 입력값을 확인해주세요.");
  }

  @Test
  public void handleDataIntegrityViolation_neverLeaksRawPostgresMessage() {
    String pgMessage =
        "ERROR: duplicate key value violates unique constraint \"uk_6dotkott2kjsp8vw4d0m25fb7\"\n"
            + "  Detail: Key (email)=(leak@example.com) already exists.";
    ResponseEntity<ErrorResponse> resp =
        handler.handleDataIntegrityViolation(new DataIntegrityViolationException(pgMessage));

    String body = resp.getBody().getMessage();
    assertFalse(body.contains("duplicate key"), "PG raw 메시지 노출 금지");
    assertFalse(body.contains("uk_6dotkott2kjsp8vw4d0m25fb7"), "내부 제약 이름 노출 금지");
    assertFalse(body.contains("violates"), "PG 키워드 노출 금지");
  }
}
