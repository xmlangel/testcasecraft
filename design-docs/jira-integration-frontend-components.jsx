/**
 * JIRA 통합 시스템 프론트엔드 UI 컴포넌트 설계
 * 사용자별 JIRA API 키 관리 및 테스트 결과 연동 UI
 */

// ==================== JIRA 설정 관리 컴포넌트 ====================

// 1. JiraConfigDialog.jsx - JIRA 설정 다이얼로그
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Alert, CircularProgress,
  FormControlLabel, Switch, Chip, Typography
} from '@mui/material';
import { CheckCircle, Error, Warning, Help } from '@mui/icons-material';

const JiraConfigDialog = ({ open, onClose, onSave, initialConfig }) => {
  const [config, setConfig] = useState({
    jiraServerUrl: '',
    jiraUsername: '',
    apiKey: '',
    jiraProjectKey: '',
    isEnabled: true
  });
  
  const [testing, setTesting] = useState(false);
  const [connectionResult, setConnectionResult] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialConfig) {
      setConfig(prev => ({...prev, ...initialConfig}));
    }
  }, [initialConfig]);

  const handleTestConnection = async () => {
    setTesting(true);
    setConnectionResult(null);
    
    try {
      const response = await fetch('/api/jira-config/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(config)
      });
      
      const result = await response.json();
      setConnectionResult(result);
    } catch (error) {
      setConnectionResult({
        success: false,
        message: '연결 테스트 중 오류가 발생했습니다.',
        status: 'ERROR'
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(config);
      onClose();
    } catch (error) {
      console.error('JIRA 설정 저장 실패:', error);
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONNECTED': return <CheckCircle color="success" />;
      case 'DISCONNECTED': return <Error color="error" />;
      case 'ERROR': return <Warning color="warning" />;
      default: return <Help color="disabled" />;
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>JIRA 연동 설정</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="JIRA 서버 URL"
            value={config.jiraServerUrl}
            onChange={(e) => setConfig(prev => ({...prev, jiraServerUrl: e.target.value}))}
            placeholder="https://your-domain.atlassian.net"
            required
            fullWidth
          />
          
          <TextField
            label="JIRA 사용자명 (이메일)"
            value={config.jiraUsername}
            onChange={(e) => setConfig(prev => ({...prev, jiraUsername: e.target.value}))}
            placeholder="your-email@company.com"
            required
            fullWidth
          />
          
          <TextField
            label="JIRA API 토큰"
            type="password"
            value={config.apiKey}
            onChange={(e) => setConfig(prev => ({...prev, apiKey: e.target.value}))}
            placeholder="API 토큰을 입력하세요"
            required
            fullWidth
            helperText="JIRA 계정 설정에서 API 토큰을 생성하세요"
          />
          
          <TextField
            label="기본 프로젝트 키 (선택사항)"
            value={config.jiraProjectKey}
            onChange={(e) => setConfig(prev => ({...prev, jiraProjectKey: e.target.value}))}
            placeholder="PROJ"
            fullWidth
          />

          <FormControlLabel
            control={
              <Switch
                checked={config.isEnabled}
                onChange={(e) => setConfig(prev => ({...prev, isEnabled: e.target.checked}))}
              />
            }
            label="JIRA 연동 활성화"
          />

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="outlined"
              onClick={handleTestConnection}
              disabled={testing || !config.jiraServerUrl || !config.jiraUsername || !config.apiKey}
            >
              {testing ? <CircularProgress size={20} /> : '연결 테스트'}
            </Button>
            
            {connectionResult && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getStatusIcon(connectionResult.status)}
                <Chip
                  label={connectionResult.status}
                  color={connectionResult.success ? 'success' : 'error'}
                  size="small"
                />
              </Box>
            )}
          </Box>

          {connectionResult && (
            <Alert severity={connectionResult.success ? 'success' : 'error'}>
              {connectionResult.message}
              {connectionResult.serverVersion && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  서버 버전: {connectionResult.serverVersion}
                </Typography>
              )}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || !connectionResult?.success}
        >
          {saving ? <CircularProgress size={20} /> : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// 2. JiraStatusIndicator.jsx - JIRA 연결 상태 표시
const JiraStatusIndicator = ({ status, lastVerified, onClick }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'CONNECTED':
        return { color: 'success', label: '연결됨', icon: <CheckCircle /> };
      case 'DISCONNECTED':
        return { color: 'error', label: '연결 안됨', icon: <Error /> };
      case 'ERROR':
        return { color: 'warning', label: '오류', icon: <Warning /> };
      default:
        return { color: 'default', label: '알 수 없음', icon: <Help /> };
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1, 
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { opacity: 0.8 } : {}
      }}
      onClick={onClick}
    >
      <Chip
        icon={statusConfig.icon}
        label={`JIRA ${statusConfig.label}`}
        color={statusConfig.color}
        size="small"
        variant="outlined"
      />
      {lastVerified && (
        <Typography variant="caption" color="text.secondary">
          {new Date(lastVerified).toLocaleString()}
        </Typography>
      )}
    </Box>
  );
};

