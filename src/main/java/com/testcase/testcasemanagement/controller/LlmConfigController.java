// src/main/java/com/testcase/testcasemanagement/controller/LlmConfigController.java
package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.ApiResponse;
import com.testcase.testcasemanagement.dto.llm.LlmConfigDTO;
import com.testcase.testcasemanagement.model.LlmConfig.LlmProvider;
import com.testcase.testcasemanagement.service.LlmConfigService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
// Swagger ApiResponse는 전체 경로 사용 (com.testcase...ApiResponse와 충돌 방지)
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * LLM 설정 관리 API 컨트롤러 (관리자 전용)
 *
 * OpenWebUI와 OpenAI API 연동 설정을 관리합니다.
 * 모든 API는 ADMIN 권한이 필요합니다.
 */
@Tag(name = "LLM - Configuration", description = "LLM 설정 관리 API (관리자 전용)")
@RestController
@RequestMapping("/api/llm-configs")
@RequiredArgsConstructor
@Slf4j
@SecurityRequirement(name = "bearerAuth")
public class LlmConfigController {

        private final LlmConfigService llmConfigService;

        @Operation(summary = "LLM 설정 가용성 확인", description = """
                        시스템에 기본값으로 설정된 활성 LLM이 있는지 확인합니다.

                        **권한**: 모든 인증된 사용자

                        **사용 목적**: AI 질의응답 기능 사용 전 기본 LLM 설정 존재 여부 확인

                        **참고**: AI 질의응답을 사용하려면 최소 1개의 LLM이 **기본값(default)**으로 설정되어 있어야 합니다.
                        """)
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 실패")
        })
        @GetMapping("/check-availability")
        public ResponseEntity<ApiResponse<Boolean>> checkAvailability() {
                log.info("🔍 LLM 설정 가용성 확인 요청");
                boolean hasDefaultConfig = llmConfigService.hasActiveConfig();

                String message = hasDefaultConfig
                                ? "기본 LLM 설정이 존재합니다."
                                : "기본 LLM 설정이 없습니다. 관리자가 LLM을 기본값으로 설정해야 합니다.";

                log.info("✅ LLM 설정 가용성 확인 완료: hasDefaultConfig={}, message={}", hasDefaultConfig, message);

                return ResponseEntity.ok(ApiResponse.success(hasDefaultConfig, message));
        }

        @Operation(summary = "모든 LLM 설정 조회", description = """
                        시스템에 등록된 모든 LLM 설정을 조회합니다 (활성화 여부 무관).
                        비활성화된 설정도 포함하여 관리자가 재활성화할 수 있도록 합니다.

                        **권한**: ADMIN
                        """)
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 실패"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "권한 없음 (ADMIN 필요)")
        })
        @GetMapping
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<List<LlmConfigDTO>>> getAllActiveConfigs() {
                log.info("📋 모든 LLM 설정 조회 요청 (활성화 여부 무관)");
                List<LlmConfigDTO> configs = llmConfigService.getAllConfigs();
                return ResponseEntity.ok(ApiResponse.success(configs));
        }

        @Operation(summary = "활성 LLM 설정 조회", description = """
                        현재 활성화되어 있는 LLM 설정만 조회합니다.

                        **권한**: ADMIN, MANAGER, TESTER, USER

                        일반 사용자도 RAG 기능을 사용할 때 필요한 최소 정보를 확인할 수 있도록
                        암호화된 API Key 대신 마스킹된 값만 반환합니다.
                        기본값(default)으로 지정된 설정만 전달됩니다.
                        """)
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 실패"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "권한 없음")
        })
        @GetMapping("/active")
        @PreAuthorize("hasAnyRole('ADMIN','MANAGER','TESTER','USER')")
        public ResponseEntity<ApiResponse<List<LlmConfigDTO>>> getActiveConfigsForUsers() {
                log.info("📋 활성 LLM 설정 조회 요청 (일반 사용자 포함)");
                List<LlmConfigDTO> configs = llmConfigService.getActiveConfigsForUsers();
                return ResponseEntity.ok(ApiResponse.success(configs));
        }

        @Operation(summary = "특정 LLM 설정 조회", description = """
                        ID로 특정 LLM 설정을 조회합니다.

                        **권한**: ADMIN
                        """)
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "설정을 찾을 수 없음"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 실패"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "권한 없음 (ADMIN 필요)")
        })
        @GetMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<LlmConfigDTO>> getConfigById(
                        @Parameter(description = "LLM 설정 ID", required = true) @PathVariable String id) {
                log.info("🔍 LLM 설정 조회 요청: id={}", id);
                return llmConfigService.getConfigById(id)
                                .map(config -> ResponseEntity.ok(ApiResponse.success(config)))
                                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                                                .body(ApiResponse.error("LLM 설정을 찾을 수 없습니다")));
        }

        @Operation(summary = "기본 LLM 설정 조회", description = """
                        시스템에서 기본으로 사용하는 LLM 설정을 조회합니다.

                        **권한**: ADMIN
                        """)
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "기본 설정이 없음"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 실패"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "권한 없음 (ADMIN 필요)")
        })
        @GetMapping("/default")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<LlmConfigDTO>> getDefaultConfig() {
                log.info("⭐ 기본 LLM 설정 조회 요청");
                return llmConfigService.getDefaultConfig()
                                .map(config -> ResponseEntity.ok(ApiResponse.success(config)))
                                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                                                .body(ApiResponse.error("기본 LLM 설정이 없습니다")));
        }

        @Operation(summary = "제공자별 LLM 설정 조회", description = """
                        특정 제공자(OPENWEBUI 또는 OPENAI)의 활성화된 설정들을 조회합니다.

                        **권한**: ADMIN
                        """)
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 실패"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "권한 없음 (ADMIN 필요)")
        })
        @GetMapping("/provider/{provider}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<List<LlmConfigDTO>>> getConfigsByProvider(
                        @Parameter(description = "LLM 제공자 (OPENWEBUI, OPENAI)", required = true) @PathVariable LlmProvider provider) {
                log.info("📋 제공자별 LLM 설정 조회 요청: provider={}", provider);
                List<LlmConfigDTO> configs = llmConfigService.getConfigsByProvider(provider);
                return ResponseEntity.ok(ApiResponse.success(configs));
        }

        @Operation(summary = "LLM 설정 생성", description = """
                        새로운 LLM 설정을 생성합니다.

                        **필수 필드**:
                        - name: 설정 이름
                        - provider: LLM 제공자 (OPENWEBUI, OPENAI)
                        - apiUrl: API URL
                        - apiKey: API Key (평문으로 전송, AES-256으로 암호화되어 저장)
                        - modelName: 모델 이름 (예: llama3.1, gpt-4)

                        **권한**: ADMIN
                        """)
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "생성 성공"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 실패"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "권한 없음 (ADMIN 필요)")
        })
        @PostMapping
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<LlmConfigDTO>> createConfig(
                        @Valid @RequestBody LlmConfigDTO configDTO) {
                log.info("➕ LLM 설정 생성 요청: name={}", configDTO.getName());
                try {
                        LlmConfigDTO createdConfig = llmConfigService.createConfig(configDTO);
                        return ResponseEntity.status(HttpStatus.CREATED)
                                        .body(ApiResponse.success(createdConfig));
                } catch (IllegalArgumentException e) {
                        return ResponseEntity.badRequest()
                                        .body(ApiResponse.error(e.getMessage()));
                } catch (Exception e) {
                        log.error("❌ LLM 설정 생성 실패", e);
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(ApiResponse.error("LLM 설정 생성 실패: " + e.getMessage()));
                }
        }

        @Operation(summary = "LLM 설정 수정", description = """
                        기존 LLM 설정을 수정합니다.

                        **수정 가능 필드**:
                        - name, provider, apiUrl, modelName, apiKey
                        - apiKey는 변경 시에만 전송 (생략 시 기존 값 유지)

                        **권한**: ADMIN
                        """)
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "수정 성공"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "잘못된 요청 데이터"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "설정을 찾을 수 없음"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 실패"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "권한 없음 (ADMIN 필요)")
        })
        @PutMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<LlmConfigDTO>> updateConfig(
                        @Parameter(description = "LLM 설정 ID", required = true) @PathVariable String id,
                        @Valid @RequestBody LlmConfigDTO configDTO) {
                log.info("✏️ LLM 설정 수정 요청: id={}", id);
                try {
                        LlmConfigDTO updatedConfig = llmConfigService.updateConfig(id, configDTO);
                        return ResponseEntity.ok(ApiResponse.success(updatedConfig));
                } catch (IllegalArgumentException e) {
                        return ResponseEntity.badRequest()
                                        .body(ApiResponse.error(e.getMessage()));
                } catch (Exception e) {
                        log.error("❌ LLM 설정 수정 실패", e);
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(ApiResponse.error("LLM 설정 수정 실패: " + e.getMessage()));
                }
        }

        @Operation(summary = "LLM 설정 삭제", description = """
                        LLM 설정을 삭제합니다.

                        **주의**: 기본 설정이면서 유일한 설정인 경우 삭제할 수 없습니다.

                        **권한**: ADMIN
                        """)
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "삭제 성공"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "삭제할 수 없는 설정"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "설정을 찾을 수 없음"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 실패"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "권한 없음 (ADMIN 필요)")
        })
        @DeleteMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<Void>> deleteConfig(
                        @Parameter(description = "LLM 설정 ID", required = true) @PathVariable String id) {
                log.info("🗑️ LLM 설정 삭제 요청: id={}", id);
                try {
                        llmConfigService.deleteConfig(id);
                        return ResponseEntity.ok(ApiResponse.success(null, "LLM 설정이 삭제되었습니다"));
                } catch (IllegalArgumentException | IllegalStateException e) {
                        return ResponseEntity.badRequest()
                                        .body(ApiResponse.error(e.getMessage()));
                } catch (Exception e) {
                        log.error("❌ LLM 설정 삭제 실패", e);
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(ApiResponse.error("LLM 설정 삭제 실패: " + e.getMessage()));
                }
        }

        @Operation(summary = "기본 설정으로 지정", description = """
                        특정 LLM 설정을 기본 설정으로 지정합니다.
                        기존 기본 설정은 자동으로 해제됩니다.

                        **권한**: ADMIN
                        """)
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "지정 성공"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "비활성 설정은 기본으로 지정 불가"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "설정을 찾을 수 없음"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 실패"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "권한 없음 (ADMIN 필요)")
        })
        @PutMapping("/{id}/set-default")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<LlmConfigDTO>> setDefaultConfig(
                        @Parameter(description = "LLM 설정 ID", required = true) @PathVariable String id) {
                log.info("⭐ 기본 설정 지정 요청: id={}", id);
                try {
                        LlmConfigDTO updatedConfig = llmConfigService.setDefaultConfig(id);
                        return ResponseEntity.ok(ApiResponse.success(updatedConfig, "기본 설정으로 지정되었습니다"));
                } catch (IllegalArgumentException | IllegalStateException e) {
                        return ResponseEntity.badRequest()
                                        .body(ApiResponse.error(e.getMessage()));
                } catch (Exception e) {
                        log.error("❌ 기본 설정 지정 실패", e);
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(ApiResponse.error("기본 설정 지정 실패: " + e.getMessage()));
                }
        }

        @Operation(summary = "LLM 연결 테스트", description = """
                        LLM API에 실제 연결하여 설정이 정상인지 테스트합니다.

                        **테스트 방법**:
                        - 간단한 "Hello" 메시지로 API 호출
                        - max_tokens 10으로 제한하여 비용 최소화

                        **권한**: ADMIN
                        """)
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "연결 테스트 성공"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "연결 테스트 실패"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "설정을 찾을 수 없음"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 실패"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "권한 없음 (ADMIN 필요)")
        })
        @PostMapping("/{id}/test-connection")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<LlmConfigDTO>> testConnection(
                        @Parameter(description = "LLM 설정 ID", required = true) @PathVariable String id) {
                log.info("🔌 LLM 연결 테스트 요청: id={}", id);
                try {
                        LlmConfigDTO testedConfig = llmConfigService.testConnection(id);
                        return ResponseEntity.ok(ApiResponse.success(testedConfig, "연결 테스트 성공"));
                } catch (IllegalArgumentException e) {
                        return ResponseEntity.badRequest()
                                        .body(ApiResponse.error(e.getMessage()));
                } catch (Exception e) {
                        log.error("❌ 연결 테스트 실패", e);
                        return ResponseEntity.badRequest()
                                        .body(ApiResponse.error("연결 테스트 실패: " + e.getMessage()));
                }
        }

        @Operation(summary = "저장하지 않고 LLM 설정 테스트", description = """
                        다이얼로그에서 설정을 입력 중일 때, 저장하기 전에 설정이 올바른지 테스트합니다.

                        **사용 시나리오**:
                        - 설정 생성/수정 다이얼로그에서 "테스트 연결" 버튼 클릭
                        - DB에 저장하지 않고 입력된 설정으로 바로 연결 테스트

                        **테스트 방법**:
                        - 간단한 "Hello" 메시지로 API 호출
                        - max_tokens 16으로 제한하여 비용 최소화

                        **필수 필드**:
                        - provider: LLM 제공자
                        - apiUrl: API URL
                        - apiKey: API Key (평문)
                        - modelName: 모델 이름

                        **권한**: ADMIN
                        """)
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "연결 테스트 성공"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "연결 테스트 실패 또는 잘못된 설정"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 실패"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "권한 없음 (ADMIN 필요)")
        })
        @PostMapping("/test-settings")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<Void>> testUnsavedSettings(
                        @Valid @RequestBody LlmConfigDTO configDTO) {
                log.info("🔌 저장하지 않고 LLM 설정 테스트 요청: provider={}, model={}",
                                configDTO.getProvider(), configDTO.getModelName());
                try {
                        llmConfigService.testUnsavedSettings(configDTO);
                        return ResponseEntity.ok(ApiResponse.success(null, "연결 테스트 성공"));
                } catch (IllegalArgumentException e) {
                        return ResponseEntity.badRequest()
                                        .body(ApiResponse.error(e.getMessage()));
                } catch (Exception e) {
                        log.error("❌ 저장하지 않고 설정 테스트 실패", e);
                        return ResponseEntity.badRequest()
                                        .body(ApiResponse.error("연결 테스트 실패: " + e.getMessage()));
                }
        }

        @Operation(summary = "활성/비활성 토글", description = """
                        LLM 설정을 활성화 또는 비활성화합니다.

                        **주의**: 기본 설정이면서 유일한 설정인 경우 비활성화할 수 없습니다.

                        **권한**: ADMIN
                        """)
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "토글 성공"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "비활성화할 수 없는 설정"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "설정을 찾을 수 없음"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 실패"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "권한 없음 (ADMIN 필요)")
        })
        @PutMapping("/{id}/toggle-active")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<LlmConfigDTO>> toggleActive(
                        @Parameter(description = "LLM 설정 ID", required = true) @PathVariable String id) {
                log.info("🔄 활성/비활성 토글 요청: id={}", id);
                try {
                        LlmConfigDTO updatedConfig = llmConfigService.toggleActive(id);
                        return ResponseEntity.ok(ApiResponse.success(updatedConfig));
                } catch (IllegalArgumentException | IllegalStateException e) {
                        return ResponseEntity.badRequest()
                                        .body(ApiResponse.error(e.getMessage()));
                } catch (Exception e) {
                        log.error("❌ 활성/비활성 토글 실패", e);
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body(ApiResponse.error("활성/비활성 토글 실패: " + e.getMessage()));
                }
        }

        @Operation(summary = "기본 테스트 케이스 템플릿 조회", description = """
                        시스템에 정의된 기본 테스트 케이스 생성 템플릿(JSON)을 조회합니다.
                         Frontend에서 하드코딩된 값 대신 이 API를 사용하여 항상 최신 형식을 유지할 수 있습니다.

                        **권한**: 모든 인증된 사용자
                        """)
        @ApiResponses({
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공"),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "인증 실패")
        })
        @GetMapping("/default-template")
        public ResponseEntity<ApiResponse<String>> getDefaultTemplate() {
                log.info("📋 기본 테스트 케이스 템플릿 조회 요청");
                return ResponseEntity.ok(ApiResponse.success(LlmConfigDTO.DEFAULT_TEST_CASE_TEMPLATE));
        }
}
