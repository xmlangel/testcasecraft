// src/components/UserProfileDialog.jsx
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert,
  Box, Tabs, Tab, Typography, Divider, Card, CardContent
} from "@mui/material";
import { useAppContext } from "../context/AppContext.jsx";
import JiraStatusIndicator from "./JiraIntegration/JiraStatusIndicator.jsx";
import JiraConfigDialog from "./JiraSettings/JiraConfigDialog.jsx";
import { jiraService } from "../services/jiraService.js";

/**
 * 사용자 정보 변경 다이얼로그
 * 서버 호출 로직은 AppContext.js로 분리함
 */
function UserProfileDialog({ open, onClose, user, onUserUpdated }) {
  const { updateUserProfile } = useAppContext();

  const [tabValue, setTabValue] = useState(0);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // JIRA 관련 state
  const [jiraConfig, setJiraConfig] = useState(null);
  const [jiraConfigDialogOpen, setJiraConfigDialogOpen] = useState(false);
  const [loadingJiraConfig, setLoadingJiraConfig] = useState(false);

  // user prop이 변경될 때 form 값도 동기화
  useEffect(() => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
    });
    setError("");
    setSuccess("");
  }, [user, open]);

  // JIRA 설정 로드
  useEffect(() => {
    if (open) {
      loadJiraConfig();
    }
  }, [open]);

  // JIRA 설정 로드
  const loadJiraConfig = async () => {
    setLoadingJiraConfig(true);
    try {
      const config = await jiraService.getActiveConfig();
      setJiraConfig(config);
    } catch (error) {
      console.error('JIRA 설정 로드 실패:', error);
      setJiraConfig(null);
    } finally {
      setLoadingJiraConfig(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setError("");
    setSuccess("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError("이름과 이메일을 모두 입력하세요.");
      return;
    }
    try {
      const updated = await updateUserProfile({
        name: form.name,
        email: form.email,
      });
      setSuccess("정보가 성공적으로 변경되었습니다.");
      onUserUpdated?.(updated);
      setTimeout(onClose, 700);
    } catch (err) {
      setError(err.message || "정보 변경에 실패했습니다.");
    }
  };

  // JIRA 설정 저장
  const handleJiraSave = async (configData) => {
    try {
      await jiraService.saveConfig(configData);
      setJiraConfigDialogOpen(false);
      await loadJiraConfig(); // 설정 새로고침
      setSuccess("JIRA 설정이 저장되었습니다.");
    } catch (error) {
      console.error('JIRA 설정 저장 실패:', error);
      setError(`JIRA 설정 저장 실패: ${error.message}`);
    }
  };

  // JIRA 설정 다이얼로그 열기
  const handleConfigureJira = () => {
    setJiraConfigDialogOpen(true);
  };

  // JIRA 설정 삭제
  const handleDeleteJiraConfig = async () => {
    if (!jiraConfig || !jiraConfig.id) return;
    
    if (!window.confirm('JIRA 설정을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await jiraService.deleteConfig(jiraConfig.id);
      setJiraConfig(null);
      setSuccess("JIRA 설정이 삭제되었습니다.");
    } catch (error) {
      console.error('JIRA 설정 삭제 실패:', error);
      setError(`JIRA 설정 삭제 실패: ${error.message}`);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth closeAfterTransition={false}>
        <DialogTitle>사용자 프로필</DialogTitle>
        <DialogContent sx={{ px: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              sx={{ px: 3 }}
              variant="fullWidth"
            >
              <Tab label="기본 정보" />
              <Tab label="JIRA 설정" />
            </Tabs>
          </Box>

          <Box sx={{ px: 3, py: 2 }}>
            {/* 기본 정보 탭 */}
            {tabValue === 0 && (
              <Box>
                <TextField
                  label="이름"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label="이메일"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
              </Box>
            )}

            {/* JIRA 설정 탭 */}
            {tabValue === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  JIRA 통합 설정
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  JIRA와 연동하여 테스트 결과를 자동으로 이슈에 코멘트로 추가할 수 있습니다.
                </Typography>
                
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <JiraStatusIndicator 
                      onConfigureClick={handleConfigureJira}
                      autoRefresh={true}
                      refreshInterval={60000} // 1분
                    />
                  </CardContent>
                </Card>

                {jiraConfig && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    <Button
                      variant="outlined"
                      onClick={handleConfigureJira}
                      size="small"
                    >
                      설정 수정
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleDeleteJiraConfig}
                      size="small"
                    >
                      설정 삭제
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            {/* 공통 에러/성공 메시지 */}
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {success}
              </Alert>
            )}
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>닫기</Button>
          {tabValue === 0 && (
            <Button variant="contained" onClick={handleSave}>
              저장
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* JIRA 설정 다이얼로그 */}
      <JiraConfigDialog
        open={jiraConfigDialogOpen}
        onClose={() => setJiraConfigDialogOpen(false)}
        onSave={handleJiraSave}
        existingConfig={jiraConfig}
      />
    </>
  );
}

UserProfileDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object,
  onUserUpdated: PropTypes.func,
};

export default UserProfileDialog;
