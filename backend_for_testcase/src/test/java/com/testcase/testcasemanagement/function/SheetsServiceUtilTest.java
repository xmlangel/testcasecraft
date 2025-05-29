// src/test/java/com/testcase/testcasemanagement/util/SheetsServiceUtilTest.java

package com.testcase.testcasemanagement.function;

import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.Spreadsheet;
import com.testcase.testcasemanagement.util.SheetsServiceUtil;
import org.testng.Assert;
import org.testng.annotations.Test;

public class SheetsServiceUtilTest {

    // 실제 접근 가능한 구글시트 ID로 교체하세요.
    private static final String TEST_SPREADSHEET_ID = "18G07mpMXCt9RYhzAxWFGxEhBKRd1beFacMc_EuAsrNE";

    @Test
    public void getSheetsService_정상연동_테스트() throws Exception {
        Sheets sheetsService = SheetsServiceUtil.getSheetsService();
        Assert.assertNotNull(sheetsService, "Sheets 서비스 객체가 null이면 안됩니다.");

        Spreadsheet spreadsheet = sheetsService.spreadsheets().get(TEST_SPREADSHEET_ID).execute();
        Assert.assertNotNull(spreadsheet, "스프레드시트 정보를 정상적으로 받아와야 합니다.");
        Assert.assertEquals(spreadsheet.getSpreadsheetId(), TEST_SPREADSHEET_ID, "스프레드시트 ID가 일치해야 합니다.");
        Assert.assertTrue(spreadsheet.getSheets().size() > 0, "시트가 1개 이상 존재해야 합니다.");
    }
}
