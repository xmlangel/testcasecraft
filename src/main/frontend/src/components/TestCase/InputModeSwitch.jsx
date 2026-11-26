// src/components/TestCase/InputModeSwitch.jsx
//
// 테스트케이스 입력 모드 전환(개별 폼 / 스프레드시트). TestCaseHybridForm 에 있던 마크업을 옮겼다.
// (같은 폴더의 InputModeToggle.jsx 는 설명 카드까지 딸린 이전 컴포넌트로, 지금은 쓰지 않는다.)
//
// ICT-510: 칸이 좁으면 "개별 폼" 라벨이 세 줄로 꺾였다. 라벨은 한 줄로 두고
// 토글 묶음이 줄어들지 않게 한다.
// ICT-514(리뷰 P1-9): 스프레드시트로 바꾼 뒤 그 버튼의 툴팁 「스프레드시트로 일괄 입력」이
// 마우스를 올리지 않아도 「3개 스텝」 칩을 덮은 채 남았다.
//  - 이미 고른 모드의 버튼에는 툴팁을 두지 않는다(누를 이유가 없는 안내다).
//  - 누른 뒤 남는 포커스로는 열리지 않게 한다(disableFocusListener).
//  - 표 쪽(아래)이 아니라 위로 띄우고, 지나가는 마우스에 바로 뜨지 않게 지연을 둔다.

import React from "react";
import PropTypes from "prop-types";
import { ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import {
  ViewList as FormIcon,
  TableChart as SpreadsheetIcon,
} from "@mui/icons-material";
import { useI18n } from "../../context/I18nContext.jsx";

const TOOLTIP_PROPS = {
  placement: "top",
  enterDelay: 400,
  enterNextDelay: 400,
  disableFocusListener: true,
  disableTouchListener: true,
};

// value(ICT-510 호출부)와 mode(ICT-514 호출부) 둘 다 받는다. t 를 넘기지 않으면 컨텍스트 번역을 쓴다.
function InputModeSwitch({ value, mode, onChange, t: tProp, compact = false }) {
  const { t: tContext } = useI18n();
  const t = tProp || tContext;
  const current = value ?? mode;
  const tooltipFor = (target, text) => (current === target ? "" : text);

  return (
    <ToggleButtonGroup
      value={current}
      exclusive
      onChange={(_, newMode) => {
        if (newMode !== null) onChange(newMode);
      }}
      aria-label={t("testcase.inputMode.title", "입력 모드 선택")}
      size="small"
      data-testid="input-mode-switch"
      sx={{
        flexShrink: 0,
        "& .MuiToggleButton-root": {
          px: compact ? 0.75 : 1.5,
          fontWeight: 500,
          borderColor: "divider",
          whiteSpace: "nowrap",
        },
        "& .MuiToggleButton-root.Mui-selected": {
          bgcolor: "primary.main",
          color: "primary.contrastText",
          fontWeight: 700,
          boxShadow: 1,
          "&:hover": { bgcolor: "primary.dark" },
        },
      }}
    >
      <Tooltip
        {...TOOLTIP_PROPS}
        title={tooltipFor(
          "form",
          t("testcase.inputMode.form.tooltip", "개별 폼으로 상세 입력"),
        )}
      >
        <ToggleButton
          value="form"
          aria-label={t("testcase.inputMode.form.ariaLabel", "폼 모드")}
          data-testid="mode-individual-button"
        >
          <FormIcon fontSize="small" sx={{ mr: compact ? 0 : 0.75 }} />
          {!compact && t("testcase.inputMode.form.title", "개별 폼")}
        </ToggleButton>
      </Tooltip>
      <Tooltip
        {...TOOLTIP_PROPS}
        title={tooltipFor(
          "spreadsheet",
          t(
            "testcase.inputMode.spreadsheet.tooltip",
            "스프레드시트로 일괄 입력",
          ),
        )}
      >
        <ToggleButton
          value="spreadsheet"
          aria-label={t(
            "testcase.inputMode.spreadsheet.ariaLabel",
            "스프레드시트 모드",
          )}
          data-testid="mode-spreadsheet-button"
        >
          <SpreadsheetIcon fontSize="small" sx={{ mr: compact ? 0 : 0.75 }} />
          {!compact &&
            t("testcase.inputMode.spreadsheet.title", "스프레드시트")}
        </ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  );
}

InputModeSwitch.propTypes = {
  value: PropTypes.string,
  mode: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  t: PropTypes.func,
  compact: PropTypes.bool,
};

export default InputModeSwitch;
