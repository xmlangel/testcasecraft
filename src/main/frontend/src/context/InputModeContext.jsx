
import React, { createContext, useContext, useState, useEffect } from 'react';

const InputModeContext = createContext();

export const InputModeProvider = ({ children }) => {
    // 초기값은 로컬 스토리지에서 가져오거나 기본값 'spreadsheet' 사용
    const [inputMode, setInputMode] = useState(() => {
        try {
            return localStorage.getItem('testCaseInputMode') || 'spreadsheet';
        } catch (error) {
            return 'spreadsheet';
        }
    });

    // 모드 변경 시 로컬 스토리지 업데이트
    const handleSetInputMode = (mode) => {
        setInputMode(mode);
        try {
            localStorage.setItem('testCaseInputMode', mode);
        } catch (error) {
            console.warn('Failed to save input mode to localStorage', error);
        }
    };

    const value = {
        inputMode,
        setInputMode: handleSetInputMode
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
        throw new Error('useInputMode must be used within an InputModeProvider');
    }
    return context;
};

export default InputModeContext;
