// src/components/RAG/DocumentListHeader.jsx
import React from "react";
import PropTypes from "prop-types";
import { Box, Typography, Button } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import RefreshIcon from "@mui/icons-material/Refresh";

/**
 * 문서 목록 헤더 컴포넌트
 * 제목, 새로고침 버튼, 업로드 버튼을 표시합니다.
 */
function DocumentListHeader({
  title,
  onRefresh,
  onUpload,
  canEdit = false,
  isRefreshing = false,
  isLoading = false,
  t,
}) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 1.5,
        mb: 2,
      }}
    >
      <Typography
        variant="h6"
        className="gradient-heading text-grotesque"
        sx={{ fontWeight: "bold" }}
      >
        {title}
      </Typography>
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          variant="outlined"
          color="secondary"
          startIcon={<RefreshIcon />}
          onClick={onRefresh}
          disabled={isRefreshing || isLoading}
        >
          {t("rag.document.list.refreshButton", "새로고침")}
        </Button>
        {canEdit && (
          <Button
            variant="contained"
            startIcon={<CloudUploadIcon />}
            onClick={onUpload}
            data-testid="rag-document-upload-button"
          >
            {t("rag.document.list.uploadButton", "문서 업로드")}
          </Button>
        )}
      </Box>
    </Box>
  );
}

DocumentListHeader.propTypes = {
  title: PropTypes.string.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onUpload: PropTypes.func.isRequired,
  /** 문서를 올릴 수 있는 역할인지 — 백엔드 canEditDocumentProject 와 같은 기준 */
  canEdit: PropTypes.bool,
  isRefreshing: PropTypes.bool,
  isLoading: PropTypes.bool,
  t: PropTypes.func.isRequired,
};

export default DocumentListHeader;
