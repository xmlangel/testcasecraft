package com.testcase.testcasemanagement.service.graph;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.dto.graph.GraphEdgeDto;
import com.testcase.testcasemanagement.dto.graph.GraphNodeDto;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * AgensGraph 결과 텍스트 파서.
 *
 * <p>AgensGraph 는 vertex/edge 를 아래 텍스트 형식으로 반환한다 (P0 검증 완료).
 *
 * <ul>
 *   <li>vertex: {@code Label[graphid]{json properties}} — 예: {@code TestCase[3.1]{"id": "tc-001"}}
 *   <li>edge: {@code Label[graphid][start,end]{json}} — 예: {@code FAILED_WITH[7.1][4.1,5.1]{}}
 * </ul>
 */
public final class AgResultParser {

  private static final Logger logger = LoggerFactory.getLogger(AgResultParser.class);
  private static final ObjectMapper objectMapper = new ObjectMapper();

  // Label[graphid]{json}
  private static final Pattern VERTEX_PATTERN =
      Pattern.compile("^\"?(\\w+)\"?\\[([0-9.]+)\\](\\{.*\\})$", Pattern.DOTALL);

  // Label[graphid][start,end]{json}
  private static final Pattern EDGE_PATTERN =
      Pattern.compile(
          "^\"?(\\w+)\"?\\[([0-9.]+)\\]\\[([0-9.]+),([0-9.]+)\\](\\{.*\\})$", Pattern.DOTALL);

  private AgResultParser() {}

  /** vertex 텍스트 → GraphNodeDto. 형식이 다르면 null (호출부에서 스킵). */
  public static GraphNodeDto parseVertex(String raw) {
    if (raw == null) {
      return null;
    }
    Matcher m = VERTEX_PATTERN.matcher(raw.trim());
    if (!m.matches()) {
      logger.warn("vertex 파싱 실패 — 형식 불일치: {}", abbreviate(raw));
      return null;
    }
    return new GraphNodeDto(m.group(2), m.group(1), parseProperties(m.group(3)));
  }

  /** edge 텍스트 → GraphEdgeDto. 형식이 다르면 null. */
  public static GraphEdgeDto parseEdge(String raw) {
    if (raw == null) {
      return null;
    }
    Matcher m = EDGE_PATTERN.matcher(raw.trim());
    if (!m.matches()) {
      logger.warn("edge 파싱 실패 — 형식 불일치: {}", abbreviate(raw));
      return null;
    }
    return new GraphEdgeDto(
        m.group(2), m.group(1), m.group(3), m.group(4), parseProperties(m.group(5)));
  }

  private static Map<String, Object> parseProperties(String json) {
    try {
      return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
    } catch (Exception e) {
      logger.warn("그래프 속성 JSON 파싱 실패: {}", abbreviate(json));
      return Map.of();
    }
  }

  private static String abbreviate(String s) {
    return s.length() > 120 ? s.substring(0, 120) + "…" : s;
  }
}
