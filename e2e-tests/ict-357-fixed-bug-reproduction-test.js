/**
 * ICT-357: 기존 데이터를 활용한 스프레드시트 버그 재현 테스트
 * 
 * 목표: 스프레드시트에서 데이터 수정 시 하위 테스트케이스 데이터 손실/타입 변경 버그 재현
 */

const { chromium } = require('playwright');

async function runICT357FixedTest() {
  let browser, context, page;
  
  try {
    console.log('🚀 ICT-357: 기존 데이터 활용 스프레드시트 버그 재현 테스트 시작');
    
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 1000
    });
    
    context = await browser.newContext({
      baseURL: 'http://localhost:8080'
    });
    
    page = await context.newPage();
    
    // 1단계: 로그인 및 프로젝트 진입
    console.log('📝 1-3단계: 로그인 → 프로젝트 → 테스트케이스 탭');
    await page.goto('/', { timeout: 20000 });
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForURL('**/projects', { timeout: 10000 });
    
    const projectButtons = await page.locator('button:has-text("프로젝트 열기")');
    await projectButtons.first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForURL('**/projects/**', { timeout: 10000 });
    
    const testCaseTab = page.getByRole('tab', { name: '테스트케이스' });
    await testCaseTab.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ 테스트케이스 탭 진입 완료');

    // 4단계: 트리 모드에서 현재 데이터 확인
    console.log('📝 4단계: 트리 모드에서 기존 데이터 구조 확인');
    
    // 모든 텍스트 내용 확인하여 폴더/테스트케이스 파악
    await page.waitForTimeout(2000);
    const bodyText = await page.textContent('body');
    
    // 트리 구조의 실제 항목들 찾기
    const treeItems = await page.locator('[class*="tree"], [class*="TreeItem"], [role="treeitem"]').allTextContents();
    console.log('🔍 트리 구조 항목들:');
    treeItems.slice(0, 10).forEach((item, index) => {
      if (item.trim()) console.log(`  ${index + 1}. "${item.trim()}"`);
    });

    await page.screenshot({ 
      path: 'e2e-tests/screenshots/ict-357-fixed-tree-initial.png',
      fullPage: true 
    });

    // 5단계: 스프레드시트 모드 전환
    console.log('📝 5단계: 스프레드시트 모드 전환');
    const spreadsheetBtn = page.getByRole('button', { name: '스프레드시트 모드', exact: true });
    await spreadsheetBtn.click();
    await page.waitForLoadState('networkidle');
    
    // 스프레드시트 로딩 대기
    await page.waitForSelector('table, [data-testid="spreadsheet"]', { timeout: 10000 });
    console.log('✅ 스프레드시트 모드 전환 완료');

    // 6단계: 스프레드시트 구조 분석
    console.log('📝 6단계: 스프레드시트 데이터 구조 분석');
    
    // 다양한 방법으로 스프레드시트 구조 파악
    const tables = await page.locator('table').count();
    console.log(`테이블 수: ${tables}`);
    
    if (tables > 0) {
      const table = page.locator('table').first();
      
      // 헤더 확인
      const headers = await table.locator('thead th, tbody tr:first-child td').allTextContents();
      console.log('컬럼 헤더:');
      headers.forEach((header, index) => {
        if (header.trim()) console.log(`  ${index + 1}. "${header.trim()}"`);
      });
      
      // 모든 행 확인
      const allRows = await table.locator('tbody tr').count();
      console.log(`데이터 행 수: ${allRows}`);
      
      // 첫 번째 몇 개 행의 내용 확인
      for (let i = 0; i < Math.min(3, allRows); i++) {
        const row = table.locator(`tbody tr:nth-child(${i + 1})`);
        const cells = await row.locator('td').allTextContents();
        console.log(`행 ${i + 1} 데이터:`, cells.slice(0, 5).map(cell => `"${cell.trim()}"`));
      }
    }

    await page.screenshot({ 
      path: 'e2e-tests/screenshots/ict-357-fixed-spreadsheet-analysis.png',
      fullPage: true 
    });

    // 7단계: 텍스트 입력 필드 찾기 및 수정
    console.log('📝 7단계: 텍스트 입력 필드 찾아서 데이터 수정');
    
    // 체크박스가 아닌 텍스트 입력 필드만 찾기
    const textInputs = page.locator('input[type="text"], textarea, input:not([type="checkbox"]):not([type="radio"])');
    const textInputCount = await textInputs.count();
    console.log(`텍스트 입력 필드 수: ${textInputCount}`);
    
    let dataModified = false;
    
    if (textInputCount > 0) {
      // 첫 번째 텍스트 입력 필드 수정
      const firstTextInput = textInputs.first();
      const inputType = await firstTextInput.getAttribute('type');
      const placeholder = await firstTextInput.getAttribute('placeholder');
      console.log(`첫 번째 텍스트 입력: type="${inputType}", placeholder="${placeholder}"`);
      
      try {
        // 기존 값 확인
        const originalValue = await firstTextInput.inputValue();
        console.log(`기존 값: "${originalValue}"`);
        
        // 새로운 값으로 수정
        await firstTextInput.focus();
        await firstTextInput.selectText();
        await firstTextInput.fill('ICT-357 수정된 데이터 - 버그 테스트용');
        console.log('✅ 첫 번째 텍스트 필드 수정 완료');
        
        dataModified = true;
        await page.waitForTimeout(1000);
      } catch (error) {
        console.log('⚠️ 첫 번째 텍스트 입력 필드 수정 실패:', error.message);
      }
      
      // 두 번째 텍스트 입력 필드도 수정 시도
      if (textInputCount > 1) {
        try {
          const secondTextInput = textInputs.nth(1);
          const originalValue2 = await secondTextInput.inputValue();
          console.log(`두 번째 필드 기존 값: "${originalValue2}"`);
          
          await secondTextInput.focus();
          await secondTextInput.selectText();
          await secondTextInput.fill('ICT-357 추가 수정된 설명');
          console.log('✅ 두 번째 텍스트 필드 수정 완료');
          
          await page.waitForTimeout(1000);
        } catch (error) {
          console.log('⚠️ 두 번째 텍스트 입력 필드 수정 실패:', error.message);
        }
      }
    }
    
    if (!dataModified) {
      // 테이블 셀 직접 더블클릭으로 편집 모드 활성화 시도
      console.log('텍스트 입력 필드 수정 실패. 테이블 셀 직접 편집 시도');
      
      const table = page.locator('table').first();
      const dataRows = await table.locator('tbody tr').count();
      console.log(`테이블 데이터 행 수: ${dataRows}`);
      
      if (dataRows > 1) {
        // 두 번째 행의 두 번째 셀 (테스트케이스 이름)을 더블클릭
        const targetCell = table.locator('tbody tr:nth-child(2) td:nth-child(2)');
        const cellText = await targetCell.textContent();
        console.log(`수정할 셀의 기존 텍스트: "${cellText}"`);
        
        await targetCell.dblclick();
        await page.waitForTimeout(500);
        
        // 편집 모드 활성화 후 새로운 입력 필드 확인
        const newInputs = page.locator('input[type="text"], textarea');
        const newInputCount = await newInputs.count();
        
        if (newInputCount > textInputCount) {
          const editInput = newInputs.last(); // 새로 생긴 입력 필드
          await editInput.selectText();
          await editInput.fill('ICT-357-MODIFIED-TEST-CASE');
          await page.keyboard.press('Enter');
          console.log('✅ 셀 직접 편집 완료');
          dataModified = true;
        }
      }
    }
    
    console.log(`데이터 수정 여부: ${dataModified ? 'YES' : 'NO'}`);
    
    await page.screenshot({ 
      path: 'e2e-tests/screenshots/ict-357-fixed-after-edit.png',
      fullPage: true 
    });

    // 8단계: 일괄 저장
    console.log('📝 8단계: 수정 사항 일괄 저장');
    await page.waitForTimeout(1000); // 변경사항 반영 대기
    
    const saveButton = page.locator('button:has-text("일괄 저장")');
    const isEnabled = await saveButton.isEnabled();
    console.log(`일괄 저장 버튼 활성화: ${isEnabled}`);
    
    if (isEnabled) {
      await saveButton.click();
      console.log('✅ 일괄 저장 실행');
      
      // 저장 완료 대기
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    } else {
      console.log('⚠️ 일괄 저장 버튼이 비활성화되어 있음');
    }

    await page.screenshot({ 
      path: 'e2e-tests/screenshots/ict-357-fixed-after-save.png',
      fullPage: true 
    });

    // 9단계: 트리 모드로 복귀하여 데이터 검증
    console.log('📝 9단계: 트리 모드로 복귀하여 최종 검증');
    const treeBtn = page.getByRole('button', { name: '트리 모드', exact: true });
    if (await treeBtn.count() > 0) {
      await treeBtn.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
    }

    // 최종 검증
    const finalBodyText = await page.textContent('body');
    const finalTreeItems = await page.locator('[class*="tree"], [class*="TreeItem"], [role="treeitem"]').allTextContents();
    
    console.log('📊 최종 검증 - 트리 구조 항목들:');
    finalTreeItems.slice(0, 10).forEach((item, index) => {
      if (item.trim()) console.log(`  ${index + 1}. "${item.trim()}"`);
    });

    await page.screenshot({ 
      path: 'e2e-tests/screenshots/ict-357-fixed-final-verification.png',
      fullPage: true 
    });

    // 결과 비교
    console.log('\n📊 ICT-357 버그 테스트 결과:');
    console.log('='.repeat(50));
    console.log(`초기 트리 항목 수: ${treeItems.length}`);
    console.log(`최종 트리 항목 수: ${finalTreeItems.length}`);
    
    const dataChanged = treeItems.length !== finalTreeItems.length;
    if (dataChanged) {
      console.log('🚨 데이터 구조 변경 감지: 항목 수가 달라졌습니다!');
    } else {
      console.log('✅ 데이터 구조 유지: 항목 수가 동일합니다');
    }
    
    console.log('\n🎯 ICT-357 테스트 완료');
    console.log(`버그 발견: ${dataChanged ? 'YES - 추가 조사 필요' : 'NO - 정상 동작'}`);

  } catch (error) {
    console.error('❌ ICT-357 테스트 실행 중 오류:', error);
    
    if (page) {
      await page.screenshot({ 
        path: 'e2e-tests/screenshots/ict-357-fixed-error.png',
        fullPage: true 
      });
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// 메인 실행
if (require.main === module) {
  runICT357FixedTest().catch(console.error);
}

module.exports = { runICT357FixedTest };