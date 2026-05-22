---
name: backend-spring-boot
description: "Use when developing Spring Boot 3.4 APIs, JPA models, services, controllers, or managing the i18n translation system in the testcasecraft backend."
---

# Spring Boot 백엔드 개발 표준 스킬

`testcasecraft`의 백엔드 개발 시 이 스킬 가이드를 따르십시오.

## 1. 코딩 가이드라인 준수

모든 백엔드 코드는 프로젝트 루트에 있는 `docs/code-guide-line/JAVA_CODING_GUIDELINES.md`와 `docs/code-guide-line/API_GUIDE.md`를 엄격하게 준수해야 합니다.

- **Controller**: 단순 라우팅과 DTO 매핑만 수행.
- **Service**: 트랜잭션 관리와 핵심 비즈니스 로직 처리.

## 2. i18n (번역 시스템) 적용 의무화

새로운 비즈니스 로직 에러 응답이나 다국어 지원 텍스트가 백엔드에서 반환될 경우:

1. `src/main/java/com/testcase/testcasemanagement/config/i18n/keys/` 하위의 적절한 `KeysInitializer` 클래스에 키(String)를 추가합니다.
2. `src/main/java/com/testcase/testcasemanagement/config/i18n/translations/` 하위의 한국어(Korean) 및 영어(English) `Translations` 파일에 해당 키의 번역값을 반드시 맵핑하여 등록합니다.
3. 등록을 누락하면 런타임 다국어 처리 에러가 발생할 수 있습니다.

## 3. 코드 스타일 및 포맷

수정 후에는 가급적 제공된 `google-java-format.jar`를 따르거나 일관된 Indent를 유지하여 코드 품질을 보호합니다. (주석 및 기존 docstring 보존)
