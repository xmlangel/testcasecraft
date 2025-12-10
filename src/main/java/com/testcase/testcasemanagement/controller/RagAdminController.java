package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.service.RagService;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * RAG 시스템 관리용 컨트롤러
 * 
 * 목적: 삭제되지 않은 고아(orphan) RAG 문서 정리
 */
@Slf4j
@RestController
@RequestMapping("/api/admin/rag")
@RequiredArgsConstructor
@Tag(name = "RAG - Administration", description = "RAG 시스템 관리 API")
public class RagAdminController {

    private final RagService ragService;
    private final TestCaseRepository testCaseRepository;

    /**
     * 고아 RAG 문서 찾기 및 삭제
     * 
     * DB에는 존재하지 않지만 RAG에는 존재하는 문서들을 찾아서 삭제
     */
    @Operation(summary = "고아 문서 정리", description = "DB에서 삭제되었으나 RAG 저장소에 남아있는 고아 문서를 찾아 정리합니다.")
    @PostMapping("/cleanup-orphaned-documents")
    public ResponseEntity<?> cleanupOrphanedDocuments(
            @RequestParam(defaultValue = "false") boolean dryRun) {

        log.info("RAG 고아 문서 정리 시작 (dryRun={})", dryRun);

        try {
            // 1. 모든 RAG 문서 조회 (API 최대 page_size: 1000)
            var ragDocuments = ragService.listDocuments(null, 1, 1000);
            if (ragDocuments == null || ragDocuments.getDocuments() == null) {
                return ResponseEntity.ok(Map.of(
                        "message", "RAG 문서를 찾을 수 없습니다.",
                        "deletedCount", 0));
            }

            List<String> orphanedDocIds = new ArrayList<>();
            List<String> orphanedFileNames = new ArrayList<>();

            // 2. 각 RAG 문서가 실제 TestCase와 매칭되는지 확인
            for (var doc : ragDocuments.getDocuments()) {
                if (doc.getFileName() != null && doc.getFileName().startsWith("testcase_")) {
                    // 파일명에서 TestCase ID 추출: testcase_{id}.txt
                    String testCaseId = doc.getFileName()
                            .replace("testcase_", "")
                            .replace(".txt", "");

                    // DB에 TestCase가 존재하는지 확인
                    boolean exists = testCaseRepository.existsById(testCaseId);

                    if (!exists) {
                        log.info("고아 RAG 문서 발견: documentId={}, fileName={}, testCaseId={}",
                                doc.getId(), doc.getFileName(), testCaseId);
                        orphanedDocIds.add(doc.getId().toString()); // UUID를 String으로 변환
                        orphanedFileNames.add(doc.getFileName());
                    }
                }
            }

            // 3. 고아 문서 삭제 (dryRun이 아닌 경우)
            int deletedCount = 0;
            List<String> deletionErrors = new ArrayList<>();

            if (!dryRun && !orphanedDocIds.isEmpty()) {
                for (int i = 0; i < orphanedDocIds.size(); i++) {
                    String docId = orphanedDocIds.get(i);
                    String fileName = orphanedFileNames.get(i);
                    try {
                        ragService.deleteDocument(java.util.UUID.fromString(docId));
                        deletedCount++;
                        log.info("고아 RAG 문서 삭제 완료: documentId={}, fileName={}", docId, fileName);
                    } catch (Exception e) {
                        log.error("고아 RAG 문서 삭제 실패: documentId={}, fileName={}", docId, fileName, e);
                        deletionErrors.add(String.format("%s (%s)", fileName, e.getMessage()));
                    }
                }
            }

            Map<String, Object> result = new HashMap<>();
            result.put("totalRagDocuments", ragDocuments.getDocuments().size());
            result.put("orphanedDocumentsFound", orphanedDocIds.size());
            result.put("orphanedFileNames", orphanedFileNames);
            result.put("deletedCount", deletedCount);
            result.put("dryRun", dryRun);

            if (!deletionErrors.isEmpty()) {
                result.put("errors", deletionErrors);
            }

            if (dryRun) {
                result.put("message", "시뮬레이션 모드: 실제 삭제는 수행하지 않았습니다. dryRun=false로 설정하여 실행하세요.");
            } else {
                result.put("message", String.format("%d개의 고아 문서를 삭제했습니다.", deletedCount));
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            log.error("RAG 고아 문서 정리 중 오류 발생", e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "error", "정리 작업 실패: " + e.getMessage()));
        }
    }
}
