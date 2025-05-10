// src/components/Login.js

import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useAppContext } from "../context/AppContext";

/**
 * 로그인 및 회원가입 컴포넌트
 * props:
 *   onLoginSuccess(user): 로그인 성공시 호출
 */
const Login = ({ onLoginSuccess }) => {
  const { login, register } = useAppContext();
  const [mode, setMode] = useState("login"); // 'login' or 'register'
  const [form, setForm] = useState({ username: "", password: "", confirm: "", name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setInfo("");
  };

  // 로그인 처리
  const handleLogin = async () => {
    setLoading(true);
    setError("");
    setInfo("");
    try {
      const data = await login({
        username: form.username,
        password: form.password,
      });
      if (data.token) {
        localStorage.setItem("jwtToken", data.token);
        onLoginSuccess({ username: form.username, token: data.token });
      } else {
        setError("로그인 응답이 올바르지 않습니다.");
      }
    } catch (err) {
      setError(err.message || "서버 연결에 실패했습니다.");
    }
    setLoading(false);
  };

  // 회원가입 처리
  const handleRegister = async () => {
    setLoading(true);
    setError("");
    setInfo("");
    if (!form.username || !form.password || !form.confirm) {
      setError("아이디, 비밀번호, 비밀번호 확인을 입력하세요.");
      setLoading(false);
      return;
    }
    if (form.password !== form.confirm) {
      setError("비밀번호가 일치하지 않습니다.");
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
      setInfo("회원가입이 완료되었습니다. 로그인 해주세요.");
      setMode("login");
      setForm({ ...form, password: "", confirm: "" });
    } catch (err) {
      setError(err.message || "서버 연결에 실패했습니다.");
    }
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Paper elevation={3} sx={{ p: 4, minWidth: 350 }}>
        <Typography variant="h5" gutterBottom align="center">
          {mode === "login" ? "로그인" : "회원가입"}
        </Typography>
        <Box component="form" autoComplete="off">
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
          {mode === "register" && (
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
          <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 1 }}>
            {loading && <CircularProgress size={24} sx={{ alignSelf: "center" }} />}
            {mode === "login" ? (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleLogin}
                  disabled={loading}
                >
                  로그인
                </Button>
                <Button
                  color="secondary"
                  fullWidth
                  onClick={() => {
                    setMode("register");
                    setError("");
                    setInfo("");
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
                  onClick={handleRegister}
                  disabled={loading}
                >
                  회원가입 완료
                </Button>
                <Button
                  color="secondary"
                  fullWidth
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setInfo("");
                  }}
                  disabled={loading}
                >
                  로그인 화면으로
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
