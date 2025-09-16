// src/main/frontend/src/utils/csvExportUtils.js

/**
 * CSV Export 유틸리티 함수들
 * 자동화 테스트 결과를 CSV 형태로 내보내기 위한 유틸리티
 */

/**
 * 텍스트를 CSV에 안전하게 사용할 수 있도록 이스케이프 처리
 * @param {string} text - 이스케이프할 텍스트
 * @returns {string} 이스케이프된 텍스트
 */
const escapeCsvText = (text) => {
    if (!text) return '';

    const textStr = String(text);

    // 쉼표, 따옴표, 줄바꿈이 포함된 경우 따옴표로 감싸고 내부 따옴표는 더블 따옴표로 처리
    if (textStr.includes(',') || textStr.includes('"') || textStr.includes('\n') || textStr.includes('\r')) {
        return `"${textStr.replace(/"/g, '""')}"`;
    }

    return textStr;
};

/**
 * 날짜를 CSV 친화적 형식으로 포맷
 * @param {string|Date} date - 포맷할 날짜
 * @returns {string} 포맷된 날짜 문자열
 */
const formatDateForCsv = (date) => {
    if (!date) return '';

    try {
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) return '';

        // YYYY-MM-DD HH:mm:ss 형식
        return dateObj.toISOString().replace('T', ' ').substring(0, 19);
    } catch (error) {
        console.warn('날짜 포맷 오류:', error);
        return '';
    }
};

/**
 * 실행 시간을 초 단위로 포맷
 * @param {number} seconds - 실행 시간 (초)
 * @returns {string} 포맷된 실행 시간
 */
