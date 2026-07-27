package com.testcase.testcasemanagement.model;

import static org.testng.Assert.assertFalse;
import static org.testng.Assert.assertTrue;

import org.testng.annotations.Test;

/**
 * 첨부파일 종류 판정(미리보기 활성 조건) 단위 테스트.
 *
 * <p>업로드 클라이언트가 content-type 을 못 잡아 application/octet-stream 으로 저장된 첨부가 실제로 있었고(운영 DB 16건), 그 탓에
 * 텍스트·마크다운 파일인데도 미리보기 버튼이 비활성화됐다. MIME 이 애매하면 확장자로 판정하도록 한 보강을 고정한다.
 */
public class TestCaseAttachmentTypeTest {

  private TestCaseAttachment attachment(String fileName, String mimeType) {
    TestCaseAttachment attachment = new TestCaseAttachment();
    attachment.setOriginalFileName(fileName);
    attachment.setMimeType(mimeType);
    return attachment;
  }

  @Test
  public void mimeType_이_정확하면_그대로_판정한다() {
    assertTrue(attachment("notes.txt", "text/plain").isTextFile());
    assertTrue(attachment("shot.png", "image/png").isImageFile());
    assertTrue(attachment("spec.pdf", "application/pdf").isPdfFile());
  }

  @Test
  public void octetStream_이면_확장자로_판정한다() {
    assertTrue(attachment("bak_setup.sh.txt", "application/octet-stream").isTextFile());
    assertTrue(attachment("README.md", "application/octet-stream").isTextFile());
    assertTrue(attachment("shot.png", "application/octet-stream").isImageFile());
    assertTrue(attachment("spec.pdf", "application/octet-stream").isPdfFile());
  }

  @Test
  public void mimeType_이_null_이어도_확장자로_판정한다() {
    assertTrue(attachment("result.log", null).isTextFile());
    assertTrue(attachment("diagram.jpeg", null).isImageFile());
    assertTrue(attachment("manual.pdf", null).isPdfFile());
  }

  @Test
  public void 미리보기_대상이_아닌_형식은_계속_false() {
    TestCaseAttachment excel = attachment("cases.xlsx", "application/octet-stream");
    assertFalse(excel.isTextFile());
    assertFalse(excel.isImageFile());
    assertFalse(excel.isPdfFile());

    TestCaseAttachment noExtension = attachment("dump", null);
    assertFalse(noExtension.isTextFile());
    assertFalse(noExtension.isImageFile());
    assertFalse(noExtension.isPdfFile());
  }

  @Test
  public void 확장자_대소문자를_가리지_않는다() {
    assertTrue(attachment("NOTES.TXT", "application/octet-stream").isTextFile());
    assertTrue(attachment("SHOT.PNG", "application/octet-stream").isImageFile());
  }
}
