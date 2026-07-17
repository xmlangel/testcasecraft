package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.rag.*;
import com.testcase.testcasemanagement.service.RagChatConversationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Slf4j
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/rag/chat/conversations")
@Tag(name = "RAG - Chat Conversation", description = "RAG 채팅 스레드 및 메시지 관리 API")
public class RagChatConversationController {

  private final RagChatConversationService conversationService;

  @GetMapping("/threads")
  @PreAuthorize("@projectSecurityService.canAccessProject(#projectId.toString())")
  @Operation(summary = "채팅 스레드 목록 조회")
  public List<RagChatThreadDTO> listThreads(@RequestParam("projectId") @NotNull UUID projectId) {
    log.info("📋 스레드 목록 조회 요청: projectId={}", projectId);
    List<RagChatThreadDTO> threads = conversationService.getThreads(projectId.toString());
    log.info("📊 스레드 목록 반환: count={}", threads.size());
    if (!threads.isEmpty()) {
      log.info(
          "📌 첫 3개 스레드: {}", threads.stream().limit(3).map(RagChatThreadDTO::getTitle).toList());
    }
    return threads;
  }

  @PostMapping("/threads")
  @PreAuthorize(
      "#request.projectId != null and"
          + " @projectSecurityService.canAccessProject(#request.projectId.toString())")
  @Operation(summary = "채팅 스레드 생성")
  public RagChatThreadDTO createThread(
      @Valid @RequestBody RagChatThreadCreateRequest request, Authentication authentication) {
    String username = authentication.getName();
    return conversationService.createThread(request, username);
  }

  @GetMapping("/threads/{threadId}")
  @PreAuthorize("@projectSecurityService.canAccessRagChatThread(#threadId)")
  @Operation(summary = "채팅 스레드 단건 조회")
  public RagChatThreadDTO getThread(@PathVariable("threadId") String threadId) {
    return conversationService.getThread(threadId);
  }

  @PatchMapping("/threads/{threadId}")
  @PreAuthorize("@projectSecurityService.canAccessRagChatThread(#threadId)")
  @Operation(summary = "채팅 스레드 수정")
  public RagChatThreadDTO updateThread(
      @PathVariable("threadId") String threadId,
      @Valid @RequestBody RagChatThreadUpdateRequest request,
      Authentication authentication) {
    request.setThreadId(threadId);
    String username = authentication.getName();
    return conversationService.updateThread(request, username);
  }

  @DeleteMapping("/threads/{threadId}")
  @PreAuthorize("@projectSecurityService.canAccessRagChatThread(#threadId)")
  @Operation(summary = "채팅 스레드 삭제")
  public void deleteThread(@PathVariable("threadId") String threadId) {
    conversationService.deleteThread(threadId);
  }

  @GetMapping("/threads/{threadId}/messages")
  @PreAuthorize("@projectSecurityService.canAccessRagChatThread(#threadId)")
  @Operation(summary = "채팅 메시지 목록 조회")
  public List<RagChatMessageDTO> getMessages(@PathVariable("threadId") String threadId) {
    return conversationService.getMessages(threadId);
  }

  @PatchMapping("/messages/{messageId}")
  @PreAuthorize("@projectSecurityService.canAccessRagChatMessage(#messageId)")
  @Operation(summary = "어시스턴트 메시지 편집")
  public RagChatMessageDTO editMessage(
      @PathVariable("messageId") String messageId,
      @Valid @RequestBody RagChatMessageEditRequest request,
      Authentication authentication) {
    request.setMessageId(messageId);
    String username = authentication.getName();
    return conversationService.editAssistantMessage(request, username);
  }

  @DeleteMapping("/messages/{messageId}")
  @PreAuthorize("@projectSecurityService.canAccessRagChatMessage(#messageId)")
  @Operation(summary = "어시스턴트 메시지 삭제")
  public void deleteMessage(
      @PathVariable("messageId") String messageId, Authentication authentication) {
    conversationService.deleteAssistantMessage(messageId, authentication.getName());
  }

  @GetMapping("/categories")
  @PreAuthorize("@projectSecurityService.canAccessProject(#projectId.toString())")
  @Operation(summary = "카테고리 목록 조회")
  public List<RagChatCategoryDTO> listCategories(
      @RequestParam("projectId") @NotNull UUID projectId) {
    return conversationService.getCategories(projectId.toString());
  }

  @PostMapping("/categories")
  @PreAuthorize(
      "#request.projectId != null and"
          + " @projectSecurityService.canAccessProject(#request.projectId.toString())")
  @Operation(summary = "카테고리 생성")
  public RagChatCategoryDTO createCategory(
      @Valid @RequestBody RagChatCategoryCreateRequest request, Authentication authentication) {
    return conversationService.createCategory(request, authentication.getName());
  }

  @PatchMapping("/categories/{categoryId}")
  @PreAuthorize("@projectSecurityService.canAccessRagChatCategory(#categoryId)")
  @Operation(summary = "카테고리 수정")
  public RagChatCategoryDTO updateCategory(
      @PathVariable("categoryId") String categoryId,
      @Valid @RequestBody RagChatCategoryUpdateRequest request,
      Authentication authentication) {
    request.setCategoryId(categoryId);
    return conversationService.updateCategory(request, authentication.getName());
  }

  @DeleteMapping("/categories/{categoryId}")
  @PreAuthorize("@projectSecurityService.canAccessRagChatCategory(#categoryId)")
  @Operation(summary = "카테고리 삭제")
  public void deleteCategory(@PathVariable("categoryId") String categoryId) {
    conversationService.deleteCategory(categoryId);
  }
}
