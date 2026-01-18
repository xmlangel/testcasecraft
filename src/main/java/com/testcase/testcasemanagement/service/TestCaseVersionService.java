// src/main/java/com/testcase/testcasemanagement/service/TestCaseVersionService.java

package com.testcase.testcasemanagement.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.dto.TestCaseVersionDto;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.TestCaseVersion;
import com.testcase.testcasemanagement.model.TestStep;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.repository.TestCaseVersionRepository;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * ICT-349: 테스트케이스 버전 관리 시스템 - Service
 * 
 * 테스트케이스 버전 생성, 조회, 복원, 비교 등의 비즈니스 로직 처리
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TestCaseVersionService {

    private final TestCaseVersionRepository versionRepository;
    private final TestCaseRepository testCaseRepository;
    private final ObjectMapper objectMapper;

    // ============ 버전 생성 관련 메소드들 ============

    /**
     * 테스트케이스 수정 시 자동으로 새 버전 생성
     */
    @Transactional
    public TestCaseVersionDto createVersionFromTestCase(String testCaseId, String changeType, String changeSummary) {
        TestCase testCase = testCaseRepository.findById(testCaseId)
                .orElseThrow(() -> new IllegalArgumentException("테스트케이스를 찾을 수 없습니다: " + testCaseId));

        // 기존 현재 버전을 비활성화
        versionRepository.deactivateAllVersionsForTestCase(testCaseId);

        // 새 버전 번호 생성
        Integer nextVersionNumber = versionRepository.findMaxVersionNumberByTestCaseId(testCaseId) + 1;

        // TestStep을 JSON으로 직렬화
        String stepsJson = null;
        if (testCase.getSteps() != null) {
            try {
                stepsJson = objectMapper.writeValueAsString(testCase.getSteps());
            } catch (JsonProcessingException e) {
                log.error("테스트 스텝 직렬화 실패: {}", e.getMessage());
                stepsJson = "[]";
            }
        }

        // 현재 사용자 정보 가져오기
        String currentUserId = SecurityContextUtil.getCurrentUserIdStatic();
        String currentUserName = SecurityContextUtil.getCurrentUserNameStatic();

        // 새 버전 생성
        TestCaseVersion version = new TestCaseVersion();
        version.setTestCaseId(testCaseId);
        version.setProjectId(testCase.getProject().getId());
        version.setVersionNumber(nextVersionNumber);
        version.setVersionLabel(generateVersionLabel(changeType, nextVersionNumber));
        version.setVersionDescription(changeSummary);
        version.setIsCurrentVersion(true);

        // 테스트케이스 데이터 복사
        version.setName(testCase.getName());
        version.setType(testCase.getType());
        version.setDescription(testCase.getDescription());
        version.setPreCondition(testCase.getPreCondition());
        version.setPostCondition(testCase.getPostCondition());
        version.setIsAutomated(testCase.getIsAutomated());
        version.setExecutionType(testCase.getExecutionType());
        version.setTestTechnique(testCase.getTestTechnique());
        version.setParentId(testCase.getParentId());
        version.setStepsJson(stepsJson);
        version.setExpectedResults(testCase.getExpectedResults());
        version.setDisplayOrder(testCase.getDisplayOrder());
        version.setPriority(testCase.getPriority());
        version.setSequentialId(testCase.getSequentialId());
        version.setDisplayId(testCase.getDisplayId());

        // 메타데이터 설정
        version.setCreatedAt(LocalDateTime.now());
        version.setCreatedBy(currentUserId);
        version.setCreatedByName(currentUserName);
        version.setOriginalUpdatedAt(testCase.getUpdatedAt());
        version.setChangeType(changeType);
        version.setChangeSummary(changeSummary);
        version.setVersionTag("STABLE");
        version.setUsageCount(1);

        TestCaseVersion savedVersion = versionRepository.save(version);
        log.info("새 버전 생성: 테스트케이스={}, 버전={}, 유형={}", testCaseId, nextVersionNumber, changeType);

        return convertToDto(savedVersion);
    }

    /**
     * 수동으로 새 버전 생성 (사용자가 직접 요청)
     */
    @Transactional
    public TestCaseVersionDto createManualVersion(String testCaseId, String versionLabel, String versionDescription) {
        return createVersionFromTestCase(testCaseId, "MANUAL_SAVE", 
                versionDescription != null ? versionDescription : "수동 버전 생성");
    }

    // ============ 버전 조회 관련 메소드들 ============

    /**
     * 특정 테스트케이스의 모든 버전 조회
     */
    public List<TestCaseVersionDto> getVersionHistory(String testCaseId) {
        List<TestCaseVersion> versions = versionRepository.findByTestCaseIdOrderByVersionNumberDesc(testCaseId);
        return versions.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * 특정 테스트케이스의 현재 활성 버전 조회
     */
    public Optional<TestCaseVersionDto> getCurrentVersion(String testCaseId) {
        return versionRepository.findCurrentVersionByTestCaseId(testCaseId)
                .map(this::convertToDto);
    }

    /**
     * 특정 버전 상세 조회
     */
    public Optional<TestCaseVersionDto> getVersionDetail(String versionId) {
        return versionRepository.findById(versionId)
                .map(this::convertToDto);
    }

    /**
     * 특정 프로젝트의 모든 현재 버전들 조회
     */
    public List<TestCaseVersionDto> getCurrentVersionsByProject(String projectId) {
        List<TestCaseVersion> versions = versionRepository.findCurrentVersionsByProjectId(projectId);
        return versions.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    // ============ 버전 복원 관련 메소드들 ============

    /**
     * 특정 버전을 현재 버전으로 복원
     */
    @Transactional
    public TestCaseVersionDto restoreVersion(String versionId) {
        TestCaseVersion targetVersion = versionRepository.findById(versionId)
                .orElseThrow(() -> new IllegalArgumentException("버전을 찾을 수 없습니다: " + versionId));

        // 해당 테스트케이스 조회
        TestCase testCase = testCaseRepository.findById(targetVersion.getTestCaseId())
                .orElseThrow(() -> new IllegalArgumentException("테스트케이스를 찾을 수 없습니다: " + targetVersion.getTestCaseId()));

        // 기존 현재 버전들을 모두 비활성화
        versionRepository.deactivateAllVersionsForTestCase(targetVersion.getTestCaseId());

        // 복원하려는 버전을 현재 버전으로 설정
        targetVersion.setAsCurrentVersion();
        TestCaseVersion restoredVersion = versionRepository.save(targetVersion);

        // 실제 테스트케이스 데이터도 복원된 버전으로 업데이트
        updateTestCaseFromVersion(testCase, targetVersion);
        testCaseRepository.save(testCase);

        // 복원 이력 생성
        createVersionFromTestCase(targetVersion.getTestCaseId(), "RESTORE", 
                "버전 v" + targetVersion.getVersionNumber() + "로 복원됨");

        log.info("버전 복원 완료: 테스트케이스={}, 복원된 버전={}", 
                targetVersion.getTestCaseId(), targetVersion.getVersionNumber());

        return convertToDto(restoredVersion);
    }

    /**
     * 버전 데이터를 실제 테스트케이스에 적용
     */
    private void updateTestCaseFromVersion(TestCase testCase, TestCaseVersion version) {
        testCase.setName(version.getName());
        testCase.setType(version.getType());
        testCase.setDescription(version.getDescription());
        testCase.setPreCondition(version.getPreCondition());
        testCase.setPostCondition(version.getPostCondition());
        testCase.setIsAutomated(version.getIsAutomated());
        testCase.setExecutionType(version.getExecutionType());
        testCase.setTestTechnique(version.getTestTechnique());
        testCase.setParentId(version.getParentId());
        testCase.setExpectedResults(version.getExpectedResults());
        testCase.setDisplayOrder(version.getDisplayOrder());
        testCase.setPriority(version.getPriority());
        testCase.setSequentialId(version.getSequentialId());
        testCase.setDisplayId(version.getDisplayId());

        // JSON을 TestStep 리스트로 역직렬화
        if (version.getStepsJson() != null) {
            try {
                List<TestStep> steps = objectMapper.readValue(version.getStepsJson(), new TypeReference<List<TestStep>>() {});
                testCase.setSteps(steps);
            } catch (JsonProcessingException e) {
                log.error("테스트 스텝 역직렬화 실패: {}", e.getMessage());
                testCase.setSteps(new ArrayList<>());
            }
        } else {
            testCase.setSteps(new ArrayList<>());
        }
    }

    // ============ 버전 비교 관련 메소드들 ============

    /**
     * 두 버전 간 차이점 비교
     */
    public Map<String, Object> compareVersions(String versionId1, String versionId2) {
        TestCaseVersion version1 = versionRepository.findById(versionId1)
                .orElseThrow(() -> new IllegalArgumentException("버전을 찾을 수 없습니다: " + versionId1));
        TestCaseVersion version2 = versionRepository.findById(versionId2)
                .orElseThrow(() -> new IllegalArgumentException("버전을 찾을 수 없습니다: " + versionId2));

        Map<String, Object> comparison = new HashMap<>();
        comparison.put("version1", convertToDto(version1));
        comparison.put("version2", convertToDto(version2));
        comparison.put("differences", findDifferences(version1, version2));
        comparison.put("hasSignificantChanges", hasSignificantChanges(version1, version2));

        return comparison;
    }

    /**
     * 두 버전 간의 구체적인 차이점 찾기
     */
    private List<Map<String, Object>> findDifferences(TestCaseVersion v1, TestCaseVersion v2) {
        List<Map<String, Object>> differences = new ArrayList<>();

        // 필드별 차이점 검사
        addDifferenceIfChanged(differences, "name", "테스트케이스 이름", v1.getName(), v2.getName());
        addDifferenceIfChanged(differences, "description", "설명", v1.getDescription(), v2.getDescription());
        addDifferenceIfChanged(differences, "preCondition", "사전 조건", v1.getPreCondition(), v2.getPreCondition());
        addDifferenceIfChanged(differences, "postCondition", "사후 조건", v1.getPostCondition(), v2.getPostCondition());
        addDifferenceIfChanged(differences, "expectedResults", "예상 결과", v1.getExpectedResults(), v2.getExpectedResults());
        addDifferenceIfChanged(differences, "priority", "우선순위", v1.getPriority(), v2.getPriority());
        addDifferenceIfChanged(
                differences,
                "isAutomated",
                "자동화 여부",
                v1.getIsAutomated() != null ? v1.getIsAutomated().toString() : null,
                v2.getIsAutomated() != null ? v2.getIsAutomated().toString() : null
        );
        addDifferenceIfChanged(differences, "executionType", "수행 유형", v1.getExecutionType(), v2.getExecutionType());
        addDifferenceIfChanged(differences, "testTechnique", "테스트 기법", v1.getTestTechnique(), v2.getTestTechnique());
        addDifferenceIfChanged(differences, "stepsJson", "테스트 스텝", v1.getStepsJson(), v2.getStepsJson());

        return differences;
    }

    private void addDifferenceIfChanged(List<Map<String, Object>> differences, String field, String fieldName, String value1, String value2) {
        if (!Objects.equals(value1, value2)) {
            Map<String, Object> diff = new HashMap<>();
            diff.put("field", field);
            diff.put("fieldName", fieldName);
            diff.put("oldValue", value1);
            diff.put("newValue", value2);
            differences.add(diff);
        }
    }

    /**
     * 중요한 변경사항이 있는지 판단
     */
    private boolean hasSignificantChanges(TestCaseVersion v1, TestCaseVersion v2) {
        return !Objects.equals(v1.getName(), v2.getName()) ||
               !Objects.equals(v1.getStepsJson(), v2.getStepsJson()) ||
               !Objects.equals(v1.getExpectedResults(), v2.getExpectedResults()) ||
               !Objects.equals(v1.getPostCondition(), v2.getPostCondition()) ||
               !Objects.equals(v1.getIsAutomated(), v2.getIsAutomated()) ||
               !Objects.equals(v1.getExecutionType(), v2.getExecutionType()) ||
               !Objects.equals(v1.getTestTechnique(), v2.getTestTechnique());
    }

    // ============ 버전 관리 유틸리티 메소드들 ============

    /**
     * 버전 라벨 자동 생성
     */
    private String generateVersionLabel(String changeType, Integer versionNumber) {
        return switch (changeType) {
            case "CREATE" -> "초기 버전";
            case "UPDATE" -> "수정 v" + versionNumber;
            case "MANUAL_SAVE" -> "수동 저장 v" + versionNumber;
            case "RESTORE" -> "복원 v" + versionNumber;
            default -> "v" + versionNumber;
        };
    }

    /**
     * 엔티티를 DTO로 변환
     */
    private TestCaseVersionDto convertToDto(TestCaseVersion version) {
        TestCaseVersionDto dto = new TestCaseVersionDto();
        dto.setId(version.getId());
        dto.setTestCaseId(version.getTestCaseId());
        dto.setProjectId(version.getProjectId());
        dto.setVersionNumber(version.getVersionNumber());
        dto.setVersionLabel(version.getVersionLabel());
        dto.setVersionDescription(version.getVersionDescription());
        dto.setIsCurrentVersion(version.getIsCurrentVersion());

        // 테스트케이스 데이터
        dto.setName(version.getName());
        dto.setType(version.getType());
        dto.setDescription(version.getDescription());
        dto.setPreCondition(version.getPreCondition());
        dto.setPostCondition(version.getPostCondition());
        dto.setIsAutomated(version.getIsAutomated());
        dto.setExecutionType(version.getExecutionType());
        dto.setTestTechnique(version.getTestTechnique());
        dto.setParentId(version.getParentId());
        dto.setExpectedResults(version.getExpectedResults());
        dto.setDisplayOrder(version.getDisplayOrder());
        dto.setPriority(version.getPriority());
        dto.setSequentialId(version.getSequentialId());
        dto.setDisplayId(version.getDisplayId());

        // TestStep JSON을 리스트로 변환
        if (version.getStepsJson() != null) {
            try {
                List<TestStep> steps = objectMapper.readValue(version.getStepsJson(), new TypeReference<List<TestStep>>() {});
                dto.setSteps(steps);
            } catch (JsonProcessingException e) {
                log.error("테스트 스텝 역직렬화 실패: {}", e.getMessage());
                dto.setSteps(new ArrayList<>());
            }
        }

        // 메타데이터
        dto.setCreatedAt(version.getCreatedAt());
        dto.setCreatedBy(version.getCreatedBy());
        dto.setCreatedByName(version.getCreatedByName());
        dto.setOriginalUpdatedAt(version.getOriginalUpdatedAt());
        dto.setChangeType(version.getChangeType());
        dto.setChangeSummary(version.getChangeSummary());
        dto.setVersionTag(version.getVersionTag());
        dto.setUsageCount(version.getUsageCount());

        return dto;
    }

    // ============ 버전 정리 및 유지보수 ============

    /**
     * 오래된 버전들 정리 (최신 N개만 유지)
     */
    @Transactional
    public int cleanupOldVersions(String testCaseId, int keepCount) {
        Integer maxVersion = versionRepository.findMaxVersionNumberByTestCaseId(testCaseId);
        if (maxVersion <= keepCount) {
            return 0; // 정리할 버전이 없음
        }

        int deleteFromVersion = maxVersion - keepCount + 1;
        return versionRepository.deleteOldVersions(testCaseId, deleteFromVersion);
    }

    /**
     * DRAFT 태그 버전들 정리
     */
    @Transactional
    public int cleanupDraftVersions(LocalDateTime cutoffDate) {
        return versionRepository.deleteDraftVersionsOlderThan(cutoffDate);
    }
}
