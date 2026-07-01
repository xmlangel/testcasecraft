import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import {
  addNanumGothicToJsPDF,
  setupKoreanFontFallback,
} from "../../../../assets/fonts/nanumGothicFont.js";
import { logError, debugLog } from "../../../../utils/logger.js";
import { convertDataForExport } from "../utils/SpreadsheetUtils.js";

/**
 * CSV Export 함수
 * @param {Array} spreadsheetData - 스프레드시트 데이터
 * @param {Array} columnLabels - 컬럼 라벨
 * @param {Function} t - i18n 번역 함수
 * @returns {Object} - { success, message, error }
 */
export const exportToCSV = (
  spreadsheetData,
  columnLabels,
  t = (key, fallback) => fallback,
) => {
  try {
    const { headers, rows } = convertDataForExport(
      spreadsheetData,
      columnLabels,
    );

    if (rows.length === 0) {
      return {
        success: false,
        message: t("testCase.export.noData", "내보낼 데이터가 없습니다."),
        severity: "warning",
      };
    }

    // CSV 형식으로 변환
    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    // BOM 추가 (한글 깨짐 방지)
    const BOM = "\uFEFF";
    const csvWithBom = BOM + csvContent;

    // 다운로드
    const blob = new Blob([csvWithBom], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:-]/g, "");
    const filename = `testcases_${timestamp}.csv`;

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return {
      success: true,
      message: t(
        "testCase.export.csvSuccess",
        "CSV 파일이 다운로드되었습니다: {filename}",
      ).replace("{filename}", filename),
      severity: "success",
    };
  } catch (error) {
    logError("CSV Export 실패:", error);
    return {
      success: false,
      message: t(
        "testCase.export.csvError",
        "CSV 다운로드 중 오류가 발생했습니다: {message}",
      ).replace("{message}", error.message),
      severity: "error",
      error,
    };
  }
};

/**
 * Excel Export 함수
 * @param {Array} spreadsheetData - 스프레드시트 데이터
 * @param {Array} columnLabels - 컬럼 라벨
 * @param {Function} t - i18n 번역 함수
 * @returns {Object} - { success, message, error }
 */
export const exportToExcel = (
  spreadsheetData,
  columnLabels,
  t = (key, fallback) => fallback,
) => {
  try {
    const { headers, rows } = convertDataForExport(
      spreadsheetData,
      columnLabels,
    );

    if (rows.length === 0) {
      return {
        success: false,
        message: t("testCase.export.noData", "내보낼 데이터가 없습니다."),
        severity: "warning",
      };
    }

    // 워크북 생성
    const workbook = XLSX.utils.book_new();

    // 워크시트 데이터 구성 (헤더 + 데이터)
    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // 컬럼 너비 자동 조정
    const maxWidths = headers.map((header, colIndex) => {
      const headerLength = String(header).length;
      const maxCellLength = Math.max(
        ...rows.map((row) => String(row[colIndex] || "").length),
      );
      return Math.min(Math.max(headerLength, maxCellLength, 10), 50);
    });

    worksheet["!cols"] = maxWidths.map((width) => ({ wch: width }));

    // 워크시트를 워크북에 추가
    XLSX.utils.book_append_sheet(workbook, worksheet, "TestCases");

    // 파일 다운로드
    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:-]/g, "");
    const filename = `testcases_${timestamp}.xlsx`;

    XLSX.writeFile(workbook, filename);

    return {
      success: true,
      message: t(
        "testCase.export.excelSuccess",
        "Excel 파일이 다운로드되었습니다: {filename}",
      ).replace("{filename}", filename),
      severity: "success",
    };
  } catch (error) {
    logError("Excel Export 실패:", error);
    return {
      success: false,
      message: t(
        "testCase.export.excelError",
        "Excel 다운로드 중 오류가 발생했습니다: {message}",
      ).replace("{message}", error.message),
      severity: "error",
      error,
    };
  }
};

