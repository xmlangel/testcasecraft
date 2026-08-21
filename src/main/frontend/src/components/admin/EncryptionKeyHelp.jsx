// src/components/admin/EncryptionKeyHelp.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Collapse,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ContentCopy as ContentCopyIcon,
  Check as CheckIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { useI18n } from "../../context/I18nContext";
import { copyToClipboard } from "../../utils/clipboardUtils";
import {
  ENCRYPTION_KEY_ENV_VAR,
  ENCRYPTION_KEY_GENERATE_COMMAND,
} from "../../constants/errorCodes";

/** 명령·환경변수처럼 그대로 입력해야 하는 값은 복사 버튼과 함께 고정폭으로 보여 준다. */
const CopyableCode = ({ value, copyLabel, copiedLabel }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(value);
    if (!ok) return;
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        mt: 0.5,
        px: 1,
        py: 0.5,
        borderRadius: 1,
        bgcolor: "action.hover",
        overflowX: "auto",
      }}
    >
      <Typography
        component="code"
        sx={{
          fontFamily: "monospace",
          fontSize: "0.85rem",
          whiteSpace: "nowrap",
          flexGrow: 1,
        }}
      >
        {value}
      </Typography>
      <Tooltip title={copied ? copiedLabel : copyLabel}>
        <IconButton size="small" onClick={handleCopy} aria-label={copyLabel}>
          {copied ? (
            <CheckIcon fontSize="small" color="success" />
          ) : (
            <ContentCopyIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
};

CopyableCode.propTypes = {
  value: PropTypes.string.isRequired,
  copyLabel: PropTypes.string.isRequired,
  copiedLabel: PropTypes.string.isRequired,
};

/**
 * 서버에 암호화 키가 없어 LLM 설정 저장·연결 테스트가 막혔을 때, 관리자가 무엇을 하면 되는지 보여 준다.
 *
 * 표시 여부는 호출부가 정한다(errorCodes.isEncryptionKeyError 로 판정).
 * 기본은 접힌 상태이며, 펼치면 키 생성 명령과 환경변수 이름을 복사할 수 있다.
 */
const EncryptionKeyHelp = ({ defaultExpanded }) => {
  const { t } = useI18n();
  const [expanded, setExpanded] = useState(Boolean(defaultExpanded));

  const copyLabel = t("admin.llmConfig.help.encryptionKey.copyCommand", "복사");
  const copiedLabel = t(
    "admin.llmConfig.help.encryptionKey.copied",
    "복사했습니다",
  );

  const steps = [
    {
      text: t(
        "admin.llmConfig.help.encryptionKey.step1",
        "서버에서 아래 명령으로 키를 만듭니다. AES-256 을 쓰므로 32바이트여야 합니다.",
      ),
      code: ENCRYPTION_KEY_GENERATE_COMMAND,
    },
    {
      text: t(
        "admin.llmConfig.help.encryptionKey.step2",
        "만든 값을 서버 환경변수에 지정합니다. Docker Compose 로 운영한다면 .env 파일과 docker-compose.yml 의 environment 목록 양쪽에 넣어야 컨테이너까지 전달됩니다.",
      ),
      code: `${ENCRYPTION_KEY_ENV_VAR}=<paste-generated-key-here>`,
    },
    {
      text: t(
        "admin.llmConfig.help.encryptionKey.step3",
        "애플리케이션을 다시 시작한 뒤 이 화면에서 연결 테스트를 다시 실행합니다.",
      ),
      code: null,
    },
  ];

  return (
    <Alert severity="warning" sx={{ mt: 1 }}>
      <AlertTitle>
        {t(
          "admin.llmConfig.help.encryptionKey.title",
          "서버에 암호화 키가 설정되어 있지 않습니다",
        )}
      </AlertTitle>

      <Typography variant="body2">
        {t(
          "admin.llmConfig.help.encryptionKey.intro",
          "API Key 는 서버에 저장하기 전에 암호화합니다. 암호화 키가 없으면 설정 저장과 연결 테스트를 할 수 없습니다. 서버 관리자가 다음 순서로 설정하면 해결됩니다.",
        )}
      </Typography>

      <Button
        size="small"
        onClick={() => setExpanded((prev) => !prev)}
        endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        sx={{ mt: 1, px: 0 }}
      >
        {expanded
          ? t("admin.llmConfig.help.encryptionKey.hideGuide", "해결 방법 접기")
          : t("admin.llmConfig.help.encryptionKey.showGuide", "해결 방법 보기")}
      </Button>

      <Collapse in={expanded} unmountOnExit>
        <Stack spacing={1.5} sx={{ mt: 1 }}>
          {steps.map((step, index) => (
            <Box key={step.text}>
              <Typography variant="body2">
                {index + 1}. {step.text}
              </Typography>
              {step.code && (
                <CopyableCode
                  value={step.code}
                  copyLabel={copyLabel}
                  copiedLabel={copiedLabel}
                />
              )}
            </Box>
          ))}

          <Typography variant="body2" color="error">
            {t(
              "admin.llmConfig.help.encryptionKey.warning",
              "이미 저장해 둔 API Key 나 JIRA 토큰이 있다면 키를 바꾼 뒤에는 복호화할 수 없어 다시 입력해야 합니다. 키는 분실하지 않도록 따로 보관하세요.",
            )}
          </Typography>
        </Stack>
      </Collapse>
    </Alert>
  );
};

EncryptionKeyHelp.propTypes = {
  /** 처음부터 펼쳐서 보여줄지 여부 (기본: 접힘) */
  defaultExpanded: PropTypes.bool,
};

EncryptionKeyHelp.defaultProps = {
  defaultExpanded: false,
};

export default EncryptionKeyHelp;
