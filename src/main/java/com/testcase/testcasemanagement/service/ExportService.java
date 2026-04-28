package com.testcase.testcasemanagement.service;

import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.opencsv.CSVWriter;
import com.testcase.testcasemanagement.dto.TestResultFilterDto;
import com.testcase.testcasemanagement.dto.TestResultReportDto;
import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.time.format.DateTimeFormatter;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

/** 테스트 결과 내보내기 서비스 Excel, PDF, CSV 형식으로 테스트 결과 데이터를 내보내는 기능 제공 */
@Slf4j
@Service
public class ExportService {

  private static final DateTimeFormatter DATE_FORMATTER =
      DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

  private static final long FONT_CACHE_TTL_MS = 300000; // 5분 TTL
  private static final int EXCEL_MAX_COLUMN_WIDTH = 20000;
  private static final String DEFAULT_FONT_NAME = StandardFonts.HELVETICA;

  private static final List<String> DEFAULT_COLUMNS =
      List.of(
          "folderPath",
          "testCaseName",
          "result",
          "executedAt",
          "executorName",
          "notes",
          "jiraIssueKey");

  private static final Map<String, String> COLUMN_DISPLAY_NAMES;

  static {
    Map<String, String> map = new HashMap<>();
    map.put("testPlanName", "테스트플랜명");
    map.put("testExecutionName", "테스트실행명");
    map.put("folderPath", "폴더 경로");
    map.put("testCaseName", "테스트케이스명");
    map.put("result", "결과");
    map.put("executedAt", "실행일시");
    map.put("executorName", "실행자");
    map.put("notes", "비고");
    map.put("jiraIssueKey", "JIRA ID");
    map.put("jiraStatus", "JIRA 상태");
    map.put("jiraSyncStatus", "JIRA 동기화");
    map.put("priority", "우선순위");
    map.put("category", "카테고리");
    map.put("preCondition", "사전설정");
    map.put("expectedResults", "전체 예상결과");
    map.put("steps", "스텝 정보");
    COLUMN_DISPLAY_NAMES = Collections.unmodifiableMap(map);
  }

  private static final Map<String, String> RESULT_DISPLAY_NAMES =
      Map.of(
          "PASS", "성공",
          "FAIL", "실패",
          "BLOCKED", "차단됨",
          "NOT_RUN", "미실행");

  private static String cachedFontName = null;
  private static String cachedFontPath = null;
  private static long fontCacheTimestamp = 0;

