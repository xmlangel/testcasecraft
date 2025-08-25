const { chromium } = require('playwright');

async function testICT287OrganizationProjects() {
    const browser = await chromium.launch({
        headless: false,
        slowMo: 1000
    });

    const context = await browser.newContext({
        baseURL: 'http://localhost:8080'
    });
    const page = await context.newPage();

    try {
        console.log('🎯 ICT-287: 조직별 프로젝트 리스트 권한 문제 E2E 테스트 시작');

        // 1. 로그인 페이지로 이동
        console.log('\n1️⃣ 로그인 페이지 접속...');
        await page.goto('/', { timeout: 20000 });
        await page.waitForLoadState('networkidle');
        
        // 2. tester 계정으로 로그인
        console.log('\n2️⃣ tester 계정으로 로그인...');
        await page.fill('input[name="username"]', 'tester');
        await page.fill('input[name="password"]', 'tester');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        
        // 로그인 성공 확인
        const currentUrl = page.url();
        console.log(`   현재 URL: ${currentUrl}`);
        
        // 3. 프로젝트 선택 페이지로 이동
        console.log('\n3️⃣ 프로젝트 선택 페이지로 이동...');
        if (!currentUrl.includes('/projects')) {
            // 대시보드에서 프로젝트 링크 클릭
            await page.locator('text=프로젝트').first().click();
            await page.waitForLoadState('networkidle');
        }
        
        // 4. 프로젝트 페이지에서 탭 확인
        console.log('\n4️⃣ 프로젝트 탭 확인...');
        
        // 전체 프로젝트 탭 클릭
        console.log('\n   📋 전체 프로젝트 탭 확인:');
        const allProjectsTab = page.locator('text=전체 프로젝트');
        if (await allProjectsTab.count() > 0) {
            await allProjectsTab.click();
            await page.waitForLoadState('networkidle');
            
            const allProjectCards = await page.locator('[data-testid="project-card"], .project-card, .MuiCard-root').count();
            console.log(`   전체 프로젝트 개수: ${allProjectCards}개`);
            
            // 프로젝트 이름들 출력
            const projectTitles = await page.locator('[data-testid="project-title"], .project-title, h6, h5').allTextContents();
            console.log(`   전체 프로젝트 목록: ${projectTitles.filter(title => title.trim().length > 0).join(', ')}`);
        }
        
        // 조직별 프로젝트 탭 클릭
        console.log('\n   🏢 조직별 프로젝트 탭 확인:');
        const orgProjectsTab = page.locator('text=조직별 프로젝트');
        if (await orgProjectsTab.count() > 0) {
            await orgProjectsTab.click();
            await page.waitForLoadState('networkidle');
            
            const orgProjectCards = await page.locator('[data-testid="project-card"], .project-card, .MuiCard-root').count();
            console.log(`   조직별 프로젝트 개수: ${orgProjectCards}개`);
            
            // 조직별 프로젝트 이름들 출력
            const orgProjectTitles = await page.locator('[data-testid="project-title"], .project-title, h6, h5').allTextContents();
            console.log(`   조직별 프로젝트 목록: ${orgProjectTitles.filter(title => title.trim().length > 0).join(', ')}`);
            
            // 조직 정보가 있는지 확인
            const organizationLabels = await page.locator('text=QA팀, text=개발팀, text=데브옵스팀').count();
            console.log(`   조직 라벨 수: ${organizationLabels}개`);
        } else {
            console.log('   ❌ 조직별 프로젝트 탭을 찾을 수 없습니다.');
        }
        
        // 독립 프로젝트 탭 클릭 (있는 경우)
        console.log('\n   📦 독립 프로젝트 탭 확인:');
        const independentTab = page.locator('text=독립 프로젝트');
        if (await independentTab.count() > 0) {
            await independentTab.click();
            await page.waitForLoadState('networkidle');
            
            const independentCards = await page.locator('[data-testid="project-card"], .project-card, .MuiCard-root').count();
            console.log(`   독립 프로젝트 개수: ${independentCards}개`);
            
            const independentTitles = await page.locator('[data-testid="project-title"], .project-title, h6, h5').allTextContents();
            console.log(`   독립 프로젝트 목록: ${independentTitles.filter(title => title.trim().length > 0).join(', ')}`);
        }
        
        // 5. API 응답 직접 확인 (네트워크 모니터링)
        console.log('\n5️⃣ API 응답 직접 확인...');
        const apiResponse = await page.evaluate(async () => {
            const response = await fetch('/api/projects', {
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('accessToken')
                }
            });
            return await response.json();
        });
        
        console.log(`   API에서 반환된 프로젝트 수: ${apiResponse.length}개`);
        apiResponse.forEach((project, index) => {
            console.log(`   ${index + 1}. ${project.name} (${project.code}) - 조직: ${project.organization?.name || 'null'}`);
        });
        
        // 6. 결과 평가
        console.log('\n6️⃣ 테스트 결과 평가:');
        const hasOrganizationProjects = apiResponse.some(p => p.organization && p.organization.name);
        const organizationProjectCount = apiResponse.filter(p => p.organization && p.organization.name).length;
        
        if (hasOrganizationProjects && organizationProjectCount > 0) {
            console.log(`   ✅ 성공: tester 사용자가 ${organizationProjectCount}개의 조직별 프로젝트에 접근할 수 있습니다.`);
            console.log('   🎯 ICT-287 문제 해결됨!');
        } else {
            console.log(`   ❌ 실패: 조직별 프로젝트가 여전히 보이지 않습니다.`);
            console.log('   🔍 추가 디버깅 필요');
        }
        
        // 스크린샷 저장
        await page.screenshot({ 
            path: 'e2e-tests/test-screenshots/ict-287-organization-projects.png',
            fullPage: true 
        });
        console.log('   📸 스크린샷 저장됨: ict-287-organization-projects.png');

    } catch (error) {
        console.error('❌ E2E 테스트 실패:', error.message);
        
        // 오류 시에도 스크린샷 저장
        try {
            await page.screenshot({ 
                path: 'e2e-tests/test-screenshots/ict-287-error.png',
                fullPage: true 
            });
            console.log('   📸 오류 스크린샷 저장됨: ict-287-error.png');
        } catch (screenshotError) {
            console.error('스크린샷 저장 실패:', screenshotError.message);
        }
        
        throw error;
    } finally {
        await browser.close();
    }
}

// 테스트 실행
testICT287OrganizationProjects()
    .then(() => {
        console.log('\n🎉 ICT-287 E2E 테스트 완료!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 테스트 실행 중 오류 발생:', error);
        process.exit(1);
    });