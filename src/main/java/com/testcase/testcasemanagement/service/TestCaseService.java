// src/main/java/com/testcase/testcasemanagement/service/TestCaseService.java

package com.testcase.testcasemanagement.service;

import com.google.api.client.googleapis.json.GoogleJsonResponseException;
import com.google.api.services.sheets.v4.model.Spreadsheet;
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
import com.testcase.testcasemanagement.event.TestCaseVersionEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
    private final TestCaseDisplayIdService displayIdService;
    private final ApplicationEventPublisher eventPublisher;

    @Autowired
    private ProjectRepository projectRepository;

    public TestCaseService(TestCaseRepository testCaseRepository, 
                          TestCaseDisplayIdService displayIdService,
                          ApplicationEventPublisher eventPublisher) {
        this.testCaseRepository = testCaseRepository;
        this.displayIdService = displayIdService;
        this.eventPublisher = eventPublisher;
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

        TestCase entity = TestCaseMapper.toEntity(testCaseDto);
        entity.setProject(project);
        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());

        // 작성자 정보 설정
        String currentUser = getCurrentUsername();
        entity.setCreatedBy(currentUser);
        entity.setUpdatedBy(currentUser);
        log.info("신규 테스트케이스 작성자 정보 설정: createdBy={}, updatedBy={}", currentUser, currentUser);

        if (entity.getDisplayOrder() == null) {
            Integer maxOrder = testCaseRepository.findMaxDisplayOrderByParentId(entity.getParentId());
            entity.setDisplayOrder(maxOrder == null ? 1 : maxOrder + 1);
        }
        
        // ICT-339: 순차 ID 자동 생성 (프로젝트별 순차 증가)
        if (entity.getSequentialId() == null) {
            Integer maxSequentialId = testCaseRepository.findMaxSequentialIdByProjectId(project.getId());
            entity.setSequentialId(maxSequentialId == null ? 1 : maxSequentialId + 1);
            log.info("ICT-339: 새 테스트케이스에 순차 ID 할당: {} (프로젝트: {})", 
                     entity.getSequentialId(), project.getId());
        }
        
        // ICT-341: Display ID 자동 생성 (프로젝트코드-넘버 형식)
        if (entity.getDisplayId() == null || entity.getDisplayId().trim().isEmpty()) {
            String generatedDisplayId = displayIdService.generateDisplayId(entity);
            entity.setDisplayId(generatedDisplayId);
            log.info("ICT-341: 새 테스트케이스에 Display ID 할당: {} (프로젝트: {})", 
                     generatedDisplayId, project.getId());
        }
        
        TestCase savedEntity = testCaseRepository.save(entity);

        // 저장 후 작성자/수정자 정보 확인 로그
        log.info("신규 테스트케이스 저장 완료: id={}, name={}, createdBy={}, updatedBy={}",
                 savedEntity.getId(), savedEntity.getName(),
                 savedEntity.getCreatedBy(), savedEntity.getUpdatedBy());

        // ICT-349: 새 테스트케이스 생성 시 초기 버전 생성 이벤트 발행
        try {
            TestCaseVersionEvent event = new TestCaseVersionEvent(
                this, savedEntity.getId(), "CREATE", "초기 테스트케이스 생성");
            eventPublisher.publishEvent(event);
            log.info("ICT-349: 테스트케이스 생성 이벤트 발행: {}", savedEntity.getId());
        } catch (Exception e) {
            log.error("ICT-349: 테스트케이스 생성 이벤트 발행 실패: {}, error: {}", savedEntity.getId(), e.getMessage());
        }

        return savedEntity;
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

        // 중복 이름 검증 (자기 자신 제외) - 빈 문자열도 NULL로 처리
        String normalizedParentId = (testCaseDto.getParentId() == null || testCaseDto.getParentId().trim().isEmpty())
                                    ? null : testCaseDto.getParentId().trim();
        String normalizedName = testCaseDto.getName() != null ? testCaseDto.getName().trim() : "";

        // 중복 검증 비활성화 - 스프레드시트 일괄 수정 시 순서 문제로 false positive 발생
        // 다른 폴더에 같은 이름 허용, 같은 폴더 내에서만 중복 체크하지만 일괄 수정 시 충돌 발생
        log.debug("중복 검증 스킵 - projectId: {}, name: '{}', parentId: '{}', type: {}, excludeId: {}",
                testCaseDto.getProjectId(), normalizedName, normalizedParentId, testCaseDto.getType(), id);

        if (!errors.isEmpty()) {
            throw new ResourceNotValidException("Validation failed", errors);
        }

        TestCase entity = testCaseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("TestCase not found"));
        
        // 기존 parentId 저장
        String oldParentId = entity.getParentId();
        
        TestCaseMapper.updateEntityFromDto(testCaseDto, entity);
        entity.setProject(project);

        // parentId가 변경되었으면 displayOrder 재조정
        String newParentId = entity.getParentId();
        boolean parentChanged = !Objects.equals(oldParentId, newParentId);

        if (parentChanged) {
            // 현재 테스트케이스를 제외한 최대 displayOrder 구하기
            Integer maxOrder = testCaseRepository.findByParentIdOrderByDisplayOrder(newParentId)
                    .stream()
                    .filter(tc -> !tc.getId().equals(entity.getId())) // 현재 테스트케이스 제외
                    .mapToInt(TestCase::getDisplayOrder)
                    .max()
                    .orElse(0);
            entity.setDisplayOrder(maxOrder + 1);
            log.info("테스트케이스 폴더 이동: {} -> {}, 새 displayOrder: {}",
                    oldParentId, newParentId, entity.getDisplayOrder());
        } else if (testCaseDto.getDisplayOrder() == null) {
            // displayOrder가 null이면 기존 값 유지 (변경 없음)
            // 이미 entity에 기존 displayOrder가 있으므로 아무것도 하지 않음
        }

        entity.setUpdatedAt(LocalDateTime.now());

        // 수정자 정보 설정
        String currentUser = getCurrentUsername();
        entity.setUpdatedBy(currentUser);
        log.info("테스트케이스 수정자 정보 설정: id={}, updatedBy={}", entity.getId(), currentUser);

        // ICT-341: Display ID는 기존 테스트케이스 수정 시에는 변경하지 않음
        // (Display ID는 생성 시에만 할당되고 이후 변경되지 않음)

        // displayOrder 충돌 처리: 같은 parentId 내에서 중복 발생 시 자동 재조정
        TestCase updatedEntity;
        try {
            updatedEntity = testCaseRepository.save(entity);
        } catch (Exception e) {
            // displayOrder 충돌 발생 시 자동으로 최대값+1로 재할당
            // 예외 메시지 전체를 문자열로 변환하여 검사 (중첩된 예외 포함)
            String fullErrorMessage = e.toString() + (e.getCause() != null ? e.getCause().toString() : "");
            if (fullErrorMessage.contains("UKL7WIR8HGJNYHVRMU717NSRTYY") ||
                fullErrorMessage.contains("DISPLAY_ORDER") ||
                fullErrorMessage.contains("23505")) {
                log.warn("displayOrder 충돌 발생, 자동 재조정: parentId={}, displayOrder={}, error={}",
                        entity.getParentId(), entity.getDisplayOrder(), e.getMessage());
                Integer maxOrder = testCaseRepository.findByParentIdOrderByDisplayOrder(entity.getParentId())
                        .stream()
                        .filter(tc -> !tc.getId().equals(entity.getId()))
                        .mapToInt(TestCase::getDisplayOrder)
                        .max()
                        .orElse(0);
                entity.setDisplayOrder(maxOrder + 1);
                log.info("displayOrder 자동 재할당: {} -> {}", testCaseDto.getDisplayOrder(), entity.getDisplayOrder());
                updatedEntity = testCaseRepository.save(entity);
            } else {
                log.error("Update failed with non-displayOrder error: {}", fullErrorMessage);
                throw e; // 다른 예외는 그대로 던짐
            }
        }

        // 저장 후 수정자 정보 확인 로그
        log.info("테스트케이스 업데이트 완료: id={}, name={}, updatedBy={}, createdBy={}",
                 updatedEntity.getId(), updatedEntity.getName(),
                 updatedEntity.getUpdatedBy(), updatedEntity.getCreatedBy());

        // ICT-349: 테스트케이스 수정 시 새 버전 생성 이벤트 발행
        try {
            String changeSummary = generateChangeSummary(testCaseDto);
            TestCaseVersionEvent event = new TestCaseVersionEvent(
                this, updatedEntity.getId(), "UPDATE", changeSummary);
            eventPublisher.publishEvent(event);
            log.info("ICT-349: 테스트케이스 수정 이벤트 발행: {}", updatedEntity.getId());
        } catch (Exception e) {
            log.error("ICT-349: 테스트케이스 수정 이벤트 발행 실패: {}, error: {}", updatedEntity.getId(), e.getMessage());
        }

        return updatedEntity;
    }

    private TestCaseDto toDtoWithParentName(TestCase entity) {
        TestCaseDto dto = TestCaseMapper.toDto(entity);
        if (entity.getParentId() == null) {
            dto.setParentName("상위없음");
        } else {
            // 전체 폴더 경로 구성
            String fullPath = buildFullFolderPath(entity.getParentId());
            dto.setParentName(fullPath);
        }
        return dto;
    }

    /**
     * 테스트케이스의 전체 폴더 경로를 구성합니다.
     * 예: "폴더A >> 하위폴더1 >> 하위폴더2"
     */
    private String buildFullFolderPath(String parentId) {
        if (parentId == null) {
            return "상위없음";
        }
        
        List<String> pathElements = new ArrayList<>();
        String currentId = parentId;
        
        // 루트까지 거슬러 올라가며 경로 구성
        while (currentId != null) {
            Optional<TestCase> parentOpt = testCaseRepository.findById(currentId);
            if (parentOpt.isPresent()) {
                TestCase parent = parentOpt.get();
                pathElements.add(parent.getName());
                currentId = parent.getParentId();
            } else {
                break;
            }
        }
        
        // 경로 역순으로 정렬 (루트 -> 리프)
        Collections.reverse(pathElements);
        
        // ">>" 구분자로 연결
        return pathElements.isEmpty() ? "상위없음" : String.join(" >> ", pathElements);
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

                testCaseRepository.save(tc);
                testCases.add(tc);
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

    @Transactional
    public List<TestCase> importFromGoogleSheet(String spreadsheetId, String sheetName, String projectId, CsvMappingConfig config)
            throws IOException, GeneralSecurityException {

        Optional<Project> projectOpt = projectRepository.findById(projectId);
        if (!projectOpt.isPresent())
            throw new IllegalArgumentException("Invalid project ID: " + projectId);
        Project project = projectOpt.get();

        if (config.getFieldMappings() == null || config.getFieldMappings().isEmpty()) {
            throw new ResourceNotValidException("No field mappings", Map.of("fieldMappings", "No field mappings"));
        }

        Sheets sheetsService = SheetsServiceUtil.getSheetsService();

        // 1. Spreadsheet(문서) 존재 확인
        Spreadsheet spreadsheet;
        try {
            spreadsheet = sheetsService.spreadsheets().get(spreadsheetId).execute();
        } catch (GoogleJsonResponseException e) {
            if (e.getStatusCode() == 404) {
                throw new ResourceNotValidException(
                        "구글시트 문서(spreadsheetId)가 존재하지 않습니다: " + spreadsheetId,
                        Map.of("entity", "spreadsheet", "spreadsheetId", spreadsheetId)
                );
            }
            throw e;
        }

        // 2. Sheet(탭) 존재 확인
        boolean sheetFound = spreadsheet.getSheets().stream()
                .anyMatch(sheet -> sheetName.equals(sheet.getProperties().getTitle()));
        if (!sheetFound) {
            throw new ResourceNotValidException(
                    "구글시트 시트명(sheetName)이 존재하지 않습니다: " + sheetName,
                    Map.of("entity", "sheet", "sheetName", sheetName)
            );
        }

        // 3. 데이터 읽기
        String range = sheetName + "!A1:Z1000"; // 필요에 따라 컬럼 범위 조정
        ValueRange response;
        try {
            response = sheetsService.spreadsheets().values().get(spreadsheetId, range).execute();
        } catch (GoogleJsonResponseException e) {
            throw new ResourceNotValidException(
                    "구글시트 데이터 조회 실패: " + e.getDetails().getMessage(),
                    Map.of("entity", "sheet", "sheetName", sheetName)
            );
        }
        List<List<Object>> sheetValues = response.getValues();

        if (sheetValues == null || sheetValues.isEmpty()) {
            throw new ResourceNotValidException(
                    "Google Sheet is empty",
                    Map.of("entity", "sheet", "sheetName", sheetName)
            );
        }

        // 헤더 추출
        List<String> headers = new ArrayList<>();
        for (Object cell : sheetValues.get(0)) {
            headers.add(cell.toString().trim());
        }

        // 데이터 파싱
        List<Map<String, String>> rows = new ArrayList<>();
        for (int i = 1; i < sheetValues.size(); i++) {
            List<Object> row = sheetValues.get(i);
            Map<String, String> rowMap = new HashMap<>();
            for (int j = 0; j < headers.size(); j++) {
                String value = (j < row.size()) ? row.get(j).toString() : "";
                rowMap.put(headers.get(j), value);
            }
            rows.add(rowMap);
        }

        List<TestCase> testCases = new ArrayList<>();
        List<Map<String, Object>> errors = new ArrayList<>();
        String importFolderId = null;
        TestCase importFolder = null;

        // Import 폴더 처리 (기존 import와 동일)
        Optional<TestCase> importFolderOpt = testCaseRepository
                .findByProjectIdAndType(projectId, "folder")
                .stream()
                .filter(tc -> "Import".equals(tc.getName()))
                .findFirst();

        if (importFolderOpt.isPresent()) {
            importFolder = importFolderOpt.get();
            importFolderId = importFolder.getId();
        } else {
            importFolder = new TestCase();
            importFolder.setName("Import");
            importFolder.setType("folder");
            importFolder.setProject(project);
            importFolder.setCreatedAt(LocalDateTime.now());
            importFolder.setUpdatedAt(LocalDateTime.now());
            importFolder.setDisplayOrder(1);
            importFolder.setDescription("Google Sheet Import");
            testCaseRepository.save(importFolder);
            importFolderId = importFolder.getId();
        }

        Map<String, Integer> parentMaxOrderMap = new HashMap<>();
        for (int i = 0; i < rows.size(); i++) {
            Map<String, String> row = rows.get(i);
            try {
                String parentId = row.getOrDefault("parentId", null);
                if (parentId == null || parentId.isEmpty()) parentId = importFolderId;

                if (!parentMaxOrderMap.containsKey(parentId)) {
                    Integer maxOrder = testCaseRepository.findMaxDisplayOrderByParentId(parentId);
                    parentMaxOrderMap.put(parentId, maxOrder == null ? 0 : maxOrder);
                }
                int nextOrder = parentMaxOrderMap.get(parentId) + 1;
                parentMaxOrderMap.put(parentId, nextOrder);

                TestCase tc = buildTestCase(row, project, config);
                tc.setParentId(parentId);
                tc.setCreatedAt(LocalDateTime.now());
                tc.setUpdatedAt(LocalDateTime.now());
                tc.setDisplayOrder(nextOrder);

                testCaseRepository.save(tc);
                testCases.add(tc);
            } catch (Exception e) {
                errors.add(Map.of("row", i + 1, "data", row, "message", e.getMessage()));
            }
        }
        if (!errors.isEmpty()) {
            throw new ResourceNotValidException("Google Sheet import failed", Map.of("errors", errors.toString()));
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
    @Transactional
    public void exportTestCasesToGoogleSheet(String SPREADSHEET_ID, String SHEET_NAME) throws IOException, GeneralSecurityException {
        String RANGE = SHEET_NAME + "!A1";
        List<TestCase> testCases = getAllTestCases();

        List<List<Object>> values = new ArrayList<>();
        // 헤더 정의 (요구 순서)
        values.add(List.of(
                "ProjectID", "ID", "프로젝트이름", "Type", "Displayorder", "Name", "Description",
                "Precondition", "Stepnumber", "StepDescription", "StepExpectedResult", "Expectresult"
        ));

        for (TestCase tc : testCases) {
            String projectId = tc.getProject() != null ? tc.getProject().getId() : "";
            String projectName = tc.getProject() != null ? tc.getProject().getName() : "";
            String precondition = tc.getPreCondition() != null ? tc.getPreCondition() : "";
            String expectedResults = tc.getExpectedResults() != null ? tc.getExpectedResults() : "";

            // 줄바꿈(\n) 포함 값은 그대로 사용
            String description = tc.getDescription() != null ? tc.getDescription() : "";

            List<TestStep> steps = tc.getSteps();
            if (steps != null && !steps.isEmpty()) {
                for (TestStep step : steps) {
                    String stepDescription = step.getDescription() != null ? step.getDescription() : "";
                    String stepExpectedResult = step.getExpectedResult() != null ? step.getExpectedResult() : "";

                    values.add(List.of(
                            projectId,
                            tc.getId(),
                            projectName,
                            tc.getType(),
                            tc.getDisplayOrder() != null ? tc.getDisplayOrder() : "",
                            tc.getName(),
                            description,
                            precondition,
                            step.getStepNumber(),
                            stepDescription,
                            stepExpectedResult,
                            expectedResults
                    ));
                }
            } else {
                // 스텝이 없는 경우 빈 값으로
                values.add(List.of(
                        projectId,
                        tc.getId(),
                        projectName,
                        tc.getType(),
                        tc.getDisplayOrder() != null ? tc.getDisplayOrder() : "",
                        tc.getName(),
                        description,
                        precondition,
                        "", // Stepnumber
                        "", // StepDescription
                        "", // StepExpectedResult
                        expectedResults
                ));
            }
        }

        Sheets sheetsService = SheetsServiceUtil.getSheetsService();
        // 기존 데이터 클리어
        sheetsService.spreadsheets().values()
                .clear(SPREADSHEET_ID, SHEET_NAME, new ClearValuesRequest())
                .execute();

        // 데이터 작성
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

    /**
     * ICT-349: 테스트케이스 변경 사항 요약 생성
     */
    private String generateChangeSummary(TestCaseDto dto) {
        StringBuilder summary = new StringBuilder();
        
        if (dto.getName() != null) {
            summary.append("테스트케이스명 수정; ");
        }
        if (dto.getDescription() != null) {
            summary.append("설명 수정; ");
        }
        if (dto.getSteps() != null && !dto.getSteps().isEmpty()) {
            summary.append("테스트 스텝 수정(").append(dto.getSteps().size()).append("개); ");
        }
        if (dto.getExpectedResults() != null) {
            summary.append("예상 결과 수정; ");
        }
        // Priority field is not available in TestCaseDto, skip this check
        if (dto.getParentId() != null) {
            summary.append("폴더 이동; ");
        }
        
        String result = summary.toString();
        if (result.endsWith("; ")) {
            result = result.substring(0, result.length() - 2);
        }
        
        return result.isEmpty() ? "테스트케이스 수정" : result;
    }

    /**
     * 배치 저장 메서드
     * ICT-373: 스프레드시트 일괄 저장 배치 처리 최적화
     *
     * JPA의 saveAll()과 flush()를 사용하여 bulk insert/update 최적화
     *
     * @param testCaseDtos 저장할 테스트케이스 목록
     * @return 배치 저장 결과
     */
    @Transactional
    public com.testcase.testcasemanagement.dto.BatchSaveResult batchSaveTestCases(
            List<com.testcase.testcasemanagement.dto.TestCaseDto> testCaseDtos) {

        com.testcase.testcasemanagement.dto.BatchSaveResult.BatchSaveResultBuilder resultBuilder =
            com.testcase.testcasemanagement.dto.BatchSaveResult.builder()
                .totalCount(testCaseDtos.size())
                .successCount(0)
                .failureCount(0);

        List<com.testcase.testcasemanagement.dto.TestCaseDto> savedTestCases = new ArrayList<>();
        List<com.testcase.testcasemanagement.dto.BatchSaveResult.BatchError> errors = new ArrayList<>();

        try {
            // 1단계: DTO를 Entity로 변환 (유효성 검사 포함)
            List<TestCase> testCaseEntities = new ArrayList<>();
            Map<Integer, com.testcase.testcasemanagement.dto.TestCaseDto> indexToDtoMap = new HashMap<>();

            for (int i = 0; i < testCaseDtos.size(); i++) {
                com.testcase.testcasemanagement.dto.TestCaseDto dto = testCaseDtos.get(i);
                try {
                    // 현재 사용자 정보 (공통 사용)
                    String currentUser = getCurrentUsername();

                    // 기존 엔티티 찾기 또는 새 엔티티 생성
                    TestCase entity;
                    boolean isNewEntity = (dto.getId() == null || dto.getId().startsWith("temp-"));

                    if (!isNewEntity) {
                        // 기존 테스트케이스 업데이트
                        entity = testCaseRepository.findById(dto.getId())
                            .orElseThrow(() -> new IllegalArgumentException("테스트케이스를 찾을 수 없습니다: " + dto.getId()));

                        // 기존 엔티티 업데이트
                        updateEntityFromDto(entity, dto);

                        // 수정자 정보 설정
                        entity.setUpdatedBy(currentUser);
                        log.info("배치 저장 - 기존 테스트케이스 수정자 정보 설정: id={}, name={}, updatedBy={}",
                                 entity.getId(), dto.getName(), currentUser);

                    } else {
                        // 새 테스트케이스 생성
                        entity = com.testcase.testcasemanagement.mapper.TestCaseMapper.toEntity(dto);

                        // ICT-373: UUID를 사전에 생성하여 배치 처리 최적화
                        if (entity.getId() == null || entity.getId().startsWith("temp-")) {
                            entity.setId(java.util.UUID.randomUUID().toString());
                        }

                        // 프로젝트 설정
                        if (dto.getProjectId() != null) {
                            entity.setProject(projectRepository.findById(dto.getProjectId())
                                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + dto.getProjectId())));
                        }

                        // 부모 설정
                        if (dto.getParentId() != null && !dto.getParentId().isEmpty()) {
                            entity.setParentId(dto.getParentId());
                        }

                        // 기본값 설정
                        entity.setCreatedAt(java.time.LocalDateTime.now());

                        // 작성자 정보 설정 (신규 생성)
                        entity.setCreatedBy(currentUser);
                        entity.setUpdatedBy(currentUser);
                        log.info("배치 저장 - 신규 테스트케이스 작성자 정보 설정: name={}, createdBy={}, updatedBy={}",
                                 dto.getName(), currentUser, currentUser);
                    }

                    // 모든 항목에 대해 업데이트 시간 설정
                    entity.setUpdatedAt(java.time.LocalDateTime.now());
                    testCaseEntities.add(entity);
                    indexToDtoMap.put(i, dto);

                } catch (Exception e) {
                    log.error("DTO 변환 실패 [{}/{}]: {} - {}",
                        i + 1, testCaseDtos.size(), dto.getName(), e.getMessage());

                    errors.add(com.testcase.testcasemanagement.dto.BatchSaveResult.BatchError.builder()
                        .index(i)
                        .testCaseName(dto.getName())
                        .errorMessage("데이터 검증 실패: " + e.getMessage())
                        .errorDetails(e.getClass().getSimpleName())
                        .build());
                }
            }

            // 2단계: JPA saveAll()로 bulk insert/update 실행
            if (!testCaseEntities.isEmpty()) {
                List<TestCase> savedEntities = testCaseRepository.saveAll(testCaseEntities);
                testCaseRepository.flush(); // 즉시 DB에 반영

                // 저장된 엔티티 작성자/수정자 정보 확인 (샘플 로그)
                if (!savedEntities.isEmpty()) {
                    TestCase firstEntity = savedEntities.get(0);
                    log.info("배치 저장 샘플 확인 - 첫 번째 엔티티: id={}, name={}, createdBy={}, updatedBy={}",
                             firstEntity.getId(), firstEntity.getName(),
                             firstEntity.getCreatedBy(), firstEntity.getUpdatedBy());
                }

                // 저장된 엔티티를 DTO로 변환
                for (TestCase savedEntity : savedEntities) {
                    savedTestCases.add(com.testcase.testcasemanagement.mapper.TestCaseMapper.toDto(savedEntity));
                }
            }

        } catch (Exception e) {
            log.error("배치 저장 중 예외 발생", e);
            throw new RuntimeException("배치 저장 실패: " + e.getMessage(), e);
        }

        int successCount = savedTestCases.size();
        int failureCount = errors.size();

        return resultBuilder
            .successCount(successCount)
            .failureCount(failureCount)
            .savedTestCases(savedTestCases)
            .errors(errors)
            .build();
    }

    /**
     * DTO에서 Entity로 업데이트
     * ICT-373: 배치 처리를 위한 헬퍼 메서드
     */
    private void updateEntityFromDto(TestCase entity, com.testcase.testcasemanagement.dto.TestCaseDto dto) {
        if (dto.getName() != null) entity.setName(dto.getName());
        if (dto.getDescription() != null) entity.setDescription(dto.getDescription());
        if (dto.getPreCondition() != null) entity.setPreCondition(dto.getPreCondition());
        if (dto.getExpectedResults() != null) entity.setExpectedResults(dto.getExpectedResults());
        if (dto.getDisplayOrder() != null) entity.setDisplayOrder(dto.getDisplayOrder());
        if (dto.getType() != null) entity.setType(dto.getType());

        // 스텝 업데이트
        if (dto.getSteps() != null) {
            entity.getSteps().clear();
            entity.getSteps().addAll(
                com.testcase.testcasemanagement.mapper.TestCaseMapper.toEntity(dto).getSteps()
            );
        }

        // 부모 업데이트
        if (dto.getParentId() != null) {
            entity.setParentId(dto.getParentId());
        }
    }

    /**
     * 현재 로그인한 사용자의 username을 가져옴
     * @return 현재 사용자의 username, 없으면 "system"
     */
    private String getCurrentUsername() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {
                return authentication.getName();
            }
        } catch (Exception e) {
            log.warn("현재 사용자 정보를 가져오는데 실패했습니다: {}", e.getMessage());
        }
        return "system";
    }
}
