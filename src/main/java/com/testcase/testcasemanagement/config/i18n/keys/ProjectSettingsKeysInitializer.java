// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/ProjectSettingsKeysInitializer.java
package com.testcase.testcasemanagement.config.i18n.keys;

import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/** 프로젝트 설정(일반·멤버 역할) 화면 번역 키 초기화. */
@Slf4j
@Component
@RequiredArgsConstructor
public class ProjectSettingsKeysInitializer {

  private final TranslationKeyRepository translationKeyRepository;

  public void initialize() {
    // 화면 공통
    createKey("projectSettings.title", "프로젝트 설정 화면 제목", "프로젝트 설정");
    createKey("projectSettings.back", "뒤로 버튼", "프로젝트로 돌아가기");
    createKey("projectSettings.denied", "진입 권한 없음", "프로젝트 설정은 프로젝트 매니저·리드 개발자·시스템 관리자만 열 수 있습니다.");
    createKey("projectSettings.tab.general", "일반 탭", "일반");
    createKey("projectSettings.tab.members", "멤버 탭", "멤버");

    // 일반 탭
    createKey("projectSettings.general.code", "프로젝트 코드 라벨", "프로젝트 코드");
    createKey("projectSettings.general.codeHint", "코드 변경 불가 안내", "코드는 생성 후 변경할 수 없습니다.");
    createKey("projectSettings.general.name", "프로젝트 이름 라벨", "프로젝트 이름");
    createKey("projectSettings.general.description", "설명 라벨", "설명");
    createKey("projectSettings.general.displayOrder", "정렬 순서 라벨", "정렬 순서");
    createKey("projectSettings.general.save", "저장 버튼", "저장");
    createKey("projectSettings.general.saved", "저장 완료 안내", "프로젝트 설정을 저장했습니다.");
    createKey(
        "projectSettings.general.readonly", "설정 읽기 전용 안내", "프로젝트 정보 변경은 프로젝트 매니저와 시스템 관리자만 할 수 있습니다.");

    // 멤버 탭
    createKey("projectSettings.members.invite", "멤버 추가 영역 제목", "멤버 추가");
    createKey("projectSettings.members.username", "사용자명 입력 라벨", "사용자명");
    createKey("projectSettings.members.inviteSubmit", "멤버 추가 버튼", "추가");
    createKey("projectSettings.members.invited", "멤버 추가 완료", "멤버를 추가했습니다.");
    createKey("projectSettings.members.removed", "멤버 제거 완료", "멤버를 제거했습니다.");
    createKey("projectSettings.members.roleUpdated", "역할 변경 완료", "역할을 변경했습니다.");
    createKey("projectSettings.members.remove", "멤버 제거 버튼", "멤버 제거");
    createKey("projectSettings.members.removeConfirm", "멤버 제거 확인", "{username} 을(를) 이 프로젝트에서 제거하시겠습니까?");
    createKey("projectSettings.members.empty", "멤버 없음", "프로젝트 멤버가 없습니다.");
    createKey(
        "projectSettings.members.hint",
        "멤버 탭 안내",
        "역할을 바꾸면 곧바로 적용됩니다. 마지막 프로젝트 매니저는 역할을 바꾸거나 제거할 수 없습니다.");
    createKey("projectSettings.members.column.username", "사용자명 컬럼", "사용자명");
    createKey("projectSettings.members.column.name", "이름 컬럼", "이름");
    createKey("projectSettings.members.column.email", "이메일 컬럼", "이메일");
    createKey("projectSettings.members.column.role", "역할 컬럼", "역할");
    createKey("projectSettings.members.column.actions", "동작 컬럼", "동작");

    // 멤버 검색 (프로젝트 설정과 조직 관리가 같이 쓴다)
    createSharedKey("memberSearch.label", "사용자 검색 입력 라벨", "사용자 검색");
    createSharedKey("memberSearch.placeholder", "사용자 검색 안내", "사용자명·이름·이메일 2자 이상");
    createSharedKey("memberSearch.noOptions", "검색 결과 없음", "일치하는 사용자가 없습니다.");
    createSharedKey("memberSearch.hint", "검색 시작 안내", "두 글자 이상 입력하면 찾습니다.");
    createSharedKey("memberSearch.loading", "검색 중", "찾는 중...");

    // 프로젝트 역할 라벨
    createKey("projectSettings.role.projectManager", "역할 라벨 PROJECT_MANAGER", "프로젝트 매니저");
    createKey("projectSettings.role.leadDeveloper", "역할 라벨 LEAD_DEVELOPER", "리드 개발자");
    createKey("projectSettings.role.developer", "역할 라벨 DEVELOPER", "개발자");
    createKey("projectSettings.role.tester", "역할 라벨 TESTER", "테스터");
    createKey("projectSettings.role.contributor", "역할 라벨 CONTRIBUTOR", "기여자");
    createKey("projectSettings.role.viewer", "역할 라벨 VIEWER", "뷰어");
  }

  /** 프로젝트 설정 밖(조직 관리)에서도 쓰는 키. 분류를 따로 둬 어느 화면 것인지 헷갈리지 않게 한다. */
  private void createSharedKey(String keyName, String description, String defaultValue) {
    Optional<TranslationKey> existingKey = translationKeyRepository.findByKeyName(keyName);
    if (existingKey.isEmpty()) {
      translationKeyRepository.save(
          new TranslationKey(keyName, "memberSearch", description, defaultValue));
    }
  }

  private void createKey(String keyName, String description, String defaultValue) {
    Optional<TranslationKey> existingKey = translationKeyRepository.findByKeyName(keyName);
    if (existingKey.isEmpty()) {
      translationKeyRepository.save(
          new TranslationKey(keyName, "projectSettings", description, defaultValue));
      log.debug("번역 키 생성: {}", keyName);
    }
  }
}
