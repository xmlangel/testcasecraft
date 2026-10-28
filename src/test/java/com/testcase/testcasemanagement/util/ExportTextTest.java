// src/test/java/com/testcase/testcasemanagement/util/ExportTextTest.java
package com.testcase.testcasemanagement.util;

import static org.testng.Assert.*;

import org.testng.annotations.Test;

/** ICT-470: 내보내기 셀 텍스트에서 본문 이미지 주소·토큰을 걷어 낸다. */
public class ExportTextTest {

  private static final String URL =
      "/api/testcase-attachments/public/025c9331-de2a-4796-b319-4a3d63e140a8?token=abc123";

  @Test
  public void 기본_대체텍스트_이미지는_자리표시로_바꾸고_주소와_토큰을_남기지_않는다() {
    String out = ExportText.toPlain("![image](" + URL + ")");
    assertEquals(out, "[이미지]");
    assertFalse(out.contains("token"));
    assertFalse(out.contains("/api/"));
  }

  @Test
  public void 의미있는_대체텍스트는_남긴다() {
    assertEquals(ExportText.toPlain("실패 ![오류 화면](" + URL + ") 확인"), "실패 [이미지: 오류 화면] 확인");
  }

  @Test
  public void HTML_img_태그도_바꾼다() {
    assertEquals(
        ExportText.toPlain("전 <img src=\"" + URL + "\" alt=\"스크린샷\"> 후"), "전 [이미지: 스크린샷] 후");
    assertEquals(ExportText.toPlain("<IMG src='" + URL + "'>"), "[이미지]");
  }

  @Test
  public void 이미지가_있으면_마크다운_기호를_걷어내고_줄바꿈은_유지한다() {
    assertEquals(
        ExportText.toPlain("## 제목\n**굵게** 와 *기울임* 과 `코드` 와 [링크](https://x.dev) ![a](" + URL + ")"),
        "제목\n굵게 와 기울임 과 코드 와 링크 [이미지: a]");
  }

  @Test
  public void 이미지가_여러_개면_모두_바꾼다() {
    String out = ExportText.toPlain("![image](" + URL + ")\n![로그](" + URL + ")");
    assertEquals(out, "[이미지]\n[이미지: 로그]");
    assertFalse(out.contains("token="));
  }

  @Test
  public void 이미지가_없는_텍스트는_원문_그대로_둔다() {
    String md = "**굵게** 와 user_name_field";
    assertEquals(ExportText.toPlain(md), md);
  }

  @Test
  public void 빈값은_그대로_둔다() {
    assertNull(ExportText.toPlain(null));
    assertEquals(ExportText.toPlain(""), "");
  }
}
