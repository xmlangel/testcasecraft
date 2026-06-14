// /src/index.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import App from "./App.jsx";
import setupFetchInterceptor from "./utils/fetchInterceptor"; // fetch 인터셉터 추가

// 전역 fetch 인터셉터 초기화 (가장 먼저 실행)
setupFetchInterceptor();

// App 컴포넌트가 자체적으로 AppProvider 를 포함한다.
// 여기서 AppProvider 를 또 감싸면 Provider 트리가 2중으로 마운트되어
// 모든 Context 의 초기 fetch(rag/status·auth/me·preferences 등)가 중복 호출된다.
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
