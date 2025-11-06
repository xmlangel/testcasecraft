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

    @Value("${testcase.init.enabled:false}")
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
            if (!initEnabled) {
                return;
            }
            
            System.out.println("🚀 H2 데이터베이스 초기화 시작...");
            
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

            // 3. 프로젝트 생성
            Project project1 = createProject("테스트 관리 시스템", "TMS", "테스트케이스 관리 시스템 메인 프로젝트", 1);
            Project project2 = createProject("QA 자동화", "QAAUTO", "QA 자동화 도구 개발 프로젝트", 2);
            List<Project> savedProjects = projectRepository.saveAll(List.of(project1, project2));
            project1 = savedProjects.get(0);
            project2 = savedProjects.get(1);
            System.out.println("✅ 프로젝트 생성 완료");

            // 3.1. 사용자-프로젝트 권한 부여
            ProjectUser adminProject1 = createProjectUser(project1, adminUser, ProjectRole.PROJECT_MANAGER);
            ProjectUser adminProject2 = createProjectUser(project2, adminUser, ProjectRole.PROJECT_MANAGER);
            ProjectUser testerProject1 = createProjectUser(project1, testUser, ProjectRole.TESTER);
            ProjectUser testerProject2 = createProjectUser(project2, testUser, ProjectRole.TESTER);
            
            projectUserRepository.saveAll(List.of(adminProject1, adminProject2, testerProject1, testerProject2));
            System.out.println("✅ 사용자-프로젝트 권한 부여 완료");

            // 4. 테스트케이스 생성
            TestCase testCase1 = createTestCase("로그인 기능 테스트", project1, "사용자 로그인 기능 검증");
            TestCase testCase2 = createTestCase("회원가입 기능 테스트", project1, "사용자 회원가입 기능 검증"); 
            TestCase testCase3 = createTestCase("대시보드 표시 테스트", project1, "대시보드 화면 정상 표시 검증");
            TestCase testCase4 = createTestCase("API 연동 테스트", project2, "외부 API 연동 기능 검증");
            TestCase testCase5 = createTestCase("자동화 스크립트 테스트", project2, "테스트 자동화 스크립트 실행 검증");
            
            List<TestCase> savedTestCases = testCaseRepository.saveAll(List.of(testCase1, testCase2, testCase3, testCase4, testCase5));
            System.out.println("✅ 테스트케이스 생성 완료");

            // 5. 테스트 플랜 생성
            TestPlan testPlan1 = createTestPlan("Sprint 1 테스트", project1, "첫 번째 스프린트 테스트 플랜", Arrays.asList(savedTestCases.get(0).getId(), savedTestCases.get(1).getId(), savedTestCases.get(2).getId()));
            TestPlan testPlan2 = createTestPlan("Sprint 2 테스트", project1, "두 번째 스프린트 테스트 플랜", Arrays.asList(savedTestCases.get(1).getId(), savedTestCases.get(2).getId()));
            TestPlan testPlan3 = createTestPlan("QA 자동화 테스트", project2, "QA 자동화 기능 테스트 플랜", Arrays.asList(savedTestCases.get(3).getId(), savedTestCases.get(4).getId()));
            
            List<TestPlan> savedTestPlans = testPlanRepository.saveAll(List.of(testPlan1, testPlan2, testPlan3));
            System.out.println("✅ 테스트 플랜 생성 완료");

            // 6. 테스트 실행 생성
            TestExecution execution1 = createTestExecution("Sprint 1 실행 #1", project1, savedTestPlans.get(0).getId(), "COMPLETED");
            TestExecution execution2 = createTestExecution("Sprint 1 실행 #2", project1, savedTestPlans.get(0).getId(), "INPROGRESS"); // 진행 중
            TestExecution execution3 = createTestExecution("Sprint 2 실행 #1", project1, savedTestPlans.get(1).getId(), "INPROGRESS"); // 진행 중  
            TestExecution execution4 = createTestExecution("QA 자동화 실행 #1", project2, savedTestPlans.get(2).getId(), "COMPLETED");
            
            List<TestExecution> savedExecutions = testExecutionRepository.saveAll(List.of(execution1, execution2, execution3, execution4));
            System.out.println("✅ 테스트 실행 생성 완료");

            // 7. 테스트 결과 생성 (다양한 결과와 시간 분산)
            LocalDateTime baseTime = LocalDateTime.now().minusDays(7);
            
            // execution1 결과들 (일주일 전부터 생성)
            testResultRepository.saveAll(List.of(
                createTestResult(savedTestCases.get(0).getId(), savedExecutions.get(0), "PASS", "로그인 성공", adminUser, baseTime.plusHours(1)),
                createTestResult(savedTestCases.get(1).getId(), savedExecutions.get(0), "FAIL", "회원가입 실패 - 이메일 중복", testUser, baseTime.plusHours(2)),
                createTestResult(savedTestCases.get(2).getId(), savedExecutions.get(0), "PASS", "대시보드 정상 표시", adminUser, baseTime.plusHours(3))
            ));
            
            // execution2 결과들 (5일 전)
            testResultRepository.saveAll(List.of(
                createTestResult(savedTestCases.get(0).getId(), savedExecutions.get(1), "PASS", "로그인 재테스트 성공", testUser, baseTime.plusDays(2).plusHours(1)),
                createTestResult(savedTestCases.get(1).getId(), savedExecutions.get(1), "PASS", "회원가입 수정 후 성공", adminUser, baseTime.plusDays(2).plusHours(2)),
                createTestResult(savedTestCases.get(2).getId(), savedExecutions.get(1), "BLOCKED", "대시보드 API 서버 점검", testUser, baseTime.plusDays(2).plusHours(3))
            ));
            
            // execution3 결과들 (3일 전)
            testResultRepository.saveAll(List.of(
                createTestResult(savedTestCases.get(1).getId(), savedExecutions.get(2), "PASS", "회원가입 최종 테스트 성공", adminUser, baseTime.plusDays(4).plusHours(1)),
                createTestResult(savedTestCases.get(2).getId(), savedExecutions.get(2), "PASS", "대시보드 성능 개선 후 정상", testUser, baseTime.plusDays(4).plusHours(2))
            ));
            
            // execution4 결과들 (1일 전 ~ 최근)
            testResultRepository.saveAll(List.of(
                createTestResult(savedTestCases.get(3).getId(), savedExecutions.get(3), "PASS", "API 연동 성공", adminUser, baseTime.plusDays(6).plusHours(1)),
                createTestResult(savedTestCases.get(4).getId(), savedExecutions.get(3), "FAIL", "자동화 스크립트 타임아웃", testUser, baseTime.plusDays(6).plusHours(2)),
                createTestResult(savedTestCases.get(4).getId(), savedExecutions.get(3), "PASS", "자동화 스크립트 수정 후 성공", adminUser, LocalDateTime.now().minusHours(1))
            ));
            
            System.out.println("✅ 테스트 결과 생성 완료");
            System.out.println("🎉 H2 데이터베이스 초기화 완료!");
            System.out.println("📋 생성된 데이터:");
            System.out.println("   - 사용자: 2명 (admin/admin, tester/tester)");
            System.out.println("   - 프로젝트: 2개");
            System.out.println("   - 테스트케이스: 5개");
            System.out.println("   - 테스트 플랜: 3개");
            System.out.println("   - 테스트 실행: 4개");
            System.out.println("   - 테스트 결과: 10개");
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
