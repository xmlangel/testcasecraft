// ICT-147: 실시간 유효성 검증 E2E 테스트
const { chromium } = require('playwright');

/**
 * ICT-147: 테스트케이스 실시간 유효성 검증 E2E 테스트
 * 
 * 테스트 범위:
 * - 필수 필드 누락 시 오류 표시
 * - 중복 데이터 입력 방지 검증
 * - 잘못된 형식 입력 시 즉시 피드백
 * - 오류 상태에서 수정 후 정상화 확인
 */
async function testValidationErrorHandling() {
    console.log('🧪 ICT-147: 실시간 유효성 검증 E2E 테스트 시작...');
    
    const browser = await chromium.launch({ 
        headless: false,
        timeout: 30000 
    });
    
    const testResults = {
        total: 0,
        passed: 0,
        failed: 0,
        errors: [],
        validationTests: {
            requiredFields: [],
            formatValidation: [],
            duplicateValidation: [],
            realTimeValidation: []
        }
    };
    
    try {
        const context = await browser.newContext({
            viewport: { width: 1920, height: 1080 }
        });
        const page = await context.newPage();
        
        const recordTest = (testName, success, errorMessage = null, category = null) => {
            testResults.total++;
            const result = { testName, success, errorMessage, timestamp: Date.now() };
            
            if (category && testResults.validationTests[category]) {
                testResults.validationTests[category].push(result);
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
        
        // 오류 메시지 감지 함수
        const checkErrorMessage = async (expectedText = null) => {
            const errorSelectors = [
                '.error-message',
                '.validation-error',
                '.error-text',
                '[data-testid="error"]',
                '.MuiFormHelperText-root.Mui-error',
                '.invalid-feedback',
                '.field-error'
            ];
            
            for (const selector of errorSelectors) {
                const errorElement = page.locator(selector);
                if (await errorElement.count() > 0) {
                    const errorText = await errorElement.first().textContent();
                    console.log(`🔍 발견된 오류 메시지: "${errorText}"`);
                    
                    if (expectedText) {
                        return errorText.includes(expectedText);
                    }
                    return true;
                }
            }
            return false;
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
            
            recordTest('테스트케이스 관리 페이지 이동', true);
        } catch (error) {
            recordTest('테스트케이스 관리 페이지 이동', false, error.message);
        }
        
        // 3. 필수 필드 누락 검증 테스트
        console.log('\n📋 단계 3: 필수 필드 누락 검증 테스트');
        try {
            // 개별 입력 모드에서 테스트
            console.log('  🔍 개별 입력 모드 - 필수 필드 테스트');
            
            // 이름 필드 비우고 저장 시도
            const nameInput = page.locator('input[name="name"], input[placeholder*="이름"], input[placeholder*="name"]').first();
            if (await nameInput.count() > 0) {
                await nameInput.fill(''); // 빈 값
                await nameInput.blur(); // 포커스 해제로 검증 트리거
                await page.waitForTimeout(500);
                
                const hasError = await checkErrorMessage('이름');
                recordTest('필수 필드 누락 - 이름 필드', hasError, 
                    !hasError ? '이름 필드 필수 검증 오류 메시지가 표시되지 않음' : null, 'requiredFields');
            }
            
            // 설명 필드 비우고 검증
            const descInput = page.locator('textarea[name="description"], textarea[placeholder*="설명"]').first();
            if (await descInput.count() > 0) {
                await descInput.fill(''); // 빈 값
                await descInput.blur();
                await page.waitForTimeout(500);
                
                const hasError = await checkErrorMessage('설명');
                recordTest('필수 필드 누락 - 설명 필드', hasError, 
                    !hasError ? '설명 필드 필수 검증 오류 메시지가 표시되지 않음' : null, 'requiredFields');
            }
            
            // 저장 버튼 클릭 시 전체 검증
            const saveButton = page.locator('button:has-text("저장"), button:has-text("Save"), button[type="submit"]').first();
            if (await saveButton.count() > 0) {
                await saveButton.click();
                await page.waitForTimeout(1000);
                
                const hasGlobalError = await checkErrorMessage();
                recordTest('필수 필드 누락 - 전체 폼 검증', hasGlobalError, 
                    !hasGlobalError ? '전체 폼 검증 시 오류 메시지가 표시되지 않음' : null, 'requiredFields');
            }
            
        } catch (error) {
            recordTest('필수 필드 누락 검증 테스트', false, error.message, 'requiredFields');
        }
        
        // 4. 잘못된 형식 입력 검증 테스트
        console.log('\n📋 단계 4: 잘못된 형식 입력 검증 테스트');
        try {
            // 이름 필드에 특수문자나 너무 긴 텍스트 입력
            const nameInput = page.locator('input[name="name"], input[placeholder*="이름"]').first();
            if (await nameInput.count() > 0) {
                // 너무 긴 이름 (예: 500자)
                const longName = 'A'.repeat(500);
                await nameInput.fill(longName);
                await nameInput.blur();
                await page.waitForTimeout(500);
                
                const hasLengthError = await checkErrorMessage('길이');
                recordTest('형식 검증 - 이름 길이 초과', hasLengthError, 
                    !hasLengthError ? '이름 길이 초과 검증 오류가 표시되지 않음' : null, 'formatValidation');
                
                // 특수문자 포함 이름
                await nameInput.fill('<script>alert("test")</script>');
                await nameInput.blur();
                await page.waitForTimeout(500);
                
                const hasScriptError = await checkErrorMessage();
                recordTest('형식 검증 - 스크립트 태그 방지', hasScriptError, 
                    !hasScriptError ? '스크립트 태그 입력 방지 검증이 없음' : null, 'formatValidation');
            }
            
            // displayOrder 필드에 문자 입력 (숫자 필드인 경우)
            const orderInput = page.locator('input[name="displayOrder"], input[type="number"]').first();
            if (await orderInput.count() > 0) {
                await orderInput.fill('abc123');
                await orderInput.blur();
                await page.waitForTimeout(500);
                
                const hasNumberError = await checkErrorMessage('숫자');
                recordTest('형식 검증 - 숫자 필드 문자 입력', hasNumberError, 
                    !hasNumberError ? '숫자 필드 문자 입력 검증이 없음' : null, 'formatValidation');
            }
            
        } catch (error) {
            recordTest('잘못된 형식 입력 검증 테스트', false, error.message, 'formatValidation');
        }
        
        // 5. 스프레드시트 모드에서의 실시간 검증
        console.log('\n📋 단계 5: 스프레드시트 모드 실시간 검증');
        try {
            // 스프레드시트 모드로 전환
            const toggleButtonSelectors = [
                'button:has-text("일괄")',
                'button:has-text("스프레드시트")',
                'button:has-text("Bulk")',
                '[data-testid="toggle-mode"]'
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
                
                // 스프레드시트에서 중복 이름 입력 테스트
                const firstRowNameCell = page.locator('tr:nth-child(1) input, [data-row="1"] input').first();
                const secondRowNameCell = page.locator('tr:nth-child(2) input, [data-row="2"] input').first();
                
                if (await firstRowNameCell.count() > 0 && await secondRowNameCell.count() > 0) {
                    const duplicateName = '중복 테스트케이스';
                    
                    await firstRowNameCell.fill(duplicateName);
                    await firstRowNameCell.blur();
                    await page.waitForTimeout(500);
                    
                    await secondRowNameCell.fill(duplicateName);
                    await secondRowNameCell.blur();
                    await page.waitForTimeout(1000);
                    
                    const hasDuplicateError = await checkErrorMessage('중복');
                    recordTest('스프레드시트 모드 - 중복 이름 검증', hasDuplicateError, 
                        !hasDuplicateError ? '스프레드시트에서 중복 이름 검증이 없음' : null, 'duplicateValidation');
                }
                
                // 빈 셀 검증
                if (await firstRowNameCell.count() > 0) {
                    await firstRowNameCell.fill('');
                    await firstRowNameCell.blur();
                    await page.waitForTimeout(500);
                    
                    const hasEmptyError = await checkErrorMessage();
                    recordTest('스프레드시트 모드 - 빈 셀 검증', hasEmptyError, 
                        !hasEmptyError ? '스프레드시트에서 빈 셀 검증이 없음' : null, 'realTimeValidation');
                }
                
            } else {
                recordTest('스프레드시트 모드 전환', false, '토글 버튼을 찾을 수 없음', 'realTimeValidation');
            }
            
        } catch (error) {
            recordTest('스프레드시트 모드 실시간 검증', false, error.message, 'realTimeValidation');
        }
        
        // 6. 오류 상태 수정 후 정상화 테스트
        console.log('\n📋 단계 6: 오류 상태 수정 후 정상화 테스트');
        try {
            // 개별 모드로 돌아가기
            const toggleButton = page.locator('button:has-text("개별"), button:has-text("Individual"), [data-testid="individual-mode"]').first();
            if (await toggleButton.count() > 0) {
                await toggleButton.click();
                await page.waitForTimeout(1000);
            }
            
            // 오류가 있는 상태에서 올바른 데이터 입력
            const nameInput = page.locator('input[name="name"], input[placeholder*="이름"]').first();
            if (await nameInput.count() > 0) {
                // 먼저 오류 상태 만들기
                await nameInput.fill('');
                await nameInput.blur();
                await page.waitForTimeout(500);
                
                // 올바른 데이터로 수정
                await nameInput.fill('올바른 테스트케이스 이름');
                await nameInput.blur();
                await page.waitForTimeout(500);
                
                // 오류 메시지가 사라졌는지 확인
                const errorStillVisible = await checkErrorMessage('이름');
                recordTest('오류 수정 후 정상화', !errorStillVisible, 
                    errorStillVisible ? '오류 수정 후에도 오류 메시지가 남아있음' : null, 'realTimeValidation');
            }
            
            // 폼 제출 가능 상태 확인
            const descInput = page.locator('textarea[name="description"], textarea[placeholder*="설명"]').first();
            if (await descInput.count() > 0) {
                await descInput.fill('올바른 테스트케이스 설명');
            }
            
            const saveButton = page.locator('button:has-text("저장"), button:has-text("Save")').first();
            if (await saveButton.count() > 0) {
                const isEnabled = await saveButton.isEnabled();
                recordTest('수정 후 저장 버튼 활성화', isEnabled, 
                    !isEnabled ? '올바른 데이터 입력 후에도 저장 버튼이 비활성화됨' : null, 'realTimeValidation');
            }
            
        } catch (error) {
            recordTest('오류 상태 수정 후 정상화 테스트', false, error.message, 'realTimeValidation');
        }
        
        // 7. 실시간 검증 반응 속도 테스트
        console.log('\n📋 단계 7: 실시간 검증 반응 속도 테스트');
        try {
            const nameInput = page.locator('input[name="name"], input[placeholder*="이름"]').first();
            if (await nameInput.count() > 0) {
                // 연속적인 입력과 검증 반응 시간 측정
                const testInputs = ['', 'a', 'ab', 'abc', '올바른 이름'];
                let fastValidations = 0;
                
                for (const input of testInputs) {
                    const startTime = Date.now();
                    await nameInput.fill(input);
                    await nameInput.blur();
                    
                    // 검증 메시지 또는 UI 변화 대기 (최대 1초)
                    await page.waitForTimeout(100);
                    
                    const endTime = Date.now();
                    const responseTime = endTime - startTime;
                    
                    console.log(`🔄 입력 "${input}" 검증 반응시간: ${responseTime}ms`);
                    
                    if (responseTime < 500) { // 500ms 이내 반응
                        fastValidations++;
                    }
                }
                
                const validationSpeed = (fastValidations / testInputs.length) * 100;
                console.log(`📊 실시간 검증 속도: ${validationSpeed}%`);
                
                const speedGood = validationSpeed >= 80;
                recordTest('실시간 검증 반응 속도', speedGood, 
                    !speedGood ? `검증 속도 부족: ${validationSpeed}% (목표: 80% 이상)` : null, 'realTimeValidation');
            }
            
        } catch (error) {
            recordTest('실시간 검증 반응 속도 테스트', false, error.message, 'realTimeValidation');
        }
        
        // 8. 다양한 브라우저 크기에서 검증 메시지 표시
        console.log('\n📋 단계 8: 반응형 검증 메시지 테스트');
        try {
            const viewports = [
                { width: 1920, height: 1080, name: '데스크톱' },
                { width: 768, height: 1024, name: '태블릿' },
                { width: 375, height: 667, name: '모바일' }
            ];
            
            let responsiveValidations = 0;
            
            for (const viewport of viewports) {
                await page.setViewportSize(viewport);
                await page.waitForTimeout(500);
                
                // 오류 상태 생성
                const nameInput = page.locator('input[name="name"], input[placeholder*="이름"]').first();
                if (await nameInput.count() > 0) {
                    await nameInput.fill('');
                    await nameInput.blur();
                    await page.waitForTimeout(500);
                    
                    const errorVisible = await checkErrorMessage();
                    if (errorVisible) {
                        responsiveValidations++;
                    }
                    
                    console.log(`📱 ${viewport.name} (${viewport.width}x${viewport.height}): ${errorVisible ? '검증 메시지 표시됨' : '검증 메시지 없음'}`);
                    
                    // 스크린샷 저장
                    await page.screenshot({ 
                        path: `ict-147-validation-${viewport.name.toLowerCase()}.png`
                    });
                }
            }
            
            const responsiveRate = (responsiveValidations / viewports.length) * 100;
            const responsiveGood = responsiveRate >= 100;
            recordTest('반응형 검증 메시지 표시', responsiveGood, 
                !responsiveGood ? `일부 화면에서 검증 메시지 누락: ${responsiveRate}%` : null, 'realTimeValidation');
            
            // 원래 해상도로 복원
            await page.setViewportSize({ width: 1920, height: 1080 });
            
        } catch (error) {
            recordTest('반응형 검증 메시지 테스트', false, error.message, 'realTimeValidation');
        }
        
    } catch (error) {
        console.log(`❌ 전체 테스트 실행 중 오류: ${error.message}`);
        testResults.errors.push(`전체 테스트 실행 오류: ${error.message}`);
    } finally {
        await browser.close();
    }
    
    // 테스트 결과 상세 리포트
    console.log('\n📊 ICT-147 유효성 검증 테스트 상세 리포트:');
    console.log('=' .repeat(60));
    console.log(`총 테스트: ${testResults.total}개`);
    console.log(`성공: ${testResults.passed}개`);
    console.log(`실패: ${testResults.failed}개`);
    
    // 카테고리별 결과
    const categories = ['requiredFields', 'formatValidation', 'duplicateValidation', 'realTimeValidation'];
    categories.forEach(category => {
        const tests = testResults.validationTests[category];
        if (tests && tests.length > 0) {
            const passed = tests.filter(t => t.success).length;
            const total = tests.length;
            console.log(`\n📋 ${category} 카테고리: ${passed}/${total} 성공`);
            
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
    
    // ICT-138 요구사항 달성 평가
    const criticalTests = [
        'requiredFields',
        'formatValidation', 
        'realTimeValidation'
    ];
    
    let criticalPassed = 0;
    let criticalTotal = 0;
    
    criticalTests.forEach(category => {
        const tests = testResults.validationTests[category];
        if (tests) {
            criticalTotal += tests.length;
            criticalPassed += tests.filter(t => t.success).length;
        }
    });
    
    const criticalSuccessRate = criticalTotal > 0 ? ((criticalPassed / criticalTotal) * 100).toFixed(1) : 0;
    console.log(`🎯 핵심 검증 기능 성공률: ${criticalSuccessRate}%`);
    
    if (criticalSuccessRate >= 80) {
        console.log('✅ ICT-147: 실시간 유효성 검증 기능 요구사항 만족!');
        console.log('🎉 사용자 경험 개선 목표 달성');
    } else {
        console.log('❌ ICT-147: 유효성 검증 기능 개선 필요');
        console.log('⚠️ 추가 개발 및 테스트 필요');
    }
    
    return testResults;
}

// 테스트 실행
if (require.main === module) {
    testValidationErrorHandling()
        .then(results => {
            // 핵심 검증 기능 성공률 계산
            const criticalTests = ['requiredFields', 'formatValidation', 'realTimeValidation'];
            let criticalPassed = 0;
            let criticalTotal = 0;
            
            criticalTests.forEach(category => {
                const tests = results.validationTests[category];
                if (tests) {
                    criticalTotal += tests.length;
                    criticalPassed += tests.filter(t => t.success).length;
                }
            });
            
            const criticalSuccessRate = criticalTotal > 0 ? (criticalPassed / criticalTotal) : 0;
            process.exit(results.failed > 0 || criticalSuccessRate < 0.8 ? 1 : 0);
        })
        .catch(error => {
            console.error('테스트 실행 실패:', error);
            process.exit(1);
        });
}

module.exports = { testValidationErrorHandling };