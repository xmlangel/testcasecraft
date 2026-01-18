// src/main/java/com/testcase/testcasemanagement/repository/JiraConfigRepository.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.JiraConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface JiraConfigRepository extends JpaRepository<JiraConfig, String> {

    /**
     * 사용자의 활성화된 JIRA 설정 조회
     */
    Optional<JiraConfig> findByUserIdAndIsActiveTrue(String userId);

    /**
     * 시스템의 첫 번째 활성화된 JIRA 설정 조회 (Fallback용)
     */
    Optional<JiraConfig> findFirstByIsActiveTrue();

    /**
     * 사용자의 모든 JIRA 설정 조회 (활성/비활성 포함)
     */
    List<JiraConfig> findByUserIdOrderByCreatedAtDesc(String userId);

    /**
     * 특정 서버 URL을 사용하는 모든 설정 조회
     */
    List<JiraConfig> findByServerUrlContainingIgnoreCase(String serverUrl);

    /**
     * 연결 상태가 검증된 설정들 조회
     */
    @Query("SELECT j FROM JiraConfig j WHERE j.connectionVerified = true AND j.isActive = true")
    List<JiraConfig> findAllVerifiedConfigs();

    /**
     * 연결 테스트가 오래된 설정들 조회
     */
    @Query("SELECT j FROM JiraConfig j WHERE j.isActive = true AND " +
            "(j.lastConnectionTest IS NULL OR j.lastConnectionTest < :threshold)")
    List<JiraConfig> findConfigsNeedingConnectionTest(@Param("threshold") LocalDateTime threshold);

    /**
     * 특정 사용자의 연결 실패한 설정들 조회
     */
    @Query("SELECT j FROM JiraConfig j WHERE j.userId = :userId AND j.connectionVerified = false")
    List<JiraConfig> findFailedConnectionsByUser(@Param("userId") String userId);

    /**
     * 사용자별 JIRA 설정 개수 조회
     */
    long countByUserId(String userId);

    /**
     * 전체 활성화된 JIRA 설정 개수 조회
     */
    long countByIsActiveTrue();
}