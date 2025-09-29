// src/services/userManagementService.js
/**
 * 사용자 관리 API 서비스
 * 관리자를 위한 종합적인 사용자 관리 기능을 제공합니다.
 * 
 * 주요 기능:
 * - 사용자 목록 조회 및 검색
 * - 사용자 상세 정보 조회
 * - 사용자 정보 수정
 * - 계정 활성화/비활성화
 * - 사용자 역할 변경
 * - 사용자 통계 조회
 */

import apiService from './apiService.js';
import { formatDateOnlySafe } from '../utils/dateUtils';

/**
 * 사용자 검색 및 필터링 옵션
 */
const USER_SEARCH_OPTIONS = {
  roles: ['ADMIN', 'MANAGER', 'TESTER', 'USER'],
  sortFields: ['createdAt', 'name', 'username', 'lastLoginAt'],
  sortDirections: ['asc', 'desc'],
  pageSizes: [10, 20, 50, 100]
};

/**
 * 사용자 상태
 */
const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ALL: 'ALL'
};

/**
 * 사용자 역할 정보
 */
const USER_ROLES = {
  ADMIN: {
    value: 'ADMIN',
    label: 'user.role.admin',
    description: 'user.role.admin.description',
    color: '#f44336', // red
    priority: 4
  },
  MANAGER: {
    value: 'MANAGER',
    label: 'user.role.manager',
    description: 'user.role.manager.description',
    color: '#ff9800', // orange
    priority: 3
  },
  TESTER: {
    value: 'TESTER',
    label: 'user.role.tester',
    description: 'user.role.tester.description',
    color: '#2196f3', // blue
    priority: 2
  },
  USER: {
    value: 'USER',
    label: 'user.role.user',
    description: 'user.role.user.description',
    color: '#4caf50', // green
    priority: 1
  }
};

class UserManagementService {
  /**
   * 사용자 목록 조회 (검색, 정렬, 페이징)
   * @param {Object} searchParams - 검색 조건
   * @param {string} searchParams.keyword - 검색 키워드 (이름, 사용자명, 이메일)
   * @param {string} searchParams.role - 역할 필터 (ADMIN, MANAGER, TESTER, USER)
   * @param {boolean} searchParams.isActive - 활성 상태 필터
   * @param {number} searchParams.page - 페이지 번호 (0부터 시작)
   * @param {number} searchParams.size - 페이지 크기 (기본값: 20)
   * @param {string} searchParams.sort - 정렬 필드
   * @param {string} searchParams.direction - 정렬 방향 (asc, desc)
   * @returns {Promise<Object>} 페이지네이션된 사용자 목록
   */
  async getUsers(searchParams = {}) {
    try {
      const params = new URLSearchParams();
      
      // 검색 조건 추가
      if (searchParams.keyword) {
        params.append('keyword', searchParams.keyword);
      }
      if (searchParams.role) {
        params.append('role', searchParams.role);
      }
      if (searchParams.isActive !== undefined && searchParams.isActive !== null) {
        params.append('isActive', searchParams.isActive);
      }
      
      // 페이징 조건 추가
      params.append('page', searchParams.page || 0);
      params.append('size', searchParams.size || 20);
      
      // 정렬 조건 추가
      if (searchParams.sort) {
        const direction = searchParams.direction || 'desc';
        params.append('sort', `${searchParams.sort},${direction}`);
      }

      const response = await apiService.get(`/api/admin/users?${params.toString()}`);
      const data = await response.json();
      
      return {
        success: true,
        data: data,
        message: '사용자 목록을 성공적으로 조회했습니다.'
      };
    } catch (error) {
      console.error('사용자 목록 조회 실패:', error);
      
      // HTTP 상태 코드별 에러 메시지 처리
      let errorMessage = error.message || '사용자 목록 조회에 실패했습니다.';
      if (error.status === 403) {
        errorMessage = '권한이 없습니다. 사용자 관리 기능은 시스템 관리자만 사용할 수 있습니다.';
      } else if (error.status === 401) {
        errorMessage = '로그인이 필요합니다. 다시 로그인해주세요.';
      }
      
      return {
        success: false,
        error: errorMessage,
        status: error.status
      };
    }
  }

  /**
   * 사용자 상세 정보 조회
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>} 사용자 상세 정보
   */
  async getUserById(userId) {
    try {
      if (!userId) {
        throw new Error('사용자 ID가 필요합니다.');
      }

      const response = await apiService.get(`/api/admin/users/${userId}`);
      const data = await response.json();
      
      return {
        success: true,
        data: data,
        message: '사용자 정보를 성공적으로 조회했습니다.'
      };
    } catch (error) {
      console.error('사용자 상세 조회 실패:', error);
      return {
        success: false,
        error: error.message || '사용자 정보 조회에 실패했습니다.',
        status: error.status
      };
    }
  }

