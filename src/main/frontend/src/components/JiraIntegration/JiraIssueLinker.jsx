// src/components/JiraIntegration/JiraIssueLinker.jsx
import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    Card,
    CardContent,
    Typography,
    Alert,
    CircularProgress,
    IconButton,
    Chip,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    Tooltip,
    Autocomplete,
    InputAdornment
} from '@mui/material';
import {
    Search as SearchIcon,
    Link as LinkIcon,
    Launch as LaunchIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    BugReport as BugReportIcon
} from '@mui/icons-material';
import { jiraService } from '../../services/jiraService';
import { useTheme } from '@mui/material/styles';

const JiraIssueLinker = ({
    testResult = null,
    onIssueLinked = null,
    onIssueUnlinked = null,
    linkedIssues = [],
    disabled = false
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [jiraStatus, setJiraStatus] = useState(null);
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [recentIssues, setRecentIssues] = useState([]);
    // ICT-184: 이슈 존재 여부 검증 상태
    const [issueValidation, setIssueValidation] = useState({ status: null, message: null });
    const [validationLoading, setValidationLoading] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        checkJiraStatus();
        loadRecentIssues();
    }, []);

    // ICT-184: 검색어 변경 시 실시간 검증
    useEffect(() => {
        const validateIssueKey = async () => {
            const query = searchQuery.trim();

            // 빈 입력이거나 JIRA 이슈 키 패턴이 아니면 검증 안함
            if (!query || !jiraService.isValidIssueKey(query)) {
                setIssueValidation({ status: null, message: null });
                return;
            }

            setValidationLoading(true);

            try {
                const result = await jiraService.checkIssueExists(query);

                if (result.exists) {
                    setIssueValidation({
                        status: 'success',
                        message: `✅ ${result.issueKey}: ${result.summary || '이슈가 존재합니다'}`
                    });
                } else {
                    setIssueValidation({
                        status: 'error',
                        message: result.errorMessage || '이슈를 찾을 수 없습니다'
                    });
                }
            } catch (error) {
                console.error('이슈 검증 실패:', error);
                setIssueValidation({
                    status: 'error',
                    message: '이슈 검증 중 오류가 발생했습니다'
                });
            } finally {
                setValidationLoading(false);
            }
        };

        // 300ms 디바운스
        const debounceTimer = setTimeout(validateIssueKey, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const checkJiraStatus = async () => {
        try {
            const status = await jiraService.getConnectionStatus();
            setJiraStatus(status);

            if (!status.hasConfig || !status.isConnected) {
                setError('JIRA 설정이 없거나 연결에 실패했습니다.');
            }
        } catch (error) {
            console.error('JIRA 상태 확인 실패:', error);
            setError('JIRA 연결 상태를 확인할 수 없습니다.');
        }
    };

    const loadRecentIssues = async () => {
        try {
            // 최근 검색한 이슈들을 로컬 스토리지에서 불러오기
            const recent = localStorage.getItem('jira-recent-issues');
            if (recent) {
                setRecentIssues(JSON.parse(recent));
            }
        } catch (error) {
            console.error('최근 이슈 로드 실패:', error);
        }
    };

    const saveRecentIssue = (issue) => {
        try {
            const recent = [...recentIssues];
            const existingIndex = recent.findIndex(r => r.key === issue.key);

            if (existingIndex >= 0) {
                recent.splice(existingIndex, 1);
            }

            recent.unshift(issue);
            const limitedRecent = recent.slice(0, 5); // 최대 5개까지만 저장

            setRecentIssues(limitedRecent);
            localStorage.setItem('jira-recent-issues', JSON.stringify(limitedRecent));
        } catch (error) {
            console.error('최근 이슈 저장 실패:', error);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setError('검색어를 입력하세요.');
            return;
        }

        // ICT-184: 존재하지 않는 이슈 검색 방지
        if (issueValidation.status === 'error' && jiraService.isValidIssueKey(searchQuery.trim())) {
            setError(`이슈 ${searchQuery.trim()}가 존재하지 않아 검색할 수 없습니다.`);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const results = await jiraService.searchIssues(searchQuery.trim());
            setSearchResults(results || []);

            if (!results || results.length === 0) {
                setError('검색 결과가 없습니다.');
            }
        } catch (error) {
            console.error('JIRA 이슈 검색 실패:', error);
            setError(jiraService.getUserFriendlyErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const handleIssueSelect = async (issue) => {
        try {
            // 이슈 상세 정보 로드
            const detailedIssue = await jiraService.getIssueDetails(issue.key);
            setSelectedIssue(detailedIssue);
            saveRecentIssue(detailedIssue);
        } catch (error) {
            console.error('이슈 상세 정보 로드 실패:', error);
            setError('이슈 정보를 불러올 수 없습니다.');
        }
    };

    const handleLinkIssue = (issue) => {
        if (onIssueLinked) {
            onIssueLinked(issue);
        }
        setSelectedIssue(null);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleUnlinkIssue = (issueKey) => {
        if (onIssueUnlinked) {
            onIssueUnlinked(issueKey);
        }
    };

    const getIssueTypeIcon = (issueType) => {
        const type = issueType?.toLowerCase() || '';
        if (type.includes('bug')) return <BugReportIcon color="error" />;
        if (type.includes('task')) return <CheckCircleIcon color="primary" />;
        if (type.includes('story')) return <CheckCircleIcon color="success" />;
        return <LinkIcon />;
    };

    const getPriorityColor = (priority) => {
        const p = priority?.toLowerCase() || '';
        if (p.includes('highest') || p.includes('critical')) return 'error';
        if (p.includes('high')) return 'warning';
        if (p.includes('medium')) return 'info';
        return 'default';
    };

    const getStatusColor = (status) => {
        const s = status?.toLowerCase() || '';
        if (s.includes('done') || s.includes('완료')) return 'success';
        if (s.includes('progress') || s.includes('진행')) return 'warning';
        if (s.includes('todo') || s.includes('해야')) return 'default';
        return 'info';
    };

    const openJiraIssue = (issueKey) => {
        if (jiraStatus?.serverUrl) {
            const url = `${jiraStatus.serverUrl}/browse/${issueKey}`;
            window.open(url, '_blank');
        }
    };

    if (!jiraStatus?.hasConfig || !jiraStatus?.isConnected) {
        return (
            <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                    JIRA 이슈 연동을 사용하려면 먼저 JIRA 설정을 완료해주세요.
                </Typography>
            </Alert>
        );
    }

    return (
        <Box>
            {/* 연결된 이슈 목록 */}
            {linkedIssues.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        연결된 JIRA 이슈:
                    </Typography>
                    <List dense>
                        {linkedIssues.map((issue) => (
                            <ListItem key={issue.key} divider>
                                <ListItemIcon>
                                    {getIssueTypeIcon(issue.issueType)}
                                </ListItemIcon>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Typography variant="body2" fontWeight="bold">
                                                {issue.key}
                                            </Typography>
                                            <Chip
                                                size="small"
                                                label={issue.status}
                                                color={getStatusColor(issue.status)}
                                                variant="outlined"
                                            />
                                            {issue.priority && (
                                                <Chip
                                                    size="small"
                                                    label={issue.priority}
                                                    color={getPriorityColor(issue.priority)}
                                                    variant="outlined"
                                                />
                                            )}
                                        </Box>
                                    }
                                    secondary={issue.summary}
                                />
                                <ListItemSecondaryAction>
                                    <Tooltip title="JIRA에서 열기">
                                        <IconButton
                                            size="small"
                                            onClick={() => openJiraIssue(issue.key)}
                                        >
                                            <LaunchIcon />
                                        </IconButton>
                                    </Tooltip>
                                    {!disabled && (
                                        <Tooltip title="연결 해제">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleUnlinkIssue(issue.key)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            )}
            {!disabled && (
                <>
                    {/* 이슈 검색 */}
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                            JIRA 이슈 검색 및 연결:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            <TextField
                                fullWidth
                                size="small"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="이슈 키 또는 제목으로 검색 (예: TEST-123, '버그 수정')"
                                disabled={loading}
                                // ICT-184: 실시간 검증 결과에 따른 색상 변경
                                color={
                                    issueValidation.status === 'success' ? 'success' :
                                        issueValidation.status === 'error' ? 'error' : 'primary'
                                }
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                        // ICT-184: 검증 로딩 및 결과 아이콘 표시
                                        endAdornment: validationLoading || issueValidation.status ? (
                                            <InputAdornment position="end">
                                                {validationLoading ? (
                                                    <CircularProgress size={16} />
                                                ) : issueValidation.status === 'success' ? (
                                                    <CheckCircleIcon color="success" fontSize="small" />
                                                ) : issueValidation.status === 'error' ? (
                                                    <ErrorIcon color="error" fontSize="small" />
                                                ) : null}
                                            </InputAdornment>
                                        ) : null
                                    }
                                }}
                            />
                            <Button
                                variant="outlined"
                                onClick={handleSearch}
                                disabled={loading || !searchQuery.trim()}
                                startIcon={loading ? <CircularProgress size={16} /> : <SearchIcon />}
                            >
                                검색
                            </Button>
                        </Box>

                        {/* ICT-184: 실시간 검증 메시지 표시 */}
                        {issueValidation.status && issueValidation.message && (
                            <Alert
                                severity={issueValidation.status === 'success' ? 'success' : 'error'}
                                sx={{ mb: 1, fontSize: '0.875rem' }}
                                variant="outlined"
                            >
                                {issueValidation.message}
                            </Alert>
                        )}
                    </Box>

                    {/* 에러 메시지 */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {/* 최근 이슈 목록 */}
                    {recentIssues.length > 0 && searchResults.length === 0 && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color="text.secondary" gutterBottom>
                                최근 검색한 이슈:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {recentIssues.map((issue) => (
                                    <Chip
                                        key={issue.key}
                                        size="small"
                                        label={`${issue.key}: ${issue.summary?.slice(0, 30)}...`}
                                        clickable
                                        onClick={() => handleIssueSelect(issue)}
                                        icon={getIssueTypeIcon(issue.issueType)}
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* 검색 결과 */}
                    {searchResults.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                검색 결과:
                            </Typography>
                            <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                                {searchResults.map((issue) => (
                                    <ListItem
                                        key={issue.key}
                                        button
                                        onClick={() => handleIssueSelect(issue)}
                                        divider
                                    >
                                        <ListItemIcon>
                                            {getIssueTypeIcon(issue.issueType)}
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {issue.key}
                                                    </Typography>
                                                    <Chip
                                                        size="small"
                                                        label={issue.status}
                                                        color={getStatusColor(issue.status)}
                                                        variant="outlined"
                                                    />
                                                </Box>
                                            }
                                            secondary={issue.summary}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    )}

                    {/* 선택된 이슈 상세 */}
                    {selectedIssue && (
                        <Card sx={{ mb: 2 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    {getIssueTypeIcon(selectedIssue.issueType)}
                                    <Typography variant="h6">
                                        {selectedIssue.key}
                                    </Typography>
                                    <Chip
                                        size="small"
                                        label={selectedIssue.status}
                                        color={getStatusColor(selectedIssue.status)}
                                    />
                                    {selectedIssue.priority && (
                                        <Chip
                                            size="small"
                                            label={selectedIssue.priority}
                                            color={getPriorityColor(selectedIssue.priority)}
                                        />
                                    )}
                                </Box>

                                <Typography variant="body1" gutterBottom>
                                    {selectedIssue.summary}
                                </Typography>

                                {selectedIssue.description && (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            maxHeight: '100px',
                                            overflow: 'auto',
                                            whiteSpace: 'pre-line'
                                        }}
                                    >
                                        {selectedIssue.description}
                                    </Typography>
                                )}

                                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={() => handleLinkIssue(selectedIssue)}
                                        disabled={linkedIssues.some(li => li.key === selectedIssue.key)}
                                    >
                                        {linkedIssues.some(li => li.key === selectedIssue.key) ? '이미 연결됨' : '연결'}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<LaunchIcon />}
                                        onClick={() => openJiraIssue(selectedIssue.key)}
                                    >
                                        JIRA에서 열기
                                    </Button>
                                    <Button
                                        variant="text"
                                        onClick={() => setSelectedIssue(null)}
                                    >
                                        취소
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </Box>
    );
};

export default JiraIssueLinker;