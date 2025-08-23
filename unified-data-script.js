// unified-data-script.js
// 이 스크립트는 조직, 프로젝트, 테스트케이스 등 초기 데이터를 생성하고,
// 기존 데이터의 필드를 보완하며, 테스트 플랜과 실행, 결과를 추가하는 통합 스크립트입니다.

const baseURL = 'http://localhost:8080/api';
let authToken = '';

// ===================================================================================
// 헬퍼 함수 (공통)
// ===================================================================================

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
        
        if (response.status === 204) {
            return null;
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

// ===================================================================================
// 1단계: 초기 데이터 생성 함수
// ===================================================================================

function getTestCasesForProject(projectCode) {
    return [
        { name: `${projectCode}_TC001_로그인_기능_테스트`, description: '사용자 로그인 기능의 정상 동작을 검증', priority: 'HIGH', category: '기능 테스트', tags: ['login', 'auth'], expectedResult: '로그인 성공 후 메인 대시보드 이동', precondition: '유효한 계정 존재', postcondition: '로그인 상태 유지' },
        { name: `${projectCode}_TC002_데이터_조회_기능_테스트`, description: '데이터 조회 기능의 정확성 검증', priority: 'HIGH', category: '기능 테스트', tags: ['data', 'query'], expectedResult: '정확한 데이터 조회', precondition: '테스트 데이터 준비', postcondition: '조회 후 화면 정상' },
        { name: `${projectCode}_TC003_데이터_입력_기능_테스트`, description: '새 데이터 입력 기능 검증', priority: 'HIGH', category: '기능 테스트', tags: ['input', 'create'], expectedResult: '새 데이터 정상 저장', precondition: '입력 권한 보유', postcondition: 'DB에 데이터 저장' },
        { name: `${projectCode}_TC004_데이터_수정_기능_테스트`, description: '기존 데이터 수정 기능 검증', priority: 'MEDIUM', category: '기능 테스트', tags: ['update', 'edit'], expectedResult: '데이터 정상 수정', precondition: '수정할 데이터 존재', postcondition: '수정 내용 정확히 반영' },
        { name: `${projectCode}_TC005_데이터_삭제_기능_테스트`, description: '데이터 삭제 기능 검증', priority: 'MEDIUM', category: '기능 테스트', tags: ['delete', 'remove'], expectedResult: '데이터 안전하게 삭제', precondition: '삭제할 데이터 존재', postcondition: '시스템에서 데이터 완전 제거' },
        { name: `${projectCode}_TC006_권한_관리_기능_테스트`, description: '사용자 권한 관리 및 접근 제어 검증', priority: 'HIGH', category: '보안 테스트', tags: ['auth', 'permission'], expectedResult: '권한에 따른 접근 제어 동작', precondition: '다양한 권한의 사용자 준비', postcondition: '권한 변경 즉시 적용' },
        { name: `${projectCode}_TC007_파일_업로드_기능_테스트`, description: '파일 업로드 기능 검증', priority: 'MEDIUM', category: '기능 테스트', tags: ['upload', 'file'], expectedResult: '파일 정상 업로드 및 저장', precondition: '업로드할 파일 준비', postcondition: '서버에 파일 안전하게 저장' },
        { name: `${projectCode}_TC008_검색_필터_기능_테스트`, description: '고급 검색 및 필터링 기능 검증', priority: 'MEDIUM', category: '기능 테스트', tags: ['search', 'filter'], expectedResult: '정확한 검색 결과 표시', precondition: '다양한 테스트 데이터 준비', postcondition: '검색 결과 정확 및 성능 양호' },
        { name: `${projectCode}_TC009_성능_최적화_테스트`, description: '시스템 성능 및 응답 시간 최적화 검증', priority: 'HIGH', category: '성능 테스트', tags: ['performance', 'optimization'], expectedResult: '정의된 성능 기준 만족', precondition: '성능 테스트 환경 구축', postcondition: '성능 지표 기준치 이내' },
        { name: `${projectCode}_TC010_보안_취약점_테스트`, description: '시스템 보안 취약점 검증', priority: 'HIGH', category: '보안 테스트', tags: ['security', 'vulnerability'], expectedResult: '알려진 보안 취약점 차단', precondition: '보안 테스트 도구 준비', postcondition: '보안 이슈 즉시 수정' },
        { name: `${projectCode}_TC011_API_통합_테스트`, description: '외부 API 연동 및 통합 기능 검증', priority: 'HIGH', category: '통합 테스트', tags: ['api', 'integration'], expectedResult: '외부 API와 정상 연동', precondition: '외부 API 사용 가능 상태', postcondition: 'API 응답 정확히 반영' },
        { name: `${projectCode}_TC012_데이터_백업_복원_테스트`, description: '데이터 백업 및 복원 신뢰성 검증', priority: 'HIGH', category: '시스템 테스트', tags: ['backup', 'restore'], expectedResult: '데이터 백업/복원 완전 수행', precondition: '백업 시스템 준비', postcondition: '복원 데이터 원본과 일치' },
    ];
}

async function createInitialData() {
    console.log('\n' + '='.repeat(60));
    console.log('🌱 1단계: 초기 조직, 프로젝트, 테스트케이스 데이터 생성 시작...');
    console.log('='.repeat(60));

    let orgsCreated = 0;
    let projectsCreated = 0;
    let testCasesCreated = 0;

    try {
        const existingOrgs = await apiCall('/organizations');
        console.log(`🏢 기존 ${existingOrgs.length}개 조직 발견`);

        const orgsToCreate = [
            { name: '데브옵스팀', description: 'DevOps 팀' },
            { name: '개발팀', description: 'Application Development 팀' },
            { name: 'QA팀', description: 'Quality Assurance 팀' }
        ];

        for (const orgData of orgsToCreate) {
            if (!existingOrgs.some(org => org.name === orgData.name)) {
                try {
                    console.log(`  -> 🏢 조직 생성 시도: ${orgData.name}`);
                    await apiCall('/organizations', { method: 'POST', body: JSON.stringify(orgData) });
                    orgsCreated++;
                } catch (error) { /* 실패해도 계속 진행 */ }
            }
        }
        
        const allOrgs = await apiCall('/organizations');

        for (const org of allOrgs) {
            const projectsData = {
                '데브옵스팀': [{ name: 'CI/CD Pipeline Management', code: 'CICD' }, { name: 'Infrastructure as Code', code: 'IAC' }],
                '개발팀': [{ name: 'E-Commerce Platform', code: 'ECOM' }, { name: 'Microservices Architecture', code: 'MSA' }],
                'QA팀': [{ name: 'Test Automation Framework', code: 'TAF' }, { name: 'Performance Testing Suite', code: 'PERF' }]
            };

            const orgProjects = projectsData[org.name] || [];
            
            for (const projectData of orgProjects) {
                try {
                    console.log(`  -> 📁 프로젝트 생성 시도: ${projectData.name}`);
                    const project = await apiCall('/projects', { method: 'POST', body: JSON.stringify({ ...projectData, organizationId: org.id }) });
                    projectsCreated++;
                    
                    const testCasesData = getTestCasesForProject(project.code);
                    for (const tcData of testCasesData) {
                        try {
                            await apiCall('/testcases', { method: 'POST', body: JSON.stringify({ ...tcData, projectId: project.id }) });
                            testCasesCreated++;
                        } catch (error) { /* 실패해도 계속 진행 */ }
                    }
                    console.log(`  -> ✅ '${project.name}' 프로젝트 및 TC ${testCasesData.length}개 생성 완료`);
                } catch (error) {
                    if (error.message && error.message.includes("이미 사용 중인 프로젝트 코드입니다")) {
                        console.log(`  -> ⏭️ 스킵: '${projectData.name}' 프로젝트가 이미 존재합니다.`);
                    } else {
                        console.error(`  -> ❌ 프로젝트 생성 실패: ${projectData.name}`, error.message);
                    }
                }
            }
        }
        console.log('\n🌱 1단계 데이터 생성 완료!');
        console.log(`   - 신규 생성된 조직: ${orgsCreated}개`);
        console.log(`   - 신규 생성된 프로젝트: ${projectsCreated}개`);
        console.log(`   - 신규 생성된 테스트케이스: ${testCasesCreated}개`);

    } catch (error) {
        console.error('❌ 초기 데이터 생성 중 심각한 오류 발생:', error.message);
    }
}

// ===================================================================================
// 2단계: 데이터 보강 및 테스트 실행 함수
// ===================================================================================

function getTestCaseEnhancementData(testCase) {
    const testCaseName = testCase.name || '';
    const projectType = determineProjectType(testCase.projectId);
    if (testCaseName.includes('로그인')) return { priority: 'HIGH', category: 'Authentication', tags: ['login', 'security'] };
    if (testCaseName.includes('생성')) return { priority: 'HIGH', category: 'CRUD', tags: ['create', projectType] };
    if (testCaseName.includes('수정')) return { priority: 'MEDIUM', category: 'CRUD', tags: ['update', projectType] };
    if (testCaseName.includes('삭제')) return { priority: 'HIGH', category: 'CRUD', tags: ['delete', projectType] };
    if (testCaseName.includes('검색')) return { priority: 'MEDIUM', category: 'Search', tags: ['search', 'filter'] };
    return { priority: 'MEDIUM', category: 'Functional', tags: ['general', projectType] };
}

function determineProjectType(projectId) {
    const mappings = { 'CICD': 'devops', 'IAC': 'infrastructure', 'ECOM': 'ecommerce', 'MSA': 'microservices', 'TAF': 'automation', 'PERF': 'performance' };
    for (const [code, type] of Object.entries(mappings)) {
        if (projectId && projectId.includes(code)) return type;
    }
    return 'general';
}

async function createTestPlan(projectId, projectName, testCases = []) {
    const testCaseIds = testCases.map(tc => tc.id);
    const testPlanData = { name: `${projectName} 종합 테스트플랜`, description: `...`, projectId, testCaseIds };
    try {
        console.log(`  -> 📋 테스트플랜 생성 시도: ${testPlanData.name}`);
        const response = await apiCall('/test-plans', { method: 'POST', body: JSON.stringify(testPlanData) });
        console.log(`    -> ✅ 테스트플랜 생성 성공: ${response.id}`);
        return response;
    } catch (error) {
        return null;
    }
}

async function createTestExecution(testPlan) {
    const executionData = { name: `${testPlan.name} - 실행 1`, description: `...`, testPlanId: testPlan.id, projectId: testPlan.projectId, status: 'NOT_STARTED' };
    try {
        console.log(`    -> 🏃‍♂️ 테스트 실행 생성 시도: ${executionData.name}`);
        const response = await apiCall('/test-executions', { method: 'POST', body: JSON.stringify(executionData) });
        console.log(`      -> ✅ 테스트 실행 생성 성공: ${response.id}`);
        return response;
    } catch (error) {
        return null;
    }
}

async function startTestExecution(executionId) {
    try {
        console.log(`        -> 🚀 테스트 실행 시작: ${executionId}`);
        const response = await apiCall(`/test-executions/${executionId}/start`, { method: 'POST' });
        console.log(`          -> ✅ 실행 시작 성공 (상태: ${response.status})`);
        return response;
    } catch (error) {
        return null;
    }
}

async function addRandomTestResults(execution, testCases) {
    console.log(`        -> 📝 테스트 결과 입력 시작...`);
    let resultsAdded = 0;
    const statuses = ['PASS', 'FAIL', 'BLOCKED'];
    for (const testCase of testCases) {
        const numberOfResults = Math.floor(Math.random() * 3) + 3;
        for (let i = 0; i < numberOfResults; i++) {
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            let jiraIssueKey = (randomStatus !== 'PASS') ? `ICT-${Math.floor(Math.random() * 200) + 1}` : null;
            const resultData = { result: randomStatus, testCaseId: testCase.id, notes: `자동 생성 결과 ${i + 1}`, jiraIssueKey };
            try {
                await apiCall(`/test-executions/${execution.id}/results`, { method: 'POST', body: JSON.stringify(resultData) });
                resultsAdded++;
            } catch (error) { /* 실패해도 계속 진행 */ }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    console.log(`          -> ✅ 테스트 결과 ${resultsAdded}개 입력 완료`);
    return resultsAdded;
}

async function augmentAndReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🔧 2단계: 기존 데이터 보강 및 테스트 실행 시작...');
    console.log('='.repeat(60));
    
    let totalUpdated = 0, totalErrors = 0, plansCreated = 0, executionsCreated = 0, executionsStarted = 0, totalResultsAdded = 0;

    try {
        const allTestCases = await apiCall('/testcases');
        console.log(`📊 총 ${allTestCases.length}개의 테스트케이스 발견`);
        
        const projectGroups = allTestCases.reduce((acc, tc) => {
            (acc[tc.projectId] = acc[tc.projectId] || []).push(tc);
            return acc;
        }, {});
        console.log(`📂 ${Object.keys(projectGroups).length}개 프로젝트로 그룹화됨`);
        
        for (const [projectId, testCases] of Object.entries(projectGroups)) {
            for (const testCase of testCases) {
                if (!testCase.precondition || !testCase.expectedResult) {
                    try {
                        const enhancementData = getTestCaseEnhancementData(testCase);
                        const updateData = { ...testCase, ...enhancementData };
                        await apiCall(`/testcases/${testCase.id}`, { method: 'PUT', body: JSON.stringify(updateData) });
                        totalUpdated++;
                    } catch (error) { totalErrors++; }
                }
            }
        }
        console.log(`✅ ${totalUpdated}개 테스트케이스 필드 보완 완료`);

        console.log('\n🔄 테스트플랜, 실행, 결과 생성 시도...');
        const projects = await apiCall('/projects');
        for (const project of projects) {
            const projectTestCases = projectGroups[project.id] || [];
            if (projectTestCases.length === 0) continue;
            
            console.log(`\n-> ⚙️ 처리 중: '${project.name}' 프로젝트`);
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
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
    } catch (error) {
        console.error('\n❌ 데이터 보강 중 심각한 오류 발생:', error.message);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 2단계 데이터 보강 및 테스트 실행 완료!');
    console.log('='.repeat(60));
    console.log(`- 필드 보완된 테스트케이스: ${totalUpdated}개`);
    console.log(`- 생성된 테스트플랜: ${plansCreated}개`);
    console.log(`- 생성된 테스트 실행: ${executionsCreated}개`);
    console.log(`- 시작된 테스트 실행: ${executionsStarted}개`);
    console.log(`- 입력된 테스트 결과: ${totalResultsAdded}개`);
    console.log(`- 실패한 업데이트: ${totalErrors}개`);
}

// ===================================================================================
// 메인 실행 영역
// ===================================================================================

async function main() {
    console.log('🚀 통합 데이터 생성 및 보강 스크립트 시작...');
    try {
        await login();
        await createInitialData();
        await augmentAndReport();
        console.log('\n\n🎊 모든 작업이 성공적으로 완료되었습니다!');
    } catch (error) {
        console.error("\n💥 스크립트 실행 중 치명적인 오류가 발생했습니다:", error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}
