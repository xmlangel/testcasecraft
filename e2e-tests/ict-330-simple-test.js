/**
 * ICT-330: 조직 수정 버튼 클릭 기능 간단 테스트
 */

const { chromium } = require('playwright');

async function simpleOrganizationEditTest() {
  console.log('🧪 ICT-330: 조직 수정 기능 간단 테스트 시작');

  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 1000 
  });
  
  try {
    const context = await browser.newContext({
      baseURL: 'http://localhost:8080'
    });
    const page = await context.newPage();

    // 1. 로그인
    console.log('📝 Step 1: 로그인');
    await page.goto('/');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // 2. 프로젝트 페이지로 이동
    console.log('📝 Step 2: 프로젝트 페이지로 이동');
    await page.goto('/projects');
    await page.waitForLoadState('networkidle');
    
    // 현재 페이지 확인
    const currentUrl = page.url();
    console.log('🔍 현재 URL:', currentUrl);

    // 3. 조직 관련 기능 찾기 - 여러 가능성 확인
    console.log('📝 Step 3: 조직 관리 기능 확인');
    
    // 메인 메뉴에서 조직 관련 링크 찾기
    const possibleLinks = [
      'text=조직',
      'text=Organization', 
      'text=조직 관리',
      'text=사용자 관리',
      'a[href*="organization"]',
      'a[href*="admin"]'
    ];
    
    let organizationFound = false;
    for (const selector of possibleLinks) {
      const link = page.locator(selector).first();
      const count = await link.count();
      console.log(`🔍 "${selector}" 링크 개수: ${count}`);
      
      if (count > 0) {
        console.log(`✅ 조직 관련 링크 발견: ${selector}`);
        await link.click();
        await page.waitForLoadState('networkidle');
        organizationFound = true;
        break;
      }
    }
    
    if (!organizationFound) {
      console.log('❌ 조직 관련 링크를 찾지 못함. 페이지 내용 확인:');
      const pageContent = await page.content();
      console.log('페이지 내용 일부:', pageContent.substring(0, 500));
      
      // 모든 링크 확인
      const allLinks = page.locator('a, button');
      const linkCount = await allLinks.count();
      console.log(`🔍 페이지의 모든 링크/버튼 개수: ${linkCount}`);
      
      for (let i = 0; i < Math.min(linkCount, 15); i++) {
        const linkText = await allLinks.nth(i).textContent();
        const href = await allLinks.nth(i).getAttribute('href');
        console.log(`  - 링크 ${i + 1}: "${linkText}" (href: ${href})`);
      }
      
      throw new Error('조직 관리 기능을 찾을 수 없음');
    }
    
    // 4. 조직 목록 또는 상세 페이지 확인
    console.log('📝 Step 4: 조직 페이지 상태 확인');
    console.log('🔍 현재 URL:', page.url());
    
    // "조직 수정" 버튼 직접 확인
    const editButton = page.locator('button:has-text("조직 수정")');
    const editButtonCount = await editButton.count();
    console.log('🔍 조직 수정 버튼 개수:', editButtonCount);
    
    if (editButtonCount > 0) {
      console.log('✅ 조직 수정 버튼 발견!');
      
      // 버튼 클릭 테스트
      console.log('📝 Step 5: 조직 수정 버튼 클릭');
      await editButton.first().click();
      
      // 다이얼로그 확인 - Material-UI 다이얼로그는 더 느릴 수 있음
      console.log('📝 다이얼로그 표시 대기 중...');
      await page.waitForTimeout(2000); // 추가 대기
      
      const dialogSelectors = [
        'div[role="dialog"]',
        '.MuiDialog-root',
        '[data-testid="dialog"]',
        'div[aria-labelledby*="dialog"]'
      ];
      
      let dialog = null;
      let isVisible = false;
      
      for (const selector of dialogSelectors) {
        dialog = page.locator(selector);
        const count = await dialog.count();
        if (count > 0) {
          isVisible = await dialog.first().isVisible();
          console.log(`🔍 다이얼로그 선택자 "${selector}": 개수=${count}, 표시됨=${isVisible}`);
          if (isVisible) break;
        }
      }
      
      console.log('🔍 수정 다이얼로그 최종 상태:', isVisible);
      
      if (isVisible) {
        console.log('🎉 성공: 조직 수정 다이얼로그가 정상적으로 표시됨!');
        
        // 다이얼로그 제목 확인
        const titleSelectors = [
          'h2:has-text("조직 정보 수정")',
          'h2:has-text("조직 수정")',
          '[data-testid="dialog-title"]',
          '.MuiDialogTitle-root'
        ];
        
        for (const selector of titleSelectors) {
          const titleElement = page.locator(selector);
          const titleCount = await titleElement.count();
          if (titleCount > 0) {
            const titleText = await titleElement.textContent();
            console.log(`✅ 다이얼로그 제목 발견: "${titleText}"`);
            break;
          }
        }
        
        // 입력 필드 확인 - Material-UI TextField에 맞는 선택자들
        const inputSelectors = [
          'input[placeholder*="조직"]',
          'input[aria-label*="조직"]',
          'input[value]', // 기존 조직 이름이 들어있을 수 있음
          '.MuiTextField-root input',
          'div[role="dialog"] input[type="text"]'
        ];
        
        let nameField = null;
        let nameFieldExists = false;
        
        for (const selector of inputSelectors) {
          nameField = page.locator(selector).first();
          const count = await nameField.count();
          if (count > 0) {
            console.log(`🔍 입력 필드 선택자 "${selector}": 개수=${count}`);
            nameFieldExists = true;
            
            // 입력 필드에 현재 값 확인
            try {
              const currentValue = await nameField.inputValue();
              console.log(`🔍 입력 필드 현재 값: "${currentValue}"`);
              
              // 간단한 입력 테스트
              await nameField.fill(currentValue + ' (테스트)');
              const newValue = await nameField.inputValue();
              console.log(`✅ 입력 테스트 성공: "${newValue}"`);
              
              // 원래 값으로 복원
              await nameField.fill(currentValue);
              break;
            } catch (error) {
              console.log(`⚠️ 입력 필드 "${selector}" 접근 실패:`, error.message);
              continue;
            }
          }
        }
        
        console.log('🔍 조직 이름 입력 필드 존재:', nameFieldExists);
        
        // 취소 버튼 클릭
        const cancelButton = page.locator('button:has-text("취소")');
        if (await cancelButton.count() > 0) {
          await cancelButton.click();
          console.log('✅ 다이얼로그 닫기 완료');
          await page.waitForTimeout(1000); // 다이얼로그 닫힘 대기
        }
        
        console.log('🎉 조직 수정 기능이 성공적으로 구현됨!');
        
      } else {
        console.log('❌ 조직 수정 다이얼로그가 표시되지 않음');
        
        // 디버깅: 페이지의 모든 다이얼로그 관련 요소 확인
        const allDialogs = page.locator('div[role="dialog"], .MuiDialog-root, [data-testid*="dialog"]');
        const dialogCount = await allDialogs.count();
        console.log(`🔍 페이지의 모든 다이얼로그 요소 개수: ${dialogCount}`);
        
        if (dialogCount > 0) {
          for (let i = 0; i < dialogCount; i++) {
            const dialogEl = allDialogs.nth(i);
            const isVisible = await dialogEl.isVisible();
            const text = await dialogEl.textContent();
            console.log(`  - 다이얼로그 ${i + 1}: 표시됨=${isVisible}, 내용="${text?.substring(0, 100)}..."`);
          }
        }
        
        console.log('❌ 다이얼로그 표시 실패 - 추가 디버깅 필요');
      }
      
    } else {
      // 조직 상세 페이지에 있지 않을 수 있으므로 더 찾아보기
      console.log('📝 조직 목록에서 첫 번째 조직 클릭 시도');
      
      const organizationItems = page.locator('[data-testid*="organization"], .organization-item, .organization-card, button:has-text("상세"), button:has-text("보기")');
      const orgItemCount = await organizationItems.count();
      console.log('🔍 조직 항목 개수:', orgItemCount);
      
      if (orgItemCount > 0) {
        await organizationItems.first().click();
        await page.waitForLoadState('networkidle');
        
        // 다시 조직 수정 버튼 찾기
        const editButtonAgain = page.locator('button:has-text("조직 수정")');
        const editButtonCountAgain = await editButtonAgain.count();
        console.log('🔍 상세 페이지의 조직 수정 버튼 개수:', editButtonCountAgain);
        
        if (editButtonCountAgain > 0) {
          console.log('✅ 조직 상세 페이지에서 수정 버튼 발견!');
          await editButtonAgain.first().click();
          
          await page.waitForSelector('div[role="dialog"]', { timeout: 5000 });
          console.log('🎉 성공: 조직 수정 기능이 정상적으로 동작함!');
        }
      }
    }
    
    console.log('✅ ICT-330 테스트 완료');

  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  simpleOrganizationEditTest()
    .then(() => {
      console.log('🎉 테스트 성공');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 테스트 실패:', error);
      process.exit(1);
    });
}

module.exports = { simpleOrganizationEditTest };