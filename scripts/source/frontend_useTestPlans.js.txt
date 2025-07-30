// src/hooks/useTestPlans.js
/**
 * 테스트 플랜 관련 React Query 훅들
 */

import { testPlanService } from '../services';
import { useQueryWithDefaults, useMutationWithDefaults, queryKeys, useInvalidateQueries } from './useReactQuery.js';

/**
 * 프로젝트의 테스트 플랜 목록 조회
 */
export function useTestPlans(projectId) {
  return useQueryWithDefaults(
    queryKeys.testPlans(projectId),
    () => testPlanService.getTestPlansByProject(projectId),
    {
      enabled: !!projectId,
    }
  );
}

/**
 * 특정 테스트 플랜 조회
 */
export function useTestPlan(testPlanId) {
  return useQueryWithDefaults(
    queryKeys.testPlan(testPlanId),
    () => testPlanService.getTestPlan(testPlanId),
    {
      enabled: !!testPlanId,
    }
  );
}

/**
 * 테스트 플랜 생성
 */
export function useCreateTestPlan() {
  const { invalidateTestPlans } = useInvalidateQueries();
  
  return useMutationWithDefaults(
    testPlanService.createTestPlan,
    {
      onSuccess: (data) => {
        invalidateTestPlans(data.projectId);
      },
    }
  );
}

/**
 * 테스트 플랜 수정
 */
export function useUpdateTestPlan() {
  const { invalidateTestPlans, invalidateTestPlan } = useInvalidateQueries();
  
  return useMutationWithDefaults(
    ({ testPlanId, ...data }) => testPlanService.updateTestPlan(testPlanId, data),
    {
      onSuccess: (data, variables) => {
        invalidateTestPlan(variables.testPlanId);
        invalidateTestPlans(data.projectId);
      },
    }
  );
}

/**
 * 테스트 플랜 삭제
 */
export function useDeleteTestPlan() {
  const { invalidateTestPlans } = useInvalidateQueries();
  
  return useMutationWithDefaults(
    testPlanService.deleteTestPlan,
    {
      onSuccess: () => {
        // 모든 테스트 플랜 캐시 무효화
        invalidateTestPlans();
      },
    }
  );
}