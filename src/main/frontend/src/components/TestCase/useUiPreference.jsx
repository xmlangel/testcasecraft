// src/components/TestCase/useUiPreference.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import apiService from "../../services/apiService.js";

const SAVE_DEBOUNCE_MS = 500;

/** accessToken(JWT) 의 sub claim 으로 현재 사용자 식별자 추출. 없으면 "anon". */
const getCurrentUserId = () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return "anon";
    const payload = token.split(".")[1];
    if (!payload) return "anon";
    // base64url → base64
    const b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(b64);
    const claims = JSON.parse(json);
    return claims.sub || claims.username || "anon";
  } catch {
    return "anon";
  }
};

/**
 * cacheKey 는 사용자별 prefix 를 사용한다. 같은 브라우저에서 사용자 A → B 로 로그인 전환 시,
 * A 의 캐시가 B 의 첫 렌더에 보이는 누수를 막는다.
 */
const cacheKey = (userId, key) => `ui-pref:${userId}:${key}`;

/**
 * 사용자별 UI 환경설정 단일 키를 서버(uiPreferences JSON 안의 해당 key)에 동기화한다.
 *
 *  - localStorage 캐시(사용자별 prefix) → 첫 진입 즉시 렌더
 *  - GET /api/auth/me/preferences 로 서버 값 fetch → 캐시 갱신
 *  - 변경 시 debounce 500ms 후 PATCH /api/auth/me/preferences (단일 key patch)
 *    → 다른 키 충돌(race condition) 회피, 서버는 PESSIMISTIC 락으로 직렬화
 *  - beforeunload 시 pending PATCH 를 keepalive fetch 로 즉시 flush — 변경 직후 페이지를 떠나도 저장 보장
 *  - "auth:logout" 이벤트 시 본 키의 캐시 삭제
 *
 * 사용 예:
 *   const [autoAiMode, setAutoAiMode] = useUiPreference("autoAiMode", false);
 *   const [vis, setVis] = useUiPreference("fieldVisibility", { description: true });
 */
export const useUiPreference = (key, defaultValue) => {
  // userId 는 마운트 시점에 한 번만 잡는다. 세션 도중 바뀌면 logout 이벤트로 캐시 정리.
  const userIdRef = useRef(getCurrentUserId());
  const ck = cacheKey(userIdRef.current, key);

  const readCache = () => {
    try {
      const raw = localStorage.getItem(ck);
      if (raw == null) return defaultValue;
      return JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  };

  const [value, setValue] = useState(readCache);
  const [serverLoaded, setServerLoaded] = useState(false);
  const saveTimerRef = useRef(null);
  const lastSavedRef = useRef(JSON.stringify(value));
  const pendingValueRef = useRef(null); // beforeunload flush 용 — 현재 debounce 중인 값

  // 1) 서버 fetch — 다른 키 값은 무시, 해당 key 만 읽음
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiService.get("/api/auth/me/preferences");
        const data = await res.json();
        const raw = data?.uiPreferences || "{}";
        const parsed = JSON.parse(raw);
        if (
          !cancelled &&
          parsed &&
          Object.prototype.hasOwnProperty.call(parsed, key)
        ) {
          const serverVal = parsed[key];
          setValue(serverVal);
          lastSavedRef.current = JSON.stringify(serverVal);
          try {
            localStorage.setItem(ck, JSON.stringify(serverVal));
          } catch {
            /* ignore */
          }
        }
      } catch {
        /* keep cache */
      } finally {
        if (!cancelled) setServerLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // 2) 변경 시 localStorage + debounced PATCH
  useEffect(() => {
    try {
      localStorage.setItem(ck, JSON.stringify(value));
    } catch {
      /* ignore */
    }
    if (!serverLoaded) return;
    const serialized = JSON.stringify(value);
    if (serialized === lastSavedRef.current) return; // 변화 없음 — 저장 스킵

    pendingValueRef.current = { key, value, serialized };

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await apiService.patch("/api/auth/me/preferences", {
          key,
          value,
        });
        lastSavedRef.current = serialized;
        pendingValueRef.current = null;
      } catch {
        /* keep retrying on next change */
      }
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [value, serverLoaded, key, ck]);

  // 3) beforeunload — pending PATCH 를 keepalive fetch 로 즉시 flush
  //    fetch keepalive 는 페이지 unload 이후에도 요청이 완료되도록 보장한다 (브라우저 호환 양호).
  useEffect(() => {
    const flush = () => {
      const pending = pendingValueRef.current;
      if (!pending) return;
      const token = localStorage.getItem("accessToken");
      try {
        fetch("/api/auth/me/preferences", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ key: pending.key, value: pending.value }),
          keepalive: true,
        });
        lastSavedRef.current = pending.serialized;
        pendingValueRef.current = null;
      } catch {
        /* unload 시점 — 보장 못 함 */
      }
    };
    window.addEventListener("beforeunload", flush);
    // 모바일에서는 pagehide 가 더 신뢰성 있음
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("beforeunload", flush);
      window.removeEventListener("pagehide", flush);
    };
  }, []);

  // 4) auth:logout 이벤트 — 본 사용자의 캐시를 정리하여 다음 사용자에게 누수되지 않도록.
  useEffect(() => {
    const onLogout = () => {
      try {
        localStorage.removeItem(ck);
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("auth:logout", onLogout);
    return () => window.removeEventListener("auth:logout", onLogout);
  }, [ck]);

  // 외부 setter 인터페이스 (useState 와 동일 시그니처)
  const setter = useCallback((next) => {
    setValue((prev) => (typeof next === "function" ? next(prev) : next));
  }, []);

  return [value, setter];
};
