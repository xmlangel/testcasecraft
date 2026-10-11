package com.testcase.testcasemanagement.dto.requirement;

/** 관계도용 관계 한 건. source → target 방향 그대로다. */
public record RequirementRelationEdge(String id, String sourceId, String targetId, String type) {}
