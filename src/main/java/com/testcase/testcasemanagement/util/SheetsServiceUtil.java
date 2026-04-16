// src/main/java/com/testcase/testcasemanagement/util/SheetsServiceUtil.java

package com.testcase.testcasemanagement.util;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.SheetsScopes;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import java.io.FileInputStream;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Collections;

public class SheetsServiceUtil {
  private static final String APPLICATION_NAME = "TestCaseManagement";
  private static final String CREDENTIALS_FILE_PATH = "src/main/resources/google.json";

  public static Sheets getSheetsService() throws IOException, GeneralSecurityException {
    java.io.File file = new java.io.File(CREDENTIALS_FILE_PATH);
    if (!file.exists()) {
      throw new IOException(
          "기본 구글 서비스 계정 키 파일("
              + CREDENTIALS_FILE_PATH
              + ")이 존재하지 않습니다. 설정 메뉴에서 Google Sheets 설정을 먼저 완료하여 DB 설정을 사용하도록 하세요.");
    }
    return getSheetsServiceFromStream(new FileInputStream(CREDENTIALS_FILE_PATH));
  }

  public static Sheets getSheetsServiceFromContent(String jsonKeyContent)
      throws IOException, GeneralSecurityException {
    return getSheetsServiceFromStream(new java.io.ByteArrayInputStream(jsonKeyContent.getBytes()));
  }

  private static Sheets getSheetsServiceFromStream(java.io.InputStream stream)
      throws IOException, GeneralSecurityException {
    GoogleCredentials credentials =
        GoogleCredentials.fromStream(stream)
            .createScoped(Collections.singleton(SheetsScopes.SPREADSHEETS));
    return new Sheets.Builder(
            GoogleNetHttpTransport.newTrustedTransport(),
            GsonFactory.getDefaultInstance(),
            new HttpCredentialsAdapter(credentials))
        .setApplicationName(APPLICATION_NAME)
        .build();
  }
}
