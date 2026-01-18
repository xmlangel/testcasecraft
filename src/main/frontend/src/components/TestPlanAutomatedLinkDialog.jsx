import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Typography,
    Box,
    CircularProgress,
    Chip,
    InputAdornment,
    Alert
} from '@mui/material';
import { Search, Link as LinkIcon, CheckCircle, Cancel } from '@mui/icons-material';
import { useI18n } from '../context/I18nContext';
import { useAppContext } from '../context/AppContext';
import { formatDateSafe } from '../utils/dateUtils';

const TestPlanAutomatedLinkDialog = ({ open, onClose, testPlanId, onLinkComplete }) => {
    const { t } = useI18n();
    const { api, activeProject } = useAppContext();

    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [linkedResults, setLinkedResults] = useState([]);
    const [error, setError] = useState(null);

    // Fetch linked results
    const fetchLinkedResults = useCallback(async () => {
        if (!testPlanId) return;
        try {
            const response = await api(`/api/junit-results/by-plan/${testPlanId}`);
            if (response.ok) {
                const data = await response.json();
                setLinkedResults(data.content || []);
            }
        } catch (err) {
            console.error('Failed to fetch linked results:', err);
        }
    }, [api, testPlanId]);

    // Search results
    const searchResults = useCallback(async () => {
        if (!activeProject?.id) return;
        setLoading(true);
        setError(null);
        try {
            // If search term is empty, fetch recent results
            // Note: Backend search API needs to be implemented or we use the list API with filtering
            // For now, let's use the project list API and filter client-side or use the search endpoint if available
            // Assuming we use the list endpoint for simplicity as per current backend capabilities
            const response = await api(`/api/junit-results/projects/${activeProject.id}?size=50`);
            if (response.ok) {
                const data = await response.json();
                let content = data.content || [];

                if (searchTerm) {
                    const lowerTerm = searchTerm.toLowerCase();
                    content = content.filter(r =>
                        (r.testExecutionName && r.testExecutionName.toLowerCase().includes(lowerTerm)) ||
                        (r.fileName && r.fileName.toLowerCase().includes(lowerTerm))
                    );
                }
                setResults(content);
            } else {
                setError('Failed to fetch results');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [api, activeProject, searchTerm]);

    useEffect(() => {
        if (open) {
            fetchLinkedResults();
            searchResults();
        }
    }, [open, fetchLinkedResults, searchResults]);

    const handleLink = async (result) => {
        try {
            const response = await api(`/api/junit-results/${result.id}/link-plan`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ testPlanId })
            });

            if (response.ok) {
                // Refresh lists
                await fetchLinkedResults();
                // Update local results state to reflect change
                setResults(prev => prev.map(r =>
                    r.id === result.id ? { ...r, testPlanId: testPlanId } : r
                ));
                onLinkComplete?.();
            } else {
                throw new Error('Failed to link');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUnlink = async (result) => {
        try {
            const response = await api(`/api/junit-results/${result.id}/link-plan`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ testPlanId: null })
            });

            if (response.ok) {
                await fetchLinkedResults();
                setResults(prev => prev.map(r =>
                    r.id === result.id ? { ...r, testPlanId: null } : r
                ));
                onLinkComplete?.();
            } else {
                throw new Error('Failed to unlink');
            }
        } catch (err) {
            setError(err.message);
        }
    };

    const isLinked = (resultId) => {
        return linkedResults.some(r => r.id === resultId);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth disableRestoreFocus>
            <DialogTitle>
                {t('testPlan.linkAutomated.title', '자동화 테스트 연결')}
            </DialogTitle>
            <DialogContent dividers>
                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        placeholder={t('testPlan.linkAutomated.searchPlaceholder', '실행 이름 또는 파일명으로 검색')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && searchResults()}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Button onClick={searchResults} disabled={loading}>
                                            {t('common.search', '검색')}
                                        </Button>
                                    </InputAdornment>
                                )
                            }
                        }}
                    />
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <List>
                        {results.map((result) => {
                            const linked = isLinked(result.id);
                            const linkedToOther = result.testPlanId && result.testPlanId !== testPlanId;

                            return (
                                <ListItem key={result.id} divider>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="subtitle1">
                                                    {result.testExecutionName || result.fileName}
                                                </Typography>
                                                <Chip
                                                    label={result.status}
                                                    size="small"
                                                    color={result.status === 'COMPLETED' ? 'success' : 'default'}
                                                />
                                                {linked && <Chip label="Linked" size="small" color="primary" icon={<CheckCircle />} />}
                                                {linkedToOther && <Chip label="Linked to other plan" size="small" color="warning" />}
                                            </Box>
                                        }
                                        secondary={
                                            <>
                                                <Typography variant="body2" component="span" display="block">
                                                    {formatDateSafe(result.uploadedAt)} | Tests: {result.totalTests} (Pass: {result.totalTests - result.failures - result.errors - result.skipped})
                                                </Typography>
                                                {result.testExecutionName && result.fileName !== result.testExecutionName && (
                                                    <Typography variant="caption" color="textSecondary">
                                                        File: {result.fileName}
                                                    </Typography>
                                                )}
                                            </>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        {linked ? (
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                size="small"
                                                onClick={() => handleUnlink(result)}
                                                startIcon={<Cancel />}
                                            >
                                                {t('common.unlink', '연결 해제')}
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                size="small"
                                                onClick={() => handleLink(result)}
                                                disabled={linkedToOther}
                                                startIcon={<LinkIcon />}
                                            >
                                                {t('common.link', '연결')}
                                            </Button>
                                        )}
                                    </ListItemSecondaryAction>
                                </ListItem>
                            );
                        })}
                        {results.length === 0 && (
                            <Typography align="center" color="textSecondary" sx={{ py: 3 }}>
                                {t('common.noResults', '검색 결과가 없습니다.')}
                            </Typography>
                        )}
                    </List>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>
                    {t('common.close', '닫기')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

TestPlanAutomatedLinkDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    testPlanId: PropTypes.string,
    onLinkComplete: PropTypes.func
};

export default TestPlanAutomatedLinkDialog;
