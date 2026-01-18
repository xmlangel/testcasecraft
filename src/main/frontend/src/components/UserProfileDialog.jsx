// src/components/UserProfileDialog.jsx
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert,
  Box, Tabs, Tab, Typography, Divider, Card, CardContent, Chip, CircularProgress
} from "@mui/material";
import { useAppContext } from "../context/AppContext.jsx";
import JiraStatusIndicator from "./JiraIntegration/JiraStatusIndicator.jsx";
import JiraConfigDialog from "./JiraSettings/JiraConfigDialog.jsx";
import PasswordChangeForm from "./UserProfile/PasswordChangeForm.jsx";
import { jiraService } from "../services/jiraService.js";
import { LanguageSelector } from "./common/LanguageSelector.jsx";
import { TimezoneSelector } from "./common/TimezoneSelector.jsx";
import { useI18n } from "../context/I18nContext.jsx";
import { VerifiedUser as VerifiedIcon, Warning as WarningIcon, Email as EmailIcon, Refresh as RefreshIcon } from "@mui/icons-material";

/**
 * 사용자 정보 변경 다이얼로그
 * 서버 호출 로직은 AppContext.js로 분리함
 */
function UserProfileDialog({ open, onClose, user, onUserUpdated }) {
  const { updateUserProfile, fetchUserInfo } = useAppContext();
  const { currentLanguage, changeLanguage, t, forceReloadTranslations } = useI18n();

  const [tabValue, setTabValue] = useState(0);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    timezone: user?.timezone || "UTC",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // JIRA 관련 state
  const [jiraConfig, setJiraConfig] = useState(null);
  const [jiraConfigDialogOpen, setJiraConfigDialogOpen] = useState(false);
  const [loadingJiraConfig, setLoadingJiraConfig] = useState(false);

  // 버전 정보 관련 state
  const [versionInfo, setVersionInfo] = useState(null);
  const [versionLoading, setVersionLoading] = useState(false);
  const [versionError, setVersionError] = useState(false);

  // 이메일 인증 관련 state
  const [sendingVerificationEmail, setSendingVerificationEmail] = useState(false);

  // user prop이  변경될 때 form 값도 동기화
  useEffect(() => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
      timezone: user?.timezone || "UTC",
    });
    setError("");
    setSuccess("");
  }, [user, open]);

  // JIRA 설정 로드
  useEffect(() => {
    if (open) {
      loadJiraConfig();
      loadVersionInfo();
    }
  }, [open]);

  // 버전 정보 로드
  const loadVersionInfo = async () => {
    setVersionLoading(true);
    setVersionError(false);
    try {
      const { default: authService } = await import('../services/authService.js');
      const info = await authService.getVersionInfo();
      setVersionInfo(info);
    } catch (error) {
      console.error('버전 정보 로드 실패:', error);
      setVersionError(true);
    } finally {
      setVersionLoading(false);
    }
  };

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

  // 역할 변환 함수
  const getRoleLabel = (role) => {
    const roleMap = {
      'ADMIN': t('role.admin', '시스템 관리자'),
      'MANAGER': t('role.manager', '관리자'),
      'TESTER': t('role.tester', '테스터'),
      'USER': t('role.user', '일반 사용자')
    };
    return roleMap[role] || role;
  };

  // 역할별 색상
  const getRoleColor = (role) => {
    const colorMap = {
      'ADMIN': 'error',
      'MANAGER': 'warning',
      'TESTER': 'info',
      'USER': 'default'
    };
    return colorMap[role] || 'default';
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError(t('profile.validation.allRequired', '이름과 이메일을 모두 입력하세요.'));
      return;
    }
    try {
      const updated = await updateUserProfile({
        name: form.name,
        email: form.email,
        timezone: form.timezone,
      });
      setSuccess(t('profile.success.updated', '정보가 성공적으로 변경되었습니다.'));
      onUserUpdated?.(updated);
      setTimeout(onClose, 700);
    } catch (err) {
      setError(err.message || t('profile.error.updateFailed', '정보 변경에 실패했습니다.'));
    }
  };

  /**
   * 사용자 본인에게 인증 이메일 발송
 */
  const handleSendVerificationEmail = async () => {
    setSendingVerificationEmail(true);

    try {
      const response = await fetch(`/api/auth/me/send-verification-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSuccess(t('profile.email.sent', '인증 이메일이 발송되었습니다. 이메일을 확인하세요.'));
        setError("");
      } else {
        setError(result.message || t('profile.email.failed', '이메일 발송에 실패했습니다.'));
        setSuccess("");
      }
    } catch (error) {
      console.error('Failed to send verification email:', error);
      setError(t('profile.email.error', '이메일 발송 중 오류가 발생했습니다.'));
      setSuccess("");
    } finally {
      setSendingVerificationEmail(false);
    }
  };

  const handleRefreshUserInfo = async () => {
    try {
      await fetchUserInfo();
      setSuccess(t('profile.refresh.success', '사용자 정보를 새로고침했습니다.'));
      setError("");
    } catch (error) {
      console.error('Failed to refresh user info:', error);
      setError(t('profile.refresh.error', '사용자 정보 새로고침에 실패했습니다.'));
      setSuccess("");
    }
  };

  // JIRA 설정 저장
  const handleJiraSave = async (configData) => {
    try {
      const result = await jiraService.saveConfig(configData);

      setJiraConfigDialogOpen(false);
      await loadJiraConfig(); // 설정 새로고침
      setSuccess(t('profile.jira.success.saved', 'JIRA 설정이 저장되었습니다.'));

      // 에러 상태 초기화
      setError("");

    } catch (error) {
      console.error('❌ UserProfileDialog JIRA 설정 저장 실패:', error);

      // 자세한 에러 메시지 제공
      let errorMessage = t('profile.jira.error.saveFailed', 'JIRA 설정 저장에 실패했습니다.');

      if (error.message) {
        if (error.message.includes('네트워크')) {
          errorMessage = t('profile.jira.error.network', '네트워크 연결을 확인해주세요.');
        } else if (error.message.includes('인증')) {
          errorMessage = t('profile.jira.error.authentication', '로그인이 만료되었습니다. 다시 로그인해주세요.');
        } else if (error.message.includes('암호화')) {
          errorMessage = t('profile.jira.error.encryption', '서버 설정에 문제가 있습니다. 관리자에게 문의하세요.');
        } else {
          errorMessage = `${t('profile.jira.error.deleteFailed', '저장 실패')}: ${error.message}`;
        }
      }

      setError(errorMessage);

      // 성공 메시지 초기화
      setSuccess("");
    }
  };

  // JIRA 설정 다이얼로그 열기
  const handleConfigureJira = () => {
    setJiraConfigDialogOpen(true);
  };

  // JIRA 설정 삭제
  const handleDeleteJiraConfig = async () => {
    if (!jiraConfig || !jiraConfig.id) return;

    if (!window.confirm(t('profile.jira.confirm.delete', 'JIRA 설정을 삭제하시겠습니까?'))) {
      return;
    }

    try {
      await jiraService.deleteConfig(jiraConfig.id);
      setJiraConfig(null);
      setSuccess(t('profile.jira.success.deleted', 'JIRA 설정이 삭제되었습니다.'));
    } catch (error) {
      console.error('JIRA 설정 삭제 실패:', error);
      setError(`${t('profile.jira.error.deleteFailed', 'JIRA 설정 삭제 실패')}: ${error.message}`);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth closeAfterTransition={false}>
        <DialogTitle>{t('profile.title', '사용자 프로필')}</DialogTitle>
        <DialogContent sx={{ px: 0 }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{ px: 3 }}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label={t('profile.tabs.basicInfo', '기본 정보')} />
              <Tab label={t('profile.tabs.password', '비밀번호')} />
              <Tab label={t('profile.tabs.language', '언어 설정')} />
              <Tab label={t('profile.tabs.jira', 'JIRA 설정')} />
            </Tabs>
          </Box>

          <Box sx={{ px: 3, py: 2 }}>
            {/* 기본 정보 탭 */}
            {tabValue === 0 && (
              <Box>
                <TextField
                  label={t('profile.form.username', '사용자명')}
                  value={user?.username || ''}
                  fullWidth
                  margin="normal"
                  disabled
                  helperText={t('profile.form.usernameHelper', '사용자명은 변경할 수 없습니다.')}
                />
                <TextField
                  label={t('profile.form.name', '이름')}
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <TextField
                  label={t('profile.form.email', '이메일')}
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  fullWidth
                  margin="normal"
                />
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('profile.form.role', '역할')}
                  </Typography>
                  <Chip
                    label={getRoleLabel(user?.role)}
                    color={getRoleColor(user?.role)}
                    sx={{ mt: 0.5 }}
                  />
                </Box>

                {/* 이메일 인증 상태 */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('profile.form.emailVerification', '이메일 인증 상태')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    {user?.emailVerified ? (
                      <Chip
                        icon={<VerifiedIcon />}
                        label={t('profile.email.verified', '인증 완료')}
                        color="success"
                        size="medium"
                      />
                    ) : (
                      <>
                        <Chip
                          icon={<WarningIcon />}
                          label={t('profile.email.notVerified', '미인증')}
                          color="warning"
                          size="medium"
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={sendingVerificationEmail ? <CircularProgress size={16} /> : <EmailIcon />}
                          onClick={handleSendVerificationEmail}
                          disabled={sendingVerificationEmail}
                        >
                          {t('profile.email.sendButton', '인증 이메일 발송')}
                        </Button>
                      </>
                    )}
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<RefreshIcon />}
                      onClick={handleRefreshUserInfo}
                    >
                      {t('profile.refresh.button', '상태 새로고침')}
                    </Button>
                  </Box>
                  {!user?.emailVerified && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {t('profile.email.helper', '이메일을 인증하면 알림 및 비밀번호 재설정 기능을 사용할 수 있습니다.')}
                    </Typography>
                  )}
                </Box>

                {/* 버전 정보 표시 */}
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  {t('profile.version.title', '버전 정보')}
                </Typography>
                {versionLoading ? (
                  <Typography variant="body2" color="text.secondary">
                    {t('profile.version.loading', '버전 정보 로딩 중...')}
                  </Typography>
                ) : versionError ? (
                  <Typography variant="body2" color="error">
                    {t('profile.version.error', '버전 정보를 불러올 수 없습니다.')}
                  </Typography>
                ) : versionInfo ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('profile.version.backend', '백엔드')}:
                      </Typography>
                      <Chip label={versionInfo.backendVersion} size="small" variant="outlined" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('profile.version.frontend', '프론트엔드')}:
                      </Typography>
                      <Chip label={versionInfo.frontendVersion} size="small" variant="outlined" />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('profile.version.rag', 'RAG 서비스')}:
                      </Typography>
                      <Chip
                        label={versionInfo.ragServiceVersion}
                        size="small"
                        variant="outlined"
                        color={versionInfo.ragServiceVersion === 'N/A' ? 'default' : 'primary'}
                      />
                    </Box>
                  </Box>
                ) : null}
              </Box>
            )}

            {/* 비밀번호 변경 탭 */}
            {tabValue === 1 && (
              <PasswordChangeForm
                onSuccess={(message) => {
                  setSuccess(message);
                  setError("");
                }}
                onError={(message) => {
                  setError(message);
                  setSuccess("");
                }}
              />
            )}

            {/* 언어 설정 탭 */}
            {tabValue === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {t('language.settings.title', '언어 설정')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{
                  marginBottom: "16px"
                }}>
                  {t('language.settings.description', '선호하는 언어를 선택하면 전체 애플리케이션에서 해당 언어로 표시됩니다.')}
                </Typography>

                <Box sx={{ mt: 3 }}>
                  <LanguageSelector
                    label={t('language.interface', '인터페이스 언어')}
                    helperText={t('language.helperText', '변경된 언어는 즉시 적용되며 자동으로 저장됩니다.')}
                    variant="outlined"
                    size="medium"
                    fullWidth={true}
                    showEmoji={true}
                    showNativeName={true}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {t('language.current', '현재 언어')}: <strong>{currentLanguage === 'ko' ? t('language.korean', '한국어') : t('language.english', 'English')}</strong>
                </Typography>

                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" gutterBottom>
                  {t('timezone.settings.title', '시간대 설정')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{
                  marginBottom: "16px"
                }}>
                  {t('timezone.settings.description', '시간대를 설정하면 모든 시간이 선택한 시간대로 표시됩니다.')}
                </Typography>

                <Box sx={{ mt: 3 }}>
                  <TimezoneSelector
                    value={form.timezone}
                    onChange={(newTimezone) => {
                      setForm((prev) => ({ ...prev, timezone: newTimezone }));
                    }}
                    label={t('timezone.label', '시간대')}
                    helperText={t('timezone.helperText', '기본 시간대는 UTC입니다. 변경 사항은 저장 버튼을 눌러야 적용됩니다.')}
                    variant="outlined"
                    size="medium"
                    fullWidth={true}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {t('timezone.current', '현재 시간대')}: <strong>{form.timezone || 'UTC'}</strong>
                </Typography>
              </Box>
            )}

            {/* JIRA 설정 탭 */}
            {tabValue === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  {t('profile.jira.settings.title', 'JIRA 통합 설정')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{
                  marginBottom: "16px"
                }}>
                  {t('profile.jira.settings.description', 'JIRA와 연동하여 테스트 결과를 자동으로 이슈에 코멘트로 추가할 수 있습니다.')}
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
                      {t('profile.jira.button.configure', '설정 수정')}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleDeleteJiraConfig}
                      size="small"
                    >
                      {t('profile.jira.button.delete', '설정 삭제')}
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
          <Button onClick={onClose}>{t('button.close', '닫기')}</Button>
          {(tabValue === 0 || tabValue === 2) && (
            <Button variant="contained" onClick={handleSave}>
              {t('button.save', '저장')}
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
