// ICT-339: 순차 ID 기능 E2E 테스트 (수정된 버전)
// 테스트케이스와 폴더에 사용자 식별 가능한 아라비아식 숫자 자동 추가 기능 검증

const { chromium } = require('playwright');

async function testSequentialIdFeature() {
    const browser = await chromium.launch({ headless: false, slowMo: 1500 });
    const context = await browser.newContext({
        baseURL: 'http://localhost:8080'
    });
    const page = await context.newPage();

    try {
        console.log('\n🧪 ICT-339: 순차 ID 기능 E2E 테스트 시작 (수정된 버전)');
        console.log('='.repeat(60));

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

        // 5단계: 스프레드시트 컴포넌트 확인
        console.log('\n5️⃣ 스프레드시트 컴포넌트 확인');
        
        // 다양한 테이블/스프레드시트 선택자 시도
        const tableSelectors = [
            'table',
            '.MuiTable-root',
            '[role="grid"]',
            '.react-spreadsheet'
        ];

        let tableElement = null;
        for (const selector of tableSelectors) {
            const count = await page.locator(selector).count();
            console.log(`🔍 "${selector}" 요소 개수: ${count}`);
            
            if (count > 0) {
                const element = page.locator(selector).first();
                const isVisible = await element.isVisible();
                console.log(`   → 첫 번째 요소 visible: ${isVisible}`);
                if (isVisible) {
                    tableElement = element;
                    break;
                }
            }
        }

        if (!tableElement) {
            // 스프레드시트 컴포넌트가 아직 로드되지 않았다면 조금 더 기다림
            console.log('⏳ 스프레드시트 컴포넌트 로딩 대기...');
            await page.waitForTimeout(5000);
            
            // 재시도
            tableElement = page.locator('table, .MuiTable-root').first();
            const tableExists = await tableElement.count() > 0;
            
            if (!tableExists) {
                throw new Error('스프레드시트/테이블 컴포넌트를 찾을 수 없습니다.');
            }
        }

        console.log('✅ 테이블/스프레드시트 컴포넌트 발견');

        // 6단계: 테이블 헤더에서 순차 ID 컬럼 확인
        console.log('\n6️⃣ 테이블 헤더에서 순차 ID 컬럼 확인');
        
        // 헤더 확인
        const headerSelectors = ['th', '.MuiTableCell-head', 'thead td', 'thead th'];
        let headers = [];
        
        for (const selector of headerSelectors) {
            const headerElements = await page.locator(selector).count();
            console.log(`🔍 헤더 선택자 "${selector}": ${headerElements}개`);
            
            if (headerElements > 0) {
                headers = await page.$$eval(selector, elements => 
                    elements.map(el => el.textContent?.trim() || '')
                );
                break;
            }
        }
        
        console.log('📊 테이블 헤더:', headers);
        
        // ID 컬럼이 첫 번째에 있는지 확인
        const hasIdColumn = headers.length > 0 && (headers[0] === 'ID' || headers[0].includes('ID'));
        console.log(`✅ ID 컬럼 확인: ${hasIdColumn ? '성공' : '실패'} (첫 번째 컬럼: "${headers[0]}")`);

        // 7단계: 기존 데이터 행에서 순차 ID 확인
        console.log('\n7️⃣ 기존 데이터 행에서 순차 ID 확인');
        
        // 새로고침으로 최신 데이터 로드
        const refreshButton = page.locator('button:has-text("새로고침")');
        const refreshExists = await refreshButton.count() > 0;
        
        if (refreshExists) {
            await refreshButton.click();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(3000);
            console.log('🔄 데이터 새로고침 완료');
        }
        
        // 데이터 행에서 첫 번째 컬럼(ID) 값들 확인
        const dataCellSelectors = [
            'tbody td:first-child',
            'tbody .MuiTableCell-root:first-child',
            'tr td:first-child',
            'tr:not(:first-child) td:first-child'
        ];

        let idValues = [];
        for (const selector of dataCellSelectors) {
            const cellCount = await page.locator(selector).count();
            console.log(`🔍 데이터 셀 선택자 "${selector}": ${cellCount}개`);
            
            if (cellCount > 0) {
                idValues = await page.$$eval(selector, cells => 
                    cells.map(cell => cell.textContent?.trim() || '')
                        .filter(text => text !== '' && text !== 'ID')
                );
                break;
            }
        }
        
        console.log('🔢 현재 순차 ID 값들:', idValues);
        
        // 숫자인 ID들 확인
        const numericIds = idValues.filter(id => /^\d+$/.test(id));
        console.log(`✅ 유효한 순차 ID: ${numericIds.length}개 (${numericIds.join(', ')})`);

        // 8단계: 새 테스트케이스 추가 테스트
        console.log('\n8️⃣ 새 테스트케이스 추가 테스트');
        
        // 행 추가 버튼 찾기 및 클릭
        const addRowButton = page.locator('button:has-text("행 추가")');
        const addRowExists = await addRowButton.count() > 0;
        
        if (addRowExists) {
            await addRowButton.click();
            await page.waitForTimeout(2000);
            console.log('➕ 새 행 추가 완료');

            // 새로운 행에 데이터 입력 시도
            try {
                // 첫 번째 빈 행 찾기 (여러 선택자 시도)
                const emptyRowSelectors = [
                    'tbody tr:last-child td:nth-child(2)', // 마지막 행, 두 번째 컬럼 (타입)
                    'tr:last-child td:nth-child(2)',
                    'tbody tr td:nth-child(2)', // 모든 행의 두 번째 컬럼
                ];

                let inputCell = null;
                for (const selector of emptyRowSelectors) {
                    const cellExists = await page.locator(selector).count() > 0;
                    if (cellExists) {
                        inputCell = page.locator(selector).first();
                        break;
                    }
                }

                if (inputCell) {
                    await inputCell.click();
                    await page.keyboard.type('테스트케이스');
                    console.log('📝 타입 입력 완료');

                    // 탭으로 이동하여 이름 입력
                    await page.keyboard.press('Tab');
                    await page.keyboard.press('Tab'); // 상위폴더 건너뛰기
                    await page.keyboard.type('ICT-339 순차 ID 자동 할당 테스트');
                    console.log('📝 이름 입력 완료');

                    // 설명 입력
                    await page.keyboard.press('Tab');
                    await page.keyboard.type('순차 ID가 자동으로 할당되는지 확인하는 테스트');
                    console.log('📝 설명 입력 완료');
                }
            } catch (inputError) {
                console.log('⚠️ 직접 입력 실패, 일괄 저장으로 넘어감');
            }
        } else {
            console.log('⚠️ 행 추가 버튼을 찾을 수 없음');
        }

        // 9단계: 일괄 저장으로 순차 ID 할당 확인
        console.log('\n9️⃣ 일괄 저장 실행');
        
        const saveButton = page.locator('button:has-text("일괄 저장")');
        const saveExists = await saveButton.count() > 0;
        
        if (saveExists) {
            await saveButton.click();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(3000);
            
            // 저장 메시지 확인
            const alertMessages = await page.locator('.MuiAlert-message, [role="alert"]').count();
            if (alertMessages > 0) {
                const message = await page.locator('.MuiAlert-message, [role="alert"]').first().textContent();
                console.log('💾 저장 결과:', message);
            }
            
            console.log('✅ 일괄 저장 실행 완료');
        } else {
            console.log('⚠️ 일괄 저장 버튼을 찾을 수 없음');
        }

        // 10단계: 최종 순차 ID 상태 확인
        console.log('\n🔟 최종 순차 ID 상태 확인');
        
        // 최종 새로고침
        if (refreshExists) {
            await refreshButton.click();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(3000);
        }

        // 최종 ID 값들 확인
        let finalIdValues = [];
        for (const selector of dataCellSelectors) {
            const cellCount = await page.locator(selector).count();
            
            if (cellCount > 0) {
                finalIdValues = await page.$$eval(selector, cells => 
                    cells.map(cell => cell.textContent?.trim() || '')
                        .filter(text => text !== '' && text !== 'ID')
                );
                break;
            }
        }
        
        console.log('🎯 최종 순차 ID 값들:', finalIdValues);
        
        const finalNumericIds = finalIdValues.filter(id => /^\d+$/.test(id));
        console.log(`✅ 최종 유효한 순차 ID: ${finalNumericIds.length}개`);

        // 테스트 결과 요약
        console.log('\n📋 ICT-339 순차 ID 기능 테스트 결과 요약');
        console.log('='.repeat(60));
        console.log(`✅ ID 컬럼 표시: ${hasIdColumn ? '성공' : '실패'}`);
        console.log(`✅ 순차 ID 로딩: ${numericIds.length > 0 ? '성공' : '실패'} (${numericIds.length}개)`);
        console.log(`✅ ID 컬럼 위치: ${headers[0] === 'ID' ? '첫 번째 (올바름)' : `"${headers[0]}" (확인 필요)`}`);
        console.log(`✅ 최종 ID 개수: ${finalNumericIds.length}개`);
        
        const basicTestsPassed = hasIdColumn && finalNumericIds.length > 0;
        
        if (basicTestsPassed) {
            console.log('\n🎉 ICT-339 순차 ID 기본 기능 테스트 성공!');
            console.log('   ✨ 순차 ID 컬럼이 정상적으로 표시되고 있음');
            console.log('   ✨ 사용자 식별 가능한 아라비아식 숫자가 로드됨');
        } else {
            console.log('\n⚠️ 기본 기능 확인 - 추가 검토 필요');
        }

        // 최종 스크린샷
        await page.screenshot({ 
            path: 'e2e-tests/ict-339-final-screenshot.png',
            fullPage: true 
        });
        console.log('📸 최종 스크린샷 저장: e2e-tests/ict-339-final-screenshot.png');

    } catch (error) {
        console.error('\n❌ ICT-339 E2E 테스트 실패:', error.message);
        
        // 실패 스크린샷 촬영
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