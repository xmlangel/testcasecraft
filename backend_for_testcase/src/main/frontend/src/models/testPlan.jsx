// /src/models/testPlan.js
/**
 * 테스트 플랜 데이터 모델
 */

// 테스트 플랜 객체 생성 함수
export const createTestPlan = (id, name, description = '', testCaseIds = []) => ({
    id,
    name,
    description,
    testCaseIds, // 테스트 플랜에 포함된 테스트케이스 ID 배열
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  
  // 초기 테스트 플랜 샘플 데이터
  export const initialTestPlans = [
    createTestPlan('plan-1', '로그인 기능 테스트', '로그인 관련 모든 테스트케이스', ['test-1', 'test-2']),
    createTestPlan('plan-2', '사용자 관리 테스트', '사용자 CRUD 기능 테스트', ['test-3', 'test-4'])
  ];
  