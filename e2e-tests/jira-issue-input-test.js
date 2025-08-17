/**
 * JIRA 이슈 입력 기능 E2E 테스트
 * 테스트 결과 폼에서 JIRA 이슈 키 입력 시 500 에러가 발생하지 않는지 확인
 */

const { chromium } = require('playwright');

async function testJiraIssueInput() {
    let browser, context, page;
    
    try {
        console.log('🚀 JIRA 이슈 입력 E2E 테스트 시작...');
        
        // 1. 브라우저 시작
        browser = await chromium.launch({ 
            headless: false,
            slowMo: 500 
        });
        
        context = await browser.newContext({
            baseURL: 'http://localhost:8080'
        });
        
        page = await context.newPage();
        
        // 2. 메인 페이지 접속
        console.log('📱 메인 페이지 접속 중...');
        await page.goto('/', { timeout: 20000 });
        await page.waitForSelector('body', { timeout: 10000 });
        
        // 3. 로그인
        console.log('🔐 로그인 중...');
        
        // 로그인 버튼 클릭
        await page.click('button:has-text("로그인")');
        await page.waitForSelector('input[name="username"]', { timeout: 5000 });
        
        // 로그인 정보 입력
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        
        // 로그인 완료 대기
        await page.waitForSelector('text=프로젝트 관리', { timeout: 10000 });
        console.log('✅ 로그인 성공');
        
        // 4. 프로젝트 접속
        console.log('📂 프로젝트 접속 중...');
        
        // 첫 번째 프로젝트 선택
        await page.click('.project-card', { timeout: 10000 });
        await page.waitForSelector('text=테스트케이스', { timeout: 10000 });
        
        // 5. 테스트 실행 섹션으로 이동
        console.log('🧪 테스트 실행 섹션으로 이동...');
        await page.click('text=테스트 실행');
        await page.waitForSelector('text=테스트 실행 목록', { timeout: 10000 });
        
        // 6. 새 테스트 실행 생성 또는 기존 실행 선택
        console.log('📋 테스트 실행 준비 중...');
        
        // 기존 테스트 실행이 있는지 확인
        const existingExecution = await page.locator('.execution-item').first();
        
        if (await existingExecution.count() > 0) {
            // 기존 실행 클릭
            await existingExecution.click();
            console.log('✅ 기존 테스트 실행 선택됨');
        } else {
            // 새 실행 생성
            await page.click('button:has-text("새 테스트 실행")');
            await page.waitForSelector('input[label="실행 이름"]', { timeout: 5000 });
            await page.fill('input[label="실행 이름"]', 'JIRA 테스트 실행');
            await page.click('button:has-text("생성")');
            console.log('✅ 새 테스트 실행 생성됨');
        }
        
        // 7. 테스트 결과 입력 폼 열기
        console.log('📝 테스트 결과 입력 폼 열기...');
        
        // 첫 번째 테스트 케이스의 결과 입력 버튼 클릭
        await page.click('button:has-text("결과 입력")', { timeout: 10000 });
        await page.waitForSelector('text=테스트 결과 입력', { timeout: 10000 });
        
        // 8. JIRA 이슈 키 입력 테스트
        console.log('🐛 JIRA 이슈 키 입력 테스트...');
        
        // JIRA 이슈 키 입력 필드 찾기
        const jiraInput = page.locator('input[label*="JIRA"]').first();
        await jiraInput.waitFor({ timeout: 5000 });
        
        // 유효한 JIRA 이슈 키 입력 (대문자)
        const testIssueKey = 'ICT-179';
        console.log(`📌 JIRA 이슈 키 입력: ${testIssueKey}`);
        await jiraInput.fill(testIssueKey);
        
        // 입력값이 대문자로 변환되었는지 확인
        const inputValue = await jiraInput.inputValue();
        console.log(`📌 입력된 값: ${inputValue}`);
        
        if (inputValue !== testIssueKey.toUpperCase()) {
            throw new Error(`입력값이 대문자로 변환되지 않음. 예상: ${testIssueKey.toUpperCase()}, 실제: ${inputValue}`);
        }
        
        // 9. 테스트 결과 설정
        console.log('✅ 테스트 결과 설정...');
        await page.click('input[value="PASS"]');
        
        // 노트 입력
        await page.fill('textarea[label="노트"]', '테스트 노트 - JIRA 이슈 키 입력 테스트');
        
        // 10. 저장 시도 및 에러 확인
        console.log('💾 테스트 결과 저장 시도...');
        
        // 네트워크 응답 모니터링
        const responsePromise = page.waitForResponse(response => 
            response.url().includes('/api/test-executions/') && 
            response.url().includes('/results') &&
            response.request().method() === 'POST'
        );
        
        // 저장 버튼 클릭
        await page.click('button:has-text("저장")');
        
        // 응답 대기
        const response = await responsePromise;
        console.log(`📡 API 응답 상태: ${response.status()}`);
        
        if (response.status() === 500) {
            const responseBody = await response.text();
            console.error('❌ 500 서버 오류 발생:');
            console.error(responseBody);
            throw new Error('JIRA 이슈 키 입력 시 500 에러 발생');
        }
        
        if (!response.ok()) {
            const responseBody = await response.text();
            console.error(`❌ API 요청 실패 (${response.status()}):`, responseBody);
            throw new Error(`API 요청 실패: ${response.status()}`);
        }
        
        console.log('✅ API 요청 성공');
        
        // 11. UI에서 성공 확인
        await page.waitForTimeout(1000);
        
        // 오류 메시지가 표시되지 않았는지 확인
        const errorAlert = page.locator('[role="alert"]');
        if (await errorAlert.count() > 0) {
            const errorText = await errorAlert.textContent();
            if (errorText.includes('500') || errorText.includes('서버 오류')) {
                throw new Error(`UI에 오류 메시지 표시: ${errorText}`);
            }
        }
        
        console.log('✅ JIRA 이슈 키 입력 테스트 성공');
        
        // 12. 다른 JIRA 이슈 키로도 테스트
        console.log('🔄 다른 JIRA 이슈 키로 추가 테스트...');
        
        // 폼이 닫혔다면 다시 열기
        if (await page.locator('text=테스트 결과 입력').count() === 0) {
            await page.click('button:has-text("결과 입력")');
            await page.waitForSelector('text=테스트 결과 입력', { timeout: 5000 });
        }
        
        // 다른 JIRA 이슈 키 테스트
        const testIssueKey2 = 'TEST-123';
        const jiraInput2 = page.locator('input[label*="JIRA"]').first();
        await jiraInput2.fill(testIssueKey2);
        
        // 테스트 결과 설정
        await page.click('input[value="FAIL"]');
        await page.fill('textarea[label="노트"]', '두 번째 JIRA 테스트');
        
        // 저장
        const responsePromise2 = page.waitForResponse(response => 
            response.url().includes('/api/test-executions/') && 
            response.url().includes('/results') &&
            response.request().method() === 'POST'
        );
        
        await page.click('button:has-text("저장")');
        const response2 = await responsePromise2;
        
        if (response2.status() === 500) {
            throw new Error('두 번째 JIRA 이슈 키 입력에서 500 에러 발생');
        }
        
        console.log('✅ 두 번째 JIRA 이슈 키 테스트도 성공');
        
        // 13. 빈 JIRA 이슈 키로 테스트 (에러가 발생하지 않아야 함)
        console.log('🔄 빈 JIRA 이슈 키로 테스트...');
        
        if (await page.locator('text=테스트 결과 입력').count() === 0) {
            await page.click('button:has-text("결과 입력")');
            await page.waitForSelector('text=테스트 결과 입력', { timeout: 5000 });
        }
        
        // JIRA 필드를 비우고 테스트
        const jiraInput3 = page.locator('input[label*="JIRA"]').first();
        await jiraInput3.fill('');
        
        await page.click('input[value="PASS"]');
        await page.fill('textarea[label="노트"]', '빈 JIRA 필드 테스트');
        
        const responsePromise3 = page.waitForResponse(response => 
            response.url().includes('/api/test-executions/') && 
            response.url().includes('/results') &&
            response.request().method() === 'POST'
        );
        
        await page.click('button:has-text("저장")');
        const response3 = await responsePromise3;
        
        if (response3.status() === 500) {
            throw new Error('빈 JIRA 이슈 키에서 500 에러 발생');
        }
        
        console.log('✅ 빈 JIRA 이슈 키 테스트도 성공');
        
        console.log('🎉 모든 JIRA 이슈 입력 테스트 완료! 500 에러가 해결되었습니다.');
        
        return {
            success: true,
            message: 'JIRA 이슈 입력 기능이 정상적으로 작동합니다',
            testCases: [
                { issueKey: testIssueKey, status: 'PASS' },
                { issueKey: testIssueKey2, status: 'PASS' },
                { issueKey: '', status: 'PASS' }
            ]
        };
        
    } catch (error) {
        console.error('❌ 테스트 실패:', error.message);
        
        // 스크린샷 저장
        if (page) {
            try {
                await page.screenshot({ 
                    path: 'jira-issue-input-test-error.png',
                    fullPage: true 
                });
                console.log('📸 오류 스크린샷 저장됨: jira-issue-input-test-error.png');
            } catch (screenshotError) {
                console.error('스크린샷 저장 실패:', screenshotError.message);
            }
        }
        
        return {
            success: false,
            error: error.message
        };
        
    } finally {
        // 정리
        if (browser) {
            await browser.close();
        }
    }
}

// 테스트 실행
if (require.main === module) {
    testJiraIssueInput()
        .then(result => {
            if (result.success) {
                console.log('✅ 테스트 성공:', result.message);
                if (result.testCases) {
                    console.log('📝 테스트된 케이스들:');
                    result.testCases.forEach(testCase => {
                        console.log(`  - ${testCase.issueKey || '(빈 값)'}: ${testCase.status}`);
                    });
                }
                process.exit(0);
            } else {
                console.error('❌ 테스트 실패:', result.error);
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('❌ 테스트 실행 중 오류:', error);
            process.exit(1);
        });
}

module.exports = { testJiraIssueInput };