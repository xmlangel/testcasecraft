// src/services/importExportApi.js
/**
 * 테스트케이스 Import / Export API 서비스
 * - 샘플 파일 다운로드
 * - CSV, Excel, JSON, Google Sheets Import / Export
 * - Import 사전 검증
 */

import apiService from "./apiService.js";

/** 인증 헤더 반환 */
const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
});

/** API Base URL (apiService와 동일하게 현재 origin 사용) */
const getBaseUrl = () => window.location.origin;

/**
 * 샘플 파일 다운로드 (브라우저에 직접 다운로드 트리거)
 * @param {string} format - 'csv' | 'excel' | 'json'
 */
export const downloadSampleFile = async (format) => {
  try {
    const response = await apiService.get(`/api/testcases/sample/${format}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const extMap = { csv: "csv", excel: "xlsx", json: "json" };
    const ext = extMap[format] || format;
    triggerDownload(blob, `sample_testcases.${ext}`);
    return { success: true };
  } catch (error) {
    return { success: false, message: `샘플 다운로드 실패: ${error.message}` };
  }
};

/**
 * Import 전 사전 검증 (파일 저장 없음)
 * @param {File} file - 업로드할 파일
 * @param {string} format - 'csv' | 'excel' | 'json'
 * @param {string} projectId
 * @returns {Promise<{totalRows, validRows, invalidRows, errors, previewData}>}
 */
export const validateImportFile = async (file, format, projectId) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("format", format);
  formData.append("projectId", projectId);

  const response = await fetch(
    `${getBaseUrl()}/api/testcases/import/validate`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || error.error || `검증 요청 실패 (${response.status})`,
    );
  }
  return response.json();
};

/**
 * 파일에서 테스트케이스 Import
 * @param {File} file - 업로드할 파일
 * @param {string} format - 'csv' | 'excel' | 'json'
 * @param {string} projectId
 * @returns {Promise<{importedCount, items}>}
 */
export const importTestCases = async (file, format, projectId) => {
  const endpointMap = {
    csv: "/api/testcases/import/csv-standard",
    excel: "/api/testcases/import/excel-standard",
    json: "/api/testcases/import/json",
  };
  const endpoint = endpointMap[format];
  if (!endpoint) throw new Error(`지원하지 않는 형식: ${format}`);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("projectId", projectId);

  const response = await fetch(`${getBaseUrl()}${endpoint}`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || error.error || `Import 실패 (${response.status})`,
    );
  }
  return response.json();
};

/**
 * Google Sheets에서 Import
 * @param {string} spreadsheetUrl - Google Sheets URL 또는 ID
 * @param {string} sheetName - 시트명
 * @param {string} projectId
 */
export const importFromGoogleSheet = async (
  spreadsheetUrl,
  sheetName,
  projectId,
) => {
  const spreadsheetId = extractSpreadsheetId(spreadsheetUrl);
  const mapping = {
    fieldMappings: {
      type: "type",
      name: "name",
      description: "description",
      preCondition: "preCondition",
      postCondition: "postCondition",
      priority: "priority",
      executionType: "executionType",
      isAutomated: "isAutomated",
      tags: "tags",
    },
    converters: [],
  };

  const params = new URLSearchParams({ spreadsheetId, sheetName, projectId });
  const response = await fetch(
    `${getBaseUrl()}/api/testcases/import/google-sheet?${params}`,
    {
      method: "POST",
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(mapping),
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || error.error || "Google Sheets Import 실패",
    );
  }
  return response.json();
};

/**
 * 테스트케이스를 지정 형식으로 Export (브라우저 다운로드)
 * @param {string} projectId
 * @param {string} format - 'csv' | 'excel' | 'json'
 */
export const exportTestCasesAs = async (projectId, format) => {
  try {
    const response = await apiService.get(
      `/api/testcases/export/${format}?projectId=${encodeURIComponent(projectId)}`,
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const extMap = { csv: "csv", excel: "xlsx", json: "json" };
    const ext = extMap[format] || format;
    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:-]/g, "");
    triggerDownload(blob, `testcases_export_${timestamp}.${ext}`);
    return { success: true };
  } catch (error) {
    return { success: false, message: `Export 실패: ${error.message}` };
  }
};

/**
 * Google Sheets로 Export
 * @param {string} projectId
 * @param {string} spreadsheetUrl - Google Sheets URL 또는 ID
 * @param {string} sheetName
 */
export const exportToGoogleSheet = async (
  projectId,
  spreadsheetUrl,
  sheetName,
) => {
  const googleSheetId = extractSpreadsheetId(spreadsheetUrl);
  const response = await fetch(
    `${getBaseUrl()}/api/testcases/export/google-sheet`,
    {
      method: "POST",
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        googleSheetId,
        sheetName: sheetName || "TestCases",
        format: "google-sheet",
      }),
    },
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      error.message || error.error || "Google Sheets Export 실패",
    );
  }
  return response.json();
};

/** 내 Google 설정 조회 */
export const getMyGoogleConfig = async () => {
  const response = await fetch(`${getBaseUrl()}/api/google-configs/my`, {
    headers: getAuthHeaders(),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Google 설정을 가져오는데 실패했습니다.");
  return response.json();
};

/** 마지막 사용 Google Sheets 정보 업데이트 */
export const updateLastUsedGoogleSheet = async (
  type,
  spreadsheetId,
  sheetName,
) => {
  const response = await fetch(`${getBaseUrl()}/api/google-configs/last-used`, {
    method: "PATCH",
    headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ type, spreadsheetId, sheetName }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.warn("마지막 사용 정보 업데이트 실패:", error.message);
  }
};

// ---- 헬퍼 함수 ----

function triggerDownload(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

function extractSpreadsheetId(input) {
  if (!input) return input;
  const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  return input;
}
