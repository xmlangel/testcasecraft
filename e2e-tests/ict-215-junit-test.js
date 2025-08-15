// ICT-215: JUnit 결과 화면 API 엔드포인트 테스트
// Playwright를 사용하여 JUnit 결과 화면의 API 호출 및 404 오류 검증

const { chromium } = require('playwright');

async function testJunitResultsPage() {
  console.log('🚀 ICT-215: JUnit 결과 화면 API 엔드포인트 테스트 시작');
  
  const browser = await chromium.launch({ 
    headless: true,  // headless로 변경하여 안정성 향상
    slowMo: 500
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    // 로컬 환경 강제 설정
    baseURL: 'http://localhost:8080'
  });
  
  const page = await context.newPage();
  
  // API 요청들을 모니터링
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
  
  try {
    console.log('1. 베이스 페이지 로드...');
    // 먼저 페이지를 로드해야 fetch API가 작동함
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    console.log('2. 로컬 서버에서 직접 토큰 획득...');
    // 직접 API 호출로 토큰 받기
    const tokenResponse = await page.evaluate(async () => {
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
          // localStorage에 토큰 저장 (프론트엔드와 동일하게)
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
    
    if (!tokenResponse.success) {
      console.log(`❌ 로그인 실패: ${tokenResponse.error}`);
      throw new Error(`로그인 실패: ${tokenResponse.error}`);
    }
    
    console.log('✅ 토큰 획득 성공');
    const authToken = tokenResponse.token;
    
    console.log('3. 프로젝트 정보 가져오기...');
    // 프로젝트 ID 가져오기 (인증된 상태에서)
    const projectResponse = await page.evaluate(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/projects', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.ok) {
          const projects = await response.json();
          return { success: true, projects };
        } else {
          return { success: false, status: response.status };
        }
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    let projectId;
    if (!projectResponse.success || !projectResponse.projects || projectResponse.projects.length === 0) {
      console.log('⚠️ 프로젝트 API 호출 실패 또는 프로젝트 없음, 테스트용 ID 사용');
      projectId = '8656f686-4f72-4cee-a000-ab1f451c4df4';
    } else {
      projectId = projectResponse.projects[0].id;
      console.log(`✅ 프로젝트 ID 획득: ${projectId}`);
    }
    
    console.log('4. JUnit API 엔드포인트 테스트...');
    // JUnit API들을 직접 호출하여 검증
    const junitApiTests = await page.evaluate(async (projectId) => {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const results = [];
      
      // API 엔드포인트들 테스트
      const apis = [
        { name: 'JUnit Results List', url: `/api/junit-results/projects/${projectId}` },
        { name: 'JUnit Statistics', url: `/api/junit-results/statistics?projectId=${projectId}` },
        { name: 'JUnit Summary', url: `/api/junit-results/projects/${projectId}/summary` }
      ];
      
      for (const api of apis) {
        try {
          const response = await fetch(api.url, { headers });
          results.push({
            name: api.name,
            url: api.url,
            status: response.status,
            success: response.ok,
            data: response.ok ? await response.json() : null
          });
        } catch (error) {
          results.push({
            name: api.name,
            url: api.url,
            status: 0,
            success: false,
            error: error.message
          });
        }
      }
      
      return results;
    }, projectId);
    
    console.log('5. API 테스트 결과 분석...');
    
    // API 테스트 결과 출력
    console.log('\n📊 JUnit API 테스트 결과:');
    let allApiSuccess = true;
    let has404Error = false;
    
    junitApiTests.forEach(result => {
      const statusIcon = result.success ? '✅' : '❌';
      console.log(`   ${statusIcon} ${result.name}: ${result.status} ${result.url}`);
      
      if (!result.success) {
        allApiSuccess = false;
        if (result.status === 404) {
          has404Error = true;
        }
      }
    });
    
    // 네트워크 요청 로그 분석
    console.log('\n📝 모니터링된 API 요청:');
    const junitApiRequests = apiRequests.filter(req => req.url.includes('junit-results'));
    const junitFailedRequests = failedRequests.filter(req => req.url.includes('junit-results'));
    
    console.log(`   총 API 요청 수: ${apiRequests.length}`);
    console.log(`   JUnit 관련 요청 수: ${junitApiRequests.length}`);
    console.log(`   실패한 요청 수: ${failedRequests.length}`);
    
    if (junitApiRequests.length > 0) {
      console.log('\n📤 JUnit API 호출 상세:');
      junitApiRequests.forEach(req => {
        console.log(`   ${req.method} ${req.url}`);
      });
    }
    
    if (junitFailedRequests.length > 0) {
      console.log('\n❌ 실패한 JUnit API 요청:');
      junitFailedRequests.forEach(req => {
        console.log(`   ${req.status} ${req.url}`);
      });
    }
    
    // 최종 판정
    console.log('\n🏁 ICT-215 검증 결과:');
    console.log(`   JUnit API 직접 호출: ${allApiSuccess ? '✅ 모두 성공' : '❌ 일부 실패'}`);
    console.log(`   404 오류 발생: ${has404Error ? '❌ 있음' : '✅ 없음'}`);
    console.log(`   브라우저 API 모니터링: ${junitApiRequests.length > 0 ? '✅ 감지됨' : 'ℹ️ 감지되지 않음'}`);
    
    // 최종 결과 판정
    const testPassed = allApiSuccess && !has404Error;
    
    if (testPassed) {
      console.log('\n🎉 ICT-215 테스트 통과!');
      console.log('   ✅ 모든 JUnit API가 정상 응답');
      console.log('   ✅ 404 오류 없음');
      console.log('   ✅ API 엔드포인트 URL 불일치 문제 해결됨');
      return true;
    } else {
      console.log('\n⚠️ ICT-215 테스트 실패');
      if (!allApiSuccess) console.log('   ❌ JUnit API 호출 실패');
      if (has404Error) console.log('   ❌ 404 오류 발생');
      return false;
    }
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류 발생:', error);
    return false;
  } finally {
    await browser.close();
  }
}

// 테스트 실행 및 결과 처리
testJunitResultsPage()
  .then(result => {
    if (result) {
      console.log('\n✅ ICT-215 E2E 테스트 최종 결과: 통과');
      process.exit(0);
    } else {
      console.log('\n❌ ICT-215 E2E 테스트 최종 결과: 실패');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('\n💥 ICT-215 E2E 테스트 치명적 오류:', error);
    process.exit(1);
  });