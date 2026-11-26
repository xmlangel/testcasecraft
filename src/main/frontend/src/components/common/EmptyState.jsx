// src/components/common/EmptyState.jsx
//
// 화면마다 달랐던 빈 상태를 한 모양으로 맞춘다 (ICT-514, 리뷰 P1-8).
// 아이콘 · 제목 한 줄 · 설명 · (선택) 주요 동작 버튼을 영역 가운데에 둔다.

import React from "react";
import PropTypes from "prop-types";
import { Box, Button, Typography } from "@mui/material";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

const EmptyState = ({
  icon: Icon = InboxOutlinedIcon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
  dense = false,
  fill = false,
  sx,
  "data-testid": testId = "empty-state",
}) => (
  <Box
    data-testid={testId}
    role="status"
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      gap: 1,
      px: 3,
      py: dense ? 3 : 6,
      ...(fill ? { flexGrow: 1, height: "100%" } : {}),
      ...sx,
    }}
  >
    <Icon
      aria-hidden="true"
      data-testid={`${testId}-icon`}
      sx={{
        fontSize: dense ? 40 : 56,
        color: "text.secondary",
        opacity: 0.5,
        mb: 0.5,
      }}
    />
    <Typography
      variant={dense ? "subtitle1" : "h6"}
      color="text.secondary"
      data-testid={`${testId}-title`}
    >
      {title}
    </Typography>
    {description && (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 480 }}
        data-testid={`${testId}-description`}
      >
        {description}
      </Typography>
    )}
    {actionLabel && onAction && (
      <Button
        variant="contained"
        size="small"
        startIcon={actionIcon}
        onClick={onAction}
        sx={{ mt: 1.5 }}
        data-testid={`${testId}-action`}
      >
        {actionLabel}
      </Button>
    )}
  </Box>
);

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  actionLabel: PropTypes.node,
  onAction: PropTypes.func,
  actionIcon: PropTypes.node,
  dense: PropTypes.bool,
  fill: PropTypes.bool,
  sx: PropTypes.object,
  "data-testid": PropTypes.string,
};

export default EmptyState;
