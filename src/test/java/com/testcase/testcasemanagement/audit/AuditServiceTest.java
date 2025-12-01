// src/test/java/com/testcase/testcasemanagement/audit/AuditServiceTest.java
package com.testcase.testcasemanagement.audit;

import com.testcase.testcasemanagement.model.AuditLog;
import com.testcase.testcasemanagement.repository.AuditLogRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

/**
 * AuditService 테스트
 * Task 9 완료 검증: 감사 로그 자동 기록 및 조회 기능
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AuditServiceTest {

    @Autowired
    private AuditService auditService;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SecurityContextUtil securityContextUtil;

    @Test
    public void testLogAction() {
        // Given: 감사 로그 기록을 위한 테스트 데이터
        String entityType = AuditEntityType.ORGANIZATION.getValue();
        String entityId = "test-org-id";
        String action = AuditAction.CREATE.getValue();
        String details = "Test organization creation";

        // When: 감사 로그 기록
        auditService.logAction(entityType, entityId, action, details);

        // Then: 로그가 정상적으로 기록되었는지 확인
        List<AuditLog> logs = auditLogRepository.findByEntityTypeAndEntityId(entityType, entityId);
        assertFalse(logs.isEmpty());

        AuditLog log = logs.get(0);
        assertEquals(entityType, log.getEntityType());
        assertEquals(entityId, log.getEntityId());
        assertEquals(action, log.getAction());
        assertEquals(details, log.getDetails());
        assertNotNull(log.getTimestamp());
    }

    @Test
    public void testLogOrganizationAction() {
        // Given: 조직 관련 감사 로그 기록
        String organizationId = "test-org-123";
        AuditAction action = AuditAction.UPDATE;
        String details = "Organization name updated";

        // When: 조직 감사 로그 기록
        auditService.logOrganizationAction(organizationId, action, details);

        // Then: 로그가 정상적으로 기록되었는지 확인
        List<AuditLog> logs = auditLogRepository.findByEntityTypeAndEntityId(
                AuditEntityType.ORGANIZATION.getValue(), organizationId);
        assertFalse(logs.isEmpty());

        AuditLog log = logs.get(0);
        assertEquals(AuditEntityType.ORGANIZATION.getValue(), log.getEntityType());
        assertEquals(organizationId, log.getEntityId());
        assertEquals(action.getValue(), log.getAction());
        assertEquals(details, log.getDetails());
    }

    @Test
    public void testLogMemberAction() {
        // Given: 멤버 관리 감사 로그 기록
        String organizationId = "test-org-456";
        String memberId = "test-user-789";
        AuditAction action = AuditAction.INVITE_MEMBER;
        String role = "ADMIN";

        // When: 멤버 관련 감사 로그 기록
        auditService.logOrganizationMemberAction(organizationId, memberId, action, role);

        // Then: 로그가 정상적으로 기록되었는지 확인
        List<AuditLog> logs = auditLogRepository.findByEntityTypeAndEntityId(
                AuditEntityType.ORGANIZATION_USER.getValue(), organizationId);
        assertFalse(logs.isEmpty());

        AuditLog log = logs.get(0);
        assertEquals(AuditEntityType.ORGANIZATION_USER.getValue(), log.getEntityType());
        assertEquals(organizationId, log.getEntityId());
        assertEquals(action.getValue(), log.getAction());
        assertTrue(log.getDetails().contains("memberId:" + memberId));
        assertTrue(log.getDetails().contains("role:" + role));
    }

    @Test
    public void testLogActionWithEnum() {
        // Given: Enum을 사용한 감사 로그 기록
        AuditEntityType entityType = AuditEntityType.PROJECT;
        String entityId = "test-project-123";
        AuditAction action = AuditAction.DELETE;
        String details = "Project deleted";

        // When: Enum 파라미터로 감사 로그 기록
        auditService.logAction(entityType, entityId, action, details);

        // Then: 로그가 정상적으로 기록되었는지 확인
        List<AuditLog> logs = auditLogRepository.findByEntityTypeAndEntityId(
                entityType.getValue(), entityId);
        assertFalse(logs.isEmpty());

        AuditLog log = logs.get(0);
        assertEquals(entityType.getValue(), log.getEntityType());
        assertEquals(entityId, log.getEntityId());
        assertEquals(action.getValue(), log.getAction());
        assertEquals(details, log.getDetails());
    }

    @Test
    public void testLogActionWithNullUser() {
        // Given: 사용자 정보가 없는 상황에서 감사 로그 기록
        String entityType = AuditEntityType.SYSTEM.getValue();
        String entityId = "system-component";
        String action = AuditAction.UPDATE.getValue();
        String details = "System update without user context";

        // When: 사용자 컨텍스트 없이 감사 로그 기록
        auditService.logAction(entityType, entityId, action, details);

        // Then: 로그가 정상적으로 기록되어야 함 (performedBy는 null)
        List<AuditLog> logs = auditLogRepository.findByEntityTypeAndEntityId(entityType, entityId);
        assertFalse(logs.isEmpty());

        AuditLog log = logs.get(0);
        assertEquals(entityType, log.getEntityType());
        assertEquals(entityId, log.getEntityId());
        assertEquals(action, log.getAction());
        assertEquals(details, log.getDetails());
        assertNull(log.getPerformedBy()); // 사용자 정보 없음
    }

    @Test
    public void testAuditActionEnum() {
        /*
         * ✅ AuditAction Enum 값 확인:
         * 
         * 생성/수정/삭제: CREATE, UPDATE, DELETE
         * 멤버 관리: INVITE_MEMBER, REMOVE_MEMBER, UPDATE_MEMBER_ROLE
         * 권한 관리: GRANT_PERMISSION, REVOKE_PERMISSION
         * 이전/이동: TRANSFER
         * 인증: LOGIN, LOGOUT
         * 기타: ACTIVATE, DEACTIVATE, ARCHIVE, RESTORE
         */
        assertEquals("CREATE", AuditAction.CREATE.getValue());
        assertEquals("UPDATE", AuditAction.UPDATE.getValue());
        assertEquals("DELETE", AuditAction.DELETE.getValue());
        assertEquals("INVITE_MEMBER", AuditAction.INVITE_MEMBER.getValue());
        assertEquals("REMOVE_MEMBER", AuditAction.REMOVE_MEMBER.getValue());
        assertEquals("UPDATE_MEMBER_ROLE", AuditAction.UPDATE_MEMBER_ROLE.getValue());
        assertEquals("LOGIN", AuditAction.LOGIN.getValue());
        assertEquals("LOGOUT", AuditAction.LOGOUT.getValue());
    }

    @Test
    public void testAuditEntityTypeEnum() {
        /*
         * ✅ AuditEntityType Enum 값 확인:
         * 
         * 사용자: USER
         * 조직: ORGANIZATION, ORGANIZATION_USER
         * 프로젝트: PROJECT, PROJECT_USER
         * 그룹: GROUP, GROUP_MEMBER
         * 테스트: TEST_CASE, TEST_PLAN, TEST_EXECUTION, TEST_RESULT
         * 시스템: SYSTEM, AUTHENTICATION
         */
        assertEquals("USER", AuditEntityType.USER.getValue());
        assertEquals("ORGANIZATION", AuditEntityType.ORGANIZATION.getValue());
        assertEquals("ORGANIZATION_USER", AuditEntityType.ORGANIZATION_USER.getValue());
        assertEquals("PROJECT", AuditEntityType.PROJECT.getValue());
        assertEquals("PROJECT_USER", AuditEntityType.PROJECT_USER.getValue());
        assertEquals("GROUP", AuditEntityType.GROUP.getValue());
        assertEquals("GROUP_MEMBER", AuditEntityType.GROUP_MEMBER.getValue());
        assertEquals("SYSTEM", AuditEntityType.SYSTEM.getValue());
        assertEquals("AUTHENTICATION", AuditEntityType.AUTHENTICATION.getValue());
    }
}

