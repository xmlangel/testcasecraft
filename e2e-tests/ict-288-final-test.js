// e2e-tests/ict-288-final-test.js
// ICT-288: 수정된 코드의 조직별 프로젝트 표시 문제 최종 테스트

const { chromium } = require('playwright');

async function runICT288FinalTest() {
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
  page.on('console', msg => {
    const text = msg.text();
    consoleLogs.push(`[${msg.type()}] ${text}`);
    if (text.includes('ICT-288')) {
      console.log(`🐛 ${text}`);
    }
  });
  
  try {
    console.log('🔍 ICT-288 최종 테스트: 수정된 코드로 조직별 프로젝트 표시 확인');
    
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
    
    // 3. 로딩 상태 확인 (수정된 로직에서는 로딩 중에 스피너 표시)
    console.log('3️⃣ 로딩 상태 확인...');
    
    // 잠시 대기하여 로딩 완료 확인
    await page.waitForTimeout(3000);
    
    // 4. 조직별 프로젝트 탭 상태 확인
    console.log('4️⃣ 조직별 프로젝트 탭 상태 확인...');
    
    const orgTab = page.locator('text=조직별 프로젝트').first();
    if (await orgTab.count() > 0) {
      await orgTab.click();
      await page.waitForTimeout(2000);
      console.log('✅ 조직별 프로젝트 탭 클릭 완료');
    }
    
    // 5. 현재 상태 확인
    console.log('5️⃣ 최종 상태 확인...');
    
    const hasLoadingSpinner = await page.locator('.MuiCircularProgress-root').count() > 0;
    const hasNoOrgMessage = await page.locator('text=소속 조직이 없습니다').count() > 0;
    const hasNoProjectMessage = await page.locator('text=조직별 프로젝트가 없습니다').count() > 0;
    const projectCards = await page.locator('[role="tabpanel"] .MuiCard-root').count();
    const orgNames = await page.locator('[role="tabpanel"] h5').allTextContents();
    
    console.log('');
    console.log('📊 최종 상태 분석:');
    console.log(`⏳ 로딩 스피너 표시: ${hasLoadingSpinner}`);
    console.log(`❌ "소속 조직이 없습니다" 메시지: ${hasNoOrgMessage}`);
    console.log(`❌ "조직별 프로젝트가 없습니다" 메시지: ${hasNoProjectMessage}`);
    console.log(`📦 프로젝트 카드 수: ${projectCards}`);
    console.log(`🏢 조직명들: ${JSON.stringify(orgNames)}`);
    
    // 6. 페이지 새로고침으로 일관성 테스트
    console.log('6️⃣ 페이지 새로고침으로 일관성 테스트...');
    
    for (let i = 1; i <= 3; i++) {
      console.log(`  새로고침 ${i}/3 진행...`);
      await page.reload();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      // 조직별 프로젝트 탭 클릭
      const orgTabRefresh = page.locator('text=조직별 프로젝트').first();
      if (await orgTabRefresh.count() > 0) {
        await orgTabRefresh.click();
        await page.waitForTimeout(2000);
      }
      
      const refreshHasNoOrgMessage = await page.locator('text=소속 조직이 없습니다').count() > 0;
      const refreshHasNoProjectMessage = await page.locator('text=조직별 프로젝트가 없습니다').count() > 0;
      const refreshProjectCards = await page.locator('[role="tabpanel"] .MuiCard-root').count();
      
      console.log(`  ${i}회차 - 조직없음: ${refreshHasNoOrgMessage}, 프로젝트없음: ${refreshHasNoProjectMessage}, 카드수: ${refreshProjectCards}`);
      
      // 에러 상태가 발견되면 스크린샷 저장
      if (refreshHasNoOrgMessage || refreshHasNoProjectMessage) {
        await page.screenshot({ 
          path: `e2e-tests/test-screenshots/ict-288-final-error-${Date.now()}.png`,
          fullPage: true 
        });
        console.log(`🚨 에러 발견 - ${i}회차 스크린샷 저장됨`);
      }
    }
    
    // 7. 최종 결과 확인
    const finalHasNoOrgMessage = await page.locator('text=소속 조직이 없습니다').count() > 0;
    const finalHasNoProjectMessage = await page.locator('text=조직별 프로젝트가 없습니다').count() > 0;
    const finalProjectCards = await page.locator('[role="tabpanel"] .MuiCard-root').count();
    const finalOrgNames = await page.locator('[role="tabpanel"] h5').allTextContents();
    
    console.log('');
    console.log('🏁 ICT-288 최종 테스트 결과:');
    console.log(`❌ "소속 조직이 없습니다" 메시지: ${finalHasNoOrgMessage}`);
    console.log(`❌ "조직별 프로젝트가 없습니다" 메시지: ${finalHasNoProjectMessage}`);
    console.log(`📦 최종 프로젝트 카드 수: ${finalProjectCards}`);
    console.log(`🏢 최종 조직명들: ${JSON.stringify(finalOrgNames)}`);
    
    // 결과 판정
    if (finalHasNoOrgMessage || finalHasNoProjectMessage) {
      console.log('🐛 문제 여전히 존재: 조직별 프로젝트 표시 문제 발견');
    } else if (finalProjectCards > 0 && finalOrgNames.length > 0) {
      console.log('✅ 문제 해결됨: 조직별 프로젝트가 정상적으로 표시됨');
    } else {
      console.log('⚠️  불명확한 상태: 추가 분석 필요');
    }
    
    // 8. 수집된 디버그 로그 요약
    console.log('');
    console.log('📋 수집된 ICT-288 디버그 로그:');
    const ictLogs = consoleLogs.filter(log => log.includes('ICT-288'));
    ictLogs.forEach((log, index) => {
      console.log(`${index + 1}. ${log}`);
    });
    
    // 최종 스크린샷
    await page.screenshot({ 
      path: `e2e-tests/test-screenshots/ict-288-final-${Date.now()}.png`,
      fullPage: true 
    });
    console.log('📸 최종 테스트 스크린샷 저장됨');
    
  } catch (error) {
    console.error('❌ ICT-288 최종 테스트 실패:', error.message);
    
    await page.screenshot({ 
      path: `e2e-tests/test-screenshots/ict-288-final-error-${Date.now()}.png`,
      fullPage: true 
    });
  } finally {
    await browser.close();
  }
}

// 실행
async function checkAndRunFinalTest() {
  try {
    const response = await fetch('http://localhost:8080');
    if (response.ok) {
      console.log('✅ 백엔드 서버 정상 동작 확인');
      await runICT288FinalTest();
    } else {
      throw new Error('서버 응답 실패');
    }
  } catch (error) {
    console.log('❌ 백엔드 서버에 접근할 수 없습니다. 서버를 시작해주세요.');
    console.log('💡 실행 명령: ./gradlew bootRun');
  }
}

if (require.main === module) {
  checkAndRunFinalTest();
}

module.exports = { runICT288FinalTest };