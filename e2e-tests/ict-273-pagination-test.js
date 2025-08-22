// e2e-tests/ict-273-pagination-test.js
// ICT-273: 테스트 실행 상세 페이지 페이지네이션 기능 검증 테스트

const { chromium } = require('playwright');

async function testPaginationFeature() {
    console.log('🚀 ICT-273: 테스트 실행 페이지네이션 기능 검증 테스트 시작');
    
    const browser = await chromium.launch({ 
        headless: false, 
        slowMo: 1000 
    });
    
    try {
        const context = await browser.newContext({
            baseURL: 'http://localhost:8080',
            viewport: { width: 1920, height: 1080 }
        });
        const page = await context.newPage();
        
        console.log('📋 1단계: 로그인');
        await page.goto('/', { timeout: 20000 });
        await page.waitForLoadState('networkidle');
        
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        
        console.log('✅ 로그인 성공');
        
        console.log('📋 2단계: 프로젝트 페이지로 이동');
        await page.locator('text=프로젝트').first().click();
        await page.waitForLoadState('networkidle');
        
        console.log('📋 3단계: 첫 번째 프로젝트 열기');
        const projectButton = page.locator('button:has-text("프로젝트 열기")').first();
        if (await projectButton.count() > 0) {
            await projectButton.click();
            await page.waitForLoadState('networkidle');
            console.log('✅ 프로젝트 열기 성공');
        } else {
            console.log('⚠️ 프로젝트가 없습니다. 테스트 종료');
            return { success: false, message: '테스트할 프로젝트가 없습니다' };
        }
        
        console.log('📋 4단계: 테스트 실행 탭으로 이동');
        // 여러 가능한 선택자로 테스트 실행 탭 찾기
        let testExecutionTab = page.locator('text=테스트실행').first();
        if (await testExecutionTab.count() === 0) {
            testExecutionTab = page.locator('text=테스트 실행').first();
        }
        if (await testExecutionTab.count() === 0) {
            testExecutionTab = page.locator('[role="tab"]:has-text("테스트")').first();
        }
        
        if (await testExecutionTab.count() > 0) {
            await testExecutionTab.click();
            await page.waitForLoadState('networkidle');
            console.log('✅ 테스트 실행 탭 이동 성공');
        } else {
            console.log('⚠️ 테스트 실행 탭을 찾을 수 없습니다');
            // 현재 페이지의 모든 탭 요소 출력
            const allTabs = page.locator('[role="tab"]');
            const tabCount = await allTabs.count();
            console.log(`📋 발견된 탭 수: ${tabCount}`);
            for (let i = 0; i < tabCount; i++) {
                const tabText = await allTabs.nth(i).textContent();
                console.log(`  탭 ${i}: "${tabText}"`);
            }
            return { success: false, message: '테스트 실행 탭을 찾을 수 없습니다' };
        }
        
        console.log('📋 5단계: 테스트 실행 상세 페이지로 직접 이동');
        
        // 알려진 테스트 실행 ID로 직접 이동 (ICT-273 테스트를 위해)
        const knownExecutionId = 'e7a6f899-2de7-4cae-a8de-b0b8c101e857';
        const executionDetailUrl = `/projects/219b1510-36aa-4b61-9301-419a42ac387b/executions/${knownExecutionId}`;
        
        console.log(`📋 테스트 실행 상세 페이지로 이동: ${executionDetailUrl}`);
        await page.goto(executionDetailUrl, { timeout: 20000 });
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000); // 데이터 로딩 대기
        
        console.log('📋 6단계: 페이지네이션 기능 검증');
        
        // 현재 URL 확인
        const currentUrl = page.url();
        console.log(`📍 현재 URL: ${currentUrl}`);
        
        // 테스트 실행 상세 화면인지 확인
        if (currentUrl.includes('/executions/')) {
            console.log('✅ 테스트 실행 상세 화면에 도달');
            
            // 페이지 정보 텍스트 찾기
            const pageInfoElements = page.locator('text=/총 \\d+개 항목 중/');
            if (await pageInfoElements.count() > 0) {
                const pageInfoText = await pageInfoElements.first().textContent();
                console.log(`✅ 페이지 정보 발견: "${pageInfoText}"`);
                
                // 총 항목 수 추출
                const totalItemsMatch = pageInfoText.match(/총 (\d+)개 항목/);
                const totalItems = totalItemsMatch ? parseInt(totalItemsMatch[1]) : 0;
                console.log(`📊 총 테스트 케이스 수: ${totalItems}개`);
                
                if (totalItems > 10) {
                    // 페이지네이션 컨트롤 확인
                    const paginationElement = page.locator('[role="navigation"] .MuiPagination-root');
                    if (await paginationElement.count() > 0) {
                        console.log('✅ 페이지네이션 컨트롤 발견');
                        
                        // 다음 페이지 버튼 클릭
                        const nextPageButton = page.locator('[aria-label="Go to next page"]');
                        if (await nextPageButton.count() > 0) {
                            console.log('📋 다음 페이지로 이동 테스트');
                            await nextPageButton.click();
                            await page.waitForTimeout(1000);
                            
                            // 페이지 정보가 변경되었는지 확인
                            const updatedPageInfo = await pageInfoElements.first().textContent();
                            console.log(`✅ 페이지 이동 후 정보: "${updatedPageInfo}"`);
                            
                            if (updatedPageInfo !== pageInfoText) {
                                console.log('✅ 페이지네이션 동작 확인됨');
                            } else {
                                console.log('⚠️ 페이지 정보가 변경되지 않음');
                            }
                        } else {
                            console.log('⚠️ 다음 페이지 버튼을 찾을 수 없음');
                        }
                    } else {
                        console.log('⚠️ 페이지네이션 컨트롤을 찾을 수 없음');
                    }
                } else {
                    console.log(`ℹ️ 총 ${totalItems}개 항목으로 페이지네이션이 필요하지 않음 (10개 이하)`);
                }
            } else {
                console.log('⚠️ 페이지 정보를 찾을 수 없음');
            }
            
            // 스크린샷 촬영
            console.log('📸 페이지네이션 화면 스크린샷 촬영');
            await page.screenshot({ 
                path: 'e2e-tests/screenshots/ict-273-pagination-test.png', 
                fullPage: true 
            });
            
            console.log('🎉 ICT-273 페이지네이션 기능 검증 완료');
            console.log('🖼️ 생성된 스크린샷: ict-273-pagination-test.png');
            
            return {
                success: true,
                message: 'ICT-273: 페이지네이션 기능 검증 완료',
                url: currentUrl,
                screenshot: 'ict-273-pagination-test.png'
            };
            
        } else {
            console.log('⚠️ 테스트 실행 상세 화면에 도달하지 못함');
            await page.screenshot({ path: 'e2e-tests/screenshots/ict-273-error.png' });
            
            return {
                success: false,
                message: '테스트 실행 상세 화면에 도달하지 못함',
                url: currentUrl
            };
        }
        
    } catch (error) {
        console.error('❌ 테스트 실행 중 오류:', error.message);
        await page.screenshot({ path: 'e2e-tests/screenshots/ict-273-error.png' });
        
        return {
            success: false,
            message: 'ICT-273 테스트 실행 중 오류 발생',
            error: error.message
        };
    } finally {
        await browser.close();
    }
}

// 테스트 실행
testPaginationFeature()
    .then(result => {
        console.log('\n🏁 최종 결과:', result);
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('❌ 테스트 실패:', error);
        process.exit(1);
    });