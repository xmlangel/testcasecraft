package com.testcase.testcasemanagement.dto;

import java.util.List;

public class ImportValidationResultDto {

  private int totalRows;
  private int validRows;
  private int invalidRows;
  private List<ValidationError> errors;
  private List<PreviewRow> previewData;

  public ImportValidationResultDto() {}

  public ImportValidationResultDto(
      int totalRows,
      int validRows,
      int invalidRows,
      List<ValidationError> errors,
      List<PreviewRow> previewData) {
    this.totalRows = totalRows;
    this.validRows = validRows;
    this.invalidRows = invalidRows;
    this.errors = errors;
    this.previewData = previewData;
  }

  public int getTotalRows() {
    return totalRows;
  }

  public void setTotalRows(int totalRows) {
    this.totalRows = totalRows;
  }

  public int getValidRows() {
    return validRows;
  }

  public void setValidRows(int validRows) {
    this.validRows = validRows;
  }

  public int getInvalidRows() {
    return invalidRows;
  }

  public void setInvalidRows(int invalidRows) {
    this.invalidRows = invalidRows;
  }

  public List<ValidationError> getErrors() {
    return errors;
  }

  public void setErrors(List<ValidationError> errors) {
    this.errors = errors;
  }

  public List<PreviewRow> getPreviewData() {
    return previewData;
  }

  public void setPreviewData(List<PreviewRow> previewData) {
    this.previewData = previewData;
  }

  public static class ValidationError {
    private int row;
    private String field;
    private String message;
    private String value;

    public ValidationError() {}

    public ValidationError(int row, String field, String message, String value) {
      this.row = row;
      this.field = field;
      this.message = message;
      this.value = value;
    }

    public int getRow() {
      return row;
    }

    public void setRow(int row) {
      this.row = row;
    }

    public String getField() {
      return field;
    }

    public void setField(String field) {
      this.field = field;
    }

    public String getMessage() {
      return message;
    }

    public void setMessage(String message) {
      this.message = message;
    }

    public String getValue() {
      return value;
    }

    public void setValue(String value) {
      this.value = value;
    }
  }

  public static class PreviewRow {
    private String type;
    private String name;
    private String parentPath;
    private String priority;
    private String tags;
    private int stepsCount;
    private boolean valid;

    public PreviewRow() {}

    public String getType() {
      return type;
    }

    public void setType(String type) {
      this.type = type;
    }

    public String getName() {
      return name;
    }

    public void setName(String name) {
      this.name = name;
    }

    public String getParentPath() {
      return parentPath;
    }

    public void setParentPath(String parentPath) {
      this.parentPath = parentPath;
    }

    public String getPriority() {
      return priority;
    }

    public void setPriority(String priority) {
      this.priority = priority;
    }

    public String getTags() {
      return tags;
    }

    public void setTags(String tags) {
      this.tags = tags;
    }

    public int getStepsCount() {
      return stepsCount;
    }

    public void setStepsCount(int stepsCount) {
      this.stepsCount = stepsCount;
    }

    public boolean isValid() {
      return valid;
    }

    public void setValid(boolean valid) {
      this.valid = valid;
    }
  }
}
