package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SystemSettingRepository extends JpaRepository<SystemSetting, String> {

    Optional<SystemSetting> findBySettingKey(String settingKey);

}
