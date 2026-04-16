package com.testcase.testcasemanagement.dto;

public class ExportRequestDto {

  private String projectId;
  private String format; // csv, excel, json, google-sheet
  private boolean includeHierarchy = true;
  private String googleSheetId;
  private String sheetName;

  public ExportRequestDto() {}

  public String getProjectId() {
    return projectId;
  }

  public void setProjectId(String projectId) {
    this.projectId = projectId;
  }

  public String getFormat() {
    return format;
  }

  public void setFormat(String format) {
    this.format = format;
  }

  public boolean isIncludeHierarchy() {
    return includeHierarchy;
  }

  public void setIncludeHierarchy(boolean includeHierarchy) {
    this.includeHierarchy = includeHierarchy;
  }

  public String getGoogleSheetId() {
    return googleSheetId;
  }

  public void setGoogleSheetId(String googleSheetId) {
    this.googleSheetId = googleSheetId;
  }

  public String getSheetName() {
    return sheetName;
  }

  public void setSheetName(String sheetName) {
    this.sheetName = sheetName;
  }
}
