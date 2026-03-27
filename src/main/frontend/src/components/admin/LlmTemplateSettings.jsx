// src/components/admin/LlmTemplateSettings.jsx
import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";
import {
  Edit as EditIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { useI18n } from "../../context/I18nContext";
import axiosInstance from "../../utils/axiosInstance.js";
import { API_CONFIG } from "../../utils/apiConstants.js";

// 기본 테스트 케이스 템플릿
// API (/api/llm-configs/default-template) 에서 조회합니다.

const LlmTemplateSettings = ({ onSuccess }) => {
  const { t } = useI18n();

  // LLM 분석 템플릿 상태
  const [llmTemplate, setLlmTemplate] = useState(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(false);

  // 기본 테스트 케이스 템플릿 상태 (API로 조회)
  const [defaultTestCaseTemplate, setDefaultTestCaseTemplate] = useState("");

  // LLM 템플릿 조회
  const fetchLlmTemplate = useCallback(async () => {
    setLoadingTemplate(true);
    try {
      const response = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}/api/llm-template`,
      );
      setLlmTemplate(response.data);
    } catch (err) {
      console.error("Failed to fetch LLM template:", err);
    } finally {
      setLoadingTemplate(false);
    }
  }, []);

  // 기본 테스트 케이스 템플릿 조회
  const fetchDefaultTestCaseTemplate = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        `${API_CONFIG.BASE_URL}/api/llm-configs/default-template`,
      );
      // ApiResponse { status, data, message } 구조 처리
      let templateData = "";

      if (response.data && response.data.data !== undefined) {
        templateData = response.data.data;
      } else {
        // 혹시 wrapper가 없는 경우
        templateData = response.data;
      }

      // 객체인 경우 문자열로 변환 (방어 코드)
      if (typeof templateData === "object" && templateData !== null) {
        try {
          templateData = JSON.stringify(templateData, null, 2);
        } catch (e) {
          console.error("Failed to stringify default template:", e);
        }
      }

      setDefaultTestCaseTemplate(templateData || "");
    } catch (err) {
      console.error("Failed to fetch default test case template:", err);
      // 실패 시 폴백 메시지 또는 빈 값 유지
    }
  }, []);

  // LLM 템플릿 업데이트
  const updateLlmTemplate = useCallback(async () => {
    setLoadingTemplate(true);
    try {
      const response = await axiosInstance.put(
        `${API_CONFIG.BASE_URL}/api/llm-template`,
        llmTemplate,
      );
      setLlmTemplate(response.data);
      setEditingTemplate(false);
      if (onSuccess)
        onSuccess(
          t(
            "admin.llmTemplate.message.updated",
            "LLM 분석 템플릿이 업데이트되었습니다",
          ),
        );
    } catch (err) {
      console.error("Failed to update LLM template:", err);
      alert(
        t("admin.llmTemplate.message.updateFailed", "LLM 템플릿 업데이트 실패"),
      );
    } finally {
      setLoadingTemplate(false);
    }
  }, [llmTemplate, onSuccess, t]);

  useEffect(() => {
    fetchLlmTemplate();
    fetchDefaultTestCaseTemplate();
  }, [fetchLlmTemplate, fetchDefaultTestCaseTemplate]);

  const handleDownloadTestCaseTemplate = () => {
    const blob = new Blob([defaultTestCaseTemplate], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "default-test-case-template.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Stack spacing={3}>
      {/* 기본 템플릿 섹션 -  테스트 케이스 생성 */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t(
            "admin.llmConfig.template.title",
            "📋 테스트 케이스 생성 기본 템플릿",
          )}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            marginBottom: "16px",
          }}
        >
          {t(
            "admin.llmConfig.template.description1",
            "이 템플릿은 새로운 LLM 설정 생성 시 자동으로 설정되며, AI에게 테스트 케이스 생성을 요청할 때 참고 형식으로 사용됩니다.",
          )}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            marginBottom: "16px",
          }}
        >
          {t(
            "admin.llmConfig.template.description2",
            "각 LLM 설정별로 이 템플릿을 수정하여 사용할 수 있습니다.",
          )}
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography variant="subtitle2" fontWeight="bold">
              {t(
                "admin.llmConfig.template.label",
                "기본 템플릿 JSON (서버 정의값):",
              )}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadTestCaseTemplate}
              disabled={!defaultTestCaseTemplate}
            >
              {t("admin.llmConfig.template.download", "다운로드")}
            </Button>
          </Box>
          <TextField
            value={defaultTestCaseTemplate}
            fullWidth
            multiline
            rows={20}
            variant="outlined"
            sx={{
              fontFamily: "monospace",
              fontSize: "0.85rem",
              "& .MuiInputBase-input": {
                fontFamily: "monospace",
              },
              bgcolor: "grey.50",
            }}
            slotProps={{
              input: { readOnly: true },
            }}
            placeholder="Loading default template..."
          />
        </Box>

        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>
              {t("admin.llmConfig.template.usageTitle", "사용 방법:")}
            </strong>
            <br />
            {t(
              "admin.llmConfig.template.usage1",
              "1. LLM 설정 생성 시 이 템플릿이 자동으로 적용됩니다.",
            )}
            <br />
            {t(
              "admin.llmConfig.template.usage2",
              "2. 각 LLM 설정에서 개별적으로 템플릿을 수정할 수 있습니다.",
            )}
            <br />
            {t(
              "admin.llmConfig.template.usage3",
              '3. RAG 채팅에서 "테스트 케이스"를 포함한 요청 시 자동으로 템플릿을 참고합니다.',
            )}
          </Typography>
        </Alert>
      </Paper>

      {/* LLM 분석 기본 템플릿 섹션 */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t("admin.llmTemplate.title", "🤖 LLM 청크 분석 기본 템플릿")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t(
            "admin.llmTemplate.description",
            "RAG 문서 분석 시 사용되는 기본 설정입니다. UI와 Backend 스케줄러가 공통으로 사용합니다.",
          )}
        </Typography>

        {loadingTemplate ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : llmTemplate ? (
          <Box>
            <TextField
              fullWidth
              label={t("admin.llmTemplate.promptTemplate", "프롬프트 템플릿")}
              value={llmTemplate.promptTemplate || ""}
              onChange={(e) =>
                setLlmTemplate({
                  ...llmTemplate,
                  promptTemplate: e.target.value,
                })
              }
              multiline
              rows={4}
              disabled={!editingTemplate}
              helperText={t(
                "admin.llmTemplate.promptTemplateHelper",
                "{chunk_text} 플레이스홀더를 사용하세요",
              )}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                label={t("admin.llmTemplate.maxTokens", "최대 토큰")}
                type="number"
                value={llmTemplate.maxTokens || 500}
                onChange={(e) =>
                  setLlmTemplate({
                    ...llmTemplate,
                    maxTokens: parseInt(e.target.value),
                  })
                }
                disabled={!editingTemplate}
                fullWidth
              />
              <TextField
                label={t("admin.llmTemplate.temperature", "온도")}
                type="number"
                value={llmTemplate.temperature || 0.7}
                onChange={(e) =>
                  setLlmTemplate({
                    ...llmTemplate,
                    temperature: parseFloat(e.target.value),
                  })
                }
                disabled={!editingTemplate}
                fullWidth
                slotProps={{ htmlInput: { min: 0, max: 2, step: 0.1 } }}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                label={t("admin.llmTemplate.chunkBatchSize", "배치 크기")}
                type="number"
                value={llmTemplate.chunkBatchSize || 10}
                onChange={(e) =>
                  setLlmTemplate({
                    ...llmTemplate,
                    chunkBatchSize: parseInt(e.target.value),
                  })
                }
                disabled={!editingTemplate}
                fullWidth
                helperText={t(
                  "admin.llmTemplate.chunkBatchSizeHelper",
                  "한 번에 처리할 청크 개수",
                )}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={llmTemplate.pauseAfterBatch || false}
                    onChange={(e) =>
                      setLlmTemplate({
                        ...llmTemplate,
                        pauseAfterBatch: e.target.checked,
                      })
                    }
                    disabled={!editingTemplate}
                  />
                }
                label={t(
                  "admin.llmTemplate.pauseAfterBatch",
                  "배치마다 일시정지",
                )}
                sx={{ minWidth: 200 }}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              {editingTemplate ? (
                <>
                  <Button
                    variant="contained"
                    onClick={updateLlmTemplate}
                    disabled={loadingTemplate}
                  >
                    {t("admin.llmTemplate.save", "저장")}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEditingTemplate(false);
                      fetchLlmTemplate();
                    }}
                  >
                    {t("admin.llmTemplate.cancel", "취소")}
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={() => setEditingTemplate(true)}
                >
                  {t("admin.llmTemplate.edit", "수정")}
                </Button>
              )}
            </Box>

            {llmTemplate.lastModifiedDate && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 2, display: "block" }}
              >
                {t(
                  "admin.llmTemplate.lastModified",
                  "마지막 수정: {0}",
                  llmTemplate.lastModifiedDate,
                )}
              </Typography>
            )}
          </Box>
        ) : null}
      </Paper>
    </Stack>
  );
};

LlmTemplateSettings.propTypes = {
  onSuccess: PropTypes.func,
};

export default LlmTemplateSettings;
