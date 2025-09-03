const { chromium } = require('playwright');

async function simpleFolderTest() {
    console.log('🔍 간단한 폴더 기능 테스트...\n');

    let browser, context, page;
    try {
        browser = await chromium.launch({ 
            headless: false,
            slowMo: 2000
        });
        
        context = await browser.newContext({
            baseURL: 'http://localhost:8080'
        });
        
        page = await context.newPage();

        // API 모니터링
        let saveRequests = [];
        page.on('request', request => {
            if (request.url().includes('/api/testcases') && request.method() === 'POST') {
                saveRequests.push({
                    url: request.url(),
                    data: request.postData()
                });
            }
        });

        // 로그인 및 네비게이션
        console.log('1. 로그인...');
        await page.goto('/');
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        console.log('2. 프로젝트 선택...');
        await page.locator('text=프로젝트').first().click();
        await page.waitForLoadState('networkidle');
        await page.locator('button:has-text("프로젝트 열기")').first().click();
        await page.waitForLoadState('networkidle');

        console.log('3. 테스트케이스 탭...');
        await page.locator('text=테스트케이스').first().click();
        await page.waitForLoadState('networkidle');

        console.log('4. 스프레드시트 뷰로 전환...');
        const spreadsheetButton = page.locator('button:has-text("스프레드시트")').first();
        await spreadsheetButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        // 스크린샷 촬영
        await page.screenshot({ 
            path: 'e2e-tests/screenshots/simple-spreadsheet-view.png',
            fullPage: true 
        });

        console.log('5. 직접 폴더 입력으로 테스트...');
        
        // 첫 번째 td 요소 찾기
        const firstCell = page.locator('td').first();
        const cellCount = await page.locator('td').count();
        console.log(`총 td 요소 수: ${cellCount}`);

        if (cellCount > 0) {
            console.log('첫 번째 셀에 폴더 패턴 입력...');
            await firstCell.click();
            await page.waitForTimeout(1000);
            await page.keyboard.type('📁 검증테스트폴더');
            console.log('✅ 폴더 패턴 입력 완료');
            
            await page.waitForTimeout(2000);
            await page.screenshot({ 
                path: 'e2e-tests/screenshots/simple-folder-input.png',
                fullPage: true 
            });

            // 다음 셀로 이동하여 일반 테스트케이스 추가
            await page.keyboard.press('Tab');
            await page.keyboard.type('폴더설명');
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');

            // 다음 행에 일반 테스트케이스 추가
            const secondRowCell = page.locator('td').nth(cellCount > 10 ? 10 : 4);
            await secondRowCell.click();
            await page.keyboard.type('일반테스트케이스');
            await page.keyboard.press('Tab');
            await page.keyboard.type('테스트케이스 설명');

            console.log('✅ 폴더와 테스트케이스 모두 입력 완료');
            
            await page.screenshot({ 
                path: 'e2e-tests/screenshots/simple-both-input.png',
                fullPage: true 
            });

            // 저장 실행
            console.log('6. 저장 실행...');
            const saveButton = page.locator('button:has-text("일괄 저장")');
            if (await saveButton.count() > 0) {
                console.log('저장 버튼 클릭...');
                await saveButton.click();
                
                // 저장 완료 메시지 대기
                await page.waitForTimeout(5000);
                
                console.log('✅ 저장 요청 완료');
                
                // 저장 요청 분석
                console.log(`\n📤 총 저장 요청 수: ${saveRequests.length}`);
                
                saveRequests.forEach((req, idx) => {
                    console.log(`\n📋 요청 ${idx + 1}:`);
                    console.log(`URL: ${req.url}`);
                    
                    if (req.data) {
                        try {
                            const data = JSON.parse(req.data);
                            console.log(`데이터 항목 수: ${data.length}`);
                            
                            data.forEach((item, itemIdx) => {
                                console.log(`  항목 ${itemIdx + 1}:`);
                                console.log(`    이름: "${item.name}"`);
                                console.log(`    타입: "${item.type || '미지정'}"`);
                                console.log(`    설명: "${item.description}"`);
                                
                                if (item.type === 'folder') {
                                    console.log(`    🎯 폴더 데이터 확인!`);
                                } else if (!item.type || item.type === 'testcase') {
                                    console.log(`    📝 테스트케이스 데이터 확인`);
                                }
                            });
                        } catch (e) {
                            console.log(`원시 데이터: ${req.data.substring(0, 300)}...`);
                        }
                    }
                });
                
                // 저장 후 스크린샷
                await page.screenshot({ 
                    path: 'e2e-tests/screenshots/simple-after-save.png',
                    fullPage: true 
                });

                // 페이지 새로고침으로 저장 확인
                console.log('7. 새로고침으로 저장 확인...');
                await page.reload();
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(3000);
                
                const folderIcons = await page.locator('text=📁').count();
                console.log(`새로고침 후 폴더 아이콘 수: ${folderIcons}개`);
                
                await page.screenshot({ 
                    path: 'e2e-tests/screenshots/simple-after-reload.png',
                    fullPage: true 
                });

                if (folderIcons > 0) {
                    console.log('✅ 폴더가 성공적으로 저장되고 로드됨!');
                } else {
                    console.log('❌ 폴더가 제대로 저장되지 않음');
                }
            } else {
                console.log('❌ 저장 버튼을 찾을 수 없음');
            }
        } else {
            console.log('❌ 스프레드시트 셀을 찾을 수 없음');
        }

        console.log('\n🎉 간단한 폴더 테스트 완료!');

    } catch (error) {
        console.error('\n❌ 테스트 실행 중 오류:', error);
        
        if (page) {
            await page.screenshot({ 
                path: 'e2e-tests/screenshots/simple-folder-error.png',
                fullPage: true 
            });
        }
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// 테스트 실행
simpleFolderTest().catch(console.error);