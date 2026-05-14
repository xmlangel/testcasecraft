---
name: e2e-spec-writing
description: 시나리오와 Page Object를 조합해 Playwright 테스트 스펙 파일(*-test.js)을 작성한다. 모듈별 배치, fixture destructuring, console.log/screenshot 컨벤션, expect 패턴을 모두 적용. e2e-page-object-generation 다음 단계.
---

# E2E Spec Writing

시나리오와 Page Object를 받아 실제 Playwright 테스트 파일을 작성한다.

## 워크플로우

### 1. 산출물 읽기

- `_workspace/e2e_01_scenario_{feature}.json`
- `_workspace/e2e_02_page_object_{feature}.md`

시나리오의 steps/assertions + 생성된 Page Object의 메서드/fixture 이름 확인.

### 2. 파일 경로 결정

- 디렉토리: `src/test/e2e/{module}/` (시나리오의 `module` 필드)
- 파일명: `{feature-kebab-case}-test.js`

이미 존재하면:
- 사용자가 "재작성" 명시: 덮어쓰기
- 그 외: 새 test 블록만 append (기존 보존)

### 3. 파일 헤더

```javascript
// {ICT-XXX 또는 기능명}: {간단 설명}
// 관련 컴포넌트: {targetComponents from scenario}

const { test, expect } = require("../fixtures/test-fixtures.js");
const { ADMIN_USERNAME, ADMIN_PASSWORD } = require("../config/credentials.js");
```

### 4. describe 블록

```javascript
test.describe("{기능 한국어명} E2E 테스트", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.clearStorage();
  });

  // test 블록들
});
```

`beforeEach`는 거의 모든 테스트에서 동일. localStorage 초기화로 테스트 격리.

### 5. test 블록 작성

각 시나리오를 `test()` 블록으로 변환:

```javascript
test("{scenario.name}", async ({ page, loginPage, {feature}Page }) => {
  console.log("{이모지} {scenario.name} 테스트 시작...");

  // 1. 백엔드 준비 + 로그인 (시나리오에 따라)
  await loginPage.waitForBackend();
  await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
  console.log("✅ 로그인 완료");

  // 2. {feature} 페이지로 이동
  await {feature}Page.goto();
  console.log("✅ {feature} 페이지 이동");

  // 3. 시나리오 steps 수행
  await {feature}Page.{actionMethod}({params});
  console.log("✅ {action} 완료");

  // 4. assertions
  await expect({feature}Page.{element}).toBeVisible();
  await expect(...).toContainText("...");
  // ...

  console.log("🎉 {scenario.name} 테스트 완료!");
  await {feature}Page.screen("{scenario.id}");
});
```

### 6. assertion 변환

시나리오의 `assertions` 문자열을 Playwright expect 호출로 변환:

| 시나리오 assertion | Playwright 코드 |
|-------------------|----------------|
| "토큰 값이 16자 이상" | `expect((await page.locator('...').textContent()).length).toBeGreaterThanOrEqual(16);` |
| "토큰 목록 길이가 1 증가" | (사전 count → 액션 → count 비교) |
| "백엔드 POST /api/foo 200 응답" | `await page.waitForResponse(r => r.url().includes('/api/foo') && r.status() === 200);` |
| "에러 메시지 표시" | `await expect(page.locator('.MuiAlert-message')).toBeVisible();` |
| "URL이 /dashboard로 변경" | `await expect(page).toHaveURL(/.*\/dashboard/);` |

### 7. 진행 메시지 컨벤션

기존 spec과 일관성 유지:
- 시작: `🔐` `🎨` `📱` `🔍` `📊` 등 기능 관련 이모지
- 중간 진행: `✅ ... 완료`
- 종료: `🎉 ... 테스트 완료!`

### 8. 스크린샷

각 test 마지막에 `await {feature}Page.screen("{slug}")` 호출. `slug`는 시나리오 id 또는 의미 있는 한글 슬러그.

### 9. 보고서 작성

`_workspace/e2e_03_spec_{feature}.md`에 결과 기록.

## 시나리오 유형별 패턴

### Happy Path
```javascript
test("정상 흐름", async ({ ... }) => {
  // 로그인 → 페이지 이동 → 액션 → 결과 검증
});
```

### Sad Path (오류 처리)
```javascript
test("잘못된 입력 처리", async ({ ... }) => {
  // 로그인 → 페이지 이동 → 잘못된 입력 → 오류 메시지 확인 → 정상 상태 유지 확인
});
```

### Edge Case
```javascript
test("동시 요청 처리", async ({ ... }) => {
  // 로그인 → 두 탭 열기 → 동시 액션 → 일관성 확인
});
```

## 실패 가능 지점 보호

- **타이밍 의존성:** `page.waitForTimeout(1000)` 같은 hardcoded delay는 회피, `waitFor({ state })` 또는 `waitForResponse` 사용
- **race condition:** API 응답 대기 후 UI 검증, 반대 순서 금지
- **로컬 상태 의존:** beforeEach에서 localStorage 초기화로 격리

## 원칙

- **기존 spec 100% 모방.** 자유 변형 금지. login-success-test.js 패턴 그대로
- **fixture destructuring으로만 PO 접근.** `new XxxPage(page)` 직접 생성 금지
- **assertion 다양화.** visibility만 반복 금지, 텍스트/카운트/URL/스토리지 혼합
- **console.log + screenshot 필수.** 디버깅 보조용 (CI 실패 시 분석에 도움)

## 검증 체크 (자체)

- [ ] 파일 헤더에 `require("../fixtures/test-fixtures.js")` 있음
- [ ] `test.describe` + `test.beforeEach` + 다수 `test` 구조
- [ ] 모든 test가 fixture를 destructuring으로 받음
- [ ] 각 test에 최소 1개 expect 호출
- [ ] 각 test 마지막에 `screen(...)` 호출
- [ ] hardcoded `waitForTimeout` 남용 없음 (필요 시 명시적 사유)
