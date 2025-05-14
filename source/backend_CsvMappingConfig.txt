// src/main/java/com/testcase/testcasemanagement/util/CsvMappingConfig.java
package com.testcase.testcasemanagement.util;

import java.util.List;
import java.util.Map;

public class CsvMappingConfig {
    private Map<String, String> fieldMappings; // CSV 컬럼명 -> 모델 필드경로
    private List<FieldConverter> converters;   // 타입 변환 정보

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

