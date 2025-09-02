package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.MailSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MailSettingsRepository extends JpaRepository<MailSettings, Long> {
    
    /**
     * 활성화된 메일 설정 조회
     */
    Optional<MailSettings> findByMailEnabledTrue();
    
    /**
     * 가장 최근 메일 설정 조회 (created_at 기준 내림차순)
     */
    Optional<MailSettings> findFirstByOrderByCreatedAtDesc();
}