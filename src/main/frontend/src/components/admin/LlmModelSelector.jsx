// src/components/admin/LlmModelSelector.jsx
import React from "react";
import PropTypes from "prop-types";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  Download as DownloadIcon,
  PlaylistAddCheck as PlaylistAddCheckIcon,
} from "@mui/icons-material";
import { useI18n } from "../../context/I18nContext.jsx";
import ErrorDetailAlert from "../common/ErrorDetailAlert.jsx";

/**
 * 모델 목록 선택기.
 *
 * 목록을 내주는 제공자(OpenRouter·NVIDIA)에서만 쓴다. 목록이 없는 제공자는 부모가 이 컴포넌트
 * 대신 입력란만 띄운다.
 *
 * ## 목록이면서 자유 입력인 이유
 *
 * 목록에는 그 제공자가 알려 주는 모델만 담긴다. OpenRouter 목록은 무료 모델뿐이라 유료 모델을
 * 쓰려면 직접 입력해야 한다. 그래서 freeSolo 로 두어 타이핑한 값도 그대로 받는다.
 *
 * ## 확인 버튼이 둘인 이유
 *
 * 확인 한 번이 제공자의 요청 한도를 그만큼 쓴다. OpenRouter 는 무료 일일 한도가 50건이고 무료
 * 모델이 20개라 전수 확인 한 번이 하루치의 40% 다. 실제로 쓸 모델은 하나이므로 그 하나만
 * 확인하는 것을 기본으로 둔다.
 *
 * NVIDIA 는 반대다. 목록의 3분의 2가 계정에 없어 404 를 내므로 확인이 사실상 필수이고, 대신
 * 한도 부담이 없다. 그 차이는 서버가 알려 주고 부모가 안내 문구를 정한다.
 */
function LlmModelSelector({
  freeModels,
  modelName,
  modelInput,
  modelListOpen,
  modelsLoading,
  modelsProbing,
  probeProgress,
  modelsNotice,
  modelsError,
  modelHintKey,
  modelHint,
  modelPlaceholder,
  pendingCheckCount,
  checkedCount,
  isModelDisabled,
  onModelChange,
  onInputChange,
  onOpenChange,
  onLoadModels,
  onProbeOne,
  onProbeAll,
  onResetVerdicts,
}) {
  const { t } = useI18n();

  return (
    <Box>
      <Autocomplete
        freeSolo
        // freeSolo 는 기본적으로 드롭다운 화살표를 감추고 입력이 있을 때만 목록을 연다.
        // 그러면 목록을 받아 놓고도 펼칠 방법이 없다. 화살표를 강제로 띄우고 포커스에도
        // 열리게 해서, 타이핑 없이 목록만 보고 고를 수 있게 한다.
        forcePopupIcon
        openOnFocus
        selectOnFocus
        handleHomeEndKeys
        open={modelListOpen}
        onOpen={() => onOpenChange(true)}
        onClose={() => onOpenChange(false)}
        loading={modelsLoading || modelsProbing}
        loadingText={t("admin.llmConfig.models.loading", "불러오는 중…")}
        noOptionsText={
          freeModels.length === 0
            ? t(
                "admin.llmConfig.models.emptyList",
                "'무료 모델 목록 불러오기' 를 먼저 눌러 주세요.",
              )
            : t("admin.llmConfig.models.noMatch", "일치하는 모델이 없습니다.")
        }
        options={freeModels}
        value={modelName}
        inputValue={modelInput}
        isOptionEqualToValue={(option, value) =>
          (typeof option === "string" ? option : option.id) ===
          (typeof value === "string" ? value : value?.id)
        }
        getOptionLabel={(option) =>
          typeof option === "string" ? option : option.id
        }
        getOptionDisabled={(option) =>
          typeof option === "string" ? false : isModelDisabled(option)
        }
        filterOptions={(options, state) => {
          // 이미 고른 값이 입력란에 그대로 들어 있는 상태에서 걸러내면 목록이 한 줄로
          // 좁아져 다른 모델로 바꿀 수 없다. 실제로 타이핑한 경우만 걸러낸다.
          const keyword = state.inputValue.trim().toLowerCase();
          if (!keyword || state.inputValue === modelName) {
            return options;
          }
          return options.filter((option) =>
            option.id.toLowerCase().includes(keyword),
          );
        }}
        onChange={(event, newValue) => {
          const modelName =
            typeof newValue === "string" ? newValue : newValue?.id || "";
          onModelChange(modelName);
        }}
        onInputChange={(event, newInput, reason) => {
          // 목록에서 고른 경우는 onChange 가 이미 처리했다.
          onInputChange(newInput, reason === "input");
        }}
        renderOption={(props, option) => {
          const disabled = isModelDisabled(option);
          const context = [];
          if (option.contextLength) {
            context.push(
              `${Math.round(option.contextLength / 1000)}K 컨텍스트`,
            );
          }
          if (option.expirationDate) {
            context.push(`${option.expirationDate} 까지`);
          }
          return (
            <li {...props} key={option.id}>
              <ListItemText
                primary={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      flexWrap: "wrap",
                    }}
                  >
                    <span>{option.id}</span>
                    {option.availability === "AVAILABLE" && (
                      <Chip
                        size="small"
                        color="success"
                        variant="outlined"
                        label={t(
                          "admin.llmConfig.models.available",
                          "사용 가능",
                        )}
                      />
                    )}
                    {option.availability === "RATE_LIMITED" && (
                      <Chip
                        size="small"
                        color="warning"
                        variant="outlined"
                        label={t(
                          "admin.llmConfig.models.rateLimited",
                          "한도 소진",
                        )}
                      />
                    )}
                    {option.availability === "ACCOUNT_LIMIT" && (
                      <Chip
                        size="small"
                        color="warning"
                        variant="outlined"
                        label={t(
                          "admin.llmConfig.models.accountLimitBadge",
                          "계정 한도",
                        )}
                      />
                    )}
                    {option.availability === "UNAVAILABLE" && (
                      <Chip
                        size="small"
                        variant="outlined"
                        label={t(
                          "admin.llmConfig.models.unavailable",
                          "사용 불가",
                        )}
                      />
                    )}
                  </Box>
                }
                secondary={
                  (disabled || option.availability === "ACCOUNT_LIMIT") &&
                  option.availabilityMessage
                    ? option.availabilityMessage
                    : context.join(" · ")
                }
              />
            </li>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label={t("admin.llmConfig.model", "모델 이름")}
            required
            placeholder={modelPlaceholder}
            // 옛 키(modelHelperOpenrouter)는 DB 에 이전 문구가 이미 들어 있고
            // 시드가 기존 값을 덮지 않는다. 새 키로 옮겨 새 문구가 뜨게 한다.
            helperText={t(modelHintKey, modelHint)}
          />
        )}
      />

      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={
            modelsLoading ? <CircularProgress size={16} /> : <DownloadIcon />
          }
          onClick={onLoadModels}
          disabled={modelsLoading || modelsProbing}
        >
          {t("admin.llmConfig.models.loadButton", "무료 모델 목록 불러오기")}
        </Button>
        {/*
          확인을 둘로 나눈다. 확인 한 번이 무료 일일 한도를 그만큼 쓰기 때문이다
          (실측 한도 50건, 무료 모델 20개 → 전수 확인이 하루치의 40%).
          쓸 모델은 하나이므로 기본은 그 하나만 확인한다.
        */}
        <Tooltip
          title={t(
            "admin.llmConfig.models.probeOneTooltip",
            "지금 고른 모델에만 최소 요청을 보냅니다. 무료 한도 1건을 사용합니다.",
          )}
        >
          <span>
            <Button
              size="small"
              variant="outlined"
              startIcon={
                modelsProbing ? (
                  <CircularProgress size={16} />
                ) : (
                  <PlaylistAddCheckIcon />
                )
              }
              onClick={onProbeOne}
              disabled={modelsLoading || modelsProbing || !modelName}
            >
              {t("admin.llmConfig.models.probeOneButton", "이 모델 확인")}
            </Button>
          </span>
        </Tooltip>
        <Tooltip
          title={t(
            "admin.llmConfig.models.probeAllTooltip",
            "목록의 모든 모델을 확인합니다. 모델 수만큼 무료 한도를 사용하므로 누르기 전에 다시 묻습니다.",
          )}
        >
          <span>
            <Button
              size="small"
              variant="text"
              onClick={onProbeAll}
              disabled={
                modelsLoading || modelsProbing || pendingCheckCount === 0
              }
            >
              {modelsProbing && probeProgress
                ? t(
                    "admin.llmConfig.models.probeProgress",
                    "확인 중 {done} / {total}",
                  )
                    .replace("{done}", String(probeProgress.done))
                    .replace("{total}", String(probeProgress.total))
                : t(
                    "admin.llmConfig.models.probeAllButton",
                    "전수 확인 ({count}건)",
                  ).replace("{count}", String(pendingCheckCount))}
            </Button>
          </span>
        </Tooltip>
        {checkedCount > 0 && (
          <Button
            size="small"
            variant="text"
            color="inherit"
            onClick={onResetVerdicts}
            disabled={modelsProbing}
          >
            {t("admin.llmConfig.models.resetVerdicts", "판정 초기화")}
          </Button>
        )}
      </Stack>

      {modelsNotice && (
        <Alert severity="info" sx={{ mt: 1 }}>
          {modelsNotice}
        </Alert>
      )}
      {modelsError && (
        <ErrorDetailAlert
          severity="error"
          sx={{ mt: 1 }}
          message={modelsError}
        />
      )}
    </Box>
  );
}

