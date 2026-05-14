---
name: design-token-extraction
description: 디자인 시스템 명세 문서(Design.md)를 분석해 MUI createTheme() 인자 객체와 글로벌 CSS 변수로 변환한다. 색상, 타이포그래피, 간격, 보더, 그림자, 컴포넌트 스타일을 추출하여 _workspace/01_tokens_{slug}.json으로 저장. 디자인 시스템 추가 워크플로우의 첫 단계에서 사용.
---

# Design Token Extraction

디자인 명세 문서를 React/MUI 프로젝트가 소비할 수 있는 형태의 토큰 JSON으로 변환한다.

## 워크플로우

### 1. 명세 파일 읽기
- 사용자가 제공한 `designPath` (예: `docs/design/CreateSpaceDesign/Design.md`)를 읽는다
- 같은 디렉토리에 `colors_and_type.css`, `tokens.js` 등 보조 파일이 있으면 함께 읽는다

### 2. 토큰 분류 및 추출

#### 색상
- Hex 색상 우선, rgba/hsl은 그대로 보존
- 명세의 의미 분류(primary/secondary/tertiary/surface)를 MUI palette 키에 매핑
- Tertiary 같은 MUI 기본 키에 없는 항목은 별도 키로 보존하고 components 오버라이드에서 활용

#### 타이포그래피
- `text-hero`, `text-h1` 등 명세 토큰을 MUI typography의 h1~h6, body1~body2, button, caption, overline으로 매핑
- fontFamily, fontSize, fontWeight, lineHeight, letterSpacing 모두 보존
- 외부 폰트(Poppins, DM Sans 등)는 `fontImports` 배열에 Google Fonts URL로 기록

#### 간격/보더/그림자
- `space-*` → MUI는 `spacing: 8` 기준이므로 base unit만 추출, 나머지는 컴포넌트 오버라이드에서 직접 픽셀 값 사용
- `radius-*` → `shape.borderRadius`에 기본값(보통 md 또는 lg) 설정, 나머지는 컴포넌트별
- `shadow-*` → MUI `shadows` 배열(0~24)에 매핑. 0은 항상 "none". 명세에 5단계만 있으면 나머지는 가장 큰 그림자 반복

#### 컴포넌트 스타일
- Buttons → `MuiButton.styleOverrides.{root,contained,outlined,text}`
- Cards → `MuiCard.styleOverrides.root`
- Inputs → `MuiTextField.styleOverrides.root` + `MuiOutlinedInput.styleOverrides.root`
- Chips → `MuiChip.styleOverrides.{root,filled}`
- Lists → `MuiList`, `MuiListItem`
- Tooltips → `MuiTooltip.styleOverrides.tooltip`
- AppBar는 명세에 없으면 surface 색상으로 기본 처리

### 3. CSS 변수 시트 생성
명세 토큰을 `--{prefix}-{category}-{name}` 형식의 CSS 변수로도 만든다. prefix는 slug에서 자동 생성 (createspace → `cs`).

예:
```css
--cs-color-primary: #E11D48;
--cs-color-secondary: #2563EB;
--cs-radius-md: 8px;
--cs-shadow-glass: 8px 8px 32px rgba(0,0,0,0.08);
```

### 4. 산출물 작성
`_workspace/01_tokens_{slug}.json`에 다음 구조로 저장:

```json
{
  "slug": "createspace",
  "displayName": "CreateSpace",
  "description": {
    "ko": "다채로운 색상과 글래스모피즘이 어우러진 크리에이티브 디자인",
    "en": "Colorful, expressive design with glassmorphism panels"
  },
  "palette": {
    "primary": { "main": "#E11D48", "contrastText": "#FFFFFF" },
    ...
  },
  "typography": {...},
  "shape": { "borderRadius": 16 },
  "shadows": [...24개...],
  "components": {...},
  "cssVariables": {...},
  "fontImports": [
    "https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap",
    "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&display=swap"
  ],
  "missing": [],
  "notes": []
}
```

## 원칙

- **추론 금지:** 명세에 없는 값은 만들지 않는다. dark 모드 명세가 없으면 `missing: ["dark"]`로 기록만.
- **MUI 호환성 우선:** MUI 키 명명 규칙(camelCase, palette/typography/shape/shadows/components 구조)을 따른다.
- **24개 그림자:** MUI shadows 배열은 정확히 25개(0~24). 명세에 부족하면 마지막 값을 반복.
- **light/dark 분기:** 명세에 두 모드가 있으면 `palette.light`/`palette.dark`로 별도 저장하여 integrator가 mode 파라미터로 선택할 수 있게 한다.

## 데이터 스키마 표준

다음은 integrator/qa가 의존하는 필수 필드:

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `slug` | string | ✅ | 식별자, kebab-case 단어 1~2개 |
| `displayName` | string | ✅ | UI 표시명 |
| `description.ko` | string | ✅ | 한국어 설명, 한 줄 |
| `description.en` | string | ✅ | 영어 설명, 한 줄 |
| `palette` | object | ✅ | MUI palette 형식 |
| `typography` | object | ✅ | MUI typography 형식 |
| `shape.borderRadius` | number | ✅ | 기본 보더 radius |
| `shadows` | array(25) | ⚠️ | 없으면 MUI 기본값 사용 |
| `components` | object | ⚠️ | 컴포넌트 오버라이드, 없으면 빈 객체 |
| `cssVariables` | object | ⚠️ | CSS 변수 매핑 |
| `fontImports` | array | ⚠️ | 외부 폰트 URL 배열 |