const formatDurationForCsv = (seconds) => {
    if (!seconds || seconds === 0) return '0';

    if (seconds < 1) {
        return `${(seconds * 1000).toFixed(0)}ms`;
    }

    if (seconds < 60) {
        return `${seconds.toFixed(3)}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(3);
    return `${minutes}m ${remainingSeconds}s`;
};

/**
 * 테스트 케이스 데이터를 CSV 행으로 변환
 * @param {Object} testCase - 테스트 케이스 객체
 * @param {number} index - 인덱스 번호
 * @returns {string} CSV 행 문자열
 */
const convertTestCaseToCSV = (testCase, index) => {
    const fields = [
        index + 1, // 번호
        escapeCsvText(testCase.userTitle || testCase.name || ''), // 테스트 케이스명
        escapeCsvText(testCase.className || ''), // 클래스명
        escapeCsvText(testCase.status || ''), // 상태
        formatDurationForCsv(testCase.time), // 실행 시간
        escapeCsvText(testCase.failureMessage || ''), // 실패 메시지
        escapeCsvText(testCase.stackTrace || ''), // 스택 트레이스
        escapeCsvText(testCase.systemOut || ''), // System Out
        escapeCsvText(testCase.systemErr || ''), // System Err
        escapeCsvText(testCase.userNotes || '') // 사용자 노트
    ];

    return fields.join(',');
};

/**
 * 테스트 스위트 요약을 CSV 행으로 변환
 * @param {Object} suite - 테스트 스위트 객체
 * @param {number} index - 인덱스 번호
 * @returns {string} CSV 행 문자열
 */
const convertSuiteToCSV = (suite, index) => {
    const fields = [
        index + 1, // 번호
        escapeCsvText(suite.name || ''), // 스위트명
        suite.tests || 0, // 총 테스트 수
        suite.failures || 0, // 실패 수
        suite.errors || 0, // 오류 수
        suite.skipped || 0, // 스킵 수
        formatDurationForCsv(suite.time), // 실행 시간
        escapeCsvText(suite.package || '') // 패키지명
    ];

    return fields.join(',');
};

/**
 * JUnit 테스트 결과를 CSV로 내보내기
 * @param {Object} testResult - 테스트 결과 객체
 * @param {Array} testSuites - 테스트 스위트 배열
 * @param {Array} allTestCases - 모든 테스트 케이스 배열
 * @returns {Object} 내보내기 결과 객체
 */
export const exportTestResultToCSV = async (testResult, testSuites = [], allTestCases = []) => {
    try {
        // 기본 정보 검증
        if (!testResult) {
            throw new Error('테스트 결과가 없습니다.');
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        const fileName = `junit-test-results-${timestamp}.csv`;

        // CSV 콘텐츠 생성
        let csvContent = '';

        // 1. 전체 요약 정보
        csvContent += '=== 테스트 결과 요약 ===\n';
        csvContent += `테스트 결과 ID,${escapeCsvText(testResult.id)}\n`;
        csvContent += `프로젝트명,${escapeCsvText(testResult.projectName || '')}\n`;
        csvContent += `업로드 시간,${formatDateForCsv(testResult.uploadedAt)}\n`;
        csvContent += `업로드자,${escapeCsvText(testResult.uploadedBy?.displayName || testResult.uploadedBy?.username || '')}\n`;
        csvContent += `총 테스트 수,${testResult.totalTests || 0}\n`;
        csvContent += `성공,${testResult.passed || 0}\n`;
        csvContent += `실패,${testResult.failures || 0}\n`;
        csvContent += `오류,${testResult.errors || 0}\n`;
        csvContent += `스킵,${testResult.skipped || 0}\n`;
        csvContent += `전체 실행 시간,${formatDurationForCsv(testResult.totalTime)}\n`;
        csvContent += '\n';

        // 2. 테스트 스위트 정보
        if (testSuites && testSuites.length > 0) {
            csvContent += '=== 테스트 스위트 요약 ===\n';
            csvContent += '번호,스위트명,총 테스트,실패,오류,스킵,실행시간,패키지명\n';

            testSuites.forEach((suite, index) => {
                csvContent += convertSuiteToCSV(suite, index) + '\n';
            });
            csvContent += '\n';
        }

        // 3. 전체 테스트 케이스 상세 정보
        if (allTestCases && allTestCases.length > 0) {
            csvContent += '=== 테스트 케이스 상세 ===\n';
            csvContent += '번호,테스트케이스명,클래스명,상태,실행시간,실패메시지,스택트레이스,SystemOut,SystemErr,사용자노트\n';

            allTestCases.forEach((testCase, index) => {
                csvContent += convertTestCaseToCSV(testCase, index) + '\n';
            });
        }

        // 4. 실패한 테스트만 별도 정리
        const failedCases = allTestCases.filter(tc => tc.status === 'FAILED' || tc.status === 'ERROR');
        if (failedCases.length > 0) {
            csvContent += '\n=== 실패한 테스트 케이스 ===\n';
            csvContent += '번호,테스트케이스명,클래스명,상태,실행시간,실패메시지,스택트레이스\n';

            failedCases.forEach((testCase, index) => {
                const fields = [
                    index + 1,
                    escapeCsvText(testCase.userTitle || testCase.name || ''),
                    escapeCsvText(testCase.className || ''),
                    escapeCsvText(testCase.status || ''),
                    formatDurationForCsv(testCase.time),
                    escapeCsvText(testCase.failureMessage || ''),
                    escapeCsvText(testCase.stackTrace || '')
                ];
                csvContent += fields.join(',') + '\n';
            });
        }

        // 5. CSV 파일 다운로드
        const blob = new Blob(['\uFEFF' + csvContent], {
            type: 'text/csv;charset=utf-8;'
        }); // UTF-8 BOM 추가로 한글 깨짐 방지

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // URL 해제
        window.URL.revokeObjectURL(url);

        return {
            success: true,
            fileName: fileName,
            message: 'CSV 파일이 성공적으로 생성되었습니다.'
        };

    } catch (error) {
        console.error('CSV 내보내기 오류:', error);
        return {
            success: false,
            message: `CSV 내보내기 실패: ${error.message}`
        };
    }
};

/**
 * 테스트 케이스 목록만을 간단한 CSV로 내보내기
 * @param {Array} testCases - 테스트 케이스 배열
 * @param {string} fileName - 파일명 (선택사항)
 * @returns {Object} 내보내기 결과 객체
 */
export const exportTestCasesToCSV = async (testCases = [], fileName = null) => {
    try {
        if (!testCases || testCases.length === 0) {
            throw new Error('내보낼 테스트 케이스가 없습니다.');
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        const csvFileName = fileName || `test-cases-${timestamp}.csv`;

        let csvContent = '번호,테스트케이스명,클래스명,상태,실행시간,실패메시지\n';

        testCases.forEach((testCase, index) => {
            const fields = [
                index + 1,
                escapeCsvText(testCase.userTitle || testCase.name || ''),
                escapeCsvText(testCase.className || ''),
                escapeCsvText(testCase.status || ''),
                formatDurationForCsv(testCase.time),
                escapeCsvText(testCase.failureMessage || '')
            ];
            csvContent += fields.join(',') + '\n';
        });

        // CSV 파일 다운로드
        const blob = new Blob(['\uFEFF' + csvContent], {
            type: 'text/csv;charset=utf-8;'
        });

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = csvFileName;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);

        return {
            success: true,
            fileName: csvFileName,
            message: 'CSV 파일이 성공적으로 생성되었습니다.'
        };

    } catch (error) {
        console.error('테스트 케이스 CSV 내보내기 오류:', error);
        return {
            success: false,
            message: `CSV 내보내기 실패: ${error.message}`
        };
    }
};