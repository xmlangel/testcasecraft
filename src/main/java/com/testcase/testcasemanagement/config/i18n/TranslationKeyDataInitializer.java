// src/main/java/com/testcase/testcasemanagement/config/i18n/TranslationKeyDataInitializer.java
package com.testcase.testcasemanagement.config.i18n;

import com.testcase.testcasemanagement.config.i18n.keys.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class TranslationKeyDataInitializer {

    private final AuthKeysInitializer authKeysInitializer;
    private final CommonKeysInitializer commonKeysInitializer;
    private final DashboardKeysInitializer dashboardKeysInitializer;
    private final OrganizationKeysInitializer organizationKeysInitializer;
    private final ProjectKeysInitializer projectKeysInitializer;
    private final TestCaseKeysInitializer testCaseKeysInitializer;
    private final TestExecutionKeysInitializer testExecutionKeysInitializer;
    private final TestPlanKeysInitializer testPlanKeysInitializer;
    private final TestResultKeysInitializer testResultKeysInitializer;
    private final UserManagementKeysInitializer userManagementKeysInitializer;
    private final MailKeysInitializer mailKeysInitializer;
    private final TranslationKeysInitializer translationKeysInitializer;
    private final RAGKeysInitializer ragKeysInitializer;
    private final AttachmentKeysInitializer attachmentKeysInitializer;

    @Transactional
    public void initialize() {
        log.info("번역 키 데이터 초기화 중...");

        authKeysInitializer.initialize();
        commonKeysInitializer.initialize();
        dashboardKeysInitializer.initialize();
        organizationKeysInitializer.initialize();
        projectKeysInitializer.initialize();
        testCaseKeysInitializer.initialize();
        testExecutionKeysInitializer.initialize();
        testPlanKeysInitializer.initialize();
        testResultKeysInitializer.initialize();
        userManagementKeysInitializer.initialize();
        mailKeysInitializer.initialize();
        translationKeysInitializer.initialize();
        ragKeysInitializer.initialize();
        attachmentKeysInitializer.initialize();

        log.info("번역 키 데이터 초기화 완료");
    }
}