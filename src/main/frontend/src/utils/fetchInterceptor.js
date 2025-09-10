// src/utils/fetchInterceptor.js
// 전역 fetch 인터셉터 - localhost 호출을 현재 서버로 리디렉션

/**
 * URL을 현재 서버로 리디렉션하는 헬퍼 함수
 */
const redirectLocalhostUrl = (url) => {
  if (typeof url === 'string') {
    if (url.includes('localhost:8080') && !window.location.origin.includes('localhost')) {
      const newUrl = url.replace(/https?:\/\/localhost:8080/g, window.location.origin);
      console.warn(`🚫 localhost 호출 차단: ${url} → ${newUrl}`);
      return newUrl;
    }
  } else if (url instanceof URL) {
    if (url.hostname === 'localhost' && url.port === '8080' && !window.location.origin.includes('localhost')) {
      const newUrl = new URL(url.pathname + url.search + url.hash, window.location.origin);
      console.warn(`🚫 localhost 호출 차단: ${url.href} → ${newUrl.href}`);
      return newUrl;
    }
  }
  return url;
};

/**
 * 전역 fetch 및 XMLHttpRequest를 가로채서 localhost URL을 현재 서버 URL로 변경
 * 원격 서버에서 localhost API 호출을 방지하는 최후의 수단
 */
const setupFetchInterceptor = () => {
  // ===== Fetch API 인터셉터 =====
  const originalFetch = window.fetch;
  
  window.fetch = async (url, options = {}) => {
    const finalUrl = redirectLocalhostUrl(url);
    return originalFetch(finalUrl, options);
  };
  
  // ===== XMLHttpRequest 인터셉터 =====
  const originalXHROpen = XMLHttpRequest.prototype.open;
  
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    const finalUrl = redirectLocalhostUrl(url);
    return originalXHROpen.call(this, method, finalUrl, ...args);
  };
  
  console.log('✅ 전역 네트워크 인터셉터 초기화 완료 - 모든 localhost 호출이 현재 서버로 리디렉션됩니다');
  console.log(`🎯 현재 서버: ${window.location.origin}`);
};

export default setupFetchInterceptor;