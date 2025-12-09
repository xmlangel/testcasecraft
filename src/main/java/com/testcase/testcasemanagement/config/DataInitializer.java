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
import java.util.*;
import java.util.stream.Collectors;
import java.util.concurrent.atomic.AtomicInteger;

@Configuration
public class DataInitializer {

    @Value("${TESTCASE_INIT_ENABLED:false}")
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
            PasswordEncoder passwordEncoder) {
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

            // 4. 테스트케이스 생성 - 5개 폴더와 100개 테스트케이스 생성
            System.out.println("📝 테스트케이스 생성 중 (5개 폴더 + 100개 테스트)...");

            // 4.1. 폴더 5개 생성
            String[] folderNames = {
                    "기본 기능 테스트",
                    "고급 기능 테스트",
                    "보안 테스트",
                    "성능 테스트",
                    "호환성 테스트"
            };

            String[] folderDescriptions = {
                    "앱의 기본적인 기능들을 검증하는 테스트 케이스들",
                    "앱의 고급 기능들을 검증하는 테스트 케이스들",
                    "보안 및 인증 관련 테스트 케이스들",
                    "성능 및 최적화 관련 테스트 케이스들",
                    "다양한 디바이스 및 OS 호환성 테스트 케이스들"
            };

            List<TestCase> folders = new ArrayList<>();
            for (int i = 0; i < 5; i++) {
                TestCase folder = createFolder(folderNames[i], project1, folderDescriptions[i]);
                folders.add(folder);
            }

            List<TestCase> savedFolders = testCaseRepository.saveAll(folders);
            System.out.println("✅ 폴더 생성 완료: " + savedFolders.size() + "개");
            savedFolders.forEach(f -> System.out.println("   📁 " + f.getName()));

            // 4.2. 각 폴더당 20개씩 테스트케이스 생성 (총 100개)
            AtomicInteger sequentialIdCounter = new AtomicInteger(1);
            List<TestCase> allTestCases = new ArrayList<>();

            // 폴더 1: 기본 기능 테스트 (20개)
            String[] basicTests = {
                    "로그인 기능", "로그아웃 기능", "회원가입", "비밀번호 찾기", "프로필 수정",
                    "메인 화면 표시", "메뉴 네비게이션", "검색 기능", "필터링 기능", "정렬 기능",
                    "목록 조회", "상세 정보 조회", "데이터 추가", "데이터 수정", "데이터 삭제",
                    "설정 변경", "알림 설정", "언어 변경", "테마 변경", "도움말 표시"
            };
            allTestCases.addAll(createTestCasesForFolder(basicTests, savedFolders.get(0), project1, "iOS/Android",
                    sequentialIdCounter));

            // 폴더 2: 고급 기능 테스트 (20개)
            String[] advancedTests = {
                    "푸시 알림 수신", "푸시 알림 클릭", "인앱 메시지", "실시간 업데이트", "오프라인 모드",
                    "데이터 동기화", "자동 로그인", "소셜 로그인", "지문 인증", "얼굴 인증",
                    "위치 기반 서비스", "카메라 연동", "갤러리 연동", "파일 업로드", "파일 다운로드",
                    "공유 기능", "즐겨찾기", "북마크", "히스토리", "캐시 관리"
            };
            allTestCases.addAll(createTestCasesForFolder(advancedTests, savedFolders.get(1), project1, "고급 기능",
                    sequentialIdCounter));

            // 폴더 3: 보안 테스트 (20개)
            String[] securityTests = {
                    "SQL Injection 방어", "XSS 방어", "CSRF 방어", "암호화 통신", "데이터 암호화",
                    "세션 관리", "토큰 갱신", "권한 검증", "API 인증", "이중 인증",
                    "비밀번호 강도", "계정 잠금", "로그 기록", "개인정보 보호", "데이터 마스킹",
                    "안전한 저장소", "루팅 탐지", "디버그 모드 방지", "코드 난독화", "백업 암호화"
            };
            allTestCases.addAll(
                    createTestCasesForFolder(securityTests, savedFolders.get(2), project1, "보안", sequentialIdCounter));

            // 폴더 4: 성능 테스트 (20개)
            String[] performanceTests = {
                    "앱 시작 시간", "화면 로딩 시간", "API 응답 시간", "메모리 사용량", "CPU 사용량",
                    "배터리 소모", "네트워크 사용량", "스크롤 성능", "애니메이션 성능", "이미지 로딩",
                    "대용량 데이터 처리", "동시 사용자", "부하 테스트", "스트레스 테스트", "안정성 테스트",
                    "캐싱 효율", "데이터베이스 성능", "검색 성능", "렌더링 성능", "반응 속도"
            };
            allTestCases.addAll(createTestCasesForFolder(performanceTests, savedFolders.get(3), project1, "성능",
                    sequentialIdCounter));

            // 폴더 5: 호환성 테스트 (20개)
            String[] compatibilityTests = {
                    "iOS 15 호환성", "iOS 16 호환성", "iOS 17 호환성", "iOS 18 호환성", "Android 11 호환성",
                    "Android 12 호환성", "Android 13 호환성", "Android 14 호환성", "iPhone SE 호환성", "iPhone 14 호환성",
                    "iPhone 15 호환성", "Galaxy S21 호환성", "Galaxy S22 호환성", "Galaxy S23 호환성", "iPad 호환성",
                    "태블릿 호환성", "가로 모드", "세로 모드", "다크 모드", "라이트 모드"
            };
            allTestCases.addAll(createTestCasesForFolder(compatibilityTests, savedFolders.get(4), project1, "호환성",
                    sequentialIdCounter));

            List<TestCase> savedTestCases = testCaseRepository.saveAll(allTestCases);
            System.out.println("✅ 테스트케이스 생성 완료: " + savedTestCases.size() + "개");
            System.out.println("   📁 폴더별 분포:");
            for (int i = 0; i < savedFolders.size(); i++) {
                final int index = i; // final 변수로 복사
                long count = savedTestCases.stream()
                        .filter(tc -> savedFolders.get(index).getId().equals(tc.getParentId()))
                        .count();
                System.out.println("      - " + savedFolders.get(index).getName() + ": " + count + "개");
            }

            // 5. 테스트 플랜 생성 - 100개, 50개 플랜
            System.out.println("📋 테스트 플랜 생성 중...");

            // 플랜 1: 100개 모두 포함
            List<String> allTestCaseIds = savedTestCases.stream()
                    .map(TestCase::getId)
                    .collect(Collectors.toList());

            TestPlan testPlan1 = createTestPlan(
                    "모바일 앱 전체 테스트 플랜",
                    project1,
                    "모바일 앱의 모든 기능을 포괄하는 완전한 테스트 플랜 (100개 테스트케이스)",
                    allTestCaseIds);

            // 플랜 2: 처음 50개만 포함
            List<String> halfTestCaseIds = savedTestCases.stream()
                    .limit(50)
                    .map(TestCase::getId)
                    .collect(Collectors.toList());

            TestPlan testPlan2 = createTestPlan(
                    "모바일 앱 핵심 기능 테스트 플랜",
                    project1,
                    "모바일 앱의 핵심 기능을 검증하는 테스트 플랜 (50개 테스트케이스)",
                    halfTestCaseIds);

            List<TestPlan> savedTestPlans = testPlanRepository.saveAll(List.of(testPlan1, testPlan2));
            System.out.println("✅ 테스트 플랜 생성 완료: " + savedTestPlans.size() + "개");
            savedTestPlans.forEach(tp -> System.out
                    .println("   - " + tp.getName() + " (테스트케이스 수: " + tp.getTestCaseIds().size() + ")"));

            // 6. 테스트 실행 생성 - 100개 플랜 3개, 50개 플랜 1개
            System.out.println("▶️ 테스트 실행 생성 중...");

            // 100개 플랜 실행 3개
            TestExecution execution1 = createTestExecution(
                    "전체 테스트 실행 #1 (완료)",
                    project1,
                    savedTestPlans.get(0).getId(),
                    "COMPLETED",
                    LocalDateTime.now().minusDays(10),
                    LocalDateTime.now().minusDays(9));

            TestExecution execution2 = createTestExecution(
                    "전체 테스트 실행 #2 (완료)",
                    project1,
                    savedTestPlans.get(0).getId(),
                    "COMPLETED",
                    LocalDateTime.now().minusDays(5),
                    LocalDateTime.now().minusDays(4));

            TestExecution execution3 = createTestExecution(
                    "전체 테스트 실행 #3 (진행중)",
                    project1,
                    savedTestPlans.get(0).getId(),
                    "INPROGRESS",
                    LocalDateTime.now().minusDays(1),
                    null);

            // 50개 플랜 실행 1개
            TestExecution execution4 = createTestExecution(
                    "핵심 기능 테스트 실행 #1 (완료)",
                    project1,
                    savedTestPlans.get(1).getId(),
                    "COMPLETED",
                    LocalDateTime.now().minusDays(3),
                    LocalDateTime.now().minusDays(2));

            List<TestExecution> savedExecutions = testExecutionRepository.saveAll(
                    List.of(execution1, execution2, execution3, execution4));
            System.out.println("✅ 테스트 실행 생성 완료: " + savedExecutions.size() + "개");
            savedExecutions.forEach(ex -> System.out.println("   - " + ex.getName() + " (상태: " + ex.getStatus() + ")"));

            // 7. 테스트 결과 생성 - 총 350개 (100+100+100+50)
            System.out.println("📊 테스트 결과 생성 중 (총 350개 예상)...");

            String[] resultStatuses = { "PASS", "FAIL", "BLOCKED" };
            Random random = new Random(42); // 시드 고정으로 재현 가능하게

            // execution1 결과 (100개) - 완료
            List<TestResult> results1 = createTestResults(
                    savedTestCases,
                    savedExecutions.get(0),
                    adminUser,
                    testUser,
                    LocalDateTime.now().minusDays(10),
                    resultStatuses,
                    random,
                    85 // 85% 성공률
            );
            testResultRepository.saveAll(results1);
            System.out.println("   - execution1 (전체 테스트 #1): " + results1.size() + "개 결과 저장");

            // execution2 결과 (100개) - 완료
            List<TestResult> results2 = createTestResults(
                    savedTestCases,
                    savedExecutions.get(1),
                    adminUser,
                    testUser,
                    LocalDateTime.now().minusDays(5),
                    resultStatuses,
                    random,
                    90 // 90% 성공률 (개선됨)
            );
            testResultRepository.saveAll(results2);
            System.out.println("   - execution2 (전체 테스트 #2): " + results2.size() + "개 결과 저장");

            // execution3 결과 (100개) - 진행중
            List<TestResult> results3 = createTestResults(
                    savedTestCases,
                    savedExecutions.get(2),
                    adminUser,
                    testUser,
                    LocalDateTime.now().minusDays(1),
                    resultStatuses,
                    random,
                    92 // 92% 성공률 (계속 개선)
            );
            testResultRepository.saveAll(results3);
            System.out.println("   - execution3 (전체 테스트 #3): " + results3.size() + "개 결과 저장");

            // execution4 결과 (50개) - 완료
            List<TestCase> first50TestCases = savedTestCases.stream()
                    .limit(50)
                    .collect(Collectors.toList());

            List<TestResult> results4 = createTestResults(
                    first50TestCases,
                    savedExecutions.get(3),
                    adminUser,
                    testUser,
                    LocalDateTime.now().minusDays(3),
                    resultStatuses,
                    random,
                    95 // 95% 성공률 (핵심 기능은 더 안정적)
            );
            testResultRepository.saveAll(results4);
            System.out.println("   - execution4 (핵심 기능 테스트 #1): " + results4.size() + "개 결과 저장");

            int totalResults = results1.size() + results2.size() + results3.size() + results4.size();
            System.out.println("✅ 테스트 결과 생성 완료: 총 " + totalResults + "개");

            // 최종 데이터 확인
            System.out.println("\n" + "=".repeat(70));
            System.out.println("🎉 데이터베이스 초기화 완료!");
            System.out.println("=".repeat(70));
            System.out.println("📋 생성된 데이터 요약:");
            System.out.println("   👤 사용자: " + userRepository.count() + "명 (admin/admin123, tester/tester)");
            System.out.println("   📁 프로젝트: " + projectRepository.count() + "개 (QA팀 모바일 앱 테스트)");
            long totalTestCases = testCaseRepository.count();
            System.out.println("   📂 폴더: 5개 (5개 카테고리)");
            System.out.println("   📝 테스트케이스: 100개 (폴더별 20개씩)");
            System.out.println("   📋 테스트 플랜: " + testPlanRepository.count() + "개 (전체 100개, 핵심 50개)");
            System.out.println("   ▶️ 테스트 실행: " + testExecutionRepository.count() + "개");
            System.out.println("   📊 테스트 결과: " + testResultRepository.count() + "개 (총 350개)");
            System.out.println("=".repeat(70));
            System.out.println("📊 성공률 분석:");
            System.out.println("   - 전체 테스트 #1: 약 85% (초기)");
            System.out.println("   - 전체 테스트 #2: 약 90% (개선)");
            System.out.println("   - 전체 테스트 #3: 약 92% (지속 개선)");
            System.out.println("   - 핵심 기능 테스트: 약 95% (안정적)");
            System.out.println("=".repeat(70) + "\n");
        };
    }

    private User createUser(String username, String password, String name, String email, String role,
            PasswordEncoder passwordEncoder) {
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

    private TestCase createFolder(String name, Project project, String description) {
        TestCase folder = new TestCase();
        folder.setName(name);
        folder.setType("folder");
        folder.setProject(project);
        folder.setDescription(description);
        folder.setDisplayOrder(1);
        folder.setParentId(null); // 최상위 레벨
        folder.setCreatedAt(LocalDateTime.now());
        folder.setUpdatedAt(LocalDateTime.now());
        return folder;
    }

    private TestCase createTestCase(String name, Project project, String description) {
        TestCase testCase = new TestCase();
        testCase.setName(name);
        testCase.setType("testcase");
        testCase.setProject(project);
        testCase.setDescription(description);
        testCase.setPreCondition("사용자가 로그인되어 있어야 함");
        testCase.setPostCondition("기능이 정상적으로 완료되어야 함");
        testCase.setSteps(List.of(
                new TestStep(1, "기능을 실행한다.", "기능이 정상적으로 실행된다."),
                new TestStep(2, "결과를 확인한다.", "예상 결과와 일치한다.")));
        testCase.setExpectedResults("기능이 명세에 따라 동작해야 함");
        testCase.setDisplayOrder(1);
        testCase.setPriority("MEDIUM");
        testCase.setParentId(null); // 최상위 레벨
        testCase.setIsAutomated(false);
        testCase.setExecutionType("Manual");
        testCase.setTestTechnique("기능 테스트");
        testCase.setCreatedBy("admin");
        testCase.setUpdatedBy("admin");
        testCase.setTags(List.of("일반"));
        testCase.setCreatedAt(LocalDateTime.now());
        testCase.setUpdatedAt(LocalDateTime.now());
        return testCase;
    }

    private TestCase createTestCaseInFolder(String name, Project project, String description, TestCase parentFolder,
            int sequentialId) {
        TestCase testCase = new TestCase();
        testCase.setName(name);
        testCase.setType("testcase");
        testCase.setProject(project);
        testCase.setDescription(description);
        testCase.setPreCondition("사용자가 로그인되어 있어야 함");
        testCase.setPostCondition("기능이 정상적으로 완료되어야 함");
        testCase.setSteps(List.of(
                new TestStep(1, "기능을 실행한다.", "기능이 정상적으로 실행된다."),
                new TestStep(2, "결과를 확인한다.", "예상 결과와 일치한다.")));
        testCase.setExpectedResults("기능이 명세에 따라 동작해야 함");
        testCase.setDisplayOrder(1);
        testCase.setPriority("MEDIUM");
        testCase.setParentId(parentFolder.getId()); // 폴더 안에 위치
        testCase.setIsAutomated(false);
        testCase.setExecutionType("Manual");
        testCase.setTestTechnique("기능 테스트");
        testCase.setCreatedBy("admin");
        testCase.setUpdatedBy("admin");
        testCase.setTags(List.of("일반"));
        testCase.setSequentialId(sequentialId);
        testCase.setDisplayId(project.getCode() + "-" + String.format("%03d", sequentialId));
        testCase.setCreatedAt(LocalDateTime.now());
        testCase.setUpdatedAt(LocalDateTime.now());
        return testCase;
    }

    private List<TestCase> createTestCasesForFolder(String[] testNames, TestCase folder, Project project, String prefix,
            AtomicInteger sequentialIdCounter) {
        List<TestCase> testCases = new ArrayList<>();
        for (String testName : testNames) {
            TestCase testCase = createTestCaseInFolder(
                    testName + " 테스트",
                    project,
                    prefix + " " + testName + " 기능 검증",
                    folder,
                    sequentialIdCounter.getAndIncrement());

            // Set specific data based on prefix
            String testTechnique;
            List<String> tags;

            switch (prefix) {
                case "고급 기능":
                    testTechnique = "탐색적 테스팅";
                    tags = List.of("고급기능", "사용성");
                    testCase.setPriority("HIGH");
                    break;
                case "보안":
                    testTechnique = "취약점 분석";
                    tags = List.of("보안", "인증");
                    testCase.setPriority("HIGH");
                    break;
                case "성능":
                    testTechnique = "부하 테스트";
                    tags = List.of("성능", "최적화");
                    testCase.setPriority("MEDIUM");
                    break;
                case "호환성":
                    testTechnique = "호환성 테스트";
                    tags = List.of("호환성", "디바이스");
                    testCase.setPriority("MEDIUM");
                    break;
                case "iOS/Android":
                default:
                    testTechnique = "기능 테스트";
                    tags = List.of("기본기능", "UI");
                    testCase.setPriority("LOW");
                    break;
            }

            testCase.setTestTechnique(testTechnique);
            testCase.setTags(tags);

            testCases.add(testCase);
        }
        return testCases;
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

    private TestExecution createTestExecution(String name, Project project, String testPlanId, String status,
            LocalDateTime startDate, LocalDateTime endDate) {
        TestExecution execution = new TestExecution();
        execution.setName(name);
        execution.setProject(project);
        execution.setTestPlanId(testPlanId);
        execution.setStatus(status);
        execution.setStartDate(startDate);
        execution.setEndDate(endDate);
        execution.setCreatedAt(startDate);
        execution.setUpdatedAt(endDate != null ? endDate : LocalDateTime.now());
        return execution;
    }

    private List<TestResult> createTestResults(List<TestCase> testCases, TestExecution execution,
            User user1, User user2, LocalDateTime baseTime,
            String[] resultStatuses, Random random, int passRate) {
        List<TestResult> results = new ArrayList<>();
        for (int i = 0; i < testCases.size(); i++) {
            TestCase testCase = testCases.get(i);
            int randomValue = random.nextInt(100);

            String resultStatus;
            String notes;

            if (randomValue < passRate) {
                resultStatus = "PASS";
                notes = testCase.getName() + " 정상 동작 확인";
            } else if (randomValue < passRate + 10) {
                resultStatus = "FAIL";
                notes = testCase.getName() + " 실패 - 오류 발생, 수정 필요";
            } else {
                resultStatus = "BLOCKED";
                notes = testCase.getName() + " 차단됨 - 선행 작업 대기 중";
            }

            User executor = (i % 2 == 0) ? user1 : user2;
            LocalDateTime executedAt = baseTime.plusHours(i / 10).plusMinutes(i % 60);

            TestResult result = createTestResult(
                    testCase.getId(),
                    execution,
                    resultStatus,
                    notes,
                    executor,
                    executedAt);

            results.add(result);
        }

        return results;
    }

    private TestResult createTestResult(String testCaseId, TestExecution testExecution, String result, String notes,
            User executedBy, LocalDateTime executedAt) {
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
