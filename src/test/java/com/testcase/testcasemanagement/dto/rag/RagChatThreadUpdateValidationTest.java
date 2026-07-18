package com.testcase.testcasemanagement.dto.rag;

import static org.testng.Assert.assertTrue;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.util.List;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

/**
 * dev-code-review P0(스레드 PATCH @NotNull threadId 400) 회귀 가드.
 *
 * <p>PATCH /api/rag/chat/conversations/threads/{threadId} 는 threadId 를 경로변수로 받고 컨트롤러가
 * request.setThreadId(경로) 로 주입한다(RagChatConversationController). 프론트(useRagChat.updateChatThread)는
 * 본문에 threadId 를 넣지 않는다. 과거 DTO 의 threadId 에 @NotNull 이 걸려 있어 @Valid 바인딩이 본문 검증 단계에서
 * MethodArgumentNotValidException(400) 을 던져 모든 정상 스레드 수정(이름변경·아카이브·카테고리 지정)이 파손됐다.
 *
 * <p>threadId 는 path 파생 필드라 본문 검증 대상이 아니므로 @NotNull 을 제거했다. 이 테스트는 threadId 가 빠진 본문(프론트가 실제 보내는
 * 형태)이 위반 0 으로 통과하는지 — 즉 @Valid 가 더는 400 을 내지 않는지 검증한다.
 */
public class RagChatThreadUpdateValidationTest {

  private ValidatorFactory factory;
  private Validator validator;

  @BeforeClass
  public void setUp() {
    factory = Validation.buildDefaultValidatorFactory();
    validator = factory.getValidator();
  }

  @AfterClass
  public void tearDown() {
    if (factory != null) {
      factory.close();
    }
  }

  /** 프론트가 실제 보내는 본문: threadId 없음 + 수정 필드만. 위반 0 이어야 @Valid 가 400 을 내지 않는다. */
  @Test
  public void updateBodyWithoutThreadId_hasNoViolations() {
    RagChatThreadUpdateRequest req =
        RagChatThreadUpdateRequest.builder()
            .title("이름 변경")
            .description("설명")
            .archived(Boolean.TRUE)
            .categoryIds(List.of("c1"))
            .build(); // threadId 는 의도적으로 null (경로에서 주입됨)

    assertTrue(
        validator.validate(req).isEmpty(),
        "threadId 없는 본문은 위반이 없어야 함 — @NotNull 이 남아 있으면 @Valid 가 400 을 낸다");
  }

  /** 카테고리만 변경하는 최소 본문(#79 로 카테고리 전용 엔드포인트 제거 후 유일 경로)도 통과해야. */
  @Test
  public void categoryOnlyUpdate_hasNoViolations() {
    RagChatThreadUpdateRequest req =
        RagChatThreadUpdateRequest.builder().categoryIds(List.of("c1", "c2")).build();

    assertTrue(validator.validate(req).isEmpty(), "카테고리만 변경하는 본문도 위반 0 이어야 함");
  }
}
