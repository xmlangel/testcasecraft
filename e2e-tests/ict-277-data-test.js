// e2e-tests/ict-277-data-test.js
// ICT-277: 내보내기 데이터에 새로운 컬럼들이 포함되는지 테스트

const { chromium } = require('playwright');

async function testExportWithNewColumnData() {
    console.log('=== ICT-277: 내보내기 데이터 포함 테스트 ===');
    
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        baseURL: 'http://localhost:8080'
    });
    const page = await context.newPage();
    
    try {
        // 1. 로그인
        console.log('1️⃣ 로그인...');
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
        
        await page.locator('button:has-text("프로젝트 열기")').first().click();
        await page.waitForLoadState('networkidle');
        console.log('✅ 프로젝트 선택 완료');
        
        // 3. 테스트결과 > 상세 테이블
        console.log('3️⃣ 테스트결과 상세 테이블로 이동...');
        await page.locator('text=테스트결과').first().click();
        await page.waitForLoadState('networkidle');
        
        await page.locator('button:has-text("상세 테이블")').click();
        await page.waitForLoadState('networkidle');
        console.log('✅ 상세 테이블 접근 완료');
        
        // 4. 컬럼 설정 버튼 클릭 (모바일용 버튼들 찾기)
        console.log('4️⃣ 컬럼 설정 시도...');
        
        // 먼저 모든 설정 관련 버튼 확인
        const settingsButtons = await page.locator('button').all();
        let columnMenuButton = null;
        
        for (const button of settingsButtons) {
            try {
                const text = await button.textContent();
                if (text && (text.includes('컬럼') || text.includes('설정') || text.includes('순서'))) {
                    const isVisible = await button.isVisible();
                    console.log(`발견된 설정 버튼: "${text}" (visible: ${isVisible})`);
                    
                    if (isVisible && text.includes('컬럼')) {
                        columnMenuButton = button;
                        break;
                    }
                }
            } catch (e) {
                // 무시
            }
        }
        
        // 5. 새로운 컬럼들 활성화 시도
        if (columnMenuButton) {
            console.log('5️⃣ 컬럼 설정 메뉴 열기...');
            await columnMenuButton.click();
            await page.waitForTimeout(2000);
            
            // 새로운 컬럼들 찾아서 활성화
            const newColumns = ['사전설정', '스텝 정보', '전체 예상결과'];
            for (const columnName of newColumns) {
                try {
                    const columnOption = page.locator(`text=${columnName}`);
                    if (await columnOption.isVisible()) {
                        const parentDiv = columnOption.locator('..');
                        const checkbox = parentDiv.locator('input[type="checkbox"]');
                        
                        if (await checkbox.isVisible()) {
                            const isChecked = await checkbox.isChecked();
                            if (!isChecked) {
                                await checkbox.click();
                                console.log(`✅ ${columnName} 컬럼 활성화`);
                            } else {
                                console.log(`✅ ${columnName} 컬럼 이미 활성화됨`);
                            }
                        }
                    }
                } catch (error) {
                    console.log(`⚠️ ${columnName} 컬럼 처리 중 오류: ${error.message}`);
                }
            }
            
            // 메뉴 닫기
            await page.keyboard.press('Escape');
            await page.waitForTimeout(1000);
            
        } else {
            console.log('⚠️ 컬럼 설정 버튼을 찾을 수 없음');
        }
        
        // 6. 컬럼 헤더 다시 확인
        console.log('6️⃣ 업데이트된 컬럼 헤더 확인...');
        await page.waitForTimeout(2000);
        
        const updatedHeaders = await page.locator('[role="columnheader"]').allTextContents();
        console.log('업데이트된 컬럼 헤더들:', updatedHeaders);
        
        // 7. 내보내기 실행
        console.log('7️⃣ CSV 내보내기 실행...');
        
        await page.locator('button:has-text("고급 내보내기")').click();
        await page.waitForTimeout(1000);
        
        // CSV 선택
        await page.locator('text=CSV (.csv)').click();
        await page.waitForTimeout(1000);
        
        // CSV 다운로드
        const downloadPromise = page.waitForEvent('download');
        await page.locator('button:has-text("CSV 내보내기")').click();
        
        try {
            const download = await downloadPromise;
            const filename = download.suggestedFilename();
            const downloadPath = `./e2e-tests/downloads/ict-277-test-${Date.now()}.csv`;
            
            await download.saveAs(downloadPath);
            console.log(`✅ CSV 파일 다운로드: ${downloadPath}`);
            
            // CSV 파일 내용 확인
            const fs = require('fs');
            if (fs.existsSync(downloadPath)) {
                const csvContent = fs.readFileSync(downloadPath, 'utf8');
                const lines = csvContent.split('\n').filter(line => line.length > 0);
                
                console.log('📄 CSV 파일 내용 확인:');
                console.log(`총 ${lines.length}줄 (헤더 포함)`);
                
                if (lines.length > 0) {
                    const headers = lines[0].split(',');
                    console.log('CSV 헤더:', headers);
                    
                    // 새로운 컬럼들이 포함되어 있는지 확인
                    const newColumnKeys = ['사전설정', '스텝', '전체'];
                    const foundNewColumns = newColumnKeys.filter(key => 
                        headers.some(header => header.includes(key))
                    );
                    
                    if (foundNewColumns.length > 0) {
                        console.log(`✅ 새로운 컬럼들이 CSV에 포함됨: ${foundNewColumns}`);
                    } else {
                        console.log('⚠️ 새로운 컬럼들이 CSV에서 누락됨');
                    }
                    
                    // 데이터 행이 있으면 샘플 확인
                    if (lines.length > 1) {
                        console.log('첫 번째 데이터 행:', lines[1]);
                        
                        const firstDataRow = lines[1].split(',');
                        const hasData = firstDataRow.some(cell => cell && cell.length > 0);
                        
                        if (hasData) {
                            console.log('✅ CSV에 데이터가 포함됨');
                        } else {
                            console.log('⚠️ CSV에 데이터가 비어있음');
                        }
                    }
                }
            }
            
        } catch (error) {
            console.log(`❌ CSV 다운로드 실패: ${error.message}`);
        }
        
        console.log('🎉 ICT-277 데이터 테스트 완료!');
        
    } catch (error) {
        console.error('❌ 테스트 실행 중 오류:', error);
    } finally {
        await browser.close();
    }
}

// 테스트 실행
if (require.main === module) {
    testExportWithNewColumnData();
}

module.exports = { testExportWithNewColumnData };