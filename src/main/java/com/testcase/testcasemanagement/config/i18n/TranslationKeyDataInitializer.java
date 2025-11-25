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
    private final RAGKeysInitializer ragKeysInitializer;
    private final AttachmentKeysInitializer attachmentKeysInitializer;
    private final SchedulerKeysInitializer schedulerKeysInitializer;

    // 리팩토링된 번역 키 초기화 클래스들 (TranslationKeysInitializer 분리)
    private final TranslationManagementKeysInitializer translationManagementKeysInitializer;
    private final JiraIntegrationKeysInitializer jiraIntegrationKeysInitializer;
    private final ExtendedUIKeysInitializer extendedUIKeysInitializer;

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
        ragKeysInitializer.initialize();
        attachmentKeysInitializer.initialize();
        schedulerKeysInitializer.initialize();

        // 리팩토링된 번역 키 초기화 (기존 TranslationKeysInitializer 대체)
        translationManagementKeysInitializer.initialize();
        jiraIntegrationKeysInitializer.initialize();
        extendedUIKeysInitializer.initialize();

        log.info("번역 키 데이터 초기화 완료");
    }
}