// src/main/java/com/testcase/testcasemanagement/util/JiraInlineImages.java
package com.testcase.testcasemanagement.util;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * ICT-436: JIRA 이슈 설명에 들어간 본문 이미지 처리.
 *
 * <p>테스트케이스·결과 노트의 본문 이미지는 {@code /api/testcase-attachments/public/{id}?token=...} 주소로 삽입된다. 이 주소는
 * 이 서버(그리고 그 뒤 MinIO)에서만 열리므로 JIRA 에 그대로 넘기면 이미지 대신 주소 문자열이 보인다. 이 클래스는 설명에서 그런 이미지를 찾아내고, JIRA 에
 * 첨부로 올린 뒤 위키 마크업({@code !파일명|thumbnail!})으로 본문에 다시 그릴 수 있게 설명을 변환한다.
 */
public final class JiraInlineImages {

  private JiraInlineImages() {}

  /** 설명에서 찾은 본문 이미지 한 건. */
  public record InlineImage(String attachmentId, String token, String alt) {}

  private static final String PUBLIC_PATH = "/api/testcase-attachments/public/";

  // <img ... src="(호스트)?/api/testcase-attachments/public/{id}?token={token}" ...>
  private static final Pattern HTML_IMG =
      Pattern.compile(
          "<img\\b[^>]*?\\bsrc\\s*=\\s*[\"'][^\"']*?"
              + Pattern.quote(PUBLIC_PATH)
              + "([A-Za-z0-9_-]+)\\?(?:[^\"']*?&(?:amp;)?)?token=([A-Za-z0-9_-]+)[^\"']*[\"'][^>]*>",
          Pattern.CASE_INSENSITIVE);

  // ![alt]((호스트)?/api/testcase-attachments/public/{id}?token={token})
  private static final Pattern MD_IMG =
      Pattern.compile(
          "!\\[([^\\]]*)\\]\\(\\s*[^)\\s]*?"
              + Pattern.quote(PUBLIC_PATH)
              + "([A-Za-z0-9_-]+)\\?(?:[^)\\s]*?&)?token=([A-Za-z0-9_-]+)[^)]*\\)");

  private static final Pattern HTML_ALT =
      Pattern.compile("\\balt\\s*=\\s*[\"']([^\"']*)[\"']", Pattern.CASE_INSENSITIVE);

  // 변환 중 이미지 자리를 표시하는 표지. 일반 텍스트에 나올 수 없는 제어 문자로 감싼다.
  private static final char MARK = '\u0000';
  private static final Pattern IMAGE_MARK = Pattern.compile(MARK + "IMG(\\d+)" + MARK);

  /** 설명 안의 본문 이미지와, 각 이미지 자리를 표지로 바꾼 텍스트. */
  public record Extracted(String markedText, List<InlineImage> images) {
    public boolean hasImages() {
      return !images.isEmpty();
    }
  }

  /** 본문 이미지를 찾아 순서대로 표지({@code \0IMGn\0})로 바꾼다. 이미지가 없으면 원문을 그대로 돌려준다. */
  public static Extracted extract(String text) {
    List<InlineImage> images = new ArrayList<>();
    if (text == null || text.isEmpty()) {
      return new Extracted(text, images);
    }
    String marked =
        replaceAll(
            HTML_IMG,
            text,
            m -> {
              Matcher alt = HTML_ALT.matcher(m.group());
              images.add(new InlineImage(m.group(1), m.group(2), alt.find() ? alt.group(1) : ""));
              return mark(images.size() - 1);
            });
    marked =
        replaceAll(
            MD_IMG,
            marked,
            m -> {
              images.add(new InlineImage(m.group(2), m.group(3), m.group(1)));
              return mark(images.size() - 1);
            });
    return new Extracted(marked, images);
  }

  /** 표지를 사람이 읽을 수 있는 자리 표시로 바꾼다. 이슈를 처음 만들 때(아직 첨부가 없을 때)와, 첨부 업로드나 본문 갱신이 실패했을 때 남는 모양이다. */
  public static String withPlaceholders(Extracted extracted) {
    return replaceAll(
        IMAGE_MARK,
        extracted.markedText(),
        m -> {
          InlineImage image = extracted.images().get(Integer.parseInt(m.group(1)));
          String label = image.alt() == null || image.alt().isBlank() ? "image" : image.alt();
          return "[image: " + label + "]";
        });
  }

