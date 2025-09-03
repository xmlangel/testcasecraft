const { chromium } = require('playwright');

async function testFolderFunctionality() {
    console.log('🧪 폴더 기능 E2E 테스트 시작...\n');

    let browser, context, page;
    try {
        // 브라우저 설정
        browser = await chromium.launch({ 
            headless: false,
            slowMo: 500
        });
        
        context = await browser.newContext({
            baseURL: 'http://localhost:8080'
        });
        
        page = await context.newPage();

        // 1. 로그인 및 프로젝트 접근
        console.log('📋 1단계: 로그인 및 네비게이션...');
        await page.goto('/');
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        // 프로젝트 페이지로 이동
        await page.locator('text=프로젝트').first().click();
        await page.waitForLoadState('networkidle');

        // 첫 번째 프로젝트 선택
        await page.locator('button:has-text("프로젝트 열기")').first().click();
        await page.waitForLoadState('networkidle');

        // 테스트케이스 탭으로 이동
        await page.locator('text=테스트케이스').first().click();
        await page.waitForLoadState('networkidle');
        console.log('✅ 로그인 및 네비게이션 완료\n');

        // 2. 스프레드시트 뷰 확인
        console.log('📋 2단계: 스프레드시트 뷰 접근...');
        
        // 스프레드시트 토글 버튼 찾기
        const spreadsheetToggle = page.locator('button:has-text("스프레드시트 뷰")');
        if (await spreadsheetToggle.count() > 0) {
            await spreadsheetToggle.click();
            await page.waitForLoadState('networkidle');
            console.log('✅ 스프레드시트 뷰로 전환 완료');
        } else {
            console.log('ℹ️  이미 스프레드시트 뷰 상태');
        }

        // 3. 폴더 추가 버튼 확인
        console.log('\n📋 3단계: 폴더 추가 기능 확인...');
        
        const folderButton = page.locator('button:has-text("폴더 추가")');
        const folderButtonCount = await folderButton.count();
        
        if (folderButtonCount > 0) {
            console.log('✅ 폴더 추가 버튼 발견');
            
            // 폴더 추가 버튼 클릭
            await folderButton.click();
            await page.waitForTimeout(1000);
            
            // 폴더 생성 다이얼로그 확인
            const dialog = page.locator('div[role="dialog"]');
            const dialogVisible = await dialog.isVisible();
            
            if (dialogVisible) {
                console.log('✅ 폴더 생성 다이얼로그 열림');
                
                // 폴더명 입력
                const folderNameInput = page.locator('input[label="폴더명"], input[placeholder*="폴더"], input[aria-label*="폴더"]').first();
                if (await folderNameInput.count() > 0) {
                    await folderNameInput.fill('테스트 폴더');
                    console.log('✅ 폴더명 입력 완료');
                    
                    // 생성 버튼 클릭
                    const createButton = page.locator('button:has-text("생성")');
                    if (await createButton.count() > 0) {
                        await createButton.click();
                        await page.waitForTimeout(2000);
                        console.log('✅ 폴더 생성 버튼 클릭');
                    } else {
                        console.log('⚠️  폴더 생성 버튼을 찾을 수 없음');
                    }
                } else {
                    console.log('⚠️  폴더명 입력 필드를 찾을 수 없음');
                }
            } else {
                console.log('⚠️  폴더 생성 다이얼로그가 표시되지 않음');
            }
        } else {
            console.log('⚠️  폴더 추가 버튼을 찾을 수 없음');
        }

        // 4. 스프레드시트에서 폴더 직접 입력 테스트
        console.log('\n📋 4단계: 스프레드시트 직접 폴더 입력 테스트...');
        
        try {
            // 스프레드시트 셀 찾기 (첫 번째 빈 행의 첫 번째 열)
            const spreadsheetCells = page.locator('[data-testid*="cell"], .react-spreadsheet__cell, [class*="cell"]');
            const cellCount = await spreadsheetCells.count();
            
            if (cellCount > 0) {
                console.log(`📊 스프레드시트 셀 ${cellCount}개 발견`);
                
                // 첫 번째 빈 셀에 폴더 패턴 입력
                const firstCell = spreadsheetCells.first();
                await firstCell.click();
                await page.keyboard.type('📁 API 테스트 폴더');
                await page.keyboard.press('Tab');
                
                console.log('✅ 폴더 패턴 입력 완료 (📁 API 테스트 폴더)');
                
                // 저장 버튼 찾기 및 클릭
                const saveButtons = page.locator('button:has-text("저장"), button:has-text("Save")');
                const saveButtonCount = await saveButtons.count();
                
                if (saveButtonCount > 0) {
                    await saveButtons.first().click();
                    await page.waitForTimeout(3000);
                    console.log('✅ 저장 버튼 클릭');
                } else {
                    console.log('ℹ️  저장 버튼을 찾을 수 없음 (자동 저장일 수 있음)');
                }
            } else {
                console.log('⚠️  스프레드시트 셀을 찾을 수 없음');
            }
        } catch (error) {
            console.log(`⚠️  스프레드시트 입력 중 오류: ${error.message}`);
        }

        // 5. API 호출 모니터링
        console.log('\n📋 5단계: API 호출 모니터링...');
        
        // 네트워크 요청 감시
        let apiCalls = [];
        page.on('response', response => {
            if (response.url().includes('/api/testcases')) {
                apiCalls.push({
                    url: response.url(),
                    status: response.status(),
                    method: response.request().method()
                });
            }
        });

        // 페이지 새로고침으로 저장된 데이터 확인
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        console.log('\n📊 API 호출 결과:');
        apiCalls.forEach(call => {
            console.log(`  ${call.method} ${call.url} - Status: ${call.status}`);
        });

        // 6. 결과 검증
        console.log('\n📋 6단계: 결과 검증...');
        
        // 스프레드시트에서 폴더 표시 확인
        const folderIndicators = page.locator('text=📁');
        const folderCount = await folderIndicators.count();
        
        console.log(`📁 폴더 표시자 발견: ${folderCount}개`);
        
        if (folderCount > 0) {
            console.log('✅ 폴더 생성 및 표시 성공!');
        } else {
            console.log('⚠️  폴더가 생성되지 않았거나 표시되지 않음');
        }

        // 최종 스크린샷 촬영
        await page.screenshot({ 
            path: 'e2e-tests/screenshots/folder-functionality-test.png',
            fullPage: true 
        });
        
        console.log('\n🎉 폴더 기능 E2E 테스트 완료!');
        console.log('📸 스크린샷 저장: e2e-tests/screenshots/folder-functionality-test.png');

    } catch (error) {
        console.error('\n❌ E2E 테스트 실행 중 오류:', error);
        
        if (page) {
            await page.screenshot({ 
                path: 'e2e-tests/screenshots/folder-functionality-error.png',
                fullPage: true 
            });
            console.log('📸 오류 스크린샷 저장: e2e-tests/screenshots/folder-functionality-error.png');
        }
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// 테스트 실행
testFolderFunctionality().catch(console.error);