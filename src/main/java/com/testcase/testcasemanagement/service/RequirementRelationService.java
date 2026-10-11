package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.requirement.RequirementRelationEdge;
import com.testcase.testcasemanagement.dto.requirement.RequirementRelationResponse;
import com.testcase.testcasemanagement.exception.ResourceNotFoundException;
import com.testcase.testcasemanagement.exception.ResourceNotValidException;
import com.testcase.testcasemanagement.model.Requirement;
import com.testcase.testcasemanagement.model.RequirementRelation;
import com.testcase.testcasemanagement.repository.RequirementRelationRepository;
import com.testcase.testcasemanagement.repository.RequirementRepository;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import java.util.ArrayDeque;
import java.util.Comparator;
import java.util.Deque;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 요구사항 사이의 관계(상위·하위, 의존, 관련). 권한과 요구사항 조회는 {@link RequirementService} 의 규칙을 그대로 쓴다.
 *
 * <p>막는 것: 다른 프로젝트 요구사항, 자기 자신, 같은 관계 중복(관련은 양방향으로 본다), 상위·하위 순환.
 */
@Service
@Transactional
public class RequirementRelationService {

  private final RequirementService requirementService;
  private final RequirementRepository requirementRepository;
  private final RequirementRelationRepository relationRepository;
  private final SecurityContextUtil securityContextUtil;

  public RequirementRelationService(
      RequirementService requirementService,
      RequirementRepository requirementRepository,
      RequirementRelationRepository relationRepository,
      SecurityContextUtil securityContextUtil) {
    this.requirementService = requirementService;
    this.requirementRepository = requirementRepository;
    this.relationRepository = relationRepository;
    this.securityContextUtil = securityContextUtil;
  }

  @Transactional(readOnly = true)
  public List<RequirementRelationResponse> getRelations(String requirementId) {
    Requirement requirement = requirementService.findRequirement(requirementId);
    requirementService.requireAccess(requirement.getProject().getId());

    List<RequirementRelation> relations = relationRepository.findInvolving(requirementId);
    Map<String, Requirement> others =
        requirementRepository
            .findAllById(
                relations.stream()
                    .map(
                        r ->
                            r.getSourceId().equals(requirementId)
                                ? r.getTargetId()
                                : r.getSourceId())
                    .distinct()
                    .toList())
            .stream()
            .collect(Collectors.toMap(Requirement::getId, Function.identity()));

    return relations.stream()
        .map(
            r -> {
              boolean outgoing = r.getSourceId().equals(requirementId);
              Requirement other = others.get(outgoing ? r.getTargetId() : r.getSourceId());
              return other == null ? null : toResponse(r, outgoing, other);
            })
        .filter(java.util.Objects::nonNull)
        .sorted(
            Comparator.comparing(RequirementRelationResponse::type)
                .thenComparing(RequirementRelationResponse::otherDocId))
        .toList();
  }

  /** 관계도용: 프로젝트의 관계 전체를 한 번에 돌려준다. */
  @Transactional(readOnly = true)
  public List<RequirementRelationEdge> getProjectRelations(String projectId) {
    requirementService.requireAccess(projectId);
    return relationRepository.findByProjectId(projectId).stream()
        .map(
            r ->
                new RequirementRelationEdge(
                    r.getId(), r.getSourceId(), r.getTargetId(), r.getType().name()))
        .toList();
  }

  public List<RequirementRelationResponse> addRelation(
      String sourceId, String targetId, String typeName) {
    Requirement source = requirementService.findRequirement(sourceId);
    String projectId = source.getProject().getId();
    requirementService.requireEdit(projectId);

    Requirement target = requirementService.findRequirement(targetId);
    if (!projectId.equals(target.getProject().getId())) {
      throw invalid("다른 프로젝트의 요구사항과는 관계를 맺을 수 없습니다.", "targetId", targetId);
    }
    if (sourceId.equals(targetId)) {
      throw invalid("자기 자신과는 관계를 맺을 수 없습니다.", "targetId", targetId);
    }
    RequirementRelation.Type type = parseType(typeName);

    if (relationRepository.existsBySourceIdAndTargetIdAndType(sourceId, targetId, type)
        || (type == RequirementRelation.Type.RELATED_TO
            && relationRepository.existsBySourceIdAndTargetIdAndType(targetId, sourceId, type))) {
      throw invalid("이미 같은 관계가 있습니다.", "targetId", targetId);
    }
    if (type == RequirementRelation.Type.PARENT_OF && isDescendant(targetId, sourceId)) {
      throw invalid("하위 요구사항을 다시 상위로 지정할 수 없습니다(순환).", "targetId", targetId);
    }

    relationRepository.save(
        new RequirementRelation(
            sourceId, targetId, type, securityContextUtil.getCurrentUsername()));
    return getRelations(sourceId);
  }

  public void deleteRelation(String relationId) {
    RequirementRelation relation =
        relationRepository
            .findById(relationId)
            .orElseThrow(() -> new ResourceNotFoundException("관계를 찾을 수 없습니다: " + relationId));
    Requirement source = requirementService.findRequirement(relation.getSourceId());
    requirementService.requireEdit(source.getProject().getId());
    relationRepository.delete(relation);
  }

  /** candidate 가 ancestor 의 하위(PARENT_OF 를 따라 내려가 닿는 곳)인지. candidate 자신을 포함한다. */
  private boolean isDescendant(String ancestor, String candidate) {
    Set<String> seen = new HashSet<>();
    Deque<String> queue = new ArrayDeque<>(List.of(ancestor));
    while (!queue.isEmpty()) {
      String current = queue.poll();
      if (current.equals(candidate)) {
        return true;
      }
      if (seen.add(current)) {
        relationRepository
            .findBySourceIdAndType(current, RequirementRelation.Type.PARENT_OF)
            .forEach(r -> queue.add(r.getTargetId()));
      }
    }
    return false;
  }

  private static RequirementRelation.Type parseType(String value) {
    try {
      return RequirementRelation.Type.valueOf(value.trim().toUpperCase(Locale.ROOT));
    } catch (IllegalArgumentException ex) {
      throw invalid("허용되지 않는 관계 종류입니다.", "type", value);
    }
  }

  private static ResourceNotValidException invalid(String message, String field, String value) {
    return new ResourceNotValidException(message, Map.of(field, String.valueOf(value)));
  }

  private static RequirementRelationResponse toResponse(
      RequirementRelation r, boolean outgoing, Requirement other) {
    return new RequirementRelationResponse(
        r.getId(),
        r.getType().name(),
        outgoing ? "OUTGOING" : "INCOMING",
        other.getId(),
        other.getDocId(),
        other.getTitle(),
        other.getStatus().name());
  }
}
