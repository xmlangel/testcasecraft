package com.testcase.testcasemanagement.service;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.testng.Assert.*;

import com.testcase.testcasemanagement.dto.TestResultFilterDto;
import com.testcase.testcasemanagement.dto.TestResultReportDto;
import com.testcase.testcasemanagement.dto.TestResultStepDto;
import com.testcase.testcasemanagement.util.ExportLabels;
import java.io.ByteArrayInputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.data.domain.PageImpl;
import org.testng.annotations.Test;

/** ICT-473: 서버 내보내기 파일의 머리글·시트 이름·셀 문구가 요청 언어를 따른다 */
public class ExportServiceLanguageTest {

  private static TestResultReportDto row() {
    TestResultReportDto r = new TestResultReportDto();
    r.setTestCaseName("Login");
    r.setResult("FAIL");
    r.setIsAutomated(false);
    r.setAttachmentCount(2);
    r.setNotes("see ![](/api/testcase-attachments/public/1?token=abc)");
    r.setStepResults(List.of(new TestResultStepDto(1, "FAIL", "no response", "Save", "Saved")));
    return r;
  }

  private static TestResultFilterDto filter(String language) {
    TestResultFilterDto f = new TestResultFilterDto();
    f.setDisplayColumns(
        List.of("testCaseName", "result", "isAutomated", "attachments", "notes", "stepResults"));
    f.setIncludeStatistics(true);
    f.setLanguage(language);
    return f;
  }

  private static String[] header(Sheet sheet, int count) {
    Row r = sheet.getRow(0);
    String[] out = new String[count];
    for (int i = 0; i < count; i++) out[i] = r.getCell(i).getStringCellValue();
    return out;
  }

  @Test
  public void englishExcelUsesEnglishHeadersSheetsAndValues() throws Exception {
    byte[] bytes = new ExportService().exportToExcel(new PageImpl<>(List.of(row())), filter("en"));
    try (Workbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
      Sheet main = wb.getSheetAt(0);
      assertEquals(main.getSheetName(), "Test Result Report");
      assertEquals(
          header(main, 6),
          new String[] {
            "Test Case", "Result", "Automated", "Attachments", "Notes", "Step Results"
          });
      assertEquals(main.getRow(1).getCell(1).getStringCellValue(), "Fail");
      assertEquals(main.getRow(1).getCell(2).getStringCellValue(), "Manual");
      assertEquals(main.getRow(1).getCell(3).getStringCellValue(), "2 attachment(s)");
      assertEquals(main.getRow(1).getCell(4).getStringCellValue(), "see [Image]");

      Sheet steps = wb.getSheet("Step Results");
      assertNotNull(steps);
      assertEquals(
          header(steps, 7),
          new String[] {
            "Test Case",
            "Result",
            "Step No.",
            "Step",
            "Expected Result",
            "Step Result",
            "Actual Result"
          });

      Sheet stats = wb.getSheet("Statistics");
      assertNotNull(stats);
      assertEquals(stats.getRow(0).getCell(0).getStringCellValue(), "Item");
      assertEquals(stats.getRow(1).getCell(0).getStringCellValue(), "Total");
      assertEquals(stats.getRow(3).getCell(0).getStringCellValue(), "Fail");
    }
  }

  @Test
  public void missingLanguageKeepsKoreanOutput() throws Exception {
    byte[] bytes = new ExportService().exportToExcel(new PageImpl<>(List.of(row())), filter(null));
    try (Workbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
      Sheet main = wb.getSheetAt(0);
      assertEquals(main.getSheetName(), "테스트 결과 리포트");
      assertEquals(
          header(main, 6), new String[] {"테스트케이스명", "결과", "자동화 여부", "첨부파일", "비고", "스텝 결과"});
      assertEquals(main.getRow(1).getCell(1).getStringCellValue(), "실패");
      assertEquals(main.getRow(1).getCell(2).getStringCellValue(), "수동");
      assertEquals(main.getRow(1).getCell(3).getStringCellValue(), "첨부 2건");
      assertEquals(main.getRow(1).getCell(4).getStringCellValue(), "see [이미지]");
      assertNotNull(wb.getSheet("스텝 결과"));
      assertNotNull(wb.getSheet("통계"));
    }
  }

  @Test
  public void englishCsvHeaderIsEnglish() {
    byte[] bytes = new ExportService().exportToCsv(new PageImpl<>(List.of(row())), filter("en"));
    String csv = new String(bytes, StandardCharsets.UTF_8);
    assertTrue(
        csv.contains(
            "\"Test Case\",\"Result\",\"Automated\",\"Attachments\",\"Notes\",\"Step Results\""),
        csv);
    assertFalse(csv.matches("(?s).*[가-힣].*"), csv);
  }

  @Test
  public void translationsFromDatabaseWinOverDefaults() throws Exception {
    I18nService i18n = mock(I18nService.class);
    when(i18n.getTranslationsMap("en"))
        .thenReturn(Map.of(ExportLabels.PREFIX + "column.testCaseName", "Case"));
    byte[] bytes =
        new ExportService(i18n).exportToExcel(new PageImpl<>(List.of(row())), filter("en"));
    try (Workbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
      Sheet main = wb.getSheetAt(0);
      assertEquals(main.getRow(0).getCell(0).getStringCellValue(), "Case");
      // DB 에 없는 키는 표의 영어 값을 쓴다
      assertEquals(main.getRow(0).getCell(1).getStringCellValue(), "Result");
    }
  }

  @Test
  public void translationLookupFailureFallsBackToDefaults() throws Exception {
    I18nService i18n = mock(I18nService.class);
    when(i18n.getTranslationsMap("en")).thenThrow(new RuntimeException("db down"));
    byte[] bytes =
        new ExportService(i18n).exportToExcel(new PageImpl<>(List.of(row())), filter("en"));
    try (Workbook wb = new XSSFWorkbook(new ByteArrayInputStream(bytes))) {
      assertEquals(wb.getSheetAt(0).getRow(0).getCell(0).getStringCellValue(), "Test Case");
    }
  }

  @Test
  public void labelTableHasUniqueKeysAndBothLanguages() {
    Set<String> keys = new HashSet<>();
    for (ExportLabels.Entry e : ExportLabels.ENTRIES) {
      assertTrue(keys.add(e.key()), "duplicate " + e.key());
      assertFalse(e.ko().isBlank(), e.key());
      assertFalse(e.en().isBlank(), e.key());
      assertFalse(e.en().matches(".*[가-힣].*"), "Korean in en value: " + e.key());
    }
  }
}
