// e2e-tests/ict-288-debug-test.js
// ICT-288: 디버깅 정보가 추가된 조직별 프로젝트 문제 분석

const { chromium } = require('playwright');

async function runICT288DebugTest() {
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 1000,
    args: ['--disable-web-security'] 
  });
  
  const context = await browser.newContext({
    baseURL: 'http://localhost:8080'
  });
  
  const page = await context.newPage();
  
  // 콘솔 로그 캡처
  const consoleLogs = [];
  page.on('console', msg => {
    if (msg.text().includes('ICT-288 Debug')) {
      consoleLogs.push(msg.text());
      console.log(`🐛 ${msg.text()}`);
    }
  });
  
  try {
    console.log('🔍 ICT-288 Debug: 조직별 프로젝트 문제 분석 시작');
    
    // 1. 로그인
    console.log('1️⃣ 로그인 진행...');
    await page.goto('/', { timeout: 20000 });
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // 2. 프로젝트 페이지로 이동
    console.log('2️⃣ 프로젝트 페이지로 이동...');
    await page.locator('text=프로젝트').first().click();
    await page.waitForLoadState('networkidle');
    
    // 3. 콘솔 로그를 수집하기 위해 잠시 대기
    await page.waitForTimeout(2000);
    
    // 4. 조직별 프로젝트 탭 클릭 (데이터 로딩 완료 후)
    console.log('3️⃣ 조직별 프로젝트 탭 클릭...');
    const orgTab = page.locator('text=조직별 프로젝트').first();
    if (await orgTab.count() > 0) {
      await orgTab.click();
      await page.waitForTimeout(3000); // 디버그 로그 수집을 위해 대기
    }
    
    // 5. 현재 상태 확인
    console.log('4️⃣ 현재 페이지 상태 확인...');
    
    const hasNoOrgMessage = await page.locator('text=소속 조직이 없습니다').count() > 0;
    const hasNoProjectMessage = await page.locator('text=조직별 프로젝트가 없습니다').count() > 0;
    const projectCards = await page.locator('[role="tabpanel"] .MuiCard-root').count();
    const orgNames = await page.locator('[role="tabpanel"] h5').allTextContents();
    
    console.log('');
    console.log('📊 페이지 상태 분석:');
    console.log(`❌ "소속 조직이 없습니다" 메시지: ${hasNoOrgMessage}`);
    console.log(`❌ "조직별 프로젝트가 없습니다" 메시지: ${hasNoProjectMessage}`);
    console.log(`📦 프로젝트 카드 수: ${projectCards}`);
    console.log(`🏢 조직명들: ${JSON.stringify(orgNames)}`);
    
    // 6. 브라우저 콘솔에서 직접 데이터 확인
    console.log('5️⃣ 브라우저에서 직접 React 상태 확인...');
    
    const reactStateInfo = await page.evaluate(() => {
      // 윈도우 객체에서 React 상태 접근 시도
      try {
        // 가능한 React DevTools나 글로벌 상태 확인
        return {
          currentURL: window.location.href,
          localStorage: Object.keys(window.localStorage).reduce((acc, key) => {
            acc[key] = window.localStorage.getItem(key);
            return acc;
          }, {}),
          sessionStorage: Object.keys(window.sessionStorage).reduce((acc, key) => {
            acc[key] = window.sessionStorage.getItem(key);
            return acc;
          }, {})
        };
      } catch (e) {
        return { error: e.message };
      }
    });
    
    console.log('🔧 브라우저 상태:', reactStateInfo);
    
    // 7. 페이지 새로고침 후 재확인
    console.log('6️⃣ 페이지 새로고침 후 재확인...');
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 조직별 프로젝트 탭 다시 클릭
    const orgTabAfterReload = page.locator('text=조직별 프로젝트').first();
    if (await orgTabAfterReload.count() > 0) {
      await orgTabAfterReload.click();
      await page.waitForTimeout(3000);
    }
    
    const finalHasNoOrgMessage = await page.locator('text=소속 조직이 없습니다').count() > 0;
    const finalHasNoProjectMessage = await page.locator('text=조직별 프로젝트가 없습니다').count() > 0;
    const finalProjectCards = await page.locator('[role="tabpanel"] .MuiCard-root').count();
    
    console.log('');
    console.log('🔄 새로고침 후 상태:');
    console.log(`❌ "소속 조직이 없습니다" 메시지: ${finalHasNoOrgMessage}`);
    console.log(`❌ "조직별 프로젝트가 없습니다" 메시지: ${finalHasNoProjectMessage}`);
    console.log(`📦 프로젝트 카드 수: ${finalProjectCards}`);
    
    // 8. 수집된 콘솔 로그 요약
    console.log('');
    console.log('📋 수집된 디버그 로그 요약:');
    consoleLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
    
    // 9. 최종 결과 및 분석
    console.log('');
    console.log('🏁 ICT-288 디버그 테스트 결과:');
    
    if (finalHasNoOrgMessage) {
      console.log('🐛 문제 확인됨: "소속 조직이 없습니다" 메시지 표시');
    } else if (finalHasNoProjectMessage) {
      console.log('🐛 문제 확인됨: "조직별 프로젝트가 없습니다" 메시지 표시');
    } else if (finalProjectCards > 0) {
      console.log('✅ 조직별 프로젝트가 정상적으로 표시됨');
    } else {
      console.log('⚠️  불명확한 상태: 추가 분석 필요');
    }
    
    // 디버깅 스크린샷
    await page.screenshot({ 
      path: 'e2e-tests/test-screenshots/ict-288-debug-final.png',
      fullPage: true 
    });
    console.log('📸 최종 디버깅 스크린샷 저장: ict-288-debug-final.png');
    
  } catch (error) {
    console.error('❌ ICT-288 디버그 테스트 실패:', error.message);
    
    await page.screenshot({ 
      path: 'e2e-tests/test-screenshots/ict-288-debug-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

// 실행
async function checkAndRunDebugTest() {
  try {
    const response = await fetch('http://localhost:8080');
    if (response.ok) {
      console.log('✅ 백엔드 서버 정상 동작 확인');
      await runICT288DebugTest();
    } else {
      throw new Error('서버 응답 실패');
    }
  } catch (error) {
    console.log('❌ 백엔드 서버에 접근할 수 없습니다. 서버를 시작해주세요.');
    console.log('💡 실행 명령: ./gradlew bootRun');
  }
}

if (require.main === module) {
  checkAndRunDebugTest();
}

module.exports = { runICT288DebugTest };