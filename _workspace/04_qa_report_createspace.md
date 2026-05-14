# QA Report: createspace

검증 일자: 2026-05-14
검증 대상 slug: `createspace`
사용자 정책: `makeDefault=true`, `migrationMode=new-users-only`

---

## ✅ Pass

### 1. slug 일관성 (frontend + backend)
- **ThemeContext.jsx**: `createspace` 4회 일치
  - L14: `import "../styles/design-systems/createspace.css";`
  - L1019: `useState` 초기값 `return "createspace";`
  - L1042-L1043: `useMemo` 분기 `if (designSystem === "createspace") return createCreateSpaceTheme(mode);`
- **UserProfileDialog.jsx**: `createspace` 6회 일치
  - L777, L781: `designSystem === "createspace"` 비교 (borderColor, bgcolor)
  - L786: `onClick={() => setDesignSystem("createspace")}`
  - L790: `<FormControlLabel value="createspace" ... />`
  - L799: `t("profile.theme.createspace.title", ...)`
  - L808: `t("profile.theme.createspace.desc", ...)`
- **createspace.css**: 모든 셀렉터가 `[data-design-system="createspace"]` 스코프 (13개 셀렉터 블록 전부 매칭, 비스코프 셀렉터 0개)
- **localStorage 키**: `"designSystem"` (slug-불변, 정상)

### 2. i18n 키 4-way 매칭 (모두 동일 키 세트)
| 키 | Frontend (UserProfileDialog) | Backend Keys | Korean | English |
|----|------------------------------|--------------|--------|---------|
| `profile.theme.createspace.title` | L799 호출 | L373 등록 (`CreateSpace`) | L338 (`CreateSpace`) | L562 (`CreateSpace`) |
| `profile.theme.createspace.desc` | L808 호출 | L375 등록 (한글 설명) | L340 (한글 설명) | L564 (영문 설명) |

4곳 모두 동일 키 2개 등록 확인.

### 3. ThemeContext 분기 완전성 (new-users-only 정책 준수)
- L545: `createCreateSpaceTheme(mode)` 함수 정의 존재 (`mode` 파라미터 수신 → `palette.mode: mode`로 동기화)
- L1042-1043: `useMemo` 분기에 createspace 케이스 추가됨 (material3 다음, fallback(`createAppTheme`) 앞)
- L1013-1022: `useState` 초기값 함수가 **`localStorage.getItem("designSystem")`이 `null`/`undefined`일 때만 `"createspace"` 반환** → new-users-only 정책에 정확히 부합
  - 기존 사용자가 `"glass"` 또는 `"material3"`을 저장해 둔 경우 → 그대로 보존
  - 신규 사용자(첫 진입) → `createspace` 기본 적용
- light/dark: 토큰 JSON `missing: ["dark"]` 명시 — `createCreateSpaceTheme(mode)`는 `palette.mode: mode`만 동기화하고 light 토큰 그대로 사용 (의도된 fallback)

### 4. CSS 스코프 정확성 (누수 0건)
- 모든 셀렉터 13개가 `[data-design-system="createspace"]` 프리픽스 시작
- `:root` 단독 셀렉터 없음 (변수 누수 없음)
- `body`, `html`, `h1-h6`, `code/pre/kbd/samp` 모두 `[data-design-system="createspace"] xxx` 형태
- `[data-design-system="createspace"][data-theme="dark"]` 빈 블록(L88-90) — dark 누락 시 light 상속 명시적 의도

### 5. 회귀 검증 (기존 디자인 시스템 무영향)
- `createMaterial3Theme` (L82) 함수 시그니처/본문 변경 없음
- `createAppTheme` (L166) 함수 시그니처/본문 변경 없음
- `useMemo` fallback이 여전히 `createAppTheme(mode)` (glass) (L1045)
- UserProfileDialog의 기존 Card 2개(Modern Glass, Material 3) 그대로 존재
  - glass Card (L819-862): `value="glass"`, `setDesignSystem("glass")`, `profile.theme.glass.title|desc` 호출
  - material3 Card (L864-908): `value="material3"`, `setDesignSystem("material3")`, `profile.theme.m3.title|desc` 호출
- 기존 glass Card의 "(현재)" 라벨 fallback 제거 확인 (`profile.theme.glass.title` → fallback `"Modern Glass"`로 정상화)
- RadioGroup 카드 순서: createspace → glass → material3 (createspace가 top, makeDefault=true에 부합)

