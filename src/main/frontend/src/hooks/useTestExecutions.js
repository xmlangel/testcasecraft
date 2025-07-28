// src/hooks/useTestExecutions.js
/**
 * 테스트 실행 관련 React Query 훅들
 */

import { testExecutionService } from '../services';
import { useQueryWithDefaults, useMutationWithDefaults, queryKeys, useInvalidateQueries } from './useReactQuery.js';

/**
 * 프로젝트의 테스트 실행 목록 조회
 */
export function useTestExecutions(projectId) {
  return useQueryWithDefaults(
    queryKeys.testExecutions(projectId),
    () => testExecutionService.getTestExecutionsByProject(projectId),
    {
      enabled: !!projectId,
    }
  );
}

/**
 * 테스트 케이스별 실행 이력 조회
 */
export function useTestExecutionsByTestCase(testCaseId) {
  return useQueryWithDefaults(
    queryKeys.testExecutionsByTestCase(testCaseId),
    () => testExecutionService.getTestExecutionsByTestCase(testCaseId),
    {
      enabled: !!testCaseId,
    }
  );
}

/**
 * 특정 테스트 실행 조회
 */
export function useTestExecution(executionId) {
  return useQueryWithDefaults(
    queryKeys.testExecution(executionId),
    () => testExecutionService.getTestExecution(executionId),
    {
      enabled: !!executionId,
    }
  );
}

/**
 * 테스트 실행 생성
 */
export function useCreateTestExecution() {
  const { invalidateTestExecutions } = useInvalidateQueries();
  
  return useMutationWithDefaults(
    testExecutionService.createTestExecution,
    {
      onSuccess: (data) => {
        invalidateTestExecutions(data.projectId);
      },
    }
  );
}

/**
 * 테스트 실행 수정
 */
export function useUpdateTestExecution() {
  const { invalidateTestExecutions, invalidateTestExecution } = useInvalidateQueries();
  
  return useMutationWithDefaults(
    ({ executionId, ...data }) => testExecutionService.updateTestExecution(executionId, data),
    {
      onSuccess: (data, variables) => {
        invalidateTestExecution(variables.executionId);
        invalidateTestExecutions(data.projectId);
      },
    }
  );
}

/**
 * 테스트 실행 삭제
 */
export function useDeleteTestExecution() {
  const { invalidateTestExecutions } = useInvalidateQueries();
  
  return useMutationWithDefaults(
    testExecutionService.deleteTestExecution,
    {
      onSuccess: () => {
        invalidateTestExecutions();
      },
    }
  );
}

/**
 * 테스트 실행 시작
 */
export function useStartTestExecution() {
  const { invalidateTestExecution, invalidateTestExecutions } = useInvalidateQueries();
  
  return useMutationWithDefaults(
    testExecutionService.startTestExecution,
    {
      onSuccess: (data) => {
        invalidateTestExecution(data.id);
        invalidateTestExecutions(data.projectId);
      },
    }
  );
}

/**
 * 테스트 실행 완료
 */
export function useCompleteTestExecution() {
  const { invalidateTestExecution, invalidateTestExecutions } = useInvalidateQueries();
  
  return useMutationWithDefaults(
    testExecutionService.completeTestExecution,
    {
      onSuccess: (data) => {
        invalidateTestExecution(data.id);
        invalidateTestExecutions(data.projectId);
      },
    }
  );
}

/**
 * 테스트 결과 업데이트
 */
export function useUpdateTestResult() {
  const { invalidateTestExecution } = useInvalidateQueries();
  
  return useMutationWithDefaults(
    ({ executionId, testCaseId, result, notes }) => 
      testExecutionService.updateTestResult(executionId, testCaseId, result, notes),
    {
      onSuccess: (data, variables) => {
        invalidateTestExecution(variables.executionId);
      },
    }
  );
}