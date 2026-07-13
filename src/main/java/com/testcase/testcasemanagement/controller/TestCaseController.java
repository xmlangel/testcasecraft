// src/main/java/com/testcase/testcasemanagement/controller/TestCaseController.java

package com.testcase.testcasemanagement.controller;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.dto.CrossProjectTransferRequest;
import com.testcase.testcasemanagement.dto.CrossProjectTransferResultDto;
import com.testcase.testcasemanagement.dto.ExportRequestDto;
import com.testcase.testcasemanagement.dto.ImportValidationResultDto;
import com.testcase.testcasemanagement.dto.TestCaseDto;
import com.testcase.testcasemanagement.dto.TestCaseMoveBatchRequest;
import com.testcase.testcasemanagement.dto.TestCaseMoveRequest;
import com.testcase.testcasemanagement.dto.TestCaseMoveResultDto;
import com.testcase.testcasemanagement.exception.ResourceNotValidException;
import com.testcase.testcasemanagement.mapper.TestCaseMapper;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.service.TestCaseAiGenerationService;
import com.testcase.testcasemanagement.service.TestCaseCrossProjectService;
import com.testcase.testcasemanagement.service.TestCaseService;
import com.testcase.testcasemanagement.service.TestCaseTreeMoveService;
import com.testcase.testcasemanagement.service.TestCaseTreeMoveService.CrossProjectMoveException;
import com.testcase.testcasemanagement.service.TestCaseTreeMoveService.MoveForbiddenException;
import com.testcase.testcasemanagement.service.TestCaseTreeMoveService.MoveNotFoundException;
import com.testcase.testcasemanagement.service.TestCaseTreeMoveService.MoveValidationException;
import com.testcase.testcasemanagement.service.TestCaseTreeMoveService.SystemFolderProtectedException;
import com.testcase.testcasemanagement.util.CsvMappingConfig;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.*;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Test Case - Management", description = "테스트케이스 관리 API")
@Slf4j
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/testcases")
public class TestCaseController {
  @Autowired private TestCaseRepository testCaseRepository;

  private final TestCaseService testCaseService;
  private final ObjectMapper objectMapper;
  private final TestCaseAiGenerationService testCaseAiGenerationService;
  private final TestCaseTreeMoveService testCaseTreeMoveService;
  private final TestCaseCrossProjectService testCaseCrossProjectService;

  public TestCaseController(
      TestCaseService testCaseService,
      ObjectMapper objectMapper,
      TestCaseAiGenerationService testCaseAiGenerationService,
      TestCaseTreeMoveService testCaseTreeMoveService,
      TestCaseCrossProjectService testCaseCrossProjectService) {
    this.testCaseService = testCaseService;
    this.objectMapper = objectMapper;
    this.testCaseAiGenerationService = testCaseAiGenerationService;
    this.testCaseTreeMoveService = testCaseTreeMoveService;
    this.testCaseCrossProjectService = testCaseCrossProjectService;
  }

  // ==================== Tree Drag-and-Drop Move APIs ====================
  // 설계: docs/plan/TREE_DND_REORGANIZE_PLAN.md
  // 기존 PUT /api/testcases/{id} 의 parentId 변경 경로는 그대로 유지되며,
  // 이 두 엔드포인트는 트리 DnD 전용 진입점으로 audit log를 남긴다.

