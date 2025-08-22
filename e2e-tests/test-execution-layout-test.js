// e2e-tests/test-execution-layout-test.js
// 테스트 실행 화면 레이아웃 검증 테스트

const { chromium } = require('playwright');

async function testExecutionLayoutTest() {
    console.log('🚀 테스트 실행 화면 레이아웃 검증 테스트 시작');
    
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
        
        await page.fill('input[name="username"]', 'testuser');
        await page.fill('input[name="password"]', 'testpass');
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
        const testExecutionTab = page.locator('text=테스트 실행').first();
        if (await testExecutionTab.count() > 0) {
            await testExecutionTab.click();
            await page.waitForLoadState('networkidle');
            console.log('✅ 테스트 실행 탭 이동 성공');
        } else {
            console.log('⚠️ 테스트 실행 탭을 찾을 수 없습니다');
            return { success: false, message: '테스트 실행 탭을 찾을 수 없습니다' };
        }
        
        console.log('📋 5단계: 기존 테스트 실행 확인 또는 새로 생성');
        
        // 기존 테스트 실행 목록 확인
        const existingExecutions = page.locator('button:has-text("실행")');
        const executionCount = await existingExecutions.count();
        
        if (executionCount > 0) {
            console.log(`📝 기존 테스트 실행 ${executionCount}개 발견`);
            console.log('📋 첫 번째 테스트 실행 클릭');
            await existingExecutions.first().click();
            await page.waitForLoadState('networkidle');
        } else {
            console.log('📝 기존 테스트 실행이 없습니다. 새로 생성하겠습니다');
            
            // 새 테스트 실행 생성 시도
            const newExecutionButton = page.locator('button:has-text("새 테스트 실행")');
            if (await newExecutionButton.count() > 0) {
                await newExecutionButton.click();
                await page.waitForLoadState('networkidle');
                
                // 실행명 입력
                const nameInput = page.locator('input[label*="실행명"], input[placeholder*="실행명"]');
                if (await nameInput.count() > 0) {
                    await nameInput.fill('레이아웃 테스트 실행');
                }
                
                // 저장 버튼 클릭
                const saveButton = page.locator('button:has-text("저장"), button:has-text("생성")');
                if (await saveButton.count() > 0) {
                    await saveButton.click();
                    await page.waitForLoadState('networkidle');
                }
            }
        }
        
        console.log('📋 6단계: 테스트 실행 화면 스크린샷 촬영');
        
        // 현재 URL 확인
        const currentUrl = page.url();
        console.log(`📍 현재 URL: ${currentUrl}`);
        
        // 테스트 실행 화면인지 확인
        if (currentUrl.includes('/executions/')) {
            console.log('✅ 테스트 실행 상세 화면에 도달');
            
            // 다양한 화면 크기에서 스크린샷 촬영
            console.log('📸 데스크톱 스크린샷 촬영');
            await page.screenshot({ 
                path: 'e2e-tests/screenshots/test-execution-desktop-fixed.png', 
                fullPage: true 
            });
            
            console.log('📸 모바일 스크린샷 촬영');
            await page.setViewportSize({ width: 375, height: 667 });
            await page.waitForTimeout(1000);
            await page.screenshot({ 
                path: 'e2e-tests/screenshots/test-execution-mobile-fixed.png', 
                fullPage: true 
            });
            
            console.log('📸 4K 스크린샷 촬영');
            await page.setViewportSize({ width: 3840, height: 2160 });
            await page.waitForTimeout(1000);
            await page.screenshot({ 
                path: 'e2e-tests/screenshots/test-execution-4k-fixed.png', 
                fullPage: true 
            });
            
            console.log('🎉 테스트 실행 화면 레이아웃 검증 완료');
            console.log('🖼️ 생성된 스크린샷:');
            console.log('  - test-execution-desktop-fixed.png');
            console.log('  - test-execution-mobile-fixed.png'); 
            console.log('  - test-execution-4k-fixed.png');
            
            return {
                success: true,
                message: '테스트 실행 화면 레이아웃 검증 완료',
                url: currentUrl,
                screenshots: 3
            };
            
        } else {
            console.log('⚠️ 테스트 실행 상세 화면에 도달하지 못함');
            await page.screenshot({ path: 'e2e-tests/screenshots/test-execution-error.png' });
            
            return {
                success: false,
                message: '테스트 실행 상세 화면에 도달하지 못함',
                url: currentUrl
            };
        }
        
    } catch (error) {
        console.error('❌ 테스트 실행 중 오류:', error.message);
        await page.screenshot({ path: 'e2e-tests/screenshots/test-execution-error.png' });
        
        return {
            success: false,
            message: '테스트 실행 중 오류 발생',
            error: error.message
        };
    } finally {
        await browser.close();
    }
}

// 테스트 실행
testExecutionLayoutTest()
    .then(result => {
        console.log('\n🏁 최종 결과:', result);
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('❌ 테스트 실패:', error);
        process.exit(1);
    });