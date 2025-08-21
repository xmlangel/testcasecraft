// simple-test-data.js
// ICT-265: 중복 데이터 검증을 위한 간단한 테스트 데이터 생성

const fetch = require('node-fetch');
const baseURL = 'http://localhost:8080';

async function createTestData() {
    try {
        console.log('🚀 ICT-265: 간단한 테스트 데이터 생성 시작');
        
        // 1. 인증
        const authResponse = await fetch(`${baseURL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin'
            })
        });
        
        if (!authResponse.ok) {
            throw new Error(`로그인 실패: ${authResponse.status}`);
        }
        
        const authData = await authResponse.json();
        const token = authData.accessToken;
        console.log('✅ 인증 완료');
        
        // 2. 프로젝트 목록 확인
        const projectsResponse = await fetch(`${baseURL}/api/projects`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!projectsResponse.ok) {
            throw new Error(`프로젝트 조회 실패: ${projectsResponse.status}`);
        }
        
        const projects = await projectsResponse.json();
        console.log(`🎯 프로젝트 ${projects.length}개 확인됨`);
        
        if (projects.length === 0) {
            throw new Error('프로젝트가 없습니다.');
        }
        
        const projectId = projects[0].id;
        console.log(`📁 사용할 프로젝트: ${projects[0].name} (${projectId})`);
        
        // 3. 테스트케이스 20개 생성
        console.log('📝 테스트케이스 20개 생성 중...');
        const testCases = [];
        
        for (let i = 1; i <= 20; i++) {
            const testCaseData = {
                name: `ICT265_테스트케이스_${i.toString().padStart(2, '0')}`,
                description: `ICT-265 중복 데이터 검증용 테스트케이스 #${i}`,
                projectId: projectId,
                priority: ['HIGH', 'MEDIUM', 'LOW'][i % 3],
                status: 'ACTIVE',
                type: 'MANUAL',
                executionTime: 30 + (i * 5)
            };
            
            const response = await fetch(`${baseURL}/api/testcases`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(testCaseData)
            });
            
            if (response.ok) {
                const testCase = await response.json();
                testCases.push(testCase);
                console.log(`  ✅ 테스트케이스 ${i}/20 생성: ${testCase.name}`);
            } else {
                console.log(`  ⚠️ 테스트케이스 ${i} 생성 실패: ${response.status}`);
                // 실패해도 계속 진행
            }
        }
        
        console.log(`✅ 테스트케이스 ${testCases.length}개 생성 완료`);
        
        // 4. 테스트플랜 3개 생성
        console.log('📋 테스트플랜 3개 생성 중...');
        const testPlans = [];
        
        for (let i = 1; i <= 3; i++) {
            // 테스트케이스 ID만 전달
            const testCaseIds = testCases.slice((i-1)*6, i*6 + 2).map(tc => tc.id);
            
            const testPlanData = {
                name: `ICT265_테스트플랜_${i}`,
                description: `ICT-265 중복 데이터 검증용 테스트플랜 #${i} (${testCaseIds.length}개 케이스)`,
                projectId: projectId,
                status: 'ACTIVE',
                testCaseIds: testCaseIds
            };
            
            const response = await fetch(`${baseURL}/api/testplans`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(testPlanData)
            });
            
            if (response.ok) {
                const testPlan = await response.json();
                testPlans.push(testPlan);
                console.log(`  ✅ 테스트플랜 ${i}/3 생성: ${testPlan.name}`);
            } else {
                const errorText = await response.text();
                console.log(`  ⚠️ 테스트플랜 ${i} 생성 실패: ${response.status} - ${errorText}`);
            }
        }
        
        console.log(`✅ 테스트플랜 ${testPlans.length}개 생성 완료`);
        
        // 5. 테스트실행 2개 생성
        console.log('🔄 테스트실행 2개 생성 중...');
        const testExecutions = [];
        
        for (let i = 1; i <= 2; i++) {
            if (testPlans.length > i-1) {
                const testPlan = testPlans[i-1];
                
                const testExecutionData = {
                    name: `ICT265_테스트실행_${i}`,
                    description: `ICT-265 중복 데이터 검증용 테스트실행 #${i}`,
                    projectId: projectId,
                    testPlanId: testPlan.id,
                    status: 'INPROGRESS',
                    scheduledStartTime: new Date().toISOString()
                };
                
                const response = await fetch(`${baseURL}/api/executions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(testExecutionData)
                });
                
                if (response.ok) {
                    const testExecution = await response.json();
                    testExecutions.push(testExecution);
                    console.log(`  ✅ 테스트실행 ${i}/2 생성: ${testExecution.name}`);
                } else {
                    const errorText = await response.text();
                    console.log(`  ⚠️ 테스트실행 ${i} 생성 실패: ${response.status} - ${errorText}`);
                }
            }
        }
        
        console.log(`✅ 테스트실행 ${testExecutions.length}개 생성 완료`);
        
        // 6. 생성된 데이터 요약
        console.log('\n🎉 ICT-265 기본 테스트 데이터 생성 완료!');
        console.log('='.repeat(50));
        console.log(`📝 테스트케이스: ${testCases.length}개`);
        console.log(`📋 테스트플랜: ${testPlans.length}개`);
        console.log(`🔄 테스트실행: ${testExecutions.length}개`);
        console.log(`🎯 프로젝트: ${projects[0].name}`);
        
        console.log('\n💡 이제 H2 콘솔에서 직접 중복 테스트 결과를 생성하거나');
        console.log('   대시보드 API를 테스트할 수 있습니다!');
        console.log('\n🔗 H2 콘솔: http://localhost:8080/h2-console');
        console.log('   JDBC URL: jdbc:h2:mem:testdb');
        console.log('   User: sa, Password: (empty)');
        
        return {
            testCases,
            testPlans, 
            testExecutions,
            projectId
        };
        
    } catch (error) {
        console.error('❌ 테스트 데이터 생성 실패:', error.message);
        throw error;
    }
}

// 실행
createTestData().catch(console.error);