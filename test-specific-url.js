// test-specific-url.js
// 특정 URL에서 스프레드시트 스텝 추가 기능 실제 테스트

const { chromium } = require('playwright');

async function testSpecificUrl() {
  console.log('🚀 특정 URL에서 스프레드시트 스텝 추가 기능 테스트 시작');
  console.log('📍 테스트 URL: http://localhost:3000/projects/f8943e57-9925-4f80-9fc7-61e743c5937f/testcases');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 콘솔 로그 및 에러 모니터링
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log(`❌ 브라우저 콘솔 에러: ${msg.text()}`);
    } else if (msg.type() === 'log') {
      console.log(`📝 브라우저 로그: ${msg.text()}`);
    }
  });
  
  page.on('pageerror', (error) => {
    console.log(`💥 페이지 에러: ${error.message}`);
  });
  
  try {
    // 1. 로그인 페이지로 이동
    console.log('🔐 로그인 페이지로 이동...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
    
    // 2. 로그인 수행
    console.log('👤 로그인 수행 중...');
    await page.fill('input[name="username"], input[type="text"]', 'admin');
    await page.fill('input[name="password"], input[type="password"]', 'admin');
    await page.click('button[type="submit"], button:has-text("로그인"), button:has-text("Login")');
    
    // 로그인 완료 대기
    await page.waitForTimeout(3000);
    console.log('✅ 로그인 완료');
    
    // 3. 특정 테스트케이스 페이지로 직접 이동
    console.log('📂 특정 프로젝트 테스트케이스 페이지로 이동...');
    await page.goto('http://localhost:3000/projects/f8943e57-9925-4f80-9fc7-61e743c5937f/testcases');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    console.log(`📍 현재 페이지: ${page.url()}`);
    
    // 4. 스프레드시트 모드 찾기 및 활성화
    console.log('📊 스프레드시트 모드 찾는 중...');
    
    // 스프레드시트 관련 버튼/토글 찾기
    const spreadsheetSelectors = [
      'button:has-text("스프레드시트")',
      'button:has-text("Spreadsheet")',
      'button:has-text("표 형태")',
      'button:has-text("Sheet")',
      '[data-testid*="spreadsheet"]',
      'button[aria-label*="스프레드시트"]',
      'button[title*="스프레드시트"]',
      '.spreadsheet-toggle',
      'input[type="checkbox"] + label:has-text("스프레드시트")'
    ];
    
    let spreadsheetButton = null;
    for (const selector of spreadsheetSelectors) {
      const element = await page.locator(selector).first();
      if (await element.count() > 0) {
        console.log(`✅ 스프레드시트 버튼 발견: ${selector}`);
        spreadsheetButton = element;
        break;
      }
    }
    
    if (spreadsheetButton && await spreadsheetButton.count() > 0) {
      await spreadsheetButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ 스프레드시트 모드 활성화');
    } else {
      console.log('⚠️ 스프레드시트 버튼을 찾을 수 없음');
      
      // 페이지의 모든 버튼 나열
      console.log('🔍 페이지의 모든 버튼들:');
      const allButtons = await page.locator('button').all();
      for (let i = 0; i < Math.min(allButtons.length, 15); i++) {
        const buttonText = await allButtons[i].textContent();
        const buttonVisible = await allButtons[i].isVisible();
        if (buttonVisible && buttonText.trim()) {
          console.log(`  버튼 ${i + 1}: "${buttonText.trim()}"`);
        }
      }
    }
    
    // 5. 설정 버튼 찾기
    console.log('⚙️ 설정 버튼 찾는 중...');
    
    const settingsSelectors = [
      'button[aria-label*="설정"]',
      'button[aria-label*="Setting"]',
      'button:has(svg[data-testid="SettingsIcon"])',
      'button:has-text("설정")',
      'button:has-text("Settings")',
      'button[title*="설정"]',
      'button[title*="Setting"]',
      'button[title*="스텝 관리"]',
      'button[aria-label*="스텝 관리"]',
      '.settings-button',
      '[data-testid="settings-button"]'
    ];
    
    let settingsButton = null;
    for (const selector of settingsSelectors) {
      const element = await page.locator(selector).first();
      if (await element.count() > 0 && await element.isVisible()) {
        console.log(`✅ 설정 버튼 발견: ${selector}`);
        settingsButton = element;
        break;
      }
    }
    
    if (settingsButton && await settingsButton.count() > 0) {
      // 설정 버튼 클릭 전 현재 상태 확인
      console.log('📊 설정 버튼 클릭 전 페이지 상태 확인...');
      
      // 현재 스텝 수 확인 (헤더에서)
      const stepHeaders = await page.locator('th:has-text("Step"), .step-header, th[title*="Step"]').count();
      console.log(`📊 현재 Step 헤더 수: ${stepHeaders}`);
      
      // 스프레드시트가 실제로 로드되었는지 확인
      const spreadsheetElement = await page.locator('.react-spreadsheet, [class*="spreadsheet"], table').count();
      console.log(`📊 스프레드시트 요소 수: ${spreadsheetElement}`);
      
      // 설정 버튼 클릭
      console.log('⚙️ 설정 버튼 클릭...');
      await settingsButton.click();
      await page.waitForTimeout(1000);
      
      // 6. 스텝 추가 메뉴 찾기
      console.log('➕ 스텝 추가 메뉴 찾는 중...');
      
      const stepAddSelectors = [
        'li:has-text("스텝 추가")',
        'menuitem:has-text("스텝 추가")',
        'li:has-text("Add Step")',
        'menuitem:has-text("Add Step")',
        '[role="menuitem"]:has-text("스텝")',
        'li:has(svg[data-testid="AddStepIcon"])',
        '[data-testid="add-step"]'
      ];
      
      let stepAddOption = null;
      for (const selector of stepAddSelectors) {
        const element = await page.locator(selector).first();
        if (await element.count() > 0 && await element.isVisible()) {
          console.log(`✅ 스텝 추가 옵션 발견: ${selector}`);
          stepAddOption = element;
          break;
        }
      }
      
      if (stepAddOption && await stepAddOption.count() > 0) {
        // 스텝 추가 전 상태
        const beforeStepHeaders = await page.locator('th:has-text("Step"), .step-header, th[title*="Step"]').count();
        console.log(`📊 스텝 추가 전 Step 헤더 수: ${beforeStepHeaders}`);
        
        // 스텝 추가 클릭
        console.log('➕ 스텝 추가 옵션 클릭...');
        await stepAddOption.click();
        await page.waitForTimeout(2000);
        
        // 스텝 추가 후 상태
        const afterStepHeaders = await page.locator('th:has-text("Step"), .step-header, th[title*="Step"]').count();
        console.log(`📊 스텝 추가 후 Step 헤더 수: ${afterStepHeaders}`);
        
        // 페이지의 전체 컬럼 헤더 확인
        const allHeaders = await page.locator('th, .column-header').allTextContents();
        console.log('📊 모든 컬럼 헤더:', allHeaders);
        
        // 결과 검증
        if (afterStepHeaders > beforeStepHeaders) {
          console.log('✅ 스텝 추가 기능이 정상 작동함!');
          console.log(`✅ 테스트 결과: 성공 (${beforeStepHeaders} → ${afterStepHeaders})`);
          return true;
        } else {
          console.log('❌ 스텝 추가 기능이 작동하지 않음');
          console.log(`❌ 테스트 결과: 실패 - 스텝 수가 증가하지 않음 (${beforeStepHeaders} → ${afterStepHeaders})`);
          
          // 에러 디버깅
          console.log('🔍 디버깅 정보 수집...');
          const pageContent = await page.content();
          console.log('📄 페이지에 "Step"이 포함된 텍스트:', pageContent.includes('Step'));
          
          return false;
        }
      } else {
        console.log('❌ 스텝 추가 메뉴를 찾을 수 없음');
        
        // 현재 열린 메뉴의 모든 항목 출력
        console.log('🔍 현재 메뉴의 모든 항목:');
        const menuItems = await page.locator('[role="menuitem"], li, .menu-item').all();
        for (let i = 0; i < menuItems.length; i++) {
          const itemText = await menuItems[i].textContent();
          const isVisible = await menuItems[i].isVisible();
          if (isVisible && itemText.trim()) {
            console.log(`  메뉴 ${i + 1}: "${itemText.trim()}"`);
          }
        }
        return false;
      }
    } else {
      console.log('❌ 설정 버튼을 찾을 수 없음');
      
      // 스프레드시트 영역 내의 모든 버튼 출력
      console.log('🔍 스프레드시트 영역의 모든 버튼:');
      const allButtons = await page.locator('button').all();
      for (let i = 0; i < allButtons.length; i++) {
        const buttonText = await allButtons[i].textContent();
        const buttonVisible = await allButtons[i].isVisible();
        const buttonAriaLabel = await allButtons[i].getAttribute('aria-label');
        if (buttonVisible) {
          console.log(`  버튼 ${i + 1}: "${buttonText.trim()}" (aria-label: "${buttonAriaLabel || 'N/A'}")`);
        }
      }
      return false;
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
    
    // 현재 페이지 상태 캡처
    const currentUrl = page.url();
    console.log(`📍 오류 발생 시 URL: ${currentUrl}`);
    
    // 스크린샷 저장
    await page.screenshot({ path: 'test-error-specific-url.png' });
    console.log('📸 오류 스크린샷 저장: test-error-specific-url.png');
    
    return false;
  } finally {
    // 브라우저 창 유지 (수동 확인을 위해)
    console.log('🔍 브라우저 창을 열어둡니다. 수동으로 확인 후 종료하세요.');
    console.log('종료하려면 터미널에서 Ctrl+C를 누르세요.');
    
    // 무한 대기
    await new Promise(() => {});
  }
}

// 테스트 실행
if (require.main === module) {
  testSpecificUrl()
    .then(result => {
      if (result) {
        console.log('🎉 전체 테스트 성공!');
      } else {
        console.log('💥 전체 테스트 실패! JIRA 이슈 생성이 필요합니다.');
      }
    })
    .catch(error => {
      console.error('💥 테스트 실행 중 치명적 오류:', error);
    });
}

module.exports = { testSpecificUrl };