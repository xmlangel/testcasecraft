package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.TestResultFilterDto;
import com.testcase.testcasemanagement.dto.TestResultReportDto;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.testng.Assert;
import org.testng.annotations.Test;

/** ExportService 종합 테스트 - PDF, Excel, CSV 모든 기능 검증 */
public class ExportServiceComprehensiveTest {

  private ExportService exportService = new ExportService();

  /** 대용량 데이터 PDF 생성 테스트 */
  @Test
  public void testLargeDataPdfGeneration() {
    System.out.println("=== 대용량 데이터 PDF 생성 테스트 ===");

    // 100개의 테스트 데이터 생성
    List<TestResultReportDto> largeDataList = new ArrayList<>();
    for (int i = 1; i <= 100; i++) {
      TestResultReportDto result = new TestResultReportDto();
      result.setTestCaseName("대용량테스트_" + i + "_한글포함");
      result.setResult(i % 4 == 0 ? "FAIL" : "PASS");
      result.setExecutedAt(LocalDateTime.now().minusDays(i % 10));
      result.setExecutorName("테스터_" + (i % 5 + 1));
      result.setNotes("테스트 노트 " + i + " - 한글 내용 검증");
      result.setFolderPath("폴더경로/하위폴더" + (i % 10) + "/테스트케이스");
      result.setJiraIssueKey(i % 3 == 0 ? "TEST-" + i : null);
      largeDataList.add(result);
    }

    Page<TestResultReportDto> largeTestData =
        new PageImpl<>(largeDataList, PageRequest.of(0, 100), 100);
    TestResultFilterDto filter = createFullFilter();

    try {
      long startTime = System.currentTimeMillis();
      byte[] pdfBytes = exportService.exportToPdf(largeTestData, filter);
      long endTime = System.currentTimeMillis();

      Assert.assertNotNull(pdfBytes, "대용량 PDF 생성 실패");
      Assert.assertTrue(pdfBytes.length > 5000, "PDF 크기가 너무 작음 (예상보다 적은 데이터)");

      // PDF 헤더 검증
      String pdfHeader = new String(Arrays.copyOfRange(pdfBytes, 0, 8));
      Assert.assertTrue(pdfHeader.startsWith("%PDF-"), "올바른 PDF 파일이 아님");

      System.out.println("✅ 대용량 PDF 생성 성공");
      System.out.println("  - 데이터 수: 100개");
      System.out.println("  - PDF 크기: " + pdfBytes.length + " bytes");
      System.out.println("  - 생성 시간: " + (endTime - startTime) + "ms");
      System.out.println(
          "  - 평균 처리 속도: " + (100.0 / (endTime - startTime) * 1000) + " records/sec");

    } catch (Exception e) {
      Assert.fail("대용량 PDF 생성 중 오류: " + e.getMessage());
    }
  }

  /** 복잡한 한글 텍스트 PDF 생성 테스트 */
  @Test
  public void testComplexKoreanTextPdf() {
    System.out.println("=== 복잡한 한글 텍스트 PDF 생성 테스트 ===");

    TestResultReportDto complexResult = new TestResultReportDto();
    complexResult.setTestCaseName("복잡한_한글_테스트케이스_특수문자포함!@#$%^&*()");
    complexResult.setResult("FAIL");
    complexResult.setExecutedAt(LocalDateTime.now());
    complexResult.setExecutorName("한글사용자_테스터");
    complexResult.setNotes(
        "복잡한 한글 내용입니다. "
            + "줄바꿈이 포함된 내용, "
            + "특수문자 !@#$%^&*()_+-=[]{}|;':\",./<>? "
            + "그리고 이모지도 포함 🎉✅❌📊💡");
    complexResult.setFolderPath("루트폴더/서브폴더/깊은폴더/매우깊은폴더/테스트");
    complexResult.setJiraIssueKey("KOREAN-123");

    List<TestResultReportDto> resultList = Arrays.asList(complexResult);
    Page<TestResultReportDto> testData = new PageImpl<>(resultList, PageRequest.of(0, 10), 1);
    TestResultFilterDto filter = createFullFilter();

    try {
      byte[] pdfBytes = exportService.exportToPdf(testData, filter);
      Assert.assertNotNull(pdfBytes, "복잡한 한글 PDF 생성 실패");
      Assert.assertTrue(pdfBytes.length > 1000, "PDF 크기가 너무 작음");

      System.out.println("✅ 복잡한 한글 텍스트 PDF 생성 성공");
      System.out.println("  - 테스트케이스명: " + complexResult.getTestCaseName());
      System.out.println("  - 비고 내용 길이: " + complexResult.getNotes().length() + " 문자");
      System.out.println("  - PDF 크기: " + pdfBytes.length + " bytes");

    } catch (Exception e) {
      Assert.fail("복잡한 한글 텍스트 PDF 생성 실패: " + e.getMessage());
    }
  }

