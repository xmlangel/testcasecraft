// e2e-tests/ict-288-fixed-test.js
// ICT-288: 수정된 코드로 tester 계정 테스트

const { chromium } = require('playwright');

async function runICT288FixedTest() {
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 1000,
    args: ['--disable-web-security'] 
  });
  
  const context = await browser.newContext({
    baseURL: 'http://localhost:8080'
  });
  
  const page = await context.newPage();
  
  // 콘솔 로그 수집
  const consoleLogs = [];
  const apiErrors = [];
  
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    if (text.includes('ICT-288')) {
      console.log(`🔧 ${text}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/organizations') && !response.ok()) {
      apiErrors.push(`${response.status()} ${response.url()}`);
      console.log(`🚨 API 에러: ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    console.log('🛠️  ICT-288 수정 검증: tester 계정으로 조직별 프로젝트 표시 테스트');
    
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
    
    // 3. 조직별 프로젝트 탭 클릭
    console.log('3️⃣ 조직별 프로젝트 탭 클릭...');
    const orgTab = page.locator('text=조직별 프로젝트').first();
    if (await orgTab.count() > 0) {
      await orgTab.click();
      await page.waitForTimeout(3000);
    }
    
    // 4. 수정된 코드의 결과 확인
    console.log('4️⃣ 수정된 코드 결과 확인...');
    
    const hasNoOrgMessage = await page.locator('text=소속 조직이 없습니다').count() > 0;
    const hasNoProjectMessage = await page.locator('text=조직별 프로젝트가 없습니다').count() > 0;
    const hasLoadingSpinner = await page.locator('.MuiCircularProgress-root').count() > 0;
    const projectCards = await page.locator('[role="tabpanel"] .MuiCard-root').count();
    const orgNames = await page.locator('[role="tabpanel"] h5').allTextContents();
    
    // 5. QA팀 관련 프로젝트 확인
    const hasQATeamHeader = await page.locator('text=QA팀').count() > 0;
    const qaProjects = await page.locator('[role="tabpanel"]:has(h5:has-text("QA팀")) .MuiCard-root').count();
    
    console.log('');
    console.log('📊 ICT-288 수정된 코드 결과 분석:');
    console.log(`⏳ 로딩 스피너: ${hasLoadingSpinner}`);
    console.log(`❌ "소속 조직이 없습니다" 메시지: ${hasNoOrgMessage}`);
    console.log(`❌ "조직별 프로젝트가 없습니다" 메시지: ${hasNoProjectMessage}`);
    console.log(`📦 총 프로젝트 카드 수: ${projectCards}`);
    console.log(`🏢 조직명들: ${JSON.stringify(orgNames)}`);
    console.log(`🏢 QA팀 헤더 표시: ${hasQATeamHeader}`);
    console.log(`📦 QA팀 프로젝트 수: ${qaProjects}`);
    console.log(`🚨 API 에러 수: ${apiErrors.length}`);
    
    // 6. 개별 프로젝트 카드 확인
    const projectCardTexts = await page.locator('[role="tabpanel"] .MuiCard-root h6').allTextContents();
    console.log(`📋 프로젝트 카드 제목들: ${JSON.stringify(projectCardTexts)}`);
    
    // 7. 결과 판정
    console.log('');
    console.log('🏁 ICT-288 수정 결과:');
    
    if (hasNoOrgMessage) {
      console.log('❌ 수정 실패: 여전히 "소속 조직이 없습니다" 메시지 표시');
      return false;
    } else if (hasQATeamHeader && qaProjects >= 2) {
      console.log('✅ 수정 성공: QA팀 조직과 프로젝트가 정상 표시됨');
      console.log(`🎉 tester 계정으로 QA팀의 ${qaProjects}개 프로젝트 확인됨`);
      return true;
    } else if (projectCards > 0) {
      console.log('⚠️  부분 성공: 프로젝트는 표시되지만 조직 구조가 불완전');
      return false;
    } else {
      console.log('❌ 수정 실패: 프로젝트가 표시되지 않음');
      return false;
    }
    
  } catch (error) {
    console.error('❌ ICT-288 수정 테스트 실패:', error.message);
    return false;
  } finally {
    // 결과 스크린샷
    await page.screenshot({ 
      path: `e2e-tests/test-screenshots/ict-288-fixed-${Date.now()}.png`,
      fullPage: true 
    });
    
    // 콘솔 로그 출력
    console.log('');
    console.log('📋 수집된 ICT-288 관련 로그:');
    const ictLogs = consoleLogs.filter(log => log.includes('ICT-288'));
    ictLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
    
    await browser.close();
  }
}

// 실행
async function checkAndRunFixedTest() {
  try {
    const response = await fetch('http://localhost:8080');
    if (response.ok) {
      console.log('✅ 백엔드 서버 정상 동작 확인');
      const success = await runICT288FixedTest();
      
      if (success) {
        console.log('');
        console.log('🏆 ICT-288 완전 해결: tester 계정의 조직별 프로젝트 표시 문제 수정 완료!');
      } else {
        console.log('');
        console.log('🔧 ICT-288 추가 수정 필요: 문제가 완전히 해결되지 않음');
      }
      
      return success;
    } else {
      throw new Error('서버 응답 실패');
    }
  } catch (error) {
    console.log('❌ 백엔드 서버에 접근할 수 없습니다. 서버를 시작해주세요.');
    return false;
  }
}

if (require.main === module) {
  checkAndRunFixedTest().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runICT288FixedTest };