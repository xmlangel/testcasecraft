package com.testcase.testcasemanagement.util;

import com.opencsv.CSVReader;
import com.testcase.testcasemanagement.model.TestStep;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.lang.reflect.Field;
import java.util.*;

public class CsvUtils {

    public static List<Map<String, String>> parseCsv(InputStream is, CsvMappingConfig config) {
        List<Map<String, String>> rows = new ArrayList<>();
        try (CSVReader reader = new CSVReader(new InputStreamReader(is))) {
            String[] headers = reader.readNext();
            if (headers == null)
                return Collections.emptyList();
            String[] values;
            while ((values = reader.readNext()) != null) {
                Map<String, String> row = new HashMap<>();
                for (int i = 0; i < headers.length; i++) {
                    String key = headers[i].trim();
                    String value = i < values.length ? values[i] : null;
                    row.put(key, value != null ? value.trim() : null);
                }
                rows.add(row);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return rows;
    }

    public static void setNestedField(Object target, String fieldPath, Object value) {
        String[] parts = fieldPath.split("\\.");
        Object current = target;
        try {
            for (int i = 0; i < parts.length - 1; i++) {
                current = getOrCreateNestedField(current, parts[i]);
            }
            setField(current, parts[parts.length - 1], value);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static Object getOrCreateNestedField(Object parent, String fieldName) throws Exception {
        if (fieldName.matches(".*\\[\\d+\\]")) {
            String listName = fieldName.substring(0, fieldName.indexOf('['));
            int index = Integer.parseInt(fieldName.substring(
                    fieldName.indexOf('[') + 1,
                    fieldName.indexOf(']')));

            @SuppressWarnings("unchecked")
            List<Object> list = (List<Object>) getField(parent, listName);
            if (list == null) {
                list = new ArrayList<>();
                setField(parent, listName, list);
            }

            // 리스트 크기 확장 및 객체 생성
            while (list.size() <= index) {
                list.add(new TestStep()); // 기본 객체 생성
            }
            return list.get(index);
        } else {
            return getField(parent, fieldName);
        }
    }

    private static Object getField(Object obj, String fieldName) throws Exception {
        Field field = obj.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        return field.get(obj);
    }

    private static void setField(Object obj, String fieldName, Object value) throws Exception {
        Field field = obj.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(obj, value);
    }
}