### 6. 폰트 로드
- `index.html` L21-22: `preconnect` 재사용 (중복 추가 없음)
- L28-30: CreateSpace 폰트 link 추가 (Poppins + DM Sans + Fira Code, 단일 stylesheet)
- 기존 Bricolage Grotesque + JetBrains Mono link (L24) 그대로 보존

---

## ⚠️ Auto-fixed

(없음 — 자동 수정이 필요한 누락/불일치 없음)

---

## ❌ Issues (수동 조치 필요)

(없음 — 본 작업 범위 내 차단 이슈 없음)

### 참고 사항 (본 작업 범위 외 — 기존 코드의 상태)

다음은 이번 createspace 추가와 무관한 **기존 코드의 사전 상태**이므로 본 QA의 차단/회귀 항목은 아니지만, 일관성 차원에서 기록합니다.

- `profile.theme.glass.title`, `profile.theme.glass.desc`, `profile.theme.m3.title`, `profile.theme.m3.desc`, `profile.theme.title`, `profile.theme.description`, `profile.theme.systemLabel`, `profile.theme.mode.title`, `profile.theme.mode.desc` 등 기존 i18n 키들이 백엔드(KeysInitializer/Translations)에 **등록되어 있지 않음**.
  - 영향: UI는 `t()` 호출의 두 번째 인자(fallback 텍스트)로 정상 표시되므로 사용자가 체감할 수 있는 결함은 없음.
  - createspace 추가와 무관하게 사전부터 동일한 상태로 보임 (회귀 아님).
  - 결정 사항: 본 QA에서는 다루지 않음. 추후 i18n 풀-감사 작업이 필요하면 별도 이슈로 분리 권장.

---

## 📋 사용자 검증 명령

빌드/실행 명령은 AGENTS.md 1.1 정책에 따라 보고서에만 기재합니다. 사용자가 직접 실행해 주십시오.

1. **린트 검증**
   ```bash
   cd src/main/frontend && npm run lint
   ```
2. **빌드 검증**
   ```bash
   cd src/main/frontend && npm run build
   ```
3. **앱 실행 후 수동 시나리오 검증**
   ```bash
   ./gradlew bootRun
   ```
   - **시나리오 A (신규 사용자)**: 시크릿 브라우저 창으로 진입 → 첫 화면에서 `data-design-system="createspace"`가 `<html>`에 적용되었는지 DevTools로 확인 → 프로필 → 테마 설정 진입 시 CreateSpace 카드가 최상단에 선택 상태로 표시되는지 확인.
   - **시나리오 B (기존 glass 사용자)**: 일반 브라우저에서 `localStorage.setItem("designSystem", "glass")` 후 새로고침 → glass 디자인이 그대로 유지되는지 확인 (new-users-only 정책 검증).
   - **시나리오 C (기존 material3 사용자)**: `localStorage.setItem("designSystem", "material3")` 후 새로고침 → material3 디자인 유지 확인.
   - **시나리오 D (라이브 전환)**: 프로필 → 테마 설정에서 라디오 클릭(createspace ↔ glass ↔ material3) → 즉시 반영 + localStorage 갱신 확인.
   - **시나리오 E (i18n)**: 언어 전환(한국어 ↔ English) 시 CreateSpace Card 라벨/설명이 백엔드 번역으로 표시되는지(fallback이 아닌) 확인.
4. **(선택) 백엔드 번역 API 확인**
   ```bash
   curl -s 'http://localhost:8080/api/translations?lang=ko' | grep -i 'profile.theme.createspace'
   curl -s 'http://localhost:8080/api/translations?lang=en' | grep -i 'profile.theme.createspace'
   ```
   각 응답에 `profile.theme.createspace.title`과 `profile.theme.createspace.desc` 두 키가 포함되어야 함.

---

## 요약

- ✅ Pass: 6개 영역 모두 통과 (slug 일관성, i18n 4-way 매칭, ThemeContext 분기, CSS 스코프, 회귀, 폰트 로드)
- ⚠️ Auto-fixed: 0건
- ❌ Issues: 0건 (본 작업 범위 내)
- 📋 사용자 검증: 린트/빌드/수동 시나리오 5개

createspace 디자인 시스템 통합이 정합성 측면에서 깨끗하게 완료되었습니다. 빌드 검증과 수동 시나리오 검증은 위 명령어로 사용자가 직접 실행해 주십시오.
