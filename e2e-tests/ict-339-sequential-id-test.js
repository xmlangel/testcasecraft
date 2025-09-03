// ICT-339: 순차 ID 기능 E2E 테스트
// 테스트케이스와 폴더에 사용자 식별 가능한 아라비아식 숫자 자동 추가 기능 검증

const { chromium } = require('playwright');

async function testSequentialIdFeature() {
    const browser = await chromium.launch({ headless: false, slowMo: 1000 });
    const context = await browser.newContext({
        baseURL: 'http://localhost:8080'
    });
    const page = await context.newPage();

    try {
        console.log('\n🧪 ICT-339: 순차 ID 기능 E2E 테스트 시작');
        console.log('='.repeat(50));

        // 1단계: 애플리케이션 접속 및 로그인
        console.log('\n1️⃣ 애플리케이션 접속 및 로그인');
        await page.goto('/', { timeout: 20000 });
        await page.waitForLoadState('networkidle');

        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        console.log('✅ 로그인 성공');

        // 2단계: 프로젝트 선택 페이지로 이동
        console.log('\n2️⃣ 프로젝트 선택 페이지로 이동');
        await page.locator('text=프로젝트').first().click();
        await page.waitForLoadState('networkidle');
        
        const projectButtons = await page.locator('button:has-text("프로젝트 열기")').count();
        console.log(`📋 사용 가능한 프로젝트: ${projectButtons}개`);
        
        if (projectButtons === 0) {
            throw new Error('테스트할 프로젝트가 없습니다. 프로젝트를 먼저 생성하세요.');
        }

        // 3단계: 첫 번째 프로젝트 선택
        console.log('\n3️⃣ 첫 번째 프로젝트 선택');
        await page.locator('button:has-text("프로젝트 열기")').first().click();
        await page.waitForLoadState('networkidle');
        console.log('✅ 프로젝트 선택 완료');

        // 4단계: 테스트케이스 탭으로 이동
        console.log('\n4️⃣ 테스트케이스 탭으로 이동');
        await page.locator('text=테스트케이스').first().click();
        await page.waitForLoadState('networkidle');
        console.log('✅ 테스트케이스 탭 접근 완료');

        // 5단계: 스프레드시트에서 순차 ID 컬럼 확인
        console.log('\n5️⃣ 스프레드시트 순차 ID 컬럼 확인');
        
        // 스프레드시트가 로드될 때까지 대기
        await page.waitForSelector('.react-spreadsheet', { timeout: 10000 });
        
        // 컬럼 헤더에서 "ID" 컬럼 확인
        const headers = await page.$$eval('.react-spreadsheet th', headers => 
            headers.map(h => h.textContent?.trim() || '')
        );
        
        console.log('📊 스프레드시트 컬럼 헤더:', headers);
        
        if (headers[0] !== 'ID') {
            throw new Error(`첫 번째 컬럼이 'ID'가 아닙니다. 실제: ${headers[0]}`);
        }
        console.log('✅ ID 컬럼이 첫 번째 위치에 정상 표시됨');

        // 6단계: 기존 테스트케이스들의 순차 ID 확인
        console.log('\n6️⃣ 기존 테스트케이스들의 순차 ID 확인');
        
        // 새로고침으로 최신 데이터 로드
        await page.locator('button:has-text("새로고침")').click();
        await page.waitForLoadState('networkidle');
        
        // 첫 번째 열(ID 컬럼)의 값들 확인
        await page.waitForTimeout(2000); // 데이터 로딩 대기
        
        const idCells = await page.$$eval('.react-spreadsheet tbody tr td:first-child', cells => 
            cells.map(cell => cell.textContent?.trim() || '').filter(text => text !== '')
        );
        
        console.log('🔢 기존 테스트케이스 순차 ID:', idCells);
        
        // ID가 숫자인지 확인
        const validIds = idCells.filter(id => /^\d+$/.test(id));
        console.log(`✅ 유효한 순차 ID 개수: ${validIds.length}/${idCells.length}`);

        // 7단계: 새 테스트케이스 추가 테스트
        console.log('\n7️⃣ 새 테스트케이스 추가로 순차 ID 자동 할당 테스트');
        
        // 행 추가 버튼 클릭
        await page.locator('button:has-text("행 추가")').click();
        await page.waitForTimeout(1000);

        // 새로운 테스트케이스 데이터 입력 (2번째 행 - 타입 컬럼)
        await page.locator('.react-spreadsheet tbody tr:last-child td:nth-child(2)').click();
        await page.keyboard.type('테스트케이스');
        await page.keyboard.press('Tab');
        
        // 이름 컬럼 (4번째 컬럼)
        await page.keyboard.type('ICT-339 순차 ID 테스트');
        await page.keyboard.press('Tab');
        
        // 설명 컬럼 (5번째 컬럼)
        await page.keyboard.type('순차 ID 자동 할당 기능 테스트');

        // 8단계: 일괄 저장 실행
        console.log('\n8️⃣ 일괄 저장으로 순차 ID 자동 할당 확인');
        await page.locator('button:has-text("일괄 저장")').click();
        await page.waitForLoadState('networkidle');
        
        // 저장 완료 메시지 확인
        const saveMessage = await page.locator('.MuiAlert-message').textContent();
        console.log('💾 저장 결과:', saveMessage);

        // 9단계: 새로고침 후 새로운 순차 ID 확인
        console.log('\n9️⃣ 새로고침으로 새 순차 ID 확인');
        await page.locator('button:has-text("새로고침")').click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const newIdCells = await page.$$eval('.react-spreadsheet tbody tr td:first-child', cells => 
            cells.map(cell => cell.textContent?.trim() || '').filter(text => text !== '')
        );
        
        console.log('🆕 업데이트된 순차 ID 목록:', newIdCells);
        
        // 새로운 ID가 추가되었는지 확인
        if (newIdCells.length > idCells.length) {
            const newIds = newIdCells.filter(id => !idCells.includes(id));
            console.log(`✅ 새로 할당된 순차 ID: ${newIds.join(', ')}`);
        }

        // 10단계: 폴더 추가로 순차 ID 할당 테스트
        console.log('\n🔟 폴더 추가로 순차 ID 할당 테스트');
        
        await page.locator('button:has-text("폴더 추가")').click();
        await page.waitForSelector('.MuiDialog-root', { timeout: 5000 });
        
        await page.fill('input[label="폴더명"]', 'ICT-339 테스트 폴더');
        await page.locator('button:has-text("생성")').click();
        await page.waitForLoadState('networkidle');

        // 폴더 저장
        await page.locator('button:has-text("일괄 저장")').click();
        await page.waitForLoadState('networkidle');
        
        // 최종 순차 ID 상태 확인
        await page.locator('button:has-text("새로고침")').click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        const finalIdCells = await page.$$eval('.react-spreadsheet tbody tr td:first-child', cells => 
            cells.map(cell => cell.textContent?.trim() || '').filter(text => text !== '')
        );
        
        console.log('🎯 최종 순차 ID 상태:', finalIdCells);

        // 테스트 결과 요약
        console.log('\n📋 ICT-339 순차 ID 기능 테스트 결과 요약');
        console.log('='.repeat(50));
        console.log(`✅ ID 컬럼 표시: ${headers[0] === 'ID' ? '성공' : '실패'}`);
        console.log(`✅ 기존 순차 ID 로딩: ${validIds.length > 0 ? '성공' : '실패'} (${validIds.length}개)`);
        console.log(`✅ 새 테스트케이스 순차 ID: ${finalIdCells.length > idCells.length ? '성공' : '실패'}`);
        console.log(`✅ 폴더 순차 ID 할당: ${finalIdCells.length > newIdCells.length ? '성공' : '실패'}`);
        
        const allTestsPassed = headers[0] === 'ID' && validIds.length > 0 && 
                              finalIdCells.length > idCells.length;
        
        if (allTestsPassed) {
            console.log('\n🎉 ICT-339 순차 ID 기능 E2E 테스트 전체 성공!');
            console.log('   ✨ 사용자 식별 가능한 아라비아식 숫자가 정상적으로 자동 할당됨');
        } else {
            console.log('\n❌ 일부 테스트 실패 - 추가 디버깅 필요');
        }

    } catch (error) {
        console.error('\n❌ ICT-339 E2E 테스트 실패:', error.message);
        
        // 스크린샷 촬영
        await page.screenshot({ 
            path: 'e2e-tests/ict-339-failure-screenshot.png',
            fullPage: true 
        });
        console.log('📸 실패 스크린샷 저장: e2e-tests/ict-339-failure-screenshot.png');
        
        throw error;
    } finally {
        await browser.close();
    }
}

// 테스트 실행
if (require.main === module) {
    testSequentialIdFeature()
        .then(() => {
            console.log('\n✅ ICT-339 순차 ID 기능 E2E 테스트 완료');
            process.exit(0);
        })
        .catch(error => {
            console.error('\n💥 테스트 실행 실패:', error);
            process.exit(1);
        });
}

module.exports = { testSequentialIdFeature };