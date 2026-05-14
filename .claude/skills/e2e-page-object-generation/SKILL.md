---
name: e2e-page-object-generation
description: 시나리오 분석 결과를 받아 Playwright Page Object 클래스를 생성하거나 기존 PO를 확장한다. BasePage 상속, data-testid 셀렉터 우선, 액션 메서드 추출, fixtures/test-fixtures.js 등록까지. e2e-scenario-analysis 다음 단계로 사용.
---

# E2E Page Object Generation

시나리오에 등장하는 셀렉터/액션을 Page Object 클래스로 추상화한다.

## 워크플로우

### 1. 시나리오 읽기

`_workspace/e2e_01_scenario_{feature}.json`을 읽어 다음 추출:
- `expectedSelectors` 배열 (전체 시나리오의 합집합)
- `steps`의 사용자 액션 (클릭, 입력, 이동)
- `fixtureNeeded`, `existingPageObjects`, `needsNewPageObject`

### 2. 신규 vs 확장 결정

| 조건 | 동작 |
|------|------|
| `needsNewPageObject=true` AND 같은 이름의 PO 없음 | 신규 클래스 작성 |
| 같은 페이지의 PO가 이미 있음 (`UserProfilePage` 등) | 메서드/셀렉터만 추가 |
| `needsNewPageObject=false` | 기존 PO 확장 |

### 3. Page Object 작성

#### 3-1. 신규 클래스 템플릿

```javascript
const { BasePage } = require("./BasePage.js");

class {Feature}Page extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   * @param {import('@playwright/test').TestInfo} testInfo
   */
  constructor(page, testInfo) {
    super(page, testInfo);
    // {그룹 이름} selectors
    this.{element} = page.locator('{selector}');
    // ...
  }

  async goto() {
    await super.goto("/{path}");
  }

  // {그룹 이름} actions
  async {actionName}({params}) {
    await this.{element}.click();
    // ...
  }
}

module.exports = { {Feature}Page };
```

#### 3-2. 셀렉터 정의 규칙

- `[data-testid="..."]` 우선 → `this.{name}Button = page.locator('[data-testid="..."]');`
- 누락 testid는 fallback으로:
  - `page.getByRole("button", { name: "..." })`
  - `page.locator(".MuiXxx").filter({ hasText: "..." })`
- 동적 요소(리스트 항목)는 함수 형태:
  ```javascript
  tokenRow(name) {
    return this.page.locator(`[data-testid="token-row-${name}"]`);
  }
  ```

#### 3-3. 액션 메서드 규칙

- 3줄 이상 반복되는 사용자 액션은 메서드로 추출
- 매개변수는 명확한 이름 (positional 인자 1~2개, 그 이상은 객체)
- assertion 금지 (spec에서 처리)
- 반환값이 의미 있으면 명확히 (`getRevealedTokenValue(): string`)

예:
```javascript
async createToken(name) {
  await this.nameInput.fill(name);
  await this.createButton.click();
  await this.revealedDialog.waitFor({ state: "visible" });
}

async getRevealedTokenValue() {
  return await this.revealedTokenValue.textContent();
}
```

### 4. 기존 PO 확장 시 주의

확장할 PO 파일을 읽어:
- 이미 있는 셀렉터/메서드는 추가 금지 (중복 확인)
- 그룹 주석(`// Login selectors`, `// Header selectors`) 유지하며 동일 그룹에 추가
- import 위치, 클래스 닫는 `}` 위치 유지

### 5. fixtures/test-fixtures.js 등록

신규 PO를 만들었으면 반드시 등록:

```javascript
// 상단 import 추가
const { {Feature}Page } = require("../pages/{Feature}Page.js");

// 객체 내부 추가
{feature}Page: async ({ page }, use, testInfo) => {
  await use(new {Feature}Page(page, testInfo));
},
```

기존 PO 확장만 한 경우는 fixture 수정 불필요.

### 6. 보고서 작성

`_workspace/e2e_02_page_object_{feature}.md`에 결과 기록.

## 셀렉터 안정성 점수

작성한 PO의 셀렉터를 다음 기준으로 자체 평가하여 보고서에 명시:

| 셀렉터 유형 | 점수 |
|------------|------|
| `[data-testid="..."]` | 5 |
| `[aria-label="..."]` | 4 |
| `getByRole(...)` | 4 |
| `.MuiXxx` + `:has-text(...)` 조합 | 3 |
| `.MuiXxx` 단독 | 2 |
| `has-text("한국어")` 단독 | 1 |

전체 평균이 4.0 미만이면 ⚠️ 보고 (frontend 수정 필요).

## 원칙

- **BasePage 상속 필수.** 직접 Playwright API 노출 금지
- **기존 패턴 100% 모방.** LoginPage, ProjectListPage 등을 템플릿으로 사용
- **assertion 금지.** PO는 액션만, 검증은 spec에서
- **fixture 등록 누락 금지.** 신규 PO는 반드시 fixture에도 추가

## 검증 체크 (자체)

- [ ] 모든 셀렉터가 BasePage의 생성자에서 정의됨
- [ ] 시나리오의 `expectedSelectors` 모두가 PO에 반영됨
- [ ] 시나리오의 `steps` 액션이 메서드로 추상화됨
- [ ] 신규 PO인 경우 fixtures에 등록됨
- [ ] `module.exports`로 클래스 export됨
- [ ] 셀렉터 안정성 평균 점수 ≥ 4.0
