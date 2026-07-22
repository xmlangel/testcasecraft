import React from "react";
import PropTypes from "prop-types";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Autocomplete,
  Chip,
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  AutoAwesome as AutoAwesomeIcon,
} from "@mui/icons-material";
import MarkdownFieldEditor from "./MarkdownFieldEditor.jsx";

/**
 * Priority 값을 정규화 (Medium → MEDIUM, High → HIGH, Low → LOW)
 */
const normalizePriority = (priority) => {
  if (!priority) return "MEDIUM";
  const upper = priority.toUpperCase();
  if (["HIGH", "MEDIUM", "LOW"].includes(upper)) {
    return upper;
  }
  return "MEDIUM";
};

/**
 * 테스트케이스 기본 정보 아코디언 컴포넌트
 */
const TestCaseBasicInfo = ({
  testCase,
  errors,
  availableTags,
  linkedDocuments,
  ragDocuments,
  testCaseInfoOpen,
  setTestCaseInfoOpen,
  isViewer,
  t,
  theme,
  onChange,
  onTestCaseChange,
  onTagChange,
  onLinkedDocumentsChange,
  linkedTestCases = [],
  testCaseOptions = [],
  onLinkedTestCasesChange = () => {},
  linkedJunitCases = [],
  junitCaseOptions = [],
  onLinkedJunitCasesChange = () => {},
  onJunitSearchChange = () => {},
  junitLoading = false,
  onMarkdownPaste,
  onAiGenerate = () => {},
  isAiGenerating = false,
  isLlmAvailable = false,
  autoAiMode = false,
  onAutoAiModeChange = () => {},
  visibility = {},
}) => {
  // 기본은 표시 (visibility 가 비어 있거나 미정의 필드는 true)
  const isVisible = (key) => visibility[key] !== false;
  return (
    <Accordion
      expanded={testCaseInfoOpen}
      onChange={() => setTestCaseInfoOpen((v) => !v)}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle2">
          {t("testcase.info.title", "테스트케이스 정보")}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        {/* Name 필드 + AI 생성 버튼 */}
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
          <TextField
            label={t("testcase.form.name", "이름")}
            value={testCase.name || ""}
            onChange={onChange("name")}
            fullWidth
            margin="normal"
            variant="outlined"
            error={!!errors.name}
            placeholder={t("testcase.form.testcaseName", "테스트케이스 이름")}
            helperText={errors.name}
            disabled={isViewer}
            slotProps={{ htmlInput: { "data-testid": "testcase-name-input" } }}
          />

          {/* AI 자동 생성 버튼 - LLM이 활성화되어 있고 VIEWER가 아닌 경우만 표시 */}
          {!isViewer && isLlmAvailable && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mt: 1,
                gap: 0.5,
              }}
            >
              <Tooltip
                title={
                  isAiGenerating
                    ? t("testcase.ai.generating", "AI 생성 중...")
                    : t(
                        "testcase.ai.generateTooltip",
                        "AI로 Name/Description 자동 생성",
                      )
                }
              >
                <span>
                  <IconButton
                    id="ai-generate-meta-button"
                    onClick={onAiGenerate}
                    disabled={isAiGenerating}
                    size="medium"
                    sx={{
                      mt: 1,
                      background: isAiGenerating
                        ? "transparent"
                        : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary?.main || "#9c27b0"} 100%)`,
                      color: isAiGenerating
                        ? theme.palette.text.disabled
                        : "#fff",
                      borderRadius: 2,
                      px: 1.5,
                      py: 1,
                      boxShadow: isAiGenerating ? "none" : 2,
                      "&:hover": {
                        opacity: 0.9,
                        boxShadow: 4,
                      },
                      transition: "all 0.2s ease",
                      minWidth: 48,
                    }}
                  >
                    {isAiGenerating ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <AutoAwesomeIcon fontSize="small" />
                    )}
                  </IconButton>
                </span>
              </Tooltip>

              {/* 자동/수동 모드 토글 */}
              <Tooltip
                title={
                  autoAiMode
                    ? t(
                        "testcase.ai.autoMode.on",
                        "자동 생성 ON - 스텝 입력 시 자동으로 Name/Description 생성",
                      )
                    : t(
                        "testcase.ai.autoMode.off",
                        "자동 생성 OFF - 버튼을 눌러 수동 생성",
                      )
                }
              >
                <Switch
                  id="ai-auto-mode-toggle"
                  size="small"
                  checked={autoAiMode}
                  onChange={(e) => onAutoAiModeChange(e.target.checked)}
                  color="secondary"
                  sx={{ transform: "scale(0.8)" }}
                />
              </Tooltip>
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.6rem",
                  color: theme.palette.text.secondary,
                  textAlign: "center",
                  lineHeight: 1.2,
                }}
              >
                {autoAiMode
                  ? t("testcase.ai.autoLabel", "자동")
                  : t("testcase.ai.manualLabel", "수동")}
              </Typography>
            </Box>
          )}
        </Box>

        {isVisible("description") && (
          <MarkdownFieldEditor
            label={t("testcase.form.description", "설명")}
            value={testCase.description || ""}
            placeholder={t(
              "testcase.form.testcaseDescription",
              "테스트케이스 설명",
            )}
            height={120}
            isViewer={isViewer}
            theme={theme}
            t={t}
            onChange={(value) => onTestCaseChange("description", value)}
            onPaste={(event) =>
              onMarkdownPaste(event, { type: "field", field: "description" })
            }
            testid="testcase-description-input"
          />
        )}

        {isVisible("preCondition") && (
          <MarkdownFieldEditor
            label={t("testcase.form.preCondition", "사전 조건")}
            value={testCase.preCondition || ""}
            placeholder={t(
              "testcase.form.preConditionPlaceholder",
              "사전 조건",
            )}
            height={90}
            isViewer={isViewer}
            theme={theme}
            t={t}
            onChange={(value) => onTestCaseChange("preCondition", value)}
            onPaste={(event) =>
              onMarkdownPaste(event, { type: "field", field: "preCondition" })
            }
            testid="testcase-precondition-input"
          />
        )}

        {isVisible("postCondition") && (
          <MarkdownFieldEditor
            label={t("testcase.form.postCondition", "사후 조건")}
            value={testCase.postCondition || ""}
            placeholder={t(
              "testcase.form.postConditionPlaceholder",
              "테스트 종료 후 기대 상태를 입력하세요.",
            )}
            height={90}
            isViewer={isViewer}
            theme={theme}
            t={t}
            onChange={(value) => onTestCaseChange("postCondition", value)}
            onPaste={(event) =>
              onMarkdownPaste(event, { type: "field", field: "postCondition" })
            }
          />
        )}

        {isVisible("isAutomated") && (
          <FormControlLabel
            control={
              <Switch
                checked={Boolean(testCase.isAutomated)}
                onChange={(event) => {
                  if (isViewer) return;
                  const { checked } = event.target;
                  onTestCaseChange("isAutomated", checked, true);
                }}
                color="primary"
                disabled={isViewer}
              />
            }
            sx={{ mt: 2 }}
            label={t("testcase.form.isAutomated", "자동화 여부")}
          />
        )}

        {isVisible("executionType") && (
          <FormControl fullWidth margin="normal" disabled={isViewer}>
            <InputLabel id="execution-type-select-label">
              {t("testcase.form.executionType", "Manual/Automation")}
            </InputLabel>
            <Select
              labelId="execution-type-select-label"
              value={
                testCase.executionType ||
                (testCase.isAutomated ? "Automation" : "Manual")
              }
              label={t("testcase.form.executionType", "Manual/Automation")}
              onChange={(event) => {
                onTestCaseChange("executionType", event.target.value, false);
              }}
            >
              <MenuItem value="Manual">
                {t("testcase.executionType.manual", "Manual")}
              </MenuItem>
              <MenuItem value="Automation">
                {t("testcase.executionType.automation", "Automation")}
              </MenuItem>
              <MenuItem value="Hybrid">
                {t("testcase.executionType.hybrid", "Hybrid")}
              </MenuItem>
            </Select>
          </FormControl>
        )}

        {isVisible("testTechnique") && (
          <TextField
            label={t("testcase.form.testTechnique", "테스트 기법")}
            value={testCase.testTechnique || ""}
            onChange={onChange("testTechnique")}
            fullWidth
            margin="normal"
            variant="outlined"
            disabled={isViewer}
            placeholder={t(
              "testcase.form.testTechniquePlaceholder",
              "예: 경계값 분석, 의사결정 테이블 등",
            )}
          />
        )}

        {isVisible("priority") && (
          <FormControl fullWidth margin="normal" disabled={isViewer}>
            <InputLabel id="priority-select-label">
              {t("testcase.form.priority", "우선순위")}
            </InputLabel>
            <Select
              labelId="priority-select-label"
              value={normalizePriority(testCase.priority)}
              label={t("testcase.form.priority", "우선순위")}
              onChange={onChange("priority")}
            >
              <MenuItem value="HIGH">
                {t("testcase.priority.high", "높음")}
              </MenuItem>
              <MenuItem value="MEDIUM">
                {t("testcase.priority.medium", "보통")}
              </MenuItem>
              <MenuItem value="LOW">
                {t("testcase.priority.low", "낮음")}
              </MenuItem>
            </Select>
          </FormControl>
        )}

        {isVisible("tags") && (
          <Autocomplete
            multiple
            freeSolo
            options={availableTags}
            value={testCase.tags || []}
            onChange={(event, newValue) => onTagChange(newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });
                return (
                  <Chip
                    key={key}
                    variant="outlined"
                    label={option}
                    {...tagProps}
                    disabled={isViewer}
                  />
                );
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label={t("testcase.form.tags", "태그")}
                placeholder={t(
                  "testcase.form.tagsPlaceholder",
                  "태그를 입력하고 Enter를 누르세요",
                )}
                helperText={t(
                  "testcase.helper.tags",
                  "여러 태그를 입력할 수 있습니다",
                )}
                margin="normal"
              />
            )}
            disabled={isViewer}
          />
        )}

        {isVisible("linkedDocuments") && (
          <Autocomplete
            multiple
            options={ragDocuments}
            value={linkedDocuments}
            onChange={(event, newValue) => onLinkedDocumentsChange(newValue)}
            getOptionLabel={(option) => option.fileName || ""}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(props, option) => {
              const { key, ...optionProps } = props;
              return (
                <li key={option.id} {...optionProps}>
                  {option.fileName}
                </li>
              );
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });
                return (
                  <Chip
                    key={option.id || index}
                    variant="outlined"
                    label={option.fileName}
                    {...tagProps}
                    disabled={isViewer}
                  />
                );
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label={t("testcase.form.linkedDocuments", "연결된 RAG 문서")}
                placeholder={t(
                  "testcase.form.linkedDocumentsPlaceholder",
                  "RAG 문서를 선택하세요",
                )}
                helperText={t(
                  "testcase.helper.linkedDocuments",
                  "RAG 문서를 연결하면 AI가 참고할 수 있습니다",
                )}
                margin="normal"
              />
            )}
            disabled={isViewer}
          />
        )}

        {/* 자동화 여부 체크 시에만 노출 — 연결된 테스트케이스 / JUnit 자동화 케이스 */}
        {Boolean(testCase.isAutomated) && isVisible("linkedTestCases") && (
          <Autocomplete
            multiple
            options={testCaseOptions}
            value={linkedTestCases}
            onChange={(event, newValue) => onLinkedTestCasesChange(newValue)}
            getOptionLabel={(option) =>
              option.displayId
                ? `${option.displayId} · ${option.name}`
                : option.name || option.id || ""
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(props, option) => {
              const { key, ...optionProps } = props;
              return (
                <li key={option.id} {...optionProps}>
                  {option.displayId
                    ? `${option.displayId} · ${option.name}`
                    : option.name}
                </li>
              );
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });
                return (
                  <Chip
                    key={option.id || index}
                    variant="outlined"
                    label={
                      option.displayId
                        ? `${option.displayId} · ${option.name}`
                        : option.name || option.id
                    }
                    {...tagProps}
                    disabled={isViewer}
                  />
                );
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label={t(
                  "testcase.form.linkedTestCases",
                  "연결된 테스트케이스",
                )}
                placeholder={t(
                  "testcase.form.linkedTestCasesPlaceholder",
                  "연결할 테스트케이스를 선택하세요",
                )}
                helperText={t(
                  "testcase.helper.linkedTestCases",
                  "이 자동화 케이스와 연관된 다른 테스트케이스를 연결합니다",
                )}
                margin="normal"
              />
            )}
            disabled={isViewer}
          />
        )}

        {Boolean(testCase.isAutomated) && isVisible("linkedJunitCases") && (
          <Autocomplete
            multiple
            options={junitCaseOptions}
            value={linkedJunitCases}
            loading={junitLoading}
            filterOptions={(x) => x}
            onChange={(event, newValue) => onLinkedJunitCasesChange(newValue)}
            onInputChange={(event, newInput, reason) => {
              if (reason === "input") onJunitSearchChange(newInput);
            }}
            getOptionLabel={(option) =>
              option.className
                ? `${option.className}.${option.name}`
                : option.displayTitle || option.name || option.id || ""
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(props, option) => {
              const { key, ...optionProps } = props;
              return (
                <li key={option.id} {...optionProps}>
                  {option.className
                    ? `${option.className}.${option.name}`
                    : option.name}
                  {option.status ? ` [${option.status}]` : ""}
                </li>
              );
            }}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });
                return (
                  <Chip
                    key={option.id || index}
                    variant="outlined"
                    label={
                      option.className
                        ? `${option.className}.${option.name}`
                        : option.name || option.id
                    }
                    {...tagProps}
                    disabled={isViewer}
                  />
                );
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                label={t(
                  "testcase.form.linkedJunitCases",
                  "연결된 자동화(JUnit) 케이스",
                )}
                placeholder={t(
                  "testcase.form.linkedJunitCasesPlaceholder",
                  "자동화 JUnit 케이스를 검색·선택하세요",
                )}
                helperText={t(
                  "testcase.helper.linkedJunitCases",
                  "이 테스트케이스를 자동화한 실제 JUnit 케이스를 연결합니다 (동일 XML 재업로드 시 다시 연결 필요)",
                )}
                margin="normal"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {junitLoading ? (
                        <CircularProgress color="inherit" size={18} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            disabled={isViewer}
          />
        )}
      </AccordionDetails>
    </Accordion>
  );
};

TestCaseBasicInfo.propTypes = {
  testCase: PropTypes.object.isRequired,
  errors: PropTypes.object,
  availableTags: PropTypes.array,
  linkedDocuments: PropTypes.array,
  ragDocuments: PropTypes.array,
  testCaseInfoOpen: PropTypes.bool.isRequired,
  setTestCaseInfoOpen: PropTypes.func.isRequired,
  visibility: PropTypes.object,
  isViewer: PropTypes.bool,
  t: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onTestCaseChange: PropTypes.func.isRequired,
  onTagChange: PropTypes.func.isRequired,
  onLinkedDocumentsChange: PropTypes.func.isRequired,
  linkedTestCases: PropTypes.array,
  testCaseOptions: PropTypes.array,
  onLinkedTestCasesChange: PropTypes.func,
  linkedJunitCases: PropTypes.array,
  junitCaseOptions: PropTypes.array,
  onLinkedJunitCasesChange: PropTypes.func,
  onJunitSearchChange: PropTypes.func,
  junitLoading: PropTypes.bool,
  onMarkdownPaste: PropTypes.func.isRequired,
  onAiGenerate: PropTypes.func,
  isAiGenerating: PropTypes.bool,
  isLlmAvailable: PropTypes.bool,
  autoAiMode: PropTypes.bool,
  onAutoAiModeChange: PropTypes.func,
};

export default TestCaseBasicInfo;
