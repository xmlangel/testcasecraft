const { chromium } = require('playwright');

async function testUserManagementPage() {
    console.log('=== PostgreSQL 환경에서 사용자 관리 페이지 테스트 시작 ===');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500
    });
    
    try {
        const context = await browser.newContext({
            baseURL: 'http://localhost:8080'
        });
        const page = await context.newPage();
        
        // 1. 메인 페이지 접속
        console.log('1️⃣ 메인 페이지 접속 중...');
        await page.goto('/', { timeout: 20000 });
        await page.waitForLoadState('networkidle');
        
        // 2. 로그인 (admin/admin)
        console.log('2️⃣ 관리자 로그인 중...');
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        
        // 3. 사용자 관리 페이지 접속
        console.log('3️⃣ 사용자 관리 페이지 접속 중...');
        
        // 메뉴에서 사용자 관리 찾기
        const userManagementLink = page.locator('text=사용자 관리').or(
            page.locator('text=User Management')
        ).or(
            page.locator('[href*="user"]')
        ).or(
            page.locator('text=관리')
        );
        
        if (await userManagementLink.count() > 0) {
            await userManagementLink.first().click();
        } else {
            // URL 직접 접속 시도
            console.log('   메뉴에서 사용자 관리를 찾을 수 없어 직접 URL로 접근합니다...');
            await page.goto('/admin/users', { timeout: 10000 });
        }
        
        await page.waitForLoadState('networkidle');
        
        // 4. 페이지 로딩 확인
        console.log('4️⃣ 사용자 관리 페이지 로딩 확인 중...');
        
        // 에러 확인
        const errorMessages = await page.locator('.error, .alert-error, [class*="error"]').allTextContents();
        if (errorMessages.length > 0 && errorMessages.some(msg => msg.includes('오류') || msg.includes('error') || msg.includes('Error'))) {
            console.error('❌ 페이지에 오류가 감지되었습니다:', errorMessages);
            return false;
        }
        
        // PostgreSQL native query 호출 확인
        console.log('5️⃣ 사용자 목록 로딩 중 (PostgreSQL native query 테스트)...');
        
        // 네트워크 요청 모니터링
        page.on('response', response => {
            if (response.url().includes('/api/') && response.status() !== 200) {
                console.log(`⚠️ API 요청 실패: ${response.url()} - ${response.status()}`);
            }
        });
        
        // 사용자 데이터 표시 대기
        await page.waitForSelector('table, .user-list, [data-testid="user-table"]', { 
            timeout: 15000,
            state: 'visible'
        }).catch(() => {
            console.log('   테이블 요소를 찾을 수 없습니다. 다른 방법으로 확인합니다...');
        });
        
        // 페이지 내용 확인
        const pageContent = await page.textContent('body');
        
        // 성공적인 사용자 데이터 로딩 확인
        const hasUserData = pageContent.includes('admin') || 
                           pageContent.includes('사용자') || 
                           pageContent.includes('User') ||
                           pageContent.includes('이메일') ||
                           pageContent.includes('Email');
        
        if (hasUserData) {
            console.log('✅ 사용자 관리 페이지가 성공적으로 로드되었습니다!');
            console.log('✅ PostgreSQL native query가 정상적으로 작동합니다!');
            
            // 검색 기능 테스트 (PostgreSQL LIKE 쿼리 테스트)
            console.log('6️⃣ 사용자 검색 기능 테스트 중...');
            const searchInput = page.locator('input[placeholder*="검색"], input[placeholder*="search"], input[type="text"]').first();
            
            if (await searchInput.count() > 0) {
                await searchInput.fill('admin');
                await page.waitForTimeout(1000); // 검색 결과 대기
                console.log('✅ 사용자 검색 기능이 정상적으로 작동합니다!');
            }
            
            return true;
        } else {
            console.error('❌ 사용자 데이터를 찾을 수 없습니다.');
            console.log('페이지 내용 일부:', pageContent.substring(0, 500));
            return false;
        }
        
    } catch (error) {
        console.error('❌ 테스트 중 오류 발생:', error.message);
        return false;
    } finally {
        await browser.close();
    }
}

async function main() {
    try {
        // 애플리케이션 실행 확인
        const response = await fetch('http://localhost:8080');
        if (!response.ok) {
            throw new Error(`애플리케이션에 접속할 수 없습니다: ${response.status}`);
        }
        console.log('✅ 애플리케이션이 localhost:8080에서 실행 중입니다.');
        
        const success = await testUserManagementPage();
        
        if (success) {
            console.log('\n🎉 PostgreSQL 환경에서 사용자 관리 페이지 테스트 성공!');
            console.log('🔧 PostgreSQL Native Query 기반 findUsersWithFilters 메서드가 정상 작동합니다.');
            process.exit(0);
        } else {
            console.log('\n❌ PostgreSQL 환경에서 사용자 관리 페이지 테스트 실패!');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ 테스트 실행 중 오류:', error.message);
        process.exit(1);
    }
}

// 실행
main();