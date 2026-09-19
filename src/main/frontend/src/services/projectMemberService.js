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

/**
 * 프로젝트 내 역할 목록. 값은 백엔드 ProjectUser.ProjectRole 과 같고, 순서는 권한이
 * 넓은 것부터 좁은 것으로 세운다.
 *
 * 앞의 넷이 플랜·케이스를 만들 수 있는 역할이고(ProjectUser.hasEditRole 의 집합과 같다),
 * 뒤의 둘은 만들 수 없다. 예전에는 테스터가 기여자보다 위에 있어서, 목록을 위에서부터
 * 읽으면 권한이 계단처럼 내려간다고 오해하기 쉬웠다.
 *
 * 역할은 데이터베이스에 문자열로 저장되므로(@Enumerated(EnumType.STRING)) 이 순서를
 * 바꿔도 기존 멤버의 역할은 그대로다.
 */
export const PROJECT_ROLES = [
  "PROJECT_MANAGER",
  "LEAD_DEVELOPER",
  "DEVELOPER",
  "CONTRIBUTOR",
  "TESTER",
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
