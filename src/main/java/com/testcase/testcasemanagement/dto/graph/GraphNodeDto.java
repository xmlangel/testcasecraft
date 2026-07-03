package com.testcase.testcasemanagement.dto.graph;

import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 그래프 정점 — AgensGraph vertex(Label[graphid]{json})를 프런트(Cytoscape) 친화 형태로 변환한 것. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GraphNodeDto {
  /** AgensGraph graphid (예: "3.1") — 그래프 내 유일 식별자 */
  private String id;

  /** VLABEL 이름 (예: TestCase, FailureType) */
  private String label;

  /** 정점 속성 (id, name, result 등 도메인 속성) */
  private Map<String, Object> properties;
}
