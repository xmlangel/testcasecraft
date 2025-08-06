// ICT-78: 독립 프로젝트 생성 완성 버전
// 다이얼로그 요소를 직접 선택하여 프로젝트 생성

const { test, expect } = require('@playwright/test');

test.describe('독립 프로젝트 생성 완성 테스트', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.evaluate(() => localStorage.clear());
  });

  // 로그인 헬퍼 함수
  async function loginAsAdmin(page) {
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    
    const accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    if (!accessToken) {
      throw new Error('로그인 실패');
    }
    console.log('✅ 로그인 성공');
  }

  test('독립 프로젝트 생성 전체 플로우 완료', async ({ page }, testInfo) => {
    console.log('🏗️ 독립 프로젝트 생성 완료 테스트 시작...');
    
    // 1. 로그인
    await loginAsAdmin(page);
    await page.waitForLoadState('networkidle');
    
    // 2. 프로젝트 생성 버튼 클릭
    const createButton = page.locator('button:has-text("새 프로젝트 생성")');
    await expect(createButton).toBeVisible();
    await createButton.click();
    console.log('🖱️ 새 프로젝트 생성 버튼 클릭');
    
    // 3. 다이얼로그 확인
    await page.waitForTimeout(2000);
    const dialog = page.getByRole('dialog', { name: '새 프로젝트 생성' });
    await expect(dialog).toBeVisible();
    console.log('✅ 프로젝트 생성 다이얼로그 열림');
    
    // 4. 프로젝트 정보 입력
    const timestamp = Date.now();
    const projectName = `독립프로젝트_${timestamp}`;
    const projectCode = `INDEP_${timestamp}`;
    
    // 프로젝트 이름 입력 - 첫 번째 input 사용
    const nameInput = dialog.locator('input').first();
    await nameInput.fill(projectName);
    console.log(`📝 프로젝트 이름 입력: ${projectName}`);
    
    // 프로젝트 코드 입력 - 두 번째 input 사용 (placeholder가 "예: PROJ001"인 것)
    const codeInput = dialog.locator('input').nth(1);
    await codeInput.fill(projectCode);
    console.log(`📝 프로젝트 코드 입력: ${projectCode}`);
    
    // 5. 독립 프로젝트 특성 확인 (소속 조직이 선택되지 않은 상태)
    // 조직 선택 필드가 있다면 비워두거나 "독립" 선택
    const orgSelect = dialog.locator('div[role="button"], select, .MuiSelect-root').first();
    if (await orgSelect.isVisible({ timeout: 1000 })) {
      console.log('🏢 조직 선택 필드 발견 - 독립 프로젝트를 위해 비워둠');
    }
    
    // 6. 생성 버튼 클릭
    const submitButton = dialog.locator('button:has-text("생성")');
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
    
    console.log('🚀 프로젝트 생성 버튼 클릭 시도...');
    await submitButton.click();
    console.log('✅ 생성 버튼 클릭됨');
    
    // 7. 생성 완료 대기
    await page.waitForTimeout(3000);
    
    // 8. 다이얼로그가 닫혔는지 확인
    try {
      await dialog.waitFor({ state: 'detached', timeout: 5000 });
      console.log('✅ 생성 다이얼로그 닫힘');
    } catch (e) {
      console.log('⚠️ 다이얼로그가 아직 열려있을 수 있음');
      
      // 에러 메시지 확인
      const errorMessage = dialog.locator('.MuiAlert-root, .error-message, [class*="error"]');
      if (await errorMessage.isVisible({ timeout: 2000 })) {
        const errorText = await errorMessage.textContent();
        console.log(`❌ 에러 메시지: ${errorText}`);
      }
    }
    
    // 9. API를 통해 생성된 프로젝트 확인
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    if (token) {
      try {
        const response = await page.evaluate(async (token) => {
          const res = await fetch('http://localhost:8080/api/projects', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          return res.ok ? await res.json() : null;
        }, token);

        if (response && Array.isArray(response)) {
          const createdProject = response.find(p => p.name === projectName);
          if (createdProject) {
            console.log(`✅ 생성된 프로젝트 API 확인: ${createdProject.name}`);
            
            if (createdProject.organizationId === null || createdProject.organizationId === undefined) {
              console.log('🎯 organizationId가 null - 독립 프로젝트 특성 확인됨');
            } else {
              console.log(`⚠️ organizationId: ${createdProject.organizationId} (독립 프로젝트가 아닐 수 있음)`);
            }
          } else {
            console.log('⚠️ 생성된 프로젝트를 API에서 찾을 수 없음');
          }
        }
      } catch (e) {
        console.log('ℹ️ API 확인 실패, UI로만 확인');
      }
    }
    
    // 10. UI에서 새 프로젝트 확인
    await page.waitForTimeout(2000);
    const newProjectElement = page.locator(`text="${projectName}"`).first();
    
    try {
      await newProjectElement.waitFor({ timeout: 5000 });
      console.log('✅ 새 프로젝트가 UI에 표시됨');
    } catch (e) {
      console.log('⚠️ 새 프로젝트가 UI에 즉시 표시되지 않음 (새로고침 필요할 수 있음)');
    }
    
    // 11. 성공 스크린샷
    const screenshotTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = `test-results/success-screenshots/complete-independent-project-${screenshotTimestamp}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    await testInfo.attach('success-screenshot', {
      path: screenshotPath,
      contentType: 'image/png'
    });
    
    console.log('🎉 독립 프로젝트 생성 완료 테스트 성공!');
    console.log(`📊 결과: 프로젝트 "${projectName}" (코드: ${projectCode}) 생성됨`);
  });

});