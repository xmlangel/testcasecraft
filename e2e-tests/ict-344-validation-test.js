// e2e-tests/ict-344-validation-test.js
// ICT-344: 스프레드시트 데이터 검증 및 오류 처리 개선 E2E 테스트

const { chromium } = require('playwright');

async function runICT344ValidationTest() {
    console.log('🧪 ICT-344 스프레드시트 데이터 검증 기능 E2E 테스트 시작');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000
    });
    
    const context = await browser.newContext({
        baseURL: 'http://localhost:8080'
    });
    
    const page = await context.newPage();
    
    try {
        console.log('📋 1단계: 로그인 및 프로젝트 선택');
        await page.goto('/', { timeout: 20000 });
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        
        // 프로젝트 선택
        await page.locator('text=프로젝트').first().click();
        await page.waitForLoadState('networkidle');
        await page.locator('button:has-text("프로젝트 열기")').first().click();
        await page.waitForLoadState('networkidle');
        
        console.log('📋 2단계: 테스트케이스 탭으로 이동');
        await page.locator('text=테스트케이스').first().click();
        await page.waitForLoadState('networkidle');
        
        console.log('📋 3단계: 스프레드시트 모드로 전환');
        const spreadsheetModeButton = page.locator('button:has-text("스프레드시트")');
        if (await spreadsheetModeButton.count() > 0) {
            await spreadsheetModeButton.click();
            await page.waitForLoadState('networkidle');
        }
        
        // 스프레드시트가 로드될 때까지 대기
        await page.waitForSelector('.react-spreadsheet', { timeout: 10000 });
        console.log('✅ 스프레드시트 모드 진입 성공');
        
        console.log('🧪 4단계: 검증 테스트 케이스 실행');
        
        // 테스트 케이스 1: 순환 참조 검증 (상위폴더2 → 상위폴더2)
        console.log('📝 테스트 케이스 1: 순환 참조 검증');
        await testCircularReference(page);
        
        // 테스트 케이스 2: 존재하지 않는 상위폴더 검증
        console.log('📝 테스트 케이스 2: 존재하지 않는 상위폴더 검증');
        await testMissingParentFolder(page);
        
        // 테스트 케이스 3: 필수 필드 검증
        console.log('📝 테스트 케이스 3: 필수 필드 검증');
        await testRequiredFields(page);
        
        // 테스트 케이스 4: 폴더명 중복 검증
        console.log('📝 테스트 케이스 4: 폴더명 중복 검증');
        await testDuplicateFolder(page);
        
        console.log('🎉 ICT-344 검증 기능 E2E 테스트 완료!');
        
    } catch (error) {
        console.error('❌ E2E 테스트 실패:', error.message);
        await page.screenshot({ path: `e2e-tests/screenshots/ict-344-error-${Date.now()}.png` });
        throw error;
    } finally {
        await browser.close();
    }
}

// 순환 참조 검증 테스트
async function testCircularReference(page) {
    console.log('  🔄 순환 참조 데이터 입력 중...');
    
    // 첫 번째 행에 폴더 데이터 입력 (자기 자신을 상위폴더로 지정)
    const spreadsheet = page.locator('.react-spreadsheet');
    
    // ID는 비워두고, 타입에 '폴더', 상위폴더에 '상위폴더2', 이름에 '상위폴더2' 입력
    await clickCell(page, 0, 1); // 타입 열
    await page.keyboard.type('폴더');
    
    await clickCell(page, 0, 2); // 상위폴더 열
    await page.keyboard.type('상위폴더2');
    
    await clickCell(page, 0, 3); // 이름 열
    await page.keyboard.type('상위폴더2');
    
    await clickCell(page, 0, 4); // 설명 열
    await page.keyboard.type('순환 참조 테스트 폴더');
    
    // 일괄 저장 시도
    console.log('  💾 일괄 저장 시도 (순환 참조 검증 테스트)...');
    await page.click('button:has-text("일괄 저장")');
    
    // 오류 메시지 확인
    console.log('  🔍 검증 오류 메시지 확인 중...');
    await page.waitForSelector('[role="alert"]', { timeout: 5000 });
    
    const alertText = await page.textContent('[role="alert"]');
    console.log('  📄 표시된 오류 메시지:', alertText);
    
    if (alertText.includes('순환 참조') || alertText.includes('자기 자신을 상위폴더로')) {
        console.log('  ✅ 순환 참조 검증 성공!');
    } else {
        throw new Error('순환 참조 검증이 제대로 작동하지 않음: ' + alertText);
    }
    
    // 오류 메시지 닫기
    await page.click('[role="alert"] button');
    await page.waitForTimeout(1000);
}

