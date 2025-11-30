// src/components/RAG/utils/documentUtils.js

import { formatFileSize, formatDate } from './formatUtils.js';

/**
 * 문서 관련 유틸리티 함수들
 */

/**
 * 문서 정보를 마크다운 형식의 문자열로 포맷합니다
 * @param {Object} document - 문서 객체
 * @param {number} index - 문서 인덱스 (1부터 시작)
 * @returns {string} 포맷된 문서 정보
 */
export function formatDocumentInfo(document, index) {
    if (!document) {
        return '';
    }

    const uploadDate = formatDate(document.uploadedAt);
    const fileSize = formatFileSize(document.fileSize);

    let info = `${index}. **${document.fileName}**\n`;
    info += `   - 파일 타입: ${document.fileType || '알 수 없음'}\n`;
    info += `   - 파일 크기: ${fileSize}\n`;
    info += `   - 업로드 날짜: ${uploadDate}\n`;
    info += `   - 업로더: ${document.uploadedBy || '알 수 없음'}\n`;

    if (document.description) {
        info += `   - 설명: ${document.description}\n`;
    }

    info += '\n';
    return info;
}

/**
 * 문서 목록을 마크다운 형식의 메시지로 변환합니다
 * @param {Array} documents - 문서 배열
 * @returns {string} 포맷된 문서 목록 메시지
 */
export function formatDocumentListMessage(documents) {
    if (!Array.isArray(documents) || documents.length === 0) {
        return '📂 **현재 업로드된 문서가 없습니다.**\n\n문서를 업로드하시려면 "문서 관리" 탭을 이용해주세요.';
    }

    let message = `📂 **업로드된 RAG 문서 목록** (총 ${documents.length}개)\n\n`;

    documents.forEach((doc, index) => {
        message += formatDocumentInfo(doc, index + 1);
    });

    return message;
}

/**
 * 문서 객체를 검증합니다
 * @param {Object} document - 문서 객체
 * @returns {boolean} 유효한 문서 여부
 */
export function isValidDocument(document) {
    if (!document || typeof document !== 'object') {
        return false;
    }

    // 최소한 ID와 파일명은 있어야 함
    return Boolean(document.id && document.fileName);
}

/**
 * 문서 배열을 크기 순으로 정렬합니다
 * @param {Array} documents - 문서 배열
 * @param {boolean} descending - 내림차순 정렬 여부 (기본값: true)
 * @returns {Array} 정렬된 문서 배열
 */
export function sortDocumentsBySize(documents, descending = true) {
    if (!Array.isArray(documents)) {
        return [];
    }

    return [...documents].sort((a, b) => {
        const sizeA = a.fileSize || 0;
        const sizeB = b.fileSize || 0;
        return descending ? sizeB - sizeA : sizeA - sizeB;
    });
}

/**
 * 문서 배열을 업로드 날짜 순으로 정렬합니다
 * @param {Array} documents - 문서 배열
 * @param {boolean} descending - 내림차순 정렬 여부 (기본값: true)
 * @returns {Array} 정렬된 문서 배열
 */
export function sortDocumentsByDate(documents, descending = true) {
    if (!Array.isArray(documents)) {
        return [];
    }

    return [...documents].sort((a, b) => {
        const dateA = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
        const dateB = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
        return descending ? dateB - dateA : dateA - dateB;
    });
}