  /**
   * 사용자 기본 정보 수정
   * @param {string} userId - 사용자 ID
   * @param {Object} updateData - 수정할 데이터
   * @param {string} updateData.name - 사용자 이름
   * @param {string} updateData.email - 이메일 주소
   * @returns {Promise<Object>} 수정된 사용자 정보
   */
  async updateUser(userId, updateData) {
    try {
      if (!userId) {
        throw new Error('사용자 ID가 필요합니다.');
      }

      // 필수 필드 검증
      if (!updateData.name || !updateData.email) {
        throw new Error('이름과 이메일은 필수 입력 항목입니다.');
      }

      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        throw new Error('올바른 이메일 형식을 입력해주세요.');
      }

      const response = await apiService.put(`/api/admin/users/${userId}`, updateData);
      const data = await response.json();
      
      return {
        success: true,
        data: data,
        message: '사용자 정보가 성공적으로 수정되었습니다.'
      };
    } catch (error) {
      console.error('사용자 정보 수정 실패:', error);
      return {
        success: false,
        error: error.message || '사용자 정보 수정에 실패했습니다.',
        status: error.status
      };
    }
  }

  /**
   * 사용자 계정 활성화
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>} 활성화된 사용자 정보
   */
  async activateUser(userId) {
    try {
      if (!userId) {
        throw new Error('사용자 ID가 필요합니다.');
      }

      const response = await apiService.post(`/api/admin/users/${userId}/activate`);
      const data = await response.json();
      
      return {
        success: true,
        data: data,
        message: '사용자 계정이 성공적으로 활성화되었습니다.'
      };
    } catch (error) {
      console.error('사용자 활성화 실패:', error);
      return {
        success: false,
        error: error.message || '사용자 계정 활성화에 실패했습니다.',
        status: error.status
      };
    }
  }

  /**
   * 사용자 계정 비활성화
   * @param {string} userId - 사용자 ID
   * @param {string} reason - 비활성화 사유 (선택사항)
   * @returns {Promise<Object>} 비활성화된 사용자 정보
   */
  async deactivateUser(userId, reason = '') {
    try {
      if (!userId) {
        throw new Error('사용자 ID가 필요합니다.');
      }

      const requestBody = reason ? { reason } : {};
      const response = await apiService.post(`/api/admin/users/${userId}/deactivate`, requestBody);
      const data = await response.json();
      
      return {
        success: true,
        data: data,
        message: '사용자 계정이 성공적으로 비활성화되었습니다.'
      };
    } catch (error) {
      console.error('사용자 비활성화 실패:', error);
      return {
        success: false,
        error: error.message || '사용자 계정 비활성화에 실패했습니다.',
        status: error.status
      };
    }
  }

  /**
   * 사용자 역할 변경
   * @param {string} userId - 사용자 ID
   * @param {string} role - 새로운 역할 (ADMIN, MANAGER, TESTER, USER)
   * @param {string} reason - 변경 사유 (선택사항)
   * @returns {Promise<Object>} 역할이 변경된 사용자 정보
   */
  async changeUserRole(userId, role, reason = '') {
    try {
      if (!userId) {
        throw new Error('사용자 ID가 필요합니다.');
      }

      if (!role || !USER_ROLES[role]) {
        throw new Error('올바른 역할을 선택해주세요.');
      }

      const requestBody = { role, reason };
      const response = await apiService.put(`/api/admin/users/${userId}/role`, requestBody);
      const data = await response.json();
      
      return {
        success: true,
        data: data,
        message: `사용자 역할이 ${USER_ROLES[role].label}로 변경되었습니다.`
      };
    } catch (error) {
      console.error('사용자 역할 변경 실패:', error);
      return {
        success: false,
        error: error.message || '사용자 역할 변경에 실패했습니다.',
        status: error.status
      };
    }
  }

  /**
   * 사용자 통계 조회
   * @returns {Promise<Object>} 사용자 통계 정보
   */
  async getUserStatistics() {
    try {
      const response = await apiService.get('/api/admin/users/statistics');
      const data = await response.json();
      
      return {
        success: true,
        data: data,
        message: '사용자 통계를 성공적으로 조회했습니다.'
      };
    } catch (error) {
      console.error('사용자 통계 조회 실패:', error);
      return {
        success: false,
        error: error.message || '사용자 통계 조회에 실패했습니다.',
        status: error.status
      };
    }
  }

  /**
   * 사용자 데이터 내보내기 (CSV)
   * @param {Object} searchParams - 내보낼 데이터 조건
   * @returns {Promise<Blob>} CSV 파일 데이터
   */
  async exportUsers(searchParams = {}) {
    try {
      // 전체 데이터 조회 (페이징 없음)
      const allUsersResult = await this.getUsers({
        ...searchParams,
        page: 0,
        size: 10000 // 대용량 데이터 처리
      });

      if (!allUsersResult.success) {
        throw new Error(allUsersResult.error);
      }

      const users = allUsersResult.data.content || [];
      
      // CSV 헤더
      const headers = [
        'ID',
        '사용자명',
        '이름',
        '이메일',
        '역할',
        '활성상태',
        '생성일',
        '최종로그인'
      ];

      // CSV 데이터 생성
      const csvContent = [
        headers.join(','),
        ...users.map(user => [
          user.id,
          user.username,
          user.name,
          user.email,
          USER_ROLES[user.role]?.label || user.role,
          user.isActive ? '활성' : '비활성',
          formatDateOnlySafe(user.createdAt),
          user.lastLoginAt ? formatDateOnlySafe(user.lastLoginAt) : '없음'
        ].join(','))
      ].join('\n');

      // BOM 추가 (한글 인코딩 문제 해결)
      const bom = '\uFEFF';
      const blob = new Blob([bom + csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });

      return {
        success: true,
        data: blob,
        filename: `users_${new Date().toISOString().split('T')[0]}.csv`,
        message: '사용자 데이터가 성공적으로 내보내졌습니다.'
      };
    } catch (error) {
      console.error('사용자 데이터 내보내기 실패:', error);
      return {
        success: false,
        error: error.message || '사용자 데이터 내보내기에 실패했습니다.'
      };
    }
  }

  /**
   * 역할별 사용자 수 조회
   * @returns {Promise<Object>} 역할별 통계
   */
  async getRoleDistribution() {
    try {
      const statisticsResult = await this.getUserStatistics();
      
      if (!statisticsResult.success) {
        throw new Error(statisticsResult.error);
      }

      const roleDistribution = statisticsResult.data.roleDistribution || {};
      
      // 역할별 정보와 통계 결합
      const enrichedDistribution = Object.keys(USER_ROLES).map(roleKey => ({
        role: roleKey,
        ...USER_ROLES[roleKey],
        count: roleDistribution[roleKey] || 0,
        percentage: statisticsResult.data.totalUsers > 0 
          ? ((roleDistribution[roleKey] || 0) / statisticsResult.data.totalUsers * 100).toFixed(1)
          : 0
      }));

      return {
        success: true,
        data: enrichedDistribution,
        total: statisticsResult.data.totalUsers,
        message: '역할별 분포를 성공적으로 조회했습니다.'
      };
    } catch (error) {
      console.error('역할별 분포 조회 실패:', error);
      return {
        success: false,
        error: error.message || '역할별 분포 조회에 실패했습니다.'
      };
    }
  }

  /**
   * 사용자 활동 상태 확인
   * @param {string} userId - 사용자 ID
   * @returns {Promise<Object>} 사용자 활동 상태
   */
  async getUserActivity(userId) {
    try {
      if (!userId) {
        throw new Error('사용자 ID가 필요합니다.');
      }

      // 현재는 기본 사용자 정보만 반환
      // 향후 사용자 활동 로그 API가 추가되면 해당 정보 포함
      const userResult = await this.getUserById(userId);
      
      if (!userResult.success) {
        throw new Error(userResult.error);
      }

      const user = userResult.data;
      const now = new Date();
      const lastLogin = user.lastLoginAt ? new Date(user.lastLoginAt) : null;
      
      // 활동 상태 계산
      let activityStatus = 'unknown';
      let daysSinceLastLogin = null;
      
      if (lastLogin) {
        daysSinceLastLogin = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
        
        if (daysSinceLastLogin === 0) {
          activityStatus = 'active'; // 오늘 로그인
        } else if (daysSinceLastLogin <= 7) {
          activityStatus = 'recent'; // 일주일 내 로그인
        } else if (daysSinceLastLogin <= 30) {
          activityStatus = 'moderate'; // 한 달 내 로그인
        } else {
          activityStatus = 'inactive'; // 장기 미접속
        }
      }

      return {
        success: true,
        data: {
          ...user,
          activityStatus,
          daysSinceLastLogin,
          isRecentlyActive: daysSinceLastLogin !== null && daysSinceLastLogin <= 7
        },
        message: '사용자 활동 상태를 성공적으로 조회했습니다.'
      };
    } catch (error) {
      console.error('사용자 활동 상태 조회 실패:', error);
      return {
        success: false,
        error: error.message || '사용자 활동 상태 조회에 실패했습니다.'
      };
    }
  }
}

export default new UserManagementService();
export { USER_SEARCH_OPTIONS, USER_STATUS, USER_ROLES };