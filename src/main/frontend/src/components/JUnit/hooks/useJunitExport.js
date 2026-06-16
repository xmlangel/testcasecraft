// src/components/JUnit/hooks/useJunitExport.js
//
// JUnit 테스트 결과 PDF/CSV 내보내기 훅. (JunitResultDetail 에서 추출 — 동작 보존)
// 두 핸들러가 공유하던 "전체 테스트케이스 수집" 루프를 내부 헬퍼로 통일.

import { useState } from "react";
import junitResultService from "../../../services/junitResultService";
import { exportTestResultToPDF } from "../../../utils/pdfExportUtils";
import { exportTestResultToCSV } from "../../../utils/csvExportUtils";

// 모든 스위트의 테스트케이스를 페이징 없이 수집 (실패한 스위트는 건너뜀)
const collectAllTestCases = async (testSuites) => {
  const all = [];
  for (const suite of testSuites) {
    try {
      const response = await junitResultService.getTestCasesBySuite(
        suite.id,
        0,
        1000,
      );
      all.push(...(response.content || []));
    } catch (error) {
      console.warn(`Failed to load test cases for suite ${suite.name}:`, error);
    }
  }
  return all;
};

export default function useJunitExport({ testResult, testSuites, t }) {
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingCSV, setExportingCSV] = useState(false);

  const handleExportToPDF = async () => {
    if (!testResult) {
      alert(t("junit.detail.exportPDFAlert"));
      return;
    }
    try {
      setExportingPDF(true);
      const allTestCases = await collectAllTestCases(testSuites);
      const result = await exportTestResultToPDF(
        testResult,
        testSuites,
        allTestCases,
      );
      if (result.success) {
        alert(`${t("junit.detail.exportPDFComplete")}: ${result.fileName}`);
      } else {
        alert(`${t("junit.detail.exportPDFFailed")}: ${result.message}`);
      }
    } catch (error) {
      console.error("PDF export error:", error);
      alert(t("junit.detail.exportPDFError") + ": " + error.message);
    } finally {
      setExportingPDF(false);
    }
  };

  const handleExportToCSV = async () => {
    if (!testResult) {
      alert(t("junit.detail.exportCSVAlert"));
      return;
    }
    try {
      setExportingCSV(true);
      const allTestCases = await collectAllTestCases(testSuites);
      const result = await exportTestResultToCSV(
        testResult,
        testSuites,
        allTestCases,
      );
      if (result.success) {
        alert(`${t("junit.detail.exportCSVComplete")}: ${result.fileName}`);
      } else {
        alert(`${t("junit.detail.exportCSVFailed")}: ${result.message}`);
      }
    } catch (error) {
      console.error("CSV export error:", error);
      alert(t("junit.detail.exportCSVError") + ": " + error.message);
    } finally {
      setExportingCSV(false);
    }
  };

  return { exportingPDF, exportingCSV, handleExportToPDF, handleExportToCSV };
}
