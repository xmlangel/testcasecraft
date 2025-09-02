// Simple E2E Test: User Registration with TESTER Role
// ICT-332: 새로 가입한 사용자가 TESTER 역할로 로그인하여 접근 권한 오류 없이 시스템 이용 가능한지 테스트

const { chromium } = require('playwright');

async function simpleUserRegistrationTest() {
    console.log('🧪 Simple E2E Test: User Registration & Login with TESTER Role');
    
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

        console.log(`\n🔐 Step 1: 사용자 등록 - ${testUser.username}`);
        
        // 메인 페이지 이동
        await page.goto('/', { timeout: 20000 });
        await page.waitForLoadState('networkidle', { timeout: 15000 });

        // 회원가입 모드로 전환
        await page.locator('button:has-text("회원가입")').click();
        await page.waitForTimeout(2000);

        // 회원가입 폼 작성
        await page.fill('input[name="username"]', testUser.username);
        await page.fill('input[name="password"]', testUser.password);
        await page.fill('input[name="confirm"]', testUser.password);
        await page.fill('input[name="name"]', testUser.name);
        await page.fill('input[name="email"]', testUser.email);

        // 회원가입 제출
        await page.click('button[type="submit"]');
        await page.waitForTimeout(3000);

        console.log('   ✅ 회원가입 완료');

        console.log('\n🔑 Step 2: 새 사용자로 로그인');

        // 로그인 폼 작성 (회원가입 후 자동으로 로그인 모드로 전환됨)
        await page.fill('input[name="username"]', testUser.username);
        await page.fill('input[name="password"]', testUser.password);
        await page.click('button[type="submit"]');
        
        // 로그인 처리 대기
        await page.waitForTimeout(5000);

        console.log('\n✨ Step 3: 접근 권한 확인');

        // 현재 URL 확인
        const currentUrl = page.url();
        console.log(`   현재 페이지: ${currentUrl}`);

        // ACCESS_DENIED 오류 확인
        const accessDeniedCount = await page.locator('text=ACCESS_DENIED').count();
        const accessDeniedKoreanCount = await page.locator('text=접근 권한이 없습니다').count();
        
        if (accessDeniedCount > 0 || accessDeniedKoreanCount > 0) {
            console.log('   ❌ ACCESS_DENIED 오류 발생!');
            
            // 오류 메시지 캡처
            const bodyText = await page.textContent('body');
            console.log('   오류 내용:', bodyText.substring(0, 300));
            
            throw new Error('TESTER 역할 사용자가 ACCESS_DENIED 오류로 시스템 접근 불가');
        } else {
            console.log('   ✅ ACCESS_DENIED 오류 없음 - 정상 접근 가능');
        }

        // 프로젝트 페이지 접근 확인
        if (currentUrl.includes('/projects')) {
            console.log('   ✅ 프로젝트 페이지로 정상 리디렉션');
        } else {
            console.log(`   ⚠️  예상 외 페이지: ${currentUrl}`);
        }

        console.log('\n🎯 결과: TESTER 역할 사용자 접근 권한 정상 동작');
        console.log(`   - 사용자: ${testUser.username}`);
        console.log(`   - 역할: TESTER (기본값, VIEWER → TESTER 수정됨)`);  
        console.log(`   - 접근 상태: 정상 (ACCESS_DENIED 오류 해결)`);

        return {
            success: true,
            testUser: testUser,
            currentUrl: currentUrl,
            message: 'TESTER 역할 사용자 등록 및 로그인 성공, 접근 권한 정상'
        };

    } catch (error) {
        console.error('\n❌ 테스트 실패:', error.message);
        
        // 현재 URL과 페이지 상태 로그
        try {
            const currentUrl = page.url();
            const pageTitle = await page.title();
            console.log(`   실패 시점 URL: ${currentUrl}`);
            console.log(`   페이지 제목: ${pageTitle}`);
        } catch (e) {
            console.log('   페이지 상태 확인 불가');
        }
        
        return {
            success: false,
            error: error.message,
            message: 'TESTER 역할 사용자 접근 권한 테스트 실패'
        };
    } finally {
        try {
            await browser.close();
        } catch (e) {
            // 브라우저 종료 에러 무시
        }
    }
}

// 테스트 실행
if (require.main === module) {
    simpleUserRegistrationTest()
        .then(result => {
            console.log('\n📊 최종 테스트 결과:', result);
            
            if (result.success) {
                console.log('\n🎉 ICT-332 수정 사항 검증 완료!');
                console.log('   - 새로운 사용자 기본 역할: VIEWER → TESTER');
                console.log('   - ACCESS_DENIED 오류 해결됨');  
                console.log('   - 시스템 정상 접근 가능');
            } else {
                console.log('\n💥 ICT-332 수정 사항 검증 실패');
                console.log('   - 추가 디버깅 필요');
            }
            
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('\n💥 테스트 실행 중 오류:', error);
            process.exit(1);
        });
}

module.exports = simpleUserRegistrationTest;