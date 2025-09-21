// src/main/java/com/testcase/testcasemanagement/config/I18nDataInitializer.java
package com.testcase.testcasemanagement.config;

import com.testcase.testcasemanagement.model.Language;
import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.model.Translation;
import com.testcase.testcasemanagement.repository.LanguageRepository;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import com.testcase.testcasemanagement.repository.TranslationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@Order(10) // 다른 초기화 후에 실행
@RequiredArgsConstructor
public class I18nDataInitializer implements CommandLineRunner {

    private final LanguageRepository languageRepository;
    private final TranslationKeyRepository translationKeyRepository;
    private final TranslationRepository translationRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("=== 다국어 지원 데이터 초기화 시작 ===");

        initializeLanguages();
        initializeTranslationKeys();
        initializeTranslations();

        log.info("=== 다국어 지원 데이터 초기화 완료 ===");
    }

    private void initializeLanguages() {
        log.info("기본 언어 데이터 초기화 중...");

        // 한국어 (기본 언어)
        createLanguageIfNotExists("ko", "Korean", "한국어", true, 1);

        // 영어
        createLanguageIfNotExists("en", "English", "English", false, 2);

        // 불필요한 언어들 삭제
        deleteLanguageIfExists("ja");
        deleteLanguageIfExists("zh");

        log.info("언어 데이터 초기화 완료");
    }

    private void createLanguageIfNotExists(String code, String name, String nativeName, boolean isDefault, int sortOrder) {
        Optional<Language> existingLanguage = languageRepository.findByCode(code);
        if (existingLanguage.isEmpty()) {
            Language language = new Language(code, name, nativeName, isDefault, sortOrder);
            languageRepository.save(language);
            log.info("언어 생성: {} ({})", name, code);
        } else {
            log.debug("언어 이미 존재: {} ({})", name, code);
        }
    }

    private void deleteLanguageIfExists(String code) {
        Optional<Language> existingLanguage = languageRepository.findByCode(code);
        if (existingLanguage.isPresent()) {
            Language language = existingLanguage.get();

            // 해당 언어의 모든 번역 데이터 먼저 삭제
            List<Translation> translations = translationRepository.findByLanguage(language);
            if (!translations.isEmpty()) {
                translationRepository.deleteAll(translations);
                log.info("언어 {} 관련 번역 데이터 {} 개 삭제됨", code, translations.size());
            }

            // 언어 삭제
            languageRepository.delete(language);
            log.info("언어 완전 삭제: {} ({})", language.getName(), code);
        }
    }

    private void initializeTranslationKeys() {
        log.info("번역 키 데이터 초기화 중...");

        // 로그인 관련 키들
        createTranslationKeyIfNotExists("login.title", "login", "로그인 페이지 제목", "로그인");
        createTranslationKeyIfNotExists("login.username", "login", "사용자명 입력 라벨", "아이디");
        createTranslationKeyIfNotExists("login.password", "login", "비밀번호 입력 라벨", "비밀번호");
        createTranslationKeyIfNotExists("login.button", "login", "로그인 버튼 텍스트", "로그인");
        createTranslationKeyIfNotExists("login.remember", "login", "로그인 상태 유지 체크박스", "로그인 상태 유지");
        createTranslationKeyIfNotExists("login.forgot_password", "login", "비밀번호 찾기 링크", "비밀번호를 잊으셨나요?");
        createTranslationKeyIfNotExists("login.error.failed", "login", "로그인 실패 메시지", "로그인에 실패했습니다.");
        createTranslationKeyIfNotExists("login.error.general", "login", "로그인 일반 오류", "로그인 중 오류가 발생했습니다.");
        createTranslationKeyIfNotExists("login.back", "login", "로그인으로 돌아가기", "로그인으로 돌아가기");

        // 회원가입 관련 키들
        createTranslationKeyIfNotExists("register.title", "register", "회원가입 페이지 제목", "회원가입");
        createTranslationKeyIfNotExists("register.confirm_password", "register", "비밀번호 확인 라벨", "비밀번호 확인");
        createTranslationKeyIfNotExists("register.name", "register", "이름 입력 라벨", "이름");
        createTranslationKeyIfNotExists("register.email", "register", "이메일 입력 라벨", "이메일");
        createTranslationKeyIfNotExists("register.button", "register", "회원가입 버튼", "회원가입");
        createTranslationKeyIfNotExists("register.switch", "register", "회원가입 전환 버튼", "회원가입");
        createTranslationKeyIfNotExists("register.success", "register", "회원가입 성공 메시지", "회원가입이 완료되었습니다. 로그인 해주세요.");
        createTranslationKeyIfNotExists("register.error.general", "register", "회원가입 일반 오류", "회원가입 중 오류가 발생했습니다.");

        // 검증 메시지 추가
        createTranslationKeyIfNotExists("validation.required.all", "validation", "모든 필드 필수 입력", "모든 필드를 입력해주세요.");
        createTranslationKeyIfNotExists("validation.password.mismatch", "validation", "비밀번호 불일치", "비밀번호가 일치하지 않습니다.");

        // 버튼 공통 키들
        createTranslationKeyIfNotExists("button.save", "button", "저장 버튼", "저장");
        createTranslationKeyIfNotExists("button.cancel", "button", "취소 버튼", "취소");
        createTranslationKeyIfNotExists("button.delete", "button", "삭제 버튼", "삭제");
        createTranslationKeyIfNotExists("button.edit", "button", "편집 버튼", "편집");
        createTranslationKeyIfNotExists("button.add", "button", "추가 버튼", "추가");
        createTranslationKeyIfNotExists("button.close", "button", "닫기 버튼", "닫기");
        createTranslationKeyIfNotExists("button.confirm", "button", "확인 버튼", "확인");

        // 메시지 키들
        createTranslationKeyIfNotExists("message.success", "message", "성공 메시지", "성공적으로 처리되었습니다.");
        createTranslationKeyIfNotExists("message.error", "message", "오류 메시지", "오류가 발생했습니다.");
        createTranslationKeyIfNotExists("message.loading", "message", "로딩 메시지", "로딩 중...");
        createTranslationKeyIfNotExists("message.confirm_delete", "message", "삭제 확인 메시지", "정말로 삭제하시겠습니까?");

        // 검증 메시지 키들
        createTranslationKeyIfNotExists("validation.required", "validation", "필수 입력 검증", "필수 입력 항목입니다.");
        createTranslationKeyIfNotExists("validation.email", "validation", "이메일 형식 검증", "올바른 이메일 형식을 입력하세요.");
        createTranslationKeyIfNotExists("validation.min_length", "validation", "최소 길이 검증", "최소 {0}글자 이상 입력하세요.");
        createTranslationKeyIfNotExists("validation.max_length", "validation", "최대 길이 검증", "최대 {0}글자까지 입력 가능합니다.");

        // 언어 선택 키들
        createTranslationKeyIfNotExists("language.select", "language", "언어 선택 라벨", "언어 선택");
        createTranslationKeyIfNotExists("language.korean", "language", "한국어", "한국어");
        createTranslationKeyIfNotExists("language.english", "language", "영어", "English");
        createTranslationKeyIfNotExists("language.japanese", "language", "일본어", "日本語");
        createTranslationKeyIfNotExists("language.chinese", "language", "중국어", "中文");

        // 프로젝트 관리 페이지 키들
        createTranslationKeyIfNotExists("project.title", "project", "프로젝트 관리 페이지 제목", "프로젝트 관리");
        createTranslationKeyIfNotExists("project.buttons.createNew", "project", "새 프로젝트 생성 버튼", "새 프로젝트 생성");
        createTranslationKeyIfNotExists("project.tabs.byOrganization", "project", "조직별 프로젝트 탭", "조직별 프로젝트");
        createTranslationKeyIfNotExists("project.tabs.independent", "project", "독립 프로젝트 탭", "독립 프로젝트");
        createTranslationKeyIfNotExists("project.tabs.all", "project", "전체 프로젝트 탭", "전체 프로젝트");
        createTranslationKeyIfNotExists("project.types.independent", "project", "독립 프로젝트 타입", "독립 프로젝트");
        createTranslationKeyIfNotExists("project.buttons.open", "project", "프로젝트 열기 버튼", "프로젝트 열기");
        createTranslationKeyIfNotExists("project.buttons.edit", "project", "프로젝트 편집 버튼", "편집");
        createTranslationKeyIfNotExists("project.buttons.transfer", "project", "프로젝트 이전 버튼", "이전");
        createTranslationKeyIfNotExists("project.buttons.delete", "project", "프로젝트 삭제 버튼", "삭제");
        createTranslationKeyIfNotExists("project.buttons.forceDelete", "project", "강제 삭제 버튼", "강제 삭제");
        createTranslationKeyIfNotExists("project.tooltips.testCaseCount", "project", "테스트케이스 수 툴팁", "테스트케이스 수");
        createTranslationKeyIfNotExists("project.tooltips.memberCount", "project", "멤버 수 툴팁", "멤버 수");
        createTranslationKeyIfNotExists("project.tooltips.junitStatus", "project", "자동화 테스트 현황 툴팁", "자동화 테스트 현황");
        createTranslationKeyIfNotExists("project.stats.projectCount", "project", "프로젝트 수 통계", "{count}개 프로젝트");
        createTranslationKeyIfNotExists("project.messages.noOrganizationProjects", "project", "조직별 프로젝트 없음 메시지", "조직별 프로젝트가 없습니다");
        createTranslationKeyIfNotExists("project.messages.addOrganizationProjectsHint", "project", "조직 프로젝트 추가 힌트", "조직에 프로젝트를 추가하거나 새 조직 프로젝트를 생성해보세요.");
        createTranslationKeyIfNotExists("project.messages.noProjectsInOrganization", "project", "조직 내 프로젝트 없음", "이 조직에는 아직 프로젝트가 없습니다.");
        createTranslationKeyIfNotExists("project.messages.noIndependentProjects", "project", "독립 프로젝트 없음", "독립 프로젝트가 없습니다");
        createTranslationKeyIfNotExists("project.messages.addIndependentProjectsHint", "project", "독립 프로젝트 추가 힌트", "독립 프로젝트를 생성해보세요.");
        createTranslationKeyIfNotExists("project.messages.noAllProjects", "project", "전체 프로젝트 없음", "등록된 프로젝트가 없습니다");
        createTranslationKeyIfNotExists("project.messages.addFirstProjectHint", "project", "첫 프로젝트 생성 힌트", "첫 번째 프로젝트를 생성해보세요.");
        createTranslationKeyIfNotExists("project.form.nameRequired", "project", "프로젝트 이름 필수 입력", "프로젝트 이름을 입력해주세요.");
        createTranslationKeyIfNotExists("project.dialog.create.title", "project", "프로젝트 생성 다이얼로그 제목", "새 프로젝트 생성");
        createTranslationKeyIfNotExists("project.dialog.edit.title", "project", "프로젝트 편집 다이얼로그 제목", "프로젝트 편집");
        createTranslationKeyIfNotExists("project.dialog.transfer.title", "project", "프로젝트 이전 다이얼로그 제목", "프로젝트 이전");
        createTranslationKeyIfNotExists("project.dialog.delete.title", "project", "프로젝트 삭제 다이얼로그 제목", "프로젝트 삭제 확인");

        // 추가 프로젝트 관련 키들
        createTranslationKeyIfNotExists("project.form.codeRequired", "project", "프로젝트 코드 필수 입력", "프로젝트 코드를 입력해주세요.");
        createTranslationKeyIfNotExists("project.tooltips.automationTestCount", "project", "자동화 테스트 결과 수 툴팁", "자동화 테스트 결과 수");
        createTranslationKeyIfNotExists("project.buttons.openProject", "project", "프로젝트 열기 버튼", "프로젝트 열기");
        createTranslationKeyIfNotExists("project.buttons.addProject", "project", "프로젝트 추가 버튼", "프로젝트 추가");
        createTranslationKeyIfNotExists("project.buttons.createIndependent", "project", "독립 프로젝트 생성 버튼", "독립 프로젝트 생성");
        createTranslationKeyIfNotExists("project.buttons.createFirstIndependent", "project", "첫 번째 독립 프로젝트 생성 버튼", "첫 번째 독립 프로젝트 생성");
        createTranslationKeyIfNotExists("project.buttons.createProject", "project", "프로젝트 생성 버튼", "프로젝트 생성");
        createTranslationKeyIfNotExists("project.stats.totalProjectCount", "project", "총 프로젝트 수 통계", "총 {count}개 프로젝트");
        createTranslationKeyIfNotExists("project.messages.createIndependentProjectHint", "project", "독립 프로젝트 생성 힌트", "조직에 속하지 않는 개인 프로젝트를 생성해보세요.");
        createTranslationKeyIfNotExists("project.messages.noParticipatingProjects", "project", "참여 중인 프로젝트 없음", "참여 중인 프로젝트가 없습니다");
        createTranslationKeyIfNotExists("project.messages.needInvitation", "project", "프로젝트 초대 필요", "프로젝트가 없는 사용자는 프로젝트에 초대가 되어야 이용이 가능합니다.");
        createTranslationKeyIfNotExists("project.messages.requestInvitation", "project", "프로젝트 초대 요청", "시스템관리자에게 프로젝트 초대를 요청하세요.");
        createTranslationKeyIfNotExists("project.menu.transfer", "project", "조직 이전 메뉴", "조직 이전");
        createTranslationKeyIfNotExists("project.menu.forceDelete", "project", "강제 삭제 메뉴", "강제 삭제");

        // 대시보드 페이지 키들
        createTranslationKeyIfNotExists("dashboard.title", "dashboard", "대시보드 페이지 제목", "대시보드");
        createTranslationKeyIfNotExists("dashboard.lastUpdate", "dashboard", "최근 업데이트 라벨", "최근 업데이트: {date}");
        createTranslationKeyIfNotExists("dashboard.refresh", "dashboard", "새로고침 버튼", "새로고침");
        createTranslationKeyIfNotExists("dashboard.refreshTooltip", "dashboard", "대시보드 새로고침 툴팁", "대시보드 새로고침");

        // 대시보드 프로젝트 정보
        createTranslationKeyIfNotExists("dashboard.project.totalTestCases", "dashboard", "총 테스트케이스 수", "총 테스트케이스: {count}개");
        createTranslationKeyIfNotExists("dashboard.project.memberCount", "dashboard", "프로젝트 멤버 수", "프로젝트 멤버: {count}명");

        // 대시보드 차트 제목들
        createTranslationKeyIfNotExists("dashboard.charts.recentTestResults", "dashboard", "최근 테스트케이스 결과 차트", "최근 테스트케이스 결과");
        createTranslationKeyIfNotExists("dashboard.charts.testResultsTrend", "dashboard", "테스트케이스 결과 추이 차트", "테스트케이스 결과 추이");
        createTranslationKeyIfNotExists("dashboard.charts.openTestRunResults", "dashboard", "오픈 테스트런별 결과 차트", "오픈 테스트런별 테스트케이스 결과");
        createTranslationKeyIfNotExists("dashboard.charts.assigneeResults", "dashboard", "담당자별 결과 차트", "오픈 테스트런 담당자별 테스트케이스 결과");
        createTranslationKeyIfNotExists("dashboard.charts.testPlanResults", "dashboard", "테스트 플랜별 결과 차트", "테스트 플랜별 최근 테스트 결과");
        createTranslationKeyIfNotExists("dashboard.charts.notRunTrend", "dashboard", "미실행 추이 차트", "오픈 테스트런 미실행 테스트케이스 추이");

        // 대시보드 상태 라벨들
        createTranslationKeyIfNotExists("dashboard.status.completed", "dashboard", "완료 상태", "완료");
        createTranslationKeyIfNotExists("dashboard.status.failed", "dashboard", "실패 상태", "실패 {rate}%");
        createTranslationKeyIfNotExists("dashboard.status.completedCount", "dashboard", "완료 건수", "{completed} / {total} 완료");

        // 대시보드 메시지들
        createTranslationKeyIfNotExists("dashboard.messages.loading", "dashboard", "데이터 로딩 중 메시지", "📊 대시보드 데이터를 불러오는 중...");
        createTranslationKeyIfNotExists("dashboard.messages.noData", "dashboard", "데이터 없음 메시지", "📋 대시보드 데이터가 없습니다. 프로젝트에 테스트 결과가 있는지 확인해주세요.");
        createTranslationKeyIfNotExists("dashboard.messages.dataLoading", "dashboard", "차트 데이터 로딩", "데이터 로딩 중...");
        createTranslationKeyIfNotExists("dashboard.messages.noDataToShow", "dashboard", "표시할 데이터 없음", "표시할 데이터가 없습니다.");
        createTranslationKeyIfNotExists("dashboard.messages.noOpenTestRuns", "dashboard", "진행 중인 테스트런 없음", "진행 중인 테스트런이 없습니다.");
        createTranslationKeyIfNotExists("dashboard.messages.selectProject", "dashboard", "프로젝트 선택 요청", "프로젝트를 선택해주세요.");

        // 대시보드 필터 및 기타
        createTranslationKeyIfNotExists("dashboard.filters.last15Days", "dashboard", "최근 15일 필터", "최근 15일");
        createTranslationKeyIfNotExists("dashboard.actions.retry", "dashboard", "다시 시도 버튼", "다시 시도");
        createTranslationKeyIfNotExists("dashboard.actions.loginPage", "dashboard", "로그인 페이지로 이동", "로그인 페이지로");
        createTranslationKeyIfNotExists("dashboard.actions.details", "dashboard", "상세 정보 버튼", "상세 정보");

        // 대시보드 에러 메시지들
        createTranslationKeyIfNotExists("dashboard.errors.userAction", "dashboard", "에러 해결방법 안내", "💡 해결방법: {action}");

        // 차트 범례들 (RESULT_LABELS 대체)
        createTranslationKeyIfNotExists("dashboard.results.pass", "dashboard", "성공 결과", "성공");
        createTranslationKeyIfNotExists("dashboard.results.fail", "dashboard", "실패 결과", "실패");
        createTranslationKeyIfNotExists("dashboard.results.blocked", "dashboard", "차단됨 결과", "차단됨");
        createTranslationKeyIfNotExists("dashboard.results.skipped", "dashboard", "건너뜀 결과", "건너뜀");
        createTranslationKeyIfNotExists("dashboard.results.notrun", "dashboard", "미실행 결과", "미실행");

        // 대시보드 차트 상태 라벨들 (Bar Chart name 속성용)
        createTranslationKeyIfNotExists("dashboard.status.pass", "dashboard", "성공 차트 라벨", "성공");
        createTranslationKeyIfNotExists("dashboard.status.fail", "dashboard", "실패 차트 라벨", "실패");
        createTranslationKeyIfNotExists("dashboard.status.blocked", "dashboard", "차단됨 차트 라벨", "차단됨");
        createTranslationKeyIfNotExists("dashboard.status.notrun", "dashboard", "미실행 차트 라벨", "미실행");

        // Organization Dashboard 전용 키들
        createTranslationKeyIfNotExists("organization.dashboard.title", "dashboard", "조직 대시보드 제목", "대시보드");
        createTranslationKeyIfNotExists("organization.dashboard.metrics.totalOrganizations", "dashboard", "총 조직 수 메트릭", "총 조직 수");
        createTranslationKeyIfNotExists("organization.dashboard.metrics.totalOrganizations.subtitle", "dashboard", "총 조직 수 부제목", "활성 조직");
        createTranslationKeyIfNotExists("organization.dashboard.metrics.totalProjects", "dashboard", "총 프로젝트 수 메트릭", "총 프로젝트 수");
        createTranslationKeyIfNotExists("organization.dashboard.metrics.totalProjects.subtitle", "dashboard", "총 프로젝트 수 부제목", "전체 프로젝트");
        createTranslationKeyIfNotExists("organization.dashboard.metrics.totalTestCases", "dashboard", "총 테스트케이스 메트릭", "총 테스트케이스");
        createTranslationKeyIfNotExists("organization.dashboard.metrics.totalTestCases.subtitle", "dashboard", "총 테스트케이스 부제목", "작성된 테스트케이스");
        createTranslationKeyIfNotExists("organization.dashboard.metrics.totalUsers", "dashboard", "총 사용자 수 메트릭", "총 사용자 수");
        createTranslationKeyIfNotExists("organization.dashboard.metrics.totalUsers.subtitle", "dashboard", "총 사용자 수 부제목", "등록된 사용자");
        createTranslationKeyIfNotExists("organization.dashboard.metrics.totalMembers", "dashboard", "총 멤버 수 메트릭", "총 프로젝트 참여");
        createTranslationKeyIfNotExists("organization.dashboard.metrics.totalMembers.subtitle", "dashboard", "총 멤버 수 부제목", "프로젝트 멤버십 수");

        // 탭 관련
        createTranslationKeyIfNotExists("organization.dashboard.tabs.organizationStatus", "dashboard", "조직 현황 탭", "조직 현황");
        createTranslationKeyIfNotExists("organization.dashboard.tabs.testStatistics", "dashboard", "테스트 통계 탭", "테스트 통계");

        // 차트 제목들
        createTranslationKeyIfNotExists("organization.dashboard.charts.projectDistribution", "dashboard", "조직별 프로젝트 분포 차트", "조직별 프로젝트 분포");
        createTranslationKeyIfNotExists("organization.dashboard.charts.projectDistribution.projects", "dashboard", "프로젝트 수 차트 라벨", "프로젝트 수");
        createTranslationKeyIfNotExists("organization.dashboard.charts.projectDistribution.members", "dashboard", "멤버 수 차트 라벨", "멤버 수");
        createTranslationKeyIfNotExists("organization.dashboard.charts.organizationList", "dashboard", "조직 목록 제목", "조직 목록");
        createTranslationKeyIfNotExists("organization.dashboard.charts.testResultDistribution", "dashboard", "테스트 결과 분포 차트", "테스트 결과 분포");
        createTranslationKeyIfNotExists("organization.dashboard.charts.testResultDetails", "dashboard", "테스트 결과 상세 제목", "테스트 결과 상세");

        // 조직 목록 항목들
        createTranslationKeyIfNotExists("organization.dashboard.list.projectCount", "dashboard", "프로젝트 개수 표시", "프로젝트: {count}개");
        createTranslationKeyIfNotExists("organization.dashboard.list.memberCount", "dashboard", "멤버 개수 표시", "멤버: {count}명");

        // 테스트 결과 상태들 (재사용 가능하지만 명시적으로 정의)
        createTranslationKeyIfNotExists("organization.dashboard.testResults.success", "dashboard", "성공 테스트 결과", "성공");
        createTranslationKeyIfNotExists("organization.dashboard.testResults.failure", "dashboard", "실패 테스트 결과", "실패");
        createTranslationKeyIfNotExists("organization.dashboard.testResults.blocked", "dashboard", "차단됨 테스트 결과", "차단됨");
        createTranslationKeyIfNotExists("organization.dashboard.testResults.notRun", "dashboard", "미실행 테스트 결과", "미실행");

        // Header Navigation 전용 키들
        createTranslationKeyIfNotExists("header.nav.dashboard", "header", "대시보드 네비게이션", "대시보드");
        createTranslationKeyIfNotExists("header.nav.organizationManagement", "header", "조직 관리 네비게이션", "조직 관리");
        createTranslationKeyIfNotExists("header.nav.userManagement", "header", "사용자 관리 네비게이션", "사용자 관리");
        createTranslationKeyIfNotExists("header.nav.mailSettings", "header", "메일 설정 네비게이션", "메일 설정");
        createTranslationKeyIfNotExists("header.nav.translationManagement", "header", "번역 관리 네비게이션", "번역 관리");
        createTranslationKeyIfNotExists("header.nav.projectSelection", "header", "프로젝트 선택 네비게이션", "프로젝트 선택");

        // User Menu 관련
        createTranslationKeyIfNotExists("header.userMenu.profile", "header", "사용자 프로필 메뉴", "프로필");
        createTranslationKeyIfNotExists("header.userMenu.logout", "header", "로그아웃 메뉴", "로그아웃");

        // TestCase 관련 키들
        createTranslationKeyIfNotExists("testcase.form.title.create", "testcase", "테스트케이스 생성 제목", "테스트케이스 생성");
        createTranslationKeyIfNotExists("testcase.form.title.edit", "testcase", "테스트케이스 수정 제목", "테스트케이스 수정");
        createTranslationKeyIfNotExists("testcase.form.folder.create", "testcase", "테스트 폴더 생성 제목", "테스트 폴더 생성");
        createTranslationKeyIfNotExists("testcase.form.folder.edit", "testcase", "테스트 폴더 수정 제목", "테스트 폴더 수정");
        createTranslationKeyIfNotExists("testcase.info.title", "testcase", "테스트케이스 정보 섹션 제목", "테스트케이스 정보");

        // Form 필드들
        createTranslationKeyIfNotExists("testcase.form.name", "testcase", "테스트케이스 이름 필드", "이름");
        createTranslationKeyIfNotExists("testcase.form.description", "testcase", "테스트케이스 설명 필드", "설명");
        createTranslationKeyIfNotExists("testcase.form.displayOrder", "testcase", "테스트케이스 순서 필드", "순서");

        // 폴더 관련 키들
        createTranslationKeyIfNotExists("testcase.folder.info.title", "testcase", "폴더 정보 제목", "폴더 정보");
        createTranslationKeyIfNotExists("testcase.folder.title.edit", "testcase", "테스트 폴더 수정 제목", "테스트 폴더 수정");
        createTranslationKeyIfNotExists("testcase.folder.title.create", "testcase", "테스트 폴더 생성 제목", "테스트 폴더 생성");

        // 버전 관련 키들
        createTranslationKeyIfNotExists("testcase.version.dialog.title", "testcase", "수동 버전 생성 다이얼로그 제목", "수동 버전 생성");
        createTranslationKeyIfNotExists("testcase.version.button.cancel", "testcase", "버전 생성 취소 버튼", "취소");
        createTranslationKeyIfNotExists("testcase.version.button.creating", "testcase", "버전 생성 중 버튼", "생성 중...");

        // 플레이스홀더 및 헬퍼 텍스트
        createTranslationKeyIfNotExists("testcase.form.descriptionHelper", "testcase", "설명 헬퍼 텍스트", "설명을 입력하세요.");
        createTranslationKeyIfNotExists("testcase.form.preConditionHelper", "testcase", "사전 조건 헬퍼 텍스트", "사전 조건을 입력하세요.");
        createTranslationKeyIfNotExists("testcase.form.expectedResultsHelper", "testcase", "예상 결과 헬퍼 텍스트", "전체 예상 결과를 입력하세요.");
        createTranslationKeyIfNotExists("testcase.form.order", "testcase", "테스트케이스 순서 필드", "순서");
        createTranslationKeyIfNotExists("testcase.form.preCondition", "testcase", "테스트 사전 조건 필드", "사전 조건");
        createTranslationKeyIfNotExists("testcase.form.expectedResults", "testcase", "기대 결과 필드", "기대 결과");

        // Placeholder 텍스트들
        createTranslationKeyIfNotExists("testcase.form.name.placeholder", "testcase", "테스트케이스 이름 입력 안내", "테스트케이스 이름");
        createTranslationKeyIfNotExists("testcase.form.folder.name.placeholder", "testcase", "폴더 이름 입력 안내", "폴더 이름");
        createTranslationKeyIfNotExists("testcase.form.description.placeholder", "testcase", "설명 입력 안내", "설명을 입력하세요");
        createTranslationKeyIfNotExists("testcase.form.folder.description.placeholder", "testcase", "폴더 설명 입력 안내", "폴더 설명");

        // 버튼들
        createTranslationKeyIfNotExists("testcase.form.button.save", "testcase", "저장 버튼", "저장");
        createTranslationKeyIfNotExists("testcase.form.button.saving", "testcase", "저장 중 버튼", "저장 중...");
        createTranslationKeyIfNotExists("testcase.form.button.cancel", "testcase", "취소 버튼", "취소");
        createTranslationKeyIfNotExists("testcase.form.button.close", "testcase", "닫기 버튼", "닫기");
        createTranslationKeyIfNotExists("testcase.version.button.create", "testcase", "버전 생성 버튼", "버전 생성");

        // 추가 폼 필드들
        createTranslationKeyIfNotExists("testcase.form.folderName", "testcase", "폴더 이름 플레이스홀더", "폴더 이름");
        createTranslationKeyIfNotExists("testcase.form.folderDescription", "testcase", "폴더 설명 플레이스홀더", "폴더 설명");
        createTranslationKeyIfNotExists("testcase.form.testcaseName", "testcase", "테스트케이스 이름 플레이스홀더", "테스트케이스 이름");
        createTranslationKeyIfNotExists("testcase.form.testcaseDescription", "testcase", "테스트케이스 설명 플레이스홀더", "테스트케이스 설명");
        createTranslationKeyIfNotExists("testcase.form.preConditionPlaceholder", "testcase", "사전 조건 플레이스홀더", "사전 조건");
        createTranslationKeyIfNotExists("testcase.form.overallExpectedResults", "testcase", "전체 예상 결과 플레이스홀더", "전체 예상 결과");

        // 테스트 스텝 관련
        createTranslationKeyIfNotExists("testcase.form.testSteps", "testcase", "테스트 스텝 섹션 제목", "테스트 스텝");
        createTranslationKeyIfNotExists("testcase.form.stepNumber", "testcase", "스텝 번호 컬럼", "No.");
        createTranslationKeyIfNotExists("testcase.form.step", "testcase", "스텝 컬럼", "Step");
        createTranslationKeyIfNotExists("testcase.form.expected", "testcase", "예상 결과 컬럼", "Expected");
        createTranslationKeyIfNotExists("testcase.form.stepDescription", "testcase", "스텝 설명 플레이스홀더", "Step 설명");
        createTranslationKeyIfNotExists("testcase.form.expectedResult", "testcase", "예상 결과 플레이스홀더", "예상 결과");
        createTranslationKeyIfNotExists("testcase.button.addStep", "testcase", "스텝 추가 버튼", "스텝 추가");

        // 메시지들
        createTranslationKeyIfNotExists("testcase.message.addSteps", "testcase", "스텝 추가 안내 메시지", "스텝을 추가하세요.");

        // 헬퍼 텍스트들
        createTranslationKeyIfNotExists("testcase.helper.description", "testcase", "설명 헬퍼 텍스트", "설명을 입력하세요.");
        createTranslationKeyIfNotExists("testcase.helper.preCondition", "testcase", "사전 조건 헬퍼 텍스트", "사전 조건을 입력하세요.");
        createTranslationKeyIfNotExists("testcase.validation.expectedResultsRequired", "testcase", "예상 결과 필수 입력 메시지", "전체 예상 결과를 입력하세요.");

        // InputModeToggle 관련 키들
        createTranslationKeyIfNotExists("testcase.inputMode.title", "testcase", "입력 모드 선택 제목", "입력 모드 선택");
        createTranslationKeyIfNotExists("testcase.inputMode.form.title", "testcase", "개별 폼 모드 제목", "개별 폼");
        createTranslationKeyIfNotExists("testcase.inputMode.spreadsheet.title", "testcase", "스프레드시트 모드 제목", "스프레드시트");
        createTranslationKeyIfNotExists("testcase.inputMode.advancedSpreadsheet.title", "testcase", "고급 스프레드시트 모드 제목", "고급 스프레드시트");

        // 모드별 설명
        createTranslationKeyIfNotExists("testcase.inputMode.form.description", "testcase", "개별 폼 모드 설명", "개별 폼 모드: 테스트케이스를 하나씩 상세하게 입력할 수 있습니다.");
        createTranslationKeyIfNotExists("testcase.inputMode.spreadsheet.description", "testcase", "스프레드시트 모드 설명", "스프레드시트 모드: 여러 테스트케이스를 한 번에 일괄 입력할 수 있습니다.");
        createTranslationKeyIfNotExists("testcase.inputMode.advancedSpreadsheet.description", "testcase", "고급 스프레드시트 모드 설명", "고급 스프레드시트 모드: 줄바꿈과 고급 편집 기능이 지원되는 스프레드시트입니다.");

        // 툴팁 텍스트들
        createTranslationKeyIfNotExists("testcase.inputMode.form.tooltip", "testcase", "개별 폼 툴팁", "개별 폼으로 상세 입력 (기존 방식)");
        createTranslationKeyIfNotExists("testcase.inputMode.spreadsheet.tooltip", "testcase", "스프레드시트 툴팁", "스프레드시트로 일괄 입력 (기본 버전)");
        createTranslationKeyIfNotExists("testcase.inputMode.advancedSpreadsheet.tooltip", "testcase", "고급 스프레드시트 툴팁", "고급 스프레드시트 (줄바꿈 지원, react-datasheet-grid)");

        // 상태 메시지들
        createTranslationKeyIfNotExists("testcase.inputMode.form.status", "testcase", "폼 모드 상태", "📝 현재 {count}개의 테스트케이스가 있습니다.");
        createTranslationKeyIfNotExists("testcase.inputMode.form.features", "testcase", "폼 모드 기능", "• 모든 필드 지원 • 스텝 제한 없음 • 상세 입력 가능");
        createTranslationKeyIfNotExists("testcase.inputMode.spreadsheet.status", "testcase", "스프레드시트 모드 상태", "📊 Excel과 유사한 편집 환경을 제공합니다. (기본 버전)");
        createTranslationKeyIfNotExists("testcase.inputMode.spreadsheet.features", "testcase", "스프레드시트 모드 기능", "• 한 화면에서 50개+ 동시 편집 • 스텝 1-10개 동적 관리 • 빠른 일괄 입력");
        createTranslationKeyIfNotExists("testcase.inputMode.advancedSpreadsheet.status", "testcase", "고급 스프레드시트 모드 상태", "🚀 고급 스프레드시트 - 줄바꿈과 다중 선택을 지원합니다.");
        createTranslationKeyIfNotExists("testcase.inputMode.advancedSpreadsheet.features", "testcase", "고급 스프레드시트 모드 기능", "• 셀 내 줄바꿈(Enter) • 다중 선택(Shift+클릭) • 드래그 크기 조정 • 고급 복사/붙여넣기");

        // 경고 메시지
        createTranslationKeyIfNotExists("testcase.inputMode.warning.modeSwitch", "testcase", "모드 전환 경고", "⚠️ 모드 전환 시 현재 편집 중인 데이터는 유지됩니다.");

        // 스프레드시트 사용법 관련 키들
        createTranslationKeyIfNotExists("testcase.spreadsheet.usage.title", "testcase", "스프레드시트 사용법 제목", "사용법:");
        createTranslationKeyIfNotExists("testcase.spreadsheet.usage.basicUsage", "testcase", "기본 사용법", "Excel과 같이 셀을 클릭하여 직접 편집하세요. Tab/Enter로 다음 셀로 이동, Ctrl+C/V로 복사/붙여넣기가 가능합니다.");
        createTranslationKeyIfNotExists("testcase.spreadsheet.usage.folderFunction", "testcase", "폴더 기능 설명", "폴더 기능: \"폴더 추가\" 버튼을 클릭하거나 이름 셀에 \"📁 폴더명\" 형태로 입력하면 폴더가 생성됩니다.");
        createTranslationKeyIfNotExists("testcase.spreadsheet.usage.stepManagement", "testcase", "스텝 관리 설명", "스텝 관리: ⚙️ 버튼을 클릭하여 스텝 수를 조정할 수 있습니다 (최대 10개).");

        // TestCaseDatasheetGrid 고급 기능 관련
        createTranslationKeyIfNotExists("testcase.advancedGrid.features.title", "testcase", "고급 기능 제목", "고급 기능:");
        createTranslationKeyIfNotExists("testcase.advancedGrid.features.lineBreak", "testcase", "줄바꿈 기능", "셀 내에서 Enter로 줄바꿈이 가능합니다.");
        createTranslationKeyIfNotExists("testcase.advancedGrid.features.navigation", "testcase", "네비게이션 기능", "Tab으로 다음 셀 이동, Ctrl+C/V로 복사/붙여넣기 지원.");
        createTranslationKeyIfNotExists("testcase.advancedGrid.multiSelect.title", "testcase", "다중 선택 제목", "다중 선택:");
        createTranslationKeyIfNotExists("testcase.advancedGrid.multiSelect.range", "testcase", "범위 선택", "Shift+클릭으로 범위 선택, Ctrl+클릭으로 개별 선택 가능.");
        createTranslationKeyIfNotExists("testcase.advancedGrid.multiSelect.resize", "testcase", "크기 조정", "드래그하여 셀 크기 조정 및 데이터 자동 채우기 지원.");

        // 스프레드시트 공통 버튼 및 액션
        createTranslationKeyIfNotExists("testcase.spreadsheet.header.title", "testcase", "스프레드시트 헤더 제목", "테스트케이스 스프레드시트");
        createTranslationKeyIfNotExists("testcase.spreadsheet.button.refresh", "testcase", "새로고침 버튼", "새로고침");
        createTranslationKeyIfNotExists("testcase.spreadsheet.button.addRows", "testcase", "행 추가 버튼", "행 추가");
        createTranslationKeyIfNotExists("testcase.spreadsheet.button.addFolder", "testcase", "폴더 추가 버튼", "폴더 추가");
        createTranslationKeyIfNotExists("testcase.spreadsheet.button.validate", "testcase", "검증 버튼", "검증");
        createTranslationKeyIfNotExists("testcase.spreadsheet.button.export", "testcase", "내보내기 버튼", "Export");
        createTranslationKeyIfNotExists("testcase.spreadsheet.button.save", "testcase", "저장 버튼", "일괄 저장");
        createTranslationKeyIfNotExists("testcase.spreadsheet.button.saving", "testcase", "저장 중", "저장 중...");

        // 스프레드시트 상태 정보
        createTranslationKeyIfNotExists("testcase.spreadsheet.status.rows", "testcase", "행 개수", "{count}개 행");
        createTranslationKeyIfNotExists("testcase.spreadsheet.status.steps", "testcase", "스텝 개수", "{count}개 스텝");
        createTranslationKeyIfNotExists("testcase.spreadsheet.status.changed", "testcase", "변경됨 상태", "변경됨");
        createTranslationKeyIfNotExists("testcase.spreadsheet.status.lineBreakSupport", "testcase", "줄바꿈 지원", "줄바꿈 지원");

        // 스텝 관리 메뉴
        createTranslationKeyIfNotExists("testcase.spreadsheet.stepMenu.addStep", "testcase", "스텝 추가 메뉴", "스텝 추가 ({count}개)");
        createTranslationKeyIfNotExists("testcase.spreadsheet.stepMenu.removeStep", "testcase", "스텝 제거 메뉴", "스텝 제거 ({count}개)");
        createTranslationKeyIfNotExists("testcase.spreadsheet.stepMenu.settings", "testcase", "스텝 설정 메뉴", "스텝 수 직접 설정...");

        // 스텝 설정 다이얼로그
        createTranslationKeyIfNotExists("testcase.spreadsheet.stepDialog.title", "testcase", "스텝 설정 제목", "스텝 수 설정");
        createTranslationKeyIfNotExists("testcase.spreadsheet.stepDialog.description", "testcase", "스텝 설정 설명", "테스트케이스의 스텝 수를 설정하세요. 기존 데이터는 유지됩니다.");
        createTranslationKeyIfNotExists("testcase.spreadsheet.stepDialog.label", "testcase", "스텝 수 입력", "스텝 수");
        createTranslationKeyIfNotExists("testcase.spreadsheet.stepDialog.helper", "testcase", "스텝 범위 안내", "1개부터 10개까지 설정 가능합니다.");
        createTranslationKeyIfNotExists("testcase.spreadsheet.stepDialog.cancel", "testcase", "취소 버튼", "취소");
        createTranslationKeyIfNotExists("testcase.spreadsheet.stepDialog.apply", "testcase", "적용 버튼", "적용");

        // 폴더 생성 다이얼로그
        createTranslationKeyIfNotExists("testcase.spreadsheet.folderDialog.title", "testcase", "폴더 생성 제목", "새 폴더 생성");
        createTranslationKeyIfNotExists("testcase.spreadsheet.folderDialog.description", "testcase", "폴더 생성 설명", "새 폴더의 이름을 입력하세요. 폴더는 스프레드시트 상단에 추가됩니다.");
        createTranslationKeyIfNotExists("testcase.spreadsheet.folderDialog.label", "testcase", "폴더명 입력", "폴더명");
        createTranslationKeyIfNotExists("testcase.spreadsheet.folderDialog.placeholder", "testcase", "폴더명 플레이스홀더", "예: API 테스트, UI 테스트");
        createTranslationKeyIfNotExists("testcase.spreadsheet.folderDialog.cancel", "testcase", "취소 버튼", "취소");
        createTranslationKeyIfNotExists("testcase.spreadsheet.folderDialog.create", "testcase", "생성 버튼", "생성");

        // Export 메뉴
        createTranslationKeyIfNotExists("testcase.spreadsheet.export.csv.title", "testcase", "CSV 내보내기 제목", "CSV로 내보내기");
        createTranslationKeyIfNotExists("testcase.spreadsheet.export.csv.description", "testcase", "CSV 내보내기 설명", "스프레드시트 호환 형식");
        createTranslationKeyIfNotExists("testcase.spreadsheet.export.excel.title", "testcase", "Excel 내보내기 제목", "Excel로 내보내기");
        createTranslationKeyIfNotExists("testcase.spreadsheet.export.excel.description", "testcase", "Excel 내보내기 설명", "Microsoft Excel 형식 (.xlsx)");

        // 검증 시스템 관련
        createTranslationKeyIfNotExists("testcase.spreadsheet.validation.title", "testcase", "검증 결과 제목", "데이터 검증 결과");
        createTranslationKeyIfNotExists("testcase.spreadsheet.validation.titleSuccess", "testcase", "검증 성공 제목", "데이터 검증 완료");
        createTranslationKeyIfNotExists("testcase.spreadsheet.validation.summary", "testcase", "검증 요약", "📊 검증 요약");
        createTranslationKeyIfNotExists("testcase.spreadsheet.validation.errors", "testcase", "해결 필요 오류", "해결이 필요한 오류 ({count}개)");
        createTranslationKeyIfNotExists("testcase.spreadsheet.validation.warnings", "testcase", "권장 사항", "권장 사항 ({count}개)");
        createTranslationKeyIfNotExists("testcase.spreadsheet.validation.close", "testcase", "닫기 버튼", "닫기");
        createTranslationKeyIfNotExists("testcase.spreadsheet.validation.gotoError", "testcase", "오류 위치 이동", "오류 위치로 이동");

        // 알림 메시지
        createTranslationKeyIfNotExists("testcase.spreadsheet.notification.refreshed", "testcase", "새로고침 완료", "최신 데이터로 새로고침되었습니다.");
        createTranslationKeyIfNotExists("testcase.spreadsheet.notification.saved", "testcase", "저장 완료", "저장 완료: 폴더 {folderCount}개, 테스트케이스 {testCaseCount}개");
        createTranslationKeyIfNotExists("testcase.spreadsheet.notification.folderAdded", "testcase", "폴더 추가됨", "폴더 \"{name}\"이 추가되었습니다.");
        createTranslationKeyIfNotExists("testcase.spreadsheet.notification.stepChanged", "testcase", "스텝 변경됨", "스텝 수가 {count}개로 변경되었습니다.");
        createTranslationKeyIfNotExists("testcase.spreadsheet.notification.exportComplete", "testcase", "내보내기 완료", "{type} 파일이 다운로드되었습니다: {filename}");
        createTranslationKeyIfNotExists("testcase.spreadsheet.notification.unsavedChanges", "testcase", "저장되지 않은 변경사항", "⚠️ 변경사항을 저장하지 않으면 손실될 수 있습니다.");

        // 하단 정보 텍스트
        createTranslationKeyIfNotExists("testcase.spreadsheet.footer.stepInfo", "testcase", "스텝 정보", "현재 {maxSteps}개 스텝으로 설정되어 있습니다. 최대 10개 스텝까지 확장 가능합니다.");
        createTranslationKeyIfNotExists("testcase.spreadsheet.footer.advancedInfo", "testcase", "고급 스프레드시트 정보", "react-datasheet-grid 기반 고급 스프레드시트 • {maxSteps}개 스텝 • 줄바꿈 및 고급 편집 지원");

        // 고급 스프레드시트 전용
        createTranslationKeyIfNotExists("testcase.advancedGrid.title", "testcase", "고급 스프레드시트 제목", "고급 스프레드시트 (react-datasheet-grid)");
        createTranslationKeyIfNotExists("testcase.advancedGrid.loadError.title", "testcase", "로드 오류 제목", "DataSheetGrid 로드 실패");
        createTranslationKeyIfNotExists("testcase.advancedGrid.loadError.description", "testcase", "로드 오류 설명", "react-datasheet-grid 라이브러리에 오류가 있습니다. 기본 테이블로 표시합니다.");
        createTranslationKeyIfNotExists("testcase.advancedGrid.fallback.header", "testcase", "폴백 테이블 헤더", "스프레드시트 로딩 오류");
        createTranslationKeyIfNotExists("testcase.advancedGrid.fallback.message", "testcase", "폴백 테이블 메시지", "react-datasheet-grid를 로드하는 중 오류가 발생했습니다.");
        createTranslationKeyIfNotExists("testcase.advancedGrid.fallback.retry", "testcase", "다시 시도 버튼", "다시 시도");

        // 플레이스홀더 텍스트
        createTranslationKeyIfNotExists("testcase.spreadsheet.placeholder.multiline", "testcase", "다중 줄 플레이스홀더", "여러 줄 입력 가능...");
        createTranslationKeyIfNotExists("testcase.spreadsheet.placeholder.text", "testcase", "텍스트 플레이스홀더", "텍스트 입력...");
        createTranslationKeyIfNotExists("testcase.spreadsheet.placeholder.cellInput", "testcase", "셀 입력 플레이스홀더", "{title} 입력...");

        // 버전 관련
        createTranslationKeyIfNotExists("testcase.version.create", "testcase", "버전 생성 버튼", "버전 생성");
        createTranslationKeyIfNotExists("testcase.version.creating", "testcase", "버전 생성 중", "생성 중...");
        createTranslationKeyIfNotExists("testcase.version.label", "testcase", "버전 라벨 필드", "버전 라벨");
        createTranslationKeyIfNotExists("testcase.version.description", "testcase", "버전 설명 필드", "버전 설명");
        createTranslationKeyIfNotExists("testcase.version.defaultDescription", "testcase", "기본 버전 설명", "수동 버전 생성");
        createTranslationKeyIfNotExists("testcase.version.helper", "testcase", "버전 생성 도움말", "선택 사항입니다. 빈 칸으로 두면 '수동 버전 생성'으로 설정됩니다.");

        // 테스트 스텝 관련
        createTranslationKeyIfNotExists("testcase.steps.title", "testcase", "테스트 스텝 섹션 제목", "테스트 스텝");
        createTranslationKeyIfNotExists("testcase.steps.add", "testcase", "스텝 추가 버튼", "스텝 추가");
        createTranslationKeyIfNotExists("testcase.steps.number", "testcase", "스텝 번호", "번호");
        createTranslationKeyIfNotExists("testcase.steps.action", "testcase", "스텝 액션", "액션");
        createTranslationKeyIfNotExists("testcase.steps.expected", "testcase", "예상 결과", "예상 결과");
        createTranslationKeyIfNotExists("testcase.steps.delete", "testcase", "스텝 삭제", "삭제");

        // Tree 관련
        createTranslationKeyIfNotExists("testcase.tree.add", "testcase", "테스트케이스 추가", "추가");
        createTranslationKeyIfNotExists("testcase.tree.edit", "testcase", "테스트케이스 편집", "편집");
        createTranslationKeyIfNotExists("testcase.tree.delete", "testcase", "테스트케이스 삭제", "삭제");
        createTranslationKeyIfNotExists("testcase.tree.moveUp", "testcase", "위로 이동", "위로 이동");
        createTranslationKeyIfNotExists("testcase.tree.moveDown", "testcase", "아래로 이동", "아래로 이동");
        createTranslationKeyIfNotExists("testcase.tree.refresh", "testcase", "새로고침", "새로고침");
        createTranslationKeyIfNotExists("testcase.tree.history", "testcase", "버전 히스토리", "히스토리");

        // 삭제 확인 다이얼로그
        createTranslationKeyIfNotExists("testcase.delete.confirm.title", "testcase", "삭제 확인 제목", "삭제 확인");
        createTranslationKeyIfNotExists("testcase.delete.confirm.message", "testcase", "삭제 확인 메시지", "정말로 삭제하시겠습니까?");
        createTranslationKeyIfNotExists("testcase.delete.confirm.yes", "testcase", "삭제 확인", "삭제");
        createTranslationKeyIfNotExists("testcase.delete.confirm.no", "testcase", "삭제 취소", "취소");

        // 상태 메시지들
        createTranslationKeyIfNotExists("testcase.message.saveSuccess", "testcase", "저장 성공 메시지", "테스트케이스가 성공적으로 저장되었습니다.");
        createTranslationKeyIfNotExists("testcase.message.saveFailed", "testcase", "저장 실패 메시지", "테스트케이스 저장에 실패했습니다.");
        createTranslationKeyIfNotExists("testcase.message.deleteSuccess", "testcase", "삭제 성공 메시지", "테스트케이스가 성공적으로 삭제되었습니다.");
        createTranslationKeyIfNotExists("testcase.message.deleteFailed", "testcase", "삭제 실패 메시지", "테스트케이스 삭제에 실패했습니다.");

        // 유효성 검사 메시지들
        createTranslationKeyIfNotExists("testcase.validation.nameRequired", "testcase", "이름 필수 검증", "이름은 필수 입력 항목입니다.");
        createTranslationKeyIfNotExists("testcase.validation.nameLength", "testcase", "이름 길이 검증", "이름은 1자 이상 100자 이하로 입력해주세요.");
        createTranslationKeyIfNotExists("testcase.validation.descriptionLength", "testcase", "설명 길이 검증", "설명은 500자 이하로 입력해주세요.");

        // 권한 관련 메시지들
        createTranslationKeyIfNotExists("testcase.permission.readOnly", "testcase", "읽기 전용 메시지", "읽기 전용 권한입니다.");
        createTranslationKeyIfNotExists("testcase.permission.noEdit", "testcase", "편집 불가 메시지", "편집 권한이 없습니다.");
        createTranslationKeyIfNotExists("testcase.permission.noDelete", "testcase", "삭제 불가 메시지", "삭제 권한이 없습니다.");

        // 공통 메시지들
        createTranslationKeyIfNotExists("common.loading", "common", "로딩 메시지", "로딩 중...");
        createTranslationKeyIfNotExists("common.unauthorized.title", "common", "인증 실패 제목", "접근 권한이 없습니다");
        createTranslationKeyIfNotExists("common.unauthorized.description", "common", "인증 실패 설명", "이 페이지에 접근할 권한이 없습니다. 관리자에게 문의하세요.");
        createTranslationKeyIfNotExists("common.unauthorized.loginButton", "common", "로그인 버튼", "로그인하기");

        createTranslationKeyIfNotExists("project.dialog.editTitle", "project", "프로젝트 편집 다이얼로그 제목", "프로젝트 수정");
        createTranslationKeyIfNotExists("project.dialog.createTitle", "project", "프로젝트 생성 다이얼로그 제목", "새 프로젝트 생성");
        createTranslationKeyIfNotExists("project.form.name", "project", "프로젝트 이름 폼", "프로젝트 이름");
        createTranslationKeyIfNotExists("project.form.code", "project", "프로젝트 코드 폼", "프로젝트 코드");
        createTranslationKeyIfNotExists("project.form.codePlaceholder", "project", "프로젝트 코드 플레이스홀더", "예: PROJ001");
        createTranslationKeyIfNotExists("project.form.organization", "project", "소속 조직 폼", "소속 조직");
        createTranslationKeyIfNotExists("project.form.noOrganization", "project", "조직 없음 옵션", "독립 프로젝트 (조직 없음)");
        createTranslationKeyIfNotExists("project.form.description", "project", "설명 폼", "설명");
        createTranslationKeyIfNotExists("project.form.descriptionPlaceholder", "project", "설명 플레이스홀더", "프로젝트에 대한 설명을 입력하세요...");
        createTranslationKeyIfNotExists("project.dialog.transferTitle", "project", "프로젝트 이전 다이얼로그 제목", "프로젝트 조직 이전");
        createTranslationKeyIfNotExists("project.form.targetOrganization", "project", "대상 조직 폼", "대상 조직");
        createTranslationKeyIfNotExists("project.form.convertToIndependent", "project", "독립 프로젝트 전환 옵션", "독립 프로젝트로 전환");
        createTranslationKeyIfNotExists("project.dialog.forceDeleteTitle", "project", "강제 삭제 다이얼로그 제목", "프로젝트 강제 삭제 확인");
        createTranslationKeyIfNotExists("project.dialog.deleteTitle", "project", "삭제 다이얼로그 제목", "프로젝트 삭제 확인");
        createTranslationKeyIfNotExists("project.dialog.forceDeleteWarningTitle", "project", "강제 삭제 경고 제목", "⚠️ 강제 삭제 경고");
        createTranslationKeyIfNotExists("project.dialog.forceDeleteWarningMessage", "project", "강제 삭제 경고 메시지", "연결된 모든 테스트 플랜, 테스트 케이스, 실행 이력이 함께 삭제됩니다! 이 작업은 되돌릴 수 없습니다.");
        createTranslationKeyIfNotExists("project.dialog.deleteWarningMessage", "project", "삭제 경고 메시지", "이 작업은 되돌릴 수 없습니다. 프로젝트에 속한 모든 테스트케이스와 데이터도 함께 삭제됩니다.");

        // 공통 키들
        createTranslationKeyIfNotExists("common.changeLanguage", "common", "언어 변경 툴팁", "언어 변경");
        createTranslationKeyIfNotExists("common.buttons.delete", "common", "공통 삭제 버튼", "삭제");
        createTranslationKeyIfNotExists("common.buttons.cancel", "common", "공통 취소 버튼", "취소");
        createTranslationKeyIfNotExists("common.buttons.save", "common", "공통 저장 버튼", "저장");
        createTranslationKeyIfNotExists("common.buttons.create", "common", "공통 생성 버튼", "생성");
        createTranslationKeyIfNotExists("common.buttons.edit", "common", "공통 수정 버튼", "수정");
        createTranslationKeyIfNotExists("common.buttons.update", "common", "공통 업데이트 버튼", "수정");

        // 조직 관리 관련 키들 (OrganizationList & OrganizationDetail)
        createTranslationKeyIfNotExists("organization.management.title", "organization", "조직 관리 페이지 제목", "조직 관리");
        createTranslationKeyIfNotExists("organization.buttons.createNew", "organization", "새 조직 생성 버튼", "새 조직 생성");
        createTranslationKeyIfNotExists("organization.buttons.view", "organization", "조직 보기 버튼", "조직 보기");
        createTranslationKeyIfNotExists("organization.buttons.edit", "organization", "조직 수정 버튼", "조직 수정");
        createTranslationKeyIfNotExists("organization.buttons.invite", "organization", "멤버 초대 버튼", "멤버 초대");
        createTranslationKeyIfNotExists("organization.buttons.createProject", "organization", "프로젝트 생성 버튼", "프로젝트 생성");
        createTranslationKeyIfNotExists("organization.buttons.firstOrganization", "organization", "첫 번째 조직 생성 버튼", "첫 번째 조직 생성");
        createTranslationKeyIfNotExists("organization.buttons.firstProject", "organization", "첫 번째 프로젝트 생성 버튼", "첫 번째 프로젝트 생성");
        createTranslationKeyIfNotExists("organization.buttons.back", "organization", "조직 목록으로 돌아가기", "조직 목록으로");

        // 조직 상태 및 메시지들
        createTranslationKeyIfNotExists("organization.messages.noOrganizations", "organization", "조직 없음 메시지", "조직이 없습니다");
        createTranslationKeyIfNotExists("organization.messages.noProjects", "organization", "프로젝트 없음 메시지", "이 조직에는 아직 프로젝트가 없습니다.");
        createTranslationKeyIfNotExists("organization.messages.createHint", "organization", "조직 생성 힌트", "새 조직을 생성하여 프로젝트와 팀을 관리해보세요.");
        createTranslationKeyIfNotExists("organization.messages.joinHint", "organization", "조직 참가 힌트", "조직에 참가하려면 시스템 관리자에게 문의하세요.");
        createTranslationKeyIfNotExists("organization.messages.accessDenied", "organization", "접근 권한 없음", "현재 사용자는 어떤 조직에도 속해있지 않습니다. 시스템 관리자에게 문의하여 조직 멤버로 추가되거나 새 조직을 생성하세요.");
        createTranslationKeyIfNotExists("organization.messages.canCreateNew", "organization", "새 조직 생성 가능 안내", "기존 조직에 접근할 수 없지만, 새로운 조직을 생성할 수 있습니다.");
        createTranslationKeyIfNotExists("organization.messages.noAccessContact", "organization", "접근 불가 안내", "현재 참가 가능한 조직이 없습니다. 시스템 관리자에게 문의하세요.");
        createTranslationKeyIfNotExists("organization.messages.notFound", "organization", "조직 찾을 수 없음", "조직을 찾을 수 없습니다.");

        // 조직 폼 라벨들
        createTranslationKeyIfNotExists("organization.form.name", "organization", "조직 이름 라벨", "조직 이름");
        createTranslationKeyIfNotExists("organization.form.description", "organization", "조직 설명 라벨", "설명");
        createTranslationKeyIfNotExists("organization.form.descriptionPlaceholder", "organization", "조직 설명 플레이스홀더", "조직에 대한 설명을 입력하세요...");
        createTranslationKeyIfNotExists("organization.form.nameRequired", "organization", "조직 이름 필수 입력", "조직 이름을 입력해주세요.");
        createTranslationKeyIfNotExists("organization.form.codeRequired", "organization", "프로젝트 코드 필수", "프로젝트 코드를 입력해주세요.");
        createTranslationKeyIfNotExists("organization.form.projectNameRequired", "organization", "프로젝트 이름 필수", "프로젝트 이름을 입력해주세요.");
        createTranslationKeyIfNotExists("organization.form.usernameRequired", "organization", "사용자명 필수", "사용자명을 입력해주세요.");

        // 다이얼로그 제목들
        createTranslationKeyIfNotExists("organization.dialog.create.title", "organization", "조직 생성 다이얼로그 제목", "새 조직 생성");
        createTranslationKeyIfNotExists("organization.dialog.edit.title", "organization", "조직 수정 다이얼로그 제목", "조직 수정");
        createTranslationKeyIfNotExists("organization.dialog.delete.title", "organization", "조직 삭제 다이얼로그 제목", "조직 삭제 확인");
        createTranslationKeyIfNotExists("organization.dialog.invite.title", "organization", "멤버 초대 다이얼로그 제목", "멤버 초대");
        createTranslationKeyIfNotExists("organization.dialog.project.title", "organization", "프로젝트 생성 다이얼로그 제목", "조직별 프로젝트 생성");
        createTranslationKeyIfNotExists("organization.dialog.editInfo.title", "organization", "조직 정보 수정 다이얼로그 제목", "조직 정보 수정");

        // 삭제 확인 메시지들
        createTranslationKeyIfNotExists("organization.dialog.delete.message", "organization", "조직 삭제 확인 메시지", "조직을 정말 삭제하시겠습니까?");
        createTranslationKeyIfNotExists("organization.dialog.delete.warning", "organization", "조직 삭제 경고", "이 작업은 되돌릴 수 없습니다. 조직에 속한 모든 프로젝트와 데이터도 함께 삭제됩니다.");

        // 상세 페이지 관련
        createTranslationKeyIfNotExists("organization.detail.members", "organization", "멤버 탭", "멤버");
        createTranslationKeyIfNotExists("organization.detail.projects", "organization", "프로젝트 탭", "프로젝트");
        createTranslationKeyIfNotExists("organization.detail.organizationMembers", "organization", "조직 멤버 제목", "조직 멤버");
        createTranslationKeyIfNotExists("organization.detail.organizationProjects", "organization", "조직 프로젝트 제목", "조직 프로젝트");

        // 테이블 헤더들
        createTranslationKeyIfNotExists("organization.table.user", "organization", "사용자 테이블 헤더", "사용자");
        createTranslationKeyIfNotExists("organization.table.role", "organization", "역할 테이블 헤더", "역할");
        createTranslationKeyIfNotExists("organization.table.joinDate", "organization", "가입일 테이블 헤더", "가입일");
        createTranslationKeyIfNotExists("organization.table.actions", "organization", "작업 테이블 헤더", "작업");

        // 멤버 관리 관련
        createTranslationKeyIfNotExists("organization.member.remove", "organization", "멤버 제거", "멤버 제거");
        createTranslationKeyIfNotExists("organization.member.username", "organization", "사용자명", "사용자명");
        createTranslationKeyIfNotExists("organization.member.role", "organization", "역할", "역할");

        // 프로젝트 관리 관련
        createTranslationKeyIfNotExists("organization.project.code", "organization", "프로젝트 코드", "프로젝트 코드");
        createTranslationKeyIfNotExists("organization.project.name", "organization", "프로젝트 이름", "프로젝트 이름");
        createTranslationKeyIfNotExists("organization.project.description", "organization", "프로젝트 설명", "프로젝트 설명");
        createTranslationKeyIfNotExists("organization.project.codePlaceholder", "organization", "프로젝트 코드 플레이스홀더", "예: WEB_APP_TEST");
        createTranslationKeyIfNotExists("organization.project.namePlaceholder", "organization", "프로젝트 이름 플레이스홀더", "예: 웹 애플리케이션 테스트");
        createTranslationKeyIfNotExists("organization.project.descriptionPlaceholder", "organization", "프로젝트 설명 플레이스홀더", "프로젝트에 대한 간단한 설명을 입력하세요...");
        createTranslationKeyIfNotExists("organization.project.codeHelperText", "organization", "프로젝트 코드 도움말", "영문, 숫자, 언더스코어(_), 하이픈(-)만 사용 가능");
        createTranslationKeyIfNotExists("organization.project.belongsTo", "organization", "프로젝트 소속 안내", "이 프로젝트는 조직에 속하게 됩니다.");
        createTranslationKeyIfNotExists("organization.project.noDescription", "organization", "설명 없음", "설명 없음");

        // 에러 관련
        createTranslationKeyIfNotExists("organization.error.accessDenied", "organization", "접근 권한 없음 에러", "조직 접근 권한 없음");
        createTranslationKeyIfNotExists("organization.error.authRequired", "organization", "인증 필요 에러", "인증 필요");
        createTranslationKeyIfNotExists("organization.error.resourceNotFound", "organization", "리소스 없음 에러", "리소스 없음");
        createTranslationKeyIfNotExists("organization.error.general", "organization", "일반 오류", "오류 발생");
        createTranslationKeyIfNotExists("organization.error.authDescription", "organization", "인증 필요 설명", "로그인이 필요합니다. 다시 로그인해주세요.");
        createTranslationKeyIfNotExists("organization.error.notFoundDescription", "organization", "리소스 없음 설명", "요청한 리소스를 찾을 수 없습니다.");
        createTranslationKeyIfNotExists("organization.error.generalDescription", "organization", "일반 오류 설명", "문제가 지속되면 시스템 관리자에게 문의하세요.");
        createTranslationKeyIfNotExists("organization.error.problemOccurred", "organization", "문제 발생", "문제가 발생했습니다");
        createTranslationKeyIfNotExists("organization.error.occurredAt", "organization", "발생 시간", "발생 시간: {date}");

        // 사용자 프로필 관리 관련 키들
        createTranslationKeyIfNotExists("profile.title", "profile", "사용자 프로필 다이얼로그 제목", "사용자 프로필");
        createTranslationKeyIfNotExists("profile.tabs.basicInfo", "profile", "기본 정보 탭", "기본 정보");
        createTranslationKeyIfNotExists("profile.tabs.password", "profile", "비밀번호 탭", "비밀번호");
        createTranslationKeyIfNotExists("profile.tabs.language", "profile", "언어 설정 탭", "언어 설정");
        createTranslationKeyIfNotExists("profile.tabs.jira", "profile", "JIRA 설정 탭", "JIRA 설정");

        // 기본 정보 관련
        createTranslationKeyIfNotExists("profile.form.name", "profile", "이름 입력 라벨", "이름");
        createTranslationKeyIfNotExists("profile.form.email", "profile", "이메일 입력 라벨", "이메일");
        createTranslationKeyIfNotExists("profile.validation.nameRequired", "profile", "이름 필수 입력", "이름을 입력하세요.");
        createTranslationKeyIfNotExists("profile.validation.emailRequired", "profile", "이메일 필수 입력", "이메일을 입력하세요.");
        createTranslationKeyIfNotExists("profile.validation.allRequired", "profile", "모든 필드 필수", "이름과 이메일을 모두 입력하세요.");
        createTranslationKeyIfNotExists("profile.success.updated", "profile", "정보 업데이트 성공", "정보가 성공적으로 변경되었습니다.");
        createTranslationKeyIfNotExists("profile.error.updateFailed", "profile", "정보 업데이트 실패", "정보 변경에 실패했습니다.");

        // 비밀번호 변경 관련
        createTranslationKeyIfNotExists("password.change.title", "password", "비밀번호 변경 제목", "비밀번호 변경");
        createTranslationKeyIfNotExists("password.change.description", "password", "비밀번호 변경 설명", "보안을 위해 정기적으로 비밀번호를 변경해주세요.");
        createTranslationKeyIfNotExists("password.form.current", "password", "현재 비밀번호 라벨", "현재 비밀번호");
        createTranslationKeyIfNotExists("password.form.new", "password", "새 비밀번호 라벨", "새 비밀번호");
        createTranslationKeyIfNotExists("password.form.confirm", "password", "새 비밀번호 확인 라벨", "새 비밀번호 확인");
        createTranslationKeyIfNotExists("password.button.change", "password", "비밀번호 변경 버튼", "비밀번호 변경");
        createTranslationKeyIfNotExists("password.button.changing", "password", "비밀번호 변경 중 버튼", "변경 중...");

        // 비밀번호 검증 관련
        createTranslationKeyIfNotExists("password.validation.currentRequired", "password", "현재 비밀번호 필수", "현재 비밀번호를 입력해주세요");
        createTranslationKeyIfNotExists("password.validation.newRequired", "password", "새 비밀번호 필수", "새 비밀번호를 입력해주세요");
        createTranslationKeyIfNotExists("password.validation.confirmRequired", "password", "비밀번호 확인 필수", "비밀번호 확인을 입력해주세요");
        createTranslationKeyIfNotExists("password.validation.mismatch", "password", "비밀번호 불일치", "새 비밀번호와 일치하지 않습니다");
        createTranslationKeyIfNotExists("password.validation.sameAsCurrent", "password", "동일한 비밀번호", "새 비밀번호는 현재 비밀번호와 달라야 합니다");
        createTranslationKeyIfNotExists("password.validation.minLength", "password", "최소 길이", "최소 8자 이상이어야 합니다");
        createTranslationKeyIfNotExists("password.validation.maxLength", "password", "최대 길이", "최대 100자까지 입력 가능합니다");
        createTranslationKeyIfNotExists("password.validation.complexity", "password", "복잡도 요구사항", "영문, 숫자, 특수문자 중 최소 2가지를 포함해야 합니다");

        // 비밀번호 요구사항 표시
        createTranslationKeyIfNotExists("password.requirements.title", "password", "비밀번호 요구사항 제목", "비밀번호 요구사항:");
        createTranslationKeyIfNotExists("password.requirements.length", "password", "길이 요구사항", "8-100자 길이");
        createTranslationKeyIfNotExists("password.requirements.letter", "password", "영문 포함", "영문 포함");
        createTranslationKeyIfNotExists("password.requirements.digit", "password", "숫자 포함", "숫자 포함");
        createTranslationKeyIfNotExists("password.requirements.special", "password", "특수문자 포함", "특수문자 포함");
        createTranslationKeyIfNotExists("password.requirements.combination", "password", "조합 요구사항", "2가지 이상 조합");
        createTranslationKeyIfNotExists("password.success.changed", "password", "비밀번호 변경 성공", "비밀번호가 성공적으로 변경되었습니다.");
        createTranslationKeyIfNotExists("password.error.changeFailed", "password", "비밀번호 변경 실패", "비밀번호 변경 중 오류가 발생했습니다.");

        // 언어 설정 관련
        createTranslationKeyIfNotExists("language.settings.title", "language", "언어 설정 제목", "언어 설정");
        createTranslationKeyIfNotExists("language.settings.description", "language", "언어 설정 설명", "선호하는 언어를 선택하면 전체 애플리케이션에서 해당 언어로 표시됩니다.");
        createTranslationKeyIfNotExists("language.interface", "language", "인터페이스 언어 라벨", "인터페이스 언어");
        createTranslationKeyIfNotExists("language.helperText", "language", "언어 변경 도움말", "변경된 언어는 즉시 적용되며 자동으로 저장됩니다.");
        createTranslationKeyIfNotExists("language.current", "language", "현재 언어", "현재 언어:");
        createTranslationKeyIfNotExists("language.korean", "language", "한국어", "한국어");
        createTranslationKeyIfNotExists("language.english", "language", "영어", "English");

        // JIRA 설정 관련
        createTranslationKeyIfNotExists("jira.settings.title", "jira", "JIRA 통합 설정 제목", "JIRA 통합 설정");
        createTranslationKeyIfNotExists("jira.settings.description", "jira", "JIRA 설정 설명", "JIRA와 연동하여 테스트 결과를 자동으로 이슈에 코멘트로 추가할 수 있습니다.");
        createTranslationKeyIfNotExists("jira.button.configure", "jira", "설정 수정 버튼", "설정 수정");
        createTranslationKeyIfNotExists("jira.button.delete", "jira", "설정 삭제 버튼", "설정 삭제");
        createTranslationKeyIfNotExists("jira.success.saved", "jira", "JIRA 설정 저장 성공", "JIRA 설정이 저장되었습니다.");
        createTranslationKeyIfNotExists("jira.success.deleted", "jira", "JIRA 설정 삭제 성공", "JIRA 설정이 삭제되었습니다.");
        createTranslationKeyIfNotExists("jira.error.saveFailed", "jira", "JIRA 설정 저장 실패", "JIRA 설정 저장에 실패했습니다.");
        createTranslationKeyIfNotExists("jira.error.deleteFailed", "jira", "JIRA 설정 삭제 실패", "JIRA 설정 삭제 실패:");
        createTranslationKeyIfNotExists("jira.error.network", "jira", "네트워크 오류", "네트워크 연결을 확인해주세요.");
        createTranslationKeyIfNotExists("jira.error.authentication", "jira", "인증 오류", "로그인이 만료되었습니다. 다시 로그인해주세요.");
        createTranslationKeyIfNotExists("jira.error.encryption", "jira", "암호화 오류", "서버 설정에 문제가 있습니다. 관리자에게 문의하세요.");
        createTranslationKeyIfNotExists("jira.confirm.delete", "jira", "JIRA 설정 삭제 확인", "JIRA 설정을 삭제하시겠습니까?");

        // 사용자 목록 관리 관련
        createTranslationKeyIfNotExists("userList.title", "userList", "사용자 관리 제목", "사용자 관리");
        createTranslationKeyIfNotExists("userList.loading", "userList", "사용자 목록 로딩", "사용자 목록을 불러오는 중...");
        createTranslationKeyIfNotExists("userList.search.placeholder", "userList", "검색 플레이스홀더", "이름, 사용자명, 이메일 검색...");
        createTranslationKeyIfNotExists("userList.filter.role", "userList", "역할 필터", "역할");
        createTranslationKeyIfNotExists("userList.filter.status", "userList", "상태 필터", "상태");
        createTranslationKeyIfNotExists("userList.filter.all", "userList", "전체 필터", "전체");
        createTranslationKeyIfNotExists("userList.filter.active", "userList", "활성 필터", "활성");
        createTranslationKeyIfNotExists("userList.filter.inactive", "userList", "비활성 필터", "비활성");
        createTranslationKeyIfNotExists("userList.button.refresh", "userList", "새로고침 버튼", "새로고침");
        createTranslationKeyIfNotExists("userList.button.export", "userList", "데이터 내보내기 버튼", "데이터 내보내기");
        createTranslationKeyIfNotExists("userList.button.reset", "userList", "초기화 버튼", "초기화");

        // 통계 카드 관련
        createTranslationKeyIfNotExists("userList.stats.totalUsers", "userList", "전체 사용자", "전체 사용자");
        createTranslationKeyIfNotExists("userList.stats.activeUsers", "userList", "활성 사용자", "활성 사용자");
        createTranslationKeyIfNotExists("userList.stats.inactiveUsers", "userList", "비활성 사용자", "비활성 사용자");
        createTranslationKeyIfNotExists("userList.stats.recentRegistrations", "userList", "최근 가입", "최근 가입");

        // 테이블 헤더 관련
        createTranslationKeyIfNotExists("userList.table.username", "userList", "사용자명 헤더", "사용자명");
        createTranslationKeyIfNotExists("userList.table.name", "userList", "이름 헤더", "이름");
        createTranslationKeyIfNotExists("userList.table.email", "userList", "이메일 헤더", "이메일");
        createTranslationKeyIfNotExists("userList.table.role", "userList", "역할 헤더", "역할");
        createTranslationKeyIfNotExists("userList.table.status", "userList", "상태 헤더", "상태");
        createTranslationKeyIfNotExists("userList.table.createdAt", "userList", "가입일 헤더", "가입일");
        createTranslationKeyIfNotExists("userList.table.lastLogin", "userList", "최종 로그인 헤더", "최종 로그인");
        createTranslationKeyIfNotExists("userList.table.actions", "userList", "작업 헤더", "작업");

        // 상태 및 액션 관련
        createTranslationKeyIfNotExists("userList.status.none", "userList", "없음 상태", "없음");
        createTranslationKeyIfNotExists("userList.action.view", "userList", "상세 보기 액션", "상세 보기");
        createTranslationKeyIfNotExists("userList.action.moreActions", "userList", "더 많은 작업", "더 많은 작업");
        createTranslationKeyIfNotExists("userList.action.activate", "userList", "활성화 액션", "활성화");
        createTranslationKeyIfNotExists("userList.action.deactivate", "userList", "비활성화 액션", "비활성화");

        // 빈 상태 및 메시지
        createTranslationKeyIfNotExists("userList.empty.message", "userList", "빈 목록 메시지", "검색 조건에 맞는 사용자가 없습니다.");
        createTranslationKeyIfNotExists("userList.empty.resetButton", "userList", "검색 조건 초기화", "검색 조건 초기화");

        // 페이지네이션 관련
        createTranslationKeyIfNotExists("userList.pagination.rowsPerPage", "userList", "페이지당 행 수", "페이지당 행 수:");
        createTranslationKeyIfNotExists("userList.pagination.displayedRows", "userList", "표시된 행", "{from}-{to} / {count} 중");

        // 헤더 네비게이션 관련
        createTranslationKeyIfNotExists("header.nav.dashboard", "header", "대시보드 네비게이션", "대시보드");
        createTranslationKeyIfNotExists("header.nav.organizationManagement", "header", "조직 관리 네비게이션", "조직 관리");
        createTranslationKeyIfNotExists("header.nav.userManagement", "header", "사용자 관리 네비게이션", "사용자 관리");
        createTranslationKeyIfNotExists("header.nav.mailSettings", "header", "메일 설정 네비게이션", "메일 설정");
        createTranslationKeyIfNotExists("header.nav.translationManagement", "header", "번역 관리 네비게이션", "번역 관리");
        createTranslationKeyIfNotExists("header.nav.projectSelection", "header", "프로젝트 선택 네비게이션", "프로젝트 선택");

        // 헤더 사용자 메뉴 관련
        createTranslationKeyIfNotExists("header.userMenu.profile", "header", "사용자 프로필 메뉴", "프로필");
        createTranslationKeyIfNotExists("header.userMenu.logout", "header", "로그아웃 메뉴", "로그아웃");

        log.info("번역 키 데이터 초기화 완료");
    }

    private void createTranslationKeyIfNotExists(String keyName, String category, String description, String defaultValue) {
        Optional<TranslationKey> existingKey = translationKeyRepository.findByKeyName(keyName);
        if (existingKey.isEmpty()) {
            TranslationKey translationKey = new TranslationKey(keyName, category, description, defaultValue);
            translationKeyRepository.save(translationKey);
            log.debug("번역 키 생성: {}", keyName);
        } else {
            log.debug("번역 키 이미 존재: {}", keyName);
        }
    }

    private void initializeTranslations() {
        log.info("기본 번역 데이터 초기화 중...");

        // 한국어 번역 (기본 언어)
        initializeKoreanTranslations();

        // 영어 번역
        initializeEnglishTranslations();

        log.info("번역 데이터 초기화 완료");
    }

    private void initializeKoreanTranslations() {
        String languageCode = "ko";
        String createdBy = "system";

        // 로그인 관련 번역
        createTranslationIfNotExists("login.title", languageCode, "로그인", createdBy);
        createTranslationIfNotExists("login.username", languageCode, "아이디", createdBy);
        createTranslationIfNotExists("login.password", languageCode, "비밀번호", createdBy);
        createTranslationIfNotExists("login.button", languageCode, "로그인", createdBy);
        createTranslationIfNotExists("login.remember", languageCode, "로그인 상태 유지", createdBy);
        createTranslationIfNotExists("login.forgot_password", languageCode, "비밀번호를 잊으셨나요?", createdBy);
        createTranslationIfNotExists("login.error.failed", languageCode, "로그인에 실패했습니다.", createdBy);
        createTranslationIfNotExists("login.error.general", languageCode, "로그인 중 오류가 발생했습니다.", createdBy);
        createTranslationIfNotExists("login.back", languageCode, "로그인으로 돌아가기", createdBy);

        // 회원가입 관련 번역
        createTranslationIfNotExists("register.title", languageCode, "회원가입", createdBy);
        createTranslationIfNotExists("register.confirm_password", languageCode, "비밀번호 확인", createdBy);
        createTranslationIfNotExists("register.name", languageCode, "이름", createdBy);
        createTranslationIfNotExists("register.email", languageCode, "이메일", createdBy);
        createTranslationIfNotExists("register.button", languageCode, "회원가입", createdBy);
        createTranslationIfNotExists("register.switch", languageCode, "회원가입", createdBy);
        createTranslationIfNotExists("register.success", languageCode, "회원가입이 완료되었습니다. 로그인 해주세요.", createdBy);
        createTranslationIfNotExists("register.error.general", languageCode, "회원가입 중 오류가 발생했습니다.", createdBy);

        // 검증 메시지 번역
        createTranslationIfNotExists("validation.required.all", languageCode, "모든 필드를 입력해주세요.", createdBy);
        createTranslationIfNotExists("validation.password.mismatch", languageCode, "비밀번호가 일치하지 않습니다.", createdBy);

        // 버튼 번역
        createTranslationIfNotExists("button.save", languageCode, "저장", createdBy);
        createTranslationIfNotExists("button.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("button.delete", languageCode, "삭제", createdBy);
        createTranslationIfNotExists("button.edit", languageCode, "편집", createdBy);
        createTranslationIfNotExists("button.add", languageCode, "추가", createdBy);
        createTranslationIfNotExists("button.close", languageCode, "닫기", createdBy);
        createTranslationIfNotExists("button.confirm", languageCode, "확인", createdBy);

        // 메시지 번역
        createTranslationIfNotExists("message.success", languageCode, "성공적으로 처리되었습니다.", createdBy);
        createTranslationIfNotExists("message.error", languageCode, "오류가 발생했습니다.", createdBy);
        createTranslationIfNotExists("message.loading", languageCode, "로딩 중...", createdBy);
        createTranslationIfNotExists("message.confirm_delete", languageCode, "정말로 삭제하시겠습니까?", createdBy);

        // 검증 메시지 번역
        createTranslationIfNotExists("validation.required", languageCode, "필수 입력 항목입니다.", createdBy);
        createTranslationIfNotExists("validation.email", languageCode, "올바른 이메일 형식을 입력하세요.", createdBy);
        createTranslationIfNotExists("validation.min_length", languageCode, "최소 {0}글자 이상 입력하세요.", createdBy);
        createTranslationIfNotExists("validation.max_length", languageCode, "최대 {0}글자까지 입력 가능합니다.", createdBy);

        // 언어 선택 번역
        createTranslationIfNotExists("language.select", languageCode, "언어 선택", createdBy);
        createTranslationIfNotExists("language.korean", languageCode, "한국어", createdBy);
        createTranslationIfNotExists("language.english", languageCode, "English", createdBy);
        createTranslationIfNotExists("language.japanese", languageCode, "日本語", createdBy);
        createTranslationIfNotExists("language.chinese", languageCode, "中文", createdBy);

        // 프로젝트 관리 페이지 번역
        createTranslationIfNotExists("project.title", languageCode, "프로젝트 관리", createdBy);
        createTranslationIfNotExists("project.buttons.createNew", languageCode, "새 프로젝트 생성", createdBy);
        createTranslationIfNotExists("project.tabs.byOrganization", languageCode, "조직별 프로젝트", createdBy);
        createTranslationIfNotExists("project.tabs.independent", languageCode, "독립 프로젝트", createdBy);
        createTranslationIfNotExists("project.tabs.all", languageCode, "전체 프로젝트", createdBy);
        createTranslationIfNotExists("project.types.independent", languageCode, "독립 프로젝트", createdBy);
        createTranslationIfNotExists("project.buttons.open", languageCode, "프로젝트 열기", createdBy);
        createTranslationIfNotExists("project.buttons.edit", languageCode, "편집", createdBy);
        createTranslationIfNotExists("project.buttons.transfer", languageCode, "이전", createdBy);
        createTranslationIfNotExists("project.buttons.delete", languageCode, "삭제", createdBy);
        createTranslationIfNotExists("project.buttons.forceDelete", languageCode, "강제 삭제", createdBy);
        createTranslationIfNotExists("project.tooltips.testCaseCount", languageCode, "테스트케이스 수", createdBy);
        createTranslationIfNotExists("project.tooltips.memberCount", languageCode, "멤버 수", createdBy);
        createTranslationIfNotExists("project.tooltips.junitStatus", languageCode, "자동화 테스트 현황", createdBy);
        createTranslationIfNotExists("project.stats.projectCount", languageCode, "{count}개 프로젝트", createdBy);
        createTranslationIfNotExists("project.messages.noOrganizationProjects", languageCode, "조직별 프로젝트가 없습니다", createdBy);
        createTranslationIfNotExists("project.messages.addOrganizationProjectsHint", languageCode, "조직에 프로젝트를 추가하거나 새 조직 프로젝트를 생성해보세요.", createdBy);
        createTranslationIfNotExists("project.messages.noProjectsInOrganization", languageCode, "이 조직에는 아직 프로젝트가 없습니다.", createdBy);
        createTranslationIfNotExists("project.messages.noIndependentProjects", languageCode, "독립 프로젝트가 없습니다", createdBy);
        createTranslationIfNotExists("project.messages.addIndependentProjectsHint", languageCode, "독립 프로젝트를 생성해보세요.", createdBy);
        createTranslationIfNotExists("project.messages.noAllProjects", languageCode, "등록된 프로젝트가 없습니다", createdBy);
        createTranslationIfNotExists("project.messages.addFirstProjectHint", languageCode, "첫 번째 프로젝트를 생성해보세요.", createdBy);
        createTranslationIfNotExists("project.form.nameRequired", languageCode, "프로젝트 이름을 입력해주세요.", createdBy);
        createTranslationIfNotExists("project.dialog.create.title", languageCode, "새 프로젝트 생성", createdBy);
        createTranslationIfNotExists("project.dialog.edit.title", languageCode, "프로젝트 편집", createdBy);
        createTranslationIfNotExists("project.dialog.transfer.title", languageCode, "프로젝트 이전", createdBy);
        createTranslationIfNotExists("project.dialog.delete.title", languageCode, "프로젝트 삭제 확인", createdBy);

        // 추가 프로젝트 관련 한국어 번역
        createTranslationIfNotExists("project.form.codeRequired", languageCode, "프로젝트 코드를 입력해주세요.", createdBy);
        createTranslationIfNotExists("project.tooltips.automationTestCount", languageCode, "자동화 테스트 결과 수", createdBy);
        createTranslationIfNotExists("project.buttons.openProject", languageCode, "프로젝트 열기", createdBy);
        createTranslationIfNotExists("project.buttons.addProject", languageCode, "프로젝트 추가", createdBy);
        createTranslationIfNotExists("project.buttons.createIndependent", languageCode, "독립 프로젝트 생성", createdBy);
        createTranslationIfNotExists("project.buttons.createFirstIndependent", languageCode, "첫 번째 독립 프로젝트 생성", createdBy);
        createTranslationIfNotExists("project.buttons.createProject", languageCode, "프로젝트 생성", createdBy);
        createTranslationIfNotExists("project.stats.totalProjectCount", languageCode, "총 {count}개 프로젝트", createdBy);
        createTranslationIfNotExists("project.messages.createIndependentProjectHint", languageCode, "조직에 속하지 않는 개인 프로젝트를 생성해보세요.", createdBy);
        createTranslationIfNotExists("project.messages.noParticipatingProjects", languageCode, "참여 중인 프로젝트가 없습니다", createdBy);
        createTranslationIfNotExists("project.messages.needInvitation", languageCode, "프로젝트가 없는 사용자는 프로젝트에 초대가 되어야 이용이 가능합니다.", createdBy);
        createTranslationIfNotExists("project.messages.requestInvitation", languageCode, "시스템관리자에게 프로젝트 초대를 요청하세요.", createdBy);
        createTranslationIfNotExists("project.menu.transfer", languageCode, "조직 이전", createdBy);
        createTranslationIfNotExists("project.menu.forceDelete", languageCode, "강제 삭제", createdBy);
        createTranslationIfNotExists("project.dialog.editTitle", languageCode, "프로젝트 수정", createdBy);
        createTranslationIfNotExists("project.dialog.createTitle", languageCode, "새 프로젝트 생성", createdBy);
        createTranslationIfNotExists("project.form.name", languageCode, "프로젝트 이름", createdBy);
        createTranslationIfNotExists("project.form.code", languageCode, "프로젝트 코드", createdBy);
        createTranslationIfNotExists("project.form.codePlaceholder", languageCode, "예: PROJ001", createdBy);
        createTranslationIfNotExists("project.form.organization", languageCode, "소속 조직", createdBy);
        createTranslationIfNotExists("project.form.noOrganization", languageCode, "독립 프로젝트 (조직 없음)", createdBy);
        createTranslationIfNotExists("project.form.description", languageCode, "설명", createdBy);
        createTranslationIfNotExists("project.form.descriptionPlaceholder", languageCode, "프로젝트에 대한 설명을 입력하세요...", createdBy);
        createTranslationIfNotExists("project.dialog.transferTitle", languageCode, "프로젝트 조직 이전", createdBy);
        createTranslationIfNotExists("project.form.targetOrganization", languageCode, "대상 조직", createdBy);
        createTranslationIfNotExists("project.form.convertToIndependent", languageCode, "독립 프로젝트로 전환", createdBy);
        createTranslationIfNotExists("project.dialog.forceDeleteTitle", languageCode, "프로젝트 강제 삭제 확인", createdBy);
        createTranslationIfNotExists("project.dialog.deleteTitle", languageCode, "프로젝트 삭제 확인", createdBy);
        createTranslationIfNotExists("project.dialog.forceDeleteWarningTitle", languageCode, "⚠️ 강제 삭제 경고", createdBy);
        createTranslationIfNotExists("project.dialog.forceDeleteWarningMessage", languageCode, "연결된 모든 테스트 플랜, 테스트 케이스, 실행 이력이 함께 삭제됩니다! 이 작업은 되돌릴 수 없습니다.", createdBy);
        createTranslationIfNotExists("project.dialog.deleteWarningMessage", languageCode, "이 작업은 되돌릴 수 없습니다. 프로젝트에 속한 모든 테스트케이스와 데이터도 함께 삭제됩니다.", createdBy);

        // 대시보드 한국어 번역
        createTranslationIfNotExists("dashboard.title", languageCode, "대시보드", createdBy);
        createTranslationIfNotExists("dashboard.lastUpdate", languageCode, "최근 업데이트: {date}", createdBy);
        createTranslationIfNotExists("dashboard.refresh", languageCode, "새로고침", createdBy);
        createTranslationIfNotExists("dashboard.refreshTooltip", languageCode, "대시보드 새로고침", createdBy);
        createTranslationIfNotExists("dashboard.project.totalTestCases", languageCode, "총 테스트케이스: {count}개", createdBy);
        createTranslationIfNotExists("dashboard.project.memberCount", languageCode, "프로젝트 멤버: {count}명", createdBy);
        createTranslationIfNotExists("dashboard.charts.recentTestResults", languageCode, "최근 테스트케이스 결과", createdBy);
        createTranslationIfNotExists("dashboard.charts.testResultsTrend", languageCode, "테스트케이스 결과 추이", createdBy);
        createTranslationIfNotExists("dashboard.charts.openTestRunResults", languageCode, "오픈 테스트런별 테스트케이스 결과", createdBy);
        createTranslationIfNotExists("dashboard.charts.assigneeResults", languageCode, "오픈 테스트런 담당자별 테스트케이스 결과", createdBy);
        createTranslationIfNotExists("dashboard.charts.testPlanResults", languageCode, "테스트 플랜별 최근 테스트 결과", createdBy);
        createTranslationIfNotExists("dashboard.charts.notRunTrend", languageCode, "오픈 테스트런 미실행 테스트케이스 추이", createdBy);
        createTranslationIfNotExists("dashboard.status.completed", languageCode, "완료", createdBy);
        createTranslationIfNotExists("dashboard.status.failed", languageCode, "실패 {rate}%", createdBy);
        createTranslationIfNotExists("dashboard.status.completedCount", languageCode, "{completed} / {total} 완료", createdBy);
        createTranslationIfNotExists("dashboard.messages.loading", languageCode, "📊 대시보드 데이터를 불러오는 중...", createdBy);
        createTranslationIfNotExists("dashboard.messages.noData", languageCode, "📋 대시보드 데이터가 없습니다. 프로젝트에 테스트 결과가 있는지 확인해주세요.", createdBy);
        createTranslationIfNotExists("dashboard.messages.dataLoading", languageCode, "데이터 로딩 중...", createdBy);
        createTranslationIfNotExists("dashboard.messages.noDataToShow", languageCode, "표시할 데이터가 없습니다.", createdBy);
        createTranslationIfNotExists("dashboard.messages.noOpenTestRuns", languageCode, "진행 중인 테스트런이 없습니다.", createdBy);
        createTranslationIfNotExists("dashboard.messages.selectProject", languageCode, "프로젝트를 선택해주세요.", createdBy);
        createTranslationIfNotExists("dashboard.filters.last15Days", languageCode, "최근 15일", createdBy);
        createTranslationIfNotExists("dashboard.actions.retry", languageCode, "다시 시도", createdBy);
        createTranslationIfNotExists("dashboard.actions.loginPage", languageCode, "로그인 페이지로", createdBy);
        createTranslationIfNotExists("dashboard.actions.details", languageCode, "상세 정보", createdBy);
        createTranslationIfNotExists("dashboard.errors.userAction", languageCode, "💡 해결방법: {action}", createdBy);
        createTranslationIfNotExists("dashboard.results.pass", languageCode, "성공", createdBy);
        createTranslationIfNotExists("dashboard.results.fail", languageCode, "실패", createdBy);
        createTranslationIfNotExists("dashboard.results.blocked", languageCode, "차단됨", createdBy);
        createTranslationIfNotExists("dashboard.results.skipped", languageCode, "건너뜀", createdBy);
        createTranslationIfNotExists("dashboard.results.notrun", languageCode, "미실행", createdBy);

        // 대시보드 차트 상태 라벨들 한국어 번역
        createTranslationIfNotExists("dashboard.status.pass", languageCode, "성공", createdBy);
        createTranslationIfNotExists("dashboard.status.fail", languageCode, "실패", createdBy);
        createTranslationIfNotExists("dashboard.status.blocked", languageCode, "차단됨", createdBy);
        createTranslationIfNotExists("dashboard.status.notrun", languageCode, "미실행", createdBy);

        // 조직 대시보드 관련 한국어 번역
        createTranslationIfNotExists("organization.dashboard.title", languageCode, "대시보드", createdBy);

        // 조직 대시보드 메트릭 항목들 한국어 번역
        createTranslationIfNotExists("organization.dashboard.metrics.totalOrganizations", languageCode, "총 조직 수", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalOrganizations.subtitle", languageCode, "등록된 조직", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalProjects", languageCode, "총 프로젝트 수", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalProjects.subtitle", languageCode, "활성 프로젝트", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalTestCases", languageCode, "총 테스트케이스 수", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalTestCases.subtitle", languageCode, "전체 테스트케이스", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalUsers", languageCode, "총 사용자 수", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalUsers.subtitle", languageCode, "등록된 사용자", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalMembers", languageCode, "총 멤버 수", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalMembers.subtitle", languageCode, "프로젝트 멤버", createdBy);

        // 조직 대시보드 탭 메뉴들 한국어 번역
        createTranslationIfNotExists("organization.dashboard.tabs.organizationStatus", languageCode, "조직 현황", createdBy);
        createTranslationIfNotExists("organization.dashboard.tabs.testStatistics", languageCode, "테스트 통계", createdBy);

        // 조직 대시보드 차트 제목들 한국어 번역
        createTranslationIfNotExists("organization.dashboard.charts.projectDistribution", languageCode, "조직별 프로젝트 분포", createdBy);
        createTranslationIfNotExists("organization.dashboard.charts.projectDistribution.projects", languageCode, "프로젝트", createdBy);
        createTranslationIfNotExists("organization.dashboard.charts.projectDistribution.members", languageCode, "멤버", createdBy);
        createTranslationIfNotExists("organization.dashboard.charts.organizationList", languageCode, "조직 목록", createdBy);
        createTranslationIfNotExists("organization.dashboard.charts.testResultDistribution", languageCode, "테스트 결과 분포", createdBy);
        createTranslationIfNotExists("organization.dashboard.charts.testResultDetails", languageCode, "테스트 결과 상세", createdBy);

        // 조직 목록 항목들 한국어 번역
        createTranslationIfNotExists("organization.dashboard.list.projectCount", languageCode, "프로젝트: {count}개", createdBy);
        createTranslationIfNotExists("organization.dashboard.list.memberCount", languageCode, "멤버: {count}명", createdBy);

        // 테스트 결과 상태들 한국어 번역
        createTranslationIfNotExists("organization.dashboard.testResults.success", languageCode, "성공", createdBy);
        createTranslationIfNotExists("organization.dashboard.testResults.failure", languageCode, "실패", createdBy);
        createTranslationIfNotExists("organization.dashboard.testResults.blocked", languageCode, "차단됨", createdBy);
        createTranslationIfNotExists("organization.dashboard.testResults.notRun", languageCode, "미실행", createdBy);

        // 헤더 네비게이션 한국어 번역
        createTranslationIfNotExists("header.nav.dashboard", languageCode, "대시보드", createdBy);
        createTranslationIfNotExists("header.nav.organizationManagement", languageCode, "조직 관리", createdBy);
        createTranslationIfNotExists("header.nav.userManagement", languageCode, "사용자 관리", createdBy);
        createTranslationIfNotExists("header.nav.mailSettings", languageCode, "메일 설정", createdBy);
        createTranslationIfNotExists("header.nav.translationManagement", languageCode, "번역 관리", createdBy);
        createTranslationIfNotExists("header.nav.projectSelection", languageCode, "프로젝트 선택", createdBy);

        // 사용자 메뉴 한국어 번역
        createTranslationIfNotExists("header.userMenu.profile", languageCode, "프로필", createdBy);
        createTranslationIfNotExists("header.userMenu.logout", languageCode, "로그아웃", createdBy);

        // 공통 메시지 한국어 번역
        createTranslationIfNotExists("common.loading", languageCode, "로딩 중...", createdBy);
        createTranslationIfNotExists("common.unauthorized.title", languageCode, "접근 권한이 없습니다", createdBy);
        createTranslationIfNotExists("common.unauthorized.description", languageCode, "이 페이지에 접근할 권한이 없습니다. 관리자에게 문의하세요.", createdBy);
        createTranslationIfNotExists("common.unauthorized.loginButton", languageCode, "로그인하기", createdBy);

        // 공통 번역
        createTranslationIfNotExists("common.changeLanguage", languageCode, "언어 변경", createdBy);
        createTranslationIfNotExists("common.buttons.delete", languageCode, "삭제", createdBy);
        createTranslationIfNotExists("common.buttons.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("common.buttons.save", languageCode, "저장", createdBy);
        createTranslationIfNotExists("common.buttons.create", languageCode, "생성", createdBy);
        createTranslationIfNotExists("common.buttons.edit", languageCode, "수정", createdBy);
        createTranslationIfNotExists("common.buttons.update", languageCode, "수정", createdBy);

        // 조직 관리 관련 한국어 번역
        createTranslationIfNotExists("organization.management.title", languageCode, "조직 관리", createdBy);
        createTranslationIfNotExists("organization.buttons.createNew", languageCode, "새 조직 생성", createdBy);
        createTranslationIfNotExists("organization.buttons.view", languageCode, "조직 보기", createdBy);
        createTranslationIfNotExists("organization.buttons.edit", languageCode, "조직 수정", createdBy);
        createTranslationIfNotExists("organization.buttons.invite", languageCode, "멤버 초대", createdBy);
        createTranslationIfNotExists("organization.buttons.createProject", languageCode, "프로젝트 생성", createdBy);
        createTranslationIfNotExists("organization.buttons.firstOrganization", languageCode, "첫 번째 조직 생성", createdBy);
        createTranslationIfNotExists("organization.buttons.firstProject", languageCode, "첫 번째 프로젝트 생성", createdBy);
        createTranslationIfNotExists("organization.buttons.back", languageCode, "조직 목록으로", createdBy);

        // 조직 상태 및 메시지들 한국어 번역
        createTranslationIfNotExists("organization.messages.noOrganizations", languageCode, "조직이 없습니다", createdBy);
        createTranslationIfNotExists("organization.messages.noProjects", languageCode, "이 조직에는 아직 프로젝트가 없습니다.", createdBy);
        createTranslationIfNotExists("organization.messages.createHint", languageCode, "새 조직을 생성하여 프로젝트와 팀을 관리해보세요.", createdBy);
        createTranslationIfNotExists("organization.messages.joinHint", languageCode, "조직에 참가하려면 시스템 관리자에게 문의하세요.", createdBy);
        createTranslationIfNotExists("organization.messages.accessDenied", languageCode, "현재 사용자는 어떤 조직에도 속해있지 않습니다. 시스템 관리자에게 문의하여 조직 멤버로 추가되거나 새 조직을 생성하세요.", createdBy);
        createTranslationIfNotExists("organization.messages.canCreateNew", languageCode, "기존 조직에 접근할 수 없지만, 새로운 조직을 생성할 수 있습니다.", createdBy);
        createTranslationIfNotExists("organization.messages.noAccessContact", languageCode, "현재 참가 가능한 조직이 없습니다. 시스템 관리자에게 문의하세요.", createdBy);
        createTranslationIfNotExists("organization.messages.notFound", languageCode, "조직을 찾을 수 없습니다.", createdBy);

        // 조직 폼 라벨들 한국어 번역
        createTranslationIfNotExists("organization.form.name", languageCode, "조직 이름", createdBy);
        createTranslationIfNotExists("organization.form.description", languageCode, "설명", createdBy);
        createTranslationIfNotExists("organization.form.descriptionPlaceholder", languageCode, "조직에 대한 설명을 입력하세요...", createdBy);
        createTranslationIfNotExists("organization.form.nameRequired", languageCode, "조직 이름을 입력해주세요.", createdBy);
        createTranslationIfNotExists("organization.form.codeRequired", languageCode, "프로젝트 코드를 입력해주세요.", createdBy);
        createTranslationIfNotExists("organization.form.projectNameRequired", languageCode, "프로젝트 이름을 입력해주세요.", createdBy);
        createTranslationIfNotExists("organization.form.usernameRequired", languageCode, "사용자명을 입력해주세요.", createdBy);

        // 다이얼로그 제목들 한국어 번역
        createTranslationIfNotExists("organization.dialog.create.title", languageCode, "새 조직 생성", createdBy);
        createTranslationIfNotExists("organization.dialog.edit.title", languageCode, "조직 수정", createdBy);
        createTranslationIfNotExists("organization.dialog.delete.title", languageCode, "조직 삭제 확인", createdBy);
        createTranslationIfNotExists("organization.dialog.invite.title", languageCode, "멤버 초대", createdBy);
        createTranslationIfNotExists("organization.dialog.project.title", languageCode, "조직별 프로젝트 생성", createdBy);
        createTranslationIfNotExists("organization.dialog.editInfo.title", languageCode, "조직 정보 수정", createdBy);

        // 삭제 확인 메시지들 한국어 번역
        createTranslationIfNotExists("organization.dialog.delete.message", languageCode, "조직을 정말 삭제하시겠습니까?", createdBy);
        createTranslationIfNotExists("organization.dialog.delete.warning", languageCode, "이 작업은 되돌릴 수 없습니다. 조직에 속한 모든 프로젝트와 데이터도 함께 삭제됩니다.", createdBy);

        // 상세 페이지 관련 한국어 번역
        createTranslationIfNotExists("organization.detail.members", languageCode, "멤버", createdBy);
        createTranslationIfNotExists("organization.detail.projects", languageCode, "프로젝트", createdBy);
        createTranslationIfNotExists("organization.detail.organizationMembers", languageCode, "조직 멤버", createdBy);
        createTranslationIfNotExists("organization.detail.organizationProjects", languageCode, "조직 프로젝트", createdBy);

        // 테이블 헤더들 한국어 번역
        createTranslationIfNotExists("organization.table.user", languageCode, "사용자", createdBy);
        createTranslationIfNotExists("organization.table.role", languageCode, "역할", createdBy);
        createTranslationIfNotExists("organization.table.joinDate", languageCode, "가입일", createdBy);
        createTranslationIfNotExists("organization.table.actions", languageCode, "작업", createdBy);

        // 멤버 관리 관련 한국어 번역
        createTranslationIfNotExists("organization.member.remove", languageCode, "멤버 제거", createdBy);
        createTranslationIfNotExists("organization.member.username", languageCode, "사용자명", createdBy);
        createTranslationIfNotExists("organization.member.role", languageCode, "역할", createdBy);

        // 프로젝트 관리 관련 한국어 번역
        createTranslationIfNotExists("organization.project.code", languageCode, "프로젝트 코드", createdBy);
        createTranslationIfNotExists("organization.project.name", languageCode, "프로젝트 이름", createdBy);
        createTranslationIfNotExists("organization.project.description", languageCode, "프로젝트 설명", createdBy);
        createTranslationIfNotExists("organization.project.codePlaceholder", languageCode, "예: WEB_APP_TEST", createdBy);
        createTranslationIfNotExists("organization.project.namePlaceholder", languageCode, "예: 웹 애플리케이션 테스트", createdBy);
        createTranslationIfNotExists("organization.project.descriptionPlaceholder", languageCode, "프로젝트에 대한 간단한 설명을 입력하세요...", createdBy);
        createTranslationIfNotExists("organization.project.codeHelperText", languageCode, "영문, 숫자, 언더스코어(_), 하이픈(-)만 사용 가능", createdBy);
        createTranslationIfNotExists("organization.project.belongsTo", languageCode, "이 프로젝트는 {organizationName} 조직에 속하게 됩니다.", createdBy);
        createTranslationIfNotExists("organization.project.noDescription", languageCode, "설명 없음", createdBy);

        // 에러 관련 한국어 번역
        createTranslationIfNotExists("organization.error.accessDenied", languageCode, "조직 접근 권한 없음", createdBy);
        createTranslationIfNotExists("organization.error.authRequired", languageCode, "인증 필요", createdBy);
        createTranslationIfNotExists("organization.error.resourceNotFound", languageCode, "리소스 없음", createdBy);
        createTranslationIfNotExists("organization.error.general", languageCode, "오류 발생", createdBy);
        createTranslationIfNotExists("organization.error.authDescription", languageCode, "로그인이 필요합니다. 다시 로그인해주세요.", createdBy);
        createTranslationIfNotExists("organization.error.notFoundDescription", languageCode, "요청한 리소스를 찾을 수 없습니다.", createdBy);
        createTranslationIfNotExists("organization.error.generalDescription", languageCode, "문제가 지속되면 시스템 관리자에게 문의하세요.", createdBy);
        createTranslationIfNotExists("organization.error.problemOccurred", languageCode, "문제가 발생했습니다", createdBy);
        createTranslationIfNotExists("organization.error.occurredAt", languageCode, "발생 시간: {date}", createdBy);

        // 사용자 프로필 관리 관련 번역
        createTranslationIfNotExists("profile.title", languageCode, "사용자 프로필", createdBy);
        createTranslationIfNotExists("profile.tabs.basicInfo", languageCode, "기본 정보", createdBy);
        createTranslationIfNotExists("profile.tabs.password", languageCode, "비밀번호", createdBy);
        createTranslationIfNotExists("profile.tabs.language", languageCode, "언어 설정", createdBy);
        createTranslationIfNotExists("profile.tabs.jira", languageCode, "JIRA 설정", createdBy);
        createTranslationIfNotExists("profile.form.name", languageCode, "이름", createdBy);
        createTranslationIfNotExists("profile.form.email", languageCode, "이메일", createdBy);
        createTranslationIfNotExists("profile.validation.allRequired", languageCode, "이름과 이메일을 모두 입력하세요.", createdBy);
        createTranslationIfNotExists("profile.validation.nameRequired", languageCode, "이름을 입력해주세요.", createdBy);
        createTranslationIfNotExists("profile.validation.emailRequired", languageCode, "이메일을 입력해주세요.", createdBy);
        createTranslationIfNotExists("profile.success.updated", languageCode, "정보가 성공적으로 변경되었습니다.", createdBy);
        createTranslationIfNotExists("profile.error.updateFailed", languageCode, "정보 변경에 실패했습니다.", createdBy);

        // 비밀번호 변경 관련 번역
        createTranslationIfNotExists("password.change.title", languageCode, "비밀번호 변경", createdBy);
        createTranslationIfNotExists("password.change.description", languageCode, "보안을 위해 정기적으로 비밀번호를 변경해주세요.", createdBy);
        createTranslationIfNotExists("password.form.current", languageCode, "현재 비밀번호", createdBy);
        createTranslationIfNotExists("password.form.new", languageCode, "새 비밀번호", createdBy);
        createTranslationIfNotExists("password.form.confirm", languageCode, "새 비밀번호 확인", createdBy);
        createTranslationIfNotExists("password.button.change", languageCode, "비밀번호 변경", createdBy);
        createTranslationIfNotExists("password.button.changing", languageCode, "변경 중...", createdBy);
        createTranslationIfNotExists("password.validation.currentRequired", languageCode, "현재 비밀번호를 입력해주세요.", createdBy);
        createTranslationIfNotExists("password.validation.newRequired", languageCode, "새 비밀번호를 입력해주세요.", createdBy);
        createTranslationIfNotExists("password.validation.confirmRequired", languageCode, "비밀번호 확인을 입력해주세요.", createdBy);
        createTranslationIfNotExists("password.validation.mismatch", languageCode, "새 비밀번호와 일치하지 않습니다.", createdBy);
        createTranslationIfNotExists("password.validation.sameAsCurrent", languageCode, "새 비밀번호는 현재 비밀번호와 달라야 합니다.", createdBy);
        createTranslationIfNotExists("password.validation.minLength", languageCode, "최소 8자 이상이어야 합니다.", createdBy);
        createTranslationIfNotExists("password.validation.maxLength", languageCode, "최대 100자까지 입력 가능합니다.", createdBy);
        createTranslationIfNotExists("password.validation.complexity", languageCode, "영문, 숫자, 특수문자 중 최소 2가지를 포함해야 합니다.", createdBy);
        createTranslationIfNotExists("password.requirements.title", languageCode, "비밀번호 요구사항:", createdBy);
        createTranslationIfNotExists("password.requirements.length", languageCode, "8-100자 길이", createdBy);
        createTranslationIfNotExists("password.requirements.letter", languageCode, "영문 포함", createdBy);
        createTranslationIfNotExists("password.requirements.digit", languageCode, "숫자 포함", createdBy);
        createTranslationIfNotExists("password.requirements.special", languageCode, "특수문자 포함", createdBy);
        createTranslationIfNotExists("password.requirements.combination", languageCode, "2가지 이상 조합", createdBy);
        createTranslationIfNotExists("password.success.changed", languageCode, "비밀번호가 성공적으로 변경되었습니다.", createdBy);
        createTranslationIfNotExists("password.error.changeFailed", languageCode, "비밀번호 변경 중 오류가 발생했습니다.", createdBy);

        // 언어 설정 관련 번역
        createTranslationIfNotExists("language.settings.title", languageCode, "언어 설정", createdBy);
        createTranslationIfNotExists("language.settings.description", languageCode, "선호하는 언어를 선택하면 전체 애플리케이션에서 해당 언어로 표시됩니다.", createdBy);
        createTranslationIfNotExists("language.interface", languageCode, "인터페이스 언어", createdBy);
        createTranslationIfNotExists("language.helperText", languageCode, "변경된 언어는 즉시 적용되며 자동으로 저장됩니다.", createdBy);
        createTranslationIfNotExists("language.current", languageCode, "현재 언어", createdBy);

        // TestCase 관련 한국어 번역
        createTranslationIfNotExists("testcase.form.title.create", languageCode, "테스트케이스 생성", createdBy);
        createTranslationIfNotExists("testcase.form.title.edit", languageCode, "테스트케이스 수정", createdBy);
        createTranslationIfNotExists("testcase.form.folder.create", languageCode, "테스트 폴더 생성", createdBy);
        createTranslationIfNotExists("testcase.form.folder.edit", languageCode, "테스트 폴더 수정", createdBy);
        createTranslationIfNotExists("testcase.info.title", languageCode, "테스트케이스 정보", createdBy);

        // Form 필드들
        createTranslationIfNotExists("testcase.form.name", languageCode, "이름", createdBy);
        createTranslationIfNotExists("testcase.form.description", languageCode, "설명", createdBy);
        createTranslationIfNotExists("testcase.form.displayOrder", languageCode, "순서", createdBy);
        createTranslationIfNotExists("testcase.form.order", languageCode, "순서", createdBy);
        createTranslationIfNotExists("testcase.form.preCondition", languageCode, "사전 조건", createdBy);
        createTranslationIfNotExists("testcase.form.expectedResults", languageCode, "기대 결과", createdBy);

        // Placeholder 텍스트들
        createTranslationIfNotExists("testcase.form.name.placeholder", languageCode, "테스트케이스 이름", createdBy);
        createTranslationIfNotExists("testcase.form.folder.name.placeholder", languageCode, "폴더 이름", createdBy);
        createTranslationIfNotExists("testcase.form.description.placeholder", languageCode, "설명을 입력하세요", createdBy);
        createTranslationIfNotExists("testcase.form.folder.description.placeholder", languageCode, "폴더 설명", createdBy);

        // 버튼들
        createTranslationIfNotExists("testcase.form.button.save", languageCode, "저장", createdBy);
        createTranslationIfNotExists("testcase.form.button.saving", languageCode, "저장 중...", createdBy);
        createTranslationIfNotExists("testcase.form.button.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("testcase.form.button.close", languageCode, "닫기", createdBy);
        createTranslationIfNotExists("testcase.version.button.create", languageCode, "버전 생성", createdBy);

        // 추가 폼 필드들
        createTranslationIfNotExists("testcase.form.folderName", languageCode, "폴더 이름", createdBy);
        createTranslationIfNotExists("testcase.form.folderDescription", languageCode, "폴더 설명", createdBy);
        createTranslationIfNotExists("testcase.form.testcaseName", languageCode, "테스트케이스 이름", createdBy);
        createTranslationIfNotExists("testcase.form.testcaseDescription", languageCode, "테스트케이스 설명", createdBy);
        createTranslationIfNotExists("testcase.form.preConditionPlaceholder", languageCode, "사전 조건", createdBy);
        createTranslationIfNotExists("testcase.form.overallExpectedResults", languageCode, "전체 예상 결과", createdBy);

        // 테스트 스텝 관련
        createTranslationIfNotExists("testcase.form.testSteps", languageCode, "테스트 스텝", createdBy);
        createTranslationIfNotExists("testcase.form.stepNumber", languageCode, "No.", createdBy);
        createTranslationIfNotExists("testcase.form.step", languageCode, "Step", createdBy);
        createTranslationIfNotExists("testcase.form.expected", languageCode, "Expected", createdBy);
        createTranslationIfNotExists("testcase.form.stepDescription", languageCode, "Step 설명", createdBy);
        createTranslationIfNotExists("testcase.form.expectedResult", languageCode, "예상 결과", createdBy);
        createTranslationIfNotExists("testcase.button.addStep", languageCode, "스텝 추가", createdBy);

        // 메시지들
        createTranslationIfNotExists("testcase.message.addSteps", languageCode, "스텝을 추가하세요.", createdBy);

        // 헬퍼 텍스트들
        createTranslationIfNotExists("testcase.helper.description", languageCode, "설명을 입력하세요.", createdBy);
        createTranslationIfNotExists("testcase.helper.preCondition", languageCode, "사전 조건을 입력하세요.", createdBy);
        createTranslationIfNotExists("testcase.validation.expectedResultsRequired", languageCode, "전체 예상 결과를 입력하세요.", createdBy);

        // InputModeToggle 관련 한국어 번역
        createTranslationIfNotExists("testcase.inputMode.title", languageCode, "입력 모드 선택", createdBy);
        createTranslationIfNotExists("testcase.inputMode.form.title", languageCode, "개별 폼", createdBy);
        createTranslationIfNotExists("testcase.inputMode.spreadsheet.title", languageCode, "스프레드시트", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.title", languageCode, "고급 스프레드시트", createdBy);

        // 모드별 설명
        createTranslationIfNotExists("testcase.inputMode.form.description", languageCode, "개별 폼 모드: 테스트케이스를 하나씩 상세하게 입력할 수 있습니다.", createdBy);
        createTranslationIfNotExists("testcase.inputMode.spreadsheet.description", languageCode, "스프레드시트 모드: 여러 테스트케이스를 한 번에 일괄 입력할 수 있습니다.", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.description", languageCode, "고급 스프레드시트 모드: 줄바꿈과 고급 편집 기능이 지원되는 스프레드시트입니다.", createdBy);

        // 툴팁 텍스트들
        createTranslationIfNotExists("testcase.inputMode.form.tooltip", languageCode, "개별 폼으로 상세 입력 (기존 방식)", createdBy);
        createTranslationIfNotExists("testcase.inputMode.spreadsheet.tooltip", languageCode, "스프레드시트로 일괄 입력 (기본 버전)", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.tooltip", languageCode, "고급 스프레드시트 (줄바꿈 지원, react-datasheet-grid)", createdBy);

        // 상태 메시지들
        createTranslationIfNotExists("testcase.inputMode.form.status", languageCode, "📝 현재 {count}개의 테스트케이스가 있습니다.", createdBy);
        createTranslationIfNotExists("testcase.inputMode.form.features", languageCode, "• 모든 필드 지원 • 스텝 제한 없음 • 상세 입력 가능", createdBy);
        createTranslationIfNotExists("testcase.inputMode.spreadsheet.status", languageCode, "📊 Excel과 유사한 편집 환경을 제공합니다. (기본 버전)", createdBy);
        createTranslationIfNotExists("testcase.inputMode.spreadsheet.features", languageCode, "• 한 화면에서 50개+ 동시 편집 • 스텝 1-10개 동적 관리 • 빠른 일괄 입력", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.status", languageCode, "🚀 고급 스프레드시트 - 줄바꿈과 다중 선택을 지원합니다.", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.features", languageCode, "• 셀 내 줄바꿈(Enter) • 다중 선택(Shift+클릭) • 드래그 크기 조정 • 고급 복사/붙여넣기", createdBy);

        // 경고 메시지
        createTranslationIfNotExists("testcase.inputMode.warning.modeSwitch", languageCode, "⚠️ 모드 전환 시 현재 편집 중인 데이터는 유지됩니다.", createdBy);

        // 스프레드시트 사용법 관련 키들
        createTranslationIfNotExists("testcase.spreadsheet.usage.title", languageCode, "사용법:", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.usage.basicUsage", languageCode, "Excel과 같이 셀을 클릭하여 직접 편집하세요. Tab/Enter로 다음 셀로 이동, Ctrl+C/V로 복사/붙여넣기가 가능합니다.", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.usage.folderFunction", languageCode, "폴더 기능: \"폴더 추가\" 버튼을 클릭하거나 이름 셀에 \"📁 폴더명\" 형태로 입력하면 폴더가 생성됩니다.", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.usage.stepManagement", languageCode, "스텝 관리: ⚙️ 버튼을 클릭하여 스텝 수를 조정할 수 있습니다 (최대 10개).", createdBy);

        // TestCaseDatasheetGrid 고급 기능 관련
        createTranslationIfNotExists("testcase.advancedGrid.features.title", languageCode, "고급 기능:", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.features.lineBreak", languageCode, "셀 내에서 Enter로 줄바꿈이 가능합니다.", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.features.navigation", languageCode, "Tab으로 다음 셀 이동, Ctrl+C/V로 복사/붙여넣기 지원.", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.multiSelect.title", languageCode, "다중 선택:", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.multiSelect.range", languageCode, "Shift+클릭으로 범위 선택, Ctrl+클릭으로 개별 선택 가능.", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.multiSelect.resize", languageCode, "드래그하여 셀 크기 조정 및 데이터 자동 채우기 지원.", createdBy);

        // 버전 관련
        createTranslationIfNotExists("testcase.version.create", languageCode, "버전 생성", createdBy);
        createTranslationIfNotExists("testcase.version.creating", languageCode, "생성 중...", createdBy);
        createTranslationIfNotExists("testcase.version.label", languageCode, "버전 라벨", createdBy);
        createTranslationIfNotExists("testcase.version.description", languageCode, "버전 설명", createdBy);
        createTranslationIfNotExists("testcase.version.defaultDescription", languageCode, "수동 버전 생성", createdBy);
        createTranslationIfNotExists("testcase.version.helper", languageCode, "선택 사항입니다. 빈 칸으로 두면 '수동 버전 생성'으로 설정됩니다.", createdBy);

        // 테스트 스텝 관련
        createTranslationIfNotExists("testcase.steps.title", languageCode, "테스트 스텝", createdBy);
        createTranslationIfNotExists("testcase.steps.add", languageCode, "스텝 추가", createdBy);
        createTranslationIfNotExists("testcase.steps.number", languageCode, "번호", createdBy);
        createTranslationIfNotExists("testcase.steps.action", languageCode, "액션", createdBy);
        createTranslationIfNotExists("testcase.steps.expected", languageCode, "예상 결과", createdBy);
        createTranslationIfNotExists("testcase.steps.delete", languageCode, "삭제", createdBy);

        // Tree 관련
        createTranslationIfNotExists("testcase.tree.add", languageCode, "추가", createdBy);
        createTranslationIfNotExists("testcase.tree.edit", languageCode, "편집", createdBy);
        createTranslationIfNotExists("testcase.tree.delete", languageCode, "삭제", createdBy);
        createTranslationIfNotExists("testcase.tree.moveUp", languageCode, "위로 이동", createdBy);
        createTranslationIfNotExists("testcase.tree.moveDown", languageCode, "아래로 이동", createdBy);
        createTranslationIfNotExists("testcase.tree.refresh", languageCode, "새로고침", createdBy);
        createTranslationIfNotExists("testcase.tree.history", languageCode, "히스토리", createdBy);

        // 삭제 확인 다이얼로그
        createTranslationIfNotExists("testcase.delete.confirm.title", languageCode, "삭제 확인", createdBy);
        createTranslationIfNotExists("testcase.delete.confirm.message", languageCode, "정말로 삭제하시겠습니까?", createdBy);
        createTranslationIfNotExists("testcase.delete.confirm.yes", languageCode, "삭제", createdBy);
        createTranslationIfNotExists("testcase.delete.confirm.no", languageCode, "취소", createdBy);

        // 상태 메시지들
        createTranslationIfNotExists("testcase.message.saveSuccess", languageCode, "테스트케이스가 성공적으로 저장되었습니다.", createdBy);
        createTranslationIfNotExists("testcase.message.saveFailed", languageCode, "테스트케이스 저장에 실패했습니다.", createdBy);
        createTranslationIfNotExists("testcase.message.deleteSuccess", languageCode, "테스트케이스가 성공적으로 삭제되었습니다.", createdBy);
        createTranslationIfNotExists("testcase.message.deleteFailed", languageCode, "테스트케이스 삭제에 실패했습니다.", createdBy);

        // 유효성 검사 메시지들
        createTranslationIfNotExists("testcase.validation.nameRequired", languageCode, "이름은 필수 입력 항목입니다.", createdBy);
        createTranslationIfNotExists("testcase.validation.nameLength", languageCode, "이름은 1자 이상 100자 이하로 입력해주세요.", createdBy);
        createTranslationIfNotExists("testcase.validation.descriptionLength", languageCode, "설명은 500자 이하로 입력해주세요.", createdBy);

        // 권한 관련 메시지들
        createTranslationIfNotExists("testcase.permission.readOnly", languageCode, "읽기 전용 권한입니다.", createdBy);
        createTranslationIfNotExists("testcase.permission.noEdit", languageCode, "편집 권한이 없습니다.", createdBy);
        createTranslationIfNotExists("testcase.permission.noDelete", languageCode, "삭제 권한이 없습니다.", createdBy);

        // JIRA 설정 관련 번역
        createTranslationIfNotExists("jira.settings.title", languageCode, "JIRA 통합 설정", createdBy);
        createTranslationIfNotExists("jira.settings.description", languageCode, "JIRA와 연동하여 테스트 결과를 자동으로 이슈에 코멘트로 추가할 수 있습니다.", createdBy);
        createTranslationIfNotExists("jira.button.configure", languageCode, "설정 수정", createdBy);
        createTranslationIfNotExists("jira.button.delete", languageCode, "설정 삭제", createdBy);
        createTranslationIfNotExists("jira.confirm.delete", languageCode, "JIRA 설정을 삭제하시겠습니까?", createdBy);
        createTranslationIfNotExists("jira.success.saved", languageCode, "JIRA 설정이 저장되었습니다.", createdBy);
        createTranslationIfNotExists("jira.success.deleted", languageCode, "JIRA 설정이 삭제되었습니다.", createdBy);
        createTranslationIfNotExists("jira.error.saveFailed", languageCode, "JIRA 설정 저장에 실패했습니다.", createdBy);
        createTranslationIfNotExists("jira.error.deleteFailed", languageCode, "JIRA 설정 삭제 실패", createdBy);
        createTranslationIfNotExists("jira.error.network", languageCode, "네트워크 연결을 확인해주세요.", createdBy);
        createTranslationIfNotExists("jira.error.authentication", languageCode, "로그인이 만료되었습니다. 다시 로그인해주세요.", createdBy);
        createTranslationIfNotExists("jira.error.encryption", languageCode, "서버 설정에 문제가 있습니다. 관리자에게 문의하세요.", createdBy);

        // 사용자 목록 관리 한국어 번역
        createTranslationIfNotExists("userList.title", languageCode, "사용자 관리", createdBy);
        createTranslationIfNotExists("userList.loading", languageCode, "사용자 목록을 불러오는 중...", createdBy);
        createTranslationIfNotExists("userList.search.placeholder", languageCode, "이름, 사용자명, 이메일 검색...", createdBy);
        createTranslationIfNotExists("userList.filter.role", languageCode, "역할", createdBy);
        createTranslationIfNotExists("userList.filter.status", languageCode, "상태", createdBy);
        createTranslationIfNotExists("userList.filter.all", languageCode, "전체", createdBy);
        createTranslationIfNotExists("userList.filter.active", languageCode, "활성", createdBy);
        createTranslationIfNotExists("userList.filter.inactive", languageCode, "비활성", createdBy);
        createTranslationIfNotExists("userList.button.refresh", languageCode, "새로고침", createdBy);
        createTranslationIfNotExists("userList.button.export", languageCode, "데이터 내보내기", createdBy);
        createTranslationIfNotExists("userList.button.reset", languageCode, "초기화", createdBy);
        createTranslationIfNotExists("userList.stats.totalUsers", languageCode, "전체 사용자", createdBy);
        createTranslationIfNotExists("userList.stats.activeUsers", languageCode, "활성 사용자", createdBy);
        createTranslationIfNotExists("userList.stats.inactiveUsers", languageCode, "비활성 사용자", createdBy);
        createTranslationIfNotExists("userList.stats.recentRegistrations", languageCode, "최근 가입", createdBy);
        createTranslationIfNotExists("userList.table.username", languageCode, "사용자명", createdBy);
        createTranslationIfNotExists("userList.table.name", languageCode, "이름", createdBy);
        createTranslationIfNotExists("userList.table.email", languageCode, "이메일", createdBy);
        createTranslationIfNotExists("userList.table.role", languageCode, "역할", createdBy);
        createTranslationIfNotExists("userList.table.status", languageCode, "상태", createdBy);
        createTranslationIfNotExists("userList.table.createdAt", languageCode, "가입일", createdBy);
        createTranslationIfNotExists("userList.table.lastLogin", languageCode, "최종 로그인", createdBy);
        createTranslationIfNotExists("userList.table.actions", languageCode, "작업", createdBy);
        createTranslationIfNotExists("userList.status.none", languageCode, "없음", createdBy);
        createTranslationIfNotExists("userList.action.view", languageCode, "상세 보기", createdBy);
        createTranslationIfNotExists("userList.action.moreActions", languageCode, "더 많은 작업", createdBy);
        createTranslationIfNotExists("userList.action.activate", languageCode, "활성화", createdBy);
        createTranslationIfNotExists("userList.action.deactivate", languageCode, "비활성화", createdBy);
        createTranslationIfNotExists("userList.empty.message", languageCode, "검색 조건에 맞는 사용자가 없습니다.", createdBy);
        createTranslationIfNotExists("userList.empty.resetButton", languageCode, "검색 조건 초기화", createdBy);
        createTranslationIfNotExists("userList.pagination.rowsPerPage", languageCode, "페이지당 행 수:", createdBy);
        createTranslationIfNotExists("userList.pagination.displayedRows", languageCode, "{from}-{to} / {count} 중", createdBy);

        // 헤더 네비게이션 한국어 번역
        createTranslationIfNotExists("header.nav.dashboard", languageCode, "대시보드", createdBy);
        createTranslationIfNotExists("header.nav.organizationManagement", languageCode, "조직 관리", createdBy);
        createTranslationIfNotExists("header.nav.userManagement", languageCode, "사용자 관리", createdBy);
        createTranslationIfNotExists("header.nav.mailSettings", languageCode, "메일 설정", createdBy);
        createTranslationIfNotExists("header.nav.translationManagement", languageCode, "번역 관리", createdBy);
        createTranslationIfNotExists("header.nav.projectSelection", languageCode, "프로젝트 선택", createdBy);

        // 헤더 사용자 메뉴 한국어 번역
        createTranslationIfNotExists("header.userMenu.profile", languageCode, "프로필", createdBy);
        createTranslationIfNotExists("header.userMenu.logout", languageCode, "로그아웃", createdBy);

        // 공통 버튼 번역
        createTranslationIfNotExists("button.save", languageCode, "저장", createdBy);
        createTranslationIfNotExists("button.close", languageCode, "닫기", createdBy);

        // 테스트케이스 트리 관련 한국어 번역
        createTranslationIfNotExists("testcase.tree.title.select", languageCode, "테스트케이스 선택", createdBy);
        createTranslationIfNotExists("testcase.tree.title.manage", languageCode, "테스트케이스", createdBy);
        createTranslationIfNotExists("testcase.tree.selectAll", languageCode, "전체 선택", createdBy);
        createTranslationIfNotExists("testcase.tree.root", languageCode, "루트", createdBy);

        // 트리 메시지
        createTranslationIfNotExists("testcase.tree.message.selectProject", languageCode, "프로젝트를 선택하세요.", createdBy);
        createTranslationIfNotExists("testcase.tree.message.loading", languageCode, "로딩 중...", createdBy);
        createTranslationIfNotExists("testcase.tree.message.noTestcases", languageCode, "테스트케이스가 없습니다.", createdBy);

        // 트리 액션 (메뉴)
        createTranslationIfNotExists("testcase.tree.action.addFolder", languageCode, "폴더 추가", createdBy);
        createTranslationIfNotExists("testcase.tree.action.addTestcase", languageCode, "테스트케이스 추가", createdBy);
        createTranslationIfNotExists("testcase.tree.action.addSubFolder", languageCode, "하위 폴더 추가", createdBy);
        createTranslationIfNotExists("testcase.tree.action.addSubTestcase", languageCode, "하위 테스트케이스 추가", createdBy);
        createTranslationIfNotExists("testcase.tree.action.rename", languageCode, "이름 변경", createdBy);
        createTranslationIfNotExists("testcase.tree.action.delete", languageCode, "삭제", createdBy);
        createTranslationIfNotExists("testcase.tree.action.versionHistory", languageCode, "버전 히스토리", createdBy);

        // 트리 다이얼로그
        createTranslationIfNotExists("testcase.tree.dialog.deleteConfirm.title", languageCode, "삭제 확인", createdBy);
        createTranslationIfNotExists("testcase.tree.dialog.deleteConfirm.message", languageCode, "정말로 삭제하시겠습니까? (하위 항목 포함)", createdBy);
        createTranslationIfNotExists("testcase.tree.dialog.batchDelete.title", languageCode, "선택 삭제", createdBy);
        createTranslationIfNotExists("testcase.tree.dialog.batchDelete.message", languageCode, "{count}개 항목(하위 포함)을 삭제하시겠습니까?", createdBy);
        createTranslationIfNotExists("testcase.tree.dialog.error.title", languageCode, "오류", createdBy);

        // 트리 버튼
        createTranslationIfNotExists("testcase.tree.button.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("testcase.tree.button.delete", languageCode, "삭제", createdBy);
        createTranslationIfNotExists("testcase.tree.button.close", languageCode, "닫기", createdBy);
        createTranslationIfNotExists("testcase.tree.button.refresh", languageCode, "리프레시", createdBy);
        createTranslationIfNotExists("testcase.tree.button.editOrder", languageCode, "순서 편집", createdBy);
        createTranslationIfNotExists("testcase.tree.button.saveOrder", languageCode, "순서 저장", createdBy);
        createTranslationIfNotExists("testcase.tree.button.batchDelete", languageCode, "선택 삭제", createdBy);

        // 트리 validation/error 메시지
        createTranslationIfNotExists("testcase.tree.validation.nameRequired", languageCode, "이름을 입력하세요.", createdBy);
        createTranslationIfNotExists("testcase.tree.error.renameFailed", languageCode, "이름 변경에 실패했습니다: ", createdBy);
        createTranslationIfNotExists("testcase.tree.error.deleteFailed", languageCode, "삭제 중 오류가 발생했습니다.", createdBy);

        // 테스트 플랜 관련 번역
        createTranslationIfNotExists("testPlan.form.title.create", languageCode, "새 테스트 플랜 생성", createdBy);
        createTranslationIfNotExists("testPlan.form.title.edit", languageCode, "테스트 플랜 수정", createdBy);
        createTranslationIfNotExists("testPlan.form.planName", languageCode, "플랜 이름", createdBy);
        createTranslationIfNotExists("testPlan.form.description", languageCode, "설명", createdBy);
        createTranslationIfNotExists("testPlan.form.testcaseSelection", languageCode, "테스트케이스 선택", createdBy);
        createTranslationIfNotExists("testPlan.form.selectedCount", languageCode, "{count}개 선택됨", createdBy);
        createTranslationIfNotExists("testPlan.form.projectSelectFirst", languageCode, "프로젝트를 먼저 선택해주세요", createdBy);
        createTranslationIfNotExists("testPlan.form.button.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("testPlan.form.button.save", languageCode, "저장", createdBy);
        createTranslationIfNotExists("testPlan.form.button.processing", languageCode, "처리 중...", createdBy);

        // 테스트 플랜 폼 검증 메시지
        createTranslationIfNotExists("testPlan.validation.nameRequired", languageCode, "테스트 플랜 이름은 필수 입력 항목입니다", createdBy);
        createTranslationIfNotExists("testPlan.validation.testcaseRequired", languageCode, "최소 한 개 이상의 테스트케이스를 선택해야 합니다", createdBy);
        createTranslationIfNotExists("testPlan.error.saveFailed", languageCode, "저장 처리 중 오류가 발생했습니다: ", createdBy);

        // 테스트 플랜 목록
        createTranslationIfNotExists("testPlan.list.add", languageCode, "테스트 플랜 추가", createdBy);
        createTranslationIfNotExists("testPlan.list.table.id", languageCode, "ID", createdBy);
        createTranslationIfNotExists("testPlan.list.table.name", languageCode, "이름", createdBy);
        createTranslationIfNotExists("testPlan.list.table.description", languageCode, "설명", createdBy);
        createTranslationIfNotExists("testPlan.list.table.testcaseCount", languageCode, "테스트케이스 수", createdBy);
        createTranslationIfNotExists("testPlan.list.table.createdAt", languageCode, "생성일", createdBy);
        createTranslationIfNotExists("testPlan.list.table.execute", languageCode, "실행", createdBy);
        createTranslationIfNotExists("testPlan.list.table.edit", languageCode, "수정", createdBy);
        createTranslationIfNotExists("testPlan.list.table.delete", languageCode, "삭제", createdBy);
        createTranslationIfNotExists("testPlan.list.empty.message", languageCode, "등록된 테스트 플랜이 없습니다.", createdBy);

        // 테스트 실행 다이얼로그
        createTranslationIfNotExists("testPlan.execution.dialog.title", languageCode, "테스트 실행 - {planName}", createdBy);
        createTranslationIfNotExists("testPlan.execution.button.newExecution", languageCode, "새 실행 생성", createdBy);
        createTranslationIfNotExists("testPlan.execution.empty.message", languageCode, "이 테스트 플랜의 실행 이력이 없습니다.", createdBy);
        createTranslationIfNotExists("testPlan.execution.progress", languageCode, "진행률:", createdBy);
        createTranslationIfNotExists("testPlan.execution.action.edit", languageCode, "편집", createdBy);
        createTranslationIfNotExists("testPlan.execution.action.view", languageCode, "전체화면 보기", createdBy);
        createTranslationIfNotExists("testPlan.execution.dialog.close", languageCode, "닫기", createdBy);

        // 테스트 플랜 삭제 다이얼로그
        createTranslationIfNotExists("testPlan.delete.dialog.title", languageCode, "테스트 플랜 삭제", createdBy);
        createTranslationIfNotExists("testPlan.delete.dialog.message", languageCode, "정말로 이 테스트 플랜을 삭제하시겠습니까? 삭제 시 복구할 수 없습니다.", createdBy);
        createTranslationIfNotExists("testPlan.delete.button.cancel", languageCode, "취소", createdBy);
        createTranslationIfNotExists("testPlan.delete.button.delete", languageCode, "삭제", createdBy);

        // 테스트 플랜 선택기
        createTranslationIfNotExists("testPlan.selector.label", languageCode, "테스트 플랜 선택", createdBy);
        createTranslationIfNotExists("testPlan.selector.all", languageCode, "전체", createdBy);
        createTranslationIfNotExists("testPlan.selector.caseCount", languageCode, "{count}개 케이스", createdBy);
        createTranslationIfNotExists("testPlan.selector.selected", languageCode, "선택된 플랜: {planName}", createdBy);
        createTranslationIfNotExists("testPlan.selector.testcaseCount", languageCode, "({count}개 테스트케이스)", createdBy);

        // 실행 상태
        createTranslationIfNotExists("testPlan.status.notStarted", languageCode, "Not Started", createdBy);
        createTranslationIfNotExists("testPlan.status.inProgress", languageCode, "In Progress", createdBy);
        createTranslationIfNotExists("testPlan.status.completed", languageCode, "Completed", createdBy);
    }

    private void initializeEnglishTranslations() {
        String languageCode = "en";
        String createdBy = "system";

        // 로그인 관련 번역
        createTranslationIfNotExists("login.title", languageCode, "Login", createdBy);
        createTranslationIfNotExists("login.username", languageCode, "Username", createdBy);
        createTranslationIfNotExists("login.password", languageCode, "Password", createdBy);
        createTranslationIfNotExists("login.button", languageCode, "Login", createdBy);
        createTranslationIfNotExists("login.remember", languageCode, "Remember me", createdBy);
        createTranslationIfNotExists("login.forgot_password", languageCode, "Forgot your password?", createdBy);
        createTranslationIfNotExists("login.error.failed", languageCode, "Login failed.", createdBy);
        createTranslationIfNotExists("login.error.general", languageCode, "An error occurred during login.", createdBy);
        createTranslationIfNotExists("login.back", languageCode, "Back to login", createdBy);

        // 회원가입 관련 번역
        createTranslationIfNotExists("register.title", languageCode, "Sign Up", createdBy);
        createTranslationIfNotExists("register.confirm_password", languageCode, "Confirm Password", createdBy);
        createTranslationIfNotExists("register.name", languageCode, "Name", createdBy);
        createTranslationIfNotExists("register.email", languageCode, "Email", createdBy);
        createTranslationIfNotExists("register.button", languageCode, "Sign Up", createdBy);
        createTranslationIfNotExists("register.switch", languageCode, "Sign Up", createdBy);
        createTranslationIfNotExists("register.success", languageCode, "Registration completed successfully. Please log in.", createdBy);
        createTranslationIfNotExists("register.error.general", languageCode, "An error occurred during registration.", createdBy);

        // 검증 메시지 번역
        createTranslationIfNotExists("validation.required.all", languageCode, "Please fill in all fields.", createdBy);
        createTranslationIfNotExists("validation.password.mismatch", languageCode, "Passwords do not match.", createdBy);

        // 버튼 번역
        createTranslationIfNotExists("button.save", languageCode, "Save", createdBy);
        createTranslationIfNotExists("button.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("button.delete", languageCode, "Delete", createdBy);
        createTranslationIfNotExists("button.edit", languageCode, "Edit", createdBy);
        createTranslationIfNotExists("button.add", languageCode, "Add", createdBy);
        createTranslationIfNotExists("button.close", languageCode, "Close", createdBy);
        createTranslationIfNotExists("button.confirm", languageCode, "Confirm", createdBy);

        // 메시지 번역
        createTranslationIfNotExists("message.success", languageCode, "Successfully processed.", createdBy);
        createTranslationIfNotExists("message.error", languageCode, "An error occurred.", createdBy);
        createTranslationIfNotExists("message.loading", languageCode, "Loading...", createdBy);
        createTranslationIfNotExists("message.confirm_delete", languageCode, "Are you sure you want to delete?", createdBy);

        // 검증 메시지 번역
        createTranslationIfNotExists("validation.required", languageCode, "This field is required.", createdBy);
        createTranslationIfNotExists("validation.email", languageCode, "Please enter a valid email format.", createdBy);
        createTranslationIfNotExists("validation.min_length", languageCode, "Please enter at least {0} characters.", createdBy);
        createTranslationIfNotExists("validation.max_length", languageCode, "Maximum {0} characters allowed.", createdBy);

        // 언어 선택 번역
        createTranslationIfNotExists("language.select", languageCode, "Select Language", createdBy);
        createTranslationIfNotExists("language.korean", languageCode, "한국어", createdBy);
        createTranslationIfNotExists("language.english", languageCode, "English", createdBy);
        createTranslationIfNotExists("language.japanese", languageCode, "日本語", createdBy);
        createTranslationIfNotExists("language.chinese", languageCode, "中文", createdBy);

        // 프로젝트 관리 페이지 번역
        createTranslationIfNotExists("project.title", languageCode, "Project Management", createdBy);
        createTranslationIfNotExists("project.buttons.createNew", languageCode, "Create New Project", createdBy);
        createTranslationIfNotExists("project.tabs.byOrganization", languageCode, "By Organization", createdBy);
        createTranslationIfNotExists("project.tabs.independent", languageCode, "Independent Projects", createdBy);
        createTranslationIfNotExists("project.tabs.all", languageCode, "All Projects", createdBy);
        createTranslationIfNotExists("project.types.independent", languageCode, "Independent Project", createdBy);
        createTranslationIfNotExists("project.buttons.open", languageCode, "Open Project", createdBy);
        createTranslationIfNotExists("project.buttons.edit", languageCode, "Edit", createdBy);
        createTranslationIfNotExists("project.buttons.transfer", languageCode, "Transfer", createdBy);
        createTranslationIfNotExists("project.buttons.delete", languageCode, "Delete", createdBy);
        createTranslationIfNotExists("project.buttons.forceDelete", languageCode, "Force Delete", createdBy);
        createTranslationIfNotExists("project.tooltips.testCaseCount", languageCode, "Test Cases", createdBy);
        createTranslationIfNotExists("project.tooltips.memberCount", languageCode, "Members", createdBy);
        createTranslationIfNotExists("project.tooltips.junitStatus", languageCode, "Automation Status", createdBy);
        createTranslationIfNotExists("project.stats.projectCount", languageCode, "{count} Projects", createdBy);
        createTranslationIfNotExists("project.messages.noOrganizationProjects", languageCode, "No organization projects", createdBy);
        createTranslationIfNotExists("project.messages.addOrganizationProjectsHint", languageCode, "Add projects to organizations or create new organizational projects.", createdBy);
        createTranslationIfNotExists("project.messages.noProjectsInOrganization", languageCode, "This organization has no projects yet.", createdBy);
        createTranslationIfNotExists("project.messages.noIndependentProjects", languageCode, "No independent projects", createdBy);
        createTranslationIfNotExists("project.messages.addIndependentProjectsHint", languageCode, "Create an independent project.", createdBy);
        createTranslationIfNotExists("project.messages.noAllProjects", languageCode, "No projects registered", createdBy);
        createTranslationIfNotExists("project.messages.addFirstProjectHint", languageCode, "Create your first project.", createdBy);
        createTranslationIfNotExists("project.form.nameRequired", languageCode, "Please enter a project name.", createdBy);
        createTranslationIfNotExists("project.dialog.create.title", languageCode, "Create New Project", createdBy);
        createTranslationIfNotExists("project.dialog.edit.title", languageCode, "Edit Project", createdBy);
        createTranslationIfNotExists("project.dialog.transfer.title", languageCode, "Transfer Project", createdBy);
        createTranslationIfNotExists("project.dialog.delete.title", languageCode, "Confirm Project Deletion", createdBy);

        // 추가 프로젝트 관련 영어 번역
        createTranslationIfNotExists("project.form.codeRequired", languageCode, "Please enter a project code.", createdBy);
        createTranslationIfNotExists("project.tooltips.automationTestCount", languageCode, "Automation Test Results", createdBy);
        createTranslationIfNotExists("project.buttons.openProject", languageCode, "Open Project", createdBy);
        createTranslationIfNotExists("project.buttons.addProject", languageCode, "Add Project", createdBy);
        createTranslationIfNotExists("project.buttons.createIndependent", languageCode, "Create Independent Project", createdBy);
        createTranslationIfNotExists("project.buttons.createFirstIndependent", languageCode, "Create First Independent Project", createdBy);
        createTranslationIfNotExists("project.buttons.createProject", languageCode, "Create Project", createdBy);
        createTranslationIfNotExists("project.stats.totalProjectCount", languageCode, "Total {count} Projects", createdBy);
        createTranslationIfNotExists("project.messages.createIndependentProjectHint", languageCode, "Create personal projects that don't belong to any organization.", createdBy);
        createTranslationIfNotExists("project.messages.noParticipatingProjects", languageCode, "No participating projects", createdBy);
        createTranslationIfNotExists("project.messages.needInvitation", languageCode, "Users without projects need to be invited to projects to use the system.", createdBy);
        createTranslationIfNotExists("project.messages.requestInvitation", languageCode, "Please request project invitation from the system administrator.", createdBy);
        createTranslationIfNotExists("project.menu.transfer", languageCode, "Transfer Organization", createdBy);
        createTranslationIfNotExists("project.menu.forceDelete", languageCode, "Force Delete", createdBy);
        createTranslationIfNotExists("project.dialog.editTitle", languageCode, "Edit Project", createdBy);
        createTranslationIfNotExists("project.dialog.createTitle", languageCode, "Create New Project", createdBy);
        createTranslationIfNotExists("project.form.name", languageCode, "Project Name", createdBy);
        createTranslationIfNotExists("project.form.code", languageCode, "Project Code", createdBy);
        createTranslationIfNotExists("project.form.codePlaceholder", languageCode, "e.g., PROJ001", createdBy);
        createTranslationIfNotExists("project.form.organization", languageCode, "Organization", createdBy);
        createTranslationIfNotExists("project.form.noOrganization", languageCode, "Independent Project (No Organization)", createdBy);
        createTranslationIfNotExists("project.form.description", languageCode, "Description", createdBy);
        createTranslationIfNotExists("project.form.descriptionPlaceholder", languageCode, "Enter project description...", createdBy);
        createTranslationIfNotExists("project.dialog.transferTitle", languageCode, "Transfer Project Organization", createdBy);
        createTranslationIfNotExists("project.form.targetOrganization", languageCode, "Target Organization", createdBy);
        createTranslationIfNotExists("project.form.convertToIndependent", languageCode, "Convert to Independent Project", createdBy);
        createTranslationIfNotExists("project.dialog.forceDeleteTitle", languageCode, "Confirm Force Delete Project", createdBy);
        createTranslationIfNotExists("project.dialog.deleteTitle", languageCode, "Confirm Project Deletion", createdBy);
        createTranslationIfNotExists("project.dialog.forceDeleteWarningTitle", languageCode, "⚠️ Force Delete Warning", createdBy);
        createTranslationIfNotExists("project.dialog.forceDeleteWarningMessage", languageCode, "All connected test plans, test cases, and execution history will be deleted together! This action cannot be undone.", createdBy);
        createTranslationIfNotExists("project.dialog.deleteWarningMessage", languageCode, "This action cannot be undone. All test cases and data belonging to the project will also be deleted.", createdBy);

        // 대시보드 영어 번역
        createTranslationIfNotExists("dashboard.title", languageCode, "Dashboard", createdBy);
        createTranslationIfNotExists("dashboard.lastUpdate", languageCode, "Last Updated: {date}", createdBy);
        createTranslationIfNotExists("dashboard.refresh", languageCode, "Refresh", createdBy);
        createTranslationIfNotExists("dashboard.refreshTooltip", languageCode, "Refresh Dashboard", createdBy);
        createTranslationIfNotExists("dashboard.project.totalTestCases", languageCode, "Total Test Cases: {count}", createdBy);
        createTranslationIfNotExists("dashboard.project.memberCount", languageCode, "Project Members: {count}", createdBy);
        createTranslationIfNotExists("dashboard.charts.recentTestResults", languageCode, "Recent Test Case Results", createdBy);
        createTranslationIfNotExists("dashboard.charts.testResultsTrend", languageCode, "Test Case Results Trend", createdBy);
        createTranslationIfNotExists("dashboard.charts.openTestRunResults", languageCode, "Test Case Results by Open Test Run", createdBy);
        createTranslationIfNotExists("dashboard.charts.assigneeResults", languageCode, "Test Case Results by Open Test Run Assignee", createdBy);
        createTranslationIfNotExists("dashboard.charts.testPlanResults", languageCode, "Recent Test Results by Test Plan", createdBy);
        createTranslationIfNotExists("dashboard.charts.notRunTrend", languageCode, "Not Run Test Cases Trend in Open Test Runs", createdBy);
        createTranslationIfNotExists("dashboard.status.completed", languageCode, "Completed", createdBy);
        createTranslationIfNotExists("dashboard.status.failed", languageCode, "Failed {rate}%", createdBy);
        createTranslationIfNotExists("dashboard.status.completedCount", languageCode, "{completed} / {total} Completed", createdBy);
        createTranslationIfNotExists("dashboard.messages.loading", languageCode, "📊 Loading dashboard data...", createdBy);
        createTranslationIfNotExists("dashboard.messages.noData", languageCode, "📋 No dashboard data available. Please check if there are test results in the project.", createdBy);
        createTranslationIfNotExists("dashboard.messages.dataLoading", languageCode, "Loading data...", createdBy);
        createTranslationIfNotExists("dashboard.messages.noDataToShow", languageCode, "No data to display.", createdBy);
        createTranslationIfNotExists("dashboard.messages.noOpenTestRuns", languageCode, "No open test runs in progress.", createdBy);
        createTranslationIfNotExists("dashboard.messages.selectProject", languageCode, "Please select a project.", createdBy);
        createTranslationIfNotExists("dashboard.filters.last15Days", languageCode, "Last 15 Days", createdBy);
        createTranslationIfNotExists("dashboard.actions.retry", languageCode, "Retry", createdBy);
        createTranslationIfNotExists("dashboard.actions.loginPage", languageCode, "Go to Login", createdBy);
        createTranslationIfNotExists("dashboard.actions.details", languageCode, "Details", createdBy);
        createTranslationIfNotExists("dashboard.errors.userAction", languageCode, "💡 Solution: {action}", createdBy);
        createTranslationIfNotExists("dashboard.results.pass", languageCode, "Pass", createdBy);
        createTranslationIfNotExists("dashboard.results.fail", languageCode, "Fail", createdBy);
        createTranslationIfNotExists("dashboard.results.blocked", languageCode, "Blocked", createdBy);
        createTranslationIfNotExists("dashboard.results.skipped", languageCode, "Skipped", createdBy);
        createTranslationIfNotExists("dashboard.results.notrun", languageCode, "Not Run", createdBy);

        // 대시보드 차트 상태 라벨들 영어 번역
        createTranslationIfNotExists("dashboard.status.pass", languageCode, "Pass", createdBy);
        createTranslationIfNotExists("dashboard.status.fail", languageCode, "Fail", createdBy);
        createTranslationIfNotExists("dashboard.status.blocked", languageCode, "Blocked", createdBy);
        createTranslationIfNotExists("dashboard.status.notrun", languageCode, "Not Run", createdBy);

        // Organization Dashboard 영어 번역
        createTranslationIfNotExists("organization.dashboard.title", languageCode, "Dashboard", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalOrganizations", languageCode, "Total Organizations", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalOrganizations.subtitle", languageCode, "Active Organizations", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalProjects", languageCode, "Total Projects", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalProjects.subtitle", languageCode, "All Projects", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalTestCases", languageCode, "Total Test Cases", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalTestCases.subtitle", languageCode, "Created Test Cases", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalUsers", languageCode, "Total Users", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalUsers.subtitle", languageCode, "Registered Users", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalMembers", languageCode, "Total Project Participation", createdBy);
        createTranslationIfNotExists("organization.dashboard.metrics.totalMembers.subtitle", languageCode, "Project Memberships", createdBy);

        // 탭 관련 영어 번역
        createTranslationIfNotExists("organization.dashboard.tabs.organizationStatus", languageCode, "Organization Status", createdBy);
        createTranslationIfNotExists("organization.dashboard.tabs.testStatistics", languageCode, "Test Statistics", createdBy);

        // 차트 제목들 영어 번역
        createTranslationIfNotExists("organization.dashboard.charts.projectDistribution", languageCode, "Project Distribution by Organization", createdBy);
        createTranslationIfNotExists("organization.dashboard.charts.projectDistribution.projects", languageCode, "Projects", createdBy);
        createTranslationIfNotExists("organization.dashboard.charts.projectDistribution.members", languageCode, "Members", createdBy);
        createTranslationIfNotExists("organization.dashboard.charts.organizationList", languageCode, "Organization List", createdBy);
        createTranslationIfNotExists("organization.dashboard.charts.testResultDistribution", languageCode, "Test Result Distribution", createdBy);
        createTranslationIfNotExists("organization.dashboard.charts.testResultDetails", languageCode, "Test Result Details", createdBy);

        // 조직 목록 항목들 영어 번역
        createTranslationIfNotExists("organization.dashboard.list.projectCount", languageCode, "Projects: {count}", createdBy);
        createTranslationIfNotExists("organization.dashboard.list.memberCount", languageCode, "Members: {count}", createdBy);

        // 테스트 결과 상태들 영어 번역
        createTranslationIfNotExists("organization.dashboard.testResults.success", languageCode, "Success", createdBy);
        createTranslationIfNotExists("organization.dashboard.testResults.failure", languageCode, "Failure", createdBy);
        createTranslationIfNotExists("organization.dashboard.testResults.blocked", languageCode, "Blocked", createdBy);
        createTranslationIfNotExists("organization.dashboard.testResults.notRun", languageCode, "Not Run", createdBy);

        // 헤더 네비게이션 영어 번역
        createTranslationIfNotExists("header.nav.dashboard", languageCode, "Dashboard", createdBy);
        createTranslationIfNotExists("header.nav.organizationManagement", languageCode, "Organization Management", createdBy);
        createTranslationIfNotExists("header.nav.userManagement", languageCode, "User Management", createdBy);
        createTranslationIfNotExists("header.nav.mailSettings", languageCode, "Mail Settings", createdBy);
        createTranslationIfNotExists("header.nav.translationManagement", languageCode, "Translation Management", createdBy);
        createTranslationIfNotExists("header.nav.projectSelection", languageCode, "Project Selection", createdBy);

        // 사용자 메뉴 영어 번역
        createTranslationIfNotExists("header.userMenu.profile", languageCode, "Profile", createdBy);
        createTranslationIfNotExists("header.userMenu.logout", languageCode, "Logout", createdBy);

        // 공통 메시지 영어 번역
        createTranslationIfNotExists("common.loading", languageCode, "Loading...", createdBy);
        createTranslationIfNotExists("common.unauthorized.title", languageCode, "Access Denied", createdBy);
        createTranslationIfNotExists("common.unauthorized.description", languageCode, "You don't have permission to access this page. Please contact the administrator.", createdBy);
        createTranslationIfNotExists("common.unauthorized.loginButton", languageCode, "Login", createdBy);

        // 공통 번역
        createTranslationIfNotExists("common.changeLanguage", languageCode, "Change Language", createdBy);
        createTranslationIfNotExists("common.buttons.delete", languageCode, "Delete", createdBy);
        createTranslationIfNotExists("common.buttons.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("common.buttons.save", languageCode, "Save", createdBy);
        createTranslationIfNotExists("common.buttons.create", languageCode, "Create", createdBy);
        createTranslationIfNotExists("common.buttons.edit", languageCode, "Edit", createdBy);
        createTranslationIfNotExists("common.buttons.update", languageCode, "Update", createdBy);

        // 조직 관리 관련 영어 번역
        createTranslationIfNotExists("organization.management.title", languageCode, "Organization Management", createdBy);
        createTranslationIfNotExists("organization.buttons.createNew", languageCode, "Create New Organization", createdBy);
        createTranslationIfNotExists("organization.buttons.view", languageCode, "View Organization", createdBy);
        createTranslationIfNotExists("organization.buttons.edit", languageCode, "Edit Organization", createdBy);
        createTranslationIfNotExists("organization.buttons.invite", languageCode, "Invite Member", createdBy);
        createTranslationIfNotExists("organization.buttons.createProject", languageCode, "Create Project", createdBy);
        createTranslationIfNotExists("organization.buttons.firstOrganization", languageCode, "Create First Organization", createdBy);
        createTranslationIfNotExists("organization.buttons.firstProject", languageCode, "Create First Project", createdBy);
        createTranslationIfNotExists("organization.buttons.back", languageCode, "Back to Organizations", createdBy);

        // 조직 상태 및 메시지들 영어 번역
        createTranslationIfNotExists("organization.messages.noOrganizations", languageCode, "No organizations", createdBy);
        createTranslationIfNotExists("organization.messages.noProjects", languageCode, "This organization has no projects yet.", createdBy);
        createTranslationIfNotExists("organization.messages.createHint", languageCode, "Create a new organization to manage projects and teams.", createdBy);
        createTranslationIfNotExists("organization.messages.joinHint", languageCode, "Contact the system administrator to join an organization.", createdBy);
        createTranslationIfNotExists("organization.messages.accessDenied", languageCode, "The current user does not belong to any organization. Contact the system administrator to be added as an organization member or create a new organization.", createdBy);
        createTranslationIfNotExists("organization.messages.canCreateNew", languageCode, "Cannot access existing organizations, but you can create a new organization.", createdBy);
        createTranslationIfNotExists("organization.messages.noAccessContact", languageCode, "No accessible organizations available. Contact the system administrator.", createdBy);
        createTranslationIfNotExists("organization.messages.notFound", languageCode, "Organization not found.", createdBy);

        // 조직 폼 라벨들 영어 번역
        createTranslationIfNotExists("organization.form.name", languageCode, "Organization Name", createdBy);
        createTranslationIfNotExists("organization.form.description", languageCode, "Description", createdBy);
        createTranslationIfNotExists("organization.form.descriptionPlaceholder", languageCode, "Enter organization description...", createdBy);
        createTranslationIfNotExists("organization.form.nameRequired", languageCode, "Please enter an organization name.", createdBy);
        createTranslationIfNotExists("organization.form.codeRequired", languageCode, "Please enter a project code.", createdBy);
        createTranslationIfNotExists("organization.form.projectNameRequired", languageCode, "Please enter a project name.", createdBy);
        createTranslationIfNotExists("organization.form.usernameRequired", languageCode, "Please enter a username.", createdBy);

        // 다이얼로그 제목들 영어 번역
        createTranslationIfNotExists("organization.dialog.create.title", languageCode, "Create New Organization", createdBy);
        createTranslationIfNotExists("organization.dialog.edit.title", languageCode, "Edit Organization", createdBy);
        createTranslationIfNotExists("organization.dialog.delete.title", languageCode, "Confirm Organization Deletion", createdBy);
        createTranslationIfNotExists("organization.dialog.invite.title", languageCode, "Invite Member", createdBy);
        createTranslationIfNotExists("organization.dialog.project.title", languageCode, "Create Organization Project", createdBy);
        createTranslationIfNotExists("organization.dialog.editInfo.title", languageCode, "Edit Organization Information", createdBy);

        // 삭제 확인 메시지들 영어 번역
        createTranslationIfNotExists("organization.dialog.delete.message", languageCode, "Are you sure you want to delete this organization?", createdBy);
        createTranslationIfNotExists("organization.dialog.delete.warning", languageCode, "This action cannot be undone. All projects and data belonging to the organization will also be deleted.", createdBy);

        // 상세 페이지 관련 영어 번역
        createTranslationIfNotExists("organization.detail.members", languageCode, "Members", createdBy);
        createTranslationIfNotExists("organization.detail.projects", languageCode, "Projects", createdBy);
        createTranslationIfNotExists("organization.detail.organizationMembers", languageCode, "Organization Members", createdBy);
        createTranslationIfNotExists("organization.detail.organizationProjects", languageCode, "Organization Projects", createdBy);

        // 테이블 헤더들 영어 번역
        createTranslationIfNotExists("organization.table.user", languageCode, "User", createdBy);
        createTranslationIfNotExists("organization.table.role", languageCode, "Role", createdBy);
        createTranslationIfNotExists("organization.table.joinDate", languageCode, "Join Date", createdBy);
        createTranslationIfNotExists("organization.table.actions", languageCode, "Actions", createdBy);

        // 멤버 관리 관련 영어 번역
        createTranslationIfNotExists("organization.member.remove", languageCode, "Remove Member", createdBy);
        createTranslationIfNotExists("organization.member.username", languageCode, "Username", createdBy);
        createTranslationIfNotExists("organization.member.role", languageCode, "Role", createdBy);

        // 프로젝트 관리 관련 영어 번역
        createTranslationIfNotExists("organization.project.code", languageCode, "Project Code", createdBy);
        createTranslationIfNotExists("organization.project.name", languageCode, "Project Name", createdBy);
        createTranslationIfNotExists("organization.project.description", languageCode, "Project Description", createdBy);
        createTranslationIfNotExists("organization.project.codePlaceholder", languageCode, "e.g., WEB_APP_TEST", createdBy);
        createTranslationIfNotExists("organization.project.namePlaceholder", languageCode, "e.g., Web Application Test", createdBy);
        createTranslationIfNotExists("organization.project.descriptionPlaceholder", languageCode, "Enter a brief description of the project...", createdBy);
        createTranslationIfNotExists("organization.project.codeHelperText", languageCode, "Only letters, numbers, underscores (_), and hyphens (-) are allowed", createdBy);
        createTranslationIfNotExists("organization.project.belongsTo", languageCode, "This project will belong to {organizationName} organization.", createdBy);
        createTranslationIfNotExists("organization.project.noDescription", languageCode, "No description", createdBy);

        // 에러 관련 영어 번역
        createTranslationIfNotExists("organization.error.accessDenied", languageCode, "Organization Access Denied", createdBy);
        createTranslationIfNotExists("organization.error.authRequired", languageCode, "Authentication Required", createdBy);
        createTranslationIfNotExists("organization.error.resourceNotFound", languageCode, "Resource Not Found", createdBy);
        createTranslationIfNotExists("organization.error.general", languageCode, "Error Occurred", createdBy);
        createTranslationIfNotExists("organization.error.authDescription", languageCode, "Login is required. Please log in again.", createdBy);
        createTranslationIfNotExists("organization.error.notFoundDescription", languageCode, "The requested resource could not be found.", createdBy);
        createTranslationIfNotExists("organization.error.generalDescription", languageCode, "If the problem persists, please contact the system administrator.", createdBy);
        createTranslationIfNotExists("organization.error.problemOccurred", languageCode, "A problem occurred", createdBy);
        createTranslationIfNotExists("organization.error.occurredAt", languageCode, "Occurred at: {date}", createdBy);

        // 사용자 프로필 관리 관련 영어 번역
        createTranslationIfNotExists("profile.title", languageCode, "User Profile", createdBy);
        createTranslationIfNotExists("profile.tabs.basicInfo", languageCode, "Basic Info", createdBy);
        createTranslationIfNotExists("profile.tabs.password", languageCode, "Password", createdBy);
        createTranslationIfNotExists("profile.tabs.language", languageCode, "Language Settings", createdBy);
        createTranslationIfNotExists("profile.tabs.jira", languageCode, "JIRA Settings", createdBy);

        // 기본 정보 관련 영어 번역
        createTranslationIfNotExists("profile.form.name", languageCode, "Name", createdBy);
        createTranslationIfNotExists("profile.form.email", languageCode, "Email", createdBy);
        createTranslationIfNotExists("profile.validation.nameRequired", languageCode, "Please enter your name.", createdBy);
        createTranslationIfNotExists("profile.validation.emailRequired", languageCode, "Please enter your email.", createdBy);
        createTranslationIfNotExists("profile.validation.allRequired", languageCode, "Please enter both name and email.", createdBy);
        createTranslationIfNotExists("profile.success.updated", languageCode, "Profile updated successfully.", createdBy);
        createTranslationIfNotExists("profile.error.updateFailed", languageCode, "Failed to update profile.", createdBy);

        // 비밀번호 변경 관련 영어 번역
        createTranslationIfNotExists("password.change.title", languageCode, "Change Password", createdBy);
        createTranslationIfNotExists("password.change.description", languageCode, "Change your password regularly for security.", createdBy);
        createTranslationIfNotExists("password.form.current", languageCode, "Current Password", createdBy);
        createTranslationIfNotExists("password.form.new", languageCode, "New Password", createdBy);
        createTranslationIfNotExists("password.form.confirm", languageCode, "Confirm New Password", createdBy);
        createTranslationIfNotExists("password.button.change", languageCode, "Change Password", createdBy);
        createTranslationIfNotExists("password.button.changing", languageCode, "Changing...", createdBy);

        // 비밀번호 검증 관련 영어 번역
        createTranslationIfNotExists("password.validation.currentRequired", languageCode, "Please enter your current password", createdBy);
        createTranslationIfNotExists("password.validation.newRequired", languageCode, "Please enter a new password", createdBy);
        createTranslationIfNotExists("password.validation.confirmRequired", languageCode, "Please confirm your password", createdBy);
        createTranslationIfNotExists("password.validation.mismatch", languageCode, "Passwords do not match", createdBy);
        createTranslationIfNotExists("password.validation.sameAsCurrent", languageCode, "New password must be different from current password", createdBy);
        createTranslationIfNotExists("password.validation.minLength", languageCode, "Must be at least 8 characters", createdBy);
        createTranslationIfNotExists("password.validation.maxLength", languageCode, "Maximum 100 characters allowed", createdBy);
        createTranslationIfNotExists("password.validation.complexity", languageCode, "Must contain at least 2 of: letters, numbers, special characters", createdBy);

        // 비밀번호 요구사항 표시 영어 번역
        createTranslationIfNotExists("password.requirements.title", languageCode, "Password requirements:", createdBy);
        createTranslationIfNotExists("password.requirements.length", languageCode, "8-100 characters", createdBy);
        createTranslationIfNotExists("password.requirements.letter", languageCode, "Contains letters", createdBy);
        createTranslationIfNotExists("password.requirements.digit", languageCode, "Contains numbers", createdBy);
        createTranslationIfNotExists("password.requirements.special", languageCode, "Contains special characters", createdBy);
        createTranslationIfNotExists("password.requirements.combination", languageCode, "2 or more types combined", createdBy);
        createTranslationIfNotExists("password.success.changed", languageCode, "Password changed successfully.", createdBy);
        createTranslationIfNotExists("password.error.changeFailed", languageCode, "Failed to change password.", createdBy);

        // 언어 설정 관련 영어 번역
        createTranslationIfNotExists("language.settings.title", languageCode, "Language Settings", createdBy);
        createTranslationIfNotExists("language.settings.description", languageCode, "Select your preferred language to display the entire application in that language.", createdBy);
        createTranslationIfNotExists("language.interface", languageCode, "Interface Language", createdBy);
        createTranslationIfNotExists("language.helperText", languageCode, "Language changes are applied immediately and saved automatically.", createdBy);
        createTranslationIfNotExists("language.current", languageCode, "Current language:", createdBy);
        createTranslationIfNotExists("language.korean", languageCode, "Korean", createdBy);
        createTranslationIfNotExists("language.english", languageCode, "English", createdBy);

        // TestCase 관련 영어 번역
        createTranslationIfNotExists("testcase.form.title.create", languageCode, "Create Test Case", createdBy);
        createTranslationIfNotExists("testcase.form.title.edit", languageCode, "Edit Test Case", createdBy);
        createTranslationIfNotExists("testcase.form.folder.create", languageCode, "Create Test Folder", createdBy);
        createTranslationIfNotExists("testcase.form.folder.edit", languageCode, "Edit Test Folder", createdBy);
        createTranslationIfNotExists("testcase.info.title", languageCode, "Test Case Information", createdBy);

        // Form 필드들
        createTranslationIfNotExists("testcase.form.name", languageCode, "Name", createdBy);
        createTranslationIfNotExists("testcase.form.description", languageCode, "Description", createdBy);
        createTranslationIfNotExists("testcase.form.displayOrder", languageCode, "Display Order", createdBy);
        createTranslationIfNotExists("testcase.form.order", languageCode, "Order", createdBy);
        createTranslationIfNotExists("testcase.form.preCondition", languageCode, "Pre-condition", createdBy);
        createTranslationIfNotExists("testcase.form.expectedResults", languageCode, "Expected Results", createdBy);

        // Placeholder 텍스트들
        createTranslationIfNotExists("testcase.form.name.placeholder", languageCode, "Test case name", createdBy);
        createTranslationIfNotExists("testcase.form.folder.name.placeholder", languageCode, "Folder name", createdBy);
        createTranslationIfNotExists("testcase.form.description.placeholder", languageCode, "Enter description", createdBy);
        createTranslationIfNotExists("testcase.form.folder.description.placeholder", languageCode, "Folder description", createdBy);

        // 버튼들
        createTranslationIfNotExists("testcase.form.button.save", languageCode, "Save", createdBy);
        createTranslationIfNotExists("testcase.form.button.saving", languageCode, "Saving...", createdBy);
        createTranslationIfNotExists("testcase.form.button.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("testcase.form.button.close", languageCode, "Close", createdBy);
        createTranslationIfNotExists("testcase.version.button.create", languageCode, "Create Version", createdBy);

        // 추가 폼 필드들
        createTranslationIfNotExists("testcase.form.folderName", languageCode, "Folder name", createdBy);
        createTranslationIfNotExists("testcase.form.folderDescription", languageCode, "Folder description", createdBy);
        createTranslationIfNotExists("testcase.form.testcaseName", languageCode, "Test case name", createdBy);
        createTranslationIfNotExists("testcase.form.testcaseDescription", languageCode, "Test case description", createdBy);
        createTranslationIfNotExists("testcase.form.preConditionPlaceholder", languageCode, "Pre-condition", createdBy);
        createTranslationIfNotExists("testcase.form.overallExpectedResults", languageCode, "Overall expected results", createdBy);

        // 테스트 스텝 관련
        createTranslationIfNotExists("testcase.form.testSteps", languageCode, "Test Steps", createdBy);
        createTranslationIfNotExists("testcase.form.stepNumber", languageCode, "No.", createdBy);
        createTranslationIfNotExists("testcase.form.step", languageCode, "Step", createdBy);
        createTranslationIfNotExists("testcase.form.expected", languageCode, "Expected", createdBy);
        createTranslationIfNotExists("testcase.form.stepDescription", languageCode, "Step description", createdBy);
        createTranslationIfNotExists("testcase.form.expectedResult", languageCode, "Expected result", createdBy);
        createTranslationIfNotExists("testcase.button.addStep", languageCode, "Add Step", createdBy);

        // 메시지들
        createTranslationIfNotExists("testcase.message.addSteps", languageCode, "Please add steps.", createdBy);

        // 헬퍼 텍스트들
        createTranslationIfNotExists("testcase.helper.description", languageCode, "Please enter description.", createdBy);
        createTranslationIfNotExists("testcase.helper.preCondition", languageCode, "Please enter pre-condition.", createdBy);
        createTranslationIfNotExists("testcase.validation.expectedResultsRequired", languageCode, "Please enter overall expected results.", createdBy);

        // InputModeToggle 관련 영어 번역
        createTranslationIfNotExists("testcase.inputMode.title", languageCode, "Input Mode Selection", createdBy);
        createTranslationIfNotExists("testcase.inputMode.form.title", languageCode, "Individual Form", createdBy);
        createTranslationIfNotExists("testcase.inputMode.spreadsheet.title", languageCode, "Spreadsheet", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.title", languageCode, "Advanced Spreadsheet", createdBy);

        // 모드별 설명
        createTranslationIfNotExists("testcase.inputMode.form.description", languageCode, "Individual Form Mode: Input test cases one by one with detailed information.", createdBy);
        createTranslationIfNotExists("testcase.inputMode.spreadsheet.description", languageCode, "Spreadsheet Mode: Batch input multiple test cases at once.", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.description", languageCode, "Advanced Spreadsheet Mode: Spreadsheet with line breaks and advanced editing features.", createdBy);

        // 툴팁 텍스트들
        createTranslationIfNotExists("testcase.inputMode.form.tooltip", languageCode, "Detailed input with individual forms (traditional method)", createdBy);
        createTranslationIfNotExists("testcase.inputMode.spreadsheet.tooltip", languageCode, "Batch input with spreadsheet (basic version)", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.tooltip", languageCode, "Advanced spreadsheet (line break support, react-datasheet-grid)", createdBy);

        // 상태 메시지들
        createTranslationIfNotExists("testcase.inputMode.form.status", languageCode, "📝 Currently {count} test cases exist.", createdBy);
        createTranslationIfNotExists("testcase.inputMode.form.features", languageCode, "• All fields supported • Unlimited steps • Detailed input", createdBy);
        createTranslationIfNotExists("testcase.inputMode.spreadsheet.status", languageCode, "📊 Provides Excel-like editing environment. (basic version)", createdBy);
        createTranslationIfNotExists("testcase.inputMode.spreadsheet.features", languageCode, "• Edit 50+ simultaneously • Dynamic step management 1-10 • Quick batch input", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.status", languageCode, "🚀 Advanced Spreadsheet - Supports line breaks and multi-selection.", createdBy);
        createTranslationIfNotExists("testcase.inputMode.advancedSpreadsheet.features", languageCode, "• Cell line breaks(Enter) • Multi-selection(Shift+click) • Drag resize • Advanced copy/paste", createdBy);

        // 경고 메시지
        createTranslationIfNotExists("testcase.inputMode.warning.modeSwitch", languageCode, "⚠️ Data being edited will be preserved when switching modes.", createdBy);

        // 스프레드시트 사용법 관련 키들
        createTranslationIfNotExists("testcase.spreadsheet.usage.title", languageCode, "Usage:", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.usage.basicUsage", languageCode, "Click cells to edit directly like Excel. Use Tab/Enter to move to next cell, Ctrl+C/V for copy/paste.", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.usage.folderFunction", languageCode, "Folder function: Click \"Add Folder\" button or enter \"📁 FolderName\" format in name cell to create folders.", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.usage.stepManagement", languageCode, "Step management: Click ⚙️ button to adjust the number of steps (up to 10).", createdBy);

        // TestCaseDatasheetGrid 고급 기능 관련
        createTranslationIfNotExists("testcase.advancedGrid.features.title", languageCode, "Advanced Features:", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.features.lineBreak", languageCode, "Use Enter within cells for line breaks.", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.features.navigation", languageCode, "Tab to move to next cell, Ctrl+C/V for copy/paste support.", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.multiSelect.title", languageCode, "Multi-selection:", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.multiSelect.range", languageCode, "Shift+click for range selection, Ctrl+click for individual selection.", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.multiSelect.resize", languageCode, "Drag to resize cells and auto-fill data support.", createdBy);

        createTranslationIfNotExists("testcase.form.button.saving", languageCode, "Saving...", createdBy);
        createTranslationIfNotExists("testcase.form.button.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("testcase.form.button.close", languageCode, "Close", createdBy);

        // 버전 관련
        createTranslationIfNotExists("testcase.version.create", languageCode, "Create Version", createdBy);
        createTranslationIfNotExists("testcase.version.creating", languageCode, "Creating...", createdBy);
        createTranslationIfNotExists("testcase.version.label", languageCode, "Version Label", createdBy);
        createTranslationIfNotExists("testcase.version.description", languageCode, "Version Description", createdBy);
        createTranslationIfNotExists("testcase.version.defaultDescription", languageCode, "Manual version creation", createdBy);
        createTranslationIfNotExists("testcase.version.helper", languageCode, "Optional. Leave blank to set as 'Manual version creation'.", createdBy);

        // 테스트 스텝 관련
        createTranslationIfNotExists("testcase.steps.title", languageCode, "Test Steps", createdBy);
        createTranslationIfNotExists("testcase.steps.add", languageCode, "Add Step", createdBy);
        createTranslationIfNotExists("testcase.steps.number", languageCode, "Number", createdBy);
        createTranslationIfNotExists("testcase.steps.action", languageCode, "Action", createdBy);
        createTranslationIfNotExists("testcase.steps.expected", languageCode, "Expected Result", createdBy);
        createTranslationIfNotExists("testcase.steps.delete", languageCode, "Delete", createdBy);

        // Tree 관련
        createTranslationIfNotExists("testcase.tree.add", languageCode, "Add", createdBy);
        createTranslationIfNotExists("testcase.tree.edit", languageCode, "Edit", createdBy);
        createTranslationIfNotExists("testcase.tree.delete", languageCode, "Delete", createdBy);
        createTranslationIfNotExists("testcase.tree.moveUp", languageCode, "Move Up", createdBy);
        createTranslationIfNotExists("testcase.tree.moveDown", languageCode, "Move Down", createdBy);
        createTranslationIfNotExists("testcase.tree.refresh", languageCode, "Refresh", createdBy);
        createTranslationIfNotExists("testcase.tree.history", languageCode, "History", createdBy);

        // 삭제 확인 다이얼로그
        createTranslationIfNotExists("testcase.delete.confirm.title", languageCode, "Confirm Delete", createdBy);
        createTranslationIfNotExists("testcase.delete.confirm.message", languageCode, "Are you sure you want to delete?", createdBy);
        createTranslationIfNotExists("testcase.delete.confirm.yes", languageCode, "Delete", createdBy);
        createTranslationIfNotExists("testcase.delete.confirm.no", languageCode, "Cancel", createdBy);

        // 상태 메시지들
        createTranslationIfNotExists("testcase.message.saveSuccess", languageCode, "Test case has been saved successfully.", createdBy);
        createTranslationIfNotExists("testcase.message.saveFailed", languageCode, "Failed to save test case.", createdBy);
        createTranslationIfNotExists("testcase.message.deleteSuccess", languageCode, "Test case has been deleted successfully.", createdBy);
        createTranslationIfNotExists("testcase.message.deleteFailed", languageCode, "Failed to delete test case.", createdBy);

        // 유효성 검사 메시지들
        createTranslationIfNotExists("testcase.validation.nameRequired", languageCode, "Name is required.", createdBy);
        createTranslationIfNotExists("testcase.validation.nameLength", languageCode, "Name must be between 1 and 100 characters.", createdBy);
        createTranslationIfNotExists("testcase.validation.descriptionLength", languageCode, "Description must be 500 characters or less.", createdBy);

        // 권한 관련 메시지들
        createTranslationIfNotExists("testcase.permission.readOnly", languageCode, "Read-only permission.", createdBy);
        createTranslationIfNotExists("testcase.permission.noEdit", languageCode, "No edit permission.", createdBy);
        createTranslationIfNotExists("testcase.permission.noDelete", languageCode, "No delete permission.", createdBy);

        // JIRA 설정 관련 영어 번역
        createTranslationIfNotExists("jira.settings.title", languageCode, "JIRA Integration Settings", createdBy);
        createTranslationIfNotExists("jira.settings.description", languageCode, "Integrate with JIRA to automatically add test results as comments to issues.", createdBy);
        createTranslationIfNotExists("jira.button.configure", languageCode, "Edit Settings", createdBy);
        createTranslationIfNotExists("jira.button.delete", languageCode, "Delete Settings", createdBy);
        createTranslationIfNotExists("jira.success.saved", languageCode, "JIRA settings saved.", createdBy);
        createTranslationIfNotExists("jira.success.deleted", languageCode, "JIRA settings deleted.", createdBy);
        createTranslationIfNotExists("jira.error.saveFailed", languageCode, "Failed to save JIRA settings.", createdBy);
        createTranslationIfNotExists("jira.error.deleteFailed", languageCode, "Failed to delete JIRA settings:", createdBy);
        createTranslationIfNotExists("jira.error.network", languageCode, "Please check your network connection.", createdBy);
        createTranslationIfNotExists("jira.error.authentication", languageCode, "Your login has expired. Please log in again.", createdBy);
        createTranslationIfNotExists("jira.error.encryption", languageCode, "Server configuration issue. Please contact the administrator.", createdBy);
        createTranslationIfNotExists("jira.confirm.delete", languageCode, "Are you sure you want to delete JIRA settings?", createdBy);

        // 사용자 목록 관리 영어 번역
        createTranslationIfNotExists("userList.title", languageCode, "User Management", createdBy);
        createTranslationIfNotExists("userList.loading", languageCode, "Loading user list...", createdBy);
        createTranslationIfNotExists("userList.search.placeholder", languageCode, "Search by name, username, email...", createdBy);
        createTranslationIfNotExists("userList.filter.role", languageCode, "Role", createdBy);
        createTranslationIfNotExists("userList.filter.status", languageCode, "Status", createdBy);
        createTranslationIfNotExists("userList.filter.all", languageCode, "All", createdBy);
        createTranslationIfNotExists("userList.filter.active", languageCode, "Active", createdBy);
        createTranslationIfNotExists("userList.filter.inactive", languageCode, "Inactive", createdBy);
        createTranslationIfNotExists("userList.button.refresh", languageCode, "Refresh", createdBy);
        createTranslationIfNotExists("userList.button.export", languageCode, "Export Data", createdBy);
        createTranslationIfNotExists("userList.button.reset", languageCode, "Reset", createdBy);
        createTranslationIfNotExists("userList.stats.totalUsers", languageCode, "Total Users", createdBy);
        createTranslationIfNotExists("userList.stats.activeUsers", languageCode, "Active Users", createdBy);
        createTranslationIfNotExists("userList.stats.inactiveUsers", languageCode, "Inactive Users", createdBy);
        createTranslationIfNotExists("userList.stats.recentRegistrations", languageCode, "Recent Registrations", createdBy);
        createTranslationIfNotExists("userList.table.username", languageCode, "Username", createdBy);
        createTranslationIfNotExists("userList.table.name", languageCode, "Name", createdBy);
        createTranslationIfNotExists("userList.table.email", languageCode, "Email", createdBy);
        createTranslationIfNotExists("userList.table.role", languageCode, "Role", createdBy);
        createTranslationIfNotExists("userList.table.status", languageCode, "Status", createdBy);
        createTranslationIfNotExists("userList.table.createdAt", languageCode, "Join Date", createdBy);
        createTranslationIfNotExists("userList.table.lastLogin", languageCode, "Last Login", createdBy);
        createTranslationIfNotExists("userList.table.actions", languageCode, "Actions", createdBy);
        createTranslationIfNotExists("userList.status.none", languageCode, "None", createdBy);
        createTranslationIfNotExists("userList.action.view", languageCode, "View Details", createdBy);
        createTranslationIfNotExists("userList.action.moreActions", languageCode, "More Actions", createdBy);
        createTranslationIfNotExists("userList.action.activate", languageCode, "Activate", createdBy);
        createTranslationIfNotExists("userList.action.deactivate", languageCode, "Deactivate", createdBy);
        createTranslationIfNotExists("userList.empty.message", languageCode, "No users found matching the search criteria.", createdBy);
        createTranslationIfNotExists("userList.empty.resetButton", languageCode, "Reset Search Criteria", createdBy);
        createTranslationIfNotExists("userList.pagination.rowsPerPage", languageCode, "Rows per page:", createdBy);
        createTranslationIfNotExists("userList.pagination.displayedRows", languageCode, "{from}-{to} of {count}", createdBy);

        // 헤더 네비게이션 영어 번역
        createTranslationIfNotExists("header.nav.dashboard", languageCode, "Dashboard", createdBy);
        createTranslationIfNotExists("header.nav.organizationManagement", languageCode, "Organization Management", createdBy);
        createTranslationIfNotExists("header.nav.userManagement", languageCode, "User Management", createdBy);
        createTranslationIfNotExists("header.nav.mailSettings", languageCode, "Mail Settings", createdBy);
        createTranslationIfNotExists("header.nav.translationManagement", languageCode, "Translation Management", createdBy);
        createTranslationIfNotExists("header.nav.projectSelection", languageCode, "Project Selection", createdBy);

        // 헤더 사용자 메뉴 영어 번역
        createTranslationIfNotExists("header.userMenu.profile", languageCode, "Profile", createdBy);
        createTranslationIfNotExists("header.userMenu.logout", languageCode, "Logout", createdBy);

        // 스프레드시트 관련 영어 번역
        // 기본 스프레드시트 헤더 및 버튼
        createTranslationIfNotExists("testcase.spreadsheet.header.title", languageCode, "Test Case Spreadsheet", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.button.refresh", languageCode, "Refresh", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.button.save", languageCode, "Save All", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.button.saveAll", languageCode, "Save All", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.button.addFolder", languageCode, "Add Folder", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.button.stepSettings", languageCode, "⚙️", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.button.addRows", languageCode, "Add 10 Rows", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.button.export", languageCode, "Export", createdBy);

        // 상태 칩 및 통계
        createTranslationIfNotExists("testcase.spreadsheet.status.currentRows", languageCode, "Current: {count} rows", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.status.activeSteps", languageCode, "Steps: {count}", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.status.totalColumns", languageCode, "Columns: {count}", createdBy);

        // 폴더 관련
        createTranslationIfNotExists("testcase.spreadsheet.folder.create", languageCode, "Create Folder", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.folder.dialog.title", languageCode, "Create New Folder", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.folder.dialog.name", languageCode, "Folder Name", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.folder.dialog.description", languageCode, "Description", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.folder.dialog.create", languageCode, "Create", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.folder.dialog.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.folder.dialog.placeholder.name", languageCode, "Enter folder name...", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.folder.dialog.placeholder.description", languageCode, "Enter folder description...", createdBy);

        // 스텝 설정 다이얼로그
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.title", languageCode, "Step Settings", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.description", languageCode, "Select the number of steps for test cases", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.currentSteps", languageCode, "Current Steps: {count}", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.maxSteps", languageCode, "Max Steps (1-10)", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.warning", languageCode, "⚠️ Reducing steps may result in data loss!", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.apply", languageCode, "Apply", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.stepDialog.cancel", languageCode, "Cancel", createdBy);

        // 내보내기 메뉴
        createTranslationIfNotExists("testcase.spreadsheet.export.excel", languageCode, "Excel Export", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.export.csv", languageCode, "CSV Export", createdBy);

        // 알림 및 메시지
        createTranslationIfNotExists("testcase.spreadsheet.notification.saveSuccess", languageCode, "✅ {count} test cases saved successfully!", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.notification.saveError", languageCode, "❌ Save failed. Please try again.", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.notification.folderCreated", languageCode, "📁 Folder created successfully!", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.notification.dataLoaded", languageCode, "📊 Data loaded successfully: {count} rows", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.notification.rowsAdded", languageCode, "➕ {count} rows added", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.notification.stepChanged", languageCode, "⚙️ Step configuration changed to {count}", createdBy);

        // 사용법 및 도움말
        createTranslationIfNotExists("testcase.spreadsheet.help.basicUsage", languageCode, "Click cells to edit directly like Excel. Use Tab/Enter to move to next cell, Ctrl+C/V for copy/paste.", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.help.folderFunction", languageCode, "Folder function: Click \"Add Folder\" button or enter \"📁 FolderName\" format in name cell to create folders.", createdBy);
        createTranslationIfNotExists("testcase.spreadsheet.help.stepManagement", languageCode, "Step management: Click ⚙️ button to adjust the number of steps (up to 10).", createdBy);

        // 고급 스프레드시트 (react-datasheet-grid) 관련
        createTranslationIfNotExists("testcase.advancedGrid.title", languageCode, "Advanced Spreadsheet (react-datasheet-grid)", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.button.refresh", languageCode, "Refresh", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.button.save", languageCode, "Save All", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.button.addFolder", languageCode, "Add Folder", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.button.stepSettings", languageCode, "⚙️", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.button.addRows", languageCode, "Add 10 Rows", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.button.export", languageCode, "Export", createdBy);

        // 고급 그리드 상태 및 통계
        createTranslationIfNotExists("testcase.advancedGrid.status.currentRows", languageCode, "Current: {count} rows", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.status.activeSteps", languageCode, "Steps: {count}", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.status.totalColumns", languageCode, "Columns: {count}", createdBy);

        // 고급 그리드 에러 처리
        createTranslationIfNotExists("testcase.advancedGrid.error.loadFailed", languageCode, "❌ Failed to load data", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.error.saveFailed", languageCode, "❌ Save failed", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.error.title", languageCode, "Error", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.error.close", languageCode, "Close", createdBy);

        // 고급 그리드 폴더 관련
        createTranslationIfNotExists("testcase.advancedGrid.folder.dialog.title", languageCode, "Create New Folder", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.folder.dialog.name", languageCode, "Folder Name", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.folder.dialog.description", languageCode, "Description", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.folder.dialog.create", languageCode, "Create", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.folder.dialog.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.folder.dialog.placeholder.name", languageCode, "Enter folder name...", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.folder.dialog.placeholder.description", languageCode, "Enter folder description...", createdBy);

        // 고급 그리드 스텝 설정
        createTranslationIfNotExists("testcase.advancedGrid.stepDialog.title", languageCode, "Step Settings", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.stepDialog.description", languageCode, "Select the number of steps for test cases", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.stepDialog.currentSteps", languageCode, "Current Steps: {count}", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.stepDialog.maxSteps", languageCode, "Max Steps (1-10)", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.stepDialog.warning", languageCode, "⚠️ Reducing steps may result in data loss!", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.stepDialog.apply", languageCode, "Apply", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.stepDialog.cancel", languageCode, "Cancel", createdBy);

        // 고급 그리드 내보내기
        createTranslationIfNotExists("testcase.advancedGrid.export.excel", languageCode, "Excel Export", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.export.csv", languageCode, "CSV Export", createdBy);

        // 고급 그리드 알림
        createTranslationIfNotExists("testcase.advancedGrid.notification.saveSuccess", languageCode, "✅ {count} test cases saved successfully!", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.notification.saveError", languageCode, "❌ Save failed. Please try again.", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.notification.folderCreated", languageCode, "📁 Folder created successfully!", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.notification.dataLoaded", languageCode, "📊 Data loaded successfully: {count} rows", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.notification.rowsAdded", languageCode, "➕ {count} rows added", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.notification.stepChanged", languageCode, "⚙️ Step configuration changed to {count}", createdBy);

        // 고급 그리드 사용법 및 도움말
        createTranslationIfNotExists("testcase.advancedGrid.help.basicUsage", languageCode, "Click cells to edit directly like Excel. Use Tab/Enter to move to next cell, Ctrl+C/V for copy/paste.", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.help.folderFunction", languageCode, "Folder function: Click \"Add Folder\" button or enter \"📁 FolderName\" format in name cell to create folders.", createdBy);
        createTranslationIfNotExists("testcase.advancedGrid.help.stepManagement", languageCode, "Step management: Click ⚙️ button to adjust the number of steps (up to 10).", createdBy);

        // 테스트케이스 트리 관련
        createTranslationIfNotExists("testcase.tree.title.select", languageCode, "Select Test Cases", createdBy);
        createTranslationIfNotExists("testcase.tree.title.manage", languageCode, "Test Cases", createdBy);
        createTranslationIfNotExists("testcase.tree.selectAll", languageCode, "Select All", createdBy);
        createTranslationIfNotExists("testcase.tree.root", languageCode, "Root", createdBy);

        // 트리 메시지
        createTranslationIfNotExists("testcase.tree.message.selectProject", languageCode, "Please select a project.", createdBy);
        createTranslationIfNotExists("testcase.tree.message.loading", languageCode, "Loading...", createdBy);
        createTranslationIfNotExists("testcase.tree.message.noTestcases", languageCode, "No test cases found.", createdBy);

        // 트리 액션 (메뉴)
        createTranslationIfNotExists("testcase.tree.action.addFolder", languageCode, "Add Folder", createdBy);
        createTranslationIfNotExists("testcase.tree.action.addTestcase", languageCode, "Add Test Case", createdBy);
        createTranslationIfNotExists("testcase.tree.action.addSubFolder", languageCode, "Add Sub Folder", createdBy);
        createTranslationIfNotExists("testcase.tree.action.addSubTestcase", languageCode, "Add Sub Test Case", createdBy);
        createTranslationIfNotExists("testcase.tree.action.rename", languageCode, "Rename", createdBy);
        createTranslationIfNotExists("testcase.tree.action.delete", languageCode, "Delete", createdBy);
        createTranslationIfNotExists("testcase.tree.action.versionHistory", languageCode, "Version History", createdBy);

        // 트리 다이얼로그
        createTranslationIfNotExists("testcase.tree.dialog.deleteConfirm.title", languageCode, "Delete Confirmation", createdBy);
        createTranslationIfNotExists("testcase.tree.dialog.deleteConfirm.message", languageCode, "Are you sure you want to delete? (including sub items)", createdBy);
        createTranslationIfNotExists("testcase.tree.dialog.batchDelete.title", languageCode, "Batch Delete", createdBy);
        createTranslationIfNotExists("testcase.tree.dialog.batchDelete.message", languageCode, "Do you want to delete {count} items (including sub items)?", createdBy);
        createTranslationIfNotExists("testcase.tree.dialog.error.title", languageCode, "Error", createdBy);

        // 트리 버튼
        createTranslationIfNotExists("testcase.tree.button.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("testcase.tree.button.delete", languageCode, "Delete", createdBy);
        createTranslationIfNotExists("testcase.tree.button.close", languageCode, "Close", createdBy);
        createTranslationIfNotExists("testcase.tree.button.refresh", languageCode, "Refresh", createdBy);
        createTranslationIfNotExists("testcase.tree.button.editOrder", languageCode, "Edit Order", createdBy);
        createTranslationIfNotExists("testcase.tree.button.saveOrder", languageCode, "Save Order", createdBy);
        createTranslationIfNotExists("testcase.tree.button.batchDelete", languageCode, "Batch Delete", createdBy);

        // 트리 validation/error 메시지
        createTranslationIfNotExists("testcase.tree.validation.nameRequired", languageCode, "Please enter a name.", createdBy);
        createTranslationIfNotExists("testcase.tree.error.renameFailed", languageCode, "Failed to rename: ", createdBy);
        createTranslationIfNotExists("testcase.tree.error.deleteFailed", languageCode, "An error occurred during deletion.", createdBy);

        // 테스트 플랜 관련 영어 번역
        createTranslationIfNotExists("testPlan.form.title.create", languageCode, "Create New Test Plan", createdBy);
        createTranslationIfNotExists("testPlan.form.title.edit", languageCode, "Edit Test Plan", createdBy);
        createTranslationIfNotExists("testPlan.form.planName", languageCode, "Plan Name", createdBy);
        createTranslationIfNotExists("testPlan.form.description", languageCode, "Description", createdBy);
        createTranslationIfNotExists("testPlan.form.testcaseSelection", languageCode, "Test Case Selection", createdBy);
        createTranslationIfNotExists("testPlan.form.selectedCount", languageCode, "{count} selected", createdBy);
        createTranslationIfNotExists("testPlan.form.projectSelectFirst", languageCode, "Please select a project first", createdBy);
        createTranslationIfNotExists("testPlan.form.button.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("testPlan.form.button.save", languageCode, "Save", createdBy);
        createTranslationIfNotExists("testPlan.form.button.processing", languageCode, "Processing...", createdBy);

        // 테스트 플랜 폼 검증 메시지
        createTranslationIfNotExists("testPlan.validation.nameRequired", languageCode, "Test plan name is required", createdBy);
        createTranslationIfNotExists("testPlan.validation.testcaseRequired", languageCode, "At least one test case must be selected", createdBy);
        createTranslationIfNotExists("testPlan.error.saveFailed", languageCode, "An error occurred while saving: ", createdBy);

        // 테스트 플랜 목록
        createTranslationIfNotExists("testPlan.list.add", languageCode, "Add Test Plan", createdBy);
        createTranslationIfNotExists("testPlan.list.table.id", languageCode, "ID", createdBy);
        createTranslationIfNotExists("testPlan.list.table.name", languageCode, "Name", createdBy);
        createTranslationIfNotExists("testPlan.list.table.description", languageCode, "Description", createdBy);
        createTranslationIfNotExists("testPlan.list.table.testcaseCount", languageCode, "Test Cases", createdBy);
        createTranslationIfNotExists("testPlan.list.table.createdAt", languageCode, "Created Date", createdBy);
        createTranslationIfNotExists("testPlan.list.table.execute", languageCode, "Execute", createdBy);
        createTranslationIfNotExists("testPlan.list.table.edit", languageCode, "Edit", createdBy);
        createTranslationIfNotExists("testPlan.list.table.delete", languageCode, "Delete", createdBy);
        createTranslationIfNotExists("testPlan.list.empty.message", languageCode, "No test plans found.", createdBy);

        // 테스트 실행 다이얼로그
        createTranslationIfNotExists("testPlan.execution.dialog.title", languageCode, "Test Execution - {planName}", createdBy);
        createTranslationIfNotExists("testPlan.execution.button.newExecution", languageCode, "Create New Execution", createdBy);
        createTranslationIfNotExists("testPlan.execution.empty.message", languageCode, "No execution history for this test plan.", createdBy);
        createTranslationIfNotExists("testPlan.execution.progress", languageCode, "Progress:", createdBy);
        createTranslationIfNotExists("testPlan.execution.action.edit", languageCode, "Edit", createdBy);
        createTranslationIfNotExists("testPlan.execution.action.view", languageCode, "Full Screen View", createdBy);
        createTranslationIfNotExists("testPlan.execution.dialog.close", languageCode, "Close", createdBy);

        // 테스트 플랜 삭제 다이얼로그
        createTranslationIfNotExists("testPlan.delete.dialog.title", languageCode, "Delete Test Plan", createdBy);
        createTranslationIfNotExists("testPlan.delete.dialog.message", languageCode, "Are you sure you want to delete this test plan? This action cannot be undone.", createdBy);
        createTranslationIfNotExists("testPlan.delete.button.cancel", languageCode, "Cancel", createdBy);
        createTranslationIfNotExists("testPlan.delete.button.delete", languageCode, "Delete", createdBy);

        // 테스트 플랜 선택기
        createTranslationIfNotExists("testPlan.selector.label", languageCode, "Select Test Plan", createdBy);
        createTranslationIfNotExists("testPlan.selector.all", languageCode, "All", createdBy);
        createTranslationIfNotExists("testPlan.selector.caseCount", languageCode, "{count} cases", createdBy);
        createTranslationIfNotExists("testPlan.selector.selected", languageCode, "Selected Plan: {planName}", createdBy);
        createTranslationIfNotExists("testPlan.selector.testcaseCount", languageCode, "({count} test cases)", createdBy);

        // 실행 상태
        createTranslationIfNotExists("testPlan.status.notStarted", languageCode, "Not Started", createdBy);
        createTranslationIfNotExists("testPlan.status.inProgress", languageCode, "In Progress", createdBy);
        createTranslationIfNotExists("testPlan.status.completed", languageCode, "Completed", createdBy);
    }

    private void createTranslationIfNotExists(String keyName, String languageCode, String value, String createdBy) {
        Optional<Translation> existingTranslation = translationRepository.findByKeyNameAndLanguageCode(keyName, languageCode);
        if (existingTranslation.isEmpty()) {
            Optional<TranslationKey> translationKey = translationKeyRepository.findByKeyName(keyName);
            Optional<Language> language = languageRepository.findByCode(languageCode);

            if (translationKey.isPresent() && language.isPresent()) {
                Translation translation = new Translation(translationKey.get(), language.get(), value, createdBy);
                translationRepository.save(translation);
                log.debug("번역 생성: {} - {} = {}", keyName, languageCode, value);
            } else {
                log.warn("번역 생성 실패 - 키 또는 언어 없음: {} - {}", keyName, languageCode);
            }
        } else {
            log.debug("번역 이미 존재: {} - {}", keyName, languageCode);
        }
    }
}