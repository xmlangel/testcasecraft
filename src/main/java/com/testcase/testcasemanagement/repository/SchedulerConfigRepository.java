package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.SchedulerConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 스케줄러 설정 Repository
 */
@Repository
public interface SchedulerConfigRepository extends JpaRepository<SchedulerConfig, Long> {

    /**
     * 작업 키로 설정 조회
     */
    Optional<SchedulerConfig> findByTaskKey(String taskKey);

    /**
     * 활성화된 스케줄만 조회
     */
    List<SchedulerConfig> findAllByEnabledTrue();

    /**
     * 작업 키 존재 여부 확인
     */
    boolean existsByTaskKey(String taskKey);
}
