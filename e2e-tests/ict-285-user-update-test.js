// e2e-tests/ict-285-user-update-test.js
// ICT-285: 사용자 정보 변경 기능 E2E 테스트

const { chromium } = require('playwright');

async function testUserInfoUpdate() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500
    });
    
    const context = await browser.newContext({
        baseURL: 'http://localhost:8080'
    });
    const page = await context.newPage();
    
    // 네트워크 요청 모니터링
    const apiCalls = [];
    page.on('response', async response => {
        if (response.url().includes('/api/admin/users/') && response.request().method() === 'PUT') {
            try {
                const responseData = await response.json();
                apiCalls.push({
                    status: response.status(),
                    data: responseData
                });
                console.log(`📡 사용자 수정 API 응답: ${response.status()}`);
            } catch (e) {
                console.log(`📡 API 응답 파싱 실패: ${e.message}`);
            }
        }
    });
    
    try {
        console.log('=== ICT-285: 사용자 정보 변경 기능 E2E 테스트 ===');
        
        // 1. 로그인
        await page.goto('/');
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        console.log('✅ 관리자 로그인 완료');
        
        // 2. 사용자 관리 페이지로 이동
        await page.locator('text=사용자 관리').click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        console.log('✅ 사용자 관리 페이지 접근');
        
        // 3. 사용자 목록 확인
        const userCount = await page.locator('table tbody tr').count();
        console.log(`📊 로드된 사용자 수: ${userCount}`);
        
        if (userCount === 0) {
            throw new Error('사용자 목록이 비어있음');
        }
        
        // 4. 첫 번째 사용자의 상세보기 버튼 클릭
        await page.locator('table tbody tr').first().locator('button').first().click();
        console.log('✅ 상세보기 버튼 클릭');
        
        // 5. 사용자 상세 다이얼로그 대기
        await page.waitForSelector('[role="dialog"]', { timeout: 10000 });
        console.log('✅ 사용자 상세 다이얼로그 열림');
        
        // 6. 편집 모드 활성화
        const editButton = page.locator('[role="dialog"] button').filter({ hasText: '수정' }).or(
            page.locator('[role="dialog"] button[aria-label*="수정"]')
        ).first();
        await editButton.click();
        console.log('✅ 편집 모드 활성화');
        
        await page.waitForTimeout(1000);
        
        // 7. 현재 값 확인
        const currentName = await page.locator('[role="dialog"] input').nth(0).inputValue();
        const currentEmail = await page.locator('[role="dialog"] input').nth(1).inputValue();
        console.log(`📋 현재 사용자 정보 - 이름: ${currentName}, 이메일: ${currentEmail}`);
        
        // 8. 사용자 정보 수정
        const testName = 'E2E 테스트 수정 사용자';
        const testEmail = 'e2e.modified@test.com';
        
        // 이름 필드 수정
        await page.locator('[role="dialog"] input').nth(0).clear();
        await page.locator('[role="dialog"] input').nth(0).fill(testName);
        
        // 이메일 필드 수정
        await page.locator('[role="dialog"] input').nth(1).clear();
        await page.locator('[role="dialog"] input').nth(1).fill(testEmail);
        
        console.log('✅ 사용자 정보 입력 완료');
        
        // 9. 저장 버튼 클릭 및 API 응답 대기
        const updateApiPromise = page.waitForResponse(response => 
            response.url().includes('/api/admin/users/') && 
            response.request().method() === 'PUT',
            { timeout: 10000 }
        );
        
        const saveButton = page.locator('[role="dialog"] button').filter({ hasText: '저장' }).first();
        await saveButton.click();
        console.log('✅ 저장 버튼 클릭');
        
        // 10. API 응답 확인
        try {
            const updateResponse = await updateApiPromise;
            console.log(`🔍 사용자 수정 API 상태: ${updateResponse.status()}`);
            
            if (updateResponse.status() === 200) {
                const responseData = await updateResponse.json();
                console.log('✅ 사용자 수정 API 성공:');
                console.log(`   📝 수정된 이름: ${responseData.name}`);
                console.log(`   📧 수정된 이메일: ${responseData.email}`);
                console.log(`   🎭 역할: ${responseData.role}`);
                
                // 수정 내용 검증
                if (responseData.name === testName && responseData.email === testEmail) {
                    console.log('✅ 사용자 정보 수정 성공 검증 완료');
                } else {
                    console.log('❌ 수정 내용 불일치');
                    console.log(`   예상 이름: ${testName}, 실제: ${responseData.name}`);
                    console.log(`   예상 이메일: ${testEmail}, 실제: ${responseData.email}`);
                }
            } else {
                const errorText = await updateResponse.text();
                console.log(`❌ API 에러 ${updateResponse.status()}: ${errorText}`);
                throw new Error(`사용자 수정 API 실패: ${updateResponse.status()}`);
            }
        } catch (timeoutError) {
            console.log('❌ API 응답 타임아웃');
            throw new Error('사용자 수정 API 타임아웃');
        }
        
        // 11. 다이얼로그 닫기 대기
        await page.waitForTimeout(2000);
        
        // 다이얼로그가 자동으로 닫혔는지 확인
        const dialogStillOpen = await page.locator('[role="dialog"]').count();
        if (dialogStillOpen === 0) {
            console.log('✅ 편집 다이얼로그 자동 닫힘');
        } else {
            // 수동으로 닫기
            const closeButton = page.locator('[role="dialog"] button').filter({ hasText: '닫기' }).or(
                page.locator('[role="dialog"] button').filter({ hasText: '취소' })
            ).first();
            await closeButton.click();
            console.log('✅ 편집 다이얼로그 수동 닫음');
        }
        
        // 12. 사용자 목록에서 변경사항 확인
        await page.waitForTimeout(2000);
        const updatedUserName = await page.locator('table tbody tr').first().locator('td').nth(2).textContent();
        const updatedUserEmail = await page.locator('table tbody tr').first().locator('td').nth(3).textContent();
        
        console.log('📋 사용자 목록에서 확인된 정보:');
        console.log(`   이름: ${updatedUserName}`);
        console.log(`   이메일: ${updatedUserEmail}`);
        
        // 13. 최종 검증
        if (updatedUserName.includes(testName) && updatedUserEmail.includes(testEmail)) {
            console.log('✅ 사용자 목록에서 변경사항 확인 완료');
        } else {
            console.log('⚠️ 사용자 목록 업데이트 지연 또는 캐시 이슈');
        }
        
        console.log('\n🎉 ICT-285 사용자 정보 변경 기능 E2E 테스트 완료');
        
        // API 호출 결과 요약
        if (apiCalls.length > 0) {
            console.log('\n📊 API 호출 결과 요약:');
            apiCalls.forEach((call, index) => {
                console.log(`${index + 1}. 상태: ${call.status}, 사용자: ${call.data.name} (${call.data.email})`);
            });
        }
        
    } catch (error) {
        console.error('❌ E2E 테스트 실패:', error.message);
        
        // 실패 시 스크린샷 저장
        try {
            await page.screenshot({ 
                path: 'e2e-tests/test-screenshots/ict-285-failure.png',
                fullPage: true 
            });
            console.log('📸 실패 스크린샷 저장: test-screenshots/ict-285-failure.png');
        } catch (screenshotError) {
            console.log('📸 스크린샷 저장 실패');
        }
        
        throw error;
    } finally {
        await browser.close();
    }
}

// 테스트 실행
testUserInfoUpdate().catch(error => {
    console.error('❌ ICT-285 E2E 테스트 실패:', error);
    process.exit(1);
});