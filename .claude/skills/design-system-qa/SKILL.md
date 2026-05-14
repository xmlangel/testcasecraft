---
name: design-system-qa
description: 디자인 시스템 추가 작업의 경계면 정합성을 검증한다. ThemeContext/UserProfileDialog/i18n/CSS의 slug 일관성, 키 매칭, 기본값 마이그레이션 정확성, CSS 스코프, 회귀 여부를 교차 비교로 확인하고 자동 수정 가능한 항목은 직접 수정.
---

# Design System QA

디자인 시스템 추가 작업의 **경계면 버그**를 잡는다. 단일 파일 문법 검사가 아니라, 여러 파일이 만나는 지점에서의 불일치를 검증.

## 워크플로우

### 1. slug 일관성 검증

다음 위치에서 `{slug}` 문자열을 grep하여 일관된지 확인:

```bash
grep -r "{slug}" src/main/frontend/src
grep -r "{slug}" src/main/java/com/testcase/testcasemanagement/config/i18n
```

매칭이 있어야 하는 위치:
- `ThemeContext.jsx`: `useMemo` 분기, `createXxxTheme` 함수명 (PascalCase), `useState` 기본값 분기, `localStorage` 키는 그대로
- `UserProfileDialog.jsx`: Card `onClick`, `FormControlLabel value`, 비교 표현식 (`designSystem === "{slug}"`), i18n 키 (`profile.theme.{slug}.*`)
- `styles/design-systems/{slug}.css`: `[data-design-system="{slug}"]` 셀렉터, 파일명
- 백엔드 i18n: `profile.theme.{slug}.title`, `profile.theme.{slug}.desc`

매칭 횟수가 부족한 위치를 보고하고 자동 수정 가능하면 Edit.

### 2. i18n 키 4-way 매칭

UserProfileDialog의 `t()` 호출 → 백엔드 등록 여부 확인:

```bash
# Frontend에서 사용된 키
grep -oE 't\("profile\.theme\.{slug}\.[a-z]+"' src/main/frontend/src/components/UserProfileDialog.jsx

# Backend KeysInitializer에 등록된 키
grep -r "profile.theme.{slug}" src/main/java/.../keys/

# Korean translations
grep -r "profile.theme.{slug}" src/main/java/.../translations/Korean*

# English translations
grep -r "profile.theme.{slug}" src/main/java/.../translations/English*
```

4곳 모두 같은 키 세트가 나와야 함. 누락 시 자동 추가.

### 3. ThemeContext 분기 완전성

