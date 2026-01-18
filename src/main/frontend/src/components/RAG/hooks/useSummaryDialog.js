// src/components/RAG/hooks/useSummaryDialog.js
import { useState, useCallback, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import { DOCUMENT_LIST_CONSTANTS } from '../constants.js';
import { buildSummaryMarkdown, getSummaryMarkdownStyles } from '../utils/llmAnalysisUtils.js';

/**
 * LLM 분석 요약 다이얼로그 관리 커스텀 훅
 * 요약 페이지네이션, 데이터 로드, 전체화면 토글 기능을 제공합니다.
 * 
 * @param {Object} params
 * @param {Object} params.llmAnalysisStates - LLM 분석 상태 객체
 * @param {Function} params.getLlmAnalysisResults - LLM 분석 결과 조회 함수
 * @param {Function} params.t - 번역 함수
 * @returns {Object} 요약 다이얼로그 관리 객체
 */
export function useSummaryDialog({ llmAnalysisStates, getLlmAnalysisResults, t }) {
    const theme = useTheme();
    const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
    const [selectedSummary, setSelectedSummary] = useState(null);
    const [summaryContent, setSummaryContent] = useState(null);
    const [loadingSummary, setLoadingSummary] = useState(false);
    const [summaryPage, setSummaryPage] = useState(0);
    const [summaryTotal, setSummaryTotal] = useState(0);
    const [summaryHasMore, setSummaryHasMore] = useState(false);
    const [summaryRange, setSummaryRange] = useState({ from: 0, to: 0 });
    const [isFullScreen, setIsFullScreen] = useState(false);

    /**
     * 특정 페이지의 요약 데이터 로드
     */
    const fetchSummaryPage = useCallback(async (doc, page = 0) => {
        if (!doc) return;
        setLoadingSummary(true);
        const offset = page * DOCUMENT_LIST_CONSTANTS.SUMMARY_PAGE_SIZE;
        try {
            const response = await getLlmAnalysisResults(doc.id, offset, DOCUMENT_LIST_CONSTANTS.SUMMARY_PAGE_SIZE);
            const results = response?.results || [];
            if (results.length > 0) {
                setSummaryContent(buildSummaryMarkdown(results));
            } else {
                setSummaryContent(null);
            }

            const llmState = llmAnalysisStates[doc.id];
            const totalFromResponse = response?.total;
            const fallbackTotal = llmState?.analyzedChunks || doc.totalChunks || (offset + results.length);
            const computedTotal = totalFromResponse ?? fallbackTotal ?? 0;
            setSummaryTotal(computedTotal);
            setSummaryHasMore(
                totalFromResponse != null
                    ? offset + results.length < totalFromResponse
                    : results.length === DOCUMENT_LIST_CONSTANTS.SUMMARY_PAGE_SIZE
            );
            setSummaryRange(
                results.length > 0
                    ? { from: offset + 1, to: offset + results.length }
                    : { from: 0, to: 0 }
            );
        } catch (err) {
            console.error('LLM 분석 결과 조회 실패:', err);
            setSummaryContent(t('rag.document.summary.fetchFailed', '분석 결과 조회에 실패했습니다.'));
            setSummaryHasMore(false);
            setSummaryRange({ from: 0, to: 0 });
        } finally {
            setLoadingSummary(false);
        }
    }, [getLlmAnalysisResults, llmAnalysisStates, t]);

    /**
     * 요약 보기 다이얼로그 열기
     */
    const handleViewSummary = useCallback((doc) => {
        const llmState = llmAnalysisStates[doc.id];
        if (!llmState || llmState.status === 'not_started') {
            return;
        }

        setSelectedSummary({
            documentId: doc.id,
            documentName: doc.fileName,
            ...llmState,
        });
        setSummaryDialogOpen(true);
        setLoadingSummary(true);
        setSummaryContent(null);
        setSummaryPage(0);
        setSummaryTotal(llmState.analyzedChunks || doc.totalChunks || 0);
        setSummaryHasMore(false);
        setSummaryRange({ from: 0, to: 0 });
        fetchSummaryPage(doc, 0);
    }, [llmAnalysisStates, fetchSummaryPage]);

    /**
     * 요약 페이지 변경
     */
    const handleSummaryPageChange = useCallback((direction) => {
        if (!selectedSummary) return;
        const nextPage = direction === 'next' ? summaryPage + 1 : summaryPage - 1;
        if (nextPage < 0) return;

        const totalPages = summaryTotal ? Math.ceil(summaryTotal / DOCUMENT_LIST_CONSTANTS.SUMMARY_PAGE_SIZE) : null;
        if (direction === 'next' && totalPages && nextPage >= totalPages && !summaryHasMore) {
            return;
        }

        setSummaryPage(nextPage);
        fetchSummaryPage(
            {
                id: selectedSummary.documentId,
                fileName: selectedSummary.documentName,
                totalChunks: selectedSummary.totalChunks,
            },
            nextPage
        );
    }, [selectedSummary, summaryPage, summaryTotal, summaryHasMore, fetchSummaryPage]);

    /**
     * 요약 다이얼로그 닫기
     */
    const handleCloseSummary = useCallback(() => {
        setSummaryDialogOpen(false);
        setSelectedSummary(null);
        setSummaryContent(null);
        setSummaryPage(0);
        setSummaryTotal(0);
        setSummaryHasMore(false);
        setSummaryRange({ from: 0, to: 0 });
        setIsFullScreen(false);
    }, []);

    /**
     * 페이지네이션 레이블
     */
    const summaryPaginationLabel = useMemo(() => {
        return summaryRange.from > 0
            ? `${summaryRange.from}-${summaryRange.to}${summaryTotal ? ` / ${summaryTotal}` : ''}`
            : t('rag.document.summary.noData', '표시할 결과가 없습니다.');
    }, [summaryRange, summaryTotal, t]);

    /**
     * 페이지네이션 버튼 활성화 상태
     */
    const canGoPrevSummary = summaryPage > 0;
    const canGoNextSummary = summaryHasMore
        || (summaryTotal ? (summaryPage + 1) * DOCUMENT_LIST_CONSTANTS.SUMMARY_PAGE_SIZE < summaryTotal : false);

    /**
     * 마크다운 스타일
     */
    const summaryMarkdownStyles = useMemo(() => {
        return getSummaryMarkdownStyles(theme, isFullScreen);
    }, [theme, isFullScreen]);

    return {
        summaryDialogOpen,
        selectedSummary,
        summaryContent,
        loadingSummary,
        summaryPage,
        isFullScreen,
        setIsFullScreen,
        summaryPaginationLabel,
        canGoPrevSummary,
        canGoNextSummary,
        summaryMarkdownStyles,
        handleViewSummary,
        handleSummaryPageChange,
        handleCloseSummary,
    };
}
