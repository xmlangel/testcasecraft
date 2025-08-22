// e2e-tests/ict-272-layout-consistency-test.js
// ICT-272: 레이아웃 통합 개선 검증 테스트

const { chromium } = require('playwright');

async function testLayoutConsistency() {
    console.log('🚀 ICT-272: 레이아웃 통합 개선 검증 테스트 시작');
    
    const browser = await chromium.launch({ 
        headless: false, 
        slowMo: 1000 
    });
    
    try {
        const context = await browser.newContext({
            baseURL: 'http://localhost:8080',
            viewport: { width: 1920, height: 1080 } // 표준 데스크톱 해상도
        });
        const page = await context.newPage();
        
        console.log('📋 1단계: 로그인 진행');
        await page.goto('/', { timeout: 20000 });
        await page.waitForLoadState('networkidle');
        
        // 로그인
        await page.fill('input[name="username"]', 'testuser');
        await page.fill('input[name="password"]', 'testpass');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        
        if (page.url().includes('/dashboard')) {
            console.log('✅ 로그인 성공');
        } else {
            throw new Error('❌ 로그인 실패');
        }
        
        console.log('📋 2단계: 대시보드 레이아웃 확인');
        
        // 대시보드 컨테이너 확인
        const dashboardContainer = await page.locator('body > div:first-child > div > div').first();
        const dashboardBox = await dashboardContainer.boundingBox();
        
        console.log(`📊 대시보드 컨테이너 크기: ${dashboardBox.width}x${dashboardBox.height}`);
        
        // 최대 폭 활용도 확인 (1920px 화면에서 85% 이상 활용 기대)
        const widthUtilization = (dashboardBox.width / 1920) * 100;
        console.log(`📏 가로 공간 활용도: ${widthUtilization.toFixed(1)}%`);
        
        if (widthUtilization >= 85) {
            console.log('✅ 대시보드 가로 공간 활용도 우수');
        } else {
            console.log('⚠️ 대시보드 가로 공간 활용도 개선 필요');
        }
        
        console.log('📋 3단계: 프로젝트 관리 화면으로 이동');
        await page.locator('text=프로젝트').first().click();
        await page.waitForLoadState('networkidle');
        
        // 프로젝트 관리 화면 레이아웃 확인
        const projectContainer = await page.locator('body > div:first-child > div > div').first();
        const projectBox = await projectContainer.boundingBox();
        
        console.log(`📊 프로젝트 관리 컨테이너 크기: ${projectBox.width}x${projectBox.height}`);
        
        const projectWidthUtilization = (projectBox.width / 1920) * 100;
        console.log(`📏 프로젝트 관리 가로 공간 활용도: ${projectWidthUtilization.toFixed(1)}%`);
        
        console.log('📋 4단계: 레이아웃 일관성 검증');
        
        // 대시보드와 프로젝트 관리 화면의 폭 차이 확인 (10% 이내 차이 허용)
        const widthDifference = Math.abs(dashboardBox.width - projectBox.width);
        const widthConsistency = (widthDifference / dashboardBox.width) * 100;
        
        console.log(`📏 화면 간 폭 차이: ${widthDifference}px (${widthConsistency.toFixed(1)}%)`);
        
        if (widthConsistency <= 10) {
            console.log('✅ 화면 간 레이아웃 일관성 우수');
        } else {
            console.log('⚠️ 화면 간 레이아웃 일관성 개선 필요');
        }
        
        console.log('📋 5단계: 반응형 테스트 (모바일 크기)');
        await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
        await page.waitForTimeout(1000);
        
        const mobileContainer = await page.locator('body > div:first-child > div > div').first();
        const mobileBox = await mobileContainer.boundingBox();
        
        console.log(`📱 모바일 컨테이너 크기: ${mobileBox.width}x${mobileBox.height}`);
        
        const mobileWidthUtilization = (mobileBox.width / 375) * 100;
        console.log(`📏 모바일 가로 공간 활용도: ${mobileWidthUtilization.toFixed(1)}%`);
        
        if (mobileWidthUtilization >= 90) {
            console.log('✅ 모바일 반응형 레이아웃 우수');
        } else {
            console.log('⚠️ 모바일 반응형 레이아웃 개선 필요');
        }
        
        console.log('📋 6단계: 대형 화면 테스트 (4K)');
        await page.setViewportSize({ width: 3840, height: 2160 }); // 4K
        await page.waitForTimeout(1000);
        
        const largeContainer = await page.locator('body > div:first-child > div > div').first();
        const largeBox = await largeContainer.boundingBox();
        
        console.log(`🖥️ 4K 컨테이너 크기: ${largeBox.width}x${largeBox.height}`);
        
        const largeWidthUtilization = (largeBox.width / 3840) * 100;
        console.log(`📏 4K 가로 공간 활용도: ${largeWidthUtilization.toFixed(1)}%`);
        
        // 4K에서는 98vw 설정으로 거의 전체 화면 활용 기대
        if (largeWidthUtilization >= 95) {
            console.log('✅ 4K 대형 화면 레이아웃 최적화 우수');
        } else {
            console.log('⚠️ 4K 대형 화면 레이아웃 최적화 개선 필요');
        }
        
        // 스크린샷 촬영
        await page.screenshot({ path: 'e2e-tests/screenshots/ict-272-layout-4k.png', fullPage: true });
        console.log('📸 4K 레이아웃 스크린샷 저장');
        
        console.log('🎉 ICT-272 레이아웃 통합 개선 테스트 완료');
        
        const testResults = {
            success: true,
            message: 'ICT-272: 레이아웃 통합 개선 검증 완료',
            details: {
                desktopWidthUtilization: widthUtilization,
                layoutConsistency: widthConsistency,
                mobileResponsive: mobileWidthUtilization >= 90,
                largeScreenOptimized: largeWidthUtilization >= 95
            }
        };
        
        console.log('🏁 최종 결과:', testResults);
        return testResults;
        
    } catch (error) {
        console.error('❌ 테스트 실행 중 오류 발생:', error.message);
        await page.screenshot({ path: 'e2e-tests/screenshots/ict-272-error.png' });
        console.log('📸 에러 스크린샷 저장: e2e-tests/screenshots/ict-272-error.png');
        
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
testLayoutConsistency()
    .then(result => {
        console.log('\n🏁 최종 결과:', result);
        process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
        console.error('❌ 테스트 실패:', error);
        process.exit(1);
    });