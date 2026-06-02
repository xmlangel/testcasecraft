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
  // testCaseId별로 모든 결과 기록을 그룹화
  const grouped = new Map();
  results?.forEach((r) => {
    const key = r.testCaseId;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(r);
  });

  // "NOT_RUN"과 레거시 "NOTRUN" 표기 모두 미실행으로 간주
  const isRealResult = (result) =>
    result && result !== TestResult.NOT_RUN && result !== "NOTRUN";
  const hasNote = (notes) => typeof notes === "string" && notes.trim() !== "";
  const toTime = (r) => {
    const d = parseDateTime(r?.executedAt);
    return d ? d.getTime() : 0;
  };

  const merged = [];
  grouped.forEach((records) => {
    // 최신순(executedAt 내림차순) 정렬
    const sorted = [...records].sort((a, b) => toTime(b) - toTime(a));
    const latest = sorted[0];
    // 결과가 있는 가장 최근 기록 (NOT_RUN/미입력 기록은 skip)
    const latestWithResult = sorted.find((r) => isRealResult(r.result));
    // 노트가 입력된 가장 최근 기록
    const latestWithNote = sorted.find((r) => hasNote(r.notes));

    // 표시 기준: 결과가 있으면 그 기록을, 없으면 최신 기록을 사용하고
    // 노트는 가장 최근에 입력된 노트를 우선 표시한다.
    const base = latestWithResult || latest;
    merged.push({
      ...base,
      notes: latestWithNote ? latestWithNote.notes : base.notes,
    });
  });
  return merged;
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
