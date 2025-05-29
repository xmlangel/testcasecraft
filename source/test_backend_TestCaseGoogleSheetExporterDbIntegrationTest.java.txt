// src/test/java/com/testcase/testcasemanagement/function/TestCaseGoogleSheetExporterDbIntegrationTest.java

package com.testcase.testcasemanagement.function;

import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.Spreadsheet;
import com.google.api.services.sheets.v4.model.ValueRange;
import com.testcase.testcasemanagement.TestcasemanagementApplication;
import com.testcase.testcasemanagement.model.TestCase;
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

        String spreadsheetId = "18G07mpMXCt9RYhzAxWFGxEhBKRd1beFacMc_EuAsrNE";
        String sheetName = "ABCD";
        String RANGE = sheetName + "!A1:F" + (dbTestCases.size() + 1);

        // 2. 구글 시트로 내보내기
        testCaseService.exportTestCasesToGoogleSheet(spreadsheetId, sheetName);

        // 3. 구글 시트에서 데이터 읽어와 검증
        Sheets sheetsService = SheetsServiceUtil.getSheetsService();
        ValueRange response = sheetsService.spreadsheets().values()
                .get(spreadsheetId, RANGE)
                .execute();

        List<List<Object>> sheetValues = response.getValues();
        Assert.assertNotNull(sheetValues, "구글시트에서 데이터를 읽을 수 있어야 합니다.");
        Assert.assertTrue(sheetValues.size() > 1, "헤더 포함 2줄 이상이어야 함");

        // 4. DB와 시트 데이터 비교
        for (int i = 1; i < sheetValues.size(); i++) {
            List<Object> row = sheetValues.get(i);
            TestCase dbTc = dbTestCases.get(i - 1);

            // null과 ""(빈 문자열) 모두 동일하게 처리
            Assert.assertEquals(normalizeNull(row.get(0)), normalizeNull(dbTc.getId()));
            Assert.assertEquals(normalizeNull(row.get(1)), normalizeNull(dbTc.getName()));
            Assert.assertEquals(normalizeNull(row.get(2)), normalizeNull(dbTc.getType()));
            Assert.assertEquals(normalizeNull(row.get(3)), normalizeNull(dbTc.getDisplayOrder()));
            Assert.assertEquals(normalizeNull(row.get(4)), normalizeNull(dbTc.getDescription()));
            Assert.assertEquals(
                    normalizeNull(row.get(5)),
                    dbTc.getProject() != null ? normalizeNull(dbTc.getProject().getId()) : null
            );
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
