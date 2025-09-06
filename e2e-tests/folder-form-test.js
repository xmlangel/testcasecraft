// e2e-tests/folder-form-test.js - 폴더 이름/설명 필드 테스트

const { chromium } = require('playwright');

async function testFolderFormFields() {
  console.log('🚀 폴더 이름/설명 필드 E2E 테스트 시작...');

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
    console.log('📝 1단계: 로그인...');
    await page.goto('/', { timeout: 20000 });
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // 2. 프로젝트 선택
    console.log('📝 2단계: 프로젝트 선택...');
    await page.waitForSelector('button:has-text("프로젝트 열기")', { timeout: 10000 });
    await page.click('button:has-text("프로젝트 열기")', { force: true });
    await page.waitForLoadState('networkidle');
    
    // 3. 테스트케이스 탭으로 이동
    console.log('📝 3단계: 테스트케이스 탭 이동...');
    await page.waitForSelector('text=테스트케이스', { timeout: 10000 });
    await page.click('text=테스트케이스');
    await page.waitForLoadState('networkidle');
    
    // 4. 새 폴더 생성 버튼 클릭
    console.log('📝 4단계: 새 폴더 생성...');
    await page.waitForSelector('button:has-text("새 폴더")', { timeout: 10000 });
    await page.click('button:has-text("새 폴더")');
    await page.waitForLoadState('networkidle');
    
    // 5. 폴더 정보 섹션 확인
    console.log('📝 5단계: 폴더 정보 섹션 확인...');
    
    // 폴더 정보 Accordion 클릭하여 열기
    const folderInfoAccordion = page.locator('text=폴더 정보');
    await folderInfoAccordion.waitFor({ state: 'visible', timeout: 10000 });
    
    // Accordion이 닫혀있으면 클릭해서 열기
    const accordionSummary = page.locator('.MuiAccordionSummary-root:has-text("폴더 정보")');
    await accordionSummary.click();
    await page.waitForTimeout(1000);
    
    // 6. 이름 필드 확인 및 입력
    console.log('📝 6단계: 이름 필드 테스트...');
    const nameField = page.locator('input[placeholder="폴더 이름"]');
    await nameField.waitFor({ state: 'visible', timeout: 5000 });
    await nameField.fill('테스트 폴더');
    
    // 7. 설명 필드 확인 및 입력  
    console.log('📝 7단계: 설명 필드 테스트...');
    const descriptionField = page.locator('textarea[placeholder="폴더 설명"]');
    await descriptionField.waitFor({ state: 'visible', timeout: 5000 });
    await descriptionField.fill('이것은 테스트 폴더입니다.');
    
    // 8. 저장 버튼 클릭
    console.log('📝 8단계: 폴더 저장...');
    await page.click('button:has-text("저장")');
    await page.waitForLoadState('networkidle');
    
    // 9. 성공 메시지 확인
    console.log('📝 9단계: 저장 성공 확인...');
    await page.waitForSelector('text=저장되었습니다', { timeout: 10000 });
    
    console.log('✅ 폴더 이름/설명 필드 테스트 완료!');
    console.log('   - 폴더 정보 Accordion 섹션 존재 확인');
    console.log('   - 이름 입력 필드 정상 동작 확인');  
    console.log('   - 설명 입력 필드 정상 동작 확인');
    console.log('   - 폴더 저장 성공 확인');
    
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

// 테스트 실행
testFolderFormFields()
  .then(() => {
    console.log('🎉 모든 테스트 통과!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 테스트 실패:', error);
    process.exit(1);
  });