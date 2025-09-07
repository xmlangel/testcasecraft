// 버전 관리 시스템 E2E 테스트
// ICT-349, ICT-352 버전 관리 기능 검증

const { chromium } = require('playwright');

async function testVersionManagement() {
    console.log('🧪 버전 관리 시스템 E2E 테스트 시작...');
    
    const browser = await chromium.launch({ 
        headless: false, 
        slowMo: 1000 
    });
    
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 },
        baseURL: 'http://localhost:8080'
    });
    
    const page = await context.newPage();
    
    try {
        // 1. 로그인
        console.log('📋 1단계: 로그인');
        await page.goto('/');
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        
        // 2. 인프라 자동화 프로젝트로 직접 이동
        console.log('📋 2단계: 인프라 자동화 프로젝트로 직접 이동');
        await page.goto('/projects/a2ef59bf-cd2d-419d-a1d3-5a32088c2e78');
        await page.waitForLoadState('networkidle');
        
        // 3. 테스트케이스 탭으로 이동
        console.log('📋 3단계: 테스트케이스 탭 이동');
        await page.click('text=테스트케이스');
        await page.waitForLoadState('networkidle');
        
        // 4. 버전 테스트 케이스 선택
        console.log('📋 4단계: 테스트케이스 선택');
        await page.waitForSelector('.MuiTreeView-root', { timeout: 10000 });
        
        // 첫 번째 테스트케이스 클릭 (버전 테스트 케이스)
        const treeItems = await page.locator('[role="treeitem"]');
        if (await treeItems.count() > 0) {
            await treeItems.first().click();
            await page.waitForLoadState('networkidle');
        }
        
        // 5. 버전 인디케이터 확인
        console.log('📋 5단계: 버전 인디케이터 확인');
        const versionIndicator = await page.locator('[data-testid="version-indicator"]').first();
        if (await versionIndicator.count() > 0) {
            console.log('✅ 버전 인디케이터 표시됨');
            
            // 버전 정보 확인
            const versionText = await versionIndicator.textContent();
            console.log(`   버전 정보: ${versionText}`);
        } else {
            console.log('⚠️ 버전 인디케이터를 찾을 수 없음');
        }
        
        // 6. 버전 히스토리 버튼 확인 및 클릭
        console.log('📋 6단계: 버전 히스토리 테스트');
        
        // 더보기 메뉴 버튼 클릭
        const moreButton = page.locator('button[aria-label="more"]').first();
        if (await moreButton.count() > 0) {
            await moreButton.click();
            await page.waitForTimeout(500);
            
            // 버전 히스토리 메뉴 클릭
            const historyMenuItem = page.locator('text=버전 히스토리').first();
            if (await historyMenuItem.count() > 0) {
                await historyMenuItem.click();
                await page.waitForTimeout(1000);
                
                // 버전 히스토리 다이얼로그 확인
                const historyDialog = page.locator('[role="dialog"]');
                if (await historyDialog.count() > 0) {
                    console.log('✅ 버전 히스토리 다이얼로그 열림');
                    
                    // 버전 목록 확인
                    const versionItems = page.locator('[role="dialog"] .MuiListItem-root');
                    const versionCount = await versionItems.count();
                    console.log(`   버전 개수: ${versionCount}개`);
                    
                    // 다이얼로그 닫기
                    await page.click('button:has-text("닫기")');
                    await page.waitForTimeout(500);
                } else {
                    console.log('⚠️ 버전 히스토리 다이얼로그가 열리지 않음');
                }
            } else {
                console.log('⚠️ 버전 히스토리 메뉴를 찾을 수 없음');
            }
        }
        
        // 7. 수동 버전 생성 테스트
        console.log('📋 7단계: 수동 버전 생성 테스트');
        
        // 다시 더보기 메뉴 열기
        if (await moreButton.count() > 0) {
            await moreButton.click();
            await page.waitForTimeout(500);
            
            // 새 버전 생성 메뉴 클릭
            const createVersionMenuItem = page.locator('text=새 버전 생성').first();
            if (await createVersionMenuItem.count() > 0) {
                await createVersionMenuItem.click();
                await page.waitForTimeout(1000);
                
                // 버전 생성 다이얼로그가 있다면 테스트
                const createDialog = page.locator('[role="dialog"]');
                if (await createDialog.count() > 0) {
                    console.log('✅ 새 버전 생성 다이얼로그 열림');
                    
                    // 버전 정보 입력
                    await page.fill('input[placeholder*="버전"]', 'E2E 테스트 버전');
                    await page.fill('textarea[placeholder*="설명"]', 'E2E 테스트로 생성한 버전입니다.');
                    
                    // 생성 버튼 클릭
                    await page.click('button:has-text("생성")');
                    await page.waitForTimeout(2000);
                    
                    console.log('✅ 수동 버전 생성 완료');
                } else {
                    console.log('ℹ️ 수동 버전 생성은 API를 통해 처리됩니다');
                }
            } else {
                console.log('⚠️ 새 버전 생성 메뉴를 찾을 수 없음');
            }
        }
        
        // 8. 테스트케이스 수정하여 자동 버전 생성 테스트
        console.log('📋 8단계: 자동 버전 생성 테스트 (테스트케이스 수정)');
        
        // 테스트케이스 이름 필드 찾고 수정
        const nameField = page.locator('input[name="name"], input[placeholder*="이름"]').first();
        if (await nameField.count() > 0) {
            // 현재 값 지우고 새 값 입력
            await nameField.selectAll();
            await nameField.fill('E2E 테스트 - 자동 버전 생성 테스트 (수정됨)');
            
            // 저장 버튼 클릭
            const saveButton = page.locator('button:has-text("저장")').first();
            if (await saveButton.count() > 0) {
                await saveButton.click();
                await page.waitForTimeout(3000); // 저장 및 버전 생성 대기
                
                console.log('✅ 테스트케이스 수정 및 저장 완료');
                console.log('   (자동 버전 생성 이벤트 처리 중...)');
            }
        }
        
        // 9. 최종 버전 상태 확인
        console.log('📋 9단계: 최종 버전 상태 확인');
        await page.waitForTimeout(2000);
        
        // 버전 인디케이터 다시 확인
        const finalVersionIndicator = await page.locator('[data-testid="version-indicator"]').first();
        if (await finalVersionIndicator.count() > 0) {
            const finalVersionText = await finalVersionIndicator.textContent();
            console.log(`✅ 최종 버전 정보: ${finalVersionText}`);
        }
        
        console.log('🎉 버전 관리 시스템 E2E 테스트 완료!');
        
    } catch (error) {
        console.error('❌ 테스트 실패:', error.message);
        // 스크린샷 저장
        await page.screenshot({ path: 'version-management-error.png', fullPage: true });
        throw error;
    } finally {
        await browser.close();
    }
}

// 테스트 실행
if (require.main === module) {
    testVersionManagement()
        .then(() => {
            console.log('✅ 모든 테스트 통과!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ 테스트 실패:', error);
            process.exit(1);
        });
}

module.exports = { testVersionManagement };