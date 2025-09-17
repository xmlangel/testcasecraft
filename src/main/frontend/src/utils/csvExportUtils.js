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

        // CSV 콘텐츠 생성 (PDF와 동일한 구조)
        let csvContent = '';

        // 1. HEADER SECTION - 제목 및 기본 정보
        csvContent += '=== AUTOMATED TEST EXECUTION REPORT ===\n';
        const title = testResult.testExecutionName || testResult.fileName || 'Test Report';
        csvContent += `제목,${escapeCsvText(title)}\n`;
        csvContent += `부제목,Automated Test Execution Report\n`;
        csvContent += `리포트 생성 시간,${formatDateForCsv(new Date())}\n`;
        csvContent += `테스트 실행 시간,${formatDateForCsv(testResult.uploadedAt)}\n`;
        csvContent += `실행자,${escapeCsvText(testResult.uploadedBy?.displayName || testResult.uploadedBy?.username || 'Unknown')}\n`;
        csvContent += '\n';

        // 2. EXECUTIVE SUMMARY - 핵심 지표 요약
        const passed = testResult.totalTests - testResult.failures - testResult.errors - testResult.skipped;
        const executedTests = testResult.totalTests - testResult.skipped;
        const successRate = executedTests > 0 ? (passed / executedTests * 100) : 0;

        csvContent += '=== EXECUTIVE SUMMARY ===\n';
        csvContent += 'Test Execution Overview\n';
        csvContent += `Total Test Cases,${testResult.totalTests}\n`;
        csvContent += `Executed Tests,${executedTests}\n`;
        csvContent += `Passed,"${passed} (${executedTests > 0 ? (passed/executedTests*100).toFixed(1) : 0}%)"\n`;
        csvContent += `Failed,"${testResult.failures} (${executedTests > 0 ? (testResult.failures/executedTests*100).toFixed(1) : 0}%)"\n`;
        csvContent += `Errors,"${testResult.errors} (${executedTests > 0 ? (testResult.errors/executedTests*100).toFixed(1) : 0}%)"\n`;
        csvContent += `Skipped,"${testResult.skipped} (${testResult.totalTests > 0 ? (testResult.skipped/testResult.totalTests*100).toFixed(1) : 0}%)"\n`;
        csvContent += `Success Rate,${successRate.toFixed(1)}% (of executed)\n`;
        csvContent += `Total Execution Time,${formatDurationForCsv(testResult.time || 0)}\n`;
        csvContent += `Test Suites,${testSuites.length}\n`;
        csvContent += '\n';

        // 3. TEST SUITE RESULTS - 테스트 스위트별 결과
        if (testSuites && testSuites.length > 0) {
            csvContent += '=== TEST SUITE RESULTS ===\n';
            csvContent += '번호,스위트명,총 테스트,통과,실패,오류,스킵,성공률,실행시간,패키지명,상태\n';

            testSuites.forEach((suite, index) => {
                const suitePassed = (suite.tests || 0) - (suite.failures || 0) - (suite.errors || 0) - (suite.skipped || 0);
                const suiteExecuted = (suite.tests || 0) - (suite.skipped || 0);
                const suiteSuccessRate = suiteExecuted > 0 ? (suitePassed / suiteExecuted * 100).toFixed(1) : 0;
                const suiteStatus = (suite.failures || 0) > 0 || (suite.errors || 0) > 0 ? 'FAILED' : 'PASSED';

                const fields = [
                    index + 1,
                    escapeCsvText(suite.name || ''),
                    suite.tests || 0,
                    suitePassed,
                    suite.failures || 0,
                    suite.errors || 0,
                    suite.skipped || 0,
                    `${suiteSuccessRate}%`,
                    formatDurationForCsv(suite.time),
                    escapeCsvText(suite.package || ''),
                    suiteStatus
                ];
                csvContent += fields.join(',') + '\n';
            });
            csvContent += '\n';
        }

        // 4. TEST CASE DETAILS - 상세 테스트 케이스 결과
        if (allTestCases && allTestCases.length > 0) {
            csvContent += '=== TEST CASE DETAILS ===\n';
            csvContent += '번호,테스트케이스명,클래스명,상태,실행시간,실패메시지,스택트레이스,SystemOut,SystemErr,사용자노트\n';

            allTestCases.forEach((testCase, index) => {
                csvContent += convertTestCaseToCSV(testCase, index) + '\n';
            });
            csvContent += '\n';
        }

        // 5. PASSED TEST ANALYSIS - 성공한 테스트 분석
        const passedCases = allTestCases.filter(tc => tc.status === 'PASSED');
        csvContent += '=== PASSED TEST ANALYSIS ===\n';

        if (passedCases.length === 0) {
            csvContent += 'No passed tests found.\n';
        } else {
            csvContent += `Total Passed Tests: ${passedCases.length}\n`;
            csvContent += '번호,테스트케이스명,클래스명,상태,실행시간,SystemOut,SystemErr,사용자노트\n';

            passedCases.forEach((testCase, index) => {
                const testName = (testCase.userTitle || testCase.name).length > 50
                    ? (testCase.userTitle || testCase.name).substring(0, 47) + '...'
                    : (testCase.userTitle || testCase.name);

                const fields = [
                    index + 1,
                    escapeCsvText(testName),
                    escapeCsvText(testCase.className || ''),
                    escapeCsvText(testCase.status || ''),
                    formatDurationForCsv(testCase.time),
                    escapeCsvText(testCase.systemOut || ''),
                    escapeCsvText(testCase.systemErr || ''),
                    escapeCsvText(testCase.userNotes || '')
                ];
                csvContent += fields.join(',') + '\n';
            });
        }
        csvContent += '\n';

        // 6. FAILED TEST ANALYSIS - 실패 분석
        const failedCases = allTestCases.filter(tc => tc.status === 'FAILED' || tc.status === 'ERROR');
        csvContent += '=== FAILED TEST ANALYSIS ===\n';

        if (failedCases.length === 0) {
            csvContent += 'All tests passed successfully! No failed tests to analyze.\n';
        } else {
            csvContent += `Total Failed Tests: ${failedCases.length}\n`;
            csvContent += '번호,테스트케이스명,클래스명,상태,실행시간,실패타입,실패메시지,스택트레이스\n';

            failedCases.forEach((testCase, index) => {
                const testName = (testCase.userTitle || testCase.name).length > 50
                    ? (testCase.userTitle || testCase.name).substring(0, 47) + '...'
                    : (testCase.userTitle || testCase.name);

                const fields = [
                    index + 1,
                    escapeCsvText(testName),
                    escapeCsvText(testCase.className || ''),
                    escapeCsvText(testCase.status || ''),
                    formatDurationForCsv(testCase.time),
                    escapeCsvText(testCase.failureType || ''),
                    escapeCsvText(testCase.failureMessage || ''),
                    escapeCsvText(testCase.stackTrace || '')
                ];
                csvContent += fields.join(',') + '\n';
            });
        }

        // 7. SKIPPED TEST ANALYSIS - 스킵된 테스트 분석
        const skippedCases = allTestCases.filter(tc => tc.status === 'SKIPPED');
        if (skippedCases.length > 0) {
            csvContent += '=== SKIPPED TEST ANALYSIS ===\n';
            csvContent += `Total Skipped Tests: ${skippedCases.length}\n`;
            csvContent += '번호,테스트케이스명,클래스명,상태,실행시간,스킵메시지,사용자노트\n';

            skippedCases.forEach((testCase, index) => {
                const testName = (testCase.userTitle || testCase.name).length > 50
                    ? (testCase.userTitle || testCase.name).substring(0, 47) + '...'
                    : (testCase.userTitle || testCase.name);

                const fields = [
                    index + 1,
                    escapeCsvText(testName),
                    escapeCsvText(testCase.className || ''),
                    escapeCsvText(testCase.status || ''),
                    formatDurationForCsv(testCase.time),
                    escapeCsvText(testCase.skipMessage || ''),
                    escapeCsvText(testCase.userNotes || '')
                ];
                csvContent += fields.join(',') + '\n';
            });
            csvContent += '\n';
        }

        // 8. CSV 파일 다운로드
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