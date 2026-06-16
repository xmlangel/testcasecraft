// src/components/TestCase/Spreadsheet/utils/SpreadsheetUtils.js

import { listToTree } from "../../../../utils/treeUtils.jsx";
import { findFolderIdByName } from "./FolderManagement.js";

/**
 * 트리 구조를 평면화하면서 트리 순서를 유지하는 함수 (TestCaseTree.renderTree와 완전히 동일한 로직)
 * @param {Array} data - 테스트케이스 데이터 배열
 * @param {Object} options - { allKnownIds?, t? } 옵션
 * @returns {Array} - 평면화된 데이터 배열
 */
export const flattenTreeInOrder = (data, options = {}) => {
  if (!data || data.length === 0) return [];

  const { allKnownIds, t } = options;

  // 트리 구조로 변환 (TestCaseTree와 동일: filteredTestCases -> listToTree)
  // allKnownIds가 있으면 고아 노드 판별에 사용
  const listToTreeOptions = { allKnownIds };
  if (t) {
    listToTreeOptions.orphanFolderName = t("tree.orphan.name", "[미할당 항목]");
    listToTreeOptions.orphanFolderDescription = t(
      "tree.orphan.description",
      "상위 폴더가 삭제되거나 접근할 수 없어 길을 잃은 항목들입니다.",
    );
  }
  const treeData = listToTree(data, null, listToTreeOptions);

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

/**
 * 삭제 확정 후 화면에 남길 행을 계산한다.
 *
 * 폴더 삭제 시 하위 항목은 백엔드에서 함께 삭제되지만, 화면상으로는 선택 범위
 * 밖(다른 위치)에 있을 수 있다. 선택 범위(splice)만 제거하면 백엔드에선 지워졌는데
 * 화면엔 남는 유령 행이 생긴다. 따라서 ① 선택 범위 + ② 백엔드 삭제된 id 를 가진
 * 모든 행을 함께 제거한다.
 *
 * @param {Array} rows 현재 시트 행 (각 행은 셀 배열, row[0].testCaseId 에 id)
 * @param {number} startRow 선택 시작 인덱스
 * @param {number} count 선택 행 수
 * @param {Set<string>} deletedIdSet 백엔드에서 삭제된 testCaseId 집합 (하위 포함)
 * @returns {Array} 남길 행
 */
export const filterRowsAfterDelete = (rows, startRow, count, deletedIdSet) => {
  const ids = deletedIdSet || new Set();
  return (rows || []).filter((row, idx) => {
    const inRange = idx >= startRow && idx < startRow + count;
    const rowId = row?.[0]?.testCaseId;
    const isDeletedId = rowId != null && ids.has(rowId);
    return !inRange && !isDeletedId;
  });
};

/**
 * maxSteps 를 유효 범위(1~20)로 보정. 그 외에는 기본 3.
 */
export const clampMaxSteps = (maxSteps) =>
  Number.isFinite(maxSteps) && maxSteps >= 1 && maxSteps <= 20 ? maxSteps : 3;

// 데이터가 없을 때 보여줄 빈 행(컬럼 구조). 순서/작성자/수정자는 readOnly.
const buildEmptyRow = (safeMaxSteps) => {
  const baseFields = [
    { value: "" }, // ID
    { value: "", readOnly: true }, // 작성자
    { value: "", readOnly: true }, // 수정자
    { value: "", readOnly: true }, // 순서 (백엔드 관리)
    { value: "" }, // 타입
    { value: "" }, // 상위폴더
    { value: "" }, // 이름
    { value: "" }, // 설명
    { value: "" }, // 사전조건
    { value: "" }, // 사후조건
    { value: "" }, // 예상결과
    { value: "" }, // 우선순위
    { value: "" }, // 수행유형
    { value: "" }, // 테스트기법
    { value: "" }, // 태그
  ];
  const stepFields = [];
  for (let i = 0; i < safeMaxSteps; i++) {
    stepFields.push({ value: "" });
    stepFields.push({ value: "" });
  }
  return [...baseFields, ...stepFields];
};

// 단일 테스트케이스/폴더 노드를 스프레드시트 행으로 변환.
const buildTestCaseRow = (testCase, parentFolderName, safeMaxSteps, t) => {
  const isFolder = testCase.type === "folder";
  const row = [
    {
      value: testCase.displayId || testCase.sequentialId || "",
      readOnly: true,
      testCaseId: testCase.id,
    },
    { value: testCase.createdBy || "", readOnly: true },
    { value: testCase.updatedBy || "", readOnly: true },
    { value: testCase.displayOrder || "", readOnly: true },
    {
      value: isFolder
        ? t("testcase.type.folder", "폴더")
        : t("testcase.type.testcase", "테스트케이스"),
      readOnly: true,
    },
    { value: parentFolderName || "" },
    { value: testCase.name || "" },
    { value: testCase.description || "" },
    { value: testCase.preCondition || "", readOnly: isFolder },
    { value: testCase.postCondition || "", readOnly: isFolder },
    { value: testCase.expectedResults || "", readOnly: isFolder },
    {
      value: isFolder ? "" : testCase.priority || "MEDIUM",
      readOnly: isFolder,
    },
    {
      value: isFolder ? "" : testCase.executionType || "Manual",
      readOnly: isFolder,
    },
    { value: testCase.testTechnique || "", readOnly: isFolder },
    {
      value: Array.isArray(testCase.tags)
        ? testCase.tags.join(", ")
        : testCase.tags || "",
      readOnly: isFolder,
    },
  ];

  for (let i = 0; i < safeMaxSteps; i++) {
    if (isFolder) {
      row.push({ value: "", readOnly: true });
      row.push({ value: "", readOnly: true });
    } else {
      const step = testCase.steps?.[i];
      row.push({ value: step?.description || "" });
      row.push({ value: step?.expectedResult || "" });
    }
  }
  return row;
};

/**
 * 테스트케이스 트리 데이터를 스프레드시트 행 배열로 변환한다.
 * 데이터가 없으면 빈 행 10개를 반환한다.
 *
 * @param {object} params
 * @param {Array} params.data 표시할(필터된) 테스트케이스/폴더 목록
 * @param {Array} params.allData 상위폴더명 조회용 전체 데이터셋
 * @param {number} params.maxSteps 스텝 컬럼 수
 * @param {Function} params.t i18n 함수
 * @returns {Array} 스프레드시트 행 배열
 */
export const buildSpreadsheetRows = ({ data, allData = [], maxSteps, t }) => {
  const safeMaxSteps = clampMaxSteps(maxSteps);

  if (!data || data.length === 0) {
    const emptyRow = buildEmptyRow(safeMaxSteps);
    return Array.from({ length: 10 }, () => [...emptyRow]);
  }

  const allKnownIds = new Set(allData.map((tc) => tc.id));
  const flattenedData = flattenTreeInOrder(data, { allKnownIds, t });

  return flattenedData.map((testCase) => {
    let parentFolderName = "";
    if (testCase.parentId) {
      const parentFolder = allData.find(
        (item) => item.id === testCase.parentId,
      );
      parentFolderName = parentFolder?.name || "";
    }
    return buildTestCaseRow(testCase, parentFolderName, safeMaxSteps, t);
  });
};

// 행이 내용이 있는(비어있지 않은) 행인지 — 셀 중 trim 후 비지 않은 문자열이 하나라도 있으면 true
const isNonEmptyRow = (row) =>
  Array.isArray(row) &&
  row.some((cell) => typeof cell?.value === "string" && cell.value.trim());

/**
 * 스프레드시트 행 배열을 저장용 테스트케이스/폴더 엔티티 배열로 변환한다.
 * (buildSpreadsheetRows 의 역변환) 신규 폴더 간 부모 참조는 호출 측의 레이어드
 * 저장에서 해결하므로 여기서는 기존 data 기준으로만 parentId 를 해소하고
 * parentFolderName 을 함께 실어 보낸다.
 *
 * @param {Array} rows 스프레드시트 행
 * @param {object} params
 * @param {number} params.maxSteps 스텝 컬럼 수
 * @param {Array} params.data 부모 폴더 ID 해소용 기존 데이터
 * @param {string} params.projectId 프로젝트 ID
 * @param {Function} params.t i18n 함수 (폴더 타입 판정)
 * @param {number} [params.now] temp id 생성용 타임스탬프(테스트 주입용)
 * @returns {Array} 엔티티 배열
 */
export const convertRowsToEntities = (
  rows,
  { maxSteps, data = [], projectId, t, now = Date.now() },
) => {
  const safeMaxSteps = clampMaxSteps(maxSteps);
  return (rows || []).filter(isNonEmptyRow).map((row, index) => {
    const isFolder = isFolderRow(row, t);
    const name = extractFolderName(row);
    const parentFolderName = extractParentFolder(row);

    const steps = [];
    if (!isFolder) {
      for (let i = 0; i < safeMaxSteps; i++) {
        const stepDescIndex = 15 + i * 2;
        const stepExpectedIndex = 15 + i * 2 + 1;
        if (stepDescIndex < row.length && stepExpectedIndex < row.length) {
          const stepDesc = row[stepDescIndex]?.value || "";
          const stepExpected = row[stepExpectedIndex]?.value || "";
          if (stepDesc.trim()) {
            steps.push({
              stepNumber: i + 1,
              description: stepDesc,
              expectedResult: stepExpected,
            });
          }
        }
      }
    }

    const parentId = parentFolderName
      ? findFolderIdByName(parentFolderName, data || [])
      : null;

    return {
      id:
        row[0]?.testCaseId ||
        (String(row[0]?.value || "").startsWith("temp-")
          ? row[0]?.value
          : `temp-${now}-${index}`),
      name,
      description: row[7]?.value || "",
      preCondition: isFolder ? "" : row[8]?.value || "",
      postCondition: isFolder ? "" : row[9]?.value || "",
      expectedResults: isFolder ? "" : row[10]?.value || "",
      priority: isFolder ? "" : row[11]?.value || "MEDIUM",
      executionType: isFolder ? "" : row[12]?.value || "Manual",
      testTechnique: isFolder ? "" : row[13]?.value || "",
      tags: isFolder
        ? []
        : row[14]?.value
          ? String(row[14].value)
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
      steps,
      type: isFolder ? "folder" : "testcase",
      displayOrder:
        row[3] && row[3].value !== "" && row[3].value !== null
          ? Number(row[3].value)
          : null,
      projectId,
      parentId,
      parentFolderName,
    };
  });
};
