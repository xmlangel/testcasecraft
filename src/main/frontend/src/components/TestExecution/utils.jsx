import React from 'react';
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Block as BlockIcon,
    DoubleArrow as DoubleArrowIcon,
    HourglassEmpty as HourglassEmptyIcon,
} from "@mui/icons-material";
import { TestResult } from "../../models/testExecution.jsx";
import { RESULT_COLORS } from '../../constants/statusColors';

export function wrapName(name, max = 100) {
    if (!name) return "";
    return name.replace(new RegExp(`(.{${max}})`, "g"), "$1\n");
}

export function getResultIcon(result) {
    switch (result) {
        case TestResult.PASS:
            return <CheckCircleIcon sx={{ color: RESULT_COLORS.PASS }} titleAccess="PASS" />;
        case TestResult.FAIL:
            return <CancelIcon sx={{ color: RESULT_COLORS.FAIL }} titleAccess="FAIL" />;
        case TestResult.BLOCKED:
            return <BlockIcon sx={{ color: RESULT_COLORS.BLOCKED }} titleAccess="BLOCKED" />;
        case TestResult.SKIPPED:
            return <DoubleArrowIcon sx={{ color: RESULT_COLORS.SKIPPED }} titleAccess="SKIPPED" />;
        case TestResult.NOTRUN:
        default:
            return <HourglassEmptyIcon sx={{ color: RESULT_COLORS.NOTRUN }} titleAccess="NOTRUN" />;
    }
}

export function getDisplayValue(value, type) {
    if (typeof value === "string" && value.trim() !== "") return value;
    return <span style={{ color: 'text.disabled' }}>-</span>;
}

export const priorityColor = {
    High: 'error',
    Medium: 'warning',
    Low: 'info',
};

// 전체 날짜/시간 형식 (툴팁용)
export function formatDateTimeFull(dateInput) {
    if (!dateInput) return "";

    let date;

    // Spring Boot LocalDateTime이 배열로 올 경우 처리
    if (Array.isArray(dateInput)) {
        // [year, month, day, hour, minute, second, nanosecond] 형태
        const [year, month, day, hour, minute, second] = dateInput;
        date = new Date(year, month - 1, day, hour, minute, second); // month는 0-based
    } else {
        // 문자열 형태의 날짜
        date = new Date(dateInput);
    }

    if (isNaN(date)) return "";

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const sec = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${sec}`;
}

// 짧은 날짜 형식 (MM-DD)
export function formatDateTimeShort(dateInput) {
    if (!dateInput) return getDisplayValue(undefined, "executedAt");

    let date;

    // Spring Boot LocalDateTime이 배열로 올 경우 처리
    if (Array.isArray(dateInput)) {
        const [year, month, day, hour, minute, second] = dateInput;
        date = new Date(year, month - 1, day, hour, minute, second);
    } else {
        date = new Date(dateInput);
    }

    if (isNaN(date)) return getDisplayValue(undefined, "executedAt");

    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${mm}-${dd}`;
}

export function getLatestResults(results) {
    const map = new Map();
    results?.forEach((r) => {
        const key = r.testCaseId;
        // 백엔드에서 이미 최신순으로 정렬되어 있으므로
        // 같은 testCaseId의 첫 번째 결과만 사용
        if (!map.has(key)) {
            map.set(key, r);
        }
    });
    return Array.from(map.values());
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
export const gridTemplateColumns = "40px 110px minmax(150px, 2fr) minmax(200px, 3fr) 80px minmax(110px, auto) minmax(90px, auto) minmax(150px, 2fr) 100px 90px 90px 50px 50px";

// 개별 컬럼 스타일 (Grid에서는 display와 align만 필요)
export const responsiveColumnSx = [
    { display: "flex", alignItems: "center", justifyContent: "center" }, // 0: checkbox
    { display: "flex", alignItems: "center", justifyContent: "flex-start", pl: 1 }, // 1: ID
    { display: "flex", alignItems: "center", justifyContent: "flex-start", pl: 1, overflow: "hidden" }, // 2: folder
    { display: "flex", alignItems: "center", justifyContent: "flex-start", pl: 1, overflow: "hidden" }, // 3: testcase
    { display: "flex", alignItems: "center", justifyContent: "center" }, // 4: result
    { display: "flex", alignItems: "center", justifyContent: "center" }, // 5: executedAt
    { display: "flex", alignItems: "center", justifyContent: "center" }, // 6: executedBy
    { display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }, // 7: notes
    { display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 0.5 }, // 8: tags
    { display: "flex", alignItems: "center", justifyContent: "center" }, // 9: jiraIssueKey
    { display: "flex", alignItems: "center", justifyContent: "center" }, // 10: input
    { display: "flex", alignItems: "center", justifyContent: "center" }, // 11: prevResults
    { display: "flex", alignItems: "center", justifyContent: "center" }, // 12: attachments
];


