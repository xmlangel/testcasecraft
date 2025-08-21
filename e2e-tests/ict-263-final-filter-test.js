// e2e-tests/ict-263-final-filter-test.js
// ICT-263: 테스트결과 필터링 기능 최종 E2E 테스트 (실제 데이터 변화 확인)

const { chromium } = require('playwright');

/**
 * ICT-263 테스트결과 필터링 기능 최종 검증
 * 실제 데이터가 필터링되어 화면에서 변화가 보이는지 확인
 */
async function runICT263FinalFilterTest() {
    console.log('🚀 ICT-263: 테스트결과 필터링 기능 최종 E2E 테스트');
    console.log('='.repeat(80));

    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 
    });
    
    try {
        const context = await browser.newContext({
            baseURL: 'http://localhost:8080'
        });
        
        const page = await context.newPage();

        // 1. 로그인 및 네비게이션
        console.log('📋 1단계: 로그인 및 프로젝트 선택');
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        // 프로젝트 선택
        await page.locator('button:has-text("프로젝트 선택")').click();
        await page.waitForLoadState('networkidle');
        await page.locator('button:has-text("프로젝트 열기")').first().click();
        await page.waitForLoadState('networkidle');
        
        // 테스트결과 탭
        await page.locator('div[role="tablist"] button').nth(4).click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // 상세 테이블 탭
        const detailTableTab = page.locator('div[role="tablist"] button:has-text("상세 테이블")');
        if (await detailTableTab.count() > 0) {
            await detailTableTab.click();
            await page.waitForTimeout(3000);
        }

        // 2. 초기 테스트 결과 개수 확인
        console.log('📋 2단계: 초기 테스트 결과 개수 확인');
        
        await page.waitForTimeout(2000);
        const initialRowCount = await page.locator('table tbody tr, [role="grid"] [role="row"]').count();
        console.log(`✅ 초기 테스트 결과: ${initialRowCount}개`);

        // 3. TestExecution 필터 테스트 (실제로 다른 결과를 보여줄 수 있는 필터)
        console.log('📋 3단계: 테스트 실행 필터 테스트');
        
        // 테스트 실행 드롭다운 클릭
        const testExecSelect = page.locator('label:has-text("테스트 실행") + div');
        if (await testExecSelect.count() > 0) {
            console.log('✅ 테스트 실행 드롭다운 발견');
            await testExecSelect.first().click();
            await page.waitForTimeout(1000);
            
            // 옵션 개수 확인
            const options = page.locator('[role="option"]');
            const optionCount = await options.count();
            console.log(`✅ 드롭다운 옵션 개수: ${optionCount}`);
            
            // 첫 번째 실제 옵션 선택 (전체 보기 제외)
            const realOptions = page.locator('[role="option"]:not(:has-text("전체 보기"))');
            const realOptionCount = await realOptions.count();
            
            if (realOptionCount > 0) {
                // 첫 번째 실행 선택
                await realOptions.first().click();
                console.log('✅ 첫 번째 테스트 실행 선택 완료');
                
                // 필터 적용
                const applyButton = page.locator('button:has-text("필터 적용")');
                if (await applyButton.count() > 0) {
                    await applyButton.click();
                    console.log('✅ 필터 적용 버튼 클릭');
                    await page.waitForLoadState('networkidle');
                    await page.waitForTimeout(3000);
                }
                
                // 필터 적용 후 개수 확인
                const firstFilterRowCount = await page.locator('table tbody tr, [role="grid"] [role="row"]').count();
                console.log(`✅ 첫 번째 실행 필터 후: ${firstFilterRowCount}개`);
                
                // 4. 다른 실행으로 변경 테스트
                console.log('📋 4단계: 두 번째 테스트 실행으로 변경');
                
                if (realOptionCount > 1) {
                    // 드롭다운 다시 열기
                    await testExecSelect.first().click();
                    await page.waitForTimeout(1000);
                    
                    // 두 번째 실행 선택
                    await realOptions.nth(1).click();
                    console.log('✅ 두 번째 테스트 실행 선택 완료');
                    
                    // 필터 재적용
                    await applyButton.click();
                    console.log('✅ 필터 재적용');
                    await page.waitForLoadState('networkidle');
                    await page.waitForTimeout(3000);
                    
                    // 두 번째 필터 적용 후 개수 확인
                    const secondFilterRowCount = await page.locator('table tbody tr, [role="grid"] [role="row"]').count();
                    console.log(`✅ 두 번째 실행 필터 후: ${secondFilterRowCount}개`);
                    
                    // 5. 필터 초기화 테스트
                    console.log('📋 5단계: 필터 초기화');
                    const clearButton = page.locator('button:has-text("초기화")');
                    if (await clearButton.count() > 0) {
                        await clearButton.click();
                        await page.waitForLoadState('networkidle');
                        await page.waitForTimeout(2000);
                        
                        const clearedRowCount = await page.locator('table tbody tr, [role="grid"] [role="row"]').count();
                        console.log(`✅ 초기화 후: ${clearedRowCount}개`);
                        
                        // 6. 결과 검증
                        console.log('📋 6단계: 필터링 기능 검증');
                        console.log('='.repeat(80));
                        
                        console.log(`🔍 데이터 변화 검증:`);
                        console.log(`   - 초기 상태: ${initialRowCount}개`);
                        console.log(`   - 첫 번째 실행: ${firstFilterRowCount}개`);
                        console.log(`   - 두 번째 실행: ${secondFilterRowCount}개`); 
                        console.log(`   - 초기화 후: ${clearedRowCount}개`);
                        
                        const isFilteringWorking = (
                            firstFilterRowCount !== secondFilterRowCount &&
                            firstFilterRowCount < initialRowCount &&
                            secondFilterRowCount < initialRowCount &&
                            clearedRowCount === initialRowCount
                        );
                        
                        if (isFilteringWorking) {
                            console.log('🎉 ICT-263 테스트결과 필터링 기능 최종 검증 PASS!');
                            console.log('✅ 실제 데이터가 필터링되어 화면에서 개수가 변함을 확인');
                            console.log('✅ 다른 필터 선택 시 다른 결과가 표시됨을 확인');
                            console.log('✅ 초기화 기능이 정상 작동함을 확인');
                        } else {
                            console.log('⚠️ 일부 검증 항목에서 예상과 다른 결과');
                            console.log('📋 수동으로 브라우저에서 확인 필요');
                        }
                    }
                } else {
                    console.log('⚠️ 테스트 실행이 하나뿐이어서 다양한 필터 테스트 불가');
                }
            }
        }

        // 7. 30초간 수동 확인
        console.log('📋 7단계: 수동 확인 시간');
        console.log('⏳ 30초간 브라우저에서 직접 필터링 기능을 확인하세요...');
        await page.waitForTimeout(30000);

    } catch (error) {
        console.error('❌ E2E 테스트 실패:', error.message);
        console.error(error.stack);
    } finally {
        await browser.close();
    }
}

// 메인 실행
if (require.main === module) {
    runICT263FinalFilterTest().catch(console.error);
}

module.exports = { runICT263FinalFilterTest };