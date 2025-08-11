// ICT-167: 테스트케이스 결과 입력 페이지 라우팅 E2E 테스트
const { chromium } = require('playwright');

async function testResultPageRouting() {
  console.log('🚀 ICT-167: 테스트케이스 결과 입력 페이지 라우팅 테스트 시작');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  const baseUrl = 'http://localhost:3000';

  try {
    // 1. 로그인
    console.log('1️⃣ 로그인 진행');
    await page.goto(`${baseUrl}/login`);
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // 2. 프로젝트 선택
    console.log('2️⃣ 프로젝트 선택');
    await page.click('text=프로젝트 선택하기');
    await page.waitForTimeout(1000);
    const projectItem = page.locator('[data-testid^="project-item-"]').first();
    await projectItem.click();
    await page.waitForTimeout(2000);

    // 3. 테스트 실행 탭으로 이동
    console.log('3️⃣ 테스트 실행 탭 이동');
    await page.click('text=테스트 실행');
    await page.waitForTimeout(2000);
    
    // 4. 진행중인 실행 찾기
    console.log('4️⃣ 테스트 실행 찾기');
    const viewButtons = page.locator('text=보기');
    if (await viewButtons.count() > 0) {
      await viewButtons.first().click();
      await page.waitForTimeout(3000);
      
      // 5. 결과입력 버튼 클릭
      console.log('5️⃣ 결과입력 버튼 클릭');
      const resultButtons = page.locator('text=결과입력');
      if (await resultButtons.count() > 0) {
        await resultButtons.first().click();
        await page.waitForTimeout(3000);
        
        // 6. URL 패턴 확인
        const currentUrl = page.url();
        console.log('현재 URL:', currentUrl);
        const urlMatch = currentUrl.match(/\/projects\/[^\/]+\/executions\/[^\/]+\/testcases\/[^\/]+\/result/);
        
        if (urlMatch) {
          console.log('✅ URL 라우팅 패턴 확인');
          
          // 7. 페이지 요소 확인
          try {
            await page.waitForSelector('text=테스트 결과 입력', { timeout: 5000 });
            console.log('✅ 페이지 제목 확인');
          } catch {
            console.log('❌ 페이지 제목을 찾을 수 없음');
          }
          
          // 8. 뒤로가기 버튼 확인
          try {
            await page.click('svg[data-testid="ArrowBackIcon"]');
            await page.waitForTimeout(2000);
            console.log('✅ 뒤로가기 기능 확인');
          } catch {
            console.log('❌ 뒤로가기 버튼을 찾을 수 없음');
          }
          
        } else {
          console.log('❌ URL 라우팅 패턴 불일치:', currentUrl);
        }
      } else {
        console.log('❌ 결과입력 버튼을 찾을 수 없음');
      }
    } else {
      console.log('❌ 테스트 실행을 찾을 수 없음');
    }

  } catch (error) {
    console.error('❌ E2E 테스트 오류:', error);
  } finally {
    await browser.close();
  }
}

// 실행
if (require.main === module) {
  testResultPageRouting();
}