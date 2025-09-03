const { chromium } = require('playwright');

async function testFolderDisplayInSpreadsheet() {
    console.log('🧪 ICT-343: 스프레드시트에 폴더 표시 기능 테스트 시작');
    
    const browser = await chromium.launch({ 
        headless: false, 
        slowMo: 1000,
        args: ['--disable-web-security', '--disable-features=VizDisplayCompositor'] 
    });
    
    try {
        const context = await browser.newContext({
            baseURL: 'http://localhost:8080'
        });
        const page = await context.newPage();
        
        // 1. 로그인
        console.log('🔐 1. 로그인 진행');
        await page.goto('/', { timeout: 30000 });
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        
        // 2. 프로젝트로 이동
        console.log('📂 2. 프로젝트로 이동');
        await page.locator('text=프로젝트').first().click();
        await page.waitForLoadState('networkidle');
        
        // 3. 첫 번째 프로젝트 열기
        console.log('🏗️ 3. 프로젝트 열기');
        await page.locator('button:has-text("프로젝트 열기")').first().click();
        await page.waitForLoadState('networkidle');
        
        // 4. 테스트케이스 탭으로 이동
        console.log('📋 4. 테스트케이스 탭 접근');
        await page.locator('text=테스트케이스').first().click();
        await page.waitForLoadState('networkidle');
        
        // 5. 폴더 생성 (트리 모드에서)
        console.log('📁 5. 폴더 생성');
        try {
            // 트리 모드에서 폴더 추가
            await page.locator('button:has-text("폴더")').first().click();
            await page.waitForTimeout(1000);
            
            await page.fill('input[placeholder*="폴더"]', '스프레드시트 테스트 폴더');
            await page.click('button:has-text("추가")');
            await page.waitForLoadState('networkidle');
            console.log('✅ 폴더 생성 완료: 스프레드시트 테스트 폴더');
        } catch (error) {
            console.log('⚠️ 폴더 생성 실패, 기존 폴더 사용:', error.message);
        }
        
        // 6. 스프레드시트 모드로 전환
        console.log('📊 6. 스프레드시트 모드로 전환');
        await page.locator('text=스프레드시트').click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000); // 스프레드시트 로딩 대기
        
        // 7. 스프레드시트에서 폴더 표시 확인
        console.log('🔍 7. 스프레드시트에서 폴더 확인');
        
        // 스프레드시트 컨테이너 찾기
        const spreadsheetContainer = page.locator('[class*="Spreadsheet"]').first();
        await spreadsheetContainer.waitFor({ timeout: 10000 });
        
        // 테이블 행들 검사
        const tableRows = page.locator('table tr');
        const rowCount = await tableRows.count();
        console.log(`📊 스프레드시트 행 개수: ${rowCount}`);
        
        let folderFound = false;
        let folderRowIndex = -1;
        
        for (let i = 1; i < Math.min(rowCount, 20); i++) { // 헤더 제외하고 최대 20개 행 검사
            try {
                const row = tableRows.nth(i);
                const cells = row.locator('td');
                const cellCount = await cells.count();
                
                if (cellCount >= 2) {
                    // 두 번째 컬럼이 타입 컬럼 (ICT-339: ID 컬럼 추가로 인덱스 1)
                    const typeCell = cells.nth(1);
                    const typeCellText = await typeCell.textContent();
                    
                    if (typeCellText && (typeCellText.includes('폴더') || typeCellText.includes('folder') || typeCellText.includes('📁'))) {
                        console.log(`✅ 폴더 발견! 행 ${i}: 타입="${typeCellText}"`);
                        folderFound = true;
                        folderRowIndex = i;
                        
                        // 폴더명도 확인 (네 번째 컬럼이 이름 컬럼)
                        if (cellCount >= 4) {
                            const nameCell = cells.nth(3);
                            const nameCellText = await nameCell.textContent();
                            console.log(`📁 폴더명: "${nameCellText}"`);
                        }
                        break;
                    }
                }
            } catch (cellError) {
                // 개별 셀 오류는 무시하고 계속
                continue;
            }
        }
        
        // 8. 결과 확인
        if (folderFound) {
            console.log('🎉 성공: 폴더가 스프레드시트에 표시됨!');
            
            // 9. 폴더 추가도 테스트 (스프레드시트 모드에서)
            console.log('➕ 9. 스프레드시트에서 폴더 추가 테스트');
            try {
                await page.locator('button:has-text("폴더 추가")').click();
                await page.waitForTimeout(1000);
                
                await page.fill('input[label="폴더명"]', '스프레드시트 직접 추가 폴더');
                await page.click('button:has-text("생성")');
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(2000);
                
                console.log('✅ 스프레드시트에서 폴더 추가 완료');
            } catch (addError) {
                console.log('⚠️ 스프레드시트 폴더 추가 테스트 실패:', addError.message);
            }
            
        } else {
            console.log('❌ 실패: 폴더가 스프레드시트에 표시되지 않음');
            
            // 디버깅 정보
            console.log('🔍 디버깅: 스프레드시트 내용 확인');
            for (let i = 1; i < Math.min(5, rowCount); i++) {
                try {
                    const row = tableRows.nth(i);
                    const cells = row.locator('td');
                    const cellCount = await cells.count();
                    
                    let rowText = `행 ${i}: `;
                    for (let j = 0; j < Math.min(5, cellCount); j++) {
                        const cellText = await cells.nth(j).textContent();
                        rowText += `[${j}]="${cellText}" `;
                    }
                    console.log(rowText);
                } catch (debugError) {
                    console.log(`행 ${i} 디버깅 실패:`, debugError.message);
                }
            }
        }
        
        // 10. 테스트 결과 요약
        console.log('📊 ICT-343 테스트 결과:');
        console.log(`  - 폴더 표시 여부: ${folderFound ? '✅ 성공' : '❌ 실패'}`);
        console.log(`  - 검사한 행 수: ${Math.min(rowCount - 1, 20)}`);
        console.log(`  - 폴더 발견 위치: ${folderFound ? `행 ${folderRowIndex}` : '발견 안됨'}`);
        
        return folderFound;
        
    } catch (error) {
        console.error('❌ 테스트 실행 중 오류:', error);
        return false;
    } finally {
        await browser.close();
    }
}

// 테스트 실행
testFolderDisplayInSpreadsheet().then(success => {
    if (success) {
        console.log('🎉 ICT-343 테스트 성공: 폴더가 스프레드시트에 정상 표시됨');
        process.exit(0);
    } else {
        console.log('❌ ICT-343 테스트 실패: 폴더가 스프레드시트에 표시되지 않음');
        process.exit(1);
    }
}).catch(error => {
    console.error('❌ 테스트 실행 실패:', error);
    process.exit(1);
});