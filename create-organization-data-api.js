// API 클라이언트 설정
const baseURL = 'http://localhost:8080/api';
let authToken = '';

// API 호출 헬퍼 함수
async function apiCall(endpoint, options = {}) {
    const url = `${baseURL}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorData}`);
    }

    return response.json();
}

// 로그인 함수
async function login() {
    try {
        console.log('🔐 로그인 중...');
        const response = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                username: 'admin',
                password: 'admin'
            })
        });
        
        authToken = response.accessToken;
        console.log('✅ 로그인 성공');
        return authToken;
    } catch (error) {
        console.error('❌ 로그인 실패:', error.message);
        throw error;
    }
}

// 조직 목록 조회
async function getOrganizations() {
    try {
        const response = await apiCall('/organizations', {
            method: 'GET'
        });
        return response;
    } catch (error) {
        console.error('❌ 조직 목록 조회 실패:', error.message);
        throw error;
    }
}

// 프로젝트 생성
async function createProject(organizationId, projectData) {
    try {
        console.log(`📁 프로젝트 생성: ${projectData.name}`);
        const response = await apiCall('/projects', {
            method: 'POST',
            body: JSON.stringify({
                ...projectData,
                organizationId: organizationId
            })
        });
        console.log(`✅ 프로젝트 생성 완료: ${projectData.name}`);
        return response;
    } catch (error) {
        console.error(`❌ 프로젝트 생성 실패: ${projectData.name}`, error.message);
        throw error;
    }
}

// 테스트케이스 생성
async function createTestCase(projectId, testCaseData) {
    try {
        console.log(`  📝 테스트케이스 생성: ${testCaseData.name}`);
        const response = await apiCall('/testcases', {
            method: 'POST',
            body: JSON.stringify({
                ...testCaseData,
                projectId: projectId
            })
        });
        console.log(`    ✅ 테스트케이스 생성 완료: ${testCaseData.name}`);
        return response;
    } catch (error) {
        console.error(`    ❌ 테스트케이스 생성 실패: ${testCaseData.name}`, error.message);
        throw error;
    }
}

// 테스트플랜 생성
async function createTestPlan(projectId, testPlanData, testCaseIds) {
    try {
        console.log(`  📋 테스트플랜 생성: ${testPlanData.name}`);
        const response = await apiCall('/testplans', {
            method: 'POST',
            body: JSON.stringify({
                ...testPlanData,
                projectId: projectId,
                testCaseIds: testCaseIds
            })
        });
        console.log(`    ✅ 테스트플랜 생성 완료: ${testPlanData.name}`);
        return response;
    } catch (error) {
        console.error(`    ❌ 테스트플랜 생성 실패: ${testPlanData.name}`, error.message);
        throw error;
    }
}

// 테스트 실행 생성
async function createTestExecution(projectId, testPlanId, executionData) {
    try {
        console.log(`  🚀 테스트 실행 생성: ${executionData.name}`);
        const response = await apiCall('/testexecutions', {
            method: 'POST',
            body: JSON.stringify({
                ...executionData,
                projectId: projectId,
                testPlanId: testPlanId
            })
        });
        console.log(`    ✅ 테스트 실행 생성 완료: ${executionData.name}`);
        return response;
    } catch (error) {
        console.error(`    ❌ 테스트 실행 생성 실패: ${executionData.name}`, error.message);
        throw error;
    }
}

// 테스트 결과 입력
async function createTestResult(testExecutionId, testCaseId, resultData) {
    try {
        console.log(`    📊 테스트 결과 입력: ${resultData.result}`);
        const response = await apiCall('/testresults', {
            method: 'POST',
            body: JSON.stringify({
                ...resultData,
                testExecutionId: testExecutionId,
                testCaseId: testCaseId
            })
        });
        console.log(`      ✅ 테스트 결과 입력 완료: ${resultData.result}`);
        return response;
    } catch (error) {
        console.error(`      ❌ 테스트 결과 입력 실패:`, error.message);
        throw error;
    }
}

