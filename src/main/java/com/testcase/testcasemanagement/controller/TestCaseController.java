// src/main/java/com/testcase/testcasemanagement/controller/TestCaseController.java

package com.testcase.testcasemanagement.controller;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.JsonNode;
import com.testcase.testcasemanagement.dto.TestCaseDto;
import com.testcase.testcasemanagement.exception.ResourceNotValidException;
import com.testcase.testcasemanagement.mapper.TestCaseMapper;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.service.TestCaseService;
import com.testcase.testcasemanagement.util.CsvMappingConfig;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.*;
import java.util.stream.Collectors;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;

@Tag(name = "Test Case - Management", description = "테스트케이스 관리 API")
@Slf4j
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/testcases")
public class TestCaseController {
    @Autowired
    private TestCaseRepository testCaseRepository;

    private final TestCaseService testCaseService;
    private final ObjectMapper objectMapper;

    public TestCaseController(
            TestCaseService testCaseService,
            ObjectMapper objectMapper) {
        this.testCaseService = testCaseService;
        this.objectMapper = objectMapper;
    }

    @Operation(summary = "모든 테스트케이스 조회", description = "시스템의 모든 테스트케이스를 조회합니다.")
    @GetMapping
    public List<TestCaseDto> getAllTestCases() {
        return testCaseService.getAllTestCasesWithParentName();
    }

    @Operation(summary = "테스트케이스 트리 조회", description = "테스트케이스를 트리 구조로 조회합니다.")
    @GetMapping("/tree")
    public List<TestCaseDto> getTestCaseTree() {
        return TestCaseMapper.toTreeDtoList(testCaseService.getAllTestCases());
    }

    @Operation(summary = "테스트케이스 생성", description = "새로운 테스트케이스를 생성합니다.")
    @PostMapping
    public ResponseEntity<?> createTestCase(@Valid @RequestBody TestCaseDto testCaseDto) {
        try {
            TestCase savedEntity = testCaseService.saveTestCase(testCaseDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(TestCaseMapper.toDto(savedEntity));
        } catch (ResourceNotValidException e) {
            return ResponseEntity.badRequest().body(e.getErrors());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            // 예외의 메시지와 전체 스택트레이스를 문자열로 변환해서 응답에 포함
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            String stackTrace = sw.toString();
            Map<String, Object> errorInfo = new HashMap<>();
            errorInfo.put("error", "Server error");
            errorInfo.put("exception", e.getClass().getName());
            errorInfo.put("message", e.getMessage());
            errorInfo.put("stackTrace", stackTrace);
            return ResponseEntity.internalServerError().body(errorInfo);
        }
    }

    // 테스트 케이스 수정
    @Operation(summary = "테스트케이스 수정", description = "기존 테스트케이스 정보를 수정합니다.")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTestCase(
            @PathVariable String id,
            @Valid @RequestBody TestCaseDto testCaseDto) {
        try {
            // 서비스에서 검증 및 업데이트 처리
            TestCase updatedEntity = testCaseService.updateTestCase(id, testCaseDto);
            return ResponseEntity.ok(TestCaseMapper.toDto(updatedEntity));
        } catch (ResourceNotValidException e) {
            return ResponseEntity.badRequest().body(e.getErrors());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            // 예외의 메시지와 전체 스택트레이스를 문자열로 변환해서 응답에 포함
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            String stackTrace = sw.toString();
            Map<String, Object> errorInfo = new HashMap<>();
            errorInfo.put("error", "Server error in updateTestCase");
            errorInfo.put("exception", e.getClass().getName());
            errorInfo.put("message", e.getMessage());
            errorInfo.put("stackTrace", stackTrace);
            log.error("테스트케이스 업데이트 중 오류 발생 - ID: {}, 오류: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(errorInfo);
        }
    }

    @Operation(summary = "테스트케이스 삭제", description = "특정 테스트케이스를 삭제합니다.")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTestCase(@PathVariable String id) {
        Optional<TestCase> optionalTestCase = testCaseRepository.findById(id);
        if (optionalTestCase.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("{\"message\": \"TestCase not found\", \"id\": \"" + id + "\"}");
        }

        TestCase deleted = optionalTestCase.get();
        TestCaseDto dto = TestCaseMapper.toDto(deleted); // 세션 내에서 DTO 변환
        testCaseService.deleteTestCase(id);

        return ResponseEntity.ok(dto); // 미리 변환된 DTO 반환
    }

    /**
     * 테스트케이스 일괄 삭제 API
     * 
     * @param ids 삭제할 테스트케이스 ID 목록
     * @return 삭제 결과 (성공/실패 수)
     */
    @Operation(summary = "테스트케이스 일괄 삭제", description = "여러 테스트케이스를 한번에 삭제합니다.")
    @PostMapping("/batch/delete")
    public ResponseEntity<?> batchDeleteTestCases(@RequestBody List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "삭제할 ID 목록이 비어있습니다."));
        }

