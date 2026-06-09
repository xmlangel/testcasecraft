// src/main/java/com/testcase/testcasemanagement/controller/BookmarkController.java
// 테스트케이스 즐겨찾기/개인 북마크 REST API.
// /api/** 규칙으로 JWT 인증이 강제되며, 모든 응답은 현재 사용자 소유로 한정된다(FR-5).
package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.BookmarkDto;
import com.testcase.testcasemanagement.service.BookmarkService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Bookmark - Favorites", description = "테스트케이스 즐겨찾기/개인 북마크 API")
@Slf4j
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {

  private final BookmarkService bookmarkService;

  // ==================== 모음(Collection) ====================

  @Operation(summary = "내 북마크 모음 목록(프로젝트별)")
  @GetMapping("/collections")
  public ResponseEntity<List<BookmarkDto.CollectionResponse>> listCollections(
      @RequestParam String projectId) {
    return ResponseEntity.ok(bookmarkService.listCollections(projectId));
  }

  @Operation(summary = "북마크 모음 생성")
  @PostMapping("/collections")
  public ResponseEntity<BookmarkDto.CollectionResponse> createCollection(
      @Valid @RequestBody BookmarkDto.CreateCollectionRequest request) {
    return ResponseEntity.ok(bookmarkService.createCollection(request));
  }

  @Operation(summary = "북마크 모음 수정(이름/설명)")
  @PutMapping("/collections/{collectionId}")
  public ResponseEntity<BookmarkDto.CollectionResponse> updateCollection(
      @PathVariable String collectionId,
      @Valid @RequestBody BookmarkDto.UpdateCollectionRequest request) {
    return ResponseEntity.ok(bookmarkService.updateCollection(collectionId, request));
  }

  @Operation(summary = "북마크 모음 삭제")
  @DeleteMapping("/collections/{collectionId}")
  public ResponseEntity<Void> deleteCollection(@PathVariable String collectionId) {
    bookmarkService.deleteCollection(collectionId);
    return ResponseEntity.noContent().build();
  }

  // ==================== 항목(Item) ====================

  @Operation(summary = "모음 내 케이스 목록(읽기 전용)")
  @GetMapping("/collections/{collectionId}/items")
  public ResponseEntity<List<BookmarkDto.ItemResponse>> listItems(
      @PathVariable String collectionId) {
    return ResponseEntity.ok(bookmarkService.listItems(collectionId));
  }

  @Operation(summary = "모음에 케이스 추가")
  @PostMapping("/collections/{collectionId}/items")
  public ResponseEntity<BookmarkDto.ItemResponse> addItem(
      @PathVariable String collectionId,
      @Valid @RequestBody BookmarkDto.AddItemRequest request) {
    return ResponseEntity.ok(bookmarkService.addItem(collectionId, request));
  }

  @Operation(summary = "북마크 항목 메모 수정")
  @PutMapping("/items/{itemId}")
  public ResponseEntity<BookmarkDto.ItemResponse> updateItem(
      @PathVariable String itemId, @Valid @RequestBody BookmarkDto.UpdateItemRequest request) {
    return ResponseEntity.ok(bookmarkService.updateItem(itemId, request));
  }

  @Operation(summary = "북마크 항목 제거")
  @DeleteMapping("/items/{itemId}")
  public ResponseEntity<Void> deleteItem(@PathVariable String itemId) {
    bookmarkService.deleteItem(itemId);
    return ResponseEntity.noContent().build();
  }

  // ==================== 별 버튼 토글 / 상태 ====================

  @Operation(summary = "기본 모음 즐겨찾기 토글(별 버튼)")
  @PostMapping("/testcases/{testCaseId}/toggle")
  public ResponseEntity<BookmarkDto.ToggleResponse> toggleFavorite(
      @PathVariable String testCaseId, @RequestParam String projectId) {
    return ResponseEntity.ok(bookmarkService.toggleFavorite(testCaseId, projectId));
  }

  @Operation(summary = "프로젝트 케이스 즐겨찾기 상태 map")
  @GetMapping("/status")
  public ResponseEntity<BookmarkDto.StatusResponse> getStatus(@RequestParam String projectId) {
    return ResponseEntity.ok(bookmarkService.getStatus(projectId));
  }
}
