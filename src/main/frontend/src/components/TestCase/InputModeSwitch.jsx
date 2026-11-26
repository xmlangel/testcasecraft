// src/components/TestCase/InputModeSwitch.jsx
//
// 테스트케이스 입력 모드 전환(개별 폼 / 스프레드시트). TestCaseHybridForm 에 있던 마크업을 옮겼다.
// (같은 폴더의 InputModeToggle.jsx 는 설명 카드까지 딸린 이전 컴포넌트로, 지금은 쓰지 않는다.)
// ICT-510: 칸이 좁으면 "개별 폼" 라벨이 세 줄로 꺾였다. 라벨은 한 줄로 두고
// 토글 묶음이 줄어들지 않게 한다.

import React from "react";
import PropTypes from "prop-types";
import { ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import {
  ViewList as FormIcon,
  TableChart as SpreadsheetIcon,
} from "@mui/icons-material";
import { useI18n } from "../../context/I18nContext.jsx";

function InputModeSwitch({ value, onChange, compact = false }) {
  const { t } = useI18n();

  return (
    <ToggleButtonGroup
      value={value}
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
        title={t("testcase.inputMode.form.tooltip", "개별 폼으로 상세 입력")}
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
        title={t(
          "testcase.inputMode.spreadsheet.tooltip",
          "스프레드시트로 일괄 입력",
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
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  compact: PropTypes.bool,
};

export default InputModeSwitch;
