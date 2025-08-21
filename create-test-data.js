// create-test-data.js
// ICT-265: 중복 데이터 검증을 위한 대량 테스트 데이터 생성 스크립트

const baseURL = 'http://localhost:8080';

// API 호출 헬퍼 함수
async function apiCall(endpoint, options = {}) {
    const url = `${baseURL}${endpoint}`;
    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    });
    
    if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
}

// 인증 토큰 획득
async function getAuthToken() {
    const response = await apiCall('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
            username: 'admin',
            password: 'admin'
        })
    });
    return response.accessToken;
}

// 테스트케이스 생성
async function createTestCase(token, projectId, name, description, priority = 'MEDIUM') {
    return apiCall('/api/testcases', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name: name,
            description: description,
            projectId: projectId,
            priority: priority,
            status: 'ACTIVE',
            type: 'MANUAL',
            executionTime: 30
        })
    });
}

// 테스트플랜 생성
async function createTestPlan(token, projectId, name, description, testCaseIds = []) {
    return apiCall('/api/testplans', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name: name,
            description: description,
            projectId: projectId,
            status: 'DRAFT',
            testCaseIds: testCaseIds
        })
    });
}

// 테스트실행 생성
async function createTestExecution(token, projectId, testPlanId, name, description) {
    return apiCall('/api/executions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name: name,
            description: description,
            projectId: projectId,
            testPlanId: testPlanId,
            status: 'INPROGRESS',
            scheduledStartTime: new Date().toISOString(),
            assignedUserId: null
        })
    });
}

// 테스트 결과 생성 (중복 데이터 포함)
async function createTestResult(token, testExecutionId, testCaseId, result, executedAt, notes = '') {
    return apiCall('/api/test-results', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            testExecutionId: testExecutionId,
            testCaseId: testCaseId,
            result: result,
            notes: notes,
            executedAt: executedAt,
            executionTime: Math.floor(Math.random() * 300) + 30 // 30-330초
        })
    });
}

