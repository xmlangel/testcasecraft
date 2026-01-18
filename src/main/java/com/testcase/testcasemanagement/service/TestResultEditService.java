// src/main/java/com/testcase/testcasemanagement/service/TestResultEditService.java

package com.testcase.testcasemanagement.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.dto.TestResultEditDto;
import com.testcase.testcasemanagement.model.TestResult;
import com.testcase.testcasemanagement.model.TestResultEdit;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.TestResultEditRepository;
import com.testcase.testcasemanagement.repository.TestResultRepository;
import com.testcase.testcasemanagement.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * ICT-209: 테스트 결과 편집 서비스
 * 원본 데이터 보존과 편집 이력 추적을 담당
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TestResultEditService {

    private final TestResultEditRepository editRepository;
    private final TestResultRepository testResultRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    /**
     * 새로운 편집본 생성
     */
    public TestResultEditDto createEdit(TestResultEditDto.CreateEditRequestDto request, String currentUserId) {
        log.info("Creating edit for test result: {} by user: {}", request.getOriginalTestResultId(), currentUserId);

        // 원본 테스트 결과 조회
        TestResult originalTestResult = testResultRepository.findById(request.getOriginalTestResultId())
                .orElseThrow(
                        () -> new IllegalArgumentException("테스트 결과를 찾을 수 없습니다: " + request.getOriginalTestResultId()));

        // 현재 사용자 조회
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + currentUserId));

        // 다음 편집 버전 번호 생성
        Integer nextVersion = editRepository.getNextEditVersion(request.getOriginalTestResultId());

        // 원본 데이터 스냅샷 생성
        String originalSnapshot = createOriginalSnapshot(originalTestResult);

        // 편집본 생성
        TestResultEdit edit = new TestResultEdit();
        edit.setOriginalTestResult(originalTestResult);
        edit.setEditedTestCaseName(request.getEditedTestCaseName());
        edit.setEditedResult(request.getEditedResult());
        edit.setEditedNotes(request.getEditedNotes());
        edit.setEditedJiraIssueKey(request.getEditedJiraIssueKey());
        edit.setEditedJiraIssueUrl(request.getEditedJiraIssueUrl());
        edit.setAddedTags(convertTagsToJson(request.getAddedTags()));
        edit.setEditReason(request.getEditReason());
        edit.setEditedBy(currentUser);
        edit.setEditVersion(nextVersion);
        edit.setOriginalSnapshot(originalSnapshot);
        edit.setCreatedAt(LocalDateTime.now());

        // 편집 상태 설정
        if (Boolean.TRUE.equals(request.getSaveAsDraft())) {
            edit.setEditStatus(TestResultEdit.EditStatus.DRAFT);
        } else {
            edit.setEditStatus(TestResultEdit.EditStatus.PENDING);
        }

        edit = editRepository.save(edit);
        log.info("Edit created successfully: {}", edit.getId());

        return convertToDto(edit);
    }

    /**
     * 편집본 수정 (DRAFT 상태만 가능)
     */
    public TestResultEditDto updateEdit(String editId, TestResultEditDto.CreateEditRequestDto request,
            String currentUserId) {
        log.info("Updating edit: {} by user: {}", editId, currentUserId);

        TestResultEdit edit = editRepository.findById(editId)
                .orElseThrow(() -> new IllegalArgumentException("편집본을 찾을 수 없습니다: " + editId));

        // 권한 확인
        if (!edit.getEditedBy().getId().equals(currentUserId)) {
            throw new IllegalArgumentException("편집 권한이 없습니다");
        }

        // 편집 가능 상태 확인
        if (!edit.isEditable()) {
            throw new IllegalArgumentException("편집할 수 없는 상태입니다: " + edit.getEditStatus());
        }

        // 편집 내용 업데이트
        edit.setEditedTestCaseName(request.getEditedTestCaseName());
        edit.setEditedResult(request.getEditedResult());
        edit.setEditedNotes(request.getEditedNotes());
        edit.setEditedJiraIssueKey(request.getEditedJiraIssueKey());
        edit.setEditedJiraIssueUrl(request.getEditedJiraIssueUrl());
        edit.setAddedTags(convertTagsToJson(request.getAddedTags()));
        edit.setEditReason(request.getEditReason());

        // 상태 업데이트
        if (Boolean.TRUE.equals(request.getSaveAsDraft())) {
            edit.setEditStatus(TestResultEdit.EditStatus.DRAFT);
        } else {
            edit.setEditStatus(TestResultEdit.EditStatus.PENDING);
        }

        edit = editRepository.save(edit);
        log.info("Edit updated successfully: {}", edit.getId());

        return convertToDto(edit);
    }

    /**
     * 편집본 승인/거부
     */
    public TestResultEditDto processEditApproval(TestResultEditDto.EditApprovalRequestDto request, String approverId) {
        log.info("Processing edit approval: {} by approver: {}", request.getEditId(), approverId);

        TestResultEdit edit = editRepository.findById(request.getEditId())
                .orElseThrow(() -> new IllegalArgumentException("편집본을 찾을 수 없습니다: " + request.getEditId()));

        User approver = userRepository.findById(approverId)
                .orElseThrow(() -> new IllegalArgumentException("승인자를 찾을 수 없습니다: " + approverId));

        // 승인 대기 상태 확인
        if (edit.getEditStatus() != TestResultEdit.EditStatus.PENDING) {
            throw new IllegalArgumentException("승인 대기 상태가 아닙니다: " + edit.getEditStatus());
        }

        // 자가 승인 방지
        if (edit.getEditedBy().getId().equals(approverId)) {
            throw new IllegalArgumentException("자신의 편집본은 승인할 수 없습니다");
        }

        if (Boolean.TRUE.equals(request.getApproved())) {
            edit.approve(approver);
            log.info("Edit approved: {}", edit.getId());
        } else {
            edit.reject();
            log.info("Edit rejected: {}", edit.getId());
        }

        edit = editRepository.save(edit);
        return convertToDto(edit);
    }

    /**
     * 편집본 적용 (승인된 편집본을 활성화)
     */
    public TestResultEditDto.EditApplicationResultDto applyEdit(String editId, String applierId) {
        log.info("Applying edit: {} by user: {}", editId, applierId);

        TestResultEdit edit = editRepository.findById(editId)
                .orElseThrow(() -> new IllegalArgumentException("편집본을 찾을 수 없습니다: " + editId));

        User applier = userRepository.findById(applierId)
                .orElseThrow(() -> new IllegalArgumentException("적용자를 찾을 수 없습니다: " + applierId));

        // 승인된 상태 확인
        if (edit.getEditStatus() != TestResultEdit.EditStatus.APPROVED) {
            throw new IllegalArgumentException("승인된 편집본이 아닙니다: " + edit.getEditStatus());
        }

        try {
            // 기존 활성 편집본 비활성화
            editRepository.deactivateAllEditsForTestResult(edit.getOriginalTestResult().getId());

            // 현재 편집본 활성화
            edit.activate();
            edit.setApprovedBy(applier);
            edit = editRepository.save(edit);

            // 적용 결과 생성
            List<TestResultEditDto.EditComparisonDto> appliedChanges = generateComparisonChanges(edit);

            log.info("Edit applied successfully: {}", edit.getId());

            return TestResultEditDto.EditApplicationResultDto.builder()
                    .editId(edit.getId())
                    .originalTestResultId(edit.getOriginalTestResult().getId())
                    .success(true)
                    .message("편집본이 성공적으로 적용되었습니다")
                    .appliedChanges(appliedChanges)
                    .appliedAt(edit.getAppliedAt())
                    .appliedByUserId(applier.getId())
                    .appliedByUserName(applier.getUsername())
                    .build();

        } catch (Exception e) {
            log.error("Failed to apply edit: {}", editId, e);
            return TestResultEditDto.EditApplicationResultDto.builder()
                    .editId(edit.getId())
                    .originalTestResultId(edit.getOriginalTestResult().getId())
                    .success(false)
                    .message("편집본 적용 중 오류가 발생했습니다: " + e.getMessage())
                    .build();
        }
    }

    /**
     * 편집본 되돌리기
     */
    public TestResultEditDto revertEdit(String editId, String userId) {
        log.info("Reverting edit: {} by user: {}", editId, userId);

        TestResultEdit edit = editRepository.findById(editId)
                .orElseThrow(() -> new IllegalArgumentException("편집본을 찾을 수 없습니다: " + editId));

        // 적용된 편집본만 되돌리기 가능
        if (!edit.isApplied()) {
            throw new IllegalArgumentException("적용된 편집본만 되돌릴 수 있습니다");
        }

        edit.revert();
        edit = editRepository.save(edit);

        log.info("Edit reverted successfully: {}", edit.getId());
        return convertToDto(edit);
    }

    /**
     * 편집본 삭제 (DRAFT 상태만 가능)
     */
    public void deleteEdit(String editId, String userId) {
        log.info("Deleting edit: {} by user: {}", editId, userId);

        TestResultEdit edit = editRepository.findById(editId)
                .orElseThrow(() -> new IllegalArgumentException("편집본을 찾을 수 없습니다: " + editId));

        // 권한 확인
        if (!edit.getEditedBy().getId().equals(userId)) {
            throw new IllegalArgumentException("삭제 권한이 없습니다");
        }

        // DRAFT 상태만 삭제 가능
        if (edit.getEditStatus() != TestResultEdit.EditStatus.DRAFT) {
            throw new IllegalArgumentException("DRAFT 상태의 편집본만 삭제할 수 있습니다");
        }

        editRepository.delete(edit);
        log.info("Edit deleted successfully: {}", editId);
    }

    /**
     * 편집본 목록 조회 (필터링 지원)
     */
    @Transactional(readOnly = true)
    public Page<TestResultEditDto> getEdits(TestResultEditDto.EditFilterDto filter) {
        log.debug("Getting edits with filter: {}", filter);

        Pageable pageable = PageRequest.of(
                filter.getPage(),
                filter.getSize(),
                Sort.Direction.fromString(filter.getSortDirection()),
                filter.getSortBy());

        Page<TestResultEdit> edits = editRepository.findEditsByFilter(
                filter.getProjectId(),
                filter.getTestExecutionId(),
                filter.getEditedByUserId(),
                filter.getEditStatus(),
                filter.getActiveOnly(),
                filter.getFromDate(),
                filter.getToDate(),
                pageable);

        return edits.map(this::convertToDto);
    }

    /**
     * 특정 테스트 결과의 편집 이력 조회
     */
    @Transactional(readOnly = true)
    public List<TestResultEditDto> getEditHistory(String testResultId) {
        log.debug("Getting edit history for test result: {}", testResultId);

        List<TestResultEdit> edits = editRepository.findAllEditsByTestResultId(testResultId);
        return edits.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }

    /**
     * 편집 통계 조회
     */
    @Transactional(readOnly = true)
    public TestResultEditDto.EditStatisticsDto getEditStatistics(String userId) {
        log.debug("Getting edit statistics for user: {}", userId);

        long totalEdits = editRepository.countTotalEdits();
        long draftEdits = editRepository.countEditsByStatus(TestResultEdit.EditStatus.DRAFT);
        long pendingEdits = editRepository.countEditsByStatus(TestResultEdit.EditStatus.PENDING);
        long approvedEdits = editRepository.countEditsByStatus(TestResultEdit.EditStatus.APPROVED);
        long appliedEdits = editRepository.countEditsByStatus(TestResultEdit.EditStatus.APPLIED);
        long rejectedEdits = editRepository.countEditsByStatus(TestResultEdit.EditStatus.REJECTED);
        long revertedEdits = editRepository.countEditsByStatus(TestResultEdit.EditStatus.REVERTED);

        long approvedTotal = editRepository.countApprovedEdits();
        double approvalRate = totalEdits > 0 ? (double) approvedTotal / totalEdits * 100 : 0.0;

        long totalEditsByCurrentUser = userId != null ? editRepository.countEditsByUserId(userId) : 0;

        return TestResultEditDto.EditStatisticsDto.builder()
                .totalEdits(totalEdits)
                .draftEdits(draftEdits)
                .pendingEdits(pendingEdits)
                .approvedEdits(approvedEdits)
                .appliedEdits(appliedEdits)
                .rejectedEdits(rejectedEdits)
                .revertedEdits(revertedEdits)
                .approvalRate(approvalRate)
                .totalEditsByCurrentUser(totalEditsByCurrentUser)
                .build();
    }

    /**
     * 활성 편집본이 적용된 테스트 결과 조회
     */
    @Transactional(readOnly = true)
    public Optional<TestResultEditDto> getActiveEdit(String testResultId) {
        return editRepository.findActiveEditByTestResultId(testResultId)
                .map(this::convertToDto);
    }

    // Private helper methods

    private String createOriginalSnapshot(TestResult testResult) {
        try {
            TestResultEditDto.OriginalTestResultDto snapshot = TestResultEditDto.OriginalTestResultDto.builder()
                    .id(testResult.getId())
                    .testCaseId(testResult.getTestCaseId())
                    .result(testResult.getResult())
                    .notes(testResult.getNotes())
                    .jiraIssueKey(testResult.getJiraIssueKey())
                    .jiraIssueUrl(testResult.getJiraIssueUrl())
                    .executedAt(testResult.getExecutedAt())
                    .executorName(testResult.getExecutedBy() != null ? testResult.getExecutedBy().getUsername() : null)
                    .build();

            return objectMapper.writeValueAsString(snapshot);
        } catch (JsonProcessingException e) {
            log.error("Failed to create original snapshot", e);
            return "{}";
        }
    }

    private String convertTagsToJson(List<String> tags) {
        if (tags == null || tags.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(tags);
        } catch (JsonProcessingException e) {
            log.error("Failed to convert tags to JSON", e);
            return null;
        }
    }

    private List<String> convertTagsFromJson(String tagsJson) {
        if (tagsJson == null || tagsJson.trim().isEmpty()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(tagsJson,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
        } catch (JsonProcessingException e) {
            log.error("Failed to convert tags from JSON", e);
            return List.of();
        }
    }

    private List<TestResultEditDto.EditComparisonDto> generateComparisonChanges(TestResultEdit edit) {
        // 편집 변경 사항 비교 로직 구현
        // 원본 스냅샷과 편집된 내용을 비교하여 변경 사항 생성
        return List.of(); // 구현 예정
    }

    private TestResultEditDto convertToDto(TestResultEdit edit) {
        TestResult original = edit.getOriginalTestResult();

        return TestResultEditDto.builder()
                .id(edit.getId())
                .originalTestResultId(original.getId())
                .editedTestCaseName(edit.getEditedTestCaseName())
                .editedResult(edit.getEditedResult())
                .editedNotes(edit.getEditedNotes())
                .editedJiraIssueKey(edit.getEditedJiraIssueKey())
                .editedJiraIssueUrl(edit.getEditedJiraIssueUrl())
                .addedTags(convertTagsFromJson(edit.getAddedTags()))
                .editReason(edit.getEditReason())
                .editStatus(edit.getEditStatus())
                .isActive(edit.getIsActive())
                .editVersion(edit.getEditVersion())
                .createdAt(edit.getCreatedAt())
                .appliedAt(edit.getAppliedAt())
                .editedByUserId(edit.getEditedBy().getId())
                .editedByUserName(edit.getEditedBy().getUsername())
                .approvedByUserId(edit.getApprovedBy() != null ? edit.getApprovedBy().getId() : null)
                .approvedByUserName(edit.getApprovedBy() != null ? edit.getApprovedBy().getUsername() : null)
                .originalData(buildOriginalDataDto(original))
                .build();
    }

    private TestResultEditDto.OriginalTestResultDto buildOriginalDataDto(TestResult testResult) {
        return TestResultEditDto.OriginalTestResultDto.builder()
                .id(testResult.getId())
                .testCaseId(testResult.getTestCaseId())
                .result(testResult.getResult())
                .notes(testResult.getNotes())
                .jiraIssueKey(testResult.getJiraIssueKey())
                .jiraIssueUrl(testResult.getJiraIssueUrl())
                .executedAt(testResult.getExecutedAt())
                .executorName(testResult.getExecutedBy() != null ? testResult.getExecutedBy().getUsername() : null)
                .build();
    }
}