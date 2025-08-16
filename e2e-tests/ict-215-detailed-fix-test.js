// ICT-215: JUnit 403 오류 수정 후 상세 검증 테스트
// 실제 사용자 플로우로 JUnit 화면 접근 및 API 호출 모니터링

const { chromium } = require('playwright');

async function testJunitFixVerification() {
  console.log('🚀 ICT-215: JUnit 403 오류 수정 검증 테스트 시작');
  
  const browser = await chromium.launch({ 
    headless: false,  // UI 확인을 위해 headless false
    slowMo: 1000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    baseURL: 'http://localhost:8080'
  });
  
  const page = await context.newPage();
  
  // 네트워크 요청 및 응답 상세 모니터링
  const apiCalls = [];
  const failedCalls = [];
  
  page.on('request', request => {
    if (request.url().includes('/api/')) {
      const requestInfo = {
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        timestamp: new Date().toISOString()
      };
      apiCalls.push(requestInfo);
      console.log(`📤 API 요청: ${request.method()} ${request.url()}`);
      
      // Authorization 헤더 확인
      if (requestInfo.headers.authorization) {
        console.log(`🔑 인증 헤더: ${requestInfo.headers.authorization.substring(0, 20)}...`);
      } else {
        console.log(`⚠️ 인증 헤더 없음`);
      }
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('/api/')) {
      const status = response.status();
      const url = response.url();
      
      if (status >= 400) {
        failedCalls.push({
          url: url,
          status: status,
          timestamp: new Date().toISOString()
        });
        console.log(`❌ API 실패: ${status} ${url}`);
      } else {
        console.log(`✅ API 성공: ${status} ${url}`);
      }
    }
  });
  
  // 콘솔 로그 모니터링
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`🔥 콘솔 에러: ${msg.text()}`);
    }
  });
  
  try {
    console.log('1. 애플리케이션 접근...');
    await page.goto('/', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    console.log('2. 로그인 수행...');
    // 로그인 폼 찾기
    await page.waitForSelector('input[type="text"], input[name="username"]', { timeout: 10000 });
    
    // 사용자명과 비밀번호 입력
    await page.fill('input[type="text"], input[name="username"]', 'admin');
    await page.fill('input[type="password"], input[name="password"]', 'admin');
    
    // 로그인 버튼 클릭
    await page.click('button[type="submit"], button:has-text("로그인")');
    await page.waitForTimeout(3000);
    
    console.log('3. localStorage 토큰 확인...');
    const tokenCheck = await page.evaluate(() => {
      const accessToken = localStorage.getItem('accessToken');
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      
      return {
        accessToken: accessToken ? accessToken.substring(0, 20) + '...' : null,
        token: token ? token.substring(0, 20) + '...' : null,
        refreshToken: refreshToken ? refreshToken.substring(0, 20) + '...' : null
      };
    });
    
    console.log('🔑 저장된 토큰들:');
    console.log(`   accessToken: ${tokenCheck.accessToken || '없음'}`);
    console.log(`   token: ${tokenCheck.token || '없음'}`);
    console.log(`   refreshToken: ${tokenCheck.refreshToken || '없음'}`);
    
    console.log('4. 프로젝트 선택...');
    try {
      await page.waitForSelector('[data-testid="project-card"], .project-card, .MuiCard-root', { timeout: 10000 });
      await page.click('[data-testid="project-card"], .project-card, .MuiCard-root');
      await page.waitForTimeout(3000);
      console.log('✅ 프로젝트 선택 성공');
    } catch (e) {
      console.log('⚠️ 프로젝트 선택 실패, URL로 직접 이동');
      await page.goto('/projects/8656f686-4f72-4cee-a000-ab1f451c4df4/junit');
    }
    
    console.log('5. JUnit 메뉴 접근...');
    try {
      // 다양한 JUnit 메뉴 선택자 시도
      const junitSelectors = [
        'text=JUnit',
        '[data-testid="junit-menu"]',
        'button:has-text("JUnit")',
        '.MuiBottomNavigationAction-root:has-text("JUnit")'
      ];
      
      let junitFound = false;
      for (const selector of junitSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 2000 });
          await page.click(selector);
          junitFound = true;
          console.log(`✅ JUnit 메뉴 클릭: ${selector}`);
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!junitFound) {
        console.log('📍 JUnit URL 직접 접근...');
        await page.goto('/projects/8656f686-4f72-4cee-a000-ab1f451c4df4/junit');
      }
    } catch (e) {
      console.log('📍 JUnit URL 직접 접근...');
      await page.goto('/projects/8656f686-4f72-4cee-a000-ab1f451c4df4/junit');
    }
    
    console.log('6. JUnit 페이지 API 호출 대기...');
    await page.waitForTimeout(5000);
    
    // 현재 페이지 상태 확인
    const pageInfo = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        bodyText: document.body.textContent || '',
        hasJunitContent: (document.body.textContent || '').toLowerCase().includes('junit')
      };
    });
    
    console.log('📊 JUnit 페이지 분석:');
    console.log(`   URL: ${pageInfo.url}`);
    console.log(`   제목: ${pageInfo.title}`);
    console.log(`   JUnit 콘텐츠: ${pageInfo.hasJunitContent ? '있음' : '없음'}`);
    
    // API 호출 분석
    const junitApiCalls = apiCalls.filter(call => call.url.includes('junit'));
    const junitFailedCalls = failedCalls.filter(call => call.url.includes('junit'));
    
    console.log('\n📝 JUnit API 호출 분석:');
    console.log(`   총 API 호출: ${apiCalls.length}개`);
    console.log(`   JUnit API 호출: ${junitApiCalls.length}개`);
    console.log(`   실패한 JUnit API: ${junitFailedCalls.length}개`);
    
    if (junitApiCalls.length > 0) {
      console.log('\n📤 JUnit API 호출 목록:');
      junitApiCalls.forEach(call => {
        const hasAuth = call.headers.authorization ? '🔑' : '❌';
        console.log(`   ${hasAuth} ${call.method} ${call.url}`);
      });
    }
    
    if (junitFailedCalls.length > 0) {
      console.log('\n❌ 실패한 JUnit API:');
      junitFailedCalls.forEach(call => {
        console.log(`   ${call.status} ${call.url}`);
      });
    }
    
    // 최종 판정
    const success = junitFailedCalls.length === 0 && pageInfo.hasJunitContent;
    
    console.log('\n🏁 ICT-215 수정 검증 결과:');
    console.log(`   JUnit API 성공: ${junitFailedCalls.length === 0 ? '✅' : '❌'}`);
    console.log(`   JUnit 콘텐츠 로드: ${pageInfo.hasJunitContent ? '✅' : '❌'}`);
    console.log(`   전체 테스트: ${success ? '✅ 통과' : '❌ 실패'}`);
    
    return success;
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error);
    return false;
    
  } finally {
    await page.waitForTimeout(5000); // 결과 확인을 위해 대기
    await browser.close();
  }
}

// 테스트 실행
testJunitFixVerification()
  .then(result => {
    if (result) {
      console.log('\n🎉 ICT-215 수정 검증 성공!');
      process.exit(0);
    } else {
      console.log('\n⚠️ ICT-215 수정 검증 실패');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 ICT-215 수정 검증 오류:', error);
    process.exit(1);
  });