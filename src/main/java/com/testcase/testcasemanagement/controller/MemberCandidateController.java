// src/main/java/com/testcase/testcasemanagement/controller/MemberCandidateController.java
package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.UserDto;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 프로젝트·조직에 넣을 사용자를 찾는 검색.
 *
 * <p>멤버를 더할 때 사용자명을 외워 손으로 적게 하지 않으려고 둔다. 이미 멤버인 사람과 비활성 계정은 결과에서 빠지므로, 고른 뒤 추가가 중복으로 실패하는 일이
 * 없다.
 *
 * <p>전체 사용자 목록 조회는 시스템 관리자 전용(`/api/admin/users`)이라 프로젝트 매니저·조직 관리자가 쓸 수 없다. 그래서 검색어를 필수로 두고 개수를
 * 잘라, 멤버를 관리할 수 있는 사람에게 필요한 만큼만 연다.
 */
@RestController
@RequestMapping("/api")
@Tag(name = "멤버 후보 검색", description = "프로젝트·조직에 추가할 사용자 검색 API")
@SecurityRequirement(name = "bearerAuth")
public class MemberCandidateController {

  /** 한 번에 돌려주는 최대 인원. 목록이 길어지면 고르기 어렵고 전체 열람에 가까워진다. */
  private static final int MAX_RESULTS = 20;

  /** 검색어 최소 길이. 한 글자면 사실상 전체 목록이 된다. */
  private static final int MIN_QUERY_LENGTH = 2;

  @Autowired private UserRepository userRepository;

  @Operation(summary = "프로젝트 멤버 후보 검색", description = "이 프로젝트에 아직 없는 활성 사용자를 사용자명·이름·이메일로 찾는다.")
  @GetMapping("/projects/{projectId}/member-candidates")
  @PreAuthorize("@projectSecurityService.canManageMembers(#projectId, authentication.name)")
  public ResponseEntity<List<UserDto.Summary>> searchProjectCandidates(
      @Parameter(description = "멤버를 추가할 프로젝트 ID", required = true) @PathVariable String projectId,
      @Parameter(description = "검색어 (사용자명·이름·이메일, 2자 이상)", example = "kim") @RequestParam(required = false)
          String query) {

    String keyword = normalize(query);
    if (keyword == null) {
      return ResponseEntity.ok(List.of());
    }

    return ResponseEntity.ok(
        toSummaries(
            userRepository.searchProjectMemberCandidates(projectId, keyword, limit())));
  }

  @Operation(summary = "조직 멤버 후보 검색", description = "이 조직에 아직 없는 활성 사용자를 사용자명·이름·이메일로 찾는다.")
  @GetMapping("/organizations/{organizationId}/member-candidates")
  @PreAuthorize(
      "@organizationSecurityService.canManageOrganization(#organizationId, authentication.name)")
  public ResponseEntity<List<UserDto.Summary>> searchOrganizationCandidates(
      @Parameter(description = "멤버를 추가할 조직 ID", required = true) @PathVariable
          String organizationId,
      @Parameter(description = "검색어 (사용자명·이름·이메일, 2자 이상)", example = "kim") @RequestParam(required = false)
          String query) {

    String keyword = normalize(query);
    if (keyword == null) {
      return ResponseEntity.ok(List.of());
    }

    return ResponseEntity.ok(
        toSummaries(
            userRepository.searchOrganizationMemberCandidates(
                organizationId, keyword, limit())));
  }

  /** 검색어를 다듬는다. 짧거나 비어 있으면 null 을 돌려 호출부가 빈 목록을 내게 한다. */
  private String normalize(String query) {
    if (query == null) {
      return null;
    }
    String trimmed = query.trim();
    return trimmed.length() < MIN_QUERY_LENGTH ? null : trimmed;
  }

  private Pageable limit() {
    return PageRequest.of(0, MAX_RESULTS);
  }

  private List<UserDto.Summary> toSummaries(List<User> users) {
    return users.stream()
        .map(
            user ->
                UserDto.Summary.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .name(user.getName())
                    .email(user.getEmail())
                    .build())
        .collect(Collectors.toList());
  }
}
