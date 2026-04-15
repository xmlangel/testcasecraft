/**
 * useAutoSave - 범용 자동 저장 훅
 *
 * 사용법:
 *   const { autoSaveStatus, autoSaveError, markSaved } = useAutoSave({
 *     id,          // 레코드 ID. falsy면 자동저장 비활성화 (신규 생성 모드)
 *     data,        // 감시할 폼 데이터 (JSON 비교로 변경 감지)
 *     saveFn,      // async (data) => void  — 실제 저장 로직
 *     disabled,    // true면 자동저장 안 함 (isViewer 등)
 *     debounceMs,  // 디바운스 딜레이 (기본 1500ms)
 *     t,           // i18n 번역 함수 (선택)
 *   });
 *
 *   markSaved(data?)  — 현재 data를 저장된 기준점으로 설정.
 *                       서버에서 데이터 로드 완료 후, 수동 저장 성공 후 호출.
 */

import { useState, useEffect, useCallback, useRef } from "react";

const useAutoSave = ({
  id,
  data,
  saveFn,
  disabled = false,
  debounceMs = 1500,
  t = (_key, fallback) => fallback,
}) => {
  const [autoSaveStatus, setAutoSaveStatus] = useState("idle");
  const [autoSaveError, setAutoSaveError] = useState(null);

  // 저장된 기준점 스냅샷 (dirty 감지용)
  const originalRef = useRef(null);
  // 언마운트 시에도 최신 값을 참조하기 위한 refs
  const dataRef = useRef(data);
  const idRef = useRef(id);
  const saveFnRef = useRef(saveFn);
  const disabledRef = useRef(disabled);
  const isMountedRef = useRef(true);
  const autoSaveTimerRef = useRef(null);

  // refs를 최신 값으로 동기화
  useEffect(() => {
    dataRef.current = data;
  }, [data]);
  useEffect(() => {
    idRef.current = id;
  }, [id]);
  useEffect(() => {
    saveFnRef.current = saveFn;
  }, [saveFn]);
  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  // 마운트/언마운트 관리 + 언마운트 시 미저장 변경사항 저장
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

      const current = dataRef.current;
      const original = originalRef.current;

      if (
        !idRef.current ||
        !current ||
        !original ||
        disabledRef.current ||
        JSON.stringify(current) === JSON.stringify(original)
      )
        return;

      // fire-and-forget: 언마운트 후엔 UI 업데이트 불가
      saveFnRef.current(current).catch(() => {});
    };
  }, []); // eslint-disable-line

  // 실제 저장 실행
  const performSave = useCallback(
    async (currentData) => {
      if (!currentData || disabledRef.current) return;

      setAutoSaveStatus("saving");
      setAutoSaveError(null);

      try {
        await saveFnRef.current(currentData);
        originalRef.current = currentData;

        if (isMountedRef.current) {
          setAutoSaveStatus("saved");
          setTimeout(() => {
            if (isMountedRef.current) setAutoSaveStatus("idle");
          }, 3000);
        }
      } catch (error) {
        if (isMountedRef.current) {
          setAutoSaveStatus("error");
          setAutoSaveError(
            error.message || t("autoSave.error", "자동 저장에 실패했습니다."),
          );
        }
      }
    },
    [t],
  );

  // 변경 감지 후 디바운스 자동 저장
  useEffect(() => {
    if (!id || !data || !originalRef.current || disabled) return;
    if (JSON.stringify(data) === JSON.stringify(originalRef.current)) return;

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(() => {
      performSave(dataRef.current);
    }, debounceMs);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [id, data, disabled, debounceMs, performSave]);

  /**
   * 현재 데이터를 저장된 기준점으로 설정합니다.
   * - 서버 데이터 로드 완료 후 호출 (dirty 감지 시작점 설정)
   * - 수동 저장 성공 후 호출 (기준점 갱신 + 상태 초기화)
   * @param {any} [newData] - 새 기준점. 생략 시 현재 dataRef 값 사용.
   */
  /**
   * @param {any} [newData]
   * @param {{ skipStatusReset?: boolean }} [opts]
   *   skipStatusReset=true 이면 "저장됨" 상태를 유지하고 기준점만 갱신합니다.
   */
  const markSaved = useCallback((newData, { skipStatusReset = false } = {}) => {
    originalRef.current = newData !== undefined ? newData : dataRef.current;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    if (isMountedRef.current && !skipStatusReset) {
      setAutoSaveStatus("idle");
      setAutoSaveError(null);
    }
  }, []);

  return { autoSaveStatus, autoSaveError, markSaved };
};

export default useAutoSave;
