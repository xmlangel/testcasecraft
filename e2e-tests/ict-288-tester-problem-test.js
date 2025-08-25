// e2e-tests/ict-288-tester-problem-test.js
// ICT-288: tester 계정으로 조직별 프로젝트 표시 문제 재현 테스트

const { chromium } = require('playwright');

async function runICT288TesterTest() {
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
    console.log('🔍 ICT-288 tester 계정 문제 재현 테스트 시작');
    
    // 1. tester 계정으로 로그인
    console.log('1️⃣ tester 계정으로 로그인...');
    await page.goto('/', { timeout: 20000 });
    await page.fill('input[name="username"]', 'tester');
    await page.fill('input[name="password"]', 'tester');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // 2. 프로젝트 페이지로 이동
    console.log('2️⃣ 프로젝트 페이지로 이동...');
    await page.locator('text=프로젝트').first().click();
    await page.waitForLoadState('networkidle');
    
    // 3. 네트워크 에러 감지를 위한 리스너 추가
    const apiErrors = [];
    page.on('response', response => {
      if (response.url().includes('/api/organizations') && !response.ok()) {
        apiErrors.push(`${response.status()} ${response.url()}`);
        console.log(`🚨 API 에러 발견: ${response.status()} ${response.url()}`);
      }
    });
    
    // 4. 조직별 프로젝트 탭 확인
    console.log('3️⃣ 조직별 프로젝트 탭 상태 확인...');
    
    const orgTab = page.locator('text=조직별 프로젝트').first();
    if (await orgTab.count() > 0) {
      await orgTab.click();
      await page.waitForTimeout(3000);
      console.log('✅ 조직별 프로젝트 탭 클릭 완료');
    }
    
    // 5. 페이지 상태 확인
    console.log('4️⃣ tester 계정의 페이지 상태 분석...');
    
    const hasNoOrgMessage = await page.locator('text=소속 조직이 없습니다').count() > 0;
    const hasNoProjectMessage = await page.locator('text=조직별 프로젝트가 없습니다').count() > 0;
    const hasLoadingSpinner = await page.locator('.MuiCircularProgress-root').count() > 0;
    const projectCards = await page.locator('[role="tabpanel"] .MuiCard-root').count();
    const orgNames = await page.locator('[role="tabpanel"] h5').allTextContents();
    
    console.log('');
    console.log('📊 tester 계정 상태 분석:');
    console.log(`⏳ 로딩 스피너: ${hasLoadingSpinner}`);
    console.log(`❌ "소속 조직이 없습니다" 메시지: ${hasNoOrgMessage}`);
    console.log(`❌ "조직별 프로젝트가 없습니다" 메시지: ${hasNoProjectMessage}`);
    console.log(`📦 프로젝트 카드 수: ${projectCards}`);
    console.log(`🏢 조직명들: ${JSON.stringify(orgNames)}`);
    console.log(`🚨 API 에러 수: ${apiErrors.length}`);
    
    if (apiErrors.length > 0) {
      console.log('🔍 발견된 API 에러들:');
      apiErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    // 6. 브라우저 콘솔 에러 확인
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
        console.log(`🐛 콘솔 에러: ${msg.text()}`);
      }
    });
    
    // 페이지 새로고침으로 에러 재확인
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // 7. 결과 분석
    console.log('');
    console.log('🏁 ICT-288 tester 계정 문제 분석 결과:');
    
    if (hasNoOrgMessage) {
      console.log('🐛 문제 재현 성공: "소속 조직이 없습니다" 메시지 표시됨');
      console.log('💡 원인: tester 계정의 조직 목록 API 접근 권한 부족으로 추정');
    } else if (hasNoProjectMessage) {
      console.log('🐛 문제 재현 성공: "조직별 프로젝트가 없습니다" 메시지 표시됨');
    } else if (projectCards > 0) {
      console.log('✅ 정상 동작: 조직별 프로젝트가 표시됨');
    } else {
      console.log('⚠️  불명확한 상태: 추가 분석 필요');
    }
    
    if (apiErrors.length > 0) {
      console.log('🎯 핵심 문제: API 권한 문제가 조직별 프로젝트 표시에 영향을 미침');
    }
    
    // 스크린샷
    await page.screenshot({ 
      path: `e2e-tests/test-screenshots/ict-288-tester-problem-${Date.now()}.png`,
      fullPage: true 
    });
    console.log('📸 tester 계정 문제 스크린샷 저장됨');
    
    return {
      hasNoOrgMessage,
      hasNoProjectMessage,
      projectCards,
      apiErrors: apiErrors.length,
      consoleErrors: consoleErrors.length
    };
    
  } catch (error) {
    console.error('❌ ICT-288 tester 테스트 실패:', error.message);
    
    await page.screenshot({ 
      path: `e2e-tests/test-screenshots/ict-288-tester-error-${Date.now()}.png`,
      fullPage: true 
    });
    
    return null;
  } finally {
    await browser.close();
  }
}

// 실행
async function checkAndRunTesterTest() {
  try {
    const response = await fetch('http://localhost:8080');
    if (response.ok) {
      console.log('✅ 백엔드 서버 정상 동작 확인');
      const result = await runICT288TesterTest();
      if (result && result.hasNoOrgMessage) {
        console.log('');
        console.log('🎯 ICT-288 원인 확인: tester 계정의 조직 API 권한 문제');
        console.log('💡 해결 방안: 조직 API 접근 권한 문제 해결 또는 프론트엔드 에러 처리 개선');
      }
      return result;
    } else {
      throw new Error('서버 응답 실패');
    }
  } catch (error) {
    console.log('❌ 백엔드 서버에 접근할 수 없습니다. 서버를 시작해주세요.');
    console.log('💡 실행 명령: ./gradlew bootRun');
    return null;
  }
}

if (require.main === module) {
  checkAndRunTesterTest();
}

module.exports = { runICT288TesterTest };