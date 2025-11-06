// src/main/java/com/testcase/testcasemanagement/config/i18n/keys/AttachmentKeysInitializer.java
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
public class AttachmentKeysInitializer {

    private final TranslationKeyRepository translationKeyRepository;

    public void initialize() {
        // 성공 메시지
        createTranslationKeyIfNotExists(
            "attachment.success.upload",
            "attachment",
            "파일 업로드 성공 메시지",
            "파일이 성공적으로 업로드되었습니다."
        );

        createTranslationKeyIfNotExists(
            "attachment.success.delete",
            "attachment",
            "파일 삭제 성공 메시지",
            "첨부파일이 성공적으로 삭제되었습니다."
        );

        // 에러 메시지 - 인증
        createTranslationKeyIfNotExists(
            "attachment.error.auth.failed",
            "attachment",
            "사용자 인증 실패 메시지",
            "사용자 인증에 실패했습니다."
        );

        // 에러 메시지 - 업로드
        createTranslationKeyIfNotExists(
            "attachment.error.upload.validation",
            "attachment",
            "파일 검증 실패 메시지",
            "파일 검증에 실패했습니다."
        );

        createTranslationKeyIfNotExists(
            "attachment.error.upload.io",
            "attachment",
            "파일 저장 IO 오류 메시지",
            "파일 저장 중 오류가 발생했습니다."
        );

        createTranslationKeyIfNotExists(
            "attachment.error.upload.general",
            "attachment",
            "파일 업로드 일반 오류 메시지",
            "서버 오류가 발생했습니다."
        );

        // 에러 메시지 - 조회
        createTranslationKeyIfNotExists(
            "attachment.error.list.failed",
            "attachment",
            "첨부파일 목록 조회 실패 메시지",
            "첨부파일 목록을 조회하는 중 오류가 발생했습니다."
        );

        createTranslationKeyIfNotExists(
            "attachment.error.notfound",
            "attachment",
            "첨부파일을 찾을 수 없음 메시지",
            "첨부파일을 찾을 수 없습니다."
        );

        createTranslationKeyIfNotExists(
            "attachment.error.info.failed",
            "attachment",
            "첨부파일 정보 조회 실패 메시지",
            "첨부파일 정보를 조회하는 중 오류가 발생했습니다."
        );

        // 에러 메시지 - 다운로드
        createTranslationKeyIfNotExists(
            "attachment.error.download.notfound",
            "attachment",
            "다운로드 파일을 찾을 수 없음 메시지",
            "파일을 찾을 수 없습니다."
        );

        createTranslationKeyIfNotExists(
            "attachment.error.download.io",
            "attachment",
            "파일 다운로드 IO 오류 메시지",
            "파일 다운로드 중 오류가 발생했습니다."
        );

        createTranslationKeyIfNotExists(
            "attachment.error.download.general",
            "attachment",
            "파일 다운로드 일반 오류 메시지",
            "파일 다운로드 중 예상치 못한 오류가 발생했습니다."
        );

        // 에러 메시지 - 삭제
        createTranslationKeyIfNotExists(
            "attachment.error.delete.failed",
            "attachment",
            "첨부파일 삭제 실패 메시지",
            "첨부파일을 삭제하는 중 오류가 발생했습니다."
        );

        // 에러 메시지 - 스토리지 정보
        createTranslationKeyIfNotExists(
            "attachment.error.storage.failed",
            "attachment",
            "스토리지 정보 조회 실패 메시지",
            "스토리지 정보를 조회하는 중 오류가 발생했습니다."
        );

        log.info("AttachmentKeysInitializer: 초기화 완료");
    }

    private void createTranslationKeyIfNotExists(String keyName, String category, String description, String defaultValue) {
        Optional<TranslationKey> existingKey = translationKeyRepository.findByKeyName(keyName);
        if (existingKey.isEmpty()) {
            TranslationKey translationKey = new TranslationKey(keyName, category, description, defaultValue);
            translationKeyRepository.save(translationKey);
            log.debug("Created translation key: {}", keyName);
        }
    }
}
