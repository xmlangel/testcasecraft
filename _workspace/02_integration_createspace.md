# Theme Integration Report: createspace

## 수정된 파일

- `src/main/frontend/src/context/ThemeContext.jsx`
  - 상단에 `import "../styles/design-systems/createspace.css";` 추가
  - 신규 함수 `createCreateSpaceTheme(mode)` 추가 (기존 `createMaterial3Theme` 패턴 그대로 따름, palette/typography/shape/spacing/shadows/components 인라인)
  - `useMemo` 분기 확장: `if (designSystem === "createspace") return createCreateSpaceTheme(mode);`
  - `useState(() => ...)` 초기값 함수에서 `new-users-only` 마이그레이션 적용 — `localStorage.getItem("designSystem")`가 `null`/`undefined`일 때만 `"createspace"` 반환, 그 외(`"glass"`, `"material3"` 등)는 그대로 보존
  - 기존 `createMaterial3Theme`, `createAppTheme` 함수는 **무수정**

- `src/main/frontend/src/styles/design-systems/createspace.css` (신규)
  - 모든 셀렉터를 `[data-design-system="createspace"]`로 스코프
  - 토큰 JSON의 `cssVariables`를 100% 반영 (color, surface, text, border, font, type scale, spacing, radius, shadow, glass, transition)
  - `body` font-family 글로벌 설정 (스코프 안에서)
  - h1~h6는 Poppins, code/pre/kbd/samp는 Fira Code로 자동 적용
  - `[data-design-system="createspace"][data-theme="dark"]` 셀렉터를 빈 블록으로 선언 — dark 스펙 누락이므로 light 토큰을 그대로 상속

- `src/main/frontend/index.html` (`<head>` 폰트 link 추가)
  - 기존 Bricolage Grotesque, JetBrains Mono link는 유지
  - 신규 link: `https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=DM+Sans:wght@400;500&family=Fira+Code:wght@400&display=swap`
  - 기존 `preconnect` 두 개(fonts.googleapis.com, fonts.gstatic.com)를 재사용 (중복 추가 회피)

## 적용된 마이그레이션 모드

- **모드:** `new-users-only`
- **로직:** `localStorage.getItem("designSystem")` 결과가 `null`/`undefined`일 때만 `"createspace"`를 반환. 기존 사용자의 `"glass"`, `"material3"` 선택은 보존.
- **영향 범위:**
  - 신규 사용자: 첫 진입 시 CreateSpace 디자인 시스템이 기본 적용됨.
  - 기존 사용자(이전에 디자인 시스템을 선택한 적이 있는 사용자): localStorage에 저장된 슬러그가 그대로 유지됨 — 무중단.
  - SSR/초기 로드 race 없음 (useState 초기화 함수는 동기 실행).

## Dark 모드 처리

- 토큰 JSON `missing: ["dark"]`로 명시됨.
- `createCreateSpaceTheme(mode)`는 `mode` 파라미터를 받지만 light 토큰만 사용 (palette.mode 동기화 외에는 dark 분기 없음).
- CSS도 `[data-theme="dark"]` 오버라이드가 빈 블록 — 모든 변수가 light 값을 상속.
- 추후 dark 스펙 확정 시 추가 작업 필요.

## 자체 검증 체크리스트

- [x] `createMaterial3Theme`, `createAppTheme` 코드 무변경 (회귀 방지)
- [x] CSS 모든 룰이 `[data-design-system="createspace"]` 스코프 — 다른 디자인 시스템 누수 없음
- [x] slug 일관성: ThemeContext 분기값/CSS 셀렉터/localStorage 값 모두 `"createspace"`
- [x] 괄호/세미콜론 균형 확인 (수동 검토)
- [x] 폰트 link는 preconnect 재사용 + stylesheet 추가 패턴
- [x] 기존 useMemo fallback(`createAppTheme` → glass) 그대로 보존

## 다음 단계용 메타데이터

- **slug:** `createspace`
- **displayName:** `CreateSpace`
- **description.ko:** 다채로운 색상과 글래스모피즘이 어우러진 크리에이티브 디자인
- **description.en:** Colorful, expressive design with glassmorphism panels
- **makeDefault:** `true`
- **migrationMode:** `new-users-only`

## 후속 에이전트 전달 사항

### → `profile-ui-extender`
- 프로필 화면 디자인 시스템 선택 옵션에 `createspace` 슬러그 추가 필요
- displayName/description은 위 메타데이터 사용
- `makeDefault: true`이므로 신규 사용자에게는 기본 선택 상태로 표시

### → `design-system-qa`
- 검증 대상 파일:
  1. `src/main/frontend/src/context/ThemeContext.jsx`
  2. `src/main/frontend/src/styles/design-systems/createspace.css`
  3. `src/main/frontend/index.html`
- ESLint 통과 여부, 빌드 성공 여부, CSS 스코프 누수 여부, 폰트 로드 여부, localStorage 마이그레이션 동작 검증 필요
- 기존 사용자 시나리오(`localStorage.designSystem === "glass"`)에서 디자인이 그대로 유지되는지 회귀 테스트 권장
