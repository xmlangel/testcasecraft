// src/hooks/useUserManagement.js
/**
 * 사용자 관리를 위한 커스텀 훅
 * 
 * 사용자 목록 조회, 검색, 필터링, 상세 정보 관리 등의 
 * 상태와 로직을 캡슐화하여 컴포넌트에서 쉽게 사용할 수 있도록 제공
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import userManagementService, { USER_ROLES, USER_STATUS } from '../services/userManagementService.js';
import { useI18n } from '../context/I18nContext.jsx';

/**
 * 기본 검색 조건
 */
const DEFAULT_SEARCH_PARAMS = {
  keyword: '',
  role: '',
  isActive: null,
  page: 0,
  size: 20,
  sort: 'createdAt',
  direction: 'desc'
};

/**
 * 사용자 관리 훅
 * @param {Object} initialParams - 초기 검색 조건
 * @returns {Object} 사용자 관리 상태 및 함수들
 */
export const useUserManagement = (initialParams = {}) => {
  const { t } = useI18n();
  // 검색 조건 상태
  const [searchParams, setSearchParams] = useState({
    ...DEFAULT_SEARCH_PARAMS,
    ...initialParams
  });

  // 데이터 상태
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0
  });
  const [statistics, setStatistics] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  // UI 상태
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /**
   * 사용자 목록 조회
   */
  const fetchUsers = useCallback(async (params = searchParams) => {
    setLoading(true);
    setError(null);

    try {
      const result = await userManagementService.getUsers(params);
      
      if (result.success) {
        setUsers(result.data.content || []);
        setPagination({
          page: result.data.pageable?.pageNumber || 0,
          size: result.data.pageable?.pageSize || 20,
          totalElements: result.data.totalElements || 0,
          totalPages: result.data.totalPages || 0
        });
      } else {
        // 403 오류인 경우 더 사용자 친화적인 메시지로 변환
        if (result.status === 403) {
          setError('권한이 없습니다. 사용자 관리 기능은 시스템 관리자만 사용할 수 있습니다.');
        } else {
          setError(result.error);
        }
        setUsers([]);
      }
    } catch (err) {
      setError('사용자 목록을 불러오는 중 오류가 발생했습니다.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  /**
   * 사용자 통계 조회
   */
  const fetchStatistics = useCallback(async () => {
    try {
      const result = await userManagementService.getUserStatistics();
      if (result.success) {
        setStatistics(result.data);
      }
    } catch (err) {
      console.error('통계 조회 실패:', err);
    }
  }, []);

  /**
   * 검색 조건 업데이트
   */
  const updateSearchParams = useCallback((newParams) => {
    setSearchParams(prev => ({
      ...prev,
      ...newParams,
      page: newParams.page !== undefined ? newParams.page : 0 // 검색 조건 변경 시 첫 페이지로
    }));
  }, []);

  /**
   * 페이지 변경
   */
  const changePage = useCallback((newPage) => {
    setSearchParams(prev => ({ ...prev, page: newPage }));
  }, []);

  /**
   * 페이지 크기 변경
   */
  const changePageSize = useCallback((newSize) => {
    setSearchParams(prev => ({ 
      ...prev, 
      size: newSize, 
      page: 0 // 페이지 크기 변경 시 첫 페이지로
    }));
  }, []);

  /**
   * 정렬 변경
   */
  const changeSort = useCallback((field, direction = 'desc') => {
    setSearchParams(prev => ({ 
      ...prev, 
      sort: field, 
      direction: direction,
      page: 0 // 정렬 변경 시 첫 페이지로
    }));
  }, []);

  /**
   * 검색어 설정
   */
  const setKeyword = useCallback((keyword) => {
    updateSearchParams({ keyword });
  }, [updateSearchParams]);

  /**
   * 역할 필터 설정
   */
  const setRoleFilter = useCallback((role) => {
    updateSearchParams({ role });
  }, [updateSearchParams]);

  /**
   * 활성 상태 필터 설정
   */
  const setActiveFilter = useCallback((isActive) => {
    updateSearchParams({ isActive });
  }, [updateSearchParams]);

  /**
   * 검색 조건 초기화
   */
  const resetSearch = useCallback(() => {
    setSearchParams(DEFAULT_SEARCH_PARAMS);
  }, []);

  /**
   * 사용자 데이터 새로고침
   */
  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  /**
   * 특정 사용자 선택
   */
  const selectUser = useCallback(async (userId) => {
    if (!userId) {
      setSelectedUser(null);
      return;
    }

    try {
      const result = await userManagementService.getUserById(userId);
      if (result.success) {
        setSelectedUser(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('사용자 정보를 불러오는 중 오류가 발생했습니다.');
    }
  }, []);

  /**
   * 사용자 정보 수정
   */
  const updateUser = useCallback(async (userId, updateData) => {
    try {
      const result = await userManagementService.updateUser(userId, updateData);
      if (result.success) {
        refresh(); // 목록 새로고침
        if (selectedUser?.id === userId) {
          setSelectedUser(result.data); // 선택된 사용자 정보 업데이트
        }
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: '사용자 정보 수정 중 오류가 발생했습니다.' };
    }
  }, [selectedUser, refresh]);

  /**
   * 사용자 활성화
   */
  const activateUser = useCallback(async (userId) => {
    try {
      const result = await userManagementService.activateUser(userId);
      if (result.success) {
        refresh(); // 목록 새로고침
        fetchStatistics(); // 통계 새로고침
        if (selectedUser?.id === userId) {
          setSelectedUser(result.data);
        }
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: '사용자 활성화 중 오류가 발생했습니다.' };
    }
  }, [selectedUser, refresh, fetchStatistics]);

  /**
   * 사용자 비활성화
   */
  const deactivateUser = useCallback(async (userId, reason = '') => {
    try {
      const result = await userManagementService.deactivateUser(userId, reason);
      if (result.success) {
        refresh(); // 목록 새로고침
        fetchStatistics(); // 통계 새로고침
        if (selectedUser?.id === userId) {
          setSelectedUser(result.data);
        }
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: '사용자 비활성화 중 오류가 발생했습니다.' };
    }
  }, [selectedUser, refresh, fetchStatistics]);

  /**
   * 사용자 역할 변경
   */
  const changeUserRole = useCallback(async (userId, role, reason = '') => {
    try {
      const result = await userManagementService.changeUserRole(userId, role, reason);
      if (result.success) {
        refresh(); // 목록 새로고침
        fetchStatistics(); // 통계 새로고침
        if (selectedUser?.id === userId) {
          setSelectedUser(result.data);
        }
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: '사용자 역할 변경 중 오류가 발생했습니다.' };
    }
  }, [selectedUser, refresh, fetchStatistics]);

  /**
   * 사용자 데이터 내보내기
   */
  const exportUsers = useCallback(async () => {
    try {
      const result = await userManagementService.exportUsers(searchParams);
      if (result.success) {
        // 파일 다운로드
        const url = window.URL.createObjectURL(result.data);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: '데이터 내보내기 중 오류가 발생했습니다.' };
    }
  }, [searchParams]);

  // 계산된 값들
  const filteredUserCount = useMemo(() => users.length, [users]);
  const hasUsers = useMemo(() => users.length > 0, [users]);
  const hasNextPage = useMemo(() => 
    pagination.page < pagination.totalPages - 1, [pagination]);
  const hasPrevPage = useMemo(() => pagination.page > 0, [pagination]);
  
  /**
   * 역할별 색상 가져오기
   */
  const getRoleColor = useCallback((role) => {
    return USER_ROLES[role]?.color || '#666';
  }, []);

  /**
   * 역할별 라벨 가져오기
   */
  const getRoleLabel = useCallback((role) => {
    return t(USER_ROLES[role]?.label || role);
  }, [t]);

  /**
   * 활성 상태 라벨 가져오기
   */
  const getStatusLabel = useCallback((isActive) => {
    return isActive ? t('user.status.active', '활성') : t('user.status.inactive', '비활성');
  }, [t]);

  /**
   * 활성 상태 색상 가져오기
   */
  const getStatusColor = useCallback((isActive) => {
    return isActive ? '#4caf50' : '#f44336';
  }, []);

  // 초기 데이터 로드 및 검색 조건 변경 시 재조회
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, refreshTrigger]);

  // 통계는 컴포넌트 마운트 시 한 번만 로드
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics, refreshTrigger]);

  return {
    // 데이터
    users,
    pagination,
    statistics,
    selectedUser,
    
    // 상태
    loading,
    error,
    searchParams,
    
    // 계산된 값
    filteredUserCount,
    hasUsers,
    hasNextPage,
    hasPrevPage,
    
    // 검색 및 필터링
    updateSearchParams,
    setKeyword,
    setRoleFilter,
    setActiveFilter,
    resetSearch,
    
    // 페이징
    changePage,
    changePageSize,
    changeSort,
    
    // 사용자 관리
    selectUser,
    updateUser,
    activateUser,
    deactivateUser,
    changeUserRole,
    exportUsers,
    refresh,
    
    // 유틸리티 함수
    getRoleColor,
    getRoleLabel,
    getStatusLabel,
    getStatusColor,
    
    // 상수
    USER_ROLES,
    USER_STATUS
  };
};

/**
 * 단일 사용자 관리 훅
 * @param {string} userId - 사용자 ID
 * @returns {Object} 단일 사용자 관리 상태 및 함수들
 */
export const useUserDetail = (userId) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activity, setActivity] = useState(null);

  /**
   * 사용자 정보 조회
   */
  const fetchUser = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);

    try {
      const [userResult, activityResult] = await Promise.all([
        userManagementService.getUserById(userId),
        userManagementService.getUserActivity(userId)
      ]);
      
      if (userResult.success) {
        setUser(userResult.data);
      } else {
        setError(userResult.error);
      }
      
      if (activityResult.success) {
        setActivity(activityResult.data);
      }
    } catch (err) {
      setError('사용자 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * 사용자 정보 업데이트
   */
  const updateUser = useCallback(async (updateData) => {
    if (!userId) return { success: false, error: '사용자 ID가 없습니다.' };

    try {
      const result = await userManagementService.updateUser(userId, updateData);
      if (result.success) {
        setUser(result.data);
        return { success: true, message: result.message };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: '사용자 정보 수정 중 오류가 발생했습니다.' };
    }
  }, [userId]);

  // 사용자 ID 변경 시 데이터 로드
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user,
    activity,
    loading,
    error,
    updateUser,
    refresh: fetchUser
  };
};

export default useUserManagement;