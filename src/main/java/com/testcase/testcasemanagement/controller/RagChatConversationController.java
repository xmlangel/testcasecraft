package com.testcase.testcasemanagement.controller;

import com.testcase.testcasemanagement.dto.rag.*;
import com.testcase.testcasemanagement.service.RagChatConversationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/rag/chat/conversations")
@Tag(name = "RAG Chat Conversation", description = "RAG 채팅 스레드 및 메시지 관리 API")
public class RagChatConversationController {

    private final RagChatConversationService conversationService;

    @GetMapping("/threads")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "채팅 스레드 목록 조회")
    public List<RagChatThreadDTO> listThreads(@RequestParam("projectId") @NotNull UUID projectId) {
        return conversationService.getThreads(projectId.toString());
    }

    @PostMapping("/threads")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "채팅 스레드 생성")
    public RagChatThreadDTO createThread(
            @Valid @RequestBody RagChatThreadCreateRequest request,
            Authentication authentication
    ) {
        String username = authentication.getName();
        return conversationService.createThread(request, username);
    }

    @PatchMapping("/threads/{threadId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "채팅 스레드 수정")
    public RagChatThreadDTO updateThread(
            @PathVariable("threadId") String threadId,
            @Valid @RequestBody RagChatThreadUpdateRequest request,
            Authentication authentication
    ) {
        request.setThreadId(threadId);
        String username = authentication.getName();
        return conversationService.updateThread(request, username);
    }

    @GetMapping("/threads/{threadId}/messages")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "채팅 메시지 목록 조회")
    public List<RagChatMessageDTO> getMessages(@PathVariable("threadId") String threadId) {
        return conversationService.getMessages(threadId);
    }

    @PatchMapping("/messages/{messageId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "어시스턴트 메시지 편집")
    public RagChatMessageDTO editMessage(
            @PathVariable("messageId") String messageId,
            @Valid @RequestBody RagChatMessageEditRequest request,
            Authentication authentication
    ) {
        request.setMessageId(messageId);
        String username = authentication.getName();
        return conversationService.editAssistantMessage(request, username);
    }

    @GetMapping("/categories")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "카테고리 목록 조회")
    public List<RagChatCategoryDTO> listCategories(@RequestParam("projectId") @NotNull UUID projectId) {
        return conversationService.getCategories(projectId.toString());
    }

    @PostMapping("/categories")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "카테고리 생성")
    public RagChatCategoryDTO createCategory(
            @Valid @RequestBody RagChatCategoryCreateRequest request,
            Authentication authentication
    ) {
        return conversationService.createCategory(request, authentication.getName());
    }

    @PatchMapping("/categories/{categoryId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "카테고리 수정")
    public RagChatCategoryDTO updateCategory(
            @PathVariable("categoryId") String categoryId,
            @Valid @RequestBody RagChatCategoryUpdateRequest request,
            Authentication authentication
    ) {
        request.setCategoryId(categoryId);
        return conversationService.updateCategory(request, authentication.getName());
    }

    @DeleteMapping("/categories/{categoryId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "카테고리 삭제")
    public void deleteCategory(@PathVariable("categoryId") String categoryId) {
        conversationService.deleteCategory(categoryId);
    }
}
