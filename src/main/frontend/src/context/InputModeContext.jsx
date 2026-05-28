import React, { createContext, useContext } from "react";
import { useUiPreference } from "../components/TestCase/useUiPreference.jsx";

const InputModeContext = createContext();

/**
 * 입력 모드(개별 폼 / 스프레드시트) 컨텍스트.
 * useUiPreference 로 서버에 사용자별 저장 — 다른 PC 에서도 동일 모드 유지.
 * 기본값은 "spreadsheet" (기존 동작과 동일).
 */
export const InputModeProvider = ({ children }) => {
  const [inputMode, setInputMode] = useUiPreference(
    "testCaseInputMode",
    "spreadsheet",
  );

  const value = {
    inputMode: inputMode || "spreadsheet",
    setInputMode,
  };

  return (
    <InputModeContext.Provider value={value}>
      {children}
    </InputModeContext.Provider>
  );
};

export const useInputMode = () => {
  const context = useContext(InputModeContext);
  if (!context) {
    throw new Error("useInputMode must be used within an InputModeProvider");
  }
  return context;
};

export default InputModeContext;
