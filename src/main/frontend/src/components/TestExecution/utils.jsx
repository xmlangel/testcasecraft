import React from "react";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Block as BlockIcon,
  DoubleArrow as DoubleArrowIcon,
  HourglassEmpty as HourglassEmptyIcon,
} from "@mui/icons-material";
import { TestResult } from "../../models/testExecution.jsx";
import { RESULT_COLORS } from "../../constants/statusColors";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { isServerUTC } from "../../utils/dateUtils";

export function wrapName(name, max = 100) {
  if (!name) return "";
  return name.replace(new RegExp(`(.{${max}})`, "g"), "$1\n");
}

export function getResultIcon(result) {
  switch (result) {
    case TestResult.PASS:
      return (
        <CheckCircleIcon
          sx={{ color: RESULT_COLORS.PASS }}
          titleAccess="PASS"
        />
      );
    case TestResult.FAIL:
      return (
        <CancelIcon sx={{ color: RESULT_COLORS.FAIL }} titleAccess="FAIL" />
      );
    case TestResult.BLOCKED:
      return (
        <BlockIcon
          sx={{ color: RESULT_COLORS.BLOCKED }}
          titleAccess="BLOCKED"
        />
      );
    case TestResult.SKIPPED:
      return (
        <DoubleArrowIcon
          sx={{ color: RESULT_COLORS.SKIPPED }}
          titleAccess="SKIPPED"
        />
      );
    case TestResult.NOT_RUN:
    default:
      return (
        <HourglassEmptyIcon
          sx={{ color: RESULT_COLORS.NOTRUN }}
          titleAccess="NOTRUN"
        />
      );
  }
}

export function getDisplayValue(value, type) {
  if (typeof value === "string" && value.trim() !== "") return value;
  return <span style={{ color: "text.disabled" }}>-</span>;
}

export const priorityColor = {
  High: "error",
  Medium: "warning",
  Low: "info",
};

// 전체 날짜/시간 형식 (툴팁용)
export function formatDateTimeFull(dateInput) {
  const date = parseDateTime(dateInput);
  if (!date || isNaN(date)) return "";

  const formatted = format(date, "yyyy-MM-dd HH:mm:ss", { locale: ko });
  return isServerUTC() ? `${formatted} (UTC)` : formatted;
}

// 짧은 날짜 형식 (MM-DD)
export function formatDateTimeShort(dateInput) {
  const date = parseDateTime(dateInput);
  if (!date || isNaN(date)) return getDisplayValue(undefined, "executedAt");

  const formatted = format(date, "MM-dd", { locale: ko });
  return isServerUTC() ? `${formatted} (UTC)` : formatted;
}

export function getLatestResults(results) {
  // testCaseId별로 executedAt이 가장 최근인 레코드를 그대로 사용한다.
  // 백엔드 통계(TestResultRepository: MAX(executed_at) 기준 latest_results)와
  // 동일한 의미라 프론트/백엔드 집계가 일치한다. 명시적으로 입력한 NOT_RUN도
  // 그대로 표시된다. (조회만으로 생기던 빈 NOT_RUN은 저장 단계에서 차단됨)
  const grouped = new Map();
  results?.forEach((r) => {
    const key = r.testCaseId;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(r);
  });

  const toTime = (r) => {
    const d = parseDateTime(r?.executedAt);
    return d ? d.getTime() : 0;
  };

  const latest = [];
  grouped.forEach((records) => {
    const sorted = [...records].sort((a, b) => toTime(b) - toTime(a));
    latest.push(sorted[0]);
  });
  return latest;
}

// 배열 형태의 날짜를 Date 객체로 변환하는 헬퍼 함수
export function parseDateTime(dateInput) {
  if (!dateInput) return null;

  if (Array.isArray(dateInput)) {
    const [year, month, day, hour, minute, second] = dateInput;
    return new Date(year, month - 1, day, hour, minute, second);
  } else {
    return new Date(dateInput);
  }
}