  /** 개선된 한글 지원 PDF 폰트 생성 (캐싱 메커니즘 포함) 번들 폰트, 시스템 폰트 경로, 검증 로직을 통한 강화된 한글 폰트 지원 */
  private PdfFont createKoreanFont() {
    // 캐시된 폰트 정보가 유효한지 확인
    long currentTime = System.currentTimeMillis();
    if (cachedFontName != null && (currentTime - fontCacheTimestamp) < FONT_CACHE_TTL_MS) {

      try {
        log.info(
            "✅ 캐시된 폰트 정보 사용 - {} (캐시 유효시간: {}초 남음)",
            cachedFontName,
            ((FONT_CACHE_TTL_MS - (currentTime - fontCacheTimestamp)) / 1000));

        // 캐시된 정보로 새로운 PdfFont 객체 생성 (문서별로 독립적)
        if (cachedFontPath != null) {
          // 프로젝트 번들 폰트인 경우 리소스에서 로드
          if (cachedFontPath.startsWith("/fonts/")) {
            java.io.InputStream fontStream = this.getClass().getResourceAsStream(cachedFontPath);
            byte[] fontBytes = fontStream.readAllBytes();
            fontStream.close();
            return PdfFontFactory.createFont(fontBytes, PdfEncodings.IDENTITY_H);
          } else {
            // 시스템 폰트 경로
            return PdfFontFactory.createFont(cachedFontPath, PdfEncodings.IDENTITY_H);
          }
        } else {
          // 폰트명으로 로드
          return PdfFontFactory.createFont(cachedFontName, PdfEncodings.IDENTITY_H);
        }
      } catch (Exception e) {
        log.warn("⚠️ 캐시된 폰트 정보로 폰트 생성 실패, 재탐색 진행");
        // 캐시 무효화
        cachedFontName = null;
        cachedFontPath = null;
      }
    }

    log.info("🔄 폰트 캐시 만료/없음/실패, 새로 탐색 중...");
    String selectedFont = "알 수 없음";

    try {
      // 1단계: 프로젝트 번들 폰트 (최우선)
      selectedFont = tryProjectBundleFonts();
      if (selectedFont != null) {
        log.info("✅ 프로젝트 번들 폰트 사용 - {}", selectedFont);

        // 리소스에서 폰트 바이트 배열 로드하여 PdfFont 생성
        java.io.InputStream fontStream = this.getClass().getResourceAsStream(selectedFont);
        byte[] fontBytes = fontStream.readAllBytes();
        fontStream.close();
        PdfFont font = PdfFontFactory.createFont(fontBytes, PdfEncodings.IDENTITY_H);

        // 폰트 정보 캐싱 (프로젝트 번들 폰트 경로)
        cachedFontName = selectedFont;
        cachedFontPath = selectedFont; // 리소스 경로가 식별자 역할
        fontCacheTimestamp = System.currentTimeMillis();
        log.info("💾 프로젝트 번들 폰트 정보 캐시 저장 완료 - {}", selectedFont);

        return font;
      }

      // 2단계: font-asian 라이브러리 번들 폰트
      selectedFont = tryLibraryBundleFonts();
      if (selectedFont != null) {
        log.info("✅ 라이브러리 번들 폰트 사용 - {}", selectedFont);
        PdfFont font = PdfFontFactory.createFont(selectedFont, PdfEncodings.IDENTITY_H);

        // 폰트 정보 캐싱 (경로 없음, 이름만)
        cachedFontName = selectedFont;
        cachedFontPath = null;
        fontCacheTimestamp = System.currentTimeMillis();
        log.info("💾 라이브러리 번들 폰트 정보 캐시 저장 완료 - {}", selectedFont);

        return font;
      }

      // 3단계: 시스템 폰트 경로 기반 접근
      selectedFont = trySystemFontPaths();
      if (selectedFont != null) {
        log.info("✅ 시스템 폰트 사용 - {}", selectedFont);
        PdfFont font = PdfFontFactory.createFont(selectedFont, PdfEncodings.IDENTITY_H);

        // 폰트 정보 캐싱 (경로 포함)
        cachedFontName = selectedFont;
        cachedFontPath = selectedFont; // 경로가 폰트명 역할
        fontCacheTimestamp = System.currentTimeMillis();
        log.info("💾 시스템 폰트 정보 캐시 저장 완료 - {}", selectedFont);

        return font;
      }

      // 4단계: 시스템 폰트명 기반 접근 (기존 방식)
      selectedFont = trySystemFontNames();
      if (selectedFont != null) {
        log.info("✅ 시스템 폰트명 사용 - {}", selectedFont);
        PdfFont font = PdfFontFactory.createFont(selectedFont, PdfEncodings.IDENTITY_H);

        // 폰트 정보 캐싱 (경로 없음, 이름만)
        cachedFontName = selectedFont;
        cachedFontPath = null;
        fontCacheTimestamp = System.currentTimeMillis();
        log.info("💾 시스템 폰트명 정보 캐시 저장 완료 - {}", selectedFont);

        return font;
      }

      // 4단계: UTF-8 지원 기본 폰트 (캐싱하지 않음 - 폴백이므로)
      log.warn("⚠️ UTF-8 Helvetica 폴백 사용 (한글 지원 제한적, 캐싱 안함)");
      return PdfFontFactory.createFont(DEFAULT_FONT_NAME, PdfEncodings.UTF8);

    } catch (Exception e) {
      log.error("❌ 모든 폰트 로드 실패, 기본 폰트 사용. 최종 시도 폰트: {}, 오류: {}", selectedFont, e.getMessage());

      // 최후 수단: 기본 폰트
      try {
        return PdfFontFactory.createFont(StandardFonts.HELVETICA);
      } catch (Exception ex) {
        throw new RuntimeException("PDF 폰트 생성 완전 실패: " + ex.getMessage(), ex);
      }
    }
  }

