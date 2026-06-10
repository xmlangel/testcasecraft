// ICT-194 Phase 2: TestResultDetailTable 컴포넌트 분할 - 내보내기 다이얼로그 분리

import React, { useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  CircularProgress,
  Alert,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  alpha,
  TextField,
} from "@mui/material";
import {
  FileDownload as FileDownloadIcon,
  Portrait as PortraitIcon,
  Landscape as LandscapeIcon,
} from "@mui/icons-material";
import { format as formatDate } from "date-fns";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import {
  addNanumGothicToJsPDF,
  setupKoreanFontFallback,
} from "../../assets/fonts/nanumGothicFont.js";
import { useAppContext } from "../../context/AppContext.jsx";
import { useI18n } from "../../context/I18nContext.jsx";
import { API_ENDPOINTS, buildUrl } from "../../utils/apiConstants.js";
import { getResultLabel } from "../../utils/testResultConstants.js";

// 숫자 포맷터 (천단위 구분)
const numberFormatter = new Intl.NumberFormat("ko-KR");
const formatCountValue = (value) => numberFormatter.format(value ?? 0);

// 퍼센트 문자열 포맷
const formatPercentageValue = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "0.0%";
  }
  return `${Number(value).toFixed(1)}%`;
};

// 안전한 날짜 변환
const toValidDate = (value) => {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

// 테이블 행 기반 통계 요약 계산
const computeStatisticsSummary = (rows = []) => {
  if (!Array.isArray(rows) || rows.length === 0) {
    const now = new Date();
    return {
      total: 0,
      pass: 0,
      fail: 0,
      blocked: 0,
      notRun: 0,
      executedCount: 0,
      jiraLinked: 0,
      executionRate: 0,
      successRate: 0,
      passRate: 0,
      failRate: 0,
      blockedRate: 0,
      notRunRate: 0,
      periodStart: null,
      periodEnd: null,
      generatedAt: now,
    };
  }

  const summary = {
    total: rows.length,
    pass: 0,
    fail: 0,
    blocked: 0,
    notRun: 0,
    jiraLinked: 0,
    periodStart: null,
    periodEnd: null,
  };

  rows.forEach((row) => {
    const result = (row?.result || "").toUpperCase();
    switch (result) {
      case "PASS":
        summary.pass += 1;
        break;
      case "FAIL":
        summary.fail += 1;
        break;
      case "BLOCKED":
        summary.blocked += 1;
        break;
      case "NOT_RUN":
        summary.notRun += 1;
        break;
      default:
        summary.notRun += 1;
        break;
    }

    if (row?.jiraId) {
      summary.jiraLinked += 1;
    }

    const executedDate = toValidDate(row?.executedDate);
    if (executedDate) {
      if (!summary.periodStart || executedDate < summary.periodStart) {
        summary.periodStart = executedDate;
      }
      if (!summary.periodEnd || executedDate > summary.periodEnd) {
        summary.periodEnd = executedDate;
      }
    }
  });

  const executedCount = summary.total - summary.notRun;
  const toRate = (value, base) =>
    base > 0 ? Number(((value / base) * 100).toFixed(1)) : 0;

  return {
    ...summary,
    executedCount,
    executionRate: toRate(executedCount, summary.total),
    successRate: toRate(summary.pass, executedCount),
    passRate: toRate(summary.pass, summary.total),
    failRate: toRate(summary.fail, summary.total),
    blockedRate: toRate(summary.blocked, summary.total),
    notRunRate: toRate(summary.notRun, summary.total),
    generatedAt: new Date(),
    testPlanName: rows[0]?.testPlanName || "",
    testExecutionName: rows[0]?.testExecutionName || "",
  };
};

/**
 * 테스트 결과 내보내기 다이얼로그 컴포넌트
 * ICT-190 기능을 별도 컴포넌트로 분리하여 재사용성 향상
 */
// QA 총평(마크다운)을 PDF 텍스트 출력용 일반 텍스트로 변환
const markdownToPlainText = (md = "") =>
  md
    .replace(/```[a-zA-Z0-9]*\n?/g, "") // 코드 펜스
    .replace(/^#{1,6}\s+/gm, "") // 제목
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // 이미지
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // 링크
    .replace(/^>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .trim();

const TestResultExportDialog = ({
  open,
  onClose,
  projectId,
  visibleColumns = [],
  rows = [],
  totalRows = 0,
  activeProject = null,
  qaSummary = "",
  qaSummaryUpdatedBy = "",
}) => {
  const { api } = useAppContext();
  const { t } = useI18n();
  const [exportFormat, setExportFormat] = useState("EXCEL");
  const [pdfOrientation, setPdfOrientation] = useState("landscape");
  const [footerPrefix, setFooterPrefix] = useState("");
  const [exporting, setExporting] = useState(false);
  const hasClientRows = useMemo(
    () => Array.isArray(rows) && rows.length > 0 && visibleColumns.length > 0,
    [rows, visibleColumns],
  );
  const statisticsSummary = useMemo(
    () => computeStatisticsSummary(rows),
    [rows],
  );

  // 내보내기 형식 옵션
  const exportFormats = [
    {
      value: "EXCEL",
      title: t("testResult.export.format.excel.title", "Excel (.xlsx)"),
      description: t(
        "testResult.export.format.excel.description",
        "서식과 차트 포함, 업무용 보고서에 최적",
      ),
      icon: "📊",
      features: [
        t("testResult.export.format.excel.feature1", "통계 차트 포함"),
        t("testResult.export.format.excel.feature2", "서식 유지"),
        t("testResult.export.format.excel.feature3", "필터링 가능"),
      ],
    },
    {
      value: "PDF",
      title: t("testResult.export.format.pdf.title", "PDF (.pdf)"),
      description: t(
        "testResult.export.format.pdf.description",
        "인쇄 및 공유용, 레이아웃 고정",
      ),
      icon: "📋",
      features: [
        t("testResult.export.format.pdf.feature1", "인쇄 최적화"),
        t("testResult.export.format.pdf.feature2", "레이아웃 고정"),
        t("testResult.export.format.pdf.feature3", "범용 호환성"),
      ],
    },
    {
      value: "CSV",
      title: t("testResult.export.format.csv.title", "CSV (.csv)"),
      description: t(
        "testResult.export.format.csv.description",
        "데이터 분석용, 가벼운 파일 크기",
      ),
      icon: "📈",
      features: [
        t("testResult.export.format.csv.feature1", "데이터 분석 최적"),
        t("testResult.export.format.csv.feature2", "가벼운 용량"),
        t("testResult.export.format.csv.feature3", "호환성 우수"),
      ],
    },
  ];

  const safeString = (value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    if (typeof value === "string") {
      return value;
    }
    if (typeof value === "number") {
      return String(value);
    }
    if (typeof value === "boolean") {
      return value
        ? t("common.boolean.yes", "예")
        : t("common.boolean.no", "아니오");
    }
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (value instanceof Date) {
      return formatDate(value, "yyyy-MM-dd HH:mm");
    }
    return JSON.stringify(value);
  };

  const formatSteps = (steps = []) => {
    if (!steps.length) return "-";
    return steps
      .map((step, index) => {
        const number = step.stepNumber || index + 1;
        const description = step.description ? ` ${step.description}` : "";
        const expected = step.expectedResult
          ? ` (${t("testResult.steps.expectedResult", "예상결과")}: ${
              step.expectedResult
            })`
          : "";
        return `${number}.${description}${expected}`;
      })
      .join("\n");
  };

  const formatExecutionType = (value) => {
    if (!value) return "-";
    const normalized = value.toLowerCase();
    return t(`testcase.executionType.${normalized}`, value);
  };

  const formatPriority = (value) => {
    if (!value) return "-";
    const normalized = value.toLowerCase();
    if (normalized === "high") return t("testCase.priority.high", "높음");
    if (normalized === "medium") return t("testCase.priority.medium", "보통");
    if (normalized === "low") return t("testCase.priority.low", "낮음");
    return value;
  };

  const formatCellValue = (row, column) => {
    const value = row?.[column.field];
    switch (column.field) {
      case "result":
        return getResultLabel(value) || "-";
      case "executedDate":
        if (!value) return "-";
        return formatDate(
          value instanceof Date ? value : new Date(value),
          "yyyy-MM-dd HH:mm",
        );
      case "steps":
        return formatSteps(value || []);
      case "tags":
        return (value || []).length ? value.join(", ") : "-";
      case "linkedDocuments":
        return (value || []).length ? value.join(", ") : "-";
      case "isAutomated":
        if (value === null || value === undefined) return "-";
        return value
          ? t("testcase.executionType.automation", "Automation")
          : t("testcase.executionType.manual", "Manual");
      case "executionType":
        return formatExecutionType(value);
      case "priority":
        return formatPriority(value);
      case "attachments":
        return row?.testResultId
          ? t("testResult.export.attachmentsAvailable", "첨부 있음")
          : "-";
      case "notes":
      case "description":
      case "preCondition":
      case "postCondition":
      case "expectedResults":
        return value ? value : "-";
      default:
        return safeString(value);
    }
  };

  // 컬럼 필드명을 영어 헤더로 매핑
  const getEnglishHeader = (field) => {
    const headerMap = {
      folder: "Folder",
      displayId: "Display ID",
      testCase: "Test Case",
      description: "Description",
      result: "Result",
      executedDate: "Executed Date",
      executor: "Executor",
      notes: "Notes",
      attachments: "Attachments",
      jiraId: "JIRA ID",
      jiraStatus: "JIRA Status",
      preCondition: "Pre-condition",
      postCondition: "Post-condition",
      expectedResults: "Expected Results",
      steps: "Steps",
      isAutomated: "Automated",
      executionType: "Execution Type",
      testTechnique: "Test Technique",
      priority: "Priority",
      tags: "Tags",
      linkedDocuments: "Linked Documents",
    };
    return headerMap[field] || field;
  };

  const buildExportMatrix = () => {
    const headers = visibleColumns.map((col) => getEnglishHeader(col.field));
    const data = rows.map((row) =>
      visibleColumns.map((col) => formatCellValue(row, col)),
    );
    return { headers, data };
  };

  const downloadBlob = (blob, fileName) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const exportAsExcel = (headers, data, fileName) => {
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "TestResults");
    XLSX.writeFile(workbook, fileName);
  };

  const exportAsCsv = (headers, data, fileName) => {
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    downloadBlob(blob, fileName);
  };

  const ensureKoreanPdfFont = async (doc) => {
    try {
      const added = await addNanumGothicToJsPDF(doc);
      if (!added) {
        setupKoreanFontFallback(doc);
      }
    } catch (error) {
      console.warn(t("export.font.setupError", "⚠️ 나눔고딕 폰트 설정 중 오류가 발생했습니다."), error);
      setupKoreanFontFallback(doc);
    }
  };

  const exportAsPdf = async (
    headers,
    data,
    fileName,
    summaryData = null,
    orientation = "landscape",
  ) => {
    const pdf = new jsPDF({
      orientation: orientation,
      unit: "pt",
      format: "a4",
    });
    await ensureKoreanPdfFont(pdf);
    pdf.setFont("NanumGothic", "normal");

    const margin = 40;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const usableWidth = pageWidth - margin * 2;
    const lineHeight = 16;
    let cursorY = margin;
    const summary = summaryData || null;

    // --- 색상 및 스타일 정의 ---
    const colors = {
      primary: [25, 118, 210], // MUI Primary Blue
      primaryLight: [232, 245, 255],
      success: [46, 125, 50], // MUI Success Green
      successLight: [232, 247, 238],
      error: [211, 47, 47], // MUI Error Red
      errorLight: [255, 235, 236],
      warning: [237, 108, 2], // MUI Warning Orange
      warningLight: [255, 243, 224],
      info: [2, 136, 209], // MUI Info Blue
      infoLight: [235, 248, 255],
      grey: [158, 158, 158],
      greyDark: [66, 66, 66],
      greyLight: [245, 247, 250],
      white: [255, 255, 255],
      black: [33, 33, 33],
    };

    const drawRoundedRect = (x, y, width, height, radius, style) => {
      if (typeof pdf.roundedRect === "function") {
        pdf.roundedRect(x, y, width, height, radius, radius, style);
      } else {
        pdf.rect(x, y, width, height, style);
      }
    };

    const addFooter = () => {
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setDrawColor(230, 230, 230);
        pdf.setLineWidth(0.5);
        pdf.line(margin, pageHeight - 35, pageWidth - margin, pageHeight - 35);

        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);

        // 좌측: 시스템 문구 (사용자 정의 브랜딩 반영)
        if (footerPrefix && footerPrefix.trim()) {
          // 사용자 정의 문구: **입력문구** | Powered by TestCaseCraft
          const prefix = footerPrefix.trim();
          const poweredBy = " | Powered by TestCaseCraft";

          // Bold 체험 (시뮬레이션): Regular 폰트만 있을 때 겹쳐 그리기
          let currentX = margin;
          pdf.setFont("NanumGothic", "normal");

          // 굵게 그리기 (0.3pt 간격으로 3번 그림)
          pdf.text(prefix, currentX, pageHeight - 20);
          pdf.text(prefix, currentX + 0.3, pageHeight - 20);
          pdf.text(prefix, currentX + 0.6, pageHeight - 20);

          const prefixWidth = pdf.getTextWidth(prefix);
          currentX += prefixWidth + 1; // 약간의 간격

          // " | Powered by TestCaseCraft" 부분은 보통 굵기로
          pdf.text(poweredBy, currentX, pageHeight - 20);
        } else {
          // 기본 문구: Generated by TestCaseCraft - Professional QA Reporting
          pdf.setFont("NanumGothic", "normal");
          pdf.text(
            "Generated by TestCaseCraft - Professional QA Reporting",
            margin,
            pageHeight - 20,
          );
        }

        // 우측: 페이지 번호
        const pageLabel = `Page ${i} of ${pageCount}`;
        const labelWidth = pdf.getTextWidth(pageLabel);
        pdf.text(pageLabel, pageWidth - margin - labelWidth, pageHeight - 20);
      }
    };

    const ensureSpace = (requiredHeight) => {
      if (cursorY + requiredHeight > pageHeight - margin - 40) {
        // 푸터 공간 제외
        pdf.addPage();
        pdf.setFont("NanumGothic", "normal");
        drawPageHeader(false); // 2페이지부터는 슬림 헤더 적용
        return true;
      }
      return false;
    };

    // 여러 줄 텍스트를 줄 단위로 렌더링하여, 내용이 한 페이지 높이를 넘으면
    // 자동으로 페이지를 넘기며 이어 출력한다. (Steps 등 긴 섹션 잘림 방지)
    // applyStyle: 페이지가 새로 추가됐을 때 본문 폰트/색상을 복원하기 위한 콜백
    const drawTextLines = (lines, x, lineH, applyStyle) => {
      lines.forEach((line) => {
        const pageAdded = ensureSpace(lineH);
        if (pageAdded && typeof applyStyle === "function") {
          applyStyle();
        }
        pdf.text(line, x, cursorY);
        cursorY += lineH;
      });
    };

    const drawPageHeader = (isFirstPage = false) => {
      if (isFirstPage) {
        // --- 첫 페이지: 대형 헤더 바 ---
        pdf.setFillColor(...colors.primary);
        pdf.rect(0, 0, pageWidth, 64, "F");

        // 제목
        pdf.setTextColor(...colors.white);
        pdf.setFontSize(orientation === "portrait" ? 16 : 18);
        pdf.setFont("NanumGothic", "normal");
        pdf.text(
          t("testResult.export.pdf.title", "테스트 결과 리포트"),
          margin,
          38,
        );

        // 프로젝트 정보 (우측 상단)
        pdf.setFontSize(8);
        const projectText = `${t(
          "testResult.export.pdf.project",
          "프로젝트",
        )}: ${activeProject?.name || "N/A"}`;
        const dateText = `${t(
          "testResult.export.pdf.generatedAt",
          "생성일시",
        )}: ${formatDate(new Date(), "yyyy-MM-dd HH:mm")}`;

        const projectTextWidth = pdf.getTextWidth(projectText);
        const dateTextWidth = pdf.getTextWidth(dateText);

        pdf.text(projectText, pageWidth - margin - projectTextWidth, 30);
        pdf.text(dateText, pageWidth - margin - dateTextWidth, 45);

        cursorY = 86;
      } else {
        // --- 2페이지부터: 슬림 Sticky 헤더 ---
        pdf.setFillColor(...colors.primaryLight);
        pdf.rect(0, 0, pageWidth, 40, "F");

        // 좌측: 리포트 타이틀
        pdf.setTextColor(...colors.primary);
        pdf.setFontSize(9);
        pdf.setFont("NanumGothic", "normal");
        pdf.text(
          t("testResult.export.pdf.title", "테스트 결과 리포트"),
          margin,
          25,
        );

        // 중앙: Plan / 실행명 정보 (사용자 요청사항)
        const planInfo = `${t("testResult.export.pdf.summary.plan", "Plan")}: ${
          summary?.testPlanName || "-"
        } / ${t("testResult.export.pdf.summary.execution", "실행명")}: ${
          summary?.testExecutionName || "-"
        }`;
        pdf.setTextColor(...colors.black);
        pdf.setFontSize(8);
        const planInfoWidth = pdf.getTextWidth(planInfo);
        pdf.text(planInfo, (pageWidth - planInfoWidth) / 2, 25);

        // 우측: 프로젝트명
        pdf.setTextColor(...colors.greyDark);
        const pName = activeProject?.name || "";
        const pNameWidth = pdf.getTextWidth(pName);
        pdf.text(pName, pageWidth - margin - pNameWidth, 25);

        pdf.setDrawColor(...colors.primary);
        pdf.setLineWidth(1);
        pdf.line(0, 40, pageWidth, 40);

        cursorY = 65; // Sticky header 공간 이후 시작
      }
    };

    const drawSummarySection = () => {
      if (!summary) return;

      pdf.setTextColor(...colors.black);
      pdf.setFontSize(12);
      pdf.text(
        t("testResult.export.pdf.summaryTitle", "📝 테스트 수행 요약"),
        margin,
        cursorY,
      );
      cursorY += 18;

      // Plan / 실행명 텍스트 추가 (ICT-Plan/Execution)
      pdf.setTextColor(...colors.greyDark);
      pdf.setFontSize(9);
      const infoText = `${t("testResult.export.pdf.summary.plan", "Plan")}: ${
        summary?.testPlanName || "-"
      }   |   ${t("testResult.export.pdf.summary.execution", "실행명")}: ${
        summary?.testExecutionName || "-"
      }`;
      pdf.text(infoText, margin, cursorY);
      cursorY += 18;

      const isPortrait = orientation === "portrait";
      const cardWidth = (usableWidth - (isPortrait ? 24 : 36)) / 4;
      const cardHeight = 72;
      const cardGap = isPortrait ? 8 : 12;

      const periodText =
        summary.periodStart && summary.periodEnd
          ? `${formatDate(summary.periodStart, "yyyy-MM-dd")} ~ ${formatDate(
              summary.periodEnd,
              "yyyy-MM-dd",
            )}`
          : t("testResult.export.pdf.summary.noPeriod", "기간 정보 없음");

      const kpiCards = [
        {
          label: t("testResult.export.pdf.summary.total", "총 테스트"),
          value: t("testResult.export.pdf.summary.totalValue", "{count}건", { count: formatCountValue(summary.total) }),
          sub: periodText,
          color: colors.info,
          bgColor: colors.infoLight,
          icon: "📊",
        },
        {
          label: t("testResult.export.pdf.summary.executionRate", "실행률"),
          value: formatPercentageValue(summary.executionRate),
          sub: t("testResult.export.pdf.summary.executedValue", "{count}건 실행됨", { count: summary.executedCount }),
          color: colors.success,
          bgColor: colors.successLight,
          icon: "⚡",
        },
        {
          label: t("testResult.export.pdf.summary.successRate", "성공률"),
          value: formatPercentageValue(summary.successRate),
          sub: t("testResult.export.pdf.summary.passValue", "{count}건 통과됨", { count: summary.pass }),
          color: colors.warning,
          bgColor: colors.warningLight,
          icon: "🎯",
        },
        {
          label: t("testResult.export.pdf.summary.jiraLinked", "JIRA 연동"),
          value: t("testResult.export.pdf.summary.jiraLinkedValue", "{count}건", { count: formatCountValue(summary.jiraLinked) }),
          sub: t("export.column.defectsAndTickets", "결함 및 티켓 링크"),
          color: colors.error,
          bgColor: colors.errorLight,
          icon: "🔗",
        },
      ];

      let cardX = margin;
      kpiCards.forEach((card) => {
        // 카드 배경
        pdf.setFillColor(...card.bgColor);
        drawRoundedRect(cardX, cursorY, cardWidth, cardHeight, 6, "F");

        // 좌측 액센트 바
        pdf.setFillColor(...card.color);
        pdf.rect(cardX, cursorY, 4, cardHeight, "F");

        // 레이블
        pdf.setTextColor(...colors.greyDark);
        pdf.setFontSize(isPortrait ? 8 : 9);
        pdf.text(card.label, cardX + 10, cursorY + 18);

        // 아이콘 (우측 상단)
        pdf.setFontSize(isPortrait ? 12 : 14);
        pdf.text(
          card.icon,
          cardX + cardWidth - (isPortrait ? 18 : 24),
          cursorY + 20,
        );

        // 값
        pdf.setTextColor(...colors.black);
        pdf.setFontSize(isPortrait ? 14 : 16);
        pdf.text(card.value, cardX + 10, cursorY + 42);

        // 서브 텍스트
        pdf.setTextColor(...colors.grey);
        pdf.setFontSize(7.5);
        pdf.text(card.sub, cardX + 10, cursorY + 58, {
          maxWidth: cardWidth - 15,
        });

        cardX += cardWidth + cardGap;
      });

      cursorY += cardHeight + 20;

      // 상태 브레이크다운 박스
      const breakdownWidth = (usableWidth - (isPortrait ? 24 : 36)) / 4;
      const breakdownHeight = 44;
      const breakdowns = [
        {
          label: t("testResult.status.pass", "성공"),
          count: summary.pass,
          rate: summary.passRate,
          color: colors.success,
          bgColor: colors.successLight,
        },
        {
          label: t("testResult.status.fail", "실패"),
          count: summary.fail,
          rate: summary.failRate,
          color: colors.error,
          bgColor: colors.errorLight,
        },
        {
          label: t("testResult.status.blocked", "차단"),
          count: summary.blocked,
          rate: summary.blockedRate,
          color: colors.warning,
          bgColor: colors.warningLight,
        },
        {
          label: t("testResult.status.notRun", "미실행"),
          count: summary.notRun,
          rate: summary.notRunRate,
          color: colors.grey,
          bgColor: colors.greyLight,
        },
      ];

      cardX = margin;
      breakdowns.forEach((item) => {
        pdf.setFillColor(...item.bgColor);
        drawRoundedRect(
          cardX,
          cursorY,
          breakdownWidth,
          breakdownHeight,
          4,
          "F",
        );

        pdf.setDrawColor(...item.color);
        pdf.setLineWidth(1);
        pdf.rect(cardX, cursorY, breakdownWidth, breakdownHeight, "S");

        pdf.setTextColor(...colors.black);
        pdf.setFontSize(isPortrait ? 8 : 9);
        pdf.text(item.label, cardX + 8, cursorY + 16);

        pdf.setFontSize(isPortrait ? 9 : 11);
        const countTxt = `${formatCountValue(
          item.count,
        )} (${formatPercentageValue(item.rate)})`;
        pdf.text(countTxt, cardX + 8, cursorY + 34, {
          maxWidth: breakdownWidth - 12,
        });

        cardX += breakdownWidth + cardGap;
      });

      cursorY += breakdownHeight + 24;
    };

    // QA 총평 — 상세 테스트 결과 리스트 바로 위에 출력
    const drawQaSummarySection = () => {
      if (!qaSummary || !qaSummary.trim()) return;

      ensureSpace(60);
      pdf.setTextColor(...colors.black);
      pdf.setFontSize(12);
      pdf.text(
        t("testResult.export.pdf.qaSummaryTitle", "💬 QA 총평"),
        margin,
        cursorY,
      );
      cursorY += 16;

      if (qaSummaryUpdatedBy) {
        pdf.setTextColor(...colors.grey);
        pdf.setFontSize(8);
        pdf.text(
          `${t("testResult.export.pdf.qaSummaryBy", "작성")}: ${qaSummaryUpdatedBy}`,
          margin,
          cursorY,
        );
        cursorY += 14;
      }

      const applyBodyStyle = () => {
        pdf.setFont("NanumGothic", "normal");
        pdf.setTextColor(...colors.greyDark);
        pdf.setFontSize(9);
      };
      applyBodyStyle();
      const summaryLines = pdf.splitTextToSize(
        markdownToPlainText(qaSummary),
        usableWidth - 8,
      );
      drawTextLines(summaryLines, margin + 4, 13, applyBodyStyle);
      cursorY += 16;
    };

    const drawListEntries = () => {
      pdf.setTextColor(...colors.black);
      pdf.setFontSize(12);
      pdf.text(
        t("testResult.export.pdf.detailTitle", "🔍 상세 테스트 결과 리스트"),
        margin,
        cursorY,
      );
      cursorY += 20;

      const listPadding = 16;
      const rowGap = 24;
      const cardWidth = usableWidth;

      data.forEach((rowValues, index) => {
        // 데이터 추출 매핑
        const rowData = {};
        headers.forEach((header, hIdx) => {
          rowData[header] = rowValues[hIdx] || "-";
        });

        // 결과 상태에 따른 컬러 선택
        const resultIdx = headers.indexOf("Result");
        const statusStr =
          resultIdx !== -1 ? String(rowValues[resultIdx]).toUpperCase() : "";
        let statusConfig = { color: colors.grey, light: colors.greyLight };
        if (statusStr.includes("PASS"))
          statusConfig = { color: colors.success, light: colors.successLight };
        else if (statusStr.includes("FAIL"))
          statusConfig = { color: colors.error, light: colors.errorLight };
        else if (statusStr.includes("BLOCK"))
          statusConfig = { color: colors.warning, light: colors.warningLight };

        // --- 항목 렌더링 시작 ---

        // 1. 개별 테스트 결과 헤더 (카드 배경색 처리)
        const summaryHeight = 28;
        ensureSpace(summaryHeight + 100); // 최소 높이 확보

        pdf.setFillColor(...statusConfig.light);
        drawRoundedRect(margin, cursorY, cardWidth, summaryHeight, 4, "F");

        pdf.setTextColor(...colors.black);
        pdf.setFontSize(11);
        const titleText = `#${index + 1} | ${
          rowData["Test Case"] || rowData["testCase"] || "N/A"
        }`;
        pdf.text(titleText, margin + 12, cursorY + 18);

        // 결과 배지 (우측)
        const statusLabel = statusStr || "N/A";
        const statusWidth = pdf.getTextWidth(statusLabel);
        pdf.setFillColor(...statusConfig.color);
        drawRoundedRect(
          margin + cardWidth - statusWidth - 20,
          cursorY + 6,
          statusWidth + 8,
          16,
          3,
          "F",
        );
        pdf.setTextColor(...colors.white);
        pdf.setFontSize(9);
        pdf.text(
          statusLabel,
          margin + cardWidth - statusWidth - 16,
          cursorY + 17,
        );

        cursorY += summaryHeight + 12;

        // 2. 기본 정보 영역 (Label: Value 형식)
        const infoPairs = [
          {
            label: "ID",
            value: rowData["Display ID"] || rowData["displayId"] || "-",
          },
          {
            label: t("testCase.priority.label", "우선순위"),
            value: rowData["Priority"] || rowData["priority"] || "-",
          },
          {
            label: t("testResult.column.executor", "수행자"),
            value: rowData["Executor"] || rowData["executor"] || "-",
          },
          {
            label: t("testResult.column.executedDate", "수행일시"),
            value: rowData["Executed Date"] || rowData["executedDate"] || "-",
          },
          {
            label: "JIRA ID",
            value: rowData["JIRA ID"] || rowData["jiraId"] || "-",
          },
        ];

        pdf.setFontSize(9);
        infoPairs.forEach((pair) => {
          ensureSpace(20);
          pdf.setTextColor(...colors.grey);
          pdf.text(`${pair.label}:`, margin + 12, cursorY + 8);

          pdf.setTextColor(...colors.black);
          const valText = String(pair.value);
          const splitVal = pdf.splitTextToSize(valText, cardWidth - 120);
          pdf.text(splitVal, margin + 110, cursorY + 8);
          cursorY += splitVal.length * 14 + 4;
        });

        cursorY += 6;

        // 3. 상세 섹션들 (설명, 단계, 기대결과 등)
        const sections = [
          {
            title: t("testcase.column.description", "설명"),
            field: "Description",
          },
          {
            title: t("testResult.form.preCondition", "사전조건"),
            field: "Pre-condition",
          },
          {
            title: t("testResult.form.testSteps", "테스트 단계"),
            field: "Steps",
          },
          {
            title: t("testResult.form.expectedResult", "예상결과"),
            field: "Expected Results",
          },
          { title: t("testcase.column.notes", "비고"), field: "Notes" },
        ];

        sections.forEach((section) => {
          const content = rowData[section.field];
          if (content && content !== "-") {
            ensureSpace(40);

            // 섹션 헤더
            pdf.setDrawColor(240, 240, 240);
            pdf.line(margin + 12, cursorY, margin + cardWidth - 12, cursorY);
            cursorY += 12;

            pdf.setTextColor(...colors.primary);
            pdf.setFontSize(10);
            pdf.text(section.title, margin + 12, cursorY);
            cursorY += 12;

            // 섹션 본문 - 페이지 경계를 넘어가면 줄 단위로 분할 렌더링하여 잘림 방지
            const applyBodyStyle = () => {
              pdf.setFont("NanumGothic", "normal");
              pdf.setTextColor(...colors.greyDark);
              pdf.setFontSize(9);
            };
            applyBodyStyle();
            const splitContent = pdf.splitTextToSize(
              String(content),
              cardWidth - 30,
            );

            drawTextLines(splitContent, margin + 14, 13, applyBodyStyle);
            cursorY += 12;
          }
        });

        // 항목 간 구분 실선
        pdf.setDrawColor(220, 220, 220);
        pdf.setLineWidth(1);
        pdf.line(margin, cursorY, margin + cardWidth, cursorY);
        cursorY += rowGap;
      });
    };

    // --- 실행 ---
    drawPageHeader(true); // 첫 페이지 메인 헤더
    drawSummarySection();

    // QA 총평 — 상세 리스트 바로 위
    drawQaSummarySection();

    // 상세 결과가 다음 페이지로 밀릴 수 있으므로 공간 체크 후 타이틀 출력
    ensureSpace(40);
    drawListEntries();

    // 마지막으로 푸터 추가 (모든 페이지 대상)
    addFooter();

    pdf.save(fileName);
  };

  const handleClientSideExport = async () => {
    const { headers, data } = buildExportMatrix();

    if (!data.length) {
      alert(
        t("testResult.export.error.noData", "내보내기할 데이터가 없습니다."),
      );
      return;
    }

    const timestamp = formatDate(new Date(), "yyyyMMdd_HHmm");
    const baseFileName = `테스트결과_${
      activeProject?.name || "export"
    }_${timestamp}`;
    const summaryForExport =
      statisticsSummary || computeStatisticsSummary(rows);

    switch (exportFormat) {
      case "EXCEL":
        exportAsExcel(headers, data, `${baseFileName}.xlsx`);
        break;
      case "CSV":
        exportAsCsv(headers, data, `${baseFileName}.csv`);
        break;
      case "PDF":
        await exportAsPdf(
          headers,
          data,
          `${baseFileName}.pdf`,
          summaryForExport,
          pdfOrientation,
        );
        break;
      default:
        exportAsExcel(headers, data, `${baseFileName}.xlsx`);
        break;
    }
  };

  /**
   * 내보내기 실행
   */
  const handleExportConfirm = async () => {
    if (!projectId) {
      alert(
        t(
          "testResult.export.error.noProject",
          "프로젝트가 선택되지 않았습니다.",
        ),
      );
      return;
    }

    try {
      setExporting(true);

      if (hasClientRows) {
        await handleClientSideExport();
        onClose();
        return;
      }

      // 표시되는 컬럼들의 필드명 가져오기
      const displayColumns = visibleColumns.map((col) => {
        switch (col.field) {
          case "folder":
            return "folderPath";
          case "testCase":
            return "testCaseName";
          case "result":
            return "result";
          case "executedDate":
            return "executedAt";
          case "executor":
            return "executorName";
          case "notes":
            return "notes";
          case "jiraId":
            return "jiraIssueKey";
          case "jiraStatus":
            return "jiraStatus";
          // ICT-277: 새로 추가된 컬럼들 매핑 추가
          case "preCondition":
            return "preCondition";
          case "expectedResults":
            return "expectedResults";
          case "steps":
            return "steps";
          default:
            return col.field;
        }
      });

      // 내보내기 필터 생성
      const exportFilter = {
        projectId: projectId,
        exportFormat: exportFormat,
        displayColumns: displayColumns,
        includeStatistics: true,
        page: 0,
        size: 10000, // 최대 10,000건으로 제한
      };

      // API 호출
      const response = await api(buildUrl(API_ENDPOINTS.TEST_RESULTS.EXPORT), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(exportFilter),
      });

      if (!response.ok) {
        throw new Error(
          t(
            "testResult.export.error.response",
            "내보내기 실패: {status} {statusText}",
          )
            .replace("{status}", response.status)
            .replace("{statusText}", response.statusText),
        );
      }

      // 파일 다운로드
      const blob = await response.blob();
      const fileExtension =
        exportFormat.toLowerCase() === "excel"
          ? "xlsx"
          : exportFormat.toLowerCase();
      const fileName = `테스트결과_${
        activeProject?.name || "export"
      }_${formatDate(new Date(), "yyyyMMdd_HHmm")}.${fileExtension}`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      onClose();
    } catch (error) {
      console.error(t("export.export.error", "내보내기 오류:"), error);
      alert(
        t(
          "testResult.export.error.failed",
          "파일 내보내기 중 오류가 발생했습니다: {message}",
        ).replace("{message}", error.message),
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: (theme) => ({
            borderRadius: 2,
            boxShadow: theme.shadows[3],
            backgroundImage: "none",
            bgcolor: "background.paper",
            color: "text.primary",
          }),
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "primary.main",
          color: "white",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <FileDownloadIcon />
        {t("testResult.export.dialog.title", "테스트 결과 내보내기")}
      </DialogTitle>
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ mb: 3 }}>
          {/* 파일 형식 선택 */}
          <Typography variant="h6" gutterBottom color="primary">
            {t("testResult.export.section.format", "📄 내보내기 형식 선택")}
          </Typography>
          <Grid container spacing={2}>
            {exportFormats.map((format) => (
              <Grid size={{ xs: 12, md: 4 }} key={format.value}>
                <Card
                  variant={
                    exportFormat === format.value ? "outlined" : "elevation"
                  }
                  sx={{
                    cursor: "pointer",
                    border:
                      exportFormat === format.value ? "2px solid" : "1px solid",
                    borderColor:
                      exportFormat === format.value
                        ? "primary.main"
                        : "divider",
                    bgcolor: (theme) =>
                      exportFormat === format.value
                        ? theme.palette.mode === "dark"
                          ? alpha(theme.palette.primary.main, 0.15)
                          : alpha(theme.palette.primary.main, 0.05)
                        : "background.paper",
                    "&:hover": {
                      boxShadow: 4,
                      transform: "translateY(-2px)",
                      transition: "all 0.2s ease-in-out",
                    },
                    transition: "all 0.2s ease-in-out",
                  }}
                  onClick={() => setExportFormat(format.value)}
                >
                  <CardContent sx={{ textAlign: "center", p: 2 }}>
                    <Typography variant="h3" sx={{ mb: 1 }}>
                      {format.icon}
                    </Typography>
                    <Typography
                      variant="h6"
                      gutterBottom
                      color={
                        exportFormat === format.value
                          ? "primary.main"
                          : "text.primary"
                      }
                    >
                      {format.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, minHeight: 40 }}
                    >
                      {format.description}
                    </Typography>
                    <Box>
                      {format.features.map((feature, index) => (
                        <Chip
                          key={index}
                          label={feature}
                          size="small"
                          variant="outlined"
                          sx={{
                            m: 0.25,
                            fontSize: "0.75rem",
                            bgcolor: (theme) =>
                              exportFormat === format.value
                                ? theme.palette.mode === "dark"
                                  ? alpha(theme.palette.primary.main, 0.2)
                                  : "white"
                                : "transparent",
                          }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* PDF 전용 옵션 영역 */}
        {exportFormat === "PDF" && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom color="primary">
              {t("testResult.export.pdf.orientation.label", "📐 PDF 출력 방향")}
            </Typography>
            <ToggleButtonGroup
              value={pdfOrientation}
              exclusive
              onChange={(e, next) => next && setPdfOrientation(next)}
              fullWidth
              size="large"
              sx={{
                bgcolor: (theme) =>
                  theme.palette.mode === "dark" ? "grey.900" : "grey.50",
              }}
            >
              <ToggleButton
                value="portrait"
                sx={{
                  py: 1.5,
                  display: "flex",
                  gap: 1,
                  borderRadius: "8px 0 0 8px",
                }}
              >
                <PortraitIcon />
                {t(
                  "testResult.export.pdf.orientation.portrait",
                  "세로 (Portrait)",
                )}
              </ToggleButton>
              <ToggleButton
                value="landscape"
                sx={{
                  py: 1.5,
                  display: "flex",
                  gap: 1,
                  borderRadius: "0 8px 8px 0",
                }}
              >
                <LandscapeIcon />
                {t(
                  "testResult.export.pdf.orientation.landscape",
                  "가로 (Landscape)",
                )}
              </ToggleButton>
            </ToggleButtonGroup>

            {/* 푸터 브랜딩 문구 입력 필드 */}
            <Typography
              variant="subtitle2"
              sx={{
                mt: 3,
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              {t(
                "testResult.export.footer.prefix.label",
                "푸터 브랜딩 문구 (선택사항)",
              )}
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder={t(
                "testResult.export.footer.prefix.placeholder",
                "회사명 등을 입력하세요 (예: TestCaseCraft)",
              )}
              value={footerPrefix}
              onChange={(e) => setFooterPrefix(e.target.value)}
              helperText={t(
                "testResult.export.footer.prefix.description",
                "리포트 하단에 표시될 브랜딩 문구를 입력하세요.",
              )}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: alpha("#1976d2", 0.02),
                },
              }}
            />
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        {/* 내보내기 정보 요약 */}
        <Box
          sx={{
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "grey.900" : "grey.50",
            p: 2,
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            color="primary"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            {t("testResult.export.section.info", "📋 내보내기 정보")}
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  {t("testResult.export.info.totalRows", "📊 총 데이터 건수:")}
                </Typography>
                <Chip
                  label={t(
                    "testResult.export.info.totalRowsValue",
                    "{count}건",
                  ).replace("{count}", totalRows)}
                  size="small"
                  color="primary"
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Typography variant="body2" color="text.secondary">
                  {t("testResult.export.info.columns", "🔍 표시 컬럼 수:")}
                </Typography>
                <Chip
                  label={t(
                    "testResult.export.info.columnsValue",
                    "{count}개",
                  ).replace("{count}", visibleColumns.length)}
                  size="small"
                  color="secondary"
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" color="text.secondary">
                {t("testResult.export.info.columnsList", "📂 내보낼 컬럼:")}{" "}
                {visibleColumns.map((col) => col.headerName).join(", ")}
              </Typography>
            </Grid>
          </Grid>

          {/* 형식별 안내 메시지 */}
          {exportFormat === "EXCEL" && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {t(
                  "testResult.export.format.excel.alert",
                  "💡 Excel 형식에는 통계 차트와 요약 시트가 별도로 포함됩니다.",
                )}
              </Typography>
            </Alert>
          )}

          {exportFormat === "PDF" && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {t(
                  "testResult.export.format.pdf.alert",
                  "🖨️ PDF는 A4 용지에 최적화되어 인쇄하기 좋습니다.",
                )}
              </Typography>
            </Alert>
          )}

          {exportFormat === "CSV" && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {t(
                  "testResult.export.format.csv.alert",
                  "📈 CSV는 데이터만 포함되며, Excel이나 Google Sheets에서 열어보세요.",
                )}
              </Typography>
            </Alert>
          )}
        </Box>

        {/* 내보내기 진행 상태 */}
        {exporting && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              mt: 3,
              p: 3,
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.primary.main, 0.1)
                  : "primary.light",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "primary.main",
            }}
          >
            <CircularProgress size={24} color="primary" />
            <Typography
              variant="body1"
              color="primary.dark"
              fontWeight="medium"
            >
              {t(
                "testResult.export.progress.message",
                "파일을 생성하고 있습니다... 잠시만 기다려주세요",
              )}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions
        sx={{
          p: 3,
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "grey.900" : "grey.50",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button
          onClick={onClose}
          disabled={exporting}
          size="large"
          sx={{ minWidth: 100 }}
        >
          {t("testResult.export.button.cancel", "취소")}
        </Button>
        <Button
          onClick={handleExportConfirm}
          variant="contained"
          disabled={exporting || totalRows === 0}
          startIcon={
            exporting ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <FileDownloadIcon />
            )
          }
          size="large"
          sx={{
            minWidth: 140,
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: 4,
            },
          }}
        >
          {exporting
            ? t("testResult.export.button.exporting", "생성 중...")
            : t("testResult.export.button.export", "{format} 내보내기").replace(
                "{format}",
                exportFormat,
              )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TestResultExportDialog;
