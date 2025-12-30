import React from 'react';
import PropTypes from "prop-types";
import {
    Box, Typography, Paper, Tooltip, Chip, Button, Pagination, useTheme, Checkbox, IconButton, Select, MenuItem
} from "@mui/material";
import {
    Folder as FolderIcon,
    Description as DescriptionIcon,
    Visibility as VisibilityIcon,
    AttachFile as AttachFileIcon,
    ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import { useTranslation } from '../../context/I18nContext.jsx';
import { TestResult } from "../../models/testExecution.jsx";
import JiraIssueLink from './JiraIssueLink.jsx';
import {
    wrapName, getResultIcon, formatDateTimeFull, formatDateTimeShort,
    getDisplayValue, priorityColor, responsiveColumnSx, HEADER_HEIGHT,
    gridTemplateColumns
} from './utils.jsx';

const TestExecutionTable = ({
    paginatedData,
    latestResults,
    totalItems,
    totalPages,
    currentPage,
    itemsPerPage,
    handlePageChange,
    handleOpenResultForm,
    handleRowsPerPageChange,
    handleShowPrevResults,
    handleAttachmentClick,
    canEnterResults,
    selectedTestCases,
    onSelectionChange
}) => {
    const { t } = useTranslation();
    const theme = useTheme();

    const renderPaginatedItems = (nodes) =>
        nodes.map((node, idx) => {
            const isFolder = node.type === "folder";
            const resultObj = latestResults?.find((r) => r.testCaseId === node.id);
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
                    key={node.id}
                    sx={{
                        display: "grid",
                        gridTemplateColumns: gridTemplateColumns,
                        width: "100%",
                        // minWidth removed
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
                                checked={selectedTestCases?.has(node.id) || false}
                                onChange={(e) => onSelectionChange?.(node.id, e.target.checked)}
                                size="small"
                                inputProps={{ 'aria-label': `${t('testExecution.table.selectTestCase')} ${node.name}` }}
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
                    <Box sx={{ ...responsiveColumnSx[3], display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {!isFolder ? getResultIcon(result) : null}
                    </Box>
                    {/* 4: 실행일시 */}
                    <Box sx={{ ...responsiveColumnSx[4], display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                    <Box sx={{ ...responsiveColumnSx[5], display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                    <Box sx={{ ...responsiveColumnSx[6], display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
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
                            >
                                {notes ? notes : getDisplayValue(undefined, "notes")}
                            </Typography>
                        ) : null}
                    </Box>
                    {/* 7: 태그 */}
                    <Box sx={{ ...responsiveColumnSx[7], display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 0.5 }}>
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
                    <Box sx={{ ...responsiveColumnSx[8], display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {!isFolder ? (
                            jiraIssueKey ? (
                                <JiraIssueLink issueKey={jiraIssueKey} />
                            ) : (
                                getDisplayValue(undefined, "jiraIssueKey")
                            )
                        ) : null}
                    </Box>
                    {/* 9: 결과입력 */}
                    <Box sx={{ ...responsiveColumnSx[9], display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {!isFolder ? (
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleOpenResultForm(node.id)}
                                disabled={!canEnterResults}
                                sx={{ fontSize: '0.75rem', py: 0.25, px: 1 }}
                            >
                                {t('testExecution.actions.enterResult')}
                            </Button>
                        ) : null}
                    </Box>
                    {/* 10: 이전결과 */}
                    <Box sx={{ ...responsiveColumnSx[10], display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {!isFolder ? (
                            <Tooltip title={t('testExecution.actions.prevResults')}>
                                <IconButton
                                    size="small"
                                    onClick={() => handleShowPrevResults(node.id)}
                                    sx={{ p: 0.5 }}
                                >
                                    <VisibilityIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        ) : null}
                    </Box>
                    {/* 11: 첨부파일 */}
                    <Box sx={{ ...responsiveColumnSx[11], display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {!isFolder && resultObj?.id && ((resultObj.attachments && resultObj.attachments.length > 0) || (resultObj.attachmentCount > 0)) ? (
                            <Tooltip title={t('testExecution.table.viewAttachments')}>
                                <IconButton
                                    size="small"
                                    onClick={() => handleAttachmentClick(resultObj.id)}
                                    sx={{ p: 0.5 }}
                                >
                                    <AttachFileIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        ) : !isFolder ? (
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>-</Typography>
                        ) : null}
                    </Box>
                </Box>
            );
        });

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

            {/* ICT-273: 페이지네이션된 테스트 케이스 목록 */}
            <Box sx={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                {/* 페이지 정보 표시 */}
                <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                        {t('testExecution.pagination.info', {
                            totalItems,
                            start: ((currentPage - 1) * itemsPerPage) + 1,
                            end: Math.min(currentPage * itemsPerPage, totalItems)
                        })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 4 }}>
                        {t('testExecution.pagination.page', { current: currentPage, total: totalPages })}
                    </Typography>
                </Box>

                {/* 페이지네이션된 목록 컨테이너 */}
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
                                indeterminate={selectedTestCases?.size > 0 && selectedTestCases?.size < paginatedData.filter(n => n.type !== 'folder').length}
                                checked={selectedTestCases?.size > 0 && selectedTestCases?.size === paginatedData.filter(n => n.type !== 'folder').length}
                                onChange={(e) => {
                                    const testCaseIds = paginatedData.filter(n => n.type !== 'folder').map(n => n.id);
                                    if (e.target.checked) {
                                        testCaseIds.forEach(id => onSelectionChange?.(id, true));
                                    } else {
                                        testCaseIds.forEach(id => onSelectionChange?.(id, false));
                                    }
                                }}
                                inputProps={{ 'aria-label': t('testExecution.table.selectAll') }}
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
                    {paginatedData.length > 0 ? (
                        renderPaginatedItems(paginatedData)
                    ) : (
                        <Box sx={{ p: 4, textAlign: "center" }}>
                            <Typography variant="body2" color="text.secondary">
                                {t('testExecution.table.noData')}
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* 페이지네이션 컨트롤 */}
                {totalPages > 0 && (
                    <Box sx={{ mt: 2, display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0, gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                                {t('testExecution.pagination.rowsPerPage', '페이지당 행:')}
                            </Typography>
                            <Select
                                value={itemsPerPage}
                                onChange={handleRowsPerPageChange}
                                size="small"
                                variant="outlined"
                                sx={{ height: 32 }}
                            >
                                <MenuItem value={10}>10</MenuItem>
                                <MenuItem value={50}>50</MenuItem>
                                <MenuItem value={100}>100</MenuItem>
                            </Select>
                        </Box>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            showFirstButton
                            showLastButton
                            size="medium"
                        />
                    </Box>
                )}
            </Box>
        </Paper>
    );
};

TestExecutionTable.propTypes = {
    paginatedData: PropTypes.array.isRequired,
    latestResults: PropTypes.array,
    totalItems: PropTypes.number.isRequired,
    totalPages: PropTypes.number.isRequired,
    currentPage: PropTypes.number.isRequired,
    itemsPerPage: PropTypes.number.isRequired,
    handlePageChange: PropTypes.func.isRequired,
    handleRowsPerPageChange: PropTypes.func,
    handleOpenResultForm: PropTypes.func.isRequired,
    handleShowPrevResults: PropTypes.func.isRequired,
    handleAttachmentClick: PropTypes.func.isRequired,
    canEnterResults: PropTypes.bool,
    selectedTestCases: PropTypes.instanceOf(Set),
    onSelectionChange: PropTypes.func,
};

export default TestExecutionTable;
