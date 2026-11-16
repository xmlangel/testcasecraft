import React from "react";
import PropTypes from "prop-types";
import {
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Autocomplete,
  Chip,
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  AutoAwesome as AutoAwesomeIcon,
  ExpandMore as ExpandMoreIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import MarkdownFieldEditor from "./MarkdownFieldEditor.jsx";
import {
  isAutomatedCase,
  normalizeExecutionType,
} from "../../utils/executionType.js";

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

// 상세 칸이 이 폭 이상이면 2열 격자로 둔다. 1600px 3단의 상세 칸(약 700px)은 2열,
// 2단·1단 겹침처럼 좁은 칸은 1열이다.
export const INFO_GRID_TWO_COLUMN_MIN_WIDTH = 520;

/**
 * 테스트케이스 기본 정보(ICT-494 tl-3 → ICT-495 cl-4: 상단 세 줄 압축)
 */
const TestCaseBasicInfo = ({
  testCase,
  errors,
  availableTags,
  linkedDocuments,
  ragDocuments,
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
  onOpenLinkedTestCase = () => {},
  linkedByTestCases = [],
  linkedJunitCases = [],
  junitCaseOptions = [],
  onLinkedJunitCasesChange = () => {},
  onOpenLinkedJunitCase = () => {},
  onJunitSearchChange = () => {},
  junitLoading = false,
  onMarkdownPaste,
  onAiGenerate = () => {},
  isAiGenerating = false,
  isLlmAvailable = false,
  autoAiMode = false,
  onAutoAiModeChange = () => {},
  visibility = {},
  metadataSlot = null,
}) => {
  // 기본은 표시 (visibility 가 비어 있거나 미정의 필드는 true)
  const isVisible = (key) => visibility[key] !== false;
  const automated = isAutomatedCase(testCase);
  // ICT-494 tl-6: 태그·RAG 문서·연결 케이스·JUnit 은 「연결 항목」 하나로 접어 둔다.
  // 머리 줄에는 보이는 칸의 개수만 적는다. 연결 케이스·JUnit 은 자동화 케이스일 때만 센다.
  const linkSummary = [
    isVisible("tags") && {
      key: "tags",
      label: t("testcase.form.linkSummary.tags", "태그"),
      count: (testCase.tags || []).length,
    },
    isVisible("linkedDocuments") && {
      key: "rag",
      label: t("testcase.form.linkSummary.rag", "RAG"),
      count: linkedDocuments.length,
    },
    automated &&
      isVisible("linkedTestCases") && {
        key: "linkedTestCases",
        label: t("testcase.form.linkSummary.linkedTestCases", "연결 케이스"),
        count: linkedTestCases.length,
      },
    automated &&
      isVisible("linkedJunitCases") && {
        key: "junit",
        label: t("testcase.form.linkSummary.junit", "JUnit"),
        count: linkedJunitCases.length,
      },
  ].filter(Boolean);
  const hasLinkSection = linkSummary.length > 0 || linkedByTestCases.length > 0;
  return (
    // ICT-495 cl-4: 이름 / 설명 다음 상단을 세 줄로 줄였다.
    //   1) 실행 유형 · 우선순위 · 테스트 기법(작은 입력칸, 좁으면 줄바꿈)
    //   2) 연결 항목(접힘)
    //   3) 소유자 · Parent · 순서 · 수정자 · 식별 정보 한 줄 요약
    // → 전제 조건·사후 조건. 단계는 이 아래(TestCaseForm).
    <Box
      data-testid="testcase-info-section"
      sx={{ containerType: "inline-size", mb: 2 }}
    >
      <Box
        data-testid="testcase-info-grid"
        sx={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          columnGap: 2,
          alignItems: "start",
          [`@container (min-width: ${INFO_GRID_TWO_COLUMN_MIN_WIDTH}px)`]: {
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          },
          // 이름·설명처럼 긴 필드는 한 줄 전체를 쓴다
          "& > .info-full": { gridColumn: "1 / -1" },
        }}
      >
        {/* Name 필드 + AI 생성 버튼 */}
        <Box
          className="info-full"
          sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}
        >
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
          <Box className="info-full">
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
          </Box>
        )}
      </Box>

      {/* ICT-495 cl-4: 실행 유형 · 우선순위 · 테스트 기법을 작은 입력칸으로 한 줄에 둔다.
          실행 유형·우선순위는 내용 폭만, 테스트 기법이 나머지를 쓴다. 칸이 좁으면 줄바꿈된다. */}
      <Box
        data-testid="testcase-type-row"
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1,
          mt: 1,
        }}
      >
        {/* ICT-494 tl-5: 「자동화 여부」 토글은 없앴다. 실행 유형 하나로 고르고 자동화 여부는 그 값을 따른다. */}
        {isVisible("executionType") && (
          <FormControl
            size="small"
            disabled={isViewer}
            sx={{ width: 160, flexShrink: 0 }}
          >
            <InputLabel id="execution-type-select-label">
              {t("testcase.form.executionType", "Manual/Automation")}
            </InputLabel>
            <Select
              labelId="execution-type-select-label"
              value={normalizeExecutionType(
                testCase.executionType,
                testCase.isAutomated,
              )}
              label={t("testcase.form.executionType", "Manual/Automation")}
              onChange={(event) => {
                onTestCaseChange("executionType", event.target.value);
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

        {isVisible("priority") && (
          <FormControl
            size="small"
            disabled={isViewer}
            sx={{ width: 160, flexShrink: 0 }}
          >
            <InputLabel id="priority-select-label">
              {t("testcase.form.priority", "우선순위")}
            </InputLabel>
            <Select
              labelId="priority-select-label"
              value={normalizePriority(testCase.priority)}
              label={t("testcase.form.priority", "우선순위")}
              onChange={onChange("priority")}
              data-testid="testcase-priority-select"
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

        {isVisible("testTechnique") && (
          <TextField
            label={t("testcase.form.testTechnique", "테스트 기법")}
            value={testCase.testTechnique || ""}
            onChange={onChange("testTechnique")}
            size="small"
            variant="outlined"
            disabled={isViewer}
            placeholder={t(
              "testcase.form.testTechniquePlaceholder",
              "예: 경계값 분석, 의사결정 테이블 등",
            )}
            sx={{ flex: "1 1 220px", minWidth: 0 }}
          />
        )}
      </Box>

      {/* 사용자 정의 필드: 태그·연결 항목. 처음에는 접어 두고 머리 줄에 개수를 적는다. */}
      {hasLinkSection && (
        <Accordion
          data-testid="testcase-custom-fields"
          disableGutters
          variant="outlined"
          sx={{ mt: 1, "&::before": { display: "none" } }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="testcase-link-items-content"
            id="testcase-link-items-header"
            data-testid="testcase-link-items-summary"
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {t("testcase.form.linkItems", "연결 항목")}
            </Typography>
            {linkSummary.length > 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ ml: 1 }}
                data-testid="testcase-link-items-counts"
              >
                {linkSummary
                  .map(({ label, count }) => `${label} ${count}`)
                  .join(" · ")}
              </Typography>
            )}
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <Box
              data-testid="testcase-link-items"
              sx={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr)",
                columnGap: 2,
                alignItems: "start",
                [`@container (min-width: ${INFO_GRID_TWO_COLUMN_MIN_WIDTH}px)`]:
                  {
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  },
                "& > .info-full": { gridColumn: "1 / -1" },
              }}
            >
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
                  onChange={(event, newValue) =>
                    onLinkedDocumentsChange(newValue)
                  }
                  getOptionLabel={(option) => option.fileName || ""}
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
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
                      label={t(
                        "testcase.form.linkedDocuments",
                        "연결된 RAG 문서",
                      )}
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

              {/* 실행 유형이 Automation·Hybrid 일 때만 노출 — 연결된 테스트케이스 / JUnit 자동화 케이스 */}
              {automated && isVisible("linkedTestCases") && (
                <Autocomplete
                  className="info-full"
                  multiple
                  options={testCaseOptions}
                  value={linkedTestCases}
                  onChange={(event, newValue) =>
                    onLinkedTestCasesChange(newValue)
                  }
                  getOptionLabel={(option) =>
                    option.displayId
                      ? `${option.displayId} · ${option.name}`
                      : option.name || option.id || ""
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
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
                          icon={<OpenInNewIcon style={{ fontSize: 15 }} />}
                          label={
                            option.displayId
                              ? `${option.displayId} · ${option.name}`
                              : option.name || option.id
                          }
                          {...tagProps}
                          clickable
                          onClick={() => onOpenLinkedTestCase(option)}
                          title={t(
                            "testcase.helper.openLinkedTestCase",
                            "클릭하면 해당 테스트케이스로 이동합니다",
                          )}
                          sx={{ cursor: "pointer" }}
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

              {automated && isVisible("linkedJunitCases") && (
                <Autocomplete
                  className="info-full"
                  multiple
                  options={junitCaseOptions}
                  value={linkedJunitCases}
                  loading={junitLoading}
                  filterOptions={(x) => x}
                  onChange={(event, newValue) =>
                    onLinkedJunitCasesChange(newValue)
                  }
                  onInputChange={(event, newInput, reason) => {
                    if (reason === "input") onJunitSearchChange(newInput);
                  }}
                  getOptionLabel={(option) =>
                    option.className
                      ? `${option.className}.${option.name}`
                      : option.displayTitle || option.name || option.id || ""
                  }
                  isOptionEqualToValue={(option, value) =>
                    option.id === value.id
                  }
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
                      const canOpen = Boolean(option.testResultId);
                      return (
                        <Chip
                          key={option.id || index}
                          variant="outlined"
                          icon={
                            canOpen ? (
                              <OpenInNewIcon style={{ fontSize: 15 }} />
                            ) : undefined
                          }
                          label={
                            option.className
                              ? `${option.className}.${option.name}`
                              : option.name || option.id
                          }
                          {...tagProps}
                          clickable={canOpen}
                          onClick={
                            canOpen
                              ? () => onOpenLinkedJunitCase(option)
                              : undefined
                          }
                          title={
                            canOpen
                              ? t(
                                  "testcase.helper.openLinkedJunitCase",
                                  "클릭하면 해당 JUnit 결과로 이동합니다",
                                )
                              : undefined
                          }
                          sx={canOpen ? { cursor: "pointer" } : undefined}
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

              {/* 역방향(읽기 전용): 이 테스트케이스를 연결한 다른 테스트케이스 */}
              {linkedByTestCases.length > 0 && (
                <Box className="info-full" sx={{ mt: 2 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 0.5 }}
                  >
                    {t(
                      "testcase.form.linkedByTestCases",
                      "이 테스트케이스를 연결한 케이스",
                    )}{" "}
                    ({linkedByTestCases.length})
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {linkedByTestCases.map((option) => (
                      <Chip
                        key={option.id}
                        variant="outlined"
                        size="small"
                        icon={<OpenInNewIcon style={{ fontSize: 15 }} />}
                        clickable
                        onClick={() => onOpenLinkedTestCase(option)}
                        title={t(
                          "testcase.helper.openLinkedTestCase",
                          "클릭하면 해당 테스트케이스로 이동합니다",
                        )}
                        sx={{ cursor: "pointer" }}
                        label={
                          option.displayId
                            ? `${option.displayId} · ${option.name}`
                            : option.name || option.id
                        }
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* ICT-495 cl-4: 정보성 필드(소유자·Parent·순서·수정자·식별 정보) 한 줄 요약(상위가 넘겨줌) */}
      {metadataSlot}

      {/* 전제 조건 → (사후 조건) → 단계(TestCaseForm) 순서 */}
      <Box data-testid="testcase-conditions">
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
      </Box>
    </Box>
  );
};

TestCaseBasicInfo.propTypes = {
  testCase: PropTypes.object.isRequired,
  errors: PropTypes.object,
  availableTags: PropTypes.array,
  linkedDocuments: PropTypes.array,
  ragDocuments: PropTypes.array,
  visibility: PropTypes.object,
  metadataSlot: PropTypes.node,
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
  onOpenLinkedTestCase: PropTypes.func,
  linkedByTestCases: PropTypes.array,
  linkedJunitCases: PropTypes.array,
  junitCaseOptions: PropTypes.array,
  onLinkedJunitCasesChange: PropTypes.func,
  onOpenLinkedJunitCase: PropTypes.func,
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
