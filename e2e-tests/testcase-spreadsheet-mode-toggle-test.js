// ICT-145: 스프레드시트 모드 토글 기능 E2E 테스트
const { chromium } = require('playwright');

/**
 * ICT-145: 테스트케이스 스프레드시트 모드 토글 기능 E2E 테스트
 * 
 * 테스트 범위:
 * - 개별 입력 ↔ 일괄 입력 모드 전환 기능 검증
 * - 모드 전환 시 UI 변화 검증
 * - 기존 입력 데이터 보존 확인
 * - 모드별 폼 필드 구성 검증
 */
async function testSpreadsheetModeToggle() {
    console.log('🧪 ICT-145: 스프레드시트 모드 토글 E2E 테스트 시작...');
    
    const browser = await chromium.launch({ 
        headless: false,  // 개발 단계에서는 false로 설정하여 시각적 확인
        timeout: 30000 
    });
    
    const testResults = {
        total: 0,
        passed: 0,
        failed: 0,
        errors: []
    };
    
    try {
        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 }
        });
        const page = await context.newPage();
        
        // 테스트 결과 추적 함수
        const recordTest = (testName, success, errorMessage = null) => {
            testResults.total++;
            if (success) {
                testResults.passed++;
                console.log(`✅ ${testName}`);
            } else {
                testResults.failed++;
                testResults.errors.push(`${testName}: ${errorMessage}`);
                console.log(`❌ ${testName}: ${errorMessage}`);
            }
        };
        
        // 1. 애플리케이션 접속 및 로그인
        console.log('\n📋 단계 1: 애플리케이션 접속 및 로그인');
        try {
            await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });
            
            // 로그인 (admin/admin 사용)
            await page.fill('input[name="username"]', 'admin');
            await page.fill('input[name="password"]', 'admin');
            await page.click('button[type="submit"]');
            
            // 로그인 성공 대기
            await page.waitForSelector('[data-testid="dashboard"], .dashboard, .main-content', { timeout: 10000 });
            recordTest('애플리케이션 접속 및 로그인', true);
        } catch (error) {
            recordTest('애플리케이션 접속 및 로그인', false, error.message);
            throw error;
        }
        
        // 2. 프로젝트 선택 및 테스트케이스 관리 페이지 이동
        console.log('\n📋 단계 2: 테스트케이스 관리 페이지 이동');
        try {
            // 첫 번째 프로젝트 선택
            const projectButton = await page.locator('button:has-text("프로젝트"), button:has-text("Project"), .project-item, [data-testid="project-card"]').first();
            if (await projectButton.count() > 0) {
                await projectButton.click();
                await page.waitForLoadState('networkidle');
            }
            
            // 테스트케이스 메뉴 클릭
            const testCaseMenu = await page.locator('a:has-text("테스트케이스"), a:has-text("Test Cases"), [href*="testcases"]').first();
            if (await testCaseMenu.count() > 0) {
                await testCaseMenu.click();
                await page.waitForLoadState('networkidle');
            }
            
            // 테스트케이스 관리 페이지 도달 확인
            const isTestCasePage = await page.locator('.test-case-form, .testcase-container, [data-testid="testcase-manager"]').count() > 0;
            recordTest('테스트케이스 관리 페이지 이동', isTestCasePage, !isTestCasePage ? '테스트케이스 페이지를 찾을 수 없음' : null);
        } catch (error) {
            recordTest('테스트케이스 관리 페이지 이동', false, error.message);
        }
        
        // 3. 기본 개별 입력 모드 확인
        console.log('\n📋 단계 3: 기본 개별 입력 모드 UI 확인');
        try {
            // 개별 입력 폼 요소들 확인
            const nameInput = await page.locator('input[name="name"], input[placeholder*="이름"], input[placeholder*="name"]').count() > 0;
            const descriptionInput = await page.locator('textarea[name="description"], textarea[placeholder*="설명"], textarea[placeholder*="description"]').count() > 0;
            const formElements = nameInput && descriptionInput;
            
            recordTest('기본 개별 입력 모드 폼 확인', formElements, !formElements ? '개별 입력 폼 요소를 찾을 수 없음' : null);
            
            // 스크린샷 저장 (개별 모드)
            await page.screenshot({ 
                path: 'ict-145-individual-mode.png',
                fullPage: true 
            });
        } catch (error) {
            recordTest('기본 개별 입력 모드 UI 확인', false, error.message);
        }
        
        // 4. 스프레드시트 모드 토글 버튼 찾기
        console.log('\n📋 단계 4: 스프레드시트 모드 토글 버튼 확인');
        try {
            // 가능한 토글 버튼 셀렉터들
            const toggleButtonSelectors = [
                'button:has-text("일괄")',
                'button:has-text("스프레드시트")',
                'button:has-text("Bulk")',
                'button:has-text("Spreadsheet")',
                '[data-testid="toggle-mode"]',
                '[data-testid="bulk-mode"]',
                '.mode-toggle',
                '.bulk-input-toggle'
            ];
            
            let toggleButton = null;
            for (const selector of toggleButtonSelectors) {
                const button = page.locator(selector);
                if (await button.count() > 0) {
                    toggleButton = button;
                    break;
                }
            }
            
            const hasToggleButton = toggleButton !== null;
            recordTest('스프레드시트 모드 토글 버튼 존재', hasToggleButton, !hasToggleButton ? '토글 버튼을 찾을 수 없음' : null);
            
            if (hasToggleButton) {
                // 5. 스프레드시트 모드로 전환
                console.log('\n📋 단계 5: 스프레드시트 모드로 전환');
                await toggleButton.click();
                await page.waitForTimeout(1000); // UI 전환 대기
                
                // 스프레드시트 UI 확인
                const spreadsheetElements = await page.locator('table, .spreadsheet, .data-grid, .ag-grid').count() > 0;
                recordTest('스프레드시트 모드 UI 전환', spreadsheetElements, !spreadsheetElements ? '스프레드시트 UI를 찾을 수 없음' : null);
                
                // 스크린샷 저장 (스프레드시트 모드)
                await page.screenshot({ 
                    path: 'ict-145-spreadsheet-mode.png',
                    fullPage: true 
                });
                
                // 6. 스프레드시트 모드에서 개별 모드로 복귀
                console.log('\n📋 단계 6: 개별 모드로 복귀');
                await toggleButton.click();
                await page.waitForTimeout(1000); // UI 전환 대기
                
                // 개별 입력 폼으로 복귀 확인
                const backToIndividual = await page.locator('input[name="name"], input[placeholder*="이름"], input[placeholder*="name"]').count() > 0;
                recordTest('개별 모드 복귀', backToIndividual, !backToIndividual ? '개별 모드로 복귀하지 못함' : null);
            }
            
        } catch (error) {
            recordTest('스프레드시트 모드 토글 테스트', false, error.message);
        }
        
        // 7. 데이터 보존 테스트 (기본 데이터 입력 후 모드 전환)
        console.log('\n📋 단계 7: 데이터 보존 테스트');
        try {
            // 개별 모드에서 데이터 입력
            const nameInput = page.locator('input[name="name"], input[placeholder*="이름"], input[placeholder*="name"]').first();
            if (await nameInput.count() > 0) {
                await nameInput.fill('테스트 케이스 이름');
                
                const descriptionInput = page.locator('textarea[name="description"], textarea[placeholder*="설명"], textarea[placeholder*="description"]').first();
                if (await descriptionInput.count() > 0) {
                    await descriptionInput.fill('테스트 케이스 설명');
                }
                
                // 토글 버튼 다시 찾기
                const toggleButtonSelectors = [
                    'button:has-text("일괄")',
                    'button:has-text("스프레드시트")',
                    'button:has-text("Bulk")',
                    'button:has-text("Spreadsheet")'
                ];
                
                let toggleButton = null;
                for (const selector of toggleButtonSelectors) {
                    const button = page.locator(selector);
                    if (await button.count() > 0) {
                        toggleButton = button;
                        break;
                    }
                }
                
                if (toggleButton) {
                    // 스프레드시트 모드로 전환
                    await toggleButton.click();
                    await page.waitForTimeout(1000);
                    
                    // 다시 개별 모드로 복귀
                    await toggleButton.click();
                    await page.waitForTimeout(1000);
                    
                    // 데이터 보존 확인
                    const preservedName = await nameInput.inputValue();
                    const dataPreserved = preservedName === '테스트 케이스 이름';
                    recordTest('모드 전환 시 데이터 보존', dataPreserved, !dataPreserved ? `데이터가 보존되지 않음: ${preservedName}` : null);
                }
            }
        } catch (error) {
            recordTest('데이터 보존 테스트', false, error.message);
        }
        
        // 8. 반응형 테스트 (모바일에서 토글 기능)
        console.log('\n📋 단계 8: 모바일 반응형 토글 테스트');
        try {
            await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
            await page.waitForTimeout(500);
            
            // 모바일에서 토글 버튼 접근성 확인
            const toggleVisible = await page.locator('button:has-text("일괄"), button:has-text("스프레드시트")').first().isVisible();
            recordTest('모바일에서 토글 버튼 접근성', toggleVisible, !toggleVisible ? '모바일에서 토글 버튼이 보이지 않음' : null);
            
            // 모바일 스크린샷
            await page.screenshot({ 
                path: 'ict-145-mobile-view.png',
                fullPage: true 
            });
            
            // 데스크톱 해상도로 복원
            await page.setViewportSize({ width: 1920, height: 1080 });
        } catch (error) {
            recordTest('모바일 반응형 토글 테스트', false, error.message);
        }
        
    } catch (error) {
        console.log(`❌ 전체 테스트 실행 중 오류: ${error.message}`);
        testResults.errors.push(`전체 테스트 실행 오류: ${error.message}`);
    } finally {
        await browser.close();
    }
    
    // 테스트 결과 요약
    console.log('\n📊 ICT-145 테스트 결과 요약:');
    console.log(`총 테스트: ${testResults.total}개`);
    console.log(`성공: ${testResults.passed}개`);
    console.log(`실패: ${testResults.failed}개`);
    
    if (testResults.failed > 0) {
        console.log('\n❌ 실패한 테스트들:');
        testResults.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    const successRate = testResults.total > 0 ? ((testResults.passed / testResults.total) * 100).toFixed(1) : 0;
    console.log(`\n🎯 성공률: ${successRate}%`);
    
    if (successRate >= 80) {
        console.log('✅ ICT-145: 스프레드시트 모드 토글 기능 E2E 테스트 PASS');
    } else {
        console.log('❌ ICT-145: 스프레드시트 모드 토글 기능 E2E 테스트 FAIL');
    }
    
    return testResults;
}

// 테스트 실행
if (require.main === module) {
    testSpreadsheetModeToggle()
        .then(results => {
            process.exit(results.failed > 0 ? 1 : 0);
        })
        .catch(error => {
            console.error('테스트 실행 실패:', error);
            process.exit(1);
        });
}

module.exports = { testSpreadsheetModeToggle };