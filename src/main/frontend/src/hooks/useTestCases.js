// src/hooks/useTestCases.js
/**
 * 테스트 케이스 관련 React Query 훅들
 */

import { testCaseService } from '../services';
import { useQueryWithDefaults, useMutationWithDefaults, queryKeys, useInvalidateQueries } from './useReactQuery.js';

/**
 * 프로젝트의 테스트 케이스 목록 조회
 */
export function useTestCases(projectId) {
  return useQueryWithDefaults(
    queryKeys.testCases(projectId),
    () => testCaseService.getTestCasesByProject(projectId),
    {
      enabled: !!projectId,
    }
  );
}

/**
 * 특정 테스트 케이스 조회
 */
export function useTestCase(testCaseId) {
  return useQueryWithDefaults(
    queryKeys.testCase(testCaseId),
    () => testCaseService.getTestCase(testCaseId),
    {
      enabled: !!testCaseId,
    }
  );
}

/**
 * 테스트 케이스 생성
 */
export function useCreateTestCase() {
  const { invalidateTestCases } = useInvalidateQueries();
  
  return useMutationWithDefaults(
    testCaseService.createTestCase,
    {
      onSuccess: (data) => {
        invalidateTestCases(data.projectId);
      },
    }
  );
}

/**
 * 테스트 케이스 수정
 */
export function useUpdateTestCase() {
  const { invalidateTestCases, invalidateTestCase } = useInvalidateQueries();
  
  return useMutationWithDefaults(
    ({ testCaseId, ...data }) => testCaseService.updateTestCase(testCaseId, data),
    {
      onSuccess: (data, variables) => {
        invalidateTestCase(variables.testCaseId);
        invalidateTestCases(data.projectId);
      },
    }
  );
}

/**
 * 테스트 케이스 삭제
 */
export function useDeleteTestCase() {
  const { invalidateTestCases } = useInvalidateQueries();
  
  return useMutationWithDefaults(
    testCaseService.deleteTestCase,
    {
      onSuccess: (result, testCaseId) => {
        // 프로젝트별로 캐시 무효화가 필요하지만, 여기서는 전체 테스트케이스 캐시를 무효화
        // 더 정교한 구현을 위해서는 추가 정보가 필요
        invalidateTestCases();
      },
    }
  );
}