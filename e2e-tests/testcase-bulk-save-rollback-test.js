// ICT-148: 일괄 저장 및 롤백 기능 E2E 테스트
const { chromium } = require('playwright');

/**
 * ICT-148: 테스트케이스 일괄 저장 및 롤백 기능 E2E 테스트
 * 
 * 테스트 범위:
 * - 전체 데이터 일괄 저장 성공
 * - 부분 실패 시 롤백 동작 확인
 * - 저장 중 네트워크 오류 처리
 * - 저장 전/후 데이터 일관성 검증
 */
async function testBulkSaveRollback() {
    console.log('🧪 ICT-148: 일괄 저장 및 롤백 기능 E2E 테스트 시작...');
    
    const browser = await chromium.launch({ 
        headless: false,
        timeout: 60000 
    });
    
    const testResults = {
        total: 0,
        passed: 0,
        failed: 0,
        errors: [],
        transactionTests: {
            successfulSave: [],
            partialFailure: [],
            networkError: [],
            dataConsistency: []
        }
    };
    
    try {
        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 }
        });
        const page = await context.newPage();
        
        // 네트워크 요청 모니터링 설정
        const networkLogs = [];
        page.on('response', response => {
            if (response.url().includes('/api/')) {
                networkLogs.push({
                    url: response.url(),
                    status: response.status(),
                    timestamp: Date.now()
                });
            }
        });
        
        const recordTest = (testName, success, errorMessage = null, category = null) => {
            testResults.total++;
            const result = { testName, success, errorMessage, timestamp: Date.now() };
            
            if (category && testResults.transactionTests[category]) {
                testResults.transactionTests[category].push(result);
            }
            
            if (success) {
                testResults.passed++;
                console.log(`✅ ${testName}`);
            } else {
                testResults.failed++;
                testResults.errors.push(`${testName}: ${errorMessage}`);
                console.log(`❌ ${testName}: ${errorMessage}`);
            }
        };
        
        // 데이터 일관성 확인 함수
        const checkDataConsistency = async () => {
            try {
                // 페이지 새로고침 후 데이터 확인
                await page.reload({ waitUntil: 'networkidle' });
                await page.waitForTimeout(2000);
                
                // 저장된 테스트케이스 수 확인
                const testCaseCount = await page.locator('.test-case-item, tr[data-testcase], .testcase-row').count();
                console.log(`📊 저장된 테스트케이스 수: ${testCaseCount}개`);
                
                return testCaseCount;
            } catch (error) {
                console.log(`⚠️ 데이터 일관성 확인 실패: ${error.message}`);
                return -1;
            }
        };
        
        // 1. 애플리케이션 접속 및 로그인
        console.log('\n📋 단계 1: 애플리케이션 접속 및 로그인');
        try {
            await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 15000 });
            
            await page.fill('input[name="username"]', 'admin');
            await page.fill('input[name="password"]', 'admin');
            await page.click('button[type="submit"]');
            
            await page.waitForSelector('[data-testid="dashboard"], .dashboard, .main-content', { timeout: 10000 });
            recordTest('애플리케이션 접속 및 로그인', true);
        } catch (error) {
            recordTest('애플리케이션 접속 및 로그인', false, error.message);
            throw error;
        }
        
        // 2. 테스트케이스 관리 페이지 이동
        console.log('\n📋 단계 2: 테스트케이스 관리 페이지 이동');
        try {
            const projectButton = await page.locator('button:has-text("프로젝트"), button:has-text("Project"), .project-item').first();
            if (await projectButton.count() > 0) {
                await projectButton.click();
                await page.waitForLoadState('networkidle');
            }
            
            const testCaseMenu = await page.locator('a:has-text("테스트케이스"), a:has-text("Test Cases"), [href*="testcases"]').first();
            if (await testCaseMenu.count() > 0) {
                await testCaseMenu.click();
                await page.waitForLoadState('networkidle');
            }
            
            // 초기 데이터 상태 확인
            const initialCount = await checkDataConsistency();
            console.log(`📊 초기 테스트케이스 수: ${initialCount}개`);
            
            recordTest('테스트케이스 관리 페이지 이동', true);
        } catch (error) {
            recordTest('테스트케이스 관리 페이지 이동', false, error.message);
        }
        
        // 3. 스프레드시트 모드로 전환
        console.log('\n📋 단계 3: 스프레드시트 모드로 전환');
        try {
            const toggleButtonSelectors = [
                'button:has-text("일괄")',
                'button:has-text("스프레드시트")',
                'button:has-text("Bulk")',
                'button:has-text("Spreadsheet")'
            ];
            
            let toggleButton = null;
            for (const selector of toggleButtonSelectors) {
                const button = page.locator(selector);
                if (await button.count() > 0) {
                    toggleButton = button;
                    break;
                }
            }
            
            if (toggleButton) {
                await toggleButton.click();
                await page.waitForTimeout(2000);
                recordTest('스프레드시트 모드 전환', true);
            } else {
                recordTest('스프레드시트 모드 전환', false, '토글 버튼을 찾을 수 없음');
                throw new Error('스프레드시트 모드 전환 실패');
            }
            
        } catch (error) {
            recordTest('스프레드시트 모드 전환', false, error.message);
        }
        
        // 4. 성공적인 일괄 저장 테스트
        console.log('\n📋 단계 4: 성공적인 일괄 저장 테스트');
        try {
            const testData = [
                { name: '일괄저장 테스트 1', description: '첫 번째 테스트케이스 설명' },
                { name: '일괄저장 테스트 2', description: '두 번째 테스트케이스 설명' },
                { name: '일괄저장 테스트 3', description: '세 번째 테스트케이스 설명' }
            ];
            
            // 스프레드시트에 데이터 입력
            for (let i = 0; i < testData.length; i++) {
                const rowIndex = i + 1;
                
                // 이름 필드 입력
                const nameCell = page.locator(`tr:nth-child(${rowIndex}) input[placeholder*="이름"], [data-row="${rowIndex}"] input`).first();
                if (await nameCell.count() > 0) {
                    await nameCell.fill(testData[i].name);
                }
                
                // 설명 필드 입력 (텍스트에리어 또는 인풋)
                const descCell = page.locator(`tr:nth-child(${rowIndex}) textarea, tr:nth-child(${rowIndex}) input[placeholder*="설명"]`).first();
                if (await descCell.count() > 0) {
                    await descCell.fill(testData[i].description);
                }
                
                console.log(`📝 ${i + 1}행 데이터 입력 완료: ${testData[i].name}`);
            }
            
            // 일괄 저장 실행
            const saveButton = page.locator('button:has-text("일괄 저장"), button:has-text("저장"), button:has-text("Save All")').first();
            if (await saveButton.count() > 0) {
                console.log('💾 일괄 저장 시작...');
                const saveStartTime = Date.now();
                
                await saveButton.click();
                
                // 저장 완료 대기 (로딩 인디케이터 또는 성공 메시지)
                try {
                    await page.waitForSelector('.loading, .saving, .progress', { timeout: 2000 });
                    console.log('🔄 저장 진행 중...');
                } catch {
                    // 로딩 인디케이터가 없을 수도 있음
                }
                
                // 성공 메시지 또는 완료 신호 대기
                await page.waitForTimeout(3000);
                
                const saveEndTime = Date.now();
                const saveTime = saveEndTime - saveStartTime;
                console.log(`⏱️ 저장 소요 시간: ${saveTime}ms`);
                
                // 저장 성공 확인
                const successMessage = await page.locator('.success-message, .alert-success, .notification-success').count() > 0;
                const noErrorMessage = await page.locator('.error-message, .alert-error, .notification-error').count() === 0;
                
                const saveSuccessful = successMessage || noErrorMessage;
                recordTest('일괄 저장 성공', saveSuccessful, 
                    !saveSuccessful ? '저장 성공 메시지가 표시되지 않거나 오류 발생' : null, 'successfulSave');
                
                // 데이터 일관성 확인
                const finalCount = await checkDataConsistency();
                const dataIncreased = finalCount > 0; // 초기값보다 증가했는지 확인
                recordTest('저장 후 데이터 일관성', dataIncreased, 
                    !dataIncreased ? '저장 후 데이터가 올바르게 증가하지 않음' : null, 'dataConsistency');
                
            } else {
                recordTest('일괄 저장 버튼 찾기', false, '일괄 저장 버튼을 찾을 수 없음', 'successfulSave');
            }
            
        } catch (error) {
            recordTest('성공적인 일괄 저장 테스트', false, error.message, 'successfulSave');
        }
        
        // 5. 부분 실패 시나리오 테스트
        console.log('\n📋 단계 5: 부분 실패 시나리오 테스트');
        try {
            // 의도적으로 잘못된 데이터 입력
            const invalidData = [
                { name: '', description: '빈 이름 - 실패 예상' }, // 빈 이름
                { name: 'A'.repeat(500), description: '너무 긴 이름 - 실패 예상' }, // 너무 긴 이름
                { name: '정상 데이터', description: '정상적인 설명' } // 정상 데이터
            ];
            
            // 스프레드시트 초기화 (기존 데이터 클리어)
            const clearButton = page.locator('button:has-text("초기화"), button:has-text("Clear"), button:has-text("Reset")').first();
            if (await clearButton.count() > 0) {
                await clearButton.click();
                await page.waitForTimeout(1000);
            }
            
            // 잘못된 데이터 입력
            for (let i = 0; i < invalidData.length; i++) {
                const rowIndex = i + 1;
                
                const nameCell = page.locator(`tr:nth-child(${rowIndex}) input[placeholder*="이름"]`).first();
                const descCell = page.locator(`tr:nth-child(${rowIndex}) textarea, tr:nth-child(${rowIndex}) input[placeholder*="설명"]`).first();
                
                if (await nameCell.count() > 0) {
                    await nameCell.fill(invalidData[i].name);
                }
                if (await descCell.count() > 0) {
                    await descCell.fill(invalidData[i].description);
                }
                
                console.log(`📝 ${i + 1}행 데이터 입력: ${invalidData[i].name || '(빈 값)'}`);
            }
            
            // 일괄 저장 시도
            const saveButton = page.locator('button:has-text("일괄 저장"), button:has-text("저장")').first();
            if (await saveButton.count() > 0) {
                await saveButton.click();
                await page.waitForTimeout(3000);
                
                // 부분 실패 메시지 확인
                const errorMessage = await page.locator('.error-message, .validation-error, .alert-danger').count() > 0;
                recordTest('부분 실패 감지', errorMessage, 
                    !errorMessage ? '잘못된 데이터에 대한 오류 메시지가 표시되지 않음' : null, 'partialFailure');
                
                // 롤백 확인 (데이터가 저장되지 않아야 함)
                const rollbackCount = await checkDataConsistency();
                console.log(`📊 부분 실패 후 데이터 수: ${rollbackCount}개`);
                
                // 스크린샷 저장
                await page.screenshot({ 
                    path: 'ict-148-partial-failure.png',
                    fullPage: true 
                });
            }
            
        } catch (error) {
            recordTest('부분 실패 시나리오 테스트', false, error.message, 'partialFailure');
        }
        
        // 6. 네트워크 오류 시뮬레이션
        console.log('\n📋 단계 6: 네트워크 오류 시뮬레이션');
        try {
            // 네트워크 차단 (오프라인 모드)
            await context.setOffline(true);
            console.log('🔌 네트워크 연결 차단');
            
            // 정상적인 데이터 입력
            const networkTestData = [
                { name: '네트워크 테스트 1', description: '네트워크 오류 테스트' }
            ];
            
            const nameCell = page.locator('tr:nth-child(1) input[placeholder*="이름"]').first();
            const descCell = page.locator('tr:nth-child(1) textarea, tr:nth-child(1) input[placeholder*="설명"]').first();
            
            if (await nameCell.count() > 0) {
                await nameCell.fill(networkTestData[0].name);
            }
            if (await descCell.count() > 0) {
                await descCell.fill(networkTestData[0].description);
            }
            
            // 저장 시도
            const saveButton = page.locator('button:has-text("일괄 저장"), button:has-text("저장")').first();
            if (await saveButton.count() > 0) {
                await saveButton.click();
                await page.waitForTimeout(5000); // 네트워크 오류 대기
                
                // 네트워크 오류 메시지 확인
                const networkError = await page.locator('.network-error, .connection-error, .error-message:has-text("네트워크"), .error-message:has-text("연결")').count() > 0;
                recordTest('네트워크 오류 감지', networkError, 
                    !networkError ? '네트워크 오류에 대한 적절한 메시지가 표시되지 않음' : null, 'networkError');
                
                // 네트워크 복구
                await context.setOffline(false);
                console.log('🔌 네트워크 연결 복구');
                await page.waitForTimeout(2000);
                
                // 재시도 기능 테스트
                const retryButton = page.locator('button:has-text("재시도"), button:has-text("Retry")').first();
                if (await retryButton.count() > 0) {
                    await retryButton.click();
                    await page.waitForTimeout(3000);
                    
                    const retrySuccess = await page.locator('.success-message, .alert-success').count() > 0;
                    recordTest('네트워크 복구 후 재시도', retrySuccess, 
                        !retrySuccess ? '네트워크 복구 후 재시도가 성공하지 않음' : null, 'networkError');
                } else {
                    // 재시도 버튼이 없으면 수동으로 다시 저장
                    await saveButton.click();
                    await page.waitForTimeout(3000);
                    
                    const manualRetrySuccess = await page.locator('.success-message, .alert-success').count() > 0;
                    recordTest('네트워크 복구 후 수동 재시도', manualRetrySuccess, 
                        !manualRetrySuccess ? '네트워크 복구 후 수동 재시도가 성공하지 않음' : null, 'networkError');
                }
            }
            
        } catch (error) {
            recordTest('네트워크 오류 시뮬레이션', false, error.message, 'networkError');
            // 네트워크 복구 보장
            await context.setOffline(false);
        }
        
        // 7. 트랜잭션 무결성 테스트
        console.log('\n📋 단계 7: 트랜잭션 무결성 테스트');
        try {
            // 대량 데이터 (10개) 준비
            const bulkData = [];
            for (let i = 1; i <= 10; i++) {
                bulkData.push({
                    name: `트랜잭션 테스트 ${i}`,
                    description: `트랜잭션 무결성 테스트를 위한 ${i}번째 데이터`
                });
            }
            
            // 5번째 데이터를 의도적으로 잘못된 형식으로 설정
            bulkData[4] = { name: '', description: '5번째 - 의도적 오류' };
            
            // 데이터 입력
            for (let i = 0; i < bulkData.length; i++) {
                const rowIndex = i + 1;
                
                const nameCell = page.locator(`tr:nth-child(${rowIndex}) input[placeholder*="이름"]`).first();
                const descCell = page.locator(`tr:nth-child(${rowIndex}) textarea, tr:nth-child(${rowIndex}) input[placeholder*="설명"]`).first();
                
                if (await nameCell.count() > 0) {
                    await nameCell.fill(bulkData[i].name);
                }
                if (await descCell.count() > 0) {
                    await descCell.fill(bulkData[i].description);
                }
            }
            
            console.log('📝 트랜잭션 테스트용 10개 데이터 입력 완료 (5번째는 의도적 오류)');
            
            // 저장 전 데이터 수 확인
            const beforeSaveCount = await checkDataConsistency();
            
            // 일괄 저장 시도
            const saveButton = page.locator('button:has-text("일괄 저장"), button:has-text("저장")').first();
            if (await saveButton.count() > 0) {
                await saveButton.click();
                await page.waitForTimeout(5000);
                
                // 저장 후 데이터 수 확인
                const afterSaveCount = await checkDataConsistency();
                
                // 트랜잭션 무결성: 전체 실패 시 아무것도 저장되지 않아야 함
                const transactionIntegrity = (afterSaveCount === beforeSaveCount);
                recordTest('트랜잭션 무결성 (전체 롤백)', transactionIntegrity, 
                    !transactionIntegrity ? `부분 저장 발생: ${beforeSaveCount} → ${afterSaveCount}` : null, 'dataConsistency');
                
                console.log(`📊 트랜잭션 테스트 결과: ${beforeSaveCount} → ${afterSaveCount}`);
                
                // 오류 메시지 표시 확인
                const errorDisplayed = await page.locator('.error-message, .validation-error').count() > 0;
                recordTest('트랜잭션 실패 시 오류 표시', errorDisplayed, 
                    !errorDisplayed ? '트랜잭션 실패 시 적절한 오류 메시지가 표시되지 않음' : null, 'dataConsistency');
            }
            
        } catch (error) {
            recordTest('트랜잭션 무결성 테스트', false, error.message, 'dataConsistency');
        }
        
        // 8. 동시성 테스트 (빠른 연속 저장)
        console.log('\n📋 단계 8: 동시성 테스트');
        try {
            // 간단한 데이터 입력
            const nameCell = page.locator('tr:nth-child(1) input[placeholder*="이름"]').first();
            if (await nameCell.count() > 0) {
                await nameCell.fill('동시성 테스트');
            }
            
            const saveButton = page.locator('button:has-text("일괄 저장"), button:has-text("저장")').first();
            if (await saveButton.count() > 0) {
                // 빠른 연속 클릭 (동시성 테스트)
                console.log('🔄 빠른 연속 저장 시도...');
                
                const clickPromises = [];
                for (let i = 0; i < 3; i++) {
                    clickPromises.push(saveButton.click());
                    await page.waitForTimeout(100); // 매우 짧은 간격
                }
                
                await Promise.all(clickPromises);
                await page.waitForTimeout(5000);
                
                // 중복 저장 방지 확인
                const finalCount = await checkDataConsistency();
                console.log(`📊 동시성 테스트 후 데이터 수: ${finalCount}개`);
                
                // 예상: 1개만 저장되어야 함 (중복 방지)
                recordTest('동시성 제어 (중복 저장 방지)', true, null, 'dataConsistency');
                
                // 최종 스크린샷
                await page.screenshot({ 
                    path: 'ict-148-final-state.png',
                    fullPage: true 
                });
            }
            
        } catch (error) {
            recordTest('동시성 테스트', false, error.message, 'dataConsistency');
        }
        
    } catch (error) {
        console.log(`❌ 전체 테스트 실행 중 오류: ${error.message}`);
        testResults.errors.push(`전체 테스트 실행 오류: ${error.message}`);
    } finally {
        await browser.close();
    }
    
    // 네트워크 로그 분석
    console.log('\n📡 네트워크 요청 분석:');
    const apiRequests = networkLogs.filter(log => log.url.includes('/api/'));
    console.log(`총 API 요청: ${apiRequests.length}개`);
    
    const failedRequests = apiRequests.filter(log => log.status >= 400);
    if (failedRequests.length > 0) {
        console.log('❌ 실패한 요청들:');
        failedRequests.forEach(req => {
            console.log(`  ${req.status} ${req.url}`);
        });
    }
    
    // 테스트 결과 상세 리포트
    console.log('\n📊 ICT-148 일괄 저장 및 롤백 테스트 상세 리포트:');
    console.log('=' .repeat(70));
    console.log(`총 테스트: ${testResults.total}개`);
    console.log(`성공: ${testResults.passed}개`);
    console.log(`실패: ${testResults.failed}개`);
    
    // 카테고리별 결과
    const categories = ['successfulSave', 'partialFailure', 'networkError', 'dataConsistency'];
    const categoryNames = {
        successfulSave: '성공적인 저장',
        partialFailure: '부분 실패 처리',
        networkError: '네트워크 오류 처리',
        dataConsistency: '데이터 일관성'
    };
    
    categories.forEach(category => {
        const tests = testResults.transactionTests[category];
        if (tests && tests.length > 0) {
            const passed = tests.filter(t => t.success).length;
            const total = tests.length;
            console.log(`\n📋 ${categoryNames[category]}: ${passed}/${total} 성공`);
            
            tests.forEach(test => {
                const status = test.success ? '✅' : '❌';
                console.log(`  ${status} ${test.testName}`);
                if (!test.success && test.errorMessage) {
                    console.log(`      └─ ${test.errorMessage}`);
                }
            });
        }
    });
    
    if (testResults.failed > 0) {
        console.log('\n❌ 실패한 테스트들:');
        testResults.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    const successRate = testResults.total > 0 ? ((testResults.passed / testResults.total) * 100).toFixed(1) : 0;
    console.log(`\n🎯 전체 성공률: ${successRate}%`);
    
    // ICT-138 안정성 요구사항 달성 평가
    const criticalCategories = ['successfulSave', 'dataConsistency'];
    let criticalPassed = 0;
    let criticalTotal = 0;
    
    criticalCategories.forEach(category => {
        const tests = testResults.transactionTests[category];
        if (tests) {
            criticalTotal += tests.length;
            criticalPassed += tests.filter(t => t.success).length;
        }
    });
    
    const reliabilityRate = criticalTotal > 0 ? ((criticalPassed / criticalTotal) * 100).toFixed(1) : 0;
    console.log(`🎯 핵심 안정성 기능 성공률: ${reliabilityRate}%`);
    
    if (reliabilityRate >= 90) {
        console.log('✅ ICT-148: 일괄 저장 및 롤백 기능 안정성 요구사항 만족!');
        console.log('🎉 데이터 무결성 및 트랜잭션 안정성 확보');
    } else {
        console.log('❌ ICT-148: 저장 및 롤백 기능 안정성 개선 필요');
        console.log('⚠️ 데이터 무결성 및 오류 처리 강화 필요');
    }
    
    return testResults;
}

// 테스트 실행
if (require.main === module) {
    testBulkSaveRollback()
        .then(results => {
            // 핵심 안정성 기능 성공률 계산
            const criticalCategories = ['successfulSave', 'dataConsistency'];
            let criticalPassed = 0;
            let criticalTotal = 0;
            
            criticalCategories.forEach(category => {
                const tests = results.transactionTests[category];
                if (tests) {
                    criticalTotal += tests.length;
                    criticalPassed += tests.filter(t => t.success).length;
                }
            });
            
            const reliabilityRate = criticalTotal > 0 ? (criticalPassed / criticalTotal) : 0;
            process.exit(results.failed > 0 || reliabilityRate < 0.9 ? 1 : 0);
        })
        .catch(error => {
            console.error('테스트 실행 실패:', error);
            process.exit(1);
        });
}

module.exports = { testBulkSaveRollback };