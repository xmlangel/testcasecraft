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

  const buildExportMatrix = () => {
    const headers = visibleColumns.map(col => col.headerName || col.field);
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

  const exportAsPdf = async (headers, data, fileName) => {
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    await ensureKoreanPdfFont(pdf);
    pdf.setFont('NanumGothic', 'normal');
    pdf.setFontSize(10);

    const margin = 36;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const usableWidth = pageWidth - margin * 2;
    const columnWidths = headers.map(() => usableWidth / headers.length);
    const cellPadding = 6;
    const lineHeight = 14;
    let cursorY = margin;

    const splitCellText = (text, colIndex) => {
      const content = (text === null || text === undefined || text === '') ? '-' : String(text);
      const maxWidth = columnWidths[colIndex] - cellPadding * 2;
      return pdf.splitTextToSize(content, Math.max(maxWidth, 20));
    };

    const drawRow = (cells, isHeader = false) => {
      const linesPerCell = cells.map((cell, idx) => splitCellText(cell, idx));
      const rowHeight = Math.max(...linesPerCell.map(lines => lines.length)) * lineHeight + cellPadding * 2;

      if (cursorY + rowHeight > pageHeight - margin) {
        pdf.addPage();
        pdf.setFont('NanumGothic', 'normal');
        pdf.setFontSize(10);
        cursorY = margin;
      }

      let cursorX = margin;
      cells.forEach((cell, idx) => {
        if (isHeader) {
          pdf.setFillColor(245, 245, 245);
          pdf.setTextColor(0, 0, 0);
          pdf.rect(cursorX, cursorY, columnWidths[idx], rowHeight, 'FD');
          pdf.setFont(undefined, 'bold');
        } else {
          pdf.setFillColor(255, 255, 255);
          pdf.rect(cursorX, cursorY, columnWidths[idx], rowHeight, 'S');
          pdf.setFont(undefined, 'normal');
        }

        const lines = linesPerCell[idx];
        lines.forEach((line, lineIndex) => {
          const textY = cursorY + cellPadding + lineHeight * (lineIndex + 0.8);
          pdf.text(line, cursorX + cellPadding, textY);
        });

        cursorX += columnWidths[idx];
      });

      cursorY += rowHeight;
    };

    drawRow(headers, true);
    data.forEach(row => drawRow(row, false));

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

    switch (exportFormat) {
      case 'EXCEL':
        exportAsExcel(headers, data, `${baseFileName}.xlsx`);
        break;
      case 'CSV':
        exportAsCsv(headers, data, `${baseFileName}.csv`);
        break;
      case 'PDF':
        await exportAsPdf(headers, data, `${baseFileName}.pdf`);
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
