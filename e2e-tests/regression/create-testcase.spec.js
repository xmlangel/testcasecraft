// e2e-tests/project/create-testcase.spec.js: 프로젝트 내 테스트 케이스 생성 E2E 테스트
const { test, expect } = require('@playwright/test');

test.describe('프로젝트 내 테스트 케이스 생성 테스트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    // 로그인 로직 (regression/login.spec.js에서 복사)
    let backendReady = false;
    for (let i = 0; i < 30; i++) {
      try {
        const response = await fetch(`http://localhost:8080/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'admin' })
        });
        backendReady = true;
        break;
      } catch (e) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    if (!backendReady) {
      throw new Error('백엔드 서버가 준비되지 않았습니다');
    }

    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('새로운 테스트 케이스를 생성한다', async ({ page }) => {
    // 1. 상단에 프로젝트 선택 누름
    await page.click('button:has-text("프로젝트 선택")');

    // 2. 데브옵스팀 > 인프라자동화 > 프로젝트 열기
    // '데브옵스팀' 조직 선택 (셀렉터는 실제 UI에 따라 조정 필요)
    await page.click('text="데브옵스팀"');
    // '인프라자동화' 프로젝트가 나타날 때까지 대기
    await page.waitForSelector('text="인프라 자동화"');
    // '인프라자동화' 프로젝트 선택 (셀렉터는 실제 UI에 따라 조정 필요)
    await page.click('text="인프라 자동화"');
    // '프로젝트 열기' 버튼 클릭
    await page.click('button:has-text("프로젝트 열기")');
    // 프로젝트 페이지로 이동 대기 (예: 프로젝트 대시보드 URL)
    await page.waitForURL(/\/projects\/[a-f0-9-]+/); // 프로젝트 ID가 포함된 URL 패턴

    // 3. 테스트케이스 탭 선택
    await page.click('button:has-text("테스트케이스")');
    // 테스트케이스 목록 페이지로 이동 대기 (예: 테스트케이스 목록 URL)
    await page.waitForURL(/\/projects\/[a-f0-9-]+\/testcases/);

    // 4. 개별폼 선택 (테스트 케이스 생성 폼으로 이동)
    await page.click('button:has-text("개별 폼")');
    // 테스트 케이스 생성 폼이 나타날 때까지 대기 (예: 폼 제목)
    await page.waitForSelector('h6:has-text("테스트케이스 생성")'); // 또는 폼의 특정 입력 필드

    // 5. 테스트 케이스 생성 (이름, 설명, Pre-condition)
    const testCaseName = `자동화 테스트 케이스 ${Date.now()}`;
    await page.locator('div[role="button"]:has-text("테스트케이스 정보")').waitFor({ state: 'visible' });
    await page.click('div[role="button"]:has-text("테스트케이스 정보")');
    await page.getByLabel('이름').waitFor({ state: 'visible' }); // '이름' 라벨을 가진 입력 필드가 보일 때까지 대기
    await page.getByLabel('이름').fill(testCaseName); // '이름' 라벨을 가진 입력 필드 채우기

    await page.getByLabel('설명').fill('이것은 자동화 테스트를 통해 생성된 테스트 케이스입니다.'); // '설명' 라벨을 가진 입력 필드 채우기
    await page.getByLabel('Pre-condition').fill('사전 조건: 시스템에 로그인되어 있어야 합니다.'); // 'Pre-condition' 라벨을 가진 입력 필드 채우기

    // 6. 테스트 스텝 3개 이상 추가
    // '스텝 추가' 버튼 클릭 (셀렉터는 실제 UI에 따라 조정 필요)
    await page.click('button:has-text("스텝 추가")'); // 첫 번째 스텝
    await page.getByPlaceholder('Step 설명').nth(0).fill('첫 번째 스텝 설명'); // 첫 번째 스텝 설명 입력 필드 채우기
    await page.getByPlaceholder('예상 결과').nth(0).fill('첫 번째 예상 결과'); // 첫 번째 예상 결과 입력 필드 채우기

    await page.click('button:has-text("스텝 추가")'); // 두 번째 스텝
    await page.getByPlaceholder('Step 설명').nth(1).fill('두 번째 스텝 설명'); // 두 번째 스텝 설명 입력 필드 채우기
    await page.getByPlaceholder('예상 결과').nth(1).fill('두 번째 예상 결과'); // 두 번째 예상 결과 입력 필드 채우기

    await page.click('button:has-text("스텝 추가")'); // 세 번째 스텝
    await page.getByPlaceholder('Step 설명').nth(2).fill('세 번째 스텝 설명'); // 세 번째 스텝 설명 입력 필드 채우기
    await page.getByPlaceholder('예상 결과').nth(2).fill('세 번째 예상 결과'); // 세 번째 예상 결과 입력 필드 채우기

    // 전체 예상 결과 입력
    await page.getByPlaceholder('전체 예상 결과').fill('이 테스트 케이스의 모든 스텝에 대한 전체 예상 결과입니다.');

    // 7. 저장 버튼 클릭
    await page.locator('button:has-text("저장")').last().click(); // 마지막 '저장' 버튼 클릭
    
    // 저장 성공 확인 (예: 성공 메시지 또는 목록 페이지로 리다이렉션)
    await page.waitForURL(/\/projects\/[a-f0-9-]+\/testcases/); // 테스트케이스 목록 페이지로 돌아왔는지 확인
    await expect(page.locator(`text="${testCaseName}"`)).toBeVisible(); // 생성된 테스트 케이스 이름이 목록에 보이는지 확인

    console.log(`✅ 테스트 케이스 '${testCaseName}' 생성 완료 및 확인`);
  });
});
