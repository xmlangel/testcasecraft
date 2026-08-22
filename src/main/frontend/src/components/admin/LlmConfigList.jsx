// src/components/admin/LlmConfigList.jsx
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Tooltip,
  Stack,
  Typography,
  Autocomplete,
  ListItemText,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Wifi as WifiIcon,
  WifiOff as WifiOffIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
} from "@mui/icons-material";
import { useLlmConfig } from "../../context/LlmConfigContext";
import { useI18n } from "../../context/I18nContext";
import EncryptionKeyHelp from "./EncryptionKeyHelp";
import ErrorDetailAlert from "../common/ErrorDetailAlert.jsx";
import { isEncryptionKeyError } from "../../constants/errorCodes";
import {
  LLM_PROVIDER_ORDER,
  isUntouchedApiUrl,
  providerInfo,
} from "../../constants/llmProviders";
import LlmModelSelector from "./LlmModelSelector.jsx";

// 기본 테스트 케이스 템플릿
const DEFAULT_TEST_CASE_TEMPLATE = `{
  "name": "사용자 로그인 테스트",
  "description": "정상 사용자 ID/비밀번호 입력 시 로그인 성공",
  "priority": "High",
  "tags": ["인증", "로그인", "P1"],
  "preCondition": "테스트 환경에 로그인 화면이 배포되어 있고, 테스트 DB에 test.user@example.com 계정이 존재해야 함",
  "steps": [
    {
      "stepNumber": 1,
      "description": "로그인 URL에 접속",
      "expectedResult": "로그인 폼이 표시됨"
    },
    {
      "stepNumber": 2,
      "description": "이메일에 test.user@example.com 입력",
      "expectedResult": "입력값이 표시됨"
    },
    {
      "stepNumber": 3,
      "description": "비밀번호에 Password123! 입력",
      "expectedResult": "마스킹되어 표시됨"
    },
    {
      "stepNumber": 4,
      "description": "로그인 버튼 클릭",
      "expectedResult": "대시보드로 이동되고 환영 메시지 표시됨"
    }
  ],
  "expectedResults": "사용자가 정상적으로 인증되고 대시보드에 접근할 수 있어야 함"
}`;

