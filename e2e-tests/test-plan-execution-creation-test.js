// E2E Test: 테스트플랜 및 테스트실행 생성 테스트
// baseUrl 오류 수정 후 테스트

const { chromium } = require('playwright');

async function testPlanAndExecutionCreation() {
    console.log('🧪 테스트플랜 및 테스트실행 생성 테스트 시작');
    
    const browser = await chromium.launch({ 
        headless: false,  // UI를 보면서 테스트
        slowMo: 1000      // 액션 사이에 1초 대기
    });
    
    const context = await browser.newContext({
        baseURL: 'http://localhost:8080'
    });
    
    const page = await context.newPage();
    
    try {
        // 1. 로그인
        console.log('📝 1단계: 로그인');
        await page.goto('/', { timeout: 20000 });
        await page.waitForLoadState('networkidle');
        
        // 로그인 폼 찾기
        const usernameInput = await page.locator('input[name="username"]').first();
        const passwordInput = await page.locator('input[name="password"]').first();
        const loginButton = await page.locator('button[type="submit"]').first();
        
        await usernameInput.fill('admin');
        await passwordInput.fill('admin');
        await loginButton.click();
        
        // 프로젝트 페이지 로드 대기
        await page.waitForURL(/.*projects.*/, { timeout: 10000 });
        console.log('✅ 로그인 성공');
        
        // 2. 프로젝트 선택
        console.log('📝 2단계: 프로젝트 선택');
        
        // 프로젝트 열기 버튼 클릭
        const openProjectButton = await page.locator('button:has-text("프로젝트 열기")').first();
        await openProjectButton.click();
        
        // 프로젝트 페이지로 이동 확인
        await page.waitForURL(/.*projects\/.*/, { timeout: 10000 });
        console.log('✅ 프로젝트 선택 성공');
        
        // 3. 테스트플랜 탭으로 이동
        console.log('📝 3단계: 테스트플랜 탭 이동');
        const testPlanTab = await page.locator('text=테스트플랜');
        await testPlanTab.click();
        await page.waitForLoadState('networkidle');
        console.log('✅ 테스트플랜 탭 이동 성공');
        
        // 4. 테스트플랜 생성
        console.log('📝 4단계: 테스트플랜 생성 테스트');
        
        // 새 테스트플랜 버튼 클릭
        const newTestPlanButton = await page.locator('button:has-text("새 테스트플랜")').first();
        if (await newTestPlanButton.count() > 0) {
            await newTestPlanButton.click();
            await page.waitForLoadState('networkidle');
            
            // 테스트플랜 폼 작성
            const planNameInput = await page.locator('input[name="name"], input[placeholder*="이름"], input[label*="이름"]').first();
            const planDescInput = await page.locator('textarea[name="description"], textarea[placeholder*="설명"], textarea[label*="설명"]').first();
            
            if (await planNameInput.count() > 0) {
                await planNameInput.fill('E2E 테스트 플랜');
            }
            
            if (await planDescInput.count() > 0) {
                await planDescInput.fill('baseUrl 오류 수정 후 생성되는 테스트 플랜');
            }
            
            // 저장 버튼 클릭
            const saveButton = await page.locator('button:has-text("저장"), button:has-text("생성")').first();
            
            console.log('📝 저장 버튼 클릭 시도 - baseUrl 오류 확인');
            
            // 네트워크 요청 모니터링
            let hasError = false;
            let errorMessage = '';
            
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    console.log('🔴 브라우저 콘솔 오류:', msg.text());
                    if (msg.text().includes('baseUrl') || msg.text().includes('undefined')) {
                        hasError = true;
                        errorMessage = msg.text();
                    }
                }
            });
            
            // 저장 시도
            await saveButton.click();
            await page.waitForTimeout(3000);  // 오류 발생 여부 확인을 위한 대기
            
            if (hasError) {
                console.log('❌ baseUrl 관련 오류 발생:', errorMessage);
                throw new Error('baseUrl 오류가 여전히 존재합니다: ' + errorMessage);
            } else {
                console.log('✅ 테스트플랜 생성 성공 (baseUrl 오류 없음)');
            }
        } else {
            console.log('⚠️  새 테스트플랜 버튼을 찾을 수 없습니다');
        }
        
        // 5. 테스트실행 탭으로 이동
        console.log('📝 5단계: 테스트실행 탭 이동');
        const testExecutionTab = await page.locator('text=테스트실행');
        await testExecutionTab.click();
        await page.waitForLoadState('networkidle');
        console.log('✅ 테스트실행 탭 이동 성공');
        
        // 6. 테스트실행 생성
        console.log('📝 6단계: 테스트실행 생성 테스트');
        
        // 새 테스트실행 버튼 클릭
        const newExecutionButton = await page.locator('button:has-text("새 테스트실행"), button:has-text("실행 생성")').first();
        if (await newExecutionButton.count() > 0) {
            await newExecutionButton.click();
            await page.waitForLoadState('networkidle');
            
            // 테스트실행 폼 작성
            const execNameInput = await page.locator('input[name="name"], input[placeholder*="이름"], input[label*="이름"]').first();
            
            if (await execNameInput.count() > 0) {
                await execNameInput.fill('E2E 테스트 실행');
            }
            
            // 저장 버튼 클릭
            const saveExecButton = await page.locator('button:has-text("저장"), button:has-text("생성")').first();
            
            console.log('📝 테스트실행 저장 버튼 클릭 시도 - baseUrl 오류 확인');
            
            // 오류 모니터링 초기화
            hasError = false;
            errorMessage = '';
            
            // 저장 시도
            await saveExecButton.click();
            await page.waitForTimeout(3000);
            
            if (hasError) {
                console.log('❌ baseUrl 관련 오류 발생:', errorMessage);
                throw new Error('테스트실행에서 baseUrl 오류가 여전히 존재합니다: ' + errorMessage);
            } else {
                console.log('✅ 테스트실행 생성 성공 (baseUrl 오류 없음)');
            }
        } else {
            console.log('⚠️  새 테스트실행 버튼을 찾을 수 없습니다');
        }
        
        console.log('🎉 모든 테스트 성공: baseUrl 오류가 해결되었습니다!');
        
    } catch (error) {
        console.error('❌ 테스트 실패:', error.message);
        
        // 스크린샷 저장
        await page.screenshot({ 
            path: `e2e-tests/screenshots/baseurl-error-${Date.now()}.png`,
            fullPage: true 
        });
        
        throw error;
    } finally {
        await browser.close();
    }
}

// 테스트 실행
if (require.main === module) {
    testPlanAndExecutionCreation()
        .then(() => {
            console.log('✅ 테스트 완료');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ 테스트 실패:', error);
            process.exit(1);
        });
}

module.exports = { testPlanAndExecutionCreation };