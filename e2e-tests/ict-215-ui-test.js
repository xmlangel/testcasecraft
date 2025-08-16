// ICT-215: JUnit 결과 화면 실제 UI 접근 테스트 (localhost 전용)
// 실제 사용자 시나리오로 JUnit 화면 접근 및 404 오류 확인

const { chromium } = require('playwright');

async function testJunitUIAccess() {
  console.log('🚀 ICT-215: JUnit UI 실제 접근 테스트 시작 (localhost 전용)');
  
  const browser = await chromium.launch({ 
    headless: true,  // 안정성을 위해 headless true
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    baseURL: 'http://localhost:8080'  // 반드시 localhost 사용
  });
  
  const page = await context.newPage();
  
  // localhost만 사용하도록 원격 서버 요청 차단
  await page.route('**/qaspecialist.shop/**', route => {
    console.log(`🚫 원격 서버 요청 차단: ${route.request().url()}`);
    route.abort();
  });
  
  await page.route('https://qaspecialist.shop/**', route => {
    console.log(`🚫 원격 서버 요청 차단: ${route.request().url()}`);
    route.abort();
  });
  
  // 네트워크 요청 모니터링
  const apiRequests = [];
  const failedRequests = [];
  
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      apiRequests.push({
        url: request.url(),
        method: request.method(),
        timestamp: new Date().toISOString()
      });
      console.log(`📤 API 요청: ${request.method()} ${request.url()}`);
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      const status = response.status();
      const url = response.url();
      
      if (status >= 400) {
        failedRequests.push({
          url: url,
          status: status,
          timestamp: new Date().toISOString()
        });
        console.log(`❌ API 오류: ${status} ${url}`);
      } else {
        console.log(`✅ API 성공: ${status} ${url}`);
      }
    }
  });
  
  // 콘솔 에러 모니터링
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
      console.log(`🔥 콘솔 에러: ${msg.text()}`);
    }
  });
  
  try {
    console.log('1. 애플리케이션 홈페이지 접근...');
    await page.goto('/', { 
      waitUntil: 'domcontentloaded',
      timeout: 20000 
    });
    
    console.log('2. 로그인 수행 (localhost API 직접 호출)...');
    // UI 폼 대신 직접 API로 로그인하여 원격 서버 호출 방지
    const loginResult = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: 'admin',
            password: 'admin'
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          // localStorage에 토큰 저장
          localStorage.setItem('token', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          return { success: true, token: data.accessToken };
        } else {
          return { success: false, status: response.status, error: 'Login failed' };
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    if (loginResult.success) {
      console.log('✅ 로그인 완료 (API 직접 호출)');
      // 페이지 새로고침하여 로그인 상태 반영
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
    } else {
      console.log(`⚠️ 로그인 실패: ${loginResult.error}`);
    }
    
    console.log('3. 프로젝트 선택...');
    // 프로젝트 카드 찾기 및 선택
    try {
      await page.waitForSelector('[data-testid="project-card"], .project-card, .MuiCard-root', { timeout: 15000 });
      const projectCard = page.locator('[data-testid="project-card"], .project-card, .MuiCard-root').first();
      await projectCard.click();
      await page.waitForTimeout(3000);
      console.log('✅ 프로젝트 선택 완료');
      
    } catch (projectError) {
      console.log('⚠️ 프로젝트 선택 실패, URL로 직접 이동:', projectError.message);
    }
    
    console.log('4. JUnit 메뉴 접근...');
    // JUnit 메뉴 찾기 및 클릭
    let junitAccessSuccess = false;
    
    // 다양한 자동화 테스트 메뉴 셀렉터 시도
    const automationSelectors = [
      'text=자동화 테스트',
      '[data-testid="automation-menu"]',
      'button:has-text("자동화 테스트")',
      'a:has-text("자동화 테스트")',
      '.MuiBottomNavigationAction-root:has-text("자동화 테스트")',
      '.menu-item:has-text("자동화 테스트")',
      '[href*="junit"]'
    ];
    
    for (const selector of automationSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        await page.click(selector);
        await page.waitForTimeout(3000);
        junitAccessSuccess = true;
        console.log(`✅ JUnit 메뉴 클릭 성공: ${selector}`);
        break;
      } catch (e) {
        console.log(`⏭️ JUnit 셀렉터 실패: ${selector}`);
      }
    }
    
    if (!junitAccessSuccess) {
      console.log('5. JUnit URL 직접 접근...');
      // 직접 JUnit URL로 이동 (localhost 전용)
      const projectId = await page.evaluate(() => {
        // 현재 URL에서 프로젝트 ID 추출 시도
        const url = window.location.href;
        const match = url.match(/projects\/([^\/]+)/);
        return match ? match[1] : '8656f686-4f72-4cee-a000-ab1f451c4df4';
      });
      
      // localhost 경로로 이동 (baseURL 사용)
      const junitPath = `/projects/${projectId}/junit`;
      console.log(`📍 JUnit 경로 직접 접근: ${junitPath}`);
      
      await page.goto(junitPath, { 
        waitUntil: 'networkidle',
        timeout: 20000
      });
    }
    
    console.log('6. JUnit 화면 상태 확인...');
    await page.waitForTimeout(5000);
    
    // 현재 URL 확인
    const currentUrl = page.url();
    console.log(`📍 현재 URL: ${currentUrl}`);
    
    // 페이지 제목 확인
    const pageTitle = await page.title();
    console.log(`📄 페이지 제목: ${pageTitle}`);
    
    // 오류 메시지 확인
    const errorMessages = await page.evaluate(() => {
      const errors = [];
      const errorTexts = [
        '테스트 결과를 불러오는데 실패했습니다',
        '404 Not Found',
        '404',
        'Not Found',
        '서버 오류',
        'API 오류',
        '데이터를 불러올 수 없습니다',
        '오류가 발생했습니다',
        'Failed to load',
        'Error'
      ];
      
      const bodyText = document.body.textContent || document.body.innerText || '';
      errorTexts.forEach(text => {
        if (bodyText.includes(text)) {
          errors.push(text);
        }
      });
      
      return errors;
    });
    
    // JUnit 관련 UI 요소 확인
    const junitElements = await page.evaluate(() => {
      const elements = [];
      
      // JUnit 관련 텍스트나 요소들
      const junitTexts = ['junit', 'JUnit', '테스트 결과', '업로드', 'XML'];
      const bodyText = document.body.textContent || document.body.innerText || '';
      
      junitTexts.forEach(text => {
        if (bodyText.toLowerCase().includes(text.toLowerCase())) {
          elements.push(text);
        }
      });
      
      return elements;
    });
    
    console.log('\n📊 UI 상태 분석:');
    console.log(`   현재 URL: ${currentUrl}`);
    console.log(`   페이지 제목: ${pageTitle}`);
    console.log(`   오류 메시지: ${errorMessages.length > 0 ? errorMessages.join(', ') : '없음'}`);
    console.log(`   JUnit UI 요소: ${junitElements.length > 0 ? junitElements.join(', ') : '없음'}`);
    console.log(`   콘솔 에러: ${consoleErrors.length}개`);
    
    // API 요청 분석
    const junitApiRequests = apiRequests.filter(req => req.url.includes('junit'));
    const junitFailedRequests = failedRequests.filter(req => req.url.includes('junit'));
    const has404Error = failedRequests.some(req => req.status === 404);
    
    console.log('\n📝 API 요청 분석:');
    console.log(`   총 API 요청: ${apiRequests.length}개`);
    console.log(`   JUnit API 요청: ${junitApiRequests.length}개`);
    console.log(`   실패한 요청: ${failedRequests.length}개`);
    console.log(`   404 오류: ${has404Error ? '있음' : '없음'}`);
    
    if (junitFailedRequests.length > 0) {
      console.log('\n❌ 실패한 JUnit API:');
      junitFailedRequests.forEach(req => {
        console.log(`   ${req.status} ${req.url}`);
      });
    }
    
    // 최종 판정
    const hasUIErrors = errorMessages.length > 0;
    const hasConsoleErrors = consoleErrors.length > 0;
    const hasApiErrors = junitFailedRequests.length > 0;
    const hasJunitContent = junitElements.length > 0;
    
    console.log('\n🏁 ICT-215 실제 UI 테스트 결과:');
    console.log(`   UI 오류 메시지: ${hasUIErrors ? '❌ 발견' : '✅ 없음'}`);
    console.log(`   콘솔 에러: ${hasConsoleErrors ? '❌ 발견' : '✅ 없음'}`);
    console.log(`   JUnit API 오류: ${hasApiErrors ? '❌ 발견' : '✅ 없음'}`);
    console.log(`   JUnit 콘텐츠: ${hasJunitContent ? '✅ 있음' : '❌ 없음'}`);
    console.log(`   404 오류: ${has404Error ? '❌ 있음' : '✅ 없음'}`);
    
    const testPassed = !hasUIErrors && !has404Error && !hasApiErrors;
    
    if (testPassed) {
      console.log('\n🎉 ICT-215 실제 UI 테스트 통과!');
      console.log('   사용자가 실제로 JUnit 화면에 접근할 수 있습니다.');
      return true;
    } else {
      console.log('\n⚠️ ICT-215 실제 UI 테스트 실패');
      console.log('   사용자가 JUnit 화면에 제대로 접근할 수 없습니다.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ UI 테스트 실행 중 오류:', error);
    return false;
    
  } finally {
    await page.waitForTimeout(5000); // 결과 확인을 위해 잠시 대기
    await browser.close();
  }
}

// 테스트 실행
testJunitUIAccess()
  .then(result => {
    if (result) {
      console.log('\n✅ ICT-215 실제 UI 테스트 최종 결과: 통과');
      process.exit(0);
    } else {
      console.log('\n❌ ICT-215 실제 UI 테스트 최종 결과: 실패');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 ICT-215 실제 UI 테스트 치명적 오류:', error);
    process.exit(1);
  });