  /** 통계 포함 Excel 생성 테스트 */
  @Test
  public void testExcelWithStatistics() {
    System.out.println("=== 통계 포함 Excel 생성 테스트 ===");

    Page<TestResultReportDto> testData = createMixedResultData();
    TestResultFilterDto filter = createFullFilter();
    filter.setIncludeStatistics(true);

    try {
      byte[] excelBytes = exportService.exportToExcel(testData, filter);
      Assert.assertNotNull(excelBytes, "통계 포함 Excel 생성 실패");
      Assert.assertTrue(excelBytes.length > 5000, "Excel 크기가 너무 작음");

      System.out.println("✅ 통계 포함 Excel 생성 성공");
      System.out.println("  - Excel 크기: " + excelBytes.length + " bytes");

    } catch (Exception e) {
      Assert.fail("통계 포함 Excel 생성 실패: " + e.getMessage());
    }
  }

  /** CSV UTF-8 인코딩 테스트 */
  @Test
  public void testCsvUtf8Encoding() {
    System.out.println("=== CSV UTF-8 인코딩 테스트 ===");

    TestResultReportDto koreanResult = new TestResultReportDto();
    koreanResult.setTestCaseName("한글_테스트케이스_UTF8");
    koreanResult.setResult("PASS");
    koreanResult.setExecutedAt(LocalDateTime.now());
    koreanResult.setExecutorName("한글사용자");
    koreanResult.setNotes("한글이 포함된 노트 내용");
    koreanResult.setFolderPath("한글폴더/서브폴더");

    List<TestResultReportDto> resultList = Arrays.asList(koreanResult);
    Page<TestResultReportDto> testData = new PageImpl<>(resultList, PageRequest.of(0, 10), 1);
    TestResultFilterDto filter = createFullFilter();

    try {
      byte[] csvBytes = exportService.exportToCsv(testData, filter);
      Assert.assertNotNull(csvBytes, "CSV 생성 실패");

      // UTF-8 BOM 확인
      Assert.assertTrue(csvBytes.length >= 3, "CSV 파일이 너무 작음");
      Assert.assertEquals(csvBytes[0] & 0xFF, 0xEF, "UTF-8 BOM 첫 번째 바이트 불일치");
      Assert.assertEquals(csvBytes[1] & 0xFF, 0xBB, "UTF-8 BOM 두 번째 바이트 불일치");
      Assert.assertEquals(csvBytes[2] & 0xFF, 0xBF, "UTF-8 BOM 세 번째 바이트 불일치");

      // CSV 내용에 한글이 포함되어 있는지 확인
      String csvContent = new String(csvBytes, "UTF-8");
      Assert.assertTrue(csvContent.contains("한글"), "CSV에 한글 내용이 포함되지 않음");

      System.out.println("✅ CSV UTF-8 인코딩 성공");
      System.out.println("  - CSV 크기: " + csvBytes.length + " bytes");
      System.out.println("  - UTF-8 BOM 포함 확인");
      System.out.println("  - 한글 내용 포함 확인");

    } catch (Exception e) {
      Assert.fail("CSV UTF-8 인코딩 테스트 실패: " + e.getMessage());
    }
  }

