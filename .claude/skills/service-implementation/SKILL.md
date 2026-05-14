---
name: service-implementation
description: api-designer의 설계와 model-builder의 Entity/Repository를 받아 Service 클래스의 비즈니스 로직을 작성한다. @Service @Transactional, SecurityContextUtil 권한 검증, ResourceNotFoundException/AccessDeniedException 예외 처리, @Autowired 필드 주입 패턴. model-construction 다음 단계.
---

# Service Implementation

Service 클래스의 비즈니스 로직을 작성한다.

## 워크플로우

### 1. 산출물 읽기

- `_workspace/api_01_design_{feature}.json`
- `_workspace/api_02_model_{feature}.md`

설계의 endpoints + model의 Entity/Repository 정보 확보.

### 2. Service 클래스 결정

- 기존 Service에 메서드만 추가 가능 → 기존 클래스 확장
- 새 도메인 → `src/main/java/.../service/{Feature}Service.java` 신규

### 3. 신규 Service 템플릿

```java
package com.testcase.testcasemanagement.service;

import com.testcase.testcasemanagement.exception.AccessDeniedException;
import com.testcase.testcasemanagement.exception.ResourceNotFoundException;
import com.testcase.testcasemanagement.model.{Entity};
import com.testcase.testcasemanagement.repository.{Entity}Repository;
import com.testcase.testcasemanagement.security.{Feature}SecurityService;
import com.testcase.testcasemanagement.util.SecurityContextUtil;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class {Feature}Service {

  @Autowired private {Entity}Repository {entity}Repository;
  @Autowired private SecurityContextUtil securityContextUtil;
  @Autowired private {Feature}SecurityService {feature}SecurityService;
  // 다른 의존성 필요 시 추가

  // 메서드 본문
}
```

### 4. 메서드 작성 (액션별 패턴)

#### Create
```java
public {Entity} create({type1} arg1, {type2} arg2) {
  String currentUsername = securityContextUtil.getCurrentUsername();
  if (currentUsername == null) {
    throw new AccessDeniedException("인증이 필요합니다.");
  }

  // 권한 확인 (필요 시)
  if (!{feature}SecurityService.canCreate(currentUsername)) {
    throw new AccessDeniedException("생성 권한이 없습니다.");
  }

  // 입력 검증 (간단한 경우)
  if (arg1 == null || arg1.isBlank()) {
    throw new IllegalArgumentException("이름은 필수입니다.");
  }

  {Entity} entity = new {Entity}();
  entity.setXxx(arg1);
  entity.setYyy(arg2);
  // @PrePersist가 createdAt/updatedAt 처리

  return {entity}Repository.save(entity);
}
```

#### Read (단건)
```java
@Transactional(readOnly = true)
public {Entity} get(String id) {
  String currentUsername = securityContextUtil.getCurrentUsername();
  if (!{feature}SecurityService.canRead(id, currentUsername)) {
    throw new AccessDeniedException("조회 권한이 없습니다.");
  }
  return {entity}Repository
      .findById(id)
      .orElseThrow(() -> new ResourceNotFoundException("{entity}를 찾을 수 없습니다."));
}
```

#### Read (목록)
```java
@Transactional(readOnly = true)
public List<{Entity}> getAllByParent(String parentId) {
  // 권한 확인
  return {entity}Repository.findByParentId(parentId);
}
```

#### Update / Partial Update
```java
public {Entity} update(String id, {type1} arg1) {
  String username = securityContextUtil.getCurrentUsername();
  {Entity} entity = {entity}Repository
      .findById(id)
      .orElseThrow(() -> new ResourceNotFoundException("..."));

  if (!{feature}SecurityService.canUpdate(id, username)) {
    throw new AccessDeniedException("수정 권한이 없습니다.");
  }

  entity.setXxx(arg1);
  entity.setUpdatedAt(LocalDateTime.now());
  return {entity}Repository.save(entity);
}
```

#### Delete
```java
public void delete(String id) {
  String username = securityContextUtil.getCurrentUsername();
  {Entity} entity = {entity}Repository
      .findById(id)
      .orElseThrow(() -> new ResourceNotFoundException("..."));

  if (!{feature}SecurityService.canDelete(id, username)) {
    throw new AccessDeniedException("삭제 권한이 없습니다.");
  }

  // 관계 정리 (cascade가 처리 안 하는 부분)
  {entity}Repository.deleteById(id);
}
```

#### Custom Action
```java
public {Entity} performAction(String id, ...args) {
  // 권한 + 조회
  {Entity} entity = ...;

  // 상태 검증 (이미 처리되었는지 등)
  if (entity.isAlreadyDone()) {
    throw new IllegalStateException("이미 처리되었습니다.");
  }

  // 상태 변경
  entity.setStatus("done");
  entity.setActedAt(LocalDateTime.now());

  // 이벤트 발행 (필요 시)
  // applicationEventPublisher.publishEvent(...);

  return {entity}Repository.save(entity);
}
```

### 5. 보고서 작성

`_workspace/api_03_service_{feature}.md`. 형식은 agents/service-implementer.md 참조.

## 트랜잭션 전략

| 메서드 유형 | 어노테이션 |
|------------|----------|
| 클래스 기본 | `@Transactional` (쓰기) |
| 조회만 | 메서드 수준 `@Transactional(readOnly = true)` |
| 외부 호출 + DB | `@Transactional(propagation = REQUIRES_NEW)` 또는 분리 |
| 비동기 | `@Async` + 별도 트랜잭션 관리 |

## 권한 검증 패턴

```java
String currentUsername = securityContextUtil.getCurrentUsername();
if (currentUsername == null) {
  throw new AccessDeniedException("인증이 필요합니다.");
}

if (!{feature}SecurityService.{check}(id, currentUsername)) {
  throw new AccessDeniedException("권한이 없습니다.");
}
```

Controller의 `@PreAuthorize`와 중복으로 보이지만 Defense in Depth — Service에서도 재검증.

## 신규 SecurityService 필요 시

api-designer가 `needsNewSecurityService: true`로 보고 + 오케스트레이터가 사용자 승인을 받았다면:

`src/main/java/.../security/{Feature}SecurityService.java` 생성:
```java
package com.testcase.testcasemanagement.security;

import com.testcase.testcasemanagement.repository.{Entity}Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service("{feature}SecurityService")
public class {Feature}SecurityService {

  @Autowired private {Entity}Repository {entity}Repository;
  @Autowired private UserRepository userRepository;

  public boolean canAccess(String id, String username) {
    // 권한 로직
    return true;
  }

  public boolean isOwner(String id, String username) {
    // 소유자 검증
  }
}
```

@Service의 bean name은 SpEL 표현식에서 사용 — `@{feature}SecurityService.canAccess(...)`.

## 검증 체크 (자체)

- [ ] 클래스에 `@Service @Transactional`
- [ ] 모든 의존성이 `@Autowired` 필드 주입
- [ ] 조회만 하는 메서드에 `@Transactional(readOnly = true)`
- [ ] null/blank 검증
- [ ] Optional.orElseThrow 패턴 (`.get()` 직접 호출 금지)
- [ ] 예외 메시지가 한국어
- [ ] setUpdatedAt 호출 (수정 메서드)

## 에러 핸들링

- **Repository 메서드 누락:** model-construction 보고서 참조, 누락 시 보고 후 임시 `findAll().stream().filter()` (성능 위험 명시)
- **순환 의존성:** 인터페이스로 분리 또는 별도 Service로 추출
- **트랜잭션 외부 호출:** 별도 메서드로 분리, propagation 명시
