// E2E Test: baseUrl is not defined 오류 재확인
// 실제 테스트플랜/테스트실행 생성으로 오류 검증

const { chromium } = require('playwright');

async function checkBaseUrlError() {
    console.log('🔍 baseUrl is not defined 오류 재확인 테스트 시작');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000
    });
    
    const context = await browser.newContext({
        baseURL: 'http://localhost:8080'
    });
    
    const page = await context.newPage();
    
    // 콘솔 오류 모니터링 - 더 상세한 분석
    const consoleErrors = [];
    const networkErrors = [];
    const baseUrlErrors = [];
    const apiRequests = [];
    
    page.on('console', msg => {
        const text = msg.text();
        const type = msg.type();
        
        if (type === 'error') {
            console.log('🔴 브라우저 콘솔 오류:', text);
            consoleErrors.push(text);
            
            // baseUrl 관련 오류 특별 감지
            if (text.toLowerCase().includes('baseurl') || text.includes('is not defined')) {
                console.log('🚨 baseUrl 관련 오류 감지:', text);
                baseUrlErrors.push(text);
            }
        } else if (type === 'warning') {
            console.log('⚠️  브라우저 콘솔 경고:', text);
        } else if (type === 'log' || type === 'info') {
            // 모든 로그 출력 (디버깅용)
            if (text.includes('API') || text.includes('fetch') || text.includes('request') || 
                text.includes('POST') || text.includes('저장') || text.includes('submit')) {
                console.log('📡 브라우저 로그:', text);
            }
        }
    });
    
    page.on('request', request => {
        const url = request.url();
        const method = request.method();
        apiRequests.push({url, method});
        
        // POST 요청 특별 모니터링
        if (method === 'POST') {
            console.log('📤 🚨 POST 요청:', method, url);
            try {
                const postData = request.postData();
                if (postData) {
                    console.log('📤 POST 데이터:', postData.substring(0, 500));
                }
            } catch (e) {
                console.log('📤 POST 데이터 읽기 실패:', e.message);
            }
        } else {
            console.log('📤 요청:', method, url);
        }
    });
    
    page.on('response', response => {
        const url = response.url();
        const status = response.status();
        console.log('📥 응답:', status, url);
        if (status >= 400) {
            console.log('🔴 HTTP 오류:', status, url);
            networkErrors.push(`${url}: HTTP ${status}`);
        }
    });
    
    page.on('requestfailed', request => {
        const error = `${request.url()}: ${request.failure().errorText}`;
        console.log('🔴 네트워크 요청 실패:', error);
        networkErrors.push(error);
    });
    
    try {
        // 1. 로그인
        console.log('📝 1단계: 로그인');
        await page.goto('/', { timeout: 20000 });
        await page.waitForLoadState('networkidle');
        
        const usernameInput = await page.locator('input[name="username"]').first();
        const passwordInput = await page.locator('input[name="password"]').first();
        const loginButton = await page.locator('button[type="submit"]').first();
        
        await usernameInput.fill('admin');
        await passwordInput.fill('admin');
        await loginButton.click();
        
        // 프로젝트 페이지 로드 대기
        await page.waitForURL(/.*projects.*/, { timeout: 10000 });
        console.log('✅ 로그인 성공');
        
        // 2. 프로젝트 선택
        console.log('📝 2단계: 프로젝트 선택');
        const openProjectButton = await page.locator('button:has-text("프로젝트 열기")').first();
        await openProjectButton.click();
        await page.waitForURL(/.*projects\/.*/, { timeout: 10000 });
        console.log('✅ 프로젝트 선택 성공');
        
        // 3. 테스트플랜 탭으로 이동
        console.log('📝 3단계: 테스트플랜 탭 이동');
        const testPlanTab = await page.locator('text=테스트플랜');
        await testPlanTab.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // 4. 테스트플랜 생성 시도
        console.log('📝 4단계: 테스트플랜 생성 시도');
        
        // 정확한 버튼 텍스트로 찾기
        const newTestPlanButton = await page.locator('button:has-text("테스트 플랜 추가")').first();
        
        if (await newTestPlanButton.count() > 0) {
            console.log('테스트 플랜 추가 버튼을 찾았습니다.');
            await newTestPlanButton.click();
            
            // 대화상자가 열릴 때까지 기다리기
            console.log('🔍 대화상자가 열릴 때까지 대기 중...');
            await page.waitForSelector('div[role="dialog"], div[role="presentation"]', { timeout: 5000 });
            await page.waitForTimeout(1000); // 추가 안정화 대기
            
            console.log('✅ 대화상자가 열렸습니다.');
            
            // 폼이 나타났는지 확인
            const formElements = await page.locator('input, textarea, form').count();
            console.log(`폼 요소 개수: ${formElements}개`);
            
            // 폼 필드 찾기 (더 광범위한 선택자 사용)
            const nameFields = await page.locator('input').all();
            const textFields = await page.locator('textarea').all();
            
            console.log(`입력 필드: ${nameFields.length}개, 텍스트 영역: ${textFields.length}개`);
            
            // 대화상자 내부의 폼 필드만 대상으로 입력
            console.log('🔍 대화상자 내부 폼 필드 찾기...');
            
            // 대화상자 내부의 첫 번째 input (이름)
            const dialogNameInput = await page.locator('div[role="dialog"] input, div[role="presentation"] input').first();
            if (await dialogNameInput.count() > 0) {
                await dialogNameInput.clear();
                await dialogNameInput.fill('baseUrl 테스트 플랜');
                console.log('✅ 테스트 플랜 이름 입력 완료');
                
                // 입력된 값 확인
                const inputValue = await dialogNameInput.inputValue();
                console.log(`🔍 입력된 이름 값: "${inputValue}"`);
            }
            
            // 대화상자 내부의 첫 번째 textarea (설명)
            const dialogDescInput = await page.locator('div[role="dialog"] textarea, div[role="presentation"] textarea').first();
            if (await dialogDescInput.count() > 0) {
                await dialogDescInput.clear();
                await dialogDescInput.fill('baseUrl 오류 확인용 테스트 플랜');
                console.log('✅ 테스트 플랜 설명 입력 완료');
                
                // 입력된 값 확인
                const textValue = await dialogDescInput.inputValue();
                console.log(`🔍 입력된 설명 값: "${textValue}"`);
            }
            
            // 테스트 케이스 전체 선택
            console.log('테스트 케이스 전체 선택 시도...');
            const selectAllCheckbox = await page.locator('input[type="checkbox"]').first();
            if (await selectAllCheckbox.count() > 0) {
                await selectAllCheckbox.click();
                console.log('전체 선택 체크박스 클릭 완료');
                await page.waitForTimeout(1000);
            }
            
            // 다른 방법으로 전체 선택 시도 - force 옵션 사용
            const selectAllButton = await page.locator('button:has-text("전체"), button:has-text("모두"), button:has-text("선택")').first();
            if (await selectAllButton.count() > 0) {
                try {
                    await selectAllButton.click({ force: true });
                    console.log('전체 선택 버튼 클릭 완료 (force)');
                } catch (e) {
                    console.log('전체 선택 버튼 클릭 실패, 다른 방법 시도...');
                    // 체크박스를 다시 시도
                    const allCheckboxes = await page.locator('input[type="checkbox"]').all();
                    for (const checkbox of allCheckboxes) {
                        try {
                            await checkbox.click({ force: true });
                            console.log('체크박스 클릭 성공');
                            break;
                        } catch (e2) {
                            continue;
                        }
                    }
                }
                await page.waitForTimeout(1000);
            }
            
            // 페이지 전체의 모든 버튼 확인 (디버깅용)
            const allPageButtons = await page.locator('button').allTextContents();
            console.log('🔍 페이지의 모든 버튼:', allPageButtons.slice(0, 15));
            
            // 더 광범위한 대화상자 선택자들 확인
            const dialogSelectors = [
                'div[role="dialog"] button',
                'div[role="presentation"] button', 
                '.MuiDialog-root button',
                '.MuiModal-root button',
                '[data-testid*="dialog"] button',
                '[class*="dialog"] button',
                '[class*="modal"] button'
            ];
            
            let allDialogButtons = [];
            for (const selector of dialogSelectors) {
                const buttons = await page.locator(selector).allTextContents();
                if (buttons.length > 0) {
                    console.log(`🔍 ${selector}에서 찾은 버튼:`, buttons);
                    allDialogButtons = buttons;
                    break;
                }
            }
            
            // 모든 가능한 저장 버튼 텍스트 패턴 확장
            const saveButtonPatterns = [
                /저장/i, /생성/i, /추가/i, /확인/i, /완료/i, /등록/i, 
                /save/i, /create/i, /add/i, /submit/i, /ok/i
            ];
            
            // 다양한 방법으로 저장 버튼 찾기
            let saveButton = null;
            
            // 1. 대화상자 내부에서 찾기
            for (const selector of dialogSelectors) {
                for (const pattern of saveButtonPatterns) {
                    const button = await page.locator(selector).filter({ hasText: pattern }).first();
                    if (await button.count() > 0) {
                        const buttonText = await button.textContent();
                        console.log(`✅ 대화상자 내 저장 버튼 발견: "${buttonText}" (${selector})`);
                        saveButton = button;
                        break;
                    }
                }
                if (saveButton) break;
            }
            
            // 2. 대화상자에서 찾지 못했다면 전체 페이지에서 찾기
            if (!saveButton) {
                console.log('🔍 대화상자 외부에서 저장 버튼 찾기...');
                for (const pattern of saveButtonPatterns) {
                    const button = await page.locator('button').filter({ hasText: pattern }).first();
                    if (await button.count() > 0) {
                        const buttonText = await button.textContent();
                        console.log(`✅ 전체 페이지에서 저장 버튼 발견: "${buttonText}"`);
                        saveButton = button;
                        break;
                    }
                }
            }
            
            // 현재 상태 스크린샷 저장
            await page.screenshot({ 
                path: `screenshots/dialog-state-${Date.now()}.png`,
                fullPage: true 
            });
            console.log('📸 대화상자 상태 스크린샷 저장됨');
            
            if (saveButton && await saveButton.count() > 0) {
                console.log('💾 저장 버튼 클릭 시도...');
                
                // 저장 버튼 상태 확인
                const isButtonEnabled = await saveButton.isEnabled();
                const isButtonVisible = await saveButton.isVisible();
                const buttonText = await saveButton.textContent();
                const buttonRect = await saveButton.boundingBox();
                console.log(`🔍 저장 버튼 상태: 활성화=${isButtonEnabled}, 보임=${isButtonVisible}, 텍스트="${buttonText}"`);
                console.log(`🔍 저장 버튼 위치:`, buttonRect);
                
                // 오류 카운터 및 POST 요청 모니터링 초기화
                const beforeErrorCount = consoleErrors.length;
                const beforeNetworkErrorCount = networkErrors.length;
                const beforePostCount = apiRequests.filter(req => req.method === 'POST').length;
                
                // 폼 필드 상태 확인
                console.log('🔍 폼 필드 값 확인 중...');
                const allInputs = await page.locator('input[type="text"], input[type="email"], input:not([type])').all();
                for (let i = 0; i < Math.min(allInputs.length, 5); i++) {
                    try {
                        const value = await allInputs[i].inputValue();
                        const placeholder = await allInputs[i].getAttribute('placeholder');
                        const name = await allInputs[i].getAttribute('name');
                        const id = await allInputs[i].getAttribute('id');
                        console.log(`  Input ${i+1}: 값="${value}", name="${name}", id="${id}", placeholder="${placeholder}"`);
                    } catch (e) {
                        console.log(`  Input ${i+1}: 읽기 실패 - ${e.message}`);
                    }
                }
                
                const allTextareas = await page.locator('textarea').all();
                for (let i = 0; i < allTextareas.length; i++) {
                    try {
                        const value = await allTextareas[i].inputValue();
                        const placeholder = await allTextareas[i].getAttribute('placeholder');
                        console.log(`  Textarea ${i+1}: 값="${value}", placeholder="${placeholder}"`);
                    } catch (e) {
                        console.log(`  Textarea ${i+1}: 읽기 실패 - ${e.message}`);
                    }
                }
                
                // 네트워크 활동 모니터링을 위한 Promise 생성
                const networkActivityPromise = page.waitForResponse(response => {
                    return response.request().method() === 'POST' && 
                           response.url().includes('/api/test-plans');
                }, { timeout: 8000 }).catch(() => null);
                
                // 스크린샷 저장
                await page.screenshot({ 
                    path: `screenshots/testplan-form-${Date.now()}.png`,
                    fullPage: true 
                });
                console.log('📸 테스트 플랜 폼 스크린샷 저장됨');
                
                console.log('🖱️  저장 버튼 클릭 실행...');
                await saveButton.click({ force: true });
                
                // 클릭 직후 짧은 대기
                await page.waitForTimeout(500);
                
                // POST 요청 대기
                console.log('📡 POST 요청 대기 중 (최대 8초)...');
                const postResponse = await networkActivityPromise;
                
                if (postResponse) {
                    console.log('✅ 테스트 플랜 생성 POST 요청 성공:', postResponse.status());
                    const responseBody = await postResponse.text();
                    console.log('📥 응답 내용:', responseBody.substring(0, 200));
                } else {
                    console.log('⚠️  테스트 플랜 생성 POST 요청이 발생하지 않음');
                    
                    // 폼 상태 재확인
                    const dialogStillOpen = await page.locator('div[role="presentation"]').count();
                    console.log(`🔍 대화상자 여전히 열림: ${dialogStillOpen}개`);
                    
                    // JavaScript 오류가 있는지 확인
                    if (consoleErrors.length > beforeErrorCount) {
                        console.log('🔍 새로운 콘솔 오류 감지됨');
                    }
                }
                
                await page.waitForTimeout(2000); // 추가 오류 발생 대기
                
                // 대화상자가 닫힐 때까지 기다리기
                try {
                    await page.waitForSelector('div[role="presentation"]', { state: 'detached', timeout: 5000 });
                    console.log('대화상자가 닫혔습니다.');
                } catch (e) {
                    console.log('대화상자가 여전히 열려있습니다. ESC 키로 닫기 시도...');
                    await page.keyboard.press('Escape');
                    await page.waitForTimeout(1000);
                }
                
                const afterErrorCount = consoleErrors.length;
                const afterNetworkErrorCount = networkErrors.length;
                
                console.log(`콘솔 오류: ${afterErrorCount - beforeErrorCount}개 증가`);
                console.log(`네트워크 오류: ${afterNetworkErrorCount - beforeNetworkErrorCount}개 증가`);
                
            } else {
                console.log('❌ 저장 버튼을 찾을 수 없습니다!');
                
                // 디버깅: 현재 페이지 상태 상세 확인
                console.log('🔍 디버깅: 현재 페이지 상태 분석...');
                
                // 모든 대화상자 관련 요소 확인
                const presentationDivs = await page.locator('div[role="presentation"]').count();
                const dialogDivs = await page.locator('div[role="dialog"]').count();
                const muiDialogs = await page.locator('.MuiDialog-root').count();
                const muiModals = await page.locator('.MuiModal-root').count();
                
                console.log(`  - presentation divs: ${presentationDivs}`);
                console.log(`  - dialog divs: ${dialogDivs}`);
                console.log(`  - MuiDialog roots: ${muiDialogs}`);
                console.log(`  - MuiModal roots: ${muiModals}`);
                
                // 모든 가시적인 버튼과 그 텍스트 확인
                const visibleButtons = await page.locator('button:visible').allTextContents();
                console.log('  - 가시적인 모든 버튼:', visibleButtons);
                
                // Material-UI 버튼들 확인
                const muiButtons = await page.locator('.MuiButton-root:visible').allTextContents();
                console.log('  - MUI 버튼들:', muiButtons);
                
                // 현재 대화상자 DOM 구조 확인 (있다면)
                if (presentationDivs > 0 || dialogDivs > 0) {
                    const dialogHtml = await page.locator('div[role="presentation"], div[role="dialog"]').first().innerHTML();
                    console.log('  - 대화상자 HTML (처음 500자):', dialogHtml.substring(0, 500));
                }
                
                // 대화상자 닫기 시도
                console.log('🔧 대화상자 강제 닫기 시도...');
                await page.keyboard.press('Escape');
                await page.waitForTimeout(1000);
            }
            
        } else {
            console.log('⚠️  테스트 플랜 추가 버튼을 찾을 수 없습니다');
        }
        
        // 5. 테스트실행 탭으로 이동
        console.log('📝 5단계: 테스트실행 탭 이동');
        
        // 먼저 모든 대화상자가 닫혔는지 확인
        const openDialogs = await page.locator('div[role="presentation"]').count();
        if (openDialogs > 0) {
            console.log('대화상자가 아직 열려있습니다. 강제로 닫습니다...');
            await page.keyboard.press('Escape');
            await page.waitForTimeout(1000);
        }
        
        // 테스트실행 탭 클릭 - 더 구체적인 선택자 사용
        const testExecutionTab = await page.locator('button[role="tab"]:has-text("테스트실행")').first();
        if (await testExecutionTab.count() === 0) {
            // 대체 선택자 시도
            const altTestExecutionTab = await page.locator('text=테스트실행').first();
            await altTestExecutionTab.click();
        } else {
            await testExecutionTab.click();
        }
        
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);
        
        // 6. 테스트실행 생성 시도
        console.log('📝 6단계: 테스트실행 생성 시도');
        
        // 다양한 버튼 텍스트로 시도
        let newExecutionButton = await page.locator('button:has-text("새 실행")').first();
        
        if (await newExecutionButton.count() === 0) {
            // 대체 텍스트들 시도
            const alternativeButtons = ['새 테스트 실행', '실행 추가', '테스트 실행 추가', '추가'];
            for (const buttonText of alternativeButtons) {
                newExecutionButton = await page.locator(`button:has-text("${buttonText}")`).first();
                if (await newExecutionButton.count() > 0) {
                    console.log(`'${buttonText}' 버튼을 찾았습니다.`);
                    break;
                }
            }
        }
        
        if (await newExecutionButton.count() > 0) {
            console.log('테스트실행 생성 버튼을 클릭합니다.');
            
            const beforeErrorCount = consoleErrors.length;
            const beforeNetworkErrorCount = networkErrors.length;
            
            await newExecutionButton.click();
            await page.waitForTimeout(2000);
            
            // 폼이 열렸는지 확인
            const executionFormVisible = await page.locator('input, textarea, form').count();
            console.log(`실행 폼 요소 개수: ${executionFormVisible}개`);
            
            if (executionFormVisible > 0) {
                // 간단한 테스트 실행 정보 입력
                const executionNameInput = await page.locator('input[type="text"]').first();
                if (await executionNameInput.count() > 0) {
                    await executionNameInput.fill('baseUrl 테스트 실행');
                    console.log('테스트 실행명 입력 완료');
                }
                
                // 테스트 계획 선택 (드롭다운)
                console.log('테스트 계획 선택 시도...');
                const testPlanSelect = await page.locator('select, div[role="button"]:has-text("테스트 계획"), div[role="combobox"]').first();
                if (await testPlanSelect.count() > 0) {
                    await testPlanSelect.click();
                    await page.waitForTimeout(500);
                    
                    // 첫 번째 옵션 선택 (방금 만든 테스트 플랜)
                    const firstOption = await page.locator('li[role="option"], option').first();
                    if (await firstOption.count() > 0) {
                        await firstOption.click();
                        console.log('테스트 계획 선택 완료');
                        await page.waitForTimeout(500);
                    }
                }
                
                // 저장 버튼 찾기 및 클릭
                const saveExecutionButton = await page.locator('button:has-text("저장"), button:has-text("생성")').first();
                if (await saveExecutionButton.count() > 0) {
                    console.log('💾 테스트 실행 저장 버튼 클릭...');
                    
                    // 테스트 실행 POST 요청 모니터링
                    const executionNetworkPromise = page.waitForResponse(response => {
                        return response.request().method() === 'POST' && 
                               (response.url().includes('/api/test-executions') || 
                                response.url().includes('/api/executions'));
                    }, { timeout: 5000 }).catch(() => null);
                    
                    await saveExecutionButton.click({ force: true });
                    
                    console.log('📡 테스트 실행 POST 요청 대기 중...');
                    const executionResponse = await executionNetworkPromise;
                    
                    if (executionResponse) {
                        console.log('✅ 테스트 실행 생성 POST 요청 성공:', executionResponse.status());
                    } else {
                        console.log('⚠️  테스트 실행 생성 POST 요청이 발생하지 않음');
                    }
                    
                    await page.waitForTimeout(3000);
                }
            }
            
            const afterErrorCount = consoleErrors.length;
            const afterNetworkErrorCount = networkErrors.length;
            
            console.log(`테스트실행 생성 시 콘솔 오류: ${afterErrorCount - beforeErrorCount}개 증가`);
            console.log(`테스트실행 생성 시 네트워크 오류: ${afterNetworkErrorCount - beforeNetworkErrorCount}개 증가`);
            
        } else {
            console.log('⚠️  테스트실행 생성 버튼을 찾을 수 없습니다');
            // 페이지의 모든 버튼들을 로그로 출력해서 디버깅
            const allButtons = await page.locator('button').allTextContents();
            console.log('페이지의 모든 버튼들:', allButtons.slice(0, 10)); // 처음 10개만
        }
        
        // 최종 오류 분석
        console.log('\n📊 최종 오류 분석:');
        console.log(`총 콘솔 오류: ${consoleErrors.length}개`);
        console.log(`총 네트워크 오류: ${networkErrors.length}개`);
        
        let hasBaseUrlError = false;
        
        consoleErrors.forEach((error, index) => {
            if (error.toLowerCase().includes('baseurl') || error.toLowerCase().includes('base url')) {
                console.log(`🔴 baseUrl 관련 오류 #${index + 1}:`, error);
                hasBaseUrlError = true;
            }
        });
        
        if (hasBaseUrlError) {
            console.log('❌ baseUrl 오류가 여전히 존재합니다!');
            throw new Error('baseUrl 오류가 해결되지 않았습니다');
        } else if (consoleErrors.length > 0) {
            console.log('⚠️  baseUrl과 무관한 오류들:');
            consoleErrors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        } else {
            console.log('✅ baseUrl 오류가 해결되었습니다!');
        }
        
    } catch (error) {
        console.error('❌ 테스트 실패:', error.message);
        
        // 스크린샷 저장
        await page.screenshot({ 
            path: `e2e-tests/screenshots/baseurl-check-${Date.now()}.png`,
            fullPage: true 
        });
        
        throw error;
    } finally {
        await browser.close();
    }
}

// 테스트 실행
if (require.main === module) {
    checkBaseUrlError()
        .then(() => {
            console.log('✅ baseUrl 오류 확인 테스트 완료');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ 테스트 실패:', error);
            process.exit(1);
        });
}

module.exports = { checkBaseUrlError };