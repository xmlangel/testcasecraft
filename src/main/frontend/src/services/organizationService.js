// src/services/organizationService.js
import { demoOrganizationsData, organizationHelpers } from '../models/demoOrganizationData';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const USE_DEMO_DATA = process.env.REACT_APP_USE_DEMO_DATA !== 'false'; // 기본적으로 더미 데이터 사용

export class OrganizationService {
  constructor(apiClient) {
    this.api = apiClient;
  }

  /**
   * 사용자가 접근 가능한 조직 목록 조회
   */
  async getOrganizations() {
    if (USE_DEMO_DATA) {
      // 더미 데이터 반환 (실제 네트워크 호출 시뮬레이션)
      await new Promise(resolve => setTimeout(resolve, 300));
      return demoOrganizationsData.organizations;
    }
    
    const response = await this.api(`${API_BASE_URL}/api/organizations`);
    if (!response.ok) {
      throw new Error('조직 목록 조회에 실패했습니다.');
    }
    return await response.json();
  }

  /**
   * 조직 상세 정보 조회
   */
  async getOrganization(id) {
    if (USE_DEMO_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const organization = organizationHelpers.getOrganizationById(id);
      if (!organization) {
        throw new Error('조직을 찾을 수 없습니다.');
      }
      return organization;
    }
    
    const response = await this.api(`${API_BASE_URL}/api/organizations/${id}`);
    if (!response.ok) {
      throw new Error('조직 정보 조회에 실패했습니다.');
    }
    return await response.json();
  }

  /**
   * 새 조직 생성
   */
  async createOrganization(organizationData) {
    const response = await this.api(`${API_BASE_URL}/api/organizations`, {
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
    const response = await this.api(`${API_BASE_URL}/api/organizations/${id}`, {
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
   */
  async deleteOrganization(id) {
    const response = await this.api(`${API_BASE_URL}/api/organizations/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '조직 삭제에 실패했습니다.');
    }
    return true;
  }

  /**
   * 조직 멤버 목록 조회
   */
  async getOrganizationMembers(id) {
    const response = await this.api(`${API_BASE_URL}/api/organizations/${id}/members`);
    if (!response.ok) {
      throw new Error('조직 멤버 목록 조회에 실패했습니다.');
    }
    return await response.json();
  }

  /**
   * 조직에 멤버 초대
   */
  async inviteMember(organizationId, memberData) {
    const response = await this.api(`${API_BASE_URL}/api/organizations/${organizationId}/members`, {
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
    const response = await this.api(`${API_BASE_URL}/api/organizations/${organizationId}/members/${memberId}`, {
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
    const response = await this.api(`${API_BASE_URL}/api/organizations/${organizationId}/members/${memberId}`, {
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
    if (USE_DEMO_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return organizationHelpers.getProjectsByOrganization(id);
    }
    
    const response = await this.api(`${API_BASE_URL}/api/organizations/${id}/projects`);
    if (!response.ok) {
      throw new Error('조직 프로젝트 목록 조회에 실패했습니다.');
    }
    return await response.json();
  }

  /**
   * 조직의 그룹 목록 조회
   */
  async getOrganizationGroups(id) {
    const response = await this.api(`${API_BASE_URL}/api/organizations/${id}/groups`);
    if (!response.ok) {
      throw new Error('조직 그룹 목록 조회에 실패했습니다.');
    }
    return await response.json();
  }
}

export default OrganizationService;