// src/main/frontend/src/utils/pdfExportUtils.js

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { addNanumGothicToJsPDF, setupKoreanFontFallback } from '../assets/fonts/nanumGothicFont.js';

/**
 * 간소화된 폰트 설정 (jsPDF 호환성 우선)
 */
const addKoreanFont = async (pdf) => {
    try {

        // 복잡한 폰트 로딩 대신 안전한 기본 폰트만 사용
        setupKoreanFontFallback(pdf);

        return true;
    } catch (error) {
        console.warn('⚠️ 한글 폰트 설정 실패:', error);

        // 최종 안전 모드: 기본 helvetica만 사용
        try {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(12);
        } catch (safetyError) {
            console.error('💥 최종 안전 모드도 실패:', safetyError);
        }

        return false;
    }
};

/**
 * 한글 텍스트를 PDF용으로 안전하게 처리하는 함수
 */
const processKoreanText = (text) => {
    if (!text) return '';

    try {
        // 문자열로 변환하고 null/undefined 처리
        const stringText = String(text);

        // 제어 문자 제거하되 한글은 보존
        const cleanText = stringText.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

        // UTF-8 인코딩을 위한 정규화
        return cleanText.normalize('NFC');
    } catch (error) {
        console.warn('한글 텍스트 처리 오류:', error, text);
        return String(text);
    }
};

/**
 * 한글 텍스트를 로마자로 변환 (확장된 폴백용)
 */
const convertKoreanToRoman = (text) => {
    // 확장된 한국어-영어 매핑 테이블
    const koreanMap = {
        // 기본 테스트 용어
        '테스트': 'Test',
        '성공': 'Passed',
        '실패': 'Failed',
        '오류': 'Error',
        '스킵': 'Skipped',
        '실행': 'Executed',
        '결과': 'Result',
        '분석': 'Analysis',
        '요약': 'Summary',

        // 통계 용어
        '전체': 'Total',
        '성공률': 'Success Rate',
        '실행시간': 'Execution Time',
        '클래스': 'Class',
        '메시지': 'Message',
        '상태': 'Status',
        '시간': 'Time',
        '개수': 'Count',
        '비율': 'Rate',

        // PDF 보고서 용어
        '보고서': 'Report',
        '자동화': 'Automated',
        '생성': 'Generated',
        '실행자': 'Executor',
        '날짜': 'Date',
        '파일': 'File',
        '번호': 'No.',
        '이름': 'Name',
        '종류': 'Type',

        // 상태 관련
        '진행중': 'In Progress',
        '완료': 'Completed',
        '대기': 'Waiting',
        '중단': 'Stopped',
        '일시정지': 'Paused',

        // 일반적인 단어
        '없음': 'None',
        '알수없음': 'Unknown',
        '정보': 'Info',
        '경고': 'Warning',
        '주의': 'Caution',
        '확인': 'Confirm',
        '취소': 'Cancel',

        // 숫자 관련 (한글 숫자)
        '하나': 'One',
        '둘': 'Two',
        '셋': 'Three',
        '넷': 'Four',
        '다섯': 'Five',

        // 시간 관련
        '오전': 'AM',
        '오후': 'PM',
        '년': '',
        '월': '',
        '일': '',

        // 자주 사용되는 접미사
        '에서': 'at',
        '으로': 'to',
        '의': 'of',
        '는': '',
        '를': '',
        '가': '',
        '이': '',
        '와': 'and',
        '과': 'and'
    };


    let result = String(text);
    let convertedCount = 0;

    // 1단계: 직접 매핑
    for (const [korean, english] of Object.entries(koreanMap)) {
        if (result.includes(korean)) {
            result = result.replace(new RegExp(korean, 'g'), english);
            convertedCount++;
        }
    }

    // 2단계: 남은 한글 처리
    const remainingKorean = result.match(/[가-힣]/g);
    if (remainingKorean && remainingKorean.length > 0) {

        // 남은 한글을 로마자 음성표기로 대체 (간단한 방식)
        const koreanChars = result.match(/[가-힣]+/g) || [];
        for (const koreanWord of koreanChars) {
            // 간단한 로마자 변환 (예: 가→ga, 나→na 등)
            const romanized = koreanWord.replace(/[가-힣]/g, (char) => {
                const code = char.charCodeAt(0) - 44032; // 한글 유니코드 시작점
                const initial = Math.floor(code / 588);
                const medial = Math.floor((code % 588) / 28);
                const final = code % 28;

                // 간단한 초성 변환
                const initials = ['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h'];
                const medials = ['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','weo','we','wi','yu','eu','yi','i'];
                const finals = ['','g','kk','gs','n','nj','nh','d','r','rg','rm','rb','rs','rt','rp','rh','m','b','bs','s','ss','ng','j','ch','k','t','p','h'];

                return (initials[initial] || '') + (medials[medial] || '') + (finals[final] || '');
            });
            result = result.replace(koreanWord, romanized);
        }
    }

    // 3단계: 정리
    result = result
        .replace(/\s+/g, ' ') // 중복 공백 제거
        .trim(); // 앞뒤 공백 제거

    return result;
};

/**
 * 극단적으로 안전한 텍스트 설정 함수 (jsPDF 호환성 최우선)
 */
const safeSetText = (pdf, text, x, y, options = {}) => {
    if (!text || text.trim() === '') return;

    try {
        // 우선 한글을 영어로 변환 (jsPDF 오류 방지)
        const romanText = convertKoreanToRoman(String(text));

        // ASCII 문자만 추출하여 안전성 확보
        const safeText = romanText
            .replace(/[^\x20-\x7E]/g, '?') // 비-ASCII 문자 제거
            .substring(0, 100); // 길이 제한


        // 안전한 텍스트 렌더링
        pdf.text(safeText || '[EMPTY]', x, y, options);

    } catch (error) {
        console.warn(`⚠️ 안전 텍스트 렌더링 실패: ${error.message}`);

        try {
            // 최종 폴백: 완전히 안전한 텍스트
            const ultraSafeText = 'TEXT_RENDER_ERROR';
            pdf.text(ultraSafeText, x, y, options);
        } catch (finalError) {
            console.error(`💥 최종 폴백도 실패: ${finalError.message} - 텍스트 완전 스킵`);
            // 완전히 실패한 경우 그냥 무시
        }
    }
};

/**
 * 테스트 결과를 HTML로 생성하는 함수 (한글 지원)
 */