/*
 * 🎯 Task 9 완료 검증 결과:
 * 
 * ✅ AuditLog Entity 및 Repository: 이미 구현됨, 다양한 조회 메서드 제공
 * ✅ AuditAction Enum: 모든 주요 액션 타입 정의 (CREATE, UPDATE, DELETE, 멤버관리 등)
 * ✅ AuditEntityType Enum: 모든 엔티티 타입 정의 (조직, 프로젝트, 그룹, 테스트 등)
 * ✅ AuditService: 감사 로그 자동 기록 서비스 구현
 * - 트랜잭션 독립성 (REQUIRES_NEW)
 * - 예외 안전성 (원본 작업에 영향 없음)
 * - 다양한 편의 메서드 (조직, 프로젝트, 그룹별)
 * ✅ OrganizationService 통합: 모든 주요 메서드에 감사 로그 추가
 * - 조직 생성/수정/삭제
 * - 멤버 초대/제거/역할변경
 * ✅ AuditLogController: 감사 로그 조회 API 구현
 * - 권한 기반 접근 제어
 * - 다양한 조회 옵션 (엔티티별, 사용자별, 통계 등)
 * ✅ 테스트 검증: AuditService 기본 기능 테스트 완료
 * 
 * 다음 단계: ProjectService, GroupService에도 감사 로그 적용 필요
 */