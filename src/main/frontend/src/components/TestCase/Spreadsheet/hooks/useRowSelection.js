// src/components/TestCase/Spreadsheet/hooks/useRowSelection.js
//
// 스프레드시트 행/범위 선택 상태 관리 훅 (ICT-414). state + ref 이중 관리로
// 불필요한 재렌더링을 막는다. (TestCaseSpreadsheet 에서 추출 — 동작 보존)

import { useState, useRef, useCallback } from "react";
import { debugLog } from "../../../../utils/logger.js";

export default function useRowSelection() {
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const selectedRowIndexRef = useRef(null); // ref로도 관리하여 불필요한 재렌더링 방지
  const [selectedRange, setSelectedRange] = useState(null);
  const selectedRangeRef = useRef(null);

  // 셀 선택 핸들러 - 행 인덱스 추적 (ICT-414)
  const handleCellSelect = useCallback((selected) => {
    if (!selected || !selected.range) {
      return;
    }

    const range = selected.range;

    // Deep comparison to prevent infinite loops
    const prevRange = selectedRangeRef.current;
    if (
      prevRange &&
      prevRange.start.row === range.start.row &&
      prevRange.start.column === range.start.column &&
      prevRange.end.row === range.end.row &&
      prevRange.end.column === range.end.column
    ) {
      // 범위가 동일하면 상태 업데이트 및 리프레시 로직 건너뜀
      return;
    }

    // 범위 상태 업데이트
    selectedRangeRef.current = range;
    setSelectedRange(range);

    const rowIndex = range.start.row;

    // ref 값과 비교하여 실제로 변경된 경우에만 state 업데이트 (불필요한 재렌더링 방지)
    if (
      typeof rowIndex === "number" &&
      rowIndex !== selectedRowIndexRef.current
    ) {
      selectedRowIndexRef.current = rowIndex;
      setSelectedRowIndex(rowIndex);
      debugLog("Spreadsheet", `행 ${rowIndex + 1} 선택됨 (index: ${rowIndex})`);
    }
  }, []); // 의존성 배열 비우기 - 콜백 재생성 방지

  return {
    selectedRowIndex,
    setSelectedRowIndex,
    selectedRowIndexRef,
    selectedRange,
    setSelectedRange,
    selectedRangeRef,
    handleCellSelect,
  };
}
