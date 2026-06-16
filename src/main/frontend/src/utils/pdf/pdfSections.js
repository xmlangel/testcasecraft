// src/utils/pdf/pdfSections.js
//
// jsPDF 문서에 섹션(헤더/요약/스위트/케이스/실패분석)을 그리는 빌더.
// pdfExportUtils.js 에서 추출. safeSetText 는 이 모듈 내부 전용.

import {
  convertKoreanToRoman,
  formatDateForPDF,
  formatDuration,
} from "./pdfTextUtils.js";

/**
 * 극단적으로 안전한 텍스트 설정 함수 (jsPDF 호환성 최우선)
 */
const safeSetText = (pdf, text, x, y, options = {}) => {
  if (!text || text.trim() === "") return;

  try {
    // 우선 한글을 영어로 변환 (jsPDF 오류 방지)
    const romanText = convertKoreanToRoman(String(text));

    // ASCII 문자만 추출하여 안전성 확보
    const safeText = romanText
      .replace(/[^\x20-\x7E]/g, "?") // 비-ASCII 문자 제거
      .substring(0, 100); // 길이 제한

    // 안전한 텍스트 렌더링
    pdf.text(safeText || "[EMPTY]", x, y, options);
  } catch (error) {
    console.warn(`⚠️ 안전 텍스트 렌더링 실패: ${error.message}`);

    try {
      // 최종 폴백: 완전히 안전한 텍스트
      const ultraSafeText = "TEXT_RENDER_ERROR";
      pdf.text(ultraSafeText, x, y, options);
    } catch (finalError) {
      console.error(
        `💥 최종 폴백도 실패: ${finalError.message} - 텍스트 완전 스킵`,
      );
      // 완전히 실패한 경우 그냥 무시
    }
  }
};

/**
 * 헤더 섹션 추가
 */
export const addHeaderSection = (
  pdf,
  testResult,
  margin,
  startY,
  pageWidth,
) => {
  const lineHeight = 6;
  let currentY = startY;

  // 메인 제목
  pdf.setFontSize(24);
  pdf.setTextColor(0, 0, 0);
  const title =
    testResult.testExecutionName || testResult.fileName || "Test Report";
  safeSetText(pdf, title, margin, currentY);
  currentY += lineHeight * 2;

  // 부제목
  pdf.setFontSize(16);
  pdf.setTextColor(100, 100, 100);
  safeSetText(pdf, "Automated Test Execution Report", margin, currentY);
  currentY += lineHeight * 2;

  // 구분선
  pdf.setDrawColor(200, 200, 200);
  pdf.line(margin, currentY, pageWidth - margin, currentY);
  currentY += lineHeight;

  // 기본 정보
  pdf.setFontSize(10);
  pdf.setTextColor(60, 60, 60);
  const uploadDate = formatDateForPDF(testResult.uploadedAt);
  const uploadedBy =
    testResult.uploadedBy?.displayName ||
    testResult.uploadedBy?.username ||
    "Unknown";

  safeSetText(
    pdf,
    `Report Generated: ${new Date().toLocaleString()}`,
    margin,
    currentY,
  );
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
export const addExecutiveSummary = (
  pdf,
  testResult,
  testSuites,
  testCases,
  margin,
  startY,
  pageWidth,
  pageHeight,
) => {
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
  safeSetText(pdf, "EXECUTIVE SUMMARY", margin, currentY);
  currentY += lineHeight * 1.5;

  // 구분선
  pdf.setDrawColor(150, 150, 150);
  pdf.line(margin, currentY, pageWidth - margin, currentY);
  currentY += lineHeight;

  // 핵심 지표들
  const passed =
    testResult.totalTests -
    testResult.failures -
    testResult.errors -
    testResult.skipped;
  const executedTests = testResult.totalTests - testResult.skipped; // 실제 실행된 테스트
  const successRate = executedTests > 0 ? (passed / executedTests) * 100 : 0; // 실행된 테스트 중 성공률

  // 테이블 스타일 헤더
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, currentY, pageWidth - 2 * margin, lineHeight * 1.2, "F");

  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  safeSetText(
    pdf,
    "Test Execution Overview",
    margin + 5,
    currentY + lineHeight * 0.8,
  );
  currentY += lineHeight * 1.8;

  // 통계 데이터
  const summaryStats = [
    ["Total Test Cases", testResult.totalTests.toString()],
    ["Executed Tests", executedTests.toString()],
    [
      "Passed",
      `${passed} (${
        executedTests > 0 ? ((passed / executedTests) * 100).toFixed(1) : 0
      }%)`,
    ],
    [
      "Failed",
      `${testResult.failures} (${
        executedTests > 0
          ? ((testResult.failures / executedTests) * 100).toFixed(1)
          : 0
      }%)`,
    ],
    [
      "Errors",
      `${testResult.errors} (${
        executedTests > 0
          ? ((testResult.errors / executedTests) * 100).toFixed(1)
          : 0
      }%)`,
    ],
    [
      "Skipped",
      `${testResult.skipped} (${
        testResult.totalTests > 0
          ? ((testResult.skipped / testResult.totalTests) * 100).toFixed(1)
          : 0
      }%)`,
    ],
    ["Success Rate", `${successRate.toFixed(1)}% (of executed)`],
    ["Total Execution Time", formatDuration(testResult.time || 0)],
    ["Test Suites", testSuites.length.toString()],
  ];

  pdf.setFontSize(10);
  summaryStats.forEach(([label, value]) => {
    pdf.setTextColor(60, 60, 60);
    safeSetText(pdf, label + ":", margin + 5, currentY);
    pdf.setTextColor(0, 0, 0);
    safeSetText(pdf, value, margin + 80, currentY);
    currentY += lineHeight * 0.9;
  });

  currentY += lineHeight;

  // 결과 분석
  pdf.setFontSize(12);
  pdf.setTextColor(40, 40, 40);
  safeSetText(pdf, "Test Result Analysis:", margin, currentY);
  currentY += lineHeight * 1.2;

  pdf.setFontSize(10);
  pdf.setTextColor(60, 60, 60);

  let analysisText = "";
  if (executedTests === 0) {
    analysisText =
      "NO EXECUTION: All tests were skipped. No tests were actually executed.";
  } else if (successRate >= 95) {
    analysisText =
      "EXCELLENT: Test execution shows outstanding quality with minimal failures.";
  } else if (successRate >= 85) {
    analysisText =
      "GOOD: Test execution shows good quality with acceptable failure rate.";
  } else if (successRate >= 70) {
    analysisText =
      "FAIR: Test execution shows moderate quality. Review failed cases recommended.";
  } else {
    analysisText =
      "POOR: Test execution shows significant issues. Immediate attention required.";
  }

  const lines = pdf.splitTextToSize(analysisText, pageWidth - 2 * margin - 10);
  lines.forEach((line) => {
    safeSetText(pdf, line, margin + 5, currentY);
    currentY += lineHeight * 0.9;
  });

  return currentY + lineHeight * 2;
};

