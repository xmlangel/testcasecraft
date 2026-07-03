package com.testcase.testcasemanagement.dto.graph;

import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** 그래프 간선 — AgensGraph edge(Label[graphid][start,end]{json}) 변환 결과. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GraphEdgeDto {
  /** AgensGraph graphid */
  private String id;

  /** ELABEL 이름 (예: OF_CASE, FAILED_WITH) */
  private String label;

  /** 시작 정점 graphid */
  private String source;

  /** 끝 정점 graphid */
  private String target;

  /** 간선 속성 */
  private Map<String, Object> properties;
}