  @Operation(
      summary = "테스트케이스 단건 이동 (DnD)",
      description =
          "트리 드래그앤드롭으로 폴더/케이스를 다른 부모로 이동하거나 같은 부모 내 순서를 변경합니다. beforeId/afterId 중 하나만 지정 가능. 모두"
              + " null이면 자식 끝에 추가.")
  @PostMapping("/{id}/move")
  public ResponseEntity<?> moveTestCase(
      @PathVariable String id, @RequestBody TestCaseMoveRequest request) {
    try {
      TestCaseMoveResultDto result = testCaseTreeMoveService.move(id, request);
      return ResponseEntity.ok(result);
    } catch (MoveValidationException e) {
      log.warn("move 검증 실패: id={}, msg={}", id, e.getMessage());
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    } catch (MoveNotFoundException e) {
      log.warn("move 대상 없음: id={}, msg={}", id, e.getMessage());
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
    } catch (MoveForbiddenException e) {
      log.warn("move 권한 없음: id={}, msg={}", id, e.getMessage());
      return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
    } catch (CrossProjectMoveException | SystemFolderProtectedException e) {
      log.warn("move 충돌: id={}, msg={}", id, e.getMessage());
      return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
    } catch (Exception e) {
      log.error("move 실패: id={}", id, e);
      return ResponseEntity.internalServerError()
          .body(Map.of("error", "서버 오류", "message", e.getMessage()));
    }
  }

  @Operation(
      summary = "테스트케이스 배치 이동 (DnD)",
      description =
          "다중 선택한 노드를 한 번의 트랜잭션으로 같은 부모로 이동합니다. ids 순서대로 displayOrder를 부여하며, 하나라도 실패하면 전체 롤백됩니다.")
  @PostMapping("/move-batch")
  public ResponseEntity<?> moveBatchTestCases(@RequestBody TestCaseMoveBatchRequest request) {
    try {
      TestCaseMoveResultDto result = testCaseTreeMoveService.moveBatch(request);
      return ResponseEntity.ok(result);
    } catch (MoveValidationException e) {
      log.warn("move-batch 검증 실패: msg={}", e.getMessage());
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    } catch (MoveNotFoundException e) {
      log.warn("move-batch 대상 없음: msg={}", e.getMessage());
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
    } catch (MoveForbiddenException e) {
      log.warn("move-batch 권한 없음: msg={}", e.getMessage());
      return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
    } catch (CrossProjectMoveException | SystemFolderProtectedException e) {
      log.warn("move-batch 충돌: msg={}", e.getMessage());
      return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
    } catch (Exception e) {
      log.error("move-batch 실패", e);
      return ResponseEntity.internalServerError()
          .body(Map.of("error", "서버 오류", "message", e.getMessage()));
    }
  }

  // ==================== Cross-Project Move / Copy APIs ====================
  // 다른 프로젝트로 테스트케이스를 이동(결과 미러링 포함)하거나 복사(케이스만)한다.
  // 같은-프로젝트 DnD 이동(위의 /move, /move-batch)과는 별개 경로다.

  @Operation(
      summary = "테스트케이스 다른 프로젝트로 이동 (결과 포함)",
      description =
          "선택한 케이스(폴더면 하위 전체)를 대상 프로젝트로 이동하고, 연결된 테스트 결과를 미러 실행으로 함께 옮긴다. 출발/대상 프로젝트 모두 편집 권한이"
              + " 필요하다.")
  @PostMapping("/cross-project/move")
  public ResponseEntity<?> moveToProject(@Valid @RequestBody CrossProjectTransferRequest request) {
    try {
      CrossProjectTransferResultDto result = testCaseCrossProjectService.moveToProject(request);
      return ResponseEntity.ok(result);
    } catch (MoveValidationException e) {
      log.warn("cross-move 검증 실패: msg={}", e.getMessage());
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    } catch (MoveNotFoundException e) {
      log.warn("cross-move 대상 없음: msg={}", e.getMessage());
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
    } catch (MoveForbiddenException e) {
      log.warn("cross-move 권한 없음: msg={}", e.getMessage());
      return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
    } catch (CrossProjectMoveException | SystemFolderProtectedException e) {
      log.warn("cross-move 충돌: msg={}", e.getMessage());
      return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
    } catch (Exception e) {
      log.error("cross-move 실패", e);
      return ResponseEntity.internalServerError()
          .body(Map.of("error", "서버 오류", "message", String.valueOf(e.getMessage())));
    }
  }

