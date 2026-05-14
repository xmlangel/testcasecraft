---
name: theme-integration
description: 추출된 디자인 토큰 JSON을 ThemeContext.jsx에 통합하고, 글로벌 CSS 파일을 생성하며, localStorage 기본값 마이그레이션을 구현한다. design-token-extraction 다음 단계로 사용.
---

# Theme Integration

`_workspace/01_tokens_{slug}.json`을 ThemeContext.jsx에 통합한다.

## 워크플로우

### 1. ThemeContext.jsx 수정

기존 `createMaterial3Theme(mode)` 패턴을 참고하여 `create{PascalSlug}Theme(mode)` 함수를 추가한다.

#### 함수 작성 규칙
```javascript
const create{PascalSlug}Theme = (mode) => {
  const isLight = mode === "light";
  // 토큰 JSON의 palette/typography/shape/shadows/components를 그대로 인라인
  return createTheme({
    palette: { mode, ... },
    typography: {...},
    shape: {...},
    shadows: [...],
    components: {...},
  });
};
```

#### useMemo 분기 확장
```javascript
const theme = useMemo(() => {
  if (designSystem === "material3") {
    return createMaterial3Theme(mode);
  }
  if (designSystem === "{slug}") {
    return create{PascalSlug}Theme(mode);
  }
  return createAppTheme(mode);
}, [mode, designSystem]);
```

#### 기본값 마이그레이션 (Phase 4-2의 `migrationMode`별 분기)

**`new-users-only`** — 가장 안전:
```javascript
const [designSystem, setDesignSystem] = useState(() => {
  const savedSystem = localStorage.getItem("designSystem");
  return savedSystem || "{slug}";  // null일 때만 새 기본값
});
```

**`force-all`**:
```javascript
const [designSystem, setDesignSystem] = useState("{slug}");
useEffect(() => {
  localStorage.setItem("designSystem", "{slug}");
}, []);
```

**`migrate-glass-only`**:
```javascript
const [designSystem, setDesignSystem] = useState(() => {
  const savedSystem = localStorage.getItem("designSystem");
  if (savedSystem === "glass" || !savedSystem) return "{slug}";
  return savedSystem;  // material3는 보존
});
```

### 2. 글로벌 CSS 생성

`src/main/frontend/src/styles/design-systems/{slug}.css`를 생성한다. 디렉토리가 없으면 만든다.

#### CSS 구조
```css
/* Design System: {displayName} */

/* External fonts */
@import url('font-url-1');
@import url('font-url-2');

/* CSS Variables - scoped to this design system */
[data-design-system="{slug}"] {
  --cs-color-primary: #E11D48;
  --cs-color-secondary: #2563EB;
  ...
}

/* Optional: dark mode override */
[data-design-system="{slug}"][data-theme="dark"] {
  --cs-color-primary: #...;
}

/* Global element styles only when this design system is active */
[data-design-system="{slug}"] body {
  font-family: 'Poppins', sans-serif;
}
```

**스코프 핵심:** 모든 룰은 `[data-design-system="{slug}"]` 셀렉터로 시작. `:root`나 `body` 단독 셀렉터는 금지 (다른 디자인 사용자에게 누수).

### 3. CSS Import 등록

`src/main/frontend/src/index.css` 또는 `App.jsx` 또는 `main.jsx`에 새 CSS 파일을 import한다.

ThemeContext.jsx 상단에 직접 import해도 됨:
```javascript
import "../styles/design-systems/{slug}.css";
```

여러 디자인 시스템 CSS가 동시에 로드되어도 `[data-design-system="..."]` 스코프 덕분에 충돌 없음.

### 4. 폰트 link 등록 (선택)

외부 폰트가 있으면 `src/main/frontend/index.html`의 `<head>`에 추가:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=DM+Sans:wght@400;500&display=swap">
```

CSS @import도 가능하지만 성능을 위해 link 권장.

### 5. 보고서 작성

`_workspace/02_integration_{slug}.md`에 다음을 기록:
```markdown
# Theme Integration Report: {slug}

## 수정된 파일
- src/main/frontend/src/context/ThemeContext.jsx (createXxxTheme 추가, useMemo 분기, migration)
- src/main/frontend/src/styles/design-systems/{slug}.css (신규)
- src/main/frontend/index.html (폰트 link 추가)

## 적용된 마이그레이션 모드
- {new-users-only|force-all|migrate-glass-only}
- 영향 범위: {설명}

## 다음 단계용 메타데이터
- slug: {slug}
- displayName: {displayName}
- description.ko: {ko}
- description.en: {en}
- makeDefault: {true|false}
```

## 원칙

- **기존 함수 보존:** `createMaterial3Theme`, `createAppTheme`을 절대 수정하지 않는다 — 회귀 방지.
- **인라인 토큰:** 별도 상수 파일을 만들지 않고 함수 본문에 객체 리터럴로 직접 작성.
- **slug 일관성:** ThemeContext 분기 값, CSS 셀렉터, localStorage 값 모두 동일한 slug 사용.
- **dark 폴백:** 토큰 JSON에 `missing: ["dark"]`가 있으면 light 모드 토큰을 dark에도 적용하고 그 사실을 보고서에 명시.

## 검증 체크 (자체)

작업 완료 전 다음을 확인:
- [ ] ThemeContext.jsx가 ESLint 통과 가능한 형태인가 (괄호, 세미콜론)
- [ ] CSS가 `[data-design-system="..."]` 스코프로 시작하는가
- [ ] 기존 디자인 시스템(glass, material3) 코드가 그대로인가
