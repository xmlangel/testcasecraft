// src/components/ProtectedRoute.jsx
import React from 'react';
import { CircularProgress, Box } from '@mui/material';
import { useAppContext } from '../context/AppContext';
import Login from './Login';

const ProtectedRoute = ({ children }) => {
  const { user, loadingUser, handleLoginSuccess } = useAppContext();

  // 로딩 중인 경우 로딩 표시
  if (loadingUser) {
    return (
      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // 인증되지 않은 경우 로그인 페이지 표시
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // 인증된 경우 자식 컴포넌트 렌더링
  return children;
};

export default ProtectedRoute;