  @Operation(
      summary = "테스트케이스 다른 프로젝트로 복사 (케이스만)",
      description =
          "선택한 케이스(폴더면 하위 전체)를 대상 프로젝트로 복제한다. 테스트 결과는 가져오지 않으며 출발 데이터는 변경되지 않는다. 출발 조회 권한 + 대상 편집"
              + " 권한이 필요하다.")
  @PostMapping("/cross-project/copy")
  public ResponseEntity<?> copyToProject(@Valid @RequestBody CrossProjectTransferRequest request) {
    try {
      CrossProjectTransferResultDto result = testCaseCrossProjectService.copyToProject(request);
      return ResponseEntity.ok(result);
    } catch (MoveValidationException e) {
      log.warn("cross-copy 검증 실패: msg={}", e.getMessage());
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    } catch (MoveNotFoundException e) {
      log.warn("cross-copy 대상 없음: msg={}", e.getMessage());
      return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
    } catch (MoveForbiddenException e) {
      log.warn("cross-copy 권한 없음: msg={}", e.getMessage());
      return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
    } catch (SystemFolderProtectedException e) {
      log.warn("cross-copy 충돌: msg={}", e.getMessage());
      return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
    } catch (Exception e) {
      log.error("cross-copy 실패", e);
      return ResponseEntity.internalServerError()
          .body(Map.of("error", "서버 오류", "message", String.valueOf(e.getMessage())));
    }
  }

  @Operation(summary = "모든 테스트케이스 조회", description = "시스템의 모든 테스트케이스를 조회합니다.")
  @GetMapping
  public List<TestCaseDto> getAllTestCases() {
    return testCaseService.getAllTestCasesWithParentName();
  }

  @Operation(summary = "테스트케이스 트리 조회", description = "테스트케이스를 트리 구조로 조회합니다.")
  @GetMapping("/tree")
  public List<TestCaseDto> getTestCaseTree() {
    return TestCaseMapper.toTreeDtoList(testCaseService.getAllTestCasesForTree());
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
    } catch (org.springframework.security.access.AccessDeniedException e) {
      // 인가 실패는 403으로 전달 (GlobalExceptionHandler가 처리) — 500으로 삼키지 않는다
      throw e;
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
      @PathVariable String id, @Valid @RequestBody TestCaseDto testCaseDto) {
    try {
      // 서비스에서 검증 및 업데이트 처리
      TestCase updatedEntity = testCaseService.updateTestCase(id, testCaseDto);
      return ResponseEntity.ok(TestCaseMapper.toDto(updatedEntity));
    } catch (ResourceNotValidException e) {
      log.warn("updateTestCase ResourceNotValidException: {}", e.getErrors());
      return ResponseEntity.badRequest().body(e.getErrors());
    } catch (IllegalArgumentException e) {
      log.warn("updateTestCase IllegalArgumentException: {}", e.getMessage());
      return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    } catch (org.springframework.security.access.AccessDeniedException e) {
      // 인가 실패는 403으로 전달 (GlobalExceptionHandler가 처리) — 500으로 삼키지 않는다
      throw e;
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
      com.testcase.testcasemanagement.dto.TestCaseBulkOperationDto result =
          testCaseService.batchDeleteTestCases(ids);

      return ResponseEntity.ok(result);
    } catch (org.springframework.security.access.AccessDeniedException e) {
      // 인가 실패는 403으로 전달 (GlobalExceptionHandler가 처리) — 500으로 삼키지 않는다
      throw e;
    } catch (Exception e) {
      log.error("일괄 삭제 중 오류 발생", e);
      return ResponseEntity.internalServerError()
          .body(Map.of("error", "일괄 삭제 중 서버 오류 발생", "message", e.getMessage()));
    }
  }

