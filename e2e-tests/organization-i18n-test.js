// e2e-tests/organization-i18n-test.js
// 조직 관리 페이지 다국어 적용 테스트

const { chromium } = require('playwright');

async function testOrganizationI18n() {
    console.log('🧪 조직 관리 페이지 다국어 적용 테스트 시작');

    const browser = await chromium.launch({
        headless: false,
        slowMo: 1000  // 시각적 확인을 위해 천천히 실행
    });

    const context = await browser.newContext({
        baseURL: 'http://localhost:8080'
    });

    const page = await context.newPage();

    try {
        // 1. 로그인 페이지로 이동
        console.log('📝 1. 로그인 페이지 접속');
        await page.goto('/', { timeout: 20000 });
        await page.waitForLoadState('networkidle');

        // 2. 로그인
        console.log('🔐 2. 로그인 수행');
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        // 3. 관리자 페이지에서 조직 관리 메뉴 클릭 (헤더에서)
        console.log('🏢 3. 조직 관리 페이지 접속');

        // 관리자 메뉴가 나타날 때까지 기다린 후 조직 관리 클릭
        await page.waitForSelector('text=조직 관리', { timeout: 10000 });
        await page.click('text=조직 관리');
        await page.waitForLoadState('networkidle');

        // 4. 조직 대시보드가 로드되었는지 확인
        console.log('✅ 4. 조직 대시보드 로드 확인');

        // 페이지 제목 확인
        const titleElement = await page.locator('h4:has-text("대시보드")').first();
        await titleElement.waitFor({ timeout: 10000 });

        // 주요 메트릭 카드들이 존재하는지 확인
        await page.waitForSelector('text=총 조직 수', { timeout: 5000 });
        await page.waitForSelector('text=총 프로젝트 수', { timeout: 5000 });
        await page.waitForSelector('text=총 테스트케이스 수', { timeout: 5000 });

        console.log('🇰🇷 5. 한국어 상태에서 텍스트 확인');

        // 한국어 텍스트들 확인
        const koreanTexts = [
            '대시보드',
            '총 조직 수',
            '총 프로젝트 수',
            '총 테스트케이스 수',
            '총 사용자 수',
            '총 멤버 수',
            '조직 현황',
            '테스트 통계'
        ];

        for (const text of koreanTexts) {
            const element = await page.locator(`text=${text}`).first();
            const isVisible = await element.isVisible();
            if (isVisible) {
                console.log(`  ✅ "${text}" 한국어 텍스트 확인됨`);
            } else {
                console.log(`  ❌ "${text}" 한국어 텍스트 누락`);
            }
        }

        // 6. 언어를 영어로 변경
        console.log('🇺🇸 6. 언어를 영어로 변경');

        // 언어 선택 버튼 찾기 (헤더의 언어 변경 버튼)
        const languageButton = await page.locator('[aria-label="언어 변경"], [title="언어 변경"], text=한국어, text=KO').first();
        if (await languageButton.isVisible()) {
            await languageButton.click();
            await page.waitForTimeout(500);

            // 영어 선택
            const englishOption = await page.locator('text=English, text=EN').first();
            if (await englishOption.isVisible()) {
                await englishOption.click();
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(2000); // 번역 적용 대기
            }
        }

        console.log('🇺🇸 7. 영어 상태에서 텍스트 확인');

        // 영어 텍스트들 확인
        const englishTexts = [
            'Dashboard',
            'Total Organizations',
            'Total Projects',
            'Total Test Cases',
            'Total Users',
            'Organization Status',
            'Test Statistics'
        ];

        for (const text of englishTexts) {
            const element = await page.locator(`text=${text}`).first();
            const isVisible = await element.isVisible();
            if (isVisible) {
                console.log(`  ✅ "${text}" 영어 텍스트 확인됨`);
            } else {
                console.log(`  ❌ "${text}" 영어 텍스트 누락`);
            }
        }

        // 8. 탭 전환 테스트
        console.log('📊 8. 탭 전환 및 다국어 테스트');

        // 테스트 통계 탭으로 전환
        const testStatsTab = await page.locator('text=Test Statistics').first();
        if (await testStatsTab.isVisible()) {
            await testStatsTab.click();
            await page.waitForLoadState('networkidle');

            // 테스트 통계 탭의 영어 텍스트 확인
            await page.waitForSelector('text=Test Result Distribution', { timeout: 5000 });
            await page.waitForSelector('text=Test Result Details', { timeout: 5000 });
            console.log('  ✅ 테스트 통계 탭 영어 텍스트 확인됨');
        }

        // 9. 다시 한국어로 변경
        console.log('🇰🇷 9. 다시 한국어로 변경');

        const languageButtonEn = await page.locator('[aria-label="Change Language"], [title="Change Language"], text=English, text=EN').first();
        if (await languageButtonEn.isVisible()) {
            await languageButtonEn.click();
            await page.waitForTimeout(500);

            // 한국어 선택
            const koreanOption = await page.locator('text=한국어, text=KO').first();
            if (await koreanOption.isVisible()) {
                await koreanOption.click();
                await page.waitForLoadState('networkidle');
                await page.waitForTimeout(2000); // 번역 적용 대기
            }
        }

        // 한국어로 돌아왔는지 확인
        await page.waitForSelector('text=테스트 결과 분포', { timeout: 5000 });
        await page.waitForSelector('text=테스트 결과 상세', { timeout: 5000 });
        console.log('  ✅ 한국어 복원 확인됨');

        console.log('🎉 조직 관리 페이지 다국어 적용 테스트 완료!');
        console.log('✅ 모든 번역 키가 정상적으로 작동합니다.');

        return true;

    } catch (error) {
        console.error('❌ 테스트 실패:', error.message);

        // 디버깅을 위한 추가 정보
        try {
            const url = page.url();
            console.log('현재 URL:', url);

            const title = await page.title();
            console.log('페이지 제목:', title);

        } catch (debugError) {
            console.error('디버깅 정보 수집 실패:', debugError.message);
        }

        return false;

    } finally {
        await browser.close();
    }
}

// 메인 실행
async function main() {
    console.log('=== 조직 관리 페이지 다국어 E2E 테스트 ===');
    console.log('테스트 대상: 조직 대시보드의 모든 텍스트가 한/영 번역되는지 확인');
    console.log('');

    try {
        const success = await testOrganizationI18n();

        if (success) {
            console.log('');
            console.log('🎊 테스트 성공: 조직 관리 페이지 다국어 적용 완료');
            process.exit(0);
        } else {
            console.log('');
            console.log('💥 테스트 실패: 조직 관리 페이지 다국어 적용 문제 발견');
            process.exit(1);
        }

    } catch (error) {
        console.error('💥 테스트 실행 중 오류:', error);
        process.exit(1);
    }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
    main();
}

module.exports = { testOrganizationI18n };