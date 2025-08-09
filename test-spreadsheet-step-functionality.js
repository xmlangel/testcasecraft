// test-spreadsheet-step-functionality.js
// 스프레드시트 스텝 추가 기능 테스트

const { chromium } = require('playwright');

async function testSpreadsheetStepFunctionality() {
  console.log('🚀 스프레드시트 스텝 추가 기능 테스트 시작');
  
  const browser = await chromium.launch({ 
    headless: false,  // UI 확인을 위해 브라우저 창 표시
    slowMo: 1000      // 동작을 천천히 실행
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. 애플리케이션 로드
    console.log('📱 애플리케이션 로드 중...');
    await page.goto('http://localhost:3000');
    
    // 페이지 로드 대기
    await page.waitForTimeout(3000);
    
    // 2. 로그인 수행
    console.log('🔐 로그인 수행 중...');
    
    // 로그인 폼이 보일 때까지 대기
    await page.waitForSelector('input[name="username"], input[type="text"]', { timeout: 10000 });
    
    // 사용자명과 비밀번호 입력
    await page.fill('input[name="username"], input[type="text"]', 'admin');
    await page.fill('input[name="password"], input[type="password"]', 'admin');
    
    // 로그인 버튼 클릭
    await page.click('button[type="submit"], button:has-text("로그인"), button:has-text("Login")');
    
    // 로그인 완료 대기 (프로젝트 목록이나 대시보드가 나타나길 기다림)
    await page.waitForSelector('text="프로젝트", text="Project", [data-testid="project-list"]', { timeout: 15000 });
    console.log('✅ 로그인 성공');
    
    // 3. 첫 번째 프로젝트 선택
    console.log('📂 프로젝트 선택 중...');
    const projectCard = await page.locator('div:has-text("프로젝트"), .project-card, [data-testid="project-card"]').first();
    if (await projectCard.count() > 0) {
      await projectCard.click();
      await page.waitForTimeout(2000);
    }
    
    // 4. 테스트케이스 페이지로 이동
    console.log('🧪 테스트케이스 페이지로 이동...');
    
    // 테스트케이스 메뉴나 버튼 찾기
    const testCaseButton = await page.locator('text="테스트케이스", text="Test Case", button:has-text("테스트"), button:has-text("Test")').first();
    if (await testCaseButton.count() > 0) {
      await testCaseButton.click();
      await page.waitForTimeout(2000);
    }
    
    // 5. 스프레드시트 모드 활성화
    console.log('📊 스프레드시트 모드 찾는 중...');
    
    // 스프레드시트 관련 버튼이나 토글 찾기
    const spreadsheetButton = await page.locator('text="스프레드시트", text="Spreadsheet", button:has-text("표"), button:has-text("Sheet")').first();
    if (await spreadsheetButton.count() > 0) {
      await spreadsheetButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ 스프레드시트 모드 활성화');
    } else {
      console.log('⚠️ 스프레드시트 버튼을 찾을 수 없음, 페이지에서 직접 확인 필요');
    }
    
    // 6. 설정 버튼 찾기 및 클릭
    console.log('⚙️ 설정 버튼 찾는 중...');
    
    // 설정 아이콘이나 버튼 찾기 (일반적인 패턴들)
    const settingsSelectors = [
      'button[aria-label*="설정"], button[aria-label*="Setting"]',
      'button:has(svg[data-testid="SettingsIcon"])',
      'button:has-text("설정")', 
      'button:has-text("Settings")',
      '.settings-button',
      '[data-testid="settings-button"]',
      'button[title*="설정"], button[title*="Setting"]'
    ];
    
    let settingsButton = null;
    for (const selector of settingsSelectors) {
      settingsButton = await page.locator(selector).first();
      if (await settingsButton.count() > 0) {
        console.log(`✅ 설정 버튼 발견: ${selector}`);
        break;
      }
    }
    
    if (settingsButton && await settingsButton.count() > 0) {
      await settingsButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ 설정 메뉴 열림');
      
      // 7. 스텝 추가 메뉴 찾기
      console.log('➕ 스텝 추가 메뉴 찾는 중...');
      
      const stepAddSelectors = [
        'text="스텝 추가"',
        'text="Add Step"', 
        'li:has-text("스텝")',
        'menuitem:has-text("스텝")',
        '[data-testid="add-step"]'
      ];
      
      let stepAddOption = null;
      for (const selector of stepAddSelectors) {
        stepAddOption = await page.locator(selector).first();
        if (await stepAddOption.count() > 0) {
          console.log(`✅ 스텝 추가 옵션 발견: ${selector}`);
          break;
        }
      }
      
      if (stepAddOption && await stepAddOption.count() > 0) {
        // 현재 스텝 수 확인
        const beforeStepCount = await page.locator('th:has-text("스텝"), th:has-text("Step"), .step-header').count();
        console.log(`📊 현재 스텝 수: ${beforeStepCount}`);
        
        // 스텝 추가 클릭
        await stepAddOption.click();
        await page.waitForTimeout(2000);
        
        // 추가 후 스텝 수 확인
        const afterStepCount = await page.locator('th:has-text("스텝"), th:has-text("Step"), .step-header').count();
        console.log(`📊 변경 후 스텝 수: ${afterStepCount}`);
        
        // 결과 검증
        if (afterStepCount > beforeStepCount) {
          console.log('✅ 스텝 추가 기능이 정상 작동함!');
          console.log(`✅ 테스트 결과: 성공 (${beforeStepCount} → ${afterStepCount})`);
          return true;
        } else {
          console.log('❌ 스텝 추가 기능이 작동하지 않음');
          console.log('❌ 테스트 결과: 실패 - 스텝 수가 증가하지 않음');
          return false;
        }
      } else {
        console.log('❌ 스텝 추가 메뉴를 찾을 수 없음');
        return false;
      }
    } else {
      console.log('❌ 설정 버튼을 찾을 수 없음');
      
      // 페이지의 모든 버튼 요소 나열해서 디버깅
      console.log('🔍 페이지의 모든 버튼 요소:');
      const allButtons = await page.locator('button').all();
      for (let i = 0; i < Math.min(allButtons.length, 10); i++) {
        const buttonText = await allButtons[i].textContent();
        const buttonTitle = await allButtons[i].getAttribute('title');
        const buttonAriaLabel = await allButtons[i].getAttribute('aria-label');
        console.log(`  버튼 ${i + 1}: "${buttonText}" (title: "${buttonTitle}", aria-label: "${buttonAriaLabel}")`);
      }
      return false;
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
    
    // 현재 페이지 상태 캡처
    const currentUrl = page.url();
    console.log(`📍 현재 URL: ${currentUrl}`);
    
    // 스크린샷 저장
    await page.screenshot({ path: 'test-error-screenshot.png' });
    console.log('📸 오류 스크린샷 저장: test-error-screenshot.png');
    
    return false;
  } finally {
    // 브라우저 창 유지 (수동 확인을 위해)
    console.log('🔍 브라우저 창을 열어둡니다. 수동으로 확인 후 종료하세요.');
    console.log('종료하려면 터미널에서 Ctrl+C를 누르세요.');
    
    // 일정 시간 대기 후 자동 종료 (선택사항)
    // await page.waitForTimeout(30000);
    // await browser.close();
  }
}

// 테스트 실행
if (require.main === module) {
  testSpreadsheetStepFunctionality()
    .then(result => {
      if (result) {
        console.log('🎉 전체 테스트 성공!');
        process.exit(0);
      } else {
        console.log('💥 전체 테스트 실패!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 테스트 실행 중 치명적 오류:', error);
      process.exit(1);
    });
}

module.exports = { testSpreadsheetStepFunctionality };