/**
 * PDF Export 함수 (ICT-UserReq: 상세 보기 형식)
 * @param {Array} spreadsheetData - 스프레드시트 데이터
 * @param {Array} columnLabels - 컬럼 라벨
 * @param {Function} t - i18n 번역 함수
 * @param {Object} projectInfo - 프로젝트 정보 (명칭 등)
 * @returns {Promise<Object>} - { success, message, error }
 */
export const exportToPDF = async (
  spreadsheetData,
  columnLabels,
  t = (key, fallback) => fallback,
  projectInfo = {},
) => {
  try {
    const { rows } = convertDataForExport(spreadsheetData, columnLabels);

    if (rows.length === 0) {
      return {
        success: false,
        message: t("testCase.export.noData", "내보낼 데이터가 없습니다."),
        severity: "warning",
      };
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a4",
    });

    // 폰트 설정
    try {
      const added = await addNanumGothicToJsPDF(doc);
      if (!added) {
        setupKoreanFontFallback(doc);
      }
    } catch (error) {
      console.warn("폰트 로드 실패, 기본 폰트 사용", error);
      setupKoreanFontFallback(doc);
    }

    doc.setFont("NanumGothic", "normal");

    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const usableWidth = pageWidth - margin * 2;
    let cursorY = margin;

    const addNewPage = () => {
      doc.addPage();
      doc.setFont("NanumGothic", "normal");
      cursorY = margin;
    };

    const checkPageBreak = (neededHeight) => {
      if (cursorY + neededHeight > pageHeight - margin) {
        addNewPage();
      }
    };

    const drawHeader = (title) => {
      doc.setFontSize(20);
      doc.setTextColor(33, 150, 243); // Primary Blue
      doc.text(title, margin, cursorY + 20);
      cursorY += 40;

      // 구분선
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, cursorY, pageWidth - margin, cursorY);
      cursorY += 20;
    };

    const drawSectionTitle = (title) => {
      checkPageBreak(30);
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(title, margin, cursorY + 12);
      cursorY += 18;

      doc.setDrawColor(240, 240, 240);
      doc.line(margin, cursorY, pageWidth - margin, cursorY);
      cursorY += 12;
    };

    /**
     * 이미지 URL을 Base64 데이터 URL로 변환 (ICT-415)
     */
    const fetchImageAsDataUrl = async (url) => {
      try {
        // 상대 경로 처리
        const absoluteUrl = url.startsWith("http")
          ? url
          : window.location.origin + url;
        const response = await fetch(absoluteUrl);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.warn("이미지 로드 실패:", url, error);
        return null;
      }
    };

    /**
     * 텍스트와 이미지를 혼합하여 렌더링 (ICT-415)
     */
    const drawContentWithImages = async (
      content,
      fontSize = 10,
      color = [50, 50, 50],
    ) => {
      if (!content || content === "-") return;

      // 이미지 태그 정규표현식
      const imgRegex = /<img [^>]*src=["']([^"']+)["'][^>]*>/g;
      let lastIndex = 0;
      let match;

      doc.setFontSize(fontSize);
      doc.setTextColor(color[0], color[1], color[2]);

      while ((match = imgRegex.exec(content)) !== null) {
        // 1. 이미지 이전의 텍스트 출력
        const textBefore = content.substring(lastIndex, match.index).trim();
        if (textBefore) {
          const splitText = doc.splitTextToSize(textBefore, usableWidth);
          const neededHeight = splitText.length * (fontSize + 4);
          checkPageBreak(neededHeight);
          doc.text(splitText, margin, cursorY + fontSize);
          cursorY += neededHeight + 5;
        }

        // 2. 이미지 출력
        const imgSrc = match[1];
        const dataUrl = await fetchImageAsDataUrl(imgSrc);
        if (dataUrl) {
          try {
            // 이미지 크기 및 포맷 확인 (비동기)
            const img = new Image();
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = dataUrl;
            });

            const imgWidth = img.width;
            const imgHeight = img.height;
            const ratio = imgHeight / imgWidth;

            // 너비 맞춤 (최대 usableWidth, pt 변환 보정치 0.75 적용)
            const displayWidth = Math.min(usableWidth, imgWidth * 0.75);
            const displayHeight = displayWidth * ratio;

            // 포맷 감지 (MIME TYPE 추출)
            const mimeMatch = dataUrl.match(/^data:(image\/[a-z]+);base64,/);
            const format = mimeMatch
              ? mimeMatch[1].split("/")[1].toUpperCase()
              : "PNG";

            checkPageBreak(displayHeight + 10);
            doc.addImage(
              dataUrl,
              format,
              margin,
              cursorY,
              displayWidth,
              displayHeight,
            );
            cursorY += displayHeight + 15;
          } catch (e) {
            console.error("이미지 삽입 오류:", e);
            // 렌더링 실패 시 URL이라도 텍스트로 출력
            doc.setFontSize(8);
            doc.setTextColor(255, 0, 0);
            doc.text(`[이미지 로드 실패: ${imgSrc}]`, margin, cursorY + 8);
            cursorY += 15;
            doc.setFontSize(fontSize);
            doc.setTextColor(color[0], color[1], color[2]);
          }
        }

        lastIndex = imgRegex.lastIndex;
      }

      // 3. 남은 텍스트 출력
      const remainingText = content.substring(lastIndex).trim();
      if (remainingText) {
        const splitText = doc.splitTextToSize(remainingText, usableWidth);
        const neededHeight = splitText.length * (fontSize + 4);
        checkPageBreak(neededHeight);
        doc.text(splitText, margin, cursorY + fontSize);
        cursorY += neededHeight + 10;
      }
    };

    const drawInfoRow = (label, value) => {
      checkPageBreak(20);
      doc.setFontSize(10);
      doc.setTextColor(120, 120, 120);
      doc.text(`${label}:`, margin, cursorY + 10);

      doc.setTextColor(30, 30, 30);
      const valText = String(value || "-");
      const splitVal = doc.splitTextToSize(valText, usableWidth - 100);
      doc.text(splitVal, margin + 100, cursorY + 10);

      cursorY += splitVal.length * 14 + 6;
    };

    // 데이터 순회 및 PDF 생성
    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      if (index > 0) addNewPage();

      const [
        displayId,
        createdBy,
        updatedBy,
        order,
        type,
        parentFolder,
        name,
        description,
        preCondition,
        postCondition,
        expectedResults,
        priority,
        executionType,
        testTechnique,
        tags,
        ...stepsArray
      ] = row;

      // 1. 헤더 (테스트 케이스 명)
      const fullTitle = parentFolder ? `${parentFolder} >> ${name}` : name;
      drawHeader(fullTitle);

      // 2. 기본 정보
      drawInfoRow("ID", displayId);
      drawInfoRow(t("testResult.form.priority", "우선순위"), priority);
      drawInfoRow(
        t("testResult.form.executionType", "수행유형"),
        executionType,
      );
      drawInfoRow(
        t("testResult.form.automationStatus", "자동화여부"),
        type === t("testcase.type.folder", "폴더") ? "-" : executionType,
      );

      // 3. 설명 (이미지 포함 가능)
      if (description && description !== "-") {
        drawSectionTitle(t("testcase.column.description", "설명"));
        await drawContentWithImages(description);
      }

      // 4. 사전 조건 (이미지 포함 가능)
      if (preCondition && preCondition !== "-") {
        drawSectionTitle(t("testResult.form.preCondition", "사전조건"));
        await drawContentWithImages(preCondition);
      }

      // 5. 테스트 단계
      const validSteps = [];
      for (let i = 0; i < stepsArray.length; i += 2) {
        const stepDesc = stepsArray[i];
        const stepExpected = stepsArray[i + 1];
        if (
          (stepDesc && stepDesc !== "-") ||
          (stepExpected && stepExpected !== "-")
        ) {
          validSteps.push({
            no: i / 2 + 1,
            desc: stepDesc || "-",
            expected: stepExpected || "-",
          });
        }
      }

      if (validSteps.length > 0) {
        drawSectionTitle(t("testResult.form.testSteps", "테스트 단계"));

        // 테이블 헤더
        doc.setFillColor(245, 245, 245);
        doc.rect(margin, cursorY, usableWidth, 20, "F");
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 80);
        doc.text("No.", margin + 10, cursorY + 14);
        doc.text("Step", margin + 40, cursorY + 14);
        doc.text("Expected", margin + usableWidth / 2 + 20, cursorY + 14);
        cursorY += 25;

        for (const step of validSteps) {
          const descLines = doc.splitTextToSize(
            step.desc,
            usableWidth / 2 - 40,
          );
          const expectedLines = doc.splitTextToSize(
            step.expected,
            usableWidth / 2 - 40,
          );
          const rowHeight =
            Math.max(descLines.length, expectedLines.length) * 12 + 10;

          // 여기는 테이블 내부라 이미지 처리가 복잡함 (텍스트 위주로 우선 처리)
          checkPageBreak(rowHeight);

          doc.setFontSize(9);
          doc.setTextColor(50, 50, 50);
          doc.text(String(step.no), margin + 10, cursorY + 10);
          doc.text(descLines, margin + 40, cursorY + 10);
          doc.text(expectedLines, margin + usableWidth / 2 + 20, cursorY + 10);

          cursorY += rowHeight;
          doc.setDrawColor(245, 245, 245);
          doc.line(margin, cursorY, margin + usableWidth, cursorY);
          cursorY += 5;
        }
        cursorY += 10;
      }

      // 6. 예상 결과
      if (expectedResults && expectedResults !== "-") {
        drawSectionTitle(t("testResult.form.expectedResult", "예상결과"));
        await drawContentWithImages(expectedResults);
      }

      // 7. 사후 조건
      if (postCondition && postCondition !== "-") {
        drawSectionTitle(t("testResult.form.postCondition", "사후조건"));
        await drawContentWithImages(postCondition);
      }

      // 하단 푸터 생략... (원래 코드 유지)
      checkPageBreak(50);
      cursorY = Math.max(cursorY, pageHeight - margin - 60);
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, cursorY, pageWidth - margin, cursorY);
      cursorY += 15;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      const footerLeft = `${t(
        "testcase.column.createdBy",
        "작성자",
      )}: ${createdBy} | ${t(
        "testcase.column.updatedBy",
        "수정자",
      )}: ${updatedBy}`;
      doc.text(footerLeft, margin, cursorY);
      cursorY += 15;
      const footerRight = `Generated by TestCaseCraft | ${new Date().toLocaleDateString()}`;
      doc.text(
        footerRight,
        pageWidth - margin - doc.getTextWidth(footerRight),
        cursorY,
      );

      if (tags && tags !== "-") {
        cursorY += 12;
        doc.text(
          `${t("testcase.column.tags", "태그")}: ${tags}`,
          margin,
          cursorY,
        );
      }
    }

    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:-]/g, "");
    const projectName = projectInfo.name || "export";
    const filename = `testcase_detail_${projectName}_${timestamp}.pdf`;

    doc.save(filename);

    return {
      success: true,
      message: t(
        "testCase.export.pdfSuccess",
        "PDF 파일이 다운로드되었습니다: {filename}",
      ).replace("{filename}", filename),
      severity: "success",
    };
  } catch (error) {
    logError("PDF Export 실패:", error);
    return {
      success: false,
      message: t(
        "testCase.export.pdfError",
        "PDF 다운로드 중 오류가 발생했습니다: {message}",
      ).replace("{message}", error.message),
      severity: "error",
      error,
    };
  }
};
