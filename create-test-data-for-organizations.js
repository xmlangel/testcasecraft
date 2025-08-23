const { chromium } = require('playwright');

async function createTestDataForOrganizations() {
    console.log('🚀 조직별 테스트 데이터 생성 시작...');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 800
    });
    
    const context = await browser.newContext({
        baseURL: 'http://localhost:8080'
    });
    
    const page = await context.newPage();
    
    try {
        // Step 1: 로그인
        console.log('📍 Step 1: 로그인...');
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        console.log('✅ 로그인 성공');

        // 조직별 데이터 생성
        const organizations = [
            {
                name: '데브옵스팀',
                projects: [
                    {
                        name: 'Infrastructure Management',
                        code: 'INFRA',
                        description: 'CI/CD 파이프라인 및 인프라 관리 프로젝트'
                    },
                    {
                        name: 'Monitoring System',
                        code: 'MONITOR',
                        description: '모니터링 및 로깅 시스템 구축 프로젝트'
                    }
                ]
            },
            {
                name: '개발팀',
                projects: [
                    {
                        name: 'E-Commerce Platform',
                        code: 'ECOM',
                        description: '전자상거래 플랫폼 개발 프로젝트'
                    },
                    {
                        name: 'API Gateway',
                        code: 'APIGW',
                        description: 'API 게이트웨이 및 마이크로서비스 관리'
                    }
                ]
            },
            {
                name: 'QA팀',
                projects: [
                    {
                        name: 'Test Automation Framework',
                        code: 'AUTOTEST',
                        description: '자동화 테스트 프레임워크 구축'
                    },
                    {
                        name: 'Performance Testing',
                        code: 'PERFTEST',
                        description: '성능 테스트 및 부하 테스트 프로젝트'
                    }
                ]
            }
        ];

        for (const org of organizations) {
            console.log(`\n🏢 ${org.name} 데이터 생성 중...`);
            
            // Step 2: 프로젝트 페이지로 이동
            console.log('📍 프로젝트 페이지로 이동...');
            await page.locator('text=프로젝트').first().click();
            await page.waitForLoadState('networkidle');

            for (const project of org.projects) {
                console.log(`\n📁 ${project.name} 프로젝트 생성 중...`);

                // Step 3: 새 프로젝트 생성
                console.log('📍 새 프로젝트 생성...');
                const createButton = page.locator('button:has-text("새 프로젝트 생성")');
                if (await createButton.count() > 0) {
                    await createButton.click();
                    await page.waitForLoadState('networkidle');

                    // 프로젝트 정보 입력
                    await page.fill('input[name="name"]', project.name);
                    await page.fill('input[name="code"]', project.code);
                    await page.fill('textarea[name="description"]', project.description);

                    // 조직 선택
                    await page.click('div[role="button"]:has-text("조직 선택")');
                    await page.waitForTimeout(1000);
                    await page.locator(`text=${org.name}`).click();

                    // 프로젝트 생성 완료
                    await page.click('button:has-text("생성")');
                    await page.waitForLoadState('networkidle');
                    console.log(`✅ ${project.name} 프로젝트 생성 완료`);

                    // Step 4: 생성된 프로젝트 열기
                    await page.waitForTimeout(2000);
                    const projectTile = page.locator(`.project-tile:has-text("${project.code}")`, { timeout: 10000 });
                    if (await projectTile.count() === 0) {
                        // 프로젝트 타일이 없으면 프로젝트 열기 버튼 찾기
                        const openButtons = page.locator('button:has-text("프로젝트 열기")');
                        const buttonCount = await openButtons.count();
                        if (buttonCount > 0) {
                            // 마지막에 생성된 프로젝트 (가장 아래쪽) 열기
                            await openButtons.last().click();
                        }
                    } else {
                        await projectTile.click();
                    }
                    
                    await page.waitForLoadState('networkidle');
                    console.log(`✅ ${project.name} 프로젝트 열기 완료`);

                    // Step 5: 테스트케이스 생성
                    console.log('📍 테스트케이스 생성...');
                    await page.locator('text=테스트케이스').first().click();
                    await page.waitForLoadState('networkidle');
                    await page.waitForTimeout(2000);

                    // 테스트케이스 생성을 위한 다양한 시나리오
                    const testCases = [
                        {
                            name: `${project.code}_001 기본 기능 테스트`,
                            description: '시스템의 기본 기능 동작을 확인하는 테스트',
                            steps: [
                                { description: '시스템 접속', expectedResult: '정상적으로 로그인 페이지가 표시됨' },
                                { description: '로그인 수행', expectedResult: '메인 대시보드로 이동' },
                                { description: '기본 메뉴 확인', expectedResult: '모든 메뉴가 정상적으로 표시됨' },
                                { description: '기본 데이터 조회', expectedResult: '데이터가 정상적으로 로드됨' }
                            ]
                        },
                        {
                            name: `${project.code}_002 예외 처리 테스트`,
                            description: '시스템의 예외 상황 처리를 확인하는 테스트',
                            steps: [
                                { description: '잘못된 데이터 입력', expectedResult: '적절한 오류 메시지 표시' },
                                { description: '권한 없는 접근 시도', expectedResult: '접근 거부 메시지 표시' },
                                { description: '네트워크 오류 상황', expectedResult: '오류 처리 및 복구 기능 동작' },
                                { description: '시스템 복구 확인', expectedResult: '정상 상태로 복구됨' }
                            ]
                        },
                        {
                            name: `${project.code}_003 성능 테스트`,
                            description: '시스템의 성능 및 응답시간을 확인하는 테스트',
                            steps: [
                                { description: '대용량 데이터 처리', expectedResult: '3초 이내 처리 완료' },
                                { description: '동시 접속 테스트', expectedResult: '100명 동시 접속 지원' },
                                { description: '메모리 사용량 확인', expectedResult: '정상 범위 내 메모리 사용' },
                                { description: 'CPU 사용률 모니터링', expectedResult: '80% 이하 CPU 사용률 유지' }
                            ]
                        }
                    ];

                    for (const testCase of testCases) {
                        console.log(`  📝 ${testCase.name} 생성 중...`);
                        
                        // 새 테스트케이스 생성 버튼 클릭
                        const newTestCaseButton = page.locator('button:has-text("새 테스트케이스")');
                        if (await newTestCaseButton.count() > 0) {
                            await newTestCaseButton.click();
                            await page.waitForLoadState('networkidle');

                            // 테스트케이스 기본 정보 입력
                            await page.fill('input[name="name"]', testCase.name);
                            await page.fill('textarea[name="description"]', testCase.description);

                            // 스텝 추가
                            for (let i = 0; i < testCase.steps.length; i++) {
                                const step = testCase.steps[i];
                                
                                if (i > 0) {
                                    // 스텝 추가 버튼 클릭
                                    const addStepButton = page.locator('button:has-text("스텝 추가")');
                                    if (await addStepButton.count() > 0) {
                                        await addStepButton.click();
                                        await page.waitForTimeout(500);
                                    }
                                }

                                // 스텝 정보 입력
                                const stepDescription = page.locator(`input[name="steps.${i}.description"]`);
                                const stepExpectedResult = page.locator(`textarea[name="steps.${i}.expectedResult"]`);
                                
                                if (await stepDescription.count() > 0) {
                                    await stepDescription.fill(step.description);
                                }
                                if (await stepExpectedResult.count() > 0) {
                                    await stepExpectedResult.fill(step.expectedResult);
                                }
                            }

                            // 테스트케이스 저장
                            await page.click('button:has-text("저장")');
                            await page.waitForLoadState('networkidle');
                            console.log(`    ✅ ${testCase.name} 생성 완료`);
                        }
                    }

                    // Step 6: 테스트플랜 생성
                    console.log('📍 테스트플랜 생성...');
                    await page.locator('text=테스트플랜').first().click();
                    await page.waitForLoadState('networkidle');
                    await page.waitForTimeout(2000);

                    const testPlans = [
                        {
                            name: `${project.code} 통합 테스트 플랜`,
                            description: '모든 기능을 포괄하는 통합 테스트 계획'
                        },
                        {
                            name: `${project.code} 회귀 테스트 플랜`,
                            description: '버그 수정 후 기능 회귀 검증 테스트 계획'
                        }
                    ];

                    for (const testPlan of testPlans) {
                        console.log(`  📋 ${testPlan.name} 생성 중...`);
                        
                        const newTestPlanButton = page.locator('button:has-text("새 테스트플랜")');
                        if (await newTestPlanButton.count() > 0) {
                            await newTestPlanButton.click();
                            await page.waitForLoadState('networkidle');

                            await page.fill('input[name="name"]', testPlan.name);
                            await page.fill('textarea[name="description"]', testPlan.description);

                            // 테스트케이스 선택 (모든 테스트케이스 포함)
                            const testCaseCheckboxes = page.locator('input[type="checkbox"]');
                            const checkboxCount = await testCaseCheckboxes.count();
                            for (let i = 0; i < Math.min(checkboxCount, 3); i++) {
                                await testCaseCheckboxes.nth(i).check();
                            }

                            await page.click('button:has-text("저장")');
                            await page.waitForLoadState('networkidle');
                            console.log(`    ✅ ${testPlan.name} 생성 완료`);
                        }
                    }

                    // Step 7: 테스트실행 생성 및 결과 입력
                    console.log('📍 테스트실행 생성...');
                    await page.locator('text=테스트실행').first().click();
                    await page.waitForLoadState('networkidle');
                    await page.waitForTimeout(2000);

                    // 테스트 실행 생성
                    const newTestExecutionButton = page.locator('button:has-text("새 실행")');
                    if (await newTestExecutionButton.count() > 0) {
                        await newTestExecutionButton.click();
                        await page.waitForLoadState('networkidle');

                        // 실행 정보 입력
                        const executionName = `${project.code} 실행 ${new Date().getMonth() + 1}월`;
                        await page.fill('input[name="name"]', executionName);
                        await page.fill('textarea[name="description"]', `${project.name} 프로젝트 월간 테스트 실행`);

                        // 테스트플랜 선택 (첫 번째 플랜)
                        const testPlanSelect = page.locator('select[name="testPlanId"]');
                        if (await testPlanSelect.count() > 0) {
                            await testPlanSelect.selectOption({ index: 1 }); // 첫 번째 옵션 선택
                        }

                        await page.click('button:has-text("시작")');
                        await page.waitForLoadState('networkidle');
                        console.log(`    ✅ ${executionName} 생성 완료`);

                        // Step 8: 테스트 결과 입력
                        console.log('📍 테스트 결과 입력...');
                        await page.waitForTimeout(2000);

                        // 테스트케이스별 결과 입력
                        const testResults = ['PASS', 'FAIL', 'PASS'];
                        const resultButtons = page.locator('button:has-text("결과 입력")');
                        const resultCount = await resultButtons.count();

                        for (let i = 0; i < Math.min(resultCount, 3); i++) {
                            console.log(`    📊 테스트케이스 ${i + 1} 결과 입력 중...`);
                            
                            await resultButtons.nth(i).click();
                            await page.waitForLoadState('networkidle');

                            // 결과 선택
                            const result = testResults[i % testResults.length];
                            await page.click(`button:has-text("${result}")`);

                            // 실행 노트 입력
                            const notes = result === 'PASS' 
                                ? '테스트가 성공적으로 완료되었습니다. 모든 기능이 정상적으로 동작합니다.'
                                : '일부 기능에서 예상과 다른 결과가 발생했습니다. 추가 검토가 필요합니다.';
                            
                            const notesTextarea = page.locator('textarea[name="notes"]');
                            if (await notesTextarea.count() > 0) {
                                await notesTextarea.fill(notes);
                            }

                            // JIRA ID 입력 (시뮬레이션)
                            const jiraIdInput = page.locator('input[name="jiraId"]');
                            if (await jiraIdInput.count() > 0) {
                                await jiraIdInput.fill(`${project.code}-${100 + i}`);
                            }

                            await page.click('button:has-text("저장")');
                            await page.waitForLoadState('networkidle');
                            console.log(`    ✅ 테스트케이스 ${i + 1} 결과 저장 완료`);
                        }
                    }

                    console.log(`✅ ${project.name} 프로젝트 모든 테스트 데이터 생성 완료\n`);
                }

                // 다음 프로젝트를 위해 프로젝트 목록으로 돌아가기
                await page.goto('/projects');
                await page.waitForLoadState('networkidle');
            }

            console.log(`🎉 ${org.name} 모든 프로젝트 데이터 생성 완료!\n`);
        }

        console.log('🎊 모든 조직의 테스트 데이터 생성이 완료되었습니다!');

        // 최종 스크린샷
        await page.screenshot({ path: 'organization-test-data-completed.png' });
        console.log('📸 완료 스크린샷 저장: organization-test-data-completed.png');

    } catch (error) {
        console.error('❌ 오류 발생:', error);
        await page.screenshot({ path: 'organization-test-data-error.png' });
        console.log('📸 오류 스크린샷 저장: organization-test-data-error.png');
        
    } finally {
        await browser.close();
        console.log('🏁 테스트 데이터 생성 작업 완료');
    }
}

// 스크립트 실행
createTestDataForOrganizations().catch(console.error);