  /** 모든 포맷 동시 생성 성능 테스트 */
  @Test
  public void testAllFormatsPerformance() {
    System.out.println("=== 모든 포맷 동시 생성 성능 테스트 ===");

    Page<TestResultReportDto> testData = createMixedResultData();
    TestResultFilterDto filter = createFullFilter();

    try {
      // PDF 생성
      long pdfStart = System.currentTimeMillis();
      byte[] pdfBytes = exportService.exportToPdf(testData, filter);
      long pdfEnd = System.currentTimeMillis();

      // Excel 생성
      long excelStart = System.currentTimeMillis();
      byte[] excelBytes = exportService.exportToExcel(testData, filter);
      long excelEnd = System.currentTimeMillis();

      // CSV 생성
      long csvStart = System.currentTimeMillis();
      byte[] csvBytes = exportService.exportToCsv(testData, filter);
      long csvEnd = System.currentTimeMillis();

      // 검증
      Assert.assertNotNull(pdfBytes, "PDF 생성 실패");
      Assert.assertNotNull(excelBytes, "Excel 생성 실패");
      Assert.assertNotNull(csvBytes, "CSV 생성 실패");

      System.out.println("✅ 모든 포맷 생성 성공");
      System.out.println("  - PDF: " + pdfBytes.length + " bytes (" + (pdfEnd - pdfStart) + "ms)");
      System.out.println(
          "  - Excel: " + excelBytes.length + " bytes (" + (excelEnd - excelStart) + "ms)");
      System.out.println("  - CSV: " + csvBytes.length + " bytes (" + (csvEnd - csvStart) + "ms)");
      System.out.println(
          "  - 총 처리시간: "
              + ((pdfEnd - pdfStart) + (excelEnd - excelStart) + (csvEnd - csvStart))
              + "ms");

    } catch (Exception e) {
      Assert.fail("포맷 성능 테스트 실패: " + e.getMessage());
    }
  }

  /** 혼합된 결과 데이터 생성 (PASS, FAIL, BLOCKED, NOT_RUN) */
  private Page<TestResultReportDto> createMixedResultData() {
    List<TestResultReportDto> resultList = new ArrayList<>();
    String[] results = {"PASS", "FAIL", "BLOCKED", "NOT_RUN"};
    String[] users = {"개발자1", "테스터1", "QA담당자", "관리자"};

    for (int i = 0; i < 20; i++) {
      TestResultReportDto result = new TestResultReportDto();
      result.setTestCaseName("테스트케이스_" + (i + 1));
      result.setResult(results[i % results.length]);
      result.setExecutedAt(LocalDateTime.now().minusHours(i));
      result.setExecutorName(users[i % users.length]);
      result.setNotes(i % 3 == 0 ? "상세 노트 내용 " + (i + 1) : "");
      result.setFolderPath("폴더" + (i % 5 + 1) + "/서브폴더");
      result.setJiraIssueKey(i % 4 == 0 ? "JIRA-" + (i + 1) : null);
      resultList.add(result);
    }

    return new PageImpl<>(resultList, PageRequest.of(0, 20), 20);
  }

  /** 모든 컬럼을 포함하는 필터 생성 */
  private TestResultFilterDto createFullFilter() {
    TestResultFilterDto filter = new TestResultFilterDto();
    filter.setDisplayColumns(
        Arrays.asList(
            "testPlanName",
            "testExecutionName",
            "folderPath",
            "testCaseName",
            "result",
            "executedAt",
            "executorName",
            "notes",
            "jiraIssueKey"));
    return filter;
  }
}
