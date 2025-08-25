const { chromium } = require('playwright');

async function runICT288Test() {
    console.log('🎯 ICT-288: 프론트엔드 조직별 프로젝트 탭 표시 문제 해결 검증 테스트');
    
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        baseURL: 'http://localhost:8080'
    });
    const page = await context.newPage();
    
    try {
        // 1단계: 로그인
        console.log('\n1️⃣ 로그인 페이지 접속...');
        await page.goto('/', { timeout: 20000 });
        await page.waitForLoadState('networkidle');
        
        console.log('2️⃣ tester 계정으로 로그인...');
        await page.fill('input[name="username"]', 'tester');
        await page.fill('input[name="password"]', 'tester');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        console.log(`   현재 URL: ${page.url()}`);
        
        // 2단계: 프로젝트 선택 페이지로 이동
        console.log('\n3️⃣ 프로젝트 선택 페이지로 이동...');
        await page.locator('text=프로젝트').first().click();
        await page.waitForLoadState('networkidle');
        
        // 3단계: API 응답 직접 확인 (ICT-287에서 해결된 부분)
        console.log('\n4️⃣ API 응답 직접 확인...');
        const apiResponse = await page.evaluate(async () => {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/projects', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return await response.json();
        });
        
        console.log(`   API에서 반환된 프로젝트 수: ${apiResponse.length}개`);
        apiResponse.forEach((project, index) => {
            const orgName = project.organization?.name || 'null';
            console.log(`   ${index + 1}. ${project.name} (${project.code}) - 조직: ${orgName}`);
        });
        
        // 조직별 프로젝트 필터링 테스트
        const orgProjects = apiResponse.filter(p => p.organization);
        console.log(`   조직별 프로젝트: ${orgProjects.length}개`);
        
        // 4단계: 프론트엔드 탭 확인 (ICT-288 수정사항 검증)
        console.log('\n5️⃣ 프론트엔드 조직별 프로젝트 탭 검증...');
        
        // 조직별 프로젝트 탭 클릭
        await page.locator('text=조직별 프로젝트').first().click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000); // 렌더링 대기
        
        // ICT-288 핵심 검증: "소속 조직이 없습니다" 메시지 확인
        const noOrgMessage = await page.locator('text=소속 조직이 없습니다').count();
        const noOrgProjectsMessage = await page.locator('text=조직별 프로젝트가 없습니다').count();
        const orgNames = await page.locator('[data-testid="organization-name"], h5:has-text("QA")').count();
        const projectCards = await page.locator('[data-testid="project-card"], .MuiCard-root').count();
        
        console.log('\n📊 조직별 프로젝트 탭 분석:');
        console.log(`   "소속 조직이 없습니다" 메시지: ${noOrgMessage}개`);
        console.log(`   "조직별 프로젝트가 없습니다" 메시지: ${noOrgProjectsMessage}개`);
        console.log(`   조직명 표시: ${orgNames}개`);
        console.log(`   프로젝트 카드: ${projectCards}개`);
        
        // 페이지 텍스트 전체 확인
        const pageText = await page.textContent('body');
        const hasQATeam = pageText.includes('QA팀');
        const hasMobileTest = pageText.includes('MOBILE-TEST') || pageText.includes('모바일 앱 테스트');
        const hasWebTest = pageText.includes('WEB-TEST') || pageText.includes('웹 사이트 테스트');
        
        console.log(`   QA팀 조직명 표시: ${hasQATeam ? '✅' : '❌'}`);
        console.log(`   MOBILE-TEST 프로젝트: ${hasMobileTest ? '✅' : '❌'}`);
        console.log(`   WEB-TEST 프로젝트: ${hasWebTest ? '✅' : '❌'}`);
        
        // 5단계: ICT-288 문제 해결 검증
        console.log('\n6️⃣ ICT-288 문제 해결 검증:');
        
        let testResult = '';
        let isFixed = false;
        
        if (orgProjects.length > 0) {
            // 백엔드에서 조직별 프로젝트를 반환하는 경우
            if (noOrgMessage === 0 && (hasQATeam || orgNames > 0)) {
                testResult = '✅ 성공: ICT-288 문제가 해결되었습니다! 조직별 프로젝트가 올바르게 표시됩니다.';
                isFixed = true;
            } else if (noOrgMessage > 0) {
                testResult = '❌ 실패: "소속 조직이 없습니다" 메시지가 여전히 표시됩니다. (ICT-288 미해결)';
            } else if (noOrgProjectsMessage > 0) {
                testResult = '⚠️ 부분 해결: 조직은 인식되지만 프로젝트가 표시되지 않습니다.';
            } else {
                testResult = '🔍 확인 필요: 명확한 상태를 파악할 수 없습니다.';
            }
        } else {
            testResult = 'ℹ️ 정보: 백엔드에서 조직별 프로젝트를 반환하지 않습니다. (ICT-287 관련)';
        }
        
        console.log(`   ${testResult}`);
        
        // 6단계: 스크린샷 저장
        console.log('\n7️⃣ 검증 스크린샷 저장...');
        const screenshotPath = `./test-screenshots/ict-288-organization-tab-${Date.now()}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`   📸 스크린샷 저장됨: ${screenshotPath}`);
        
        // 7단계: 테스트 결과 요약
        console.log('\n🎯 ICT-288 테스트 결과 요약:');
        console.log(`   백엔드 조직별 프로젝트: ${orgProjects.length}개`);
        console.log(`   프론트엔드 "소속 조직 없음" 메시지: ${noOrgMessage > 0 ? '표시됨 ❌' : '표시 안됨 ✅'}`);
        console.log(`   조직별 프로젝트 표시 상태: ${isFixed ? '정상 ✅' : '문제 있음 ❌'}`);
        console.log(`   ICT-288 해결 여부: ${isFixed ? '해결됨 🎉' : '미해결 🔧'}`);
        
        if (isFixed) {
            console.log('\n🎉 ICT-288 프론트엔드 조직별 프로젝트 탭 표시 문제가 성공적으로 해결되었습니다!');
        } else {
            console.log('\n🔧 추가 수정이 필요합니다.');
        }
        
        return {
            success: isFixed,
            orgProjectsFromAPI: orgProjects.length,
            noOrgMessageCount: noOrgMessage,
            hasQATeam,
            hasMobileTest,
            hasWebTest
        };
        
    } catch (error) {
        console.error('❌ 테스트 실행 중 오류 발생:', error.message);
        await page.screenshot({ path: `./test-screenshots/ict-288-error-${Date.now()}.png` });
        return { success: false, error: error.message };
    } finally {
        await browser.close();
    }
}

// 테스트 실행
runICT288Test().then(result => {
    console.log('\n📊 최종 결과:', result);
    process.exit(result.success ? 0 : 1);
}).catch(error => {
    console.error('테스트 실패:', error);
    process.exit(1);
});