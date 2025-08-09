// ICT-158: 새로고침 한 번으로 최신화 반영 테스트
const { chromium } = require('playwright');

async function testSingleRefreshFix() {
  console.log('🧪 ICT-158: 새로고침 한 번으로 최신화 반영 테스트 시작');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000  // 천천히 실행하여 관찰 가능
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 콘솔 로그 모니터링 설정
    const consoleLogs = [];
    page.on('console', msg => {
      const logMsg = msg.text();
      consoleLogs.push(logMsg);
      if (logMsg.includes('[ICT-158]')) {
        console.log(`📝 ${logMsg}`);
      }
    });

    // 1. 로그인
    console.log('1️⃣ 로그인...');
    await page.goto('http://localhost:3000');
    await page.waitForSelector('input[name="username"]', { timeout: 10000 });
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=프로젝트 선택', { timeout: 10000 });
    console.log('✅ 로그인 성공');

    // 2. 첫 번째 프로젝트 선택
    console.log('2️⃣ 프로젝트 선택...');
    await page.waitForSelector('[data-testid="project-card"], .MuiCard-root', { timeout: 10000 });
    const projects = page.locator('[data-testid="project-card"], .MuiCard-root');
    const projectCount = await projects.count();
    
    if (projectCount > 0) {
      await projects.first().click();
      console.log('✅ 첫 번째 프로젝트 선택');
      await page.waitForTimeout(3000);
    } else {
      throw new Error('사용 가능한 프로젝트가 없습니다');
    }

    // 3. 테스트케이스 섹션 이동
    console.log('3️⃣ 테스트케이스 섹션 이동...');
    const testCaseElement = await page.$('text=테스트케이스');
    if (testCaseElement) {
      await page.click('text=테스트케이스');
      await page.waitForTimeout(2000);
    }
    console.log('✅ 테스트케이스 섹션 진입');

    // 4. 스프레드시트 모드 확인/전환
    console.log('4️⃣ 스프레드시트 모드 확인...');
    
    // 스프레드시트 관련 요소들 확인
    const spreadsheetModeButton = await page.$('text=스프레드시트 모드');
    if (spreadsheetModeButton) {
      await page.click('text=스프레드시트 모드');
      console.log('   스프레드시트 모드로 전환');
      await page.waitForTimeout(2000);
    }

    // 스프레드시트가 보이는지 확인
    const spreadsheetVisible = await page.$('table') || await page.$('.react-spreadsheet') || await page.$('text=일괄 저장');
    if (!spreadsheetVisible) {
      console.log('⚠️ 스프레드시트 UI를 찾을 수 없습니다. 기본 모드로 진행');
    } else {
      console.log('✅ 스프레드시트 모드 활성화');
    }

    // 5. 현재 데이터 개수 확인
    console.log('5️⃣ 현재 데이터 개수 확인...');
    await page.waitForTimeout(1000);
    
    let initialDataCount = 0;
    try {
      // 스프레드시트의 경우
      const tableRows = await page.$$('table tbody tr');
      if (tableRows.length > 0) {
        initialDataCount = await page.$$eval('table tbody tr', rows => {
          return rows.filter(row => {
            const firstCell = row.querySelector('td:first-child input');
            return firstCell && firstCell.value && firstCell.value.trim() !== '';
          }).length;
        });
        console.log(`   스프레드시트 데이터 행 수: ${initialDataCount}개`);
      } else {
        // 트리 뷰의 경우
        const treeItems = await page.$$('[class*="MuiTreeItem"]:has(span:text("테스트케이스"))');
        initialDataCount = treeItems.length;
        console.log(`   트리 뷰 테스트케이스 수: ${initialDataCount}개`);
      }
    } catch (e) {
      console.log('   데이터 개수 확인 실패:', e.message);
    }

    // 6. 새 테스트케이스 추가 (스프레드시트에서)
    console.log('6️⃣ 새 테스트케이스 추가...');
    
    if (spreadsheetVisible) {
      try {
        // 스프레드시트의 첫 번째 빈 행에 데이터 입력
        const testName = `ICT158테스트_${Date.now()}`;
        const testDesc = 'ICT-158 단일 새로고침 테스트';
        
        // 첫 번째 빈 행 찾기
        let targetRow = initialDataCount;
        
        // 이름 입력
        await page.click(`table tbody tr:nth-child(${targetRow + 1}) td:first-child`);
        await page.fill(`table tbody tr:nth-child(${targetRow + 1}) td:first-child input`, testName);
        
        // 설명 입력
        await page.click(`table tbody tr:nth-child(${targetRow + 1}) td:nth-child(2)`);
        await page.fill(`table tbody tr:nth-child(${targetRow + 1}) td:nth-child(2) input`, testDesc);
        
        console.log(`   새 테스트케이스 입력 완료: ${testName}`);
        
        // 7. 일괄 저장
        console.log('7️⃣ 일괄 저장...');
        await page.click('button:has-text("일괄 저장")');
        await page.waitForSelector('text=테스트케이스가 저장되었습니다', { timeout: 10000 });
        console.log('✅ 저장 완료');
        
        // 저장 완료 후 잠시 대기
        await page.waitForTimeout(2000);
        
        // 8. 새로고침 버튼 클릭 (단 한 번만!)
        console.log('8️⃣ 새로고침 버튼 클릭 (한 번만)...');
        
        console.log('📊 새로고침 전 콘솔 로그 상태:');
        const beforeRefreshLogs = consoleLogs.filter(log => log.includes('[ICT-158]'));
        beforeRefreshLogs.forEach(log => console.log(`   ${log}`));
        
        await page.click('button:has-text("새로고침")');
        
        // 새로고침 완료 대기
        await page.waitForSelector('text=최신 데이터로 새로고침되었습니다', { timeout: 10000 });
        console.log('✅ 새로고침 실행 완료');
        
        // 새로고침 후 추가 대기 (상태 업데이트 완료 대기)
        await page.waitForTimeout(3000);
        
        // 9. 결과 확인
        console.log('9️⃣ 새로고침 결과 확인...');
        
        const afterRefreshDataCount = await page.$$eval('table tbody tr', rows => {
          return rows.filter(row => {
            const firstCell = row.querySelector('td:first-child input');
            return firstCell && firstCell.value && firstCell.value.trim() !== '';
          }).length;
        });
        
        console.log(`📊 결과 비교:`);
        console.log(`   새로고침 전: ${initialDataCount}개`);
        console.log(`   추가된 케이스: 1개`);
        console.log(`   새로고침 후: ${afterRefreshDataCount}개`);
        console.log(`   예상 개수: ${initialDataCount + 1}개`);
        
        // 새로운 테스트케이스가 보이는지 확인
        const newTestCaseVisible = await page.$(`input[value="${testName}"]`);
        
        console.log('📋 ICT-158 새로고침 후 콘솔 로그:');
        const afterRefreshLogs = consoleLogs.filter(log => log.includes('[ICT-158]'));
        afterRefreshLogs.forEach(log => console.log(`   ${log}`));
        
        if (afterRefreshDataCount >= initialDataCount + 1 && newTestCaseVisible) {
          console.log('🎉 ICT-158 수정 성공: 새로고침 한 번으로 최신 데이터 반영됨!');
          return true;
        } else {
          console.log('❌ ICT-158 수정 실패: 새로고침 한 번으로 데이터가 반영되지 않음');
          return false;
        }
        
      } catch (error) {
        console.error('스프레드시트 테스트 중 오류:', error.message);
        return false;
      }
    } else {
      console.log('⚠️ 스프레드시트 모드를 사용할 수 없어 테스트를 건너뜁니다');
      return false;
    }
    
  } catch (error) {
    console.error('❌ ICT-158 단일 새로고침 테스트 실패:', error);
    return false;
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  testSingleRefreshFix().then(success => {
    console.log(`\n🏁 테스트 ${success ? '성공' : '실패'}`);
    process.exit(success ? 0 : 1);
  });
}

module.exports = { testSingleRefreshFix };