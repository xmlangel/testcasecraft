// src/main/java/com/testcase/testcasemanagement/service/CsvPermissionService.java
package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.BulkPermissionChangeDto;
import com.testcase.testcasemanagement.dto.PermissionConflictDto;
import com.testcase.testcasemanagement.model.Organization;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.model.OrganizationUser.OrganizationRole;
import com.testcase.testcasemanagement.model.ProjectUser.ProjectRole;
import com.testcase.testcasemanagement.repository.OrganizationRepository;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * CSV 파일을 통한 대량 권한 변경 처리 서비스
 * ICT-33: 사용자 권한 및 역할 관리 강화
 */
@Service
public class CsvPermissionService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private OrganizationRepository organizationRepository;
    
    @Autowired
    private ProjectRepository projectRepository;
    
    @Autowired
    private UserPermissionService userPermissionService;

    /**
     * CSV 파일에서 권한 변경 요청 파싱
     */
    public List<BulkPermissionChangeDto> parseCsvFile(MultipartFile file) throws IOException {
        List<BulkPermissionChangeDto> changes = new ArrayList<>();
        
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            
            String line;
            boolean isFirstLine = true;
            int lineNumber = 0;
            
            while ((line = reader.readLine()) != null) {
                lineNumber++;
                
                // 헤더 라인 건너뛰기
                if (isFirstLine) {
                    isFirstLine = false;
                    continue;
                }
                
                // 빈 라인 건너뛰기
                if (line.trim().isEmpty()) {
                    continue;
                }
                
                try {
                    BulkPermissionChangeDto change = parseCsvLine(line, lineNumber);
                    if (change != null) {
                        changes.add(change);
                    }
                } catch (Exception e) {
                    // 파싱 실패한 라인은 오류로 기록하고 계속 진행
                    BulkPermissionChangeDto errorChange = new BulkPermissionChangeDto();
                    errorChange.setValid(false);
                    errorChange.setValidationMessage("라인 " + lineNumber + " 파싱 실패: " + e.getMessage());
                    changes.add(errorChange);
                }
            }
        }
        
        return changes;
    }

    /**
     * CSV 라인 파싱
     * 예상 형식: username,organizationName,projectName,changeType,currentRole,newRole,reason
     */
    private BulkPermissionChangeDto parseCsvLine(String line, int lineNumber) {
        String[] fields = line.split(",");
        
        if (fields.length < 6) {
            throw new IllegalArgumentException("필드 수가 부족합니다. 최소 6개 필드가 필요합니다.");
        }
        
        BulkPermissionChangeDto change = new BulkPermissionChangeDto();
        
        // 기본 필드 설정
        change.setUsername(fields[0].trim());
        change.setOrganizationName(fields[1].trim().isEmpty() ? null : fields[1].trim());
        change.setProjectName(fields[2].trim().isEmpty() ? null : fields[2].trim());
        change.setChangeType(fields[3].trim());
        change.setCurrentRole(fields[4].trim().isEmpty() ? null : fields[4].trim());
        change.setNewRole(fields[5].trim().isEmpty() ? null : fields[5].trim());
        change.setReason(fields.length > 6 ? fields[6].trim() : "CSV 대량 변경");
        
        // ID 변환 및 검증
        validateAndConvertIds(change);
        
        return change;
    }

    /**
     * 사용자명/조직명/프로젝트명을 ID로 변환하고 검증
     */
    private void validateAndConvertIds(BulkPermissionChangeDto change) {
        StringBuilder validationErrors = new StringBuilder();
        
        // 사용자 ID 변환
        if (change.getUsername() != null) {
            Optional<User> user = userRepository.findByUsername(change.getUsername());
            if (user.isPresent()) {
                change.setUserId(user.get().getId());
            } else {
                validationErrors.append("사용자를 찾을 수 없습니다: ").append(change.getUsername()).append("; ");
            }
        }
        
        // 조직 ID 변환
        if (change.getOrganizationName() != null) {
            Optional<Organization> org = organizationRepository.findByName(change.getOrganizationName());
            if (org.isPresent()) {
                change.setResourceId(org.get().getId());
                change.setResourceType("ORGANIZATION");
            } else {
                validationErrors.append("조직을 찾을 수 없습니다: ").append(change.getOrganizationName()).append("; ");
            }
        }
        
        // 프로젝트 ID 변환
        if (change.getProjectName() != null) {
            Optional<Project> project = projectRepository.findByName(change.getProjectName());
            if (project.isPresent()) {
                change.setResourceId(project.get().getId());
                change.setResourceType("PROJECT");
            } else {
                validationErrors.append("프로젝트를 찾을 수 없습니다: ").append(change.getProjectName()).append("; ");
            }
        }
        
        // 변경 유형 검증
        if (!isValidChangeType(change.getChangeType())) {
            validationErrors.append("유효하지 않은 변경 유형: ").append(change.getChangeType()).append("; ");
        }
        
        // 역할 검증
        if (change.getNewRole() != null) {
            if (change.getResourceType() != null) {
                if ("ORGANIZATION".equals(change.getResourceType()) && !isValidOrganizationRole(change.getNewRole())) {
                    validationErrors.append("유효하지 않은 조직 역할: ").append(change.getNewRole()).append("; ");
                } else if ("PROJECT".equals(change.getResourceType()) && !isValidProjectRole(change.getNewRole())) {
                    validationErrors.append("유효하지 않은 프로젝트 역할: ").append(change.getNewRole()).append("; ");
                }
            }
        }
        
        // 검증 결과 설정
        if (validationErrors.length() > 0) {
            change.setValid(false);
            change.setValidationMessage(validationErrors.toString());
        } else {
            change.setValid(true);
        }
    }

    /**
     * 변경 유형 유효성 검증
     */
    private boolean isValidChangeType(String changeType) {
        return Arrays.asList(
                "ADD_ORG_MEMBER", "ADD_PROJECT_MEMBER",
                "CHANGE_ORG_ROLE", "CHANGE_PROJECT_ROLE",
                "REMOVE_ORG_MEMBER", "REMOVE_PROJECT_MEMBER"
        ).contains(changeType);
    }

    /**
     * 조직 역할 유효성 검증
     */
    private boolean isValidOrganizationRole(String role) {
        try {
            OrganizationRole.valueOf(role);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * 프로젝트 역할 유효성 검증
     */
    private boolean isValidProjectRole(String role) {
        try {
            ProjectRole.valueOf(role);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    /**
     * CSV 파싱 결과 검증 및 처리
     */
    public Map<String, Object> validateAndProcessCsv(List<BulkPermissionChangeDto> changes) {
        // 유효한 변경사항과 오류 분리
        List<BulkPermissionChangeDto> validChanges = new ArrayList<>();
        List<BulkPermissionChangeDto> invalidChanges = new ArrayList<>();
        
        for (BulkPermissionChangeDto change : changes) {
            if (change.isValid()) {
                validChanges.add(change);
            } else {
                invalidChanges.add(change);
            }
        }
        
        // 권한 충돌 검증
        List<PermissionConflictDto> conflicts = new ArrayList<>();
        if (!validChanges.isEmpty()) {
            conflicts = userPermissionService.validatePermissionChanges(validChanges);
        }
        
        Map<String, Object> result = new HashMap<>();
        result.put("totalCount", changes.size());
        result.put("validCount", validChanges.size());
        result.put("invalidCount", invalidChanges.size());
        result.put("conflictCount", conflicts.size());
        result.put("validChanges", validChanges);
        result.put("invalidChanges", invalidChanges);
        result.put("conflicts", conflicts);
        result.put("canProcess", invalidChanges.isEmpty() && conflicts.isEmpty());
        
        return result;
    }

    /**
     * CSV 템플릿 생성
     */
    public String generateCsvTemplate() {
        StringBuilder template = new StringBuilder();
        template.append("username,organizationName,projectName,changeType,currentRole,newRole,reason\n");
        template.append("# 예시 데이터:\n");
        template.append("# user1,MyOrg,,ADD_ORG_MEMBER,,MEMBER,조직 멤버 추가\n");
        template.append("# user2,,MyProject,ADD_PROJECT_MEMBER,,DEVELOPER,프로젝트 개발자 추가\n");
        template.append("# user3,MyOrg,,CHANGE_ORG_ROLE,MEMBER,ADMIN,역할 승격\n");
        template.append("# user4,,MyProject,REMOVE_PROJECT_MEMBER,TESTER,,프로젝트에서 제거\n");
        template.append("# \n");
        template.append("# 변경 유형 (changeType):\n");
        template.append("# - ADD_ORG_MEMBER: 조직에 멤버 추가\n");
        template.append("# - ADD_PROJECT_MEMBER: 프로젝트에 멤버 추가\n");
        template.append("# - CHANGE_ORG_ROLE: 조직 내 역할 변경\n");
        template.append("# - CHANGE_PROJECT_ROLE: 프로젝트 내 역할 변경\n");
        template.append("# - REMOVE_ORG_MEMBER: 조직에서 멤버 제거\n");
        template.append("# - REMOVE_PROJECT_MEMBER: 프로젝트에서 멤버 제거\n");
        template.append("# \n");
        template.append("# 조직 역할: OWNER, ADMIN, MEMBER\n");
        template.append("# 프로젝트 역할: PROJECT_MANAGER, LEAD_DEVELOPER, DEVELOPER, TESTER, CONTRIBUTOR, VIEWER\n");
        
        return template.toString();
    }
}