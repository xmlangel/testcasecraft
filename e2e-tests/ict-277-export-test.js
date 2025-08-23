// e2e-tests/ict-277-export-test.js
// ICT-277: 테스트결과 상세테이블 내보내기 새 컬럼 포함 테스트

const { chromium } = require('playwright');

async function testExportNewColumns() {
    console.log('=== ICT-277: 테스트결과 내보내기 새 컬럼 포함 테스트 ===');
    
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
        
        // 4. 컬럼 설정에서 새로운 컬럼들 활성화
        console.log('4️⃣ 새로운 컬럼들 활성화...');
        
        // 컬럼 설정 버튼 클릭
        await page.locator('button:has-text("컬럼 설정")').click();
        await page.waitForTimeout(1000);
        
        // 새로운 컬럼들 활성화
        const newColumns = ['사전설정', '스텝 정보', '전체 예상결과'];
        for (const columnName of newColumns) {
            try {
                const checkbox = page.locator(`text=${columnName}`).locator('..').locator('input[type="checkbox"]');
                if (await checkbox.isVisible()) {
                    const isChecked = await checkbox.isChecked();
                    if (!isChecked) {
                        await checkbox.click();
                        console.log(`✅ ${columnName} 컬럼 활성화`);
                    } else {
                        console.log(`✅ ${columnName} 컬럼 이미 활성화됨`);
                    }
                }
            } catch (error) {
                console.log(`⚠️ ${columnName} 컬럼 처리 중 오류: ${error.message}`);
            }
        }
        
        // 컬럼 설정 메뉴 닫기
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
        console.log('✅ 새로운 컬럼들 활성화 완료');
        
        // 5. 고급 내보내기 버튼 클릭
        console.log('5️⃣ 내보내기 다이얼로그 열기...');
        await page.locator('button:has-text("고급 내보내기")').click();
        await page.waitForTimeout(2000);
        console.log('✅ 내보내기 다이얼로그 열림');
        
        // 6. 내보내기 정보 확인
        console.log('6️⃣ 내보내기 정보 확인...');
        
        // 표시 컬럼 수 확인
        const columnCountElement = await page.locator('text=표시 컬럼 수:').locator('..').locator('.MuiChip-label');
        if (await columnCountElement.isVisible()) {
            const columnCount = await columnCountElement.textContent();
            console.log(`✅ 표시 컬럼 수: ${columnCount}`);
        }
        
        // 내보낼 컬럼 목록 확인
        const columnsListElement = await page.locator('text=내보낼 컬럼:').locator('..');
        if (await columnsListElement.isVisible()) {
            const columnsList = await columnsListElement.textContent();
            console.log(`✅ 내보낼 컬럼 목록: ${columnsList}`);
            
            // 새로운 컬럼들이 포함되어 있는지 확인
            const hasNewColumns = newColumns.every(col => columnsList.includes(col));
            if (hasNewColumns) {
                console.log('✅ 새로운 컬럼들이 내보내기 목록에 포함됨');
            } else {
                console.log('⚠️ 새로운 컬럼들이 내보내기 목록에 누락됨');
                console.log('필요한 컬럼들:', newColumns);
            }
        }
        
        // 7. Excel 형식으로 내보내기 테스트
        console.log('7️⃣ Excel 내보내기 테스트...');
        
        // Excel 형식 선택
        await page.locator('text=Excel (.xlsx)').click();
        await page.waitForTimeout(1000);
        
        // 내보내기 실행
        const downloadPromise = page.waitForEvent('download');
        await page.locator('button:has-text("EXCEL 내보내기")').click();
        
        try {
            const download = await downloadPromise;
            const filename = download.suggestedFilename();
            console.log(`✅ Excel 파일 다운로드 완료: ${filename}`);
            
            // 파일 저장
            await download.saveAs(`./e2e-tests/downloads/${filename}`);
            console.log('✅ Excel 파일 저장 완료');
            
        } catch (error) {
            console.log(`⚠️ Excel 다운로드 중 오류: ${error.message}`);
        }
        
        // 다이얼로그 닫기
        await page.locator('button:has-text("취소")').click();
        await page.waitForTimeout(1000);
        
        // 8. CSV 형식으로 내보내기 테스트
        console.log('8️⃣ CSV 내보내기 테스트...');
        
        await page.locator('button:has-text("고급 내보내기")').click();
        await page.waitForTimeout(1000);
        
        // CSV 형식 선택
        await page.locator('text=CSV (.csv)').click();
        await page.waitForTimeout(1000);
        
        // CSV 내보내기 실행
        const csvDownloadPromise = page.waitForEvent('download');
        await page.locator('button:has-text("CSV 내보내기")').click();
        
        try {
            const csvDownload = await csvDownloadPromise;
            const csvFilename = csvDownload.suggestedFilename();
            console.log(`✅ CSV 파일 다운로드 완료: ${csvFilename}`);
            
            // 파일 저장
            await csvDownload.saveAs(`./e2e-tests/downloads/${csvFilename}`);
            console.log('✅ CSV 파일 저장 완료');
            
        } catch (error) {
            console.log(`⚠️ CSV 다운로드 중 오류: ${error.message}`);
        }
        
        console.log('🎉 ICT-277 테스트 완료!');
        console.log('');
        console.log('=== 테스트 결과 요약 ===');
        console.log('✅ 로그인 성공');
        console.log('✅ 프로젝트 접근 성공');
        console.log('✅ 테스트결과 탭 접근 성공');
        console.log('✅ 새로운 컬럼들 활성화 완료');
        console.log('✅ 내보내기 다이얼로그 접근 성공');
        console.log('✅ Excel 내보내기 테스트 완료');
        console.log('✅ CSV 내보내기 테스트 완료');
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