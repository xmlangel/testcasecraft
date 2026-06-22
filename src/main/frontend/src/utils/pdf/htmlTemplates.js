// src/utils/pdf/htmlTemplates.js
//
// PDF 내보내기용 HTML 템플릿 생성기 (순수 함수). pdfExportUtils.js 에서 추출.

import { formatDateForPDF, formatDuration } from "./pdfTextUtils.js";

export const generateTestResultHTML = (testResult, testSuites, testCases) => {
  const passed =
    testResult.totalTests -
    testResult.failures -
    testResult.errors -
    testResult.skipped;
  const executedTests = testResult.totalTests - testResult.skipped; // 실제 실행된 테스트
  const successRate = executedTests > 0 ? (passed / executedTests) * 100 : 0; // 실행된 테스트 중 성공률
  const uploadDate = formatDateForPDF(testResult.uploadedAt);
  const uploadedBy =
    testResult.uploadedBy?.displayName ||
    testResult.uploadedBy?.username ||
    "Unknown";

  let analysisText = "";
  if (successRate >= 95) {
    analysisText =
      "우수: 테스트 실행이 뛰어난 품질을 보여주며 실패가 최소화되었습니다.";
  } else if (successRate >= 85) {
    analysisText =
      "양호: 테스트 실행이 좋은 품질을 보여주며 실패율이 허용 가능한 수준입니다.";
  } else if (successRate >= 70) {
    analysisText =
      "보통: 테스트 실행이 보통 품질을 보여줍니다. 실패한 케이스 검토를 권장합니다.";
  } else {
    analysisText =
      "불량: 테스트 실행에 심각한 문제가 있습니다. 즉시 조치가 필요합니다.";
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
                <div class="title">${
                  testResult.testExecutionName ||
                  testResult.fileName ||
                  "Test Report"
                }</div>
                <div class="subtitle">자동화 테스트 실행 보고서</div>
                <div class="info-grid">
                    <div>보고서 생성: ${new Date().toLocaleString(
                      "ko-KR",
                    )}</div>
                    <div>테스트 실행: ${uploadDate}</div>
                    <div>실행자: ${uploadedBy}</div>
                    <div>성공률: ${successRate.toFixed(
                      1,
                    )}% (${executedTests}개 실행 중)</div>
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
                        <div class="stat-value failed">${
                          testResult.failures
                        }</div>
                        <div class="stat-label">실패</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value error">${testResult.errors}</div>
                        <div class="stat-label">오류</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value skipped">${
                          testResult.skipped
                        }</div>
                        <div class="stat-label">스킵</div>
                    </div>
                </div>

                <div class="analysis-box">
                    <strong>분석 결과:</strong> ${analysisText}
                    ${
                      testResult.skipped > 0
                        ? `<br><br><strong>참고:</strong> ${testResult.skipped}개의 테스트가 스킵되었습니다. 성공률은 실제 실행된 ${executedTests}개 테스트를 기준으로 계산되었습니다.`
                        : ""
                    }
                </div>
            </div>

            ${testSuites.length > 0 ? generateTestSuitesHTML(testSuites) : ""}
            ${testCases.length > 0 ? generateTestCasesHTML(testCases) : ""}
            ${
              testCases.filter(
                (tc) => tc.status === "FAILED" || tc.status === "ERROR",
              ).length > 0
                ? generateFailedTestsHTML(
                    testCases.filter(
                      (tc) => tc.status === "FAILED" || tc.status === "ERROR",
                    ),
                  )
                : ""
            }
        </body>
        </html>
    `;
};

export const generateTestSuitesHTML = (testSuites) => {
  const rows = testSuites
    .map((suite) => {
      const passed = suite.tests - suite.failures - suite.errors;
      const successRate = suite.tests > 0 ? (passed / suite.tests) * 100 : 0;

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
    })
    .join("");

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

export const generateTestCasesHTML = (testCases) => {
  const rows = testCases
    .map((testCase, index) => {
      const statusClass = `status-${testCase.status.toLowerCase()}`;
      const executionTime = testCase.time ? formatDuration(testCase.time) : "-";

      return `
            <tr class="${statusClass}">
                <td>${index + 1}</td>
                <td>${testCase.userTitle || testCase.name || "-"}</td>
                <td>${testCase.className || "-"}</td>
                <td><strong>${testCase.status}</strong></td>
                <td>${executionTime}</td>
            </tr>
        `;
    })
    .join("");

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

export const generateFailedTestsHTML = (failedCases) => {
  const rows = failedCases
    .map((testCase, index) => {
      const message = testCase.failureMessage
        ? testCase.failureMessage
        : "오류 메시지 없음";

      return `
            <tr>
                <td>${index + 1}</td>
                <td>${testCase.userTitle || testCase.name || "-"}</td>
                <td>${testCase.className || "-"}</td>
                <td class="failed">${testCase.status}</td>
                <td style="font-size: 10px;">${message}</td>
            </tr>
        `;
    })
    .join("");

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
