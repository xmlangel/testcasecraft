import React from "react";
import PropTypes from "prop-types";
import { Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import {
  AddCircle as AddStepIcon,
  RemoveCircle as RemoveStepIcon,
  Settings as SettingsIcon,
  Download as DownloadIcon,
  GetApp as GetAppIcon,
} from "@mui/icons-material";

/** 스텝 수 빠른 증감 + 직접 설정 메뉴 */
export const StepMenu = ({
  anchorEl,
  onClose,
  maxSteps,
  onQuickStepChange,
  onOpenSettings,
  t,
}) => (
  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={onClose}
    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    transformOrigin={{ vertical: "top", horizontal: "left" }}
  >
    <MenuItem onClick={() => onQuickStepChange(1)} disabled={maxSteps >= 10}>
      <ListItemIcon>
        <AddStepIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>
        {t("testcase.spreadsheet.stepMenu.addStep", "스텝 추가 ({count}개)", {
          count: maxSteps + 1,
        })}
      </ListItemText>
    </MenuItem>
    <MenuItem onClick={() => onQuickStepChange(-1)} disabled={maxSteps <= 1}>
      <ListItemIcon>
        <RemoveStepIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>
        {t(
          "testcase.spreadsheet.stepMenu.removeStep",
          "스텝 제거 ({count}개)",
          {
            count: maxSteps - 1,
          },
        )}
      </ListItemText>
    </MenuItem>
    <MenuItem onClick={onOpenSettings}>
      <ListItemIcon>
        <SettingsIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText>
        {t("testcase.spreadsheet.stepMenu.settings", "스텝 수 직접 설정...")}
      </ListItemText>
    </MenuItem>
  </Menu>
);

StepMenu.propTypes = {
  anchorEl: PropTypes.any,
  onClose: PropTypes.func,
  maxSteps: PropTypes.number,
  onQuickStepChange: PropTypes.func,
  onOpenSettings: PropTypes.func,
  t: PropTypes.func.isRequired,
};

/** CSV/Excel/PDF 내보내기 메뉴 */
export const ExportMenu = ({
  anchorEl,
  onClose,
  onExportCsv,
  onExportExcel,
  onExportPdf,
  t,
}) => (
  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={onClose}
    disableEnforceFocus // 접근성 경고 방지
    disableRestoreFocus // 접근성 경고 방지
    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    transformOrigin={{ vertical: "top", horizontal: "left" }}
  >
    <MenuItem onClick={onExportCsv}>
      <ListItemIcon>
        <DownloadIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText
        primary={t("testcase.spreadsheet.export.csv.title", "CSV로 내보내기")}
        secondary={t(
          "testcase.spreadsheet.export.csv.description",
          "스프레드시트 호환 형식",
        )}
      />
    </MenuItem>
    <MenuItem onClick={onExportExcel}>
      <ListItemIcon>
        <GetAppIcon fontSize="small" />
      </ListItemIcon>
      <ListItemText
        primary={t(
          "testcase.spreadsheet.export.excel.title",
          "Excel로 내보내기",
        )}
        secondary={t(
          "testcase.spreadsheet.export.excel.description",
          "Microsoft Excel 형식 (.xlsx)",
        )}
      />
    </MenuItem>
    <MenuItem onClick={onExportPdf}>
      <ListItemIcon>
        <DownloadIcon fontSize="small" color="primary" />
      </ListItemIcon>
      <ListItemText
        primary={t(
          "testcase.spreadsheet.export.pdf.title",
          "PDF 내보내기(상세)",
        )}
        secondary={t(
          "testcase.spreadsheet.export.pdf.description",
          "테스트결과 입력 화면 형식 (.pdf)",
        )}
      />
    </MenuItem>
  </Menu>
);

ExportMenu.propTypes = {
  anchorEl: PropTypes.any,
  onClose: PropTypes.func,
  onExportCsv: PropTypes.func,
  onExportExcel: PropTypes.func,
  onExportPdf: PropTypes.func,
  t: PropTypes.func.isRequired,
};
