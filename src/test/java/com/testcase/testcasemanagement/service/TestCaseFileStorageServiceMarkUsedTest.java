package com.testcase.testcasemanagement.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.TestCaseAttachment;
import com.testcase.testcasemanagement.repository.TestCaseAttachmentRepository;
import java.util.Optional;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.testng.Assert;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

/**
 * {@link TestCaseFileStorageService#markAsUsedIfPresent(String)}의 존재 확인 가드를 검증한다.
 *
 * <p>이 가드가 없으면 이미 지워진 이미지를 참조하는 노트를 다시 저장할 때 예외가 나고, 트랜잭션이 rollback-only로 마킹되어 결과 저장 자체가 실패한다.
 */
public class TestCaseFileStorageServiceMarkUsedTest {

  private static final String ATTACHMENT_ID = "12c544bc-acf9-4860-b4ee-f28ee02eccde";

  @Mock private TestCaseAttachmentRepository attachmentRepository;
  @Mock private MinIOService minioService;

  @InjectMocks private TestCaseFileStorageService fileStorageService;

  @BeforeMethod
  public void setUp() {
    MockitoAnnotations.openMocks(this);
  }

  /** 첨부가 없으면 표시를 시도하지 않는다 — 조회도 저장도 하지 않는다. */
  @Test
  public void testSkipsWhenAttachmentIsGone() {
    when(attachmentRepository.existsById(ATTACHMENT_ID)).thenReturn(false);

    fileStorageService.markAsUsedIfPresent(ATTACHMENT_ID);

    verify(attachmentRepository, never()).findById(ATTACHMENT_ID);
    verify(attachmentRepository, never()).save(any(TestCaseAttachment.class));
  }

  /** ID가 null이면 조회조차 하지 않는다. */
  @Test
  public void testSkipsWhenIdIsNull() {
    fileStorageService.markAsUsedIfPresent(null);

    verify(attachmentRepository, never()).existsById(anyString());
    verify(attachmentRepository, never()).save(any(TestCaseAttachment.class));
  }

  /** 첨부가 남아 있으면 사용 중으로 표시하고 저장한다. */
  @Test
  public void testMarksWhenAttachmentExists() {
    TestCase testCase = new TestCase();
    testCase.setId("tc-1");

    TestCaseAttachment attachment = new TestCaseAttachment();
    attachment.setId(ATTACHMENT_ID);
    attachment.setTestCase(testCase);
    attachment.setOriginalFileName("image.png");
    attachment.setStoredFileName("stored.png");
    attachment.setFilePath("testcase/tc-1/stored.png");
    attachment.setFileSize(58138L);
    attachment.setMimeType("image/png");
    attachment.setIsUsedInContent(false);
    // 토큰이 비어 있으면 DTO 변환 과정에서 발급하며 한 번 더 저장한다 — 저장 횟수를 흐리지 않도록 미리 채운다
    attachment.setPublicAccessToken("933eca699d3647dd8977bab1d046f89f");

    when(attachmentRepository.existsById(ATTACHMENT_ID)).thenReturn(true);
    when(attachmentRepository.findById(ATTACHMENT_ID)).thenReturn(Optional.of(attachment));
    when(attachmentRepository.save(any(TestCaseAttachment.class)))
        .thenAnswer(i -> i.getArguments()[0]);

    fileStorageService.markAsUsedIfPresent(ATTACHMENT_ID);

    verify(attachmentRepository, times(1)).save(attachment);
    Assert.assertTrue(attachment.getIsUsedInContent());
    Assert.assertNotNull(attachment.getUsedAt());
  }
}