// ICT-427: 결과 태그 필터 매칭.
// 선택한 태그 중 하나라도 결과 태그에 걸리면 통과한다(필드 내 OR). 비교는 대소문자를 무시한
// 부분 일치라, 직접 입력(freeSolo) 중에도 목록이 좁혀진다.
// 서버 필터(TestResultReportService)는 정확 일치를 쓴다 — API 계약이라 예측 가능한 편이 낫고,
// 화면은 입력 중 반응이 중요해서 기준이 다르다. 같은 태그를 목록에서 골랐다면 결과는 같다.
/**
 * @param {string[]|undefined} resultTags 결과에 붙은 태그
 * @param {string[]|string|undefined} selectedTags 필터에서 선택·입력한 태그
 * @returns {boolean} 통과 여부 (선택 태그가 없으면 항상 true)
 */
export function matchesAnyTag(resultTags, selectedTags) {
  const terms = (Array.isArray(selectedTags) ? selectedTags : [selectedTags])
    .map((t) =>
      String(t || "")
        .trim()
        .toLowerCase(),
    )
    .filter(Boolean);
  if (!terms.length) return true;

  const tags = (Array.isArray(resultTags) ? resultTags : [])
    .map((t) =>
      String(t || "")
        .trim()
        .toLowerCase(),
    )
    .filter(Boolean);
  if (!tags.length) return false;

  return tags.some((tag) => terms.some((term) => tag.includes(term)));
}

// ICT-427: 일괄 결과 입력 요청 본문을 만든다.
// 공통 태그를 비워 두면 tags 를 아예 싣지 않는다 — 서버는 태그 미지정을 "케이스별 이전 태그 유지"로
// 해석하고, 빈 배열은 "태그 삭제"로 해석한다. 이 구분이 없으면 일괄로 결과만 갱신할 때 케이스에
// 달아 둔 수정 필요 표시가 매번 지워진다.
/**
 * @param {{testCaseIds: string[], result: string, notes?: string, tags?: string[], jiraIssueKey?: string}} input
 * @returns {object} 일괄 저장 API 요청 본문
 */
export function buildBulkResultPayload({
  testCaseIds,
  result,
  notes,
  tags,
  jiraIssueKey,
}) {
  const payload = { testCaseIds, result, notes, jiraIssueKey };
  if (Array.isArray(tags) && tags.length > 0) {
    payload.tags = tags;
  }
  return payload;
}

// 필터가 적용된 이전/다음 네비게이션 ID 목록을 실행(executionId)별로 보존하는 sessionStorage 키 접두사.
// 필터 매칭 로직은 TestExecutionForm 한 곳에만 두고(단일 진실 출처), 별도 라우트인
// 전체화면 결과 뷰(TestCaseResultPage)는 그 결과 목록을 읽어 동일 순서로 이동한다.
export const NAV_IDS_STORAGE_PREFIX = "testExecutionForm.navIds.";

// 필터된 테스트케이스 ID 목록을 실행별로 저장한다.
export const saveFilteredNavIds = (executionId, ids) => {
  if (!executionId || executionId === "new") return;
  try {
    sessionStorage.setItem(
      `${NAV_IDS_STORAGE_PREFIX}${executionId}`,
      JSON.stringify(Array.isArray(ids) ? ids : []),
    );
  } catch {
    // sessionStorage 미지원/차단 환경에서는 무시 (전체화면 뷰가 전체 목록으로 폴백)
  }
};

// 필터 네비게이션 ID 목록을 제거한다 (필터 미적용 상태로 전환 시 stale 목록 방지).
export const clearFilteredNavIds = (executionId) => {
  if (!executionId || executionId === "new") return;
  try {
    sessionStorage.removeItem(`${NAV_IDS_STORAGE_PREFIX}${executionId}`);
  } catch {
    // sessionStorage 미지원/차단 환경에서는 무시
  }
};

