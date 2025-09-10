// /src/index.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App.jsx';
import { AppProvider } from './context/AppContext'; // AppProvider import 추가
import setupFetchInterceptor from './utils/fetchInterceptor'; // fetch 인터셉터 추가

// 전역 fetch 인터셉터 초기화 (가장 먼저 실행)
setupFetchInterceptor();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);

