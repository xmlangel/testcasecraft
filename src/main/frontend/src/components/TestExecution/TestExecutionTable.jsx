import React, { memo } from 'react';
import PropTypes from "prop-types";
import {
    Box, Typography, Paper, Tooltip, Chip, Button, useTheme, Checkbox, IconButton, CircularProgress
} from "@mui/material";
import {
    Folder as FolderIcon,
    Description as DescriptionIcon,
    Visibility as VisibilityIcon,
    AttachFile as AttachFileIcon,
    ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";
import { useI18n } from '../../context/I18nContext.jsx';
import { TestResult } from "../../models/testExecution.jsx";
import JiraIssueLink from './JiraIssueLink.jsx';
import {
    wrapName, getResultIcon, formatDateTimeFull, formatDateTimeShort,
    getDisplayValue, priorityColor, responsiveColumnSx,
    gridTemplateColumns
} from './utils.jsx';

// 개별 행 컴포넌트 - 메모이제이션 적용
const ExecutionRow = memo(({ 
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
    t,
    theme
}) => {
    const isFolder = node.type === "folder";
    const result = resultObj?.result || TestResult.NOTRUN;
    const notes = resultObj?.notes;
    const tags = resultObj?.tags || [];
    const jiraIssueKey = resultObj?.jiraIssueKey;
    const executedBy = resultObj?.executedBy;
    const executedAt = resultObj?.executedAt;

    let titleStyle = {
        fontWeight: "bold",
        textAlign: "center",
        width: "100%",
        display: "block",
        whiteSpace: "pre-line",
        overflow: "hidden",
        textOverflow: "ellipsis",
    };
    titleStyle.color = isFolder ? theme.palette.text.primary : theme.palette.primary.main;

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: gridTemplateColumns,
                width: "100%",
                minHeight: 32,
                backgroundColor: idx % 2 === 0 ? theme.palette.action.hover : theme.palette.background.paper,
                "&:hover": {
                    backgroundColor: theme.palette.action.selected
                }
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
                            'aria-label': `${t('testExecution.table.selectTestCase')} ${node.name}`,
                            'data-testid': `execution-table-checkbox-${node.id}`
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
                        sx={{ fontSize: '0.70rem', height: '18px' }}
                    />
                )}
            </Box>
            {/* 2: 폴더 */}
            <Box sx={{ ...responsiveColumnSx[2], pl: `${node.level * 20}px` }}>
                {isFolder ? (
                    <>
                        <FolderIcon sx={{ mr: 1 }} />
                        <Typography variant="body2" sx={{ ...titleStyle, textAlign: "left" }}>
                            {wrapName(node.name)}
                        </Typography>
                    </>
                ) : (
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                        {node.parentName ? `${node.parentName}>` : '-'}
                    </Typography>
                )}
            </Box>
            {/* 3: 테스트케이스 */}
            <Box sx={{ ...responsiveColumnSx[3], display: "flex", alignItems: "center", justifyContent: "flex-start", pl: 1, overflow: "hidden" }}>
                {!isFolder ? (
                    <>
                        <DescriptionIcon sx={{ mr: 1, color: theme.palette.primary.main, fontSize: '1.2rem', flexShrink: 0 }} />
                        <Typography
                            variant="body2"
                            sx={{
                                fontWeight: "bold",
                                color: theme.palette.primary.main,
                                whiteSpace: "pre-line",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                cursor: canEnterResults ? 'pointer' : 'default',
                                flex: 1,
                                '&:hover': canEnterResults ? {
                                    textDecoration: 'underline',
                                    color: theme.palette.primary.dark
                                } : {}
                            }}
                            onClick={canEnterResults ? () => handleOpenResultForm(node.id) : undefined}
                            data-testid={`execution-table-case-name-${node.id}`}
                        >
                            {wrapName(node.name)}
                        </Typography>
                        {node.priority && (
                            <Chip label={node.priority} color={priorityColor[node.priority] || 'default'} size="small" sx={{ ml: 1, flexShrink: 0 }} />
                        )}
                    </>
                ) : null}
            </Box>
            {/* 3: 결과 */}
            <Box sx={{ ...responsiveColumnSx[4], display: "flex", alignItems: "center", justifyContent: "center" }}>
                {!isFolder ? getResultIcon(result) : null}
            </Box>
            {/* 4: 실행일시 */}
            <Box sx={{ ...responsiveColumnSx[5], display: "flex", alignItems: "center", justifyContent: "center" }}>
                {!isFolder ? (
                    executedAt ? (
                        <Tooltip
                            title={formatDateTimeFull(executedAt)}
                            placement="top"
                            arrow
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    lineHeight: 1.5,
                                    textAlign: "center",
                                    cursor: "help",
                                    color: theme.palette.primary.main,
                                    fontWeight: "500",
                                }}
                            >
                                {formatDateTimeShort(executedAt)}
                            </Typography>
                        </Tooltip>
                    ) : (
                        getDisplayValue(undefined, "executedAt")
                    )
                ) : null}
            </Box>
            {/* 5: 실행자 */}
            <Box sx={{ ...responsiveColumnSx[6], display: "flex", alignItems: "center", justifyContent: "center" }}>
                {!isFolder ? (
                    <Typography
                        variant="body2"
                        sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            lineHeight: 1.5,
                            color: executedBy ? undefined : theme.palette.text.disabled,
                            textAlign: "center",
                        }}
                    >
                        {executedBy ? executedBy : getDisplayValue(undefined, "executedBy")}
                    </Typography>
                ) : null}
            </Box>
            {/* 6: 비고 */}
            <Box sx={{ ...responsiveColumnSx[7], display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {!isFolder ? (
                    <Typography
                        variant="body2"
                        sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            lineHeight: 1.5,
                            color: notes ? undefined : theme.palette.text.disabled,
                            textAlign: "center",
                            cursor: canEnterResults ? 'pointer' : 'default',
                            width: "100%",
                            '&:hover': canEnterResults ? {
                                textDecoration: 'underline',
                                color: theme.palette.primary.main
                            } : {}
                        }}
                        onClick={canEnterResults ? () => handleOpenResultForm(node.id) : undefined}
                        data-testid={`execution-table-notes-${node.id}`}
                    >
                        {notes ? notes : getDisplayValue(undefined, "notes")}
                    </Typography>
                ) : null}
            </Box>
            {/* 7: 태그 */}
            <Box sx={{ ...responsiveColumnSx[8], display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 0.5 }}>
                {!isFolder ? (
                    tags && tags.length > 0 ? (
                        tags.map((tag, index) => (
                            <Chip
                                key={index}
                                label={tag}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.75rem' }}
                            />
                        ))
                    ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>-</Typography>
                    )
                ) : null}
            </Box>
            {/* 8: JIRA ID */}
            <Box sx={{ ...responsiveColumnSx[9], display: "flex", alignItems: "center", justifyContent: "center" }}>
                {!isFolder ? (
                    jiraIssueKey ? (
                        <JiraIssueLink issueKey={jiraIssueKey} />
                    ) : (
                        getDisplayValue(undefined, "jiraIssueKey")
                    )
                ) : null}
            </Box>
            {/* 9: 결과입력 및 기타 액션 */}
            <Box sx={{ ...responsiveColumnSx[10], gridColumn: "11 / 14", display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                {!isFolder ? (
                    <>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenResultForm(node.id)}
                            disabled={!canEnterResults}
                            sx={{ fontSize: '0.75rem', py: 0.25, px: 1 }}
                            data-testid={`execution-table-result-button-${node.id}`}
                        >
                            {t('testExecution.actions.enterResult')}
                        </Button>
                        <Tooltip title={t('testExecution.actions.copyResultLink', '결과 입력 링크 복사')}>
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={() => handleCopyLink?.(node.id)}
                                    disabled={!canEnterResults}
                                    sx={{ p: 0.5 }}
                                    data-testid={`execution-table-copy-link-button-${node.id}`}
                                >
                                    <ContentCopyIcon fontSize="small" sx={{ fontSize: '0.9rem' }} />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title={t('testExecution.actions.prevResults')}>
                            <IconButton
                                size="small"
                                onClick={() => handleShowPrevResults(node.id)}
                                sx={{ p: 0.5 }}
                                data-testid={`execution-table-prev-results-button-${node.id}`}
                            >
                                <VisibilityIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        {resultObj?.id && ((resultObj.attachments && resultObj.attachments.length > 0) || (resultObj.attachmentCount > 0)) && (
                            <Tooltip title={t('testExecution.table.viewAttachments')}>
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
});

ExecutionRow.displayName = 'ExecutionRow';

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
    onSelectionChange
}) => {
    const { t } = useI18n();
    const theme = useTheme();
    const sentinelRef = React.useRef(null);

    // Intersection Observer 설정
    React.useEffect(() => {
        if (!sentinelRef.current || !hasMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
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
                t={t}
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
                maxHeight: "calc(100vh - 350px)",
                display: "flex",
                flexDirection: "column",
            }}
        >

            {/* 인피니티 스크롤이 적용된 테스트 케이스 목록 */}
            <Box sx={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {/* 데이터 요약 정보 표시 */}
                <Box sx={{ mb: 1, mt: 1, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                        {t('testExecution.table.totalCount', '전체: {count}건').replace('{count}', totalItems)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mr: 4 }}>
                        {t('testExecution.scroll.hint', '스크롤하여 더 보기')}
                    </Typography>
                </Box>

                {/* 인피니티 스크롤 목록 컨테이너 */}
                <Box sx={{
                    width: "100%",
                    flex: 1,
                    minHeight: 0, // Flex item shrinking fix
                    overflowY: "auto",
                    overflowX: "auto", // 가로 스크롤 허용
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 1
                }}>
                    {/* 컬럼 헤더 - Sticky 적용 */}
                    <Box sx={{
                        display: "grid",
                        gridTemplateColumns: gridTemplateColumns,
                        width: "100%",
                        // minWidth removed to allow fitting in screen
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                        backgroundColor: theme.palette.background.paper,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                    }}>
                        <Box sx={{ ...responsiveColumnSx[0], fontWeight: "bold", fontSize: "1.08rem", color: theme.palette.primary.main, py: 1 }}>
                            <Checkbox
                                size="small"
                                indeterminate={selectedTestCases?.size > 0 && selectedTestCases?.size < visibleData.filter(n => n.type !== 'folder').length}
                                checked={selectedTestCases?.size > 0 && selectedTestCases?.size === visibleData.filter(n => n.type !== 'folder').length}
                                onChange={(e) => {
                                    const testCaseIds = visibleData.filter(n => n.type !== 'folder').map(n => n.id);
                                    if (e.target.checked) {
                                        testCaseIds.forEach(id => onSelectionChange?.(id, true));
                                    } else {
                                        testCaseIds.forEach(id => onSelectionChange?.(id, false));
                                    }
                                }}
                                inputProps={{ 
                                    'aria-label': t('testExecution.table.selectAll'),
                                    'data-testid': 'execution-table-select-all-checkbox'
                                }}
                            />
                        </Box>
                        <Box sx={{ ...responsiveColumnSx[1], fontWeight: "bold", fontSize: "1.08rem", color: theme.palette.primary.main, py: 1 }}>{t('testExecution.table.id', 'ID')}</Box>
                        <Box sx={{ ...responsiveColumnSx[2], fontWeight: "bold", fontSize: "1.08rem", color: theme.palette.primary.main, py: 1 }}>{t('testExecution.table.folder', '폴더')}</Box>
                        <Box sx={{ ...responsiveColumnSx[3], py: 1 }}>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: "bold",
                                    fontSize: "1.08rem",
                                    color: theme.palette.primary.main,
                                    flex: 1
                                }}
                            >
                                {t('testExecution.table.caseName', '테스트케이스')}
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: "bold",
                                    fontSize: "1.08rem",
                                    color: theme.palette.primary.main,
                                    flexShrink: 0
                                }}
                            >
                                {t('testExecution.table.priority', '우선순위')}
                            </Typography>
                        </Box>
                        <Box sx={{ ...responsiveColumnSx[4], fontWeight: "bold", fontSize: "1.08rem", color: theme.palette.primary.main, py: 1 }}>{t('testExecution.table.result')}</Box>
                        <Box sx={{ ...responsiveColumnSx[5], fontWeight: "bold", fontSize: "1.08rem", color: theme.palette.primary.main, py: 1 }}>{t('testExecution.table.executedAt')}</Box>
                        <Box sx={{ ...responsiveColumnSx[6], fontWeight: "bold", fontSize: "1.08rem", color: theme.palette.primary.main, py: 1 }}>{t('testExecution.table.executedBy')}</Box>
                        <Box sx={{ ...responsiveColumnSx[7], fontWeight: "bold", fontSize: "1.08rem", color: theme.palette.primary.main, py: 1 }}>{t('testExecution.table.notes')}</Box>
                        <Box sx={{ ...responsiveColumnSx[8], fontWeight: "bold", fontSize: "1.08rem", color: theme.palette.primary.main, py: 1 }}>{t('testExecution.table.tags', '태그')}</Box>
                        <Box sx={{ ...responsiveColumnSx[9], fontWeight: "bold", fontSize: "1.08rem", color: theme.palette.primary.main, py: 1 }}>{t('testExecution.table.jiraId')}</Box>
                        <Box sx={{ ...responsiveColumnSx[10], gridColumn: "11 / 14", fontWeight: "bold", fontSize: "1.08rem", color: theme.palette.primary.main, py: 1 }}>{t('testExecution.table.actions')}</Box>
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
                                {t('testExecution.table.noData')}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>
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
};

export default TestExecutionTable;
