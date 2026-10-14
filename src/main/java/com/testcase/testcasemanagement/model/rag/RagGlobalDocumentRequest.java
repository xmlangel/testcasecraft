package com.testcase.testcasemanagement.model.rag;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.*;
import org.hibernate.annotations.Comment;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Comment("RAG 전역 문서 요청: 문서를 전역 RAG 저장소에 등록하거나 변경하는 요청")
@Table(
    name = "rag_global_document_requests",
    indexes = {
      @Index(name = "idx_rag_global_doc_req_status", columnList = "status"),
      @Index(name = "idx_rag_global_doc_req_document", columnList = "document_id")
    })
public class RagGlobalDocumentRequest {

  @Comment("식별자: 이 요청을 유일하게 가리키는 값 (값 영역: UUID 36자)")
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  @Column(length = 36, updatable = false)
  private String id;

  @Comment("문서 식별자: 이 요청의 대상 문서 (값 영역: UUID 형식)")
  @Column(name = "document_id", nullable = false, columnDefinition = "uuid")
  private UUID documentId;

  @Comment("프로젝트 식별자: 이 요청을 제출한 프로젝트 (값 영역: UUID 형식)")
  @Column(name = "project_id", nullable = false, columnDefinition = "uuid")
  private UUID projectId;

  @Comment("문서 명: 요청된 문서의 이름 또는 제목 (값 영역: 512자 이하)")
  @Column(name = "document_name", nullable = false, length = 512)
  private String documentName;

  @Comment("요청자 명: 이 요청을 제출한 사용자 (값 영역: 100자 이하)")
  @Column(name = "requested_by", nullable = false, length = 100)
  private String requestedBy;

  @Comment("요청 메시지: 요청에 포함된 메모 또는 요청 사유")
  @Column(name = "request_message", columnDefinition = "TEXT")
  private String requestMessage;

  @Comment("상태: 이 요청의 처리 상태 (값 영역: PENDING, PROCESSING, COMPLETED, REJECTED, FAILED)")
  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 30)
  private RagGlobalDocumentRequestStatus status;

  @Comment("처리자 명: 이 요청을 처리한 사용자 또는 시스템 (값 영역: 100자 이하)")
  @Column(name = "processed_by", length = 100)
  private String processedBy;

  @Comment("응답 메시지: 처리 결과 메시지")
  @Column(name = "response_message", columnDefinition = "TEXT")
  private String responseMessage;

  @Comment("생성 일시: 이 요청이 제출된 일시")
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Comment("처리 일시: 이 요청이 처리 완료된 일시")
  @Column(name = "processed_at")
  private LocalDateTime processedAt;

  @PrePersist
  public void onCreate() {
    this.createdAt = LocalDateTime.now();
    if (this.status == null) {
      this.status = RagGlobalDocumentRequestStatus.PENDING;
    }
  }

  public boolean isPending() {
    return RagGlobalDocumentRequestStatus.PENDING.equals(this.status);
  }
}
