// e2e-tests/ict-288-org-project-test.js
// ICT-288: 프론트엔드 조직별 프로젝트 탭 표시 문제 테스트

const { chromium } = require('playwright');

async function runICT288Test() {
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 1000,
    args: ['--disable-web-security'] 
  });
  
  const context = await browser.newContext({
    baseURL: 'http://localhost:8080'
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🔍 ICT-288: 프론트엔드 조직별 프로젝트 탭 표시 문제 테스트 시작');
    
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
    
    // 3. 현재 URL 확인
    const currentURL = page.url();
    console.log(`📍 현재 URL: ${currentURL}`);
    
    // 4. 조직별 프로젝트 탭 확인 (기본 탭이어야 함)
    console.log('3️⃣ 조직별 프로젝트 탭 상태 확인...');
    
    // 탭이 존재하는지 확인
    const orgTab = page.locator('text=조직별 프로젝트').first();
    const orgTabExists = await orgTab.count() > 0;
    console.log(`📋 조직별 프로젝트 탭 존재: ${orgTabExists}`);
    
    if (orgTabExists) {
      // 탭 클릭
      await orgTab.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ 조직별 프로젝트 탭 클릭 완료');
    }
    
    // 5. 페이지 내용 확인
    console.log('4️⃣ 페이지 내용 분석...');
    
    // 조직이 있는지 확인
    const hasNoOrgMessage = await page.locator('text=소속 조직이 없습니다').count() > 0;
    const hasNoProjectMessage = await page.locator('text=조직별 프로젝트가 없습니다').count() > 0;
    
    console.log(`❌ "소속 조직이 없습니다" 메시지: ${hasNoOrgMessage}`);
    console.log(`❌ "조직별 프로젝트가 없습니다" 메시지: ${hasNoProjectMessage}`);
    
    // 실제 조직명들 확인
    const orgNames = await page.locator('[role="tabpanel"] h5').allTextContents();
    console.log(`📊 발견된 조직명들: ${JSON.stringify(orgNames)}`);
    
    // 프로젝트 카드들 확인
    const projectCards = await page.locator('[role="tabpanel"] .MuiCard-root').count();
    console.log(`📦 발견된 프로젝트 카드 수: ${projectCards}`);
    
    // 6. 개발자 도구에서 프론트엔드 상태 확인
    console.log('5️⃣ 브라우저 개발자 도구에서 상태 확인...');
    
    const frontendState = await page.evaluate(() => {
      // React 컴포넌트 상태 확인 시도
      const appElement = document.getElementById('root');
      const reactFiber = appElement?._reactInternalInstance || 
                        appElement?._reactInternals ||
                        Object.keys(appElement || {}).find(key => key.startsWith('__reactInternalInstance'));
      
      return {
        hasReactApp: !!appElement,
        hasLocalStorage: !!window.localStorage,
        currentPath: window.location.pathname,
        // API 데이터는 네트워크 탭에서 확인해야 함
      };
    });
    
    console.log('🖥️  프론트엔드 상태:', frontendState);
    
    // 7. 네트워크 요청 모니터링
    console.log('6️⃣ 네트워크 요청 모니터링...');
    
    // 페이지 새로고침으로 API 호출 다시 확인
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log(`🌐 API 응답: ${response.status()} ${response.url()}`);
      }
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 8. 최종 결과
    const finalHasNoOrgMessage = await page.locator('text=소속 조직이 없습니다').count() > 0;
    const finalHasNoProjectMessage = await page.locator('text=조직별 프로젝트가 없습니다').count() > 0;
    const finalProjectCards = await page.locator('[role="tabpanel"] .MuiCard-root').count();
    
    console.log('');
    console.log('🏁 ICT-288 테스트 결과:');
    console.log(`❌ "소속 조직이 없습니다" 표시: ${finalHasNoOrgMessage}`);
    console.log(`❌ "조직별 프로젝트가 없습니다" 표시: ${finalHasNoProjectMessage}`);
    console.log(`📦 표시된 프로젝트 카드 수: ${finalProjectCards}`);
    
    if (finalHasNoOrgMessage || finalHasNoProjectMessage) {
      console.log('🐛 문제 확인됨: 조직별 프로젝트가 올바르게 표시되지 않음');
    } else if (finalProjectCards > 0) {
      console.log('✅ 조직별 프로젝트가 정상적으로 표시됨');
    } else {
      console.log('⚠️  불명확한 상태: 추가 분석 필요');
    }
    
    // 디버깅용 스크린샷
    await page.screenshot({ 
      path: 'e2e-tests/test-screenshots/ict-288-debug.png',
      fullPage: true 
    });
    console.log('📸 디버깅 스크린샷 저장됨: ict-288-debug.png');
    
  } catch (error) {
    console.error('❌ ICT-288 테스트 실패:', error.message);
    
    // 에러 시 스크린샷
    await page.screenshot({ 
      path: 'e2e-tests/test-screenshots/ict-288-error.png',
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

// 백엔드 서버 상태 확인 후 테스트 실행
async function checkAndRunTest() {
  const { spawn } = require('child_process');
  
  try {
    const response = await fetch('http://localhost:8080');
    if (response.ok) {
      console.log('✅ 백엔드 서버 정상 동작 확인');
      await runICT288Test();
    } else {
      throw new Error('서버 응답 실패');
    }
  } catch (error) {
    console.log('❌ 백엔드 서버에 접근할 수 없습니다. 서버를 시작해주세요.');
    console.log('💡 실행 명령: ./gradlew bootRun');
  }
}

if (require.main === module) {
  checkAndRunTest();
}

module.exports = { runICT288Test };