// src/services/organizationService.js
import { API_CONFIG, getDynamicApiUrl } from '../utils/apiConstants.js';

// apiService와 동일한 방식으로 동적 URL 사용
let API_BASE_URL = null;
let dynamicApiUrlPromise = null;

const getApiBaseUrl = async () => {
  if (!dynamicApiUrlPromise) {
    dynamicApiUrlPromise = getDynamicApiUrl().catch(error => {
      console.warn('동적 API URL 로드 실패, 기본값 사용:', error);
      return window.location.origin || 'http://localhost:8080';
    });
  }

  if (!API_BASE_URL) {
    API_BASE_URL = await dynamicApiUrlPromise;
  }

  return API_BASE_URL;
};

// 진행 중인 요청 추적 (중복 호출 방지)
const pendingRequests = new Map();

export class OrganizationService {
  constructor(apiClient) {
    this.api = apiClient;
  }

  /**
   * 사용자가 접근 가능한 조직 목록 조회
   */
  async getOrganizations() {
    const cacheKey = 'organizations-list';

    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey);
    }

    const request = (async () => {
      try {
        const baseUrl = await getApiBaseUrl();
        const response = await this.api(`${baseUrl}/api/organizations`);
        if (!response.ok) {
          // 에러 응답의 상세 정보를 파싱하여 전달
          try {
            const errorData = await response.json();
            const error = new Error(errorData.message || '조직 목록 조회에 실패했습니다.');
            error.errorCode = errorData.errorCode;
            error.timestamp = errorData.timestamp;
            error.details = errorData.details;
            throw error;
          } catch (parseError) {
            if (parseError.errorCode) throw parseError;
            throw new Error('조직 목록 조회에 실패했습니다.');
          }
        }
        return await response.json();
      } finally {
        pendingRequests.delete(cacheKey);
      }
    })();

    pendingRequests.set(cacheKey, request);
    return request;
  }

  /**
   * 조직 상세 정보 조회
   */
  async getOrganization(id) {
    const response = await this.api(`${await getApiBaseUrl()}/api/organizations/${id}`);
    if (!response.ok) {
      throw new Error('조직 정보 조회에 실패했습니다.');
    }
    return await response.json();
  }

  /**
   * 새 조직 생성
   */
  async createOrganization(organizationData) {
    const response = await this.api(`${await getApiBaseUrl()}/api/organizations`, {
      method: 'POST',
      body: JSON.stringify(organizationData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '조직 생성에 실패했습니다.');
    }
    return await response.json();
  }

  /**
   * 조직 정보 수정
   */
  async updateOrganization(id, organizationData) {
    const response = await this.api(`${await getApiBaseUrl()}/api/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(organizationData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '조직 수정에 실패했습니다.');
    }
    return await response.json();
  }

  /**
   * 조직 삭제
   * @param {string} id 조직 ID
   * @param {boolean} force 강제 삭제 여부 (기본값: false)
   */
  async deleteOrganization(id, force = false) {
    const endpoint = force
      ? `/api/organizations/${id}?force=true`
      : `/api/organizations/${id}`;

    const response = await this.api(`${await getApiBaseUrl()}${endpoint}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '조직 삭제에 실패했습니다.');
    }
    return true;
  }

  /**
   * 조직 소유권 이전
   * @param {string} organizationId 조직 ID
   * @param {string} newOwnerUserId 새로운 소유자 사용자 ID
   */
  async transferOwnership(organizationId, newOwnerUserId) {
    const response = await this.api(`${await getApiBaseUrl()}/api/organizations/${organizationId}/transfer-ownership`, {
      method: 'POST',
      body: JSON.stringify({ newOwnerUserId }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '소유권 이전에 실패했습니다.');
    }
    return await response.json();
  }

  /**
   * 조직 멤버 목록 조회
   */
  async getOrganizationMembers(id) {
    const response = await this.api(`${await getApiBaseUrl()}/api/organizations/${id}/members`);
    if (!response.ok) {
      throw new Error('조직 멤버 목록 조회에 실패했습니다.');
    }
    return await response.json();
  }

  /**
   * 조직에 멤버 초대
   */
  async inviteMember(organizationId, memberData) {
    const response = await this.api(`${await getApiBaseUrl()}/api/organizations/${organizationId}/members`, {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '멤버 초대에 실패했습니다.');
    }
    return await response.json();
  }

  /**
   * 조직 멤버 역할 변경
   */
  async updateMemberRole(organizationId, memberId, roleData) {
    const response = await this.api(`${await getApiBaseUrl()}/api/organizations/${organizationId}/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify(roleData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '멤버 역할 변경에 실패했습니다.');
    }
    return await response.json();
  }

  /**
   * 조직에서 멤버 제거
   */
  async removeMember(organizationId, memberId) {
    const response = await this.api(`${await getApiBaseUrl()}/api/organizations/${organizationId}/members/${memberId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '멤버 제거에 실패했습니다.');
    }
    return true;
  }

  /**
   * 조직의 프로젝트 목록 조회
   */
  async getOrganizationProjects(id) {
    const url = `${await getApiBaseUrl()}/api/organizations/${id}/projects`;

    const response = await this.api(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('조직별 프로젝트 API 오류:', errorText);
      throw new Error('조직 프로젝트 목록 조회에 실패했습니다.');
    }

    const data = await response.json();
    return data;
  }

  /**
   * 조직의 그룹 목록 조회
   */
  async getOrganizationGroups(id) {
    const response = await this.api(`${await getApiBaseUrl()}/api/organizations/${id}/groups`);
    if (!response.ok) {
      throw new Error('조직 그룹 목록 조회에 실패했습니다.');
    }
    return await response.json();
  }

  /**
   * 조직에 새 프로젝트 생성
   */
  async createOrganizationProject(organizationId, projectData) {
    // 백엔드 조직별 프로젝트 생성 API 호출
    const response = await this.api(`${await getApiBaseUrl()}/api/projects/organization/${organizationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code: projectData.code,
        name: projectData.name,
        description: projectData.description || ''
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '조직별 프로젝트 생성에 실패했습니다.');
    }
    return await response.json();
  }
}

export default OrganizationService;