// src/main/frontend/src/utils/pdfExportUtils.js

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  addNanumGothicToJsPDF,
  setupKoreanFontFallback,
} from "../assets/fonts/nanumGothicFont.js";
import { generateTestResultHTML } from "./pdf/htmlTemplates.js";
import {
  addHeaderSection,
  addExecutiveSummary,
  addTestSuiteResults,
  addTestCaseDetails,
  addFailedTestAnalysis,
} from "./pdf/pdfSections.js";

/**
 * 간소화된 폰트 설정 (jsPDF 호환성 우선)
 */
const addKoreanFont = async (pdf) => {
  try {
    // 복잡한 폰트 로딩 대신 안전한 기본 폰트만 사용
    setupKoreanFontFallback(pdf);

    return true;
  } catch (error) {
    console.warn("⚠️ 한글 폰트 설정 실패:", error);

    // 최종 안전 모드: 기본 helvetica만 사용
    try {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);
    } catch (safetyError) {
      console.error("💥 최종 안전 모드도 실패:", safetyError);
    }

    return false;
  }
};

/**
 * 테스트 결과를 HTML로 생성하는 함수 (한글 지원)
 */
export const exportTestResultToPDF = async (
  testResult,
  testSuites = [],
  testCases = [],
  fileName = null,
) => {
  try {
    // HTML-to-Canvas 방식 시도 (한글 폰트 지원)

    try {
      return await exportTestResultToPDFCanvas(
        testResult,
        testSuites,
        testCases,
        fileName,
      );
    } catch (canvasError) {
      console.warn(
        "⚠️ Canvas 방식 실패, Legacy 방식으로 폴백:",
        canvasError.message,
      );
      return await exportTestResultToPDFLegacy(
        testResult,
        testSuites,
        testCases,
        fileName,
      );
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
    console.error("PDF 내보내기 실패:", error);
    try {
      return await exportTestResultToPDFLegacy(
        testResult,
        testSuites,
        testCases,
        fileName,
      );
    } catch (legacyError) {
      console.error("Legacy PDF도 실패:", legacyError);
      return {
        success: false,
        error: legacyError.message,
        message: "PDF 내보내기 중 오류가 발생했습니다.",
      };
    }
  }
};

/**
 * HTML-to-Canvas 방식으로 한글 폰트 지원 PDF 생성
 */
const exportTestResultToPDFCanvas = async (
  testResult,
  testSuites = [],
  testCases = [],
  fileName = null,
) => {
  try {
    // 한글 폰트 사전 로드
    await loadKoreanFont();

    // HTML 내용 생성 (한글 폰트 적용)
    let htmlContent;
    try {
      htmlContent = generateTestResultHTML(testResult, testSuites, testCases);
    } catch (htmlError) {
      console.error("❌ HTML 생성 실패, 간단한 테스트 HTML 사용:", htmlError);

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
                        <p>파일명: ${
                          testResult.testExecutionName || "test-result"
                        }</p>
                        <p>전체 테스트: ${testResult.totalTests || 0}개</p>
                        <p>성공: ${
                          testResult.totalTests -
                            testResult.failures -
                            testResult.errors || 0
                        }개</p>
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
    const tempDiv = document.createElement("div");
    tempDiv.className = "pdf-content";
    tempDiv.innerHTML = htmlContent;

    // 더 안전한 스타일 설정
    Object.assign(tempDiv.style, {
      position: "absolute",
      left: "-10000px",
      top: "0px",
      width: "800px", // 조금 더 여유롭게
      minHeight: "600px", // 최소 높이 보장
      fontFamily:
        '"Nanum Gothic", "나눔고딕", "맑은 고딕", "Malgun Gothic", Arial, sans-serif',
      fontSize: "12px",
      lineHeight: "1.5",
      color: "#000000",
      backgroundColor: "#ffffff",
      padding: "20px",
      margin: "0",
      boxSizing: "border-box",
      overflow: "visible",
      display: "block",
      visibility: "visible",
      zIndex: "-1000",
      wordWrap: "break-word",
      whiteSpace: "normal",
    });

    document.body.appendChild(tempDiv);

    // DOM에 추가 후 강제 렌더링
    void tempDiv.offsetHeight; // 강제 reflow

    // 폰트 로딩 대기
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 요소 크기 확인
    const elementHeight = tempDiv.scrollHeight;
    const elementWidth = tempDiv.scrollWidth;

    if (elementHeight === 0 || elementWidth === 0) {
      throw new Error(
        "요소 크기가 0입니다. 콘텐츠가 생성되지 않았을 수 있습니다.",
      );
    }

    // HTML을 캔버스로 변환 (한글 폰트 적용됨)
    const canvas = await html2canvas(tempDiv, {
      scale: 1.5, // 고해상도 (2에서 1.5로 낮춤)
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: true, // 디버깅용 로그 활성화
      width: elementWidth,
      height: elementHeight,
      windowWidth: elementWidth,
      windowHeight: elementHeight,
      scrollX: 0,
      scrollY: 0,
      foreignObjectRendering: false, // false로 변경
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.querySelector("div");
      },
    });

    // 임시 요소 제거
    document.body.removeChild(tempDiv);

    // Canvas 검증
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error(
        `Canvas 생성 실패: ${
          canvas ? `${canvas.width}x${canvas.height}` : "null"
        }`,
      );
    }

    // Canvas 내용 확인 (비어있는지 체크)
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let hasContent = false;

    // 투명하지 않은 픽셀이 있는지 확인
    for (let i = 3; i < pixels.length; i += 4) {
      // 알파 채널만 확인
      if (pixels[i] > 0) {
        // 완전히 투명하지 않은 픽셀
        hasContent = true;
        break;
      }
    }

    if (!hasContent) {
      console.warn(
        "⚠️ Canvas가 비어있는 것 같습니다. 내용이 렌더링되지 않았을 수 있습니다.",
      );
    }

    // 캔버스를 이미지로 변환
    const imgData = canvas.toDataURL("image/png");

    // PDF 문서 생성
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // 이미지 크기 계산
    const imgWidth = pageWidth - 20; // 10mm 마진
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageContentHeight = pageHeight - 20; // 마진 10mm 상하

    // 이미지가 페이지를 벗어나는 경우 여러 페이지로 나누기
    if (imgHeight <= pageContentHeight) {
      // 한 페이지에 들어가는 경우
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
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
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        tempCanvas.width = canvas.width;
        tempCanvas.height = sourceHeight;

        tempCtx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sourceHeight,
          0,
          0,
          canvas.width,
          sourceHeight,
        );

        const pageImgData = tempCanvas.toDataURL("image/png");
        pdf.addImage(pageImgData, "PNG", 10, 10, imgWidth, currentPageHeight);

        sourceY += sourceHeight;
        remainingHeight -= currentPageHeight;
        pageNumber++;
      }
    }

    // 파일명 생성
    const testName = (
      testResult.testExecutionName ||
      testResult.fileName ||
      "test"
    ).replace(/[^a-zA-Z0-9._-]/g, "_");
    const version = new Date().toISOString().split("T")[0].replace(/-/g, ".");
    const defaultFileName = `${testName}_${version}.pdf`;
    const finalFileName = fileName || defaultFileName;

    // PDF 다운로드
    pdf.save(finalFileName);

    return {
      success: true,
      fileName: finalFileName,
      message: "PDF 내보내기가 완료되었습니다. (한글 지원)",
    };
  } catch (error) {
    console.error("❌ Canvas PDF 생성 실패:", error);
    throw error; // 상위에서 폴백 처리
  }
};

