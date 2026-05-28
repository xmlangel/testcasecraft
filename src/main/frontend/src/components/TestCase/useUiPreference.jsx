// src/components/TestCase/useUiPreference.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import apiService from "../../services/apiService.js";

const SAVE_DEBOUNCE_MS = 500;
const cacheKey = (key) => `ui-pref:${key}`;

/**
 * 사용자별 UI 환경설정 단일 키를 서버(uiPreferences JSON 안의 해당 key)에 동기화한다.
 *
 *  - localStorage 캐시 → 첫 진입 즉시 렌더
 *  - GET /api/auth/me/preferences 로 서버 값 fetch → 캐시 갱신
 *  - 변경 시 debounce 500ms 후 PATCH /api/auth/me/preferences (단일 key patch)
 *    → 다른 키 충돌(race condition) 회피
 *  - 네트워크 실패 시 캐시는 최후 폴백
 *
 * 사용 예:
 *   const [autoAiMode, setAutoAiMode] = useUiPreference("autoAiMode", false);
 *   const [vis, setVis] = useUiPreference("fieldVisibility", { description: true });
 */
export const useUiPreference = (key, defaultValue) => {
  const readCache = () => {
    try {
      const raw = localStorage.getItem(cacheKey(key));
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
            localStorage.setItem(cacheKey(key), JSON.stringify(serverVal));
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
      localStorage.setItem(cacheKey(key), JSON.stringify(value));
    } catch {
      /* ignore */
    }
    if (!serverLoaded) return;
    const serialized = JSON.stringify(value);
    if (serialized === lastSavedRef.current) return; // 변화 없음 — 저장 스킵

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await apiService.patch("/api/auth/me/preferences", {
          key,
          value,
        });
        lastSavedRef.current = serialized;
      } catch {
        /* keep retrying on next change */
      }
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [value, serverLoaded, key]);

  // 외부 setter 인터페이스 (useState 와 동일 시그니처)
  const setter = useCallback((next) => {
    setValue((prev) => (typeof next === "function" ? next(prev) : next));
  }, []);

  return [value, setter];
};
