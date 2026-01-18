package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.dto.rag.RagGlobalDocumentRequestDto;
import com.testcase.testcasemanagement.exception.ResourceNotFoundException;
import com.testcase.testcasemanagement.model.rag.RagGlobalDocumentRequest;
import com.testcase.testcasemanagement.model.rag.RagGlobalDocumentRequestStatus;
import com.testcase.testcasemanagement.repository.RagGlobalDocumentRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RagGlobalDocumentRequestService {

    private final RagGlobalDocumentRequestRepository repository;
    private final RagService ragService;
    private static final java.util.UUID GLOBAL_PROJECT_ID = RagServiceImpl.GLOBAL_PROJECT_ID;

    @Transactional
    public RagGlobalDocumentRequestDto createRequest(UUID documentId, String requestedBy, String message) {
        log.info("Creating global document request: documentId={}, requestedBy={}", documentId, requestedBy);

        var document = Optional.ofNullable(ragService.getDocument(documentId))
                .orElseThrow(() -> new ResourceNotFoundException("Document not found in RAG API"));

        if (GLOBAL_PROJECT_ID.equals(document.getProjectId())) {
            throw new IllegalStateException("이미 공통 RAG 문서입니다.");
        }

        repository.findTopByDocumentIdAndStatusOrderByCreatedAtDesc(documentId, RagGlobalDocumentRequestStatus.PENDING)
                .ifPresent(existing -> {
                    throw new IllegalStateException("이미 처리 대기 중인 요청이 있습니다.");
                });

        RagGlobalDocumentRequest entity = RagGlobalDocumentRequest.builder()
                .documentId(documentId)
                .projectId(document.getProjectId())
                .documentName(document.getFileName())
                .requestedBy(requestedBy)
                .requestMessage(message)
                .status(RagGlobalDocumentRequestStatus.PENDING)
                .build();

        return toDto(repository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<RagGlobalDocumentRequestDto> listRequests(RagGlobalDocumentRequestStatus status) {
        List<RagGlobalDocumentRequest> requests;
        if (status != null) {
            requests = repository.findByStatusOrderByCreatedAtAsc(status);
        } else {
            requests = repository.findAll();
        }
        return requests.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public RagGlobalDocumentRequestDto approveRequest(String requestId, String processedBy, String note) {
        RagGlobalDocumentRequest request = repository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("RAG 글로벌 문서 요청", requestId));

        if (!request.isPending()) {
            throw new IllegalStateException("이미 처리된 요청입니다.");
        }

        ragService.moveDocumentToGlobal(request.getDocumentId(), processedBy, note);

        request.setStatus(RagGlobalDocumentRequestStatus.APPROVED);
        request.setProcessedBy(processedBy);
        request.setProcessedAt(LocalDateTime.now());
        request.setResponseMessage(note);
        return toDto(repository.save(request));
    }

    @Transactional
    public RagGlobalDocumentRequestDto rejectRequest(String requestId, String processedBy, String note) {
        RagGlobalDocumentRequest request = repository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("RAG 글로벌 문서 요청", requestId));

        if (!request.isPending()) {
            throw new IllegalStateException("이미 처리된 요청입니다.");
        }

        request.setStatus(RagGlobalDocumentRequestStatus.REJECTED);
        request.setProcessedBy(processedBy);
        request.setProcessedAt(LocalDateTime.now());
        request.setResponseMessage(note);
        return toDto(repository.save(request));
    }

    private RagGlobalDocumentRequestDto toDto(RagGlobalDocumentRequest entity) {
        return RagGlobalDocumentRequestDto.builder()
                .id(entity.getId())
                .documentId(entity.getDocumentId())
                .projectId(entity.getProjectId())
                .documentName(entity.getDocumentName())
                .requestedBy(entity.getRequestedBy())
                .requestMessage(entity.getRequestMessage())
                .status(entity.getStatus())
                .processedBy(entity.getProcessedBy())
                .responseMessage(entity.getResponseMessage())
                .createdAt(entity.getCreatedAt())
                .processedAt(entity.getProcessedAt())
                .build();
    }
}
