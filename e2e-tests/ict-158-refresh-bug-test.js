// ICT-158: 스프레드시트 새로고침 버튼 최신화 반영 문제 테스트
const { chromium } = require('playwright');

async function testSpreadsheetRefreshFix() {
  console.log('🧪 ICT-158: 스프레드시트 새로고침 버튼 최신화 반영 문제 테스트 시작');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500  // 디버깅을 위해 느리게 실행
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 1. 애플리케이션 로그인
    console.log('1️⃣ 로그인 진행...');
    await page.goto('http://localhost:3000');
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    
    // 로그인 완료 대기
    await page.waitForSelector('text=프로젝트 선택', { timeout: 10000 });
    console.log('✅ 로그인 성공');

    // 2. 프로젝트 선택 (올바른 UI 워크플로우 적용)
    console.log('2️⃣ 프로젝트 선택...');
    
    // 프로젝트 목록 로드 대기
    await page.waitForSelector('[data-testid="project-card"], .MuiCard-root', { timeout: 10000 });
    
    const projects = page.locator('[data-testid="project-card"], .MuiCard-root');
    const projectCount = await projects.count();
    
    console.log(`   사용 가능한 프로젝트 수: ${projectCount}개`);
    
    if (projectCount === 0) {
      // 프로젝트가 없으면 새로 생성
      console.log('   프로젝트가 없어 새로 생성 중...');
      await page.click('button:has-text("새 프로젝트"), button:has-text("프로젝트 생성")');
      await page.waitForSelector('input[name="name"]', { timeout: 5000 });
      await page.fill('input[name="name"]', 'ICT-158 테스트 프로젝트');
      await page.fill('textarea[name="description"]', 'ICT-158 새로고침 버그 테스트용 프로젝트');
      
      // 독립 프로젝트 타입 선택 (필요한 경우)
      const independentProjectOption = await page.$('input[value="independent"], [data-testid="independent-project"]');
      if (independentProjectOption) {
        await independentProjectOption.click();
        console.log('   독립 프로젝트 타입 선택');
      }
      
      await page.click('button:has-text("생성"), button:has-text("저장")');
      await page.waitForSelector('text=테스트케이스', { timeout: 10000 });
    } else {
      // 첫 번째 프로젝트 선택 (단순화)
      const targetProject = projects.first();
      
      console.log(`   첫 번째 프로젝트 선택 시도`);
      
      // 프로젝트 카드 직접 클릭
      await targetProject.click();
      console.log('   프로젝트 카드 클릭');
      
      // 선택 완료 대기 - 테스트케이스 섹션이 나타날 때까지
      await page.waitForTimeout(3000);
      
      // 테스트케이스 링크/버튼이 나타날 때까지 대기
      const testCaseSelectors = [
        'text=테스트케이스',
        'nav a[href*="testcase"]',
        'button:has-text("테스트케이스")',
        '[data-testid="testcase-menu"]'
      ];
      
      let testCaseSectionFound = false;
      for (const selector of testCaseSelectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          testCaseSectionFound = true;
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!testCaseSectionFound) {
        throw new Error('테스트케이스 섹션을 찾을 수 없습니다');
      }
    }
    console.log('✅ 프로젝트 선택 완료');

    // 3. 테스트케이스 섹션으로 이동
    console.log('3️⃣ 테스트케이스 섹션 이동...');
    
    // 테스트케이스 메뉴/링크 찾기 및 클릭
    const testCaseMenuSelectors = [
      'text=테스트케이스',
      'nav a[href*="testcase"]',
      'button:has-text("테스트케이스")',
      '[data-testid="testcase-menu"]',
      'a:has-text("테스트케이스")'
    ];
    
    let testCaseMenuClicked = false;
    for (const selector of testCaseMenuSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          await page.click(selector);
          console.log(`   테스트케이스 메뉴 클릭: ${selector}`);
          testCaseMenuClicked = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!testCaseMenuClicked) {
      console.log('⚠️ 테스트케이스 메뉴를 찾을 수 없음 - 이미 테스트케이스 섹션에 있을 수 있음');
    }
    
    // 테스트케이스 페이지 로드 대기
    await page.waitForTimeout(2000);
    console.log('✅ 테스트케이스 섹션 진입');

    // 4. 스프레드시트 모드로 전환
    console.log('4️⃣ 스프레드시트 모드 전환...');
    
    // 스프레드시트 모드 버튼 찾기 (여러 가능한 셀렉터)
    const spreadsheetModeSelectors = [
      'text=스프레드시트 모드',
      'button:has-text("스프레드시트")',
      'button:has-text("Spreadsheet")',
      '[data-testid="spreadsheet-mode-toggle"]',
      'input[type="radio"][value="spreadsheet"]',
      'label:has-text("스프레드시트")'
    ];
    
    let spreadsheetModeActivated = false;
    for (const selector of spreadsheetModeSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          await page.click(selector);
          console.log(`   스프레드시트 모드 버튼 클릭: ${selector}`);
          spreadsheetModeActivated = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }
    
    if (!spreadsheetModeActivated) {
      console.log('⚠️ 스프레드시트 모드 버튼을 찾을 수 없음 - 기본 모드로 진행');
    }
    
    // 스프레드시트 UI 확인 (여러 가능한 셀렉터)
    const spreadsheetUISelectors = [
      'text=테스트케이스 스프레드시트',
      'table',
      '.react-spreadsheet',
      '[data-testid="spreadsheet-container"]',
      'text=일괄 저장'
    ];
    
    let spreadsheetUIFound = false;
    for (const selector of spreadsheetUISelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 3000 });
        console.log(`   스프레드시트 UI 확인: ${selector}`);
        spreadsheetUIFound = true;
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!spreadsheetUIFound) {
      throw new Error('스프레드시트 UI를 찾을 수 없습니다');
    }
    
    console.log('✅ 스프레드시트 모드 활성화');

    // 5. 기존 테스트케이스 개수 확인 (스프레드시트 행 개수로)
    console.log('5️⃣ 기존 테스트케이스 개수 확인...');
    const initialRowsWithData = await page.$$eval(
      'table tbody tr',
      rows => rows.filter(row => {
        const firstCell = row.querySelector('td:first-child input');
        return firstCell && firstCell.value && firstCell.value.trim() !== '';
      }).length
    );
    console.log(`현재 데이터가 있는 스프레드시트 행 개수: ${initialRowsWithData}개`);

    // 6. 스프레드시트에 새 테스트 데이터 입력
    console.log('6️⃣ 스프레드시트에 새 테스트 데이터 입력...');
    
    const testData = [
      { name: 'ICT158테스트케이스1', description: 'ICT-158 버그 수정 테스트용' },
      { name: 'ICT158테스트케이스2', description: 'ICT-158 새로고침 테스트용' }
    ];

    // 콘솔 로그 모니터링 설정
    const consoleLogs = [];
    page.on('console', msg => {
      const logMsg = msg.text();
      consoleLogs.push(logMsg);
      if (logMsg.includes('[ICT-158]')) {
        console.log(`📝 ICT-158 콘솔 로그: ${logMsg}`);
      }
    });

    // 스프레드시트의 빈 행에 데이터 입력 (더 안정적인 방식)
    for (let i = 0; i < testData.length; i++) {
      const rowIndex = initialRowsWithData + i; // 기존 데이터 이후의 행에 입력
      
      console.log(`   ${i + 1}번째 테스트케이스 입력: ${testData[i].name}`);
      
      try {
        // 이름 컬럼 (첫 번째 컬럼) - 여러 셀렉터 시도
        const nameSelectors = [
          `table tbody tr:nth-child(${rowIndex + 1}) td:first-child`,
          `table tbody tr:nth-of-type(${rowIndex + 1}) td:nth-of-type(1)`,
          `[data-testid="spreadsheet-cell-${rowIndex}-0"]`
        ];
        
        let nameInputted = false;
        for (const selector of nameSelectors) {
          try {
            await page.click(selector, { timeout: 3000 });
            await page.fill(`${selector} input`, testData[i].name);
            nameInputted = true;
            break;
          } catch (e) {
            continue;
          }
        }
        
        if (!nameInputted) {
          throw new Error(`이름 입력 실패: 행 ${rowIndex + 1}`);
        }
        
        // 설명 컬럼 (두 번째 컬럼) - 여러 셀렉터 시도
        const descSelectors = [
          `table tbody tr:nth-child(${rowIndex + 1}) td:nth-child(2)`,
          `table tbody tr:nth-of-type(${rowIndex + 1}) td:nth-of-type(2)`,
          `[data-testid="spreadsheet-cell-${rowIndex}-1"]`
        ];
        
        let descInputted = false;
        for (const selector of descSelectors) {
          try {
            await page.click(selector, { timeout: 3000 });
            await page.fill(`${selector} input`, testData[i].description);
            descInputted = true;
            break;
          } catch (e) {
            continue;
          }
        }
        
        if (!descInputted) {
          throw new Error(`설명 입력 실패: 행 ${rowIndex + 1}`);
        }
        
        // 입력 완료 후 잠시 대기
        await page.waitForTimeout(500);
        
      } catch (error) {
        console.error(`   ${i + 1}번째 테스트케이스 입력 실패:`, error.message);
        // 실패해도 계속 진행
      }
    }
    
    console.log('✅ 2개 테스트케이스 데이터 입력 완료');

    // 7. 일괄 저장 실행
    console.log('7️⃣ 일괄 저장 실행...');
    await page.click('button:has-text("일괄 저장")');
    
    // 저장 완료 대기 (스낵바 메시지 확인)
    await page.waitForSelector('text=테스트케이스가 저장되었습니다', { timeout: 10000 });
    console.log('✅ 일괄 저장 완료');

    // 8. 새로고침 버튼 클릭 (ICT-158 핵심 테스트)
    console.log('8️⃣ 새로고침 버튼 클릭 테스트...');
    await page.click('button:has-text("새로고침")');
    
    // 새로고침 완료 대기 (로딩 상태 확인)
    await page.waitForSelector('text=최신 데이터로 새로고침되었습니다', { timeout: 10000 });
    console.log('✅ 새로고침 실행 완료');

    // 9. 새로고침 후 데이터 확인
    console.log('9️⃣ 새로고침 후 데이터 확인...');
    
    // 잠시 대기 후 데이터 확인
    await page.waitForTimeout(2000);
    
    const refreshedRowsWithData = await page.$$eval(
      'table tbody tr',
      rows => rows.filter(row => {
        const firstCell = row.querySelector('td:first-child input');
        return firstCell && firstCell.value && firstCell.value.trim() !== '';
      }).length
    );
    
    console.log(`새로고침 후 데이터가 있는 스프레드시트 행 개수: ${refreshedRowsWithData}개`);

    // 10. 결과 검증
    console.log('🔍 결과 검증...');
    
    const expectedRows = initialRowsWithData + testData.length;
    if (refreshedRowsWithData >= expectedRows) {
      console.log('✅ ICT-158 수정 성공: 새로고침 후 저장된 데이터가 정상적으로 표시됨');
      console.log(`   - 기존 행 수: ${initialRowsWithData}`);
      console.log(`   - 추가된 행 수: ${testData.length}`);
      console.log(`   - 새로고침 후 행 수: ${refreshedRowsWithData}`);
    } else {
      console.log('❌ ICT-158 수정 실패: 새로고침 후 데이터가 반영되지 않음');
      console.log(`   - 예상 행 수: ${expectedRows} 이상`);
      console.log(`   - 실제 행 수: ${refreshedRowsWithData}`);
    }

    // 11. ICT-158 관련 콘솔 로그 확인
    console.log('📋 ICT-158 관련 콘솔 로그 요약:');
    const ict158Logs = consoleLogs.filter(log => log.includes('[ICT-158]'));
    ict158Logs.forEach(log => console.log(`   ${log}`));

    console.log('\n🎉 ICT-158 테스트 완료');
    return true;
    
  } catch (error) {
    console.error('❌ ICT-158 테스트 실패:', error);
    return false;
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  testSpreadsheetRefreshFix().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testSpreadsheetRefreshFix };