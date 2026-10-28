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

  @Test
  public void excelStepResultsAreMarkdownStripped() throws Exception {
    TestResultReportDto r = withSteps();
    r.setStepResults(
        List.of(new TestResultStepDto(1, "FAIL", "**오류** ![shot](/api/x?token=abc)", "열기", "화면")));
    byte[] bytes = exportService.exportToExcel(new PageImpl<>(List.of(r)), filter());
    try (Workbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
      String cell = wb.getSheetAt(0).getRow(1).getCell(2).getStringCellValue();
      assertFalse(cell.contains("token"), cell);
      assertFalse(cell.contains("**"), cell);
      String actual = wb.getSheet("스텝 결과").getRow(1).getCell(6).getStringCellValue();
      assertFalse(actual.contains("token"), actual);
    }
  }

  /** ICT-472: 화면 표에서 켤 수 있는 열이 서버 내보내기에서도 값과 헤더를 갖는다 */
  @Test
  public void excelHasRemainingTableColumns() throws Exception {
    TestResultReportDto r = withoutSteps();
    r.setDisplayId("TC-7");
    r.setDescription("설명 ![캡처](/api/x?token=abc)");
    r.setPostCondition("로그아웃");
    r.setIsAutomated(true);
    r.setExecutionType("Automation");
    r.setTestTechnique("경계값 분석");
    r.setTags(List.of("smoke", "login"));
    r.setLinkedDocumentIds(List.of("doc-1"));
    r.setAttachmentCount(2);
    TestResultFilterDto f = new TestResultFilterDto();
    List<String> cols =
        List.of(
            "displayId",
            "description",
            "postCondition",
            "isAutomated",
            "executionType",
            "testTechnique",
            "tags",
            "linkedDocuments",
            "attachments");
    f.setDisplayColumns(cols);
    byte[] bytes = exportService.exportToExcel(new PageImpl<>(List.of(r)), f);
    try (Workbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
      Sheet main = wb.getSheetAt(0);
      String[] expectedHeaders = {
        "Display ID", "설명", "사후 조건", "자동화 여부", "실행 타입", "테스트 기법", "태그", "연결된 RAG 문서", "첨부파일"
      };
      String[] expectedValues = {
        "TC-7",
        "설명 [이미지: 캡처]",
        "로그아웃",
        "Automation",
        "Automation",
        "경계값 분석",
        "smoke, login",
        "doc-1",
        "첨부 2건"
      };
      for (int i = 0; i < cols.size(); i++) {
        assertEquals(main.getRow(0).getCell(i).getStringCellValue(), expectedHeaders[i]);
        assertEquals(
            main.getRow(1).getCell(i).getStringCellValue(), expectedValues[i], cols.get(i));
      }
    }
  }
}
