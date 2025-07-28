// src/components/Login.jsx

import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, CircularProgress } from '@mui/material';
import { useAppContext } from '../context/AppContext.jsx';

const Login = ({ onLoginSuccess }) => {
  const { login, register } = useAppContext();
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
        setError('로그인에 실패했습니다.');
      }
    } catch (err) {
      setError(err.message || '로그인 중 오류가 발생했습니다.');
    }
    setLoading(false);
  };

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    setInfo('');
    if (!form.username || !form.password || !form.confirm) {
      setError('모든 필드를 입력해주세요.');
      setLoading(false);
      return;
    }
    if (form.password !== form.confirm) {
      setError('비밀번호가 일치하지 않습니다.');
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
      setInfo('회원가입이 완료되었습니다. 로그인 해주세요.');
      setMode('login');
      setForm({ ...form, password: '', confirm: '' });
    } catch (err) {
      setError(err.message || '회원가입 중 오류가 발생했습니다.');
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
        bgcolor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper elevation={3} sx={{ p: 4, minWidth: 350 }}>
        <Typography variant="h5" gutterBottom align="center">
          {mode === 'login' ? '로그인' : '회원가입'}
        </Typography>
        <Box
          component="form"
          autoComplete="off"
          onSubmit={handleFormSubmit}
        >
          <TextField
            label="아이디"
            name="username"
            value={form.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={loading}
            autoFocus
          />
          <TextField
            label="비밀번호"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            disabled={loading}
          />
          {mode === 'register' && (
            <>
              <TextField
                label="비밀번호 확인"
                name="confirm"
                type="password"
                value={form.confirm}
                onChange={handleChange}
                fullWidth
                margin="normal"
                disabled={loading}
              />
              <TextField
                label="이름"
                name="name"
                value={form.name}
                onChange={handleChange}
                fullWidth
                margin="normal"
                disabled={loading}
              />
              <TextField
                label="이메일"
                name="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
                disabled={loading}
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
                >
                  로그인
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
                >
                  회원가입
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
                >
                  회원가입
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
                >
                  로그인으로 돌아가기
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
