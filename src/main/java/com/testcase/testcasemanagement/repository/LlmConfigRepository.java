// src/main/java/com/testcase/testcasemanagement/repository/LlmConfigRepository.java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.LlmConfig;
import com.testcase.testcasemanagement.model.LlmConfig.LlmProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * LLM 설정 Repository
 * LLM 설정 정보를 관리하는 JPA Repository 인터페이스
 */
@Repository
public interface LlmConfigRepository extends JpaRepository<LlmConfig, String> {

    /**
     * 기본 설정 조회
     * 시스템에서 기본으로 사용할 LLM 설정을 반환합니다.
     */
    Optional<LlmConfig> findByIsDefaultTrueAndIsActiveTrue();

    /**
     * 모든 활성화된 설정 조회 (최근 생성순)
     */
    List<LlmConfig> findByIsActiveTrueOrderByCreatedAtDesc();

    /**
     * 모든 설정 조회 (활성화 여부 무관, 최근 생성순)
     */
    List<LlmConfig> findAllByOrderByCreatedAtDesc();

    /**
     * 제공자별 활성화된 설정 조회
     */
    List<LlmConfig> findByProviderAndIsActiveTrueOrderByCreatedAtDesc(LlmProvider provider);

    /**
     * 설정 이름으로 조회 (중복 체크용)
     */
    Optional<LlmConfig> findByName(String name);

    /**
     * 설정 이름으로 존재 여부 확인
     */
    boolean existsByName(String name);

    /**
     * 특정 ID를 제외한 설정 이름 존재 여부 확인 (수정 시 사용)
     */
    boolean existsByNameAndIdNot(String name, String id);

    /**
     * 연결 상태가 검증된 설정들 조회
     */
    @Query("SELECT l FROM LlmConfig l WHERE l.connectionVerified = true AND l.isActive = true ORDER BY l.createdAt DESC")
    List<LlmConfig> findAllVerifiedConfigs();

    /**
     * 연결 테스트가 오래된 설정들 조회
     * @param threshold 기준 시간 (이 시간 이전에 테스트된 설정들 조회)
     */
    @Query("SELECT l FROM LlmConfig l WHERE l.isActive = true AND " +
           "(l.lastConnectionTest IS NULL OR l.lastConnectionTest < :threshold)")
    List<LlmConfig> findConfigsNeedingConnectionTest(@Param("threshold") LocalDateTime threshold);

    /**
     * 연결 실패한 설정들 조회
     */
    @Query("SELECT l FROM LlmConfig l WHERE l.connectionVerified = false AND l.isActive = true ORDER BY l.lastConnectionTest DESC")
    List<LlmConfig> findFailedConnections();

    /**
     * 전체 활성화된 설정 개수 조회
     */
    long countByIsActiveTrue();

    /**
     * 제공자별 활성화된 설정 개수 조회
     */
    long countByProviderAndIsActiveTrue(LlmProvider provider);

    /**
     * 모든 기본 설정 플래그를 false로 변경
     * 새로운 기본 설정을 지정하기 전에 실행합니다.
     */
    @Modifying
    @Query("UPDATE LlmConfig l SET l.isDefault = false WHERE l.isDefault = true")
    void clearDefaultFlag();

    /**
     * 특정 설정을 기본 설정으로 지정
     */
    @Modifying
    @Query("UPDATE LlmConfig l SET l.isDefault = CASE WHEN l.id = :id THEN true ELSE false END")
    void setDefaultConfig(@Param("id") String id);
}
