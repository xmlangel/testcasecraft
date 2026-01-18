// src/main/java/com/testcase/testcasemanagement/repository/TestCaseVersionRepository.java

package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.TestCaseVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * ICT-349: 테스트케이스 버전 관리 시스템 - Repository
 * 
 * TestCaseVersion 엔티티에 대한 데이터베이스 액세스 계층
 */
@Repository
public interface TestCaseVersionRepository extends JpaRepository<TestCaseVersion, String> {

    // ============ 기본 조회 쿼리 ============

    /**
     * 특정 테스트케이스의 모든 버전 조회 (버전 번호 내림차순)
     */
    @Query("SELECT v FROM TestCaseVersion v WHERE v.testCaseId = :testCaseId ORDER BY v.versionNumber DESC")
    List<TestCaseVersion> findByTestCaseIdOrderByVersionNumberDesc(@Param("testCaseId") String testCaseId);

    /**
     * 특정 테스트케이스의 모든 버전 조회 (생성 시간 내림차순)
     */
    @Query("SELECT v FROM TestCaseVersion v WHERE v.testCaseId = :testCaseId ORDER BY v.createdAt DESC")
    List<TestCaseVersion> findByTestCaseIdOrderByCreatedAtDesc(@Param("testCaseId") String testCaseId);

    /**
     * 특정 테스트케이스의 현재 활성 버전 조회
     */
    @Query("SELECT v FROM TestCaseVersion v WHERE v.testCaseId = :testCaseId AND v.isCurrentVersion = true")
    Optional<TestCaseVersion> findCurrentVersionByTestCaseId(@Param("testCaseId") String testCaseId);

    /**
     * 특정 테스트케이스의 특정 버전 번호 조회
     */
    @Query("SELECT v FROM TestCaseVersion v WHERE v.testCaseId = :testCaseId AND v.versionNumber = :versionNumber")
    Optional<TestCaseVersion> findByTestCaseIdAndVersionNumber(@Param("testCaseId") String testCaseId, 
                                                               @Param("versionNumber") Integer versionNumber);

    /**
     * 특정 테스트케이스의 최신 버전 번호 조회
     */
    @Query("SELECT COALESCE(MAX(v.versionNumber), 0) FROM TestCaseVersion v WHERE v.testCaseId = :testCaseId")
    Integer findMaxVersionNumberByTestCaseId(@Param("testCaseId") String testCaseId);

    // ============ 프로젝트 레벨 조회 ============

    /**
     * 특정 프로젝트의 모든 버전 조회 (최신순)
     */
    @Query("SELECT v FROM TestCaseVersion v WHERE v.projectId = :projectId ORDER BY v.createdAt DESC")
    List<TestCaseVersion> findByProjectIdOrderByCreatedAtDesc(@Param("projectId") String projectId);

    /**
     * 특정 프로젝트의 현재 활성 버전들만 조회
     */
    @Query("SELECT v FROM TestCaseVersion v WHERE v.projectId = :projectId AND v.isCurrentVersion = true ORDER BY v.name")
    List<TestCaseVersion> findCurrentVersionsByProjectId(@Param("projectId") String projectId);

    /**
     * 특정 프로젝트의 버전 통계 조회
     */
    @Query("SELECT COUNT(DISTINCT v.testCaseId) as totalTestCases, COUNT(v) as totalVersions FROM TestCaseVersion v WHERE v.projectId = :projectId")
    Object[] countVersionStatisticsByProjectId(@Param("projectId") String projectId);

    // ============ 버전 관리 쿼리 ============

    /**
     * 특정 테스트케이스의 모든 버전을 비활성 상태로 변경
     */
    @Modifying
    @Query("UPDATE TestCaseVersion v SET v.isCurrentVersion = false WHERE v.testCaseId = :testCaseId")
    int deactivateAllVersionsForTestCase(@Param("testCaseId") String testCaseId);

    /**
     * 특정 버전을 현재 버전으로 설정 (트랜잭션 내에서 사용)
     */
    @Modifying
    @Query("UPDATE TestCaseVersion v SET v.isCurrentVersion = true, v.usageCount = v.usageCount + 1 WHERE v.id = :versionId")
    int activateVersion(@Param("versionId") String versionId);

