// src/main/java/com/testcase/testcasemanagement/service/UserManagementService.java
package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.UserDto;
import com.testcase.testcasemanagement.exception.ResourceNotFoundException;
import com.testcase.testcasemanagement.exception.ResourceNotValidException;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.UserRepository;
import com.testcase.testcasemanagement.repository.OrganizationUserRepository;
import com.testcase.testcasemanagement.repository.ProjectUserRepository;
import com.testcase.testcasemanagement.repository.GroupMemberRepository;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import com.testcase.testcasemanagement.audit.AuditService;
import com.testcase.testcasemanagement.audit.AuditAction;
import com.testcase.testcasemanagement.audit.AuditEntityType;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 사용자 관리 서비스 - 관리자용 사용자 관리 기능
 */
@Service
@Transactional
public class UserManagementService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private OrganizationUserRepository organizationUserRepository;
    
    @Autowired
    private ProjectUserRepository projectUserRepository;
    
    @Autowired
    private GroupMemberRepository groupMemberRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private AuditService auditService;
    
    @Autowired
    private SecurityContextUtil securityContextUtil;

    /**
     * 사용자 목록 조회 (검색, 정렬, 페이징)
     */
    @Transactional(readOnly = true)
    public Page<UserDto.ListResponse> getUsers(UserDto.SearchRequest searchRequest) {
        // 현재 사용자가 관리자인지 확인
        String currentUsername = securityContextUtil.getCurrentUsername();
        validateAdminAccess(currentUsername);
        
        // 기본값 설정
        int page = searchRequest.getPage() != null ? searchRequest.getPage() : 0;
        int size = searchRequest.getSize() != null ? searchRequest.getSize() : 20;
        String keyword = searchRequest.getKeyword();
        String role = searchRequest.getRole();
        Boolean isActive = searchRequest.getIsActive();
        
        // 페이징 및 정렬 설정
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        
        // 검색 실행
        Page<User> users = userRepository.findUsersWithFilters(keyword, role, isActive, pageable);
        
        // DTO 변환
        return users.map(this::convertToListResponse);
    }

    /**
     * 사용자 상세 정보 조회
     */
    @Transactional(readOnly = true)
    public UserDto.Response getUserById(String userId) {
        // 현재 사용자가 관리자인지 확인
        String currentUsername = securityContextUtil.getCurrentUsername();
        validateAdminAccess(currentUsername);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다: " + userId));
        
        return convertToResponse(user);
    }

    /**
     * 사용자 정보 수정 (관리자용)
     */
    public UserDto.Response updateUser(String userId, UserDto.UpdateRequest updateRequest) {
        // 현재 사용자가 관리자인지 확인
        String currentUsername = securityContextUtil.getCurrentUsername();
        User currentUser = validateAdminAccess(currentUsername);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다: " + userId));
        
        // 이메일 중복 검사
        if (updateRequest.getEmail() != null && !updateRequest.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(updateRequest.getEmail())) {
                throw new ResourceNotValidException("이미 사용 중인 이메일입니다: " + updateRequest.getEmail(), null);
            }
            user.setEmail(updateRequest.getEmail());
        }
        
        // 이름 업데이트
        if (updateRequest.getName() != null) {
            user.setName(updateRequest.getName());
        }
        
        User savedUser = userRepository.save(user);
        
        // 감사 로그 기록
        auditService.logAction(
            AuditEntityType.USER,
            user.getId(),
            AuditAction.UPDATE,
            String.format("사용자 정보 수정: %s", user.getUsername())
        );
        
        return convertToResponse(savedUser);
    }

    /**
     * 사용자 계정 활성화
     */
    public UserDto.Response activateUser(String userId) {
        return changeUserActiveStatus(userId, true, "계정 활성화");
    }

    /**
     * 사용자 계정 비활성화
     */
    public UserDto.Response deactivateUser(String userId, String reason) {
        return changeUserActiveStatus(userId, false, "계정 비활성화: " + (reason != null ? reason : "관리자 요청"));
    }

    /**
     * 사용자 역할 변경
     */
    public UserDto.Response changeUserRole(String userId, UserDto.ChangeRoleRequest roleRequest) {
        // 현재 사용자가 관리자인지 확인
        String currentUsername = securityContextUtil.getCurrentUsername();
        User currentUser = validateAdminAccess(currentUsername);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다: " + userId));
        
        // 자기 자신의 역할을 변경하려는 경우 방지
        if (user.getId().equals(currentUser.getId())) {
            throw new ResourceNotValidException("자신의 역할은 변경할 수 없습니다.", null);
        }
        
        String oldRole = user.getRole();
        user.setRole(roleRequest.getRole());
        
        User savedUser = userRepository.save(user);
        
        // 감사 로그 기록
        auditService.logAction(
            AuditEntityType.USER,
            user.getId(),
            AuditAction.UPDATE,
            String.format("사용자 역할 변경: %s -> %s", oldRole, roleRequest.getRole())
        );
        
        return convertToResponse(savedUser);
    }

    /**
     * 사용자 통계 조회
     */
    @Transactional(readOnly = true)
    public UserDto.StatisticsResponse getUserStatistics() {
        // 현재 사용자가 관리자인지 확인
        String currentUsername = securityContextUtil.getCurrentUsername();
        validateAdminAccess(currentUsername);
        
        UserDto.StatisticsResponse statistics = new UserDto.StatisticsResponse();
        
        // 전체 사용자 수
        statistics.setTotalUsers((int) userRepository.count());
        
        // 활성/비활성 사용자 수
        int activeUsers = userRepository.findByIsActive(true).size();
        int inactiveUsers = userRepository.findByIsActive(false).size();
        statistics.setActiveUsers(activeUsers);
        statistics.setInactiveUsers(inactiveUsers);
        
        // 역할별 사용자 수
        List<Object[]> roleStats = userRepository.getUserCountByRole();
        int adminUsers = 0, regularUsers = 0;
        
        for (Object[] stat : roleStats) {
            String role = (String) stat[0];
            Long count = (Long) stat[1];
            
            if ("ADMIN".equals(role)) {
                adminUsers = count.intValue();
            } else {
                regularUsers += count.intValue();
            }
        }
        
        statistics.setAdminUsers(adminUsers);
        statistics.setRegularUsers(regularUsers);
        
        // 이번 달 신규 사용자 수
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        List<User> recentUsers = userRepository.findRecentUsers(PageRequest.of(0, 1000));
        int newUsersThisMonth = (int) recentUsers.stream()
            .filter(user -> user.getCreatedAt().isAfter(startOfMonth))
            .count();
        statistics.setNewUsersThisMonth(newUsersThisMonth);
        
        // 최근 등록일
        if (!recentUsers.isEmpty()) {
            statistics.setLastRegistration(recentUsers.get(0).getCreatedAt());
        }
        
        // 평균 로그인 빈도 (임시로 0으로 설정 - 향후 로그인 이력 추가 시 구현)
        statistics.setAverageLoginFrequency(0.0);
        
        return statistics;
    }

    /**
     * 사용자 활성 상태 변경 (공통 메서드)
     */
    private UserDto.Response changeUserActiveStatus(String userId, boolean isActive, String reason) {
        // 현재 사용자가 관리자인지 확인
        String currentUsername = securityContextUtil.getCurrentUsername();
        User currentUser = validateAdminAccess(currentUsername);
        
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다: " + userId));
        
        // 자기 자신을 비활성화하려는 경우 방지
        if (user.getId().equals(currentUser.getId()) && !isActive) {
            throw new ResourceNotValidException("자신의 계정은 비활성화할 수 없습니다.", null);
        }
        
        user.setIsActive(isActive);
        User savedUser = userRepository.save(user);
        
        // 감사 로그 기록
        auditService.logAction(
            AuditEntityType.USER,
            user.getId(),
            isActive ? AuditAction.ACTIVATE : AuditAction.DEACTIVATE,
            reason
        );
        
        return convertToResponse(savedUser);
    }

    /**
     * 관리자 권한 검증
     */
    private User validateAdminAccess(String username) {
        User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다: " + username));
        
        if (!"ADMIN".equals(user.getRole())) {
            throw new com.testcase.testcasemanagement.exception.AccessDeniedException("관리자 권한이 필요합니다.");
        }
        
        return user;
    }

    /**
     * User -> UserDto.ListResponse 변환
     */
    private UserDto.ListResponse convertToListResponse(User user) {
        UserDto.ListResponse response = new UserDto.ListResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setRole(user.getRole());
        response.setIsActive(user.getIsActive());
        response.setCreatedAt(user.getCreatedAt());
        // lastLoginAt은 향후 로그인 이력 추가 시 구현
        return response;
    }

    /**
     * User -> UserDto.Response 변환
     */
    private UserDto.Response convertToResponse(User user) {
        UserDto.Response response = new UserDto.Response();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setName(user.getName());
        response.setRole(user.getRole());
        response.setCreatedAt(user.getCreatedAt());
        
        // 통계 정보 계산
        response.setOrganizationCount((int) organizationUserRepository.countByUserId(user.getId()));
        response.setProjectCount((int) projectUserRepository.countByUserId(user.getId()));
        response.setGroupCount((int) groupMemberRepository.countByUserId(user.getId()));
        
        // completedTestCases는 향후 테스트 실행 이력 추가 시 구현
        response.setCompletedTestCases(0);
        
        return response;
    }
}