        try {
            log.info("일괄 삭제 요청: {}개 항목", ids.size());
            com.testcase.testcasemanagement.dto.TestCaseBulkOperationDto result = testCaseService
                    .batchDeleteTestCases(ids);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("일괄 삭제 중 오류 발생", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "일괄 삭제 중 서버 오류 발생",
                    "message", e.getMessage()));
        }
    }

    // 테스트 케이스 ID로 단건 조회
    @Operation(summary = "테스트케이스 단건 조회", description = "ID로 특정 테스트케이스를 조회합니다.")
    @GetMapping("/{id}")
    public ResponseEntity<TestCaseDto> getTestCaseById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(testCaseService.getTestCaseDtoById(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 프로젝트 ID로 테스트 케이스 전체 조회
    @Operation(summary = "프로젝트별 테스트케이스 조회", description = "특정 프로젝트에 속한 모든 테스트케이스를 조회합니다.")
    @GetMapping("/project/{projectId}")
    public List<TestCaseDto> getTestCasesByProjectId(@PathVariable String projectId) {
        List<TestCase> entities = testCaseService.getTestCasesByProjectId(projectId);
        return TestCaseMapper.toDtoList(entities);
    }

    /**
     * 배치 저장 API
     * ICT-373: 스프레드시트 일괄 저장 배치 처리 최적화
     *
     * @param testCaseDtos 저장할 테스트케이스 목록
     * @return 배치 저장 결과
     */
    @Operation(summary = "테스트케이스 일괄 저장", description = "여러 테스트케이스를 한번에 생성하거나 수정합니다.")
    @PostMapping("/batch")
    public ResponseEntity<?> batchSaveTestCases(@Valid @RequestBody List<TestCaseDto> testCaseDtos) {
        try {
            log.info("ICT-373: 배치 저장 요청 - {}개 테스트케이스", testCaseDtos.size());

            // 입력 검증
            if (testCaseDtos == null || testCaseDtos.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "테스트케이스 목록이 비어있습니다."));
            }

            // 배치 저장 실행
            com.testcase.testcasemanagement.dto.BatchSaveResult result = testCaseService
                    .batchSaveTestCases(testCaseDtos);

            // 결과에 따라 적절한 HTTP 상태 코드 반환
            if (result.isSuccess()) {
                log.info("ICT-373: 배치 저장 성공 - {} / {}", result.getSuccessCount(), result.getTotalCount());
                return ResponseEntity.ok(result);
            } else {
                log.warn("ICT-373: 배치 저장 부분 실패 - 성공: {}, 실패: {}",
                        result.getSuccessCount(), result.getFailureCount());
                return ResponseEntity.status(HttpStatus.PARTIAL_CONTENT).body(result);
            }

        } catch (Exception e) {
            log.error("ICT-373: 배치 저장 중 예외 발생", e);

            // 예외 정보를 포함한 에러 응답
            StringWriter sw = new StringWriter();
            e.printStackTrace(new PrintWriter(sw));
            String stackTrace = sw.toString();

            Map<String, Object> errorInfo = new HashMap<>();
            errorInfo.put("error", "배치 저장 중 서버 오류 발생");
            errorInfo.put("exception", e.getClass().getName());
            errorInfo.put("message", e.getMessage());
            errorInfo.put("stackTrace", stackTrace);

            return ResponseEntity.internalServerError().body(errorInfo);
        }
    }

    @Operation(summary = "CSV 가져오기", description = "CSV 파일에서 테스트케이스를 가져옵니다.")
    @PostMapping("/import/csv")
    public ResponseEntity<?> importTestCases(
            @RequestParam("file") MultipartFile file,
            @RequestParam("projectId") String projectId,
            @RequestParam(value = "mapping", required = false) String mappingJson) {
        log.warn("FileSize--------------------------->>>>" + String.valueOf(file.getSize()));
        if (file.getSize() > 2 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("error", "File size exceeds 2MB limit"));
        }
        try {
            CsvMappingConfig config = parseMappingJson(mappingJson);
            List<TestCase> imported = testCaseService.importFromCsv(file.getInputStream(), projectId, config);
            List<TestCaseDto> dtos = imported.stream()
                    .map(TestCaseMapper::toDto)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(dtos);
        } catch (TestCaseService.CsvImportException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage(), "details", e.getErrors()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Processing failed", "message", e.getMessage()));
        }
    }

    // ===== Excel Import API 추가 =====
    @Operation(summary = "Excel 가져오기", description = "Excel 파일에서 테스트케이스를 가져옵니다.")
    @PostMapping("/import/excel")
    public ResponseEntity<?> importTestCasesFromExcel(
            @RequestParam("file") MultipartFile file,
            @RequestParam("projectId") String projectId,
            @RequestParam(value = "mapping", required = false) String mappingJson) {

        if (file.getSize() > 10 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("error", "File size exceeds 10MB limit"));
        }

        try {
            CsvMappingConfig config = parseMappingJson(mappingJson);
            // Excel import는 서비스에서 구현되어야 함. (importFromExcel)
            List<TestCase> imported = testCaseService.importFromExcel(file.getInputStream(), projectId, config);

            List<TestCaseDto> dtos = imported.stream()
                    .map(TestCaseMapper::toDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(dtos);
        } catch (TestCaseService.CsvImportException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage(),
                    "details", e.getErrors()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Processing failed",
                    "message", e.getMessage()));
        }
    }

    @Operation(summary = "Google Sheet 가져오기", description = "Google Sheet에서 테스트케이스를 가져옵니다.")
    @PostMapping("/import/google-sheet")
    public List<?> importFromGoogleSheet(
            @RequestParam String spreadsheetId,
            @RequestParam String sheetName,
            @RequestParam String projectId,
            @RequestBody CsvMappingConfig mapping) throws Exception {
        return testCaseService.importFromGoogleSheet(spreadsheetId, sheetName, projectId, mapping);
    }

    private CsvMappingConfig parseMappingJson(String mappingJson) {
        if (mappingJson == null || mappingJson.isBlank()) {
            return new CsvMappingConfig();
        }

        ObjectMapper mapper = new ObjectMapper()
                .enable(JsonParser.Feature.INCLUDE_SOURCE_IN_LOCATION)
                .disable(JsonParser.Feature.ALLOW_SINGLE_QUOTES)
                .disable(JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES);

        try {
            JsonNode root = mapper.readTree(mappingJson);
            validateMappingJson(root);
            return mapper.treeToValue(root, CsvMappingConfig.class);
        } catch (JsonProcessingException e) {
            throw new InvalidMappingException("JSON 파싱 오류: " + e.getOriginalMessage());
        }
    }

    private void validateMappingJson(JsonNode root) {
        // 필수 필드 검증
        if (!root.has("fieldMappings")) {
            throw new IllegalArgumentException("fieldMappings 필드가 존재하지 않습니다");
        }

        JsonNode mappings = root.get("fieldMappings");
        if (mappings.isEmpty()) {
            throw new IllegalArgumentException("최소 하나의 필드 매핑이 필요합니다");
        }

        // 변환기 타입 검증
        if (root.has("converters")) {
            for (JsonNode converter : root.get("converters")) {
                if (!converter.has("csvColumn") ||
                        !converter.has("targetField") ||
                        !converter.has("targetType")) {
                    throw new IllegalArgumentException("converter 필드 형식이 올바르지 않습니다");
                }
            }
        }
    }

    public class InvalidMappingException extends RuntimeException {
        public InvalidMappingException(String message) {
            super(message);
        }
    }

    /**
     * 프로젝트의 모든 테스트케이스에서 사용된 태그 목록 조회
     * 
     * @param projectId 프로젝트 ID
     * @return 중복 제거된 태그 목록 (알파벳 순)
     */
    @Operation(summary = "프로젝트 태그 조회", description = "프로젝트 내에서 사용된 모든 테스트케이스 태그를 조회합니다.")
    @GetMapping("/projects/{projectId}/tags")
    public ResponseEntity<Set<String>> getProjectTags(@PathVariable String projectId) {
        try {
            List<TestCase> testCases = testCaseRepository.findByProjectId(projectId);
            Set<String> allTags = testCases.stream()
                    .filter(tc -> tc.getTags() != null)
                    .flatMap(tc -> tc.getTags().stream())
                    .filter(tag -> tag != null && !tag.trim().isEmpty())
                    .map(String::trim)
                    .collect(Collectors.toCollection(TreeSet::new)); // 알파벳 순 정렬

            return ResponseEntity.ok(allTags);
        } catch (Exception e) {
            log.error("프로젝트 태그 조회 실패: projectId={}", projectId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * DisplayID로 테스트 케이스 조회 (리다이렉트 지원)
     * 
     * 이전 프로젝트 코드로 생성된 DisplayID로도 조회 가능하며,
     * 리다이렉트된 경우 응답 헤더에 표시됩니다.
     * 
     * @param projectId 프로젝트 ID
     * @param displayId DisplayID (현재 또는 이전)
     * @return 테스트 케이스 DTO
     */
    @Operation(summary = "DisplayID로 조회", description = "DisplayID(예: PROJ-123)로 테스트케이스를 조회합니다. 리다이렉트를 지원합니다.")
    @GetMapping("/projects/{projectId}/by-display-id/{displayId}")
    public ResponseEntity<TestCaseDto> getTestCaseByDisplayId(
            @PathVariable String projectId,
            @PathVariable String displayId) {

        Optional<TestCase> testCaseOpt = testCaseService.findByDisplayIdWithRedirect(displayId, projectId);

        if (testCaseOpt.isPresent()) {
            TestCase testCase = testCaseOpt.get();
            TestCaseDto dto = TestCaseMapper.toDto(testCase);

            // 리다이렉트된 경우 헤더에 표시
            if (!testCase.getDisplayId().equals(displayId)) {
                return ResponseEntity.ok()
                        .header("X-Redirected-From", displayId)
                        .header("X-Redirected-To", testCase.getDisplayId())
                        .body(dto);
            }

            return ResponseEntity.ok(dto);
        }

        return ResponseEntity.notFound().build();
    }

}
