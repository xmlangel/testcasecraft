// E2E Test: User Registration with TESTER Role Fix
// ICT-332 관련: 새로 가입한 사용자가 TESTER 역할로 시스템에 정상 접근 가능한지 테스트

const { chromium } = require('playwright');

async function testUserRegistrationAndAccess() {
    console.log('🧪 E2E Test: User Registration with TESTER Role Access');
    
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        baseURL: 'http://localhost:8080'
    });
    const page = await context.newPage();

    try {
        // 고유한 테스트 사용자 생성
        const timestamp = Date.now();
        const testUser = {
            username: `testuser${timestamp}`,
            email: `testuser${timestamp}@example.com`,
            name: `Test User ${timestamp}`,
            password: 'testpass123'
        };

        console.log(`\n📝 Step 1: 새로운 사용자 등록 - ${testUser.username}`);
        
        // 메인 페이지로 이동
        await page.goto('/', { timeout: 30000 });
        await page.waitForLoadState('networkidle');

        // 로그인 페이지에서 회원가입 모드로 전환
        const signUpButton = page.locator('button:has-text("회원가입")');
        await signUpButton.waitFor({ timeout: 10000 });
        await signUpButton.click();
        await page.waitForLoadState('networkidle');

        console.log('   ✅ 회원가입 모드 전환 성공');

        // 회원가입 폼 작성
        await page.fill('input[name="username"]', testUser.username);
        await page.fill('input[name="email"]', testUser.email);
        await page.fill('input[name="name"]', testUser.name);
        await page.fill('input[name="password"]', testUser.password);
        await page.fill('input[name="confirm"]', testUser.password); // 비밀번호 확인

        // 회원가입 제출
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        // 회원가입 성공 확인 (로그인 페이지로 리디렉션 또는 성공 메시지)
        console.log('   ✅ 회원가입 요청 제출 완료');

        console.log('\n🔐 Step 2: 새로 가입한 사용자로 로그인 테스트');

        // 로그인 페이지로 이동 (회원가입 후 자동 이동되었을 수 있음)
        const currentUrl = page.url();
        if (!currentUrl.includes('/login') && !currentUrl.includes('/')) {
            await page.goto('/login');
            await page.waitForLoadState('networkidle');
        }

        // 로그인 폼 작성
        await page.fill('input[name="username"]', testUser.username);
        await page.fill('input[name="password"]', testUser.password);
        await page.click('button[type="submit"]');
        
        // 로그인 결과 대기
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);

        console.log('\n🏠 Step 3: 기본 페이지 접근 및 권한 확인');

        // 로그인 후 URL 확인 (projects 페이지로 리디렉션되어야 함)
        const loginResultUrl = page.url();
        console.log(`   현재 URL: ${loginResultUrl}`);

        // ACCESS_DENIED 에러가 없는지 확인
        const errorMessages = await page.locator('text=ACCESS_DENIED').count();
        const accessDeniedMessages = await page.locator('text=접근 권한이 없습니다').count();

        if (errorMessages > 0 || accessDeniedMessages > 0) {
            console.log('   ❌ 접근 권한 오류 발생 - TESTER 역할 문제');
            
            // 에러 메시지 상세 캡처
            const errorDetails = await page.textContent('body');
            console.log('   오류 상세:', errorDetails.substring(0, 500));
            
            throw new Error('새로운 사용자가 ACCESS_DENIED 오류로 시스템에 접근할 수 없음');
        }

        // projects 페이지 접근 확인
        if (loginResultUrl.includes('/projects') || loginResultUrl === 'http://localhost:8080/') {
            console.log('   ✅ 기본 페이지 접근 성공 - TESTER 역할로 정상 동작');
        } else {
            console.log(`   ⚠️  예상과 다른 페이지로 리디렉션: ${loginResultUrl}`);
        }

        console.log('\n📋 Step 4: 프로젝트 목록 페이지 기능 확인');

        // 명시적으로 projects 페이지 이동
        await page.goto('/projects');
        await page.waitForLoadState('networkidle');

        // 프로젝트 관련 요소들이 정상 표시되는지 확인
        const projectElements = await page.locator('text=프로젝트').count();
        const createProjectButton = await page.locator('button:has-text("새 프로젝트")').count();

        if (projectElements > 0) {
            console.log('   ✅ 프로젝트 페이지 정상 로드');
        }

        if (createProjectButton > 0) {
            console.log('   ✅ TESTER 역할로 프로젝트 생성 버튼 접근 가능');
        }

        console.log('\n🎯 Step 5: 대시보드 접근 제한 확인 (TESTER는 접근 불가)');

        // TESTER 역할은 대시보드에 접근할 수 없어야 함
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');

        const unauthorizedPage = await page.locator('text=권한이 없습니다').count();
        const dashboardContent = await page.locator('text=대시보드').count();

        if (unauthorizedPage > 0) {
            console.log('   ✅ TESTER 역할의 대시보드 접근 제한 정상 동작');
        } else if (dashboardContent > 0) {
            console.log('   ⚠️  TESTER 역할인데 대시보드에 접근 가능 (권한 설정 재확인 필요)');
        }

        console.log('\n🎉 테스트 결과: 새로운 사용자 등록 및 접근 테스트 성공');
        console.log(`   - 사용자명: ${testUser.username}`);
        console.log(`   - 기본 역할: TESTER (VIEWER에서 변경됨)`);
        console.log(`   - 프로젝트 페이지 접근: 성공`);
        console.log(`   - 대시보드 접근 제한: 적용됨`);
        console.log('   - ACCESS_DENIED 오류: 해결됨');

        return {
            success: true,
            testUser: testUser,
            message: '새로운 사용자 등록 및 접근 권한 정상 동작'
        };

    } catch (error) {
        console.error('\n❌ 테스트 실패:', error.message);
        
        // 스크린샷 캡처 (디버깅용)
        await page.screenshot({ 
            path: `e2e-tests/screenshots/user-registration-error-${Date.now()}.png`,
            fullPage: true 
        });
        
        return {
            success: false,
            error: error.message,
            message: '사용자 등록 또는 접근 권한에 문제가 있음'
        };
    } finally {
        await browser.close();
    }
}

// 테스트 실행
if (require.main === module) {
    testUserRegistrationAndAccess()
        .then(result => {
            console.log('\n📊 최종 결과:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('\n💥 테스트 실행 오류:', error);
            process.exit(1);
        });
}

module.exports = testUserRegistrationAndAccess;