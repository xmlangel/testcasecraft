// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/GoogleKeysInitializer.java
package com.testcase.testcasemanagement.config.i18n.keys;

import com.testcase.testcasemanagement.model.TranslationKey;
import com.testcase.testcasemanagement.repository.TranslationKeyRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class GoogleKeysInitializer {

  private final TranslationKeyRepository translationKeyRepository;

  public void initialize() {
    // Header & Menu
    createTranslationKeyIfNotExists(
        "header.userMenu.googleConfig", "header", "구글 시트 설정 메뉴", "Google Sheets 설정");

    // Config Page
    createTranslationKeyIfNotExists(
        "google.config.title", "google", "구글 시트 연동 관리 제목", "Google Sheets 연동 관리");
    createTranslationKeyIfNotExists("google.config.status", "google", "연동 상태 라벨", "연동 상태");
    createTranslationKeyIfNotExists("google.config.disconnect", "google", "연동 해제 버튼", "연동 해제");
    createTranslationKeyIfNotExists(
        "google.config.email", "google", "서비스 계정 이메일", "연결된 서비스 계정 (Email)");
    createTranslationKeyIfNotExists("google.config.projectId", "google", "프로젝트 ID", "프로젝트 ID");
    createTranslationKeyIfNotExists("google.config.lastUpdated", "google", "최종 업데이트", "최종 업데이트");
    createTranslationKeyIfNotExists("google.config.active", "google", "활성화 상태", "활성화됨");
    createTranslationKeyIfNotExists(
        "google.config.noConfig", "google", "설정 없음 메시지", "현재 등록된 구글 인증 정보가 없습니다.");
    createTranslationKeyIfNotExists("google.config.inputTitle", "google", "입력 영역 제목", "새 인증 정보 등록");
    createTranslationKeyIfNotExists(
        "google.config.inputDesc",
        "google",
        "입력 영역 설명",
        "Google Cloud Console에서 다운로드한 서비스 계정 키(JSON) 파일의 전체 내용을 아래에 붙여넣으세요.");
    createTranslationKeyIfNotExists(
        "google.config.placeholder", "google", "입력창 가이드", "{ \"type\": \"service_account\", ... }");
    createTranslationKeyIfNotExists("google.config.save", "google", "저장 버튼", "연동 설정 저장");
    createTranslationKeyIfNotExists("google.config.update", "google", "수정 버튼", "설정 업데이트");

    // Guide
    createTranslationKeyIfNotExists(
        "google.guide.title", "google", "연동 가이드 제목", "Google 서비스 계정 생성 및 설정 방법");
    createTranslationKeyIfNotExists(
        "google.guide.step1",
        "google",
        "가이드 1단계",
        "1. Google Cloud Console에서 프로젝트를 생성하고 'Google Sheets API'를 활성화합니다.");
    createTranslationKeyIfNotExists(
        "google.guide.step2", "google", "가이드 2단계", "2. '서비스 계정'을 생성하고 JSON 형식의 키를 발급받아 다운로드합니다.");
    createTranslationKeyIfNotExists(
        "google.guide.step3",
        "google",
        "가이드 3단계",
        "3. 다운로드한 JSON 파일의 내용을 복사하여 위의 입력란에 붙여넣고 저장합니다.");
    createTranslationKeyIfNotExists(
        "google.guide.step4", "google", "가이드 4단계", "4. (중요) 내보낼 대상 구글 시트 파일에서 '공유' 버튼을 클릭합니다.");
    createTranslationKeyIfNotExists(
        "google.guide.step5", "google", "가이드 5단계", "5. 서비스 계정의 이메일 주소를 '편집자' 권한으로 추가하여 저장합니다.");
  }

  private void createTranslationKeyIfNotExists(
      String keyName, String category, String description, String defaultValue) {
    Optional<TranslationKey> existingKey = translationKeyRepository.findByKeyName(keyName);
    if (existingKey.isEmpty()) {
      TranslationKey translationKey =
          new TranslationKey(keyName, category, description, defaultValue);
      translationKeyRepository.save(translationKey);
      log.debug("Google 번역 키 생성: {}", keyName);
    }
  }
}