    /**
     * 특정 테스트케이스의 오래된 버전들 삭제 (최신 N개 버전만 유지)
     */
    @Modifying
    @Query("DELETE FROM TestCaseVersion v WHERE v.testCaseId = :testCaseId AND v.versionNumber < :keepFromVersion")
    int deleteOldVersions(@Param("testCaseId") String testCaseId, @Param("keepFromVersion") Integer keepFromVersion);

    // ============ 검색 및 필터링 ============

    /**
     * 특정 기간 내에 생성된 버전들 조회
     */
    @Query("SELECT v FROM TestCaseVersion v WHERE v.projectId = :projectId AND v.createdAt BETWEEN :startDate AND :endDate ORDER BY v.createdAt DESC")
    List<TestCaseVersion> findByProjectIdAndCreatedAtBetween(@Param("projectId") String projectId,
                                                             @Param("startDate") LocalDateTime startDate,
                                                             @Param("endDate") LocalDateTime endDate);

    /**
     * 특정 사용자가 생성한 버전들 조회
     */
    @Query("SELECT v FROM TestCaseVersion v WHERE v.projectId = :projectId AND v.createdBy = :userId ORDER BY v.createdAt DESC")
    List<TestCaseVersion> findByProjectIdAndCreatedBy(@Param("projectId") String projectId, @Param("userId") String userId);

    /**
     * 버전 태그별 조회
     */
    @Query("SELECT v FROM TestCaseVersion v WHERE v.projectId = :projectId AND v.versionTag = :tag ORDER BY v.createdAt DESC")
    List<TestCaseVersion> findByProjectIdAndVersionTag(@Param("projectId") String projectId, @Param("tag") String tag);

    /**
     * 버전 이름 검색
     */
    @Query("SELECT v FROM TestCaseVersion v WHERE v.projectId = :projectId AND (v.name LIKE %:searchTerm% OR v.versionLabel LIKE %:searchTerm% OR v.versionDescription LIKE %:searchTerm%) ORDER BY v.createdAt DESC")
    List<TestCaseVersion> findByProjectIdAndSearchTerm(@Param("projectId") String projectId, @Param("searchTerm") String searchTerm);

    // ============ 통계 및 분석 ============

    /**
     * 가장 많이 사용된 버전들 조회
     */
    @Query("SELECT v FROM TestCaseVersion v WHERE v.projectId = :projectId ORDER BY v.usageCount DESC, v.createdAt DESC")
    List<TestCaseVersion> findMostUsedVersionsByProjectId(@Param("projectId") String projectId);

    /**
     * 특정 테스트케이스의 버전 변경 이력 (변경 유형별)
     */
    @Query("SELECT v FROM TestCaseVersion v WHERE v.testCaseId = :testCaseId AND v.changeType = :changeType ORDER BY v.versionNumber")
    List<TestCaseVersion> findByTestCaseIdAndChangeType(@Param("testCaseId") String testCaseId, @Param("changeType") String changeType);

    /**
     * 버전 수가 많은 테스트케이스 조회 (버전 관리가 활발한 테스트케이스)
     */
    @Query("SELECT v.testCaseId, COUNT(v) as versionCount FROM TestCaseVersion v WHERE v.projectId = :projectId GROUP BY v.testCaseId ORDER BY versionCount DESC")
    List<Object[]> findTestCasesWithMostVersions(@Param("projectId") String projectId);

    // ============ 정리 및 유지보수 ============

    /**
     * 특정 날짜 이전의 DRAFT 태그 버전들 삭제
     */
    @Modifying
    @Query("DELETE FROM TestCaseVersion v WHERE v.versionTag = 'DRAFT' AND v.createdAt < :cutoffDate")
    int deleteDraftVersionsOlderThan(@Param("cutoffDate") LocalDateTime cutoffDate);

    /**
     * 사용되지 않는 버전들 조회 (usageCount가 0인 버전)
     */
    @Query("SELECT v FROM TestCaseVersion v WHERE v.projectId = :projectId AND v.usageCount = 0 AND v.isCurrentVersion = false ORDER BY v.createdAt")
    List<TestCaseVersion> findUnusedVersionsByProjectId(@Param("projectId") String projectId);

    /**
     * 테스트케이스 삭제 시 모든 버전도 함께 삭제
     */
    @Modifying
    @Query("DELETE FROM TestCaseVersion v WHERE v.testCaseId = :testCaseId")
    int deleteAllVersionsForTestCase(@Param("testCaseId") String testCaseId);
}