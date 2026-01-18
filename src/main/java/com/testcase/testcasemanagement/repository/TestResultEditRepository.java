// src/main/java/com/testcase/testcasemanagement/repository/TestResultEditRepository.java

package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestResultEdit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * ICT-209: 테스트 결과 편집 데이터 액세스 계층
 */
@Repository
public interface TestResultEditRepository extends JpaRepository<TestResultEdit, String> {

       /**
        * 특정 테스트 결과의 활성 편집본 조회
        */
       @Query("SELECT e FROM TestResultEdit e WHERE e.originalTestResult.id = :testResultId AND e.isActive = true")
       Optional<TestResultEdit> findActiveEditByTestResultId(@Param("testResultId") String testResultId);

       /**
        * 특정 테스트 결과의 모든 편집본 조회 (최신순)
        */
       @Query("SELECT e FROM TestResultEdit e WHERE e.originalTestResult.id = :testResultId ORDER BY e.editVersion DESC, e.createdAt DESC")
       List<TestResultEdit> findAllEditsByTestResultId(@Param("testResultId") String testResultId);

       /**
        * 사용자가 생성한 편집본 목록 조회
        */
       @Query("SELECT e FROM TestResultEdit e WHERE e.editedBy.id = :userId ORDER BY e.createdAt DESC")
       Page<TestResultEdit> findEditsByUserId(@Param("userId") String userId, Pageable pageable);

       /**
        * 승인 대기 중인 편집본 목록 조회
        */
       @Query("SELECT e FROM TestResultEdit e WHERE e.editStatus = 'PENDING' ORDER BY e.createdAt ASC")
       Page<TestResultEdit> findPendingEdits(Pageable pageable);

       /**
        * 특정 프로젝트의 편집본 목록 조회
        */
       @Query("SELECT e FROM TestResultEdit e " +
                     "JOIN e.originalTestResult tr " +
                     "JOIN tr.testExecution te " +
                     "WHERE te.project.id = :projectId " +
                     "ORDER BY e.createdAt DESC")
       Page<TestResultEdit> findEditsByProjectId(@Param("projectId") String projectId, Pageable pageable);

       /**
        * 특정 테스트 실행의 편집본 목록 조회
        */
       @Query("SELECT e FROM TestResultEdit e " +
                     "JOIN e.originalTestResult tr " +
                     "WHERE tr.testExecution.id = :executionId " +
                     "ORDER BY e.createdAt DESC")
       Page<TestResultEdit> findEditsByExecutionId(@Param("executionId") String executionId, Pageable pageable);

       /**
        * 편집 상태별 편집본 조회
        */
       @Query("SELECT e FROM TestResultEdit e WHERE e.editStatus = :status ORDER BY e.createdAt DESC")
       Page<TestResultEdit> findEditsByStatus(@Param("status") TestResultEdit.EditStatus status, Pageable pageable);

       /**
        * 특정 기간 내 편집본 조회
        */
       @Query("SELECT e FROM TestResultEdit e WHERE e.createdAt BETWEEN :fromDate AND :toDate ORDER BY e.createdAt DESC")
       Page<TestResultEdit> findEditsByDateRange(@Param("fromDate") LocalDateTime fromDate,
                     @Param("toDate") LocalDateTime toDate,
                     Pageable pageable);

       /**
        * 테스트 결과의 다음 편집 버전 번호 조회
        */
       @Query("SELECT COALESCE(MAX(e.editVersion), 0) + 1 FROM TestResultEdit e WHERE e.originalTestResult.id = :testResultId")
       Integer getNextEditVersion(@Param("testResultId") String testResultId);

       /**
        * 특정 테스트 결과의 기존 활성 편집본 비활성화
        */
       @Modifying
       @Query("UPDATE TestResultEdit e SET e.isActive = false WHERE e.originalTestResult.id = :testResultId AND e.isActive = true")
       int deactivateAllEditsForTestResult(@Param("testResultId") String testResultId);

       /**
        * 편집 통계 조회 - 전체 편집본 수
        */
       @Query("SELECT COUNT(e) FROM TestResultEdit e")
       long countTotalEdits();

       /**
        * 편집 통계 조회 - 상태별 편집본 수
        */
       @Query("SELECT COUNT(e) FROM TestResultEdit e WHERE e.editStatus = :status")
       long countEditsByStatus(@Param("status") TestResultEdit.EditStatus status);

       /**
        * 편집 통계 조회 - 사용자별 편집본 수
        */
       @Query("SELECT COUNT(e) FROM TestResultEdit e WHERE e.editedBy.id = :userId")
       long countEditsByUserId(@Param("userId") String userId);

       /**
        * 편집 통계 조회 - 승인율 계산용
        */
       @Query("SELECT COUNT(e) FROM TestResultEdit e WHERE e.editStatus IN ('APPROVED', 'APPLIED')")
       long countApprovedEdits();

       /**
        * 복합 조건 편집본 검색
        */
       @Query("SELECT e FROM TestResultEdit e " +
                     "JOIN e.originalTestResult tr " +
                     "JOIN tr.testExecution te " +
                     "WHERE (:projectId IS NULL OR te.project.id = :projectId) " +
                     "AND (:executionId IS NULL OR tr.testExecution.id = :executionId) " +
                     "AND (:editedByUserId IS NULL OR e.editedBy.id = :editedByUserId) " +
                     "AND (:status IS NULL OR e.editStatus = :status) " +
                     "AND (:activeOnly IS NULL OR :activeOnly = false OR e.isActive = true) " +
                     "AND (:fromDate IS NULL OR e.createdAt >= :fromDate) " +
                     "AND (:toDate IS NULL OR e.createdAt <= :toDate) " +
                     "ORDER BY e.createdAt DESC")
       Page<TestResultEdit> findEditsByFilter(@Param("projectId") String projectId,
                     @Param("executionId") String executionId,
                     @Param("editedByUserId") String editedByUserId,
                     @Param("status") TestResultEdit.EditStatus status,
                     @Param("activeOnly") Boolean activeOnly,
                     @Param("fromDate") LocalDateTime fromDate,
                     @Param("toDate") LocalDateTime toDate,
                     Pageable pageable);

       /**
        * 사용자가 승인해야 할 편집본 목록 (관리자/승인권한자용)
        */
       @Query("SELECT e FROM TestResultEdit e " +
                     "JOIN e.originalTestResult tr " +
                     "JOIN tr.testExecution te " +
                     "WHERE e.editStatus = 'PENDING' " +
                     "AND e.editedBy.id != :approverId " +
                     "ORDER BY e.createdAt ASC")
       Page<TestResultEdit> findPendingEditsForApprover(@Param("approverId") String approverId, Pageable pageable);

       /**
        * 최근 활동 편집본 조회 (대시보드용)
        */
       @Query("SELECT e FROM TestResultEdit e " +
                     "WHERE e.createdAt >= :sinceDate " +
                     "ORDER BY e.createdAt DESC")
       List<TestResultEdit> findRecentEdits(@Param("sinceDate") LocalDateTime sinceDate, Pageable pageable);
}