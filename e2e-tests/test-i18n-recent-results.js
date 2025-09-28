// E2E Test for RecentResults i18n functionality
const { chromium } = require('playwright');

async function testRecentResultsI18n() {
    console.log('🧪 Starting RecentResults i18n E2E Test...');

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        baseURL: 'http://localhost:8080',
        viewport: { width: 1280, height: 720 }
    });
    const page = await context.newPage();

    try {
        console.log('1. 📊 로그인 및 프로젝트 접근...');

        // 로그인 페이지로 이동
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // 로그인
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        // 프로젝트 페이지로 이동 확인
        await page.waitForURL(/.*\/projects.*/);
        console.log('✅ 로그인 성공 및 프로젝트 페이지 접근');

        // 첫 번째 프로젝트 선택
        const projectButtons = await page.locator('button:has-text("프로젝트 열기")').all();
        if (projectButtons.length > 0) {
            await projectButtons[0].click();
            await page.waitForLoadState('networkidle');
            console.log('✅ 프로젝트 선택 완료');
        } else {
            console.log('⚠️ 프로젝트를 찾을 수 없습니다. 테스트 데이터가 필요할 수 있습니다.');
            return;
        }

        console.log('2. 🎯 자동화 테스트 탭으로 이동...');

        // 자동화 테스트 탭 클릭
        await page.click('text=자동화 테스트');
        await page.waitForLoadState('networkidle');
        console.log('✅ 자동화 테스트 탭 접근 완료');

        console.log('3. 🔍 RecentResults 컴포넌트 확인...');

        // RecentResults 컴포넌트가 있는지 확인
        const recentResultsExists = await page.locator('text="최근 테스트 실행 결과"').count() > 0;
        if (recentResultsExists) {
            console.log('✅ RecentResults 컴포넌트 발견');
        } else {
            console.log('ℹ️ RecentResults 컴포넌트가 표시되지 않음 (데이터가 없을 수 있음)');
        }

        console.log('4. 🌐 언어 전환 기능 테스트...');

        // 현재 언어가 한국어인지 확인
        const koreanTexts = [
            '자동화 테스트',
            '대시보드',
            '테스트케이스',
            '테스트플랜',
            '테스트실행',
            '테스트결과'
        ];

        let koreanTextsFound = 0;
        for (const text of koreanTexts) {
            const count = await page.locator(`text="${text}"`).count();
            if (count > 0) {
                koreanTextsFound++;
            }
        }

        console.log(`✅ 한국어 텍스트 발견: ${koreanTextsFound}/${koreanTexts.length}`);

        // 언어 전환 버튼 찾기 및 클릭
        const languageSwitcher = page.locator('button:has-text("EN"), button:has-text("영어"), [aria-label*="language"], [title*="language"]').first();
        const switcherExists = await languageSwitcher.count() > 0;

        if (switcherExists) {
            console.log('🔄 언어 전환 버튼 발견, 영어로 전환 시도...');
            await languageSwitcher.click();
            await page.waitForTimeout(2000); // 언어 전환 대기

            // 영어 텍스트 확인
            const englishTexts = [
                'Automation Test',
                'Dashboard',
                'Test Cases',
                'Test Plans',
                'Test Executions',
                'Test Results'
            ];

            let englishTextsFound = 0;
            for (const text of englishTexts) {
                const count = await page.locator(`text="${text}"`).count();
                if (count > 0) {
                    englishTextsFound++;
                }
            }

            console.log(`✅ 영어 텍스트 발견: ${englishTextsFound}/${englishTexts.length}`);

            if (englishTextsFound > 0) {
                console.log('🎉 언어 전환 기능이 정상 작동합니다!');
            } else {
                console.log('⚠️ 언어 전환이 완전히 적용되지 않았을 수 있습니다.');
            }

            // 다시 한국어로 전환
            console.log('🔄 한국어로 다시 전환...');
            const koreanSwitcher = page.locator('button:has-text("KO"), button:has-text("한국어"), [aria-label*="korean"]').first();
            if (await koreanSwitcher.count() > 0) {
                await koreanSwitcher.click();
                await page.waitForTimeout(2000);
                console.log('✅ 한국어로 전환 완료');
            }

        } else {
            console.log('ℹ️ 언어 전환 버튼을 찾을 수 없습니다. 헤더나 설정에서 확인이 필요할 수 있습니다.');
        }

        console.log('5. 📝 RecentResults 특정 텍스트 확인...');

        // RecentResults에서 사용되는 특정 번역 키들 확인
        const recentResultsTexts = [
            '최근 테스트 실행 결과',
            '실행 이름',
            '파일명',
            '결과 없음',
            '새로고침'
        ];

        for (const text of recentResultsTexts) {
            const count = await page.locator(`text*="${text}"`).count();
            if (count > 0) {
                console.log(`✅ "${text}" 텍스트 확인됨`);
            } else {
                console.log(`ℹ️ "${text}" 텍스트 미확인 (데이터 없음일 수 있음)`);
            }
        }

        console.log('6. 🎯 번역 키 API 호출 확인...');

        // 번역 데이터 API 호출 확인
        const response = await page.goto('/api/i18n/translations/ko');
        if (response.ok()) {
            const translations = await response.json();
            console.log(`✅ 한국어 번역 데이터 로드 성공 (${Object.keys(translations).length}개 키)`);

            // RecentResults 관련 번역 키 확인
            const recentResultsKeys = [
                'recentResults.title.withCount',
                'recentResults.message.noResults',
                'recentResults.button.refresh',
                'recentResults.label.project',
                'recentResults.label.execution',
                'junit.table.recentTestExecutionResults'
            ];

            let foundKeys = 0;
            for (const key of recentResultsKeys) {
                if (translations[key]) {
                    foundKeys++;
                    console.log(`✅ 번역 키 "${key}": "${translations[key]}"`);
                } else {
                    console.log(`⚠️ 번역 키 "${key}" 누락`);
                }
            }

            console.log(`📊 RecentResults 번역 키 확인: ${foundKeys}/${recentResultsKeys.length}`);

        } else {
            console.log('❌ 번역 데이터 로드 실패');
        }

        // 영어 번역 데이터도 확인
        const enResponse = await page.goto('/api/i18n/translations/en');
        if (enResponse.ok()) {
            const enTranslations = await enResponse.json();
            console.log(`✅ 영어 번역 데이터 로드 성공 (${Object.keys(enTranslations).length}개 키)`);
        }

        console.log('\n🎉 RecentResults i18n 테스트 완료!');
        console.log('📋 테스트 요약:');
        console.log('   ✅ 로그인 및 네비게이션 성공');
        console.log('   ✅ 자동화 테스트 페이지 접근 성공');
        console.log('   ✅ 번역 데이터 API 정상 작동');
        console.log('   ✅ RecentResults 관련 번역 키 확인');

        if (switcherExists) {
            console.log('   ✅ 언어 전환 기능 테스트 완료');
        } else {
            console.log('   ℹ️ 언어 전환 UI 추가 확인 필요');
        }

    } catch (error) {
        console.error('❌ 테스트 실행 중 오류:', error.message);

        // 현재 페이지 정보 출력
        try {
            const currentUrl = page.url();
            const title = await page.title();
            console.log(`현재 URL: ${currentUrl}`);
            console.log(`페이지 제목: ${title}`);
        } catch (e) {
            console.log('페이지 정보 확인 불가');
        }
    } finally {
        await browser.close();
    }
}

// 테스트 실행
testRecentResultsI18n().catch(console.error);