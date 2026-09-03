// src/components/Project/AgentConnectionSettings.jsx
//
// 프로젝트 설정 > 에이전트 연동 탭.
//
// 에이전트는 제품 밖의 별도 스택이다. 이 화면이 하는 일은 두 가지뿐이다.
//   · 자동화 화면에 딥링크 버튼을 띄울지 정한다 (On/Off · 이름)
//   · 그 주소가 살아 있는지 확인한다 (연결 테스트)
//
// 실행과 결과 적재는 이 화면과 무관하다. 에이전트가 제품의 공개 API 로 결과를 올리고,
// 그 결과는 에이전트 스택을 내려도 테스트결과 화면에 그대로 남는다.
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControlLabel,
  Paper,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {
  CheckCircleOutline as VerifiedIcon,
  ErrorOutline as FailedIcon,
  HelpOutline as UnknownIcon,
} from "@mui/icons-material";

import { useI18n } from "../../context/I18nContext.jsx";
import agentConnectionService from "../../services/agentConnectionService.js";
import { useDateFormatter } from "../../hooks/useDateFormatter.js";

const EMPTY_FORM = {
  name: "",
  serverUrl: "",
  token: "",
  defaultProfile: "",
  isActive: false,
};

const AgentConnectionSettings = ({ projectId, canEdit }) => {
  const { t } = useI18n();
  const { formatDate } = useDateFormatter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connection, setConnection] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  /** 서버가 준 문구 앞에 무엇이 실패했는지 붙인다. 서비스 계층에는 문구를 두지 않는다. */
  const showError = useCallback(
    (e) =>
      setError(
        `${t("agentConnection.requestFailed", "요청을 처리하지 못했습니다")}: ${e.message}`,
      ),
    [t],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const found = await agentConnectionService.get(projectId);
      setConnection(found);
      setForm(
        found
          ? {
              name: found.name || "",
              serverUrl: found.serverUrl || "",
              token: "",
              defaultProfile: found.defaultProfile || "",
              isActive: Boolean(found.isActive),
            }
          : EMPTY_FORM,
      );
    } catch (e) {
      showError(e);
    } finally {
      setLoading(false);
    }
  }, [projectId, showError]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      // 토큰 칸이 비어 있으면 아예 보내지 않는다. 그러면 서버가 기존 값을 유지한다.
      const payload = {
        name: form.name.trim(),
        serverUrl: form.serverUrl.trim(),
        defaultProfile: form.defaultProfile.trim(),
        isActive: form.isActive,
      };
      if (form.token.trim().length > 0) {
        payload.token = form.token.trim();
      }
      const saved = await agentConnectionService.save(projectId, payload);
      setConnection(saved);
      setForm((cur) => ({ ...cur, token: "" }));
      setNotice(t("agentConnection.saved", "에이전트 연동 설정을 저장했습니다."));
    } catch (e) {
      showError(e);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setError(null);
    setNotice(null);
    try {
      const result = await agentConnectionService.test(projectId);
      await load();
      if (result?.ok) {
        setNotice(
          `${t("agentConnection.status.verified", "연결됨")} · ${t(
            "agentConnection.status.version",
            "에이전트 버전",
          )} ${result.version || "-"} · ${t(
            "agentConnection.status.latency",
            "응답 시간",
          )} ${result.latencyMs ?? "-"}ms`,
        );
      } else {
        setError(result?.error || t("agentConnection.status.failed", "연결할 수 없음"));
      }
    } catch (e) {
      showError(e);
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = async () => {
    setConfirmDelete(false);
    setError(null);
    try {
      await agentConnectionService.remove(projectId);
      setConnection(null);
      setForm(EMPTY_FORM);
      setNotice(t("agentConnection.deleted", "에이전트 연동 설정을 삭제했습니다."));
    } catch (e) {
      showError(e);
    }
  };

  const statusChip = () => {
    if (!connection) return null;
    if (connection.connectionVerified) {
      return (
        <Chip
          size="small"
          color="success"
          icon={<VerifiedIcon />}
          label={t("agentConnection.status.verified", "연결됨")}
          data-testid="agent-connection-status-verified"
        />
      );
    }
    if (connection.lastConnectionTest) {
      return (
        <Chip
          size="small"
          color="error"
          icon={<FailedIcon />}
          label={t("agentConnection.status.failed", "연결할 수 없음")}
          data-testid="agent-connection-status-failed"
        />
      );
    }
    return (
      <Chip
        size="small"
        icon={<UnknownIcon />}
        label={t("agentConnection.status.unknown", "확인하지 않음")}
        data-testid="agent-connection-status-unknown"
      />
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const canSave =
    canEdit && form.name.trim().length > 0 && form.serverUrl.trim().length > 0;

  return (
    <Paper variant="outlined" sx={{ p: 2, maxWidth: 720 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Typography variant="h6">
          {t("agentConnection.title", "외부 QA 에이전트")}
        </Typography>
        {statusChip()}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {t(
          "agentConnection.intro",
          "자연어 테스트 케이스를 브라우저에서 실행하는 외부 에이전트를 연결합니다. 에이전트는 제품 밖에서 돌고, 결과만 테스트실행으로 들어옵니다.",
        )}
      </Typography>

      {!canEdit && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {t(
            "agentConnection.readonly",
            "에이전트 연동 설정은 프로젝트 매니저와 시스템 관리자만 바꿀 수 있습니다.",
          )}
        </Alert>
      )}
      {!connection && (
        <Alert severity="info" sx={{ mb: 2 }} data-testid="agent-connection-unset">
          {t("agentConnection.unset", "아직 연결된 에이전트가 없습니다.")}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {notice && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice(null)}>
          {notice}
        </Alert>
      )}

      <TextField
        label={t("agentConnection.field.name", "에이전트 이름")}
        value={form.name}
        onChange={(e) => setForm((cur) => ({ ...cur, name: e.target.value }))}
        helperText={t(
          "agentConnection.field.nameHint",
          "자동화 화면 버튼에 이 이름이 그대로 나옵니다.",
        )}
        fullWidth
        margin="normal"
        disabled={!canEdit}
        inputProps={{ maxLength: 100, "data-testid": "agent-connection-name" }}
      />
      <TextField
        label={t("agentConnection.field.serverUrl", "에이전트 주소")}
        value={form.serverUrl}
        onChange={(e) => setForm((cur) => ({ ...cur, serverUrl: e.target.value }))}
        placeholder="https://qa-agent.internal:8090"
        helperText={t(
          "agentConnection.field.serverUrlHint",
          "http 또는 https 로 시작하는 주소를 넣습니다.",
        )}
        fullWidth
        margin="normal"
        disabled={!canEdit}
        inputProps={{ maxLength: 500, "data-testid": "agent-connection-url" }}
      />
      <TextField
        label={t("agentConnection.field.token", "인증 토큰")}
        value={form.token}
        onChange={(e) => setForm((cur) => ({ ...cur, token: e.target.value }))}
        type="password"
        autoComplete="new-password"
        helperText={
          connection?.hasToken
            ? `${t("agentConnection.field.tokenSaved", "토큰이 저장되어 있습니다.")} ${t(
                "agentConnection.field.tokenHint",
                "비워 두면 기존 값을 그대로 씁니다. 저장된 토큰은 화면에 보이지 않습니다.",
              )}`
            : t(
                "agentConnection.field.tokenHint",
                "비워 두면 기존 값을 그대로 씁니다. 저장된 토큰은 화면에 보이지 않습니다.",
              )
        }
        fullWidth
        margin="normal"
        disabled={!canEdit}
        inputProps={{ "data-testid": "agent-connection-token" }}
      />
      <TextField
        label={t("agentConnection.field.defaultProfile", "기본 프로필")}
        value={form.defaultProfile}
        onChange={(e) =>
          setForm((cur) => ({ ...cur, defaultProfile: e.target.value }))
        }
        helperText={t(
          "agentConnection.field.defaultProfileHint",
          "에이전트 앱에 등록한 프로필 식별자입니다. 정책과 컨텍스트가 그 안에 있습니다.",
        )}
        fullWidth
        margin="normal"
        disabled={!canEdit}
        inputProps={{ maxLength: 100, "data-testid": "agent-connection-profile" }}
      />

      <FormControlLabel
        sx={{ mt: 1 }}
        control={
          <Switch
            checked={form.isActive}
            onChange={(e) =>
              setForm((cur) => ({ ...cur, isActive: e.target.checked }))
            }
            disabled={!canEdit}
            data-testid="agent-connection-active"
          />
        }
        label={t("agentConnection.field.isActive", "이 프로젝트에서 사용")}
      />
      <Typography variant="caption" color="text.secondary" display="block">
        {t(
          "agentConnection.field.isActiveHint",
          "꺼 두면 자동화 화면에 에이전트 관련 항목이 나타나지 않습니다.",
        )}
      </Typography>

      {connection && (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ mb: 1.5 }} />
          <Typography variant="caption" color="text.secondary" display="block">
            {t("agentConnection.status.lastTest", "마지막 확인")}:{" "}
            {connection.lastConnectionTest
              ? formatDate(connection.lastConnectionTest)
              : "-"}
          </Typography>
          {connection.agentVersion && (
            <Typography variant="caption" color="text.secondary" display="block">
              {t("agentConnection.status.version", "에이전트 버전")}:{" "}
              {connection.agentVersion}
            </Typography>
          )}
          {connection.lastConnectionError && (
            <Typography variant="caption" color="error" display="block">
              {connection.lastConnectionError}
            </Typography>
          )}
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!canSave || saving}
          data-testid="agent-connection-save"
        >
          {t("agentConnection.save", "저장")}
        </Button>
        <Button
          variant="outlined"
          onClick={handleTest}
          disabled={!canEdit || !connection || testing}
          data-testid="agent-connection-test"
        >
          {testing
            ? t("agentConnection.testing", "확인하는 중...")
            : t("agentConnection.test", "연결 테스트")}
        </Button>
        {connection && canEdit && (
          <Button
            color="error"
            onClick={() => setConfirmDelete(true)}
            data-testid="agent-connection-delete"
          >
            {t("agentConnection.delete", "연동 삭제")}
          </Button>
        )}
      </Box>
      {!connection && canEdit && (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          {t("agentConnection.status.saveFirst", "먼저 저장한 뒤 연결을 확인합니다.")}
        </Typography>
      )}

      <Alert severity="warning" sx={{ mt: 3 }} data-testid="agent-connection-limits">
        {t(
          "agentConnection.limits",
          "케이스 하나에 30초에서 1분이 걸리고 비용이 듭니다. 같은 케이스를 다시 돌리면 행동이 조금씩 달라집니다. 판정은 초안이며 확정은 사람이 합니다. 파일 업로드와 캡차가 들어간 시나리오는 지원하지 않습니다.",
        )}
      </Alert>

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>{t("agentConnection.delete", "연동 삭제")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t(
              "agentConnection.deleteConfirm",
              "이 프로젝트의 에이전트 연동 설정을 삭제하시겠습니까?",
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>
            {t("common.cancel", "취소")}
          </Button>
          <Button color="error" onClick={handleDelete} data-testid="agent-connection-delete-confirm">
            {t("agentConnection.delete", "연동 삭제")}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AgentConnectionSettings;
