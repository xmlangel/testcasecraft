// src/services/graphApi.js
// 그래프(AgensGraph) 백엔드 API 호출 래퍼.
// bookmarkApi.js 와 같은 패턴 — 모든 함수는 AuthContext 의 `api(url, options)` fetch 래퍼를 첫 인자로 받는다.
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

// 프로젝트 구조 그래프 (폴더·케이스·계획·실행·결과)
export const getProjectStructure = (api, projectId) =>
  api(`/api/graph/project/${encodeURIComponent(projectId)}/structure`).then(
    json,
  );

// 오류 클러스터 그래프 (FailureType 허브)
export const getFailureClusters = (api, projectId) =>
  api(`/api/graph/failures?projectId=${encodeURIComponent(projectId)}`).then(
    json,
  );

// 케이스 이웃 그래프
export const getNeighborhood = (api, projectId, testCaseId, depth = 1) =>
  api(
    `/api/graph/testcase/${encodeURIComponent(testCaseId)}/neighborhood` +
      `?projectId=${encodeURIComponent(projectId)}&depth=${depth}`,
  ).then(json);

// 기본 → 그래프 전환 (시나리오 C)
export const convertToGraph = (api, projectId, testCaseId) =>
  api(
    `/api/graph/testcase/${encodeURIComponent(testCaseId)}/convert?projectId=${encodeURIComponent(projectId)}`,
    { method: "POST" },
  ).then(json);

// 그래프 → 기본 역전환
export const revertToBasic = (api, projectId, testCaseId) =>
  api(
    `/api/graph/testcase/${encodeURIComponent(testCaseId)}/revert?projectId=${encodeURIComponent(projectId)}`,
    { method: "POST" },
  ).then(json);

// 그래프 TC 스텝 서브그래프 조회 (편집기 로딩)
export const getGraphSteps = (api, projectId, testCaseId) =>
  api(
    `/api/graph/testcase/${encodeURIComponent(testCaseId)}/steps?projectId=${encodeURIComponent(projectId)}`,
  ).then(json);

// 그래프 TC 스텝 편집 — steps: [{description, expectedResult}] 순서 보존
export const updateGraphSteps = (api, projectId, testCaseId, steps) =>
  api(
    `/api/graph/testcase/${encodeURIComponent(testCaseId)}/steps?projectId=${encodeURIComponent(projectId)}`,
    { method: "PUT", body: JSON.stringify(steps) },
  ).then(json);

// 관계 그래프 동기화 (프로젝트 관리 권한 필요) — 멱등
export const syncGraph = (api, projectId) =>
  api(`/api/graph/sync?projectId=${encodeURIComponent(projectId)}`, {
    method: "POST",
  }).then(json);

// 케이스 간 수동 관계 (그래프 뷰 편집) — type: DEPENDS_ON | RELATES_TO | BLOCKS
export const createRelation = (api, projectId, sourceId, targetId, type) =>
  api(
    `/api/graph/relation?projectId=${encodeURIComponent(projectId)}` +
      `&sourceId=${encodeURIComponent(sourceId)}&targetId=${encodeURIComponent(targetId)}` +
      `&type=${encodeURIComponent(type)}`,
    { method: "POST" },
  ).then(json);

export const deleteRelation = (api, projectId, sourceId, targetId, type) =>
  api(
    `/api/graph/relation?projectId=${encodeURIComponent(projectId)}` +
      `&sourceId=${encodeURIComponent(sourceId)}&targetId=${encodeURIComponent(targetId)}` +
      `&type=${encodeURIComponent(type)}`,
    { method: "DELETE" },
  ).then(json);
