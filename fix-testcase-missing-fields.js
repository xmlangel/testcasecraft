// fix-testcase-missing-fields.js
// ICT-281: 테스트케이스 필수 필드 보완 스크립트

const baseURL = 'http://localhost:8080/api';
let authToken = '';

/**
 * API 호출 헬퍼 함수
 */
async function apiCall(endpoint, options = {}) {
    const url = `${baseURL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }
    
    try {
        const response = await fetch(url, { ...options, headers });
        
        if (!response.ok) {
            const errorData = await response.text();
            console.error(`❌ API 오류: ${response.status} - ${endpoint}`);
            console.error(`   응답: ${errorData}`);
            throw new Error(`API Error: ${response.status} - ${errorData}`);
        }
        
        return response.json();
    } catch (error) {
        console.error(`❌ 네트워크 오류: ${endpoint}`, error.message);
        throw error;
    }
}

/**
 * 로그인 및 JWT 토큰 획득
 */
async function login() {
    console.log('🔐 로그인 시도...');
    try {
        const response = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username: 'admin', password: 'admin' })
        });
        authToken = response.accessToken;
        console.log('✅ 로그인 성공');
        return authToken;
    } catch (error) {
        console.error('❌ 로그인 실패:', error.message);
        throw error;
    }
}

/**
 * 테스트케이스 필드 보완을 위한 데이터 템플릿
 */
function getTestCaseEnhancementData(testCase) {
    const testCaseName = testCase.name || '';
    const projectType = determineProjectType(testCase.projectId);
    
    // 테스트케이스 유형별 데이터 생성
    if (testCaseName.includes('로그인') || testCaseName.includes('login')) {
        return {
            precondition: '시스템이 정상 실행 중이고 로그인 페이지가 접근 가능한 상태여야 함',
            expectedResult: '유효한 사용자 자격증명으로 로그인 성공 시 메인 대시보드로 이동',
            postcondition: '사용자 세션이 생성되고 인증 토큰이 저장됨',
            priority: 'HIGH',
            category: 'Authentication',
            tags: ['login', 'authentication', 'security']
        };
    } else if (testCaseName.includes('생성') || testCaseName.includes('create')) {
        return {
            precondition: '시스템에 로그인된 사용자이며 생성 권한이 있어야 함',
            expectedResult: '필수 필드가 입력된 경우 새로운 항목이 성공적으로 생성됨',
            postcondition: '생성된 항목이 데이터베이스에 저장되고 목록에 표시됨',
            priority: 'HIGH',
            category: 'CRUD Operations',
            tags: ['create', 'functionality', projectType]
        };
    } else if (testCaseName.includes('수정') || testCaseName.includes('edit') || testCaseName.includes('update')) {
        return {
            precondition: '수정할 항목이 시스템에 존재하고 수정 권한이 있어야 함',
            expectedResult: '변경된 내용이 정확히 반영되고 수정 완료 메시지가 표시됨',
            postcondition: '수정된 데이터가 저장되고 다른 관련 데이터와 일관성 유지',
            priority: 'MEDIUM',
            category: 'CRUD Operations',
            tags: ['update', 'functionality', projectType]
        };
    } else if (testCaseName.includes('삭제') || testCaseName.includes('delete')) {
        return {
            precondition: '삭제할 항목이 존재하고 삭제 권한이 있어야 함',
            expectedResult: '삭제 확인 후 항목이 시스템에서 완전히 제거됨',
            postcondition: '삭제된 항목이 더 이상 시스템에서 조회되지 않음',
            priority: 'HIGH',
            category: 'CRUD Operations',
            tags: ['delete', 'functionality', projectType]
        };
    } else if (testCaseName.includes('검색') || testCaseName.includes('search') || testCaseName.includes('필터')) {
        return {
            precondition: '검색할 데이터가 시스템에 존재하고 검색 기능이 활성화되어 있어야 함',
            expectedResult: '검색 조건에 맞는 결과가 정확히 반환되고 정렬됨',
            postcondition: '검색 결과가 사용자 인터페이스에 표시되고 추가 액션 가능',
            priority: 'MEDIUM',
            category: 'Search',
            tags: ['search', 'filter', 'functionality']
        };
    } else if (testCaseName.includes('성능') || testCaseName.includes('performance')) {
        return {
            precondition: '시스템이 안정적으로 실행 중이고 성능 측정 환경이 준비되어 있어야 함',
            expectedResult: '지정된 성능 기준을 충족하고 응답시간이 허용 범위 내에 있음',
            postcondition: '성능 지표가 기록되고 시스템이 정상 상태로 복원됨',
            priority: 'HIGH',
            category: 'Performance',
            tags: ['performance', 'load-test', projectType]
        };
    } else if (testCaseName.includes('보안') || testCaseName.includes('security')) {
        return {
            precondition: '보안 테스트 환경이 격리되어 있고 테스트용 데이터가 준비되어 있어야 함',
            expectedResult: '보안 정책이 올바르게 적용되고 무단 접근이 차단됨',
            postcondition: '보안 로그가 기록되고 시스템 무결성이 유지됨',
            priority: 'CRITICAL',
            category: 'Security',
            tags: ['security', 'access-control', 'vulnerability']
        };
    } else if (testCaseName.includes('통합') || testCaseName.includes('integration')) {
        return {
            precondition: '통합할 모든 시스템이 정상 실행 중이고 네트워크 연결이 안정적이어야 함',
            expectedResult: '시스템 간 데이터가 정확히 전달되고 동기화됨',
            postcondition: '통합 상태가 유지되고 오류 발생 시 적절히 처리됨',
            priority: 'HIGH',
            category: 'Integration',
            tags: ['integration', 'api', 'data-sync']
        };
    } else {
        // 기본 템플릿
        return {
            precondition: '시스템이 정상 실행 중이고 필요한 권한과 데이터가 준비되어 있어야 함',
            expectedResult: '테스트 시나리오에 따라 기능이 정상적으로 동작하고 예상 결과가 반환됨',
            postcondition: '테스트 후 시스템 상태가 일관성을 유지하고 추가 테스트가 가능한 상태',
            priority: 'MEDIUM',
            category: 'Functional',
            tags: ['functionality', projectType, 'general']
        };
    }
}

/**
 * 프로젝트 ID로부터 프로젝트 유형 결정
 */
function determineProjectType(projectId) {
    // 프로젝트 ID별 유형 매핑 (실제 생성된 프로젝트 기준)
    const projectMappings = {
        '780ce2cf': 'devops',      // CI/CD Pipeline Management
        '04b494ea': 'infrastructure', // Infrastructure as Code  
        'f5e6cf2d': 'ecommerce',   // E-Commerce Platform
        '4b105894': 'microservices', // Microservices Architecture
        '68e2bfbb': 'test-automation', // Test Automation Framework
        'ee0a63ff': 'performance'  // Performance Testing Suite
    };
    
    for (const [partialId, type] of Object.entries(projectMappings)) {
        if (projectId && projectId.includes(partialId)) {
            return type;
        }
    }
    
    return 'general';
}

/**
 * 테스트케이스 업데이트
 */
async function updateTestCase(testCaseId, updateData) {
    try {
        const response = await apiCall(`/testcases/${testCaseId}`, {
            method: 'PUT',
            body: JSON.stringify(updateData)
        });
        return response;
    } catch (error) {
        console.error(`❌ 테스트케이스 업데이트 실패 (ID: ${testCaseId}):`, error.message);
        throw error;
    }
}

/**
 * 테스트플랜 생성 시도
 */
async function createTestPlan(projectId, projectName, testCases = []) {
    const testCaseIds = testCases.map(tc => tc.id);

    const testPlanData = {
        name: `${projectName} 종합 테스트플랜`,
        description: `${projectName} 프로젝트의 모든 기능을 검증하는 종합적인 테스트 계획`,
        projectId: projectId,
        testCaseIds: testCaseIds
    };
    
    try {
        console.log(`📋 테스트플랜 생성 시도: ${testPlanData.name}`);
                const response = await apiCall('/test-plans', {
            method: 'POST',
            body: JSON.stringify(testPlanData)
        });
        console.log(`✅ 테스트플랜 생성 성공: ${response.id}`);
        return response;
    } catch (error) {
        console.error(`❌ 테스트플랜 생성 실패 (프로젝트: ${projectName}):`, error.message);
        // 403 오류의 경우 권한 문제일 수 있음을 알림
        if (error.message.includes('403')) {
            console.warn('   💡 권한 문제일 수 있습니다. API 엔드포인트나 사용자 권한을 확인하세요.');
        }
        return null;
    }
}

/**
 * 테스트 실행 생성
 */
async function createTestExecution(testPlan) {
    const executionData = {
        name: `${testPlan.name} - 실행 1`,
        description: `${testPlan.name}의 첫 번째 테스트 실행입니다.`,
        testPlanId: testPlan.id,
        projectId: testPlan.projectId,
        status: 'NOT_STARTED'
    };

    try {
        console.log(`   -> 🏃‍♂️ 테스트 실행 생성 시도: ${executionData.name}`);
        const response = await apiCall('/test-executions', {
            method: 'POST',
            body: JSON.stringify(executionData)
        });
        console.log(`   -> ✅ 테스트 실행 생성 성공: ${response.id}`);
        return response;
    } catch (error) {
        console.error(`   -> ❌ 테스트 실행 생성 실패 (테스트플랜: ${testPlan.name}):`, error.message);
        return null;
    }
}

/**
 * 테스트 실행 시작
 */
async function startTestExecution(executionId) {
    try {
        console.log(`      -> 🚀 테스트 실행 시작: ${executionId}`);
        const response = await apiCall(`/test-executions/${executionId}/start`, {
            method: 'POST'
        });
        console.log(`      -> ✅ 실행 시작 성공 (상태: ${response.status})`);
        return response;
    } catch (error) {
        console.error(`      -> ❌ 실행 시작 실패 (ID: ${executionId}):`, error.message);
        return null;
    }
}

/**
 * 무작위 테스트 결과 추가
 */
async function addRandomTestResults(execution, testCases) {
    console.log(`      -> 📝 테스트 결과 입력 시작... (실행 ID: ${execution.id})`);
    let resultsAdded = 0;
    const statuses = ['PASS', 'FAIL', 'BLOCKED'];

    for (const testCase of testCases) {
        const numberOfResults = Math.floor(Math.random() * 3) + 3; // 3 to 5 results

        for (let i = 0; i < numberOfResults; i++) {
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            let jiraIssueKey = null;

            if (randomStatus === 'FAIL' || randomStatus === 'BLOCKED') {
                const randomIssueNum = Math.floor(Math.random() * 200) + 1;
                jiraIssueKey = `ICT-${randomIssueNum}`;
            }

            const resultData = {
                result: randomStatus,
                testCaseId: testCase.id,
                notes: `자동 생성된 결과 ${i + 1}/${numberOfResults} - 상태: ${randomStatus}`,
                jiraIssueKey: jiraIssueKey
            };

            try {
                await apiCall(`/test-executions/${execution.id}/results`, {
                    method: 'POST',
                    body: JSON.stringify(resultData)
                });
                resultsAdded++;
            } catch (error) {
                console.error(`         -> ❌ 결과 입력 실패 (TC: ${testCase.name}):`, error.message);
            }
            await new Promise(resolve => setTimeout(resolve, 150)); // API call delay
        }
    }
    console.log(`      -> ✅ 테스트 결과 ${resultsAdded}개 입력 완료`);
    return resultsAdded;
}

/**
 * 메인 실행 함수
 */
async function fixTestCaseFields() {
    console.log('🚀 ICT-281: 테스트케이스 필수 필드 보완 시작...\n');
    
    try {
        // Step 1: 로그인
        await login();
        
        // Step 2: 모든 테스트케이스 조회
        console.log('📊 테스트케이스 조회 중...');
        const testCases = await apiCall('/testcases');
        console.log(`✅ 총 ${testCases.length}개의 테스트케이스 발견\n`);
        
        // Step 3: 프로젝트별 그룹화
        const projectGroups = {};
        testCases.forEach(tc => {
            if (!projectGroups[tc.projectId]) {
                projectGroups[tc.projectId] = [];
            }
            projectGroups[tc.projectId].push(tc);
        });
        
        console.log(`📂 ${Object.keys(projectGroups).length}개 프로젝트로 그룹화됨\n`);
        
        // Step 4: 각 프로젝트의 테스트케이스 필드 보완
        let totalUpdated = 0;
        let totalErrors = 0;
        
        for (const [projectId, projectTestCases] of Object.entries(projectGroups)) {
            console.log(`\n🔧 프로젝트 ${projectId} 처리 중... (${projectTestCases.length}개 테스트케이스)`);
            
            let projectUpdated = 0;
            
            for (const testCase of projectTestCases) {
                // 필수 필드가 누락된 경우만 업데이트
                if (!testCase.precondition || !testCase.expectedResult || !testCase.postcondition) {
                    try {
                        const enhancementData = getTestCaseEnhancementData(testCase);
                        
                        // 기존 데이터와 보완 데이터 병합
                        const updateData = {
                            ...testCase,
                            precondition: testCase.precondition || enhancementData.precondition,
                            expectedResult: testCase.expectedResult || enhancementData.expectedResult,
                            postcondition: testCase.postcondition || enhancementData.postcondition,
                            priority: testCase.priority || enhancementData.priority,
                            category: testCase.category || enhancementData.category,
                            tags: testCase.tags || enhancementData.tags
                        };
                        
                        await updateTestCase(testCase.id, updateData);
                        console.log(`   ✅ 업데이트: ${testCase.name}`);
                        projectUpdated++;
                        totalUpdated++;
                        
                        // API 부하 방지를 위한 지연
                        await new Promise(resolve => setTimeout(resolve, 100));
                        
                    } catch (error) {
                        console.error(`   ❌ 실패: ${testCase.name} - ${error.message}`);
                        totalErrors++;
                    }
                } else {
                    console.log(`   ⏭️ 스킵: ${testCase.name} (이미 완료)`);
                }
            }
            
            console.log(`   📊 프로젝트 완료: ${projectUpdated}개 업데이트됨`);
        }
        
        // Step 5: 테스트플랜 생성 시도
        console.log('\n\n🔄 테스트플랜 생성 시도...');
                const projects = await apiCall('/projects');
        let plansCreated = 0;
                let executionsCreated = 0; // 생성된 테스트 실행 카운터
                let executionsStarted = 0; // 시작된 테스트 실행 카운터
        let totalResultsAdded = 0; // 추가된 총 결과 카운터

        for (const project of projects) {
            const projectTestCases = projectGroups[project.id] || [];
            const testPlan = await createTestPlan(project.id, project.name, projectTestCases);
            if (testPlan) {
                plansCreated++;
                const execution = await createTestExecution(testPlan);
                if (execution) {
                    executionsCreated++;
                    const startedExecution = await startTestExecution(execution.id);
                    if (startedExecution) {
                        executionsStarted++;
                        const resultsCount = await addRandomTestResults(startedExecution, projectTestCases);
                        totalResultsAdded += resultsCount;
                    }
                }
            }
            // 각 시도 간 지연
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Step 6: 최종 결과 보고
        console.log('\n' + '='.repeat(60));
        console.log('🎉 ICT-281: 테스트케이스 필수 필드 보완 완료!');
        console.log('='.repeat(60));
        console.log(`✅ 성공적으로 업데이트된 테스트케이스: ${totalUpdated}개`);
        console.log(`❌ 실패한 업데이트: ${totalErrors}개`);
        console.log(`📋 생성된 테스트플랜: ${plansCreated}개`);
        console.log(`🏃‍♂️ 생성된 테스트 실행: ${executionsCreated}개`);
        console.log(`🚀 시작된 테스트 실행: ${executionsStarted}개`);
        console.log(`📝 입력된 테스트 결과: ${totalResultsAdded}개`);

        
        if (totalErrors > 0) {
            console.log('\n⚠️  일부 테스트케이스 업데이트가 실패했습니다.');
            console.log('   로그를 확인하고 필요시 수동으로 처리하세요.');
        }
        
        if (plansCreated === 0) {
            console.log('\n⚠️  테스트플랜 생성이 실패했습니다 (예상된 결과).');
            console.log('   권한 설정이나 API 엔드포인트를 확인하세요.');
        }
        
        console.log('\n📊 다음 단계:');
        console.log('1. 웹 인터페이스에서 테스트케이스 필드 확인');
        console.log('2. 테스트플랜 수동 생성 (필요시)');
        console.log('3. 테스트 실행 및 결과 입력 진행');
        
    } catch (error) {
        console.error('\n❌ 전체 프로세스 실패:', error.message);
        console.error('스택 트레이스:', error.stack);
        process.exit(1);
    }
}

// 스크립트 실행
if (require.main === module) {
    fixTestCaseFields().catch(console.error);
}

module.exports = { fixTestCaseFields, getTestCaseEnhancementData };