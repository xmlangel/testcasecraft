// src/main/java/com/testcase/testcasemanagement/service/BookmarkService.java
// BookmarkService: 테스트케이스 즐겨찾기/개인 북마크 비즈니스 로직.
// 모든 조회/변경은 현재 인증 사용자 소유 데이터로 한정한다(FR-5).
package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.BookmarkDto;
import com.testcase.testcasemanagement.exception.ResourceNotFoundException;
import com.testcase.testcasemanagement.model.BookmarkCollection;
import com.testcase.testcasemanagement.model.BookmarkItem;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.TestCase;
import com.testcase.testcasemanagement.model.User;
import com.testcase.testcasemanagement.repository.BookmarkCollectionRepository;
import com.testcase.testcasemanagement.repository.BookmarkItemRepository;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.TestCaseRepository;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookmarkService {

  /** 기본(별 버튼) 모음의 저장 이름. 프런트는 isDefault 플래그로 현지화 라벨을 표시한다. */
  public static final String DEFAULT_COLLECTION_NAME = "즐겨찾기";

  private final BookmarkCollectionRepository collectionRepository;
  private final BookmarkItemRepository itemRepository;
  private final ProjectRepository projectRepository;
  private final TestCaseRepository testCaseRepository;
  private final SecurityContextUtil securityContextUtil;

  // ==================== 모음(Collection) ====================

  @Transactional
  public List<BookmarkDto.CollectionResponse> listCollections(String projectId) {
    User user = currentUser();
    validateProjectExists(projectId);
    ensureDefaultCollection(user, projectId);
    return collectionRepository
        .findByUser_IdAndProject_IdOrderByIsDefaultDescNameAsc(user.getId(), projectId)
        .stream()
        .map(this::toCollectionResponse)
        .collect(Collectors.toList());
  }

  @Transactional
  public BookmarkDto.CollectionResponse createCollection(
      BookmarkDto.CreateCollectionRequest request) {
    User user = currentUser();
    Project project = validateProjectExists(request.getProjectId());
    String name = request.getName().trim();
    collectionRepository
        .findByUser_IdAndProject_IdAndName(user.getId(), project.getId(), name)
        .ifPresent(
            c -> {
              throw new ResponseStatusException(
                  HttpStatus.CONFLICT, "이미 같은 이름의 북마크 모음이 있습니다: " + name);
            });
    BookmarkCollection collection =
        BookmarkCollection.builder()
            .user(user)
            .project(project)
            .name(name)
            .description(request.getDescription())
            .isDefault(false)
            .build();
    return toCollectionResponse(collectionRepository.save(collection));
  }

  @Transactional
  public BookmarkDto.CollectionResponse updateCollection(
      String collectionId, BookmarkDto.UpdateCollectionRequest request) {
    User user = currentUser();
    BookmarkCollection collection = ownedCollection(collectionId, user.getId());
    String name = request.getName().trim();
    // 이름 변경 시 동일 사용자·프로젝트 내 중복 확인
    if (!name.equals(collection.getName())) {
      collectionRepository
          .findByUser_IdAndProject_IdAndName(user.getId(), collection.getProject().getId(), name)
          .ifPresent(
              c -> {
                throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "이미 같은 이름의 북마크 모음이 있습니다: " + name);
              });
      collection.setName(name);
    }
    collection.setDescription(request.getDescription());
    return toCollectionResponse(collectionRepository.save(collection));
  }

  @Transactional
  public void deleteCollection(String collectionId) {
    User user = currentUser();
    BookmarkCollection collection = ownedCollection(collectionId, user.getId());
    if (collection.isDefault()) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "기본 즐겨찾기 모음은 삭제할 수 없습니다.");
    }
    itemRepository.deleteByCollection_Id(collectionId);
    collectionRepository.delete(collection);
  }

  // ==================== 항목(Item) ====================

  @Transactional
  public List<BookmarkDto.ItemResponse> listItems(String collectionId) {
    User user = currentUser();
    ownedCollection(collectionId, user.getId());
    return itemRepository.findByCollection_IdOrderByCreatedAtDesc(collectionId).stream()
        .map(this::toItemResponse)
        .collect(Collectors.toList());
  }

  @Transactional
  public BookmarkDto.ItemResponse addItem(String collectionId, BookmarkDto.AddItemRequest request) {
    User user = currentUser();
    BookmarkCollection collection = ownedCollection(collectionId, user.getId());
    TestCase testCase = findTestCase(request.getTestCaseId());
    validateSameProject(collection, testCase);
    if (itemRepository.existsByCollection_IdAndTestCase_Id(collectionId, testCase.getId())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "이미 이 모음에 담긴 케이스입니다.");
    }
    BookmarkItem item =
        BookmarkItem.builder()
            .collection(collection)
            .testCase(testCase)
            .note(request.getNote())
            .build();
    return toItemResponse(itemRepository.save(item));
  }

  @Transactional
  public BookmarkDto.ItemResponse updateItem(String itemId, BookmarkDto.UpdateItemRequest request) {
    User user = currentUser();
    BookmarkItem item = ownedItem(itemId, user.getId());
    item.setNote(request.getNote());
    return toItemResponse(itemRepository.save(item));
  }

  @Transactional
  public void deleteItem(String itemId) {
    User user = currentUser();
    BookmarkItem item = ownedItem(itemId, user.getId());
    itemRepository.delete(item);
  }

  // ==================== 별 버튼 토글 / 상태 ====================

  /** 기본 모음 기준으로 케이스 즐겨찾기를 토글한다(FR-1). */
  @Transactional
  public BookmarkDto.ToggleResponse toggleFavorite(String testCaseId, String projectId) {
    User user = currentUser();
    validateProjectExists(projectId);
    TestCase testCase = findTestCase(testCaseId);
    if (!projectId.equals(projectIdOf(testCase))) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "케이스가 해당 프로젝트에 속하지 않습니다.");
    }
    BookmarkCollection defaultCollection = ensureDefaultCollection(user, projectId);
    return itemRepository
        .findByCollection_IdAndTestCase_Id(defaultCollection.getId(), testCaseId)
        .map(
            existing -> {
              itemRepository.delete(existing);
              return BookmarkDto.ToggleResponse.builder()
                  .testCaseId(testCaseId)
                  .bookmarked(false)
                  .build();
            })
        .orElseGet(
            () -> {
              itemRepository.save(
                  BookmarkItem.builder()
                      .collection(defaultCollection)
                      .testCase(testCase)
                      .build());
              return BookmarkDto.ToggleResponse.builder()
                  .testCaseId(testCaseId)
                  .bookmarked(true)
                  .build();
            });
  }

  /** 프로젝트 내 사용자가 북마크한 케이스 ID 집합 + map(NFR-1: 단일 조회). */
  @Transactional(readOnly = true)
  public BookmarkDto.StatusResponse getStatus(String projectId) {
    User user = currentUser();
    List<String> ids = itemRepository.findBookmarkedTestCaseIds(user.getId(), projectId);
    Map<String, Boolean> status = new LinkedHashMap<>();
    ids.forEach(id -> status.put(id, true));
    return BookmarkDto.StatusResponse.builder()
        .projectId(projectId)
        .bookmarkedTestCaseIds(ids)
        .status(status)
        .build();
  }

  // ==================== 정합성(케이스 삭제 시 정리, FR-6) ====================

  /** 케이스 삭제 시 관련 북마크 항목 정리. TestCaseService 에서 호출. */
  @Transactional
  public void removeItemsByTestCase(String testCaseId) {
    itemRepository.deleteByTestCase_Id(testCaseId);
  }

  // ==================== 내부 헬퍼 ====================

  private User currentUser() {
    return securityContextUtil
        .getCurrentUser()
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "인증이 필요합니다."));
  }

  private Project validateProjectExists(String projectId) {
    return projectRepository
        .findById(projectId)
        .orElseThrow(() -> new ResourceNotFoundException("Project", projectId));
  }

  private TestCase findTestCase(String testCaseId) {
    return testCaseRepository
        .findById(testCaseId)
        .orElseThrow(() -> new ResourceNotFoundException("TestCase", testCaseId));
  }

  /** 소유자 검증: 없거나 타인 소유면 404(존재 노출 방지). */
  private BookmarkCollection ownedCollection(String collectionId, String userId) {
    return collectionRepository
        .findByIdAndUser_Id(collectionId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("BookmarkCollection", collectionId));
  }

  private BookmarkItem ownedItem(String itemId, String userId) {
    return itemRepository
        .findByIdAndCollection_User_Id(itemId, userId)
        .orElseThrow(() -> new ResourceNotFoundException("BookmarkItem", itemId));
  }

  /** 사용자·프로젝트의 기본 모음을 반환하며, 없으면 생성한다(FR-2.5). */
  private BookmarkCollection ensureDefaultCollection(User user, String projectId) {
    return collectionRepository
        .findByUser_IdAndProject_IdAndIsDefaultTrue(user.getId(), projectId)
        .orElseGet(
            () -> {
              Project project = validateProjectExists(projectId);
              BookmarkCollection collection =
                  BookmarkCollection.builder()
                      .user(user)
                      .project(project)
                      .name(DEFAULT_COLLECTION_NAME)
                      .isDefault(true)
                      .build();
              return collectionRepository.save(collection);
            });
  }

  private void validateSameProject(BookmarkCollection collection, TestCase testCase) {
    String collectionProjectId = collection.getProject() != null ? collection.getProject().getId() : null;
    if (collectionProjectId != null && !collectionProjectId.equals(projectIdOf(testCase))) {
      throw new ResponseStatusException(
          HttpStatus.BAD_REQUEST, "케이스가 모음의 프로젝트에 속하지 않습니다.");
    }
  }

  private String projectIdOf(TestCase testCase) {
    return testCase.getProject() != null ? testCase.getProject().getId() : null;
  }

  private BookmarkDto.CollectionResponse toCollectionResponse(BookmarkCollection c) {
    return BookmarkDto.CollectionResponse.builder()
        .id(c.getId())
        .projectId(c.getProject() != null ? c.getProject().getId() : null)
        .name(c.getName())
        .description(c.getDescription())
        .isDefault(c.isDefault())
        .itemCount(itemRepository.countByCollection_Id(c.getId()))
        .createdAt(c.getCreatedAt() != null ? c.getCreatedAt().toString() : null)
        .updatedAt(c.getUpdatedAt() != null ? c.getUpdatedAt().toString() : null)
        .build();
  }

  private BookmarkDto.ItemResponse toItemResponse(BookmarkItem item) {
    TestCase tc = item.getTestCase();
    return BookmarkDto.ItemResponse.builder()
        .id(item.getId())
        .collectionId(item.getCollection() != null ? item.getCollection().getId() : null)
        .note(item.getNote())
        .createdAt(item.getCreatedAt() != null ? item.getCreatedAt().toString() : null)
        .testCaseId(tc != null ? tc.getId() : null)
        .testCaseName(tc != null ? tc.getName() : null)
        .testCaseDisplayId(tc != null ? tc.getDisplayId() : null)
        .testCasePriority(tc != null ? tc.getPriority() : null)
        .projectId(tc != null ? projectIdOf(tc) : null)
        .build();
  }
}
