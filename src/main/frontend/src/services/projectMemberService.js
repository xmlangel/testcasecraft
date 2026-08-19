// src/services/projectMemberService.js
/**
 * 프로젝트 멤버·역할 API 서비스.
 *
 * 백엔드는 ProjectController 의 멤버 엔드포인트를 쓴다. 초대·역할 변경은
 * 본문이 아니라 쿼리 파라미터를 받으므로(@RequestParam) 주소에 실어 보낸다.
 *
 * 인가는 서버가 정한다 — 초대·역할 변경은 PROJECT_MANAGER·LEAD_DEVELOPER 만
 * 통과하고(hasManagementRole), 목록 조회는 프로젝트 접근 권한이면 된다.
 */

import apiService from "./apiService.js";

/** 프로젝트 내 역할 목록. 백엔드 ProjectUser.ProjectRole 과 같은 순서·같은 값이다. */
export const PROJECT_ROLES = [
  "PROJECT_MANAGER",
  "LEAD_DEVELOPER",
  "DEVELOPER",
  "TESTER",
  "CONTRIBUTOR",
  "VIEWER",
];

class ProjectMemberService {
  /** 프로젝트 멤버 목록 */
  async getMembers(projectId) {
    const response = await apiService.get(`/api/projects/${projectId}/members`);
    return response.json();
  }

  /** 프로젝트에 넣을 수 있는 사용자 검색 (이미 멤버인 사람과 비활성 계정은 서버가 뺀다) */
  async searchCandidates(projectId, query) {
    const response = await apiService.get(
      `/api/projects/${projectId}/member-candidates?query=${encodeURIComponent(query)}`,
    );
    return response.json();
  }

  /** 사용자명으로 멤버 초대 */
  async inviteMember(projectId, username, role) {
    const query = `username=${encodeURIComponent(username)}&role=${encodeURIComponent(role)}`;
    const response = await apiService.request(
      `/api/projects/${projectId}/members?${query}`,
      { method: "POST" },
    );
    return response.json();
  }

  /** 멤버 역할 변경 */
  async updateMemberRole(projectId, userId, role) {
    const response = await apiService.request(
      `/api/projects/${projectId}/members/${userId}/role?role=${encodeURIComponent(role)}`,
      { method: "PUT" },
    );
    return response.json();
  }

  /** 멤버 제거 (204 No Content) */
  async removeMember(projectId, userId) {
    await apiService.delete(`/api/projects/${projectId}/members/${userId}`);
    return true;
  }
}

export default new ProjectMemberService();