// 메인 데이터 생성 함수
async function createTestData() {
    console.log('🚀 ICT-265: 테스트 데이터 생성 시작');
    
    try {
        // 1. 인증
        const token = await getAuthToken();
        console.log('✅ 인증 완료');
        
        // 2. 프로젝트 조회
        const projects = await apiCall('/api/projects', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const projectId = projects[0].id;
        console.log(`🎯 프로젝트 선택: ${projects[0].name} (${projectId})`);
        
        // 3. 테스트케이스 100개 생성
        console.log('📝 테스트케이스 100개 생성 중...');
        const testCases = [];
        
        for (let i = 1; i <= 100; i++) {
            const priority = ['HIGH', 'MEDIUM', 'LOW'][Math.floor(Math.random() * 3)];
            const testCase = await createTestCase(
                token, 
                projectId, 
                `테스트케이스_${i.toString().padStart(3, '0')}`,
                `ICT-265 검증용 테스트케이스 #${i} - 중복 데이터 테스트를 위한 케이스입니다.`,
                priority
            );
            testCases.push(testCase);
            
            if (i % 20 === 0) {
                console.log(`  ✅ ${i}/100 테스트케이스 생성 완료`);
            }
        }
        
        console.log('✅ 테스트케이스 100개 생성 완료');
        
        // 4. 테스트플랜 10개 생성
        console.log('📋 테스트플랜 10개 생성 중...');
        const testPlans = [];
        
        for (let i = 1; i <= 10; i++) {
            // 각 플랜에 10-15개의 테스트케이스 할당
            const startIdx = (i - 1) * 10;
            const endIdx = startIdx + 10 + Math.floor(Math.random() * 6); // 10-15개
            const assignedTestCases = testCases.slice(startIdx, Math.min(endIdx, testCases.length));
            const testCaseIds = assignedTestCases.map(tc => tc.id);
            
            const testPlan = await createTestPlan(
                token,
                projectId,
                `테스트플랜_${i.toString().padStart(2, '0')}`,
                `ICT-265 검증용 테스트플랜 #${i} - ${testCaseIds.length}개 테스트케이스 포함`,
                testCaseIds
            );
            testPlans.push(testPlan);
            console.log(`  ✅ ${i}/10 테스트플랜 생성 완료 (${testCaseIds.length}개 테스트케이스)`);
        }
        
        console.log('✅ 테스트플랜 10개 생성 완료');
        
        // 5. 테스트실행 3개 생성
        console.log('🔄 테스트실행 3개 생성 중...');
        const testExecutions = [];
        
        for (let i = 1; i <= 3; i++) {
            // 각 실행에 3-4개의 테스트플랜 할당
            const assignedPlans = testPlans.slice((i - 1) * 3, i * 3 + 1);
            
            for (const plan of assignedPlans) {
                const execution = await createTestExecution(
                    token,
                    projectId,
                    plan.id,
                    `테스트실행_${i}_${plan.name}`,
                    `ICT-265 검증용 테스트실행 #${i} - ${plan.name} 기반 실행`
                );
                testExecutions.push(execution);
            }
            
            console.log(`  ✅ ${i}/3 테스트실행 그룹 생성 완료`);
        }
        
        console.log('✅ 테스트실행 3개 그룹 생성 완료');
        
        // 6. 테스트 결과 생성 (중복 데이터 포함)
        console.log('📊 테스트 결과 생성 중 (중복 데이터 포함)...');
        
        const results = ['PASS', 'FAIL', 'BLOCKED', 'SKIPPED'];
        let resultCount = 0;
        
        for (const execution of testExecutions) {
            // 각 실행에 대해 50-80개의 결과 생성
            const numResults = 50 + Math.floor(Math.random() * 31);
            
            for (let i = 0; i < numResults; i++) {
                const testCase = testCases[Math.floor(Math.random() * testCases.length)];
                const result = results[Math.floor(Math.random() * results.length)];
                const baseTime = new Date();
                const executedAt = new Date(baseTime.getTime() + i * 60000); // 1분 간격
                
                await createTestResult(
                    token,
                    execution.id,
                    testCase.id,
                    result,
                    executedAt.toISOString(),
                    `ICT-265 테스트 결과 #${resultCount + 1}`
                );
                
                resultCount++;
            }
            
            // 의도적 중복 데이터 생성 (같은 execution + testCase 조합에 다른 시간)
            const duplicateCount = 10 + Math.floor(Math.random() * 11); // 10-20개 중복
            
            for (let i = 0; i < duplicateCount; i++) {
                const testCase = testCases[Math.floor(Math.random() * Math.min(20, testCases.length))];
                const result = results[Math.floor(Math.random() * results.length)];
                const laterTime = new Date(Date.now() + (i + 100) * 60000); // 나중 시간
                
                await createTestResult(
                    token,
                    execution.id,
                    testCase.id,
                    result,
                    laterTime.toISOString(),
                    `ICT-265 중복 테스트 결과 #${resultCount + 1} (더 나중 실행)`
                );
                
                resultCount++;
            }
            
            console.log(`  ✅ ${execution.name}: ${numResults + duplicateCount}개 결과 (중복 ${duplicateCount}개 포함)`);
        }
        
        console.log(`✅ 총 ${resultCount}개 테스트 결과 생성 완료 (중복 데이터 포함)`);
        
        // 7. 생성된 데이터 요약
        console.log('\n🎉 ICT-265 테스트 데이터 생성 완료!');
        console.log('='.repeat(50));
        console.log(`📝 테스트케이스: ${testCases.length}개`);
        console.log(`📋 테스트플랜: ${testPlans.length}개`);
        console.log(`🔄 테스트실행: ${testExecutions.length}개`);
        console.log(`📊 테스트결과: ${resultCount}개 (중복 데이터 포함)`);
        console.log(`🎯 프로젝트: ${projects[0].name}`);
        console.log('\n💡 이제 대시보드 API에서 중복 제거 로직을 테스트할 수 있습니다!');
        
    } catch (error) {
        console.error('❌ 테스트 데이터 생성 실패:', error.message);
        throw error;
    }
}

// Node.js 환경에서 실행
if (typeof require !== 'undefined' && require.main === module) {
    // Node.js 환경용 fetch 폴리필
    if (typeof fetch === 'undefined') {
        global.fetch = require('node-fetch');
    }
    
    createTestData().catch(console.error);
}

module.exports = { createTestData };