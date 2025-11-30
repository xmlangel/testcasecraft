// src/components/RAG/hooks/useExpandableRows.js
import { useState, useCallback } from 'react';

/**
 * 확장 가능한 행 관리 커스텀 훅
 * 테이블 행의 확장/축소 상태를 관리합니다.
 * 
 * @returns {Object} 행 확장 관리 객체
 */
export function useExpandableRows() {
    const [expandedRows, setExpandedRows] = useState({});

    /**
     * 행 확장/축소 토글
     * 
     * @param {string|number} rowId - 행 ID
     */
    const handleRowExpand = useCallback((rowId) => {
        setExpandedRows(prev => ({
            ...prev,
            [rowId]: !prev[rowId]
        }));
    }, []);

    /**
     * 모든 행 축소
     */
    const collapseAll = useCallback(() => {
        setExpandedRows({});
    }, []);

    /**
     * 특정 행이 확장되어 있는지 확인
     * 
     * @param {string|number} rowId - 행 ID
     * @returns {boolean} 확장 여부
     */
    const isRowExpanded = useCallback((rowId) => {
        return !!expandedRows[rowId];
    }, [expandedRows]);

    return {
        expandedRows,
        handleRowExpand,
        collapseAll,
        isRowExpanded,
    };
}
