// e2e-tests/ict-268-role-based-menu-test.js
// ICT-268: Admin 사용자만 사용자관리/조직관리 페이지 접속 가능하게 하는 기능 테스트

const { chromium } = require('playwright');

async function testRoleBasedMenuAccess() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000
    });
    
    try {
        // 테스트 케이스 1: ADMIN 사용자 - 모든 메뉴 접근 가능
        console.log('=== 테스트 1: ADMIN 사용자 메뉴 접근 테스트 ===');
        await testAdminUserAccess(browser);
        
        // 테스트 케이스 2: 일반 사용자 - 관리 메뉴 숨김 테스트
        console.log('\n=== 테스트 2: 일반 사용자 메뉴 제한 테스트 ===');
        await testRegularUserAccess(browser);
        
        console.log('\n🎉 ICT-268 모든 테스트 통과!');
        
    } catch (error) {
        console.error('❌ 테스트 실패:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
}

// ADMIN 사용자 메뉴 접근 테스트
async function testAdminUserAccess(browser) {
    const context = await browser.newContext({
        baseURL: 'http://localhost:8080'
    });
    const page = await context.newPage();
    
    try {
        // 로그인
        await page.goto('/', { timeout: 20000 });
        console.log('✅ 로그인 페이지 접근');
        
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        console.log('✅ ADMIN 사용자 로그인 성공');
        
        // 메뉴 버튼 존재 확인
        const dashboardButton = await page.locator('text=대시보드').count();
        const organizationButton = await page.locator('text=조직 관리').count();
        const userButton = await page.locator('text=사용자 관리').count();
        const projectButton = await page.locator('text=프로젝트 선택').count();
        
        console.log(`메뉴 버튼 확인 - 대시보드: ${dashboardButton}, 조직관리: ${organizationButton}, 사용자관리: ${userButton}, 프로젝트: ${projectButton}`);
        
        // ADMIN은 모든 메뉴가 보여야 함
        if (dashboardButton === 0) throw new Error('대시보드 메뉴가 보이지 않음');
        if (organizationButton === 0) throw new Error('조직 관리 메뉴가 보이지 않음');
        if (userButton === 0) throw new Error('사용자 관리 메뉴가 보이지 않음');
        if (projectButton === 0) throw new Error('프로젝트 선택 메뉴가 보이지 않음');
        
        console.log('✅ ADMIN 사용자 - 모든 관리 메뉴 표시 확인');
        
        // 조직 관리 페이지 접근 테스트
        await page.locator('text=조직 관리').click();
        await page.waitForLoadState('networkidle');
        
        // 현재 URL 확인
        const currentUrl = page.url();
        if (!currentUrl.includes('/organizations')) {
            throw new Error(`조직 관리 페이지로 이동하지 않음: ${currentUrl}`);
        }
        console.log('✅ ADMIN 사용자 - 조직 관리 페이지 접근 성공');
        
        // 사용자 관리 페이지 접근 테스트
        await page.locator('text=사용자 관리').click();
        await page.waitForLoadState('networkidle');
        
        const userPageUrl = page.url();
        if (!userPageUrl.includes('/users')) {
            throw new Error(`사용자 관리 페이지로 이동하지 않음: ${userPageUrl}`);
        }
        console.log('✅ ADMIN 사용자 - 사용자 관리 페이지 접근 성공');
        
    } finally {
        await context.close();
    }
}

// 일반 사용자 메뉴 제한 테스트
async function testRegularUserAccess(browser) {
    const context = await browser.newContext({
        baseURL: 'http://localhost:8080'
    });
    const page = await context.newPage();
    
    try {
        // 먼저 일반 사용자 계정이 있는지 확인하고, 없으면 생성
        await page.goto('/', { timeout: 20000 });
        
        // 임시로 admin으로 로그인하여 일반 사용자를 생성하거나 확인
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        
        // 사용자 관리 페이지로 이동하여 tester 계정 확인
        await page.locator('text=사용자 관리').click();
        await page.waitForLoadState('networkidle');
        
        // 일반 사용자 계정 확인 (기존 tester 계정이 있는지 확인)
        const testerExists = await page.locator('text=tester').count() > 0;
        console.log(`일반 사용자 계정 존재 여부: ${testerExists}`);
        
        // 로그아웃
        await page.locator('[aria-label="user menu"]').click();
        await page.locator('text=로그아웃').click();
        await page.waitForLoadState('networkidle');
        
        // 일반 사용자로 로그인 시도 (기본 tester 계정 또는 새로 생성한 계정)
        if (testerExists) {
            // 기존 tester 계정으로 로그인 시도
            await page.fill('input[name="username"]', 'tester');
            await page.fill('input[name="password"]', 'tester');
        } else {
            // 등록 후 로그인 (일반 사용자 생성)
            await page.locator('text=회원가입').click();
            await page.fill('input[name="username"]', 'testuser');
            await page.fill('input[name="password"]', 'testuser');
            await page.fill('input[name="name"]', '테스트 사용자');
            await page.fill('input[name="email"]', 'testuser@example.com');
            await page.click('button[type="submit"]');
            await page.waitForLoadState('networkidle');
            
            // 생성 후 로그인
            await page.fill('input[name="username"]', 'testuser');
            await page.fill('input[name="password"]', 'testuser');
        }
        
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        console.log('✅ 일반 사용자 로그인 성공');
        
        // 메뉴 확인 - 관리 메뉴는 보이지 않아야 함
        const dashboardButton = await page.locator('text=대시보드').count();
        const organizationButton = await page.locator('text=조직 관리').count();
        const userButton = await page.locator('text=사용자 관리').count();
        const projectButton = await page.locator('text=프로젝트 선택').count();
        
        console.log(`일반 사용자 메뉴 확인 - 대시보드: ${dashboardButton}, 조직관리: ${organizationButton}, 사용자관리: ${userButton}, 프로젝트: ${projectButton}`);
        
        // 일반 사용자는 관리 메뉴가 보이지 않아야 함
        if (organizationButton > 0) throw new Error('일반 사용자에게 조직 관리 메뉴가 표시됨');
        if (userButton > 0) throw new Error('일반 사용자에게 사용자 관리 메뉴가 표시됨');
        
        // 기본 메뉴는 보여야 함
        if (dashboardButton === 0) throw new Error('대시보드 메뉴가 보이지 않음');
        if (projectButton === 0) throw new Error('프로젝트 선택 메뉴가 보이지 않음');
        
        console.log('✅ 일반 사용자 - 관리 메뉴 숨김 확인');
        
        // 직접 URL 접근 테스트 - 권한 없음 페이지가 표시되어야 함
        await page.goto('/organizations');
        await page.waitForLoadState('networkidle');
        
        const unauthorizedMessage = await page.locator('text=접근 권한이 없습니다').count();
        if (unauthorizedMessage === 0) {
            throw new Error('직접 URL 접근 시 권한 없음 페이지가 표시되지 않음');
        }
        console.log('✅ 일반 사용자 - 조직 관리 URL 직접 접근 차단 확인');
        
        await page.goto('/users');
        await page.waitForLoadState('networkidle');
        
        const unauthorizedMessage2 = await page.locator('text=접근 권한이 없습니다').count();
        if (unauthorizedMessage2 === 0) {
            throw new Error('직접 URL 접근 시 권한 없음 페이지가 표시되지 않음');
        }
        console.log('✅ 일반 사용자 - 사용자 관리 URL 직접 접근 차단 확인');
        
        // "대시보드로 돌아가기" 버튼 테스트
        await page.locator('text=대시보드로 돌아가기').click();
        await page.waitForLoadState('networkidle');
        
        const dashboardUrl = page.url();
        if (!dashboardUrl.includes('/dashboard')) {
            throw new Error('대시보드로 돌아가기 버튼이 작동하지 않음');
        }
        console.log('✅ 권한 없음 페이지에서 대시보드 복귀 기능 확인');
        
    } finally {
        await context.close();
    }
}

// 테스트 실행
testRoleBasedMenuAccess().catch(error => {
    console.error('❌ ICT-268 테스트 실패:', error);
    process.exit(1);
});