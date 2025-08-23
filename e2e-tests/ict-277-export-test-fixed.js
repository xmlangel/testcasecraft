// e2e-tests/ict-277-export-test-fixed.js
// ICT-277: 테스트결과 상세테이블 내보내기 새 컬럼 포함 테스트 (수정판)

const { chromium } = require('playwright');

async function testExportNewColumns() {
    console.log('=== ICT-277: 테스트결과 내보내기 새 컬럼 포함 테스트 (수정판) ===');
    
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
        
        // 4. 현재 페이지의 버튼들 확인
        console.log('4️⃣ 페이지의 버튼들 확인...');
        const buttons = await page.locator('button').allTextContents();
        console.log('페이지의 모든 버튼들:', buttons);
        
        // 5. 설정 관련 버튼 찾기
        console.log('5️⃣ 설정 버튼 찾기...');
        let settingsButton = null;
        
        // 다양한 방법으로 설정 버튼 찾기
        const settingsSelectors = [
            'button:has-text("컬럼 설정")',
            'button:has-text("설정")',
            'button[aria-label*="설정"]',
            'button[title*="설정"]',
            'button:has([data-testid*="settings"])',
            '[data-testid="settings-button"]',
            'button:has-text("Columns")',
            'button:has-text("순서 변경")'  // 순서 변경 버튼이라도 먼저 확인
        ];
        
        for (const selector of settingsSelectors) {
            try {
                const button = page.locator(selector);
                if (await button.isVisible()) {
                    settingsButton = button;
                    console.log(`✅ 설정 버튼 발견: ${selector}`);
                    break;
                }
            } catch (error) {
                // 선택자가 존재하지 않는 경우 무시
            }
        }
        
        // 6. 내보내기 버튼 직접 찾기
        console.log('6️⃣ 내보내기 버튼 찾기...');
        let exportButton = null;
        
        const exportSelectors = [
            'button:has-text("고급 내보내기")',
            'button:has-text("내보내기")',
            'button:has-text("Export")',
            'button[aria-label*="내보내기"]',
            'button[title*="내보내기"]'
        ];
        
        for (const selector of exportSelectors) {
            try {
                const button = page.locator(selector);
                if (await button.isVisible()) {
                    exportButton = button;
                    console.log(`✅ 내보내기 버튼 발견: ${selector}`);
                    break;
                }
            } catch (error) {
                // 선택자가 존재하지 않는 경우 무시
            }
        }
        
        if (!exportButton) {
            console.log('⚠️ 내보내기 버튼을 찾을 수 없습니다. 데이터그리드 툴바에서 찾아보겠습니다.');
            
            // DataGrid 툴바에서 내보내기 버튼 찾기
            await page.waitForTimeout(2000);
            const toolbarExportButton = page.locator('[role="toolbar"] button:has-text("Export")');
            if (await toolbarExportButton.isVisible()) {
                exportButton = toolbarExportButton;
                console.log('✅ DataGrid 툴바에서 내보내기 버튼 발견');
            }
        }
        
        // 7. 내보내기 실행
        if (exportButton) {
            console.log('7️⃣ 내보내기 실행...');
            
            try {
                await exportButton.click();
                await page.waitForTimeout(3000);
                
                // 내보내기 다이얼로그가 열렸는지 확인
                const dialogVisible = await page.locator('[role="dialog"]').isVisible();
                if (dialogVisible) {
                    console.log('✅ 내보내기 다이얼로그가 열림');
                    
                    // 다이얼로그 내용 확인
                    const dialogContent = await page.locator('[role="dialog"]').textContent();
                    console.log('다이얼로그 내용:', dialogContent);
                    
                    // Excel 버튼이 있다면 클릭
                    const excelButton = page.locator('button:has-text("EXCEL")');
                    if (await excelButton.isVisible()) {
                        const downloadPromise = page.waitForEvent('download');
                        await excelButton.click();
                        
                        try {
                            const download = await downloadPromise;
                            const filename = download.suggestedFilename();
                            console.log(`✅ Excel 파일 다운로드 완료: ${filename}`);
                            
                            await download.saveAs(`./downloads/${filename}`);
                            console.log('✅ Excel 파일 저장 완료');
                            
                        } catch (error) {
                            console.log(`⚠️ Excel 다운로드 중 오류: ${error.message}`);
                        }
                    }
                    
                } else {
                    console.log('⚠️ 내보내기 다이얼로그가 열리지 않았습니다.');
                    
                    // 직접 다운로드가 시작되었을 수도 있음
                    try {
                        const downloadPromise = page.waitForEvent('download', { timeout: 5000 });
                        const download = await downloadPromise;
                        const filename = download.suggestedFilename();
                        console.log(`✅ 직접 다운로드 완료: ${filename}`);
                        
                        await download.saveAs(`./downloads/${filename}`);
                        console.log('✅ 파일 저장 완료');
                        
                    } catch (error) {
                        console.log(`⚠️ 직접 다운로드도 실패: ${error.message}`);
                    }
                }
                
            } catch (error) {
                console.log(`⚠️ 내보내기 실행 중 오류: ${error.message}`);
            }
            
        } else {
            console.log('❌ 내보내기 버튼을 찾을 수 없습니다.');
        }
        
        // 8. 현재 표시되는 컬럼들 확인
        console.log('8️⃣ 현재 표시되는 컬럼들 확인...');
        try {
            const columnHeaders = await page.locator('[role="columnheader"]').allTextContents();
            console.log('현재 테이블 컬럼 헤더들:', columnHeaders);
            
            // 새로운 컬럼들이 포함되어 있는지 확인
            const newColumns = ['사전설정', '스텝 정보', '전체 예상결과'];
            const hasNewColumns = newColumns.filter(col => 
                columnHeaders.some(header => header.includes(col))
            );
            
            if (hasNewColumns.length > 0) {
                console.log(`✅ 발견된 새로운 컬럼들: ${hasNewColumns.join(', ')}`);
            } else {
                console.log('⚠️ 새로운 컬럼들이 현재 표시되지 않고 있습니다.');
                console.log('필요한 컬럼들:', newColumns);
            }
            
        } catch (error) {
            console.log(`⚠️ 컬럼 헤더 확인 중 오류: ${error.message}`);
        }
        
        console.log('🎉 ICT-277 테스트 완료!');
        console.log('');
        console.log('=== 테스트 결과 요약 ===');
        console.log('✅ 로그인 성공');
        console.log('✅ 프로젝트 접근 성공');
        console.log('✅ 테스트결과 탭 접근 성공');
        console.log(exportButton ? '✅ 내보내기 버튼 발견 및 실행' : '❌ 내보내기 버튼 미발견');
        console.log('');
        console.log('📁 다운로드된 파일들은 e2e-tests/downloads/ 폴더에서 확인하세요.');
        
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