/**
 * 테스트 스위트 결과 섹션 추가
 */
export const addTestSuiteResults = (
  pdf,
  testSuites,
  testCases,
  margin,
  startY,
  pageWidth,
  pageHeight,
) => {
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
  safeSetText(pdf, "TEST SUITE RESULTS", margin, currentY);
  currentY += lineHeight * 1.5;

  // 구분선
  pdf.setDrawColor(150, 150, 150);
  pdf.line(margin, currentY, pageWidth - margin, currentY);
  currentY += lineHeight * 1.5;

  // 테이블 헤더
  pdf.setFillColor(240, 240, 240);
  pdf.rect(margin, currentY, pageWidth - 2 * margin, lineHeight * 1.2, "F");

  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);
  safeSetText(pdf, "Suite Name", margin + 5, currentY + lineHeight * 0.8);
  safeSetText(pdf, "Tests", margin + 80, currentY + lineHeight * 0.8);
  safeSetText(pdf, "Passed", margin + 105, currentY + lineHeight * 0.8);
  safeSetText(pdf, "Failed", margin + 130, currentY + lineHeight * 0.8);
  safeSetText(pdf, "Errors", margin + 155, currentY + lineHeight * 0.8);
  safeSetText(
    pdf,
    "Success Rate",
    margin + 180 - 15,
    currentY + lineHeight * 0.8,
  );
  currentY += lineHeight * 1.8;

  // 테이블 데이터
  testSuites.forEach((suite, index) => {
    // 페이지 넘김 체크
    if (currentY > pageHeight - 60) {
      pdf.addPage();
      currentY = margin;
    }

    const passed = suite.tests - suite.failures - suite.errors;
    const successRate = suite.tests > 0 ? (passed / suite.tests) * 100 : 0;

    // 배경색 (번갈아가며)
    if (index % 2 === 0) {
      pdf.setFillColor(250, 250, 250);
      pdf.rect(
        margin,
        currentY - lineHeight * 0.3,
        pageWidth - 2 * margin,
        lineHeight * 1.2,
        "F",
      );
    }

    pdf.setFontSize(9);
    pdf.setTextColor(60, 60, 60);

    // 스위트명 (길면 축약)
    const suiteName =
      suite.name.length > 25 ? suite.name.substring(0, 22) + "..." : suite.name;
    safeSetText(pdf, suiteName, margin + 5, currentY + lineHeight * 0.5);
    safeSetText(
      pdf,
      suite.tests.toString(),
      margin + 85,
      currentY + lineHeight * 0.5,
    );
    safeSetText(
      pdf,
      passed.toString(),
      margin + 110,
      currentY + lineHeight * 0.5,
    );
    safeSetText(
      pdf,
      suite.failures.toString(),
      margin + 135,
      currentY + lineHeight * 0.5,
    );
    safeSetText(
      pdf,
      suite.errors.toString(),
      margin + 160,
      currentY + lineHeight * 0.5,
    );
    safeSetText(
      pdf,
      `${successRate.toFixed(1)}%`,
      margin + 180 - 10,
      currentY + lineHeight * 0.5,
    );

    currentY += lineHeight * 1.2;
  });

  return currentY + lineHeight * 2;
};

