// src/hooks/useAuth.js
/**
 * 인증 관련 React Query 훅들
 */

import { authService } from '../services';
import { useQueryWithDefaults, useMutationWithDefaults, queryKeys, useInvalidateQueries } from './useReactQuery.js';
import { useQueryClient } from '@tanstack/react-query';

/**
 * 사용자 정보 조회
 */
export function useUser() {
  return useQueryWithDefaults(
    queryKeys.user,
    authService.getUserInfo,
    {
      retry: false, // 인증 실패 시 재시도하지 않음
      staleTime: 30 * 60 * 1000, // 30분
    }
  );
}

/**
 * 로그인
 */
export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutationWithDefaults(
    authService.login,
    {
      onSuccess: (data) => {
        // 토큰 저장
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        
        // 사용자 정보 캐시 무효화 후 재조회
        queryClient.invalidateQueries({ queryKey: queryKeys.user });
      },
    }
  );
}

/**
 * 회원가입
 */
export function useRegister() {
  return useMutationWithDefaults(authService.register);
}

/**
 * 로그아웃
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const { invalidateAll } = useInvalidateQueries();
  
  return useMutationWithDefaults(
    authService.logout,
    {
      onSuccess: () => {
        // 모든 캐시 제거
        queryClient.clear();
        invalidateAll();
      },
    }
  );
}

/**
 * 사용자 정보 수정
 */
export function useUpdateUserProfile() {
  const { invalidateUser } = useInvalidateQueries();
  
  return useMutationWithDefaults(
    authService.updateUserProfile,
    {
      onSuccess: () => {
        invalidateUser();
      },
    }
  );
}