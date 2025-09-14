/**
 * ICT-357: 화면 구조 파악을 위한 단계별 검사 스크립트
 * 실제 화면을 확인하여 스프레드시트 버그 재현 테스트를 위한 정확한 구조 파악
 */

const { chromium } = require('playwright');

async function inspectScreenStructure() {
  let browser, context, page;
  
  try {
    console.log('🔍 화면 구조 파악 시작');
    
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 2000
    });
    
    context = await browser.newContext({
      baseURL: 'http://localhost:8080'
    });
    
    page = await context.newPage();
    
    // 1단계: 로그인 화면 확인
    console.log('\n📍 1단계: 로그인 화면 구조 확인');
    await page.goto('/', { timeout: 20000 });
    
    // 로그인 폼 요소들 확인
    const loginElements = await page.locator('form').count();
    const usernameInput = await page.locator('input[name="username"]').count();
    const passwordInput = await page.locator('input[name="password"]').count();
    const submitButton = await page.locator('button[type="submit"]').count();
    
    console.log(`  - 로그인 폼: ${loginElements}개`);
    console.log(`  - 사용자명 입력: ${usernameInput}개`);
    console.log(`  - 비밀번호 입력: ${passwordInput}개`);
    console.log(`  - 제출 버튼: ${submitButton}개`);
    
    // 로그인 실행
    console.log('  - 로그인 실행...');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForURL('**/projects', { timeout: 10000 });
    
    // 2단계: 프로젝트 목록 화면 확인
    console.log('\n📍 2단계: 프로젝트 목록 화면 구조 확인');
    
    // 프로젝트 관련 요소들 확인
    const projectCards = await page.locator('[data-testid="project-card"]').count();
    const projectOpenButtons = await page.locator('button:has-text("프로젝트 열기")').count();
    const createProjectButtons = await page.locator('button:has-text("새 프로젝트")').count();
    
    console.log(`  - 프로젝트 카드: ${projectCards}개`);
    console.log(`  - 프로젝트 열기 버튼: ${projectOpenButtons}개`);
    console.log(`  - 새 프로젝트 버튼: ${createProjectButtons}개`);
    
    if (projectOpenButtons > 0) {
      console.log('  - 첫 번째 프로젝트 열기...');
      await page.locator('button:has-text("프로젝트 열기")').first().click();
      await page.waitForLoadState('networkidle');
      await page.waitForURL('**/projects/**', { timeout: 10000 });
    }
    
    // 3단계: 프로젝트 내부 탭 구조 확인
    console.log('\n📍 3단계: 프로젝트 내부 탭 구조 확인');
    
    const tabs = await page.locator('[role="tab"], .MuiTab-root').allTextContents();
    console.log('  - 탭 목록:');
    tabs.forEach((tab, index) => {
      console.log(`    ${index + 1}. "${tab}"`);
    });
    
    // 테스트케이스 탭으로 이동 (정확한 탭 선택)
    const testCaseTab = page.getByRole('tab', { name: '테스트케이스' });
    if (await testCaseTab.count() > 0) {
      console.log('  - 테스트케이스 탭으로 이동...');
      await testCaseTab.click();
      await page.waitForLoadState('networkidle');
    }
    
    // 4단계: 테스트케이스 화면 구조 확인
    console.log('\n📍 4단계: 테스트케이스 화면 구조 확인');
    
    // 주요 버튼들 확인
    const newFolderBtn = await page.locator('button:has-text("새 폴더")').count();
    const newTestCaseBtn = await page.locator('button:has-text("새 테스트케이스")').count();
    const spreadsheetBtn = await page.locator('button:has-text("스프레드시트")').count();
    const treeBtn = await page.locator('button:has-text("트리")').count();
    const importBtn = await page.locator('button:has-text("가져오기")').count();
    const exportBtn = await page.locator('button:has-text("내보내기")').count();
    
    console.log(`  - 새 폴더 버튼: ${newFolderBtn}개`);
    console.log(`  - 새 테스트케이스 버튼: ${newTestCaseBtn}개`);
    console.log(`  - 스프레드시트 버튼: ${spreadsheetBtn}개`);
    console.log(`  - 트리 버튼: ${treeBtn}개`);
    console.log(`  - 가져오기 버튼: ${importBtn}개`);
    console.log(`  - 내보내기 버튼: ${exportBtn}개`);
    
    // 현재 화면의 주요 콘텐츠 영역 확인
    const treeView = await page.locator('[data-testid="test-case-tree"]').count();
    const spreadsheetView = await page.locator('[data-testid="spreadsheet"]').count();
    const formView = await page.locator('form').count();
    
    console.log(`  - 트리 뷰: ${treeView}개`);
    console.log(`  - 스프레드시트 뷰: ${spreadsheetView}개`);
    console.log(`  - 폼 뷰: ${formView}개`);
    
    // 현재 존재하는 테스트케이스/폴더 확인
    const existingItems = await page.locator('[data-testid*="tree-item"], .MuiTreeItem-root').allTextContents();
    console.log('  - 기존 항목들:');
    existingItems.slice(0, 10).forEach((item, index) => {
      console.log(`    ${index + 1}. "${item}"`);
    });
    
    // 스크린샷 저장
    await page.screenshot({ 
      path: 'e2e-tests/screenshots/screen-inspection-testcase-tab.png',
      fullPage: true 
    });
    
    // 5단계: 스프레드시트 모드 확인 (있다면)
    if (spreadsheetBtn > 0) {
      console.log('\n📍 5단계: 스프레드시트 모드 구조 확인');
      
      console.log('  - 스프레드시트 모드로 전환...');
      await page.locator('button:has-text("스프레드시트")').click();
      await page.waitForLoadState('networkidle');
      
      // 스프레드시트 관련 요소들 확인
      const spreadsheetTitle = await page.locator('text=테스트케이스 스프레드시트').count();
      const addRowsBtn = await page.locator('button:has-text("행 추가")').count();
      const addFolderBtn = await page.locator('button:has-text("폴더 추가")').count();
      const saveBtn = await page.locator('button:has-text("일괄 저장")').count();
      const refreshBtn = await page.locator('button:has-text("새로고침")').count();
      
      console.log(`  - 스프레드시트 제목: ${spreadsheetTitle}개`);
      console.log(`  - 행 추가 버튼: ${addRowsBtn}개`);
      console.log(`  - 폴더 추가 버튼: ${addFolderBtn}개`);
      console.log(`  - 일괄 저장 버튼: ${saveBtn}개`);
      console.log(`  - 새로고침 버튼: ${refreshBtn}개`);
      
      // 스프레드시트 셀 구조 확인
      const spreadsheetCells = await page.locator('table td, [data-testid="spreadsheet-cell"]').count();
      const spreadsheetRows = await page.locator('table tr, [data-testid="spreadsheet-row"]').count();
      
      console.log(`  - 스프레드시트 셀: ${spreadsheetCells}개`);
      console.log(`  - 스프레드시트 행: ${spreadsheetRows}개`);
      
      // 컬럼 헤더 확인
      const columnHeaders = await page.locator('th, [data-testid="column-header"]').allTextContents();
      console.log('  - 컬럼 헤더:');
      columnHeaders.slice(0, 10).forEach((header, index) => {
        console.log(`    ${index + 1}. "${header}"`);
      });
      
      await page.screenshot({ 
        path: 'e2e-tests/screenshots/screen-inspection-spreadsheet-mode.png',
        fullPage: true 
      });
    }
    
    // 6단계: 폴더 및 테스트케이스 생성 버튼 동작 확인
    console.log('\n📍 6단계: 폴더/테스트케이스 생성 UI 확인');
    
    if (newFolderBtn > 0) {
      console.log('  - 새 폴더 생성 다이얼로그 확인...');
      await page.locator('button:has-text("새 폴더")').first().click();
      
      // 다이얼로그 요소들 확인
      await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
      const dialogTitle = await page.locator('[role="dialog"] h2, .MuiDialogTitle-root').textContent();
      const folderNameInput = await page.locator('input[name="name"], input[placeholder*="폴더"]').count();
      const createBtn = await page.locator('button:has-text("생성")').count();
      const cancelBtn = await page.locator('button:has-text("취소")').count();
      
      console.log(`  - 다이얼로그 제목: "${dialogTitle}"`);
      console.log(`  - 폴더명 입력 필드: ${folderNameInput}개`);
      console.log(`  - 생성 버튼: ${createBtn}개`);
      console.log(`  - 취소 버튼: ${cancelBtn}개`);
      
      await page.screenshot({ 
        path: 'e2e-tests/screenshots/screen-inspection-folder-dialog.png',
        fullPage: true 
      });
      
      // 다이얼로그 닫기
      await page.locator('button:has-text("취소")').click();
      await page.waitForLoadState('networkidle');
    }
    
    console.log('\n✅ 화면 구조 파악 완료');
    console.log('📸 스크린샷들이 e2e-tests/screenshots/ 에 저장되었습니다.');
    console.log('\n🎯 다음 단계: 이 정보를 바탕으로 정확한 버그 재현 테스트를 작성할 수 있습니다.');
    
  } catch (error) {
    console.error('❌ 화면 구조 파악 중 오류:', error);
    
    if (page) {
      await page.screenshot({ 
        path: 'e2e-tests/screenshots/screen-inspection-error.png',
        fullPage: true 
      });
    }
  } finally {
    if (browser) {
      console.log('\n⏱️ 5초 후 브라우저를 닫습니다. 화면을 확인하세요...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      await browser.close();
    }
  }
}

// 메인 실행
if (require.main === module) {
  inspectScreenStructure().catch(console.error);
}

module.exports = { inspectScreenStructure };