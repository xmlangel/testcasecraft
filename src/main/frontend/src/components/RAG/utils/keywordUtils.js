// src/components/RAG/utils/keywordUtils.js

/**
 * 키워드 매칭 및 필터링 관련 유틸리티 함수들
 */

/**
 * 파일 리스트 요청 키워드 목록
 */
export const FILE_LIST_KEYWORDS = [
    '파일리스트', '파일 리스트', '파일 목록', '파일목록',
    '문서리스트', '문서 리스트', '문서 목록', '문서목록',
    'file list', 'filelist', 'document list', 'documentlist',
    '파일을 보여', '파일 보여', '문서를 보여', '문서 보여',
    '업로드된 파일', '업로드 파일', '업로드된 문서', '업로드 문서'
];

/**
 * 테스트 케이스 요청 키워드 목록
 */
export const TEST_CASE_KEYWORDS = [
    '테스트 케이스', '테스트케이스',
    'test case', 'testcase',
    '테스트 시나리오'
];

/**
 * 테스트 케이스 파일 필터링 키워드 목록
 */
export const TEST_CASE_FILE_KEYWORDS = [
    'testcase', '테스트케이스', '테스트 케이스',
    'test case', 'test-case'
];

/**
 * 텍스트에 키워드가 포함되어 있는지 확인합니다 (대소문자 무시)
 * @param {string} text - 검색할 텍스트
 * @param {Array<string>} keywords - 키워드 목록
 * @returns {boolean} 키워드 포함 여부
 */
export function containsKeyword(text, keywords) {
    if (!text || typeof text !== 'string') {
        return false;
    }

    const lowerText = text.toLowerCase();
    return keywords.some(keyword =>
        lowerText.includes(keyword.toLowerCase())
    );
}

/**
 * 파일 리스트 요청인지 확인합니다
 * @param {string} text - 사용자 입력 텍스트
 * @returns {boolean} 파일 리스트 요청 여부
 */
export function isFileListRequest(text) {
    return containsKeyword(text, FILE_LIST_KEYWORDS);
}

/**
 * 테스트 케이스 생성 요청인지 확인합니다
 * @param {string} text - 사용자 입력 텍스트
 * @returns {boolean} 테스트 케이스 요청 여부
 */
export function isTestCaseRequest(text) {
    return containsKeyword(text, TEST_CASE_KEYWORDS);
}

/**
 * 문서가 테스트 케이스 파일인지 확인합니다
 * @param {Object} document - 문서 객체
 * @returns {boolean} 테스트 케이스 파일 여부
 */
export function isTestCaseDocument(document) {
    if (!document) {
        return false;
    }

    const fileName = (document.fileName || '').toLowerCase();
    const description = (document.description || '').toLowerCase();
    const fileType = (document.fileType || '').toLowerCase();

    return TEST_CASE_FILE_KEYWORDS.some(keyword =>
        fileName.includes(keyword) ||
        description.includes(keyword) ||
        fileType.includes(keyword)
    );
}

/**
 * 테스트 케이스 문서를 제외한 문서 목록을 필터링합니다
 * @param {Array} documents - 문서 배열
 * @returns {Array} 필터링된 문서 배열
 */
export function filterNonTestCaseDocuments(documents) {
    if (!Array.isArray(documents)) {
        return [];
    }

    return documents.filter(doc => !isTestCaseDocument(doc));
}