const generateTestResultHTML = (testResult, testSuites, testCases) => {
    const passed = testResult.totalTests - testResult.failures - testResult.errors - testResult.skipped;
    const executedTests = testResult.totalTests - testResult.skipped; // 실제 실행된 테스트
    const successRate = executedTests > 0 ? (passed / executedTests * 100) : 0; // 실행된 테스트 중 성공률
    const uploadDate = formatDateForPDF(testResult.uploadedAt);
    const uploadedBy = testResult.uploadedBy?.displayName || testResult.uploadedBy?.username || 'Unknown';

    let analysisText = '';
    if (successRate >= 95) {
        analysisText = '우수: 테스트 실행이 뛰어난 품질을 보여주며 실패가 최소화되었습니다.';
    } else if (successRate >= 85) {
        analysisText = '양호: 테스트 실행이 좋은 품질을 보여주며 실패율이 허용 가능한 수준입니다.';
    } else if (successRate >= 70) {
        analysisText = '보통: 테스트 실행이 보통 품질을 보여줍니다. 실패한 케이스 검토를 권장합니다.';
    } else {
        analysisText = '불량: 테스트 실행에 심각한 문제가 있습니다. 즉시 조치가 필요합니다.';
    }

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700&display=swap');

                body {
                    font-family: 'Nanum Gothic', '맑은 고딕', 'Malgun Gothic', sans-serif;
                    margin: 0;
                    padding: 15px;
                    color: #333;
                    line-height: 1.5;
                    box-sizing: border-box;
                    max-width: 100%;
                    overflow-x: hidden;
                }

                .header {
                    border-bottom: 3px solid #1976d2;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }

                .title {
                    font-size: 28px;
                    font-weight: 700;
                    color: #1976d2;
                    margin-bottom: 10px;
                }

                .subtitle {
                    font-size: 16px;
                    color: #666;
                    margin-bottom: 20px;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    font-size: 12px;
                    color: #666;
                }

                .section {
                    margin-bottom: 30px;
                    page-break-inside: avoid;
                    break-inside: avoid;
                }

                .section-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #333;
                    margin-bottom: 15px;
                    padding-bottom: 5px;
                    border-bottom: 2px solid #eee;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 10px;
                    margin-bottom: 20px;
                }

                .stat-card {
                    text-align: center;
                    padding: 15px;
                    border-radius: 8px;
                    border: 1px solid #e0e0e0;
                }

                .stat-value {
                    font-size: 24px;
                    font-weight: 700;
                    margin-bottom: 5px;
                }

                .stat-label {
                    font-size: 12px;
                    color: #666;
                }

                .passed { color: #4caf50; }
                .failed { color: #f44336; }
                .error { color: #ff9800; }
                .skipped { color: #9e9e9e; }

                .analysis-box {
                    background: #f5f5f5;
                    padding: 20px;
                    border-radius: 8px;
                    border-left: 4px solid #1976d2;
                    margin: 20px 0;
                }

                .table {
                    width: 100%;
                    max-width: 100%;
                    border-collapse: collapse;
                    margin-top: 15px;
                    font-size: 10px;
                    table-layout: fixed;
                    overflow-wrap: break-word;
                }

                .table th,
                .table td {
                    padding: 4px 6px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                /* 테스트 케이스 테이블 컬럼 너비 최적화 */
                .table.test-cases th:nth-child(1), .table.test-cases td:nth-child(1) { width: 8%; } /* # */
                .table.test-cases th:nth-child(2), .table.test-cases td:nth-child(2) { width: 45%; white-space: normal; } /* 테스트명 */
                .table.test-cases th:nth-child(3), .table.test-cases td:nth-child(3) { width: 25%; } /* 클래스 */
                .table.test-cases th:nth-child(4), .table.test-cases td:nth-child(4) { width: 12%; } /* 상태 */
                .table.test-cases th:nth-child(5), .table.test-cases td:nth-child(5) { width: 10%; } /* 실행시간 */

                /* 실패 분석 테이블 컬럼 너비 최적화 */
                .table.failed-tests th:nth-child(1), .table.failed-tests td:nth-child(1) { width: 6%; } /* # */
                .table.failed-tests th:nth-child(2), .table.failed-tests td:nth-child(2) { width: 30%; white-space: normal; } /* 테스트명 */
                .table.failed-tests th:nth-child(3), .table.failed-tests td:nth-child(3) { width: 20%; } /* 클래스 */
                .table.failed-tests th:nth-child(4), .table.failed-tests td:nth-child(4) { width: 10%; } /* 상태 */
                .table.failed-tests th:nth-child(5), .table.failed-tests td:nth-child(5) { width: 34%; white-space: normal; font-size: 9px; } /* 오류 메시지 */

                /* 테스트 스위트 테이블 컬럼 너비 최적화 */
                .table.test-suites th:nth-child(1), .table.test-suites td:nth-child(1) { width: 40%; white-space: normal; } /* 스위트명 */
                .table.test-suites th:nth-child(2), .table.test-suites td:nth-child(2) { width: 10%; } /* 테스트 수 */
                .table.test-suites th:nth-child(3), .table.test-suites td:nth-child(3) { width: 10%; } /* 성공 */
                .table.test-suites th:nth-child(4), .table.test-suites td:nth-child(4) { width: 10%; } /* 실패 */
                .table.test-suites th:nth-child(5), .table.test-suites td:nth-child(5) { width: 10%; } /* 오류 */
                .table.test-suites th:nth-child(6), .table.test-suites td:nth-child(6) { width: 20%; } /* 성공률 */

                .table th {
                    background-color: #f0f0f0;
                    font-weight: 700;
                }

                .table tr:nth-child(even) {
                    background-color: #f9f9f9;
                }

                .table tr {
                    page-break-inside: avoid;
                    break-inside: avoid;
                }

                .table thead {
                    display: table-header-group;
                }

                .table tbody {
                    page-break-inside: auto;
                }

                .status-passed { background-color: #e8f5e8; color: #2e7d32; }
                .status-failed { background-color: #ffebee; color: #c62828; }
                .status-error { background-color: #fff3e0; color: #ef6c00; }
                .status-skipped { background-color: #f5f5f5; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="title">${testResult.testExecutionName || testResult.fileName || 'Test Report'}</div>
                <div class="subtitle">자동화 테스트 실행 보고서</div>
                <div class="info-grid">
                    <div>보고서 생성: ${new Date().toLocaleString('ko-KR')}</div>
                    <div>테스트 실행: ${uploadDate}</div>
                    <div>실행자: ${uploadedBy}</div>
                    <div>성공률: ${successRate.toFixed(1)}% (${executedTests}개 실행 중)</div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">📊 실행 요약</div>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${testResult.totalTests}</div>
                        <div class="stat-label">전체 테스트</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${executedTests}</div>
                        <div class="stat-label">실행된 테스트</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value passed">${passed}</div>
                        <div class="stat-label">성공</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value failed">${testResult.failures}</div>
                        <div class="stat-label">실패</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value error">${testResult.errors}</div>
                        <div class="stat-label">오류</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value skipped">${testResult.skipped}</div>
                        <div class="stat-label">스킵</div>
                    </div>
                </div>

                <div class="analysis-box">
                    <strong>분석 결과:</strong> ${analysisText}
                    ${testResult.skipped > 0 ? `<br><br><strong>참고:</strong> ${testResult.skipped}개의 테스트가 스킵되었습니다. 성공률은 실제 실행된 ${executedTests}개 테스트를 기준으로 계산되었습니다.` : ''}
                </div>
            </div>

            ${testSuites.length > 0 ? generateTestSuitesHTML(testSuites) : ''}
            ${testCases.length > 0 ? generateTestCasesHTML(testCases) : ''}
            ${testCases.filter(tc => tc.status === 'FAILED' || tc.status === 'ERROR').length > 0 ?
                generateFailedTestsHTML(testCases.filter(tc => tc.status === 'FAILED' || tc.status === 'ERROR')) : ''}
        </body>
        </html>
    `;
};

const generateTestSuitesHTML = (testSuites) => {
    const rows = testSuites.map(suite => {
        const passed = suite.tests - suite.failures - suite.errors;
        const successRate = suite.tests > 0 ? (passed / suite.tests * 100) : 0;

        return `
            <tr>
                <td>${suite.name}</td>
                <td>${suite.tests}</td>
                <td class="passed">${passed}</td>
                <td class="failed">${suite.failures}</td>
                <td class="error">${suite.errors}</td>
                <td>${successRate.toFixed(1)}%</td>
            </tr>
        `;
    }).join('');

    return `
        <div class="section">
            <div class="section-title">📋 테스트 스위트 결과</div>
            <table class="table test-suites">
                <thead>
                    <tr>
                        <th>스위트명</th>
                        <th>테스트 수</th>
                        <th>성공</th>
                        <th>실패</th>
                        <th>오류</th>
                        <th>성공률</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
};

const generateTestCasesHTML = (testCases) => {
    const rows = testCases.map((testCase, index) => {
        const statusClass = `status-${testCase.status.toLowerCase()}`;
        const executionTime = testCase.time ? formatDuration(testCase.time) : '-';

        return `
            <tr class="${statusClass}">
                <td>${index + 1}</td>
                <td>${testCase.userTitle || testCase.name || '-'}</td>
                <td>${testCase.className || '-'}</td>
                <td><strong>${testCase.status}</strong></td>
                <td>${executionTime}</td>
            </tr>
        `;
    }).join('');

    return `
        <div class="section">
            <div class="section-title">🔍 개별 테스트 결과 (전체 ${testCases.length}개)</div>
            <table class="table test-cases">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>테스트명</th>
                        <th>클래스</th>
                        <th>상태</th>
                        <th>실행시간</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
};

const generateFailedTestsHTML = (failedCases) => {
    const rows = failedCases.map((testCase, index) => {
        const message = testCase.failureMessage ?
            testCase.failureMessage :
            '오류 메시지 없음';

        return `
            <tr>
                <td>${index + 1}</td>
                <td>${testCase.userTitle || testCase.name || '-'}</td>
                <td>${testCase.className || '-'}</td>
                <td class="failed">${testCase.status}</td>
                <td style="font-size: 10px;">${message}</td>
            </tr>
        `;
    }).join('');

    return `
        <div class="section">
            <div class="section-title">❌ 실패 분석 (전체 ${failedCases.length}개)</div>
            <table class="table failed-tests">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>테스트명</th>
                        <th>클래스</th>
                        <th>상태</th>
                        <th>오류 메시지</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows}
                </tbody>
            </table>
        </div>
    `;
};

/**
 * JUnit 테스트 결과를 PDF로 내보내는 유틸리티 함수
 */

/**
 * 테스트 결과를 HTML로 생성하여 PDF로 변환 (한글 지원)
 * @param {Object} testResult - 테스트 결과 데이터
 * @param {Array} testSuites - 테스트 스위트 목록
 * @param {Array} testCases - 테스트 케이스 목록
 * @param {string} fileName - 저장할 파일명 (기본값: 자동 생성)
 */
export const exportTestResultToPDF = async (testResult, testSuites = [], testCases = [], fileName = null) => {
    try {

        // HTML-to-Canvas 방식 시도 (한글 폰트 지원)

        try {
            return await exportTestResultToPDFCanvas(testResult, testSuites, testCases, fileName);
        } catch (canvasError) {
            console.warn('⚠️ Canvas 방식 실패, Legacy 방식으로 폴백:', canvasError.message);
            return await exportTestResultToPDFLegacy(testResult, testSuites, testCases, fileName);
        }

        // HTML-to-Canvas 방식은 주석 처리 (문제 해결 후 활성화)
        /*
        // HTML 내용 생성 (한글 폰트 적용)
        const htmlContent = generateTestResultHTML(testResult, testSuites, testCases);

        // 임시 DOM 요소 생성
        const tempDiv = document.createElement('div');
        tempDiv.className = 'pdf-content';
        tempDiv.innerHTML = htmlContent;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '-9999px';
        tempDiv.style.width = '794px'; // A4 너비 (픽셀)
        tempDiv.style.fontFamily = '"Nanum Gothic", "맑은 고딕", "Malgun Gothic", sans-serif';
        tempDiv.style.fontSize = '11px';
        tempDiv.style.lineHeight = '1.4';
        tempDiv.style.color = '#000';
        tempDiv.style.backgroundColor = '#fff';
        tempDiv.style.padding = '15px';
        tempDiv.style.boxSizing = 'border-box';
        tempDiv.style.overflow = 'hidden';

        document.body.appendChild(tempDiv);

        try {
            // HTML을 캔버스로 변환 (한글 폰트 적용됨)
            const canvas = await html2canvas(tempDiv, {
                scale: 2, // 고해상도
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                width: 794, // A4 너비
                windowWidth: 794,
                windowHeight: tempDiv.scrollHeight,
                scrollX: 0,
                scrollY: 0,
                foreignObjectRendering: true
            });

            // 캔버스를 이미지로 변환
            const imgData = canvas.toDataURL('image/png');

            // PDF 문서 생성
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // 이미지 크기 계산
            const imgWidth = pageWidth - 20; // 10mm 마진
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            const pageContentHeight = pageHeight - 20; // 마진 10mm 상하

            // 이미지가 페이지를 벗어나는 경우 여러 페이지로 나누기
            if (imgHeight <= pageContentHeight) {
                // 한 페이지에 들어가는 경우
                pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            } else {
                // 여러 페이지로 나누는 경우 - 정확한 페이지 분할
                let sourceY = 0; // 소스 이미지에서의 Y 위치
                let pageNumber = 0;

                while (sourceY < imgHeight) {
                    if (pageNumber > 0) {
                        pdf.addPage();
                    }

                    // 현재 페이지에 들어갈 수 있는 높이
                    const remainingHeight = imgHeight - sourceY;
                    const currentPageHeight = Math.min(remainingHeight, pageContentHeight);

                    // 캔버스를 잘라서 현재 페이지에 그리기
                    const sourceCanvas = document.createElement('canvas');
                    const sourceCtx = sourceCanvas.getContext('2d');
                    const scaleFactor = canvas.width / imgWidth;
                    const sourceHeight = currentPageHeight * scaleFactor;

                    sourceCanvas.width = canvas.width;
                    sourceCanvas.height = sourceHeight;

                    // 원본 캔버스에서 해당 부분만 추출
                    sourceCtx.drawImage(
                        canvas,
                        0, sourceY * scaleFactor, // 소스 위치
                        canvas.width, sourceHeight, // 소스 크기
                        0, 0, // 대상 위치
                        canvas.width, sourceHeight // 대상 크기
                    );

                    // 잘라진 이미지를 PDF에 추가
                    const pageImgData = sourceCanvas.toDataURL('image/png');
                    pdf.addImage(pageImgData, 'PNG', 10, 10, imgWidth, currentPageHeight);

                    sourceY += currentPageHeight;
                    pageNumber++;
                }
            }

            // 임시 요소 제거
            document.body.removeChild(tempDiv);

            // 파일명 생성
            const testName = (testResult.testExecutionName || testResult.fileName || 'test').replace(/[^a-zA-Z0-9._-]/g, '_');
            const version = new Date().toISOString().split('T')[0].replace(/-/g, '.');
            const defaultFileName = `${testName}_${version}.pdf`;
            const finalFileName = fileName || defaultFileName;

            // PDF 다운로드
            pdf.save(finalFileName);

            return {
                success: true,
                fileName: finalFileName,
                message: 'PDF 내보내기가 완료되었습니다.'
            };

        } catch (canvasError) {
            console.error('Canvas 변환 실패, 기본 방식 사용:', canvasError);
            // 폴백: 기본 jsPDF 방식
            return await exportTestResultToPDFLegacy(testResult, testSuites, testCases, fileName);
        }
        */

    } catch (error) {
        console.error('PDF 내보내기 실패:', error);
        try {
            return await exportTestResultToPDFLegacy(testResult, testSuites, testCases, fileName);
        } catch (legacyError) {
            console.error('Legacy PDF도 실패:', legacyError);
            return {
                success: false,
                error: legacyError.message,
                message: 'PDF 내보내기 중 오류가 발생했습니다.'
            };
        }
    }
};

/**
 * HTML-to-Canvas 방식으로 한글 폰트 지원 PDF 생성
 */
const exportTestResultToPDFCanvas = async (testResult, testSuites = [], testCases = [], fileName = null) => {
    try {

        // 한글 폰트 사전 로드
        await loadKoreanFont();

        // HTML 내용 생성 (한글 폰트 적용)
        let htmlContent;
        try {
            htmlContent = generateTestResultHTML(testResult, testSuites, testCases);
        } catch (htmlError) {
            console.error('❌ HTML 생성 실패, 간단한 테스트 HTML 사용:', htmlError);

            // 폴백: 간단한 테스트 HTML
            htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body {
                            font-family: 'Nanum Gothic', '나눔고딕', '맑은 고딕', sans-serif;
                            margin: 0;
                            padding: 20px;
                            background: white;
                            color: black;
                        }
                        .test-content {
                            background: #f5f5f5;
                            padding: 20px;
                            border: 1px solid #ddd;
                            margin: 10px 0;
                        }
                    </style>
                </head>
                <body>
                    <h1>테스트 결과 보고서</h1>
                    <div class="test-content">
                        <h2>기본 정보</h2>
                        <p>파일명: ${testResult.testExecutionName || 'test-result'}</p>
                        <p>전체 테스트: ${testResult.totalTests || 0}개</p>
                        <p>성공: ${testResult.totalTests - testResult.failures - testResult.errors || 0}개</p>
                        <p>실패: ${testResult.failures || 0}개</p>
                        <p>오류: ${testResult.errors || 0}개</p>
                    </div>
                    <div class="test-content">
                        <h2>한글 폰트 테스트</h2>
                        <p>이 텍스트가 나눔고딕 폰트로 표시되는지 확인해주세요.</p>
                        <p>가나다라마바사아자차카타파하</p>
                        <p>ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                        <p>1234567890</p>
                    </div>
                </body>
                </html>
            `;
        }

        // 임시 DOM 요소 생성
        const tempDiv = document.createElement('div');
        tempDiv.className = 'pdf-content';
        tempDiv.innerHTML = htmlContent;

        // 더 안전한 스타일 설정
        Object.assign(tempDiv.style, {
            position: 'absolute',
            left: '-10000px',
            top: '0px',
            width: '800px', // 조금 더 여유롭게
            minHeight: '600px', // 최소 높이 보장
            fontFamily: '"Nanum Gothic", "나눔고딕", "맑은 고딕", "Malgun Gothic", Arial, sans-serif',
            fontSize: '12px',
            lineHeight: '1.5',
            color: '#000000',
            backgroundColor: '#ffffff',
            padding: '20px',
            margin: '0',
            boxSizing: 'border-box',
            overflow: 'visible',
            display: 'block',
            visibility: 'visible',
            zIndex: '-1000',
            wordWrap: 'break-word',
            whiteSpace: 'normal'
        });

        document.body.appendChild(tempDiv);

        // DOM에 추가 후 강제 렌더링
        void tempDiv.offsetHeight; // 강제 reflow

        // 폰트 로딩 대기
        await new Promise(resolve => setTimeout(resolve, 1000));


        // 요소 크기 확인
        const elementHeight = tempDiv.scrollHeight;
        const elementWidth = tempDiv.scrollWidth;

        if (elementHeight === 0 || elementWidth === 0) {
            throw new Error('요소 크기가 0입니다. 콘텐츠가 생성되지 않았을 수 있습니다.');
        }

        // HTML을 캔버스로 변환 (한글 폰트 적용됨)
        const canvas = await html2canvas(tempDiv, {
            scale: 1.5, // 고해상도 (2에서 1.5로 낮춤)
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: true, // 디버깅용 로그 활성화
            width: elementWidth,
            height: elementHeight,
            windowWidth: elementWidth,
            windowHeight: elementHeight,
            scrollX: 0,
            scrollY: 0,
            foreignObjectRendering: false, // false로 변경
            onclone: (clonedDoc) => {
                const clonedElement = clonedDoc.querySelector('div');
            }
        });

        // 임시 요소 제거
        document.body.removeChild(tempDiv);

        // Canvas 검증
        if (!canvas || canvas.width === 0 || canvas.height === 0) {
            throw new Error(`Canvas 생성 실패: ${canvas ? `${canvas.width}x${canvas.height}` : 'null'}`);
        }


        // Canvas 내용 확인 (비어있는지 체크)
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let hasContent = false;

        // 투명하지 않은 픽셀이 있는지 확인
        for (let i = 3; i < pixels.length; i += 4) { // 알파 채널만 확인
            if (pixels[i] > 0) { // 완전히 투명하지 않은 픽셀
                hasContent = true;
                break;
            }
        }

        if (!hasContent) {
            console.warn('⚠️ Canvas가 비어있는 것 같습니다. 내용이 렌더링되지 않았을 수 있습니다.');
        }

        // 캔버스를 이미지로 변환
        const imgData = canvas.toDataURL('image/png');

        // PDF 문서 생성
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // 이미지 크기 계산
        const imgWidth = pageWidth - 20; // 10mm 마진
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const pageContentHeight = pageHeight - 20; // 마진 10mm 상하


        // 이미지가 페이지를 벗어나는 경우 여러 페이지로 나누기
        if (imgHeight <= pageContentHeight) {
            // 한 페이지에 들어가는 경우
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        } else {
            // 여러 페이지로 나누기
            let remainingHeight = imgHeight;
            let sourceY = 0;
            let pageNumber = 0;

            while (remainingHeight > 0) {
                if (pageNumber > 0) {
                    pdf.addPage();
                }

                const currentPageHeight = Math.min(remainingHeight, pageContentHeight);
                const sourceHeight = (currentPageHeight * canvas.height) / imgHeight;

                // 캔버스 일부를 잘라서 새 캔버스에 복사
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                tempCanvas.width = canvas.width;
                tempCanvas.height = sourceHeight;

                tempCtx.drawImage(
                    canvas,
                    0, sourceY,
                    canvas.width, sourceHeight,
                    0, 0,
                    canvas.width, sourceHeight
                );

                const pageImgData = tempCanvas.toDataURL('image/png');
                pdf.addImage(pageImgData, 'PNG', 10, 10, imgWidth, currentPageHeight);

                sourceY += sourceHeight;
                remainingHeight -= currentPageHeight;
                pageNumber++;
            }
        }

        // 파일명 생성
        const testName = (testResult.testExecutionName || testResult.fileName || 'test').replace(/[^a-zA-Z0-9._-]/g, '_');
        const version = new Date().toISOString().split('T')[0].replace(/-/g, '.');
        const defaultFileName = `${testName}_${version}.pdf`;
        const finalFileName = fileName || defaultFileName;

        // PDF 다운로드
        pdf.save(finalFileName);

        return {
            success: true,
            fileName: finalFileName,
            message: 'PDF 내보내기가 완료되었습니다. (한글 지원)'
        };

    } catch (error) {
        console.error('❌ Canvas PDF 생성 실패:', error);
        throw error; // 상위에서 폴백 처리
    }
};

/**
 * 한글 폰트 사전 로드
 */
const loadKoreanFont = async () => {
    return new Promise((resolve) => {

        // CSS에 @font-face 추가 (Google Fonts CDN 우선 사용)
        const style = document.createElement('style');
        style.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700&display=swap');

            @font-face {
                font-family: 'Nanum Gothic Local';
                src: url('./assets/fonts/NanumGothic-Regular.ttf') format('truetype'),
                     url('/assets/fonts/NanumGothic.ttf') format('truetype');
                font-weight: normal;
                font-style: normal;
                font-display: fallback;
            }

            /* PDF 전용 폰트 스타일 */
            .pdf-content, .pdf-content * {
                font-family: 'Nanum Gothic', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Malgun Gothic', '맑은 고딕', sans-serif !important;
                font-weight: 400 !important;
                line-height: 1.4 !important;
            }

            body, * {
                font-family: 'Nanum Gothic', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Malgun Gothic', '맑은 고딕', sans-serif !important;
            }
        `;
        document.head.appendChild(style);

        // Google Fonts 로딩 대기 (FontFace API 사용)
        if ('fonts' in document) {

            // 3초 타임아웃과 함께 폰트 로딩 대기
            Promise.race([
                document.fonts.ready,
                new Promise((timeoutResolve) => setTimeout(timeoutResolve, 3000))
            ]).then(() => {
                // Nanum Gothic 폰트가 실제로 로드되었는지 확인
                const loadedFonts = Array.from(document.fonts.values());
                const nanumLoaded = loadedFonts.some(font =>
                    font.family.includes('Nanum Gothic') && font.status === 'loaded'
                );

                resolve();
            }).catch(() => {
                resolve();
            });
        } else {
            // FontFace API가 없는 경우 간단한 대기
            setTimeout(() => {
                resolve();
            }, 1000);
        }
    });
};

/**
 * 기존 jsPDF 방식 (폴백용)
 */
const exportTestResultToPDFLegacy = async (testResult, testSuites = [], testCases = [], fileName = null) => {
    try {
        // PDF 문서 생성 (A4 크기)
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        const lineHeight = 6;
        let currentY = margin;

        // 한글 폰트 설정 (비동기) - 실패해도 계속 진행
        let koreanFontLoaded = false;
        try {
            await addKoreanFont(pdf);
            koreanFontLoaded = true;
        } catch (fontError) {
            console.warn('⚠️ 한글 폰트 로드 실패, 대체 방식 사용:', fontError);
            koreanFontLoaded = false;
            // 기본 폰트로 계속 진행
            try {
                setupKoreanFontFallback(pdf);
            } catch (fallbackError) {
                console.warn('폴백 폰트 설정도 실패:', fallbackError);
                // helvetica로 강제 설정
                pdf.setFont('helvetica', 'normal');
            }
        }


        // 1. 제목 및 기본 정보
        currentY = addHeaderSection(pdf, testResult, margin, currentY, pageWidth);

        // 2. Executive Summary (요약)
        currentY = addExecutiveSummary(pdf, testResult, testSuites, testCases, margin, currentY, pageWidth, pageHeight);

        // 3. Test Suite Results (테스트 스위트별 결과)
        if (testSuites.length > 0) {
            currentY = addTestSuiteResults(pdf, testSuites, testCases, margin, currentY, pageWidth, pageHeight);
        }

        // 4. Test Case Details (상세 테스트 케이스 결과)
        if (testCases.length > 0) {
            currentY = addTestCaseDetails(pdf, testCases, margin, currentY, pageWidth, pageHeight);
        }

        // 5. Failed Test Analysis (실패 분석)
        const failedCases = testCases.filter(tc => tc.status === 'FAILED' || tc.status === 'ERROR');
        if (failedCases.length > 0) {
            currentY = addFailedTestAnalysis(pdf, failedCases, margin, currentY, pageWidth, pageHeight);
        }

        // 파일명 생성 (AgensSQL 스타일)
        const testName = (testResult.testExecutionName || testResult.fileName || 'test').replace(/[^a-zA-Z0-9._-]/g, '_');
        const version = new Date().toISOString().split('T')[0].replace(/-/g, '.');
        const defaultFileName = `${testName}_${version}.pdf`;
        const finalFileName = fileName || defaultFileName;

        // PDF 다운로드
        pdf.save(finalFileName);

        return {
            success: true,
            fileName: finalFileName,
            message: 'PDF 내보내기가 완료되었습니다. (한글 지원)'
        };

    } catch (error) {
        console.error('PDF 내보내기 실패:', error);
        return {
            success: false,
            error: error.message,
            message: 'PDF 내보내기 중 오류가 발생했습니다.'
        };
    }
};

/**
 * 헤더 섹션 추가
 */
const addHeaderSection = (pdf, testResult, margin, startY, pageWidth) => {
    const lineHeight = 6;
    let currentY = startY;

    // 메인 제목
    pdf.setFontSize(24);
    pdf.setTextColor(0, 0, 0);
    const title = testResult.testExecutionName || testResult.fileName || 'Test Report';
    safeSetText(pdf, title, margin, currentY);
    currentY += lineHeight * 2;

    // 부제목
    pdf.setFontSize(16);
    pdf.setTextColor(100, 100, 100);
    safeSetText(pdf, 'Automated Test Execution Report', margin, currentY);
    currentY += lineHeight * 2;

    // 구분선
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    currentY += lineHeight;

    // 기본 정보
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    const uploadDate = formatDateForPDF(testResult.uploadedAt);
    const uploadedBy = testResult.uploadedBy?.displayName || testResult.uploadedBy?.username || 'Unknown';

    safeSetText(pdf, `Report Generated: ${new Date().toLocaleString()}`, margin, currentY);
    currentY += lineHeight * 0.8;
    safeSetText(pdf, `Test Executed: ${uploadDate}`, margin, currentY);
    currentY += lineHeight * 0.8;
    safeSetText(pdf, `Executed By: ${uploadedBy}`, margin, currentY);
    currentY += lineHeight * 2;

    return currentY;
};

/**
 * Executive Summary 섹션 추가
 */
const addExecutiveSummary = (pdf, testResult, testSuites, testCases, margin, startY, pageWidth, pageHeight) => {
    const lineHeight = 6;
    let currentY = startY;

    // 페이지 넘김 체크
    if (currentY > pageHeight - 80) {
        pdf.addPage();
        currentY = margin;
    }

    // 섹션 제목
    pdf.setFontSize(18);
    pdf.setTextColor(40, 40, 40);
    safeSetText(pdf, 'EXECUTIVE SUMMARY', margin, currentY);
    currentY += lineHeight * 1.5;

    // 구분선
    pdf.setDrawColor(150, 150, 150);
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    currentY += lineHeight;

    // 핵심 지표들
    const passed = testResult.totalTests - testResult.failures - testResult.errors - testResult.skipped;
    const executedTests = testResult.totalTests - testResult.skipped; // 실제 실행된 테스트
    const successRate = executedTests > 0 ? (passed / executedTests * 100) : 0; // 실행된 테스트 중 성공률

    // 테이블 스타일 헤더
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, currentY, pageWidth - 2 * margin, lineHeight * 1.2, 'F');

    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    safeSetText(pdf, 'Test Execution Overview', margin + 5, currentY + lineHeight * 0.8);
    currentY += lineHeight * 1.8;

    // 통계 데이터
    const summaryStats = [
        ['Total Test Cases', testResult.totalTests.toString()],
        ['Executed Tests', executedTests.toString()],
        ['Passed', `${passed} (${executedTests > 0 ? (passed/executedTests*100).toFixed(1) : 0}%)`],
        ['Failed', `${testResult.failures} (${executedTests > 0 ? (testResult.failures/executedTests*100).toFixed(1) : 0}%)`],
        ['Errors', `${testResult.errors} (${executedTests > 0 ? (testResult.errors/executedTests*100).toFixed(1) : 0}%)`],
        ['Skipped', `${testResult.skipped} (${testResult.totalTests > 0 ? (testResult.skipped/testResult.totalTests*100).toFixed(1) : 0}%)`],
        ['Success Rate', `${successRate.toFixed(1)}% (of executed)`],
        ['Total Execution Time', formatDuration(testResult.time || 0)],
        ['Test Suites', testSuites.length.toString()]
    ];

    pdf.setFontSize(10);
    summaryStats.forEach(([label, value]) => {
        pdf.setTextColor(60, 60, 60);
        safeSetText(pdf, label + ':', margin + 5, currentY);
        pdf.setTextColor(0, 0, 0);
        safeSetText(pdf, value, margin + 80, currentY);
        currentY += lineHeight * 0.9;
    });

    currentY += lineHeight;

    // 결과 분석
    pdf.setFontSize(12);
    pdf.setTextColor(40, 40, 40);
    safeSetText(pdf, 'Test Result Analysis:', margin, currentY);
    currentY += lineHeight * 1.2;

    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);

    let analysisText = '';
    if (executedTests === 0) {
        analysisText = 'NO EXECUTION: All tests were skipped. No tests were actually executed.';
    } else if (successRate >= 95) {
        analysisText = 'EXCELLENT: Test execution shows outstanding quality with minimal failures.';
    } else if (successRate >= 85) {
        analysisText = 'GOOD: Test execution shows good quality with acceptable failure rate.';
    } else if (successRate >= 70) {
        analysisText = 'FAIR: Test execution shows moderate quality. Review failed cases recommended.';
    } else {
        analysisText = 'POOR: Test execution shows significant issues. Immediate attention required.';
    }

    const lines = pdf.splitTextToSize(analysisText, pageWidth - 2 * margin - 10);
    lines.forEach(line => {
        safeSetText(pdf, line, margin + 5, currentY);
        currentY += lineHeight * 0.9;
    });

    return currentY + lineHeight * 2;
};

/**
 * 테스트 스위트 결과 섹션 추가
 */
const addTestSuiteResults = (pdf, testSuites, testCases, margin, startY, pageWidth, pageHeight) => {
    const lineHeight = 6;
    let currentY = startY;

    // 페이지 넘김 체크
    if (currentY > pageHeight - 80) {
        pdf.addPage();
        currentY = margin;
    }

    // 섹션 제목
    pdf.setFontSize(18);
    pdf.setTextColor(40, 40, 40);
    safeSetText(pdf, 'TEST SUITE RESULTS', margin, currentY);
    currentY += lineHeight * 1.5;

    // 구분선
    pdf.setDrawColor(150, 150, 150);
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    currentY += lineHeight * 1.5;

    // 테이블 헤더
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, currentY, pageWidth - 2 * margin, lineHeight * 1.2, 'F');

    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    safeSetText(pdf, 'Suite Name', margin + 5, currentY + lineHeight * 0.8);
    safeSetText(pdf, 'Tests', margin + 80, currentY + lineHeight * 0.8);
    safeSetText(pdf, 'Passed', margin + 105, currentY + lineHeight * 0.8);
    safeSetText(pdf, 'Failed', margin + 130, currentY + lineHeight * 0.8);
    safeSetText(pdf, 'Errors', margin + 155, currentY + lineHeight * 0.8);
    safeSetText(pdf, 'Success Rate', margin + 180 - 15, currentY + lineHeight * 0.8);
    currentY += lineHeight * 1.8;

    // 테이블 데이터
    testSuites.forEach((suite, index) => {
        // 페이지 넘김 체크
        if (currentY > pageHeight - 60) {
            pdf.addPage();
            currentY = margin;
        }

        const passed = suite.tests - suite.failures - suite.errors;
        const successRate = suite.tests > 0 ? (passed / suite.tests * 100) : 0;

        // 배경색 (번갈아가며)
        if (index % 2 === 0) {
            pdf.setFillColor(250, 250, 250);
            pdf.rect(margin, currentY - lineHeight * 0.3, pageWidth - 2 * margin, lineHeight * 1.2, 'F');
        }

        pdf.setFontSize(9);
        pdf.setTextColor(60, 60, 60);

        // 스위트명 (길면 축약)
        const suiteName = suite.name.length > 25 ? suite.name.substring(0, 22) + '...' : suite.name;
        safeSetText(pdf, suiteName, margin + 5, currentY + lineHeight * 0.5);
        safeSetText(pdf, suite.tests.toString(), margin + 85, currentY + lineHeight * 0.5);
        safeSetText(pdf, passed.toString(), margin + 110, currentY + lineHeight * 0.5);
        safeSetText(pdf, suite.failures.toString(), margin + 135, currentY + lineHeight * 0.5);
        safeSetText(pdf, suite.errors.toString(), margin + 160, currentY + lineHeight * 0.5);
        safeSetText(pdf, `${successRate.toFixed(1)}%`, margin + 180 - 10, currentY + lineHeight * 0.5);

        currentY += lineHeight * 1.2;
    });

    return currentY + lineHeight * 2;
};

/**
 * 테스트 케이스 상세 섹션 추가 (개별 테스트 결과 포함)
 */
const addTestCaseDetails = (pdf, testCases, margin, startY, pageWidth, pageHeight) => {
    const lineHeight = 6;
    let currentY = startY;

    // 페이지 넘김 체크
    if (currentY > pageHeight - 80) {
        pdf.addPage();
        currentY = margin;
    }

    // 섹션 제목
    pdf.setFontSize(18);
    pdf.setTextColor(40, 40, 40);
    safeSetText(pdf, 'DETAILED TEST RESULTS', margin, currentY);
    currentY += lineHeight * 1.5;

    // 구분선
    pdf.setDrawColor(150, 150, 150);
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    currentY += lineHeight * 1.5;

    // 상태별 카운트
    const statusCounts = {
        PASSED: testCases.filter(tc => tc.status === 'PASSED').length,
        FAILED: testCases.filter(tc => tc.status === 'FAILED').length,
        ERROR: testCases.filter(tc => tc.status === 'ERROR').length,
        SKIPPED: testCases.filter(tc => tc.status === 'SKIPPED').length
    };

    // 상태별 통계 표시
    pdf.setFontSize(12);
    pdf.setTextColor(40, 40, 40);
    safeSetText(pdf, 'Test Case Status Distribution:', margin, currentY);
    currentY += lineHeight * 1.5;

    Object.entries(statusCounts).forEach(([status, count]) => {
        if (count > 0) {
            const percentage = ((count / testCases.length) * 100).toFixed(1);
            pdf.setFontSize(10);
            pdf.setTextColor(60, 60, 60);
            safeSetText(pdf, `${status}: ${count} cases (${percentage}%)`, margin + 10, currentY);
            currentY += lineHeight * 0.9;
        }
    });

    currentY += lineHeight * 2;

    // 개별 테스트 케이스 상세 결과
    pdf.setFontSize(16);
    pdf.setTextColor(40, 40, 40);
    safeSetText(pdf, 'Individual Test Case Results:', margin, currentY);
    currentY += lineHeight * 2;

    // 테이블 헤더
    const addTestCaseTableHeader = () => {
        pdf.setFillColor(240, 240, 240);
        pdf.rect(margin, currentY, pageWidth - 2 * margin, lineHeight * 1.2, 'F');

        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0);
        safeSetText(pdf, '#', margin + 3, currentY + lineHeight * 0.8);
        safeSetText(pdf, 'Test Case Name', margin + 15, currentY + lineHeight * 0.8);
        safeSetText(pdf, 'Class', margin + 90, currentY + lineHeight * 0.8);
        safeSetText(pdf, 'Status', margin + 130, currentY + lineHeight * 0.8);
        safeSetText(pdf, 'Time', margin + 155, currentY + lineHeight * 0.8);
        safeSetText(pdf, 'Notes', margin + 175, currentY + lineHeight * 0.8);
        currentY += lineHeight * 1.8;
    };

    addTestCaseTableHeader();

    // 테스트 케이스들을 상태별로 정렬 (FAILED, ERROR, PASSED, SKIPPED 순)
    const sortedTestCases = [...testCases].sort((a, b) => {
        const statusOrder = { 'FAILED': 0, 'ERROR': 1, 'PASSED': 2, 'SKIPPED': 3 };
        return statusOrder[a.status] - statusOrder[b.status];
    });

    sortedTestCases.forEach((testCase, index) => {
        // 페이지 넘김 체크
        if (currentY > pageHeight - 50) {
            pdf.addPage();
            currentY = margin;
            addTestCaseTableHeader(); // 새 페이지에 헤더 다시 추가
        }

        // 상태에 따른 색상 설정
        let statusColor, bgColor;
        switch (testCase.status) {
            case 'PASSED':
                statusColor = [40, 140, 40]; // 녹색
                bgColor = [240, 255, 240]; // 연한 녹색
                break;
            case 'FAILED':
                statusColor = [220, 53, 69]; // 빨간색
                bgColor = [255, 240, 240]; // 연한 빨간색
                break;
            case 'ERROR':
                statusColor = [255, 140, 0]; // 주황색
                bgColor = [255, 248, 240]; // 연한 주황색
                break;
            case 'SKIPPED':
                statusColor = [100, 100, 100]; // 회색
                bgColor = [245, 245, 245]; // 연한 회색
                break;
            default:
                statusColor = [0, 0, 0];
                bgColor = [255, 255, 255];
        }

        // 배경색 설정
        pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
        pdf.rect(margin, currentY - lineHeight * 0.3, pageWidth - 2 * margin, lineHeight * 1.2, 'F');

        pdf.setFontSize(8);

        // 번호
        pdf.setTextColor(60, 60, 60);
        safeSetText(pdf, (index + 1).toString(), margin + 3, currentY + lineHeight * 0.5);

        // 테스트 케이스 이름 (축약)
        const testName = (testCase.userTitle || testCase.name);
        const truncatedName = testName.length > 25 ? testName.substring(0, 22) + '...' : testName;
        pdf.setTextColor(40, 40, 40);
        safeSetText(pdf, truncatedName, margin + 15, currentY + lineHeight * 0.5);

        // 클래스명 (축약)
        const className = testCase.className || '';
        const truncatedClass = className.length > 15 ? className.substring(className.lastIndexOf('.') + 1) : className;
        pdf.setTextColor(80, 80, 80);
        safeSetText(pdf, truncatedClass, margin + 90, currentY + lineHeight * 0.5);

        // 상태
        pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
        safeSetText(pdf, testCase.status, margin + 130, currentY + lineHeight * 0.5);

        // 실행 시간
        pdf.setTextColor(60, 60, 60);
        const executionTime = testCase.time ? formatDuration(testCase.time) : '-';
        safeSetText(pdf, executionTime, margin + 155, currentY + lineHeight * 0.5);

        // 노트 (실패 메시지 또는 사용자 노트)
        let noteText = '';
        if (testCase.status === 'FAILED' || testCase.status === 'ERROR') {
            if (testCase.failureMessage) {
                // 실패 메시지 전체를 표시 (줄바꿈은 첫 번째 줄만)
                noteText = testCase.failureMessage.split('\n')[0];
            }
        } else if (testCase.userNotes) {
            noteText = testCase.userNotes;
        } else {
            noteText = '-';
        }

        pdf.setTextColor(100, 100, 100);

        // 긴 메시지의 경우 여러 줄로 분할
        if (noteText && noteText.length > 30) {
            const maxNoteWidth = pageWidth - margin - 175 - 10; // 노트 영역 너비
            const noteLines = pdf.splitTextToSize(noteText, maxNoteWidth);

            noteLines.forEach((line, lineIndex) => {
                safeSetText(pdf, line, margin + 175, currentY + lineHeight * 0.5 + lineIndex * lineHeight * 0.8);
            });

            // 여러 줄인 경우 추가 간격
            if (noteLines.length > 1) {
                currentY += lineHeight * 0.8 * (noteLines.length - 1);
            }
        } else {
            safeSetText(pdf, noteText, margin + 175, currentY + lineHeight * 0.5);
        }

        currentY += lineHeight * 1.2;
    });

    return currentY + lineHeight * 2;
};

/**
 * 실패 분석 섹션 추가
 */
const addFailedTestAnalysis = (pdf, failedCases, margin, startY, pageWidth, pageHeight) => {
    const lineHeight = 6;
    let currentY = startY;

    // 페이지 넘김 체크
    if (currentY > pageHeight - 100) {
        pdf.addPage();
        currentY = margin;
    }

    // 섹션 제목
    pdf.setFontSize(18);
    pdf.setTextColor(220, 53, 69); // 빨간색
    safeSetText(pdf, 'FAILED TEST ANALYSIS', margin, currentY);
    currentY += lineHeight * 1.5;

    // 구분선
    pdf.setDrawColor(220, 53, 69);
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    currentY += lineHeight * 1.5;

    if (failedCases.length === 0) {
        pdf.setFontSize(12);
        pdf.setTextColor(40, 140, 40); // 녹색
        safeSetText(pdf, 'All tests passed successfully! No failed tests to analyze.', margin, currentY);
        return currentY + lineHeight * 2;
    }

    // 실패한 테스트 케이스 목록
    pdf.setFontSize(12);
    pdf.setTextColor(40, 40, 40);
    safeSetText(pdf, `Total Failed Tests: ${failedCases.length}`, margin, currentY);
    currentY += lineHeight * 1.5;

    failedCases.forEach((testCase, index) => { // 전체 실패 케이스 표시
        // 페이지 넘김 체크 - 각 실패 케이스는 대략 30-40점 높이 필요
        if (currentY > pageHeight - 100) {
            pdf.addPage();
            currentY = margin;
        }

        // 테스트 케이스 번호 및 이름
        pdf.setFontSize(10);
        pdf.setTextColor(220, 53, 69);
        const testName = (testCase.userTitle || testCase.name).length > 50
            ? (testCase.userTitle || testCase.name).substring(0, 47) + '...'
            : (testCase.userTitle || testCase.name);

        safeSetText(pdf, `${index + 1}. ${testName}`, margin, currentY);
        currentY += lineHeight;

        // 클래스명
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        safeSetText(pdf, `   Class: ${testCase.className}`, margin + 5, currentY);
        currentY += lineHeight * 0.8;

        // 실패 메시지 (전체 메시지 표시)
        if (testCase.failureMessage) {
            pdf.setTextColor(60, 60, 60);
            safeSetText(pdf, `   Error:`, margin + 5, currentY);
            currentY += lineHeight * 0.8;

            // 전체 메시지를 여러 줄로 분할하여 표시
            const fullMessage = testCase.failureMessage;
            const maxLineWidth = pageWidth - 2 * margin - 20; // 들여쓰기 고려
            const messageLines = pdf.splitTextToSize(fullMessage, maxLineWidth);

            pdf.setFontSize(8);
            pdf.setTextColor(80, 80, 80);

            messageLines.forEach((line, lineIndex) => {
                // 페이지 넘김 체크 (메시지 중간에서도)
                if (currentY > pageHeight - 40) {
                    pdf.addPage();
                    currentY = margin;
                }

                safeSetText(pdf, `     ${line}`, margin + 10, currentY);
                currentY += lineHeight * 0.7;
            });

            // 폰트 크기 복원
            pdf.setFontSize(8);
        }

        // 스택 트레이스 표시 (있는 경우)
        if (testCase.stackTrace) {
            currentY += lineHeight * 0.3;

            pdf.setFontSize(8);
            pdf.setTextColor(60, 60, 60);
            safeSetText(pdf, `   Stack Trace:`, margin + 5, currentY);
            currentY += lineHeight * 0.8;

            // 스택 트레이스를 여러 줄로 분할하여 표시
            const maxLineWidth = pageWidth - 2 * margin - 20;
            const stackLines = pdf.splitTextToSize(testCase.stackTrace, maxLineWidth);

            pdf.setFontSize(7);
            pdf.setTextColor(100, 100, 100);

            stackLines.forEach((line) => {
                // 페이지 넘김 체크
                if (currentY > pageHeight - 40) {
                    pdf.addPage();
                    currentY = margin;
                }

                safeSetText(pdf, `     ${line}`, margin + 10, currentY);
                currentY += lineHeight * 0.6;
            });

            // 폰트 크기 복원
            pdf.setFontSize(8);
        }

        currentY += lineHeight * 0.5; // 간격

        // 각 실패 케이스 처리 후 페이지 넘김 체크 - 더 많은 여유 공간 확보
        if (currentY > pageHeight - 120 && index < failedCases.length - 1) {
            pdf.addPage();
            currentY = margin;
        }
    });

    // 모든 실패한 테스트 케이스가 표시됨

    return currentY + lineHeight * 2;
};


/**
 * 현재 화면을 캡처하여 PDF로 내보내기 (스크린샷 방식)
 * @param {string} elementId - 캡처할 DOM 요소의 ID
 * @param {string} fileName - 저장할 파일명
 */
export const exportElementToPDF = async (elementId, fileName = 'junit-report.pdf') => {
    try {
        const element = document.getElementById(elementId);
        if (!element) {
            throw new Error(`Element with ID '${elementId}' not found`);
        }

        // HTML을 캔버스로 변환
        const canvas = await html2canvas(element, {
            scale: 2, // 고해상도
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        });

        // 캔버스를 이미지로 변환
        const imgData = canvas.toDataURL('image/png');

        // PDF 생성
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // 이미지 크기 계산
        const imgWidth = pageWidth - 20; // 10mm 마진
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // 이미지가 페이지를 벗어나는 경우 여러 페이지로 나누기
        if (imgHeight <= pageHeight - 20) {
            // 한 페이지에 들어가는 경우
            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
        } else {
            // 여러 페이지로 나누는 경우
            let remainingHeight = imgHeight;
            let yPosition = 0;
            let pageNumber = 0;

            while (remainingHeight > 0) {
                if (pageNumber > 0) {
                    pdf.addPage();
                }

                const currentPageHeight = Math.min(remainingHeight, pageHeight - 20);

                pdf.addImage(
                    imgData,
                    'PNG',
                    10,
                    10 - yPosition,
                    imgWidth,
                    imgHeight
                );

                yPosition += currentPageHeight;
                remainingHeight -= currentPageHeight;
                pageNumber++;
            }
        }

        // PDF 다운로드
        pdf.save(fileName);

        return {
            success: true,
            fileName: fileName,
            message: 'PDF 내보내기가 완료되었습니다.'
        };

    } catch (error) {
        console.error('PDF 내보내기 실패:', error);
        return {
            success: false,
            error: error.message,
            message: 'PDF 내보내기 중 오류가 발생했습니다.'
        };
    }
};

/**
 * 날짜 포맷팅 (PDF용)
 */
const formatDateForPDF = (dateValue) => {
    try {
        if (!dateValue) return 'Unknown';

        let date;
        if (Array.isArray(dateValue) && dateValue.length >= 6) {
            const [year, month, day, hour, minute, second] = dateValue;
            date = new Date(year, month - 1, day, hour, minute, second);
        } else {
            date = new Date(dateValue);
        }

        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }

        return date.toLocaleString();
    } catch (error) {
        return 'Date Error';
    }
};

/**
 * 실행 시간 포맷팅
 */
const formatDuration = (seconds) => {
    if (!seconds || seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
    if (seconds < 60) return `${seconds.toFixed(2)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(2);
    return `${minutes}m ${remainingSeconds}s`;
};