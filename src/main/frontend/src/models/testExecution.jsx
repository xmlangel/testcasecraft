// /src/models/testExecution.js
/**
 * 테스트 실행 데이터 모델
 */

// 테스트 실행 상태 열거형
export const ExecutionStatus = {
    NOTSTARTED: 'NOTSTARTED',
    INPROGRESS: 'INPROGRESS',
    COMPLETED: 'COMPLETED'
  };

  // 테스트 결과 열거형
  export const TestResult = {
    NOT_RUN: 'NOT_RUN',
    PASS: 'PASS',
    FAIL: 'FAIL',
    BLOCKED: 'BLOCKED'
  };
  
  // 테스트 실행 객체 생성 함수
  export const createTestExecution = (id, name, testPlanId, description = '') => ({
    id,
    name,
    testPlanId,
    description,
    status: ExecutionStatus.NOT_STARTED,
    startDate: null,
    endDate: null,
    results: {}, // { testCaseId: { result, notes } }
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  // 테스트 결과 항목 생성 함수
  export const createTestResult = (testCaseId, result = TestResult.NOT_RUN, notes = '') => ({
    testCaseId,
    result,
    notes,
    executedAt: result !== TestResult.NOT_RUN ? new Date().toISOString() : null
  });
  
  // 초기 테스트 실행 샘플 데이터
  export const initialTestExecutions = [
    createTestExecution('exec-1', '로그인 테스트 실행 #1', 'plan-1', '첫 번째 로그인 테스트 실행')
  ];
  