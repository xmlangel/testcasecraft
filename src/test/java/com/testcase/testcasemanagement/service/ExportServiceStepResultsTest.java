package com.testcase.testcasemanagement.service;

import static org.testng.Assert.*;

import com.testcase.testcasemanagement.dto.TestResultFilterDto;
import com.testcase.testcasemanagement.dto.TestResultReportDto;
import com.testcase.testcasemanagement.dto.TestResultStepDto;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.PageImpl;
import org.testng.annotations.Test;

/** ICT-469: 내보내기에 스텝 결과 열과 「케이스 × 스텝」 상세 시트 */
public class ExportServiceStepResultsTest {

  private final ExportService exportService = new ExportService();

  private static TestResultReportDto withSteps() {
    TestResultReportDto r = new TestResultReportDto();
    r.setTestCaseName("로그인");
    r.setResult("FAIL");
    r.setStepResults(
        List.of(
            new TestResultStepDto(2, "FAIL", "반응 없음", "저장", "저장 완료 알림"),
            new TestResultStepDto(1, "PASS", null, "열기", "화면")));
    return r;
  }

  private static TestResultReportDto withoutSteps() {
    TestResultReportDto r = new TestResultReportDto();
    r.setTestCaseName("스텝 없음");
    r.setResult("PASS");
    return r;
  }

  private static TestResultFilterDto filter() {
    TestResultFilterDto f = new TestResultFilterDto();
    f.setDisplayColumns(List.of("testCaseName", "result", "stepResults"));
    return f;
  }

  @Test
  public void excelHasStepResultColumnAndDetailSheet() throws Exception {
    byte[] bytes =
        exportService.exportToExcel(new PageImpl<>(List.of(withSteps(), withoutSteps())), filter());
    try (Workbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
      Sheet main = wb.getSheetAt(0);
      assertEquals(main.getRow(0).getCell(2).getStringCellValue(), "스텝 결과");
      assertEquals(main.getRow(1).getCell(2).getStringCellValue(), "1. PASS\n2. FAIL - 반응 없음");

      Sheet steps = wb.getSheet("스텝 결과");
      assertNotNull(steps);
      assertEquals(steps.getLastRowNum(), 2); // 헤더 + 스텝 2줄 (스텝 없는 케이스는 빠짐)
      assertEquals(steps.getRow(2).getCell(3).getStringCellValue(), "저장");
      assertEquals(steps.getRow(2).getCell(5).getStringCellValue(), "FAIL");
      assertEquals(steps.getRow(2).getCell(6).getStringCellValue(), "반응 없음");
    }
  }

  @Test
  public void excelWithoutStepResultsHasNoDetailSheet() throws Exception {
    byte[] bytes = exportService.exportToExcel(new PageImpl<>(List.of(withoutSteps())), filter());
    try (Workbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
      assertNull(wb.getSheet("스텝 결과"));
    }
  }

  @Test
  public void csvContainsStepResults() {
    byte[] bytes = exportService.exportToCsv(new PageImpl<>(List.of(withSteps())), filter());
    String csv = new String(bytes, StandardCharsets.UTF_8);
    assertTrue(csv.contains("스텝 결과"), csv);
    assertTrue(csv.contains("2. FAIL - 반응 없음"), csv);
  }

  @Test
  public void pdfIsGeneratedWithStepResults() {
    byte[] bytes = exportService.exportToPdf(new PageImpl<>(List.of(withSteps())), filter());
    assertTrue(new String(bytes, 0, 5, StandardCharsets.ISO_8859_1).startsWith("%PDF-"));
  }
}
