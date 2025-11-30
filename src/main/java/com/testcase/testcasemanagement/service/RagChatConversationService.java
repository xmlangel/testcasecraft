package com.testcase.testcasemanagement.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.testcase.testcasemanagement.dto.rag.*;
import com.testcase.testcasemanagement.model.Project;
import com.testcase.testcasemanagement.model.rag.RagChatCategory;
import com.testcase.testcasemanagement.model.rag.RagChatMessage;
import com.testcase.testcasemanagement.model.rag.RagChatMessageRole;
import com.testcase.testcasemanagement.model.rag.RagChatThread;
import com.testcase.testcasemanagement.repository.ProjectRepository;
import com.testcase.testcasemanagement.repository.RagChatCategoryRepository;
import com.testcase.testcasemanagement.repository.RagChatMessageRepository;
import com.testcase.testcasemanagement.repository.RagChatThreadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * RAG 채팅 스레드 및 메시지 영속화 서비스
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RagChatConversationService {

    private final RagChatThreadRepository threadRepository;
    private final RagChatMessageRepository messageRepository;
    private final RagChatCategoryRepository categoryRepository;
    private final ProjectRepository projectRepository;
    private final RagService ragService;
    private final ObjectMapper objectMapper;

    private static final TypeReference<List<Map<String, Object>>> LIST_OF_MAPS =
            new TypeReference<>() {
            };

    private static final TypeReference<Map<String, Object>> MAP_TYPE =
            new TypeReference<>() {
            };

    @Transactional
    public RagChatThread ensureThread(Project project, RagChatRequest request, String username) {
        if (request.getThreadId() != null) {
            return threadRepository.findByIdAndProject_Id(request.getThreadId(), project.getId())
                    .map(existing -> {
                        if (existing.getCategories() == null) {
                            existing.setCategories(new HashSet<>());
                        }
                        if (!CollectionUtils.isEmpty(request.getCategoryIds())) {
                            Set<RagChatCategory> categories = resolveCategories(project, request.getCategoryIds());
                            existing.setCategories(categories);
                            existing.setUpdatedBy(username);
                        }
                        existing.getCategories().size();
                        return existing;
                    })
                    .orElseThrow(() -> new IllegalArgumentException("채팅 스레드를 찾을 수 없습니다: " + request.getThreadId()));
        }

        String inferredTitle = Optional.ofNullable(request.getThreadTitle())
                .filter(StringUtils::hasText)
                .orElseGet(() -> inferThreadTitle(request.getMessage()));

        RagChatThread thread = RagChatThread.builder()
                .project(project)
                .title(inferredTitle)
                .description(null)
                .createdBy(username)
                .updatedBy(username)
                .build();

        if (!CollectionUtils.isEmpty(request.getCategoryIds())) {
            thread.setCategories(resolveCategories(project, request.getCategoryIds()));
        } else {
            thread.setCategories(new HashSet<>());
        }

        RagChatThread saved = threadRepository.save(thread);
        if (saved.getCategories() == null) {
            saved.setCategories(new HashSet<>());
        }
        saved.getCategories().size();
        log.info("Created new chat thread: id={}, project={}, title={}", saved.getId(), project.getId(), inferredTitle);
        return saved;
    }

    @Transactional
    public RagChatThreadDTO createThread(RagChatThreadCreateRequest request, String username) {
        Project project = projectRepository.findById(request.getProjectId().toString())
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + request.getProjectId()));

        RagChatThread thread = RagChatThread.builder()
                .project(project)
                .title(request.getTitle())
                .description(request.getDescription())
                .createdBy(username)
                .updatedBy(username)
                .build();

        if (!CollectionUtils.isEmpty(request.getCategoryIds())) {
            thread.setCategories(resolveCategories(project, request.getCategoryIds()));
        } else {
            thread.setCategories(new HashSet<>());
        }

        RagChatThread saved = threadRepository.save(thread);
        if (saved.getCategories() == null) {
            saved.setCategories(new HashSet<>());
        }
        saved.getCategories().size();
        return toThreadDTO(saved);
    }

    @Transactional(readOnly = true)
    public RagChatThreadDTO getThread(String threadId) {
        RagChatThread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅 스레드를 찾을 수 없습니다: " + threadId));
        if (thread.getCategories() == null) {
            thread.setCategories(new HashSet<>());
        } else {
            thread.getCategories().size();
        }
        return toThreadDTO(thread);
    }

    @Transactional
    public RagChatThreadDTO updateThread(RagChatThreadUpdateRequest request, String username) {
        RagChatThread thread = threadRepository.findById(request.getThreadId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅 스레드를 찾을 수 없습니다: " + request.getThreadId()));

        if (request.getTitle() != null) {
            thread.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            thread.setDescription(request.getDescription());
        }
        if (request.getArchived() != null) {
            thread.setArchived(request.getArchived());
        }
        if (request.getCategoryIds() != null) {
            if (request.getCategoryIds().isEmpty()) {
                if (thread.getCategories() == null) {
                    thread.setCategories(new HashSet<>());
                } else {
                    thread.getCategories().clear();
                }
            } else {
                thread.setCategories(resolveCategories(thread.getProject(), request.getCategoryIds()));
            }
        } else if (thread.getCategories() == null) {
            thread.setCategories(new HashSet<>());
        }

        thread.setUpdatedBy(username);

        RagChatThread saved = threadRepository.save(thread);
        if (saved.getCategories() == null) {
            saved.setCategories(new HashSet<>());
        }
        saved.getCategories().size();
        return toThreadDTO(saved);
    }

    @Transactional
    public void deleteThread(String threadId) {
        RagChatThread thread = threadRepository.findById(threadId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "채팅 스레드를 찾을 수 없습니다: " + threadId));

        List<RagChatMessage> messages = messageRepository.findByThread_IdOrderByCreatedAtAsc(threadId);
        for (RagChatMessage message : messages) {
            String embeddingMessageId = message.getEmbeddingMessageId();
            if (StringUtils.hasText(embeddingMessageId)) {
                try {
                    ragService.deleteConversationMessage(UUID.fromString(embeddingMessageId));
                } catch (Exception e) {
                    log.warn("Failed to delete conversation embedding for message: messageId={}, embeddingId={}",
                            message.getId(), embeddingMessageId, e);
                }
            }
        }

        threadRepository.delete(thread);
    }

    private Set<RagChatCategory> resolveCategories(Project project, List<String> categoryIds) {
        if (CollectionUtils.isEmpty(categoryIds)) {
            return Collections.emptySet();
        }

        List<RagChatCategory> categories = categoryRepository.findAllById(categoryIds);
        Map<String, RagChatCategory> filtered = categories.stream()
                .filter(category -> category.getProject().getId().equals(project.getId()))
                .collect(Collectors.toMap(RagChatCategory::getId, category -> category));

        return categoryIds.stream()
                .map(filtered::get)
                .filter(Objects::nonNull)
                .collect(Collectors.toCollection(HashSet::new));
    }

    private String inferThreadTitle(String message) {
        if (!StringUtils.hasText(message)) {
            return "새로운 대화";
        }
        String trimmed = message.strip();
        if (trimmed.length() <= 40) {
            return trimmed;
        }
        return trimmed.substring(0, 37) + "...";
    }

    @Transactional
    public RagChatMessage persistUserMessage(RagChatThread thread, String content, String username) {
        RagChatMessage message = RagChatMessage.builder()
                .thread(thread)
                .role(RagChatMessageRole.USER)
                .content(content)
                .createdBy(username)
                .updatedBy(username)
                .build();
        RagChatMessage saved = messageRepository.save(message);
        log.debug("User message persisted: messageId={}, threadId={}", saved.getId(), thread.getId());
        return saved;
    }

    @Transactional
    public RagChatMessage persistAssistantMessage(
            RagChatThread thread,
            String answer,
            String username,
            String parentMessageId,
            String llmProvider,
            String llmModel,
            Integer tokensUsed,
            Double temperature,
            List<RagChatContext> contexts,
            Map<String, Object> metadata,
            String question
    ) {
        RagChatMessage message = RagChatMessage.builder()
                .thread(thread)
                .role(RagChatMessageRole.ASSISTANT)
                .content(answer)
                .parentMessageId(parentMessageId)
                .llmProvider(llmProvider)
                .llmModel(llmModel)
                .tokensUsed(tokensUsed)
                .temperature(temperature)
                .createdBy(username)
                .updatedBy(username)
                .contextSnapshot(serializeContexts(contexts))
                .metadataJson(serializeMetadata(metadata))
                .embeddingStatus("pending")
                .build();

        RagChatMessage saved = messageRepository.save(message);

        try {
            RagConversationMessageIndexRequest indexRequest = RagConversationMessageIndexRequest.builder()
                    .messageId(UUID.fromString(saved.getId()))
                    .threadId(UUID.fromString(thread.getId()))
                    .projectId(UUID.fromString(thread.getProject().getId()))
                    .role(RagChatMessageRole.ASSISTANT.name().toLowerCase())
                    .question(question)
                    .answer(answer)
                    .combinedText(buildEmbeddingText(question, answer))
                    .metadata(buildEmbeddingMetadata(thread, contexts, metadata))
                    .build();

            RagConversationMessageIndexResponse response = ragService.indexConversationMessage(indexRequest);
            saved.setEmbeddingMessageId(indexRequest.getMessageId().toString());
            saved.setEmbeddingStatus(response != null ? response.getStatus() : "queued");
            saved.setUpdatedAt(LocalDateTime.now());
            messageRepository.save(saved);
        } catch (Exception e) {
            log.error("Failed to index assistant message: messageId={}", saved.getId(), e);
            saved.setEmbeddingStatus("failed");
            saved.setErrorMessage(e.getMessage());
            messageRepository.save(saved);
        }

        return saved;
    }

    private String buildEmbeddingText(String question, String answer) {
        StringBuilder builder = new StringBuilder();
        if (StringUtils.hasText(question)) {
            builder.append("[질문]\n").append(question.strip()).append("\n\n");
        }
        if (StringUtils.hasText(answer)) {
            builder.append("[답변]\n").append(answer.strip());
        }
        return builder.toString();
    }

    private Map<String, Object> buildEmbeddingMetadata(
            RagChatThread thread,
            List<RagChatContext> contexts,
            Map<String, Object> metadata
    ) {
        Map<String, Object> embeddingMetadata = new HashMap<>();
        embeddingMetadata.put("threadId", thread.getId());
        embeddingMetadata.put("projectId", thread.getProject().getId());
        if (thread.getTitle() != null && !thread.getTitle().isBlank()) {
            embeddingMetadata.put("threadTitle", thread.getTitle());
        }
        embeddingMetadata.put("categories", thread.getCategories().stream()
                .map(RagChatCategory::getId)
                .toList());
        if (!CollectionUtils.isEmpty(contexts)) {
            embeddingMetadata.put("contexts", contexts.stream()
                    .map(context -> Map.of(
                            "id", context.getId(),
                            "fileName", context.getFileName(),
                            "similarity", context.getSimilarity()
                    ))
                    .toList());
        }
        if (metadata != null) {
            embeddingMetadata.putAll(metadata);
        }
        return embeddingMetadata;
    }

    private String serializeContexts(List<RagChatContext> contexts) {
        if (CollectionUtils.isEmpty(contexts)) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(RagChatResponse.contextsToDocuments(contexts));
        } catch (Exception e) {
            log.warn("Failed to serialize contexts", e);
            return null;
        }
    }

    private String serializeMetadata(Map<String, Object> metadata) {
        if (metadata == null || metadata.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(metadata);
        } catch (Exception e) {
            log.warn("Failed to serialize metadata", e);
            return null;
        }
    }

    @Transactional(readOnly = true)
    public List<RagChatThreadDTO> getThreads(String projectId) {
        log.info("🔍 Repository에서 스레드 조회 시작: projectId={}", projectId);
        List<RagChatThread> entities = threadRepository.findByProject_IdOrderByCreatedAtDesc(projectId);
        log.info("📦 Repository에서 조회된 엔티티 개수: {}", entities.size());

        List<RagChatThreadDTO> dtos = entities.stream()
                .map(this::toThreadDTO)
                .toList();
        log.info("✅ DTO 변환 완료: dtoCount={}", dtos.size());

        return dtos;
    }

    public RagChatThreadDTO toThreadDTO(RagChatThread thread) {
        LocalDateTime lastMessageAt = messageRepository.findFirstByThread_IdOrderByCreatedAtDesc(thread.getId())
                .map(RagChatMessage::getCreatedAt)
                .orElse(thread.getCreatedAt());

        long messageCount = messageRepository.countByThread_Id(thread.getId());

        return RagChatThreadDTO.builder()
                .id(thread.getId())
                .projectId(thread.getProject().getId())
                .title(thread.getTitle())
                .description(thread.getDescription())
                .archived(thread.isArchived())
                .createdBy(thread.getCreatedBy())
                .updatedBy(thread.getUpdatedBy())
                .createdAt(thread.getCreatedAt())
                .updatedAt(thread.getUpdatedAt())
                .lastMessageAt(lastMessageAt)
                .messageCount(messageCount)
                .categories(thread.getCategories().stream()
                        .map(this::toCategoryDTO)
                        .toList())
                .build();
    }

    public RagChatCategoryDTO toCategoryDTO(RagChatCategory category) {
        return RagChatCategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .color(category.getColor())
                .description(category.getDescription())
                .build();
    }

    @Transactional(readOnly = true)
    public List<RagChatMessageDTO> getMessages(String threadId) {
        return messageRepository.findByThread_IdOrderByCreatedAtAsc(threadId)
                .stream()
                .map(this::toMessageDTO)
                .toList();
    }

    public RagChatMessageDTO toMessageDTO(RagChatMessage message) {
        return RagChatMessageDTO.builder()
                .id(message.getId())
                .threadId(message.getThread().getId())
                .role(message.getRole().name().toLowerCase())
                .content(message.getContent())
                .parentMessageId(message.getParentMessageId())
                .documents(deserializeList(message.getContextSnapshot()))
                .metadata(deserializeMap(message.getMetadataJson()))
                .llmProvider(message.getLlmProvider())
                .llmModel(message.getLlmModel())
                .tokensUsed(message.getTokensUsed())
                .temperature(message.getTemperature())
                .embeddingMessageId(message.getEmbeddingMessageId())
                .embeddingStatus(message.getEmbeddingStatus())
                .createdBy(message.getCreatedBy())
                .updatedBy(message.getUpdatedBy())
                .editedBy(message.getEditedBy())
                .createdAt(message.getCreatedAt())
                .updatedAt(message.getUpdatedAt())
                .editedAt(message.getEditedAt())
                .errorMessage(message.getErrorMessage())
                .build();
    }

    private List<Map<String, Object>> deserializeList(String json) {
        if (!StringUtils.hasText(json)) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(json, LIST_OF_MAPS);
        } catch (Exception e) {
            log.warn("Failed to deserialize context snapshot", e);
            return Collections.emptyList();
        }
    }

    private Map<String, Object> deserializeMap(String json) {
        if (!StringUtils.hasText(json)) {
            return Collections.emptyMap();
        }
        try {
            return objectMapper.readValue(json, MAP_TYPE);
        } catch (Exception e) {
            log.warn("Failed to deserialize metadata", e);
            return Collections.emptyMap();
        }
    }

    @Transactional
    public RagChatMessageDTO editAssistantMessage(RagChatMessageEditRequest request, String username) {
        RagChatMessage message = messageRepository.findById(request.getMessageId())
                .orElseThrow(() -> new IllegalArgumentException("메시지를 찾을 수 없습니다: " + request.getMessageId()));

        if (message.getRole() != RagChatMessageRole.ASSISTANT) {
            throw new IllegalStateException("어시스턴트 응답만 편집할 수 있습니다.");
        }

        message.setContent(request.getContent());
        message.setMetadataJson(serializeMetadata(request.getMetadata()));
        message.markEdited(username);
        message.setUpdatedBy(username);
        message.setEmbeddingStatus("pending");

        messageRepository.save(message);

        try {
            String question = Optional.ofNullable(message.getParentMessageId())
                    .flatMap(messageRepository::findById)
                    .map(RagChatMessage::getContent)
                    .orElse(null);

            RagConversationMessageIndexRequest indexRequest = RagConversationMessageIndexRequest.builder()
                    .messageId(UUID.fromString(message.getId()))
                    .threadId(UUID.fromString(message.getThread().getId()))
                    .projectId(UUID.fromString(message.getThread().getProject().getId()))
                    .role(RagChatMessageRole.ASSISTANT.name().toLowerCase())
                    .question(question)
                    .answer(message.getContent())
                    .combinedText(buildEmbeddingText(question, message.getContent()))
                    .metadata(buildEmbeddingMetadata(message.getThread(), Collections.emptyList(), request.getMetadata()))
                    .build();

            RagConversationMessageIndexResponse response = ragService.indexConversationMessage(indexRequest);
            message.setEmbeddingStatus(response != null ? response.getStatus() : "queued");
            message.setEmbeddingMessageId(indexRequest.getMessageId().toString());
            messageRepository.save(message);
        } catch (Exception e) {
            log.error("Failed to re-index assistant message after edit: messageId={}", message.getId(), e);
            message.setEmbeddingStatus("failed");
            message.setErrorMessage(e.getMessage());
            messageRepository.save(message);
        }

        return toMessageDTO(message);
    }

    @Transactional
    public void deleteAssistantMessage(String messageId, String username) {
        RagChatMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "메시지를 찾을 수 없습니다: " + messageId));

        if (message.getRole() != RagChatMessageRole.ASSISTANT) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "어시스턴트 응답만 삭제할 수 있습니다.");
        }

        String embeddingMessageId = message.getEmbeddingMessageId();
        if (StringUtils.hasText(embeddingMessageId)) {
            try {
                ragService.deleteConversationMessage(UUID.fromString(embeddingMessageId));
            } catch (Exception e) {
                log.warn("Failed to delete conversation embedding for message: messageId={}, embeddingId={}",
                        message.getId(), embeddingMessageId, e);
            }
        }

        RagChatThread thread = message.getThread();
        messageRepository.delete(message);

        if (thread != null) {
            thread.setUpdatedBy(username);
        }
    }

    @Transactional(readOnly = true)
    public List<RagChatCategoryDTO> getCategories(String projectId) {
        return categoryRepository.findByProject_IdOrderByNameAsc(projectId)
                .stream()
                .map(this::toCategoryDTO)
                .toList();
    }

    @Transactional
    public RagChatCategoryDTO createCategory(RagChatCategoryCreateRequest request, String username) {
        Project project = projectRepository.findById(request.getProjectId().toString())
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다: " + request.getProjectId()));

        RagChatCategory category = RagChatCategory.builder()
                .project(project)
                .name(request.getName())
                .color(request.getColor())
                .description(request.getDescription())
                .createdBy(username)
                .build();

        return toCategoryDTO(categoryRepository.save(category));
    }

    @Transactional
    public RagChatCategoryDTO updateCategory(RagChatCategoryUpdateRequest request, String username) {
        RagChatCategory category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("카테고리를 찾을 수 없습니다: " + request.getCategoryId()));

        if (StringUtils.hasText(request.getName())) {
            category.setName(request.getName());
        }
        if (request.getColor() != null) {
            category.setColor(request.getColor());
        }
        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }

        return toCategoryDTO(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(String categoryId) {
        categoryRepository.deleteById(categoryId);
    }
}
