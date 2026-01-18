package com.testcase.testcasemanagement.model.rag;

import com.testcase.testcasemanagement.model.Project;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * RAG 채팅 쓰레드 분류 엔티티
 *
 * 프로젝트별로 생성되는 카테고리로 대화를 분류한다.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
        name = "rag_chat_categories",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_rag_chat_category_project_name",
                        columnNames = {"project_id", "name"}
                )
        },
        indexes = {
                @Index(name = "idx_rag_chat_category_project", columnList = "project_id")
        }
)
public class RagChatCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "VARCHAR(36)", updatable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "color", length = 20)
    private String color;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "created_by", length = 100, nullable = false)
    private String createdBy;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
