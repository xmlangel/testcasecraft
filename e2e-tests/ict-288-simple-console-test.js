// e2e-tests/ict-288-simple-console-test.js
// ICT-288: 브라우저 콘솔에서 직접 디버그 로그 확인

const { chromium } = require('playwright');

async function runICT288SimpleTest() {
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 500,
    args: ['--disable-web-security'] 
  });
  
  const context = await browser.newContext({
    baseURL: 'http://localhost:8080'
  });
  
  const page = await context.newPage();
  
  // 콘솔 로그 수집
  const consoleLogs = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    if (text.includes('ICT-288')) {
      console.log(`🐛 ${text}`);
    }
  });
  
  try {
    console.log('🔍 ICT-288: 간단한 콘솔 로그 테스트');
    
    // 로그인
    await page.goto('/', { timeout: 20000 });
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    console.log('1️⃣ 로그인 완료, 프로젝트 페이지로 이동');
    
    // 프로젝트 페이지로 이동
    await page.locator('text=프로젝트').first().click();
    await page.waitForLoadState('networkidle');
    
    // 잠시 대기하여 로그 수집
    await page.waitForTimeout(2000);
    
    console.log('2️⃣ 프로젝트 페이지 로딩 완료');
    
    // 조직별 프로젝트 탭 클릭
    const orgTab = page.locator('text=조직별 프로젝트').first();
    if (await orgTab.count() > 0) {
      console.log('3️⃣ 조직별 프로젝트 탭 클릭');
      await orgTab.click();
      await page.waitForTimeout(3000); // 디버그 로그 대기
    }
    
    // 현재 상태 확인
    const hasNoOrgMessage = await page.locator('text=소속 조직이 없습니다').count() > 0;
    const hasNoProjectMessage = await page.locator('text=조직별 프로젝트가 없습니다').count() > 0;
    const projectCards = await page.locator('[role="tabpanel"] .MuiCard-root').count();
    
    console.log('');
    console.log('📊 현재 상태:');
    console.log(`❌ "소속 조직이 없습니다" 메시지: ${hasNoOrgMessage}`);
    console.log(`❌ "조직별 프로젝트가 없습니다" 메시지: ${hasNoProjectMessage}`);  
    console.log(`📦 프로젝트 카드 수: ${projectCards}`);
    
    console.log('');
    console.log('📋 수집된 모든 콘솔 로그:');
    consoleLogs.forEach((log, index) => {
      if (log.includes('ICT-288') || log.includes('loadData') || log.includes('organization') || log.includes('project')) {
        console.log(`${index + 1}. ${log}`);
      }
    });
    
    // 스크린샷
    await page.screenshot({ 
      path: 'e2e-tests/test-screenshots/ict-288-simple-test.png',
      fullPage: true 
    });
    
    console.log('📸 스크린샷 저장: ict-288-simple-test.png');
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    await page.screenshot({ 
      path: 'e2e-tests/test-screenshots/ict-288-simple-error.png',
      fullPage: true 
    });
  } finally {
    // 브라우저를 열린 상태로 두어 수동으로 확인 가능
    console.log('');
    console.log('🔧 브라우저가 열린 상태로 유지됩니다. 수동으로 확인해보세요.');
    console.log('💡 개발자 도구(F12)를 열어 콘솔 로그를 확인해보세요.');
    console.log('⚠️  브라우저를 닫으면 테스트가 종료됩니다.');
    
    // 10분 대기 후 자동 종료
    setTimeout(async () => {
      console.log('⏰ 10분 대기 후 브라우저를 닫습니다.');
      await browser.close();
    }, 600000); // 10분
  }
}

// 실행
async function checkAndRunSimpleTest() {
  try {
    const response = await fetch('http://localhost:8080');
    if (response.ok) {
      console.log('✅ 백엔드 서버 정상 동작 확인');
      await runICT288SimpleTest();
    } else {
      throw new Error('서버 응답 실패');
    }
  } catch (error) {
    console.log('❌ 백엔드 서버에 접근할 수 없습니다. 서버를 시작해주세요.');
    console.log('💡 실행 명령: ./gradlew bootRun');
  }
}

if (require.main === module) {
  checkAndRunSimpleTest();
}

module.exports = { runICT288SimpleTest };