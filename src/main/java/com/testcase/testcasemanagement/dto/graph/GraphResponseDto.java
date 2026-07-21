package com.testcase.testcasemanagement.dto.graph;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** 그래프 조회 응답 — Cytoscape 가 그대로 소비하는 {nodes, edges} 형태. graphid 기준으로 중복을 제거한다. */
public class GraphResponseDto {
  private final Map<String, GraphNodeDto> nodeMap = new LinkedHashMap<>();
  private final Map<String, GraphEdgeDto> edgeMap = new LinkedHashMap<>();

  public void addNode(GraphNodeDto node) {
    if (node != null) {
      nodeMap.putIfAbsent(node.getId(), node);
    }
  }

  public void addEdge(GraphEdgeDto edge) {
    if (edge != null) {
      edgeMap.putIfAbsent(edge.getId(), edge);
    }
  }

  public List<GraphNodeDto> getNodes() {
    return new ArrayList<>(nodeMap.values());
  }

  public List<GraphEdgeDto> getEdges() {
    return new ArrayList<>(edgeMap.values());
  }
}
