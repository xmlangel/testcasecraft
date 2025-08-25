// e2e-tests/ict-286-invalid-date-fix-test.js
// ICT-286: 프론트엔드 날짜 표시 Invalid Date 문제 해결 검증 테스트

const { chromium } = require('playwright');

async function runICT286Test() {
    console.log('=== ICT-286: Invalid Date 문제 해결 검증 테스트 시작 ===');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000  // 천천히 실행하여 날짜 확인 가능
    });
    
    try {
        const context = await browser.newContext({
            baseURL: 'http://localhost:8080'
        });
        
        const page = await context.newPage();
        
        // 1. 로그인
        console.log('1️⃣ 로그인 진행');
        await page.goto('/', { timeout: 20000 });
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        
        console.log('✅ 로그인 성공');
        
        // 2. 조직 관리에서 가입일 확인
        console.log('2️⃣ 조직 관리 가입일 확인');
        await page.goto('/organizations', { timeout: 10000 });
        await page.waitForLoadState('networkidle');
        
        // 첫 번째 조직 상세로 이동
        const organizationCards = await page.locator('button:has-text("상세보기")').first();
        if (await organizationCards.count() > 0) {
            await organizationCards.click();
            await page.waitForLoadState('networkidle');
            
            // 멤버 탭에서 가입일 확인
            const memberTab = page.locator('text=멤버');
            if (await memberTab.count() > 0) {
                await memberTab.click();
                await page.waitForTimeout(2000);
                
                // "가입일" 컬럼이 있는 테이블 확인
                const joinDateCells = await page.locator('table tbody tr td:nth-child(3)').allTextContents();
                for (const dateText of joinDateCells) {
                    if (dateText.includes('Invalid Date')) {
                        throw new Error(`❌ 조직 관리 가입일에서 Invalid Date 발견: ${dateText}`);
                    }
                    console.log(`✅ 조직 멤버 가입일 정상: ${dateText}`);
                }
            }
        }
        
        // 3. 프로젝트 테스트플랜 생성일 확인
        console.log('3️⃣ 프로젝트 테스트플랜 생성일 확인');
        await page.goto('/projects', { timeout: 10000 });
        await page.waitForLoadState('networkidle');
        
        // 첫 번째 프로젝트 열기
        const projectButtons = await page.locator('button:has-text("프로젝트 열기")');
        if (await projectButtons.count() > 0) {
            await projectButtons.first().click();
            await page.waitForLoadState('networkidle');
            
            // 테스트플랜 탭으로 이동
            const testPlanTab = page.locator('text=테스트플랜');
            if (await testPlanTab.count() > 0) {
                await testPlanTab.first().click();
                await page.waitForTimeout(2000);
                
                // "생성일" 컬럼 확인
                const createDateCells = await page.locator('table tbody tr td:nth-child(4)').allTextContents();
                for (const dateText of createDateCells) {
                    if (dateText.includes('Invalid Date')) {
                        throw new Error(`❌ 테스트플랜 생성일에서 Invalid Date 발견: ${dateText}`);
                    }
                    console.log(`✅ 테스트플랜 생성일 정상: ${dateText}`);
                }
            }
            
            // 4. 테스트 실행 시작일/종료일 확인
            console.log('4️⃣ 테스트 실행 시작일/종료일 확인');
            const testExecutionTab = page.locator('text=테스트실행');
            if (await testExecutionTab.count() > 0) {
                await testExecutionTab.first().click();
                await page.waitForTimeout(2000);
                
                // 실행 정보가 있는지 확인
                const executionInfo = await page.locator('text=실행 정보').count();
                if (executionInfo > 0) {
                    // 시작일시, 종료일시 텍스트에서 Invalid Date 확인
                    const infoText = await page.locator('text=시작일시').textContent();
                    const endTimeText = await page.locator('text=종료일시').textContent();
                    
                    if (infoText && infoText.includes('Invalid Date')) {
                        throw new Error(`❌ 테스트 실행 시작일시에서 Invalid Date 발견: ${infoText}`);
                    }
                    if (endTimeText && endTimeText.includes('Invalid Date')) {
                        throw new Error(`❌ 테스트 실행 종료일시에서 Invalid Date 발견: ${endTimeText}`);
                    }
                    console.log('✅ 테스트 실행 시작일/종료일 정상');
                }
            }
        }
        
        console.log('🎉 ICT-286: 모든 날짜 표시 문제 해결 검증 완료!');
        
        // 스크린샷 저장
        await page.screenshot({ 
            path: `e2e-tests/test-screenshots/ict-286-date-fix-success-${Date.now()}.png`,
            fullPage: true 
        });
        
    } catch (error) {
        console.error('❌ ICT-286 테스트 실패:', error);
        
        // 실패 시 스크린샷 저장
        try {
            await page.screenshot({ 
                path: `e2e-tests/test-screenshots/ict-286-date-fix-error-${Date.now()}.png`,
                fullPage: true 
            });
        } catch (screenshotError) {
            console.error('스크린샷 저장 실패:', screenshotError);
        }
        
        throw error;
    } finally {
        await browser.close();
    }
}

// 테스트 실행
if (require.main === module) {
    runICT286Test()
        .then(() => {
            console.log('🎯 ICT-286 테스트 완료: Invalid Date 문제가 성공적으로 해결되었습니다!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 ICT-286 테스트 실패:', error.message);
            process.exit(1);
        });
}