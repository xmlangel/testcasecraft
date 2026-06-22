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

export const HEADER_HEIGHT = 40;

// Grid 템플릿 정의 - 모든 행에서 동일한 컬럼 너비 보장
export const gridTemplateColumns =
  "40px 110px minmax(150px, 2fr) minmax(200px, 3fr) 80px minmax(110px, auto) minmax(90px, auto) minmax(150px, 2fr) 100px 90px 90px 50px 50px";

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
