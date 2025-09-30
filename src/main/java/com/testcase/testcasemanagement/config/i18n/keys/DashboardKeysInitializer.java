// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/DashboardKeysInitializer.java
package com.testcase.testcasemanagement.config.i18n.keys;

import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DashboardKeysInitializer {

    private final TranslationKeyRepository translationKeyRepository;

    public void initialize() {
        System.out.println("DashboardKeysInitializer.initialize() 시작!");
        log.info("대시보드 번역 키 초기화 시작");

        // 대시보드 페이지 키들
        createTranslationKeyIfNotExists("dashboard.title", "dashboard", "대시보드 페이지 제목", "대시보드");
        createTranslationKeyIfNotExists("dashboard.lastUpdated", "dashboard", "최근 업데이트 라벨", "최근 업데이트: {date}");
        createTranslationKeyIfNotExists("dashboard.refresh.button", "dashboard", "새로고침 버튼", "새로고침");
        createTranslationKeyIfNotExists("dashboard.refresh.tooltip", "dashboard", "대시보드 새로고침 툴팁", "대시보드 새로고침");

        // 대시보드 프로젝트 정보
        createTranslationKeyIfNotExists("dashboard.project.totalTestCases", "dashboard", "총 테스트케이스 수", "총 테스트케이스: {count}개");
        createTranslationKeyIfNotExists("dashboard.project.members", "dashboard", "프로젝트 멤버 수", "프로젝트 멤버: {count}명");

        // 대시보드 차트 제목들
        createTranslationKeyIfNotExists("dashboard.charts.recentTestResults", "dashboard", "최근 테스트케이스 결과 차트", "최근 테스트케이스 결과");
        createTranslationKeyIfNotExists("dashboard.charts.testResultsTrend", "dashboard", "테스트케이스 결과 추이 차트", "테스트케이스 결과 추이");
        createTranslationKeyIfNotExists("dashboard.charts.openTestRunResults", "dashboard", "오픈 테스트런별 결과 차트", "오픈 테스트런별 테스트케이스 결과");
        createTranslationKeyIfNotExists("dashboard.charts.assigneeResults", "dashboard", "담당자별 결과 차트", "오픈 테스트런 담당자별 테스트케이스 결과");
        createTranslationKeyIfNotExists("dashboard.charts.testPlanResults", "dashboard", "테스트 플랜별 결과 차트", "테스트 플랜별 최근 테스트 결과");
        createTranslationKeyIfNotExists("dashboard.charts.notRunTrend", "dashboard", "미실행 추이 차트", "오픈 테스트런 미실행 테스트케이스 추이");
        createTranslationKeyIfNotExists("dashboard.charts.last15Days", "dashboard", "최근 15일 필터", "최근 15일");

        // 대시보드 로딩 상태
        createTranslationKeyIfNotExists("dashboard.loading.data", "dashboard", "대시보드 데이터 로딩", "📊 대시보드 데이터를 불러오는 중...");
        createTranslationKeyIfNotExists("dashboard.loading.chart", "dashboard", "차트 데이터 로딩", "데이터 로딩 중...");

        // 대시보드 데이터 없음 상태
        createTranslationKeyIfNotExists("dashboard.noData.message", "dashboard", "데이터 없음 메시지", "📋 대시보드 데이터가 없습니다. 프로젝트에 테스트 결과가 있는지 확인해주세요.");
        createTranslationKeyIfNotExists("dashboard.noData.chart", "dashboard", "차트 데이터 없음", "표시할 데이터가 없습니다.");
        createTranslationKeyIfNotExists("dashboard.noData.noActiveTestRuns", "dashboard", "진행 중인 테스트런 없음", "진행 중인 테스트런이 없습니다.");

        // 대시보드 에러 처리
        createTranslationKeyIfNotExists("dashboard.error.solution", "dashboard", "에러 해결방법", "💡 해결방법: {action}");
        createTranslationKeyIfNotExists("dashboard.error.retry", "dashboard", "다시 시도 버튼", "다시 시도");
        createTranslationKeyIfNotExists("dashboard.error.goToLogin", "dashboard", "로그인 페이지로", "로그인 페이지로");
        createTranslationKeyIfNotExists("dashboard.error.details", "dashboard", "상세 정보", "상세 정보");

        // 대시보드 상태 라벨들
        createTranslationKeyIfNotExists("dashboard.status.complete", "dashboard", "완료 상태", "완료");
        createTranslationKeyIfNotExists("dashboard.status.failureRate", "dashboard", "실패율", "실패 {rate}%");
        createTranslationKeyIfNotExists("dashboard.status.completedCount", "dashboard", "완료 건수", "{completed} / {total} 완료");

        // 대시보드 메시지들
        createTranslationKeyIfNotExists("dashboard.messages.selectProject", "dashboard", "프로젝트 선택 요청", "프로젝트를 선택해주세요.");

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
        createTranslationKeyIfNotExists("dashboard.status.skipped", "dashboard", "건너뜀 차트 라벨", "건너뜀");

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

        System.out.println("DashboardKeysInitializer.initialize() 완료! organization.dashboard 키들 초기화됨");
        log.info("대시보드 번역 키 초기화 완료 - organization.dashboard 키들 포함");
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
}
