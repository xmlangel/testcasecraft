// ICT-245: 완전한 네비게이션 테스트 (JUnit 업로드 포함)

const { chromium } = require('playwright');
const path = require('path');

const ICT_245_COMPLETE_CONFIG = {
  baseURL: 'http://localhost:8080',
  adminCredentials: { username: 'admin', password: 'admin' },
  timeout: 30000
};

async function runICT245CompleteTest() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  try {
    const context = await browser.newContext({
      baseURL: ICT_245_COMPLETE_CONFIG.baseURL
    });
    const page = await context.newPage();
    
    console.log('🧪 ICT-245: 완전한 네비게이션 테스트 시작 (JUnit 업로드 포함)');
    
    // 1단계: 로그인
    console.log('1️⃣ 로그인 진행...');
    await page.goto('/');
    
    await page.fill('input[name="username"]', ICT_245_COMPLETE_CONFIG.adminCredentials.username);
    await page.fill('input[name="password"]', ICT_245_COMPLETE_CONFIG.adminCredentials.password);
    await page.click('button[type="submit"]');
    
    await page.waitForSelector('text=프로젝트', { timeout: ICT_245_COMPLETE_CONFIG.timeout });
    console.log('✅ 로그인 성공');
    
    // 2단계: 첫 번째 프로젝트 선택
    console.log('2️⃣ 프로젝트 선택...');
    const firstProject = await page.locator('.MuiCard-root').first();
    await firstProject.click();
    
    await page.waitForLoadState('networkidle');
    console.log('✅ 프로젝트 선택 완료');
    
    // 3단계: 자동화 테스트 탭으로 이동
    console.log('3️⃣ 자동화 테스트 탭으로 이동...');
    const automationTab = page.locator('text=자동화 테스트');
    await automationTab.click();
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    console.log('현재 URL:', currentUrl);
    
    if (!currentUrl.includes('/automation')) {
      console.log('❌ 자동화 테스트 탭 이동 실패');
      return false;
    }
    console.log('✅ 자동화 테스트 탭 이동 성공');
    
    // 4단계: JUnit XML 파일 업로드
    console.log('4️⃣ JUnit XML 파일 업로드...');
    
    const xmlFilePath = path.resolve(__dirname, 'sample-junit-result.xml');
    console.log('업로드할 파일 경로:', xmlFilePath);
    
    // 파일 업로드 버튼 찾기
    const uploadButtonSelectors = [
      'input[type="file"]',
      'input[accept*=".xml"]',
      'button:has-text("업로드")',
      'button:has-text("파일")',
      '[data-testid="upload-button"]'
    ];
    
    let uploadSuccess = false;
    for (const selector of uploadButtonSelectors) {
      const elements = await page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        console.log(`"${selector}" 선택자로 업로드 요소 발견`);
        try {
          if (selector.includes('input')) {
            // 파일 input에 직접 파일 설정
            await elements.first().setInputFiles(xmlFilePath);
            uploadSuccess = true;
            break;
          } else {
            // 버튼 클릭 후 파일 선택
            await elements.first().click();
            const fileInput = await page.locator('input[type="file"]').first();
            await fileInput.setInputFiles(xmlFilePath);
            uploadSuccess = true;
            break;
          }
        } catch (e) {
          console.log(`"${selector}" 업로드 실패: ${e.message}`);
        }
      }
    }
    
    if (uploadSuccess) {
      console.log('✅ 파일 선택 완료');
      
      // 업로드 확인 버튼 클릭 (있는 경우)
      const confirmButtons = await page.locator('button:has-text("확인"), button:has-text("업로드"), button[type="submit"]');
      const confirmCount = await confirmButtons.count();
      if (confirmCount > 0) {
        await confirmButtons.first().click();
        console.log('✅ 업로드 확인 버튼 클릭');
      }
      
      // 업로드 완료 대기
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(5000);
      console.log('✅ JUnit XML 업로드 완료');
    } else {
      console.log('⚠️ 업로드 버튼을 찾을 수 없음 - 기존 결과로 테스트 진행');
    }
    
    // 5단계: 업로드된 결과 또는 기존 결과 찾기
    console.log('5️⃣ 테스트 결과 확인...');
    await page.waitForTimeout(3000);
    
    // 결과 목록에서 상세보기 버튼 찾기
    const detailButtonSelectors = [
      'button:has-text("상세보기")',
      'button:has-text("보기")',
      'a:has-text("상세보기")',
      '[data-testid="view-details"]',
      '.MuiTableRow-root button',
      '.MuiListItem-root button'
    ];
    
    let detailClicked = false;
    for (const selector of detailButtonSelectors) {
      const elements = await page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        console.log(`"${selector}" 선택자로 ${count}개 상세보기 버튼 발견`);
        try {
          await elements.first().click();
          detailClicked = true;
          console.log('✅ 상세보기 버튼 클릭 성공');
          break;
        } catch (e) {
          console.log(`"${selector}" 클릭 실패: ${e.message}`);
        }
      }
    }
    
    if (!detailClicked) {
      console.log('❌ 상세보기 버튼을 찾을 수 없습니다.');
      return false;
    }
    
    // 상세 페이지 로딩 대기
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 6단계: "자동화 테스트로 돌아가기" 버튼 확인 및 테스트
    console.log('6️⃣ "자동화 테스트로 돌아가기" 버튼 확인 및 클릭 테스트...');
    
    const backButtons = await page.locator('text=자동화 테스트로 돌아가기');
    const backButtonCount = await backButtons.count();
    
    if (backButtonCount === 0) {
      // 이전 텍스트 확인
      const oldButtons = await page.locator('text=JUnit 결과로 돌아가기');
      const oldButtonCount = await oldButtons.count();
      
      if (oldButtonCount > 0) {
        console.log('❌ 아직 "JUnit 결과로 돌아가기" 텍스트가 사용됨 - 브라우저 캐시 또는 빌드 문제');
        return false;
      } else {
        console.log('❌ 돌아가기 버튼을 전혀 찾을 수 없습니다');
        return false;
      }
    }
    
    console.log(`✅ "자동화 테스트로 돌아가기" 버튼 ${backButtonCount}개 발견!`);
    
    // 네비게이션 테스트
    const beforeUrl = page.url();
    console.log('클릭 전 URL:', beforeUrl);
    
    await backButtons.first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const afterUrl = page.url();
    console.log('클릭 후 URL:', afterUrl);
    
    // 네비게이션 성공 검증
    if (afterUrl.includes('/automation')) {
      console.log('✅ 네비게이션 성공 - 자동화 테스트 탭으로 정확히 이동!');
      
      // 추가 검증: 페이지 내용 확인
      const pageTitle = await page.textContent('h1, h2, h3, .MuiTypography-h4, .MuiTypography-h5');
      console.log('페이지 제목/헤더:', pageTitle);
      
      return true;
    } else if (afterUrl.includes('/projects/') && !afterUrl.includes('/automation')) {
      console.log('⚠️ 프로젝트 페이지로 이동했지만 자동화 테스트 탭이 아님');
      
      // 탭이 활성화되어 있는지 확인
      try {
        const activeTab = await page.locator('.Mui-selected').textContent();
        if (activeTab && activeTab.includes('자동화')) {
          console.log('✅ 자동화 테스트 탭이 활성화됨 - 네비게이션 성공!');
          return true;
        } else {
          console.log(`❌ 잘못된 탭이 활성화됨: "${activeTab}"`);
          return false;
        }
      } catch (e) {
        console.log('❌ 활성 탭 확인 실패:', e.message);
        return false;
      }
    } else {
      console.log('❌ 네비게이션 실패 - 예상하지 못한 페이지로 이동');
      return false;
    }
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류 발생:', error.message);
    console.error('스택 트레이스:', error.stack);
    return false;
  } finally {
    await browser.close();
  }
}

// 테스트 실행
if (require.main === module) {
  runICT245CompleteTest().then(success => {
    if (success) {
      console.log('\n🎉 ICT-245 완전 테스트 성공!');
      console.log('✅ 1. 버튼 텍스트가 "자동화 테스트로 돌아가기"로 수정됨');
      console.log('✅ 2. 네비게이션이 자동화 테스트 탭으로 정확히 이동함');
      process.exit(0);
    } else {
      console.log('\n❌ ICT-245 완전 테스트 실패! 추가 확인이 필요합니다.');
      process.exit(1);
    }
  });
}

module.exports = { runICT245CompleteTest };