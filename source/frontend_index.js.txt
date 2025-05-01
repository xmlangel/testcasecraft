// /src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App';
import { AppProvider } from './context/AppContext'; // AppProvider import 추가

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