`ThemeContext.jsx`를 읽어 다음 확인:
- `create{PascalSlug}Theme(mode)` 함수가 존재
- `useMemo` 내부 if 분기에 `designSystem === "{slug}"` 케이스 존재
- `useState` 초기값 함수가 `migrationMode`에 맞게 작성됨
- **light/dark 토큰이 객체로 완전 분리되어 있음** — `XxxTokens = { light: {...}, dark: {...} }` 패턴 (Material3 / ModernGlass의 패턴 차용). `mode === "dark"`일 때 실제로 다른 색상이 나오는지 확인. **하드코딩 색상(#XXXXXX, rgba(...))이 components 블록에 나타나면 FAIL**.
- **기본값 또는 향후 기본값이 될 시스템은 다크 토큰 누락 시 FAIL** (단순 fallback 허용 X — 사용자가 다크 토글했을 때 라이트와 동일하게 보이면 UX 결함)

#### 자동 검증 스크립트

```bash
# components 블록에서 하드코딩 색상이 나오면 (토큰 미사용 의심)
awk "/create${PascalSlug}Theme.*=.*\(mode\)/,/^};/" src/main/frontend/src/context/ThemeContext.jsx | \
  grep -nE '#[0-9A-Fa-f]{6}|rgba\([0-9]+,'
# 출력이 비어있어야 통과 (토큰 객체 정의는 변수 선언이므로 grep 범위 밖)
```

### 4. CSS 스코프 검증

`styles/design-systems/{slug}.css`를 읽어:
- 모든 셀렉터가 `[data-design-system="{slug}"]`로 시작하거나 그 하위
- `:root` 단독 셀렉터 없음 (있으면 누수)
- `body`, `html` 단독 셀렉터 없음
- `@import`로 폰트만 로드 (다른 글로벌 규칙 X)
- **`[data-design-system="{slug}"][data-theme="dark"]` 블록이 실제 토큰을 오버라이드** — 빈 블록("intentionally empty") 또는 주석만 있는 경우 FAIL

위반 시 자동 수정으로 셀렉터 prefix 추가.

### 5. 레이아웃 안전성 검증 (CRITICAL)

`ThemeContext.jsx`의 새 `create{PascalSlug}Theme` 함수 body 내부에서 다음 위험 패턴을 검출:

```bash
# 위험 패턴 1: MuiCard에 padding (CardContent와 누적되어 컨텐츠 밀림)
grep -A 20 "MuiCard:" ThemeContext.jsx | grep -E "padding:\s*[0-9]"

# 위험 패턴 2: MuiCard hover transform (전역 호버 확대)
grep -A 20 "MuiCard:" ThemeContext.jsx | grep -E "transform:\s*\"scale"

# 위험 패턴 3: MuiOutlinedInput height 고정 (multiline 잘림)
grep -A 10 "MuiOutlinedInput:" ThemeContext.jsx | grep -E "^\s*height:\s*[0-9]"

# 위험 패턴 4: MuiListItem height 고정 (멀티라인 잘림)
grep -A 10 "MuiListItem:" ThemeContext.jsx | grep -E "^\s*height:\s*[0-9]"

# 위험 패턴 5: Checkbox/Radio root에 width/height (클릭 영역 축소)
grep -A 10 -E "MuiCheckbox:|MuiRadio:" ThemeContext.jsx | grep -E "^\s*(width|height):\s*[0-9]"

# 위험 패턴 6: paper와 default가 다크에서 동일 (Dialog/Menu invisible)
# 토큰에서 background와 surface가 다른 색인지 시각적 확인

# 위험 패턴 7: MuiButton.outlined/text 에 color 직접 지정 (color="inherit" 동작 깨짐)
# AppBar 안의 <Button color="inherit"> 가 primary 색으로 렌더되어 invisible
# → color 는 outlinedPrimary/textPrimary 슬롯으로 옮겨야 함
awk '/MuiButton:/,/^      },$/' ThemeContext.jsx | \
  grep -E "^\s*(outlined|text):\s*\{" -A 5 | grep -E "^\s*color:"
```

위 grep이 하나라도 매칭되면 보고서에 ⚠️ 또는 ❌ 로 기록.

**자동 수정 가능:**
- `MuiCard.padding: N` → 제거하고 `MuiCardContent.root.padding: N` 추가
- `MuiCard` hover transform 제거
- `height` → `minHeight` 치환 (OutlinedInput, ListItem)
- `MuiCheckbox/Radio.root.width/height` → `& .MuiSvgIcon-root { fontSize }`로 변환
- `MuiButton.outlined.color` / `MuiButton.text.color` → `outlinedPrimary` / `textPrimary` 슬롯으로 이동 (`color="inherit"` 보존)

### 6. 회귀 검증

기존 디자인 시스템(`glass`, `material3`)이 영향받지 않았는지:
- `createMaterial3Theme`, `createAppTheme` 함수가 그대로 (signature, 본문)
- UserProfileDialog의 기존 Card(glass, material3) 두 개가 여전히 존재
- `useMemo` 분기에서 fallback이 `createAppTheme(mode)` (glass)인지

### 7. 보고서 작성

`_workspace/04_qa_report_{slug}.md`:
```markdown
# QA Report: {slug}

## ✅ Pass
- slug 일관성 (검색 위치 N개 모두 매칭)
- i18n 4-way 매칭
- ThemeContext useMemo 분기 추가됨
- CSS 스코프 정확
- 기존 디자인 시스템 회귀 없음

## ⚠️ Auto-fixed
- (자동 수정한 항목 있으면 기록)

## ❌ Issues (수동 조치 필요)
- (있으면 항목별 기록)

## 📋 사용자 검증 명령
1. `cd src/main/frontend && npm run lint`
2. `cd src/main/frontend && npm run build`
3. `./gradlew bootRun` 후 프로파일 → 테마 설정 확인
4. 시크릿 창으로 진입 → 기본값 적용 확인
5. localStorage에 designSystem 값 있는 상태로 진입 → 기존 선택 보존 확인
```

## 자동 수정 규칙

| 이슈 | 자동 수정 |
|------|----------|
| i18n 키 누락 (한국어/영어) | KeysInitializer/Translations 파일에 직접 추가 |
| CSS 셀렉터 스코프 누락 | `[data-design-system="{slug}"]` prefix 추가 |
| UserProfileDialog의 fallback 텍스트 누락 | i18n call에 두 번째 인자 추가 |
| ThemeContext의 useMemo 분기 누락 | if 블록 추가 |
| MuiCard.padding 직접 지정 | 제거 후 MuiCardContent에 옮김 |
| MuiCard hover transform | 제거 (boxShadow 변화만 유지) |
| MuiOutlinedInput.height | minHeight로 치환 + multiline 분기 추가 |
| MuiListItem.height | minHeight로 치환 |
| MuiCheckbox/Radio root width/height | `& .MuiSvgIcon-root { fontSize }`로 변환 |
| 다크 모드 CSS 빈 블록 | 다크 토큰 누락 보고 (수동 결정) |

| 이슈 | 수동 (보고만) |
|------|------------|
| migrationMode와 ThemeContext의 useState 초기화 불일치 | 사용자 정책 확인 필요 |
| Card 시각적 구조가 기존과 다름 | 디자인 결정 |
| 폰트 link 누락 | 외부 의존, 사용자 결정 |

## 원칙

- **존재 검사 ≠ 정합성 검사.** "i18n 키 N개 추가됨"보다 "프론트가 부르는 키 4개 = 백엔드 등록 키 4개"가 진짜 검증.
- **빌드 명령은 위임.** AGENTS.md 1.1에 따라 직접 `./gradlew bootRun` 실행 금지. 보고서에 명령어만 기재.
- **자동 수정 후 재검증.** 수정한 항목은 보고서 ⚠️ 섹션에 기록하되, 수정 후 다시 grep해서 통과 확인.
- **회귀 우선.** 새 디자인 추가보다 기존 디자인이 깨지지 않는 것이 더 중요.
