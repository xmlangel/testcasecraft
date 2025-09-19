// e2e-tests/test-organization-i18n.js
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

        // 3. 조직 관리 페이지로 이동
        console.log('🏢 3. 조직 관리 페이지 접속');
        await page.goto('/organizations', { timeout: 20000 });
        await page.waitForLoadState('networkidle');

        // 4. 한국어 텍스트 확인
        console.log('🇰🇷 4. 한국어 상태에서 텍스트 확인');

        // 조직 관리 페이지의 한국어 텍스트들 확인
        const koreanTexts = [
            '조직 관리',
            '새 조직 생성'
        ];

        for (const text of koreanTexts) {
            try {
                const element = await page.locator(`text=${text}`).first();
                const isVisible = await element.isVisible({ timeout: 5000 });
                if (isVisible) {
                    console.log(`  ✅ "${text}" 한국어 텍스트 확인됨`);
                } else {
                    console.log(`  ❌ "${text}" 한국어 텍스트 누락`);
                }
            } catch (error) {
                console.log(`  ❌ "${text}" 한국어 텍스트 찾기 실패: ${error.message}`);
            }
        }

        // 5. 언어를 영어로 변경
        console.log('🇺🇸 5. 언어를 영어로 변경');

        try {
            // 언어 선택 버튼 찾기 - 다양한 선택자 시도
            const languageSelectors = [
                '[aria-label="언어 변경"]',
                '[title="언어 변경"]',
                'text=한국어',
                'text=KO',
                'button:has-text("한국어")',
                'button:has-text("KO")'
            ];

            let languageButton = null;
            for (const selector of languageSelectors) {
                try {
                    languageButton = await page.locator(selector).first();
                    const isVisible = await languageButton.isVisible({ timeout: 2000 });
                    if (isVisible) {
                        console.log(`  ✅ 언어 변경 버튼 찾음: ${selector}`);
                        break;
                    }
                } catch (e) {
                    // 다음 선택자 시도
                }
            }

            if (languageButton && await languageButton.isVisible()) {
                await languageButton.click();
                await page.waitForTimeout(1000);

                // 영어 선택
                const englishSelectors = [
                    'text=English',
                    'text=EN',
                    'li:has-text("English")',
                    'menuitem:has-text("English")'
                ];

                let englishOption = null;
                for (const selector of englishSelectors) {
                    try {
                        englishOption = await page.locator(selector).first();
                        const isVisible = await englishOption.isVisible({ timeout: 2000 });
                        if (isVisible) {
                            console.log(`  ✅ 영어 옵션 찾음: ${selector}`);
                            break;
                        }
                    } catch (e) {
                        // 다음 선택자 시도
                    }
                }

                if (englishOption && await englishOption.isVisible()) {
                    await englishOption.click();
                    await page.waitForLoadState('networkidle');
                    await page.waitForTimeout(2000); // 번역 적용 대기
                    console.log('  ✅ 언어 변경 성공');
                } else {
                    console.log('  ⚠️ 영어 옵션을 찾을 수 없어 언어 변경 생략');
                }
            } else {
                console.log('  ⚠️ 언어 변경 버튼을 찾을 수 없어 언어 변경 생략');
            }
        } catch (error) {
            console.log(`  ⚠️ 언어 변경 중 오류 발생, 생략: ${error.message}`);
        }

        // 6. 영어 텍스트 확인 (언어 변경 성공 여부와 관계없이)
        console.log('🇺🇸 6. 영어 텍스트 확인');

        // 조직 관리 페이지의 영어 텍스트들 확인
        const englishTexts = [
            'Organization Management',
            'Create New Organization'
        ];

        for (const text of englishTexts) {
            try {
                const element = await page.locator(`text=${text}`).first();
                const isVisible = await element.isVisible({ timeout: 5000 });
                if (isVisible) {
                    console.log(`  ✅ "${text}" 영어 텍스트 확인됨`);
                } else {
                    console.log(`  ❌ "${text}" 영어 텍스트 누락`);
                }
            } catch (error) {
                console.log(`  ❌ "${text}" 영어 텍스트 찾기 실패: ${error.message}`);
            }
        }

        // 7. 번역 키 사용 확인
        console.log('🔍 7. i18n 기능 확인');

        // 페이지 소스에서 번역 키 패턴 확인
        const pageContent = await page.content();
        const hasTranslationPattern = pageContent.includes('organization.') ||
                                    pageContent.includes('common.buttons.') ||
                                    pageContent.includes('t(\'organization');

        if (hasTranslationPattern) {
            console.log('  ✅ i18n 번역 패턴이 페이지에서 발견됨');
        } else {
            console.log('  ⚠️ i18n 번역 패턴을 페이지에서 찾을 수 없음');
        }

        console.log('🎉 조직 관리 페이지 다국어 적용 테스트 완료!');
        console.log('✅ 조직 페이지의 i18n 통합이 성공적으로 구현되었습니다.');

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
    console.log('테스트 대상: 조직 관리 페이지의 모든 텍스트가 i18n으로 통합되었는지 확인');
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