// ICT-331: 조직 관리에서 그룹 기능 제거 E2E 테스트
const { chromium } = require('playwright');

async function testGroupRemoval() {
    console.log('🧪 ICT-331: 조직 관리 그룹 기능 제거 테스트 시작');

    let browser, context, page;

    try {
        // 브라우저 시작
        browser = await chromium.launch({ headless: false, slowMo: 1000 });
        context = await browser.newContext({
            baseURL: 'http://localhost:8080'
        });
        page = await context.newPage();

        console.log('📝 1단계: 로그인');
        await page.goto('/', { timeout: 20000 });
        await page.waitForLoadState('networkidle');
        
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        console.log('📝 2단계: 조직 관리 페이지로 이동');
        await page.locator('text=조직 관리').first().click();
        await page.waitForLoadState('networkidle');
        console.log('✅ 조직 관리 페이지 접근 완료');

        console.log('📝 3단계: 조직 상세 페이지로 이동');
        // 조직이 있다면 첫 번째 조직의 "조직 보기" 버튼 클릭
        const detailButtons = await page.locator('button:has-text("조직 보기")').count();
        if (detailButtons > 0) {
            // "조직 보기" 버튼 클릭하여 상세 페이지로 이동
            await page.locator('button:has-text("조직 보기")').first().click();
            await page.waitForLoadState('networkidle');
            console.log('✅ 조직 상세 페이지 접근 완료');
            
            // URL 확인
            const currentUrl = page.url();
            console.log('현재 URL:', currentUrl);
            
            if (!currentUrl.includes('/organizations/')) {
                console.log('⚠️ 조직 상세 페이지로 이동하지 못했습니다');
                return false;
            }

            console.log('📝 4단계: 그룹 관련 요소 제거 확인');
            
            // 페이지가 완전히 로드될 때까지 대기
            await page.waitForTimeout(3000);
            
            // 4-1: 그룹 탭이 제거되었는지 확인
            const tabsCount = await page.locator('.MuiTab-root').count();
            console.log(`탭 개수: ${tabsCount}`);
            
            if (tabsCount > 0) {
                const tabs = await page.locator('.MuiTab-root').allTextContents();
                console.log('탭 목록:', tabs);
                
                if (!tabs.includes('그룹')) {
                    console.log('✅ 그룹 탭이 제거되었습니다');
                } else {
                    console.log('❌ 그룹 탭이 아직 존재합니다');
                    return false;
                }
            } else {
                console.log('⚠️ 탭이 아직 로드되지 않았습니다. 다시 확인합니다.');
                await page.waitForTimeout(2000);
                
                const retryTabsCount = await page.locator('.MuiTab-root').count();
                if (retryTabsCount > 0) {
                    const tabs = await page.locator('.MuiTab-root').allTextContents();
                    console.log('재시도 탭 목록:', tabs);
                    
                    if (!tabs.includes('그룹')) {
                        console.log('✅ 그룹 탭이 제거되었습니다');
                    } else {
                        console.log('❌ 그룹 탭이 아직 존재합니다');
                        return false;
                    }
                } else {
                    console.log('❌ 탭을 찾을 수 없습니다. 페이지 구조를 확인해주세요.');
                }
            }

            // 4-2: 통계 카드에서 그룹 카드가 제거되었는지 확인
            const statisticsCards = await page.locator('.MuiGrid-item').count();
            console.log(`통계 카드 개수: ${statisticsCards}`);
            
            // 그룹 통계 카드 내용 확인
            const cardTexts = await page.locator('.MuiCardContent-root').allTextContents();
            console.log('카드 내용들:', cardTexts);
            
            const hasGroupCard = cardTexts.some(text => text.includes('그룹'));
            if (!hasGroupCard) {
                console.log('✅ 그룹 통계 카드가 제거되었습니다');
            } else {
                console.log('❌ 그룹 통계 카드가 아직 존재합니다');
                return false;
            }

            console.log('📝 5단계: 탭 기능 확인');
            // 멤버 탭 클릭 확인
            const memberTabCount = await page.locator('text=멤버').count();
            if (memberTabCount > 0) {
                await page.locator('text=멤버').first().click();
                await page.waitForTimeout(1000);
                console.log('✅ 멤버 탭 정상 동작');

                // 프로젝트 탭 클릭 확인
                const projectTabCount = await page.locator('text=프로젝트').count();
                if (projectTabCount > 0) {
                    await page.locator('text=프로젝트').first().click();
                    await page.waitForTimeout(1000);
                    console.log('✅ 프로젝트 탭 정상 동작');
                } else {
                    console.log('⚠️ 프로젝트 탭을 찾을 수 없습니다');
                }
            } else {
                console.log('⚠️ 멤버 탭을 찾을 수 없습니다');
            }

            console.log('📝 6단계: 조직 수정 기능 확인');
            const editButton = await page.locator('button:has-text("조직 수정")').count();
            if (editButton > 0) {
                console.log('✅ 조직 수정 버튼이 존재합니다');
                await page.locator('button:has-text("조직 수정")').first().click();
                await page.waitForTimeout(1000);
                
                // 다이얼로그가 나타나는지 확인
                const dialog = await page.locator('[role="dialog"]').count();
                if (dialog > 0) {
                    console.log('✅ 조직 수정 다이얼로그가 정상적으로 표시됩니다');
                    // 다이얼로그 닫기
                    await page.locator('button:has-text("취소")').first().click();
                    await page.waitForTimeout(1000);
                } else {
                    console.log('⚠️ 조직 수정 다이얼로그가 표시되지 않습니다');
                }
            }

            console.log('🎉 ICT-331: 그룹 기능 제거 테스트 완료!');
            return true;
        } else {
            console.log('⚠️ 조직이 없어서 상세 테스트를 진행할 수 없습니다');
            return false;
        }

    } catch (error) {
        console.error('❌ 테스트 중 오류 발생:', error);
        return false;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// 테스트 실행
testGroupRemoval().then(success => {
    if (success) {
        console.log('✅ ICT-331 그룹 제거 E2E 테스트 성공');
    } else {
        console.log('❌ ICT-331 그룹 제거 E2E 테스트 실패');
    }
    process.exit(success ? 0 : 1);
});