/**
 * 테스트 케이스 상세 섹션 추가 (개별 테스트 결과 포함)
 */
export const addTestCaseDetails = (
  pdf,
  testCases,
  margin,
  startY,
  pageWidth,
  pageHeight,
) => {
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
  safeSetText(pdf, "DETAILED TEST RESULTS", margin, currentY);
  currentY += lineHeight * 1.5;

  // 구분선
  pdf.setDrawColor(150, 150, 150);
  pdf.line(margin, currentY, pageWidth - margin, currentY);
  currentY += lineHeight * 1.5;

  // 상태별 카운트
  const statusCounts = {
    PASSED: testCases.filter((tc) => tc.status === "PASSED").length,
    FAILED: testCases.filter((tc) => tc.status === "FAILED").length,
    ERROR: testCases.filter((tc) => tc.status === "ERROR").length,
    SKIPPED: testCases.filter((tc) => tc.status === "SKIPPED").length,
  };

  // 상태별 통계 표시
  pdf.setFontSize(12);
  pdf.setTextColor(40, 40, 40);
  safeSetText(pdf, "Test Case Status Distribution:", margin, currentY);
  currentY += lineHeight * 1.5;

  Object.entries(statusCounts).forEach(([status, count]) => {
    if (count > 0) {
      const percentage = ((count / testCases.length) * 100).toFixed(1);
      pdf.setFontSize(10);
      pdf.setTextColor(60, 60, 60);
      safeSetText(
        pdf,
        `${status}: ${count} cases (${percentage}%)`,
        margin + 10,
        currentY,
      );
      currentY += lineHeight * 0.9;
    }
  });

  currentY += lineHeight * 2;

  // 개별 테스트 케이스 상세 결과
  pdf.setFontSize(16);
  pdf.setTextColor(40, 40, 40);
  safeSetText(pdf, "Individual Test Case Results:", margin, currentY);
  currentY += lineHeight * 2;

  // 테이블 헤더
  const addTestCaseTableHeader = () => {
    pdf.setFillColor(240, 240, 240);
    pdf.rect(margin, currentY, pageWidth - 2 * margin, lineHeight * 1.2, "F");

    pdf.setFontSize(9);
    pdf.setTextColor(0, 0, 0);
    safeSetText(pdf, "#", margin + 3, currentY + lineHeight * 0.8);
    safeSetText(
      pdf,
      "Test Case Name",
      margin + 15,
      currentY + lineHeight * 0.8,
    );
    safeSetText(pdf, "Class", margin + 90, currentY + lineHeight * 0.8);
    safeSetText(pdf, "Status", margin + 130, currentY + lineHeight * 0.8);
    safeSetText(pdf, "Time", margin + 155, currentY + lineHeight * 0.8);
    safeSetText(pdf, "Notes", margin + 175, currentY + lineHeight * 0.8);
    currentY += lineHeight * 1.8;
  };

  addTestCaseTableHeader();

  // 테스트 케이스들을 상태별로 정렬 (FAILED, ERROR, PASSED, SKIPPED 순)
  const sortedTestCases = [...testCases].sort((a, b) => {
    const statusOrder = { FAILED: 0, ERROR: 1, PASSED: 2, SKIPPED: 3 };
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
      case "PASSED":
        statusColor = [40, 140, 40]; // 녹색
        bgColor = [240, 255, 240]; // 연한 녹색
        break;
      case "FAILED":
        statusColor = [220, 53, 69]; // 빨간색
        bgColor = [255, 240, 240]; // 연한 빨간색
        break;
      case "ERROR":
        statusColor = [255, 140, 0]; // 주황색
        bgColor = [255, 248, 240]; // 연한 주황색
        break;
      case "SKIPPED":
        statusColor = [100, 100, 100]; // 회색
        bgColor = [245, 245, 245]; // 연한 회색
        break;
      default:
        statusColor = [0, 0, 0];
        bgColor = [255, 255, 255];
    }

    // 배경색 설정
    pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    pdf.rect(
      margin,
      currentY - lineHeight * 0.3,
      pageWidth - 2 * margin,
      lineHeight * 1.2,
      "F",
    );

    pdf.setFontSize(8);

    // 번호
    pdf.setTextColor(60, 60, 60);
    safeSetText(
      pdf,
      (index + 1).toString(),
      margin + 3,
      currentY + lineHeight * 0.5,
    );

    // 테스트 케이스 이름 (축약)
    const testName = testCase.userTitle || testCase.name;
    const truncatedName =
      testName.length > 25 ? testName.substring(0, 22) + "..." : testName;
    pdf.setTextColor(40, 40, 40);
    safeSetText(pdf, truncatedName, margin + 15, currentY + lineHeight * 0.5);

    // 클래스명 (축약)
    const className = testCase.className || "";
    const truncatedClass =
      className.length > 15
        ? className.substring(className.lastIndexOf(".") + 1)
        : className;
    pdf.setTextColor(80, 80, 80);
    safeSetText(pdf, truncatedClass, margin + 90, currentY + lineHeight * 0.5);

    // 상태
    pdf.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
    safeSetText(
      pdf,
      testCase.status,
      margin + 130,
      currentY + lineHeight * 0.5,
    );

    // 실행 시간
    pdf.setTextColor(60, 60, 60);
    const executionTime = testCase.time ? formatDuration(testCase.time) : "-";
    safeSetText(pdf, executionTime, margin + 155, currentY + lineHeight * 0.5);

    // 노트 (실패 메시지 또는 사용자 노트)
    let noteText = "";
    if (testCase.status === "FAILED" || testCase.status === "ERROR") {
      if (testCase.failureMessage) {
        // 실패 메시지 전체를 표시 (줄바꿈은 첫 번째 줄만)
        noteText = testCase.failureMessage.split("\n")[0];
      }
    } else if (testCase.userNotes) {
      noteText = testCase.userNotes;
    } else {
      noteText = "-";
    }

    pdf.setTextColor(100, 100, 100);

    // 긴 메시지의 경우 여러 줄로 분할
    if (noteText && noteText.length > 30) {
      const maxNoteWidth = pageWidth - margin - 175 - 10; // 노트 영역 너비
      const noteLines = pdf.splitTextToSize(noteText, maxNoteWidth);

      noteLines.forEach((line, lineIndex) => {
        safeSetText(
          pdf,
          line,
          margin + 175,
          currentY + lineHeight * 0.5 + lineIndex * lineHeight * 0.8,
        );
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
export const addFailedTestAnalysis = (
  pdf,
  failedCases,
  margin,
  startY,
  pageWidth,
  pageHeight,
) => {
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
  safeSetText(pdf, "FAILED TEST ANALYSIS", margin, currentY);
  currentY += lineHeight * 1.5;

  // 구분선
  pdf.setDrawColor(220, 53, 69);
  pdf.line(margin, currentY, pageWidth - margin, currentY);
  currentY += lineHeight * 1.5;

  if (failedCases.length === 0) {
    pdf.setFontSize(12);
    pdf.setTextColor(40, 140, 40); // 녹색
    safeSetText(
      pdf,
      "All tests passed successfully! No failed tests to analyze.",
      margin,
      currentY,
    );
    return currentY + lineHeight * 2;
  }

  // 실패한 테스트 케이스 목록
  pdf.setFontSize(12);
  pdf.setTextColor(40, 40, 40);
  safeSetText(
    pdf,
    `Total Failed Tests: ${failedCases.length}`,
    margin,
    currentY,
  );
  currentY += lineHeight * 1.5;

  failedCases.forEach((testCase, index) => {
    // 전체 실패 케이스 표시
    // 페이지 넘김 체크 - 각 실패 케이스는 대략 30-40점 높이 필요
    if (currentY > pageHeight - 100) {
      pdf.addPage();
      currentY = margin;
    }

    // 테스트 케이스 번호 및 이름
    pdf.setFontSize(10);
    pdf.setTextColor(220, 53, 69);
    const testName =
      (testCase.userTitle || testCase.name).length > 50
        ? (testCase.userTitle || testCase.name).substring(0, 47) + "..."
        : testCase.userTitle || testCase.name;

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
