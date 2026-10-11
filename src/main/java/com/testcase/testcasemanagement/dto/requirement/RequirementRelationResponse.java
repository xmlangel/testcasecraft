package com.testcase.testcasemanagement.dto.requirement;

/**
 * 한 요구사항 입장에서 본 관계. direction 이 OUTGOING 이면 이 요구사항이 source, INCOMING 이면 target 이다. RELATED_TO 는 방향이
 * 없어 어느 쪽에서 봐도 같은 뜻이다.
 */
public record RequirementRelationResponse(
    String id,
    String type,
    String direction,
    String otherId,
    String otherDocId,
    String otherTitle,
    String otherStatus) {}
