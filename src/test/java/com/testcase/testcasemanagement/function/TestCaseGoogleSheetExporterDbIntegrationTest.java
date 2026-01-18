// src/test/java/com/testcase/testcasemanagement/function/TestCaseGoogleSheetExporterDbIntegrationTest.java

package com.testcase.testcasemanagement.function;

import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.Spreadsheet;
import com.google.api.services.sheets.v4.model.ValueRange;
import com.testcase.testcasemanagement.TestcasemanagementApplication;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.TestStep;
import com.testcase.testcasemanagement.service.TestCaseService;
import com.testcase.testcasemanagement.util.SheetsServiceUtil;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.testng.AbstractTestNGSpringContextTests;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.List;

@SpringBootTest
@ContextConfiguration(classes = TestcasemanagementApplication.class)
@ActiveProfiles("test")
public class TestCaseGoogleSheetExporterDbIntegrationTest extends AbstractTestNGSpringContextTests {

    private static final Logger log = LoggerFactory.getLogger(TestCaseGoogleSheetExporterDbIntegrationTest.class);

    @Autowired
    private TestCaseService testCaseService;

    @Test
    public void exportTestCasesToGoogleSheet_DB데이터_기록_확인() throws IOException, GeneralSecurityException {
        // 1. DB에서 테스트케이스 조회
        List<TestCase> dbTestCases = testCaseService.getAllTestCases();
        log.info("DB에서 조회된 테스트케이스 개수: {}", dbTestCases.size());
        for (TestCase tc : dbTestCases) {
            log.info("TestCase ID: {}, Name: {}, Type: {}, ProjectID: {}",
                    tc.getId(), tc.getName(), tc.getType(),
                    tc.getProject() != null ? tc.getProject().getId() : "null");
        }
        Assert.assertTrue(dbTestCases.size() > 0, "DB에 테스트케이스가 1개 이상 존재해야 합니다.");

        // 2. 구글 시트로 내보내기
        testCaseService.exportTestCasesToGoogleSheet(TEST_SPREADSHEET_ID, TARGET_SHEET_NAME);

        // 3. 구글 시트에서 데이터 읽어와 검증
        Sheets sheetsService = SheetsServiceUtil.getSheetsService();
        // 내보내는 컬럼 순서에 맞춰 범위 지정 (A~L)
        String RANGE = TARGET_SHEET_NAME + "!A1:L1000";
        ValueRange response = sheetsService.spreadsheets().values()
                .get(TEST_SPREADSHEET_ID, RANGE)
                .execute();

        List<List<Object>> sheetValues = response.getValues();
        Assert.assertNotNull(sheetValues, "구글시트에서 데이터를 읽을 수 있어야 합니다.");
        Assert.assertTrue(sheetValues.size() > 1, "헤더 포함 2줄 이상이어야 함");

        // 4. DB와 시트 데이터 비교
        // 시트의 헤더: ProjectID, ID, 프로젝트이름, Type, Displayorder, Name, Description, Precondition, Stepnumber, StepDescription, StepExpectedResult, Expectresult
        // DB의 테스트케이스와 스텝을 flat하게 펼쳐서 비교
        List<List<Object>> dbFlatRows = new ArrayList<>();
        for (TestCase tc : dbTestCases) {
            String projectId = tc.getProject() != null ? tc.getProject().getId() : "";
            String projectName = tc.getProject() != null ? tc.getProject().getName() : "";
            String description = tc.getDescription() != null ? tc.getDescription() : "";
            String precondition = tc.getPreCondition() != null ? tc.getPreCondition() : "";
            String expectedResults = tc.getExpectedResults() != null ? tc.getExpectedResults() : "";

            List<TestStep> steps = tc.getSteps();
            if (steps != null && !steps.isEmpty()) {
                for (TestStep step : steps) {
                    List<Object> row = new ArrayList<>();
                    row.add(projectId);
                    row.add(tc.getId());
                    row.add(projectName);
                    row.add(tc.getType());
                    row.add(tc.getDisplayOrder() != null ? tc.getDisplayOrder().toString() : "");
                    row.add(tc.getName());
                    row.add(description);
                    row.add(precondition);
                    row.add(step.getStepNumber());
                    row.add(step.getDescription() != null ? step.getDescription() : "");
                    row.add(step.getExpectedResult() != null ? step.getExpectedResult() : "");
                    row.add(expectedResults);
                    dbFlatRows.add(row);
                }
            } else {
                List<Object> row = new ArrayList<>();
                row.add(projectId);
                row.add(tc.getId());
                row.add(projectName);
                row.add(tc.getType());
                row.add(tc.getDisplayOrder() != null ? tc.getDisplayOrder().toString() : "");
                row.add(tc.getName());
                row.add(description);
                row.add(precondition);
                row.add(""); // Stepnumber
                row.add(""); // StepDescription
                row.add(""); // StepExpectedResult
                row.add(expectedResults);
                dbFlatRows.add(row);
            }
        }

        // 시트의 첫 행은 헤더이므로 1부터 비교
        Assert.assertEquals(sheetValues.size() - 1, dbFlatRows.size(), "DB의 flat row 수와 시트의 row 수가 일치해야 합니다.");

        for (int i = 1; i < sheetValues.size(); i++) {
            List<Object> sheetRow = sheetValues.get(i);
            List<Object> dbRow = dbFlatRows.get(i - 1);

            for (int col = 0; col < dbRow.size(); col++) {
                Assert.assertEquals(
                        normalizeNull(getCellValue(sheetRow, col)),
                        normalizeNull(dbRow.get(col)),
                        String.format("Row %d, Col %d 값 불일치", i, col)
                );
            }
        }
    }

    /**
     * 구글 시트에서 읽은 값과 DB 값을 비교할 때,
     * null, 빈 문자열, "null" 등 모두 null로 통일해서 비교
     */
    private String normalizeNull(Object value) {
        if (value == null) return null;
        String str = value.toString();
        if (str.trim().isEmpty() || "null".equalsIgnoreCase(str.trim())) return null;
        return str;
    }

    /**
     * 시트 row에서 col index의 값을 안전하게 꺼내는 헬퍼
     */
    private Object getCellValue(List<Object> row, int col) {
        if (row == null || row.size() <= col) return "";
        Object val = row.get(col);
        return val == null ? "" : val;
    }

    private static final String TEST_SPREADSHEET_ID = "18G07mpMXCt9RYhzAxWFGxEhBKRd1beFacMc_EuAsrNE";
    private static final String TARGET_SHEET_NAME = "ABCD";

    @Test
    public void 구글시트와_시트이름_존재_확인() throws Exception {
        // 구글 시트 서비스 객체 생성
        Sheets sheetsService = SheetsServiceUtil.getSheetsService();
        Assert.assertNotNull(sheetsService, "Sheets 서비스 인스턴스가 null이 아니어야 함");

        // 스프레드시트 정보 조회
        Spreadsheet spreadsheet = sheetsService.spreadsheets().get(TEST_SPREADSHEET_ID).execute();
        Assert.assertNotNull(spreadsheet, "스프레드시트 정보가 null이 아니어야 함");
        Assert.assertEquals(spreadsheet.getSpreadsheetId(), TEST_SPREADSHEET_ID, "스프레드시트 ID가 일치해야 함");

        // 시트 이름 존재 여부 확인
        boolean found = spreadsheet.getSheets().stream()
                .anyMatch(sheet -> TARGET_SHEET_NAME.equals(sheet.getProperties().getTitle()));

        Assert.assertTrue(found, "시트 이름 '" + TARGET_SHEET_NAME + "' 이(가) 실제로 존재해야 합니다.");
    }
}
