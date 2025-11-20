// src/components/TestCase/TestResultExportDialog.jsx
// ICT-194 Phase 2: TestResultDetailTable 컴포넌트 분할 - 내보내기 다이얼로그 분리

import React, { useMemo, useState } from 'react';
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
  Divider
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import { format as formatDate } from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { addNanumGothicToJsPDF, setupKoreanFontFallback } from '../../assets/fonts/nanumGothicFont.js';
import { useAppContext } from '../../context/AppContext.jsx';
import { useI18n } from '../../context/I18nContext.jsx';
import { API_ENDPOINTS, buildUrl } from '../../utils/apiConstants.js';
import { getResultLabel } from '../../utils/testResultConstants.js';

// 숫자 포맷터 (천단위 구분)
const numberFormatter = new Intl.NumberFormat('ko-KR');
const formatCountValue = (value) => numberFormatter.format(value ?? 0);

// 퍼센트 문자열 포맷
const formatPercentageValue = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '0.0%';
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
      generatedAt: now
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
    periodEnd: null
  };

  rows.forEach((row) => {
    const result = (row?.result || '').toUpperCase();
    switch (result) {
      case 'PASS':
        summary.pass += 1;
        break;
      case 'FAIL':
        summary.fail += 1;
        break;
      case 'BLOCKED':
        summary.blocked += 1;
        break;
      case 'NOT_RUN':
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
  const toRate = (value, base) => (base > 0 ? Number(((value / base) * 100).toFixed(1)) : 0);

  return {
    ...summary,
    executedCount,
    executionRate: toRate(executedCount, summary.total),
    successRate: toRate(summary.pass, executedCount),
    passRate: toRate(summary.pass, summary.total),
    failRate: toRate(summary.fail, summary.total),
    blockedRate: toRate(summary.blocked, summary.total),
    notRunRate: toRate(summary.notRun, summary.total),
    generatedAt: new Date()
  };
};

/**
 * 테스트 결과 내보내기 다이얼로그 컴포넌트
 * ICT-190 기능을 별도 컴포넌트로 분리하여 재사용성 향상
 */
const TestResultExportDialog = ({
  open,
  onClose,
  projectId,
  visibleColumns = [],
  rows = [],
  totalRows = 0,
  activeProject = null
}) => {
  const { api } = useAppContext();
  const { t } = useI18n();
  const [exportFormat, setExportFormat] = useState('EXCEL');
  const [exporting, setExporting] = useState(false);
  const hasClientRows = useMemo(
    () => Array.isArray(rows) && rows.length > 0 && visibleColumns.length > 0,
    [rows, visibleColumns]
  );
  const statisticsSummary = useMemo(() => computeStatisticsSummary(rows), [rows]);

  // 내보내기 형식 옵션
  const exportFormats = [
    {
      value: 'EXCEL',
      title: t('testResult.export.format.excel.title', 'Excel (.xlsx)'),
      description: t('testResult.export.format.excel.description', '서식과 차트 포함, 업무용 보고서에 최적'),
      icon: '📊',
      features: [
        t('testResult.export.format.excel.feature1', '통계 차트 포함'),
        t('testResult.export.format.excel.feature2', '서식 유지'),
        t('testResult.export.format.excel.feature3', '필터링 가능')
      ]
    },
    {
      value: 'PDF',
      title: t('testResult.export.format.pdf.title', 'PDF (.pdf)'),
      description: t('testResult.export.format.pdf.description', '인쇄 및 공유용, 레이아웃 고정'),
      icon: '📋',
      features: [
        t('testResult.export.format.pdf.feature1', '인쇄 최적화'),
        t('testResult.export.format.pdf.feature2', '레이아웃 고정'),
        t('testResult.export.format.pdf.feature3', '범용 호환성')
      ]
    },
    {
      value: 'CSV',
      title: t('testResult.export.format.csv.title', 'CSV (.csv)'),
      description: t('testResult.export.format.csv.description', '데이터 분석용, 가벼운 파일 크기'),
      icon: '📈',
      features: [
        t('testResult.export.format.csv.feature1', '데이터 분석 최적'),
        t('testResult.export.format.csv.feature2', '가벼운 용량'),
        t('testResult.export.format.csv.feature3', '호환성 우수')
      ]
    }
  ];

  const safeString = (value) => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number') {
      return String(value);
    }
    if (typeof value === 'boolean') {
      return value ? t('common.boolean.yes', '예') : t('common.boolean.no', '아니오');
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (value instanceof Date) {
      return formatDate(value, 'yyyy-MM-dd HH:mm');
    }
    return JSON.stringify(value);
  };

  const formatSteps = (steps = []) => {
    if (!steps.length) return '-';
    return steps
      .map((step, index) => {
        const number = step.stepNumber || index + 1;
        const description = step.description ? ` ${step.description}` : '';
        const expected = step.expectedResult ? ` (${t('testResult.steps.expectedResult', '예상결과')}: ${step.expectedResult})` : '';
        return `${number}.${description}${expected}`;
      })
      .join('\n');
  };

  const formatExecutionType = (value) => {
    if (!value) return '-';
    const normalized = value.toLowerCase();
    return t(`testcase.executionType.${normalized}`, value);
  };

  const formatPriority = (value) => {
    if (!value) return '-';
    const normalized = value.toLowerCase();
    if (normalized === 'high') return t('testCase.priority.high', '높음');
    if (normalized === 'medium') return t('testCase.priority.medium', '보통');
    if (normalized === 'low') return t('testCase.priority.low', '낮음');
    return value;
  };

  const formatCellValue = (row, column) => {
    const value = row?.[column.field];
    switch (column.field) {
      case 'result':
        return getResultLabel(value) || '-';
      case 'executedDate':
        if (!value) return '-';
        return formatDate(value instanceof Date ? value : new Date(value), 'yyyy-MM-dd HH:mm');
      case 'steps':
        return formatSteps(value || []);
      case 'tags':
        return (value || []).length ? value.join(', ') : '-';
      case 'linkedDocuments':
        return (value || []).length ? value.join(', ') : '-';
      case 'isAutomated':
        if (value === null || value === undefined) return '-';
        return value ? t('testcase.executionType.automation', 'Automation') : t('testcase.executionType.manual', 'Manual');
      case 'executionType':
        return formatExecutionType(value);
      case 'priority':
        return formatPriority(value);
      case 'attachments':
        return row?.testResultId ? t('testResult.export.attachmentsAvailable', '첨부 있음') : '-';
      case 'notes':
      case 'description':
      case 'preCondition':
      case 'postCondition':
      case 'expectedResults':
        return value ? value : '-';
      default:
        return safeString(value);
    }
  };

  // 컬럼 필드명을 영어 헤더로 매핑
  const getEnglishHeader = (field) => {
    const headerMap = {
      folder: 'Folder',
      displayId: 'Display ID',
      testCase: 'Test Case',
      description: 'Description',
      result: 'Result',
      executedDate: 'Executed Date',
      executor: 'Executor',
      notes: 'Notes',
      attachments: 'Attachments',
      jiraId: 'JIRA ID',
      jiraStatus: 'JIRA Status',
      preCondition: 'Pre-condition',
      postCondition: 'Post-condition',
      expectedResults: 'Expected Results',
      steps: 'Steps',
      isAutomated: 'Automated',
      executionType: 'Execution Type',
      testTechnique: 'Test Technique',
      priority: 'Priority',
      tags: 'Tags',
      linkedDocuments: 'Linked Documents'
    };
    return headerMap[field] || field;
  };

  const buildExportMatrix = () => {
    const headers = visibleColumns.map(col => getEnglishHeader(col.field));
    const data = rows.map(row =>
      visibleColumns.map(col => formatCellValue(row, col))
    );
    return { headers, data };
  };

  const downloadBlob = (blob, fileName) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'TestResults');
    XLSX.writeFile(workbook, fileName);
  };

  const exportAsCsv = (headers, data, fileName) => {
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const csvContent = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, fileName);
  };

  const ensureKoreanPdfFont = async (doc) => {
    try {
      const added = await addNanumGothicToJsPDF(doc);
      if (!added) {
        setupKoreanFontFallback(doc);
      }
    } catch (error) {
      console.warn('⚠️ 나눔고딕 폰트 설정 중 오류가 발생했습니다.', error);
      setupKoreanFontFallback(doc);
    }
  };

  const exportAsPdf = async (headers, data, fileName, summaryData = null) => {
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    await ensureKoreanPdfFont(pdf);
    pdf.setFont('NanumGothic', 'normal');
    pdf.setFontSize(10);

    const margin = 36;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const usableWidth = pageWidth - margin * 2;
    const lineHeight = 14;
    let cursorY = margin;
    const summary = summaryData || null;

    const ensureSpace = (requiredHeight) => {
      if (cursorY + requiredHeight > pageHeight - margin) {
        pdf.addPage();
        pdf.setFont('NanumGothic', 'normal');
        pdf.setFontSize(10);
        cursorY = margin;
      }
    };

    const drawRoundedRect = (x, y, width, height, radius, style) => {
      if (typeof pdf.roundedRect === 'function') {
        pdf.roundedRect(x, y, width, height, radius, radius, style);
      } else {
        pdf.rect(x, y, width, height, style);
      }
    };

    const drawHeaderSection = () => {
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(18);
      pdf.text(t('testResult.export.pdf.title', '테스트 결과 고급 리포트'), margin, cursorY);
      cursorY += 20;

      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      const projectLabel = `${t('testResult.export.pdf.project', '프로젝트')}: ${activeProject?.name || t('testResult.export.pdf.project.unknown', '미지정 프로젝트')}`;
      const generatedAtLabel = `${t('testResult.export.pdf.generatedAt', '생성일시')}: ${formatDate(new Date(), 'yyyy-MM-dd HH:mm')}`;
      pdf.text(projectLabel, margin, cursorY);
      pdf.text(generatedAtLabel, margin + usableWidth / 2, cursorY);
      cursorY += 16;
    };

    const drawSummarySection = () => {
      if (!summary) {
        return;
      }

      const cardsHeight = 64;
      const breakdownHeight = 48;
      const totalSummaryHeight = cardsHeight + breakdownHeight + 36;
      ensureSpace(totalSummaryHeight);

      const cardGap = 12;
      const cardWidth = (usableWidth - cardGap * 3) / 4;
      const periodText = (() => {
        if (summary.periodStart && summary.periodEnd) {
          return `${formatDate(summary.periodStart, 'yyyy-MM-dd')} ~ ${formatDate(summary.periodEnd, 'yyyy-MM-dd')}`;
        }
        if (summary.periodStart || summary.periodEnd) {
          const point = summary.periodStart || summary.periodEnd;
          return formatDate(point, 'yyyy-MM-dd');
        }
        return t('testResult.export.pdf.summary.noPeriod', '기간 정보 없음');
      })();

      const cards = [
        {
          label: t('testResult.export.pdf.summary.total', '총 테스트'),
          value: `${formatCountValue(summary.total)}${t('testResult.export.pdf.summary.unit', '건')}`,
          subValue: `${t('testResult.export.pdf.summary.period', '기간')}: ${periodText}`,
          bg: [235, 248, 255]
        },
        {
          label: t('testResult.export.pdf.summary.executionRate', '실행률'),
          value: formatPercentageValue(summary.executionRate),
          subValue: t('testResult.export.pdf.summary.executed', '실행 {count}건')
            .replace('{count}', formatCountValue(summary.executedCount)),
          bg: [232, 247, 238]
        },
        {
          label: t('testResult.export.pdf.summary.successRate', '성공률'),
          value: formatPercentageValue(summary.successRate),
          subValue: t('testResult.export.pdf.summary.passCount', '성공 {count}건')
            .replace('{count}', formatCountValue(summary.pass)),
          bg: [255, 248, 235]
        },
        {
          label: t('testResult.export.pdf.summary.jiraLinked', 'JIRA 연동'),
          value: `${formatCountValue(summary.jiraLinked)}${t('testResult.export.pdf.summary.unit', '건')}`,
          subValue: t('testResult.export.pdf.summary.jiraHint', '링크된 케이스 수'),
          bg: [255, 243, 246]
        }
      ];

      let cardX = margin;
      cards.forEach((card) => {
        pdf.setFillColor(card.bg[0], card.bg[1], card.bg[2]);
        drawRoundedRect(cardX, cursorY, cardWidth, cardsHeight, 6, 'F');
        pdf.setTextColor(90, 90, 90);
        pdf.setFontSize(10);
        pdf.text(card.label, cardX + 10, cursorY + 18);
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(16);
        pdf.text(card.value, cardX + 10, cursorY + 38);
        if (card.subValue) {
          pdf.setFontSize(9);
          pdf.setTextColor(110, 110, 110);
          pdf.text(card.subValue, cardX + 10, cursorY + 52, {
            maxWidth: cardWidth - 20
          });
        }
        cardX += cardWidth + cardGap;
      });
      cursorY += cardsHeight + 16;

      const breakdowns = [
        {
          label: t('testResult.status.pass', '성공'),
          count: summary.pass,
          rate: summary.passRate,
          bg: [223, 240, 216]
        },
        {
          label: t('testResult.status.fail', '실패'),
          count: summary.fail,
          rate: summary.failRate,
          bg: [255, 235, 236]
        },
        {
          label: t('testResult.status.blocked', '차단됨'),
          count: summary.blocked,
          rate: summary.blockedRate,
          bg: [255, 243, 224]
        },
        {
          label: t('testResult.status.notRun', '미실행'),
          count: summary.notRun,
          rate: summary.notRunRate,
          bg: [240, 244, 247]
        }
      ];

      cardX = margin;
      breakdowns.forEach((item) => {
        pdf.setFillColor(item.bg[0], item.bg[1], item.bg[2]);
        drawRoundedRect(cardX, cursorY, cardWidth, breakdownHeight, 4, 'F');
        pdf.setTextColor(90, 90, 90);
        pdf.setFontSize(10);
        pdf.text(item.label, cardX + 10, cursorY + 16);
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(12);
        pdf.text(
          `${formatCountValue(item.count)} (${formatPercentageValue(item.rate)})`,
          cardX + 10,
          cursorY + 34
        );
        cardX += cardWidth + cardGap;
      });
      cursorY += breakdownHeight + 8;
    };

    const listPadding = 12;
    const columnGap = 18;
    const rowGap = 18;
    const columns = 2;
    const cardWidth = (usableWidth - columnGap * (columns - 1)) / columns;

    const drawListEntries = () => {
      if (!Array.isArray(data) || data.length === 0) {
        pdf.setFontSize(10);
        pdf.text(t('testResult.export.pdf.noData', '표시할 테스트 결과가 없습니다.'), margin, cursorY + 12);
        cursorY += 24;
        return;
      }

      let currentColumn = 0;
      let rowMaxHeight = 0;

      data.forEach((rowValues, index) => {
        const labelLines = headers.map((header, colIdx) => {
          const rawValue = rowValues[colIdx];
          const valueText = (rawValue === null || rawValue === undefined || rawValue === '')
            ? '-'
            : String(rawValue);
          const fullLine = `${header}: ${valueText}`;
          return pdf.splitTextToSize(fullLine, cardWidth - listPadding * 2);
        });

        const contentLinesCount = labelLines.reduce((acc, lineArr) => acc + lineArr.length, 0);
        const blockHeight = (contentLinesCount * lineHeight) + (labelLines.length * 4) + listPadding * 2 + 20;

        if (cursorY + blockHeight > pageHeight - margin) {
          pdf.addPage();
          pdf.setFont('NanumGothic', 'normal');
          pdf.setFontSize(10);
          cursorY = margin;
          currentColumn = 0;
          rowMaxHeight = 0;
        }

        const cardX = margin + currentColumn * (cardWidth + columnGap);
        const cardY = cursorY;

        pdf.setFillColor(249, 249, 249);
        drawRoundedRect(cardX, cardY, cardWidth, blockHeight, 6, 'F');
        pdf.setDrawColor(230, 230, 230);
        pdf.rect(cardX, cardY, cardWidth, blockHeight, 'S');

        pdf.setTextColor(51, 51, 51);
        pdf.setFontSize(11);
        pdf.text(
          t('testResult.export.pdf.list.itemTitle', '테스트 결과 #{index}')
            .replace('{index}', String(index + 1)),
          cardX + listPadding,
          cardY + listPadding + 6
        );

        let lineY = cardY + listPadding + 22;
        pdf.setFontSize(10);
        labelLines.forEach((lineArr) => {
          lineArr.forEach((line) => {
            pdf.text(line, cardX + listPadding, lineY);
            lineY += lineHeight;
          });
          lineY += 4;
        });

        rowMaxHeight = Math.max(rowMaxHeight, blockHeight);
        currentColumn += 1;

        if (currentColumn >= columns) {
          cursorY += rowMaxHeight + rowGap;
          currentColumn = 0;
          rowMaxHeight = 0;
        }
      });

      if (currentColumn !== 0) {
        cursorY += rowMaxHeight + rowGap;
      }
    };

    drawHeaderSection();
    drawSummarySection();

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.text(t('testResult.export.pdf.detailTitle', '상세 테스트 결과'), margin, cursorY + 12);
    cursorY += 20;

    drawListEntries();

    pdf.save(fileName);
  };

  const handleClientSideExport = async () => {
    const { headers, data } = buildExportMatrix();

    if (!data.length) {
      alert(t('testResult.export.error.noData', '내보내기할 데이터가 없습니다.'));
      return;
    }

    const timestamp = formatDate(new Date(), 'yyyyMMdd_HHmm');
    const baseFileName = `테스트결과_${activeProject?.name || 'export'}_${timestamp}`;
    const summaryForExport = statisticsSummary || computeStatisticsSummary(rows);

    switch (exportFormat) {
      case 'EXCEL':
        exportAsExcel(headers, data, `${baseFileName}.xlsx`);
        break;
      case 'CSV':
        exportAsCsv(headers, data, `${baseFileName}.csv`);
        break;
      case 'PDF':
        await exportAsPdf(headers, data, `${baseFileName}.pdf`, summaryForExport);
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
      alert(t('testResult.export.error.noProject', '프로젝트가 선택되지 않았습니다.'));
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
      const displayColumns = visibleColumns.map(col => {
        switch (col.field) {
          case 'folder': return 'folderPath';
          case 'testCase': return 'testCaseName';
          case 'result': return 'result';
          case 'executedDate': return 'executedAt';
          case 'executor': return 'executorName';
          case 'notes': return 'notes';
          case 'jiraId': return 'jiraIssueKey';
          case 'jiraStatus': return 'jiraStatus';
          // ICT-277: 새로 추가된 컬럼들 매핑 추가
          case 'preCondition': return 'preCondition';
          case 'expectedResults': return 'expectedResults';
          case 'steps': return 'steps';
          default: return col.field;
        }
      });

      // 내보내기 필터 생성
      const exportFilter = {
        projectId: projectId,
        exportFormat: exportFormat,
        displayColumns: displayColumns,
        includeStatistics: true,
        page: 0,
        size: 10000 // 최대 10,000건으로 제한
      };

      // API 호출
      const response = await api(buildUrl(API_ENDPOINTS.TEST_RESULTS.EXPORT), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(exportFilter)
      });

      if (!response.ok) {
        throw new Error(t('testResult.export.error.response', '내보내기 실패: {status} {statusText}')
          .replace('{status}', response.status)
          .replace('{statusText}', response.statusText));
      }

      // 파일 다운로드
      const blob = await response.blob();
      const fileExtension = exportFormat.toLowerCase() === 'excel' ? 'xlsx' : exportFormat.toLowerCase();
      const fileName = `테스트결과_${activeProject?.name || 'export'}_${formatDate(new Date(), 'yyyyMMdd_HHmm')}.${fileExtension}`;
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      onClose();
      
    } catch (error) {
      console.error('내보내기 오류:', error);
      alert(t('testResult.export.error.failed', '파일 내보내기 중 오류가 발생했습니다: {message}')
        .replace('{message}', error.message));
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
      PaperProps={{
        sx: { borderRadius: 2, boxShadow: 3 }
      }}
    >
      <DialogTitle sx={{
        bgcolor: 'primary.main',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <FileDownloadIcon />
        {t('testResult.export.dialog.title', '테스트 결과 내보내기')}
      </DialogTitle>
      
      <DialogContent sx={{ pt: 3 }}>
        <Box sx={{ mb: 3 }}>
          {/* 파일 형식 선택 */}
          <Typography variant="h6" gutterBottom color="primary">
            {t('testResult.export.section.format', '📄 내보내기 형식 선택')}
          </Typography>
          <Grid container spacing={2}>
            {exportFormats.map((format) => (
              <Grid item xs={12} md={4} key={format.value}>
                <Card 
                  variant={exportFormat === format.value ? "outlined" : "elevation"}
                  sx={{ 
                    cursor: 'pointer', 
                    border: exportFormat === format.value ? '2px solid' : '1px solid',
                    borderColor: exportFormat === format.value ? 'primary.main' : 'divider',
                    bgcolor: exportFormat === format.value ? 'primary.light' : 'background.paper',
                    '&:hover': { 
                      boxShadow: 4,
                      transform: 'translateY(-2px)',
                      transition: 'all 0.2s ease-in-out'
                    },
                    transition: 'all 0.2s ease-in-out'
                  }}
                  onClick={() => setExportFormat(format.value)}
                >
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h3" sx={{ mb: 1 }}>
                      {format.icon}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      gutterBottom 
                      color={exportFormat === format.value ? 'primary.dark' : 'text.primary'}
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
                            fontSize: '0.75rem',
                            bgcolor: exportFormat === format.value ? 'white' : 'transparent'
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

        <Divider sx={{ my: 3 }} />

        {/* 내보내기 정보 요약 */}
        <Box sx={{
          bgcolor: 'grey.50',
          p: 2,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'grey.200'
        }}>
          <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {t('testResult.export.section.info', '📋 내보내기 정보')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('testResult.export.info.totalRows', '📊 총 데이터 건수:')}
                </Typography>
                <Chip label={t('testResult.export.info.totalRowsValue', '{count}건').replace('{count}', totalRows)} size="small" color="primary" />
              </Box>
            </Grid>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {t('testResult.export.info.columns', '🔍 표시 컬럼 수:')}
                </Typography>
                <Chip label={t('testResult.export.info.columnsValue', '{count}개').replace('{count}', visibleColumns.length)} size="small" color="secondary" />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                {t('testResult.export.info.columnsList', '📂 내보낼 컬럼:')} {visibleColumns.map(col => col.headerName).join(', ')}
              </Typography>
            </Grid>
          </Grid>

          {/* 형식별 안내 메시지 */}
          {exportFormat === 'EXCEL' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {t('testResult.export.format.excel.alert', '💡 Excel 형식에는 통계 차트와 요약 시트가 별도로 포함됩니다.')}
              </Typography>
            </Alert>
          )}

          {exportFormat === 'PDF' && (
            <Alert severity="success" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {t('testResult.export.format.pdf.alert', '🖨️ PDF는 A4 용지에 최적화되어 인쇄하기 좋습니다.')}
              </Typography>
            </Alert>
          )}

          {exportFormat === 'CSV' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                {t('testResult.export.format.csv.alert', '📈 CSV는 데이터만 포함되며, Excel이나 Google Sheets에서 열어보세요.')}
              </Typography>
            </Alert>
          )}
        </Box>

        {/* 내보내기 진행 상태 */}
        {exporting && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            mt: 3,
            p: 3,
            bgcolor: 'primary.light',
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'primary.main'
          }}>
            <CircularProgress size={24} color="primary" />
            <Typography variant="body1" color="primary.dark" fontWeight="medium">
              {t('testResult.export.progress.message', '파일을 생성하고 있습니다... 잠시만 기다려주세요')}
            </Typography>
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
        <Button
          onClick={onClose}
          disabled={exporting}
          size="large"
          sx={{ minWidth: 100 }}
        >
          {t('testResult.export.button.cancel', '취소')}
        </Button>
        <Button
          onClick={handleExportConfirm}
          variant="contained"
          disabled={exporting || totalRows === 0}
          startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <FileDownloadIcon />}
          size="large"
          sx={{
            minWidth: 140,
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: 4
            }
          }}
        >
          {exporting
            ? t('testResult.export.button.exporting', '생성 중...')
            : t('testResult.export.button.export', '{format} 내보내기').replace('{format}', exportFormat)
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TestResultExportDialog;
