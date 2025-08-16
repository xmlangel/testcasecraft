// e2e-tests/ict-222-simple-test.js
// ICT-222: 간단한 상세 리포트 탭 확인 테스트

const { chromium } = require('playwright');

async function simpleTabTest() {
  console.log('=== ICT-222: 간단한 상세 리포트 탭 테스트 ===');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    baseURL: 'http://localhost:8080'
  });
  const page = await context.newPage();

  try {
    // 1. 홈페이지 접속
    console.log('🌐 홈페이지 접속 중...');
    await page.goto('/', { timeout: 20000 });
    await page.waitForLoadState('networkidle');

    // 2. 로그인
    console.log('🔐 로그인 시도 중...');
    
    // 사용자명과 비밀번호 입력 필드 찾기
    const usernameField = await page.locator('input[name="username"], input[placeholder*="사용자"], input[type="text"]:first-of-type').first();
    const passwordField = await page.locator('input[name="password"], input[placeholder*="비밀번호"], input[type="password"]:first-of-type').first();
    
    if (await usernameField.isVisible()) {
      await usernameField.fill('admin');
      console.log('✅ 사용자명 입력 완료');
    }
    
    if (await passwordField.isVisible()) {
      await passwordField.fill('admin');
      console.log('✅ 비밀번호 입력 완료');
    }

    // 로그인 버튼 클릭
    const loginButton = await page.locator('button[type="submit"], button:has-text("로그인"), button:has-text("Login")').first();
    if (await loginButton.isVisible()) {
      await loginButton.click();
      console.log('✅ 로그인 버튼 클릭');
      await page.waitForLoadState('networkidle');
    }

    // 3. 프로젝트 페이지에서 첫 번째 프로젝트 선택
    console.log('📂 프로젝트 선택 중...');
    await page.waitForTimeout(2000);
    
    // 프로젝트 카드 또는 버튼 찾기
    const projectElements = await page.locator('.MuiCard-root, [data-testid*="project"], button:has-text("프로젝트")').all();
    if (projectElements.length > 0) {
      await projectElements[0].click();
      console.log('✅ 첫 번째 프로젝트 선택');
      await page.waitForLoadState('networkidle');
    }

    // 4. 페이지에서 "테스트 결과" 또는 관련 텍스트 찾기
    console.log('🎯 테스트 결과 페이지 찾기 중...');
    await page.waitForTimeout(2000);
    
    // 현재 페이지의 모든 텍스트 내용 확인
    const bodyText = await page.textContent('body');
    console.log('📄 페이지 주요 내용 키워드 확인:');
    
    const keywords = ['테스트', '결과', '리포트', '통계', '대시보드'];
    keywords.forEach(keyword => {
      const exists = bodyText.includes(keyword);
      console.log(`  - "${keyword}": ${exists ? '✅' : '❌'}`);
    });

    // 5. 테스트 결과 링크/버튼 클릭 시도
    const testResultSelectors = [
      'text="테스트 결과"',
      'a:has-text("테스트 결과")',
      'button:has-text("테스트 결과")',
      '[href*="test"], [href*="result"]',
      'text="Test Results"'
    ];

    let testResultFound = false;
    for (const selector of testResultSelectors) {
      try {
        const element = await page.locator(selector).first();
        if (await element.isVisible()) {
          await element.click();
          console.log(`✅ 테스트 결과 링크 클릭 성공: ${selector}`);
          testResultFound = true;
          await page.waitForLoadState('networkidle');
          break;
        }
      } catch (e) {
        // 계속 시도
      }
    }

    if (!testResultFound) {
      console.log('⚠️  테스트 결과 링크를 직접 찾을 수 없음. URL 직접 접근 시도...');
      
      // 다양한 URL 패턴 시도
      const testUrls = [
        '/test-results',
        '/results',
        '/dashboard',
        '/projects/1/results',
        '/testresults'
      ];
      
      for (const url of testUrls) {
        try {
          await page.goto(url, { timeout: 5000 });
          await page.waitForLoadState('networkidle');
          const currentUrl = page.url();
          console.log(`📍 시도한 URL: ${url}, 현재 URL: ${currentUrl}`);
          
          // 페이지에 탭이 있는지 확인
          const tabs = await page.locator('.MuiTab-root, [role="tab"]').all();
          if (tabs.length > 0) {
            console.log(`✅ ${url}에서 ${tabs.length}개 탭 발견!`);
            testResultFound = true;
            break;
          }
        } catch (e) {
          console.log(`❌ ${url} 접근 실패: ${e.message}`);
        }
      }
    }

    // 6. 현재 페이지에서 탭 구조 확인
    console.log('🔍 현재 페이지의 탭 구조 분석 중...');
    
    const tabs = await page.locator('.MuiTab-root, [role="tab"], .tab, [data-testid*="tab"]').all();
    console.log(`📋 발견된 탭 수: ${tabs.length}`);

    const tabInfo = [];
    for (let i = 0; i < tabs.length; i++) {
      try {
        const text = await tabs[i].textContent();
        const visible = await tabs[i].isVisible();
        tabInfo.push({ index: i, text: text?.trim(), visible });
        console.log(`  탭 ${i}: "${text?.trim()}" (표시: ${visible})`);
      } catch (e) {
        console.log(`  탭 ${i}: 텍스트 읽기 실패`);
      }
    }

    // 7. "상세 리포트" 탭 존재 확인
    const detailReportTab = tabInfo.find(tab => 
      tab.text && tab.text.includes('상세') && tab.text.includes('리포트')
    );

    if (detailReportTab) {
      console.log(`🎉 "상세 리포트" 탭 발견! (인덱스: ${detailReportTab.index})`);
      
      // 탭 클릭 시도
      try {
        await tabs[detailReportTab.index].click();
        await page.waitForTimeout(1000);
        console.log('✅ 상세 리포트 탭 클릭 성공');
        
        // 컨텐츠 확인
        const contentCheck = await page.textContent('body');
        const hasDevMessage = contentCheck.includes('개발 진행 중') || contentCheck.includes('개발 중');
        const hasReportHeader = contentCheck.includes('상세 리포트');
        
        console.log(`📄 컨텐츠 확인:`);
        console.log(`  - 개발 진행 중 메시지: ${hasDevMessage ? '✅' : '❌'}`);
        console.log(`  - 상세 리포트 헤더: ${hasReportHeader ? '✅' : '❌'}`);
        
      } catch (e) {
        console.log(`❌ 상세 리포트 탭 클릭 실패: ${e.message}`);
      }
    } else {
      console.log('❌ "상세 리포트" 탭을 찾을 수 없습니다.');
      console.log('📋 전체 탭 목록:');
      tabInfo.forEach(tab => {
        console.log(`  - "${tab.text}"`);
      });
    }

    // 8. 스크린샷 캡처
    await page.screenshot({ 
      path: 'e2e-tests/screenshots/ict-222-current-state.png',
      fullPage: true 
    });
    console.log('📸 현재 상태 스크린샷 저장 완료');

    return {
      success: detailReportTab !== undefined,
      tabCount: tabs.length,
      tabInfo: tabInfo,
      detailReportTabIndex: detailReportTab?.index || -1
    };

  } catch (error) {
    console.error('❌ 테스트 중 오류:', error.message);
    await page.screenshot({ 
      path: 'e2e-tests/screenshots/ict-222-error-simple.png',
      fullPage: true 
    });
    
    return {
      success: false,
      error: error.message
    };
  } finally {
    await browser.close();
  }
}

// 실행
if (require.main === module) {
  simpleTabTest()
    .then(result => {
      console.log('\n📊 테스트 결과:');
      console.log(`성공: ${result.success}`);
      console.log(`탭 수: ${result.tabCount}`);
      if (result.success) {
        console.log(`상세 리포트 탭 위치: ${result.detailReportTabIndex}`);
      }
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('테스트 실행 오류:', error);
      process.exit(1);
    });
}

module.exports = { simpleTabTest };