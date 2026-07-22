// src/services/graphApi.js
// 온톨로지 인스턴스 그래프(AgensGraph) 백엔드 API 호출 래퍼.
// 모든 함수는 AuthContext 의 `api(url, options)` fetch 래퍼를 첫 인자로 받는다.
// 응답 형태: { nodes: [{id,label,properties}], edges: [{id,label,source,target,properties}] }

const json = async (response) => {
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const message =
      err.message || err.error || `요청 실패 (${response.status})`;
    const e = new Error(message);
    e.status = response.status;
    throw e;
  }
  if (response.status === 204) return null;
  return response.json();
};

// 그래프 기능 활성 여부 + DB 연결 상태
export const getGraphStatus = (api) => api(`/api/graph/status`).then(json);

// 프로젝트 온톨로지 인스턴스 그래프 (노드=인스턴스, 레이블=온톨로지 타입)
export const getProjectStructure = (api, projectId) =>
  api(`/api/graph/project/${encodeURIComponent(projectId)}/structure`).then(
    json,
  );

// 인스턴스 이웃 그래프
export const getNeighborhood = (api, projectId, instanceId, depth = 1) =>
  api(
    `/api/graph/instance/${encodeURIComponent(instanceId)}/neighborhood` +
      `?projectId=${encodeURIComponent(projectId)}&depth=${depth}`,
  ).then(json);

// 온톨로지 그래프 동기화 (프로젝트 관리 권한 필요) — 멱등
export const syncGraph = (api, projectId) =>
  api(`/api/graph/sync?projectId=${encodeURIComponent(projectId)}`, {
    method: "POST",
  }).then(json);
