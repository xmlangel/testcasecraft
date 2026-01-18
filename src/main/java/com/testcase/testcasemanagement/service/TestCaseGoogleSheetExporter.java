// src/main/java/com/testcase/testcasemanagement/service/TestCaseGoogleSheetExporter.java

package com.testcase.testcasemanagement.service;

import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.ClearValuesRequest;
import com.google.api.services.sheets.v4.model.ValueRange;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.util.SheetsServiceUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class TestCaseGoogleSheetExporter {

    private static final String SPREADSHEET_ID = "18G07mpMXCt9RYhzAxWFGxEhBKRd1beFacMc_EuAsrNE";
    private static final String SHEET_NAME = "ABCD";
    private static final String RANGE = SHEET_NAME + "!A1";

    @Autowired
    private TestCaseService testCaseService;

    public void exportTestCasesToGoogleSheet() throws IOException, GeneralSecurityException {
        List<TestCase> testCases = testCaseService.getAllTestCases();

        // 테스트케이스를 ID 기준으로 정렬(순서 일치 보장)
        testCases.sort(Comparator.comparing(TestCase::getId, String::compareTo));

        List<List<Object>> values = new ArrayList<>();
        values.add(List.of("ID", "Name", "Type", "DisplayOrder","Description", "ProjectId", "CreatedAt"));

        for (TestCase tc : testCases) {
            List<Object> row = new ArrayList<>();
            row.add(tc.getId());
            row.add(tc.getName());
            row.add(tc.getType());
            row.add(tc.getDisplayOrder());
            row.add(tc.getDescription());
            row.add(tc.getProject() != null ? tc.getProject().getId() : "");
            row.add(tc.getCreatedAt() != null ? tc.getCreatedAt().toString() : "");
            values.add(row);
        }

        Sheets sheetsService = SheetsServiceUtil.getSheetsService();

        // 1. 시트 데이터 전체 클리어 (헤더 포함)
        sheetsService.spreadsheets().values()
                .clear(SPREADSHEET_ID, SHEET_NAME, new ClearValuesRequest())
                .execute();

        // 2. 새 데이터 기록
        ValueRange body = new ValueRange().setValues(values);
        sheetsService.spreadsheets().values()
                .update(SPREADSHEET_ID, RANGE, body)
                .setValueInputOption("RAW")
                .execute();
    }
}
