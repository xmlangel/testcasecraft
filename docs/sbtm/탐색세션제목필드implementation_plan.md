# 탐색 세션 제목(Title) 필드 추가 구현 계획

현재 탐색 세션은 차터의 제목을 자신의 제목으로 사용하고 있습니다. 세션마다 독립적인 제목을 가질 수 있도록 신규 필드를 추가하고 UI에 반영합니다.

## User Review Required

> [!IMPORTANT] > **필수값(Required) 적용**: `Title`, `Target Duration`, `Assigned Test Charter`가 필수값으로 설정됩니다. 백엔드 DTO 수준에서의 `@NotBlank`/`@NotNull` 검증과 프론트엔드 UI에서의 시각적 표시 및 저장 전 유효성 검사가 강화됩니다.

> [!IMPORTANT] > **데이터베이스 스키마 변경**: `test_sessions` 테이블에 `title` 컬럼이 추가됩니다. Hibernate의 `ddl-auto: update` 설정에 의해 자동으로 컬럼이 생성됩니다.

## Proposed Changes

### 백엔드 (Backend)

#### [MODIFY] [TestSession.java](file:///Users/dicky/kmdata/git/testcase/testcasecraft/src/main/java/com/testcase/testcasemanagement/model/TestSession.java)

- `title` 필드 추가 (length = 255)

#### [MODIFY] [TestSessionRequestDto.java](file:///Users/dicky/kmdata/git/testcase/testcasecraft/src/main/java/com/testcase/testcasemanagement/dto/TestSessionRequestDto.java)

- `title` 필드 추가 및 `@NotBlank(message = "Session title is required")` 유효성 검사 적용
- `netDurationMinutes`: `@NotNull` 및 `@Min(1)` 보장
- `charterId`: `@NotBlank` 보장

#### [MODIFY] [TestSessionResponseDto.java](file:///Users/dicky/kmdata/git/testcase/testcasecraft/src/main/java/com/testcase/testcasemanagement/dto/TestSessionResponseDto.java)

- `title` 필드 추가

#### [MODIFY] [TestSessionService.java](file:///Users/dicky/kmdata/git/testcase/testcasecraft/src/main/java/com/testcase/testcasemanagement/service/TestSessionService.java)

- `applyRequest` 및 `toDto` 메서드에서 `title` 필드 매핑 로직 추가

### 다국어 처리 (i18n)

#### [MODIFY] [ExploratorySessionKeysInitializer.java](file:///Users/dicky/kmdata/git/testcase/testcasecraft/src/main/java/com/testcase/testcasemanagement/config/i18n/keys/ExploratorySessionKeysInitializer.java)

- `exploratory.editor.field.title` 키 추가

#### [MODIFY] [Korean...Translations.java](file:///Users/dicky/kmdata/git/testcase/testcasecraft/src/main/java/com/testcase/testcasemanagement/config/i18n/translations/KoreanAdvancedFeaturesAndCommonUITranslations.java)

- 한국어 번역 "제목" 추가

#### [MODIFY] [English...Translations.java](file:///Users/dicky/kmdata/git/testcase/testcasecraft/src/main/java/com/testcase/testcasemanagement/config/i18n/translations/EnglishAdvancedFeaturesAndCommonUITranslations.java)

- 영어 번역 "Title" 추가

### 프론트엔드 (Frontend)

#### [MODIFY] [ExploratorySessionEditorTab.jsx](file:///Users/dicky/kmdata/git/testcase/testcasecraft/src/main/frontend/src/components/exploratory/ExploratorySessionEditorTab.jsx)

- 'Session Configuration' 섹션 최상단에 `Title` 입력 필드 추가
- `Title`, `Target Duration`, `Assigned Test Charter` 필드에 `required` 속성 및 `label`에 `*` 표시 추가
- 저장/제출 시 필수값 누락 여부 클라이언트 측 체크 로직 보강

## Open Questions

- 기존에 생성된 세션들의 경우, `title` 필드가 비어 있게 됩니다. 이들을 기존 `charterSnapshotTitle`로 일괄 업데이트하는 로직을 `DatabaseConstraintFixer`와 유사한 방식으로 추가할까요?

## Verification Plan

### Automated Tests

- `./gradlew test` 를 통해 DTO 유효성 검사 및 서비스 매핑 테스트 확인

### Manual Verification

- 브라우저에서 탐색 세션 편집기를 열고 `Title` 필드에 값을 입력 후 저장
- 목록 및 상세 보기에서 입력한 세션 제목이 올바르게 표시되는지 확인
