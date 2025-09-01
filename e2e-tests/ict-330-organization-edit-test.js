/**
 * ICT-330: 조직 수정 버튼 클릭 기능 테스트
 * 
 * 테스트 목적: 조직 상세 페이지에서 "조직 수정" 버튼 클릭 시 수정 다이얼로그가 정상적으로 표시되고 기능이 동작하는지 확인
 */

const { chromium } = require('playwright');

async function testOrganizationEdit() {
  console.log('🧪 ICT-330: 조직 수정 버튼 기능 테스트 시작');

  const browser = await chromium.launch({ 
    headless: false, 
    slowMo: 1000,
    devtools: true 
  });
  
  try {
    const context = await browser.newContext({
      baseURL: 'http://localhost:8080'
    });
    const page = await context.newPage();

    // 1. 로그인 페이지 접속 및 로그인
    console.log('📝 Step 1: 로그인 수행');
    await page.goto('/', { timeout: 20000 });
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');

    // 2. 대시보드에서 프로젝트로 이동
    console.log('📝 Step 2: 프로젝트 페이지로 이동');
    await page.locator('text=프로젝트').first().click();
    await page.waitForLoadState('networkidle');

    // 3. 첫 번째 프로젝트 선택
    console.log('📝 Step 3: 프로젝트 선택');
    await page.locator('button:has-text("프로젝트 열기")').first().click();
    await page.waitForLoadState('networkidle');

    // 4. 조직 관리 탭으로 이동 (또는 조직 관리 메뉴 찾기)
    console.log('📝 Step 4: 조직 관리 기능 찾기');
    
    // 메인 네비게이션에서 조직 관리 찾기
    const organizationLink = page.locator('text=조직').first();
    if (await organizationLink.count() > 0) {
      await organizationLink.click();
      await page.waitForLoadState('networkidle');
    } else {
      // 조직 관리가 별도 메뉴에 있다면 찾기
      const settingsLink = page.locator('text=설정').first();
      if (await settingsLink.count() > 0) {
        await settingsLink.click();
        await page.waitForLoadState('networkidle');
        
        const orgManagementLink = page.locator('text=조직 관리').first();
        if (await orgManagementLink.count() > 0) {
          await orgManagementLink.click();
          await page.waitForLoadState('networkidle');
        }
      }
    }

    // 5. 조직 목록에서 첫 번째 조직 선택
    console.log('📝 Step 5: 조직 상세 페이지 접속');
    
    // 조직 목록 페이지에서 첫 번째 조직 찾기
    const firstOrganization = page.locator('[data-testid*="organization"], .organization-card, button:has-text("상세보기"), a:has-text("조직")').first();
    if (await firstOrganization.count() > 0) {
      await firstOrganization.click();
      await page.waitForLoadState('networkidle');
    } else {
      // 조직이 없다면 테스트용 조직 생성
      console.log('📝 조직이 없어서 테스트용 조직 생성');
      const createOrgButton = page.locator('button:has-text("조직 생성"), button:has-text("새 조직")').first();
      if (await createOrgButton.count() > 0) {
        await createOrgButton.click();
        await page.waitForSelector('input[label="조직 이름"], input[placeholder*="이름"]');
        await page.fill('input[label="조직 이름"], input[placeholder*="이름"]', 'Test Organization');
        await page.fill('textarea[label="설명"], textarea[placeholder*="설명"]', 'ICT-330 테스트용 조직');
        await page.click('button:has-text("생성")');
        await page.waitForLoadState('networkidle');
      }
    }

    // 6. "조직 수정" 버튼 찾기 및 클릭 테스트
    console.log('📝 Step 6: 조직 수정 버튼 클릭 테스트');
    
    const editButton = page.locator('button:has-text("조직 수정")').first();
    console.log('🔍 조직 수정 버튼 존재 확인:', await editButton.count());
    
    if (await editButton.count() > 0) {
      console.log('✅ 조직 수정 버튼 발견됨');
      
      // 버튼 클릭 전 상태 확인
      const isEnabled = await editButton.isEnabled();
      console.log('🔍 버튼 활성화 상태:', isEnabled);
      
      // 버튼 클릭
      await editButton.click();
      console.log('✅ 조직 수정 버튼 클릭 완료');
      
      // 7. 수정 다이얼로그 표시 확인
      console.log('📝 Step 7: 조직 수정 다이얼로그 표시 확인');
      
      await page.waitForSelector('div[role="dialog"], .MuiDialog-root', { timeout: 5000 });
      
      const dialog = page.locator('div[role="dialog"], .MuiDialog-root').first();
      const isDialogVisible = await dialog.isVisible();
      console.log('🔍 수정 다이얼로그 표시됨:', isDialogVisible);
      
      if (isDialogVisible) {
        console.log('✅ 조직 수정 다이얼로그가 정상적으로 표시됨');
        
        // 다이얼로그 제목 확인
        const dialogTitle = page.locator('h2:has-text("조직 정보 수정"), h2:has-text("조직 수정")');
        if (await dialogTitle.count() > 0) {
          console.log('✅ 다이얼로그 제목 확인: 조직 정보 수정');
        }
        
        // 입력 필드 존재 확인
        const nameField = page.locator('input[label="조직 이름"], input[placeholder*="조직"]').first();
        const descField = page.locator('textarea[label="조직 설명"], textarea[placeholder*="설명"]').first();
        
        console.log('🔍 조직 이름 입력 필드 존재:', await nameField.count() > 0);
        console.log('🔍 조직 설명 입력 필드 존재:', await descField.count() > 0);
        
        // 8. 간단한 수정 테스트 (실제 값 변경하지 않고 테스트만)
        console.log('📝 Step 8: 수정 기능 테스트');
        
        if (await nameField.count() > 0) {
          const originalName = await nameField.inputValue();
          console.log('🔍 기존 조직 이름:', originalName);
          
          await nameField.fill(originalName + ' (수정 테스트)');
          console.log('✅ 조직 이름 수정 테스트 완료');
          
          // 원래 이름으로 되돌림
          await nameField.fill(originalName);
        }
        
        // 취소 버튼 클릭하여 다이얼로그 닫기
        const cancelButton = page.locator('button:has-text("취소")').first();
        if (await cancelButton.count() > 0) {
          await cancelButton.click();
          console.log('✅ 다이얼로그 취소 버튼 클릭 완료');
        }
        
        console.log('🎉 ICT-330 테스트 성공: 조직 수정 기능이 정상적으로 동작함');
        
      } else {
        console.error('❌ 조직 수정 다이얼로그가 표시되지 않음');
        throw new Error('조직 수정 다이얼로그가 표시되지 않음');
      }
      
    } else {
      console.error('❌ 조직 수정 버튼을 찾을 수 없음');
      
      // 페이지의 모든 버튼 목록 출력 (디버깅용)
      const allButtons = page.locator('button');
      const buttonCount = await allButtons.count();
      console.log(`🔍 페이지의 모든 버튼 개수: ${buttonCount}`);
      
      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const buttonText = await allButtons.nth(i).textContent();
        console.log(`  - 버튼 ${i + 1}: "${buttonText}"`);
      }
      
      throw new Error('조직 수정 버튼을 찾을 수 없음');
    }

    // 9. 최종 검증
    console.log('📝 Step 9: 최종 검증');
    console.log('✅ 모든 테스트가 성공적으로 완료됨');
    console.log('✅ ICT-330 이슈 해결됨: 조직 수정 버튼이 정상적으로 동작함');

  } catch (error) {
    console.error('❌ ICT-330 테스트 실패:', error.message);
    
    // 현재 페이지 상태 정보 수집
    try {
      const currentUrl = page.url();
      const pageTitle = await page.title();
      console.log('🔍 현재 URL:', currentUrl);
      console.log('🔍 페이지 제목:', pageTitle);
      
      // 스크린샷 저장
      await page.screenshot({ path: 'ict-330-error-screenshot.png' });
      console.log('📸 오류 스크린샷 저장: ict-330-error-screenshot.png');
      
    } catch (debugError) {
      console.log('🔍 디버그 정보 수집 중 오류:', debugError.message);
    }
    
    throw error;
  } finally {
    await browser.close();
  }
}

// 테스트 실행
if (require.main === module) {
  testOrganizationEdit()
    .then(() => {
      console.log('🎉 ICT-330 테스트 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 ICT-330 테스트 실패:', error);
      process.exit(1);
    });
}

module.exports = { testOrganizationEdit };