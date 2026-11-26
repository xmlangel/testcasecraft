// src/components/TestCase/InputModeSwitch.jsx
//
// 테스트케이스 화면의 「개별 폼 | 스프레드시트」 전환.
// ICT-514(리뷰 P1-9): 스프레드시트로 바꾼 뒤 그 버튼의 툴팁
// 「스프레드시트로 일괄 입력」이 마우스를 올리지 않아도 「3개 스텝」 칩을 덮은 채 남았다.
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

const TOOLTIP_PROPS = {
  placement: "top",
  enterDelay: 400,
  enterNextDelay: 400,
  disableFocusListener: true,
  disableTouchListener: true,
};

const InputModeSwitch = ({ mode, onChange, t, compact = false }) => {
  const tooltipFor = (value, text) => (mode === value ? "" : text);

  return (
    <ToggleButtonGroup
      value={mode}
      exclusive
      onChange={(_, newMode) => {
        if (newMode !== null) onChange(newMode);
      }}
      aria-label={t("testcase.inputMode.title", "입력 모드 선택")}
      size="small"
      sx={{
        "& .MuiToggleButton-root": {
          px: compact ? 0.75 : 1.5,
          fontWeight: 500,
          borderColor: "divider",
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
          t("testcase.inputMode.spreadsheet.tooltip", "스프레드시트로 일괄 입력"),
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
          {!compact && t("testcase.inputMode.spreadsheet.title", "스프레드시트")}
        </ToggleButton>
      </Tooltip>
    </ToggleButtonGroup>
  );
};

InputModeSwitch.propTypes = {
  mode: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  compact: PropTypes.bool,
};

export default InputModeSwitch;
