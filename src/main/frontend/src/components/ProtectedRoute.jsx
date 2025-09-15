// src/components/ProtectedRoute.jsx
import React from 'react';
import { CircularProgress, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import Login from './Login';

const ProtectedRoute = ({ children }) => {
  const { user, loadingUser, handleLoginSuccess } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

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

  // 로그인 성공 후 적절한 페이지로 리다이렉트하는 함수
  const handleLoginSuccessWithRedirect = async (loginResult) => {
    await handleLoginSuccess(loginResult);
    
    const currentPath = location.pathname;
    
    
    // 프로젝트별 URL인 경우 해당 프로젝트 페이지로 유지
    if (currentPath.startsWith('/projects/') && currentPath.length > '/projects/'.length) {
      
      // URL이 이미 프로젝트 페이지이므로 리다이렉트하지 않음
      return;
    }
    
    // 조직 관련 URL인 경우 해당 페이지 유지
    if (currentPath.startsWith('/organizations/')) {
      
      return;
    }
    
    // 사용자 관리 URL인 경우 해당 페이지 유지
    if (currentPath.startsWith('/users')) {
      
      return;
    }
    
    // 기본 경로들(홈, 로그인)인 경우 프로젝트 선택 페이지로 이동
    if (currentPath === '/' || currentPath === '/login') {
      
      navigate('/projects');
    }
    
    // 그 외의 경우는 현재 페이지 유지
    
  };

  // 인증되지 않은 경우 로그인 페이지 표시
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccessWithRedirect} />;
  }

  // 인증된 경우 자식 컴포넌트 렌더링
  return children;
};

export default ProtectedRoute;