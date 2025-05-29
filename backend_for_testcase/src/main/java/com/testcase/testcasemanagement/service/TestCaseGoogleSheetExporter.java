// src/main/java/com/testcase/testcasemanagement/service/TestCaseGoogleSheetExporter.java

package com.testcase.testcasemanagement.service;

import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.ValueRange;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.util.SheetsServiceUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.List;

@Service
public class TestCaseGoogleSheetExporter {

    private static final String SPREADSHEET_ID = "여기에_스프레드시트_ID_입력";
    private static final String RANGE = "Sheet1!A1";

    @Autowired
    private TestCaseService testCaseService;

    public void exportTestCasesToGoogleSheet() throws IOException, GeneralSecurityException {
        List<TestCase> testCases = testCaseService.getAllTestCases();

        List<List<Object>> values = new ArrayList<>();
        values.add(List.of("ID", "Name", "Type", "Description", "ProjectId", "CreatedAt"));

        for (TestCase tc : testCases) {
            List<Object> row = new ArrayList<>();
            row.add(tc.getId());
            row.add(tc.getName());
            row.add(tc.getType());
            row.add(tc.getDescription());
            row.add(tc.getProject().getId());
            row.add(tc.getCreatedAt().toString());
            values.add(row);
        }

        Sheets sheetsService = SheetsServiceUtil.getSheetsService();
        ValueRange body = new ValueRange().setValues(values);

        sheetsService.spreadsheets().values()
                .update(SPREADSHEET_ID, RANGE, body)
                .setValueInputOption("RAW")
                .execute();
    }
}