const LlmConfigList = ({ onSuccess }) => {
  const { t } = useI18n();
  const {
    configs,
    loading,
    error,
    createConfig,
    updateConfig,
    deleteConfig,
    setDefaultConfig,
    testConnection,
    testUnsavedSettings,
    toggleActive,
    fetchSelectableModels,
    probeModelAvailability,
    fetchModelCatalogProviders,
  } = useLlmConfig();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    provider: "OPENWEBUI",
    apiUrl: "",
    apiKey: "",
    modelName: "",
    isDefault: false,
    testCaseTemplate: DEFAULT_TEST_CASE_TEMPLATE,
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingId, setTestingId] = useState(null);
  const [testingDialog, setTestingDialog] = useState(false);
  const [testResult, setTestResult] = useState(null);
  // 저장 실패 메시지. 기존에는 Context 의 error 만 갱신하고 다이얼로그에는 아무것도 뜨지 않았다.
  const [submitError, setSubmitError] = useState(null);
  // OpenRouter 무료 모델 목록. 목록만 받은 상태에서는 availability 가 UNKNOWN 이다.
  const [freeModels, setFreeModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [modelsProbing, setModelsProbing] = useState(false);
  const [modelsError, setModelsError] = useState(null);
  const [modelsNotice, setModelsNotice] = useState(null);
  // 목록 개방 상태와 입력 문자열을 직접 들고 있는다. 목록을 받은 직후 자동으로 펼쳐 주려면
  // 개방 여부를 컴포넌트가 통제해야 하고, 고른 값과 타이핑 중인 문자열도 구분해야 한다.
  const [modelListOpen, setModelListOpen] = useState(false);
  const [modelInput, setModelInput] = useState("");
  // 모델 목록을 내주는 제공자 정보. 서버가 알려 주므로 화면에 제공자를 박아 두지 않는다.
  const [modelCatalogs, setModelCatalogs] = useState([]);

  // 모델 목록을 내주는 제공자를 한 번 받아 둔다.
  useEffect(() => {
    let cancelled = false;
    fetchModelCatalogProviders().then((list) => {
      if (!cancelled) {
        setModelCatalogs(list);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [fetchModelCatalogProviders]);

  /** 지금 고른 제공자의 카탈로그 정보. 없으면 목록 선택기를 띄우지 않는다. */
  const modelCatalog =
    modelCatalogs.find((c) => c.provider === formData.provider) || null;

  const handleOpenDialog = (config = null) => {
    if (config) {
      setEditingConfig(config);
      setFormData({
        name: config.name,
        provider: config.provider,
        apiUrl: config.apiUrl,
        apiKey: "", // API Key는 수정 시 비워둠 (선택적 업데이트)
        modelName: config.modelName,
        isDefault: config.isDefault,
        testCaseTemplate: config.testCaseTemplate || DEFAULT_TEST_CASE_TEMPLATE,
      });
    } else {
      setEditingConfig(null);
      setFormData({
        name: "",
        provider: "OPENWEBUI",
        // 기본값을 미리 채운다. 빈 칸으로 두면 사용자가 공식 문서의 경로 포함 URL 을 그대로 넣게 된다.
        apiUrl: providerInfo("OPENWEBUI").apiUrl,
        apiKey: "",
        modelName: "",
        isDefault: false,
        testCaseTemplate: DEFAULT_TEST_CASE_TEMPLATE,
      });
    }
    setDialogOpen(true);
    setShowApiKey(false);
    setTestResult(null);
    setSubmitError(null);
    resetModelCatalog();
    setModelInput(config ? config.modelName || "" : "");
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingConfig(null);
    setFormData({
      name: "",
      provider: "OPENWEBUI",
      apiUrl: providerInfo("OPENWEBUI").apiUrl,
      apiKey: "",
      modelName: "",
      isDefault: false,
      testCaseTemplate: DEFAULT_TEST_CASE_TEMPLATE,
    });
    setShowApiKey(false);
    setTestResult(null);
    setSubmitError(null);
    resetModelCatalog();
    setModelInput("");
  };

  /**
   * 제공자 변경.
   *
   * 그 제공자의 기본 API URL 을 채워 넣되, **사용자가 직접 고친 값은 덮지 않는다.** 사설 호스트를
   * 입력해 둔 사용자가 제공자를 잠깐 바꿨다 돌아왔을 때 값을 잃으면 안 되기 때문이다. 채워진 값은
   * 그대로 편집할 수 있다.
   *
   * 모델 이름은 제공자마다 체계가 전혀 달라 그대로 두면 잘못된 값이 남는다. 그래서 비운다.
   */
  const handleProviderChange = (provider) => {
    setFormData((previous) => ({
      ...previous,
      provider,
      apiUrl: isUntouchedApiUrl(previous.apiUrl)
        ? providerInfo(provider).apiUrl
        : previous.apiUrl,
      modelName: "",
    }));
    resetModelCatalog();
    setModelInput("");
  };

  const resetModelCatalog = () => {
    setFreeModels([]);
    setModelsError(null);
    setModelsNotice(null);
    setModelsLoading(false);
    setModelsProbing(false);
    setModelListOpen(false);
  };

  /**
   * 목록 조회·가용성 확인에 쓸 요청 값.
   *
   * 입력한 키가 있으면 그것을, 없으면 저장된 설정 ID 를 쓴다. provider 는 항상 실어 보낸다.
   * 서버가 제공자별로 다른 카탈로그를 고르기 때문이다.
   */
  const modelQueryCredentials = () => {
    if (formData.apiKey) {
      return { provider: formData.provider, apiKey: formData.apiKey };
    }
    if (editingConfig?.id) {
      return { provider: formData.provider, configId: editingConfig.id };
    }
    return null;
  };

  const handleLoadFreeModels = async () => {
    const credentials = modelQueryCredentials();
    if (!credentials) {
      setModelsError(
        t(
          "admin.llmConfig.models.needApiKey",
          "먼저 API Key 를 입력해 주세요. 저장된 설정을 수정하는 경우에는 키를 다시 입력하지 않아도 됩니다.",
        ),
      );
      return;
    }

    setModelsLoading(true);
    setModelsError(null);
    setModelsNotice(null);
    try {
      const models = await fetchSelectableModels(credentials);
      setFreeModels(models);
      // 목록을 받았으면 바로 펼쳐 준다. 버튼을 눌렀는데 화면이 그대로면 아무 일도 없어 보인다.
      if (models.length > 0) {
        setModelListOpen(true);
      }
      setModelsNotice(
        // 옛 키(models.loaded)는 DB 에 이전 문구가 들어 있고 시드가 기존 값을 덮지 않는다.
        // 버튼 이름이 바뀌었으므로 새 키로 옮겼다.
        //
        // 안내가 제공자에 따라 갈린다. NVIDIA 는 목록의 상당수가 계정에 없어 확인하지 않으면
        // 쓸 수 없는 모델을 고르게 되므로 전수 확인을 권한다.
        modelCatalog?.probeRecommendedByDefault
          ? t(
              "admin.llmConfig.models.loadedHintProbeFirst",
              "모델 {count}개를 불러왔습니다. 이 목록에는 계정에서 제공하지 않는 모델도 섞여 있으므로 '전수 확인' 을 먼저 누르세요.",
            ).replace("{count}", String(models.length))
          : t(
              "admin.llmConfig.models.loadedHint",
              "무료 모델 {count}개를 불러왔습니다. 쓸 모델을 고른 뒤 '이 모델 확인' 을 누르세요. 전수 확인은 한도를 모델 수만큼 사용합니다.",
            ).replace("{count}", String(models.length)),
      );
    } catch (err) {
      setModelsError(err.message);
    } finally {
      setModelsLoading(false);
    }
  };

  /** 이미 판정한 모델 수. 판정 초기화 버튼을 띄울지 정한다. */
  const checkedCount = freeModels.filter(
    (m) => m.availability && m.availability !== "UNKNOWN",
  ).length;

  /** 아직 확인하지 않은 모델 수. 전수 확인이 실제로 보낼 요청 수다. */
  const pendingCheckCount = freeModels.length - checkedCount;

  /**
   * 가용성 확인.
   *
   * 확인 한 번이 무료 일일 한도를 그만큼 쓴다(실측 한도 50건, 무료 모델 20개). 그래서 기본은
   * 고른 모델 하나만 확인하고, 전체 확인은 소모량을 알린 뒤에만 보낸다. 이미 판정한 모델은
   * 서버에서 건너뛰므로 버튼을 다시 눌러도 한도가 다시 쓰이지 않는다.
   *
   * @param scope "one" 이면 지금 고른 모델만, "all" 이면 목록 전체
   */
  const handleProbeModels = async (scope) => {
    const credentials = modelQueryCredentials();
    if (!credentials) {
      setModelsError(
        t(
          "admin.llmConfig.models.needApiKey",
          "먼저 API Key 를 입력해 주세요. 저장된 설정을 수정하는 경우에는 키를 다시 입력하지 않아도 됩니다.",
        ),
      );
      return;
    }

    let modelIds;
    let alreadyChecked = [];

    if (scope === "one") {
      if (!formData.modelName) {
        setModelsError(
          t(
            "admin.llmConfig.models.needModel",
            "확인할 모델을 먼저 고르거나 입력해 주세요.",
          ),
        );
        return;
      }
      modelIds = [formData.modelName];
    } else {
      modelIds = freeModels.map((m) => m.id);
      // 이미 판정한 모델은 서버가 건너뛴다. 남은 개수를 알려 준 뒤 확인을 받는다.
      alreadyChecked = freeModels
        .filter((m) => m.availability && m.availability !== "UNKNOWN")
        .map((m) => m.id);

      const pending = modelIds.length - alreadyChecked.length;
      if (pending === 0) {
        setModelsNotice(
          t(
            "admin.llmConfig.models.allChecked",
            "이미 전부 확인했습니다. 다시 확인하려면 '판정 초기화' 를 누르세요.",
          ),
        );
        return;
      }

      // 제공자에 따라 확인의 성격이 다르다. NVIDIA 는 목록의 상당수가 계정에 없어 확인이
      // 사실상 필수이고 한도 부담이 없다. OpenRouter 는 확인이 한도를 태운다.
      const confirmMessage = modelCatalog?.probeRecommendedByDefault
        ? t(
            "admin.llmConfig.models.probeAllConfirmNoQuota",
            "모델 {count}개를 확인합니다. 1분 정도 걸립니다. 계속하시겠습니까?",
          ).replace("{count}", String(pending))
        : t(
            "admin.llmConfig.models.probeAllConfirm",
            "모델 {count}개를 확인합니다. 무료 일일 한도를 그만큼 사용합니다(실측 한도 50건). 계속하시겠습니까?",
          ).replace("{count}", String(pending));

      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    setModelsProbing(true);
    setModelsError(null);
    setModelsNotice(null);
    try {
      const result = await probeModelAvailability({
        ...credentials,
        modelIds,
        alreadyChecked,
      });
      const results = result.models || [];

      // 판정 결과를 기존 목록에 합친다. 목록이 비어 있었다면 판정 결과가 곧 목록이다.
      const verdictById = new Map(results.map((r) => [r.id, r]));
      setFreeModels((previous) => {
        if (previous.length === 0) {
          return results;
        }
        return previous.map((model) => {
          const verdict = verdictById.get(model.id);
          return verdict
            ? {
                ...model,
                availability: verdict.availability,
                availabilityMessage: verdict.availabilityMessage,
              }
            : model;
        });
      });

      const availableModels = results.filter(
        (r) => r.availability === "AVAILABLE",
      );

      // 계정 일일 한도가 걸린 경우는 모델을 바꿔도 풀리지 않는다. 개별 항목 사유로 묻어 두면
      // 사용자가 다른 모델을 계속 시도하게 되므로 알림으로 먼저 알린다.
      const accountLimited = results.find(
        (r) => r.availability === "ACCOUNT_LIMIT",
      );
      if (accountLimited) {
        const limit = result.accountLimit;
        let message = t(
          "admin.llmConfig.models.accountLimit",
          "계정의 일일 무료 요청 한도를 다 썼습니다. 다른 무료 모델로 바꿔도 해결되지 않습니다.",
        );
        if (limit) {
          message +=
            " " +
            t(
              "admin.llmConfig.models.accountLimitDetail",
              "하루 {limit}건 중 {remaining}건 남음. {reset} 에 초기화됩니다.",
            )
              .replace("{limit}", String(limit.limit ?? "?"))
              .replace("{remaining}", String(limit.remaining ?? "?"))
              .replace("{reset}", limit.resetAt || "다음 날");
        } else {
          message += " " + (accountLimited.availabilityMessage || "");
        }
        setModelsError(message);
      }

      let notice = t(
        "admin.llmConfig.models.probed",
        "확인 {total}개 중 {available}개를 지금 쓸 수 있습니다. 회색 항목은 고를 수 없습니다.",
      )
        .replace("{total}", String(results.length))
        .replace("{available}", String(availableModels.length));

      // 한 회차 상한을 넘어 확인하지 못한 모델이 있으면 먼저 알린다. 이 안내가 없으면 요청한
      // 모델이 결과에서 조용히 빠져 전부 확인된 것으로 보이고, 확인되지 않은 모델을 골라
      // 채팅하면 원인 모를 실패를 만난다.
      if (result.skippedByLimit > 0) {
        notice +=
          " " +
          t(
            "admin.llmConfig.models.skippedByLimit",
            "한 번에 {limit}개까지만 확인합니다. {skipped}개는 확인하지 않았으니 버튼을 다시 눌러 주세요.",
          )
            .replace("{limit}", String(result.probeLimit ?? ""))
            .replace("{skipped}", String(result.skippedByLimit));
      }

      // 실제로 보낸 요청 수를 함께 알린다. 한도를 얼마나 썼는지 사용자가 알아야 다음 판단을 한다.
      if (typeof result.requestsSent === "number") {
        notice +=
          " " +
          t(
            "admin.llmConfig.models.requestsSent",
            "이번에 요청 {count}건을 보냈습니다.",
          ).replace("{count}", String(result.requestsSent));
      }

      // 모델 기본값은 하드코딩하지 않는다. 무료 모델에는 만료일이 붙어 있어(실측: expiration_date)
      // 박아 두면 곧 죽은 값이 되고 사용자는 원인 모를 실패를 만난다. 대신 방금 확인한 결과에서
      // 살아 있는 모델을 채운다. 이미 고른 모델이 지금 쓸 수 있으면 건드리지 않는다.
      const currentVerdict = verdictById.get(formData.modelName);
      const currentUnusable =
        !formData.modelName ||
        (currentVerdict && currentVerdict.availability !== "AVAILABLE");

      if (currentUnusable && availableModels.length > 0) {
        const picked = availableModels[0].id;
        setFormData((previous) => ({ ...previous, modelName: picked }));
        setModelInput(picked);
        notice +=
          " " +
          t(
            "admin.llmConfig.models.autoSelected",
            "모델을 {model} 로 채웠습니다. 다른 모델로 바꿀 수 있습니다.",
          ).replace("{model}", picked);
      }

      setModelsNotice(notice);
      if (results.length > 0) {
        setModelListOpen(true);
      }
    } catch (err) {
      setModelsError(err.message);
    } finally {
      setModelsProbing(false);
    }
  };

  /** 판정을 지워 다시 확인할 수 있게 한다. 목록 자체는 그대로 둔다. */
  const handleResetVerdicts = () => {
    setFreeModels((previous) =>
      previous.map((model) => ({
        ...model,
        availability: "UNKNOWN",
        availabilityMessage: null,
      })),
    );
    setModelsError(null);
    setModelsNotice(
      t(
        "admin.llmConfig.models.verdictsReset",
        "판정을 지웠습니다. 다시 확인할 수 있습니다.",
      ),
    );
  };

  /**
   * 회색 처리 대상.
   *
   * 계정 일일 한도(ACCOUNT_LIMIT)는 막지 않는다. 모델 탓이 아니라 계정 상태이므로 전부 회색이 되면
   * 아무것도 고를 수 없고 저장조차 못 한다. 대신 알림으로 사유를 알린다.
   * 아직 확인하지 않은 모델(UNKNOWN)도 고를 수 있게 둔다.
   */
  const isModelDisabled = (model) =>
    model.availability === "RATE_LIMITED" ||
    model.availability === "UNAVAILABLE";

  const handleTestDialogSettings = async () => {
    // 필수 필드 검증
    if (
      !formData.provider ||
      !formData.apiUrl ||
      !formData.apiKey ||
      !formData.modelName
    ) {
      setTestResult({
        success: false,
        message: t(
          "admin.llmConfig.message.allFieldsRequired",
          "모든 필수 필드를 입력해주세요",
        ),
      });
      return;
    }

    setTestingDialog(true);
    setTestResult(null);
    setSubmitError(null);
    try {
      await testUnsavedSettings(formData);
      setTestResult({
        success: true,
        message: t(
          "admin.llmConfig.message.connectionSuccess",
          "연결 테스트 성공!",
        ),
      });
    } catch (err) {
      setTestResult({
        success: false,
        message:
          err.serverMessage ||
          err.message ||
          t("admin.llmConfig.message.connectionFailed", "연결 테스트 실패"),
        // 서버에 암호화 키가 없어 막힌 경우에는 해결 안내를 함께 띄운다.
        needsEncryptionKey: isEncryptionKeyError(err),
      });
    } finally {
      setTestingDialog(false);
    }
  };

  // 템플릿 초기화
  const handleResetTemplate = () => {
    setFormData({ ...formData, testCaseTemplate: DEFAULT_TEST_CASE_TEMPLATE });
  };

  // 템플릿 JSON 다운로드
  const handleDownloadTemplate = () => {
    try {
      // JSON 유효성 검증
      JSON.parse(formData.testCaseTemplate);

      const blob = new Blob([formData.testCaseTemplate], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "test-case-template.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(
        t(
          "admin.llmConfig.message.invalidJson",
          "템플릿이 유효한 JSON 형식이 아닙니다",
        ) +
          ": " +
          error.message,
      );
    }
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    try {
      if (editingConfig) {
        await updateConfig(editingConfig.id, formData);
        if (onSuccess)
          onSuccess(
            t("admin.llmConfig.message.updated", "LLM 설정이 수정되었습니다"),
          );
      } else {
        await createConfig(formData);
        if (onSuccess)
          onSuccess(
            t("admin.llmConfig.message.created", "LLM 설정이 생성되었습니다"),
          );
      }
      handleCloseDialog();
    } catch (err) {
      setSubmitError({
        message:
          err.serverMessage ||
          err.message ||
          t("admin.llmConfig.message.saveFailed", "저장에 실패했습니다"),
        needsEncryptionKey: isEncryptionKeyError(err),
      });
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        t(
          "admin.llmConfig.message.confirmDelete",
          "정말 이 LLM 설정을 삭제하시겠습니까?",
        ),
      )
    ) {
      try {
        await deleteConfig(id);
        if (onSuccess)
          onSuccess(
            t("admin.llmConfig.message.deleted", "LLM 설정이 삭제되었습니다"),
          );
      } catch (err) {
        // 에러는 Context에서 처리됨
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultConfig(id);
      if (onSuccess)
        onSuccess(
          t(
            "admin.llmConfig.message.defaultChanged",
            "기본 LLM 설정이 변경되었습니다",
          ),
        );
    } catch (err) {
      // 에러는 Context에서 처리됨
    }
  };

  const handleTestConnection = async (id) => {
    setTestingId(id);
    try {
      await testConnection(id);
      if (onSuccess)
        onSuccess(
          t("admin.llmConfig.message.connectionSuccess", "연결 테스트 성공!"),
        );
    } catch (err) {
      // 에러는 Context에서 처리됨
    } finally {
      setTestingId(null);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await toggleActive(id);
      if (onSuccess)
        onSuccess(
          t(
            "admin.llmConfig.message.activeChanged",
            "LLM 설정 활성 상태가 변경되었습니다",
          ),
        );
    } catch (err) {
      // 에러는 Context에서 처리됨
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          {t("admin.llmConfig.addConfig", "LLM 설정 추가")}
        </Button>
      </Box>

      {loading && !testingId ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t("admin.llmConfig.name", "이름")}</TableCell>
                <TableCell>{t("admin.llmConfig.provider", "제공자")}</TableCell>
                <TableCell>{t("admin.llmConfig.model", "모델")}</TableCell>
                <TableCell>{t("admin.llmConfig.apiUrl", "API URL")}</TableCell>
                <TableCell align="center">
                  {t("admin.llmConfig.status", "상태")}
                </TableCell>
                <TableCell align="center">
                  {t("admin.llmConfig.default", "기본")}
                </TableCell>
                <TableCell align="center">
                  {t("admin.llmConfig.actions", "작업")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {configs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {t("admin.llmConfig.noConfigs", "LLM 설정이 없습니다")}
                  </TableCell>
                </TableRow>
              ) : (
                configs.map((config) => (
                  <TableRow
                    key={config.id}
                    sx={{
                      opacity: config.isActive ? 1 : 0.5,
                      bgcolor: config.isActive ? "inherit" : "action.hover",
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {config.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={config.provider}
                        size="small"
                        color={
                          config.provider === "OPENAI"
                            ? "primary"
                            : config.provider === "OLLAMA"
                              ? "success"
                              : config.provider === "OPENROUTER"
                                ? "info"
                                : "secondary"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {config.modelName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                        {config.apiUrl}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                      >
                        <Chip
                          icon={
                            config.isActive ? (
                              <CheckCircleIcon />
                            ) : (
                              <CancelIcon />
                            )
                          }
                          label={
                            config.isActive
                              ? t("admin.llmConfig.active", "활성")
                              : t("admin.llmConfig.inactive", "비활성")
                          }
                          size="small"
                          color={config.isActive ? "success" : "default"}
                        />
                        {config.connectionVerified !== null && (
                          <Tooltip
                            title={
                              config.lastConnectionError ||
                              t("admin.llmConfig.status.connected", "연결 성공")
                            }
                          >
                            <Chip
                              icon={
                                config.connectionVerified ? (
                                  <WifiIcon />
                                ) : (
                                  <WifiOffIcon />
                                )
                              }
                              label={
                                config.connectionVerified
                                  ? t("admin.llmConfig.connected", "연결됨")
                                  : t(
                                      "admin.llmConfig.connectionFailed",
                                      "연결 실패",
                                    )
                              }
                              size="small"
                              color={
                                config.connectionVerified ? "success" : "error"
                              }
                            />
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip
                        title={
                          config.isDefault
                            ? t(
                                "admin.llmConfig.defaultConfigCurrent",
                                "현재 기본 설정",
                              )
                            : t(
                                "admin.llmConfig.setAsDefaultTooltip",
                                "기본 설정으로 지정",
                              )
                        }
                      >
                        <span>
                          <IconButton
                            size="medium"
                            onClick={() => handleSetDefault(config.id)}
                            disabled={config.isDefault || !config.isActive}
                            sx={{
                              ...(config.isDefault && {
                                bgcolor: "warning.light",
                                "&:hover": { bgcolor: "warning.main" },
                                animation: "pulse 2s ease-in-out infinite",
                                "@keyframes pulse": {
                                  "0%, 100%": { transform: "scale(1)" },
                                  "50%": { transform: "scale(1.1)" },
                                },
                              }),
                            }}
                          >
                            {config.isDefault ? (
                              <StarIcon
                                sx={{ fontSize: 32, color: "warning.dark" }}
                              />
                            ) : (
                              <StarBorderIcon sx={{ fontSize: 28 }} />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center"
                      >
                        <Tooltip
                          title={t(
                            "admin.llmConfig.testConnection",
                            "연결 테스트",
                          )}
                        >
                          <span>
                            <IconButton
                              size="small"
                              onClick={() => handleTestConnection(config.id)}
                              disabled={testingId === config.id}
                            >
                              {testingId === config.id ? (
                                <CircularProgress size={20} />
                              ) : (
                                <WifiIcon />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip
                          title={
                            config.isActive
                              ? t("admin.llmConfig.deactivate", "비활성화")
                              : t("admin.llmConfig.activate", "활성화")
                          }
                        >
                          <IconButton
                            size="small"
                            onClick={() => handleToggleActive(config.id)}
                            color={config.isActive ? "success" : "default"}
                          >
                            {config.isActive ? (
                              <CheckCircleIcon />
                            ) : (
                              <CancelIcon />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t("common.edit", "수정")}>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(config)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t("common.delete", "삭제")}>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(config.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingConfig
            ? t("admin.llmConfig.editConfig", "LLM 설정 수정")
            : t("admin.llmConfig.createConfig", "LLM 설정 생성")}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label={t("admin.llmConfig.name", "이름")}
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              fullWidth
              required
            />

            <FormControl fullWidth required>
              <InputLabel>{t("admin.llmConfig.provider", "제공자")}</InputLabel>
              <Select
                value={formData.provider}
                onChange={(e) => handleProviderChange(e.target.value)}
                label={t("admin.llmConfig.provider", "제공자")}
              >
                {LLM_PROVIDER_ORDER.map((key) => (
                  <MenuItem key={key} value={key}>
                    {providerInfo(key).label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label={t("admin.llmConfig.apiUrl", "API URL")}
              value={formData.apiUrl}
              onChange={(e) =>
                setFormData({ ...formData, apiUrl: e.target.value })
              }
              fullWidth
              required
              placeholder={providerInfo(formData.provider).apiUrl}
              helperText={t(
                providerInfo(formData.provider).apiUrlHintKey,
                providerInfo(formData.provider).apiUrlHint,
              )}
            />

            <TextField
              label={t("admin.llmConfig.apiKey", "API Key")}
              type={showApiKey ? "text" : "password"}
              value={formData.apiKey}
              onChange={(e) =>
                setFormData({ ...formData, apiKey: e.target.value })
              }
              fullWidth
              required={!editingConfig}
              placeholder={
                editingConfig
                  ? t(
                      "admin.llmConfig.apiKeyPlaceholder",
                      "(변경하지 않으려면 비워두세요)",
                    )
                  : ""
              }
              slotProps={{
                input: {
                  endAdornment: (
                    <IconButton
                      onClick={() => setShowApiKey(!showApiKey)}
                      edge="end"
                    >
                      {showApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  ),
                },
              }}
            />

            {/*
              모델 입력란.

              OpenRouter 는 무료 모델이 자주 바뀌고 한도 소진 여부가 시시각각 달라진다. 그래서
              목록을 불러와 고르게 하고, 지금 쓸 수 없는 것은 회색으로 막는다. 다만 목록은
              무료 모델만 담으므로 유료 모델을 쓰려면 직접 입력해야 한다. 그래서 freeSolo 로
              두어 타이핑한 값도 그대로 받는다. 다른 제공자는 목록 API 가 없어 입력란만 쓴다.
            */}
            {modelCatalog ? (
              <LlmModelSelector
                freeModels={freeModels}
                modelName={formData.modelName}
                modelInput={modelInput}
                modelListOpen={modelListOpen}
                modelsLoading={modelsLoading}
                modelsProbing={modelsProbing}
                modelsNotice={modelsNotice}
                modelsError={modelsError}
                modelHintKey={providerInfo(formData.provider).modelHintKey}
                modelHint={providerInfo(formData.provider).modelHint}
                modelPlaceholder={
                  providerInfo(formData.provider).modelPlaceholder
                }
                pendingCheckCount={pendingCheckCount}
                checkedCount={checkedCount}
                isModelDisabled={isModelDisabled}
                onModelChange={(name) => {
                  setFormData((previous) => ({ ...previous, modelName: name }));
                  setModelInput(name);
                }}
                onInputChange={(input, typed) => {
                  setModelInput(input);
                  if (typed) {
                    setFormData((previous) => ({
                      ...previous,
                      modelName: input,
                    }));
                  }
                }}
                onOpenChange={setModelListOpen}
                onLoadModels={handleLoadFreeModels}
                onProbeOne={() => handleProbeModels("one")}
                onProbeAll={() => handleProbeModels("all")}
                onResetVerdicts={handleResetVerdicts}
              />
            ) : (
              <TextField
                label={t("admin.llmConfig.model", "모델 이름")}
                value={formData.modelName}
                onChange={(e) =>
                  setFormData({ ...formData, modelName: e.target.value })
                }
                fullWidth
                required
                placeholder={providerInfo(formData.provider).modelPlaceholder}
                helperText={t(
                  providerInfo(formData.provider).modelHintKey,
                  providerInfo(formData.provider).modelHint,
                )}
              />
            )}

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isDefault}
                  onChange={(e) =>
                    setFormData({ ...formData, isDefault: e.target.checked })
                  }
                />
              }
              label={t("admin.llmConfig.setAsDefault", "기본 설정으로 지정")}
            />

            {/* 테스트 케이스 템플릿 */}
            <Box>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                {t(
                  "admin.llmConfig.template.title",
                  "테스트 케이스 생성 템플릿 (JSON)",
                )}
                <Tooltip
                  title={t(
                    "admin.llmConfig.template.description",
                    "AI에게 테스트 케이스 생성을 요청할 때 이 템플릿을 참고합니다",
                  )}
                >
                  <Typography variant="caption" color="text.secondary">
                    ⓘ
                  </Typography>
                </Tooltip>
              </Typography>
              <TextField
                value={formData.testCaseTemplate}
                onChange={(e) =>
                  setFormData({ ...formData, testCaseTemplate: e.target.value })
                }
                fullWidth
                multiline
                rows={12}
                variant="outlined"
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                  "& .MuiInputBase-input": {
                    fontFamily: "monospace",
                  },
                }}
                placeholder={DEFAULT_TEST_CASE_TEMPLATE}
              />
              <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleResetTemplate}
                >
                  {t("admin.llmConfig.template.reset", "초기화")}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleDownloadTemplate}
                >
                  {t("admin.llmConfig.template.downloadJson", "JSON 다운로드")}
                </Button>
              </Box>
            </Box>

            {/* 테스트 연결 버튼 */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={
                  testingDialog ? <CircularProgress size={20} /> : <WifiIcon />
                }
                onClick={handleTestDialogSettings}
                disabled={
                  testingDialog ||
                  !formData.provider ||
                  !formData.apiUrl ||
                  !formData.apiKey ||
                  !formData.modelName
                }
                fullWidth
              >
                {t("admin.llmConfig.testConnection", "연결 테스트")}
              </Button>
            </Box>

            {/* 테스트 결과 표시 */}
            {testResult &&
              (testResult.success ? (
                <Alert severity="success" sx={{ mt: 1 }}>
                  {testResult.message}
                </Alert>
              ) : (
                // 실패 사유는 원인 사슬과 응답 본문이 이어 붙어 길다. 요약만 보이고 전문은 접는다.
                <ErrorDetailAlert
                  severity="error"
                  sx={{ mt: 1 }}
                  message={testResult.message}
                />
              ))}
            {submitError && (
              <ErrorDetailAlert
                severity="error"
                sx={{ mt: 1 }}
                message={submitError.message}
              />
            )}
            {(testResult?.needsEncryptionKey ||
              submitError?.needsEncryptionKey) && <EncryptionKeyHelp />}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {t("common.cancel", "취소")}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !formData.name ||
              !formData.apiUrl ||
              (!formData.apiKey && !editingConfig) ||
              !formData.modelName
            }
          >
            {editingConfig
              ? t("common.save", "저장")
              : t("common.create", "생성")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

LlmConfigList.propTypes = {
  onSuccess: PropTypes.func,
};

export default LlmConfigList;
