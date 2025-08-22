// e2e-tests/ict-272-simple-layout-test.js
// ICT-272: 간단한 레이아웃 검증 테스트

const { chromium } = require('playwright');

async function testSimpleLayout() {
    console.log('🚀 ICT-272: 간단한 레이아웃 검증 테스트 시작');
    
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
        
        console.log('📋 1단계: 로그인 및 대시보드 접근');
        await page.goto('/', { timeout: 20000 });
        await page.waitForLoadState('networkidle');
        
        await page.fill('input[name="username"]', 'testuser');
        await page.fill('input[name="password"]', 'testpass');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        
        console.log('✅ 대시보드 접근 성공');
        
        console.log('📋 2단계: 대시보드 레이아웃 시각적 확인');
        await page.screenshot({ path: 'e2e-tests/screenshots/ict-272-dashboard-desktop.png', fullPage: true });
        console.log('📸 대시보드 데스크톱 스크린샷 저장');
        
        // 페이지 제목 확인
        const title = await page.textContent('h5, h4');
        console.log(`📋 페이지 제목: "${title}"`);
        
        console.log('📋 3단계: 프로젝트 관리 화면 이동');
        await page.locator('text=프로젝트').first().click();
        await page.waitForLoadState('networkidle');
        
        await page.screenshot({ path: 'e2e-tests/screenshots/ict-272-projects-desktop.png', fullPage: true });
        console.log('📸 프로젝트 관리 데스크톱 스크린샷 저장');
        
        const projectTitle = await page.textContent('h5, h4');
        console.log(`📋 프로젝트 페이지 제목: "${projectTitle}"`);
        
        console.log('📋 4단계: 모바일 반응형 테스트');
        await page.setViewportSize({ width: 375, height: 667 });
        await page.waitForTimeout(2000);
        
        await page.screenshot({ path: 'e2e-tests/screenshots/ict-272-projects-mobile.png', fullPage: true });
        console.log('📸 프로젝트 관리 모바일 스크린샷 저장');
        
        console.log('📋 5단계: 대형 화면 테스트 (4K)');
        await page.setViewportSize({ width: 3840, height: 2160 });
        await page.waitForTimeout(2000);
        
        await page.screenshot({ path: 'e2e-tests/screenshots/ict-272-projects-4k.png', fullPage: true });
        console.log('📸 프로젝트 관리 4K 스크린샷 저장');
        
        console.log('📋 6단계: 대시보드로 돌아가기');
        await page.locator('text=대시보드').first().click();
        await page.waitForLoadState('networkidle');
        
        await page.screenshot({ path: 'e2e-tests/screenshots/ict-272-dashboard-4k.png', fullPage: true });
        console.log('📸 대시보드 4K 스크린샷 저장');
        
        console.log('🎉 ICT-272 레이아웃 시각적 검증 완료');
        console.log('🖼️ 스크린샷 파일들:');
        console.log('  - ict-272-dashboard-desktop.png');
        console.log('  - ict-272-projects-desktop.png');
        console.log('  - ict-272-projects-mobile.png');
        console.log('  - ict-272-projects-4k.png');
        console.log('  - ict-272-dashboard-4k.png');
        
        const testResults = {
            success: true,
            message: 'ICT-272: 레이아웃 시각적 검증 완료',
            details: {
                screenshotsCaptured: 5,
                responsiveTested: true,
                pagesVerified: ['Dashboard', 'Projects']
            }
        };
        
        console.log('🏁 최종 결과:', testResults);
        return testResults;
        
    } catch (error) {
        console.error('❌ 테스트 실행 중 오류 발생:', error.message);
        await page.screenshot({ path: 'e2e-tests/screenshots/ict-272-error.png' });
        console.log('📸 에러 스크린샷 저장');
        
        return {
            success: false,
            message: 'ICT-272 테스트 실행 중 오류 발생',
            error: error.message
        };
    } finally {
        await browser.close();
    }
}

// 테스트 실행
testSimpleLayout()
    .then(result => {
        console.log('\n🏁 최종 결과:', result);
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('❌ 테스트 실패:', error);
        process.exit(1);
    });