/**
 * 한글 폰트 사전 로드
 */
const loadKoreanFont = async () => {
  return new Promise((resolve) => {
    // CSS에 @font-face 추가 (Google Fonts CDN 우선 사용)
    const style = document.createElement("style");
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
    if ("fonts" in document) {
      // 3초 타임아웃과 함께 폰트 로딩 대기
      Promise.race([
        document.fonts.ready,
        new Promise((timeoutResolve) => setTimeout(timeoutResolve, 3000)),
      ])
        .then(() => {
          // Nanum Gothic 폰트가 실제로 로드되었는지 확인
          const loadedFonts = Array.from(document.fonts.values());
          const nanumLoaded = loadedFonts.some(
            (font) =>
              font.family.includes("Nanum Gothic") && font.status === "loaded",
          );

          resolve();
        })
        .catch(() => {
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
const exportTestResultToPDFLegacy = async (
  testResult,
  testSuites = [],
  testCases = [],
  fileName = null,
) => {
  try {
    // PDF 문서 생성 (A4 크기)
    const pdf = new jsPDF("p", "mm", "a4");
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
      console.warn("⚠️ 한글 폰트 로드 실패, 대체 방식 사용:", fontError);
      koreanFontLoaded = false;
      // 기본 폰트로 계속 진행
      try {
        setupKoreanFontFallback(pdf);
      } catch (fallbackError) {
        console.warn("폴백 폰트 설정도 실패:", fallbackError);
        // helvetica로 강제 설정
        pdf.setFont("helvetica", "normal");
      }
    }

    // 1. 제목 및 기본 정보
    currentY = addHeaderSection(pdf, testResult, margin, currentY, pageWidth);

    // 2. Executive Summary (요약)
    currentY = addExecutiveSummary(
      pdf,
      testResult,
      testSuites,
      testCases,
      margin,
      currentY,
      pageWidth,
      pageHeight,
    );

    // 3. Test Suite Results (테스트 스위트별 결과)
    if (testSuites.length > 0) {
      currentY = addTestSuiteResults(
        pdf,
        testSuites,
        testCases,
        margin,
        currentY,
        pageWidth,
        pageHeight,
      );
    }

    // 4. Test Case Details (상세 테스트 케이스 결과)
    if (testCases.length > 0) {
      currentY = addTestCaseDetails(
        pdf,
        testCases,
        margin,
        currentY,
        pageWidth,
        pageHeight,
      );
    }

    // 5. Failed Test Analysis (실패 분석)
    const failedCases = testCases.filter(
      (tc) => tc.status === "FAILED" || tc.status === "ERROR",
    );
    if (failedCases.length > 0) {
      currentY = addFailedTestAnalysis(
        pdf,
        failedCases,
        margin,
        currentY,
        pageWidth,
        pageHeight,
      );
    }

    // 파일명 생성 (AgensSQL 스타일)
    const testName = (
      testResult.testExecutionName ||
      testResult.fileName ||
      "test"
    ).replace(/[^a-zA-Z0-9._-]/g, "_");
    const version = new Date().toISOString().split("T")[0].replace(/-/g, ".");
    const defaultFileName = `${testName}_${version}.pdf`;
    const finalFileName = fileName || defaultFileName;

    // PDF 다운로드
    pdf.save(finalFileName);

    return {
      success: true,
      fileName: finalFileName,
      message: "PDF 내보내기가 완료되었습니다. (한글 지원)",
    };
  } catch (error) {
    console.error("PDF 내보내기 실패:", error);
    return {
      success: false,
      error: error.message,
      message: "PDF 내보내기 중 오류가 발생했습니다.",
    };
  }
};

/**
 * 현재 화면을 캡처하여 PDF로 내보내기 (스크린샷 방식)
 * @param {string} elementId - 캡처할 DOM 요소의 ID
 * @param {string} fileName - 저장할 파일명
 */
export const exportElementToPDF = async (
  elementId,
  fileName = "junit-report.pdf",
) => {
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
      backgroundColor: "#ffffff",
    });

    // 캔버스를 이미지로 변환
    const imgData = canvas.toDataURL("image/png");

    // PDF 생성
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // 이미지 크기 계산
    const imgWidth = pageWidth - 20; // 10mm 마진
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // 이미지가 페이지를 벗어나는 경우 여러 페이지로 나누기
    if (imgHeight <= pageHeight - 20) {
      // 한 페이지에 들어가는 경우
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
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

        pdf.addImage(imgData, "PNG", 10, 10 - yPosition, imgWidth, imgHeight);

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
      message: "PDF 내보내기가 완료되었습니다.",
    };
  } catch (error) {
    console.error("PDF 내보내기 실패:", error);
    return {
      success: false,
      error: error.message,
      message: "PDF 내보내기 중 오류가 발생했습니다.",
    };
  }
};
