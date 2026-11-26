// 스프레드시트 셀 보기 (ICT-514, 리뷰 P1-9).
//
// 스텝 열이 좁아 긴 셀 하나 때문에 행 높이가 화면을 넘었다. 셀 내용은 기본 3줄까지만
// 보이고(줄임은 TestCaseSpreadsheet 의 CSS 가 맡는다), 잘린 셀은 마우스를 올리면 전체
// 내용이 title 로 보인다. 셀을 편집하면 편집기가 전체 값을 받는다. 도구 모음의
// 「긴 셀 모두 펼치기」로 줄임을 끌 수 있다.

import React from "react";
import PropTypes from "prop-types";

/** 이 길이를 넘거나 줄바꿈이 있으면 잘릴 수 있는 셀로 보고 전체 내용을 title 로 단다 */
export const LONG_CELL_CHARS = 40;

const toText = (cell, evaluatedCell) => {
  const base = evaluatedCell?.value ?? cell?.value;
  if (base === null || base === undefined) return "";
  if (typeof base === "object") return base.toString();
  return String(base);
};

const ClampedDataViewer = ({ cell, evaluatedCell }) => {
  const text = toText(cell, evaluatedCell);
  const isLong = text.length > LONG_CELL_CHARS || text.includes("\n");
  return (
    <span
      className="Spreadsheet__data-viewer Spreadsheet__data-viewer--clampable"
      title={isLong ? text : undefined}
    >
      {text}
    </span>
  );
};

ClampedDataViewer.propTypes = {
  cell: PropTypes.object,
  evaluatedCell: PropTypes.object,
};

export default ClampedDataViewer;
