// src/services/testResultEditService.js

/**
 * ICT-209: 테스트 결과 편집 서비스
 * 테스트 결과 편집 기능을 위한 API 호출 서비스
 */

import { getDynamicApiUrl } from '../utils/apiConstants.js';

let API_BASE_URL = null;

const getApiBaseUrl = async () => {
  if (!API_BASE_URL) {
    const baseUrl = await getDynamicApiUrl();
    API_BASE_URL = `${baseUrl}/api/test-results/edits`;
  }
  return API_BASE_URL;
};

class TestResultEditService {
  constructor() {
    this.baseUrl = null;
  }

  async getBaseUrl() {
    if (!this.baseUrl) {
      this.baseUrl = await getApiBaseUrl();
    }
    return this.baseUrl;
  }

  /**
   * JWT 토큰이 포함된 헤더 생성
   */
  getAuthHeaders() {
    // AppContext에서 accessToken으로 저장하므로 accessToken을 먼저 확인
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  /**
   * 새로운 편집본 생성
   */
  async createEdit(editRequest) {
    try {
      const baseUrl = await this.getBaseUrl();
      const response = await fetch(baseUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(editRequest),
      });

      if (!response.ok) {
        throw new Error(`편집본 생성 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('편집본 생성 오류:', error);
      throw error;
    }
  }

  /**
   * 편집본 수정 (DRAFT 상태만 가능)
   */
  async updateEdit(editId, editRequest) {
    try {
      const baseUrl = await this.getBaseUrl();
      const response = await fetch(`${baseUrl}/${editId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(editRequest),
      });

      if (!response.ok) {
        throw new Error(`편집본 수정 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('편집본 수정 오류:', error);
      throw error;
    }
  }

  /**
   * 편집본 승인/거부
   */
  async processEditApproval(editId, approved, approvalComment = '') {
    try {
      const baseUrl = await this.getBaseUrl();
      const response = await fetch(`${baseUrl}/${editId}/approval`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          approved,
          approvalComment,
        }),
      });

      if (!response.ok) {
        throw new Error(`편집본 승인 처리 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('편집본 승인 처리 오류:', error);
      throw error;
    }
  }

  /**
   * 편집본 적용 (승인된 편집본을 활성화)
   */
  async applyEdit(editId) {
    try {
      const baseUrl = await this.getBaseUrl();
      const response = await fetch(`${baseUrl}/${editId}/apply`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`편집본 적용 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('편집본 적용 오류:', error);
      throw error;
    }
  }

  /**
   * 편집본 되돌리기
   */
  async revertEdit(editId) {
    try {
      const baseUrl = await this.getBaseUrl();
      const response = await fetch(`${baseUrl}/${editId}/revert`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`편집본 되돌리기 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('편집본 되돌리기 오류:', error);
      throw error;
    }
  }

  /**
   * 편집본 삭제 (DRAFT 상태만 가능)
   */
  async deleteEdit(editId) {
    try {
      const baseUrl = await this.getBaseUrl();
      const response = await fetch(`${baseUrl}/${editId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`편집본 삭제 실패: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('편집본 삭제 오류:', error);
      throw error;
    }
  }

  /**
   * 편집본 목록 조회 (필터링 지원)
   */
  async getEdits(filter = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filter).forEach(key => {
        if (filter[key] !== null && filter[key] !== undefined && filter[key] !== '') {
          params.append(key, filter[key]);
        }
      });

      const baseUrl = await this.getBaseUrl();
      const response = await fetch(`${baseUrl}?${params.toString()}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`편집본 목록 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('편집본 목록 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 특정 테스트 결과의 편집 이력 조회
   */
  async getEditHistory(testResultId) {
    try {
      const baseUrl = await this.getBaseUrl();
      const response = await fetch(`${baseUrl}/test-result/${testResultId}/history`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`편집 이력 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('편집 이력 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 특정 테스트 결과의 활성 편집본 조회
   */
  async getActiveEdit(testResultId) {
    try {
      const baseUrl = await this.getBaseUrl();
      const response = await fetch(`${baseUrl}/test-result/${testResultId}/active`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (response.status === 404) {
        return null; // 활성 편집본이 없음
      }

      if (!response.ok) {
        throw new Error(`활성 편집본 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('활성 편집본 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 편집 통계 조회
   */
  async getEditStatistics() {
    try {
      const baseUrl = await this.getBaseUrl();
      const response = await fetch(`${baseUrl}/statistics`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`편집 통계 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('편집 통계 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 승인 대기 중인 편집본 목록 조회
   */
  async getPendingApprovals(page = 0, size = 20) {
    try {
      const baseUrl = await this.getBaseUrl();
      const response = await fetch(`${baseUrl}/pending-approvals?page=${page}&size=${size}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`승인 대기 목록 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('승인 대기 목록 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 내 편집본 목록 조회
   */
  async getMyEdits(page = 0, size = 20, editStatus = null) {
    try {
      const params = new URLSearchParams({ page, size });
      if (editStatus) {
        params.append('editStatus', editStatus);
      }

      const baseUrl = await this.getBaseUrl();
      const response = await fetch(`${baseUrl}/my-edits?${params.toString()}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`내 편집본 목록 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('내 편집본 목록 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 편집 상태 정보 조회
   */
  async getEditStatusInfo() {
    try {
      const baseUrl = await this.getBaseUrl();
      const response = await fetch(`${baseUrl}/status-info`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`편집 상태 정보 조회 실패: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('편집 상태 정보 조회 오류:', error);
      throw error;
    }
  }

  /**
   * 편집 권한 확인
   */
  async checkEditPermissions(testResultId, currentUserId) {
    try {
      const activeEdit = await this.getActiveEdit(testResultId);
      
      return {
        canCreate: true, // 모든 사용자가 편집본 생성 가능
        canEdit: !activeEdit || (activeEdit.editedByUserId === currentUserId && activeEdit.editStatus === 'DRAFT'),
        canApprove: activeEdit && activeEdit.editedByUserId !== currentUserId && activeEdit.editStatus === 'PENDING',
        canApply: activeEdit && activeEdit.editStatus === 'APPROVED',
        canRevert: activeEdit && activeEdit.editStatus === 'APPLIED',
        canDelete: activeEdit && activeEdit.editedByUserId === currentUserId && activeEdit.editStatus === 'DRAFT',
        hasActiveEdit: !!activeEdit,
        activeEdit: activeEdit
      };
    } catch (error) {
      console.error('편집 권한 확인 오류:', error);
      return {
        canCreate: true,
        canEdit: false,
        canApprove: false,
        canApply: false,
        canRevert: false,
        canDelete: false,
        hasActiveEdit: false,
        activeEdit: null
      };
    }
  }

  /**
   * 편집 상태별 색상 및 라벨 정보
   */
  getEditStatusInfo(status) {
    const statusInfo = {
      'DRAFT': {
        label: '임시저장',
        color: 'default',
        description: '편집 중인 상태',
        icon: '✏️'
      },
      'PENDING': {
        label: '승인 대기',
        color: 'warning',
        description: '검토 요청됨',
        icon: '⏳'
      },
      'APPROVED': {
        label: '승인됨',
        color: 'success',
        description: '적용 가능',
        icon: '✅'
      },
      'APPLIED': {
        label: '적용됨',
        color: 'primary',
        description: '현재 활성',
        icon: '🎯'
      },
      'REJECTED': {
        label: '거부됨',
        color: 'error',
        description: '수정 필요',
        icon: '❌'
      },
      'REVERTED': {
        label: '되돌림',
        color: 'secondary',
        description: '이전 상태로 복원',
        icon: '↩️'
      }
    };

    return statusInfo[status] || {
      label: '알 수 없음',
      color: 'default',
      description: '',
      icon: '❓'
    };
  }

  /**
   * 편집 유효성 검사
   */
  validateEditRequest(editRequest) {
    const errors = [];

    if (!editRequest.originalTestResultId) {
      errors.push('원본 테스트 결과 ID가 필요합니다');
    }

    if (editRequest.editedTestCaseName && editRequest.editedTestCaseName.trim().length === 0) {
      errors.push('테스트케이스명은 빈 값일 수 없습니다');
    }

    if (editRequest.editedResult && !['PASS', 'FAIL', 'BLOCKED', 'NOT_RUN'].includes(editRequest.editedResult)) {
      errors.push('유효하지 않은 테스트 결과입니다');
    }

    if (editRequest.editedNotes && editRequest.editedNotes.length > 5000) {
      errors.push('비고는 5000자를 초과할 수 없습니다');
    }

    if (!editRequest.editReason || editRequest.editReason.trim().length === 0) {
      errors.push('편집 이유는 필수입니다');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
const testResultEditService = new TestResultEditService();
export default testResultEditService;