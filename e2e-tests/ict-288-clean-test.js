// e2e-tests/ict-288-clean-test.js
// ICT-288: 정리된 코드로 최종 검증 테스트

const { chromium } = require('playwright');

async function runICT288CleanTest() {
  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 500,
    args: ['--disable-web-security'] 
  });
  
  const context = await browser.newContext({
    baseURL: 'http://localhost:8080'
  });
  
  const page = await context.newPage();
  
  try {
    console.log('🎯 ICT-288 최종 검증: 정리된 코드로 조직별 프로젝트 표시 테스트');
    
    // 1. 로그인
    await page.goto('/', { timeout: 20000 });
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // 2. 프로젝트 페이지로 이동
    await page.locator('text=프로젝트').first().click();
    await page.waitForLoadState('networkidle');
    
    // 3. 조직별 프로젝트 탭 클릭
    const orgTab = page.locator('text=조직별 프로젝트').first();
    if (await orgTab.count() > 0) {
      await orgTab.click();
      await page.waitForTimeout(2000);
    }
    
    // 4. 최종 상태 확인
    const hasNoOrgMessage = await page.locator('text=소속 조직이 없습니다').count() > 0;
    const hasNoProjectMessage = await page.locator('text=조직별 프로젝트가 없습니다').count() > 0;
    const projectCards = await page.locator('[role="tabpanel"] .MuiCard-root').count();
    const orgNames = await page.locator('[role="tabpanel"] h5').allTextContents();
    
    console.log('');
    console.log('📊 ICT-288 최종 검증 결과:');
    console.log(`❌ "소속 조직이 없습니다" 메시지: ${hasNoOrgMessage}`);
    console.log(`❌ "조직별 프로젝트가 없습니다" 메시지: ${hasNoProjectMessage}`);
    console.log(`📦 프로젝트 카드 수: ${projectCards}`);
    console.log(`🏢 조직명들: ${JSON.stringify(orgNames)}`);
    
    // 결과 판정
    if (hasNoOrgMessage || hasNoProjectMessage) {
      console.log('🚨 실패: 조직별 프로젝트 표시 문제 여전히 존재');
      return false;
    } else if (projectCards >= 3 && orgNames.length >= 3) {
      console.log('✅ 성공: 조직별 프로젝트가 정상적으로 표시됨');
      console.log('🎉 ICT-288 문제 해결 완료!');
      return true;
    } else {
      console.log('⚠️  불완전: 일부 데이터 누락');
      return false;
    }
    
  } catch (error) {
    console.error('❌ ICT-288 검증 테스트 실패:', error.message);
    return false;
  } finally {
    await page.screenshot({ 
      path: `e2e-tests/test-screenshots/ict-288-clean-final.png`,
      fullPage: true 
    });
    await browser.close();
  }
}

// 실행
async function checkAndRunCleanTest() {
  try {
    const response = await fetch('http://localhost:8080');
    if (response.ok) {
      console.log('✅ 백엔드 서버 정상 동작 확인');
      const success = await runICT288CleanTest();
      if (success) {
        console.log('');
        console.log('🏆 ICT-288 수정 완료 - 조직별 프로젝트 표시 문제 해결됨');
      }
      return success;
    } else {
      throw new Error('서버 응답 실패');
    }
  } catch (error) {
    console.log('❌ 백엔드 서버에 접근할 수 없습니다. 서버를 시작해주세요.');
    console.log('💡 실행 명령: ./gradlew bootRun');
    return false;
  }
}

if (require.main === module) {
  checkAndRunCleanTest().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runICT288CleanTest };