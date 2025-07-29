// src/main/java/com/testcase/testcasemanagement/audit/AuditService.java
package com.testcase.testcasemanagement.audit;

import com.testcase.testcasemanagement.model.AuditLog;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.AuditLogRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 감사 로그 자동 기록 서비스
 */
@Service
public class AuditService {
    
    private static final Logger logger = LoggerFactory.getLogger(AuditService.class);
    
    @Autowired
    private AuditLogRepository auditLogRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private SecurityContextUtil securityContextUtil;
    
    /**
     * 감사 로그 자동 기록
     * @param entityType 엔티티 타입
     * @param entityId 엔티티 ID
     * @param action 액션
     * @param details 상세 정보
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(AuditEntityType entityType, String entityId, AuditAction action, String details) {
        logAction(entityType.getValue(), entityId, action.getValue(), details);
    }
    
    /**
     * 감사 로그 자동 기록 (문자열 파라미터 버전)
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAction(String entityType, String entityId, String action, String details) {
        try {
            // 현재 사용자 정보 가져오기
            String currentUsername = securityContextUtil.getCurrentUsername();
            User currentUser = null;
            
            if (currentUsername != null) {
                Optional<User> userOpt = userRepository.findByUsername(currentUsername);
                if (userOpt.isPresent()) {
                    currentUser = userOpt.get();
                }
            }
            
            // 감사 로그 생성
            AuditLog auditLog = new AuditLog();
            auditLog.setEntityType(entityType);
            auditLog.setEntityId(entityId);
            auditLog.setAction(action);
            auditLog.setPerformedBy(currentUser);
            auditLog.setDetails(details);
            auditLog.setTimestamp(LocalDateTime.now());
            
            // 로그 저장
            auditLogRepository.save(auditLog);
            
            logger.debug("Audit log recorded: entityType={}, entityId={}, action={}, user={}", 
                        entityType, entityId, action, currentUsername);
            
        } catch (Exception e) {
            // 감사 로그 기록 실패는 원본 작업에 영향을 주지 않도록 예외를 로그로만 남김
            logger.error("Failed to record audit log: entityType={}, entityId={}, action={}", 
                        entityType, entityId, action, e);
        }
    }
    
    /**
     * 조직 관련 감사 로그 기록
     */
    public void logOrganizationAction(String organizationId, AuditAction action, String details) {
        logAction(AuditEntityType.ORGANIZATION, organizationId, action, details);
    }
    
    /**
     * 프로젝트 관련 감사 로그 기록
     */
    public void logProjectAction(String projectId, AuditAction action, String details) {
        logAction(AuditEntityType.PROJECT, projectId, action, details);
    }
    
    /**
     * 그룹 관련 감사 로그 기록
     */
    public void logGroupAction(String groupId, AuditAction action, String details) {
        logAction(AuditEntityType.GROUP, groupId, action, details);
    }
    
    /**
     * 사용자 관련 감사 로그 기록
     */
    public void logUserAction(String userId, AuditAction action, String details) {
        logAction(AuditEntityType.USER, userId, action, details);
    }
    
    /**
     * 멤버 관리 감사 로그 기록
     */
    public void logMemberAction(AuditEntityType entityType, String entityId, String memberId, 
                               AuditAction action, String role) {
        String details = String.format("memberId:%s, role:%s", memberId, role);
        logAction(entityType, entityId, action, details);
    }
    
    /**
     * 조직 멤버 관리 감사 로그 기록
     */
    public void logOrganizationMemberAction(String organizationId, String memberId, 
                                          AuditAction action, String role) {
        logMemberAction(AuditEntityType.ORGANIZATION_USER, organizationId, memberId, action, role);
    }
    
    /**
     * 프로젝트 멤버 관리 감사 로그 기록
     */
    public void logProjectMemberAction(String projectId, String memberId, 
                                     AuditAction action, String role) {
        logMemberAction(AuditEntityType.PROJECT_USER, projectId, memberId, action, role);
    }
    
    /**
     * 그룹 멤버 관리 감사 로그 기록
     */
    public void logGroupMemberAction(String groupId, String memberId, 
                                   AuditAction action, String role) {
        logMemberAction(AuditEntityType.GROUP_MEMBER, groupId, memberId, action, role);
    }
    
    /**
     * 로그인/로그아웃 감사 로그 기록
     */
    public void logAuthenticationAction(String userId, AuditAction action, String details) {
        logAction(AuditEntityType.AUTHENTICATION, userId, action, details);
    }
    
    /**
     * 시스템 관리 감사 로그 기록
     */
    public void logSystemAction(String systemComponent, AuditAction action, String details) {
        logAction(AuditEntityType.SYSTEM, systemComponent, action, details);
    }
    
    /**
     * JSON 형태의 상세 정보로 감사 로그 기록
     */
    public void logActionWithJson(AuditEntityType entityType, String entityId, 
                                 AuditAction action, Object detailsObject) {
        try {
            // 간단한 JSON 형태로 변환 (복잡한 객체는 toString 사용)
            String details = detailsObject != null ? detailsObject.toString() : null;
            logAction(entityType, entityId, action, details);
        } catch (Exception e) {
            // JSON 변환 실패 시 기본 방식으로 로그 기록
            logAction(entityType, entityId, action, "Details conversion failed");
        }
    }
}