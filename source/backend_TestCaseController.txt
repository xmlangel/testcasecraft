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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


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
            ObjectMapper objectMapper
    ) {
        this.testCaseService = testCaseService;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public List<TestCaseDto> getAllTestCases() {
        return testCaseService.getAllTestCasesWithParentName();
    }

    @GetMapping("/tree")
    public List<TestCaseDto> getTestCaseTree() {
        return TestCaseMapper.toTreeDtoList(testCaseService.getAllTestCases());
    }

    @PostMapping
    public ResponseEntity<?> createTestCase(@Valid @RequestBody TestCaseDto testCaseDto) {
        try {
            // displayOrder 자동 할당을 위해 서비스에서 처리
            TestCase savedEntity = testCaseService.saveTestCase(testCaseDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(TestCaseMapper.toDto(savedEntity));
        } catch (ResourceNotValidException e) {
            return ResponseEntity.badRequest().body(e.getErrors());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Server error"));
        }
    }

    //테스트 케이스 수정
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTestCase(
            @PathVariable String id,
            @Valid @RequestBody TestCaseDto testCaseDto
    ) {
        try {
            // 서비스에서 검증 및 업데이트 처리
            TestCase updatedEntity = testCaseService.updateTestCase(id, testCaseDto);
            return ResponseEntity.ok(TestCaseMapper.toDto(updatedEntity));
        } catch (ResourceNotValidException e) {
            return ResponseEntity.badRequest().body(e.getErrors());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Server error"));
        }
    }

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

    // 테스트 케이스 ID로 단건 조회
    @GetMapping("/{id}")
    public ResponseEntity<TestCaseDto> getTestCaseById(@PathVariable String id) {
        try {
            return ResponseEntity.ok(testCaseService.getTestCaseDtoById(id));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 프로젝트 ID로 테스트 케이스 전체 조회
    @GetMapping("/project/{projectId}")
    public List<TestCaseDto> getTestCasesByProjectId(@PathVariable String projectId) {
        List<TestCase> entities = testCaseService.getTestCasesByProjectId(projectId);
        return TestCaseMapper.toTreeDtoList(entities); // 계층형 DTO로 변환
    }


    @PostMapping("/import/csv")
    public ResponseEntity<?> importTestCases(
            @RequestParam("file") MultipartFile file,
            @RequestParam("projectId") String projectId,
            @RequestParam(value = "mapping", required = false) String mappingJson) {

        if (file.getSize() > 10 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("error", "File size exceeds 10MB limit"));
        }

        try {
            CsvMappingConfig config = parseMappingJson(mappingJson);
            var imported = testCaseService.importFromCsv(file.getInputStream(), projectId, config);
            return ResponseEntity.ok(imported);
        } catch (TestCaseService.CsvImportException e) {
            // CSV 오류 상세 정보 반환
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage(),
                    "details", e.getErrors()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "Processing failed",
                    "message", e.getMessage()
            ));
        }
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

}


