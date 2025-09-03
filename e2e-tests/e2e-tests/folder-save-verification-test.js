const { chromium } = require('playwright');

async function verifyFolderSaving() {
    console.log('🔍 폴더 저장 기능 검증 테스트...\n');

    let browser, context, page;
    try {
        browser = await chromium.launch({ 
            headless: false,
            slowMo: 1000
        });
        
        context = await browser.newContext({
            baseURL: 'http://localhost:8080'
        });
        
        page = await context.newPage();

        // API 호출 모니터링 설정
        let apiRequests = [];
        let apiResponses = [];
        
        page.on('request', request => {
            if (request.url().includes('/api/testcases')) {
                apiRequests.push({
                    method: request.method(),
                    url: request.url(),
                    postData: request.postData(),
                    timestamp: new Date().toISOString()
                });
                console.log(`📤 API 요청: ${request.method()} ${request.url()}`);
            }
        });

        page.on('response', async response => {
            if (response.url().includes('/api/testcases')) {
                let responseData = null;
                try {
                    responseData = await response.json();
                } catch (e) {
                    responseData = await response.text();
                }
                
                apiResponses.push({
                    method: response.request().method(),
                    url: response.url(),
                    status: response.status(),
                    data: responseData,
                    timestamp: new Date().toISOString()
                });
                console.log(`📥 API 응답: ${response.status()} ${response.url()}`);
            }
        });

        // 1. 로그인 및 네비게이션
        console.log('📋 1단계: 로그인 및 네비게이션...');
        await page.goto('/');
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        await page.locator('text=프로젝트').first().click();
        await page.waitForLoadState('networkidle');
        await page.locator('button:has-text("프로젝트 열기")').first().click();
        await page.waitForLoadState('networkidle');
        await page.locator('text=테스트케이스').first().click();
        await page.waitForLoadState('networkidle');

        // 2. 스프레드시트 뷰로 전환
        console.log('📋 2단계: 스프레드시트 뷰 전환...');
        const spreadsheetButton = page.locator('button:has-text("스프레드시트")').first();
        await spreadsheetButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // 3. 폴더 생성 (버튼 방식)
        console.log('📋 3단계: 폴더 추가 버튼으로 폴더 생성...');
        
        const folderButton = page.locator('button:has-text("폴더 추가")');
        if (await folderButton.count() > 0) {
            await folderButton.click();
            await page.waitForTimeout(1000);
            
            // 다이얼로그가 열렸는지 확인
            const dialog = page.locator('[role="dialog"]');
            if (await dialog.isVisible()) {
                console.log('✅ 폴더 생성 다이얼로그 열림');
                
                // 모든 입력 필드 확인
                const inputs = await page.locator('dialog input, [role="dialog"] input').all();
                console.log(`다이얼로그 내 입력 필드 수: ${inputs.length}`);
                
                if (inputs.length > 0) {
                    await inputs[0].fill('API 검증 폴더');
                    console.log('✅ 폴더명 입력 완료');
                    
                    const createButton = page.locator('button:has-text("생성")');
                    if (await createButton.count() > 0) {
                        await createButton.click();
                        await page.waitForTimeout(2000);
                        console.log('✅ 폴더 생성 버튼 클릭');
                    }
                }
            } else {
                console.log('⚠️  다이얼로그가 열리지 않음');
            }
        }

        // 4. 직접 입력으로 폴더 생성
        console.log('📋 4단계: 직접 입력으로 폴더 생성...');
        
        const cells = page.locator('td');
        if (await cells.count() > 1) {
            // 두 번째 행의 첫 번째 셀에 폴더 입력
            await cells.nth(10).click(); // 두 번째 행
            await page.keyboard.type('📁 UI 검증 폴더');
            console.log('✅ 직접 폴더 패턴 입력 완료');
            
            await page.waitForTimeout(1000);
        }

        // 5. 일반 테스트케이스도 추가 (비교 목적)
        console.log('📋 5단계: 일반 테스트케이스 추가...');
        
        if (await cells.count() > 20) {
            await cells.nth(20).click(); // 세 번째 행
            await page.keyboard.type('일반 테스트케이스');
            await page.keyboard.press('Tab');
            await page.keyboard.type('테스트 설명입니다');
            console.log('✅ 일반 테스트케이스 입력 완료');
        }

        await page.screenshot({ 
            path: 'e2e-tests/screenshots/before-save-verification.png',
            fullPage: true 
        });

        // 6. 저장 전 API 요청 초기화
        console.log('📋 6단계: 저장 실행...');
        apiRequests = [];
        apiResponses = [];

        const saveButton = page.locator('button:has-text("일괄 저장")');
        if (await saveButton.count() > 0) {
            console.log('저장 버튼 클릭 중...');
            await saveButton.click();
            
            // 저장 완료까지 대기 (최대 10초)
            await page.waitForTimeout(5000);
            console.log('✅ 저장 완료 대기');
            
            await page.screenshot({ 
                path: 'e2e-tests/screenshots/after-save-verification.png',
                fullPage: true 
            });
        }

        // 7. API 요청/응답 분석
        console.log('\n📋 7단계: API 요청/응답 분석...');
        console.log(`총 API 요청 수: ${apiRequests.length}`);
        console.log(`총 API 응답 수: ${apiResponses.length}`);

        // 요청 데이터 분석
        for (let i = 0; i < apiRequests.length; i++) {
            const req = apiRequests[i];
            console.log(`\n📤 요청 ${i + 1}:`);
            console.log(`  메서드: ${req.method}`);
            console.log(`  URL: ${req.url}`);
            
            if (req.postData) {
                try {
                    const postData = JSON.parse(req.postData);
                    console.log(`  요청 데이터 항목 수: ${postData.length || 'N/A'}`);
                    
                    if (Array.isArray(postData)) {
                        postData.forEach((item, idx) => {
                            console.log(`    항목 ${idx + 1}:`);
                            console.log(`      이름: "${item.name}"`);
                            console.log(`      타입: "${item.type}"`);
                            console.log(`      설명: "${item.description}"`);
                            
                            if (item.type === 'folder') {
                                console.log(`    🎯 폴더 발견: ${item.name}`);
                            }
                        });
                    }
                } catch (e) {
                    console.log(`  요청 데이터: ${req.postData.substring(0, 200)}...`);
                }
            }
        }

        // 응답 데이터 분석
        for (let i = 0; i < apiResponses.length; i++) {
            const res = apiResponses[i];
            console.log(`\n📥 응답 ${i + 1}:`);
            console.log(`  상태: ${res.status}`);
            console.log(`  URL: ${res.url}`);
            
            if (res.data && typeof res.data === 'object') {
                if (Array.isArray(res.data)) {
                    console.log(`  응답 항목 수: ${res.data.length}`);
                    res.data.forEach((item, idx) => {
                        if (item.name && item.type) {
                            console.log(`    저장된 항목 ${idx + 1}: "${item.name}" (타입: ${item.type})`);
                            if (item.type === 'folder') {
                                console.log(`    🎯 저장된 폴더: ${item.name}`);
                            }
                        }
                    });
                } else {
                    console.log(`  응답: ${JSON.stringify(res.data).substring(0, 200)}...`);
                }
            }
        }

        // 8. 페이지 새로고침 후 폴더 확인
        console.log('\n📋 8단계: 페이지 새로고침 후 폴더 유지 확인...');
        await page.reload();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        // 폴더 아이콘 확인
        const folderIcons = await page.locator('text=📁').count();
        console.log(`새로고침 후 폴더 아이콘 수: ${folderIcons}개`);

        if (folderIcons > 0) {
            console.log('✅ 폴더가 성공적으로 저장되고 로드됨!');
        } else {
            console.log('❌ 폴더가 저장되지 않았거나 로드되지 않음');
        }

        await page.screenshot({ 
            path: 'e2e-tests/screenshots/after-reload-verification.png',
            fullPage: true 
        });

        // 9. 백엔드 API 직접 조회
        console.log('\n📋 9단계: 백엔드 API 직접 조회...');
        
        // 현재 프로젝트 ID 추출 (URL에서)
        const currentUrl = page.url();
        console.log(`현재 URL: ${currentUrl}`);
        
        const projectIdMatch = currentUrl.match(/\/projects\/([^\/]+)/);
        if (projectIdMatch) {
            const projectId = projectIdMatch[1];
            console.log(`프로젝트 ID: ${projectId}`);
            
            // API 직접 조회
            const apiResponse = await page.evaluate(async (projectId) => {
                try {
                    const response = await fetch(`/api/testcases/project/${projectId}`);
                    const data = await response.json();
                    return { status: response.status, data };
                } catch (error) {
                    return { error: error.message };
                }
            }, projectId);
            
            console.log(`\n🔍 백엔드 직접 조회 결과:`);
            console.log(`  상태: ${apiResponse.status || '오류'}`);
            
            if (apiResponse.data && Array.isArray(apiResponse.data)) {
                console.log(`  총 항목 수: ${apiResponse.data.length}`);
                
                const folders = apiResponse.data.filter(item => item.type === 'folder');
                const testcases = apiResponse.data.filter(item => item.type === 'testcase' || !item.type);
                
                console.log(`  폴더 수: ${folders.length}`);
                console.log(`  테스트케이스 수: ${testcases.length}`);
                
                folders.forEach((folder, idx) => {
                    console.log(`    폴더 ${idx + 1}: "${folder.name}" (ID: ${folder.id})`);
                });
                
                if (folders.length === 0) {
                    console.log('❌ 백엔드에 폴더가 저장되지 않음!');
                } else {
                    console.log('✅ 백엔드에 폴더가 정상 저장됨!');
                }
            }
        }

        console.log('\n🎉 폴더 저장 검증 테스트 완료!');

    } catch (error) {
        console.error('\n❌ 검증 테스트 실행 중 오류:', error);
        
        if (page) {
            await page.screenshot({ 
                path: 'e2e-tests/screenshots/folder-save-verification-error.png',
                fullPage: true 
            });
        }
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// 검증 테스트 실행
verifyFolderSaving().catch(console.error);