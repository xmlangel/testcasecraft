// src/hooks/useReactQuery.js
/**
 * React Query 설정 및 기본 훅들
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import errorHandler from '../utils/errorHandler.js';

/**
 * 기본 React Query 옵션
 */
export const defaultQueryOptions = {
  staleTime: 5 * 60 * 1000, // 5분
  cacheTime: 10 * 60 * 1000, // 10분
  retry: (failureCount, error) => {
    // 인증 에러는 재시도하지 않음
    if (error?.status === 401 || error?.status === 403) {
      return false;
    }
    // 최대 2번까지 재시도
    return failureCount < 2;
  },
  onError: (error) => {
    errorHandler.handleError(error);
  },
};

/**
 * 기본 Mutation 옵션
 */
export const defaultMutationOptions = {
  onError: (error) => {
    errorHandler.handleError(error);
  },
};

/**
 * 쿼리 키 팩토리
 */
export const queryKeys = {
  // 프로젝트
  projects: ['projects'],
  project: (id) => ['projects', id],
  
  // 테스트 케이스
  testCases: (projectId) => ['testCases', { projectId }],
  testCase: (id) => ['testCases', id],
  
  // 테스트 플랜
  testPlans: (projectId) => ['testPlans', { projectId }],
  testPlan: (id) => ['testPlans', id],
  
  // 테스트 실행
  testExecutions: (projectId) => ['testExecutions', { projectId }],
  testExecution: (id) => ['testExecutions', id],
  testExecutionsByTestCase: (testCaseId) => ['testExecutions', 'byTestCase', testCaseId],
  
  // 사용자
  user: ['user'],
};

/**
 * 커스텀 useQuery 훅
 */
export function useQueryWithDefaults(key, queryFn, options = {}) {
  return useQuery({
    queryKey: key,
    queryFn,
    ...defaultQueryOptions,
    ...options,
  });
}

/**
 * 커스텀 useMutation 훅
 */
export function useMutationWithDefaults(mutationFn, options = {}) {
  return useMutation({
    mutationFn,
    ...defaultMutationOptions,
    ...options,
  });
}

/**
 * 캐시 무효화 유틸리티 훅
 */
export function useInvalidateQueries() {
  const queryClient = useQueryClient();
  
  return {
    invalidateProjects: () => queryClient.invalidateQueries({ queryKey: queryKeys.projects }),
    invalidateProject: (id) => queryClient.invalidateQueries({ queryKey: queryKeys.project(id) }),
    invalidateTestCases: (projectId) => queryClient.invalidateQueries({ queryKey: queryKeys.testCases(projectId) }),
    invalidateTestCase: (id) => queryClient.invalidateQueries({ queryKey: queryKeys.testCase(id) }),
    invalidateTestPlans: (projectId) => queryClient.invalidateQueries({ queryKey: queryKeys.testPlans(projectId) }),
    invalidateTestPlan: (id) => queryClient.invalidateQueries({ queryKey: queryKeys.testPlan(id) }),
    invalidateTestExecutions: (projectId) => queryClient.invalidateQueries({ queryKey: queryKeys.testExecutions(projectId) }),
    invalidateTestExecution: (id) => queryClient.invalidateQueries({ queryKey: queryKeys.testExecution(id) }),
    invalidateUser: () => queryClient.invalidateQueries({ queryKey: queryKeys.user }),
    
    // 전체 캐시 무효화
    invalidateAll: () => queryClient.invalidateQueries(),
  };
}