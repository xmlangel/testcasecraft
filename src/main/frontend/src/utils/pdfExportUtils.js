// src/main/frontend/src/utils/pdfExportUtils.js

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { addNanumGothicToJsPDF, setupKoreanFontFallback } from '../assets/fonts/nanumGothicFont.js';

/**
 * NanumGothic 폰트를 PDF에 추가하는 함수 (비동기)
 */
const addKoreanFont = async (pdf) => {
    try {
        console.log('🔤 한글 폰트 설정 시작...');

        // 먼저 나눔고딕 폰트 로드 시도
        const fontLoaded = await addNanumGothicToJsPDF(pdf);

        if (!fontLoaded) {
            console.log('🔄 나눔고딕 로드 실패, 폴백 방식 사용');
            // 폴백: 기본 설정 사용
            setupKoreanFontFallback(pdf);
        }

        console.log('✅ 한글 폰트 설정 완료');
        return true;
    } catch (error) {
        console.warn('⚠️ 한글 폰트 설정 실패, 기본 폰트 사용:', error);
        // 최종 폴백: 기본 설정
        setupKoreanFontFallback(pdf);
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
 * 안전한 텍스트 설정 함수 (한글 지원 개선)
 */
const safeSetText = (pdf, text, x, y, options = {}) => {
    try {
        const processedText = processKoreanText(text);

        // 텍스트가 비어있지 않은 경우에만 렌더링
        if (processedText.trim()) {
            pdf.text(processedText, x, y, options);
        }
    } catch (error) {
        console.warn('텍스트 설정 실패:', error, 'Text:', text);

        // 폴백 전략: 한글 문자를 기본 문자로 대체
        try {
            const fallbackText = String(text).replace(/[가-힣]/g, '?');
            pdf.text(fallbackText, x, y, options);
        } catch (fallbackError) {
            console.error('폴백 텍스트 설정도 실패:', fallbackError);
            // 최종 폴백: 'TEXT' 표시
            pdf.text('TEXT', x, y, options);
        }
    }
};

/**
 * 테스트 결과를 HTML로 생성하는 함수 (한글 지원)
 */
const generateTestResultHTML = (testResult, testSuites, testCases) => {
    const passed = testResult.totalTests - testResult.failures - testResult.errors - testResult.skipped;
    const successRate = testResult.totalTests > 0 ? (passed / testResult.totalTests * 100) : 0;
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
                    padding: 20px;
                    color: #333;
                    line-height: 1.6;
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
                    grid-template-columns: repeat(4, 1fr);
                    gap: 15px;
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
                    border-collapse: collapse;
                    margin-top: 15px;
                    font-size: 11px;
                }

                .table th,
                .table td {
                    padding: 8px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }

                .table th {
                    background-color: #f0f0f0;
                    font-weight: 700;
                }

                .table tr:nth-child(even) {
                    background-color: #f9f9f9;
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
                    <div>성공률: ${successRate.toFixed(1)}%</div>
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
                </div>

                <div class="analysis-box">
                    <strong>분석 결과:</strong> ${analysisText}
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
            <table class="table">
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
    const rows = testCases.slice(0, 50).map((testCase, index) => {
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
            <div class="section-title">🔍 개별 테스트 결과 (최대 50개)</div>
            <table class="table">
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
    const rows = failedCases.slice(0, 20).map((testCase, index) => {
        const message = testCase.failureMessage ?
            testCase.failureMessage.split('\n')[0].substring(0, 100) + '...' :
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
            <div class="section-title">❌ 실패 분석 (최대 20개)</div>
            <table class="table">
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
        console.log('🔤 한글 지원 PDF 내보내기 시작...');

        // HTML 내용 생성 (한글 폰트 적용)
        const htmlContent = generateTestResultHTML(testResult, testSuites, testCases);

        // 임시 DOM 요소 생성
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '-9999px';
        tempDiv.style.width = '794px'; // A4 너비 (픽셀)
        tempDiv.style.fontFamily = '"Nanum Gothic", "맑은 고딕", "Malgun Gothic", sans-serif';
        tempDiv.style.fontSize = '12px';
        tempDiv.style.lineHeight = '1.5';
        tempDiv.style.color = '#000';
        tempDiv.style.backgroundColor = '#fff';
        tempDiv.style.padding = '20px';

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
                windowHeight: tempDiv.scrollHeight
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

            // 임시 요소 제거
            document.body.removeChild(tempDiv);

            // 파일명 생성
            const testName = (testResult.testExecutionName || testResult.fileName || 'test').replace(/[^a-zA-Z0-9._-]/g, '_');
            const version = new Date().toISOString().split('T')[0].replace(/-/g, '.');
            const defaultFileName = `${testName}_${version}.pdf`;
            const finalFileName = fileName || defaultFileName;

            // PDF 다운로드
            pdf.save(finalFileName);

            console.log('✅ 한글 지원 PDF 내보내기 완료!');
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

        // 한글 폰트 설정 (비동기)
        await addKoreanFont(pdf);

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
    const successRate = testResult.totalTests > 0 ? (passed / testResult.totalTests * 100) : 0;

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
        ['Passed', `${passed} (${(passed/testResult.totalTests*100).toFixed(1)}%)`],
        ['Failed', `${testResult.failures} (${(testResult.failures/testResult.totalTests*100).toFixed(1)}%)`],
        ['Errors', `${testResult.errors} (${(testResult.errors/testResult.totalTests*100).toFixed(1)}%)`],
        ['Skipped', `${testResult.skipped} (${(testResult.skipped/testResult.totalTests*100).toFixed(1)}%)`],
        ['Success Rate', `${successRate.toFixed(1)}%`],
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
    if (successRate >= 95) {
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
        if (currentY > pageHeight - 40) {
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
        if (currentY > pageHeight - 30) {
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
                noteText = testCase.failureMessage.split('\n')[0].substring(0, 30) + '...';
            }
        } else if (testCase.userNotes) {
            noteText = testCase.userNotes.substring(0, 30) + '...';
        } else {
            noteText = '-';
        }

        pdf.setTextColor(100, 100, 100);
        safeSetText(pdf, noteText, margin + 175, currentY + lineHeight * 0.5);

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
    if (currentY > pageHeight - 80) {
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

    failedCases.slice(0, 10).forEach((testCase, index) => { // 최대 10개만 표시
        // 페이지 넘김 체크
        if (currentY > pageHeight - 60) {
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

        // 실패 메시지 (첫 번째 줄만)
        if (testCase.failureMessage) {
            const message = testCase.failureMessage.split('\n')[0];
            const truncatedMessage = message.length > 70 ? message.substring(0, 67) + '...' : message;

            pdf.setTextColor(60, 60, 60);
            safeSetText(pdf, `   Error: ${truncatedMessage}`, margin + 5, currentY);
            currentY += lineHeight * 0.8;
        }

        currentY += lineHeight * 0.5; // 간격
    });

    if (failedCases.length > 10) {
        pdf.setFontSize(10);
        pdf.setTextColor(100, 100, 100);
        safeSetText(pdf, `... and ${failedCases.length - 10} more failed tests`, margin, currentY);
        currentY += lineHeight;
    }

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