// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  API_CONFIG,
  getDynamicApiUrl,
  resetRuntimeConfig,
} from "../utils/apiConstants.js";
import { useTranslation, useI18n } from "./I18nContext";

// 토큰 갱신 및 사용자 정보 조회를 위한 상수 (데모 연동용)
const USE_DEMO_DATA = import.meta.env.VITE_USE_DEMO_DATA === "true";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { t } = useTranslation();
  const { changeLanguage } = useI18n();

  // --- 인증 및 사용자 상태 관리 ---
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // --- UI 및 세션 상태 관리 ---
  const [rateLimitError, setRateLimitError] = useState(null);
  const [retryAfter, setRetryAfter] = useState(0);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [initialProfileTab, setInitialProfileTab] = useState(0);

  // --- 중복 요청 방지를 위한 Ref 관리 ---
  const refreshTokenPromiseRef = useRef(null);
  const userInfoPromiseRef = useRef(null);

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

  // 내부 토큰 갱신 로직 (중복 호출 방지 포함)
  const refreshTokenInternal = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      handleSessionExpiry();
      // 로그인을 아예 안 한 상태이거나 토큰이 없는 경우, 에러를 던지는 대신 조용히 실패를 알림
      console.warn(
        "[AuthContext] Refresh token missing. Session marked as expired.",
      );
      return null;
    }

    // 이미 진행 중인 갱신 요청이 있으면 해당 Promise 반환
    if (refreshTokenPromiseRef.current) {
      return refreshTokenPromiseRef.current;
    }

    const baseUrl = await getDynamicApiUrl();
    console.log("[AuthContext] Refreshing token...");

    refreshTokenPromiseRef.current = fetch(`${baseUrl}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(
            t("auth.refresh_failed", "토큰 갱신에 실패했습니다."),
          );
        }
        const { accessToken } = await res.json();
        localStorage.setItem("accessToken", accessToken);
        console.log("[AuthContext] Token refreshed successfully");
        return accessToken;
      })
      .catch((error) => {
        console.error("[AuthContext] Token refresh error:", error);
        handleSessionExpiry();
        throw error;
      })
      .finally(() => {
        refreshTokenPromiseRef.current = null;
      });

    return refreshTokenPromiseRef.current;
  }, [handleSessionExpiry, t]);

  // 토큰 검증 및 갱신 유틸리티 함수 (RAG 스트리밍 등 외부에서 사용)
  const ensureValidToken = useCallback(async () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!accessToken && !refreshToken) {
      handleSessionExpiry();
      throw new Error(t("auth.no_token", "인증 토큰이 없습니다."));
    }

    if (accessToken) {
      try {
        const baseUrl = await getDynamicApiUrl();
        const response = await fetch(`${baseUrl}/api/auth/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) return accessToken;

        if (response.status === 401) {
          console.log(
            "[AuthContext] Access token expired, attempting refresh...",
          );
          localStorage.removeItem("accessToken");
        } else {
          throw new Error(
            `${t("auth.validation_failed", "토큰 검증 실패")}: ${response.status}`,
          );
        }
      } catch (error) {
        console.warn(
          "[AuthContext] Token validation check failed:",
          error.message,
        );
      }
    }

    return await refreshTokenInternal();
  }, [handleSessionExpiry, refreshTokenInternal, t]);

  const api = useCallback(
    async (url, options = {}) => {
      const baseUrl = await getDynamicApiUrl();
      const fullUrl = url.startsWith("http") ? url : `${baseUrl}${url}`;

      let accessToken = localStorage.getItem("accessToken");

      const fetchOptions = {
        ...options,
        headers: {
          ...(accessToken && !options.skipAuth
            ? { Authorization: `Bearer ${accessToken}` }
            : {}),
          "Content-Type": "application/json", // 기본값
          ...options.headers,
        },
      };

      // Content-Type이 undefined로 명시된 경우 제거 (FormData 등)
      if (options.headers && options.headers["Content-Type"] === undefined) {
        delete fetchOptions.headers["Content-Type"];
      }

      let response = await fetch(fullUrl, fetchOptions);

      // Rate Limit 에러 처리 (429)
      if (response.status === 429) {
        const errorData = await response.json().catch(() => ({}));
        const retryAfterSeconds = parseInt(
          response.headers.get("Retry-After") || errorData.retryAfter || "1",
        );

        setRateLimitError({
          message:
            errorData.message ||
            t(
              "error.rate_limit",
              "너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.",
            ),
          retryAfter: retryAfterSeconds,
          originalRequest: { url: fullUrl, options: fetchOptions },
        });
        setRetryAfter(retryAfterSeconds);
        return response;
      }

      // 401 Unauthorized 처리 (세션 만료 및 재시도)
      if (response.status === 401 && !options.skipAuth) {
        try {
          const newAccessToken = await refreshTokenInternal();
          if (!newAccessToken) {
            // 토큰 갱신 결과가 없으면(로그인 안된 상태 등) 더 이상 진행하지 않음
            return response;
          }
          fetchOptions.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return await fetch(fullUrl, fetchOptions);
        } catch (error) {
          // 갱신 과정에서 발생한 에러는 상위로 전파
          throw error;
        }
      }

      // 403 Forbidden 처리
      if (response.status === 403) {
        console.warn("[AuthContext] 403 Forbidden: User lack permissions.");
      }

      return response;
    },
    [refreshTokenInternal, t],
  );

  const fetchUserInfo = useCallback(async () => {
    if (userInfoPromiseRef.current) {
      return userInfoPromiseRef.current;
    }

    userInfoPromiseRef.current = (async () => {
      try {
        const res = await api("/api/auth/me");
        if (!res.ok) {
          throw new Error(
            t(
              "auth.fetch_user_failed",
              "사용자 정보를 불러오는데 실패했습니다.",
            ),
          );
        }
        return await res.json();
      } finally {
        userInfoPromiseRef.current = null;
      }
    })();

    return userInfoPromiseRef.current;
  }, [api, t]);

  const handleLoginSuccess = useCallback(
    async (loginResult) => {
      localStorage.setItem("accessToken", loginResult.accessToken);
      localStorage.setItem("refreshToken", loginResult.refreshToken);

      if (loginResult.user) {
        setUser({ ...loginResult.user, token: loginResult.accessToken });
      } else {
        try {
          const userInfo = await fetchUserInfo();
          setUser({ ...userInfo, token: loginResult.accessToken });

          // 사용자 언어 설정 동기화
          if (userInfo.preferredLanguage) {
            changeLanguage(userInfo.preferredLanguage);
          }
        } catch (error) {
          console.error(
            "[AuthContext] Failed to fetch user info after login:",
            error,
          );
          handleLogout();
        }
      }

      // 전달된 user 객체에 언어 정보가 있는 경우
      if (loginResult.user?.preferredLanguage) {
        changeLanguage(loginResult.user.preferredLanguage);
      }

      setLoadingUser(false);
    },
    [fetchUserInfo, handleLogout, changeLanguage],
  );

  const handleUserUpdated = useCallback((updated) => {
    setUser((prev) => ({ ...prev, ...updated }));
  }, []);

  // 세션 검증 및 자동 로그인 함수
  const verifySession = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!accessToken && !refreshToken) {
        setLoadingUser(false);
        return;
      }

      // 데모 토큰 정리
      if (
        accessToken === "demo-access-token" ||
        refreshToken === "demo-refresh-token"
      ) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setLoadingUser(false);
        return;
      }

      // 1. Access Token으로 시도
      if (accessToken) {
        try {
          const userInfo = await fetchUserInfo();
          setUser({ ...userInfo, token: accessToken });
          setLoadingUser(false);
          return;
        } catch (error) {
          console.log("[AuthContext] Access token invalid, trying refresh...");
          localStorage.removeItem("accessToken");
        }
      }

      // 2. Refresh Token으로 시도
      if (refreshToken) {
        try {
          const newAccessToken = await refreshTokenInternal();
          const userInfo = await fetchUserInfo();
          setUser({ ...userInfo, token: newAccessToken });

          // 사용자 언어 설정 동기화
          if (userInfo.preferredLanguage) {
            changeLanguage(userInfo.preferredLanguage);
          }
        } catch (error) {
          console.error("[AuthContext] AutoLogin failed:", error);
          handleLogout();
        }
      } else {
        handleLogout();
      }
    } catch (error) {
      console.error("[AuthContext] Unexpected verifySession error:", error);
      handleLogout();
    } finally {
      setLoadingUser(false);
    }
  }, [fetchUserInfo, handleLogout, refreshTokenInternal, changeLanguage]);

  // 초기 자동 로그인
  useEffect(() => {
    // 레거시 토큰 정리
    if (localStorage.getItem("jwtToken")) {
      localStorage.removeItem("jwtToken");
    }
    verifySession();
  }, [verifySession]);

  // 백그라운드 토큰 자동 갱신 (5분마다)
  useEffect(() => {
    if (!user) return;

    const REFRESH_INTERVAL = 5 * 60 * 1000;

    const checkAndRefreshToken = async () => {
      if (document.hidden) return;
      try {
        await ensureValidToken();
      } catch (error) {
        console.warn("[AuthContext] Background refresh failed:", error.message);
      }
    };

    const intervalId = setInterval(checkAndRefreshToken, REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [user, ensureValidToken]);

  const login = async ({ username, password }) => {
    if (USE_DEMO_DATA) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (username === "admin" && password === "admin") {
        return {
          accessToken: "demo-access-token",
          refreshToken: "demo-refresh-token",
          user: {
            id: "user1",
            username: "admin",
            name: t("demo.admin_name", "관리자"),
            email: "admin@demo.com",
            role: "ADMIN",
          },
        };
      } else if (username === "tester" && password === "tester") {
        return {
          accessToken: "demo-access-token",
          refreshToken: "demo-refresh-token",
          user: {
            id: "user2",
            username: "tester",
            name: t("demo.tester_name", "테스터"),
            email: "tester@demo.com",
            role: "TESTER",
          },
        };
      } else {
        throw new Error(
          t(
            "auth.login_invalid",
            "아이디 또는 비밀번호가 올바르지 않습니다. (admin/admin 또는 tester/tester 사용)",
          ),
        );
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
      throw new Error(
        msg ||
          t("auth.login_failed", "아이디 또는 비밀번호가 올바르지 않습니다."),
      );
    }

    return await res.json();
  };

  const register = async ({ username, password, name, email }) => {
    const baseUrl = await getDynamicApiUrl();
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, name, email }),
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(
        msg || t("auth.register_failed", "회원가입에 실패했습니다."),
      );
    }
    return res.json();
  };

  const updateUserProfile = async ({ name, email, timezone }) => {
    const res = await api("/api/auth/me", {
      method: "PUT",
      body: JSON.stringify({ name, email, timezone }),
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(
        msg || t("profile.update_failed", "정보 변경에 실패했습니다."),
      );
    }
    return res.json();
  };

  const clearRateLimitError = useCallback(() => {
    setRateLimitError(null);
    setRetryAfter(0);
  }, []);

  const openUserProfile = useCallback((tabIndex = 0) => {
    setInitialProfileTab(tabIndex);
    setProfileDialogOpen(true);
  }, []);

  const handleDialogLogin = useCallback(() => {
    setSessionExpired(false);
    // 로그인 페이지로 이동하거나 모달을 띄울 수 있음
    window.location.href = "/login";
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
    profileDialogOpen,
    setProfileDialogOpen,
    initialProfileTab,
    openUserProfile,
    getApiBaseUrl: () => getDynamicApiUrl(),
    sessionExpired,
    handleDialogRefresh,
    handleDialogLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
