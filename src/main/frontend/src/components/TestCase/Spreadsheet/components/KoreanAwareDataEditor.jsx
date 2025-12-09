import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@mui/material';

/**
 * KoreanAwareDataEditor
 * 
 * react-spreadsheet의 기본 DataEditor를 대체하여 한글 IME 입력 문제를 해결하는 컴포넌트입니다.
 * React 상태 업데이트로 인한 리렌더링이 한글 조합(Composition)을 중단시키는 현상을 방지합니다.
 * 
 * 주요 기능:
 * 1. 로컬 상태(local state)로 입력값 관리
 * 2. Composition 이벤트(한글 입력 시작/끝) 감지
 * 3. 조합 중일 때는 부모 컴포넌트로 onChange 전파를 지연시키거나 차단
 * 4. 조합 완료(onCompositionEnd) 시점에 변경사항 일괄 적용
 */
const KoreanAwareDataEditor = ({ cell, onChange, onKeyDown, onCommit }) => {
    const theme = useTheme();

    // cell.value가 객체인 경우와 문자열인 경우 모두 처리
    const initialValue = cell && cell.value !== undefined ? cell.value : '';
    const [value, setValue] = useState(initialValue);
    const valueRef = useRef(initialValue); // 최신 값을 동기적으로 추적하기 위한 ref
    const isComposing = useRef(false);
    const inputRef = useRef(null);

    // 셀 값이 외부에서 변경되었을 때 로컬 상태 동기화 (단, 입력 중이 아닐 때만)
    useEffect(() => {
        if (!isComposing.current && cell) {
            const newValue = cell.value !== undefined ? cell.value : '';
            if (newValue !== value) {
                setValue(newValue);
                valueRef.current = newValue;
            }
        }
    }, [cell]);

    // 컴포넌트 마운트 시 오토포커스
    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleChange = (e) => {
        const newValue = e.target.value;
        setValue(newValue);
        valueRef.current = newValue;

        // 한글 입력 중이 아닐 때만 즉시 부모에게 알림 (영문, 숫자 등)
        // isComposing.current 외에 nativeEvent.isComposing도 확인하여 타이밍 문제 방지
        const isNativeComposing = e.nativeEvent.isComposing;

        if (!isComposing.current && !isNativeComposing) {
            if (onChange) {
                onChange({ ...cell, value: newValue });
            }
        }
    };

    const handleCompositionStart = () => {
        isComposing.current = true;
    };

    const handleCompositionEnd = (e) => {
        isComposing.current = false;
        const newValue = e.target.value;
        valueRef.current = newValue;

        // 조합이 끝난 최종 값을 부모에게 전달
        if (onChange) {
            onChange({ ...cell, value: newValue });
        }
    };

    const handleKeyDown = (e) => {
        // IME 입력 중 엔터키 처리 방지 (중복 입력 방지 및 이벤트 전파 중단)
        if (isComposing.current && e.key === 'Enter') {
            e.stopPropagation(); // 중요: 스프레드시트가 이 이벤트를 잡아서 이동하지 않도록 차단
            return;
        }

        if (onKeyDown) {
            onKeyDown(e);
        }
    };

    // 포커스를 잃을 때(Blur) 최종 값 저장
    const handleBlur = () => {
        // ref를 사용하여 가장 최신 값을 제출함 (비동기 상태 업데이트 문제 해결)
        const currentValue = valueRef.current;

        if (onCommit) {
            onCommit({ ...cell, value: currentValue });
        } else if (onChange) {
            // onCommit이 없는 경우 onChange라도 호출
            onChange({ ...cell, value: currentValue });
        }
    };

    return (
        <input
            ref={inputRef}
            className="Spreadsheet__data-editor"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onBlur={handleBlur}
            style={{
                width: '100%',
                height: '100%',
                border: 'none',
                outline: 'none',
                padding: '0 4px',
                margin: 0,
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.primary,
                fontFamily: 'inherit',
                fontSize: 'inherit',
                boxSizing: 'border-box'
            }}
        />
    );
};

export default KoreanAwareDataEditor;