// 메인 데이터 생성 함수
async function createOrganizationTestData() {
    try {
        console.log('🚀 조직별 테스트 데이터 생성 시작...\n');

        // 로그인
        await login();

        // 조직 목록 조회
        console.log('🏢 조직 목록 조회...');
        const organizations = await getOrganizations();
        console.log(`✅ ${organizations.length}개 조직 발견\n`);

        // 각 조직별로 데이터 생성
        for (const org of organizations) {
            console.log(`🏢 ${org.name} 조직 데이터 생성 중...`);

            // 조직별 프로젝트 정의
            const projectsData = {
                '데브옵스팀': [
                    {
                        name: 'CI/CD Pipeline Management',
                        code: 'CICD',
                        description: 'Continuous Integration/Continuous Deployment 파이프라인 관리 및 자동화'
                    },
                    {
                        name: 'Infrastructure as Code',
                        code: 'IAC',
                        description: 'Terraform, Ansible을 활용한 인프라 코드화 프로젝트'
                    }
                ],
                '개발팀': [
                    {
                        name: 'E-Commerce Platform',
                        code: 'ECOM',
                        description: '대규모 전자상거래 플랫폼 개발 및 운영'
                    },
                    {
                        name: 'Microservices Architecture',
                        code: 'MSA',
                        description: '마이크로서비스 아키텍처 기반 분산 시스템 구축'
                    }
                ],
                'QA팀': [
                    {
                        name: 'Test Automation Framework',
                        code: 'TAF',
                        description: '자동화 테스트 프레임워크 구축 및 테스트 자동화'
                    },
                    {
                        name: 'Performance Testing Suite',
                        code: 'PERF',
                        description: '성능 테스트 및 부하 테스트 도구 개발'
                    }
                ]
            };

            const orgProjects = projectsData[org.name] || [];
            
            for (const projectData of orgProjects) {
                try {
                    // 프로젝트 생성
                    const project = await createProject(org.id, projectData);
                    
                    // 테스트케이스 데이터 (10개 이상, 모든 항목 포함, 3개 이상 스텝)
                    const testCasesData = [
                        {
                            name: `${projectData.code}_TC001_로그인_기능_테스트`,
                            description: '사용자 로그인 기능의 정상 동작을 검증하는 테스트케이스',
                            priority: 'HIGH',
                            category: '기능 테스트',
                            tags: ['login', 'authentication', 'security'],
                            expectedResult: '정상적인 로그인 후 메인 대시보드로 이동',
                            precondition: '유효한 사용자 계정이 존재해야 함',
                            postcondition: '로그인 상태가 유지되어야 함',
                            steps: [
                                {
                                    stepNumber: 1,
                                    description: '로그인 페이지에 접속한다',
                                    expectedResult: '로그인 폼이 정상적으로 표시된다'
                                },
                                {
                                    stepNumber: 2,
                                    description: '유효한 사용자명과 패스워드를 입력한다',
                                    expectedResult: '입력 필드에 데이터가 정상적으로 입력된다'
                                },
                                {
                                    stepNumber: 3,
                                    description: '로그인 버튼을 클릭한다',
                                    expectedResult: '메인 대시보드 페이지로 리다이렉트된다'
                                },
                                {
                                    stepNumber: 4,
                                    description: '로그인 상태를 확인한다',
                                    expectedResult: '사용자 정보가 헤더에 표시된다'
                                }
                            ]
                        },
                        {
                            name: `${projectData.code}_TC002_데이터_조회_기능_테스트`,
                            description: '시스템 내 데이터 조회 기능의 정확성을 검증하는 테스트케이스',
                            priority: 'HIGH',
                            category: '기능 테스트',
                            tags: ['data', 'query', 'database'],
                            expectedResult: '정확한 데이터가 정상적으로 조회됨',
                            precondition: '테스트 데이터가 데이터베이스에 준비되어 있어야 함',
                            postcondition: '데이터 조회 후 화면 상태가 정상이어야 함',
                            steps: [
                                {
                                    stepNumber: 1,
                                    description: '데이터 목록 페이지에 접속한다',
                                    expectedResult: '데이터 목록 화면이 정상적으로 로드된다'
                                },
                                {
                                    stepNumber: 2,
                                    description: '검색 조건을 입력한다',
                                    expectedResult: '검색 필터가 정상적으로 적용된다'
                                },
                                {
                                    stepNumber: 3,
                                    description: '조회 버튼을 클릭한다',
                                    expectedResult: '조건에 맞는 데이터가 표시된다'
                                },
                                {
                                    stepNumber: 4,
                                    description: '데이터 정확성을 검증한다',
                                    expectedResult: '표시된 데이터가 예상 결과와 일치한다'
                                }
                            ]
                        },
                        {
                            name: `${projectData.code}_TC003_데이터_입력_기능_테스트`,
                            description: '새로운 데이터 입력 기능의 정상 동작을 검증하는 테스트케이스',
                            priority: 'HIGH',
                            category: '기능 테스트',
                            tags: ['input', 'create', 'validation'],
                            expectedResult: '새로운 데이터가 정상적으로 저장됨',
                            precondition: '데이터 입력 권한이 있는 사용자로 로그인되어 있어야 함',
                            postcondition: '입력된 데이터가 데이터베이스에 저장되어야 함',
                            steps: [
                                {
                                    stepNumber: 1,
                                    description: '데이터 입력 페이지에 접속한다',
                                    expectedResult: '데이터 입력 폼이 정상적으로 표시된다'
                                },
                                {
                                    stepNumber: 2,
                                    description: '필수 필드에 데이터를 입력한다',
                                    expectedResult: '입력 데이터가 정상적으로 처리된다'
                                },
                                {
                                    stepNumber: 3,
                                    description: '저장 버튼을 클릭한다',
                                    expectedResult: '데이터가 성공적으로 저장된다'
                                },
                                {
                                    stepNumber: 4,
                                    description: '저장된 데이터를 확인한다',
                                    expectedResult: '입력한 데이터가 목록에서 확인된다'
                                }
                            ]
                        },
                        {
                            name: `${projectData.code}_TC004_데이터_수정_기능_테스트`,
                            description: '기존 데이터 수정 기능의 정상 동작을 검증하는 테스트케이스',
                            priority: 'MEDIUM',
                            category: '기능 테스트',
                            tags: ['update', 'edit', 'modification'],
                            expectedResult: '기존 데이터가 정상적으로 수정됨',
                            precondition: '수정할 데이터가 존재하고 수정 권한이 있어야 함',
                            postcondition: '수정된 데이터가 정확히 반영되어야 함',
                            steps: [
                                {
                                    stepNumber: 1,
                                    description: '수정할 데이터를 선택한다',
                                    expectedResult: '데이터 상세 정보가 표시된다'
                                },
                                {
                                    stepNumber: 2,
                                    description: '수정 모드로 전환한다',
                                    expectedResult: '편집 가능한 폼으로 변경된다'
                                },
                                {
                                    stepNumber: 3,
                                    description: '데이터를 수정하고 저장한다',
                                    expectedResult: '수정된 내용이 성공적으로 저장된다'
                                },
                                {
                                    stepNumber: 4,
                                    description: '수정 결과를 확인한다',
                                    expectedResult: '변경사항이 정확히 반영되었다'
                                }
                            ]
                        },
                        {
                            name: `${projectData.code}_TC005_데이터_삭제_기능_테스트`,
                            description: '데이터 삭제 기능의 정상 동작과 안전성을 검증하는 테스트케이스',
                            priority: 'MEDIUM',
                            category: '기능 테스트',
                            tags: ['delete', 'remove', 'safety'],
                            expectedResult: '선택된 데이터가 안전하게 삭제됨',
                            precondition: '삭제할 데이터가 존재하고 삭제 권한이 있어야 함',
                            postcondition: '삭제된 데이터는 시스템에서 완전히 제거되어야 함',
                            steps: [
                                {
                                    stepNumber: 1,
                                    description: '삭제할 데이터를 선택한다',
                                    expectedResult: '데이터가 선택되고 삭제 옵션이 활성화된다'
                                },
                                {
                                    stepNumber: 2,
                                    description: '삭제 버튼을 클릭한다',
                                    expectedResult: '삭제 확인 대화상자가 표시된다'
                                },
                                {
                                    stepNumber: 3,
                                    description: '삭제를 확인한다',
                                    expectedResult: '데이터가 성공적으로 삭제된다'
                                },
                                {
                                    stepNumber: 4,
                                    description: '삭제 결과를 확인한다',
                                    expectedResult: '해당 데이터가 목록에서 사라진다'
                                }
                            ]
                        },
                        {
                            name: `${projectData.code}_TC006_권한_관리_기능_테스트`,
                            description: '사용자 권한 관리 및 접근 제어 기능을 검증하는 테스트케이스',
                            priority: 'HIGH',
                            category: '보안 테스트',
                            tags: ['authorization', 'permission', 'access control'],
                            expectedResult: '권한에 따른 접근 제어가 정상적으로 동작함',
                            precondition: '다양한 권한을 가진 사용자 계정이 준비되어 있어야 함',
                            postcondition: '권한 변경사항이 즉시 적용되어야 함',
                            steps: [
                                {
                                    stepNumber: 1,
                                    description: '관리자 권한으로 로그인한다',
                                    expectedResult: '모든 기능에 접근할 수 있다'
                                },
                                {
                                    stepNumber: 2,
                                    description: '일반 사용자 권한으로 로그인한다',
                                    expectedResult: '제한된 기능만 접근 가능하다'
                                },
                                {
                                    stepNumber: 3,
                                    description: '권한 없는 기능에 접근을 시도한다',
                                    expectedResult: '접근 거부 메시지가 표시된다'
                                },
                                {
                                    stepNumber: 4,
                                    description: '권한 변경 후 기능 접근을 확인한다',
                                    expectedResult: '변경된 권한이 즉시 적용된다'
                                }
                            ]
                        },
                        {
                            name: `${projectData.code}_TC007_파일_업로드_기능_테스트`,
                            description: '파일 업로드 및 첨부 기능의 정상 동작을 검증하는 테스트케이스',
                            priority: 'MEDIUM',
                            category: '기능 테스트',
                            tags: ['upload', 'file', 'attachment'],
                            expectedResult: '파일이 정상적으로 업로드되고 저장됨',
                            precondition: '업로드할 파일이 준비되어 있고 업로드 권한이 있어야 함',
                            postcondition: '업로드된 파일이 서버에 안전하게 저장되어야 함',
                            steps: [
                                {
                                    stepNumber: 1,
                                    description: '파일 업로드 페이지에 접속한다',
                                    expectedResult: '파일 선택 인터페이스가 표시된다'
                                },
                                {
                                    stepNumber: 2,
                                    description: '업로드할 파일을 선택한다',
                                    expectedResult: '선택된 파일 정보가 표시된다'
                                },
                                {
                                    stepNumber: 3,
                                    description: '업로드 버튼을 클릭한다',
                                    expectedResult: '파일 업로드가 시작되고 진행률이 표시된다'
                                },
                                {
                                    stepNumber: 4,
                                    description: '업로드 완료를 확인한다',
                                    expectedResult: '업로드된 파일이 목록에서 확인된다'
                                }
                            ]
                        },
                        {
                            name: `${projectData.code}_TC008_검색_필터_기능_테스트`,
                            description: '고급 검색 및 필터링 기능의 정확성을 검증하는 테스트케이스',
                            priority: 'MEDIUM',
                            category: '기능 테스트',
                            tags: ['search', 'filter', 'query'],
                            expectedResult: '검색 조건에 맞는 정확한 결과가 표시됨',
                            precondition: '다양한 테스트 데이터가 준비되어 있어야 함',
                            postcondition: '검색 결과가 정확하고 성능이 양호해야 함',
                            steps: [
                                {
                                    stepNumber: 1,
                                    description: '검색 페이지에 접속한다',
                                    expectedResult: '검색 인터페이스가 정상적으로 표시된다'
                                },
                                {
                                    stepNumber: 2,
                                    description: '복합 검색 조건을 설정한다',
                                    expectedResult: '설정된 조건이 올바르게 적용된다'
                                },
                                {
                                    stepNumber: 3,
                                    description: '검색을 실행한다',
                                    expectedResult: '조건에 맞는 결과가 표시된다'
                                },
                                {
                                    stepNumber: 4,
                                    description: '검색 결과의 정확성을 검증한다',
                                    expectedResult: '모든 결과가 검색 조건을 만족한다'
                                }
                            ]
                        },
                        {
                            name: `${projectData.code}_TC009_성능_최적화_테스트`,
                            description: '시스템 성능 및 응답 시간 최적화를 검증하는 테스트케이스',
                            priority: 'HIGH',
                            category: '성능 테스트',
                            tags: ['performance', 'optimization', 'response time'],
                            expectedResult: '정의된 성능 기준을 만족함',
                            precondition: '성능 테스트 환경이 구축되어 있어야 함',
                            postcondition: '성능 지표가 기준치 이내여야 함',
                            steps: [
                                {
                                    stepNumber: 1,
                                    description: '부하 테스트 도구를 설정한다',
                                    expectedResult: '테스트 환경이 정상적으로 구성된다'
                                },
                                {
                                    stepNumber: 2,
                                    description: '동시 사용자 부하를 가한다',
                                    expectedResult: '시스템이 정상적으로 부하를 처리한다'
                                },
                                {
                                    stepNumber: 3,
                                    description: '응답 시간을 측정한다',
                                    expectedResult: '응답 시간이 기준치 이내이다'
                                },
                                {
                                    stepNumber: 4,
                                    description: '시스템 리소스 사용률을 확인한다',
                                    expectedResult: 'CPU, 메모리 사용률이 적정 수준이다'
                                }
                            ]
                        },
                        {
                            name: `${projectData.code}_TC010_보안_취약점_테스트`,
                            description: '시스템 보안 취약점 및 방어 메커니즘을 검증하는 테스트케이스',
                            priority: 'HIGH',
                            category: '보안 테스트',
                            tags: ['security', 'vulnerability', 'penetration'],
                            expectedResult: '알려진 보안 취약점이 적절히 차단됨',
                            precondition: '보안 테스트 도구 및 환경이 준비되어 있어야 함',
                            postcondition: '보안 이슈가 발견되면 즉시 수정되어야 함',
                            steps: [
                                {
                                    stepNumber: 1,
                                    description: 'SQL 인젝션 공격을 시뮬레이션한다',
                                    expectedResult: '입력값 검증으로 공격이 차단된다'
                                },
                                {
                                    stepNumber: 2,
                                    description: 'XSS 공격을 시뮬레이션한다',
                                    expectedResult: '스크립트 실행이 차단된다'
                                },
                                {
                                    stepNumber: 3,
                                    description: 'CSRF 공격을 시뮬레이션한다',
                                    expectedResult: '토큰 검증으로 공격이 차단된다'
                                },
                                {
                                    stepNumber: 4,
                                    description: '무차별 대입 공격을 시뮬레이션한다',
                                    expectedResult: '계정 잠금 기능이 활성화된다'
                                }
                            ]
                        },
                        {
                            name: `${projectData.code}_TC011_API_통합_테스트`,
                            description: '외부 API 연동 및 통합 기능의 정상 동작을 검증하는 테스트케이스',
                            priority: 'HIGH',
                            category: '통합 테스트',
                            tags: ['api', 'integration', 'external'],
                            expectedResult: '외부 API와 정상적으로 연동됨',
                            precondition: '외부 API가 사용 가능한 상태여야 함',
                            postcondition: 'API 응답이 시스템에 올바르게 반영되어야 함',
                            steps: [
                                {
                                    stepNumber: 1,
                                    description: 'API 연결 상태를 확인한다',
                                    expectedResult: '외부 API가 정상적으로 응답한다'
                                },
                                {
                                    stepNumber: 2,
                                    description: 'API 호출을 실행한다',
                                    expectedResult: '요청이 성공적으로 전송된다'
                                },
                                {
                                    stepNumber: 3,
                                    description: 'API 응답을 처리한다',
                                    expectedResult: '응답 데이터가 올바르게 파싱된다'
                                },
                                {
                                    stepNumber: 4,
                                    description: '응답 데이터를 시스템에 반영한다',
                                    expectedResult: '데이터가 정확히 업데이트된다'
                                }
                            ]
                        },
                        {
                            name: `${projectData.code}_TC012_데이터_백업_복원_테스트`,
                            description: '데이터 백업 및 복원 기능의 신뢰성을 검증하는 테스트케이스',
                            priority: 'HIGH',
                            category: '시스템 테스트',
                            tags: ['backup', 'restore', 'reliability'],
                            expectedResult: '데이터 백업과 복원이 완전하게 수행됨',
                            precondition: '백업할 데이터와 백업 시스템이 준비되어 있어야 함',
                            postcondition: '복원된 데이터가 원본과 일치해야 함',
                            steps: [
                                {
                                    stepNumber: 1,
                                    description: '전체 데이터 백업을 실행한다',
                                    expectedResult: '백업이 성공적으로 완료된다'
                                },
                                {
                                    stepNumber: 2,
                                    description: '백업 파일의 무결성을 검증한다',
                                    expectedResult: '백업 파일이 손상되지 않았다'
                                },
                                {
                                    stepNumber: 3,
                                    description: '테스트 환경에서 데이터를 복원한다',
                                    expectedResult: '복원이 성공적으로 완료된다'
                                },
                                {
                                    stepNumber: 4,
                                    description: '복원된 데이터의 정확성을 검증한다',
                                    expectedResult: '원본 데이터와 100% 일치한다'
                                }
                            ]
                        }
                    ];

                    const createdTestCases = [];
                    
                    // 테스트케이스 생성
                    for (const testCaseData of testCasesData) {
                        try {
                            const testCase = await createTestCase(project.id, testCaseData);
                            createdTestCases.push(testCase);
                        } catch (error) {
                            console.error(`테스트케이스 생성 실패: ${testCaseData.name}`);
                        }
                    }

                    // 테스트플랜 생성
                    const testPlansData = [
                        {
                            name: `${projectData.code} 전체 기능 테스트 플랜`,
                            description: '프로젝트의 모든 기능을 포괄하는 종합 테스트 계획',
                            status: 'ACTIVE'
                        },
                        {
                            name: `${projectData.code} 회귀 테스트 플랜`,
                            description: '버그 수정 후 기존 기능의 정상 동작을 확인하는 회귀 테스트 계획',
                            status: 'ACTIVE'
                        }
                    ];

                    const createdTestPlans = [];
                    const testCaseIds = createdTestCases.map(tc => tc.id);

                    for (const testPlanData of testPlansData) {
                        try {
                            const testPlan = await createTestPlan(project.id, testPlanData, testCaseIds);
                            createdTestPlans.push(testPlan);
                        } catch (error) {
                            console.error(`테스트플랜 생성 실패: ${testPlanData.name}`);
                        }
                    }

                    // 테스트 실행 생성 및 결과 입력
                    for (const testPlan of createdTestPlans) {
                        const executionData = {
                            name: `${testPlan.name} 실행 - ${new Date().toISOString().split('T')[0]}`,
                            description: `${testPlan.description} 실행`,
                            status: 'IN_PROGRESS'
                        };

                        try {
                            const execution = await createTestExecution(project.id, testPlan.id, executionData);

                            // 각 테스트케이스에 대해 결과 입력
                            const results = ['PASS', 'PASS', 'PASS', 'FAIL', 'PASS', 'PASS', 'BLOCKED', 'PASS', 'PASS', 'PASS', 'PASS', 'PASS'];
                            
                            for (let i = 0; i < createdTestCases.length && i < results.length; i++) {
                                const testCase = createdTestCases[i];
                                const result = results[i];
                                
                                const resultData = {
                                    result: result,
                                    notes: result === 'PASS' ? 
                                        '테스트가 성공적으로 완료되었습니다. 모든 기능이 예상대로 동작하며 성능도 만족스럽습니다.' :
                                        result === 'FAIL' ?
                                        '테스트 실행 중 오류가 발생했습니다. 추가 조사 및 버그 수정이 필요합니다.' :
                                        '외부 의존성 문제로 인해 테스트를 완료할 수 없습니다. 환경 점검이 필요합니다.',
                                    executorName: 'admin',
                                    jiraId: `${projectData.code}-${1000 + i}`,
                                    executedAt: new Date().toISOString()
                                };

                                try {
                                    await createTestResult(execution.id, testCase.id, resultData);
                                } catch (error) {
                                    console.error(`테스트 결과 입력 실패: ${testCase.name}`);
                                }
                            }

                        } catch (error) {
                            console.error(`테스트 실행 생성 실패: ${executionData.name}`);
                        }
                    }

                    console.log(`✅ ${project.name} 프로젝트 완료\n`);
                    
                } catch (error) {
                    console.error(`프로젝트 생성 실패: ${projectData.name}`, error.message);
                }
            }

            console.log(`🎉 ${org.name} 모든 데이터 생성 완료!\n`);
        }

        console.log('🎊 모든 조직의 테스트 데이터 생성이 완료되었습니다!');

    } catch (error) {
        console.error('❌ 전체 프로세스 오류:', error.message);
        throw error;
    }
}

// 스크립트 실행
if (require.main === module) {
    createOrganizationTestData().catch(console.error);
}

module.exports = { createOrganizationTestData };