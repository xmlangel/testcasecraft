// e2e-tests/debug-filter-test.js
// ICT-263: 테스트결과 필터링 디버깅을 위한 간단한 E2E 테스트

const { chromium } = require('playwright');

async function debugFilterTest() {
    console.log('🚀 ICT-263 필터링 디버깅 테스트 시작');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 
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
        console.log('📋 로그인 중...');
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        // 2. 프로젝트 선택
        console.log('📋 프로젝트 선택 중...');
        await page.locator('text=프로젝트').first().click();
        await page.waitForLoadState('networkidle');

        // 첫 번째 프로젝트 선택
        await page.locator('button:has-text("프로젝트 열기")').first().click();
        await page.waitForLoadState('networkidle');

        // 3. 테스트 결과 탭으로 이동
        console.log('📋 테스트 결과 페이지로 이동 중...');
        await page.locator('text=테스트결과').first().click();
        await page.waitForLoadState('networkidle');

        // 잠시 대기하여 로그 확인
        await page.waitForTimeout(3000);

        // 4. 필터 패널 확인
        console.log('📋 필터 패널 찾는 중...');
        
        // 다양한 선택자로 필터 패널 찾기 시도
        const filterSelectors = [
            'h6:has-text("테스트 결과 필터")',
            '[data-testid="filter-panel"]', 
            'text="테스트 결과 필터"',
            '.MuiPaper-root:has(h6:contains("필터"))',
            'div:has-text("테스트 플랜")',
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
            console.log('❌ 필터 패널을 찾을 수 없음. 페이지 구조 확인...');
            
            // 페이지의 모든 텍스트 확인
            const pageText = await page.textContent('body');
            console.log('🔍 페이지에서 "필터" 관련 텍스트 찾기:', pageText.includes('필터'));
            console.log('🔍 페이지에서 "테스트 플랜" 텍스트 찾기:', pageText.includes('테스트 플랜'));
            
            // 현재 URL 확인
            console.log('🔍 현재 URL:', page.url());
            
            // 5초 더 대기
            console.log('⏳ 필터 패널이 나타날 때까지 대기 중...');
            await page.waitForTimeout(5000);
        }

        // 5. 테스트 플랜 드롭다운 찾기
        console.log('📋 테스트 플랜 드롭다운 찾는 중...');
        
        const planDropdownSelectors = [
            'div[role="button"]:has-text("테스트 플랜")',
            'label:has-text("테스트 플랜") + div',
            '.MuiInputLabel-root:has-text("테스트 플랜") ~ div',
            'div:has-text("테스트 플랜") .MuiSelect-root'
        ];

        for (const selector of planDropdownSelectors) {
            try {
                const element = page.locator(selector).first();
                if (await element.count() > 0) {
                    console.log(`✅ 테스트 플랜 드롭다운 발견: ${selector}`);
                    
                    // 클릭해보기
                    await element.click();
                    await page.waitForTimeout(1000);
                    
                    // 옵션이 나타나는지 확인
                    const options = page.locator('[role="option"]');
                    const optionCount = await options.count();
                    console.log(`✅ 드롭다운 옵션 개수: ${optionCount}`);
                    
                    if (optionCount > 1) {
                        // 첫 번째 옵션 선택 (전체 보기 제외)
                        await options.nth(1).click();
                        console.log('✅ 테스트 플랜 선택 완료');
                        
                        // 필터 적용 버튼 찾기 및 클릭
                        const applyButton = page.locator('button:has-text("필터 적용")');
                        if (await applyButton.count() > 0) {
                            console.log('✅ 필터 적용 버튼 클릭');
                            await applyButton.click();
                            await page.waitForTimeout(3000);
                        }
                    }
                    break;
                }
            } catch (e) {
                console.log(`⚠️ 선택자 오류: ${selector} - ${e.message}`);
            }
        }

        // 6. 결과 확인을 위해 잠시 대기
        console.log('⏳ 필터링 결과 확인을 위해 대기 중...');
        await page.waitForTimeout(5000);

        console.log('🎉 디버깅 테스트 완료. 브라우저 창에서 직접 확인해보세요.');
        console.log('콘솔 로그를 통해 필터링 과정이 제대로 실행되었는지 확인하세요.');

        // 브라우저를 열어둬서 사용자가 직접 확인할 수 있도록 함
        console.log('⏳ 30초 후에 브라우저가 자동으로 닫힙니다...');
        await page.waitForTimeout(30000);

    } catch (error) {
        console.error('❌ 디버깅 테스트 실패:', error.message);
    } finally {
        await browser.close();
    }
}

// 실행
if (require.main === module) {
    debugFilterTest().catch(console.error);
}

module.exports = { debugFilterTest };