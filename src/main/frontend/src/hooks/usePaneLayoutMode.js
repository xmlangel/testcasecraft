// src/hooks/usePaneLayoutMode.js
import { useCallback, useState } from "react";
import {
  normalizePaneLayoutMode,
  PANE_LAYOUT_STORAGE_KEY,
} from "../components/TestCase/splitPane.js";

const readMode = () => {
  try {
    return normalizePaneLayoutMode(
      localStorage.getItem(PANE_LAYOUT_STORAGE_KEY),
    );
  } catch {
    return "auto";
  }
};

/**
 * ICT-492 케이스·실행 화면이 함께 쓰는 배치 선택(자동·1단·2단). localStorage 에 저장한다.
 * 반환값: [mode, setMode]
 */
const usePaneLayoutMode = () => {
  const [mode, setModeState] = useState(readMode);
  const setMode = useCallback((next) => {
    const value = normalizePaneLayoutMode(next);
    setModeState(value);
    try {
      localStorage.setItem(PANE_LAYOUT_STORAGE_KEY, value);
    } catch {
      // 저장소를 쓸 수 없으면 이번 화면에서만 바꾼다
    }
  }, []);
  return [mode, setMode];
};

export default usePaneLayoutMode;
