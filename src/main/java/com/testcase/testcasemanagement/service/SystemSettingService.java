package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.model.SystemSetting;
import com.testcase.testcasemanagement.repository.SystemSettingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 전역 시스템 설정을 관리하는 서비스
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SystemSettingService {

    private final SystemSettingRepository systemSettingRepository;

    /**
     * 특정 키의 설정값을 조회.
     * 캐시 처리를 통해 반복적인 DB 조회 방지
     */
    @Cacheable(value = "systemSettings", key = "#key")
    public String getSetting(String key, String defaultValue) {
        return systemSettingRepository.findBySettingKey(key)
                .map(SystemSetting::getSettingValue)
                .orElse(defaultValue);
    }

    /**
     * 특정 키의 설정값을 Boolean 타입으로 조회
     */
    public boolean getBooleanSetting(String key, boolean defaultValue) {
        String strValue = getSetting(key, String.valueOf(defaultValue));
        return Boolean.parseBoolean(strValue);
    }

    /**
     * 설정값 업데이트 및 캐시 갱신
     */
    @Transactional
    @CacheEvict(value = "systemSettings", key = "#key")
    public void updateSetting(String key, String value, String description) {
        SystemSetting setting = systemSettingRepository.findBySettingKey(key)
                .orElseGet(() -> SystemSetting.builder()
                        .settingKey(key)
                        .settingValue(value)
                        .description(description)
                        .build());

        setting.setSettingValue(value);
        if (description != null) {
            setting.setDescription(description);
        }

        systemSettingRepository.save(setting);
        log.info("System setting updated: {} = {}", key, value);
    }

    /**
     * Boolean 설정 업데이트 편의 메서드
     */
    @Transactional
    public void updateBooleanSetting(String key, boolean value, String description) {
        updateSetting(key, String.valueOf(value), description);
    }
}
