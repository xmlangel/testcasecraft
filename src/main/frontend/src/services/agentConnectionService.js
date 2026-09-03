// src/services/agentConnectionService.js

/**
 * 프로젝트별 외부 QA 에이전트 연동 설정 서비스.
 *
 * 에이전트는 제품 밖의 별도 스택이다. 이 서비스는 그 주소를 저장하고 살아 있는지
 * 확인하는 일만 한다. 실제 실행은 에이전트 앱에서 일어나고, 결과는 에이전트가
 * 제품의 공개 API 로 올린다.
 */

import { getDynamicApiUrl } from "../utils/apiConstants.js";

let API_ROOT = null;

const getApiRoot = async () => {
  if (!API_ROOT) {
    API_ROOT = await getDynamicApiUrl();
  }
  return API_ROOT;
};

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

const base = async (projectId) =>
  `${await getApiRoot()}/api/projects/${projectId}/agent-connection`;

/**
 * 응답 본문에서 오류 문구를 꺼낸다.
 *
 * 서버 문구를 그대로 쓴다. 백엔드가 이미 지역화해 보내므로 여기서 다시 만들지 않는다.
 * 본문이 없으면 상태코드만 돌리고, 사람이 읽을 문구는 화면이 t() 로 붙인다.
 */
const readError = async (response) => {
  try {
    const data = await response.json();
    return data?.message || data?.error || data?.detail || `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
};

class AgentConnectionService {
  /**
   * 연동 설정을 읽는다.
   * 미설정(404)은 오류가 아니라 정상 상태이므로 null 을 돌린다.
   * 전역 킬스위치가 꺼져 있어도 404 이므로 같은 자리로 떨어진다.
   */
  async get(projectId) {
    const response = await fetch(await base(projectId), {
      headers: authHeaders(),
    });
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(await readError(response));
    }
    return response.json();
  }

  /**
   * 자동화 화면이 버튼을 띄울지 판단할 때 쓴다.
   * 조회가 실패하면 숨김이 기본값이다. 반대로 짜면 에이전트가 죽었을 때 버튼이
   * 남아 사용자가 누른다.
   */
  async runnable(projectId) {
    try {
      const response = await fetch(`${await base(projectId)}/runnable`, {
        headers: authHeaders(),
      });
      if (!response.ok) return { enabled: false, runnable: false, name: "" };
      return await response.json();
    } catch {
      return { enabled: false, runnable: false, name: "" };
    }
  }

  /**
   * 연동 설정을 저장한다.
   * token 을 넘기지 않으면 기존 값을 유지하고, 빈 문자열이면 삭제한다.
   */
  async save(projectId, payload) {
    const response = await fetch(await base(projectId), {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error(await readError(response));
    }
    return response.json();
  }

  /** 연결 테스트. 에이전트의 /health 만 확인하고 두 필드만 돌아온다. */
  async test(projectId) {
    const response = await fetch(`${await base(projectId)}/test`, {
      method: "POST",
      headers: authHeaders(),
    });
    if (!response.ok) {
      throw new Error(await readError(response));
    }
    return response.json();
  }

  async remove(projectId) {
    const response = await fetch(await base(projectId), {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!response.ok && response.status !== 404) {
      throw new Error(await readError(response));
    }
    return true;
  }

  /**
   * 에이전트 앱으로 가는 딥링크를 만든다.
   * 이 링크는 API 를 호출하지 않는다. 앱을 열 뿐이고, 결과가 제품으로 돌아오는 경로와
   * 무관하다. 링크가 깨져도 기능은 죽지 않는다.
   */
  buildDeepLink(connection, projectId, caseIds = []) {
    if (!connection?.serverUrl) return null;
    const params = new URLSearchParams({
      tms: "testcasecraft",
      base: window.location.origin,
      projectId,
    });
    if (caseIds.length > 0) params.set("cases", caseIds.join(","));
    if (connection.defaultProfile) params.set("profile", connection.defaultProfile);
    return `${connection.serverUrl.replace(/\/+$/, "")}/runs/new?${params.toString()}`;
  }
}

const agentConnectionService = new AgentConnectionService();
export default agentConnectionService;
