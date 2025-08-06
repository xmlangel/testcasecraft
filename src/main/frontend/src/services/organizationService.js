// src/services/organizationService.js
import { demoOrganizationsData, organizationHelpers } from '../models/demoOrganizationData';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const USE_DEMO_DATA = process.env.REACT_APP_USE_DEMO_DATA === 'true'; // 환경변수가 'true'일 때만 더미 데이터 사용

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
      // 에러 응답의 상세 정보를 파싱하여 전달
      try {
        const errorData = await response.json();
        const error = new Error(errorData.message || '조직 목록 조회에 실패했습니다.');
        // 에러 객체에 추가 정보 첨부
        error.errorCode = errorData.errorCode;
        error.timestamp = errorData.timestamp;
        error.details = errorData.details;
        throw error;
      } catch (parseError) {
        // JSON 파싱 실패 시 기본 메시지
        if (parseError.errorCode) throw parseError; // 이미 파싱된 에러면 그대로 전달
        throw new Error('조직 목록 조회에 실패했습니다.');
      }
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
    if (USE_DEMO_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const organization = organizationHelpers.getOrganizationById(id);
      if (!organization) {
        throw new Error('조직을 찾을 수 없습니다.');
      }
      // 더미 데이터에서 멤버 목록을 실제 API 응답 형태로 변환
      const members = organization.members.map((member, index) => ({
        id: `member_${member.id}_${index}`, // 고유한 멤버 ID
        user: {
          id: member.id,
          name: member.name,
          username: member.email.split('@')[0], // email에서 username 추출
          email: member.email
        },
        roleInOrganization: member.role,
        joinedAt: member.joinedAt
      }));
      console.log('getOrganizationMembers - 조직 ID:', id);
      console.log('getOrganizationMembers - 반환된 멤버 데이터:', members);
      return members;
    }
    
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
    console.log('getOrganizationProjects 호출됨:', { organizationId: id, USE_DEMO_DATA });
    
    if (USE_DEMO_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const demoProjects = organizationHelpers.getProjectsByOrganization(id);
      console.log('데모 프로젝트 데이터 반환:', demoProjects);
      return demoProjects;
    }
    
    const url = `${API_BASE_URL}/api/organizations/${id}/projects`;
    console.log('조직별 프로젝트 API 호출:', url);
    
    const response = await this.api(url);
    console.log('조직별 프로젝트 API 응답:', { status: response.status, ok: response.ok });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('조직별 프로젝트 API 오류:', errorText);
      throw new Error('조직 프로젝트 목록 조회에 실패했습니다.');
    }
    
    const data = await response.json();
    console.log('조직별 프로젝트 데이터:', data);
    return data;
  }

  /**
   * 조직의 그룹 목록 조회
   */
  async getOrganizationGroups(id) {
    if (USE_DEMO_DATA) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const organization = organizationHelpers.getOrganizationById(id);
      if (!organization) {
        throw new Error('조직을 찾을 수 없습니다.');
      }
      return organization.groups || [];
    }
    
    const response = await this.api(`${API_BASE_URL}/api/organizations/${id}/groups`);
    if (!response.ok) {
      throw new Error('조직 그룹 목록 조회에 실패했습니다.');
    }
    return await response.json();
  }

  /**
   * 조직에 새 프로젝트 생성
   */
  async createOrganizationProject(organizationId, projectData) {
    if (USE_DEMO_DATA) {
      // 더미 모드에서는 로컬 상태 업데이트 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Demo mode: 조직별 프로젝트 생성 시뮬레이션', { organizationId, projectData });
      // 실제 더미 데이터 업데이트는 생략 (복잡성을 위해)
      return {
        id: `project-${Date.now()}`,
        name: projectData.name,
        description: projectData.description,
        organizationId: organizationId,
        createdAt: new Date().toISOString()
      };
    }
    
    // 백엔드 조직별 프로젝트 생성 API 호출
    const response = await this.api(`${API_BASE_URL}/api/projects/organization/${organizationId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
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