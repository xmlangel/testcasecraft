#!/usr/bin/env node

/**
 * ICT-335: 대시보드 멤버 수 표시 문제 디버그용 간단한 테스트
 */

const { chromium } = require('playwright');

async function debugDashboardAccess() {
    console.log('🧪 ICT-335: 대시보드 접근 디버그 테스트');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000,
        args: ['--disable-dev-shm-usage', '--no-sandbox']
    });
    
    try {
        const context = await browser.newContext({
            baseURL: 'http://localhost:8080',
            viewport: { width: 1920, height: 1080 }
        });
        
        const page = await context.newPage();
        
        // 콘솔 로그 캡처
        page.on('console', msg => {
            console.log('🖥️ Browser:', msg.text());
        });
        
        console.log('📋 1. 로그인 페이지 이동');
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        console.log('📋 2. admin으로 로그인');
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        
        console.log(`현재 URL: ${page.url()}`);
        
        // 사용자 정보 확인
        const userInfo = await page.evaluate(() => {
            const user = JSON.parse(localStorage.getItem('user') || 'null');
            return user;
        });
        
        console.log('👤 로그인된 사용자 정보:', userInfo);
        
        console.log('📋 3. /dashboard로 이동');
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        
        console.log(`대시보드 URL: ${page.url()}`);
        
        // 페이지 타이틀 확인
        const title = await page.title();
        console.log(`페이지 타이틀: ${title}`);
        
        // 페이지 내용 확인
        const bodyText = await page.locator('body').textContent();
        
        if (bodyText.includes('권한이 없습니다') || bodyText.includes('UnauthorizedPage')) {
            console.log('❌ 권한 없음 페이지가 표시됩니다.');
            console.log('페이지 내용 일부:', bodyText.substring(0, 200));
        } else if (bodyText.includes('조직 대시보드') || bodyText.includes('프로젝트 통계')) {
            console.log('✅ 대시보드 페이지가 정상적으로 표시됩니다.');
            
            // 멤버 수 관련 텍스트 찾기
            console.log('📋 4. 멤버 수 표시 확인');
            const memberTexts = await page.locator('*:has-text("멤버")').all();
            
            console.log(`"멤버" 텍스트가 포함된 요소 ${memberTexts.length}개 발견:`);
            for (let i = 0; i < Math.min(memberTexts.length, 10); i++) {
                try {
                    const text = await memberTexts[i].textContent();
                    console.log(`  ${i + 1}. "${text}"`);
                } catch (e) {
                    // 무시
                }
            }
            
            // 프로젝트 관련 텍스트 찾기
            const projectTexts = await page.locator('*:has-text("프로젝트")').all();
            console.log(`"프로젝트" 텍스트가 포함된 요소 ${projectTexts.length}개 발견:`);
            for (let i = 0; i < Math.min(projectTexts.length, 5); i++) {
                try {
                    const text = await projectTexts[i].textContent();
                    console.log(`  ${i + 1}. "${text}"`);
                } catch (e) {
                    // 무시
                }
            }
            
        } else {
            console.log('⚠️ 예상치 못한 페이지 내용:');
            console.log(bodyText.substring(0, 500));
        }
        
        console.log('📋 5. 10초 대기 (수동 확인용)');
        await page.waitForTimeout(10000);
        
        console.log('✅ 테스트 완료');
        
    } catch (error) {
        console.error('❌ 에러:', error);
    } finally {
        await browser.close();
    }
}

// 메인 실행
if (require.main === module) {
    debugDashboardAccess().catch(console.error);
}

module.exports = { debugDashboardAccess };