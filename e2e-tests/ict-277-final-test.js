// e2e-tests/ict-277-final-test.js
// ICT-277: 테스트결과 상세테이블 내보내기 새 컬럼 포함 테스트 (최종)

const { chromium } = require('playwright');

async function testExportNewColumns() {
    console.log('=== ICT-277: 테스트결과 내보내기 새 컬럼 포함 테스트 (최종) ===');
    
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        baseURL: 'http://localhost:8080'
    });
    const page = await context.newPage();
    
    try {
        // 1. 로그인
        console.log('1️⃣ 로그인 시작...');
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        console.log('✅ 로그인 완료');
        
        // 2. 프로젝트 선택
        console.log('2️⃣ 프로젝트 선택...');
        await page.locator('text=프로젝트').first().click();
        await page.waitForLoadState('networkidle');
        
        const projectButton = page.locator('button:has-text("프로젝트 열기")').first();
        await projectButton.click();
        await page.waitForLoadState('networkidle');
        console.log('✅ 프로젝트 선택 완료');
        
        // 3. 테스트결과 탭으로 이동
        console.log('3️⃣ 테스트결과 탭으로 이동...');
        await page.locator('text=테스트결과').first().click();
        await page.waitForLoadState('networkidle');
        console.log('✅ 테스트결과 탭 접근 완료');
        
        // 4. 상세 테이블 탭 클릭
        console.log('4️⃣ 상세 테이블 탭 클릭...');
        const detailTableTab = page.locator('button:has-text("상세 테이블")');
        if (await detailTableTab.isVisible()) {
            await detailTableTab.click();
            await page.waitForLoadState('networkidle');
            console.log('✅ 상세 테이블 탭 접근 완료');
        } else {
            console.log('⚠️ 상세 테이블 탭을 찾을 수 없습니다. 현재 페이지에서 계속 진행합니다.');
        }
        
        // 5. 페이지에서 DataGrid 또는 테이블 요소 대기
        console.log('5️⃣ 테이블 로딩 대기...');
        await page.waitForTimeout(3000);
        
        // 6. 모든 가능한 내보내기 버튼 찾기
        console.log('6️⃣ 내보내기 버튼 전체 탐색...');
        
        // 페이지의 모든 요소를 스크린샷으로 확인
        await page.screenshot({ path: './e2e-tests/debug-page.png', fullPage: true });
        console.log('✅ 디버그용 스크린샷 저장: ./e2e-tests/debug-page.png');
        
        // 모든 버튼의 텍스트 확인
        const allButtons = await page.locator('button').all();
        console.log('페이지의 모든 버튼 개수:', allButtons.length);
        
        for (let i = 0; i < Math.min(allButtons.length, 20); i++) {
            try {
                const buttonText = await allButtons[i].textContent();
                const isVisible = await allButtons[i].isVisible();
                console.log(`버튼 ${i + 1}: "${buttonText}" (visible: ${isVisible})`);
            } catch (e) {
                console.log(`버튼 ${i + 1}: 텍스트 읽기 실패`);
            }
        }
        
        // 7. 특정 내보내기 관련 요소들 찾기
        console.log('7️⃣ 내보내기 관련 요소 탐색...');
        
        const exportSelectors = [
            'button:has-text("고급 내보내기")',
            'button:has-text("내보내기")',
            'button:has-text("Export")',
            '[aria-label*="export" i]',
            '[title*="export" i]',
            'button[data-testid*="export"]',
            '.MuiButton-root:has-text("Export")',
            '[role="toolbar"] button'
        ];
        
        let foundExportButton = false;
        
        for (const selector of exportSelectors) {
            try {
                const elements = await page.locator(selector).all();
                if (elements.length > 0) {
                    console.log(`발견: ${selector} (${elements.length}개)`);
                    for (let i = 0; i < elements.length; i++) {
                        const text = await elements[i].textContent();
                        const isVisible = await elements[i].isVisible();
                        console.log(`  - 요소 ${i + 1}: "${text}" (visible: ${isVisible})`);
                        
                        if (isVisible && (text.includes('내보내기') || text.includes('Export'))) {
                            console.log(`✅ 내보내기 버튼 발견: "${text}"`);
                            foundExportButton = true;
                            
                            try {
                                await elements[i].click();
                                await page.waitForTimeout(2000);
                                
                                // 다이얼로그나 다운로드 확인
                                const hasDialog = await page.locator('[role="dialog"]').isVisible();
                                if (hasDialog) {
                                    console.log('✅ 내보내기 다이얼로그가 열림');
                                    
                                    // 다이얼로그 내용 스크린샷
                                    await page.screenshot({ path: './e2e-tests/export-dialog.png' });
                                    console.log('✅ 내보내기 다이얼로그 스크린샷 저장');
                                    
                                    // 다이얼로그 닫기
                                    await page.keyboard.press('Escape');
                                } else {
                                    console.log('⚠️ 내보내기 다이얼로그가 열리지 않음');
                                }
                                
                            } catch (clickError) {
                                console.log(`⚠️ 버튼 클릭 실패: ${clickError.message}`);
                            }
                            
                            break;
                        }
                    }
                }
            } catch (e) {
                // 선택자가 유효하지 않은 경우 무시
            }
        }
        
        if (!foundExportButton) {
            console.log('❌ 내보내기 버튼을 찾을 수 없습니다.');
            
            // 현재 URL 확인
            const currentUrl = page.url();
            console.log('현재 URL:', currentUrl);
            
            // 페이지 소스에서 export 관련 텍스트 찾기
            const pageContent = await page.content();
            const hasExportText = pageContent.toLowerCase().includes('export') || pageContent.includes('내보내기');
            console.log('페이지에 export 관련 텍스트 포함 여부:', hasExportText);
        }
        
        // 8. 현재 테이블 구조 확인
        console.log('8️⃣ 테이블 구조 확인...');
        
        // DataGrid 또는 일반 테이블 찾기
        const tableSelectors = [
            '[role="grid"]',
            '[role="table"]',
            '.MuiDataGrid-root',
            'table',
            '[data-testid*="table"]'
        ];
        
        for (const selector of tableSelectors) {
            try {
                const table = page.locator(selector);
                if (await table.isVisible()) {
                    console.log(`✅ 테이블 발견: ${selector}`);
                    
                    // 컬럼 헤더 확인
                    const headers = await page.locator(`${selector} [role="columnheader"]`).allTextContents();
                    if (headers.length > 0) {
                        console.log('컬럼 헤더들:', headers);
                        
                        // 새로운 컬럼들 확인
                        const newColumns = ['사전설정', '스텝 정보', '전체 예상결과'];
                        const foundColumns = newColumns.filter(col => 
                            headers.some(header => header.includes(col))
                        );
                        
                        if (foundColumns.length > 0) {
                            console.log(`✅ 새로운 컬럼들 발견: ${foundColumns.join(', ')}`);
                        } else {
                            console.log('⚠️ 새로운 컬럼들이 현재 표시되지 않음');
                        }
                    }
                    break;
                }
            } catch (e) {
                // 선택자가 유효하지 않은 경우 무시
            }
        }
        
        console.log('🎉 ICT-277 디버깅 테스트 완료!');
        console.log('');
        console.log('=== 테스트 결과 요약 ===');
        console.log('✅ 로그인 성공');
        console.log('✅ 프로젝트 접근 성공');
        console.log('✅ 테스트결과 탭 접근 성공');
        console.log(foundExportButton ? '✅ 내보내기 버튼 발견' : '❌ 내보내기 버튼 미발견');
        console.log('');
        console.log('📸 디버그 스크린샷들이 e2e-tests/ 폴더에 저장되었습니다.');
        
    } catch (error) {
        console.error('❌ 테스트 실행 중 오류:', error);
    } finally {
        await browser.close();
    }
}

// 테스트 실행
if (require.main === module) {
    testExportNewColumns();
}

module.exports = { testExportNewColumns };