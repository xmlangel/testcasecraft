// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/TestPlanKeysInitializer.java
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
public class TestPlanKeysInitializer {

    private final TranslationKeyRepository translationKeyRepository;

    public void initialize() {
        // 테스트 플랜 관련 번역
        createTranslationKeyIfNotExists("testPlan.form.title.create", "testPlan", "새 테스트 플랜 생성", "새 테스트 플랜 생성");
        createTranslationKeyIfNotExists("testPlan.form.title.edit", "testPlan", "테스트 플랜 수정", "테스트 플랜 수정");
        createTranslationKeyIfNotExists("testPlan.form.planName", "testPlan", "플랜 이름", "플랜 이름");
        createTranslationKeyIfNotExists("testPlan.form.description", "testPlan", "설명", "설명");
        createTranslationKeyIfNotExists("testPlan.form.testcaseSelection", "testPlan", "테스트케이스 선택", "테스트케이스 선택");
        createTranslationKeyIfNotExists("testPlan.form.selectedCount", "testPlan", "{count}개 선택됨", "{count}개 선택됨");
        createTranslationKeyIfNotExists("testPlan.form.projectSelectFirst", "testPlan", "프로젝트를 먼저 선택해주세요",
                "프로젝트를 먼저 선택해주세요");
        createTranslationKeyIfNotExists("testPlan.form.button.cancel", "testPlan", "취소", "취소");
        createTranslationKeyIfNotExists("testPlan.form.button.save", "testPlan", "저장", "저장");
        createTranslationKeyIfNotExists("testPlan.form.button.processing", "testPlan", "처리 중...", "처리 중...");

        // 테스트 플랜 폼 검증 메시지
        createTranslationKeyIfNotExists("testPlan.validation.nameRequired", "testPlan", "테스트 플랜 이름은 필수 입력 항목입니다",
                "테스트 플랜 이름은 필수 입력 항목입니다");
        createTranslationKeyIfNotExists("testPlan.validation.testcaseRequired", "testPlan",
                "최소 한 개 이상의 테스트케이스를 선택해야 합니다", "최소 한 개 이상의 테스트케이스를 선택해야 합니다");
        createTranslationKeyIfNotExists("testPlan.error.saveFailed", "testPlan", "저장 처리 중 오류가 발생했습니다: ",
                "저장 처리 중 오류가 발생했습니다: ");

        // 테스트 플랜 목록
        createTranslationKeyIfNotExists("testPlan.list.add", "testPlan", "테스트 플랜 추가", "테스트 플랜 추가");
        createTranslationKeyIfNotExists("testPlan.list.table.id", "testPlan", "ID", "ID");
        createTranslationKeyIfNotExists("testPlan.list.table.name", "testPlan", "이름", "이름");
        createTranslationKeyIfNotExists("testPlan.list.table.description", "testPlan", "설명", "설명");
        createTranslationKeyIfNotExists("testPlan.list.table.testcaseCount", "testPlan", "테스트케이스 수", "테스트케이스 수");
        createTranslationKeyIfNotExists("testPlan.list.table.createdAt", "testPlan", "생성일", "생성일");
        createTranslationKeyIfNotExists("testPlan.list.table.execute", "testPlan", "실행", "실행");
        createTranslationKeyIfNotExists("testPlan.list.table.edit", "testPlan", "수정", "수정");
        createTranslationKeyIfNotExists("testPlan.list.table.delete", "testPlan", "삭제", "삭제");
        createTranslationKeyIfNotExists("testPlan.list.empty.message", "testPlan", "등록된 테스트 플랜이 없습니다.",
                "등록된 테스트 플랜이 없습니다.");

        // 테스트 실행 다이얼로그
        createTranslationKeyIfNotExists("testPlan.execution.dialog.title", "testPlan", "테스트 실행 - {planName}",
                "테스트 실행 - {planName}");
        createTranslationKeyIfNotExists("testPlan.execution.button.newExecution", "testPlan", "새 실행 생성", "새 실행 생성");
        createTranslationKeyIfNotExists("testPlan.execution.empty.message", "testPlan", "이 테스트 플랜의 실행 이력이 없습니다.",
                "이 테스트 플랜의 실행 이력이 없습니다.");
        createTranslationKeyIfNotExists("testPlan.execution.progress", "testPlan", "진행률:", "진행률:");
        createTranslationKeyIfNotExists("testPlan.execution.action.edit", "testPlan", "편집", "편집");
        createTranslationKeyIfNotExists("testPlan.execution.action.view", "testPlan", "전체화면 보기", "전체화면 보기");
        createTranslationKeyIfNotExists("testPlan.execution.dialog.close", "testPlan", "닫기", "닫기");

        // 테스트 플랜 삭제 다이얼로그
        createTranslationKeyIfNotExists("testPlan.delete.dialog.title", "testPlan", "테스트 플랜 삭제", "테스트 플랜 삭제");
        createTranslationKeyIfNotExists("testPlan.delete.dialog.message", "testPlan",
                "정말로 이 테스트 플랜을 삭제하시겠습니까? 삭제 시 복구할 수 없습니다.", "정말로 이 테스트 플랜을 삭제하시겠습니까? 삭제 시 복구할 수 없습니다.");
        createTranslationKeyIfNotExists("testPlan.delete.button.cancel", "testPlan", "취소", "취소");
        createTranslationKeyIfNotExists("testPlan.delete.button.delete", "testPlan", "삭제", "삭제");

        // 테스트 플랜 선택기
        createTranslationKeyIfNotExists("testPlan.selector.label", "testPlan", "테스트 플랜 선택", "테스트 플랜 선택");
        createTranslationKeyIfNotExists("testPlan.selector.all", "testPlan", "전체", "전체");
        createTranslationKeyIfNotExists("testPlan.selector.caseCount", "testPlan", "{count}개 케이스", "{count}개 케이스");
        createTranslationKeyIfNotExists("testPlan.selector.selected", "testPlan", "선택된 플랜: {planName}",
                "선택된 플랜: {planName}");
        createTranslationKeyIfNotExists("testPlan.selector.testcaseCount", "testPlan", "({count}개 테스트케이스)",
                "({count}개 테스트케이스)");

        // 실행 상태
        createTranslationKeyIfNotExists("testPlan.status.notStarted", "testPlan", "Not Started", "Not Started");
        createTranslationKeyIfNotExists("testPlan.status.inProgress", "testPlan", "In Progress", "In Progress");
        createTranslationKeyIfNotExists("testPlan.status.completed", "testPlan", "Completed", "Completed");

        // 탭 라벨
        createTranslationKeyIfNotExists("testPlan.tab.label", "testPlan", "테스트플랜", "테스트플랜");

        // 자동화 테스트 연동
        createTranslationKeyIfNotExists("testPlan.list.table.automationCount", "testPlan", "자동화 테스트 컬럼", "자동화 테스트");
        createTranslationKeyIfNotExists("testPlan.list.table.linkAutomated", "testPlan", "자동화 테스트 연결 버튼", "자동화 테스트 연결");
        createTranslationKeyIfNotExists("testPlan.execution.automated.title", "testPlan", "연결된 자동화 테스트 제목",
                "연결된 자동화 테스트");
        createTranslationKeyIfNotExists("testPlan.execution.automated.empty", "testPlan", "연결된 자동화 테스트 없음 메시지",
                "연결된 자동화 테스트가 없습니다.");
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
