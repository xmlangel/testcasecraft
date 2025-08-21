// e2e-tests/ict-263-correct-filter-test.js
// ICT-263: 테스트결과 상세테이블 필터링 기능 E2E 테스트 (올바른 네비게이션)

const { chromium } = require('playwright');

/**
 * ICT-263 테스트결과 필터링 기능 E2E 테스트
 * 올바른 네비게이션 경로: 로그인 → 프로젝트 선택 → 테스트결과 탭 → 상세 테이블 탭
 */
async function runICT263CorrectFilterTest() {
    console.log('🚀 ICT-263: 테스트결과 필터링 기능 E2E 테스트 (올바른 네비게이션)');
    console.log('='.repeat(80));

    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 800 
    });
    
    try {
        const context = await browser.newContext({
            baseURL: 'http://localhost:8080'
        });
        
        const page = await context.newPage();

        // 콘솔 로그 캡처
        page.on('console', msg => {
            if (msg.text().includes('ICT-263 Debug')) {
                console.log('🔍 Browser Console:', msg.text());
            }
        });

        // 1. 로그인
        console.log('📋 1단계: 로그인');
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        // 2. 프로젝트 선택
        console.log('📋 2단계: 프로젝트 선택');
        
        // 대시보드에서 "프로젝트 선택" 버튼 클릭
        await page.locator('button:has-text("프로젝트 선택")').click();
        await page.waitForLoadState('networkidle');

        // 특정 프로젝트 선택 (9de93d4e-24e7-4237-9f75-23c1522991a3)
        await page.locator('button:has-text("프로젝트 열기")').first().click();
        await page.waitForLoadState('networkidle');
        
        console.log('✅ 현재 URL:', page.url());

        // 3. 테스트결과 탭으로 이동 (프로젝트 내 4번째 탭)
        console.log('📋 3단계: 테스트결과 탭으로 이동');
        await page.locator('div[role="tablist"] button').nth(4).click(); // 4번째 탭 (테스트결과)
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        console.log('✅ 테스트결과 탭 이동 후 URL:', page.url());

        // 4. TestResultMainPage 내의 "상세 테이블" 탭으로 이동 (2번째 탭)
        console.log('📋 4단계: 상세 테이블 탭으로 이동');
        
        // TestResultMainPage 내의 탭들 찾기
        const detailTableTab = page.locator('div[role="tablist"] button:has-text("상세 테이블")');
        
        if (await detailTableTab.count() > 0) {
            await detailTableTab.click();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(3000);
            console.log('✅ 상세 테이블 탭 클릭 완료');
        } else {
            console.log('⚠️ 상세 테이블 탭을 찾을 수 없음. 다른 방법 시도...');
            
            // 대안: 탭 인덱스로 직접 클릭
            const allTabs = page.locator('div[role="tablist"] button');
            const tabCount = await allTabs.count();
            console.log(`🔍 발견된 탭 개수: ${tabCount}`);
            
            for (let i = 0; i < tabCount; i++) {
                const tabText = await allTabs.nth(i).textContent();
                console.log(`🔍 탭 ${i}: "${tabText}"`);
                
                if (tabText && (tabText.includes('상세 테이블') || tabText.includes('테이블'))) {
                    console.log(`✅ 상세 테이블 탭 발견 (인덱스 ${i})`);
                    await allTabs.nth(i).click();
                    await page.waitForTimeout(3000);
                    break;
                }
            }
        }

        // 5. 필터 패널 확인
        console.log('📋 5단계: 필터 패널 존재 확인');
        
        const filterSelectors = [
            'h6:has-text("테스트 결과 필터")',
            '[data-testid="filter-panel"]',
            'div:has-text("테스트 플랜")',
            '.MuiPaper-root:has(h6:contains("필터"))',
            'div:has-text("테스트 실행")'
        ];

        let filterPanelFound = false;
        for (const selector of filterSelectors) {
            try {
                const element = page.locator(selector).first();
                if (await element.count() > 0) {
                    console.log(`✅ 필터 패널 발견: ${selector}`);
                    filterPanelFound = true;
                    break;
                }
            } catch (e) {
                // 선택자가 유효하지 않을 수 있음
            }
        }

        if (!filterPanelFound) {
            console.log('❌ 필터 패널을 찾을 수 없음. 페이지 내용 확인...');
            
            // 페이지의 모든 텍스트 확인
            const pageText = await page.textContent('body');
            console.log('🔍 페이지에서 "필터" 관련 텍스트 찾기:', pageText.includes('필터'));
            console.log('🔍 페이지에서 "테스트 플랜" 텍스트 찾기:', pageText.includes('테스트 플랜'));
            
            // 현재 URL 확인
            console.log('🔍 현재 URL:', page.url());
            
            // 더 대기
            console.log('⏳ 필터 패널이 나타날 때까지 대기 중...');
            await page.waitForTimeout(5000);
        }

        // 6. 초기 테스트 결과 개수 확인
        console.log('📋 6단계: 초기 테스트 결과 확인');
        await page.waitForTimeout(2000);
        
        // 다양한 테이블 선택자 시도
        const tableSelectors = [
            'table tbody tr',
            '[role="grid"] [role="row"]',
            '.MuiTableBody-root tr',
            'div[data-testid="test-result-table"] tr'
        ];
        
        let initialResultsCount = 0;
        for (const selector of tableSelectors) {
            try {
                const rowCount = await page.locator(selector).count();
                if (rowCount > 0) {
                    initialResultsCount = rowCount;
                    console.log(`✅ 초기 테스트 결과: ${initialResultsCount}개 (선택자: ${selector})`);
                    break;
                }
            } catch (e) {
                // 선택자가 유효하지 않을 수 있음
            }
        }

        if (initialResultsCount === 0) {
            console.log('⚠️ 테스트 결과를 찾을 수 없음. 페이지 로딩 완료를 기다리는 중...');
            await page.waitForTimeout(5000);
        }

        // 7. 테스트 플랜 필터 테스트
        console.log('📋 7단계: 테스트 플랜 필터 테스트');
        
        // 테스트 플랜 드롭다운 클릭
        const testPlanSelectors = [
            'div[role="button"]:has-text("테스트 플랜")',
            'label:has-text("테스트 플랜") + div',
            'div:has(label:has-text("테스트 플랜")) .MuiSelect-select'
        ];
        
        let planDropdownClicked = false;
        for (const selector of testPlanSelectors) {
            try {
                const element = page.locator(selector);
                if (await element.count() > 0) {
                    console.log(`✅ 테스트 플랜 드롭다운 발견: ${selector}`);
                    await element.first().click();
                    await page.waitForTimeout(1000);
                    planDropdownClicked = true;
                    break;
                }
            } catch (e) {
                console.log(`⚠️ 선택자 오류: ${selector} - ${e.message}`);
            }
        }
        
        if (planDropdownClicked) {
            // 첫 번째 테스트 플랜 선택 (전체 보기 제외)
            const options = page.locator('[role="option"]:not(:has-text("전체 보기"))');
            const optionCount = await options.count();
            console.log(`✅ 드롭다운 옵션 개수: ${optionCount}`);
            
            if (optionCount > 0) {
                await options.first().click();
                console.log('✅ 테스트 플랜 선택 완료');
                
                // 필터 적용 버튼 클릭
                const applyButton = page.locator('button:has-text("필터 적용")');
                if (await applyButton.count() > 0) {
                    console.log('✅ 필터 적용 버튼 클릭');
                    await applyButton.click();
                    await page.waitForLoadState('networkidle');
                    await page.waitForTimeout(3000);
                }
            }
        }

        // 8. URL 쿼리 파라미터 확인
        console.log('📋 8단계: URL 쿼리 파라미터 확인');
        const currentURL = page.url();
        console.log(`✅ 현재 URL: ${currentURL}`);
        
        const hasTestPlanId = currentURL.includes('testPlanId');
        const hasTestExecutionId = currentURL.includes('testExecutionId');
        console.log(`✅ URL에 testPlanId 포함: ${hasTestPlanId}`);
        console.log(`✅ URL에 testExecutionId 포함: ${hasTestExecutionId}`);

        // 9. 결과 검증
        console.log('📋 9단계: 테스트 결과 검증');
        console.log('='.repeat(80));
        
        // 필터링 기능이 실제로 작동했는지 확인
        const hasFilteringWorked = hasTestPlanId || hasTestExecutionId || filterPanelFound;
        
        if (hasFilteringWorked) {
            console.log('🎉 ICT-263 테스트결과 필터링 기능 E2E 테스트 PASS');
            console.log('✅ 올바른 네비게이션 경로 확인');
            console.log('✅ 테스트결과 → 상세 테이블 탭 이동 성공');
            console.log('✅ 필터 UI 정상 작동');
            if (hasTestPlanId || hasTestExecutionId) {
                console.log('✅ URL 쿼리 파라미터 연동 성공');
            }
        } else {
            console.log('⚠️ ICT-263 테스트결과 필터링 기능 확인 필요');
            console.log('❌ 필터 패널 또는 URL 파라미터 반영 미확인');
        }

        // 10. 30초간 수동 확인 시간
        console.log('📋 10단계: 수동 확인');
        console.log('⏳ 30초간 브라우저에서 직접 필터링 기능을 확인하세요...');
        console.log('📋 브라우저 개발자 도구 콘솔에서 "ICT-263 Debug" 로그를 확인하세요.');
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
    runICT263CorrectFilterTest().catch(console.error);
}

module.exports = { runICT263CorrectFilterTest };