  /**
   * 마크다운 설명을 JIRA 위키 마크업으로 바꾼다. 이미지 표지는 업로드된 첨부 파일명이 있으면 {@code !파일명|thumbnail!}, 없으면(업로드 실패) 자리 표시
   * 문구로 바꾼다.
   *
   * @param uploadedNames 이미지 순번 → JIRA 에 올라간 첨부 파일명
   */
  public static String toWiki(Extracted extracted, Map<Integer, String> uploadedNames) {
    String[] lines = extracted.markedText().replace("\r", "").split("\n", -1);
    StringBuilder out = new StringBuilder();
    for (int i = 0; i < lines.length; i++) {
      if (i > 0) out.append('\n');
      out.append(convertLine(lines[i]));
    }
    return replaceAll(
        IMAGE_MARK,
        out.toString(),
        m -> {
          int index = Integer.parseInt(m.group(1));
          String name = uploadedNames.get(index);
          if (name != null) {
            return "!" + name + "|thumbnail!";
          }
          InlineImage image = extracted.images().get(index);
          String label = image.alt() == null || image.alt().isBlank() ? "image" : image.alt();
          return escapeWiki("[image: " + label + "]");
        });
  }

  private static final Pattern HEADER = Pattern.compile("^(#{1,6})\\s+(.+)$");
  private static final Pattern BULLET = Pattern.compile("^\\s*[-*]\\s+(.+)$");
  private static final Pattern BOLD = Pattern.compile("(\\*\\*|__)(.+?)\\1");
  private static final Pattern ITALIC =
      Pattern.compile("(?<![*\\w])\\*(?!\\*)(.+?)(?<!\\*)\\*(?![*\\w])");

  private static String convertLine(String line) {
    String trimmed = line.trim();
    if (trimmed.equals("---") || trimmed.equals("***")) {
      // 바로 뒤 줄이 목록으로 읽히지 않도록 빈 줄로 감싼다(실측: 붙여 쓰면 다음 줄이 글머리표가 된다)
      return "\n----\n";
    }
    Matcher header = HEADER.matcher(trimmed);
    if (header.find()) {
      return "h" + header.group(1).length() + ". " + convertInline(header.group(2));
    }
    Matcher bullet = BULLET.matcher(line);
    if (bullet.find()) {
      return "* " + convertInline(bullet.group(1));
    }
    return convertInline(line);
  }

  /** 굵게·기울임만 옮기고 나머지는 위키 기호로 해석되지 않도록 이스케이프한다. */
  private static String convertInline(String text) {
    StringBuilder out = new StringBuilder();
    Matcher bold = BOLD.matcher(text);
    int last = 0;
    while (bold.find()) {
      out.append(convertItalic(text.substring(last, bold.start())));
      out.append('*').append(escapeWiki(bold.group(2))).append('*');
      last = bold.end();
    }
    out.append(convertItalic(text.substring(last)));
    return out.toString();
  }

  private static String convertItalic(String text) {
    StringBuilder out = new StringBuilder();
    Matcher italic = ITALIC.matcher(text);
    int last = 0;
    while (italic.find()) {
      out.append(escapeWiki(text.substring(last, italic.start())));
      out.append('_').append(escapeWiki(italic.group(1))).append('_');
      last = italic.end();
    }
    out.append(escapeWiki(text.substring(last)));
    return out.toString();
  }

  private static String escapeWiki(String text) {
    StringBuilder out = new StringBuilder(text.length());
    for (char c : text.toCharArray()) {
      if ("\\*_-+^~?{}[]|!".indexOf(c) >= 0) {
        out.append('\\');
      }
      out.append(c);
    }
    return out.toString();
  }

  private static String mark(int index) {
    return MARK + "IMG" + index + MARK;
  }

  private static String replaceAll(Pattern pattern, String text, Function<Matcher, String> fn) {
    Matcher m = pattern.matcher(text);
    StringBuilder out = new StringBuilder();
    while (m.find()) {
      m.appendReplacement(out, Matcher.quoteReplacement(fn.apply(m)));
    }
    m.appendTail(out);
    return out.toString();
  }
}
