// src/main/java/com/testcase/testcasemanagement/service/TestCaseDisplayIdService.java

package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * ICT-341: 테스트 케이스 Display ID 생성 서비스
 * 
 * 프로젝트코드-넘버 형식의 Display ID를 생성하고 관리합니다.
 * 예: PROJ-001, TEST-042, WEB-123
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TestCaseDisplayIdService {

    /**
     * 테스트 케이스의 Display ID를 생성합니다.
     * 
     * @param testCase 테스트 케이스
     * @return 생성된 Display ID (예: PROJ-001)
     */
    public String generateDisplayId(TestCase testCase) {
        if (testCase.getProject() == null) {
            log.warn("TestCase의 Project가 null입니다. ID: {}", testCase.getId());
            return null;
        }
        
        Project project = testCase.getProject();
        String projectCode = extractProjectCode(project);
        Integer sequentialId = testCase.getSequentialId();
        
        if (sequentialId == null) {
            log.warn("TestCase의 sequentialId가 null입니다. ID: {}", testCase.getId());
            return null;
        }
        
        // 프로젝트코드-넘버 형식 생성 (3자리 zero-padding)
        return String.format("%s-%03d", projectCode, sequentialId);
    }
    
    /**
     * 프로젝트에서 코드를 추출합니다.
     * 1. 프로젝트의 code 필드 사용
     * 2. code가 없으면 name의 첫 4글자 대문자로 사용
     * 
     * @param project 프로젝트
     * @return 프로젝트 코드 (예: PROJ, TEST, WEB)
     */
    private String extractProjectCode(Project project) {
        // 1. 프로젝트의 code 필드가 있으면 사용
        if (project.getCode() != null && !project.getCode().trim().isEmpty()) {
            return project.getCode().trim().toUpperCase();
        }
        
        // 2. name의 첫 4글자를 대문자로 변환하여 사용
        String name = project.getName();
        if (name != null && !name.trim().isEmpty()) {
            // 공백과 특수문자 제거 후 첫 4글자 추출
            String cleanName = name.replaceAll("[^a-zA-Z가-힣0-9]", "");
            if (cleanName.length() >= 4) {
                return cleanName.substring(0, 4).toUpperCase();
            } else {
                return cleanName.toUpperCase();
            }
        }
        
        // 3. 기본값
        return "TEST";
    }
    
    /**
     * 기존 테스트 케이스의 Display ID를 업데이트합니다.
     * 
     * @param testCase 업데이트할 테스트 케이스
     */
    @Transactional
    public void updateDisplayId(TestCase testCase) {
        String newDisplayId = generateDisplayId(testCase);
        if (newDisplayId != null && !newDisplayId.equals(testCase.getDisplayId())) {
            log.info("TestCase Display ID 업데이트: {} -> {} (TestCase ID: {})", 
                    testCase.getDisplayId(), newDisplayId, testCase.getId());
            testCase.setDisplayId(newDisplayId);
        }
    }
    
    /**
     * Display ID 형식이 유효한지 검증합니다.
     * 
     * @param displayId 검증할 Display ID
     * @return 유효하면 true, 그렇지 않으면 false
     */
    public boolean isValidDisplayId(String displayId) {
        if (displayId == null || displayId.trim().isEmpty()) {
            return false;
        }
        
        // 프로젝트코드-넘버 형식 검증 (예: PROJ-001, TEST-042)
        return displayId.matches("^[A-Z0-9]{1,10}-\\d{3}$");
    }
    
    /**
     * Display ID에서 프로젝트 코드를 추출합니다.
     * 
     * @param displayId Display ID (예: PROJ-001)
     * @return 프로젝트 코드 (예: PROJ)
     */
    public String extractProjectCodeFromDisplayId(String displayId) {
        if (!isValidDisplayId(displayId)) {
            return null;
        }
        
        int dashIndex = displayId.indexOf('-');
        if (dashIndex > 0) {
            return displayId.substring(0, dashIndex);
        }
        
        return null;
    }
    
    /**
     * Display ID에서 시퀀스 번호를 추출합니다.
     * 
     * @param displayId Display ID (예: PROJ-001)
     * @return 시퀀스 번호 (예: 1)
     */
    public Integer extractSequenceFromDisplayId(String displayId) {
        if (!isValidDisplayId(displayId)) {
            return null;
        }
        
        int dashIndex = displayId.indexOf('-');
        if (dashIndex > 0 && dashIndex < displayId.length() - 1) {
            try {
                String sequenceStr = displayId.substring(dashIndex + 1);
                return Integer.parseInt(sequenceStr);
            } catch (NumberFormatException e) {
                log.warn("Display ID에서 시퀀스 번호 파싱 실패: {}", displayId, e);
                return null;
            }
        }
        
        return null;
    }
}