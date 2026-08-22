// src/components/RAG/RagStateBanner.jsx
import React from "react";
import PropTypes from "prop-types";
import { Alert, AlertTitle, Box, Chip, Typography } from "@mui/material";
import {
  CheckCircle as OkIcon,
  Block as BlockedIcon,
} from "@mui/icons-material";
import { useI18n } from "../../context/I18nContext.jsx";
import { RAG_STATE, resolveRagState } from "../../utils/ragAvailability.js";

/**
 * AI 기능이 지금 어디까지 되는지 화면 위쪽에 알린다.
 *
 * 설정이 꺼져 있으면 요청이 실패하는데, 그것만으로는 장애인지 관리자가 꺼 둔 것인지
 * 알 수 없었다. 무엇이 되고 무엇이 안 되는지 항목으로 갈라 보여 준다.
 * 전부 되는 상태에서는 아무것도 그리지 않는다.
 */
const RagStateBanner = ({ status }) => {
  const { t } = useI18n();
  const state = resolveRagState(status);

  if (state === RAG_STATE.FULL) return null;

  const disabled = state === RAG_STATE.DISABLED;

  // 되는 것과 안 되는 것을 갈라 적는다. 목록이 곧 안내다.
  const items = disabled
    ? [
        { ok: false, label: t("rag.state.item.chat", "질문·대화") },
        { ok: false, label: t("rag.state.item.search", "문서 검색") },
        { ok: false, label: t("rag.state.item.browse", "문서 목록·내려받기") },
        { ok: false, label: t("rag.state.item.upload", "문서 등록·분석") },
        { ok: false, label: t("rag.state.item.index", "테스트케이스 색인") },
      ]
    : [
        { ok: true, label: t("rag.state.item.chat", "질문·대화") },
        { ok: true, label: t("rag.state.item.search", "문서 검색") },
        { ok: true, label: t("rag.state.item.browse", "문서 목록·내려받기") },
        { ok: false, label: t("rag.state.item.upload", "문서 등록·분석") },
        { ok: false, label: t("rag.state.item.index", "테스트케이스 색인") },
      ];

  return (
    <Alert severity={disabled ? "error" : "warning"} sx={{ mb: 2 }}>
      <AlertTitle>
        {disabled
          ? t("rag.state.disabled.title", "AI 기능이 중지되어 있습니다")
          : t("rag.state.queryOnly.title", "새 자료 등록이 중지되어 있습니다")}
      </AlertTitle>

      <Typography variant="body2" sx={{ mb: 1.5 }}>
        {disabled
          ? t(
              "rag.state.disabled.desc",
              "관리자가 AI 기능을 껐습니다. 장애가 아니며, 관리자 설정에서 다시 켜면 그대로 돌아옵니다.",
            )
          : t(
              "rag.state.queryOnly.desc",
              "관리자가 색인을 멈췄습니다. 이미 등록된 자료로 질문하고 검색하는 것은 그대로 됩니다.",
            )}
      </Typography>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
        {items.map((item) => (
          <Chip
            key={item.label}
            size="small"
            variant={item.ok ? "filled" : "outlined"}
            color={item.ok ? "success" : "default"}
            icon={
              item.ok ? (
                <OkIcon fontSize="small" />
              ) : (
                <BlockedIcon fontSize="small" />
              )
            }
            label={
              item.ok
                ? t("rag.state.available", "{name} 가능").replace(
                    "{name}",
                    item.label,
                  )
                : t("rag.state.unavailable", "{name} 불가").replace(
                    "{name}",
                    item.label,
                  )
            }
          />
        ))}
      </Box>

      {!disabled && (
        <Typography variant="body2" sx={{ mt: 1.5 }} color="text.secondary">
          {t(
            "rag.state.queryOnly.note",
            "멈춘 동안 추가하거나 수정한 테스트케이스는 검색 결과에 나오지 않습니다.",
          )}
        </Typography>
      )}
    </Alert>
  );
};

RagStateBanner.propTypes = {
  /** /api/system-settings/rag/status 응답 */
  status: PropTypes.shape({
    ragEnabled: PropTypes.bool,
    vectorWriteEnabled: PropTypes.bool,
  }),
};

export default RagStateBanner;