// 저장된 필터 네비게이션 ID 목록을 읽는다. 없거나 깨졌으면 null.
export const readFilteredNavIds = (executionId) => {
  if (!executionId || executionId === "new") return null;
  try {
    const raw = sessionStorage.getItem(
      `${NAV_IDS_STORAGE_PREFIX}${executionId}`,
    );
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

// 결과 입력 리스트의 폴더 접힘 상태를 실행(executionId)별로 보존하는 sessionStorage 키 접두사.
// 필터·네비게이션 목록과 같은 규약을 쓴다(prefix + executionId, 저장 실패는 무시).
export const COLLAPSED_FOLDERS_STORAGE_PREFIX =
  "testExecutionForm.collapsedFolders.";

// 접힌 폴더 ID 목록을 실행별로 저장한다. 비어 있으면 키를 제거해 stale 상태를 남기지 않는다.
export const saveCollapsedFolders = (executionId, folderIds) => {
  if (!executionId || executionId === "new") return;
  const key = `${COLLAPSED_FOLDERS_STORAGE_PREFIX}${executionId}`;
  const ids = folderIds instanceof Set ? [...folderIds] : folderIds || [];
  try {
    if (ids.length === 0) {
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, JSON.stringify(ids));
    }
  } catch {
    // sessionStorage 미지원/차단 환경에서는 무시(접힘 상태 미보존)
  }
};

// 저장된 접힘 폴더 ID 목록을 Set으로 읽는다. 없거나 깨졌으면 빈 Set(=전체 펼침).
export const readCollapsedFolders = (executionId) => {
  if (!executionId || executionId === "new") return new Set();
  try {
    const raw = sessionStorage.getItem(
      `${COLLAPSED_FOLDERS_STORAGE_PREFIX}${executionId}`,
    );
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
};

/**
 * 접힌 폴더의 하위 노드를 걷어낸 표시용 배열을 만든다.
 *
 * 접힌 폴더 자신은 남기고 그 아래 모든 자손(폴더·케이스)을 제외한다. 판정은 부모의 판정
 * 결과를 물려받는 방식이라 같은 경로를 두 번 타지 않는다(플래튼 배열은 부모가 자식보다 앞).
 *
 * 인피니티 스크롤의 slice보다 **먼저** 적용해야 한다. 뒤에 적용하면 접힌 폴더의 자식이 표시
 * 개수 예산을 먹어 화면에 몇 줄만 남는다.
 *
 * @param {Array<{id: string, parentId?: string}>} nodes 플래튼 노드 배열(부모가 자식보다 앞)
 * @param {Set<string>|Array<string>} collapsedIds 접힌 폴더 ID 집합
 * @returns {Array} 접힘이 반영된 노드 배열
 */
export const filterCollapsedNodes = (nodes, collapsedIds) => {
  const list = nodes || [];
  const collapsed =
    collapsedIds instanceof Set ? collapsedIds : new Set(collapsedIds || []);
  if (collapsed.size === 0) return list;

  const present = new Set();
  list.forEach((node) => {
    if (node) present.add(node.id);
  });

  // id → 숨김 여부. 부모가 앞에 오는 순서라 부모 판정이 이미 채워져 있다.
  const hidden = new Map();

  return list.filter((node) => {
    if (!node) return false;

    const parentId = node.parentId;
    let parentHidden = false;
    if (parentId && present.has(parentId)) {
      parentHidden = hidden.get(parentId) === true || collapsed.has(parentId);
    }

    hidden.set(node.id, parentHidden);
    return !parentHidden;
  });
};

/**
 * 플래튼 배열에서 어떤 노드의 상위 폴더 ID를 모두 모은다(자기 자신 제외).
 *
 * 접힌 폴더 안의 행으로 이동해야 할 때(scrollTo 파라미터) 그 경로를 펼치는 데 쓴다.
 *
 * @param {Array<{id: string, parentId?: string}>} nodes 플래튼 노드 배열
 * @param {string} nodeId 대상 노드 ID
 * @returns {Array<string>} 상위 폴더 ID 배열
 */
export const collectAncestorFolderIds = (nodes, nodeId) => {
  const byId = new Map();
  (nodes || []).forEach((node) => {
    if (node) byId.set(node.id, node);
  });

  const ancestors = [];
  const seen = new Set();
  let current = byId.get(nodeId);
  while (current?.parentId && byId.has(current.parentId)) {
    if (seen.has(current.parentId)) break; // 순환 방어
    seen.add(current.parentId);
    ancestors.push(current.parentId);
    current = byId.get(current.parentId);
  }
  return ancestors;
};

/**
 * 폴더별 하위 케이스의 판정 집계.
 *
 * 접힌 폴더는 그 안이 안 보이므로 건수만으로는 진행 상황을 알 수 없다. 폴더 행에 총 건수와
 * 판정별 건수를 함께 붙이는 데 쓴다. 조상 폴더까지 누적하므로 상위 폴더 하나만 접어도 그
 * 아래 전체가 집계된다.
 *
 * 판정 분류는 상단 요약(TestExecutionForm 의 statusCounts)과 같은 규약이다 — PASS·FAIL·
 * BLOCKED 만 세고 나머지(결과 없음·NOTRUN·SKIPPED)는 전부 미실행으로 묶는다. 두 곳이
 * 다르게 세면 같은 폴더의 합이 머리말 숫자와 어긋난다.
 *
 * @param {Array<{id: string, type?: string, parentId?: string}>} nodes 플래튼 노드 배열
 * @param {Map<string, {result?: string}>} resultsMap 케이스 ID → 최신 결과
 * @returns {Map<string, {total: number, PASS: number, FAIL: number, BLOCKED: number, NOTRUN: number}>}
 */
export const computeFolderResultCounts = (nodes, resultsMap) => {
  const list = nodes || [];
  const counts = new Map();
  const parentOf = new Map(list.map((node) => [node?.id, node?.parentId]));

  const bump = (folderId, key) => {
    let stat = counts.get(folderId);
    if (!stat) {
      stat = { total: 0, PASS: 0, FAIL: 0, BLOCKED: 0, NOTRUN: 0 };
      counts.set(folderId, stat);
    }
    stat.total += 1;
    stat[key] += 1;
  };

  list.forEach((node) => {
    if (node?.type !== "testcase") return;

    const result = resultsMap?.get?.(node.id)?.result;
    const key =
      result === TestResult.PASS ||
      result === TestResult.FAIL ||
      result === TestResult.BLOCKED
        ? result
        : "NOTRUN";

    let parentId = node.parentId;
    const seen = new Set();
    while (parentId && parentOf.has(parentId) && !seen.has(parentId)) {
      seen.add(parentId); // 순환 방어
      bump(parentId, key);
      parentId = parentOf.get(parentId);
    }
  });

  return counts;
};

// 폴더 집계 칩의 표시 순서·색·라벨 키. 총 건수 다음에 이 순서로 붙는다.
export const FOLDER_RESULT_KEYS = [
  {
    key: "PASS",
    color: RESULT_COLORS.PASS,
    labelKey: "testResult.status.pass",
    labelFallback: "성공",
  },
  {
    key: "FAIL",
    color: RESULT_COLORS.FAIL,
    labelKey: "testResult.status.fail",
    labelFallback: "실패",
  },
  {
    key: "BLOCKED",
    color: RESULT_COLORS.BLOCKED,
    labelKey: "testResult.status.blocked",
    labelFallback: "차단됨",
  },
  {
    key: "NOTRUN",
    color: RESULT_COLORS.NOTRUN,
    labelKey: "testResult.status.notRun",
    labelFallback: "미실행",
  },
];

// 플래튼 배열의 폴더 ID 전체 (전체 접기용)
export const collectFolderIds = (nodes) =>
  (nodes || [])
    .filter((node) => node && node.type === "folder")
    .map((node) => node.id);

export const HEADER_HEIGHT = 40;

// Grid 템플릿 정의 - 모든 행에서 동일한 컬럼 너비 보장
// 폴더 열은 접힘 배지(총계 + 판정 4종)와 폴더명이 한 줄에 같이 들어가야 해 최소 폭을 넓게 잡는다.
export const gridTemplateColumns =
  "40px 110px minmax(260px, 2fr) minmax(200px, 3fr) 80px minmax(110px, auto) minmax(90px, auto) minmax(150px, 2fr) 100px 90px 90px 50px 50px";

// 개별 컬럼 스타일 (Grid에서는 display와 align만 필요)
export const responsiveColumnSx = [
  { display: "flex", alignItems: "center", justifyContent: "center" }, // 0: checkbox
  {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    pl: 1,
  }, // 1: ID
  {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    pl: 1,
    overflow: "hidden",
  }, // 2: folder
  {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    pl: 1,
    overflow: "hidden",
  }, // 3: testcase
  { display: "flex", alignItems: "center", justifyContent: "center" }, // 4: result
  { display: "flex", alignItems: "center", justifyContent: "center" }, // 5: executedAt
  { display: "flex", alignItems: "center", justifyContent: "center" }, // 6: executedBy
  {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  }, // 7: notes
  {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 0.5,
  }, // 8: tags
  { display: "flex", alignItems: "center", justifyContent: "center" }, // 9: jiraIssueKey
  { display: "flex", alignItems: "center", justifyContent: "center" }, // 10: input
  { display: "flex", alignItems: "center", justifyContent: "center" }, // 11: prevResults
  { display: "flex", alignItems: "center", justifyContent: "center" }, // 12: attachments
];
