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