  /**
   * 프로젝트 번들 폰트 시도 (1순위)
   *
   * @return 성공한 폰트 경로 또는 null
   */
  private String tryProjectBundleFonts() {
    // 프로젝트에 번들된 한글 폰트들 (src/main/resources/fonts/)
    String[] projectFonts = {
      "/fonts/NanumGothicCoding.ttf", // 나눔고딕코딩 Regular
      "/fonts/NanumGothicCoding-Bold.ttf", // 나눔고딕코딩 Bold
    };

    log.info("  📦 프로젝트 번들 폰트 시도");
    for (String fontPath : projectFonts) {
      try {
        // 클래스패스에서 폰트 리소스 로드
        java.io.InputStream fontStream = this.getClass().getResourceAsStream(fontPath);
        if (fontStream != null) {
          // 스트림을 바이트 배열로 변환
          byte[] fontBytes = fontStream.readAllBytes();
          fontStream.close();

          // iText에서 바이트 배열로 폰트 생성
          PdfFontFactory.createFont(fontBytes, PdfEncodings.IDENTITY_H);
          log.info("  ✅ 프로젝트 번들 폰트 로드 성공: {}", fontPath);
          return fontPath; // 경로를 식별자로 반환
        } else {
          log.debug("  ❌ 프로젝트 번들 폰트 리소스 없음: {}", fontPath);
        }
      } catch (Exception e) {
        log.debug("  ❌ 프로젝트 번들 폰트 로드 실패: {} - {}", fontPath, e.getClass().getSimpleName());
      }
    }
    return null;
  }

  /**
   * font-asian 번들 폰트 시도 (2순위)
   *
   * @return 성공한 폰트명 또는 null
   */
  private String tryLibraryBundleFonts() {
    // font-asian 라이브러리의 실제 한글 지원 폰트들
    String[] bundleFonts = {
      "HYGoThic-Medium", // 한글 Gothic 폰트
      "HYSMyeongJo-Medium", // 한글 명조 폰트
      "MSung-Light", // 중국어 간체
      "MSungStd-Light", // 중국어 간체 표준
      "STSong-Light", // 중국어 간체 (CJK 공통)
      "HeiseiKakuGo-W5", // 일본어 고딕
      "HeiseiMin-W3" // 일본어 명조
    };

    log.info("  📚 font-asian 라이브러리 번들 폰트 시도");
    for (String fontName : bundleFonts) {
      try {
        PdfFontFactory.createFont(fontName, PdfEncodings.IDENTITY_H);
        log.info("  ✅ 라이브러리 번들 폰트 로드 성공: {}", fontName);
        return fontName;
      } catch (Exception e) {
        log.debug("  ❌ 라이브러리 번들 폰트 로드 실패: {} - {}", fontName, e.getClass().getSimpleName());
      }
    }
    return null;
  }

  /**
   * OS별 시스템 폰트 경로 시도
   *
   * @return 성공한 폰트 경로 또는 null
   */
  private String trySystemFontPaths() {
    String os = System.getProperty("os.name").toLowerCase();
    String[] fontPaths = {};

    if (os.contains("mac")) {
      fontPaths =
          new String[] {
            "/System/Library/Fonts/Apple SD Gothic Neo.ttc",
            "/System/Library/Fonts/AppleGothic.ttf",
            "/Library/Fonts/NanumGothic.ttc",
            "/System/Library/Fonts/Helvetica.ttc"
          };
      log.info("  🖥️ macOS 폰트 경로 시도");
    } else if (os.contains("win")) {
      fontPaths =
          new String[] {
            "C:/Windows/Fonts/malgun.ttf",
            "C:/Windows/Fonts/gulim.ttc",
            "C:/Windows/Fonts/batang.ttc",
            "C:/Windows/Fonts/arial.ttf"
          };
      log.info("  🖥️ Windows 폰트 경로 시도");
    } else {
      // Linux 및 기타 Unix 계열
      fontPaths =
          new String[] {
            "/usr/share/fonts/truetype/nanum/NanumGothic.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
            "/usr/share/fonts/TTF/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
          };
      log.info("  🖥️ Linux 폰트 경로 시도");
    }

    for (String fontPath : fontPaths) {
      try {
        if (java.nio.file.Files.exists(java.nio.file.Paths.get(fontPath))) {
          PdfFontFactory.createFont(fontPath, PdfEncodings.IDENTITY_H);
          log.info("  ✅ 시스템 폰트 로드 성공: {}", fontPath);
          return fontPath;
        }
      } catch (Exception e) {
        log.debug("  ❌ 시스템 폰트 로드 실패: {} - {}", fontPath, e.getClass().getSimpleName());
      }
    }
    return null;
  }

