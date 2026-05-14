---
name: model-construction
description: api-designer의 entityChanges/newEntity 명세를 받아 JPA Entity와 Repository를 작성한다. Lombok + JPA 어노테이션 + UUID ID + Audit 필드(createdAt/updatedAt) 패턴 준수. DB 마이그레이션 안전성도 검증. api-design 다음 단계.
---

# Model Construction

JPA Entity와 Repository 작성.

## 워크플로우

### 1. 설계 읽기

`_workspace/api_01_design_{feature}.json`에서:
- `newEntity` (있으면): 신규 Entity 정의
- `entityChanges` 배열: 기존 Entity 필드 추가
- Service 메서드 시그니처(설계의 endpoints) → Repository 메서드 필요성 추론

### 2. 신규 Entity 작성 (newEntity 있을 때)

#### 파일 경로
`src/main/java/com/testcase/testcasemanagement/model/{EntityName}.java`

#### 템플릿
```java
package com.testcase.testcasemanagement.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "{snake_case_plural}")
public class {EntityName} {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  // 필드 (설계의 newEntity.fields 따라)
  @Column(nullable = false, length = 100)
  private String name;

  // 관계 매핑 (필요 시)
  @ManyToOne
  @JoinColumn(name = "user_id")
  private User user;

  // Audit
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
```

#### 필드 어노테이션 규칙

| 필드 유형 | 어노테이션 |
|----------|-----------|
| 필수 문자열 | `@Column(nullable = false, length = N)` |
| TEXT (긴 본문) | `@Column(columnDefinition = "TEXT")` |
| ENUM | `@Enumerated(EnumType.STRING) @Column(length = N)` |
| 부울 | `@Column(nullable = false) private boolean isActive;` |
| 외래키 | `@ManyToOne @JoinColumn(name = "x_id")` |
| 일대다 (자식) | `@OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)` |

#### 양방향 관계 Jackson 처리

- 부모: `@JsonManagedReference("alias")`
- 자식: `@JsonBackReference("alias")` 또는 `@JsonIgnore` (단방향 직렬화)

### 3. 기존 Entity 수정 (entityChanges)

각 entityChange에 대해:
1. 대상 Entity 파일 읽기
2. 클래스 본문 끝(메서드 선언 직전)에 새 필드 추가
3. 필요 시 import 추가
4. 기존 필드 순서 변경 금지

### 4. Repository 작성

#### 파일 경로
`src/main/java/com/testcase/testcasemanagement/repository/{EntityName}Repository.java`

#### 템플릿
```java
package com.testcase.testcasemanagement.repository;

import com.testcase.testcasemanagement.model.{EntityName};
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface {EntityName}Repository extends JpaRepository<{EntityName}, String> {

  Optional<{EntityName}> findByXxx(String xxx);

  List<{EntityName}> findByParentId(String parentId);

  // 복합 쿼리는 @Query
  @Query("SELECT e FROM {EntityName} e WHERE ...")
  List<{EntityName}> customQuery(@Param("xxx") String xxx);
}
```

#### 메서드 추가 결정

api-designer의 endpoints + service 사용 패턴을 보고 다음 메서드를 추가:
- 단건 조회 by 다른 unique 필드: `findByXxx`
- 부모 ID로 목록: `findByParentId`
- 페이지네이션: `Page<E> findByXxx(String xxx, Pageable pageable)`
- 복합 조건: `@Query("...")` 사용
- 카운트: `long countByXxx(String xxx)`
- 삭제: `void deleteByXxx(String xxx)` (트랜잭션 필요)

### 5. DB 마이그레이션 안전성 검사

| 변경 | 안전성 | 권장 동작 |
|------|-------|---------|
| 신규 Entity 추가 | ✅ | ddl-auto=update 자동 |
| nullable 컬럼 추가 | ✅ | 자동 |
| NOT NULL 컬럼 추가 (default 있음) | ⚠️ | default 명시, 보고 |
| NOT NULL 컬럼 추가 (default 없음) | ❌ | 기존 데이터 적재 실패. nullable로 추가 후 백필 권장 |
| 컬럼 삭제 | ❌ | ddl-auto가 자동 삭제 안 함, 수동 처리 |
| 컬럼 타입 변경 | ❌ | 데이터 손실 위험 |
| 관계 변경 | ❌ | 마이그레이션 스크립트 필요 |

⚠️/❌는 보고서에 명시.

### 6. 보고서 작성

`_workspace/api_02_model_{feature}.md`. 형식은 agents/model-builder.md 참조.

## 검증 체크 (자체)

- [ ] 모든 Entity가 `@GeneratedValue(strategy = GenerationType.UUID)` 사용
- [ ] 모든 Entity에 createdAt/updatedAt + @PrePersist/@PreUpdate
- [ ] 양방향 관계에 Jackson 어노테이션
- [ ] Repository가 `JpaRepository<Entity, String>` 확장
- [ ] DB 마이그레이션 위험 보고
- [ ] 기존 Entity 수정 시 기존 필드 순서 보존

## 에러 핸들링

- **새 Entity가 기존 Entity와 충돌:** 클래스명 변경 제안
- **순환 의존성(Entity A ↔ Entity B):** 한쪽을 @JsonIgnore로 단방향 직렬화
- **컬럼명 충돌:** snake_case 변환 후에도 충돌하면 사용자 확인

## 원칙

- **Lombok 의존:** `@Getter @Setter @NoArgsConstructor @AllArgsConstructor` 4종 세트
- **UUID String ID 고정:** Long 사용 금지
- **Audit 필드 필수:** createdAt, updatedAt + 라이프사이클 메서드
- **마이그레이션은 보수적으로:** ddl-auto에 의존하되 위험 명시
