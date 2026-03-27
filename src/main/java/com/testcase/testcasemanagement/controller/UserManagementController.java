// src/main/java/com/testcase/testcasemanagement/controller/UserManagementController.java
package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.UserDto;
import com.testcase.testcasemanagement.service.EmailVerificationService;
import com.testcase.testcasemanagement.service.UserManagementService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * 사용자 관리 API 컨트롤러 (관리자용)
 *
 * <p>시스템 관리자를 위한 종합적인 사용자 관리 기능을 제공합니다. 모든 API는 ADMIN 권한과 JWT 인증이 필요합니다.
 */
@Tag(name = "User Management", description = "사용자 관리 API (관리자 전용)")
@Slf4j
@RestController
@RequestMapping("/api/admin/users")
@SecurityRequirement(name = "bearerAuth")
public class UserManagementController {

  @Autowired private UserManagementService userManagementService;

  @Autowired private EmailVerificationService emailVerificationService;

  /** 사용자 목록 조회 (검색, 정렬, 페이징) */
  @Operation(
      summary = "사용자 목록 조회",
      description =
          """
            **🔍 사용자 목록 조회 및 관리**

            시스템에 등록된 모든 사용자의 목록을 조회하고 관리할 수 있는 핵심 API입니다.

            **✨ 주요 기능:**
            • **고급 검색**: 이름, 사용자명, 이메일을 통한 통합 검색
            • **스마트 필터링**: 역할(ADMIN, MANAGER, TESTER, USER) 및 활성 상태별 필터링
            • **효율적 페이징**: 대량 데이터 처리를 위한 페이지네이션 지원
            • **정렬 기능**: 생성일, 이름, 역할 등 다양한 기준으로 정렬

            **📋 사용 시나리오:**
            1. **전체 사용자 현황 파악**: 필터 없이 전체 목록 조회
            2. **특정 사용자 검색**: keyword로 이름/이메일/사용자명 검색
            3. **역할별 관리**: role 파라미터로 특정 역할 사용자만 조회
            4. **비활성 계정 관리**: isActive=false로 비활성 계정 관리

            **⚡ 성능 최적화:**
            • 기본 페이지 크기: 20개 (최대 100개까지 설정 가능)
            • 인덱싱된 검색 필드로 빠른 응답 속도 보장
            • 데이터베이스 레벨에서 필터링 처리로 네트워크 트래픽 최소화

            **🔒 보안 및 권한:**
            • ADMIN 역할 필수 - 일반 사용자는 접근 불가
            • JWT Bearer Token 인증 필요
            • 민감한 정보(비밀번호 등)는 응답에서 제외
            """,
      tags = {"User Management"})
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "사용자 목록 조회 성공",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = UserDto.ListResponse.class),
                    examples =
                        @ExampleObject(
                            name = "사용자 목록 응답 예제",
                            value =
                                """
                    {
                        "content": [
                            {
                                "id": "user-123",
                                "username": "testuser",
                                "name": "테스트 사용자",
                                "email": "test@example.com",
                                "role": "USER",
                                "isActive": true,
                                "createdAt": "2025-01-01T00:00:00",
                                "lastLoginAt": "2025-01-01T12:00:00"
                            }
                        ],
                        "pageable": {
                            "pageNumber": 0,
                            "pageSize": 20
                        },
                        "totalElements": 1,
                        "totalPages": 1
                    }
                    """))),
        @ApiResponse(
            responseCode = "401",
            description = "인증되지 않은 사용자",
            content =
                @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(value = "{\"error\": \"Unauthorized\"}"))),
        @ApiResponse(
            responseCode = "403",
            description = "관리자 권한 없음",
            content =
                @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(value = "{\"error\": \"Access Denied\"}")))
      })
  @GetMapping
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Page<UserDto.ListResponse>> getUsers(
      @Parameter(
              description =
                  """
                    **🔍 검색 키워드** (선택사항)

                    • **검색 대상**: 사용자명(username), 이름(name), 이메일(email)
                    • **검색 방식**: 부분 일치 (대소문자 구분하지 않음)
                    • **사용 예시**:
                      - "admin" → 사용자명에 admin이 포함된 모든 사용자
                      - "김" → 이름에 김이 포함된 모든 사용자
                      - "@gmail.com" → Gmail 사용자 검색
                    • **빈 값 처리**: null 또는 빈 문자열 시 전체 검색
                    """,
              example = "admin")
          @RequestParam(required = false)
          String keyword,
      @Parameter(
              description =
                  """
                    **👥 역할 필터** (선택사항)

                    • **ADMIN**: 시스템 관리자 (모든 권한)
                    • **MANAGER**: 프로젝트 관리자 (프로젝트 관리 권한)
                    • **TESTER**: 테스터 (테스트 케이스 관리 권한)
                    • **USER**: 일반 사용자 (기본 사용 권한)

                    **⚠️ 주의사항**:
                    • 정확한 역할명을 입력해야 함 (대소문자 구분)
                    • 잘못된 역할명 입력 시 빈 결과 반환
                    """,
              example = "ADMIN")
          @RequestParam(required = false)
          String role,
      @Parameter(
              description =
                  """
                    **🟢 활성 상태 필터** (선택사항)

                    • **true**: 활성 계정만 조회 (로그인 가능한 계정)
                    • **false**: 비활성 계정만 조회 (일시 정지된 계정)
                    • **null**: 모든 계정 조회 (활성/비활성 구분하지 않음)

                    **💡 활용 팁**:
                    • 일반적인 사용자 관리: true 사용
                    • 정지된 계정 관리: false 사용
                    • 전체 현황 파악: 파라미터 생략
                    """,
              example = "true")
          @RequestParam(required = false)
          Boolean isActive,
      @Parameter(
              description =
                  """
                    **📄 페이지 번호** (0부터 시작)

                    • **기본값**: 0 (첫 번째 페이지)
                    • **범위**: 0 이상의 정수
                    • **계산 방법**:
                      - 1페이지: page=0
                      - 2페이지: page=1
                      - n페이지: page=n-1

                    **📊 페이지 정보**: 응답의 pageable 객체에서 확인 가능
                    """,
              example = "0")
          @RequestParam(defaultValue = "0")
          Integer page,
      @Parameter(
              description =
                  """
                    **📋 페이지 크기** (한 페이지당 항목 수)

                    • **기본값**: 20개
                    • **권장 범위**: 10-100개
                    • **최대값**: 100개 (성능상 제한)

                    **⚡ 성능 고려사항**:
                    • 작은 값(10-20): 빠른 응답, 많은 페이지 수
                    • 큰 값(50-100): 느린 응답, 적은 페이지 수
                    • 대량 데이터 처리 시 20-50개 권장
                    """,
              example = "20")
          @RequestParam(defaultValue = "20")
          Integer size,
      Authentication authentication) {

    UserDto.SearchRequest searchRequest = new UserDto.SearchRequest();
    searchRequest.setKeyword(keyword);
    searchRequest.setRole(role);
    searchRequest.setIsActive(isActive);
    searchRequest.setPage(page);
    searchRequest.setSize(size);

    Page<UserDto.ListResponse> users = userManagementService.getUsers(searchRequest);
    return ResponseEntity.ok(users);
  }

  /** 사용자 상세 정보 조회 */
  @Operation(
      summary = "사용자 상세 정보 조회",
      description =
          """
            **👤 개별 사용자 상세 정보 조회**

            특정 사용자의 완전한 프로필 정보를 조회하는 API입니다.

            **✨ 제공 정보:**
            • **기본 정보**: 사용자명, 이름, 이메일 주소
            • **시스템 정보**: 고유 ID, 계정 생성일, 마지막 수정일
            • **권한 정보**: 현재 역할 및 권한 레벨
            • **활동 정보**: 계정 활성 상태, 마지막 로그인 시간

            **📋 사용 시나리오:**
            1. **사용자 프로필 확인**: 관리자가 특정 사용자 정보 확인
            2. **계정 상태 점검**: 활성 상태 및 마지막 활동 확인
            3. **권한 검토**: 현재 역할 및 권한 수준 확인
            4. **수정 전 확인**: 정보 수정 전 현재 상태 파악

            **🔍 응답 데이터:**
            • **완전한 사용자 정보**: 목록 조회보다 더 상세한 정보 제공
            • **타임스탬프**: 생성일, 수정일, 로그인일 등 시간 정보
            • **보안 필터링**: 비밀번호 등 민감 정보는 제외

            **🔒 보안 및 접근 제어:**
            • ADMIN 역할 필수 - 관리자만 다른 사용자 정보 조회 가능
            • 사용자 ID 검증 - 존재하지 않는 사용자 접근 시 404 에러
            • 감사 로그 기록 - 사용자 정보 조회 기록 자동 저장
            """,
      tags = {"User Management"})
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "사용자 정보 조회 성공",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = UserDto.Response.class),
                    examples =
                        @ExampleObject(
                            name = "사용자 상세 응답 예제",
                            value =
                                """
                    {
                        "id": "user-123",
                        "username": "testuser",
                        "name": "테스트 사용자",
                        "email": "test@example.com",
                        "role": "USER",
                        "isActive": true,
                        "createdAt": "2025-01-01T00:00:00",
                        "updatedAt": "2025-01-01T12:00:00",
                        "lastLoginAt": "2025-01-01T12:00:00"
                    }
                    """))),
        @ApiResponse(
            responseCode = "404",
            description = "사용자를 찾을 수 없음",
            content =
                @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(value = "{\"error\": \"User not found\"}"))),
        @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
        @ApiResponse(responseCode = "403", description = "관리자 권한 없음")
      })
  @GetMapping("/{userId}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<UserDto.Response> getUserById(
      @Parameter(
              description =
                  """
                    **🆔 사용자 고유 식별자**

                    • **형식**: UUID 문자열 (예: "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
                    • **필수값**: 반드시 제공되어야 함
                    • **검증**: 시스템에 존재하는 사용자 ID여야 함

                    **💡 사용자 ID 확인 방법**:
                    1. 사용자 목록 조회 API에서 id 필드 확인
                    2. 다른 사용자 관련 API 응답에서 id 필드 사용

                    **⚠️ 주의사항**:
                    • 존재하지 않는 ID 사용 시 404 에러 발생
                    • 잘못된 형식의 ID 사용 시 400 에러 발생
                    • 대소문자를 정확히 입력해야 함
                    """,
              required = true,
              example = "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
          @PathVariable
          String userId,
      Authentication authentication) {

    UserDto.Response user = userManagementService.getUserById(userId);
    return ResponseEntity.ok(user);
  }

  /** 사용자 정보 수정 (관리자용) */
  @Operation(
      summary = "사용자 정보 수정",
      description =
          """
            **✏️ 사용자 기본 정보 수정**

            관리자가 특정 사용자의 기본 프로필 정보를 안전하게 수정할 수 있는 API입니다.

            **✨ 수정 가능한 정보:**
            • **이름(name)**: 사용자의 실제 이름 또는 별명
            • **이메일(email)**: 로그인 및 알림을 위한 이메일 주소

            **🚫 수정 불가능한 정보:**
            • **사용자명(username)**: 시스템 생성 후 변경 불가
            • **비밀번호(password)**: 별도의 비밀번호 변경 API 사용 필요
            • **역할(role)**: 전용 역할 변경 API 사용 필요
            • **활성 상태(isActive)**: 전용 활성화/비활성화 API 사용 필요

            **📋 사용 시나리오:**
            1. **이름 수정**: 결혼, 개명 등으로 인한 이름 변경
            2. **이메일 변경**: 회사 이메일 변경, 개인 이메일 업데이트
            3. **정보 정정**: 잘못 입력된 개인 정보 수정
            4. **프로필 업데이트**: 정기적인 정보 갱신

            **🔍 검증 규칙:**
            • **이름**: 2-50자, 특수문자 제한적 허용
            • **이메일**: 유효한 이메일 형식, 중복 확인
            • **필수 입력**: 모든 필드는 null이 될 수 없음

            **⚡ 처리 과정:**
            1. 입력 데이터 유효성 검증
            2. 이메일 중복 확인 (기존 사용자 제외)
            3. 데이터베이스 업데이트
            4. 감사 로그 자동 기록
            5. 업데이트된 사용자 정보 반환

            **🔒 보안 및 감사:**
            • ADMIN 권한 필수 - 관리자만 수정 가능
            • 수정 내역 감사 로그 자동 저장
            • 업데이트 시간 자동 갱신
            """,
      tags = {"User Management"})
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "사용자 정보 수정 성공",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = UserDto.Response.class))),
        @ApiResponse(
            responseCode = "400",
            description = "잘못된 요청 데이터",
            content =
                @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(value = "{\"error\": \"Invalid request data\"}"))),
        @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음"),
        @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
        @ApiResponse(responseCode = "403", description = "관리자 권한 없음")
      })
  @PutMapping("/{userId}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<UserDto.Response> updateUser(
      @Parameter(
              description =
                  """
                    **🆔 수정할 사용자의 고유 식별자**

                    • **형식**: UUID 문자열
                    • **필수값**: 반드시 제공되어야 함
                    • **검증**: 시스템에 존재하는 활성 사용자여야 함

                    **⚠️ 주의사항**:
                    • 비활성 사용자도 정보 수정 가능
                    • 존재하지 않는 사용자 ID 시 404 에러
                    """,
              required = true,
              example = "a1b2c3d4-e5f6-7890-abcd-ef1234567890")
          @PathVariable
          String userId,
      @io.swagger.v3.oas.annotations.parameters.RequestBody(
              description =
                  """
                    **📝 수정할 사용자 정보**

                    **필수 입력 필드:**
                    • **name**: 사용자 실명 또는 표시명 (2-50자)
                    • **email**: 유효한 이메일 주소 (시스템 내 고유해야 함)

                    **입력 규칙:**
                    • 모든 필드는 필수 입력 (null 불가)
                    • 빈 문자열("")도 허용되지 않음
                    • 이메일은 다른 사용자와 중복될 수 없음
                    • 이름에는 특수문자 사용 제한

                    **검증 실패 시:**
                    • 400 Bad Request 응답
                    • 구체적인 오류 메시지 제공
                    """,
              required = true,
              content =
                  @Content(
                      mediaType = "application/json",
                      schema = @Schema(implementation = UserDto.UpdateRequest.class),
                      examples = {
                        @ExampleObject(
                            name = "일반적인 정보 수정",
                            value =
                                """
                            {
                                "name": "김철수",
                                "email": "chulsoo.kim@company.com"
                            }
                            """),
                        @ExampleObject(
                            name = "이메일만 변경",
                            value =
                                """
                            {
                                "name": "기존사용자명",
                                "email": "newemail@example.com"
                            }
                            """),
                        @ExampleObject(
                            name = "이름만 변경",
                            value =
                                """
                            {
                                "name": "새로운이름",
                                "email": "existing@example.com"
                            }
                            """)
                      }))
          @Valid
          @RequestBody
          UserDto.UpdateRequest updateRequest,
      Authentication authentication) {

    UserDto.Response updatedUser = userManagementService.updateUser(userId, updateRequest);
    return ResponseEntity.ok(updatedUser);
  }

  /** 사용자 계정 활성화 */
  @Operation(
      summary = "사용자 계정 활성화",
      description =
          """
            **🟢 사용자 계정 활성화**

            비활성화된 사용자 계정을 다시 활성화하여 로그인 및 시스템 사용을 가능하게 하는 API입니다.

            **✨ 활성화 효과:**
            • **로그인 허용**: 사용자가 다시 로그인할 수 있게 됨
            • **API 접근 복원**: 모든 API 호출 권한 복구
            • **알림 재개**: 이메일 등 시스템 알림 수신 재개
            • **데이터 접근**: 기존 데이터 및 권한 완전 복구

            **📋 사용 시나리오:**
            1. **임시 정지 해제**: 정책 위반으로 일시 정지된 계정 복구
            2. **휴면 계정 복원**: 장기 미사용 계정 재활성화
            3. **퇴사자 복귀**: 재입사 또는 계약 연장 시 계정 복구
            4. **실수 복구**: 잘못 비활성화된 계정 즉시 복구

            **⚡ 처리 과정:**
            1. 사용자 존재 여부 확인
            2. 현재 활성 상태 검증 (이미 활성인 경우 무시)
            3. isActive 필드를 true로 설정
            4. updatedAt 시간 갱신
            5. 감사 로그 기록 (활성화 사유 포함)
            6. 업데이트된 사용자 정보 반환

            **🔒 보안 및 감사:**
            • ADMIN 권한 필수 - 관리자만 계정 활성화 가능
            • 모든 활성화 작업 감사 로그 기록
            • 활성화 시점 자동 기록
            • 즉시 효력 발생 - 별도 승인 절차 없음

            **💡 참고사항:**
            • 이미 활성화된 계정에 대해서도 안전하게 호출 가능
            • 사용자의 기존 역할 및 권한은 그대로 유지
            • 비밀번호 등 인증 정보는 변경되지 않음
            """,
      tags = {"User Management"})
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "계정 활성화 성공",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = UserDto.Response.class),
                    examples =
                        @ExampleObject(
                            name = "계정 활성화 응답 예제",
                            value =
                                """
                    {
                        "id": "user-123",
                        "username": "testuser",
                        "name": "테스트 사용자",
                        "email": "test@example.com",
                        "role": "USER",
                        "isActive": true,
                        "createdAt": "2025-01-01T00:00:00",
                        "updatedAt": "2025-01-01T14:00:00"
                    }
                    """))),
        @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음"),
        @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
        @ApiResponse(responseCode = "403", description = "관리자 권한 없음")
      })
  @PostMapping("/{userId}/activate")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<UserDto.Response> activateUser(
      @Parameter(description = "활성화할 사용자 ID", required = true, example = "user-123") @PathVariable
          String userId,
      Authentication authentication) {

    UserDto.Response user = userManagementService.activateUser(userId);
    return ResponseEntity.ok(user);
  }

  /** 사용자 계정 비활성화 */
  @Operation(
      summary = "사용자 계정 비활성화",
      description =
          """
            **🔴 사용자 계정 비활성화**

            활성화된 사용자 계정을 비활성화하여 로그인 및 시스템 접근을 차단하는 API입니다.

            **⛔ 비활성화 효과:**
            • **로그인 차단**: 사용자가 더 이상 로그인할 수 없음
            • **API 접근 차단**: 모든 인증 필요 API 호출 불가
            • **세션 무효화**: 기존 로그인 세션 즉시 만료
            • **알림 중단**: 시스템 알림 발송 중단

            **💾 데이터 보존:**
            • **사용자 데이터**: 모든 기존 데이터는 그대로 보존
            • **권한 정보**: 역할 및 권한 설정 유지 (활성화 시 복구됨)
            • **이력 정보**: 생성일, 수정일 등 모든 이력 보존

            **📋 사용 시나리오:**
            1. **퇴사 처리**: 퇴사자 계정 임시 비활성화
            2. **정책 위반**: 서비스 이용 약관 위반 시 계정 정지
            3. **보안 문제**: 계정 탈취 의심 시 긴급 차단
            4. **장기 미사용**: 휴면 계정 관리 정책에 따른 비활성화
            5. **관리적 조치**: 기타 관리상 필요에 의한 계정 정지

            **📝 비활성화 사유 기록:**
            • **선택적 입력**: reason 필드로 비활성화 사유 기록 가능
            • **감사 목적**: 나중에 계정 관리 이력 추적을 위한 참고 자료
            • **정책 준수**: 내부 정책 및 규정 준수를 위한 근거 자료

            **⚡ 처리 과정:**
            1. 사용자 존재 여부 확인
            2. 현재 활성 상태 검증 (이미 비활성인 경우 무시)
            3. isActive 필드를 false로 설정
            4. 비활성화 사유 기록 (제공된 경우)
            5. updatedAt 시간 갱신
            6. 감사 로그 상세 기록
            7. 기존 JWT 토큰 무효화 (보안)
            8. 업데이트된 사용자 정보 반환

            **🔒 보안 및 감사:**
            • ADMIN 권한 필수 - 관리자만 계정 비활성화 가능
            • 모든 비활성화 작업 상세 감사 로그 기록
            • 비활성화 시점 및 사유 자동 기록
            • 즉시 효력 발생 - 기존 세션 강제 종료

            **⚠️ 주의사항:**
            • 비활성화된 계정도 관리자는 정보 조회/수정 가능
            • 데이터 삭제가 아닌 접근 차단이므로 언제든 활성화 가능
            • 본인 계정 비활성화는 권장하지 않음 (관리자 접근 불가 위험)
            """,
      tags = {"User Management"})
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "계정 비활성화 성공",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = UserDto.Response.class),
                    examples =
                        @ExampleObject(
                            name = "계정 비활성화 응답 예제",
                            value =
                                """
                    {
                        "id": "user-123",
                        "username": "testuser",
                        "name": "테스트 사용자",
                        "email": "test@example.com",
                        "role": "USER",
                        "isActive": false,
                        "createdAt": "2025-01-01T00:00:00",
                        "updatedAt": "2025-01-01T14:00:00"
                    }
                    """))),
        @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음"),
        @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
        @ApiResponse(responseCode = "403", description = "관리자 권한 없음")
      })
  @PostMapping("/{userId}/deactivate")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<UserDto.Response> deactivateUser(
      @Parameter(description = "비활성화할 사용자 ID", required = true, example = "user-123") @PathVariable
          String userId,
      @io.swagger.v3.oas.annotations.parameters.RequestBody(
              description = "비활성화 사유 (선택사항)",
              required = false,
              content =
                  @Content(
                      mediaType = "application/json",
                      schema = @Schema(implementation = UserDto.ActivationRequest.class),
                      examples =
                          @ExampleObject(
                              name = "비활성화 요청 예제",
                              value =
                                  """
                    {
                        "reason": "장기 미사용으로 인한 계정 비활성화"
                    }
                    """)))
          @Valid
          @RequestBody(required = false)
          UserDto.ActivationRequest activationRequest,
      Authentication authentication) {

    String reason = activationRequest != null ? activationRequest.getReason() : null;
    UserDto.Response user = userManagementService.deactivateUser(userId, reason);
    return ResponseEntity.ok(user);
  }

  /** 사용자 역할 변경 */
  @Operation(
      summary = "사용자 역할 변경",
      description =
          """
            **👥 사용자 역할 및 권한 변경**

            특정 사용자의 시스템 역할을 변경하여 접근 권한을 조정하는 중요한 관리 API입니다.

            **🎭 지원되는 역할:**

            **🔴 ADMIN (시스템 관리자)**
            • 모든 시스템 기능 접근 가능
            • 사용자 관리 (생성, 수정, 삭제, 역할 변경)
            • 시스템 설정 및 구성 관리
            • 감사 로그 조회 및 관리
            • 최고 권한 - 신중한 부여 필요

            **🟠 MANAGER (프로젝트 관리자)**
            • 프로젝트 생성, 수정, 삭제
            • 프로젝트 멤버 관리
            • 테스트 계획 수립 및 관리
            • 팀 리소스 할당 및 관리
            • 프로젝트 보고서 생성

            **🟡 TESTER (테스터)**
            • 테스트 케이스 작성 및 실행
            • 테스트 결과 기록 및 보고
            • 버그 리포트 생성
            • 할당된 프로젝트 내 테스트 관리
            • 테스트 데이터 관리

            **🟢 USER (일반 사용자)**
            • 기본적인 시스템 사용
            • 할당된 작업 수행
            • 개인 프로필 관리
            • 읽기 전용 대시보드 접근
            • 제한적인 데이터 접근

            **📋 역할 변경 시나리오:**
            1. **승진/직책 변경**: USER → TESTER → MANAGER → ADMIN
            2. **임시 권한 부여**: 특정 작업을 위한 일시적 권한 상승
            3. **권한 회수**: 보안 문제 또는 퇴사 시 권한 축소
            4. **조직 개편**: 부서 이동에 따른 역할 재조정
            5. **프로젝트 할당**: 특정 프로젝트 참여를 위한 역할 조정

            **⚡ 처리 과정:**
            1. 대상 사용자 존재 여부 확인
            2. 새로운 역할 유효성 검증
            3. 현재 역할과 비교 (동일한 경우 무시)
            4. 역할 변경 사유 기록 (선택사항)
            5. 사용자 역할 업데이트
            6. 기존 JWT 토큰 무효화 (권한 변경 반영)
            7. 감사 로그 상세 기록
            8. 업데이트된 사용자 정보 반환

            **🔒 보안 및 감사:**
            • ADMIN 권한 필수 - 최고 관리자만 역할 변경 가능
            • 모든 역할 변경 작업 상세 감사 로그 기록
            • 변경 전후 역할, 변경 사유, 시점 모두 기록
            • 즉시 효력 발생 - 기존 세션 권한 갱신

            **⚠️ 주의사항:**
            • ADMIN 역할 부여는 매우 신중하게 결정해야 함
            • 본인 역할 변경 시 주의 (권한 상실 위험)
            • 역할 변경 시 기존 세션은 자동으로 갱신됨
            • 잘못된 역할 부여 시 보안 문제 발생 가능

            **📝 변경 사유 기록:**
            • 조직 내 규정 준수를 위한 근거 자료
            • 향후 감사 및 추적을 위한 참고 정보
            • 역할 변경 히스토리 관리
            """,
      tags = {"User Management"})
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "역할 변경 성공",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = UserDto.Response.class),
                    examples =
                        @ExampleObject(
                            name = "역할 변경 응답 예제",
                            value =
                                """
                    {
                        "id": "user-123",
                        "username": "testuser",
                        "name": "테스트 사용자",
                        "email": "test@example.com",
                        "role": "MANAGER",
                        "isActive": true,
                        "createdAt": "2025-01-01T00:00:00",
                        "updatedAt": "2025-01-01T14:00:00"
                    }
                    """))),
        @ApiResponse(
            responseCode = "400",
            description = "잘못된 역할 값",
            content =
                @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(value = "{\"error\": \"Invalid role\"}"))),
        @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음"),
        @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
        @ApiResponse(responseCode = "403", description = "관리자 권한 없음")
      })
  @PutMapping("/{userId}/role")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<UserDto.Response> changeUserRole(
      @Parameter(description = "역할을 변경할 사용자 ID", required = true, example = "user-123")
          @PathVariable
          String userId,
      @io.swagger.v3.oas.annotations.parameters.RequestBody(
              description = "변경할 역할 정보",
              required = true,
              content =
                  @Content(
                      mediaType = "application/json",
                      schema = @Schema(implementation = UserDto.ChangeRoleRequest.class),
                      examples =
                          @ExampleObject(
                              name = "역할 변경 요청 예제",
                              value =
                                  """
                    {
                        "role": "MANAGER",
                        "reason": "프로젝트 관리 업무 담당으로 역할 변경"
                    }
                    """)))
          @Valid
          @RequestBody
          UserDto.ChangeRoleRequest roleRequest,
      Authentication authentication) {

    UserDto.Response user = userManagementService.changeUserRole(userId, roleRequest);
    return ResponseEntity.ok(user);
  }

  /** 사용자 비밀번호 변경 (관리자용) */
  @Operation(
      summary = "사용자 비밀번호 변경 (관리자용)",
      description =
          """
            **🔐 관리자용 사용자 비밀번호 변경**

            시스템 관리자가 특정 사용자의 비밀번호를 변경할 수 있는 API입니다.

            **✨ 주요 특징:**
            • **관리자 권한 필수**: ADMIN 역할만 사용 가능
            • **강력한 비밀번호 정책**: 최소 8자, 영문/숫자/특수문자 중 2가지 이상
            • **보안 감사**: 모든 비밀번호 변경 이력 자동 기록
            • **즉시 적용**: 변경 즉시 효력 발생

            **📋 사용 시나리오:**
            1. **계정 복구**: 사용자가 비밀번호를 분실한 경우
            2. **보안 강화**: 보안 정책에 따른 강제 비밀번호 변경
            3. **계정 초기화**: 신규 사용자 계정 초기 설정
            4. **비상 조치**: 계정 탈취 의심 시 긴급 비밀번호 변경

            **🔒 비밀번호 정책:**
            • **최소 길이**: 8자 이상
            • **최대 길이**: 100자 이하
            • **복잡도**: 영문, 숫자, 특수문자 중 최소 2가지 포함
            • **특수문자**: !@#$%^&*()_+-=[]{};\':"|,./<>? 등

            **⚡ 처리 과정:**
            1. 관리자 권한 확인
            2. 대상 사용자 존재 여부 확인
            3. 새 비밀번호 유효성 검증
            4. 비밀번호 암호화 및 저장
            5. 감사 로그 자동 기록
            6. 기존 세션 유지 (로그아웃되지 않음)

            **🚨 보안 고려사항:**
            • 현재 비밀번호 확인은 선택사항 (관리자 권한으로 재설정 가능)
            • 모든 변경 이력 감사 로그에 기록
            • 비밀번호는 응답에 포함되지 않음
            • bcrypt 해시 알고리즘 사용
            """,
      tags = {"User Management"})
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "비밀번호 변경 성공",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = UserDto.Response.class))),
        @ApiResponse(
            responseCode = "400",
            description = "잘못된 비밀번호 형식",
            content =
                @Content(
                    mediaType = "application/json",
                    examples = @ExampleObject(value = "{\"error\": \"비밀번호는 최소 8자 이상이어야 합니다.\"}"))),
        @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음"),
        @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
        @ApiResponse(responseCode = "403", description = "관리자 권한 없음")
      })
  @PutMapping("/{userId}/password")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<UserDto.Response> changeUserPassword(
      @Parameter(description = "비밀번호를 변경할 사용자 ID", required = true, example = "user-123")
          @PathVariable
          String userId,
      @io.swagger.v3.oas.annotations.parameters.RequestBody(
              description = "새로운 비밀번호 정보",
              required = true,
              content =
                  @Content(
                      mediaType = "application/json",
                      schema = @Schema(implementation = UserDto.ChangePasswordRequest.class),
                      examples =
                          @ExampleObject(
                              name = "비밀번호 변경 요청 예제",
                              value =
                                  """
                    {
                        "currentPassword": "oldPassword123!",
                        "newPassword": "newSecurePassword456@"
                    }
                    """)))
          @Valid
          @RequestBody
          UserDto.ChangePasswordRequest passwordRequest,
      Authentication authentication) {

    UserDto.Response user = userManagementService.changeUserPassword(userId, passwordRequest);
    return ResponseEntity.ok(user);
  }

  /** 사용자 통계 조회 */
  @Operation(
      summary = "사용자 통계 조회",
      description =
          """
            **📊 시스템 사용자 통계 및 현황 분석**

            시스템의 전체 사용자 현황을 한눈에 파악할 수 있는 종합적인 통계 정보를 제공하는 API입니다.

            **📈 제공되는 통계 정보:**

            **🔢 기본 통계**
            • **총 사용자 수 (totalUsers)**: 시스템에 등록된 모든 사용자
            • **활성 사용자 수 (activeUsers)**: 현재 로그인 가능한 사용자
            • **비활성 사용자 수 (inactiveUsers)**: 일시정지 또는 비활성화된 사용자
            • **최근 등록 사용자 (recentRegistrations)**: 지난 30일 내 신규 가입자

            **👥 역할별 분포 (roleDistribution)**
            • **ADMIN**: 시스템 관리자 수
            • **MANAGER**: 프로젝트 관리자 수
            • **TESTER**: 테스터 수
            • **USER**: 일반 사용자 수

            **📋 활용 시나리오:**
            1. **대시보드 표시**: 관리자 대시보드의 핵심 지표
            2. **용량 계획**: 시스템 리소스 및 라이선스 계획 수립
            3. **조직 분석**: 역할별 인력 분포 현황 파악
            4. **성장 추적**: 사용자 증가 트렌드 모니터링
            5. **보안 점검**: 비활성 계정 관리 현황 확인
            6. **정기 보고**: 월간/분기별 사용자 현황 보고서

            **📊 데이터 특성:**
            • **실시간 집계**: 호출 시점의 최신 데이터 제공
            • **캐시 최적화**: 자주 조회되는 통계는 캐시 활용
            • **높은 정확도**: 데이터베이스 직접 집계로 정확성 보장
            • **빠른 응답**: 최적화된 쿼리로 빠른 응답 속도

            **⚡ 성능 최적화:**
            • 인덱스 활용으로 빠른 집계 처리
            • 필요시 백그라운드 캐시 갱신
            • 대용량 데이터에서도 안정적인 성능

            **🕐 응답 시간:**
            • 일반적인 환경: 100-200ms
            • 대용량 환경 (10만+ 사용자): 500ms 이내
            • 캐시 히트 시: 50ms 이내

            **📅 통계 기준:**
            • **최근 등록**: 지난 30일 기준
            • **활성/비활성**: isActive 필드 기준
            • **역할 분포**: 현재 시점 역할 기준
            • **생성 시점**: generatedAt 필드로 통계 생성 시간 제공

            **🔒 보안 및 접근 제어:**
            • ADMIN 권한 필수 - 민감한 조직 정보 포함
            • 개인정보는 포함하지 않음 (순수 집계 데이터만)
            • 감사 로그 기록 - 통계 조회 이력 추적

            **💡 활용 팁:**
            • 정기적으로 조회하여 트렌드 모니터링
            • 급격한 변화 감지 시 보안 점검 실시
            • 역할 분포 불균형 시 조직 구조 검토
            • 비활성 사용자 증가 시 정책 검토
            """,
      tags = {"User Management"})
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "사용자 통계 조회 성공",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = UserDto.StatisticsResponse.class),
                    examples =
                        @ExampleObject(
                            name = "사용자 통계 응답 예제",
                            value =
                                """
                    {
                        "totalUsers": 150,
                        "activeUsers": 135,
                        "inactiveUsers": 15,
                        "roleDistribution": {
                            "ADMIN": 5,
                            "MANAGER": 15,
                            "TESTER": 50,
                            "USER": 80
                        },
                        "recentRegistrations": 8,
                        "generatedAt": "2025-01-01T14:00:00"
                    }
                    """))),
        @ApiResponse(responseCode = "401", description = "인증되지 않은 사용자"),
        @ApiResponse(responseCode = "403", description = "관리자 권한 없음")
      })
  @GetMapping("/statistics")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<UserDto.StatisticsResponse> getUserStatistics(
      Authentication authentication) {

    UserDto.StatisticsResponse statistics = userManagementService.getUserStatistics();
    return ResponseEntity.ok(statistics);
  }

  /**
   * 사용자에게 이메일 인증 발송 (관리자용)
   *
   * @param userId 인증 이메일을 보낼 사용자 ID
   * @param authentication 인증 정보
   * @return 발송 결과
   */
  @PostMapping("/{userId}/send-verification-email")
  @Operation(summary = "사용자 이메일 인증 발송", description = "관리자가 특정 사용자에게 이메일 인증 메일을 발송합니다.")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "이메일 발송 성공"),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 (메일 설정 비활성화 등)"),
        @ApiResponse(responseCode = "403", description = "권한 없음 (ADMIN이 아님)"),
        @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음")
      })
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<?> sendVerificationEmail(
      @Parameter(description = "인증 이메일을 보낼 사용자 ID", required = true) @PathVariable String userId,
      Authentication authentication,
      jakarta.servlet.http.HttpServletRequest request) {

    log.info("Admin {} sending verification email to user: {}", authentication.getName(), userId);

    try {
      UserDto.Response userDto = userManagementService.getUserById(userId);
      if (userDto == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("message", "사용자를 찾을 수 없습니다."));
      }

      // Extract base URL from request
      String baseUrl =
          request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();

      var result =
          emailVerificationService.createVerificationToken(userId, userDto.getEmail(), baseUrl);

      if (result.isSuccess()) {
        return ResponseEntity.ok(result);
      } else {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
      }

    } catch (Exception e) {
      log.error("Failed to send verification email", e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("message", "이메일 발송 중 오류가 발생했습니다."));
    }
  }
}
