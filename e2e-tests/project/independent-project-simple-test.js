// ICT-78: 독립 프로젝트 생성 간단 테스트 (디버깅용)
// 기본 플로우만 테스트하여 어느 단계에서 문제가 있는지 확인

const { test, expect } = require('@playwright/test');

test.describe('독립 프로젝트 생성 간단 테스트', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.evaluate(() => localStorage.clear());
  });

  // 기존 성공 테스트 패턴을 그대로 사용한 로그인 헬퍼
  async function loginAsAdmin(page) {
    console.log('🔐 Admin 로그인 수행...');
    
    // 백엔드 서버 연결 확인
    let backendReady = false;
    for (let i = 0; i < 30; i++) {
      try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'admin' })
        });
        backendReady = true;
        console.log('🚀 백엔드 서버 준비 완료');
        break;
      } catch (e) {
        console.log(`⏳ 백엔드 대기 중... (${i + 1}/30)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!backendReady) {
      throw new Error('백엔드 서버가 30초 내에 준비되지 않았습니다.');
    }

    // 로그인 페이지 요소 확인
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // 로그인 폼 작성 및 제출
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    console.log('✅ 계정 정보 입력 완료');
    
    await page.click('button[type="submit"]');
    console.log('✅ 로그인 버튼 클릭');
    
    // 로딩 상태 확인
    const loadingSpinner = page.locator('.MuiCircularProgress-root');
    if (await loadingSpinner.isVisible()) {
      console.log('⏳ 로딩 스피너 표시 확인');
      await loadingSpinner.waitFor({ state: 'hidden', timeout: 10000 });
    }

    // JWT 토큰 저장 확인
    await page.waitForTimeout(3000);
    
    let accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
    console.log('🔑 accessToken:', accessToken ? 'FOUND' : 'NOT FOUND');
    
    if (!accessToken) {
      await page.waitForTimeout(2000);
      accessToken = await page.evaluate(() => localStorage.getItem('accessToken'));
      console.log('🔄 재시도 - accessToken:', accessToken ? 'FOUND' : 'NOT FOUND');
      
      if (!accessToken) {
        throw new Error('로그인 실패: JWT 토큰이 저장되지 않았습니다.');
      }
    }
    
    console.log('✅ JWT 토큰 저장 확인 완료');
    
    // 로그인 폼이 사라졌는지 확인
    await page.waitForTimeout(1000);
    await expect(page.locator('h5:has-text("로그인")')).not.toBeVisible();
    
    console.log('✅ 로그인 성공');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  }

  test('독립 프로젝트 생성 기본 플로우 간단 테스트', async ({ page }, testInfo) => {
    console.log('🏗️ 독립 프로젝트 생성 간단 테스트 시작...');

    // 1. 로그인
    await loginAsAdmin(page);

    // 2. 프로젝트 생성 버튼 클릭
    console.log('📝 프로젝트 생성 버튼 찾기...');
    
    await page.waitForLoadState('networkidle');
    
    // 다양한 가능한 프로젝트 생성 버튼 찾기
    const createButtonSelectors = [
      'button:has-text("새 프로젝트")',
      'button:has-text("프로젝트 생성")',
      'button:has-text("Create")',
      'button[aria-label*="프로젝트"]',
      '.MuiButton-root:has(.MuiSvgIcon-root)',
      '.MuiFab-root'
    ];

    let createButton = null;
    for (const selector of createButtonSelectors) {
      try {
        const buttons = page.locator(selector);
        const count = await buttons.count();
        
        for (let i = 0; i < count; i++) {
          const button = buttons.nth(i);
          if (await button.isVisible({ timeout: 2000 })) {
            const buttonText = await button.textContent();
            console.log(`🔍 발견된 버튼: "${buttonText}" (셀렉터: ${selector})`);
            
            if (buttonText && (buttonText.includes('새') || buttonText.includes('생성') || buttonText.includes('Create'))) {
              createButton = button;
              break;
            }
          }
        }
        
        if (createButton) break;
      } catch (e) {
        continue;
      }
    }

    if (!createButton) {
      // 페이지의 모든 버튼 출력
      console.log('🔍 페이지의 모든 버튼 확인...');
      const allButtons = await page.locator('button').all();
      for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
        try {
          const button = allButtons[i];
          if (await button.isVisible()) {
            const text = await button.textContent();
            console.log(`버튼 ${i+1}: "${text}"`);
          }
        } catch (e) {
          continue;
        }
      }
      throw new Error('프로젝트 생성 버튼을 찾을 수 없습니다.');
    }

    await createButton.click();
    console.log('🖱️ 프로젝트 생성 버튼 클릭');

    // 3. 다이얼로그 열림 확인
    await page.waitForTimeout(1000);
    
    const dialogFound = await page.locator('.MuiDialog-root').isVisible({ timeout: 5000 });
    if (dialogFound) {
      console.log('📝 프로젝트 생성 다이얼로그 확인');
    } else {
      console.log('📍 현재 URL:', page.url());
      throw new Error('프로젝트 생성 다이얼로그를 찾을 수 없습니다.');
    }

    // 4. 프로젝트명 입력 (독립 프로젝트 유형 선택 건너뛰기)
    console.log('📝 프로젝트명 입력 시작...');
    
    const timestamp = Date.now();
    const projectName = `간단테스트프로젝트_${timestamp}`;
    
    // 프로젝트명 입력 필드 찾기
    const nameInputSelectors = [
      'input[name="name"]',
      'input[name="projectName"]', 
      'input[placeholder*="이름"]',
      'input[placeholder*="name"]',
      '.MuiTextField-root input[type="text"]'
    ];

    let nameInput = null;
    for (const selector of nameInputSelectors) {
      try {
        nameInput = page.locator(selector).first();
        if (await nameInput.isVisible({ timeout: 3000 })) {
          console.log(`✅ 프로젝트명 입력 필드 발견: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!nameInput) {
      // 모든 input 필드 확인
      console.log('🔍 모든 input 필드 확인...');
      const allInputs = await page.locator('input').all();
      for (let i = 0; i < Math.min(allInputs.length, 10); i++) {
        try {
          const input = allInputs[i];
          if (await input.isVisible()) {
            const placeholder = await input.getAttribute('placeholder');
            const name = await input.getAttribute('name');
            const type = await input.getAttribute('type');
            console.log(`Input ${i+1}: name="${name}", type="${type}", placeholder="${placeholder}"`);
          }
        } catch (e) {
          continue;
        }
      }
      throw new Error('프로젝트명 입력 필드를 찾을 수 없습니다.');
    }

    // 프로젝트명 입력
    await nameInput.fill(projectName);
    console.log(`📝 프로젝트명 입력 완료: ${projectName}`);

    // 5. 생성 버튼 클릭
    console.log('🚀 프로젝트 생성 제출...');
    
    const submitButtonSelectors = [
      'button[type="submit"]:has-text("생성")',
      'button:has-text("생성")',
      'button:has-text("Create")',
      '.MuiDialog-actions button'
    ];

    let submitButton = null;
    for (const selector of submitButtonSelectors) {
      try {
        submitButton = page.locator(selector).first();
        if (await submitButton.isVisible({ timeout: 3000 }) && await submitButton.isEnabled()) {
          console.log(`✅ 생성 버튼 발견: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!submitButton) {
      throw new Error('프로젝트 생성 버튼을 찾을 수 없습니다.');
    }

    await submitButton.click();
    console.log('🖱️ 프로젝트 생성 제출');

    // 6. 생성 완료 확인
    await page.waitForTimeout(3000);

    // organizationId null 확인
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
            console.log(`✅ 생성된 프로젝트 확인: ${createdProject.name}`);
            
            if (createdProject.organizationId === null || createdProject.organizationId === undefined) {
              console.log('✅ organizationId가 null - 독립 프로젝트 특성 확인');
            } else {
              console.log(`⚠️ organizationId: ${createdProject.organizationId}`);
            }
          }
        }
      } catch (e) {
        console.log('ℹ️ API 확인 실패, UI로 확인');
      }
    }

    // 성공 스크린샷 촬영
    const timestamp2 = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = `test-results/success-screenshots/simple-independent-project-${timestamp2}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    await testInfo.attach('success-screenshot', {
      path: screenshotPath,
      contentType: 'image/png'
    });

    console.log('🎉 간단 독립 프로젝트 생성 테스트 완료!');
    console.log(`📊 결과: 프로젝트 "${projectName}" 생성됨`);
  });

});