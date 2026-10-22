// src/test/java/com/testcase/testcasemanagement/util/JiraInlineImagesTest.java
package com.testcase.testcasemanagement.util;

import static org.testng.Assert.*;

import java.util.Map;
import org.testng.annotations.Test;

/** ICT-436: JIRA 이슈 설명의 본문 이미지 변환 */
public class JiraInlineImagesTest {

  private static final String HTML_IMG =
      "<img src=\"/api/testcase-attachments/public/att-1?token=tok_A1\" alt=\"login\""
          + " data-attachment-id=\"att-1\" style=\"max-width: 100%; height: auto\" />";

  @Test
  public void extract_findsHtmlAndMarkdownImages() {
    String text =
        "1. 로그인 "
            + HTML_IMG
            + "\n![err](http://host/api/testcase-attachments/public/att-2?token=tok2)";

    JiraInlineImages.Extracted extracted = JiraInlineImages.extract(text);

    assertEquals(extracted.images().size(), 2);
    assertEquals(extracted.images().get(0).attachmentId(), "att-1");
    assertEquals(extracted.images().get(0).token(), "tok_A1");
    assertEquals(extracted.images().get(0).alt(), "login");
    assertEquals(extracted.images().get(1).attachmentId(), "att-2");
    assertEquals(extracted.images().get(1).token(), "tok2");
    assertFalse(extracted.markedText().contains("/api/"));
  }

  @Test
  public void extract_ignoresExternalImagesAndPlainText() {
    String text = "본문 ![logo](https://example.com/logo.png) 그대로";

    JiraInlineImages.Extracted extracted = JiraInlineImages.extract(text);

    assertFalse(extracted.hasImages());
    assertEquals(extracted.markedText(), text);
  }

  @Test
  public void withPlaceholders_hidesServerAddress() {
    JiraInlineImages.Extracted extracted = JiraInlineImages.extract("단계 " + HTML_IMG);

    String placeholder = JiraInlineImages.withPlaceholders(extracted);

    assertEquals(placeholder, "단계 [image: login]");
  }

  @Test
  public void toWiki_rendersUploadedImageAndEscapesText() {
    String markdown =
        "**테스트 케이스**: 로그인 [필수]\n\n### 테스트 단계\n1. 클릭 "
            + HTML_IMG
            + "\n   - 예상 결과: ICT-1\n\n---\n*자동 생성됨*";

    String wiki =
        JiraInlineImages.toWiki(JiraInlineImages.extract(markdown), Map.of(0, "image-1-login.png"));

    assertTrue(wiki.contains("*테스트 케이스*: 로그인 \\[필수\\]"), wiki);
    assertTrue(wiki.contains("h3. 테스트 단계"), wiki);
    assertTrue(wiki.contains("1. 클릭 !image-1-login.png|thumbnail!"), wiki);
    assertTrue(wiki.contains("* 예상 결과: ICT\\-1"), wiki);
    assertTrue(wiki.contains("\n----\n"), wiki);
    assertTrue(wiki.endsWith("_자동 생성됨_"), wiki);
    assertFalse(wiki.contains("/api/"), wiki);
  }

  @Test
  public void toWiki_keepsPlaceholderWhenUploadFailed() {
    String wiki = JiraInlineImages.toWiki(JiraInlineImages.extract("a " + HTML_IMG), Map.of());

    assertEquals(wiki, "a \\[image: login\\]");
  }
}