LlmModelSelector.propTypes = {
  /** 고를 수 있는 모델 목록. 판정 결과가 함께 담겨 있다. */
  freeModels: PropTypes.array.isRequired,
  /** 지금 고른 모델. 목록에 없는 값(유료 모델)일 수도 있다. */
  modelName: PropTypes.string,
  /** 입력란에 보이는 문자열. 타이핑 중에는 modelName 과 다를 수 있다. */
  modelInput: PropTypes.string,
  modelListOpen: PropTypes.bool,
  modelsLoading: PropTypes.bool,
  modelsProbing: PropTypes.bool,
  probeProgress: PropTypes.shape({
    done: PropTypes.number,
    total: PropTypes.number,
  }),
  modelsNotice: PropTypes.string,
  modelsError: PropTypes.string,
  /** 모델 칸 도움말. 제공자 표에서 온다. */
  modelHintKey: PropTypes.string,
  modelHint: PropTypes.string,
  modelPlaceholder: PropTypes.string,
  /** 아직 확인하지 않은 모델 수. 전수 확인 버튼에 표시한다. */
  pendingCheckCount: PropTypes.number,
  /** 이미 판정한 모델 수. 판정 초기화 버튼을 띄울지 정한다. */
  checkedCount: PropTypes.number,
  isModelDisabled: PropTypes.func.isRequired,
  onModelChange: PropTypes.func.isRequired,
  /** (입력값, 사용자가 타이핑한 것인지) */
  onInputChange: PropTypes.func.isRequired,
  onOpenChange: PropTypes.func.isRequired,
  onLoadModels: PropTypes.func.isRequired,
  onProbeOne: PropTypes.func.isRequired,
  onProbeAll: PropTypes.func.isRequired,
  onResetVerdicts: PropTypes.func.isRequired,
};

export default LlmModelSelector;
