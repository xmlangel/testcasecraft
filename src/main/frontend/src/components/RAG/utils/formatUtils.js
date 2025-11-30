// src/components/RAG/utils/formatUtils.js

/**
 * 포맷팅 관련 유틸리티 함수들
 */

/**
 * 파일 크기를 읽기 쉬운 형식으로 포맷합니다
 * @param {number} bytes - 바이트 단위 파일 크기
 * @returns {string} 포맷된 파일 크기 (예: "1.5 KB", "2.3 MB")
 */
export function formatFileSize(bytes) {
    if (!bytes || typeof bytes !== 'number') {
        return '알 수 없음';
    }

    const kb = bytes / 1024;
    if (kb < 1024) {
        return `${kb.toFixed(1)} KB`;
    }

    const mb = kb / 1024;
    if (mb < 1024) {
        return `${mb.toFixed(1)} MB`;
    }

    const gb = mb / 1024;
    return `${gb.toFixed(1)} GB`;
}

/**
 * 날짜를 한국어 형식으로 포맷합니다
 * @param {string|Date} date - 날짜
 * @returns {string} 포맷된 날짜 (예: "2024. 1. 15.")
 */
export function formatDate(date) {
    if (!date) {
        return '알 수 없음';
    }

    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return dateObj.toLocaleDateString('ko-KR');
    } catch (error) {
        return '알 수 없음';
    }
}

/**
 * 타임스탬프를 상대 시간으로 포맷합니다
 * @param {number} timestamp - 타임스탬프 (밀리초)
 * @returns {string} 상대 시간 (예: "방금 전", "5분 전", "2시간 전")
 */
export function formatRelativeTime(timestamp) {
    if (!timestamp || typeof timestamp !== 'number') {
        return '';
    }

    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) {
        return '방금 전';
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
        return `${minutes}분 전`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours}시간 전`;
    }

    const days = Math.floor(hours / 24);
    if (days < 30) {
        return `${days}일 전`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
        return `${months}개월 전`;
    }

    const years = Math.floor(months / 12);
    return `${years}년 전`;
}
