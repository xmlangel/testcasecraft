// src/main/java/com/testcase/testcasemanagement/util/ExportText.java
package com.testcase.testcasemanagement.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * ICT-470: 엑셀·CSV·PDF 로 내보낼 셀 텍스트.
 *
 * <p>비고·사전조건·예상결과 등에 들어간 본문 이미지는 {@code /api/testcase-attachments/public/{id}?token=...} 상대 주소라서
 * 내보낸 파일 안에서는 열리지 않고 공개 토큰만 파일에 남는다. 이미지는 {@code [이미지: 대체텍스트]} 로 바꾸고, 굵게·기울임·제목·인라인 코드 표시와 링크 문법은
 * 글자만 남긴다. 주소와 토큰은 결과에 남지 않는다. 프런트의 {@code markdownToExportText} 와 같은 표기를 쓴다.
 */
public final class ExportText {

  private ExportText() {}

  private static final String IMAGE_LABEL = "이미지";

  // ![alt](url) — 주소 종류와 무관하게 모든 마크다운 이미지
  private static final Pattern MD_IMG = Pattern.compile("!\\[([^\\]]*)\\]\\([^)]*\\)");

  // <img ...>
  private static final Pattern HTML_IMG =
      Pattern.compile("<img\\b[^>]*>", Pattern.CASE_INSENSITIVE);
  private static final Pattern HTML_ALT =
      Pattern.compile("\\balt\\s*=\\s*[\"']([^\"']*)[\"']", Pattern.CASE_INSENSITIVE);

  // 편집기가 이미지를 붙일 때 넣는 기본 대체 텍스트. 정보가 없으므로 표기에서 뺀다.
  private static final Pattern GENERIC_ALT =
      Pattern.compile("^\\s*(?:image|img|이미지)?\\s*$", Pattern.CASE_INSENSITIVE);

  private static final Pattern LINK = Pattern.compile("\\[([^\\]]+)\\]\\([^)]*\\)");
  private static final Pattern HEADING = Pattern.compile("(?m)^\\s{0,3}#{1,6}\\s+");
  private static final Pattern BOLD = Pattern.compile("(\\*\\*|__)(.+?)\\1");
  private static final Pattern ITALIC =
      Pattern.compile("(?<![*\\w])\\*(?!\\*)(.+?)(?<!\\*)\\*(?![*\\w])");
  private static final Pattern STRIKE = Pattern.compile("~~(.+?)~~");
  private static final Pattern INLINE_CODE = Pattern.compile("`([^`]+)`");

  /** 내보내기 셀 값으로 바꾼다. {@code null} 은 {@code null} 그대로 돌려준다. */
  public static String toPlain(String text) {
    if (text == null || !(MD_IMG.matcher(text).find() || HTML_IMG.matcher(text).find())) {
      return text;
    }
    String out =
        replace(
            HTML_IMG,
            text,
            m -> {
              Matcher alt = HTML_ALT.matcher(m.group());
              return imageText(alt.find() ? alt.group(1) : "");
            });
    out = replace(MD_IMG, out, m -> imageText(m.group(1)));
    out = LINK.matcher(out).replaceAll("$1");
    out = HEADING.matcher(out).replaceAll("");
    out = BOLD.matcher(out).replaceAll("$2");
    out = ITALIC.matcher(out).replaceAll("$1");
    out = STRIKE.matcher(out).replaceAll("$1");
    out = INLINE_CODE.matcher(out).replaceAll("$1");
    return out;
  }

  private static String imageText(String alt) {
    if (alt == null || GENERIC_ALT.matcher(alt).matches()) {
      return "[" + IMAGE_LABEL + "]";
    }
    return "[" + IMAGE_LABEL + ": " + alt.trim() + "]";
  }

  private static String replace(
      Pattern pattern, String text, java.util.function.Function<Matcher, String> fn) {
    Matcher m = pattern.matcher(text);
    StringBuilder out = new StringBuilder();
    while (m.find()) {
      m.appendReplacement(out, Matcher.quoteReplacement(fn.apply(m)));
    }
    m.appendTail(out);
    return out.toString();
  }
}
