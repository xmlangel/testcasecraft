// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/OrganizationKeysInitializer.java
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
public class OrganizationKeysInitializer {

    private final TranslationKeyRepository translationKeyRepository;

    public void initialize() {
        // 조직 관리 관련 키들 (OrganizationList & OrganizationDetail)
        createTranslationKeyIfNotExists("organization.management.title", "organization", "조직 관리 페이지 제목", "조직 관리");
        createTranslationKeyIfNotExists("organization.buttons.createNew", "organization", "새 조직 생성 버튼", "새 조직 생성");
        createTranslationKeyIfNotExists("organization.buttons.view", "organization", "조직 보기 버튼", "조직 보기");
        createTranslationKeyIfNotExists("organization.buttons.edit", "organization", "조직 수정 버튼", "조직 수정");
        createTranslationKeyIfNotExists("organization.buttons.invite", "organization", "멤버 초대 버튼", "멤버 초대");
        createTranslationKeyIfNotExists("organization.buttons.createProject", "organization", "프로젝트 생성 버튼", "프로젝트 생성");
        createTranslationKeyIfNotExists("organization.buttons.firstOrganization", "organization", "첫 번째 조직 생성 버튼",
                "첫 번째 조직 생성");
        createTranslationKeyIfNotExists("organization.buttons.firstProject", "organization", "첫 번째 프로젝트 생성 버튼",
                "첫 번째 프로젝트 생성");
        createTranslationKeyIfNotExists("organization.buttons.back", "organization", "조직 목록으로 돌아가기", "조직 목록으로");

        // 조직 상태 및 메시지들
        createTranslationKeyIfNotExists("organization.messages.noOrganizations", "organization", "조직 없음 메시지",
                "조직이 없습니다");
        createTranslationKeyIfNotExists("organization.messages.noProjects", "organization", "프로젝트 없음 메시지",
                "이 조직에는 아직 프로젝트가 없습니다.");
        createTranslationKeyIfNotExists("organization.messages.createHint", "organization", "조직 생성 힌트",
                "새 조직을 생성하여 프로젝트와 팀을 관리해보세요.");
        createTranslationKeyIfNotExists("organization.messages.joinHint", "organization", "조직 참가 힌트",
                "조직에 참가하려면 시스템 관리자에게 문의하세요.");
        createTranslationKeyIfNotExists("organization.messages.accessDenied", "organization", "접근 권한 없음",
                "현재 사용자는 어떤 조직에도 속해있지 않습니다. 시스템 관리자에게 문의하여 조직 멤버로 추가되거나 새 조직을 생성하세요.");
        createTranslationKeyIfNotExists("organization.messages.canCreateNew", "organization", "새 조직 생성 가능 안내",
                "기존 조직에 접근할 수 없지만, 새로운 조직을 생성할 수 있습니다.");
        createTranslationKeyIfNotExists("organization.messages.noAccessContact", "organization", "접근 불가 안내",
                "현재 참가 가능한 조직이 없습니다. 시스템 관리자에게 문의하세요.");
        createTranslationKeyIfNotExists("organization.messages.notFound", "organization", "조직 찾을 수 없음",
                "조직을 찾을 수 없습니다.");

        // 조직 폼 라벨들
        createTranslationKeyIfNotExists("organization.form.name", "organization", "조직 이름 라벨", "조직 이름");
        createTranslationKeyIfNotExists("organization.form.description", "organization", "조직 설명 라벨", "설명");
        createTranslationKeyIfNotExists("organization.form.descriptionPlaceholder", "organization", "조직 설명 플레이스홀더",
                "조직에 대한 설명을 입력하세요...");
        createTranslationKeyIfNotExists("organization.form.nameRequired", "organization", "조직 이름 필수 입력",
                "조직 이름을 입력해주세요.");
        createTranslationKeyIfNotExists("organization.form.codeRequired", "organization", "프로젝트 코드 필수",
                "프로젝트 코드를 입력해주세요.");
        createTranslationKeyIfNotExists("organization.form.projectNameRequired", "organization", "프로젝트 이름 필수",
                "프로젝트 이름을 입력해주세요.");
        createTranslationKeyIfNotExists("organization.form.usernameRequired", "organization", "사용자명 필수",
                "사용자명을 입력해주세요.");

        // 다이얼로그 제목들
        createTranslationKeyIfNotExists("organization.dialog.create.title", "organization", "조직 생성 다이얼로그 제목",
                "새 조직 생성");
        createTranslationKeyIfNotExists("organization.dialog.edit.title", "organization", "조직 수정 다이얼로그 제목", "조직 수정");
        createTranslationKeyIfNotExists("organization.dialog.delete.title", "organization", "조직 삭제 다이얼로그 제목",
                "조직 삭제 확인");
        createTranslationKeyIfNotExists("organization.dialog.invite.title", "organization", "멤버 초대 다이얼로그 제목", "멤버 초대");
        createTranslationKeyIfNotExists("organization.dialog.project.title", "organization", "프로젝트 생성 다이얼로그 제목",
                "조직별 프로젝트 생성");
        createTranslationKeyIfNotExists("organization.dialog.editInfo.title", "organization", "조직 정보 수정 다이얼로그 제목",
                "조직 정보 수정");

        // 삭제 확인 메시지들
        createTranslationKeyIfNotExists("organization.dialog.delete.message", "organization", "조직 삭제 확인 메시지",
                "조직을 정말 삭제하시겠습니까?");
        createTranslationKeyIfNotExists("organization.dialog.delete.warning", "organization", "조직 삭제 경고",
                "이 작업은 되돌릴 수 없습니다. 조직에 속한 모든 프로젝트와 데이터도 함께 삭제됩니다.");

        // 상세 페이지 관련
        createTranslationKeyIfNotExists("organization.detail.members", "organization", "멤버 탭", "멤버");
        createTranslationKeyIfNotExists("organization.detail.projects", "organization", "프로젝트 탭", "프로젝트");
        createTranslationKeyIfNotExists("organization.detail.organizationMembers", "organization", "조직 멤버 제목", "조직 멤버");
        createTranslationKeyIfNotExists("organization.detail.organizationProjects", "organization", "조직 프로젝트 제목",
                "조직 프로젝트");

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
        createTranslationKeyIfNotExists("organization.project.codePlaceholder", "organization", "프로젝트 코드 플레이스홀더",
                "예: WEB_APP_TEST");
        createTranslationKeyIfNotExists("organization.project.namePlaceholder", "organization", "프로젝트 이름 플레이스홀더",
                "예: 웹 애플리케이션 테스트");
        createTranslationKeyIfNotExists("organization.project.descriptionPlaceholder", "organization", "프로젝트 설명 플레이스홀더",
                "프로젝트에 대한 간단한 설명을 입력하세요...");
        createTranslationKeyIfNotExists("organization.project.codeHelperText", "organization", "프로젝트 코드 도움말",
                "영문, 숫자, 언더스코어(_), 하이픈(-)만 사용 가능");
        createTranslationKeyIfNotExists("organization.project.belongsTo", "organization", "프로젝트 소속 안내",
                "이 프로젝트는 조직에 속하게 됩니다.");
        createTranslationKeyIfNotExists("organization.project.noDescription", "organization", "설명 없음", "설명 없음");

        // 조직 대시보드 관련
        createTranslationKeyIfNotExists("organization.dashboard.title", "organization", "조직 대시보드 제목", "조직 대시보드");

        // 조직 대시보드 메트릭 키들
        createTranslationKeyIfNotExists("organization.dashboard.metrics.totalOrganizations", "organization", "전체 조직 수",
                "전체 조직");
        createTranslationKeyIfNotExists("organization.dashboard.metrics.totalOrganizations.subtitle", "organization",
                "전체 조직 수 부제목", "등록된 조직");
        createTranslationKeyIfNotExists("organization.dashboard.metrics.totalProjects", "organization", "전체 프로젝트 수",
                "전체 프로젝트");
        createTranslationKeyIfNotExists("organization.dashboard.metrics.totalProjects.subtitle", "organization",
                "전체 프로젝트 수 부제목", "활성 프로젝트");
        createTranslationKeyIfNotExists("organization.dashboard.metrics.totalTestCases", "organization", "전체 테스트케이스 수",
                "전체 테스트케이스");
        createTranslationKeyIfNotExists("organization.dashboard.metrics.totalTestCases.subtitle", "organization",
                "전체 테스트케이스 수 부제목", "작성된 테스트케이스");
        createTranslationKeyIfNotExists("organization.dashboard.metrics.totalUsers", "organization", "전체 사용자 수",
                "전체 사용자");
        createTranslationKeyIfNotExists("organization.dashboard.metrics.totalUsers.subtitle", "organization",
                "전체 사용자 수 부제목", "등록된 사용자");
        createTranslationKeyIfNotExists("organization.dashboard.metrics.totalMembers", "organization", "전체 멤버 수",
                "전체 멤버");
        createTranslationKeyIfNotExists("organization.dashboard.metrics.totalMembers.subtitle", "organization",
                "전체 멤버 수 부제목", "활성 멤버");

        // 조직 대시보드 탭 키들
        createTranslationKeyIfNotExists("organization.dashboard.tabs.organizationStatus", "organization", "조직 현황 탭",
                "조직 현황");
        createTranslationKeyIfNotExists("organization.dashboard.tabs.testStatistics", "organization", "테스트 통계 탭",
                "테스트 통계");
        createTranslationKeyIfNotExists("organization.dashboard.tabs.performanceMetrics", "organization", "성능 메트릭 탭",
                "성능 메트릭");

        // 성능 메트릭 관련 키들
        createTranslationKeyIfNotExists("performance.title", "organization", "시스템 성능 메트릭 제목", "시스템 성능 메트릭");
        createTranslationKeyIfNotExists("performance.lastUpdated", "organization", "최근 업데이트", "최근 업데이트: {time}");
        createTranslationKeyIfNotExists("performance.refresh", "organization", "새로고침 버튼", "새로고침");
        createTranslationKeyIfNotExists("performance.systemResources", "organization", "시스템 리소스 섹션", "시스템 리소스");
        createTranslationKeyIfNotExists("performance.cpu", "organization", "CPU 사용률", "CPU 사용률");
        createTranslationKeyIfNotExists("performance.memory", "organization", "메모리 사용률", "메모리 사용률");
        createTranslationKeyIfNotExists("performance.disk", "organization", "디스크 사용률", "디스크 사용률");
        createTranslationKeyIfNotExists("performance.cache", "organization", "캐시 성능 섹션", "캐시 성능");
        createTranslationKeyIfNotExists("performance.cache.project", "organization", "프로젝트 캐시", "프로젝트 캐시");
        createTranslationKeyIfNotExists("performance.cache.testcase", "organization", "테스트케이스 캐시", "테스트케이스 캐시");
        createTranslationKeyIfNotExists("performance.cache.hitRate", "organization", "캐시 적중률", "적중률");
        createTranslationKeyIfNotExists("performance.cache.hit", "organization", "캐시 적중", "적중");
        createTranslationKeyIfNotExists("performance.cache.miss", "organization", "캐시 누락", "누락");
        createTranslationKeyIfNotExists("performance.application", "organization", "애플리케이션 성능 섹션", "애플리케이션 성능");
        createTranslationKeyIfNotExists("performance.avgResponseTime", "organization", "평균 응답 시간", "평균 응답 시간");
        createTranslationKeyIfNotExists("performance.requestsPerSecond", "organization", "초당 요청 수", "초당 요청 수");
        createTranslationKeyIfNotExists("performance.activeConnections", "organization", "활성 연결", "활성 연결");
        createTranslationKeyIfNotExists("performance.usage", "organization", "사용량 요약 섹션", "사용량 요약");
        createTranslationKeyIfNotExists("performance.usage.todayVisits", "organization", "오늘 방문", "오늘 방문");
        createTranslationKeyIfNotExists("performance.usage.uniqueVisitors", "organization", "오늘 고유 방문자", "오늘 고유 방문자");
        createTranslationKeyIfNotExists("performance.usage.activeSessions", "organization", "활성 세션", "활성 세션");
        createTranslationKeyIfNotExists("performance.usage.recentMinutes", "organization", "최근 N분 기준",
                "최근 {minutes}분 기준");
        createTranslationKeyIfNotExists("performance.usage.topPages", "organization", "상위 페이지", "상위 페이지");
        createTranslationKeyIfNotExists("performance.usage.totalAccumulated", "organization", "누적 합계", "누적 {total}");
        createTranslationKeyIfNotExists("performance.usage.dailySummary", "organization", "일별 방문 요약", "일별 방문 요약");
        createTranslationKeyIfNotExists("performance.usage.uniqueCount", "organization", "고유 방문자 수", "고유 {count}");
        createTranslationKeyIfNotExists("performance.error.loadFailed", "organization", "성능 메트릭 로드 실패",
                "성능 메트릭을 불러오는데 실패했습니다.");
        createTranslationKeyIfNotExists("performance.button.retry", "organization", "다시 시도 버튼", "다시 시도");

        // 조직 대시보드 차트 키들
        createTranslationKeyIfNotExists("organization.dashboard.charts.projectDistribution", "organization",
                "프로젝트 분포 차트", "조직별 프로젝트 분포");
        createTranslationKeyIfNotExists("organization.dashboard.charts.projectDistribution.projects", "organization",
                "프로젝트 분포 차트 프로젝트", "프로젝트");
        createTranslationKeyIfNotExists("organization.dashboard.charts.projectDistribution.members", "organization",
                "프로젝트 분포 차트 멤버", "멤버");
        createTranslationKeyIfNotExists("organization.dashboard.charts.organizationList", "organization", "조직 목록 차트",
                "조직 목록");
        createTranslationKeyIfNotExists("organization.dashboard.charts.testResultDistribution", "organization",
                "테스트 결과 분포 차트", "테스트 결과 분포");
        createTranslationKeyIfNotExists("organization.dashboard.charts.testResultDetails", "organization",
                "테스트 결과 상세 차트", "테스트 결과 상세");

        // 조직 대시보드 목록 키들
        createTranslationKeyIfNotExists("organization.dashboard.list.projectCount", "organization", "프로젝트 수",
                "프로젝트 {count}개");
        createTranslationKeyIfNotExists("organization.dashboard.list.memberCount", "organization", "멤버 수",
                "멤버 {count}명");

        // 조직 대시보드 테스트 결과 키들
        createTranslationKeyIfNotExists("organization.dashboard.testResults.success", "organization", "성공 테스트 결과",
                "성공");
        createTranslationKeyIfNotExists("organization.dashboard.testResults.failure", "organization", "실패 테스트 결과",
                "실패");
        createTranslationKeyIfNotExists("organization.dashboard.testResults.blocked", "organization", "차단 테스트 결과",
                "차단");
        createTranslationKeyIfNotExists("organization.dashboard.testResults.notRun", "organization", "미실행 테스트 결과",
                "미실행");

        // 탭 관련
        createTranslationKeyIfNotExists("organization.tabs.members", "organization", "멤버 탭", "멤버");
        createTranslationKeyIfNotExists("organization.tabs.projects", "organization", "프로젝트 탭", "프로젝트");

        // 폼 필드 추가
        createTranslationKeyIfNotExists("organization.form.username", "organization", "사용자명 라벨", "사용자명");
        createTranslationKeyIfNotExists("organization.form.role", "organization", "역할 라벨", "역할");
        createTranslationKeyIfNotExists("organization.form.projectCode", "organization", "프로젝트 코드 라벨", "프로젝트 코드");
        createTranslationKeyIfNotExists("organization.form.projectName", "organization", "프로젝트 이름 라벨", "프로젝트 이름");
        createTranslationKeyIfNotExists("organization.form.projectDescription", "organization", "프로젝트 설명 라벨",
                "프로젝트 설명");
        createTranslationKeyIfNotExists("organization.form.projectCodePlaceholder", "organization", "프로젝트 코드 플레이스홀더",
                "예: WEB_APP_TEST");
        createTranslationKeyIfNotExists("organization.form.projectNamePlaceholder", "organization", "프로젝트 이름 플레이스홀더",
                "예: 웹 애플리케이션 테스트");
        createTranslationKeyIfNotExists("organization.form.projectDescriptionPlaceholder", "organization",
                "프로젝트 설명 플레이스홀더", "프로젝트에 대한 간단한 설명을 입력하세요...");
        createTranslationKeyIfNotExists("organization.form.projectCodeHelp", "organization", "프로젝트 코드 도움말",
                "영문, 숫자, 언더스코어(_), 하이픈(-)만 사용 가능");
        createTranslationKeyIfNotExists("organization.form.namePlaceholder", "organization", "조직 이름 플레이스홀더",
                "조직 이름을 입력하세요...");
        createTranslationKeyIfNotExists("organization.form.projectCodeRequired", "organization", "프로젝트 코드 필수",
                "프로젝트 코드를 입력해주세요.");

        // 다이얼로그 추가
        createTranslationKeyIfNotExists("organization.dialog.createProject.title", "organization", "프로젝트 생성 다이얼로그 제목",
                "프로젝트 생성");
        createTranslationKeyIfNotExists("organization.dialog.createProject.info", "organization", "프로젝트 생성 안내",
                "'{organizationName}' 조직에 새 프로젝트가 생성됩니다.");
        createTranslationKeyIfNotExists("organization.dialog.transferOwnership.title", "organization",
                "소유권 이전 다이얼로그 제목", "소유권 이전");
        createTranslationKeyIfNotExists("organization.dialog.transferOwnership.warning", "organization", "소유권 이전 경고",
                "조직의 소유권을 {name}님에게 이전하시겠습니까? 이 작업은 되돌릴 수 없으며, 귀하는 관리자 권한으로 변경됩니다.");
        createTranslationKeyIfNotExists("organization.dialog.transferOwnership.newOwner", "organization", "새로운 소유자 라벨",
                "새로운 소유자");

        // 버튼 추가
        createTranslationKeyIfNotExists("organization.buttons.inviteMember", "organization", "멤버 초대 버튼", "멤버 초대");
        createTranslationKeyIfNotExists("organization.buttons.removeMember", "organization", "멤버 제거 버튼", "멤버 제거");
        createTranslationKeyIfNotExists("organization.buttons.backToList", "organization", "목록으로 돌아가기 버튼", "조직 목록으로");
        createTranslationKeyIfNotExists("organization.buttons.transferOwnership", "organization", "소유권 이전 버튼",
                "소유권 이전");
        createTranslationKeyIfNotExists("organization.buttons.transfer", "organization", "이전 버튼", "이전");

        // 역할 관련
        createTranslationKeyIfNotExists("organization.role.member", "organization", "멤버 역할", "멤버");
        createTranslationKeyIfNotExists("organization.role.admin", "organization", "관리자 역할", "관리자");
        createTranslationKeyIfNotExists("organization.role.owner", "organization", "소유자 역할", "소유자");

        // 프로젝트 관련 추가
        createTranslationKeyIfNotExists("organization.project.organizationLabel", "organization", "소속 조직 라벨", "소속 조직");

        // 에러 관련 추가
        createTranslationKeyIfNotExists("organization.error.notFound", "organization", "조직 없음 에러", "조직을 찾을 수 없습니다.");
        createTranslationKeyIfNotExists("organization.error.idNotProvided", "organization", "ID 없음 에러",
                "조직 ID가 제공되지 않았습니다.");
        createTranslationKeyIfNotExists("organization.error.dataLoadFailed", "organization", "데이터 로드 실패",
                "조직 데이터를 불러오는데 실패했습니다.");
        createTranslationKeyIfNotExists("organization.error.infoLoadFailed", "organization", "정보 로드 실패",
                "조직 정보를 불러오는데 실패했습니다.");
        createTranslationKeyIfNotExists("organization.error.editDialogFailed", "organization", "수정 다이얼로그 실패",
                "수정 다이얼로그를 여는데 실패했습니다.");
        createTranslationKeyIfNotExists("organization.error.selectMember", "organization", "멤버 선택 필요 에러",
                "이전할 멤버를 선택해주세요.");

        // 에러 관련
        createTranslationKeyIfNotExists("organization.error.accessDenied", "organization", "접근 권한 없음 에러",
                "조직 접근 권한 없음");
        createTranslationKeyIfNotExists("organization.error.authRequired", "organization", "인증 필요 에러", "인증 필요");
        createTranslationKeyIfNotExists("organization.error.resourceNotFound", "organization", "리소스 없음 에러", "리소스 없음");
        createTranslationKeyIfNotExists("organization.error.general", "organization", "일반 오류", "오류 발생");
        createTranslationKeyIfNotExists("organization.error.authDescription", "organization", "인증 필요 설명",
                "로그인이 필요합니다. 다시 로그인해주세요.");
        createTranslationKeyIfNotExists("organization.error.notFoundDescription", "organization", "리소스 없음 설명",
                "요청한 리소스를 찾을 수 없습니다.");
        createTranslationKeyIfNotExists("organization.error.generalDescription", "organization", "일반 오류 설명",
                "문제가 지속되면 시스템 관리자에게 문의하세요.");
        createTranslationKeyIfNotExists("organization.error.problemOccurred", "organization", "문제 발생", "문제가 발생했습니다");
        createTranslationKeyIfNotExists("organization.error.occurredAt", "organization", "발생 시간", "발생 시간: {date}");

        // 새로 추가된 조직 관련 번역 키들
        createTranslationKeyIfNotExists("organization.form.descriptionPlaceholder", "organization", "설명 플레이스홀더",
                "조직에 대한 설명을 입력하세요");
    }

    private void createTranslationKeyIfNotExists(String keyName, String category, String description,
            String defaultValue) {
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
