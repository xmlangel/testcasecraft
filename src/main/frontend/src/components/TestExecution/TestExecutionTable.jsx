import React, { memo, useState, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Paper,
  Tooltip,
  Chip,
  Button,
  useTheme,
  Checkbox,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import {
  Folder as FolderIcon,
  Description as DescriptionIcon,
  Visibility as VisibilityIcon,
  AttachFile as AttachFileIcon,
  ContentCopy as ContentCopyIcon,
  History as HistoryIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  UnfoldMore as UnfoldMoreIcon,
  UnfoldLess as UnfoldLessIcon,
} from "@mui/icons-material";
import { useI18n } from "../../context/I18nContext.jsx";
import { TestResult } from "../../models/testExecution.jsx";
import JiraIssueLink from "./JiraIssueLink.jsx";
import {
  wrapName,
  getResultIcon,
  getDisplayValue,
  priorityColor,
  responsiveColumnSx,
  gridTemplateColumns,
  FOLDER_RESULT_KEYS,
} from "./utils.jsx";
import { useDateFormatter } from "../../hooks/useDateFormatter";
import { copyToClipboard } from "../../utils";

// 개별 행 컴포넌트 - 메모이제이션 적용
const ExecutionRow = memo(
  ({
    node,
    idx,
    resultObj,
    canEnterResults,
    isSelected,
    onSelectionChange,
    handleOpenResultForm,
    handleShowPrevResults,
    handleAttachmentClick,
    handleCopyLink,
    handleCopyNotes,
    isCollapsed,
    childCaseCount,
    childResultCounts,
    onToggleFolder,
    t,
    formatDate,
    formatDateOnly,
    theme,
  }) => {
    const isFolder = node.type === "folder";
    const result = resultObj?.result || TestResult.NOT_RUN;
    const notes = resultObj?.notes;
    const tags = resultObj?.tags || [];
    const jiraIssueKey = resultObj?.jiraIssueKey;
    const effectiveJiraIssueKey = resultObj?.effectiveJiraIssueKey;
    const executedBy = resultObj?.executedBy;
    const executedAt = resultObj?.executedAt;

    let titleStyle = {
      fontWeight: "bold",
      lineHeight: 1.25,
      textAlign: "center",
      width: "100%",
      display: "block",
      whiteSpace: "pre-line",
      overflow: "hidden",
      textOverflow: "ellipsis",
    };
    titleStyle.color = isFolder
      ? theme.palette.text.primary
      : theme.palette.primary.main;

    return (
      <Box
        id={`execution-row-${node.id}`}
        sx={{
          display: "grid",
          gridTemplateColumns: gridTemplateColumns,
          width: "100%",
          minHeight: 26,
          backgroundColor:
            idx % 2 === 0
              ? theme.palette.action.hover
              : theme.palette.background.paper,
          "&:hover": {
            backgroundColor: theme.palette.action.selected,
          },
        }}
      >
        {/* 0: Checkbox */}
        <Box sx={{ ...responsiveColumnSx[0] }}>
          {!isFolder && (
            <Checkbox
              checked={isSelected}
              onChange={(e) => onSelectionChange?.(node.id, e.target.checked)}
              size="small"
              inputProps={{
                "aria-label": `${t("testExecution.table.selectTestCase")} ${
                  node.name
                }`,
                "data-testid": `execution-table-checkbox-${node.id}`,
              }}
            />
          )}
        </Box>
        {/* 1: ID */}
        <Box sx={{ ...responsiveColumnSx[1] }}>
          {node.displayId && (
            <Chip
              label={node.displayId}
              variant="outlined"
              size="small"
              sx={{ fontSize: "0.70rem", height: "18px" }}
            />
          )}
        </Box>
        {/* 2: 폴더 */}
        <Box sx={{ ...responsiveColumnSx[2], pl: `${node.level * 20}px` }}>
          {isFolder ? (
            <>
              <Tooltip
                title={
                  isCollapsed
                    ? t("testExecution.tree.expandFolder", "폴더 펼치기")
                    : t("testExecution.tree.collapseFolder", "폴더 접기")
                }
              >
                <IconButton
                  size="small"
                  onClick={() => onToggleFolder?.(node.id)}
                  sx={{ p: 0.25, mr: 0.25, flexShrink: 0 }}
                  aria-expanded={!isCollapsed}
                  aria-label={
                    isCollapsed
                      ? `${t("testExecution.tree.expandFolder", "폴더 펼치기")} ${node.name}`
                      : `${t("testExecution.tree.collapseFolder", "폴더 접기")} ${node.name}`
                  }
                  data-testid={`execution-table-folder-toggle-${node.id}`}
                >
                  {isCollapsed ? (
                    <KeyboardArrowRightIcon fontSize="small" />
                  ) : (
                    <KeyboardArrowDownIcon fontSize="small" />
                  )}
                </IconButton>
              </Tooltip>
              <FolderIcon sx={{ mr: 0.5, flexShrink: 0 }} />
              <Tooltip title={node.name}>
                <Typography
                  variant="body2"
                  sx={{
                    ...titleStyle,
                    textAlign: "left",
                    // 폴더명이 먼저 줄어들되 0 까지는 가지 않게 — 집계 배지가 잘리는 쪽이
                    // 아니라 이름이 말줄임되는 쪽으로 눌린다
                    width: "auto",
                    flex: "1 1 auto",
                    minWidth: 40,
                    whiteSpace: "nowrap",
                  }}
                >
                  {node.name}
                </Typography>
              </Tooltip>
              {isCollapsed && childCaseCount > 0 && (
                // 폴더 열이 좁아 알약을 5개 붙이면 이름이 밀려 사라진다. 총계만 칩으로 두고
                // 판정별 건수는 색만 입힌 숫자로 붙인다(테두리·배경 없음).
                <Box
                  sx={{
                    ml: 0.5,
                    display: "flex",
                    alignItems: "center",
                    flexShrink: 0,
                    fontSize: "0.65rem",
                    lineHeight: "16px",
                    fontWeight: 700,
                  }}
                >
                  <Tooltip
                    title={`${t("testExecution.summary.total", "총")} ${childCaseCount}`}
                  >
                    <Box
                      component="span"
                      sx={{
                        px: 0.5,
                        mr: 0.5,
                        borderRadius: "8px",
                        border: `1px solid ${theme.palette.divider}`,
                        color: theme.palette.text.secondary,
                      }}
                      data-testid={`execution-table-folder-count-${node.id}`}
                    >
                      {childCaseCount}
                    </Box>
                  </Tooltip>
                  {FOLDER_RESULT_KEYS.map(
                    ({ key, color, labelKey, labelFallback }, i) => {
                      const count = childResultCounts?.[key] || 0;
                      const label = t(labelKey, labelFallback);
                      return (
                        <React.Fragment key={key}>
                          {i > 0 && (
                            <Box
                              component="span"
                              aria-hidden="true"
                              sx={{
                                color: theme.palette.text.disabled,
                                fontWeight: 400,
                              }}
                            >
                              /
                            </Box>
                          )}
                          <Tooltip title={`${label} ${count}`}>
                            <Box
                              component="span"
                              aria-label={`${label} ${count}`}
                              sx={{
                                color: color,
                                // 0건은 눈이 건너뛰도록 낮춘다 — 순서를 고정하려고 칸은 남긴다
                                opacity: count > 0 ? 1 : 0.4,
                              }}
                              data-testid={`execution-table-folder-${key.toLowerCase()}-${node.id}`}
                            >
                              {count}
                            </Box>
                          </Tooltip>
                        </React.Fragment>
                      );
                    },
                  )}
                </Box>
              )}
            </>
          ) : (
            <Typography
              variant="body2"
              sx={{ color: theme.palette.text.secondary, lineHeight: 1.25 }}
            >
              {node.parentName ? `${node.parentName}>` : "-"}
            </Typography>
          )}
        </Box>
        {/* 3: 테스트케이스 */}
        <Box
          sx={{
            ...responsiveColumnSx[3],
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            pl: 1,
            overflow: "hidden",
          }}
        >
          {!isFolder ? (
            <>
              <DescriptionIcon
                sx={{
                  mr: 1,
                  color: theme.palette.primary.main,
                  fontSize: "1.2rem",
                  flexShrink: 0,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  lineHeight: 1.25,
                  color: theme.palette.primary.main,
                  whiteSpace: "pre-line",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  cursor: canEnterResults ? "pointer" : "default",
                  flex: 1,
                  "&:hover": canEnterResults
                    ? {
                        textDecoration: "underline",
                        color: theme.palette.primary.dark,
                      }
                    : {},
                }}
                onClick={
                  canEnterResults
                    ? () => handleOpenResultForm(node.id)
                    : undefined
                }
                data-testid={`execution-table-case-name-${node.id}`}
              >
                {wrapName(node.name)}
              </Typography>
              {node.priority && (
                <Chip
                  label={node.priority}
                  color={priorityColor[node.priority] || "default"}
                  size="small"
                  sx={{ ml: 1, flexShrink: 0 }}
                />
              )}
            </>
          ) : null}
        </Box>
        {/* 3: 결과 */}
        <Box
          sx={{
            ...responsiveColumnSx[4],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!isFolder ? getResultIcon(result) : null}
        </Box>
        {/* 4: 실행일시 */}
        <Box
          sx={{
            ...responsiveColumnSx[5],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!isFolder ? (
            executedAt ? (
              <Tooltip title={formatDate(executedAt)} placement="top" arrow>
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: 1.25,
                    textAlign: "center",
                    cursor: "help",
                    color: theme.palette.primary.main,
                    fontWeight: "500",
                  }}
                >
                  {formatDateOnly(executedAt)}
                </Typography>
              </Tooltip>
            ) : (
              getDisplayValue(undefined, "executedAt")
            )
          ) : null}
        </Box>
        {/* 5: 실행자 */}
        <Box
          sx={{
            ...responsiveColumnSx[6],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!isFolder ? (
            <Typography
              variant="body2"
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                lineHeight: 1.25,
                color: executedBy ? undefined : theme.palette.text.disabled,
                textAlign: "center",
              }}
            >
              {executedBy
                ? executedBy
                : getDisplayValue(undefined, "executedBy")}
            </Typography>
          ) : null}
        </Box>
        {/* 6: 비고 */}
        <Box
          sx={{
            ...responsiveColumnSx[7],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            position: "relative",
            "&:hover .copy-notes-btn": {
              opacity: 1,
            },
          }}
        >
          {!isFolder ? (
            <>
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.25,
                  color: notes ? undefined : theme.palette.text.disabled,
                  textAlign: "center",
                  cursor: canEnterResults ? "pointer" : "default",
                  width: "100%",
                  pr: notes ? 2.5 : 0,
                  "&:hover": canEnterResults
                    ? {
                        textDecoration: "underline",
                        color: theme.palette.primary.main,
                      }
                    : {},
                }}
                onClick={
                  canEnterResults
                    ? () => handleOpenResultForm(node.id)
                    : undefined
                }
                data-testid={`execution-table-notes-${node.id}`}
              >
                {notes ? notes : getDisplayValue(undefined, "notes")}
              </Typography>
              {notes && (
                <Tooltip title={t("testcase.notes.copy", "노트 복사")}>
                  <IconButton
                    className="copy-notes-btn"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyNotes(notes);
                    }}
                    sx={{
                      position: "absolute",
                      right: 2,
                      opacity: 0,
                      transition: "opacity 0.2s",
                      padding: "2px",
                      backgroundColor: theme.palette.background.paper,
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <ContentCopyIcon sx={{ fontSize: "0.8rem" }} />
                  </IconButton>
                </Tooltip>
              )}
            </>
          ) : null}
        </Box>
        {/* 7: 태그 */}
        <Box
          sx={{
            ...responsiveColumnSx[8],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 0.5,
          }}
        >
          {!isFolder ? (
            tags && tags.length > 0 ? (
              tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: "0.75rem" }}
                />
              ))
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "0.875rem" }}
              >
                -
              </Typography>
            )
          ) : null}
        </Box>
        {/* 8: JIRA ID */}
        <Box
          sx={{
            ...responsiveColumnSx[9],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {!isFolder ? (
            jiraIssueKey ? (
              <JiraIssueLink issueKey={jiraIssueKey} />
            ) : effectiveJiraIssueKey ? (
              <Tooltip
                title={t("testExecution.jira.historical", "과거 연결 이력")}
              >
                <Box
                  sx={{
                    opacity: 0.6,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <JiraIssueLink issueKey={effectiveJiraIssueKey} />
                  <HistoryIcon
                    sx={{
                      fontSize: "0.9rem",
                      color: theme.palette.text.secondary,
                    }}
                  />
                </Box>
              </Tooltip>
            ) : (
              getDisplayValue(undefined, "jiraIssueKey")
            )
          ) : null}
        </Box>
        {/* 9: 결과입력 및 기타 액션 */}
        <Box
          sx={{
            ...responsiveColumnSx[10],
            gridColumn: "11 / 14",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 0.5,
          }}
        >
          {!isFolder ? (
            <>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleOpenResultForm(node.id)}
                disabled={!canEnterResults}
                sx={{ fontSize: "0.75rem", py: 0.25, px: 1 }}
                data-testid={`execution-table-result-button-${node.id}`}
              >
                {t("testExecution.actions.enterResult")}
              </Button>
              <Tooltip
                title={t(
                  "testExecution.actions.copyResultLink",
                  "결과 입력 링크 복사",
                )}
              >
                <span>
                  <IconButton
                    size="small"
                    onClick={() => handleCopyLink?.(node.id)}
                    disabled={!canEnterResults}
                    sx={{ p: 0.5 }}
                    data-testid={`execution-table-copy-link-button-${node.id}`}
                  >
                    <ContentCopyIcon
                      fontSize="small"
                      sx={{ fontSize: "0.9rem" }}
                    />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={t("testExecution.actions.prevResults")}>
                <IconButton
                  size="small"
                  onClick={() => handleShowPrevResults(node.id)}
                  sx={{ p: 0.5 }}
                  data-testid={`execution-table-prev-results-button-${node.id}`}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              {resultObj?.id &&
                ((resultObj.attachments && resultObj.attachments.length > 0) ||
                  resultObj.attachmentCount > 0) && (
                  <Tooltip title={t("testExecution.table.viewAttachments")}>
                    <IconButton
                      size="small"
                      onClick={() => handleAttachmentClick(resultObj.id)}
                      sx={{ p: 0.5 }}
                      data-testid={`execution-table-attachments-button-${resultObj.id}`}
                    >
                      <AttachFileIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
            </>
          ) : null}
        </Box>
      </Box>
    );
  },
);

ExecutionRow.displayName = "ExecutionRow";

const TestExecutionTable = ({
  visibleData,
  resultsMap,
  totalItems,
  hasMore,
  loadMore,
  handleOpenResultForm,
  handleShowPrevResults,
  handleAttachmentClick,
  handleCopyLink,
  canEnterResults,
  selectedTestCases,
  onSelectionChange,
  collapsedFolders,
  folderResultCounts,
  collapsedFolderCount = 0,
  onToggleFolder,
  onExpandAllFolders,
  onCollapseAllFolders,
  treeControlsDisabled = false,
}) => {
  const { t } = useI18n();
  const { formatDate, formatDateOnly } = useDateFormatter();
  const theme = useTheme();
  const sentinelRef = React.useRef(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // 복사 핸들러
  const handleCopyNotes = useCallback(async (text) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopySuccess(true);
    }
  }, []);

  // Intersection Observer 설정
  React.useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const renderItems = (nodes) =>
    nodes.map((node, idx) => (
      <ExecutionRow
        key={node.id}
        node={node}
        idx={idx}
        resultObj={resultsMap?.get(node.id)}
        canEnterResults={canEnterResults}
        isSelected={selectedTestCases?.has(node.id) || false}
        onSelectionChange={onSelectionChange}
        handleOpenResultForm={handleOpenResultForm}
        handleShowPrevResults={handleShowPrevResults}
        handleAttachmentClick={handleAttachmentClick}
        handleCopyLink={handleCopyLink}
        handleCopyNotes={handleCopyNotes}
        isCollapsed={collapsedFolders?.has(node.id) || false}
        childCaseCount={folderResultCounts?.get(node.id)?.total || 0}
        childResultCounts={folderResultCounts?.get(node.id)}
        onToggleFolder={onToggleFolder}
        t={t}
        formatDate={formatDate}
        formatDateOnly={formatDateOnly}
        theme={theme}
      />
    ));

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 0,
        background: theme.palette.background.paper,
        width: "100%",
        overflow: "hidden", // 전체 컨테이너는 hidden 유지
        minHeight: 300,
        maxHeight: "calc(100vh - 270px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 인피니티 스크롤이 적용된 테스트 케이스 목록 */}
      <Box
        sx={{
          flex: 1,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* 데이터 요약 정보 표시 */}
        <Box
          sx={{
            mb: 0.5,
            mt: 0.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {t("testExecution.table.totalCount", "전체: {count}건").replace(
                "{count}",
                totalItems,
              )}
            </Typography>
            <Tooltip
              title={
                treeControlsDisabled
                  ? t(
                      "testExecution.tree.disabledByFilter",
                      "필터가 걸려 있어 모두 펼쳐 보여줍니다",
                    )
                  : t("testExecution.tree.expandAll", "폴더 모두 펼치기")
              }
            >
              <span>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<UnfoldMoreIcon />}
                  onClick={onExpandAllFolders}
                  disabled={treeControlsDisabled || collapsedFolderCount === 0}
                  sx={{ fontSize: "0.75rem", py: 0.25, px: 1 }}
                  data-testid="execution-table-expand-all"
                >
                  {t("testExecution.tree.expandAll", "폴더 모두 펼치기")}
                </Button>
              </span>
            </Tooltip>
            <Tooltip
              title={
                treeControlsDisabled
                  ? t(
                      "testExecution.tree.disabledByFilter",
                      "필터가 걸려 있어 모두 펼쳐 보여줍니다",
                    )
                  : t("testExecution.tree.collapseAll", "폴더 모두 접기")
              }
            >
              <span>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<UnfoldLessIcon />}
                  onClick={onCollapseAllFolders}
                  disabled={treeControlsDisabled}
                  sx={{ fontSize: "0.75rem", py: 0.25, px: 1 }}
                  data-testid="execution-table-collapse-all"
                >
                  {t("testExecution.tree.collapseAll", "폴더 모두 접기")}
                </Button>
              </span>
            </Tooltip>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 4 }}>
            {t("testExecution.scroll.hint", "스크롤하여 더 보기")}
          </Typography>
        </Box>

        {/* 인피니티 스크롤 목록 컨테이너 */}
        <Box
          sx={{
            width: "100%",
            flex: 1,
            minHeight: 0, // Flex item shrinking fix
            overflowY: "auto",
            overflowX: "auto", // 가로 스크롤 허용
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
          }}
        >
          {/* 컬럼 헤더 - Sticky 적용 */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: gridTemplateColumns,
              width: "100%",
              // minWidth removed to allow fitting in screen
              position: "sticky",
              top: 0,
              zIndex: 1,
              backgroundColor: theme.palette.background.paper,
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box
              sx={{
                ...responsiveColumnSx[0],
                fontWeight: "bold",
                fontSize: "1.08rem",
                color: theme.palette.primary.main,
                py: 0.5,
              }}
            >
              <Checkbox
                size="small"
                indeterminate={
                  selectedTestCases?.size > 0 &&
                  selectedTestCases?.size <
                    visibleData.filter((n) => n.type !== "folder").length
                }
                checked={
                  selectedTestCases?.size > 0 &&
                  selectedTestCases?.size ===
                    visibleData.filter((n) => n.type !== "folder").length
                }
                onChange={(e) => {
                  const testCaseIds = visibleData
                    .filter((n) => n.type !== "folder")
                    .map((n) => n.id);
                  if (e.target.checked) {
                    testCaseIds.forEach((id) => onSelectionChange?.(id, true));
                  } else {
                    testCaseIds.forEach((id) => onSelectionChange?.(id, false));
                  }
                }}
                inputProps={{
                  "aria-label": t("testExecution.table.selectAll"),
                  "data-testid": "execution-table-select-all-checkbox",
                }}
              />
            </Box>
            <Box
              sx={{
                ...responsiveColumnSx[1],
                fontWeight: "bold",
                fontSize: "1.08rem",
                color: theme.palette.primary.main,
                py: 0.5,
              }}
            >
              {t("testExecution.table.id", "ID")}
            </Box>
            <Box
              sx={{
                ...responsiveColumnSx[2],
                fontWeight: "bold",
                fontSize: "1.08rem",
                color: theme.palette.primary.main,
                py: 0.5,
              }}
            >
              {t("testExecution.table.folder", "폴더")}
            </Box>
            <Box sx={{ ...responsiveColumnSx[3], py: 0.5 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  fontSize: "1.08rem",
                  color: theme.palette.primary.main,
                  flex: 1,
                }}
              >
                {t("testExecution.table.caseName", "테스트케이스")}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  fontSize: "1.08rem",
                  color: theme.palette.primary.main,
                  flexShrink: 0,
                }}
              >
                {t("testExecution.table.priority", "우선순위")}
              </Typography>
            </Box>
            <Box
              sx={{
                ...responsiveColumnSx[4],
                fontWeight: "bold",
                fontSize: "1.08rem",
                color: theme.palette.primary.main,
                py: 0.5,
              }}
            >
              {t("testExecution.table.result")}
            </Box>
            <Box
              sx={{
                ...responsiveColumnSx[5],
                fontWeight: "bold",
                fontSize: "1.08rem",
                color: theme.palette.primary.main,
                py: 0.5,
              }}
            >
              {t("testExecution.table.executedAt")}
            </Box>
            <Box
              sx={{
                ...responsiveColumnSx[6],
                fontWeight: "bold",
                fontSize: "1.08rem",
                color: theme.palette.primary.main,
                py: 0.5,
              }}
            >
              {t("testExecution.table.executedBy")}
            </Box>
            <Box
              sx={{
                ...responsiveColumnSx[7],
                fontWeight: "bold",
                fontSize: "1.08rem",
                color: theme.palette.primary.main,
                py: 0.5,
              }}
            >
              {t("testExecution.table.notes")}
            </Box>
            <Box
              sx={{
                ...responsiveColumnSx[8],
                fontWeight: "bold",
                fontSize: "1.08rem",
                color: theme.palette.primary.main,
                py: 0.5,
              }}
            >
              {t("testExecution.table.tags", "태그")}
            </Box>
            <Box
              sx={{
                ...responsiveColumnSx[9],
                fontWeight: "bold",
                fontSize: "1.08rem",
                color: theme.palette.primary.main,
                py: 0.5,
              }}
            >
              {t("testExecution.table.jiraId")}
            </Box>
            <Box
              sx={{
                ...responsiveColumnSx[10],
                gridColumn: "11 / 14",
                fontWeight: "bold",
                fontSize: "1.08rem",
                color: theme.palette.primary.main,
                py: 0.5,
              }}
            >
              {t("testExecution.table.actions")}
            </Box>
          </Box>
          {visibleData.length > 0 ? (
            <>
              {renderItems(visibleData)}
              {/* 감시 엘리먼트 */}
              <Box ref={sentinelRef} sx={{ height: 20, width: "100%" }} />
              {hasMore && (
                <Box sx={{ p: 2, textAlign: "center" }}>
                  <CircularProgress size={24} />
                </Box>
              )}
            </>
          ) : (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                {t("testExecution.table.noData")}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* 복사 성공 알림 */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setCopySuccess(false)}
          severity="success"
          sx={{ width: "100%" }}
        >
          {t(
            "testcase.notes.copy_message",
            "노트가 클립보드에 복사되었습니다.",
          )}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

TestExecutionTable.propTypes = {
  visibleData: PropTypes.array.isRequired,
  resultsMap: PropTypes.instanceOf(Map),
  totalItems: PropTypes.number.isRequired,
  hasMore: PropTypes.bool.isRequired,
  loadMore: PropTypes.func.isRequired,
  handleOpenResultForm: PropTypes.func.isRequired,
  handleShowPrevResults: PropTypes.func.isRequired,
  handleAttachmentClick: PropTypes.func.isRequired,
  handleCopyLink: PropTypes.func,
  canEnterResults: PropTypes.bool,
  selectedTestCases: PropTypes.instanceOf(Set),
  onSelectionChange: PropTypes.func,
  collapsedFolders: PropTypes.instanceOf(Set),
  folderResultCounts: PropTypes.instanceOf(Map),
  collapsedFolderCount: PropTypes.number,
  onToggleFolder: PropTypes.func,
  onExpandAllFolders: PropTypes.func,
  onCollapseAllFolders: PropTypes.func,
  treeControlsDisabled: PropTypes.bool,
};

export default TestExecutionTable;
