// e2e-tests/ict-285-user-update-debug.js
// ICT-285: 사용자 정보 변경 기능 디버그 테스트

const { chromium } = require('playwright');

async function debugUserUpdateIssue() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1500
    });
    
    const context = await browser.newContext({
        baseURL: 'http://localhost:8080'
    });
    const page = await context.newPage();
    
    // 네트워크 요청 감시
    const networkRequests = [];
    page.on('request', request => {
        if (request.url().includes('/api/')) {
            networkRequests.push({
                url: request.url(),
                method: request.method(),
                headers: request.headers()
            });
            console.log(`🌐 API 요청: ${request.method()} ${request.url()}`);
        }
    });
    
    page.on('response', async response => {
        if (response.url().includes('/api/')) {
            console.log(`📡 API 응답: ${response.status()} ${response.url()}`);
            
            // 4xx, 5xx 에러일 때 응답 내용 로깅
            if (response.status() >= 400) {
                try {
                    const responseText = await response.text();
                    console.log(`❌ API 에러 내용: ${responseText}`);
                } catch (e) {
                    console.log(`❌ API 에러 (응답 내용 확인 실패): ${e.message}`);
                }
            }
        }
    });
    
    try {
        console.log('=== ICT-285: 사용자 정보 변경 기능 디버그 ===');
        
        // 1. 로그인
        await page.goto('/', { timeout: 20000 });
        console.log('✅ 로그인 페이지 접근');
        
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        console.log('✅ Admin 로그인 성공');
        
        // 2. 사용자 관리 페이지로 이동
        await page.locator('text=사용자 관리').click();
        await page.waitForLoadState('networkidle');
        console.log('✅ 사용자 관리 페이지 접근');
        
        // 잠시 대기하여 사용자 목록 로드 확인
        await page.waitForTimeout(2000);
        
        // 3. 사용자 목록에서 첫 번째 사용자 확인
        const userRows = await page.locator('table tbody tr').count();
        console.log(`📊 로드된 사용자 수: ${userRows}`);
        
        if (userRows === 0) {
            console.log('❌ 사용자 목록이 로드되지 않음 - API 호출 실패 가능성');
            throw new Error('사용자 목록이 로드되지 않음');
        }
        
        // 4. 첫 번째 사용자의 "상세 보기" 아이콘 클릭
        const viewButton = page.locator('button[title="상세 보기"], button:has(svg) >> nth=0').first();
        
        // API 응답 대기를 위한 Promise 설정
        const getUserApiCall = page.waitForResponse(response => 
            response.url().includes('/api/admin/users/') && 
            response.url().split('/').length > 5 &&
            response.request().method() === 'GET'
        );
        
        await viewButton.click();
        console.log('✅ 상세 보기 버튼 클릭');
        
        // getUserById API 호출 결과 대기
        try {
            const getUserResponse = await getUserApiCall;
            console.log(`🔍 getUserById API 응답: ${getUserResponse.status()}`);
            
            if (getUserResponse.status() >= 400) {
                const errorText = await getUserResponse.text();
                console.log(`❌ getUserById API 에러: ${errorText}`);
                throw new Error(`getUserById API 실패: ${getUserResponse.status()}`);
            }
        } catch (timeoutError) {
            console.log('⚠️ getUserById API 호출 타임아웃 또는 실패');
        }
        
        // 다이얼로그가 열릴 때까지 대기 (선택적)
        try {
            await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
            console.log('✅ 사용자 상세 다이얼로그 열림');
        } catch (e) {
            console.log('❌ 다이얼로그 열기 실패 - API 에러로 인한 것으로 추정');
        }
        
        // 5. 편집 모드 활성화
        const editButton = page.locator('button[aria-label="정보 수정"], button:has-text("수정")').first();
        await editButton.click();
        console.log('✅ 편집 모드 활성화');
        
        // 6. 사용자 정보 수정 시도
        const nameField = page.locator('input[label="이름"], input[name="name"]').first();
        const emailField = page.locator('input[label="이메일"], input[name="email"], input[type="email"]').first();
        const roleSelect = page.locator('select[name="role"], [role="combobox"]').first();
        
        await nameField.clear();
        await nameField.fill('E2E 테스트 사용자');
        
        await emailField.clear();
        await emailField.fill('e2e.test@test.com');
        
        // 역할 변경 시도
        try {
            await roleSelect.click();
            await page.locator('text="관리자" >> visible=true').first().click();
            console.log('✅ 역할 변경: ADMIN으로 설정');
        } catch (e) {
            console.log('⚠️ 역할 변경 UI 조작 실패, 기본값 유지');
        }
        
        console.log('✅ 사용자 정보 입력 완료');
        
        // 7. 저장 버튼 클릭 및 API 응답 대기
        const updateApiCall = page.waitForResponse(response => 
            response.url().includes('/api/admin/users/') && 
            response.request().method() === 'PUT'
        );
        
        const saveButton = page.locator('button:has-text("저장")').first();
        await saveButton.click();
        console.log('✅ 저장 버튼 클릭');
        
        // 8. API 응답 결과 확인
        try {
            const updateResponse = await updateApiCall;
            console.log(`🔍 사용자 수정 API 응답: ${updateResponse.status()}`);
            
            if (updateResponse.status() === 200) {
                const responseData = await updateResponse.json();
                console.log('✅ 사용자 수정 성공:');
                console.log(`   이름: ${responseData.name}`);
                console.log(`   이메일: ${responseData.email}`);
                console.log(`   역할: ${responseData.role}`);
            } else {
                const errorText = await updateResponse.text();
                console.log(`❌ API 에러: ${errorText}`);
            }
        } catch (timeoutError) {
            console.log('⚠️ API 호출 타임아웃');
        }
        
        await page.waitForTimeout(2000);
        
        // 네트워크 요청 로그 출력
        console.log('\n📋 네트워크 요청 분석:');
        networkRequests.forEach((req, index) => {
            console.log(`${index + 1}. ${req.method} ${req.url}`);
            if (req.headers.authorization) {
                console.log(`   Authorization: ${req.headers.authorization.substring(0, 20)}...`);
            }
        });
        
        // 에러 메시지 확인
        const errorMessage = await page.locator('text*=오류, text*=실패, text*=에러').count();
        if (errorMessage > 0) {
            const errorText = await page.locator('text*=오류, text*=실패, text*=에러').first().textContent();
            console.log(`❌ 에러 메시지 발견: ${errorText}`);
        }
        
        // 성공 메시지 확인
        const successMessage = await page.locator('text*=성공, text*=저장').count();
        if (successMessage > 0) {
            console.log('✅ 성공 메시지 확인됨');
        }
        
        console.log('\n🎯 ICT-285 디버그 테스트 완료');
        
    } catch (error) {
        console.error('❌ 디버그 테스트 실패:', error.message);
        
        // 네트워크 요청 로그 출력
        console.log('\n📋 오류 발생 시점 네트워크 요청:');
        networkRequests.forEach((req, index) => {
            console.log(`${index + 1}. ${req.method} ${req.url}`);
        });
        
        throw error;
    } finally {
        await browser.close();
    }
}

// 테스트 실행
debugUserUpdateIssue().catch(error => {
    console.error('❌ ICT-285 디버그 실패:', error);
    process.exit(1);
});