// src/test/java/com/testcase/testcasemanagement/service/rag/RagVectorWriteToggleTest.java
package com.testcase.testcasemanagement.service.rag;

import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.testcase.testcasemanagement.dto.rag.RagConversationMessageIndexRequest;
import com.testcase.testcasemanagement.dto.rag.RagConversationMessageIndexResponse;
import com.testcase.testcasemanagement.exception.RagDisabledException;
import com.testcase.testcasemanagement.exception.RagVectorWriteDisabledException;
import com.testcase.testcasemanagement.repository.LlmConfigRepository;
import com.testcase.testcasemanagement.security.EncryptionUtil;
import com.testcase.testcasemanagement.service.RagServiceImpl;
import com.testcase.testcasemanagement.service.SystemSettingService;
import java.util.UUID;
import org.springframework.web.reactive.function.client.WebClient;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * 벡터 쓰기를 끈 상태에서 질의는 열려 있고 색인만 막히는지 검증한다.
 *
 * <p>실패 방식이 두 가지라는 것이 이 기능의 핵심이다. 사용자가 직접 누른 작업은 왜 거부됐는지 알려야 하므로 예외로 막고, 배경에서 도는 색인은 본래 작업(테스트케이스
 * 저장·채팅)을 깨뜨리면 안 되므로 건너뛴다.
 */
public class RagVectorWriteToggleTest {

  private WebClient ragWebClient;
  private LlmConfigRepository llmConfigRepository;
  private EncryptionUtil encryptionUtil;
  private SystemSettingService systemSettingService;
  private RagServiceImpl ragService;

  @BeforeMethod
  void setUp() {
    ragWebClient = mock(WebClient.class);
    llmConfigRepository = mock(LlmConfigRepository.class);
    encryptionUtil = mock(EncryptionUtil.class);
    systemSettingService = mock(SystemSettingService.class);

    // RAG 자체는 켜져 있고 벡터 쓰기만 끈 상태가 이 기능의 대상이다.
    when(systemSettingService.getBooleanSetting(eq("RAG_ENABLED"), anyBoolean())).thenReturn(true);

    ragService =
        new RagServiceImpl(
            ragWebClient,
            "http://localhost:8001",
            llmConfigRepository,
            encryptionUtil,
            systemSettingService);
  }

  private void setVectorWrite(boolean enabled) {
    when(systemSettingService.getBooleanSetting(
            eq(RagVectorWriteDisabledException.SETTING_KEY), anyBoolean()))
        .thenReturn(enabled);
  }

  /** 사용자가 누른 임베딩 생성은 거부하고 이유를 알린다. */
  @Test
  public void 임베딩_생성은_거부된다() {
    setVectorWrite(false);
    Assert.assertThrows(
        RagVectorWriteDisabledException.class,
        () -> ragService.generateEmbeddings(UUID.randomUUID()));
  }

  /** 문서 업로드도 같은 이유로 거부한다. */
  @Test
  public void 문서_분석은_거부된다() {
    setVectorWrite(false);
    Assert.assertThrows(
        RagVectorWriteDisabledException.class,
        () -> ragService.analyzeDocument(UUID.randomUUID(), "pymupdf4llm"));
  }

  /**
   * 테스트케이스 벡터화는 예외를 던지지 않는다.
   *
   * <p>테스트케이스 저장이 부르는 배경 작업이라, 여기서 예외가 나면 저장까지 실패로 보인다. RAG API 를 호출하지 않고 조용히 끝나야 한다.
   */
  @Test
  public void 테스트케이스_벡터화는_조용히_건너뛴다() {
    setVectorWrite(false);
    ragService.vectorizeTestCase("tc-1", "로그인 검증", "본문", UUID.randomUUID(), "tester");
    verify(ragWebClient, never()).post();
  }

  /**
   * 대화 색인은 건너뛰되 "skipped" 를 돌려준다.
   *
   * <p>호출부가 예외를 잡아 "failed" 로 기록하면 끈 것과 실패한 것을 나중에 갈라 볼 수 없다.
   */
  @Test
  public void 대화_색인은_건너뜀_상태를_돌려준다() {
    setVectorWrite(false);
    UUID messageId = UUID.randomUUID();

    RagConversationMessageIndexResponse response =
        ragService.indexConversationMessage(
            RagConversationMessageIndexRequest.builder().messageId(messageId).build());

    Assert.assertNotNull(response);
    Assert.assertEquals(response.getStatus(), "skipped");
    Assert.assertEquals(response.getMessageId(), messageId);
    verify(ragWebClient, never()).post();
  }

  /**
   * RAG 를 통째로 끄면 질의도 막히고, 그 이유가 전용 예외로 올라온다.
   *
   * <p>전에는 IllegalStateException 이라 컨트롤러의 catch(Exception) 이 500 으로 만들었고 화면에는 아무 설명도 오지 않았다.
   */
  @Test
  public void RAG가_꺼지면_질의도_전용_예외로_거부된다() {
    when(systemSettingService.getBooleanSetting(eq("RAG_ENABLED"), anyBoolean())).thenReturn(false);

    Assert.assertThrows(
        RagDisabledException.class, () -> ragService.listDocuments(UUID.randomUUID(), 1, 20));
    Assert.assertThrows(
        RagDisabledException.class, () -> ragService.getDocument(UUID.randomUUID()));
  }

  /** 켜 두면 거부하지 않는다. 게이트가 항상 막는 것이 아님을 확인한다. */
  @Test
  public void 켜져_있으면_거부하지_않는다() {
    setVectorWrite(true);
    // RAG API 호출로 넘어가므로 RagVectorWriteDisabledException 은 나오지 않는다.
    try {
      ragService.generateEmbeddings(UUID.randomUUID());
    } catch (RagVectorWriteDisabledException e) {
      Assert.fail("벡터 쓰기가 켜져 있는데 거부됐다");
    } catch (Exception ignored) {
      // WebClient 목이라 이후 단계에서 다른 예외가 나는 것은 이 시험의 관심이 아니다.
    }
  }
}
