package com.testcase.testcasemanagement.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.io.font.PdfEncodings;
import com.opencsv.CSVWriter;
import com.testcase.testcasemanagement.dto.TestResultFilterDto;
import com.testcase.testcasemanagement.dto.TestResultReportDto;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * ICT-190: 테스트 결과 내보내기 서비스
 * Excel, PDF, CSV 형식으로 테스트 결과 데이터를 내보내는 기능 제공
 */
@Service
public class ExportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    /**
     * ICT-197: 한글 지원 PDF 폰트 생성
     * font-asian 라이브러리의 번들 폰트를 포함하여 한글 폰트를 생성
     */
    private PdfFont createKoreanFont() {
        try {
            // 1순위: iText 번들 한글 폰트 (font-asian 라이브러리)
            try {
                return PdfFontFactory.createFont("STSong-Light", PdfEncodings.IDENTITY_H);
            } catch (Exception e) {
                // 번들 폰트 로드 실패 시 계속
            }
            
            // 2순위: iText 번들 아시아 폰트 대체
            try {
                return PdfFontFactory.createFont("HeiseiKakuGo-W5", PdfEncodings.IDENTITY_H);
            } catch (Exception e) {
                // 번들 폰트 로드 실패 시 계속
            }
            
            // 3순위: 시스템 한글 폰트 - NanumGothic (많은 한국 시스템에서 사용)
            try {
                return PdfFontFactory.createFont("NanumGothic", PdfEncodings.IDENTITY_H);
            } catch (Exception e) {
                // 폰트를 찾을 수 없는 경우 계속
            }
            
            // 4순위: Malgun Gothic (Windows 한글 기본 폰트)
            try {
                return PdfFontFactory.createFont("Malgun Gothic", PdfEncodings.IDENTITY_H);
            } catch (Exception e) {
                // 폰트를 찾을 수 없는 경우 계속
            }
            
            // 5순위: Arial Unicode MS (유니코드 지원)
            try {
                return PdfFontFactory.createFont("Arial Unicode MS", PdfEncodings.IDENTITY_H);
            } catch (Exception e) {
                // 폰트를 찾을 수 없는 경우 계속
            }
            
            // 6순위: Noto Sans CJK (Google Noto 폰트)
            try {
                return PdfFontFactory.createFont("Noto Sans CJK KR", PdfEncodings.IDENTITY_H);
            } catch (Exception e) {
                // 폰트를 찾을 수 없는 경우 계속
            }
            
            // 최후 수단: UTF-8 지원 Helvetica
            try {
                return PdfFontFactory.createFont(StandardFonts.HELVETICA, PdfEncodings.UTF8);
            } catch (Exception e) {
                // UTF-8 실패 시 기본 인코딩으로 폴백
                return PdfFontFactory.createFont(StandardFonts.HELVETICA);
            }
            
        } catch (Exception e) {
            // 모든 폰트 생성 실패 시 기본 폰트 반환
            try {
                return PdfFontFactory.createFont(StandardFonts.HELVETICA);
            } catch (Exception ex) {
                throw new RuntimeException("PDF 폰트 생성 실패: " + ex.getMessage(), ex);
            }
        }
    }

    /**
     * 테스트 결과를 Excel 형식으로 내보내기
     */
    public byte[] exportToExcel(Page<TestResultReportDto> reportData, TestResultFilterDto filter) {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            Sheet sheet = workbook.createSheet("테스트 결과 리포트");
            
            // 헤더 스타일 생성
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setFontHeightInPoints((short) 12);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            
            // 데이터 스타일 생성
            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setWrapText(true);
            
            // 헤더 행 생성
            Row headerRow = sheet.createRow(0);
            String[] headers = getColumnHeaders(filter);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // 데이터 행 생성
            List<TestResultReportDto> content = reportData.getContent();
            for (int i = 0; i < content.size(); i++) {
                Row row = sheet.createRow(i + 1);
                TestResultReportDto result = content.get(i);
                populateExcelRow(row, result, filter, dataStyle);
            }
            
            // 컬럼 너비 자동 조정
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
                // 최대 너비 제한
                if (sheet.getColumnWidth(i) > 20000) {
                    sheet.setColumnWidth(i, 20000);
                }
            }
            
            // 통계 시트 추가 (옵션)
            if (filter.getIncludeStatistics() != null && filter.getIncludeStatistics()) {
                createStatisticsSheet(workbook, reportData);
            }
            
            workbook.write(out);
            return out.toByteArray();
            
        } catch (Exception e) {
            throw new RuntimeException("Excel 파일 생성 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * 테스트 결과를 PDF 형식으로 내보내기
     * ICT-197: 한글 폰트 지원 추가
     */
    public byte[] exportToPdf(Page<TestResultReportDto> reportData, TestResultFilterDto filter) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            PdfWriter writer = new PdfWriter(out);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf);
            
            // ICT-197: 한글 지원 폰트 설정
            PdfFont koreanFont = createKoreanFont();
            
            // 제목 추가
            document.add(new Paragraph("테스트 결과 리포트")
                .setFont(koreanFont)
                .setFontSize(20)
                .setBold());
            
            // 생성 정보 추가
            document.add(new Paragraph("생성일시: " + java.time.LocalDateTime.now().format(DATE_FORMATTER))
                .setFont(koreanFont)
                .setFontSize(10));
            document.add(new Paragraph("총 " + reportData.getTotalElements() + "건의 결과")
                .setFont(koreanFont)
                .setFontSize(10));
            document.add(new Paragraph(" ")); // 공백 줄
            
            // 테이블 생성
            String[] headers = getColumnHeaders(filter);
            Table table = new Table(headers.length);
            
            // 헤더 추가
            for (String header : headers) {
                table.addHeaderCell(new com.itextpdf.layout.element.Cell()
                    .add(new Paragraph(header)
                        .setFont(koreanFont)
                        .setBold()));
            }
            
            // 데이터 행 추가
            List<TestResultReportDto> content = reportData.getContent();
            for (TestResultReportDto result : content) {
                populatePdfRow(table, result, filter, koreanFont);
            }
            
            document.add(table);
            document.close();
            
            return out.toByteArray();
            
        } catch (Exception e) {
            throw new RuntimeException("PDF 파일 생성 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * 테스트 결과를 CSV 형식으로 내보내기
     */
    public byte[] exportToCsv(Page<TestResultReportDto> reportData, TestResultFilterDto filter) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream();
             OutputStreamWriter writer = new OutputStreamWriter(out, "UTF-8");
             CSVWriter csvWriter = new CSVWriter(writer)) {
            
            // BOM 추가 (Excel에서 한글 깨짐 방지)
            out.write(0xEF);
            out.write(0xBB);
            out.write(0xBF);
            
            // 헤더 작성
            String[] headers = getColumnHeaders(filter);
            csvWriter.writeNext(headers);
            
            // 데이터 작성
            List<TestResultReportDto> content = reportData.getContent();
            for (TestResultReportDto result : content) {
                String[] row = populateCsvRow(result, filter);
                csvWriter.writeNext(row);
            }
            
            csvWriter.flush();
            return out.toByteArray();
            
        } catch (Exception e) {
            throw new RuntimeException("CSV 파일 생성 중 오류가 발생했습니다: " + e.getMessage(), e);
        }
    }

    /**
     * 필터 설정에 따른 컬럼 헤더 반환
     */
    private String[] getColumnHeaders(TestResultFilterDto filter) {
        List<String> displayColumns = filter.getDisplayColumns();
        if (displayColumns == null || displayColumns.isEmpty()) {
            return new String[]{"폴더 경로", "테스트케이스명", "결과", "실행일시", "실행자", "비고", "JIRA ID"};
        }
        
        return displayColumns.stream()
            .map(this::getColumnDisplayName)
            .toArray(String[]::new);
    }

    /**
     * 컬럼 필드명을 표시명으로 변환
     */
    private String getColumnDisplayName(String fieldName) {
        switch (fieldName) {
            case "testPlanName": return "테스트플랜명";
            case "testExecutionName": return "테스트실행명";
            case "folderPath": return "폴더 경로";
            case "testCaseName": return "테스트케이스명";
            case "result": return "결과";
            case "executedAt": return "실행일시";
            case "executorName": return "실행자";
            case "notes": return "비고";
            case "jiraIssueKey": return "JIRA ID";
            case "jiraStatus": return "JIRA 상태";
            case "jiraSyncStatus": return "JIRA 동기화";
            case "priority": return "우선순위";
            case "category": return "카테고리";
            default: return fieldName;
        }
    }

    /**
     * Excel 행에 데이터 입력
     */
    private void populateExcelRow(Row row, TestResultReportDto result, TestResultFilterDto filter, CellStyle style) {
        List<String> displayColumns = filter.getDisplayColumns();
        if (displayColumns == null || displayColumns.isEmpty()) {
            displayColumns = List.of("folderPath", "testCaseName", "result", "executedAt", "executorName", "notes", "jiraIssueKey");
        }
        
        int cellIndex = 0;
        for (String column : displayColumns) {
            Cell cell = row.createCell(cellIndex++);
            cell.setCellStyle(style);
            
            String value = getFieldValue(result, column);
            cell.setCellValue(value != null ? value : "");
        }
    }

    /**
     * PDF 테이블에 행 추가
     * ICT-197: 한글 폰트 지원 추가
     */
    private void populatePdfRow(Table table, TestResultReportDto result, TestResultFilterDto filter, PdfFont font) {
        List<String> displayColumns = filter.getDisplayColumns();
        if (displayColumns == null || displayColumns.isEmpty()) {
            displayColumns = List.of("folderPath", "testCaseName", "result", "executedAt", "executorName", "notes", "jiraIssueKey");
        }
        
        for (String column : displayColumns) {
            String value = getFieldValue(result, column);
            table.addCell(new com.itextpdf.layout.element.Cell()
                .add(new Paragraph(value != null ? value : "")
                    .setFont(font)));
        }
    }

    /**
     * CSV 행 데이터 생성
     */
    private String[] populateCsvRow(TestResultReportDto result, TestResultFilterDto filter) {
        List<String> displayColumns = filter.getDisplayColumns();
        if (displayColumns == null || displayColumns.isEmpty()) {
            displayColumns = List.of("folderPath", "testCaseName", "result", "executedAt", "executorName", "notes", "jiraIssueKey");
        }
        
        return displayColumns.stream()
            .map(column -> getFieldValue(result, column))
            .map(value -> value != null ? value : "")
            .toArray(String[]::new);
    }

    /**
     * 필드명에 따른 값 반환
     */
    private String getFieldValue(TestResultReportDto result, String fieldName) {
        switch (fieldName) {
            case "testPlanName": return result.getTestPlanName();
            case "testExecutionName": return result.getTestExecutionName();
            case "folderPath": return result.getFolderPath();
            case "testCaseName": return result.getTestCaseName();
            case "result": return getResultDisplayName(result.getResult());
            case "executedAt": return result.getExecutedAt() != null ? result.getExecutedAt().format(DATE_FORMATTER) : null;
            case "executorName": return result.getExecutorName();
            case "notes": return result.getNotes();
            case "jiraIssueKey": return result.getJiraIssueKey();
            case "jiraStatus": return result.getJiraStatus();
            case "jiraSyncStatus": return result.getJiraSyncStatus();
            case "priority": return result.getPriority();
            case "category": return result.getCategory();
            default: return null;
        }
    }

    /**
     * 결과 코드를 한글 표시명으로 변환
     */
    private String getResultDisplayName(String result) {
        if (result == null) return "미실행";
        switch (result.toUpperCase()) {
            case "PASS": return "성공";
            case "FAIL": return "실패";
            case "BLOCKED": return "차단됨";
            case "NOT_RUN": return "미실행";
            default: return result;
        }
    }

    /**
     * 통계 시트 생성 (Excel용)
     */
    private void createStatisticsSheet(Workbook workbook, Page<TestResultReportDto> reportData) {
        Sheet statsSheet = workbook.createSheet("통계");
        
        // 통계 계산
        List<TestResultReportDto> content = reportData.getContent();
        long totalCount = content.size();
        long passCount = content.stream().mapToLong(r -> "PASS".equals(r.getResult()) ? 1 : 0).sum();
        long failCount = content.stream().mapToLong(r -> "FAIL".equals(r.getResult()) ? 1 : 0).sum();
        long blockedCount = content.stream().mapToLong(r -> "BLOCKED".equals(r.getResult()) ? 1 : 0).sum();
        long notRunCount = content.stream().mapToLong(r -> "NOT_RUN".equals(r.getResult()) ? 1 : 0).sum();
        
        // 통계 데이터 작성
        Row headerRow = statsSheet.createRow(0);
        headerRow.createCell(0).setCellValue("항목");
        headerRow.createCell(1).setCellValue("수량");
        headerRow.createCell(2).setCellValue("비율 (%)");
        
        addStatRow(statsSheet, 1, "전체", totalCount, 100.0);
        addStatRow(statsSheet, 2, "성공", passCount, totalCount > 0 ? (passCount * 100.0 / totalCount) : 0);
        addStatRow(statsSheet, 3, "실패", failCount, totalCount > 0 ? (failCount * 100.0 / totalCount) : 0);
        addStatRow(statsSheet, 4, "차단됨", blockedCount, totalCount > 0 ? (blockedCount * 100.0 / totalCount) : 0);
        addStatRow(statsSheet, 5, "미실행", notRunCount, totalCount > 0 ? (notRunCount * 100.0 / totalCount) : 0);
        
        // 컬럼 너비 조정
        for (int i = 0; i < 3; i++) {
            statsSheet.autoSizeColumn(i);
        }
    }

    /**
     * 통계 행 추가
     */
    private void addStatRow(Sheet sheet, int rowIndex, String label, long count, double percentage) {
        Row row = sheet.createRow(rowIndex);
        row.createCell(0).setCellValue(label);
        row.createCell(1).setCellValue(count);
        row.createCell(2).setCellValue(String.format("%.1f", percentage));
    }
}