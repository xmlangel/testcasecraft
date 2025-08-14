// src/main/java/com/testcase/testcasemanagement/repository/JunitTestResultRepository.java

package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.JunitTestResult;
import com.testcase.testcasemanagement.model.JunitProcessStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * ICT-203: JUnit 테스트 결과 Repository
 */
@Repository
public interface JunitTestResultRepository extends JpaRepository<JunitTestResult, String> {
    
    /**
     * 프로젝트별 테스트 결과 조회 (페이징)
     */
    Page<JunitTestResult> findByProjectIdOrderByUploadedAtDesc(String projectId, Pageable pageable);
    
    /**
     * 프로젝트별 완료된 테스트 결과 조회
     */
    List<JunitTestResult> findByProjectIdAndStatusOrderByUploadedAtDesc(String projectId, JunitProcessStatus status);
    
    /**
     * 사용자별 업로드한 테스트 결과 조회
     */
    List<JunitTestResult> findByUploadedBy_IdOrderByUploadedAtDesc(String userId);
    
    /**
     * 특정 기간 내 업로드된 테스트 결과 조회
     */
    @Query("SELECT jtr FROM JunitTestResult jtr WHERE jtr.uploadedAt BETWEEN :startDate AND :endDate ORDER BY jtr.uploadedAt DESC")
    List<JunitTestResult> findByUploadedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                                 @Param("endDate") LocalDateTime endDate);
    
    /**
     * 프로젝트별 테스트 결과 통계
     */
    @Query("SELECT COUNT(jtr), SUM(jtr.totalTests), SUM(jtr.failures), SUM(jtr.errors) " +
           "FROM JunitTestResult jtr WHERE jtr.projectId = :projectId AND jtr.status = :status")
    Object[] getProjectStatistics(@Param("projectId") String projectId, @Param("status") JunitProcessStatus status);
    
    /**
     * 체크섬으로 중복 파일 확인
     */
    Optional<JunitTestResult> findByProjectIdAndFileChecksum(String projectId, String checksum);
    
    /**
     * 실패한 처리 상태의 테스트 결과 조회 (재처리 대상)
     */
    List<JunitTestResult> findByStatusAndUploadedAtBefore(JunitProcessStatus status, LocalDateTime before);
    
    /**
     * 프로젝트별 최근 테스트 결과 조회 (제한된 개수)
     */
    @Query("SELECT jtr FROM JunitTestResult jtr WHERE jtr.projectId = :projectId AND jtr.status = :status " +
           "ORDER BY jtr.uploadedAt DESC")
    List<JunitTestResult> findRecentByProject(@Param("projectId") String projectId, 
                                            @Param("status") JunitProcessStatus status, 
                                            Pageable pageable);
    
    /**
     * 파일명으로 검색
     */
    @Query("SELECT jtr FROM JunitTestResult jtr WHERE jtr.projectId = :projectId " +
           "AND (jtr.fileName LIKE %:searchTerm% OR jtr.testExecutionName LIKE %:searchTerm%) " +
           "ORDER BY jtr.uploadedAt DESC")
    Page<JunitTestResult> searchByProjectAndFileName(@Param("projectId") String projectId, 
                                                   @Param("searchTerm") String searchTerm, 
                                                   Pageable pageable);
    
    /**
     * 프로젝트별 모든 테스트 결과 조회 (ICT-211)
     */
    List<JunitTestResult> findByProjectIdOrderByUploadedAtDesc(String projectId);
}