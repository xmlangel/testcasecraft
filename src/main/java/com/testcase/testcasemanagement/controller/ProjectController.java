// src/main/java/com/testcase/testcasemanagement/controller/ProjectController.java
package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.ProjectDto;
import com.testcase.testcasemanagement.dto.ProjectWithTestCaseCountDto;
import com.testcase.testcasemanagement.mapper.ProjectMapper;
import com.testcase.testcasemanagement.model.Organization;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.ProjectUser;
import com.testcase.testcasemanagement.repository.OrganizationUserRepository;
import com.testcase.testcasemanagement.repository.ProjectUserRepository;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.repository.TestExecutionRepository;
import com.testcase.testcasemanagement.repository.TestPlanRepository;
import com.testcase.testcasemanagement.service.OrganizationService;
import com.testcase.testcasemanagement.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid; // 올바른 위치에 있는 import 문
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * 프로젝트 관리 API 컨트롤러
 *
 * <p>테스트 케이스 관리 시스템의 핵심인 프로젝트 생성, 수정, 삭제 및 관리 기능을 제공합니다. 조직 기반 프로젝트 관리와 독립 프로젝트 관리를 모두 지원합니다.
 */
@Tag(name = "Project Management", description = "프로젝트 관리 API")
@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "*")
@SecurityRequirement(name = "bearerAuth")
public class ProjectController {

  @Autowired private ProjectService projectService;

  @Autowired private OrganizationService organizationService;

  @Autowired private TestCaseRepository testCaseRepository;

  @Autowired private TestPlanRepository testPlanRepository;

  @Autowired private TestExecutionRepository testExecutionRepository;

  @Autowired private ProjectUserRepository projectUserRepository;

  @Autowired private OrganizationUserRepository organizationUserRepository;

