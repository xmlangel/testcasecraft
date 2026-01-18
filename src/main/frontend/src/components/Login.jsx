// src/components/Login.jsx

import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useAppContext } from '../context/AppContext.jsx';
import { useTranslation } from '../context/I18nContext.jsx';
import { InlineLanguageToggle } from './common/LanguageSelector.jsx';

const Login = ({ onLoginSuccess }) => {
  const { login, register } = useAppContext();
  const { t } = useTranslation();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirm: '',
    name: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
    setInfo('');
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    setInfo('');
    try {
      const data = await login({ username: form.username, password: form.password });
      if (data.accessToken && data.refreshToken) {
        onLoginSuccess(data);
        // 로그인 성공 후 포커스를 body로 이동시켜 프로필 메뉴 자동 오픈 방지
        setTimeout(() => {
          if (document && document.body) {
            document.body.focus();
          }
        }, 0);
      } else {
        setError(t('login.error.failed', '로그인에 실패했습니다.'));
      }
    } catch (err) {
      setError(err.message || t('login.error.general', '로그인 중 오류가 발생했습니다.'));
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    setInfo('');
    if (!form.username || !form.password || !form.confirm) {
      setError(t('validation.required.all', '모든 필드를 입력해주세요.'));
      setLoading(false);
      return;
    }
    if (form.password !== form.confirm) {
      setError(t('validation.password.mismatch', '비밀번호가 일치하지 않습니다.'));
      setLoading(false);
      return;
    }
    try {
      await register({
        username: form.username,
        password: form.password,
        name: form.name,
        email: form.email,
      });
      setInfo(t('register.success', '회원가입이 완료되었습니다. 로그인 해주세요.'));
      setMode('login');
      setForm({ ...form, password: '', confirm: '' });
    } catch (err) {
      setError(err.message || t('register.error.general', '회원가입 중 오류가 발생했습니다.'));
    }
    setLoading(false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (loading) return;
    if (mode === 'login') {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      {/* 언어 선택기 */}
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <InlineLanguageToggle />
      </Box>

      <Paper elevation={3} sx={{ p: 4, minWidth: 350 }}>
        <Typography variant="h5" gutterBottom align="center">
          {mode === 'login' ? t('login.title', '로그인') : t('register.title', '회원가입')}
        </Typography>
        <Box
          component="form"
          autoComplete="off"
          onSubmit={handleFormSubmit}
        >
          <TextField
            label={t('login.username', '아이디')}
            name="username"
            value={form.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={loading}
            autoFocus
            data-testid="login-username-input"
          />
          <TextField
            label={t('login.password', '비밀번호')}
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={loading}
            data-testid="login-password-input"
          />
          {mode === 'register' && (
            <>
              <TextField
                label={t('register.confirm_password', '비밀번호 확인')}
                name="confirm"
                type="password"
                value={form.confirm}
                onChange={handleChange}
                fullWidth
                margin="normal"
                disabled={loading}
                data-testid="register-confirm-password-input"
              />
              <TextField
                label={t('register.name', '이름')}
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                margin="normal"
                disabled={loading}
                data-testid="register-name-input"
              />
              <TextField
                label={t('register.email', '이메일')}
                name="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
                disabled={loading}
                data-testid="register-email-input"
              />
            </>
          )}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {info && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {info}
            </Alert>
          )}
          <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
            {loading ? (
              <CircularProgress size={24} sx={{ alignSelf: 'center' }} />
            ) : mode === 'login' ? (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  type="submit"
                  disabled={loading}
                  data-testid="login-submit-button"
                >
                  {t('login.button', '로그인')}
                </Button>
                <Button
                  color="secondary"
                  fullWidth
                  onClick={() => {
                    setMode('register');
                    setError('');
                    setInfo('');
                  }}
                  disabled={loading}
                  data-testid="login-switch-to-register-button"
                >
                  {t('register.switch', '회원가입')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  type="submit"
                  disabled={loading}
                  data-testid="register-submit-button"
                >
                  {t('register.button', '회원가입')}
                </Button>
                <Button
                  color="secondary"
                  fullWidth
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setInfo('');
                  }}
                  disabled={loading}
                  data-testid="register-switch-to-login-button"
                >
                  {t('login.back', '로그인으로 돌아가기')}
                </Button>
              </>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;
