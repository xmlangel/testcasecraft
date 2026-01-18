// src/main/java/com/testcase/testcasemanagement/controller/UserActivityController.java
package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.UserActivityDto;
import com.testcase.testcasemanagement.model.UserActivity;
import com.testcase.testcasemanagement.service.UserActivityService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 사용자 활동 이력 추적 API 컨트롤러
 * 
 * 사용자 활동 모니터링, 보안 감시, 사용자 지원을 위한 활동 이력 관리 API를 제공합니다.
 */
@Tag(name = "User - Activity Log", description = "사용자 활동 로그 API")
@RestController
@RequestMapping("/api/admin/activities")
@SecurityRequirement(name = "bearerAuth")
public class UserActivityController {

    @Autowired
    private UserActivityService userActivityService;

    /**
     * 사용자 활동 이력 조회
     */
    @Operation(summary = "사용자 활동 이력 조회", description = """
            **특정 사용자의 활동 이력을 페이지네이션으로 조회합니다.**

            **권한 확인:**
            • 본인의 활동 이력은 누구나 조회 가능
            • 다른 사용자의 활동 이력은 시스템 관리자만 조회 가능

            **활동 정보 포함:**
            • 활동 타입, 카테고리, 대상 엔티티
            • 세션 정보, IP 주소, 사용자 에이전트
            • 성공/실패 여부, 위험도 점수
            • 이상 활동 감지 여부

            **정렬:** 최신 활동부터 시간 역순으로 정렬
            """)
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "활동 이력 조회 성공", content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserActivityDto.Response.class), examples = @ExampleObject(value = """
                    {
                      "content": [
                        {
                          "id": "act-123",
                          "userId": "user-456",
                          "username": "admin",
                          "userFullName": "관리자",
                          "activityType": "PROJECT_ACCESS",
                          "activityTypeDescription": "프로젝트 접근",
                          "activityCategory": "PROJECT_MANAGEMENT",
                          "activityCategoryDescription": "프로젝트 관리",
                          "targetEntityType": "PROJECT",
                          "targetEntityId": "proj-789",
                          "targetEntityName": "테스트 관리 프로젝트",
                          "sessionId": "session-abc",
                          "ipAddress": "192.168.1.100",
                          "userAgent": "Mozilla/5.0...",
                          "isSuccessful": true,
                          "riskScore": 15,
                          "riskLevel": "LOW",
                          "anomalyDetected": false,
                          "timestamp": "2025-01-15T10:30:00"
                        }
                      ],
                      "totalElements": 150,
                      "totalPages": 15,
                      "size": 10,
                      "number": 0
                    }
                    """))),
            @ApiResponse(responseCode = "403", description = "권한 없음 - 다른 사용자의 활동 이력 조회 시도"),
            @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음")
    })
    @GetMapping("/users/{userId}")
    @PreAuthorize("@userActivityService.canAccessUserActivities(#userId, authentication.name)")
    public ResponseEntity<Page<UserActivityDto.Response>> getUserActivities(
            @Parameter(description = "사용자 ID", required = true) @PathVariable String userId,
            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기", example = "20") @RequestParam(defaultValue = "20") int size) {

        Page<UserActivity> activities = userActivityService.getUserActivities(userId, page, size);
        Page<UserActivityDto.Response> response = activities.map(this::convertToDto);

        return ResponseEntity.ok(response);
    }

    /**
     * 사용자 활동 통계 조회
     */
    @Operation(summary = "사용자 활동 통계 조회", description = """
            **특정 사용자의 활동 통계를 조회합니다.**

            **통계 정보:**
            • 전체/성공/실패 활동 수
            • 세션 통계 및 평균 지속 시간
            • 활동 타입별, 카테고리별 통계
            • 일별, 시간대별 활동 패턴
            • 위험도 및 이상 활동 통계
            • 최근 로그인 정보

            **기간 설정:** 시작일과 종료일을 지정하여 특정 기간의 통계 조회 가능
            """)
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "활동 통계 조회 성공", content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserActivityDto.StatisticsResponse.class), examples = @ExampleObject(value = """
                    {
                      "userId": "user-456",
                      "username": "admin",
                      "userFullName": "관리자",
                      "totalActivities": 1250,
                      "successfulActivities": 1180,
                      "failedActivities": 70,
                      "distinctSessions": 45,
                      "averageSessionDurationMinutes": 85.5,
                      "averageRiskScore": 18,
                      "anomalousActivities": 3,
                      "lastActivityTime": "2025-01-15T14:30:00",
                      "lastLoginTime": "2025-01-15T09:00:00",
                      "lastLoginIp": "192.168.1.100",
                      "activityTypeStatistics": {
                        "LOGIN": 45,
                        "PROJECT_ACCESS": 320,
                        "TESTCASE_VIEW": 850
                      },
                      "activityCategoryStatistics": {
                        "AUTHENTICATION": 90,
                        "PROJECT_MANAGEMENT": 400,
                        "TEST_MANAGEMENT": 760
                      }
                    }
                    """))),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "사용자를 찾을 수 없음")
    })
    @GetMapping("/users/{userId}/statistics")
    @PreAuthorize("@userActivityService.canAccessUserActivities(#userId, authentication.name)")
    public ResponseEntity<UserActivityDto.StatisticsResponse> getUserActivityStatistics(
            @Parameter(description = "사용자 ID", required = true) @PathVariable String userId,
            @Parameter(description = "통계 시작일", example = "2025-01-01T00:00:00") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @Parameter(description = "통계 종료일", example = "2025-01-31T23:59:59") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {

        // 기본값 설정: 최근 30일
        if (startDate == null) {
            startDate = LocalDateTime.now().minusDays(30);
        }
        if (endDate == null) {
            endDate = LocalDateTime.now();
        }

        Map<String, Object> statistics = userActivityService.getUserActivityStatistics(userId, startDate, endDate);
        UserActivityDto.StatisticsResponse response = convertToStatisticsDto(statistics, userId, startDate, endDate);

        return ResponseEntity.ok(response);
    }

    /**
     * 전체 활동 이력 조회 (관리자 전용)
     */
    @Operation(summary = "전체 활동 이력 조회", description = """
            **시스템 내 모든 사용자의 활동 이력을 조회합니다.**

            **⚠️ 관리자 전용 기능**
            • 시스템 관리자 권한 필수
            • 모든 사용자의 활동을 통합 조회
            • 시스템 전체 모니터링 및 감사를 위한 기능

            **정렬:** 최신 활동부터 시간 역순으로 정렬
            **페이지네이션:** 대용량 데이터 처리를 위한 페이징 지원
            """)
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "전체 활동 이력 조회 성공"),
            @ApiResponse(responseCode = "403", description = "권한 없음 - 관리자 권한 필요")
    })
    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or @securityContextUtil.isSystemAdmin()")
    public ResponseEntity<Page<UserActivityDto.Response>> getAllActivities(
            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기", example = "50") @RequestParam(defaultValue = "50") int size) {

        Page<UserActivity> activities = userActivityService.getAllActivities(page, size);
        Page<UserActivityDto.Response> response = activities.map(this::convertToDto);

        return ResponseEntity.ok(response);
    }

    /**
     * 활동 검색 (관리자 전용)
     */
    @Operation(summary = "활동 검색", description = """
            **키워드로 활동 이력을 검색합니다.**

            **검색 대상:**
            • 활동 타입, 카테고리
            • 대상 엔티티 이름
            • 활동 상세 정보
            • 사용자명

            **⚠️ 관리자 전용 기능**
            """)
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "활동 검색 성공"),
            @ApiResponse(responseCode = "403", description = "권한 없음 - 관리자 권한 필요")
    })
    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or @securityContextUtil.isSystemAdmin()")
    public ResponseEntity<Page<UserActivityDto.Response>> searchActivities(
            @Parameter(description = "검색 키워드", example = "로그인") @RequestParam String keyword,
            @Parameter(description = "페이지 번호 (0부터 시작)", example = "0") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "페이지 크기", example = "20") @RequestParam(defaultValue = "20") int size) {

        Page<UserActivity> activities = userActivityService.searchActivities(keyword, page, size);
        Page<UserActivityDto.Response> response = activities.map(this::convertToDto);

        return ResponseEntity.ok(response);
    }

    /**
     * 이상 활동 조회
     */
    @Operation(summary = "이상 활동 조회", description = """
            **이상 행동으로 감지된 활동들을 조회합니다.**

            **이상 활동 감지 기준:**
            • 고위험 점수 (70점 이상)
            • 짧은 시간 내 다수 로그인 실패
            • 비정상적인 접근 패턴
            • 의심스러운 IP 또는 User Agent

            **권한:**
            • 본인의 이상 활동: 누구나 조회 가능
            • 전체 이상 활동: 관리자만 조회 가능
            """)
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "이상 활동 조회 성공", content = @Content(mediaType = "application/json", examples = @ExampleObject(value = """
                    [
                      {
                        "id": "act-anomaly-123",
                        "userId": "user-456",
                        "username": "admin",
                        "activityType": "LOGIN_FAILED",
                        "activityCategory": "AUTHENTICATION",
                        "riskScore": 85,
                        "riskLevel": "HIGH",
                        "anomalyDetected": true,
                        "ipAddress": "203.0.113.45",
                        "errorMessage": "잘못된 비밀번호",
                        "timestamp": "2025-01-15T02:30:00"
                      }
                    ]
                    """))),
            @ApiResponse(responseCode = "403", description = "권한 없음")
    })
    @GetMapping("/anomalies")
    public ResponseEntity<List<UserActivityDto.Response>> getAnomalousActivities(
            @Parameter(description = "사용자 ID (선택사항, 관리자는 전체 조회 가능)") @RequestParam(required = false) String userId,
            Authentication authentication) {

        List<UserActivity> anomalies = userActivityService.getAnomalousActivities(userId);
        List<UserActivityDto.Response> response = anomalies.stream()
                .map(this::convertToDto)
                .toList();

        return ResponseEntity.ok(response);
    }

    /**
     * 활동 상세 정보 조회
     */
    @Operation(summary = "활동 상세 정보 조회", description = """
            **특정 활동의 상세 정보를 조회합니다.**

            **포함 정보:**
            • 모든 활동 메타데이터
            • 세션 정보 및 기술적 세부사항
            • 위험도 분석 결과
            • 이상 활동 감지 상세 정보

            **권한:** 본인의 활동 또는 관리자 권한 필요
            """)
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "활동 상세 조회 성공"),
            @ApiResponse(responseCode = "403", description = "권한 없음"),
            @ApiResponse(responseCode = "404", description = "활동을 찾을 수 없음")
    })
    @GetMapping("/{activityId}")
    public ResponseEntity<UserActivityDto.Response> getActivityDetail(
            @Parameter(description = "활동 ID", required = true) @PathVariable String activityId) {

        UserActivity activity = userActivityService.getActivityDetail(activityId);
        UserActivityDto.Response response = convertToDto(activity);

        return ResponseEntity.ok(response);
    }

    /**
     * 수동 활동 기록 (테스트/개발용)
     */
    @Operation(summary = "수동 활동 기록", description = """
            **개발 및 테스트 목적으로 수동으로 활동을 기록합니다.**

            **⚠️ 개발/테스트 전용**
            • 프로덕션 환경에서는 비활성화 권장
            • 시스템 관리자만 사용 가능
            • 실제 사용자 활동은 자동으로 기록됨
            """)
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "활동 기록 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
            @ApiResponse(responseCode = "403", description = "권한 없음 - 관리자 권한 필요")
    })
    @PostMapping("/manual")
    @PreAuthorize("hasRole('ADMIN') or @securityContextUtil.isSystemAdmin()")
    public ResponseEntity<UserActivityDto.Response> createManualActivity(
            @Valid @RequestBody UserActivityDto.CreateRequest request,
            HttpServletRequest httpRequest) {

        UserActivity activity = userActivityService.logActivityFromRequest(
                request.getUserId(),
                request.getActivityType(),
                request.getActivityCategory(),
                request.getTargetEntityType(),
                request.getTargetEntityId(),
                request.getTargetEntityName(),
                httpRequest,
                request.getIsSuccessful(),
                request.getErrorMessage());

        UserActivityDto.Response response = convertToDto(activity);
        return ResponseEntity.status(201).body(response);
    }

    /**
     * 오래된 활동 이력 정리 (관리자 전용)
     */
    @Operation(summary = "오래된 활동 이력 정리", description = """
            **지정된 날짜 이전의 오래된 활동 이력을 삭제합니다.**

            **⚠️ 관리자 전용 기능**
            • 시스템 관리자만 실행 가능
            • 데이터베이스 용량 관리를 위한 기능
            • 삭제된 데이터는 복구 불가능

            **권장사항:**
            • 정기적인 백업 후 실행
            • 법적 보관 의무 기간 고려
            • 중요한 감사 로그는 별도 보관
            """)
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "정리 완료", content = @Content(examples = @ExampleObject(value = """
                    {
                      "message": "오래된 활동 이력 정리 완료",
                      "deletedCount": 1250,
                      "cutoffDate": "2024-01-01T00:00:00"
                    }
                    """))),
            @ApiResponse(responseCode = "403", description = "권한 없음 - 관리자 권한 필요")
    })
    @DeleteMapping("/cleanup")
    @PreAuthorize("hasRole('ADMIN') or @securityContextUtil.isSystemAdmin()")
    public ResponseEntity<Map<String, Object>> cleanupOldActivities(
            @Parameter(description = "삭제 기준일 (이 날짜 이전 데이터 삭제)", required = true) @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime cutoffDate) {

        int deletedCount = userActivityService.cleanupOldActivities(cutoffDate);

        Map<String, Object> response = Map.of(
                "message", "오래된 활동 이력 정리 완료",
                "deletedCount", deletedCount,
                "cutoffDate", cutoffDate);

        return ResponseEntity.ok(response);
    }

    /**
     * UserActivity 엔티티를 DTO로 변환
     */
    private UserActivityDto.Response convertToDto(UserActivity activity) {
        UserActivityDto.Response dto = new UserActivityDto.Response();

        dto.setId(activity.getId());
        dto.setUserId(activity.getUser().getId());
        dto.setUsername(activity.getUser().getUsername());
        dto.setUserFullName(activity.getUser().getName());
        dto.setActivityType(activity.getActivityType());
        dto.setActivityTypeDescription(getActivityTypeDescription(activity.getActivityType()));
        dto.setActivityCategory(activity.getActivityCategory());
        dto.setActivityCategoryDescription(getActivityCategoryDescription(activity.getActivityCategory()));
        dto.setTargetEntityType(activity.getTargetEntityType());
        dto.setTargetEntityId(activity.getTargetEntityId());
        dto.setTargetEntityName(activity.getTargetEntityName());
        dto.setSessionId(activity.getSessionId());
        dto.setIpAddress(activity.getIpAddress());
        dto.setUserAgent(activity.getUserAgent());
        dto.setDurationMs(activity.getDurationMs());
        dto.setIsSuccessful(activity.getIsSuccessful());
        dto.setErrorMessage(activity.getErrorMessage());
        dto.setDetails(activity.getDetails());
        dto.setRiskScore(activity.getRiskScore());
        dto.setRiskLevel(getRiskLevel(activity.getRiskScore()));
        dto.setAnomalyDetected(activity.getAnomalyDetected());
        dto.setTimestamp(activity.getTimestamp());

        return dto;
    }

    /**
     * 통계 Map을 DTO로 변환
     */
    @SuppressWarnings("unchecked")
    private UserActivityDto.StatisticsResponse convertToStatisticsDto(Map<String, Object> statistics, String userId,
            LocalDateTime startDate, LocalDateTime endDate) {
        UserActivityDto.StatisticsResponse dto = new UserActivityDto.StatisticsResponse();

        dto.setUserId(userId);
        dto.setTotalActivities((Long) statistics.get("totalActivities"));
        dto.setDistinctSessions((Long) statistics.get("distinctSessions"));
        dto.setActivityTypeStatistics((Map<String, Long>) statistics.get("activityTypeStatistics"));
        dto.setActivityCategoryStatistics((Map<String, Long>) statistics.get("activityCategoryStatistics"));
        dto.setDailyActivityStatistics((List<Object[]>) statistics.get("dailyActivityStatistics"));
        dto.setHourlyActivityStatistics((List<Object[]>) statistics.get("hourlyActivityStatistics"));
        dto.setFailureStatistics((Map<String, Long>) statistics.get("failureStatistics"));
        dto.setAverageSessionDurationMinutes((Double) statistics.get("averageSessionDurationMinutes"));
        dto.setLastLoginTime((LocalDateTime) statistics.get("lastLoginTime"));
        dto.setLastLoginIp((String) statistics.get("lastLoginIp"));
        dto.setStatisticsStartDate(startDate);
        dto.setStatisticsEndDate(endDate);

        return dto;
    }

    /**
     * 활동 타입 설명 반환
     */
    private String getActivityTypeDescription(String activityType) {
        return switch (activityType) {
            case UserActivityService.ActivityType.LOGIN -> "로그인";
            case UserActivityService.ActivityType.LOGOUT -> "로그아웃";
            case UserActivityService.ActivityType.LOGIN_FAILED -> "로그인 실패";
            case UserActivityService.ActivityType.PASSWORD_CHANGE -> "비밀번호 변경";
            case UserActivityService.ActivityType.PROFILE_UPDATE -> "프로필 수정";
            case UserActivityService.ActivityType.PROJECT_CREATE -> "프로젝트 생성";
            case UserActivityService.ActivityType.PROJECT_ACCESS -> "프로젝트 접근";
            case UserActivityService.ActivityType.PROJECT_UPDATE -> "프로젝트 수정";
            case UserActivityService.ActivityType.PROJECT_DELETE -> "프로젝트 삭제";
            case UserActivityService.ActivityType.TESTCASE_CREATE -> "테스트케이스 생성";
            case UserActivityService.ActivityType.TESTCASE_VIEW -> "테스트케이스 조회";
            case UserActivityService.ActivityType.TESTCASE_UPDATE -> "테스트케이스 수정";
            case UserActivityService.ActivityType.TESTCASE_DELETE -> "테스트케이스 삭제";
            case UserActivityService.ActivityType.ORGANIZATION_CREATE -> "조직 생성";
            case UserActivityService.ActivityType.ORGANIZATION_ACCESS -> "조직 접근";
            case UserActivityService.ActivityType.ORGANIZATION_UPDATE -> "조직 수정";
            case UserActivityService.ActivityType.ADMIN_ACCESS -> "관리자 접근";
            case UserActivityService.ActivityType.SYSTEM_CONFIG -> "시스템 설정";
            default -> activityType;
        };
    }

    /**
     * 활동 카테고리 설명 반환
     */
    private String getActivityCategoryDescription(String activityCategory) {
        return switch (activityCategory) {
            case UserActivityService.ActivityCategory.AUTHENTICATION -> "인증";
            case UserActivityService.ActivityCategory.PROJECT_MANAGEMENT -> "프로젝트 관리";
            case UserActivityService.ActivityCategory.TEST_MANAGEMENT -> "테스트 관리";
            case UserActivityService.ActivityCategory.ORGANIZATION_MANAGEMENT -> "조직 관리";
            case UserActivityService.ActivityCategory.SYSTEM_ADMINISTRATION -> "시스템 관리";
            case UserActivityService.ActivityCategory.USER_PROFILE -> "사용자 프로필";
            default -> activityCategory;
        };
    }

    /**
     * 위험도 레벨 반환
     */
    private String getRiskLevel(Integer riskScore) {
        if (riskScore == null)
            return "UNKNOWN";
        if (riskScore >= 80)
            return "CRITICAL";
        if (riskScore >= 60)
            return "HIGH";
        if (riskScore >= 30)
            return "MEDIUM";
        return "LOW";
    }
}