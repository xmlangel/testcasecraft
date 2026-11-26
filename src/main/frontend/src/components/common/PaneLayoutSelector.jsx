// src/components/common/PaneLayoutSelector.jsx
import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import { useTranslation } from "../../context/I18nContext";

/**
 * ICT-492·497 배치 선택: 자동·1단·2단.
 * 2단(나란히)의 저장값은 이전 3단 선택이 이어지도록 "3" 을 그대로 쓴다.
 * 고른 배치가 폭에 맞지 않아 낮은 단으로 내려가면 옆에 실제 배치를 표시한다.
 */
const PaneLayoutSelector = ({ mode, onChange, tier, downgraded = false }) => {
  const { t } = useTranslation();
  const options = [
    { value: "auto", label: t("layout.pane.auto", "자동") },
    { value: "1", label: t("layout.pane.one", "1단") },
    { value: "3", label: t("layout.pane.two", "2단") },
  ];
  const tierLabel = options.find((o) => o.value === String(tier))?.label;

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
      data-testid="pane-layout-selector"
    >
      {downgraded && tierLabel && (
        <Tooltip
          title={t(
            "layout.pane.downgradedTooltip",
            "고른 배치를 쓰기에는 화면 폭이 좁아 한 단계 낮춰 보여 줍니다.",
          )}
        >
          <Chip
            size="small"
            color="warning"
            variant="outlined"
            label={t("layout.pane.downgraded", "폭이 좁아 {tier}로 표시", {
              tier: tierLabel,
            })}
            data-testid="pane-layout-downgraded"
          />
        </Tooltip>
      )}
      <ToggleButtonGroup
        size="small"
        exclusive
        value={mode}
        onChange={(_, next) => {
          if (next !== null) onChange(next);
        }}
        aria-label={t("layout.pane.title", "화면 배치")}
        sx={{
          "& .MuiToggleButton-root": { py: 0.25, px: 1, fontSize: "0.75rem" },
        }}
      >
        {options.map((o) => (
          <ToggleButton
            key={o.value}
            value={o.value}
            data-testid={`pane-layout-${o.value}`}
          >
            {o.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};

PaneLayoutSelector.propTypes = {
  mode: PropTypes.oneOf(["auto", "1", "3"]).isRequired,
  onChange: PropTypes.func.isRequired,
  tier: PropTypes.oneOf([1, 3]),
  downgraded: PropTypes.bool,
};

export default PaneLayoutSelector;
