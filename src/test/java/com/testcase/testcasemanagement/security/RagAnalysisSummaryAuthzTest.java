package com.testcase.testcasemanagement.security;

import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;
import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

import com.testcase.testcasemanagement.dto.rag.RagAnalysisSummaryResponse;
import com.testcase.testcasemanagement.dto.rag.RagDocumentResponse;
import com.testcase.testcasemanagement.service.RagService;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import java.util.UUID;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * dev-code-review P0(RagController 분석요약 CRUD IDOR) 수정 회귀 가드.
 *
 * <p>분석요약은 외부 RAG 서비스에 저장되므로, 요약→documentId→문서 프로젝트 접근권으로 객체수준 인가한다. 요약 조회 실패·미존재·documentId 부재 시
 * fail-closed 인지 검증한다.
 */
public class RagAnalysisSummaryAuthzTest {

  @Mock private RagService ragService;
  @Mock private SecurityContextUtil securityContextUtil;
  @InjectMocks private ProjectSecurityService projectSecurityService;

  private AutoCloseable mocks;
  private static final UUID SUMMARY = UUID.randomUUID();
  private static final UUID DOC = UUID.randomUUID();

  @BeforeMethod
  public void setUp() {
    mocks = MockitoAnnotations.openMocks(this);
  }

  @AfterMethod
  public void tearDown() throws Exception {
    mocks.close();
  }

  @Test
  public void whenSummaryNotFound_returnsFalse() {
    when(ragService.getAnalysisSummary(SUMMARY)).thenReturn(null);
    assertFalse(projectSecurityService.canAccessRagAnalysisSummary(SUMMARY));
  }

  @Test
  public void whenSummaryFetchThrows_returnsFalse() {
    when(ragService.getAnalysisSummary(SUMMARY)).thenThrow(new RuntimeException("RAG down"));
    assertFalse(projectSecurityService.canAccessRagAnalysisSummary(SUMMARY));
  }

  @Test
  public void whenSummaryHasNoDocumentId_returnsFalse() {
    when(ragService.getAnalysisSummary(SUMMARY))
        .thenReturn(RagAnalysisSummaryResponse.builder().id(SUMMARY).documentId(null).build());
    assertFalse(projectSecurityService.canAccessRagAnalysisSummary(SUMMARY));
  }

  @Test
  public void whenDocumentIsGlobalAndAuthenticated_returnsTrue() {
    when(ragService.getAnalysisSummary(SUMMARY))
        .thenReturn(RagAnalysisSummaryResponse.builder().id(SUMMARY).documentId(DOC).build());
    // 공통(글로벌) 문서 → 인증 사용자면 접근 허용 (canAccessDocumentProject 글로벌 분기)
    when(ragService.getDocument(DOC))
        .thenReturn(RagDocumentResponse.builder().projectId(RagService.GLOBAL_PROJECT_ID).build());
    lenient().when(securityContextUtil.isAuthenticated()).thenReturn(true);
    assertTrue(projectSecurityService.canAccessRagAnalysisSummary(SUMMARY));
  }
}