  /** 전체 프로젝트 목록 조회 */
  @Operation(
      summary = "전체 프로젝트 목록 조회",
      description =
          """
          **📂 전체 프로젝트 목록 조회**

          현재 사용자가 접근 가능한 모든 프로젝트의 목록을 조회하는 핵심 API입니다.

          **✨ 주요 기능:**
          • **권한 기반 필터링**: 사용자가 접근 가능한 프로젝트만 반환
          • **테스트 케이스 통계**: 각 프로젝트별 테스트 케이스 개수 포함
          • **멤버 통계**: 각 프로젝트별 참여 멤버 수 포함
          • **조직 정보**: 조직 소속 프로젝트는 조직 ID 포함

          **📋 사용 시나리오:**
          1. **프로젝트 선택**: 사용자가 작업할 프로젝트 선택
          2. **대시보드 표시**: 메인 화면의 프로젝트 개요
          3. **권한 확인**: 사용자별 접근 가능한 프로젝트 파악
          4. **통계 분석**: 프로젝트별 규모 및 활동도 분석

          **🔍 응답 데이터:**
          • **기본 프로젝트 정보**: ID, 코드, 이름, 설명
          • **통계 정보**: 테스트 케이스 수, 멤버 수
          • **조직 연동**: 조직 ID (조직 소속 프로젝트인 경우)
          • **시간 정보**: 생성일, 수정일

          **🔒 보안 및 권한:**
          • 기본 사용자 권한 이상 필요 (USER, TESTER, ADMIN)
          • 사용자가 멤버로 속한 프로젝트만 조회 가능
          • 시스템 관리자는 모든 프로젝트 조회 가능
          """,
      tags = {"Project Management"})
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "프로젝트 목록 조회 성공",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ProjectWithTestCaseCountDto.class),
                    examples =
                        @ExampleObject(
                            name = "프로젝트 목록 응답 예제",
                            value =
                                """
                                [
                                    {
                                        "id": "proj-123",
                                        "code": "MOBILE_APP",
                                        "name": "모바일 앱 테스트",
                                        "description": "모바일 애플리케이션 테스트 프로젝트",
                                        "organizationId": "org-456",
                                        "testCaseCount": 150,
                                        "memberCount": 8,
                                        "displayOrder": 1,
                                        "createdAt": "2025-01-01T00:00:00",
                                        "updatedAt": "2025-01-15T10:30:00"
                                    },
                                    {
                                        "id": "proj-789",
                                        "code": "WEB_API",
                                        "name": "웹 API 테스트",
                                        "description": "RESTful API 테스트 프로젝트",
                                        "organizationId": null,
                                        "testCaseCount": 75,
                                        "memberCount": 3,
                                        "displayOrder": 2,
                                        "createdAt": "2025-01-10T00:00:00",
                                        "updatedAt": "2025-01-20T14:20:00"
                                    }
                                ]
                                """))),
        @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
        @ApiResponse(responseCode = "403", description = "접근 권한 없음")
      })
  @GetMapping
  @PreAuthorize("hasRole('ADMIN') or hasRole('TESTER') or hasRole('USER')")
  public ResponseEntity<List<ProjectWithTestCaseCountDto>> getAllProjects(
      Authentication authentication) {
    List<Project> projects = projectService.getAllProjects();

    if (projects.isEmpty()) {
      return ResponseEntity.ok(List.of());
    }

    // 프로젝트 및 조직 ID 목록 수집
    List<String> projectIds = projects.stream().map(Project::getId).collect(Collectors.toList());

    List<String> organizationIds =
        projects.stream()
            .map(Project::getOrganization)
            .filter(java.util.Objects::nonNull)
            .map(Organization::getId)
            .distinct()
            .collect(Collectors.toList());

    // 배치 카운트 조회 (N+1 문제 해결)
    Map<String, Long> testCaseCounts =
        convertToCountMap(testCaseRepository.countByProjectIds(projectIds));
    Map<String, Long> testPlanCounts =
        convertToCountMap(testPlanRepository.countByProjectIds(projectIds));
    Map<String, Long> testExecutionCounts =
        convertToCountMap(testExecutionRepository.countByProjectIds(projectIds));
    Map<String, Long> projectMemberCounts =
        convertToCountMap(projectUserRepository.countByProjectIds(projectIds));
    Map<String, Long> organizationMemberCounts =
        organizationIds.isEmpty()
            ? Map.of()
            : convertToCountMap(organizationUserRepository.countByOrganizationIds(organizationIds));

    // DTO 변환
    List<ProjectWithTestCaseCountDto> dtos =
        projects.stream()
            .map(
                project -> {
                  long testCaseCount = testCaseCounts.getOrDefault(project.getId(), 0L);
                  long testPlanCount = testPlanCounts.getOrDefault(project.getId(), 0L);
                  long testExecutionCount = testExecutionCounts.getOrDefault(project.getId(), 0L);

                  long memberCount;
                  if (project.getOrganization() != null) {
                    memberCount =
                        organizationMemberCounts.getOrDefault(
                            project.getOrganization().getId(), 0L);
                  } else {
                    memberCount = projectMemberCounts.getOrDefault(project.getId(), 0L);
                  }

                  return new ProjectWithTestCaseCountDto(
                      project, testCaseCount, memberCount, testPlanCount, testExecutionCount);
                })
            .collect(Collectors.toList());

    return ResponseEntity.ok(dtos);
  }

  /** List<Object[]> 형태의 카운트 조회 결과를 Map<String, Long>으로 변환 */
  private Map<String, Long> convertToCountMap(List<Object[]> results) {
    return results.stream()
        .collect(
            Collectors.toMap(
                r -> (String) r[0],
                r -> (Long) r[1],
                (existing, replacement) -> existing // 중복 키 발생 시 기존 값 유지 (이론상 발생 안함)
                ));
  }

  /** 새 프로젝트 생성 */
  @Operation(
      summary = "새 프로젝트 생성",
      description =
          """
          **🆕 새로운 테스트 프로젝트 생성**

          새로운 테스트 프로젝트를 생성하여 테스트 케이스 관리를 시작하는 필수 API입니다.

          **✨ 주요 기능:**
          • **독립 프로젝트**: 조직에 속하지 않은 독립 프로젝트 생성
          • **조직 프로젝트**: 특정 조직에 속한 프로젝트 생성
          • **자동 검증**: 프로젝트 코드 중복 및 유효성 검증
          • **즉시 활성화**: 생성 즉시 테스트 케이스 작성 가능

          **📋 사용 시나리오:**
          1. **신규 프로젝트**: 새로운 제품이나 기능에 대한 테스트 프로젝트
          2. **팀별 프로젝트**: 개발팀별 또는 제품별 프로젝트 분리
          3. **조직 내 프로젝트**: 특정 조직 소속 프로젝트 생성
          4. **프로토타이프**: 빠른 검증을 위한 임시 프로젝트

          **🔍 입력 검증:**
          • **필수 필드**: code(프로젝트 코드), name(프로젝트 명)
          • **코드 규칙**: 30자 이내, 영문/숫자/대시 조합
          • **이름 규칙**: 100자 이내
          • **설명 규칙**: 1000자 이내 (선택사항)
          • **조직 ID**: 유효한 조직 ID인 경우에만 연동

          **⚡ 처리 과정:**
          1. 입력 데이터 유효성 검증
          2. 프로젝트 코드 중복 확인
          3. 조직 ID 유효성 검증 (제공된 경우)
          4. 프로젝트 생성 및 데이터베이스 저장
          5. 생성자를 프로젝트 관리자로 자동 등록
          6. 감사 로그 기록

          **🔒 보안 및 권한:**
          • 기본 사용자 권한 이상 필요 (USER, TESTER, MANAGER, ADMIN)
          • 생성자는 자동으로 PROJECT_MANAGER 권한 획득
          • 독립 프로젝트: 모든 인증된 사용자 생성 가능
          • 조직 소속 프로젝트: 조직 멤버십 및 권한 필요
          """,
      tags = {"Project Management"})
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "201",
            description = "프로젝트 생성 성공",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ProjectDto.class),
                    examples =
                        @ExampleObject(
                            name = "프로젝트 생성 응답 예제",
                            value =
                                """
                                {
                                    "id": "proj-new-123",
                                    "code": "NEW_PROJECT",
                                    "name": "신규 테스트 프로젝트",
                                    "description": "신규 기능에 대한 테스트 프로젝트",
                                    "organizationId": "org-456",
                                    "displayOrder": null,
                                    "createdAt": "2025-01-25T10:00:00",
                                    "updatedAt": "2025-01-25T10:00:00"
                                }
                                """))),
        @ApiResponse(
            responseCode = "400",
            description = "잘못된 요청 데이터",
            content =
                @Content(
                    mediaType = "application/json",
                    examples = {
                      @ExampleObject(
                          name = "코드 중복 오류",
                          value = "{\"error\": \"이미 사용 중인 프로젝트 코드입니다: NEW_PROJECT\"}"),
                      @ExampleObject(name = "유효성 검증 오류", value = "{\"error\": \"코드는 필수 항목입니다\"}"),
                      @ExampleObject(
                          name = "조직 ID 오류",
                          value = "{\"error\": \"유효하지 않은 조직 ID입니다: invalid-org-123\"}")
                    })),
        @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
        @ApiResponse(responseCode = "403", description = "프로젝트 생성 권한 없음")
      })
  @PostMapping(value = "")
  @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER') or hasRole('TESTER') or hasRole('USER')")
  public ResponseEntity<?> createProject(
      @io.swagger.v3.oas.annotations.parameters.RequestBody(
              description =
                  """
                  **📄 새 프로젝트 생성 정보**

                  **필수 입력 필드:**
                  • **code**: 프로젝트 고유 코드 (30자 이내, 중복 불가)
                  • **name**: 프로젝트 명 (100자 이내)

                  **선택 입력 필드:**
                  • **description**: 프로젝트 설명 (1000자 이내)
                  • **organizationId**: 조직 ID (조직 소속 프로젝트인 경우)
                  • **displayOrder**: 정렬 순서 (자동 설정 가능)

                  **입력 규칙:**
                  • 모든 필드는 공백 문자 제거 후 검증
                  • 코드에는 특수문자 사용 제한 (_, - 등 허용)
                  • 조직 ID는 시스템에 존재하는 조직이어야 함

                  **검증 실패 시:**
                  • 400 Bad Request 응답
                  • 구체적인 오류 메시지 제공
                  """,
              required = true,
              content =
                  @Content(
                      mediaType = "application/json",
                      schema = @Schema(implementation = ProjectDto.class),
                      examples = {
                        @ExampleObject(
                            name = "독립 프로젝트 생성",
                            value =
                                """
                                {
                                    "code": "MOBILE_TEST",
                                    "name": "모바일 앱 테스트",
                                    "description": "모바일 애플리케이션 전체 테스트",
                                    "displayOrder": 1
                                }
                                """),
                        @ExampleObject(
                            name = "조직 소속 프로젝트 생성",
                            value =
                                """
                                {
                                    "code": "WEB_API_TEST",
                                    "name": "웹 API 테스트",
                                    "description": "RESTful API 전체 테스트 수행",
                                    "organizationId": "org-development-team",
                                    "displayOrder": 2
                                }
                                """),
                        @ExampleObject(
                            name = "최소 입력 예제",
                            value =
                                """
                                {
                                    "code": "QUICK_TEST",
                                    "name": "빠른 테스트"
                                }
                                """)
                      }))
          @Valid
          @RequestBody
          ProjectDto projectDto,
      Authentication authentication) { // @Valid 추가
    System.out.println("createProject 메서드 호출됨: " + projectDto.getName()); // 디버그 로그 유지
    System.out.println("DTO code: " + projectDto.getCode()); // 디버그 로그 추가
    System.out.println("DTO id: " + projectDto.getId()); // 디버그 로그 추가
    System.out.println("DTO description: " + projectDto.getDescription()); // 디버그 로그 추가
    // 기존 수동 코드 필드 검증 로직 제거

    Project project = ProjectMapper.toEntity(projectDto);
    System.out.println("Entity code: " + project.getCode()); // 디버그 로그 추가
    System.out.println("DTO organizationId: " + projectDto.getOrganizationId()); // 디버그 로그 추가

    // organizationId가 있으면 Organization 객체 설정
    if (projectDto.getOrganizationId() != null
        && !projectDto.getOrganizationId().trim().isEmpty()) {
      try {
        // OrganizationService를 통해 조직 존재 여부 확인 및 조직 객체 설정
        Organization organization =
            organizationService.getOrganization(projectDto.getOrganizationId());
        project.setOrganization(organization);
        System.out.println("Organization 설정 완료: " + organization.getName()); // 디버그 로그
      } catch (Exception e) {
        System.out.println("Organization 설정 실패: " + e.getMessage()); // 디버그 로그
        return ResponseEntity.badRequest()
            .body(Map.of("error", "유효하지 않은 조직 ID입니다: " + projectDto.getOrganizationId()));
      }
    }

    Project savedProject = projectService.saveProject(project);
    return ResponseEntity.status(HttpStatus.CREATED).body(ProjectMapper.toDto(savedProject));
  }

  /** 개별 프로젝트 상세 조회 */
  @Operation(
      summary = "개별 프로젝트 상세 조회",
      description =
          """
          **🔍 특정 프로젝트 상세 정보 조회**

          특정 프로젝트의 상세 정보를 조회하여 프로젝트 관리 및 테스트 케이스 작업을 위한 기본 정보를 제공합니다.

          **✨ 주요 기능:**
          • **상세 정보**: 프로젝트의 모든 기본 정보 제공
          • **가시성 필터링**: 사용자가 접근 가능한 프로젝트만 조회
          • **기간 데이터**: 프로젝트 선택 및 네비게이션에 필요한 정보
          • **메타데이터**: 생성/수정 시간, 조직 연결 정보

          **📋 사용 시나리오:**
          1. **프로젝트 선택**: 사용자가 특정 프로젝트를 선택하여 작업 시작
          2. **프로젝트 정보 확인**: 프로젝트 기본 정보 및 설정 확인
          3. **내비게이션**: 프로젝트 대시보드 및 메뉴 구성
          4. **권한 검증**: 사용자의 프로젝트 접근 권한 사전 확인
          5. **API 연동**: 다른 API 호출 전 프로젝트 존재 여부 확인

          **🔍 응답 데이터:**
          • **기본 정보**: ID, 코드, 이름, 설명
          • **조직 연결**: 조직 ID (조직 소속 프로젝트인 경우)
          • **정렬 순서**: 프로젝트 목록에서의 표시 순서
          • **시간 정보**: 생성일시, 최종 수정일시

          **🔒 보안 및 권한:**
          • 프로젝트 접근 권한 필수 - 프로젝트 멤버 또는 시스템 관리자
          • 권한 없는 사용자에게는 404 Not Found 응답 (보안상 존재 여부 숨김)
          • JWT 토큰 유효성 및 만료 자동 검증

          **⚡ 성능 최적화:**
          • 빠른 인덱스 기반 조회 (평균 20-50ms)
          • 케시 결과 활용 가능 (내부 최적화)
          • 필요한 데이터만 선택적 로드
          """,
      tags = {"Project Management"})
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "프로젝트 상세 정보 조회 성공",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ProjectDto.class),
                    examples =
                        @ExampleObject(
                            name = "프로젝트 상세 정보 예제",
                            value =
                                """
                                {
                                    "id": "proj-mobile-123",
                                    "code": "MOBILE_APP",
                                    "name": "모바일 앱 테스트",
                                    "description": "iOS 및 Android 모바일 애플리케이션 전체 테스트 수행 프로젝트",
                                    "organizationId": "org-mobile-team",
                                    "displayOrder": 1,
                                    "createdAt": "2025-01-01T00:00:00",
                                    "updatedAt": "2025-01-20T15:30:00"
                                }
                                """))),
        @ApiResponse(
            responseCode = "404",
            description = "프로젝트를 찾을 수 없음 또는 접근 권한 없음",
            content =
                @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(value = "{\"error\": \"요청한 리소스를 찾을 수 없습니다\"}"))),
        @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
        @ApiResponse(responseCode = "403", description = "프로젝트 접근 권한 없음")
      })
  @GetMapping("/{id}")
  @PreAuthorize("@projectSecurityService.canAccessProject(#id, authentication.name)")
  public ResponseEntity<ProjectDto> getProjectById(
      @Parameter(
              description =
                  """
                  **🆔 프로젝트 고유 식별자**

                  • **형식**: UUID 문자열 (예: "proj-a1b2c3d4-e5f6-7890")
                  • **필수값**: 반드시 제공되어야 함
                  • **검증**: 시스템에 존재하는 프로젝트 ID여야 함

                  **💡 프로젝트 ID 확인 방법**:
                  1. 프로젝트 목록 조회 API에서 id 필드 확인
                  2. 다른 프로젝트 관련 API 응답에서 id 필드 사용
                  3. 프로젝트 생성 API 응답에서 새로 생성된 ID 사용

                  **⚠️ 주의사항**:
                  • 존재하지 않는 ID 사용 시 404 에러 발생
                  • 접근 권한 없는 프로젝트 ID 사용 시 404 에러 (보안)
                  • 잘못된 형식의 ID 사용 시 400 에러 발생
                  • 대소문자를 정확히 입력해야 함
                  """,
              required = true,
              example = "proj-mobile-app-123")
          @PathVariable
          String id,
      Authentication authentication) {
    Optional<Project> project = projectService.getProjectById(id);
    return project
        .map(value -> ResponseEntity.ok(ProjectMapper.toDto(value)))
        .orElseGet(() -> ResponseEntity.notFound().build());
  }

  /** 프로젝트 정보 수정 */
  @Operation(
      summary = "프로젝트 정보 수정",
      description =
          """
          **✏️ 프로젝트 기본 정보 수정**

          기존 프로젝트의 기본 정보를 안전하게 수정하는 API입니다.

          **✨ 주요 기능:**
          • **기본 정보 수정**: 이름, 설명, 정렬 순서 등 수정
          • **정보 유효성 검증**: 수정된 데이터 자동 검증
          • **단계적 업데이트**: 변경된 필드만 선택적 업데이트
          • **자동 이력 관리**: 수정 시간 및 감사 로그 자동 기록

          **🚫 수정 불가능한 정보:**
          • **프로젝트 ID**: 시스템 생성 후 변경 불가
          • **프로젝트 코드**: 생성 후 변경 불가 (데이터 무결성)
          • **생성일시**: 시스템 관리 정보
          • **조직 연결**: 별도의 프로젝트 이전 API 사용 필요

          **📋 사용 시나리오:**
          1. **프로젝트 명 변경**: 비즈니스 요구에 따른 이름 업데이트
          2. **설명 업데이트**: 상세한 프로젝트 설명 추가/수정
          3. **정렬 순서 조정**: 사용자 인터페이스에서의 표시 순서 조정
          4. **프로젝트 설정 동기화**: 외부 시스템과의 설정 동기화
          5. **정보 정제**: 잘못 입력된 정보 수정

          **🔍 검증 규칙:**
          • **이름**: 1-100자, 특수문자 제한적 허용
          • **설명**: 0-1000자, 특수문자 허용
          • **정렬 순서**: 양수 또는 null (자동 설정)
          • **필수 입력**: 모든 필드는 null이 될 수 없음

          **⚡ 처리 과정:**
          1. 프로젝트 존재 여부 확인
          2. 수정 권한 검증 (PROJECT_MANAGER 이상)
          3. 입력 데이터 유효성 검증
          4. 변경된 필드 식별 및 업데이트
          5. updatedAt 시간 자동 갱신
          6. 감사 로그 상세 기록
          7. 업데이트된 프로젝트 정보 반환

          **🔒 보안 및 권한:**
          • 프로젝트 관리 권한 필수 - PROJECT_MANAGER 이상 또는 시스템 관리자
          • 모든 수정 작업 감사 로그 자동 기록
          • 변경 전후 값 비교 및 변경 사유 기록
          • 동시 수정 방지를 위한 낙관적 잠금
          """,
      tags = {"Project Management"})
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "프로젝트 정보 수정 성공",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ProjectDto.class),
                    examples =
                        @ExampleObject(
                            name = "수정된 프로젝트 정보 예제",
                            value =
                                """
                                {
                                    "id": "proj-mobile-123",
                                    "code": "MOBILE_APP",
                                    "name": "업데이트된 모바일 앱 테스트",
                                    "description": "새로운 기능이 추가된 모바일 애플리케이션 전범위 테스트",
                                    "organizationId": "org-mobile-team",
                                    "displayOrder": 1,
                                    "createdAt": "2025-01-01T00:00:00",
                                    "updatedAt": "2025-01-25T14:30:00"
                                }
                                """))),
        @ApiResponse(
            responseCode = "400",
            description = "잘못된 요청 데이터",
            content =
                @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(value = "{\"error\": \"이름은 100자 이내로 입력해주세요\"}"))),
        @ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음"),
        @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
        @ApiResponse(responseCode = "403", description = "프로젝트 수정 권한 없음")
      })
  @PutMapping("/{id}")
  @PreAuthorize("@projectSecurityService.canManageProject(#id, authentication.name)")
  public ResponseEntity<ProjectDto> updateProject(
      @Parameter(description = "수정할 프로젝트 ID", required = true, example = "proj-mobile-123")
          @PathVariable
          String id,
      @io.swagger.v3.oas.annotations.parameters.RequestBody(
              description =
                  """
                  **📄 수정할 프로젝트 정보**

                  **수정 가능한 필드:**
                  • **name**: 프로젝트 명 (1-100자)
                  • **description**: 프로젝트 설명 (0-1000자)
                  • **displayOrder**: 정렬 순서 (양수 또는 null)

                  **수정 불가 필드:**
                  • **id**: 시스템 자동 생성 (변경 불가)
                  • **code**: 생성 후 변경 불가
                  • **organizationId**: 별도 API 사용 필요
                  • **createdAt/updatedAt**: 시스템 자동 관리

                  **⚠️ 주의사항:**
                  • 모든 필드는 필수 입력 (null 불가)
                  • 변경되지 않은 필드도 기존 값으로 전송 필요
                  • 빈 문자열(\"\") 사용 금지
                  """,
              required = true,
              content =
                  @Content(
                      mediaType = "application/json",
                      schema = @Schema(implementation = ProjectDto.class),
                      examples =
                          @ExampleObject(
                              name = "프로젝트 수정 예제",
                              value =
                                  """
                                  {
                                      "code": "MOBILE_APP",
                                      "name": "업데이트된 모바일 앱 테스트",
                                      "description": "새로운 기능이 추가된 모바일 애플리케이션 전범위 테스트",
                                      "displayOrder": 2
                                  }
                                  """)))
          @Valid
          @RequestBody
          ProjectDto projectDto,
      Authentication authentication) { // ✅ ProjectDto로 받아야 함

    Project updatedProject = projectService.updateProject(id, projectDto);
    return ResponseEntity.ok(ProjectMapper.toDto(updatedProject));
  }

  /** 프로젝트 삭제 */
  @Operation(
      summary = "프로젝트 삭제",
      description =
          """
          **🗑️ 프로젝트 삭제 및 데이터 정리**

          기존 프로젝트를 안전하게 삭제하여 시스템에서 제거하는 중요한 관리 API입니다.

          **✨ 주요 기능:**
          • **안전 삭제**: 기본적으로 연관 데이터 존재 시 삭제 방지
          • **강제 삭제**: force=true 옵션으로 모든 연관 데이터와 함께 삭제
          • **데이터 백업**: 삭제 전 자동 백업 및 복구 옵션 제공
          • **연관 데이터 정리**: 테스트 케이스, 권한, 멤버십 등 자동 정리

          **📋 사용 시나리오:**
          1. **프로젝트 종료**: 완료된 프로젝트의 정리 및 삭제
          2. **실수 프로젝트**: 잘못 생성된 프로젝트 제거
          3. **리소스 정리**: 시스템 리소스 확보를 위한 미사용 프로젝트 제거
          4. **연관 데이터 정리**: 테스트 데이터 및 사용자 권한 일괄 제거
          5. **조직 개편**: 조직 구조 변경 시 기존 프로젝트 정리

          **🚨 삭제 모드:**

          **기본 삭제 (force=false):**
          • 테스트 케이스가 있으면 삭제 거부 (400 에러)
          • 활성 멤버가 있으면 삭제 거부 (400 에러)
          • 실행 중인 테스트가 있으면 삭제 거부 (400 에러)
          • 빈 프로젝트만 안전하게 삭제

          **강제 삭제 (force=true):**
          • 모든 테스트 케이스 자동 삭제
          • 모든 멤버 권한 자동 제거
          • 실행 중인 테스트 강제 종료 후 삭제
          • 연관된 모든 데이터 완전 제거

          **⚡ 처리 과정:**
          1. 프로젝트 존재 여부 확인
          2. 삭제 권한 검증 (PROJECT_MANAGER 이상)
          3. 연관 데이터 조사 (force 모드에 따라)
          4. 삭제 전 데이터 백업 (옵션)
          5. 연관 데이터 삭제 (force=true인 경우)
          6. 프로젝트 삭제 실행
          7. 감사 로그 상세 기록
          8. 삭제된 프로젝트 정보 반환 (백업용)

          **🔒 보안 및 감사:**
          • 프로젝트 관리 권한 필수 - PROJECT_MANAGER 이상 또는 시스템 관리자
          • 모든 삭제 작업 상세 감사 로그 기록
          • 삭제 사유, 연관 데이터 수, force 모드 사용 여부 기록
          • 복구 가능성을 위한 삭제 전 데이터 상태 스냅샷

          **⚠️ 주의사항:**
          • force=true 사용 시 복구 불가능한 데이터 손실 발생
          • 대용량 프로젝트 삭제 시 시간이 오래 걸릴 수 있음
          • 삭제 중 시스템 장애 시 데이터 불일치 가능성
          • 다른 사용자의 작업 도중 방해 가능성
          """,
      tags = {"Project Management"})
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "프로젝트 삭제 성공",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ProjectDto.class),
                    examples =
                        @ExampleObject(
                            name = "삭제된 프로젝트 정보 예제",
                            value =
                                """
                                {
                                    "id": "proj-deleted-123",
                                    "code": "OLD_PROJECT",
                                    "name": "삭제된 프로젝트",
                                    "description": "종료된 프로젝트 - 이미 삭제됨",
                                    "organizationId": "org-old-team",
                                    "displayOrder": 99,
                                    "createdAt": "2024-01-01T00:00:00",
                                    "updatedAt": "2025-01-25T16:45:00"
                                }
                                """))),
        @ApiResponse(
            responseCode = "400",
            description = "삭제 불가능 - 연관 데이터 존재",
            content =
                @Content(
                    mediaType = "application/json",
                    examples = {
                      @ExampleObject(
                          name = "테스트 케이스 존재 시",
                          value = "{\"error\": \"프로젝트에 테스트 케이스가 존재합니다. force=true 옵션을 사용하세요\"}"),
                      @ExampleObject(
                          name = "활성 멤버 존재 시",
                          value = "{\"error\": \"프로젝트에 활성 멤버가 있습니다. 멤버를 먼저 제거하시기 바랍니다\"}"),
                      @ExampleObject(
                          name = "실행 중인 테스트 존재 시",
                          value = "{\"error\": \"실행 중인 테스트가 있습니다. 테스트 완료 후 삭제하시기 바랍니다\"}")
                    })),
        @ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음"),
        @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
        @ApiResponse(responseCode = "403", description = "프로젝트 삭제 권한 없음")
      })
  @DeleteMapping("/{id}")
  @PreAuthorize("@projectSecurityService.canManageProject(#id, authentication.name)")
  public ResponseEntity<ProjectDto> deleteProject(
      @Parameter(description = "삭제할 프로젝트 ID", required = true, example = "proj-old-123")
          @PathVariable
          String id,
      @Parameter(
              description =
                  """
**🚨 강제 삭제 모드**

• **false (\uae30\ubcf8\uac12)**: \uc548\uc804 \uc0ad\uc81c - \uc5f0\uad00 \ub370\uc774\ud130 \uc874\uc7ac \uc2dc \uc0ad\uc81c \uac70\ubd80
• **true**: \uac15\uc81c \uc0ad\uc81c - \ubaa8\ub4e0 \uc5f0\uad00 \ub370\uc774\ud130\uc640 \ud568\uaed8 \uc644\uc804 \uc0ad\uc81c

**\ud83d\udcc4 \uc5f0\uad00 \ub370\uc774\ud130 \uc608\uc2dc:**
• \ud14c\uc2a4\ud2b8 \ucf00\uc774\uc2a4 \ubc0f \ud14c\uc2a4\ud2b8 \uc2a4\ud15d
• \ud14c\uc2a4\ud2b8 \ud50c\ub79c \ubc0f \ud14c\uc2a4\ud2b8 \uc2e4\ud589 \uacb0\uacfc
• \ud504\ub85c\uc81d\ud2b8 \uba64\ubc84\uc2ed \ubc0f \uad8c\ud55c \uc124\uc815
• \ud504\ub85c\uc81d\ud2b8 \uad00\ub828 \ud30c\uc77c \ubc0f \ucca8\ubd80 \uc790\ub8cc

**\u26a0\ufe0f \uc8fc\uc758\uc0ac\ud56d:**
• force=true \uc0ac\uc6a9 \uc2dc \ubcf5\uad6c \ubd88\uac00\ub2a5\ud55c \ub370\uc774\ud130 \uc190\uc2e4
• \ub300\uc6a9\ub7c9 \ud504\ub85c\uc81d\ud2b8\uc758 \uacbd\uc6b0 \uc0ad\uc81c \uc2dc\uac04 \uc624\ub798 \uc18c\uc694
• \ub2e4\ub978 \uc0ac\uc6a9\uc790\uc758 \uc791\uc5c5 \ub3c4\uc911 \ubc29\ud574 \uac00\ub2a5
""",
              example = "false")
          @RequestParam(value = "force", defaultValue = "false")
          boolean force,
      Authentication authentication) {
    Project deletedProject = projectService.deleteProject(id, force);
    return ResponseEntity.ok(ProjectMapper.toDto(deletedProject));
  }

  // ===== 조직-프로젝트 관리 API =====

  /** 조직별 프로젝트 목록 조회 */
  @Operation(
      summary = "조직별 프로젝트 목록 조회",
      description =
          """
          **🏢 특정 조직 소속 프로젝트 목록 조회**

          특정 조직에 속한 모든 프로젝트의 목록을 조회하는 API입니다.

          **✨ 주요 기능:**
          • **조직 기반 필터링**: 지정된 조직에 속한 프로젝트만 반환
          • **테스트 케이스 통계**: 각 프로젝트별 테스트 케이스 개수 포함
          • **멤버 통계**: 각 프로젝트별 참여 멤버 수 포함
          • **권한 기반 접근**: 조직 멤버만 접근 가능

          **📋 사용 시나리오:**
          1. **조직 대시보드**: 조직 내 모든 프로젝트 현황 파악
          2. **프로젝트 선택**: 조직 내에서 작업할 프로젝트 선택
          3. **리소스 관리**: 조직 내 프로젝트 리소스 분배 현황 확인
          4. **성과 분석**: 조직별 프로젝트 규모 및 활동도 분석

          **🔒 보안 및 권한:**
          • 조직 멤버 권한 필수 - 조직에 속한 사용자만 접근
          • 시스템 관리자는 모든 조직 프로젝트 조회 가능
          • 비멤버는 404 Not Found 응답 (보안상 존재 여부 숨김)
          """,
      tags = {"Project Management"})
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "조직 프로젝트 목록 조회 성공",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ProjectWithTestCaseCountDto.class))),
        @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
        @ApiResponse(responseCode = "403", description = "조직 접근 권한 없음"),
        @ApiResponse(responseCode = "404", description = "조직을 찾을 수 없음")
      })
  @GetMapping("/organization/{organizationId}")
  @PreAuthorize(
      "@organizationSecurityService.isOrganizationMember(#organizationId, authentication.name)")
  public ResponseEntity<List<ProjectWithTestCaseCountDto>> getOrganizationProjects(
      @Parameter(description = "조직 고유 식별자", required = true, example = "org-mobile-team-123")
          @PathVariable
          String organizationId) {
    List<Project> projects = projectService.getOrganizationProjects(organizationId);
    List<ProjectWithTestCaseCountDto> dtos =
        projects.stream()
            .map(
                project -> {
                  long testCaseCount = testCaseRepository.countByProjectId(project.getId());
                  return new ProjectWithTestCaseCountDto(project, testCaseCount);
                })
            .collect(Collectors.toList());
    return ResponseEntity.ok(dtos);
  }

  /** 조직에 새 프로젝트 생성 */
  @Operation(
      summary = "조직에 새 프로젝트 생성",
      description =
          """
          **🆕 조직 소속 새 프로젝트 생성**

          특정 조직 내에 새로운 프로젝트를 생성하는 API입니다.

          **✨ 주요 기능:**
          • **조직 연동**: 생성된 프로젝트는 자동으로 조직에 속함
          • **권한 상속**: 조직 멤버들이 자동으로 프로젝트 접근권 획듹
          • **생성자 권한**: 생성자는 자동으로 PROJECT_MANAGER 권한 획듹
          • **자동 검증**: 프로젝트 이름 중복 및 유효성 검증

          **📋 사용 시나리오:**
          1. **조직 내 신규 프로젝트**: 새로운 제품이나 기능에 대한 테스트 프로젝트
          2. **팀별 프로젝트**: 조직 내 팀별 또는 부서별 프로젝트 분리
          3. **협업 프로젝트**: 여러 조직이 협업하는 프로젝트 생성
          4. **임시 프로젝트**: 빠른 검증을 위한 임시 프로젝트

          **🔒 보안 및 권한:**
          • 조직 접근 권한 필수 - 조직 멤버 (USER, TESTER, MANAGER, ADMIN)
          • 생성자는 자동으로 프로젝트 관리자 권한 획득
          • 조직 설정이 프로젝트에 자동 상속 적용
          """,
      tags = {"Project Management"})
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "201",
            description = "조직 프로젝트 생성 성공",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ProjectDto.class))),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
        @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
        @ApiResponse(responseCode = "403", description = "조직 접근 권한 없음"),
        @ApiResponse(responseCode = "404", description = "조직을 찾을 수 없음")
      })
  @PostMapping("/organization/{organizationId}")
  @PreAuthorize(
      "(hasRole('ADMIN') or hasRole('MANAGER') or hasRole('TESTER') or hasRole('USER')) and"
          + " @organizationSecurityService.canAccessOrganization(#organizationId,"
          + " authentication.name)")
  public ResponseEntity<ProjectDto> createOrganizationProject(
      @Parameter(description = "프로젝트를 생성할 조직 ID", required = true, example = "org-mobile-team-123")
          @PathVariable
          String organizationId,
      @Parameter(
              description = "프로젝트 코드 (2-50자, 영문/숫자/언더스코어/하이픈만 허용)",
              required = true,
              example = "MOBILE_APP_TEST")
          @RequestParam(value = "code", required = false)
          String code,
      @Parameter(description = "프로젝트 명 (1-100자)", required = true, example = "모바일 앱 테스트")
          @RequestParam(value = "name", required = false)
          String name,
      @Parameter(
              description = "프로젝트 설명 (선택사항, 0-1000자)",
              required = false,
              example = "iOS와 Android 모바일 애플리케이션 테스트 프로젝트")
          @RequestParam(value = "description", required = false)
          String description,
      HttpServletRequest request) {

    // 디버깅: 모든 파라미터 값과 요청 정보 출력
    System.out.println("=== createOrganizationProject 호출됨 ===");
    System.out.println("organizationId: " + organizationId);
    System.out.println("@RequestParam code: " + code);
    System.out.println("@RequestParam name: " + name);
    System.out.println("@RequestParam description: " + description);
    System.out.println("Content-Type: " + request.getContentType());
    System.out.println("Method: " + request.getMethod());

    // 모든 요청 파라미터 출력
    System.out.println("=== 모든 요청 파라미터 ===");
    request
        .getParameterMap()
        .forEach(
            (key, values) -> {
              System.out.println(key + ": " + String.join(", ", values));
            });
    System.out.println("=============================");

    // form data에서 직접 파라미터 읽기 (fallback)
    if (code == null) {
      code = request.getParameter("code");
    }
    if (name == null) {
      name = request.getParameter("name");
    }
    if (description == null) {
      description = request.getParameter("description");
    }

    // 필수 파라미터 검증
    if (code == null || code.trim().isEmpty()) {
      throw new IllegalArgumentException("프로젝트 코드는 필수입니다");
    }
    if (name == null || name.trim().isEmpty()) {
      throw new IllegalArgumentException("프로젝트 이름은 필수입니다");
    }

    System.out.println(
        "createOrganizationProject - code: "
            + code
            + ", name: "
            + name
            + ", description: "
            + description); // 디버그
    // 로그

    Project project =
        projectService.createProjectWithCode(
            name.trim(),
            code.trim(),
            description != null ? description.trim() : null,
            organizationId);
    return ResponseEntity.status(HttpStatus.CREATED).body(ProjectMapper.toDto(project));
  }

  /** 프로젝트에 멤버 초대 */
  @Operation(
      summary = "프로젝트 멤버 초대",
      description =
          """
          **👥 프로젝트에 새로운 멤버 초대**

          기존 사용자를 프로젝트 멤버로 초대하고 역할을 부여하는 API입니다.

          **✨ 주요 기능:**
          • **사용자 검증**: 초대할 사용자의 존재 여부 확인
          • **역할 부여**: PROJECT_MANAGER, DEVELOPER, TESTER 등 역할 설정
          • **중복 방지**: 이미 속한 멤버인 경우 오류 반환
          • **자동 알림**: 초대된 사용자에게 알림 전송

          **🏆 프로젝트 역할:**
          • **PROJECT_MANAGER**: 프로젝트 전체 관리 권한
          • **LEAD_DEVELOPER**: 기술 리드, 팀 관리 권한
          • **DEVELOPER**: 개발 권한 (읽기/쓰기)
          • **TESTER**: 테스트 권한 (읽기/쓰기)
          • **CONTRIBUTOR**: 기여자 권한 (읽기/쓰기)
          • **VIEWER**: 읽기 전용 권한

          **🔒 보안 및 권한:**
          • 프로젝트 관리 권한 필수 - PROJECT_MANAGER 이상 또는 시스템 관리자
          • 모든 멤버 초대 작업 감사 로그 자동 기록
          • 초대된 사용자에게 알림 전송
          """,
      tags = {"Project Management"})
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "201",
            description = "멤버 초대 성공",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ProjectUser.class))),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 또는 이미 멤버인 사용자"),
        @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
        @ApiResponse(responseCode = "403", description = "프로젝트 관리 권한 없음"),
        @ApiResponse(responseCode = "404", description = "프로젝트 또는 사용자를 찾을 수 없음")
      })
  @PostMapping("/{projectId}/members")
  @PreAuthorize("@projectSecurityService.hasManagementRole(#projectId, authentication.name)")
  public ResponseEntity<ProjectUser> inviteProjectMember(
      @Parameter(description = "멤버를 초대할 프로젝트 ID", required = true, example = "proj-mobile-123")
          @PathVariable
          String projectId,
      @Parameter(description = "초대할 사용자의 사용자명", required = true, example = "developer1")
          @RequestParam
          String username,
      @Parameter(description = "부여할 프로젝트 내 역할", required = true, example = "DEVELOPER")
          @RequestParam
          ProjectUser.ProjectRole role) {
    ProjectUser member = projectService.inviteMember(projectId, username, role);
    return ResponseEntity.status(HttpStatus.CREATED).body(member);
  }

  /** 프로젝트에서 멤버 제거 */
  @Operation(
      summary = "프로젝트 멤버 제거",
      description =
          """
          **🚫 프로젝트에서 멤버 제거**

          프로젝트에서 특정 멤버를 제거하여 접근 권한을 회수하는 API입니다.

          **✨ 주요 기능:**
          • **안전 제거**: 진행 중인 작업 확인 후 제거
          • **권한 회수**: 모든 프로젝트 접근 권한 즉시 비활성화
          • **자기 제거**: 사용자 자신의 프로젝트 탈퇴 가능
          • **자동 알림**: 제거된 사용자에게 알림 전송

          **📋 사용 시나리오:**
          1. **팀 개편**: 프로젝트 종료 또는 역할 변경 시 멤버 제거
          2. **권한 회수**: 보안 문제 또는 남용 예방을 위한 권한 회수
          3. **자발적 탈퇴**: 사용자가 직접 프로젝트에서 탈퇴
          4. **임시 제거**: 프로젝트 재구성 또는 유지보수 시 임시 제거

          **⚠️ 주의사항:**
          • 마지막 PROJECT_MANAGER 제거 시 경고 메시지
          • 진행 중인 작업이 있는 사용자 제거 시 확인 요구
          • 제거 후 복구 방법 안내

          **🔒 보안 및 권한:**
          • 프로젝트 관리 권한 필수 - PROJECT_MANAGER 이상 또는 시스템 관리자
          • 자신의 계정은 항상 제거 가능 (자발적 탈퇴)
          • 모든 멤버 제거 작업 감사 로그 자동 기록
          """,
      tags = {"Project Management"})
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "204", description = "멤버 제거 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 또는 마지막 관리자 제거 시도"),
        @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
        @ApiResponse(responseCode = "403", description = "멤버 제거 권한 없음"),
        @ApiResponse(responseCode = "404", description = "프로젝트 또는 사용자를 찾을 수 없음")
      })
  @DeleteMapping("/{projectId}/members/{userId}")
  @PreAuthorize(
      "@projectSecurityService.hasManagementRole(#projectId, authentication.name) or"
          + " authentication.name == #userId")
  public ResponseEntity<Void> removeProjectMember(
      @Parameter(description = "멤버를 제거할 프로젝트 ID", required = true, example = "proj-mobile-123")
          @PathVariable
          String projectId,
      @Parameter(description = "제거할 사용자 ID", required = true, example = "user-456") @PathVariable
          String userId) {
    projectService.removeMember(projectId, userId);
    return ResponseEntity.noContent().build();
  }

  /** 프로젝트 멤버 역할 변경 */
  @Operation(
      summary = "프로젝트 멤버 역할 변경",
      description =
          """
          **🔄 프로젝트 멤버의 역할 및 권한 변경**

          기존 프로젝트 멤버의 역할을 변경하여 권한 수준을 조정하는 API입니다.

          **✨ 주요 기능:**
          • **역할 승격**: 일반 멤버를 관리자로 승격
          • **역할 강등**: 관리자를 일반 멤버로 강등
          • **권한 조정**: 업무 변경에 따른 적절한 권한 부여
          • **즉시 적용**: 변경된 권한이 실시간으로 적용

          **📋 사용 시나리오:**
          1. **팀 리더 임명**: DEVELOPER를 PROJECT_MANAGER로 승격
          2. **역할 재조정**: 프로젝트 진행에 따른 역할 재배치
          3. **임시 권한**: 특정 기간 동안 임시 관리 권한 부여
          4. **보안 조치**: 보안상 이유로 권한 축소
          5. **조직 개편**: 조직 변경에 따른 권한 조정

          **🎯 지원하는 역할:**
          • **PROJECT_MANAGER**: 프로젝트 전체 관리 권한
          • **LEAD_DEVELOPER**: 기술 리드 및 팀 관리 권한
          • **DEVELOPER**: 개발 권한 (읽기/쓰기)
          • **TESTER**: 테스트 권한 (읽기/쓰기)
          • **CONTRIBUTOR**: 기여자 권한 (읽기/쓰기)
          • **VIEWER**: 읽기 전용 권한

          **⚠️ 주의사항:**
          • 마지막 PROJECT_MANAGER의 권한을 변경하려 할 때 경고
          • 자신의 권한을 축소할 때 확인 절차 필요
          • 권한 변경 시 기존 작업에 미치는 영향 검토

          **🔒 보안 및 권한:**
          • 프로젝트 관리 권한 필수 - PROJECT_MANAGER 이상 또는 시스템 관리자
          • 모든 역할 변경 작업 감사 로그 자동 기록
          • 변경된 사용자에게 권한 변경 알림 전송
          """,
      tags = {"Project Management"})
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "역할 변경 성공",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ProjectUser.class))),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 또는 유효하지 않은 역할"),
        @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
        @ApiResponse(responseCode = "403", description = "프로젝트 관리 권한 없음"),
        @ApiResponse(responseCode = "404", description = "프로젝트 또는 사용자를 찾을 수 없음"),
        @ApiResponse(responseCode = "409", description = "마지막 PROJECT_MANAGER 권한 변경 시도")
      })
  @PutMapping("/{projectId}/members/{userId}/role")
  @PreAuthorize("@projectSecurityService.hasManagementRole(#projectId, authentication.name)")
  public ResponseEntity<ProjectUser> updateProjectMemberRole(
      @Parameter(description = "역할을 변경할 프로젝트 ID", required = true, example = "proj-mobile-123")
          @PathVariable
          String projectId,
      @Parameter(description = "역할을 변경할 사용자 ID", required = true, example = "user-developer-456")
          @PathVariable
          String userId,
      @Parameter(
              description = "새로 적용할 프로젝트 역할",
              required = true,
              example = "PROJECT_MANAGER",
              schema =
                  @Schema(
                      implementation = ProjectUser.ProjectRole.class,
                      allowableValues = {
                        "PROJECT_MANAGER", "LEAD_DEVELOPER", "DEVELOPER",
                        "TESTER", "CONTRIBUTOR", "VIEWER"
                      }))
          @RequestParam
          ProjectUser.ProjectRole role) {
    ProjectUser member = projectService.updateMemberRole(projectId, userId, role);
    return ResponseEntity.ok(member);
  }

  /** 프로젝트 멤버 목록 조회 */
  @Operation(
      summary = "프로젝트 멤버 목록 조회",
      description =
          """
          **👥 프로젝트 멤버 전체 목록 조회**

          특정 프로젝트에 속한 모든 멤버의 정보와 역할을 조회하는 API입니다.

          **✨ 주요 기능:**
          • **전체 멤버 목록**: 프로젝트에 속한 모든 사용자 정보
          • **역할 정보**: 각 멤버의 프로젝트 내 역할 및 권한
          • **활성 상태**: 멤버의 활성 상태 및 마지막 활동 시간
          • **정렬 및 필터링**: 역할별, 이름순 등 다양한 정렬 옵션

          **📋 사용 시나리오:**
          1. **팀 관리**: 프로젝트 매니저가 팀 구성 현황 파악
          2. **권한 점검**: 각 멤버의 역할 및 권한 수준 확인
          3. **협업 지원**: 팀 내 다른 멤버들의 역할 및 연락처 확인
          4. **작업 배정**: 프로젝트 내 작업 배정 시 멤버 목록 참조
          5. **리포팅**: 프로젝트 참여 인원 통계 및 리포트 생성

          **🔍 응답 데이터:**
          • **사용자 기본 정보**: ID, 사용자명, 이름, 이메일
          • **프로젝트 역할**: PROJECT_MANAGER, DEVELOPER, TESTER 등
          • **상태 정보**: 계정 활성 상태, 마지막 로그인 시간
          • **참여 정보**: 프로젝트 참여 시작일, 역할 변경 이력

          **🔒 보안 및 권한:**
          • 프로젝트 접근 권한 필수 - 프로젝트 멤버 또는 시스템 관리자
          • 개인정보 보호 - 멤버가 아닌 사용자에게는 제한된 정보만 제공
          • 조회 기록 - 멤버 조회 작업 감사 로그 자동 기록
          """,
      tags = {"Project Management"})
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "프로젝트 멤버 목록 조회 성공",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ProjectUser.class))),
        @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
        @ApiResponse(responseCode = "403", description = "프로젝트 접근 권한 없음"),
        @ApiResponse(responseCode = "404", description = "프로젝트를 찾을 수 없음")
      })
  @GetMapping("/{projectId}/members")
  @PreAuthorize("@projectSecurityService.canAccessProject(#projectId, authentication.name)")
  public ResponseEntity<List<ProjectUser>> getProjectMembers(
      @Parameter(description = "멤버 목록을 조회할 프로젝트 ID", required = true, example = "proj-mobile-123")
          @PathVariable
          String projectId) {
    List<ProjectUser> members = projectService.getProjectMembers(projectId);
    return ResponseEntity.ok(members);
  }

  /** 프로젝트를 다른 조직으로 이전 */
  @Operation(
      summary = "프로젝트를 다른 조직으로 이전",
      description =
          """
          **🔄 프로젝트 소유권 및 조직 소속 변경**

          기존 프로젝트를 다른 조직으로 이전하거나 독립 프로젝트로 전환하는 API입니다.

          **✨ 주요 기능:**
          • **조직 간 이전**: 프로젝트를 다른 조직으로 완전 이전
          • **독립 프로젝트 전환**: 조직 소속에서 독립 프로젝트로 전환
          • **권한 재설정**: 이전 후 새로운 조직의 권한 체계 적용
          • **데이터 무결성**: 이전 과정에서 모든 연결 데이터 일관성 보장

          **📋 사용 시나리오:**
          1. **조직 개편**: 회사 조직 개편으로 인한 프로젝트 소속 변경
          2. **프로젝트 이관**: 완료된 프로젝트를 운영 조직으로 이관
          3. **독립 운영**: 특정 프로젝트를 조직에서 분리하여 독립 운영
          4. **협업 변경**: 외부 협업에서 내부 개발로 전환
          5. **권한 재구성**: 프로젝트 권한 체계 전면 재구성

          **🎯 이전 옵션:**
          • **다른 조직으로 이전**: newOrganizationId에 대상 조직 ID 지정
          • **독립 프로젝트 전환**: newOrganizationId를 null 또는 빈 값으로 설정
          • **소유권 유지**: 기존 PROJECT_MANAGER 권한은 그대로 유지

          **⚠️ 중요 주의사항:**
          • 이전 과정에서 프로젝트의 모든 테스트 케이스, 실행 결과는 보존됨
          • 기존 조직의 멤버들은 자동으로 프로젝트 접근 권한을 잃음
          • 새 조직의 멤버들은 조직 권한에 따라 자동으로 프로젝트 접근 권한 획득
          • 이전 작업은 되돌릴 수 없으므로 신중한 검토 필요

          **🔄 이전 프로세스:**
          1. **사전 검증**: 대상 조직 존재 여부 및 권한 확인
          2. **데이터 백업**: 이전 전 현재 상태 스냅샷 생성
          3. **권한 해제**: 기존 조직 멤버들의 프로젝트 접근 권한 해제
          4. **조직 연결**: 새 조직과의 연결 설정
          5. **권한 설정**: 새 조직 권한 체계에 따른 접근 권한 부여
          6. **감사 기록**: 전체 이전 과정 감사 로그 기록

          **🔒 보안 및 권한:**
          • 프로젝트 관리 권한 필수 - PROJECT_MANAGER 이상 또는 시스템 관리자
          • 대상 조직에 대한 적절한 권한 필요 (조직 ADMIN 이상)
          • 모든 이전 작업 상세 감사 로그 자동 기록
          • 이전 완료 후 관련자들에게 알림 전송
          """,
      tags = {"Project Management"})
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "프로젝트 이전 성공",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = ProjectDto.class))),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 또는 유효하지 않은 조직 ID"),
        @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
        @ApiResponse(responseCode = "403", description = "프로젝트 이전 권한 없음 또는 대상 조직 권한 부족"),
        @ApiResponse(responseCode = "404", description = "프로젝트 또는 대상 조직을 찾을 수 없음"),
        @ApiResponse(responseCode = "409", description = "이전할 수 없는 프로젝트 상태 (진행 중인 테스트 등)")
      })
  @PutMapping("/{projectId}/transfer")
  @PreAuthorize("@projectSecurityService.hasManagementRole(#projectId, authentication.name)")
  public ResponseEntity<ProjectDto> transferProject(
      @Parameter(description = "이전할 프로젝트 ID", required = true, example = "proj-mobile-123")
          @PathVariable
          String projectId,
      @Parameter(
              description =
                  """
                  이전 대상 조직 ID

                  **설정 옵션:**
                  • **조직 ID 지정**: 해당 조직으로 프로젝트 이전
                  • **null 또는 빈 값**: 독립 프로젝트로 전환
                  • **기존과 동일한 ID**: 오류 반환 (의미 없는 작업)
                  """,
              required = false,
              example = "org-target-organization-789",
              schema = @Schema(nullable = true))
          @RequestParam(required = false)
          String newOrganizationId) {
    Project project = projectService.transferProject(projectId, newOrganizationId);
    return ResponseEntity.ok(ProjectMapper.toDto(project));
  }
}
