/**
 * ICT-357: 스프레드시트 수정 시 하위 테스트케이스 데이터 손실 및 폴더 변경 버그 테스트
 * 
 * 재현 단계:
 * 1. 로그인 후 프로젝트 진입
 * 2. 테스트케이스 탭으로 이동
 * 3. 부모 폴더와 하위 테스트케이스 생성
 * 4. 스프레드시트 모드로 전환
 * 5. 데이터 수정 후 저장 실행
 * 6. 하위 테스트케이스 데이터 및 타입 확인 -> 데이터 손실 또는 폴더로 변경 확인
 */

const { chromium } = require('playwright');

async function runICT357Test() {
  let browser, context, page;
  
  try {
    console.log('🚀 ICT-357: 스프레드시트 하위 테스트케이스 데이터 손실 버그 테스트 시작');
    
    // 브라우저 실행
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 1500
    });
    
    context = await browser.newContext({
      baseURL: 'http://localhost:8080'
    });
    
    page = await context.newPage();
    
    // 1단계: 로그인
    console.log('📝 1단계: 로그인 진행');
    await page.goto('/', { timeout: 20000 });
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    await page.waitForURL('**/projects', { timeout: 10000 });
    console.log('✅ 로그인 성공');

    // 2단계: 프로젝트 진입
    console.log('📝 2단계: 첫 번째 프로젝트 열기');
    const projectButtons = await page.locator('button:has-text("프로젝트 열기")');
    const projectCount = await projectButtons.count();
    console.log(`발견된 프로젝트 수: ${projectCount}`);
    
    if (projectCount === 0) {
      throw new Error('프로젝트가 없습니다. 먼저 프로젝트를 생성해주세요.');
    }
    
    await projectButtons.first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForURL('**/projects/**', { timeout: 10000 });
    console.log('✅ 프로젝트 진입 성공');

    // 3단계: 테스트케이스 탭으로 이동 (정확한 선택자 사용)
    console.log('📝 3단계: 테스트케이스 탭으로 이동');
    const testCaseTab = page.getByRole('tab', { name: '테스트케이스' });
    await testCaseTab.click();
    await page.waitForLoadState('networkidle');
    console.log('✅ 테스트케이스 탭 이동 완료');

    // 4단계: 먼저 트리 모드에서 데이터 생성
    console.log('📝 4단계: 트리 모드에서 테스트 데이터 생성');
    
    // 트리 모드로 먼저 전환 (새로운 데이터 생성을 위해)
    const treeBtn = page.getByRole('button', { name: '트리 모드', exact: true });
    if (await treeBtn.count() > 0) {
      await treeBtn.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ 트리 모드로 전환됨');
    }
    
    // 모든 버튼 찾기 (디버깅용)
    const allButtons = await page.locator('button').allTextContents();
    console.log('🔍 페이지의 모든 버튼들:');
    allButtons.slice(0, 15).forEach((text, index) => {
      if (text.trim()) console.log(`  ${index + 1}. "${text.trim()}"`);
    });
    
    // 새 폴더 생성 (다양한 선택자 시도)
    console.log('  - 새 폴더 생성 시도...');
    let folderCreated = false;
    
    // 가능한 폴더 생성 버튼들
    const folderSelectors = [
      'button:has-text("새 폴더")',
      'button:has-text("폴더 추가")',
      'button[title*="폴더"]',
      'button[aria-label*="폴더"]',
      '[data-testid*="folder"]',
      '.MuiFab-root:has([data-testid*="folder"])'
    ];
    
    for (const selector of folderSelectors) {
      const btn = page.locator(selector);
      if (await btn.count() > 0) {
        console.log(`  ✅ 폴더 생성 버튼 발견: ${selector}`);
        await btn.first().click();
        
        try {
          await page.waitForSelector('[role="dialog"], input[placeholder*="폴더"], input[name="name"]', { timeout: 3000 });
          
          // 폴더명 입력
          const nameInput = page.locator('input[name="name"], input[placeholder*="폴더"]').first();
          await nameInput.fill('ICT357 테스트 폴더');
          
          // 생성/확인 버튼 클릭
          const confirmBtn = page.locator('button:has-text("생성"), button:has-text("확인"), button:has-text("추가")').first();
          await confirmBtn.click();
          await page.waitForLoadState('networkidle');
          
          folderCreated = true;
          console.log('✅ 부모 폴더 "ICT357 테스트 폴더" 생성 완료');
          break;
        } catch (error) {
          console.log(`  ⚠️ ${selector}로 생성 실패: ${error.message}`);
        }
      }
    }
    
    if (!folderCreated) {
      console.log('⚠️ 폴더 생성 버튼을 찾을 수 없습니다. 기존 데이터를 사용하거나 다른 방법을 시도해야 합니다.');
    }

    // 5단계: 현재 트리 구조 확인 및 스크린샷
    console.log('📝 5단계: 생성된 트리 구조 확인');
    await page.screenshot({ 
      path: 'e2e-tests/screenshots/ict-357-before-spreadsheet-tree.png',
      fullPage: true 
    });
    
    // 생성된 항목들 확인
    const folders = await page.locator('text=ICT357 테스트 폴더').count();
    const testCases = await page.locator('text=ICT357 버그 테스트케이스').count();
    console.log(`📊 초기 상태: 폴더 ${folders}개, 테스트케이스 ${testCases}개`);
    
    // 하위 테스트케이스 데이터 저장 (비교용)
    const initialTestCaseData = {
      folderCount: folders,
      testCaseCount: testCases,
      folderName: 'ICT357 테스트 폴더',
      testCaseName: 'ICT357 버그 테스트케이스'
    };

    // 6단계: 스프레드시트 모드로 전환 (기본 스프레드시트 모드 사용)
    console.log('📝 6단계: 스프레드시트 모드로 전환');
    const spreadsheetBtn = page.getByRole('button', { name: '스프레드시트 모드', exact: true });
    if (await spreadsheetBtn.count() > 0) {
      await spreadsheetBtn.click();
      await page.waitForLoadState('networkidle');
      
      // 스프레드시트 로딩 완료 대기
      await page.waitForSelector('table, [data-testid="spreadsheet"]', { timeout: 10000 });
      console.log('✅ 스프레드시트 모드 전환 완료');
    } else {
      throw new Error('⚠️ 스프레드시트 모드 버튼을 찾을 수 없습니다.');
    }

    // 7단계: 스프레드시트에서 데이터 확인 및 스크린샷
    console.log('📝 7단계: 스프레드시트 초기 데이터 상태 확인');
    await page.screenshot({ 
      path: 'e2e-tests/screenshots/ict-357-spreadsheet-before-edit.png',
      fullPage: true 
    });

    // 8단계: 스프레드시트에서 부모 폴더 데이터 수정
    console.log('📝 8단계: 스프레드시트에서 부모 폴더 데이터 수정');
    
    // 스프레드시트 테이블 구조 확인
    const table = await page.locator('table').first();
    const rows = await table.locator('tbody tr').count();
    console.log(`스프레드시트 행 수: ${rows}`);
    
    if (rows > 0) {
      // 부모 폴더 행 찾기 (첫 번째 행)
      const firstRow = table.locator('tbody tr').first();
      const cells = await firstRow.locator('td');
      const cellCount = await cells.count();
      console.log(`첫 번째 행 셀 수: ${cellCount}`);
      
      // 설명 컬럼 수정 시도 (컬럼 위치는 실제 화면에서 확인 필요)
      if (cellCount >= 3) {
        // 설명 셀 클릭 (보통 3번째 또는 4번째 컬럼)
        const descriptionCell = cells.nth(2); // 0-based index, 실제 위치에 따라 조정
        
        try {
          await descriptionCell.dblclick(); // 더블클릭으로 편집 모드 진입
          
          // input이나 textarea가 나타날 때까지 대기
          const editInput = page.locator('td input, td textarea').first();
          if (await editInput.count() > 0) {
            await editInput.clear();
            await editInput.fill('ICT357 수정된 폴더 설명 - 버그 테스트');
            await page.keyboard.press('Enter');
            console.log('✅ 부모 폴더 설명 셀 수정 완료');
          } else {
            console.log('⚠️ 편집 가능한 입력 필드를 찾을 수 없습니다.');
          }
        } catch (error) {
          console.log('⚠️ 셀 편집 중 오류:', error.message);
          
          // 대안: 페이지 내의 모든 입력 필드 확인
          const allInputs = await page.locator('input[type="text"], textarea').count();
          console.log(`페이지 전체 입력 필드 수: ${allInputs}`);
          
          if (allInputs > 0) {
            const firstInput = page.locator('input[type="text"], textarea').first();
            await firstInput.clear();
            await firstInput.fill('ICT357 수정된 설명');
            console.log('✅ 대안 방법으로 데이터 수정 완료');
          }
        }
      }
    } else {
      console.log('⚠️ 스프레드시트에 데이터 행이 없습니다.');
    }

    // 9단계: 일괄 저장 실행
    console.log('📝 9단계: 스프레드시트 일괄 저장 실행');
    const saveButton = page.locator('button:has-text("일괄 저장")');
    if (await saveButton.count() > 0) {
      const isEnabled = await saveButton.isEnabled();
      console.log(`일괄 저장 버튼 활성화 상태: ${isEnabled}`);
      
      if (isEnabled) {
        await saveButton.click();
        console.log('✅ 일괄 저장 버튼 클릭 완료');
        
        // 저장 프로세스 완료 대기
        await page.waitForLoadState('networkidle');
        
        // 저장 완료 메시지나 토스트 확인 시도
        try {
          await page.waitForSelector('text=저장, [role="alert"]', { timeout: 5000 });
          console.log('✅ 저장 완료 메시지 확인됨');
        } catch {
          console.log('⚠️ 저장 완료 메시지를 찾을 수 없지만 프로세스는 진행됨');
        }
      } else {
        console.log('⚠️ 일괄 저장 버튼이 비활성화되어 있습니다');
      }
    } else {
      console.log('⚠️ 일괄 저장 버튼을 찾을 수 없습니다');
    }

    // 10단계: 저장 후 상태 확인
    console.log('📝 10단계: 저장 후 데이터 상태 스크린샷');
    await page.screenshot({ 
      path: 'e2e-tests/screenshots/ict-357-spreadsheet-after-save.png',
      fullPage: true 
    });

    // 11단계: 트리 모드로 복귀하여 데이터 검증
    console.log('📝 11단계: 트리 모드로 복귀하여 하위 테스트케이스 상태 확인');
    const treeButton = page.locator('button:has-text("트리")');
    if (await treeButton.count() > 0) {
      await treeButton.click();
      await page.waitForLoadState('networkidle');
      console.log('✅ 트리 모드로 복귀 완료');
    } else {
      console.log('⚠️ 트리 버튼을 찾을 수 없습니다. 이미 트리 모드일 수 있습니다.');
    }

    // 12단계: 최종 데이터 무결성 검증
    console.log('📝 12단계: 최종 데이터 무결성 검증');
    await page.screenshot({ 
      path: 'e2e-tests/screenshots/ict-357-final-tree-state.png',
      fullPage: true 
    });
    
    // 저장 후 데이터 존재 확인
    const finalFolders = await page.locator('text=ICT357 테스트 폴더').count();
    const finalTestCases = await page.locator('text=ICT357 버그 테스트케이스').count();
    
    console.log('\n📊 ICT-357 버그 검증 결과:');
    console.log('='.repeat(50));
    console.log(`초기 상태 - 폴더: ${initialTestCaseData.folderCount}개, 테스트케이스: ${initialTestCaseData.testCaseCount}개`);
    console.log(`최종 상태 - 폴더: ${finalFolders}개, 테스트케이스: ${finalTestCases}개`);
    console.log('='.repeat(50));
    
    // 버그 상황 분석
    let bugDetected = false;
    
    if (finalTestCases === 0 && initialTestCaseData.testCaseCount > 0) {
      console.log('🚨 심각한 버그 확인: 하위 테스트케이스가 완전히 사라졌습니다!');
      console.log('  → 스프레드시트 저장으로 인한 데이터 손실 발생');
      bugDetected = true;
    }
    
    if (finalTestCases !== initialTestCaseData.testCaseCount) {
      console.log('🚨 데이터 무결성 버그: 테스트케이스 수가 변경되었습니다!');
      console.log(`  → 예상: ${initialTestCaseData.testCaseCount}개, 실제: ${finalTestCases}개`);
      bugDetected = true;
    }
    
    if (finalFolders !== initialTestCaseData.folderCount) {
      console.log('🚨 구조 변경 버그: 폴더 수가 변경되었습니다!');
      console.log(`  → 예상: ${initialTestCaseData.folderCount}개, 실제: ${finalFolders}개`);
      bugDetected = true;
    }
    
    // 타입 변경 버그 확인
    if (finalTestCases > 0) {
      const testCaseElements = await page.locator('text=ICT357 버그 테스트케이스').all();
      for (let element of testCaseElements) {
        const nodeType = await element.getAttribute('data-type');
        if (nodeType === 'folder') {
          console.log('🚨 타입 변경 버그: 테스트케이스가 폴더로 변경되었습니다!');
          bugDetected = true;
          break;
        }
      }
    }
    
    if (!bugDetected) {
      console.log('✅ 데이터 무결성 유지: 스프레드시트 저장 후에도 모든 데이터가 보존됨');
    }
    
    console.log('\n🎯 ICT-357 테스트 완료');
    console.log(`버그 발견: ${bugDetected ? 'YES - 추가 조사 및 수정 필요' : 'NO - 정상 동작'}`);
    
    return { 
      bugDetected, 
      initialData: initialTestCaseData, 
      finalData: { folderCount: finalFolders, testCaseCount: finalTestCases } 
    };

  } catch (error) {
    console.error('❌ ICT-357 테스트 실행 중 오류:', error);
    
    if (page) {
      await page.screenshot({ 
        path: 'e2e-tests/screenshots/ict-357-error-screenshot.png',
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
  runICT357Test().catch(console.error);
}

module.exports = { runICT357Test };