// 로그인 플로우 디버깅 및 실제 UI 구조 파악

const { chromium } = require('playwright');

async function debugLoginFlow() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000  // 2초씩 매우 천천히
  });
  
  try {
    const context = await browser.newContext({
      baseURL: 'http://localhost:8080'
    });
    const page = await context.newPage();
    
    console.log('🔍 로그인 플로우 디버깅 시작...');
    
    // 1. 홈페이지 접속
    await page.goto('/');
    console.log('✅ 홈페이지 접속 완료');
    
    // 2. 초기 페이지 내용 확인
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const initialContent = await page.textContent('body');
    console.log('📄 초기 페이지 내용 미리보기:', initialContent.substring(0, 200) + '...');
    
    // 3. 로그인 폼 확인
    const loginForm = await page.locator('form, div:has(input[name="username"]), div:has(input[type="text"])').count();
    console.log('📝 로그인 폼 개수:', loginForm);
    
    if (loginForm === 0) {
      console.log('❌ 로그인 폼을 찾을 수 없습니다');
      return;
    }
    
    // 4. 로그인 진행
    console.log('🔐 로그인 진행...');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    
    console.log('✅ 로그인 버튼 클릭 완료');
    
    // 5. 로그인 후 페이지 로딩 대기 (더 긴 시간)
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(5000);  // 5초 대기
    
    // 6. 로그인 후 URL 확인
    const currentUrl = page.url();
    console.log('🌐 로그인 후 현재 URL:', currentUrl);
    
    // 7. 페이지 제목 확인
    const pageTitle = await page.title();
    console.log('📑 페이지 제목:', pageTitle);
    
    // 8. 주요 요소들 확인
    const h1Elements = await page.locator('h1').count();
    const h2Elements = await page.locator('h2').count();
    const h3Elements = await page.locator('h3').count();
    const h4Elements = await page.locator('h4').count();
    
    console.log(`📊 헤더 요소: h1=${h1Elements}, h2=${h2Elements}, h3=${h3Elements}, h4=${h4Elements}`);
    
    if (h1Elements > 0) {
      const h1Text = await page.locator('h1').first().textContent();
      console.log('🏷️ 첫 번째 h1 텍스트:', h1Text);
    }
    
    if (h4Elements > 0) {
      const h4Text = await page.locator('h4').first().textContent();
      console.log('🏷️ 첫 번째 h4 텍스트:', h4Text);
    }
    
    // 9. 프로젝트 관련 요소 찾기
    const projectTexts = await page.locator('text*=프로젝트').count();
    console.log('📁 "프로젝트" 포함 요소 개수:', projectTexts);
    
    if (projectTexts > 0) {
      const projectText = await page.locator('text*=프로젝트').first().textContent();
      console.log('📁 첫 번째 "프로젝트" 텍스트:', projectText);
    }
    
    // 10. 버튼 요소들 확인
    const allButtons = await page.locator('button').count();
    console.log('🔘 전체 버튼 개수:', allButtons);
    
    if (allButtons > 0) {
      for (let i = 0; i < Math.min(allButtons, 5); i++) {
        const buttonText = await page.locator('button').nth(i).textContent();
        console.log(`🔘 버튼 ${i + 1}: "${buttonText}"`);
      }
    }
    
    // 11. 카드 요소 확인
    const cards = await page.locator('.MuiCard-root, [class*="Card"]').count();
    console.log('🃏 카드 요소 개수:', cards);
    
    // 12. 전체 페이지 내용 샘플링
    const bodyContent = await page.textContent('body');
    const contentSample = bodyContent.replace(/\s+/g, ' ').substring(0, 500);
    console.log('📄 페이지 내용 샘플:', contentSample);
    
    // 13. 네비게이션/메뉴 요소 확인
    const navElements = await page.locator('nav, .MuiAppBar-root, .MuiTabs-root').count();
    console.log('🧭 네비게이션 요소 개수:', navElements);
    
    console.log('✅ 디버깅 완료 - 10초 후 브라우저 종료');
    await page.waitForTimeout(10000);
    
  } catch (error) {
    console.error('❌ 디버깅 중 오류:', error.message);
  } finally {
    await browser.close();
  }
}

// 실행
debugLoginFlow();