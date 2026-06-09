// src/services/bookmarkApi.js
// 즐겨찾기/개인 북마크 백엔드 API 호출 래퍼.
// 모든 함수는 AuthContext 의 `api(url, options)` fetch 래퍼를 첫 인자로 받는다.

const json = async (response) => {
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    const message = err.message || err.error || `요청 실패 (${response.status})`;
    const e = new Error(message);
    e.status = response.status;
    throw e;
  }
  // 204 No Content 대응
  if (response.status === 204) return null;
  return response.json();
};

// ===== 모음(Collection) =====

export const listCollections = (api, projectId) =>
  api(`/api/bookmarks/collections?projectId=${encodeURIComponent(projectId)}`).then(json);

export const createCollection = (api, { projectId, name, description }) =>
  api(`/api/bookmarks/collections`, {
    method: "POST",
    body: JSON.stringify({ projectId, name, description }),
  }).then(json);

export const updateCollection = (api, collectionId, { name, description }) =>
  api(`/api/bookmarks/collections/${collectionId}`, {
    method: "PUT",
    body: JSON.stringify({ name, description }),
  }).then(json);

export const deleteCollection = (api, collectionId) =>
  api(`/api/bookmarks/collections/${collectionId}`, { method: "DELETE" }).then(json);

// ===== 항목(Item) =====

export const listItems = (api, collectionId) =>
  api(`/api/bookmarks/collections/${collectionId}/items`).then(json);

export const addItem = (api, collectionId, { testCaseId, note }) =>
  api(`/api/bookmarks/collections/${collectionId}/items`, {
    method: "POST",
    body: JSON.stringify({ testCaseId, note }),
  }).then(json);

export const updateItem = (api, itemId, { note }) =>
  api(`/api/bookmarks/items/${itemId}`, {
    method: "PUT",
    body: JSON.stringify({ note }),
  }).then(json);

export const deleteItem = (api, itemId) =>
  api(`/api/bookmarks/items/${itemId}`, { method: "DELETE" }).then(json);

// ===== 별 버튼 토글 / 상태 =====

export const toggleFavorite = (api, testCaseId, projectId) =>
  api(
    `/api/bookmarks/testcases/${testCaseId}/toggle?projectId=${encodeURIComponent(projectId)}`,
    { method: "POST" },
  ).then(json);

export const getStatus = (api, projectId) =>
  api(`/api/bookmarks/status?projectId=${encodeURIComponent(projectId)}`).then(json);
