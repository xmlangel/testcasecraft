import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Paper,
  Button,
  Link,
  Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import { useRAG } from "../../context/RAGContext";
import { useI18n } from "../../context/I18nContext";

const SCHEDULER_MANAGEMENT_PATH = "/scheduler";

const RagSystemSettings = ({ onSuccess }) => {
  const { t } = useI18n();
  const { api } = useAppContext();
  const { updateRagEnabled } = useRAG();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isRagEnabled, setIsRagEnabled] = useState(true);
  // 벡터 쓰기만 따로 끄는 설정. 끄면 새 색인이 멈추고 질문은 그대로 된다.
  const [isVectorWriteEnabled, setIsVectorWriteEnabled] = useState(true);
  // 저장 완료 후 실제 반영된 상태 (안내 메시지 기준)
  const [savedRagEnabled, setSavedRagEnabled] = useState(true);
  const [showSaveResult, setShowSaveResult] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api("/api/system-settings/rag/status");
      if (!response.ok) {
        throw new Error("Failed to fetch");
      }
      const data = await response.json();
      const enabled = data?.data?.enabled ?? data?.enabled;
      const resolvedEnabled = enabled !== false;
      setIsRagEnabled(resolvedEnabled);
      setSavedRagEnabled(resolvedEnabled);

      const vectorWrite =
        data?.data?.vectorWriteEnabled ?? data?.vectorWriteEnabled;
      setIsVectorWriteEnabled(vectorWrite !== false);
    } catch (err) {
      console.error("Failed to fetch system settings:", err);
      setError(
        t("admin.systemSettings.fetchError", "설정을 불러오는데 실패했습니다."),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleToggleConfig = (event) => {
    setIsRagEnabled(event.target.checked);
    setShowSaveResult(false);
  };

  const handleToggleVectorWrite = (event) => {
    setIsVectorWriteEnabled(event.target.checked);
    setShowSaveResult(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setShowSaveResult(false);

      const response = await api("/api/system-settings/RAG_ENABLED", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value: isRagEnabled.toString(),
          description: t("admin.systemSettings.ragToggleDescription", "RAG(AI) 기능 활성화 토글"),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save setting");
      }

      const vectorResponse = await api(
        "/api/system-settings/RAG_VECTOR_WRITE_ENABLED",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            value: isVectorWriteEnabled.toString(),
            description: t(
              "admin.systemSettings.vectorWriteToggleDescription",
              "벡터 색인 활성화 토글",
            ),
          }),
        },
      );

      if (!vectorResponse.ok) {
        throw new Error("Failed to save vector write setting");
      }

      // RAGContext 전역 상태 업데이트
      updateRagEnabled(isRagEnabled);
      setSavedRagEnabled(isRagEnabled);
      setShowSaveResult(true);

      if (onSuccess) {
        onSuccess(
          t(
            "admin.systemSettings.saveSuccess",
            "시스템 설정이 성공적으로 저장되었습니다.",
          ),
        );
      }
    } catch (err) {
      console.error("Failed to update RAG setting:", err);
      setError(
        t("admin.systemSettings.saveError", "설정 저장에 실패했습니다."),
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h6">
          {t("admin.systemSettings.ragTitle", "RAG 시스템 설정")}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <CircularProgress size={24} /> : t("common.save", "저장")}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          {t("admin.systemSettings.ragToggleTitle", "RAG 기능 활성화 상태")}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {t(
            "admin.systemSettings.ragToggleDesc",
            "이 설정을 끄면 시스템 전체에서 RAG 기능 및 LLM 호출이 비활성화됩니다. RAG 시스템이 불안정하거나 유지보수가 필요할 때 사용하세요.",
          )}
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={isRagEnabled}
              onChange={handleToggleConfig}
              color="primary"
            />
          }
          label={
            isRagEnabled
              ? t("common.enabled", "활성화됨")
              : t("common.disabled", "비활성화됨")
          }
        />

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1" gutterBottom>
          {t("admin.systemSettings.vectorWriteTitle", "벡터 색인")}
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          {t(
            "admin.systemSettings.vectorWriteDesc",
            "이 설정을 끄면 새 벡터를 만드는 작업만 멈춥니다. 문서 업로드·분석·임베딩 생성과 테스트케이스·대화 색인이 중지되고, 이미 색인된 자료로 질문하는 것은 그대로 됩니다. 임베딩 비용을 묶어 두거나 색인을 잠시 멈출 때 사용하세요.",
          )}
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={isVectorWriteEnabled}
              onChange={handleToggleVectorWrite}
              color="primary"
              disabled={!isRagEnabled}
            />
          }
          label={
            isVectorWriteEnabled
              ? t("common.enabled", "활성화됨")
              : t("common.disabled", "비활성화됨")
          }
        />

        {!isRagEnabled && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {t(
              "admin.systemSettings.vectorWriteRagOff",
              "RAG 기능이 꺼져 있어 이 설정은 적용되지 않습니다. 질문과 색인이 모두 중지된 상태입니다.",
            )}
          </Alert>
        )}

        {isRagEnabled && !isVectorWriteEnabled && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {t(
              "admin.systemSettings.vectorWriteOffNotice",
              "색인이 멈춘 동안 추가하거나 수정한 테스트케이스는 검색 결과에 반영되지 않습니다. 다시 켜도 그 사이 변경분은 자동으로 따라잡지 않으므로 필요하면 문서를 다시 분석해야 합니다.",
            )}
          </Alert>
        )}

        {/* 저장 완료 후 결과에 따른 안내 메시지 */}
        {showSaveResult && !savedRagEnabled && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              RAG가 비활성화되었습니다.
            </Typography>
            <Typography variant="body2">
              RAG 관련 스케줄러(<strong>rag-cleanup</strong>,{" "}
              <strong>rag-auto-analysis</strong>)가 자동으로 중지되었습니다. RAG
              재활성화 후에는 스케줄러를{" "}
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate(SCHEDULER_MANAGEMENT_PATH)}
                sx={{ fontWeight: "bold", verticalAlign: "baseline" }}
              >
                스케줄러 관리 페이지
              </Link>
              에서 수동으로 다시 활성화해야 합니다.
            </Typography>
          </Alert>
        )}

        {showSaveResult && savedRagEnabled && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2" fontWeight="bold" gutterBottom>
              RAG가 활성화되었습니다.
            </Typography>
            <Typography variant="body2">
              RAG 관련 스케줄러(<strong>rag-cleanup</strong>,{" "}
              <strong>rag-auto-analysis</strong>)는 자동으로 재시작되지
              않습니다.{" "}
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate(SCHEDULER_MANAGEMENT_PATH)}
                sx={{ fontWeight: "bold", verticalAlign: "baseline" }}
              >
                스케줄러 관리 페이지
              </Link>
              에서 수동으로 활성화해 주세요.
            </Typography>
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default RagSystemSettings;
