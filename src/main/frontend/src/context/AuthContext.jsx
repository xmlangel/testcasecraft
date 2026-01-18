// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { API_CONFIG, getDynamicApiUrl, resetRuntimeConfig } from '../utils/apiConstants.js';
// 동적 API URL 가져오기 (캐싱 포함)
let API_BASE_URL = API_CONFIG.BASE_URL;
let dynamicApiUrlPromise = null;
let refreshTokenPromise = null; // 토큰 갱신 중복 호출 방지용 Promise 캐싱
let userInfoPromise = null; // 사용자 정보 조회 중복 호출 방지용 Promise 캐싱

// 동적 API URL 가져오기 (캐싱 포함)
const getApiBaseUrl = async () => {
    if (!dynamicApiUrlPromise) {
        dynamicApiUrlPromise = getDynamicApiUrl().catch(error => {
            console.warn('동적 API URL 로드 실패, 현재 origin 사용:', error);
            const fallbackUrl = window.location.origin;
            return fallbackUrl;
        });
    }

    let url = await dynamicApiUrlPromise;

    // 빈 문자열이나 undefined인 경우 현재 origin 우선 사용
    if (!url || url.trim() === '') {
        url = window.location.origin;
    }

    // localhost가 포함되어 있고 현재 페이지가 다른 도메인인 경우 강제로 현재 origin 사용
    // apiConstants.js에서 이미 처리하므로 경고 제거
    if (url.includes('localhost') && !window.location.origin.includes('localhost')) {
        url = window.location.origin;
    }

    if (url !== API_BASE_URL) {
        API_BASE_URL = url;
    }
    return url;
};
const USE_DEMO_DATA = import.meta.env.VITE_USE_DEMO_DATA === 'true';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    // --- 인증 및 사용자 상태 관리 ---
    const [user, setUser] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    // --- Rate Limit 상태 관리 ---
    const [rateLimitError, setRateLimitError] = useState(null);
    const [retryAfter, setRetryAfter] = useState(0);
    const [sessionExpired, setSessionExpired] = useState(false);

    const handleLogout = useCallback(() => {
        setUser(null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    }, []);

    const handleSessionExpiry = useCallback(() => {
        setSessionExpired(true);
    }, []);

    const handleDialogRefresh = useCallback(() => {
        window.location.reload();
    }, []);

    const handleDialogLogin = useCallback(() => {
        setSessionExpired(false);
        handleLogout();
        // 로그아웃 후 리다이렉트는 App.jsx나 라우터에서 처리됨
    }, [handleLogout]);

    // 토큰 검증 및 갱신 유틸리티 함수 (RAG 스트리밍 등 외부에서 사용)
    const ensureValidToken = useCallback(async () => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');

        // 토큰이 없으면 에러
        if (!accessToken && !refreshToken) {
            throw new Error('No authentication token available');
        }

        // accessToken이 있으면 검증 시도
        if (accessToken) {
            try {
                const baseUrl = await getApiBaseUrl();
                const response = await fetch(`${baseUrl}/api/auth/me`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                // 토큰이 유효하면 그대로 반환
                if (response.ok) {
                    return accessToken;
                }

                // 401이면 refresh 시도
                if (response.status === 401) {
                    console.log('ensureValidToken: Access token expired, attempting refresh...');
                    localStorage.removeItem('accessToken');
                } else {
                    // 다른 에러는 그대로 throw
                    throw new Error(`Token validation failed: ${response.status}`);
                }
            } catch (error) {
                console.warn('ensureValidToken: Token validation error:', error.message);
                // fetch 에러는 refresh로 진행
            }
        }

        // refresh token으로 갱신 시도
        if (refreshToken) {
            try {
                const baseUrl = await getApiBaseUrl();
                console.log('ensureValidToken: Attempting to refresh token...');

                // Promise 캐싱 사용
                if (!refreshTokenPromise) {
                    refreshTokenPromise = fetch(`${baseUrl}/api/auth/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken }),
                    })
                        .then(async (refreshResponse) => {
                            if (!refreshResponse.ok) {
                                throw new Error('Failed to refresh token.');
                            }
                            const { accessToken: newAccessToken } = await refreshResponse.json();
                            localStorage.setItem('accessToken', newAccessToken);
                            console.log('ensureValidToken: Token refresh successful');
                            return newAccessToken;
                        })
                        .finally(() => {
                            refreshTokenPromise = null;
                        });
                }

                return await refreshTokenPromise;
            } catch (error) {
                console.error('ensureValidToken: Token refresh failed:', error);
                handleSessionExpiry();
                throw new Error('Session expired. Please login again.');
            }
        }

        // 여기까지 왔다면 토큰이 없음
        handleSessionExpiry();
        throw new Error('Session expired. Please login again.');
    }, [handleLogout]);

    const api = useCallback(async (url, options = {}) => {
        // 동적 API URL을 사용하여 완전한 URL 생성
        const baseUrl = await getApiBaseUrl();
        const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

        let accessToken = localStorage.getItem('accessToken');

        const fetchOptions = {
            ...options,
            headers: {
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
                ...options.headers,
            },
        };

        // Content-Type이 명시적으로 설정되지 않은 경우에만 기본값 적용
        if (!options.headers || !('Content-Type' in options.headers)) {
            fetchOptions.headers['Content-Type'] = 'application/json';
        }

        // Content-Type이 undefined로 설정된 경우 완전히 제거
        if (fetchOptions.headers['Content-Type'] === undefined) {
            delete fetchOptions.headers['Content-Type'];
        }

        let response = await fetch(fullUrl, fetchOptions);

        // Rate Limit 에러 처리 (429)
        if (response.status === 429) {
            const errorData = await response.json().catch(() => ({}));
            const retryAfterSeconds = parseInt(response.headers.get('Retry-After') || errorData.retryAfter || '1');

            setRateLimitError({
                message: errorData.message || '동일 IP에서 1초에 60번 이상 요청이 발생했습니다. 1초 후 다시 시도해주세요.',
                retryAfter: retryAfterSeconds,
                originalRequest: { url: fullUrl, options: fetchOptions }
            });
            setRetryAfter(retryAfterSeconds);

            // throw하지 말고 다이얼로그만 표시
            return response;
        }

        if (response.status === 401) {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                handleSessionExpiry();
                throw new Error('Session expired. Please login again.');
            }

            try {
                // Promise 캐싱: 이미 토큰 갱신 중이면 동일한 Promise 재사용
                if (!refreshTokenPromise) {
                    refreshTokenPromise = fetch(`${baseUrl}/api/auth/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken }),
                    })
                        .then(async (refreshResponse) => {
                            if (!refreshResponse.ok) {
                                throw new Error('Failed to refresh token.');
                            }
                            const { accessToken: newAccessToken } = await refreshResponse.json();
                            localStorage.setItem('accessToken', newAccessToken);
                            return newAccessToken;
                        })
                        .finally(() => {
                            refreshTokenPromise = null;
                        });
                }

                // 모든 동시 요청이 동일한 Promise를 기다림
                const newAccessToken = await refreshTokenPromise;

                // 새 토큰으로 원래 요청 재시도
                fetchOptions.headers['Authorization'] = `Bearer ${newAccessToken}`;
                response = await fetch(fullUrl, fetchOptions);

            } catch (error) {
                handleSessionExpiry();
                throw new Error('Session expired. Please login again.');
            }
        }

        // 403 Forbidden 처리 (권한 없음 or 세션 만료)
        if (response.status === 403) {
            handleSessionExpiry();
            // 403은 throw하지 않고 다이얼로그로 처리? 
            // 기존 로직 흐름을 위해 throw 할 수도 있지만, 
            // 사용자에게는 다이얼로그가 뜸.
        }

        return response;
    }, [handleLogout]);

    const fetchUserInfo = useCallback(async () => {
        // 1. 이미 진행 중인 요청이 있다면 해당 Promise 반환 (중복 호출 방지)
        if (userInfoPromise) {
            return userInfoPromise;
        }

        // 2. 새로운 Promise 생성 및 저장
        userInfoPromise = (async () => {
            try {
                const baseUrl = await getApiBaseUrl();
                const res = await api(`${baseUrl}/api/auth/me`);
                if (!res.ok) throw new Error("Failed to fetch user info");
                const data = await res.json();
                return data;
            } catch (error) {
                throw error;
            } finally {
                // 3. 완료 시 (성공/실패) Promise 초기화
                userInfoPromise = null;
            }
        })();

        return userInfoPromise;
    }, [api]);

    const handleLoginSuccess = useCallback(async (loginResult) => {
        localStorage.setItem("accessToken", loginResult.accessToken);
        localStorage.setItem("refreshToken", loginResult.refreshToken);

        // 로그인 응답에 사용자 정보가 포함되어 있으므로 추가 API 호출 불필요
        if (loginResult.user) {
            setUser({ ...loginResult.user, token: loginResult.accessToken });
        } else {
            // 만약 로그인 응답에 사용자 정보가 없다면 API로 조회
            try {
                const userInfo = await fetchUserInfo();
                setUser({ ...userInfo, token: loginResult.accessToken });
            } catch (error) {
                console.error('Failed to fetch user info after login:', error);
                handleLogout();
            }
        }
        setLoadingUser(false);
    }, [fetchUserInfo, handleLogout]);

    const handleUserUpdated = useCallback((updated) => {
        setUser(prev => ({ ...prev, ...updated }));
    }, []);

    // 자동 로그인 로직
    useEffect(() => {
        const oldToken = localStorage.getItem('jwtToken');
        if (oldToken) {
            localStorage.removeItem('jwtToken');
        }

        const autoLogin = async () => {
            try {
                const accessToken = localStorage.getItem("accessToken");
                const refreshToken = localStorage.getItem("refreshToken");

                // 토큰이 없으면 바로 로딩 종료
                if (!accessToken && !refreshToken) {
                    setLoadingUser(false);
                    return;
                }

                // 데모 토큰 체크 및 제거
                if (accessToken === 'demo-access-token' || refreshToken === 'demo-refresh-token') {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    setLoadingUser(false);
                    return;
                }

                // Access Token으로 먼저 시도
                if (accessToken) {
                    try {
                        const userInfo = await fetchUserInfo();
                        setUser({ ...userInfo, token: accessToken });
                        setLoadingUser(false);
                        return;
                    } catch (error) {
                        console.log('AutoLogin: Access token validation failed, will try refresh token:', error.message);
                        // Access token이 만료되었을 수 있음, refresh token으로 재시도
                        localStorage.removeItem('accessToken');
                    }
                }

                // Refresh Token으로 시도 (access token이 없거나 실패한 경우)
                if (refreshToken) {
                    try {
                        const baseUrl = await getApiBaseUrl();
                        console.log('AutoLogin: Attempting token refresh...');
                        const refreshResponse = await fetch(`${baseUrl}/api/auth/refresh`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ refreshToken }),
                        });

                        if (refreshResponse.ok) {
                            const { accessToken: newAccessToken } = await refreshResponse.json();
                            localStorage.setItem('accessToken', newAccessToken);
                            console.log('AutoLogin: Token refresh successful');

                            try {
                                const userInfo = await fetchUserInfo();
                                setUser({ ...userInfo, token: newAccessToken });
                                setLoadingUser(false);
                                return; // 성공 시 early return
                            } catch (fetchError) {
                                console.error('AutoLogin: Failed to fetch user info after refresh:', fetchError);
                                handleLogout();
                            }
                        } else {
                            const errorText = await refreshResponse.text();
                            console.error('AutoLogin: Token refresh failed:', errorText);
                            handleLogout();
                        }
                    } catch (e) {
                        console.error('AutoLogin: Refresh token request failed:', e);
                        handleLogout();
                    }
                } else {
                    console.warn('AutoLogin: No refresh token available after access token failure');
                    handleLogout();
                }
            } catch (error) {
                console.error('AutoLogin: Unexpected error:', error);
                handleLogout();
            } finally {
                setLoadingUser(false);
            }
        };

        autoLogin();
    }, [fetchUserInfo, handleLogout]);

    // 백그라운드 토큰 자동 갱신 (5분마다)
    useEffect(() => {
        if (!user) return;

        const REFRESH_INTERVAL = 5 * 60 * 1000; // 5분

        const checkAndRefreshToken = async () => {
            // 페이지가 보이지 않으면 스킵
            if (document.hidden) return;

            const accessToken = localStorage.getItem('accessToken');
            if (!accessToken) return;

            try {
                const baseUrl = await getApiBaseUrl();
                const response = await fetch(`${baseUrl}/api/auth/me`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                // 401이면 자동으로 토큰 갱신 시도
                if (!response.ok && response.status === 401) {
                    console.log('[AuthContext] Background token refresh: Access token expired, attempting refresh...');
                    await ensureValidToken();
                    console.log('[AuthContext] Background token refresh: Success');
                }
            } catch (error) {
                console.warn('[AuthContext] Background token refresh failed:', error.message);
            }
        };

        // 초기 체크 제거 (autoLogin에서 이미 수행됨)
        // checkAndRefreshToken();

        // 5분마다 주기적으로 체크
        const intervalId = setInterval(checkAndRefreshToken, REFRESH_INTERVAL);

        return () => clearInterval(intervalId);
    }, [user, ensureValidToken]);

    const login = async ({ username, password }) => {
        if (USE_DEMO_DATA) {
            await new Promise(resolve => setTimeout(resolve, 500));
            if (username === 'admin' && password === 'admin') {
                return {
                    accessToken: 'demo-access-token',
                    refreshToken: 'demo-refresh-token',
                    user: { id: 'user1', username: 'admin', name: '관리자', email: 'admin@demo.com', role: 'ADMIN' }
                };
            } else if (username === 'tester' && password === 'tester') {
                return {
                    accessToken: 'demo-access-token',
                    refreshToken: 'demo-refresh-token',
                    user: { id: 'user2', username: 'tester', name: '테스터', email: 'tester@demo.com', role: 'TESTER' }
                };
            } else {
                throw new Error("아이디 또는 비밀번호가 올바르지 않습니다. (admin/admin 또는 tester/tester 사용)");
            }
        }

        resetRuntimeConfig();
        const baseUrl = await getDynamicApiUrl();
        const loginUrl = `${baseUrl}/api/auth/login`;

        const res = await fetch(loginUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg || "아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        return await res.json();
    };

    const register = async ({ username, password, name, email }) => {
        const baseUrl = await getApiBaseUrl();
        const res = await fetch(`${baseUrl}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password, name, email }),
        });
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg || "회원가입에 실패했습니다.");
        }
        return res.json();
    };

    const updateUserProfile = async ({ name, email, timezone }) => {
        const baseUrl = await getApiBaseUrl();
        const res = await api(`${baseUrl}/api/auth/me`, {
            method: "PUT",
            body: JSON.stringify({ name, email, timezone }),
        });
        if (!res.ok) {
            const msg = await res.text();
            throw new Error(msg || "정보 변경에 실패했습니다.");
        }
        return res.json();
    };

    const clearRateLimitError = useCallback(() => {
        setRateLimitError(null);
        setRetryAfter(0);
    }, []);

    const value = {
        user,
        loadingUser,
        handleLogout,
        handleLoginSuccess,
        handleUserUpdated,
        api,
        ensureValidToken,
        fetchUserInfo,
        login,
        register,
        updateUserProfile,
        rateLimitError,
        retryAfter,
        clearRateLimitError,
        getApiBaseUrl,
        sessionExpired,
        handleDialogRefresh,
        handleDialogLogin
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
