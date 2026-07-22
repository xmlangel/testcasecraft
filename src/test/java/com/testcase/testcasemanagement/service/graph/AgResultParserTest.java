package com.testcase.testcasemanagement.service.graph;

import static org.testng.Assert.*;

import com.testcase.testcasemanagement.dto.graph.GraphEdgeDto;
import com.testcase.testcasemanagement.dto.graph.GraphNodeDto;
import org.testng.annotations.Test;

/** AgensGraph vertex/edge 텍스트 파서 검증 — 형식은 P0 PoC 실측값 기준. */
public class AgResultParserTest {

  @Test(description = "vertex 텍스트를 label/graphid/properties 로 파싱한다")
  public void parsesVertex() {
    // P0 실측: TestResult[4.1]{"id": "tr-001", "result": "FAIL"}
    GraphNodeDto node =
        AgResultParser.parseVertex("TestResult[4.1]{\"id\": \"tr-001\", \"result\": \"FAIL\"}");

    assertNotNull(node);
    assertEquals(node.getId(), "4.1");
    assertEquals(node.getLabel(), "TestResult");
    assertEquals(node.getProperties().get("id"), "tr-001");
    assertEquals(node.getProperties().get("result"), "FAIL");
  }

  @Test(description = "빈 속성 edge 를 source/target 포함해 파싱한다")
  public void parsesEdgeWithEmptyProperties() {
    // P0 실측: FAILED_WITH[7.1][4.1,5.1]{}
    GraphEdgeDto edge = AgResultParser.parseEdge("FAILED_WITH[7.1][4.1,5.1]{}");

    assertNotNull(edge);
    assertEquals(edge.getId(), "7.1");
    assertEquals(edge.getLabel(), "FAILED_WITH");
    assertEquals(edge.getSource(), "4.1");
    assertEquals(edge.getTarget(), "5.1");
    assertTrue(edge.getProperties().isEmpty());
  }

  @Test(description = "한글 속성도 파싱한다")
  public void parsesKoreanProperties() {
    GraphNodeDto node =
        AgResultParser.parseVertex("TestCase[3.1]{\"id\": \"tc-001\", \"name\": \"로그인 성공\"}");

    assertNotNull(node);
    assertEquals(node.getProperties().get("name"), "로그인 성공");
  }

  @Test(description = "속성 문자열에 중괄호·대괄호가 있어도 전체 JSON 을 정확히 잡는다 (greedy + $ 앵커)")
  public void parsesBracesInsidePropertyValues() {
    // 리뷰 지적 검증: greedy 매칭은 마지막 } 까지 전체 JSON 을 잡는 게 맞는 동작이다
    GraphNodeDto node =
        AgResultParser.parseVertex(
            "JunitCase[8.1]{\"failureMessage\": \"expected {ok} but got [err]\", \"name\":"
                + " \"t1\"}");

    assertNotNull(node);
    assertEquals(node.getProperties().get("failureMessage"), "expected {ok} but got [err]");
    assertEquals(node.getProperties().get("name"), "t1");
  }

  @Test(description = "형식이 어긋나면 null 을 반환한다 (예외 아님)")
  public void returnsNullOnMalformedInput() {
    assertNull(AgResultParser.parseVertex("not-a-vertex"));
    assertNull(AgResultParser.parseVertex(null));
    assertNull(AgResultParser.parseEdge("TestCase[3.1]{\"id\": \"x\"}")); // vertex 를 edge 로
    assertNull(AgResultParser.parseEdge(null));
  }

  @Test(description = "Cypher 리터럴 이스케이프 — 따옴표는 '' 로, 백슬래시는 \\\\ 로 (PoC 실측 규칙)")
  public void quotesCypherLiterals() {
    assertEquals(GraphDbClient.quote("plain"), "'plain'");
    assertEquals(GraphDbClient.quote(null), "''");
    // PoC 검증 문자열: It's a "test" with back\slash and }brace
    assertEquals(
        GraphDbClient.quote("It's a \"test\" with back\\slash and }brace"),
        "'It''s a \"test\" with back\\\\slash and }brace'");
    // 인젝션 시도 — 따옴표 탈출 불가
    assertEquals(GraphDbClient.quote("x'}) DETACH DELETE (n) //"), "'x''}) DETACH DELETE (n) //'");
  }

  @Test(description = "식별자 화이트리스트 — UUID 는 통과, 인젝션 문자는 거부")
  public void validatesIds() {
    assertTrue(GraphQueryService.isValidId("550e8400-e29b-41d4-a716-446655440000"));
    assertTrue(GraphQueryService.isValidId("tc-001"));
    assertFalse(GraphQueryService.isValidId("x' OR 1=1 --"));
    assertFalse(GraphQueryService.isValidId("a\"}) MATCH (n) DETACH DELETE n //"));
    assertFalse(GraphQueryService.isValidId(""));
    assertFalse(GraphQueryService.isValidId(null));
    assertThrows(IllegalArgumentException.class, () -> GraphQueryService.validateId("bad id"));
  }
}
