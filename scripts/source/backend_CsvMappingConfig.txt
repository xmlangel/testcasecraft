// src/main/java/com/testcase/testcasemanagement/util/CsvMappingConfig.java
package com.testcase.testcasemanagement.util;

import jakarta.validation.constraints.NotEmpty;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class CsvMappingConfig {
    @NotEmpty(message = "필드 매핑 정보는 필수입니다.")
    private Map<String, String> fieldMappings = new HashMap<>();
    private List<FieldConverter> converters = new ArrayList<>();

    public CsvMappingConfig() {
        this.fieldMappings = new HashMap<>();
        this.converters = new ArrayList<>();
    }

    public Map<String, String> getFieldMappings() {
        return fieldMappings;
    }

    public void setFieldMappings(Map<String, String> fieldMappings) {
        this.fieldMappings = fieldMappings;
    }

    public List<FieldConverter> getConverters() {
        return converters;
    }

    public void setConverters(List<FieldConverter> converters) {
        this.converters = converters;
    }

    public static class FieldConverter {
        private String csvColumn;
        private String targetField;
        private Class<?> targetType;

        public String getCsvColumn() {
            return csvColumn;
        }

        public void setCsvColumn(String csvColumn) {
            this.csvColumn = csvColumn;
        }

        public String getTargetField() {
            return targetField;
        }

        public void setTargetField(String targetField) {
            this.targetField = targetField;
        }

        public Class<?> getTargetType() {
            return targetType;
        }

        public void setTargetType(Class<?> targetType) {
            this.targetType = targetType;
        }
    }
}

