// src/components/TestCase/FieldVisibilityMenu.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  IconButton,
  Tooltip,
  Popover,
  Box,
  FormControlLabel,
  Checkbox,
  Typography,
  Divider,
  Button,
  Stack,
} from "@mui/material";
import { ViewColumn as ViewColumnIcon } from "@mui/icons-material";
import { FIELD_DEFINITIONS } from "./useFieldVisibility.jsx";

/**
 * 테스트케이스 폼의 필드 표시 토글 메뉴.
 * - 아이콘 버튼 클릭 → Popover 안에 체크박스 목록
 * - 모두 켜기/모두 끄기/기본값 복원 단축 액션
 */
const FieldVisibilityMenu = ({ visibility, toggle, setAll, reset, t }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const shownCount = Object.values(visibility).filter(Boolean).length;
  const totalCount = FIELD_DEFINITIONS.length;

  return (
    <>
      <Tooltip
        title={t("testcase.form.fieldVisibility", "표시할 필드 선택")}
        arrow
        placement="top"
      >
        <IconButton size="small" onClick={handleOpen}>
          <ViewColumnIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ p: 2, minWidth: 260 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t("testcase.form.fieldVisibility", "표시할 필드 선택")}{" "}
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
            >
              ({shownCount}/{totalCount})
            </Typography>
          </Typography>
          <Divider sx={{ mb: 1 }} />
          {FIELD_DEFINITIONS.map((f) => (
            <FormControlLabel
              key={f.key}
              control={
                <Checkbox
                  size="small"
                  checked={Boolean(visibility[f.key])}
                  onChange={() => toggle(f.key)}
                />
              }
              label={t(f.labelKey, f.labelDefault)}
              sx={{ display: "flex", mr: 0, py: 0.25 }}
            />
          ))}
          <Divider sx={{ my: 1 }} />
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button size="small" onClick={() => setAll(true)}>
              {t("common.showAll", "모두 표시")}
            </Button>
            <Button size="small" onClick={() => setAll(false)}>
              {t("common.hideAll", "모두 숨김")}
            </Button>
            <Button size="small" onClick={reset}>
              {t("common.reset", "기본값")}
            </Button>
          </Stack>
        </Box>
      </Popover>
    </>
  );
};

FieldVisibilityMenu.propTypes = {
  visibility: PropTypes.object.isRequired,
  toggle: PropTypes.func.isRequired,
  setAll: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default FieldVisibilityMenu;
