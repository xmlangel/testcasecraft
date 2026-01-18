// src/components/RAG/utils/documentFilters.js
import { DOCUMENT_TYPE } from '../constants.js';

/**
 * 테스트케이스 문서 여부 확인
 * 
 * @param {Object} document - 문서 객체
 * @param {string} document.fileName - 파일명
 * @returns {boolean} 테스트케이스 문서 여부
 */
export function isTestCaseDocument(document) {
    if (!document || !document.fileName) return false;
    return document.fileName.startsWith(DOCUMENT_TYPE.TESTCASE_PREFIX);
}

/**
 * 일반 문서만 필터링 (테스트케이스 문서 제외)
 * 
 * @param {Array<Object>} documents - 문서 배열
 * @returns {Array<Object>} 일반 문서 배열
 */
export function filterRegularDocuments(documents) {
    if (!Array.isArray(documents)) return [];
    return documents.filter(doc => !isTestCaseDocument(doc));
}

/**
 * 테스트케이스 문서만 필터링
 * 
 * @param {Array<Object>} documents - 문서 배열
 * @returns {Array<Object>} 테스트케이스 문서 배열
 */
export function filterTestCaseDocuments(documents) {
    if (!Array.isArray(documents)) return [];
    return documents.filter(doc => isTestCaseDocument(doc));
}
