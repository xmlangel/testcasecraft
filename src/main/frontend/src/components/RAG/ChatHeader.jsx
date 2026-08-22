// src/components/RAG/ChatHeader.jsx
import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
} from "@mui/icons-material";
import { useI18n } from "../../context/I18nContext.jsx";

/**
 * 채팅 인터페이스 상단 헤더
 * - 제목 표시
 * - LLM 설정 선택 (관리자용)
 * - 액션 버튼 (전체화면, 재시도, 초기화)
 */
function ChatHeader({
  isAdmin,
  activeLlmConfigs,
  selectedLlmConfigId,
  defaultLlmConfig,
  onLlmConfigChange,
  freeModels = [],
  selectedModel = "",
  onModelChange = () => {},
  isFullScreen,
  onToggleFullScreen,
  onRetry,
  onClearChat,
  messages,
  isLoading,
  persistConversation,
  selectedThreadId,
}) {
  const { t } = useI18n();

  return (
    <Box
      sx={{
        p: 2,
        bgcolor: "primary.main",
        color: "primary.contrastText",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="h6" component="h2">
          {t("rag.chat.title", "AI 질의응답")}
        </Typography>
        {isAdmin && activeLlmConfigs.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select
              value={selectedLlmConfigId || ""}
              onChange={(e) => onLlmConfigChange(e.target.value)}
              displayEmpty
              sx={{
                "& .MuiSelect-select": {
                  py: 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                },
              }}
            >
              {activeLlmConfigs.map((config) => (
                <MenuItem key={config.id} value={config.id}>
                  <Chip
                    label={`${config.provider} / ${config.modelName}`}
                    size="small"
                    color={
                      config.provider === "OPENAI"
                        ? "primary"
                        : config.provider === "OLLAMA"
                          ? "success"
                          : config.provider === "PERPLEXITY"
                            ? "warning"
                            : "secondary"
                    }
                    sx={{ fontWeight: "medium" }}
                  />
                  {config.isDefault && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      {t("rag.chat.defaultConfigSuffix", "(기본)")}
                    </Typography>
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/*
          무료 모델 선택기.

          관리자가 설정을 고치지 않고도 사용자가 이번 대화에 쓸 모델을 고를 수 있게 한다.
          기본 설정이 OpenRouter 일 때만 목록이 내려오므로 그때만 보인다. 서버가 무료 모델
          목록에 있는 모델만 받아 주기 때문에 유료 모델로 넘어가 과금이 붙을 일은 없다.
        */}
        {freeModels.length > 0 && (
          <FormControl size="small" sx={{ minWidth: 240 }}>
            <Select
              value={selectedModel || ""}
              onChange={(e) => onModelChange(e.target.value)}
              displayEmpty
              sx={{
                "& .MuiSelect-select": {
                  py: 0.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                },
              }}
            >
              <MenuItem value="">
                <Typography variant="body2">
                  {t("rag.chat.modelDefault", "설정의 기본 모델")}
                </Typography>
              </MenuItem>
              {freeModels.map((model) => (
                <MenuItem key={model.id} value={model.id}>
                  <Chip
                    label={model.id.replace(/:free$/, "")}
                    size="small"
                    color="success"
                    variant="outlined"
                    sx={{ fontWeight: "medium" }}
                  />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Tooltip
          title={
            isFullScreen
              ? t("rag.chat.exitFullScreen", "전체화면 종료")
              : t("rag.chat.enterFullScreen", "전체화면 보기")
          }
        >
          <IconButton color="inherit" size="small" onClick={onToggleFullScreen}>
            {isFullScreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title={t("rag.chat.retry", "재시도")}>
          <span style={{ display: "flex" }}>
            <IconButton
              color="inherit"
              size="small"
              onClick={onRetry}
              disabled={messages.length < 2 || isLoading}
            >
              <RefreshIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title={t("rag.chat.clear", "대화 초기화")}>
          <span style={{ display: "flex" }}>
            <IconButton
              color="inherit"
              size="small"
              onClick={onClearChat}
              disabled={
                messages.length === 0 ||
                isLoading ||
                Boolean(persistConversation && selectedThreadId)
              }
            >
              <DeleteIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
}

ChatHeader.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  activeLlmConfigs: PropTypes.array.isRequired,
  selectedLlmConfigId: PropTypes.string,
  defaultLlmConfig: PropTypes.object,
  onLlmConfigChange: PropTypes.func.isRequired,
  freeModels: PropTypes.array,
  selectedModel: PropTypes.string,
  onModelChange: PropTypes.func,
  isFullScreen: PropTypes.bool.isRequired,
  onToggleFullScreen: PropTypes.func.isRequired,
  onRetry: PropTypes.func.isRequired,
  onClearChat: PropTypes.func.isRequired,
  messages: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  persistConversation: PropTypes.bool.isRequired,
  selectedThreadId: PropTypes.string,
};
export default ChatHeader;