  /**
   * 시스템 폰트명 기반 시도 (기존 방식 개선)
   *
   * @return 성공한 폰트명 또는 null
   */
  private String trySystemFontNames() {
    String[] systemFonts = {
      "NanumGothic",
      "Malgun Gothic",
      "AppleGothic",
      "Apple SD Gothic Neo",
      "Arial Unicode MS",
      "Noto Sans CJK KR",
      "Liberation Sans"
    };

    log.info("  🔤 시스템 폰트명 시도");
    for (String fontName : systemFonts) {
      try {
        PdfFontFactory.createFont(fontName, PdfEncodings.IDENTITY_H);
        log.info("  ✅ 시스템 폰트명 로드 성공: {}", fontName);
        return fontName;
      } catch (Exception e) {
        log.debug("  ❌ 시스템 폰트명 로드 실패: {} - {}", fontName, e.getClass().getSimpleName());
      }
    }
    return null;
  }

  /** 테스트 결과를 Excel 형식으로 내보내기 */
  public byte[] exportToExcel(Page<TestResultReportDto> reportData, TestResultFilterDto filter) {
    try (Workbook workbook = new XSSFWorkbook();
        ByteArrayOutputStream out = new ByteArrayOutputStream()) {

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
        if (sheet.getColumnWidth(i) > EXCEL_MAX_COLUMN_WIDTH) {
          sheet.setColumnWidth(i, EXCEL_MAX_COLUMN_WIDTH);
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

  /** 테스트 결과를 PDF 형식으로 내보내기: 한글 폰트 지원 추가 */
  public byte[] exportToPdf(Page<TestResultReportDto> reportData, TestResultFilterDto filter) {
    try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {

      PdfWriter writer = new PdfWriter(out);
      PdfDocument pdf = new PdfDocument(writer);
      Document document = new Document(pdf);

      // 한글 지원 폰트 설정
      PdfFont koreanFont = createKoreanFont();

      // 제목 추가
      document.add(new Paragraph("테스트 결과 리포트").setFont(koreanFont).setFontSize(20).setBold());

      // 생성 정보 추가
      document.add(
          new Paragraph("생성일시: " + java.time.LocalDateTime.now().format(DATE_FORMATTER))
              .setFont(koreanFont)
              .setFontSize(10));
      document.add(
          new Paragraph("총 " + reportData.getTotalElements() + "건의 결과")
              .setFont(koreanFont)
              .setFontSize(10));
      document.add(new Paragraph(" ")); // 공백 줄

      // 테이블 생성
      String[] headers = getColumnHeaders(filter);
      Table table = new Table(headers.length);

      // 헤더 추가
      for (String header : headers) {
        table.addHeaderCell(
            new com.itextpdf.layout.element.Cell()
                .add(new Paragraph(header).setFont(koreanFont).setBold()));
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

  /** 테스트 결과를 CSV 형식으로 내보내기 */
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

  /** 필터 설정에 따른 내보내기 대상 컬럼 리스트 반환 */
  private List<String> getDisplayColumns(TestResultFilterDto filter) {
    List<String> columns = filter.getDisplayColumns();
    if (columns == null || columns.isEmpty()) {
      return DEFAULT_COLUMNS;
    }
    return columns;
  }

  /** 필터 설정에 따른 컬럼 헤더 반환 */
  private String[] getColumnHeaders(TestResultFilterDto filter) {
    return getDisplayColumns(filter).stream()
        .map(this::getColumnDisplayName)
        .toArray(String[]::new);
  }

  /** 컬럼 필드명을 표시명으로 변환 */
  private String getColumnDisplayName(String fieldName) {
    return COLUMN_DISPLAY_NAMES.getOrDefault(fieldName, fieldName);
  }

  private void populateExcelRow(
      Row row, TestResultReportDto result, TestResultFilterDto filter, CellStyle style) {
    List<String> displayColumns = getDisplayColumns(filter);

    int cellIndex = 0;
    for (String column : displayColumns) {
      Cell cell = row.createCell(cellIndex++);
      cell.setCellStyle(style);

      String value = getFieldValue(result, column);
      cell.setCellValue(value != null ? value : "");
    }
  }

  private void populatePdfRow(
      Table table, TestResultReportDto result, TestResultFilterDto filter, PdfFont font) {
    List<String> displayColumns = getDisplayColumns(filter);

    for (String column : displayColumns) {
      String value = getFieldValue(result, column);
      table.addCell(
          new com.itextpdf.layout.element.Cell()
              .add(new Paragraph(value != null ? value : "").setFont(font)));
    }
  }

  private String[] populateCsvRow(TestResultReportDto result, TestResultFilterDto filter) {
    List<String> displayColumns = getDisplayColumns(filter);

    return displayColumns.stream()
        .map(column -> getFieldValue(result, column))
        .map(value -> value != null ? value : "")
        .toArray(String[]::new);
  }

  /** 필드명에 따른 값 반환 */
  private String getFieldValue(TestResultReportDto result, String fieldName) {
    switch (fieldName) {
      case "testPlanName":
        return result.getTestPlanName();
      case "testExecutionName":
        return result.getTestExecutionName();
      case "folderPath":
        return result.getFolderPath();
      case "testCaseName":
        return result.getTestCaseName();
      case "result":
        return getResultDisplayName(result.getResult());
      case "executedAt":
        return result.getExecutedAt() != null
            ? result.getExecutedAt().format(DATE_FORMATTER)
            : null;
      case "executorName":
        return result.getExecutorName();
      case "notes":
        return result.getNotes();
      case "jiraIssueKey":
        return result.getJiraIssueKey();
      case "jiraStatus":
        return result.getJiraStatus();
      case "jiraSyncStatus":
        return result.getJiraSyncStatus();
      case "priority":
        return result.getPriority();
      case "category":
        return result.getCategory();
      // 새로 추가된 컬럼들의 필드 값 처리 추가
      case "preCondition":
        return result.getPreCondition();
      case "expectedResults":
        return result.getExpectedResults();
      case "steps":
        return formatStepsForExport(result.getSteps());
      default:
        return null;
    }
  }

  /** 결과 코드를 한글 표시명으로 변환 */
  private String getResultDisplayName(String result) {
    if (result == null) return "미실행";
    return RESULT_DISPLAY_NAMES.getOrDefault(result.toUpperCase(), result);
  }

  /** 스텝 정보를 내보내기용으로 포맷팅 스텝 배열을 문자열로 변환하여 내보내기에 포함 */
  private String formatStepsForExport(Object steps) {
    if (steps == null) return "";

    // 스텝이 문자열인 경우 그대로 반환
    if (steps instanceof String) {
      return (String) steps;
    }

    // 스텝이 배열이나 리스트인 경우 포맷팅
    if (steps instanceof java.util.List) {
      @SuppressWarnings("unchecked")
      java.util.List<Object> stepList = (java.util.List<Object>) steps;

      StringBuilder sb = new StringBuilder();
      for (int i = 0; i < stepList.size(); i++) {
        Object step = stepList.get(i);

        // TestStep 객체 처리 추가
        if (step instanceof com.testcase.testcasemanagement.model.TestStep) {
          com.testcase.testcasemanagement.model.TestStep testStep =
              (com.testcase.testcasemanagement.model.TestStep) step;

          sb.append("Step ").append(testStep.getStepNumber()).append(": ");

          if (testStep.getDescription() != null && !testStep.getDescription().trim().isEmpty()) {
            sb.append("설명: ").append(testStep.getDescription().trim());
          }

          if (testStep.getExpectedResult() != null
              && !testStep.getExpectedResult().trim().isEmpty()) {
            if (testStep.getDescription() != null && !testStep.getDescription().trim().isEmpty()) {
              sb.append(" | ");
            }
            sb.append("예상결과: ").append(testStep.getExpectedResult().trim());
          }

          // 설명과 예상결과가 모두 비어있는 경우
          if ((testStep.getDescription() == null || testStep.getDescription().trim().isEmpty())
              && (testStep.getExpectedResult() == null
                  || testStep.getExpectedResult().trim().isEmpty())) {
            sb.append("(내용 없음)");
          }

        } else if (step instanceof java.util.Map) {
          // JSON Map 형태의 스텝 처리 (기존 로직 유지)
          @SuppressWarnings("unchecked")
          java.util.Map<String, Object> stepMap = (java.util.Map<String, Object>) step;

          sb.append("Step ").append(i + 1).append(": ");

          String description = (String) stepMap.get("description");
          String expectedResult = (String) stepMap.get("expectedResult");

          if (description != null && !description.trim().isEmpty()) {
            sb.append("설명: ").append(description.trim());
          }
          if (expectedResult != null && !expectedResult.trim().isEmpty()) {
            if (description != null && !description.trim().isEmpty()) {
              sb.append(" | ");
            }
            sb.append("예상결과: ").append(expectedResult.trim());
          }

        } else {
          // 기타 객체인 경우
          sb.append("Step ").append(i + 1).append(": ").append(step.toString());
        }

        if (i < stepList.size() - 1) {
          sb.append("\n");
        }
      }
      return sb.toString();
    }

    // 기타 경우 문자열로 변환
    return steps.toString();
  }

  /** 통계 시트 생성 (Excel용) */
  private void createStatisticsSheet(Workbook workbook, Page<TestResultReportDto> reportData) {
    Sheet statsSheet = workbook.createSheet("통계");

    // 통계 계산
    List<TestResultReportDto> content = reportData.getContent();
    long totalCount = content.size();
    long passCount = content.stream().mapToLong(r -> "PASS".equals(r.getResult()) ? 1 : 0).sum();
    long failCount = content.stream().mapToLong(r -> "FAIL".equals(r.getResult()) ? 1 : 0).sum();
    long blockedCount =
        content.stream().mapToLong(r -> "BLOCKED".equals(r.getResult()) ? 1 : 0).sum();
    long notRunCount =
        content.stream().mapToLong(r -> "NOT_RUN".equals(r.getResult()) ? 1 : 0).sum();

    // 통계 데이터 작성
    Row headerRow = statsSheet.createRow(0);
    headerRow.createCell(0).setCellValue("항목");
    headerRow.createCell(1).setCellValue("수량");
    headerRow.createCell(2).setCellValue("비율 (%)");

    addStatRow(statsSheet, 1, "전체", totalCount, 100.0);
    addStatRow(
        statsSheet, 2, "성공", passCount, totalCount > 0 ? (passCount * 100.0 / totalCount) : 0);
    addStatRow(
        statsSheet, 3, "실패", failCount, totalCount > 0 ? (failCount * 100.0 / totalCount) : 0);
    addStatRow(
        statsSheet,
        4,
        "차단됨",
        blockedCount,
        totalCount > 0 ? (blockedCount * 100.0 / totalCount) : 0);
    addStatRow(
        statsSheet, 5, "미실행", notRunCount, totalCount > 0 ? (notRunCount * 100.0 / totalCount) : 0);

    // 컬럼 너비 조정
    for (int i = 0; i < 3; i++) {
      statsSheet.autoSizeColumn(i);
    }
  }

  /** 통계 행 추가 */
  private void addStatRow(Sheet sheet, int rowIndex, String label, long count, double percentage) {
    Row row = sheet.createRow(rowIndex);
    row.createCell(0).setCellValue(label);
    row.createCell(1).setCellValue(count);
    row.createCell(2).setCellValue(String.format("%.1f", percentage));
  }
}