// 존재하지 않는 상위폴더 검증 테스트
async function testMissingParentFolder(page) {
    console.log('  📂 존재하지 않는 상위폴더 데이터 입력 중...');
    
    // 새로운 행에 데이터 입력
    await clickCell(page, 1, 1); // 타입 열
    await page.keyboard.type('테스트케이스');
    
    await clickCell(page, 1, 2); // 상위폴더 열  
    await page.keyboard.type('존재하지않는폴더');
    
    await clickCell(page, 1, 3); // 이름 열
    await page.keyboard.type('잘못된 상위폴더 테스트');
    
    await clickCell(page, 1, 4); // 설명 열
    await page.keyboard.type('존재하지 않는 상위폴더를 참조하는 테스트');
    
    // 일괄 저장 시도
    console.log('  💾 일괄 저장 시도 (존재하지 않는 상위폴더 검증 테스트)...');
    await page.click('button:has-text("일괄 저장")');
    
    // 오류 메시지 확인
    console.log('  🔍 검증 오류 메시지 확인 중...');
    await page.waitForSelector('[role="alert"]', { timeout: 5000 });
    
    const alertText = await page.textContent('[role="alert"]');
    console.log('  📄 표시된 오류 메시지:', alertText);
    
    if (alertText.includes('찾을 수 없습니다') || alertText.includes('존재하지않는폴더')) {
        console.log('  ✅ 존재하지 않는 상위폴더 검증 성공!');
    } else {
        throw new Error('존재하지 않는 상위폴더 검증이 제대로 작동하지 않음: ' + alertText);
    }
    
    // 오류 메시지 닫기
    await page.click('[role="alert"] button');
    await page.waitForTimeout(1000);
}

// 필수 필드 검증 테스트
async function testRequiredFields(page) {
    console.log('  📝 필수 필드 누락 데이터 입력 중...');
    
    // 새로운 행에 이름 없이 데이터 입력
    await clickCell(page, 2, 1); // 타입 열
    await page.keyboard.type('테스트케이스');
    
    await clickCell(page, 2, 4); // 설명 열 (이름은 비워둠)
    await page.keyboard.type('이름이 없는 테스트케이스');
    
    // 일괄 저장 시도
    console.log('  💾 일괄 저장 시도 (필수 필드 검증 테스트)...');
    await page.click('button:has-text("일괄 저장")');
    
    // 오류 메시지 확인
    console.log('  🔍 검증 오류 메시지 확인 중...');
    await page.waitForSelector('[role="alert"]', { timeout: 5000 });
    
    const alertText = await page.textContent('[role="alert"]');
    console.log('  📄 표시된 오류 메시지:', alertText);
    
    if (alertText.includes('필수 입력') || alertText.includes('이름은 필수')) {
        console.log('  ✅ 필수 필드 검증 성공!');
    } else {
        throw new Error('필수 필드 검증이 제대로 작동하지 않음: ' + alertText);
    }
    
    // 오류 메시지 닫기
    await page.click('[role="alert"] button');
    await page.waitForTimeout(1000);
}

// 폴더명 중복 검증 테스트
async function testDuplicateFolder(page) {
    console.log('  📁 중복 폴더명 데이터 입력 중...');
    
    // 첫 번째 폴더
    await clickCell(page, 3, 1); // 타입 열
    await page.keyboard.type('폴더');
    
    await clickCell(page, 3, 3); // 이름 열
    await page.keyboard.type('중복폴더');
    
    await clickCell(page, 3, 4); // 설명 열
    await page.keyboard.type('첫 번째 폴더');
    
    // 두 번째 폴더 (같은 이름)
    await clickCell(page, 4, 1); // 타입 열
    await page.keyboard.type('폴더');
    
    await clickCell(page, 4, 3); // 이름 열
    await page.keyboard.type('중복폴더');
    
    await clickCell(page, 4, 4); // 설명 열
    await page.keyboard.type('두 번째 폴더 (중복)');
    
    // 일괄 저장 시도
    console.log('  💾 일괄 저장 시도 (폴더명 중복 검증 테스트)...');
    await page.click('button:has-text("일괄 저장")');
    
    // 오류 메시지 확인
    console.log('  🔍 검증 오류 메시지 확인 중...');
    await page.waitForSelector('[role="alert"]', { timeout: 5000 });
    
    const alertText = await page.textContent('[role="alert"]');
    console.log('  📄 표시된 오류 메시지:', alertText);
    
    if (alertText.includes('중복') || alertText.includes('고유해야')) {
        console.log('  ✅ 폴더명 중복 검증 성공!');
    } else {
        throw new Error('폴더명 중복 검증이 제대로 작동하지 않음: ' + alertText);
    }
    
    // 오류 메시지 닫기
    await page.click('[role="alert"] button');
    await page.waitForTimeout(1000);
}

// 스프레드시트 셀 클릭 헬퍼 함수
async function clickCell(page, row, col) {
    try {
        // react-spreadsheet의 셀 선택 방식
        const cellSelector = `.react-spreadsheet table tbody tr:nth-child(${row + 1}) td:nth-child(${col + 1})`;
        await page.click(cellSelector, { timeout: 5000 });
        await page.waitForTimeout(200); // 셀 선택 대기
    } catch (error) {
        console.log(`  ⚠️ 셀 클릭 실패 (${row}, ${col}): ${error.message}`);
        // 대체 방법: 키보드로 이동
        await page.keyboard.press('Tab');
    }
}

// 메인 실행
if (require.main === module) {
    runICT344ValidationTest().catch(error => {
        console.error('💥 테스트 실행 실패:', error);
        process.exit(1);
    });
}

module.exports = { runICT344ValidationTest };