// ==================== 테스트 결과 연동 컴포넌트 ====================

// 3. JiraIssueLinker.jsx - JIRA 이슈 연결 컴포넌트
const JiraIssueLinker = ({ testResult, onLink, onComment }) => {
  const [issueKey, setIssueKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [issueInfo, setIssueInfo] = useState(null);

  const handleSearchIssue = async () => {
    if (!issueKey.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/jira-integration/issue/${issueKey}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const info = await response.json();
        setIssueInfo(info);
      } else {
        setIssueInfo(null);
        alert('이슈를 찾을 수 없습니다.');
      }
    } catch (error) {
      console.error('이슈 검색 실패:', error);
      setIssueInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkIssue = async () => {
    if (!issueInfo) return;
    
    try {
      await onLink(testResult.id, issueInfo.issueKey);
      alert('이슈가 연결되었습니다.');
    } catch (error) {
      console.error('이슈 연결 실패:', error);
      alert('이슈 연결에 실패했습니다.');
    }
  };

  const handleAddComment = () => {
    if (issueInfo) {
      onComment(testResult, issueInfo.issueKey);
    }
  };

  return (
    <Box sx={{ p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
      <Typography variant="h6" gutterBottom>
        JIRA 이슈 연동
      </Typography>
      
      {testResult.jiraIssueKey ? (
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Chip
              label={testResult.jiraIssueKey}
              color="primary"
              clickable
              onClick={() => window.open(testResult.jiraIssueUrl, '_blank')}
            />
            <Typography variant="body2" color="success.main">
              연결됨
            </Typography>
          </Box>
          
          <Button
            variant="outlined"
            size="small"
            onClick={handleAddComment}
            disabled={testResult.result !== 'FAIL'}
          >
            실패 정보 코멘트 추가
          </Button>
        </Box>
      ) : (
        <Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              size="small"
              placeholder="이슈 키 입력 (예: PROJ-123)"
              value={issueKey}
              onChange={(e) => setIssueKey(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchIssue()}
            />
            <Button
              variant="outlined"
              onClick={handleSearchIssue}
              disabled={loading || !issueKey.trim()}
              size="small"
            >
              {loading ? <CircularProgress size={16} /> : '검색'}
            </Button>
          </Box>
          
          {issueInfo && (
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2">{issueInfo.summary}</Typography>
              <Typography variant="body2" color="text.secondary">
                상태: {issueInfo.status} | 담당자: {issueInfo.assignee || '없음'}
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleLinkIssue}
                >
                  이슈 연결
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

// 4. JiraCommentDialog.jsx - JIRA 코멘트 작성 다이얼로그
const JiraCommentDialog = ({ open, onClose, testResult, issueKey, onSubmit }) => {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && testResult) {
      const autoComment = generateAutoComment(testResult);
      setComment(autoComment);
    }
  }, [open, testResult]);

  const generateAutoComment = (testResult) => {
    return `테스트 실패 상세 정보:

테스트케이스: ${testResult.testCaseName || 'N/A'}
실행 시간: ${new Date(testResult.executedAt).toLocaleString()}
결과: ${testResult.result}

실패 사유:
${testResult.notes || '상세 정보 없음'}

추가 분석이 필요합니다.`;
  };

  const handleSubmit = async () => {
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        issueKey,
        comment,
        testResultId: testResult.id,
        testCaseId: testResult.testCaseId,
        testCaseName: testResult.testCaseName,
        failureReason: testResult.notes,
        executedAt: testResult.executedAt
      });
      onClose();
      setComment('');
    } catch (error) {
      console.error('코멘트 추가 실패:', error);
      alert('코멘트 추가에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>JIRA 이슈에 코멘트 추가</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Chip label={issueKey} color="primary" />
        </Box>
        <TextField
          multiline
          rows={8}
          fullWidth
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="실패 분석 및 추가 정보를 입력하세요..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || !comment.trim()}
        >
          {submitting ? <CircularProgress size={20} /> : '코멘트 추가'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ==================== 통합 컨테이너 컴포넌트 ====================

// 5. JiraIntegrationContainer.jsx - JIRA 통합 기능 컨테이너
const JiraIntegrationContainer = ({ children }) => {
  const [jiraConfig, setJiraConfig] = useState(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedTestResult, setSelectedTestResult] = useState(null);
  const [selectedIssueKey, setSelectedIssueKey] = useState('');

  useEffect(() => {
    loadJiraConfig();
  }, []);

  const loadJiraConfig = async () => {
    try {
      const response = await fetch('/api/jira-config/my-config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        const config = await response.json();
        setJiraConfig(config);
      }
    } catch (error) {
      console.error('JIRA 설정 로드 실패:', error);
    }
  };

  const handleSaveConfig = async (configData) => {
    try {
      const response = await fetch('/api/jira-config/my-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(configData)
      });
      
      if (response.ok) {
        await loadJiraConfig();
      }
    } catch (error) {
      console.error('JIRA 설정 저장 실패:', error);
      throw error;
    }
  };

  const handleLinkIssue = async (testResultId, issueKey) => {
    try {
      await fetch('/api/jira-integration/link-test-result', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: new URLSearchParams({
          testResultId,
          issueKey
        })
      });
    } catch (error) {
      console.error('이슈 연결 실패:', error);
      throw error;
    }
  };

  const handleAddComment = (testResult, issueKey) => {
    setSelectedTestResult(testResult);
    setSelectedIssueKey(issueKey);
    setCommentDialogOpen(true);
  };

  const handleSubmitComment = async (commentRequest) => {
    try {
      await fetch('/api/jira-integration/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(commentRequest)
      });
    } catch (error) {
      console.error('코멘트 추가 실패:', error);
      throw error;
    }
  };

  return (
    <Box>
      {/* JIRA 상태 헤더 */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <JiraStatusIndicator
          status={jiraConfig?.connectionStatus}
          lastVerified={jiraConfig?.lastVerifiedAt}
          onClick={() => setConfigDialogOpen(true)}
        />
        <Button
          variant="outlined"
          size="small"
          onClick={() => setConfigDialogOpen(true)}
        >
          JIRA 설정
        </Button>
      </Box>

      {/* 자식 컴포넌트에 JIRA 기능 제공 */}
      {React.cloneElement(children, {
        jiraConfig,
        onLinkIssue: handleLinkIssue,
        onAddComment: handleAddComment,
        jiraEnabled: jiraConfig?.isEnabled && jiraConfig?.connectionStatus === 'CONNECTED'
      })}

      {/* 다이얼로그들 */}
      <JiraConfigDialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        onSave={handleSaveConfig}
        initialConfig={jiraConfig}
      />

      <JiraCommentDialog
        open={commentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
        testResult={selectedTestResult}
        issueKey={selectedIssueKey}
        onSubmit={handleSubmitComment}
      />
    </Box>
  );
};

export {
  JiraConfigDialog,
  JiraStatusIndicator,
  JiraIssueLinker,
  JiraCommentDialog,
  JiraIntegrationContainer
};