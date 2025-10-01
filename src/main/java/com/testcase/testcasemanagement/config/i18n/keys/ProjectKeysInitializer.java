// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/ProjectKeysInitializer.java
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
public class ProjectKeysInitializer {

    private final TranslationKeyRepository translationKeyRepository;

    public void initialize() {
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
        createTranslationKeyIfNotExists("project.dialog.transferDescription", "project", "조직이전 설명", "'{projectName}' 프로젝트를 다른 조직으로 이전하거나 독립 프로젝트로 만들 수 있습니다.");
        createTranslationKeyIfNotExists("project.dialog.deleteConfirm", "project", "프로젝트 삭제 확인 메시지", "'{projectName}' 프로젝트를 정말 삭제하시겠습니까?");
        createTranslationKeyIfNotExists("project.dialog.forceDeleteConfirm", "project", "프로젝트 강제 삭제 확인 메시지", "'{projectName}' 프로젝트를 정말 강제 삭제하시겠습니까?");

        // ProjectHeader 번역 키들
        createTranslationKeyIfNotExists("projectHeader.breadcrumb.projects", "project", "프로젝트 브레드크럼", "프로젝트");
        createTranslationKeyIfNotExists("projectHeader.tabs.dashboard", "project", "대시보드 탭", "대시보드");
        createTranslationKeyIfNotExists("projectHeader.tabs.testCases", "project", "테스트케이스 탭", "테스트케이스");
        createTranslationKeyIfNotExists("projectHeader.tabs.testExecution", "project", "테스트실행 탭", "테스트실행");
        createTranslationKeyIfNotExists("projectHeader.tabs.testResults", "project", "테스트결과 탭", "테스트결과");
        createTranslationKeyIfNotExists("projectHeader.tabs.automation", "project", "자동화 테스트 탭", "자동화 테스트");
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
