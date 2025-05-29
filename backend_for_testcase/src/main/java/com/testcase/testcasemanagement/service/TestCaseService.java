// src/main/java/com/testcase/testcasemanagement/service/TestCaseService.java

package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.TestCaseDto;
import com.testcase.testcasemanagement.exception.ResourceNotValidException;
import com.testcase.testcasemanagement.mapper.TestCaseMapper;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.TestStep;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.util.CsvMappingConfig;
import com.testcase.testcasemanagement.util.CsvUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.google.api.services.sheets.v4.Sheets;
import com.google.api.services.sheets.v4.model.ClearValuesRequest;
import com.google.api.services.sheets.v4.model.ValueRange;
import com.testcase.testcasemanagement.util.SheetsServiceUtil;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class TestCaseService {
    private final TestCaseRepository testCaseRepository;

    @Autowired
    private ProjectRepository projectRepository;

    public TestCaseService(TestCaseRepository testCaseRepository) {
        this.testCaseRepository = testCaseRepository;
    }

    public List<TestCase> getAllTestCases() {
        List<TestCase> testCases = testCaseRepository.findAllWithSteps();

        // 1순위: projectId 오름차순, 2순위: displayOrder 오름차순 정렬
        testCases.sort(
                Comparator.comparing(
                        (TestCase tc) -> tc.getProject() != null && tc.getProject().getId() != null ? tc.getProject().getId() : ""
                ).thenComparing(tc -> tc.getDisplayOrder() != null ? tc.getDisplayOrder() : 0)
        );

        return testCases;
    }

    public List<TestCase> getTestCasesByParentId(String parentId) {
        return testCaseRepository.findByParentId(parentId);
    }

    @Transactional
    public TestCase saveTestCase(TestCaseDto testCaseDto) {
        Map<String, String> errors = new HashMap<>();

        if (testCaseDto.getName() == null || testCaseDto.getName().trim().isEmpty()) {
            errors.put("name", "Name is required");
        }
        if (testCaseDto.getProjectId() == null || testCaseDto.getProjectId().isEmpty()) {
            errors.put("projectId", "Project ID is required");
        }
        if (testCaseDto.getDescription() != null && testCaseDto.getDescription().length() > 10000) {
            errors.put("description", "Description must be 10,000 characters or less");
        }
        Project project = projectRepository.findById(testCaseDto.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid project ID"));

        if (testCaseDto.getParentId() != null && !testCaseDto.getParentId().isEmpty()) {
            testCaseRepository.findById(testCaseDto.getParentId())
                    .ifPresentOrElse(
                            parent -> {
                                if (!"folder".equals(parent.getType())) {
                                    errors.put("parentId", "Parent must be a folder");
                                }
                            },
                            () -> errors.put("parentId", "Parent folder not found")
                    );
        }

        if (!errors.isEmpty()) {
            throw new ResourceNotValidException("Validation failed", errors);
        }

        // ★★★ type까지 포함해서 중복 체크 (폴더/테스트케이스 개별) ★★★
        Optional<TestCase> existing = testCaseRepository
                .findByNameAndProjectIdAndParentIdAndType(
                        testCaseDto.getName(),
                        testCaseDto.getProjectId(),
                        testCaseDto.getParentId(),
                        testCaseDto.getType() // "folder" 또는 "testcase"
                );

        TestCase entity;
        if (existing.isPresent()) {
            entity = existing.get();
            TestCaseMapper.updateEntityFromDto(testCaseDto, entity);
            entity.setUpdatedAt(LocalDateTime.now());
        } else {
            entity = TestCaseMapper.toEntity(testCaseDto);
            entity.setProject(project);
            entity.setCreatedAt(LocalDateTime.now());
            entity.setUpdatedAt(LocalDateTime.now());
            if (entity.getDisplayOrder() == null) {
                Integer maxOrder = testCaseRepository.findMaxDisplayOrderByParentId(entity.getParentId());
                entity.setDisplayOrder(maxOrder == null ? 1 : maxOrder + 1);
            }
        }
        return testCaseRepository.save(entity);
    }

    public TestCase findById(String id) {
        return testCaseRepository.findByIdWithSteps(id)
                .orElseThrow(() -> new RuntimeException("테스트케이스를 찾을 수 없습니다: " + id));
    }

    @Transactional
    public void deleteTestCase(String id) {
        TestCase testCase = testCaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("TestCase not found"));
        if ("folder".equals(testCase.getType())
                && "[SYSTEM] 기본 폴더 - 삭제불가".equals(testCase.getDescription())) {
            throw new RuntimeException("최초 생성된 테스트케이스 폴더는 삭제할 수 없습니다.");
        }
        List<TestCase> children = testCaseRepository.findByParentId(id);
        if (!children.isEmpty()) {
            children.forEach(child -> deleteTestCase(child.getId()));
        }
        testCaseRepository.deleteById(id);
    }

    public Optional<TestCase> getTestCaseById(String id) {
        return testCaseRepository.findById(id);
    }

    public List<TestCase> getTestCasesByProjectId(String projectId) {
        return testCaseRepository.findAllByProjectIdWithSteps(projectId);
    }

    @Transactional
    public TestCase updateTestCase(String id, TestCaseDto testCaseDto) {
        Map<String, String> errors = new HashMap<>();

        if (testCaseDto.getName() == null || testCaseDto.getName().trim().isEmpty()) {
            errors.put("name", "Name is required");
        }
        if (testCaseDto.getProjectId() == null || testCaseDto.getProjectId().isEmpty()) {
            errors.put("projectId", "Project ID is required");
        }
        if (testCaseDto.getDescription() != null && testCaseDto.getDescription().length() > 10000) {
            errors.put("description", "Description must be 10,000 characters or less");
        }
        Project project = projectRepository.findById(testCaseDto.getProjectId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid project ID"));

        if (testCaseDto.getParentId() != null && !testCaseDto.getParentId().isEmpty()) {
            testCaseRepository.findById(testCaseDto.getParentId())
                    .ifPresentOrElse(parent -> {
                        if (!"folder".equals(parent.getType())) {
                            errors.put("parentId", "Parent must be a folder");
                        }
                    }, () -> errors.put("parentId", "Parent folder not found"));
        }

        if (!errors.isEmpty()) {
            throw new ResourceNotValidException("Validation failed", errors);
        }

        TestCase entity = testCaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("TestCase not found"));
        TestCaseMapper.updateEntityFromDto(testCaseDto, entity);
        entity.setProject(project);
        if (entity.getDisplayOrder() == null) {
            Integer maxOrder = testCaseRepository.findMaxDisplayOrderByParentId(entity.getParentId());
            entity.setDisplayOrder(maxOrder == null ? 1 : maxOrder + 1);
        }
        entity.setUpdatedAt(LocalDateTime.now());
        return testCaseRepository.save(entity);
    }

    private TestCaseDto toDtoWithParentName(TestCase entity) {
        TestCaseDto dto = TestCaseMapper.toDto(entity);
        if (entity.getParentId() == null) {
            dto.setParentName("상위없음");
        } else {
            testCaseRepository.findById(entity.getParentId())
                    .ifPresentOrElse(
                            parent -> dto.setParentName(parent.getName()),
                            () -> dto.setParentName("상위없음")
                    );
        }
        return dto;
    }

    public List<TestCaseDto> getAllTestCasesWithParentName() {
        List<TestCase> entities = getAllTestCases();
        return entities.stream()
                .map(this::toDtoWithParentName)
                .collect(Collectors.toList());
    }

    public TestCaseDto getTestCaseDtoById(String id) {
        TestCase entity = findById(id);
        return toDtoWithParentName(entity);
    }

    /**
     * CSV 임포트 시, 상위 폴더가 없을 경우 "Import폴더"를 자동 생성하여 그 하위에 테스트케이스를 임포트합니다.
     */
    @Transactional
    public List<TestCase> importFromCsv(InputStream is, String projectId, CsvMappingConfig config) {
        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (config.getFieldMappings() == null || config.getFieldMappings().isEmpty())
            throw new CsvImportException("No field mappings", Collections.singletonList(Map.of("error", "No field mappings")));
        if (!projectOpt.isPresent())
            throw new IllegalArgumentException("Invalid project ID: " + projectId);

        Project project = projectOpt.get();
        List<Map<String, String>> rows = CsvUtils.parseCsv(is, config);
        List<TestCase> testCases = new ArrayList<>();
        List<Map<String, Object>> errors = new ArrayList<>();

        // Import폴더 자동 생성 또는 재사용
        String importFolderId = null;
        TestCase importFolder = null;
        Optional<TestCase> importFolderOpt = testCaseRepository
                .findByProjectIdAndType(projectId, "folder")
                .stream()
                .filter(tc -> "Import폴더".equals(tc.getName()))
                .findFirst();
        if (importFolderOpt.isPresent()) {
            importFolder = importFolderOpt.get();
            importFolderId = importFolder.getId();
        } else {
            importFolder = new TestCase();
            importFolder.setName("Import폴더");
            importFolder.setType("folder");
            importFolder.setProject(project);
            importFolder.setCreatedAt(LocalDateTime.now());
            importFolder.setUpdatedAt(LocalDateTime.now());
            importFolder.setDisplayOrder(1);
            importFolder.setDescription("CSV Import 자동 생성 폴더");
            importFolder = testCaseRepository.save(importFolder);
            importFolderId = importFolder.getId();
        }

        // parentId별 displayOrder 관리
        Map<String, Integer> parentMaxOrderMap = new HashMap<>();

        for (int i = 0; i < rows.size(); i++) {
            Map<String, String> row = rows.get(i);
            try {
                // parentId 추출
                String parentId = row.getOrDefault("parentId", null);

                // parentId가 없거나, DB에 존재하지 않으면 Import폴더로 지정
                boolean parentExists = false;
                if (parentId != null && !parentId.isEmpty()) {
                    parentExists = testCaseRepository.findById(parentId).isPresent();
                }
                if (parentId == null || parentId.isEmpty() || !parentExists) {
                    parentId = importFolderId;
                }

                // displayOrder 계산
                if (!parentMaxOrderMap.containsKey(parentId)) {
                    Integer maxOrder = testCaseRepository.findMaxDisplayOrderByParentId(parentId);
                    parentMaxOrderMap.put(parentId, maxOrder == null ? 0 : maxOrder);
                }
                int nextOrder = parentMaxOrderMap.get(parentId) + 1;
                parentMaxOrderMap.put(parentId, nextOrder);

                // buildTestCase에서 parentId를 지정
                TestCase tc = buildTestCase(row, project, config);
                tc.setParentId(parentId);
                tc.setCreatedAt(LocalDateTime.now());
                tc.setUpdatedAt(LocalDateTime.now());
                tc.setDisplayOrder(nextOrder);

                // type까지 포함해서 중복 체크 (폴더/테스트케이스 개별)
                Optional<TestCase> existing = testCaseRepository
                        .findByNameAndProjectIdAndParentIdAndType(
                                tc.getName(), tc.getProject().getId(), tc.getParentId(), tc.getType());
                if (existing.isPresent()) {
                    TestCase existed = existing.get();
                    TestCaseMapper.updateEntityFromDto(TestCaseMapper.toDto(tc), existed);
                    existed.setUpdatedAt(LocalDateTime.now());
                    testCaseRepository.save(existed);
                    testCases.add(existed);
                } else {
                    testCaseRepository.save(tc);
                    testCases.add(tc);
                }
            } catch (Exception e) {
                errors.add(Map.of("row", i + 1, "data", row, "message", e.getMessage()));
            }
        }
        if (!errors.isEmpty())
            throw new CsvImportException("CSV import failed", errors);

        return testCases;
    }

    /**
     * Excel 파일을 통한 테스트케이스 일괄 Import (중복 displayOrder 방지 및 상세 오류 반환)
     */
    @Transactional
    public List<TestCase> importFromExcel(InputStream is, String projectId, CsvMappingConfig config) {
        Optional<Project> projectOpt = projectRepository.findById(projectId);

        if (config.getFieldMappings() == null || config.getFieldMappings().isEmpty()) {
            throw new CsvImportException("필드 매핑 정보가 필요합니다",
                    Collections.singletonList(Map.of("error", "No field mappings")));
        }

        if (!projectOpt.isPresent()) {
            throw new IllegalArgumentException("Invalid project ID: " + projectId);
        }

        Project project = projectOpt.get();
        List<Map<String, String>> rows = parseExcel(is, config);
        List<TestCase> testCases = new ArrayList<>();
        List<Map<String, Object>> errors = new ArrayList<>();

        // parentId + displayOrder 중복 방지용 Map
        Set<String> parentOrderSet = new HashSet<>();

        for (int i = 0; i < rows.size(); i++) {
            Map<String, String> row = rows.get(i);
            try {
                TestCase tc = buildTestCase(row, project, config);

                // parentId, displayOrder 중복 체크 (Excel 내에서)
                String parentId = tc.getParentId();
                if (parentId == null || parentId.isEmpty()) parentId = null;
                Integer displayOrder = tc.getDisplayOrder();
                String key = parentId + "_" + (displayOrder != null ? displayOrder : "null");

                if (displayOrder != null) {
                    if (!parentOrderSet.add(key)) {
                        errors.add(Map.of(
                                "row", i + 1,
                                "data", row,
                                "message", "Excel 내 parentId + displayOrder 중복: " + key
                        ));
                        continue;
                    }
                }

                // DB 내 유니크 체크 (name, projectId, parentId, type)
                Optional<TestCase> existing = testCaseRepository
                        .findByNameAndProjectIdAndParentIdAndType(
                                tc.getName(), tc.getProject().getId(), tc.getParentId(), tc.getType());

                if (existing.isPresent()) {
                    TestCase existed = existing.get();
                    TestCaseMapper.updateEntityFromDto(TestCaseMapper.toDto(tc), existed);
                    existed.setUpdatedAt(LocalDateTime.now());
                    testCaseRepository.save(existed);
                    testCases.add(existed);
                } else {
                    tc.setCreatedAt(LocalDateTime.now());
                    tc.setUpdatedAt(LocalDateTime.now());
                    // displayOrder 자동 할당 (null일 때만)
                    if (tc.getDisplayOrder() == null) {
                        Integer maxOrder = testCaseRepository.findMaxDisplayOrderByParentId(tc.getParentId());
                        tc.setDisplayOrder(maxOrder == null ? 1 : maxOrder + 1);
                    }
                    // DB에 이미 동일 parentId/displayOrder가 있으면 에러로 처리
                    Optional<TestCase> orderDup = testCaseRepository
                            .findByParentIdAndDisplayOrder(tc.getParentId(), tc.getDisplayOrder());
                    if (orderDup.isPresent()) {
                        errors.add(Map.of(
                                "row", i + 1,
                                "data", row,
                                "message", "DB에 이미 존재하는 parentId + displayOrder: " + key
                        ));
                        continue;
                    }
                    testCaseRepository.save(tc);
                    testCases.add(tc);
                }
            } catch (Exception e) {
                errors.add(Map.of(
                        "row", i + 1,
                        "data", row,
                        "message", e.getMessage()
                ));
            }
        }
        if (!errors.isEmpty()) {
            throw new CsvImportException("Excel import failed", errors);
        }

        return testCases;
    }

    private List<Map<String, String>> parseExcel(InputStream is, CsvMappingConfig config) {
        List<Map<String, String>> rows = new ArrayList<>();
        try (Workbook workbook = new XSSFWorkbook(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rowIterator = sheet.iterator();

            if (!rowIterator.hasNext()) return Collections.emptyList();
            Row headerRow = rowIterator.next();
            List<String> headers = new ArrayList<>();
            for (Cell cell : headerRow) {
                headers.add(cell.getStringCellValue().trim());
            }
            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                Map<String, String> rowMap = new HashMap<>();
                for (int i = 0; i < headers.size(); i++) {
                    Cell cell = row.getCell(i, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
                    String value = getCellValueAsString(cell);
                    rowMap.put(headers.get(i), value);
                }
                rows.add(rowMap);
            }
        } catch (Exception e) {
            throw new CsvImportException("엑셀 파싱 오류: " + e.getMessage(),
                    Collections.singletonList(Map.of("error", e.getMessage())));
        }
        return rows;
    }

    public static class CsvImportException extends RuntimeException {
        private final List<Map<String, Object>> errors;

        public CsvImportException(String message, List<Map<String, Object>> errors) {
            super(message);
            this.errors = errors;
        }
        public List<Map<String, Object>> getErrors() {
            return errors;
        }
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toString();
                }
                double d = cell.getNumericCellValue();
                if (d == (long) d) {
                    return String.valueOf((long) d);
                } else {
                    return String.valueOf(d);
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return cell.getStringCellValue();
                } catch (Exception e) {
                    return String.valueOf(cell.getNumericCellValue());
                }
            case BLANK:
            default:
                return "";
        }
    }

    /**
     * 테스트케이스와 각 스텝을 구글 시트로 내보낸다.
     * 각 테스트케이스의 스텝이 여러 개면, 동일한 테스트케이스 정보에 step 정보만 다르게 여러 행이 생성된다.
     */
    public void exportTestCasesToGoogleSheet(String SPREADSHEET_ID, String SHEET_NAME) throws IOException, GeneralSecurityException {
        String RANGE = SHEET_NAME + "!A1";
        List<TestCase> testCases = getAllTestCases();

        // 기존 헤더 + Step 정보 추가
        List<List<Object>> values = new ArrayList<>();
        values.add(List.of(
                "ID", "Name", "Type", "DisplayOrder", "Description", "ProjectId", "CreatedAt",
                "StepNumber", "StepDescription", "StepExpectedResult"
        ));

        for (TestCase tc : testCases) {
            List<TestStep> steps = tc.getSteps();
            if (steps != null && !steps.isEmpty()) {
                for (TestStep step : steps) {
                    List<Object> row = new ArrayList<>();
                    row.add(tc.getId());
                    row.add(tc.getName());
                    row.add(tc.getType());
                    row.add(tc.getDisplayOrder() != null ? tc.getDisplayOrder() : "");
                    row.add(tc.getDescription() != null ? tc.getDescription() : "");
                    row.add(tc.getProject() != null ? tc.getProject().getId() : "");
                    row.add(tc.getCreatedAt() != null ? tc.getCreatedAt().toString() : "");
                    row.add(step.getStepNumber());
                    row.add(step.getDescription() != null ? step.getDescription() : "");
                    row.add(step.getExpectedResult() != null ? step.getExpectedResult() : "");
                    values.add(row);
                }
            } else {
                // 스텝이 없는 경우에도 한 행은 출력 (Step 컬럼은 비움)
                List<Object> row = new ArrayList<>();
                row.add(tc.getId());
                row.add(tc.getName());
                row.add(tc.getType());
                row.add(tc.getDisplayOrder() != null ? tc.getDisplayOrder() : "");
                row.add(tc.getDescription() != null ? tc.getDescription() : "");
                row.add(tc.getProject() != null ? tc.getProject().getId() : "");
                row.add(tc.getCreatedAt() != null ? tc.getCreatedAt().toString() : "");
                row.add(""); // StepNumber
                row.add(""); // StepDescription
                row.add(""); // StepExpectedResult
                values.add(row);
            }
        }

        Sheets sheetsService = SheetsServiceUtil.getSheetsService();

        // 기존 데이터 삭제
        sheetsService.spreadsheets().values()
                .clear(SPREADSHEET_ID, SHEET_NAME, new ClearValuesRequest())
                .execute();

        // 데이터 업데이트
        ValueRange body = new ValueRange().setValues(values);
        sheetsService.spreadsheets().values()
                .update(SPREADSHEET_ID, RANGE, body)
                .setValueInputOption("RAW")
                .execute();
    }

    @Transactional
    private TestCase buildTestCase(Map<String, String> row, Project project, CsvMappingConfig config) {
        TestCase testCase = new TestCase();
        testCase.setProject(project);
        for (Map.Entry<String, String> entry : config.getFieldMappings().entrySet()) {
            String csvColumn = entry.getKey();
            String modelField = entry.getValue();
            String rawValue = row.getOrDefault(csvColumn, "");
            Object value = convertValue(rawValue, getTargetType(modelField, config));

            if (modelField.startsWith("steps")) {
                if (testCase.getSteps() == null) {
                    testCase.setSteps(new ArrayList<>());
                }
            }

            CsvUtils.setNestedField(testCase, modelField, value);
        }

        if (testCase.getSteps() != null) {
            for (int i = 0; i < testCase.getSteps().size(); i++) {
                testCase.getSteps().get(i).setStepNumber(i + 1);
            }
        }

        return testCase;
    }

    @Transactional
    private Class<?> getTargetType(String modelField, CsvMappingConfig config) {
        for (CsvMappingConfig.FieldConverter fc : config.getConverters()) {
            if (fc.getTargetField().equals(modelField)) {
                return fc.getTargetType();
            }
        }
        return String.class;
    }

    @Transactional
    private Object convertValue(String value, Class<?> targetType) {
        if (value == null || value.isEmpty()) return null;
        try {
            if (targetType == Integer.class) {
                if (value.contains(".")) {
                    double d = Double.parseDouble(value);
                    return (int) d;
                }
                return Integer.parseInt(value);
            } else if (targetType == LocalDateTime.class) {
                return LocalDateTime.parse(value, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS"));
            } else if (targetType == String.class) {
                return value;
            }
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
        return null;
    }
}
