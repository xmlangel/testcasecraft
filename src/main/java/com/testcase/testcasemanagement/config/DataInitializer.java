// src/main/java/com/testcase/testcasemanagement/config/DataInitializer.java

package com.testcase.testcasemanagement.config;

import com.testcase.testcasemanagement.model.*;
import com.testcase.testcasemanagement.repository.*;
import com.testcase.testcasemanagement.model.ProjectUser.ProjectRole;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Configuration
public class DataInitializer {

    @Value("${TESTCASE_INIT_ENABLED:true}")
    private boolean initEnabled;

    @Bean
    @Order(1) // OrganizationDataInitializer(Order=2)보다 먼저 실행
    public CommandLineRunner initTestData(
            UserRepository userRepository,
            ProjectRepository projectRepository,
            ProjectUserRepository projectUserRepository,
            TestCaseRepository testCaseRepository,
            TestPlanRepository testPlanRepository,
            TestExecutionRepository testExecutionRepository,
            TestResultRepository testResultRepository,
            AuditLogRepository auditLogRepository,
            JunitTestResultRepository junitTestResultRepository,
            JiraConfigRepository jiraConfigRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            System.out.println("🔍 데이터베이스 초기화 설정 확인: TESTCASE_INIT_ENABLED = " + initEnabled);

            if (!initEnabled) {
                System.out.println("⏭️ 데이터베이스 초기화가 비활성화되어 있습니다.");
                return;
            }

            System.out.println("🚀 데이터베이스 초기화 시작...");
            
            // 1. 기존 데이터 전체 삭제 (초기화) - 외래키 제약조건 순서 고려
            auditLogRepository.deleteAll(); // audit_logs 먼저 삭제 (users 참조)
            junitTestResultRepository.deleteAll(); // junit_test_results 삭제 (uploaded_by → users 참조)
            jiraConfigRepository.deleteAll(); // jira_config 삭제 (user_id → users 참조)
            testResultRepository.deleteAll();
            testExecutionRepository.deleteAll();
            testPlanRepository.deleteAll();
            testCaseRepository.deleteAll();
            projectUserRepository.deleteAll();
            projectRepository.deleteAll();
            userRepository.deleteAll();
            System.out.println("✅ 기존 데이터 삭제 완료");

            // 2. 기본 사용자 생성 (admin/admin123)
            User adminUser = createUser("admin", "admin123", "관리자", "admin@test.com", "ADMIN", passwordEncoder);
            User testUser = createUser("tester", "tester", "테스터", "tester@test.com", "TESTER", passwordEncoder);
            userRepository.saveAll(List.of(adminUser, testUser));
            System.out.println("✅ 사용자 생성 완료 (admin/admin123, tester/tester)");

            // 3. 프로젝트 생성 - QA팀 모바일 앱 테스트 프로젝트만 생성
            Project project1 = createProject("QA팀 모바일 앱 테스트", "MOBILE-TEST", "iOS/Android 앱 테스트케이스 관리", 1);
            Project savedProject = projectRepository.save(project1);
            project1 = savedProject;
            System.out.println("✅ 프로젝트 생성 완료 (QA팀 모바일 앱 테스트)");

            // 3.1. 사용자-프로젝트 권한 부여
            ProjectUser adminProject1 = createProjectUser(project1, adminUser, ProjectRole.PROJECT_MANAGER);
            ProjectUser testerProject1 = createProjectUser(project1, testUser, ProjectRole.TESTER);

            projectUserRepository.saveAll(List.of(adminProject1, testerProject1));
            System.out.println("✅ 사용자-프로젝트 권한 부여 완료");

            // 4. 테스트케이스 생성 - 모바일 앱 테스트케이스만 생성
            System.out.println("📝 테스트케이스 생성 중...");
            TestCase testCase1 = createTestCase("앱 로그인 기능 테스트", project1, "iOS/Android 앱 로그인 기능 검증");
            TestCase testCase2 = createTestCase("앱 회원가입 기능 테스트", project1, "iOS/Android 앱 회원가입 기능 검증");
            TestCase testCase3 = createTestCase("푸시 알림 테스트", project1, "앱 푸시 알림 수신 및 표시 검증");
            TestCase testCase4 = createTestCase("오프라인 모드 테스트", project1, "네트워크 연결 없이 앱 동작 검증");
            TestCase testCase5 = createTestCase("앱 성능 테스트", project1, "앱 로딩 속도 및 메모리 사용량 검증");

            List<TestCase> savedTestCases = testCaseRepository.saveAll(List.of(testCase1, testCase2, testCase3, testCase4, testCase5));
            System.out.println("✅ 테스트케이스 생성 완료: " + savedTestCases.size() + "개");
            savedTestCases.forEach(tc -> System.out.println("   - " + tc.getName() + " (ID: " + tc.getId() + ")"));

            // 5. 테스트 플랜 생성 - 모바일 앱 테스트 플랜만 생성
            System.out.println("📋 테스트 플랜 생성 중...");
            TestPlan testPlan1 = createTestPlan("모바일 앱 기본 기능 테스트", project1, "앱 기본 기능(로그인, 회원가입) 테스트 플랜",
                    Arrays.asList(savedTestCases.get(0).getId(), savedTestCases.get(1).getId()));
            TestPlan testPlan2 = createTestPlan("모바일 앱 고급 기능 테스트", project1, "앱 고급 기능(푸시, 오프라인, 성능) 테스트 플랜",
                    Arrays.asList(savedTestCases.get(2).getId(), savedTestCases.get(3).getId(), savedTestCases.get(4).getId()));

            List<TestPlan> savedTestPlans = testPlanRepository.saveAll(List.of(testPlan1, testPlan2));
            System.out.println("✅ 테스트 플랜 생성 완료: " + savedTestPlans.size() + "개");
            savedTestPlans.forEach(tp -> System.out.println("   - " + tp.getName() + " (ID: " + tp.getId() + ", 테스트케이스 수: " + tp.getTestCaseIds().size() + ")"));

            // 6. 테스트 실행 생성 - 모바일 앱 테스트 실행만 생성
            System.out.println("▶️ 테스트 실행 생성 중...");
            TestExecution execution1 = createTestExecution("기본 기능 테스트 실행 #1", project1, savedTestPlans.get(0).getId(), "COMPLETED");
            TestExecution execution2 = createTestExecution("기본 기능 테스트 실행 #2", project1, savedTestPlans.get(0).getId(), "INPROGRESS"); // 진행 중
            TestExecution execution3 = createTestExecution("고급 기능 테스트 실행 #1", project1, savedTestPlans.get(1).getId(), "INPROGRESS"); // 진행 중

            List<TestExecution> savedExecutions = testExecutionRepository.saveAll(List.of(execution1, execution2, execution3));
            System.out.println("✅ 테스트 실행 생성 완료: " + savedExecutions.size() + "개");
            savedExecutions.forEach(ex -> System.out.println("   - " + ex.getName() + " (ID: " + ex.getId() + ", 상태: " + ex.getStatus() + ")"));

            // 7. 테스트 결과 생성 (다양한 결과와 시간 분산) - 모바일 앱 테스트 결과만 생성
            System.out.println("📊 테스트 결과 생성 중...");
            LocalDateTime baseTime = LocalDateTime.now().minusDays(7);

            // execution1 결과들 (일주일 전부터 생성)
            List<TestResult> results1 = testResultRepository.saveAll(List.of(
                createTestResult(savedTestCases.get(0).getId(), savedExecutions.get(0), "PASS", "iOS 앱 로그인 성공", adminUser, baseTime.plusHours(1)),
                createTestResult(savedTestCases.get(1).getId(), savedExecutions.get(0), "FAIL", "Android 앱 회원가입 실패 - 이메일 중복", testUser, baseTime.plusHours(2))
            ));
            System.out.println("   - execution1: " + results1.size() + "개 결과 저장");

            // execution2 결과들 (5일 전)
            List<TestResult> results2 = testResultRepository.saveAll(List.of(
                createTestResult(savedTestCases.get(0).getId(), savedExecutions.get(1), "PASS", "Android 앱 로그인 재테스트 성공", testUser, baseTime.plusDays(2).plusHours(1)),
                createTestResult(savedTestCases.get(1).getId(), savedExecutions.get(1), "PASS", "iOS 앱 회원가입 수정 후 성공", adminUser, baseTime.plusDays(2).plusHours(2))
            ));
            System.out.println("   - execution2: " + results2.size() + "개 결과 저장");

            // execution3 결과들 (3일 전)
            List<TestResult> results3 = testResultRepository.saveAll(List.of(
                createTestResult(savedTestCases.get(2).getId(), savedExecutions.get(2), "PASS", "iOS 푸시 알림 정상 수신", adminUser, baseTime.plusDays(4).plusHours(1)),
                createTestResult(savedTestCases.get(3).getId(), savedExecutions.get(2), "PASS", "Android 오프라인 모드 정상 동작", testUser, baseTime.plusDays(4).plusHours(2)),
                createTestResult(savedTestCases.get(4).getId(), savedExecutions.get(2), "FAIL", "iOS 앱 성능 기준 미달 - 개선 필요", adminUser, baseTime.plusDays(4).plusHours(3)),
                createTestResult(savedTestCases.get(4).getId(), savedExecutions.get(2), "PASS", "iOS 앱 성능 개선 후 재테스트 성공", adminUser, LocalDateTime.now().minusHours(1))
            ));
            System.out.println("   - execution3: " + results3.size() + "개 결과 저장");

            int totalResults = results1.size() + results2.size() + results3.size();
            System.out.println("✅ 테스트 결과 생성 완료: 총 " + totalResults + "개");

            // 최종 데이터 확인
            System.out.println("\n" + "=".repeat(70));
            System.out.println("🎉 데이터베이스 초기화 완료!");
            System.out.println("=".repeat(70));
            System.out.println("📋 생성된 데이터 요약:");
            System.out.println("   👤 사용자: " + userRepository.count() + "명 (admin/admin123, tester/tester)");
            System.out.println("   📁 프로젝트: " + projectRepository.count() + "개 (QA팀 모바일 앱 테스트)");
            System.out.println("   📝 테스트케이스: " + testCaseRepository.count() + "개 (모바일 앱 테스트)");
            System.out.println("   📋 테스트 플랜: " + testPlanRepository.count() + "개 (기본/고급 기능 테스트)");
            System.out.println("   ▶️ 테스트 실행: " + testExecutionRepository.count() + "개");
            System.out.println("   📊 테스트 결과: " + testResultRepository.count() + "개");
            System.out.println("=".repeat(70) + "\n");
        };
    }

    private User createUser(String username, String password, String name, String email, String role, PasswordEncoder passwordEncoder) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setName(name);
        user.setEmail(email);
        user.setRole(role);
        return user;
    }

    private Project createProject(String name, String code, String description, int displayOrder) {
        Project project = new Project();
        project.setName(name);
        project.setCode(code);
        project.setDescription(description);
        project.setDisplayOrder(displayOrder);
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());
        return project;
    }

    private TestCase createTestCase(String name, Project project, String description) {
        TestCase testCase = new TestCase();
        testCase.setName(name);
        testCase.setType("testcase");
        testCase.setProject(project);
        testCase.setDescription(description);
        testCase.setDisplayOrder(1);
        testCase.setPriority("MEDIUM");
        testCase.setParentId(null); // 최상위 레벨
        testCase.setIsAutomated(false);
        testCase.setExecutionType("Manual");
        testCase.setCreatedAt(LocalDateTime.now());
        testCase.setUpdatedAt(LocalDateTime.now());
        return testCase;
    }

    private TestPlan createTestPlan(String name, Project project, String description, List<String> testCaseIds) {
        TestPlan testPlan = new TestPlan();
        testPlan.setName(name);
        testPlan.setProject(project);
        testPlan.setDescription(description);
        testPlan.setTestCaseIds(testCaseIds);
        testPlan.setCreatedAt(LocalDateTime.now());
        testPlan.setUpdatedAt(LocalDateTime.now());
        return testPlan;
    }

    private TestExecution createTestExecution(String name, Project project, String testPlanId, String status) {
        TestExecution execution = new TestExecution();
        execution.setName(name);
        execution.setProject(project);
        execution.setTestPlanId(testPlanId);
        execution.setStatus(status);
        execution.setStartDate(LocalDateTime.now().minusDays(7));
        // INPROGRESS 상태일 때는 endDate를 null로 설정
        if (!"INPROGRESS".equals(status)) {
            execution.setEndDate(LocalDateTime.now().minusDays(6));
        }
        execution.setCreatedAt(LocalDateTime.now().minusDays(7));
        execution.setUpdatedAt(LocalDateTime.now().minusDays(6));
        return execution;
    }

    private TestResult createTestResult(String testCaseId, TestExecution testExecution, String result, String notes, User executedBy, LocalDateTime executedAt) {
        TestResult testResult = new TestResult();
        testResult.setTestCaseId(testCaseId);
        testResult.setTestExecution(testExecution);
        testResult.setResult(result);
        testResult.setNotes(notes);
        testResult.setExecutedBy(executedBy);
        testResult.setExecutedAt(executedAt);
        return testResult;
    }

    private ProjectUser createProjectUser(Project project, User user, ProjectRole role) {
        ProjectUser projectUser = new ProjectUser();
        projectUser.setProject(project);
        projectUser.setUser(user);
        projectUser.setRoleInProject(role);
        return projectUser;
    }
}
