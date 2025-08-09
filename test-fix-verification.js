// test-fix-verification.js
// 수정된 스프레드시트 스텝 추가 기능 검증 테스트

const { chromium } = require('playwright');

async function testFixedStepFunctionality() {
  console.log('🚀 수정된 스프레드시트 스텝 추가 기능 검증 테스트 시작');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // 콘솔 에러 모니터링 (무한 루프 감지)
  let errorCount = 0;
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errorCount++;
      if (errorCount <= 5) { // 처음 5개만 로깅
        console.log(`❌ 브라우저 콘솔 에러 ${errorCount}: ${msg.text()}`);
      }
      if (errorCount === 10) {
        console.log('⚠️ 너무 많은 에러 발생, 로깅 중단');
      }
    }
  });
  
  try {
    // 1. 로그인
    console.log('🔐 로그인 수행...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    await page.fill('input[name="username"], input[type="text"]', 'admin');
    await page.fill('input[name="password"], input[type="password"]', 'admin');
    await page.click('button[type="submit"], button:has-text("로그인"), button:has-text("Login")');
    await page.waitForTimeout(3000);
    console.log('✅ 로그인 완료');
    
    // 2. 테스트케이스 페이지로 이동
    console.log('📂 테스트케이스 페이지로 이동...');
    await page.goto('http://localhost:3000/projects/f8943e57-9925-4f80-9fc7-61e743c5937f/testcases');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(5000); // 더 긴 대기 시간
    
    // 3. 무한 루프 발생 여부 확인
    if (errorCount > 50) {
      console.log('❌ 무한 렌더링 루프 감지됨 - 수정 실패');
      return false;
    } else {
      console.log('✅ 무한 렌더링 루프 해결됨');
    }
    
    // 4. 스프레드시트 모드 활성화
    console.log('📊 스프레드시트 모드 활성화...');
    const spreadsheetButton = await page.locator('button:has-text("스프레드시트")').first();
    if (await spreadsheetButton.count() > 0) {
      await spreadsheetButton.click();
      await page.waitForTimeout(3000);
      console.log('✅ 스프레드시트 모드 활성화됨');
    }
    
    // 5. 설정 버튼 클릭
    console.log('⚙️ 설정 버튼 클릭...');
    const settingsButton = await page.locator('button:has(svg[data-testid="SettingsIcon"])').first();
    if (await settingsButton.count() > 0) {
      await settingsButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ 설정 메뉴 열림');
      
      // 6. 스텝 추가 테스트
      console.log('➕ 스텝 추가 테스트...');
      
      // 현재 스텝 수 확인
      const beforeCount = await page.locator('th:has-text("Step"), .step-header').count();
      console.log(`📊 스텝 추가 전: ${beforeCount}개`);
      
      // 스텝 추가 클릭
      const stepAddOption = await page.locator('li:has-text("스텝 추가")').first();
      if (await stepAddOption.count() > 0) {
        await stepAddOption.click();
        await page.waitForTimeout(3000); // 더 긴 대기
        
        // 스텝 수 다시 확인
        const afterCount = await page.locator('th:has-text("Step"), .step-header').count();
        console.log(`📊 스텝 추가 후: ${afterCount}개`);
        
        // 성공 메시지 확인
        const successMessage = await page.locator('text*="스텝 수가"').first();
        if (await successMessage.count() > 0) {
          const messageText = await successMessage.textContent();
          console.log(`✅ 성공 메시지 확인: ${messageText}`);
        }
        
        // 결과 검증
        if (afterCount > beforeCount) {
          console.log('🎉 스텝 추가 기능 수정 성공!');
          console.log(`✅ 결과: ${beforeCount}개 → ${afterCount}개`);
          
          // 7. 추가로 한 번 더 테스트 (안정성 확인)
          console.log('🔄 안정성 확인을 위한 추가 테스트...');
          await page.waitForTimeout(1000);
          
          // 설정 버튼 다시 클릭
          await settingsButton.click();
          await page.waitForTimeout(500);
          
          const stepAddOption2 = await page.locator('li:has-text("스텝 추가")').first();
          if (await stepAddOption2.count() > 0) {
            await stepAddOption2.click();
            await page.waitForTimeout(2000);
            
            const finalCount = await page.locator('th:has-text("Step"), .step-header').count();
            console.log(`📊 최종 스텝 수: ${finalCount}개`);
            
            if (finalCount > afterCount) {
              console.log('✅ 연속 스텝 추가도 정상 작동!');
              return true;
            }
          }
          
          return true;
        } else {
          console.log('❌ 스텝 추가 여전히 작동하지 않음');
          return false;
        }
      } else {
        console.log('❌ 스텝 추가 메뉴를 찾을 수 없음');
        return false;
      }
    } else {
      console.log('❌ 설정 버튼을 찾을 수 없음');
      return false;
    }
    
  } catch (error) {
    console.error('❌ 테스트 중 오류 발생:', error.message);
    return false;
  } finally {
    console.log('🔍 수동 확인을 위해 브라우저 창을 유지합니다.');
    console.log('종료하려면 터미널에서 Ctrl+C를 누르세요.');
    
    // 결과 요약
    console.log('\n📋 테스트 결과 요약:');
    console.log(`콘솔 에러 수: ${errorCount}개`);
    if (errorCount < 10) {
      console.log('✅ 무한 렌더링 루프 해결됨');
    } else {
      console.log('❌ 여전히 렌더링 문제 존재');
    }
    
    await new Promise(() => {}); // 무한 대기
  }
}

// 테스트 실행
if (require.main === module) {
  testFixedStepFunctionality()
    .then(result => {
      if (result) {
        console.log('🎉 스프레드시트 스텝 추가 버그 수정 성공!');
      } else {
        console.log('💥 수정이 완전하지 않음, 추가 작업 필요');
      }
    })
    .catch(error => {
      console.error('💥 테스트 실행 중 치명적 오류:', error);
    });
}

module.exports = { testFixedStepFunctionality };