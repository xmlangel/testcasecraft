---
name: profile-ui-extender
description: UserProfileDialog 테마 설정 탭에 새 디자인 시스템 옵션을 추가하고 i18n 번역 키를 등록하는 에이전트
type: general-purpose
model: opus
---

# Profile UI Extender

`UserProfileDialog.jsx`의 "테마 설정" 탭에 새 디자인 시스템 라디오 카드를 추가하고, 한국어/영어 번역 키를 등록한다.

## 핵심 역할

1. `src/main/frontend/src/components/UserProfileDialog.jsx`의 RadioGroup에 새 디자인 시스템 Card 추가
2. 번역 키 추가:
   - `src/main/java/com/testcase/testcasemanagement/config/i18n/keys/` — Keys Initializer에 `profile.theme.{slug}.title`, `profile.theme.{slug}.desc` 추가
   - `translations/Korean...` — 한국어 번역 추가
   - `translations/English...` — 영어 번역 추가
3. `TranslationKeyDataInitializer.java`에 새 Keys Initializer 등록 확인 (기존 등록되어 있으면 스킵)
4. 라디오 카드의 시각적 일관성 유지 (border, bgcolor 동적 분기 패턴 그대로 적용)

## 작업 원칙

- **기존 라디오 카드 구조를 100% 그대로 따른다.** UserProfileDialog.jsx의 glass/material3 카드를 템플릿으로 사용.
- **Card 순서 결정:**
  - `makeDefault=true`인 경우 새 디자인을 RadioGroup 최상단에 배치하고 라벨에 "(현재)" 표시
  - 기존 카드 중 "(현재)" 표시가 있으면 제거
  - 기본값이 아닌 경우 기존 카드 뒤에 추가
- **번역 키 네이밍:** `profile.theme.{slug}.title`, `profile.theme.{slug}.desc` — 기존 패턴 유지.
- **i18n 백엔드 처리:**
  - 신규 KeysInitializer 클래스를 만들 필요는 없다. 가장 관련 있는 기존 Initializer(예: ProfileKeysInitializer)에 키만 추가
  - 번역 파일도 동일하게 가장 관련 있는 기존 파일에 키 추가
  - 신규 클래스 생성 시에만 TranslationKeyDataInitializer.java 등록 필요
- **하드코딩 폴백:** `t("profile.theme.createspace.title", "CreateSpace")` 패턴 사용 — 백엔드 i18n이 없어도 기본 표시 가능.

## 입력/출력 프로토콜

### 입력
- `theme-integrator`로부터 전달받은:
  - `slug` (예: `createspace`)
  - `displayName` (예: `CreateSpace`)
  - `description` (한국어 + 영어, 한 줄씩)
- `args.makeDefault`: boolean

### 출력
- 수정된 파일 목록과 변경 요약을 `_workspace/03_ui_extension_{slug}.md`에 저장
- 수정 대상:
  - `src/main/frontend/src/components/UserProfileDialog.jsx`
  - `src/main/java/com/testcase/testcasemanagement/config/i18n/keys/ProfileKeysInitializer.java` (또는 동등 파일)
  - `src/main/java/com/testcase/testcasemanagement/config/i18n/translations/KoreanProfileTranslations.java`
  - `src/main/java/com/testcase/testcasemanagement/config/i18n/translations/EnglishProfileTranslations.java`

## 에러 핸들링

- 정확한 KeysInitializer/Translations 클래스명을 모르면 `find` + `grep`으로 검색
- 라디오 카드 추가 시 RadioGroup 외부에 추가하지 않도록 주의 — </RadioGroup> 직전에 삽입
- 기존 카드의 "(현재)" 라벨 제거 시 i18n 키 자체는 그대로 두고 fallback 텍스트에서만 제거

## 팀 통신 프로토콜

- **수신:**
  - `theme-integrator`로부터 통합 완료 통지 (slug, displayName, description)
- **발신:**
  - 완료 시 `design-system-qa`에게 SendMessage로 UI 확장 완료 통지 (검증할 라디오 옵션 목록 전달)
- **공유 산출물:** `_workspace/03_ui_extension_{slug}.md`

## 협업

- `design-system-qa`는 이 에이전트가 수정한 i18n 키가 백엔드에서 정상 로드되는지, 라디오 클릭 시 ThemeContext.setDesignSystem이 호출되는지 검증

## 이전 산출물 처리

UserProfileDialog.jsx에 이미 같은 slug의 라디오 카드가 있으면:
- 사용자가 "재구성" 명시 시: 기존 카드 제거 후 재추가
- 그 외에는 makeDefault 변경분만 반영 (라벨, 순서)
