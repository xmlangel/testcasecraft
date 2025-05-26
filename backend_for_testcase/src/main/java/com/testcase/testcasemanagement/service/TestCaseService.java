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
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        return testCaseRepository.findAllWithSteps();
    }

    public List<TestCase> getTestCasesByParentId(String parentId) {
        return testCaseRepository.findByParentId(parentId);
    }

    /**
     * name, projectId, parentId가 동일한 테스트케이스가 있으면 update, 아니면 insert
     * displayOrder는 중복 없이 1씩 증가하도록 자동 할당
     */
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

        // name, projectId, parentId로 기존 케이스 조회
        Optional<TestCase> existing = testCaseRepository
                .findByNameAndProjectIdAndParentId(
                        testCaseDto.getName(),
                        testCaseDto.getProjectId(),
                        testCaseDto.getParentId());

        TestCase entity;
        if (existing.isPresent()) {
            // update
            entity = existing.get();
            TestCaseMapper.updateEntityFromDto(testCaseDto, entity);
            entity.setUpdatedAt(LocalDateTime.now());
        } else {
            // insert
            entity = TestCaseMapper.toEntity(testCaseDto);
            entity.setProject(project);
            entity.setCreatedAt(LocalDateTime.now());
            entity.setUpdatedAt(LocalDateTime.now());
            // displayOrder 자동 할당 (중복 없이 1씩 증가)
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

        // 시스템 폴더(삭제불가) 체크
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

    @Transactional
    public List<TestCase> importFromCsv(InputStream is, String projectId, CsvMappingConfig config) {
        Optional<Project> projectOpt = projectRepository.findById(projectId);

        if (config.getFieldMappings() == null || config.getFieldMappings().isEmpty()) {
            throw new CsvImportException("필드 매핑 정보가 필요합니다",
                    Collections.singletonList(Map.of("error", "No field mappings")));
        }

        if (!projectOpt.isPresent()) {
            throw new IllegalArgumentException("Invalid project ID: " + projectId);
        }

        Project project = projectRepository.findById(projectId).get();

        List<Map<String, String>> rows = CsvUtils.parseCsv(is, config);
        List<TestCase> testCases = new ArrayList<>();
        List<Map<String, Object>> errors = new ArrayList<>();
        for (int i = 0; i < rows.size(); i++) {
            Map<String, String> row = rows.get(i);
            try {
                TestCase tc = buildTestCase(row, project, config);

                // name, projectId, parentId로 기존 케이스 조회
                Optional<TestCase> existing = testCaseRepository
                        .findByNameAndProjectIdAndParentId(
                                tc.getName(),
                                tc.getProject().getId(),
                                tc.getParentId());
                if (existing.isPresent()) {
                    TestCase existed = existing.get();
                    TestCaseMapper.updateEntityFromDto(TestCaseMapper.toDto(tc), existed);
                    existed.setUpdatedAt(LocalDateTime.now());
                    testCaseRepository.save(existed);
                    testCases.add(existed);
                } else {
                    tc.setCreatedAt(LocalDateTime.now());
                    tc.setUpdatedAt(LocalDateTime.now());
                    // displayOrder 자동 할당 (중복 없이 1씩 증가)
                    if (tc.getDisplayOrder() == null) {
                        Integer maxOrder = testCaseRepository.findMaxDisplayOrderByParentId(tc.getParentId());
                        tc.setDisplayOrder(maxOrder == null ? 1 : maxOrder + 1);
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
            throw new CsvImportException("CSV import failed", errors);
        }

        return testCases;
    }

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

        for (int i = 0; i < rows.size(); i++) {
            Map<String, String> row = rows.get(i);
            try {
                TestCase tc = buildTestCase(row, project, config);

                // name, projectId, parentId로 기존 케이스 조회
                Optional<TestCase> existing = testCaseRepository
                        .findByNameAndProjectIdAndParentId(
                                tc.getName(),
                                tc.getProject().getId(),
                                tc.getParentId());

                if (existing.isPresent()) {
                    TestCase existed = existing.get();
                    TestCaseMapper.updateEntityFromDto(TestCaseMapper.toDto(tc), existed);
                    existed.setUpdatedAt(LocalDateTime.now());
                    testCaseRepository.save(existed);
                    testCases.add(existed);
                } else {
                    tc.setCreatedAt(LocalDateTime.now());
                    tc.setUpdatedAt(LocalDateTime.now());
                    // displayOrder 자동 할당 (중복 없이 1씩 증가)
                    if (tc.getDisplayOrder() == null) {
                        Integer maxOrder = testCaseRepository.findMaxDisplayOrderByParentId(tc.getParentId());
                        tc.setDisplayOrder(maxOrder == null ? 1 : maxOrder + 1);
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

    @Transactional
    private TestCase buildTestCase(Map<String, String> row, Project project, CsvMappingConfig config) {
        TestCase testCase = new TestCase();
        testCase.setProject(project);
        for (Map.Entry<String, String> entry : config.getFieldMappings().entrySet()) {
            String csvColumn = entry.getKey();
            String modelField = entry.getValue();
            String rawValue = row.getOrDefault(csvColumn, "");
            Object value = convertValue(rawValue, getTargetType(modelField, config));

            // steps 초기화 보장
            if (modelField.startsWith("steps")) {
                if (testCase.getSteps() == null) {
                    testCase.setSteps(new ArrayList<>());
                }
            }

            CsvUtils.setNestedField(testCase, modelField, value);
        }

        // 단계 번호 자동 할당
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
