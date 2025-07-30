// src/services/groupService.js

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

export class GroupService {
  constructor(apiClient) {
    this.api = apiClient;
  }

  /**
   * 사용자가 접근 가능한 그룹 목록 조회
   */
  async getGroups() {
    const response = await this.api(`${API_BASE_URL}/api/groups`);
    if (!response.ok) {
      throw new Error('그룹 목록 조회에 실패했습니다.');
    }
    return await response.json();
  }

  /**
   * 그룹 상세 정보 조회
   */
  async getGroup(id) {
    const response = await this.api(`${API_BASE_URL}/api/groups/${id}`);
    if (!response.ok) {
      throw new Error('그룹 정보 조회에 실패했습니다.');
    }
    return await response.json();
  }

  /**
   * 새 그룹 생성
   */
  async createGroup(groupData) {
    const response = await this.api(`${API_BASE_URL}/api/groups`, {
      method: 'POST',
      body: JSON.stringify(groupData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '그룹 생성에 실패했습니다.');
    }
    return await response.json();
  }

  /**
   * 그룹 정보 수정
   */
  async updateGroup(id, groupData) {
    const response = await this.api(`${API_BASE_URL}/api/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(groupData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '그룹 수정에 실패했습니다.');
    }
    return await response.json();
  }

  /**
   * 그룹 삭제
   */
  async deleteGroup(id) {
    const response = await this.api(`${API_BASE_URL}/api/groups/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '그룹 삭제에 실패했습니다.');
    }
    return true;
  }

  /**
   * 그룹 멤버 목록 조회
   */
  async getGroupMembers(id) {
    const response = await this.api(`${API_BASE_URL}/api/groups/${id}/members`);
    if (!response.ok) {
      throw new Error('그룹 멤버 목록 조회에 실패했습니다.');
    }
    return await response.json();
  }

  /**
   * 그룹에 멤버 초대
   */
  async inviteMember(groupId, memberData) {
    const response = await this.api(`${API_BASE_URL}/api/groups/${groupId}/members`, {
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
   * 그룹 멤버 역할 변경
   */
  async updateMemberRole(groupId, memberId, roleData) {
    const response = await this.api(`${API_BASE_URL}/api/groups/${groupId}/members/${memberId}`, {
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
   * 그룹에서 멤버 제거
   */
  async removeMember(groupId, memberId) {
    const response = await this.api(`${API_BASE_URL}/api/groups/${groupId}/members/${memberId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || '멤버 제거에 실패했습니다.');
    }
    return true;
  }

  /**
   * 프로젝트의 그룹 목록 조회
   */
  async getProjectGroups(projectId) {
    const response = await this.api(`${API_BASE_URL}/api/projects/${projectId}/groups`);
    if (!response.ok) {
      throw new Error('프로젝트 그룹 목록 조회에 실패했습니다.');
    }
    return await response.json();
  }
}

export default GroupService;