  // 테스트 케이스 ID로 단건 조회
  @Operation(summary = "테스트케이스 단건 조회", description = "ID로 특정 테스트케이스를 조회합니다.")
  @GetMapping("/{id}")
  public ResponseEntity<TestCaseDto> getTestCaseById(@PathVariable String id) {
    try {
      return ResponseEntity.ok(testCaseService.getTestCaseDtoById(id));
    } catch (org.springframework.security.access.AccessDeniedException e) {
      throw e;
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
   * 배치 저장 API ICT-373: 스프레드시트 일괄 저장 배치 처리 최적화
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
      com.testcase.testcasemanagement.dto.BatchSaveResult result =
          testCaseService.batchSaveTestCases(testCaseDtos);

      // 결과에 따라 적절한 HTTP 상태 코드 반환
      if (result.isSuccess()) {
        log.info("ICT-373: 배치 저장 성공 - {} / {}", result.getSuccessCount(), result.getTotalCount());
        return ResponseEntity.ok(result);
      } else {
        log.warn(
            "ICT-373: 배치 저장 부분 실패 - 성공: {}, 실패: {}",
            result.getSuccessCount(),
            result.getFailureCount());
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
      List<TestCase> imported =
          testCaseService.importFromCsv(file.getInputStream(), projectId, config);
      List<TestCaseDto> dtos =
          imported.stream().map(TestCaseMapper::toDto).collect(Collectors.toList());
      return ResponseEntity.ok(dtos);
    } catch (TestCaseService.CsvImportException e) {
      return ResponseEntity.badRequest()
          .body(Map.of("error", e.getMessage(), "details", e.getErrors()));
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
      List<TestCase> imported =
          testCaseService.importFromExcel(file.getInputStream(), projectId, config);

      List<TestCaseDto> dtos =
          imported.stream().map(TestCaseMapper::toDto).collect(Collectors.toList());

      return ResponseEntity.ok(dtos);
    } catch (TestCaseService.CsvImportException e) {
      return ResponseEntity.badRequest()
          .body(
              Map.of(
                  "error", e.getMessage(),
                  "details", e.getErrors()));
    } catch (Exception e) {
      return ResponseEntity.internalServerError()
          .body(Map.of("error", "Processing failed", "message", e.getMessage()));
    }
  }

  @Operation(summary = "Google Sheet 가져오기", description = "Google Sheet에서 테스트케이스를 가져옵니다.")
  @PostMapping("/import/google-sheet")
  public List<?> importFromGoogleSheet(
      @RequestParam String spreadsheetId,
      @RequestParam String sheetName,
      @RequestParam String projectId,
      @RequestBody CsvMappingConfig mapping)
      throws Exception {
    return testCaseService.importFromGoogleSheet(spreadsheetId, sheetName, projectId, mapping);
  }

  private CsvMappingConfig parseMappingJson(String mappingJson) {
    if (mappingJson == null || mappingJson.isBlank()) {
      return new CsvMappingConfig();
    }

    ObjectMapper mapper =
        new ObjectMapper()
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
        if (!converter.has("csvColumn")
            || !converter.has("targetField")
            || !converter.has("targetType")) {
          throw new IllegalArgumentException("converter 필드 형식이 올바르지 않습니다");
        }
      }
    }
  }

  public class InvalidMappingException extends RuntimeException {
    private static final long serialVersionUID = 1L;

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
      return ResponseEntity.ok(testCaseService.getProjectTags(projectId));
    } catch (org.springframework.security.access.AccessDeniedException e) {
      throw e;
    } catch (Exception e) {
      log.error("프로젝트 태그 조회 실패: projectId={}", projectId, e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  /**
   * DisplayID로 테스트 케이스 조회 (리다이렉트 지원)
   *
   * <p>이전 프로젝트 코드로 생성된 DisplayID로도 조회 가능하며, 리다이렉트된 경우 응답 헤더에 표시됩니다.
   *
   * @param projectId 프로젝트 ID
   * @param displayId DisplayID (현재 또는 이전)
   * @return 테스트 케이스 DTO
   */
  @Operation(
      summary = "DisplayID로 조회",
      description = "DisplayID(예: PROJ-123)로 테스트케이스를 조회합니다. 리다이렉트를 지원합니다.")
  @GetMapping("/projects/{projectId}/by-display-id/{displayId}")
  public ResponseEntity<TestCaseDto> getTestCaseByDisplayId(
      @PathVariable String projectId, @PathVariable String displayId) {

    Optional<TestCase> testCaseOpt =
        testCaseService.findByDisplayIdWithRedirect(displayId, projectId);

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

  // ==================== 샘플 파일 다운로드 ====================

  @Operation(summary = "샘플 CSV 다운로드", description = "테스트케이스 import용 샘플 CSV 파일을 다운로드합니다.")
  @GetMapping("/sample/csv")
  public ResponseEntity<byte[]> downloadSampleCsv() {
    try {
      byte[] data = testCaseService.generateSampleCsv();
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
      headers.setContentDispositionFormData("attachment", "sample_testcases.csv");
      return ResponseEntity.ok().headers(headers).body(data);
    } catch (Exception e) {
      return ResponseEntity.internalServerError().build();
    }
  }

  @Operation(summary = "샘플 Excel 다운로드", description = "테스트케이스 import용 샘플 Excel 파일을 다운로드합니다.")
  @GetMapping("/sample/excel")
  public ResponseEntity<byte[]> downloadSampleExcel() {
    try {
      byte[] data = testCaseService.generateSampleExcel();
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(
          MediaType.parseMediaType(
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
      headers.setContentDispositionFormData("attachment", "sample_testcases.xlsx");
      return ResponseEntity.ok().headers(headers).body(data);
    } catch (Exception e) {
      return ResponseEntity.internalServerError().build();
    }
  }

  @Operation(summary = "샘플 JSON 다운로드", description = "테스트케이스 import용 샘플 JSON 파일을 다운로드합니다.")
  @GetMapping("/sample/json")
  public ResponseEntity<byte[]> downloadSampleJson() {
    try {
      String json = testCaseService.generateSampleJson();
      byte[] data = json.getBytes(java.nio.charset.StandardCharsets.UTF_8);
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      headers.setContentDispositionFormData("attachment", "sample_testcases.json");
      return ResponseEntity.ok().headers(headers).body(data);
    } catch (Exception e) {
      return ResponseEntity.internalServerError().build();
    }
  }

  // ==================== 표준 형식 Import ====================

  @Operation(summary = "CSV 표준 가져오기", description = "표준 형식 CSV 파일에서 테스트케이스를 가져옵니다 (샘플 파일과 동일 형식).")
  @PostMapping("/import/csv-standard")
  public ResponseEntity<?> importTestCasesStandardCsv(
      @RequestParam("file") MultipartFile file, @RequestParam("projectId") String projectId) {
    if (file.getSize() > 5 * 1024 * 1024) {
      return ResponseEntity.badRequest().body(Map.of("error", "파일 크기가 5MB를 초과합니다"));
    }
    try {
      List<TestCase> imported =
          testCaseService.importFromStandardCsv(file.getInputStream(), projectId);
      List<TestCaseDto> dtos =
          imported.stream().map(TestCaseMapper::toDto).collect(Collectors.toList());
      return ResponseEntity.ok(Map.of("importedCount", dtos.size(), "items", dtos));
    } catch (TestCaseService.CsvImportException e) {
      return ResponseEntity.badRequest()
          .body(Map.of("error", e.getMessage(), "details", e.getErrors()));
    } catch (Exception e) {
      return ResponseEntity.internalServerError()
          .body(Map.of("error", "처리 실패", "message", e.getMessage()));
    }
  }

  @Operation(
      summary = "Excel 표준 가져오기",
      description = "표준 형식 Excel 파일에서 테스트케이스를 가져옵니다 (샘플 파일과 동일 형식).")
  @PostMapping("/import/excel-standard")
  public ResponseEntity<?> importTestCasesStandardExcel(
      @RequestParam("file") MultipartFile file, @RequestParam("projectId") String projectId) {
    if (file.getSize() > 10 * 1024 * 1024) {
      return ResponseEntity.badRequest().body(Map.of("error", "파일 크기가 10MB를 초과합니다"));
    }
    try {
      List<TestCase> imported =
          testCaseService.importFromStandardExcel(file.getInputStream(), projectId);
      List<TestCaseDto> dtos =
          imported.stream().map(TestCaseMapper::toDto).collect(Collectors.toList());
      return ResponseEntity.ok(Map.of("importedCount", dtos.size(), "items", dtos));
    } catch (TestCaseService.CsvImportException e) {
      return ResponseEntity.badRequest()
          .body(Map.of("error", e.getMessage(), "details", e.getErrors()));
    } catch (Exception e) {
      return ResponseEntity.internalServerError()
          .body(Map.of("error", "처리 실패", "message", e.getMessage()));
    }
  }

  @Operation(summary = "JSON 가져오기", description = "표준 형식 JSON 파일에서 테스트케이스를 가져옵니다.")
  @PostMapping("/import/json")
  public ResponseEntity<?> importTestCasesJson(
      @RequestParam("file") MultipartFile file, @RequestParam("projectId") String projectId) {
    if (file.getSize() > 5 * 1024 * 1024) {
      return ResponseEntity.badRequest().body(Map.of("error", "파일 크기가 5MB를 초과합니다"));
    }
    try {
      List<TestCase> imported = testCaseService.importFromJson(file.getInputStream(), projectId);
      List<TestCaseDto> dtos =
          imported.stream().map(TestCaseMapper::toDto).collect(Collectors.toList());
      return ResponseEntity.ok(Map.of("importedCount", dtos.size(), "items", dtos));
    } catch (TestCaseService.CsvImportException e) {
      return ResponseEntity.badRequest()
          .body(Map.of("error", e.getMessage(), "details", e.getErrors()));
    } catch (Exception e) {
      return ResponseEntity.internalServerError()
          .body(Map.of("error", "처리 실패", "message", e.getMessage()));
    }
  }

  @Operation(summary = "Import 사전 검증", description = "파일을 저장하지 않고 데이터 유효성만 검사합니다.")
  @PostMapping("/import/validate")
  public ResponseEntity<?> validateImportFile(
      @RequestParam("file") MultipartFile file,
      @RequestParam("format") String format,
      @RequestParam("projectId") String projectId) {
    try {
      ImportValidationResultDto result =
          testCaseService.validateImport(file.getInputStream(), format, projectId);
      return ResponseEntity.ok(result);
    } catch (Exception e) {
      return ResponseEntity.internalServerError()
          .body(Map.of("error", "검증 실패", "message", e.getMessage()));
    }
  }

  // ==================== Export (importable 표준 형식) ====================

  @Operation(summary = "CSV 내보내기", description = "프로젝트 테스트케이스를 importable CSV 형식으로 내보냅니다.")
  @GetMapping("/export/csv")
  public ResponseEntity<byte[]> exportTestCasesCsv(@RequestParam String projectId) {
    try {
      byte[] data = testCaseService.exportToCsvBytes(projectId);
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.parseMediaType("text/csv; charset=UTF-8"));
      headers.setContentDispositionFormData("attachment", "testcases_export.csv");
      return ResponseEntity.ok().headers(headers).body(data);
    } catch (org.springframework.security.access.AccessDeniedException e) {
      throw e;
    } catch (Exception e) {
      return ResponseEntity.internalServerError().build();
    }
  }

  @Operation(summary = "Excel 내보내기", description = "프로젝트 테스트케이스를 importable Excel 형식으로 내보냅니다.")
  @GetMapping("/export/excel")
  public ResponseEntity<byte[]> exportTestCasesExcel(@RequestParam String projectId) {
    try {
      byte[] data = testCaseService.exportToExcelBytes(projectId);
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(
          MediaType.parseMediaType(
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
      headers.setContentDispositionFormData("attachment", "testcases_export.xlsx");
      return ResponseEntity.ok().headers(headers).body(data);
    } catch (org.springframework.security.access.AccessDeniedException e) {
      throw e;
    } catch (Exception e) {
      return ResponseEntity.internalServerError().build();
    }
  }

  @Operation(summary = "JSON 내보내기", description = "프로젝트 테스트케이스를 importable JSON 형식으로 내보냅니다.")
  @GetMapping("/export/json")
  public ResponseEntity<byte[]> exportTestCasesJson(@RequestParam String projectId) {
    try {
      String json = testCaseService.exportToJsonString(projectId);
      byte[] data = json.getBytes(java.nio.charset.StandardCharsets.UTF_8);
      HttpHeaders headers = new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_JSON);
      headers.setContentDispositionFormData("attachment", "testcases_export.json");
      return ResponseEntity.ok().headers(headers).body(data);
    } catch (org.springframework.security.access.AccessDeniedException e) {
      throw e;
    } catch (Exception e) {
      return ResponseEntity.internalServerError().build();
    }
  }

  @Operation(summary = "Google Sheets 내보내기", description = "프로젝트 테스트케이스를 Google Sheets로 내보냅니다.")
  @PostMapping("/export/google-sheet")
  public ResponseEntity<?> exportTestCasesToGoogleSheet(
      @RequestBody ExportRequestDto request, Authentication authentication) {
    try {
      String userId = authentication.getName();
      testCaseService.exportToGoogleSheetByProject(
          request.getProjectId(), request.getGoogleSheetId(), request.getSheetName(), userId);
      return ResponseEntity.ok(
          Map.of(
              "message", "Google Sheets export 완료", "spreadsheetId", request.getGoogleSheetId()));
    } catch (Exception e) {
      return ResponseEntity.internalServerError()
          .body(Map.of("error", "Google Sheets export 실패", "message", e.getMessage()));
    }
  }

  // ==================== AI 메타 생성 ====================

  /**
   * AI를 이용한 테스트케이스 Name/Description 자동 생성
   *
   * <p>Step, ExpectedResult, PreCondition 정보를 받아 LLM으로 적절한 이름과 설명을 생성합니다.
   *
   * @param requestBody { steps: [{description, expectedResult}], preCondition, description }
   * @return { name, description }
   */
  @Operation(
      summary = "AI 메타 자동 생성",
      description = "Step/Expected/PreCondition 정보로 테스트케이스 Name과 Description을 AI가 자동 생성합니다.")
  @PostMapping("/ai/generate-meta")
  public ResponseEntity<?> generateMetaWithAi(@RequestBody Map<String, Object> requestBody) {
    try {
      @SuppressWarnings("unchecked")
      List<Map<String, String>> steps =
          (List<Map<String, String>>) requestBody.getOrDefault("steps", List.of());
      String preCondition = (String) requestBody.getOrDefault("preCondition", "");
      String existingDescription = (String) requestBody.getOrDefault("description", "");

      if (steps.isEmpty()) {
        return ResponseEntity.badRequest()
            .body(Map.of("error", "스텝 정보가 없습니다. 최소 1개 이상의 스텝을 입력해주세요."));
      }

      Map<String, String> result =
          testCaseAiGenerationService.generateMeta(steps, preCondition, existingDescription);

      log.info("✅ AI 메타 생성 성공: name='{}'", result.get("name"));
      return ResponseEntity.ok(result);

    } catch (IllegalStateException e) {
      // LLM 설정 없음
      log.warn("⚠️ AI 메타 생성 실패 - LLM 설정 없음: {}", e.getMessage());
      return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
          .body(Map.of("error", e.getMessage()));
    } catch (Exception e) {
      log.error("❌ AI 메타 생성 중 오류 발생", e);
      return ResponseEntity.internalServerError()
          .body(Map.of("error", "AI 생성 중 오류가 발생했습니다.", "message", e.getMessage()));
    }
  }
}
