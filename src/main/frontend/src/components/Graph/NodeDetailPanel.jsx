// src/components/Graph/NodeDetailPanel.jsx
// 그래프에서 선택한 노드의 속성을 보여주는 우측 패널.

import React from "react";
import { Box, Chip, Divider, Typography } from "@mui/material";
import { useI18n } from "../../context/I18nContext";

const NodeDetailPanel = ({ node }) => {
  const { t } = useI18n();

  if (!node) {
    return (
      <Box sx={{ p: 2, color: "text.secondary" }}>
        <Typography variant="body2">
          {t("graph.detail.empty", "노드를 클릭하면 상세 정보가 표시됩니다.")}
        </Typography>
      </Box>
    );
  }

  const properties = node.properties || {};
  return (
    <Box sx={{ p: 2 }}>
      <Chip size="small" label={node.label} color="primary" sx={{ mb: 1 }} />
      <Typography variant="subtitle2" sx={{ mb: 1, wordBreak: "break-all" }}>
        {node.caption}
      </Typography>
      <Divider sx={{ mb: 1 }} />
      {Object.entries(properties).map(([key, value]) => (
        <Box key={key} sx={{ mb: 0.75 }}>
          <Typography variant="caption" color="text.secondary">
            {key}
          </Typography>
          <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
            {String(value)}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export default NodeDetailPanel;
