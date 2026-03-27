// src/components/TestCase/Spreadsheet/utils/SpreadsheetUtils.js

import { listToTree } from "../../../../utils/treeUtils.jsx";

/**
 * 트리 구조를 평면화하면서 트리 순서를 유지하는 함수 (TestCaseTree.renderTree와 완전히 동일한 로직)
 * @param {Array} data - 테스트케이스 데이터 배열
 * @returns {Array} - 평면화된 데이터 배열
 */
export const flattenTreeInOrder = (data, allKnownIds = null) => {
  if (!data || data.length === 0) return [];

  // 트리 구조로 변환 (TestCaseTree와 동일: filteredTestCases -> listToTree)
  // allKnownIds가 있으면 고아 노드 판별에 사용
  const treeData = listToTree(data, null, { allKnownIds });

  // renderTree와 완전히 동일한 방식으로 평면화 및 정렬
  const flattenWithRenderTreeLogic = (nodes, result = []) => {
    // TestCaseTree.renderTree와 완전히 동일한 정렬 로직
    let sortedNodes = nodes.slice();
    // orderEditMode는 false라고 가정하고 displayOrder 정렬
    sortedNodes.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

    // 정렬된 노드를 순서대로 결과에 추가
    sortedNodes.forEach((node) => {
      // 현재 노드 추가
      result.push(node);
      // 자식이 있으면 재귀적으로 처리 (renderTree에서 children을 렌더링하는 것과 동일)
      if (Array.isArray(node.children) && node.children.length > 0) {
        flattenWithRenderTreeLogic(node.children, result);
      }
    });

    return result;
  };

  return flattenWithRenderTreeLogic(treeData);
};

/**
 * 폴더 감지 유틸리티 함수 (타입 컬럼은 인덱스 4)
 * @param {Array} row - 스프레드시트 행 데이터
 * @param {Function} t - i18n 번역 함수
 * @returns {boolean} - 폴더 여부
 */
export const isFolderRow = (row, t) => {
  const cellValue = row[4]?.value;
  const typeValue =
    typeof cellValue === "string" ? cellValue.trim().toLowerCase() : "";
  const folderText = t("testcase.type.folder", "폴더").toLowerCase();
  return (
    typeValue === folderText || typeValue === "folder" || typeValue === "📁"
  );
};

/**
 * 폴더명 추출 함수 (이름은 인덱스 6)
 * @param {Array} row - 스프레드시트 행 데이터
 * @returns {string} - 폴더명
 */
export const extractFolderName = (row) => {
  // 일곱 번째 컬럼(이름)에서 폴더명을 직접 가져옴 (인덱스 6)
  const cellValue = row[6]?.value;
  return typeof cellValue === "string" ? cellValue.trim() : "";
};

/**
 * 상위 폴더 추출 함수 (상위폴더는 인덱스 5)
 * @param {Array} row - 스프레드시트 행 데이터
 * @returns {string|null} - 상위 폴더명 또는 null
 */
export const extractParentFolder = (row) => {
  const cellValue = row[5]?.value;

  // undefined, null, "undefined", "null", 빈 문자열 모두 null 반환
  if (
    !cellValue ||
    cellValue === "undefined" ||
    cellValue === "null" ||
    (typeof cellValue === "string" && cellValue.trim() === "")
  ) {
    return null;
  }

  return typeof cellValue === "string" ? cellValue.trim() : null;
};

/**
 * 동적 컬럼 라벨 생성 함수 (ICT-339: 순차 ID 컬럼 추가, 순서 컬럼 추가, 작성자/수정자 컬럼 추가)
 * @param {number} stepCount - 스텝 수
 * @param {Function} t - i18n 번역 함수
 * @returns {Array} - 컬럼 라벨 배열
 */
export const generateColumnLabels = (stepCount, t) => {
  const baseColumns = [
    "ID",
    t("testcase.spreadsheet.column.createdBy", "작성자"),
    t("testcase.spreadsheet.column.updatedBy", "수정자"),
    t("testcase.spreadsheet.column.order", "순서"),
    t("testcase.spreadsheet.column.type", "타입"),
    t("testcase.spreadsheet.column.parentFolder", "상위폴더"),
    t("testcase.spreadsheet.column.name", "이름"),
    t("testcase.spreadsheet.column.description", "설명"),
    t("testcase.spreadsheet.column.preCondition", "사전조건"),
    t("testcase.spreadsheet.column.postCondition", "사후조건"),
    t("testcase.spreadsheet.column.expectedResults", "예상결과"),
    t("testcase.spreadsheet.column.priority", "우선순위"),
    t("testcase.spreadsheet.column.executionType", "수행유형"),
    t("testcase.spreadsheet.column.testTechnique", "테스트기법"),
    t("testcase.spreadsheet.column.tags", "태그"),
  ];
  const stepColumns = [];

  for (let i = 1; i <= stepCount; i++) {
    stepColumns.push(
      t("testcase.spreadsheet.column.step", "Step {number}", { number: i }),
    );
    stepColumns.push(
      t("testcase.spreadsheet.column.expected", "Expected {number}", {
        number: i,
      }),
    );
  }

  return [...baseColumns, ...stepColumns];
};

/**
 * 스프레드시트 데이터를 export용으로 변환하는 함수
 * @param {Array} spreadsheetData - 스프레드시트 데이터
 * @param {Array} columnLabels - 컬럼 라벨
 * @returns {Object} - { headers, rows }
 */
export const convertDataForExport = (spreadsheetData, columnLabels) => {
  if (!spreadsheetData || spreadsheetData.length === 0) {
    return { headers: columnLabels, rows: [] };
  }

  // 빈 행 제거
  const validRows = spreadsheetData.filter(
    (row) =>
      Array.isArray(row) &&
      row.some((cell) => typeof cell?.value === "string" && cell.value.trim()),
  );

  // 헤더와 데이터 행으로 변환
  const exportData = validRows.map((row) =>
    row.map((cell) => cell?.value || ""),
  );

  return {
    headers: columnLabels,
    rows: exportData,
  };
};
