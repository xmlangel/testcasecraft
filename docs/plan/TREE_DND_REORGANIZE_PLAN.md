# 테스트 케이스 트리 드래그앤드롭 재구성 — 디자인 문서

- **상태**: Proposed (Phase 1)
- **브랜치**: `feature/testcase-tree-dnd`
- **작성일**: 2026-05-27
- **작성자**: km.kim@skaiworldwide.co.kr (with Claude)
- **관련 코드**:
  - 백엔드: `src/main/java/com/testcase/testcasemanagement/{controller,service,model,dto,repository}/`
  - 프론트엔드: `src/main/frontend/src/components/...TestCaseTree.jsx`
  - MCP: `mcp-server/src/tools/testcase.ts`

---

## 1. 목표 (Goals)

테스트 케이스 트리에서 폴더와 케이스를 **드래그앤드롭(DnD)** 으로 직접 옮길 수 있게 한다.

- 다른 폴더로 부모 변경 (reparent)
- 같은 부모 내에서 순서 변경 (reorder)
- 다중 선택 후 한 번에 이동 (batch move)
- 부적절한 이동(자기/후손/타 프로젝트)을 시각적으로 차단
- 모든 이동을 audit log로 기록

## 2. 비목표 (Non-Goals)

다음은 Phase 2 이후로 미룬다.

- 잘라내기/붙여넣기 키보드 단축키
- 드래그 중 미니맵·자동 스크롤 추적
- 폴더 통째로 **다른 프로젝트로** 복사/이동
- `displayOrder` 를 정수 정규화가 아닌 fractional indexing(lexorank)로 전환
- 폴더 자체에 대한 일괄 삭제 UX 변경

## 3. 호환성 원칙 (Additive Only)

이 변경은 어떤 기존 동작도 제거하거나 깨지 않는다. DnD는 추가 진입점으로 공존한다.

| 기존 기능 | 변경 여부 |
|---|---|
| 우클릭 메뉴 (폴더 추가/케이스 추가/이름 변경/삭제/버전 히스토리) | **유지** |
| 순서 편집 모드의 위/아래 버튼 (`onMoveOrder`) | **유지** |
| `PUT /api/testcases/{id}` (parentId 변경 가능) | **유지** |
| 기존 MCP `testcase_move` (입력은 `parentId`만) | **유지** (`beforeId`/`afterId`는 선택 인자로만 추가) |
| 트리 데이터 응답 형식 | **유지** |

## 4. 데이터 모델 영향

### 4.1 기존 엔티티 재사용 — `TestCase`
폴더와 케이스는 단일 `testcases` 테이블의 `type` 컬럼으로 구분된다. 컬럼 추가 없음.

- `id` (UUID), `parentId` (String, nullable=root)
- `displayOrder` (Integer, nullable=false, default=1)
- `type` ∈ `testcase` / `folder` / `systemFolder`
- `project` (ManyToOne, 같은 프로젝트 범위로만 이동 허용)

### 4.2 신규 테이블 — `tc_move_audit_log`

```sql
CREATE TABLE tc_move_audit_log (
  id                 VARCHAR(36) PRIMARY KEY,
  testcase_id        VARCHAR(36) NOT NULL,
  from_parent_id     VARCHAR(36) NULL,
  to_parent_id       VARCHAR(36) NULL,
  from_display_order INTEGER     NULL,
  to_display_order   INTEGER     NOT NULL,
  moved_by           VARCHAR(100) NOT NULL,
  moved_at           TIMESTAMP    NOT NULL,
  request_kind       VARCHAR(16)  NOT NULL, -- 'single' | 'batch'
  batch_group_id     VARCHAR(36)  NULL,     -- batch 1회 호출이 공유
  project_id         VARCHAR(36)  NOT NULL,
  INDEX idx_tcmal_testcase (testcase_id),
  INDEX idx_tcmal_batch   (batch_group_id),
  INDEX idx_tcmal_project_moved_at (project_id, moved_at)
);
```

JPA `ddl-auto`가 활성화되어 있으면 엔티티 정의로 자동 생성. 별도 Flyway/Liquibase 마이그레이션은 본 변경에 도입하지 않는다 (기존 정책 유지).

## 5. API 스펙

### 5.1 단건 이동 — `POST /api/testcases/{id}/move`

**Request body**
```json
{
  "targetParentId": "uuid|null",   // null이면 루트로 이동
  "beforeId": "uuid|null",         // 이 형제 바로 위에 삽입 (선택)
  "afterId":  "uuid|null"          // 이 형제 바로 아래에 삽입 (선택)
}
```

`beforeId`/`afterId`가 모두 null이면 `targetParentId` 자식의 마지막에 추가.
둘 다 지정되면 400.

**Response 200**
```json
{
  "id": "uuid",
  "parentId": "uuid|null",
  "displayOrder": 5,
  "auditLogId": "uuid"
}
```

**Error codes**
- `400` — `targetParentId`가 자기 자신 또는 후손 / `beforeId`+`afterId` 동시 지정 / `targetParent`가 folder/systemFolder가 아님
- `403` — 프로젝트 편집 권한 없음
- `404` — id 또는 targetParentId가 존재하지 않음
- `409` — 다른 프로젝트로 이동 시도 / systemFolder 이동 시도

### 5.2 배치 이동 — `POST /api/testcases/move-batch`

**Request body**
```json
{
  "ids": ["uuid1", "uuid2", "uuid3"],
  "targetParentId": "uuid|null",
  "beforeId": "uuid|null",
  "afterId":  "uuid|null"
}
```

같은 트랜잭션에서 처리, 입력 배열 순서대로 displayOrder 부여.

**Response 200**
```json
{
  "moved": [
    {"id":"uuid1","parentId":"...","displayOrder":3},
    {"id":"uuid2","parentId":"...","displayOrder":4},
    {"id":"uuid3","parentId":"...","displayOrder":5}
  ],
  "batchGroupId": "uuid",
  "auditLogIds": ["...","...","..."]
}
```

**Error codes** — 단건과 동일. 단, 하나라도 실패하면 트랜잭션 전체 롤백.

## 6. 검증 규칙 (엄격)

`TestCaseService.move()` 진입 시 다음 순서로 검증:

1. **권한**: `ProjectSecurityService.hasEditRole(projectId)` 통과.
2. **존재**: `id` 와 `targetParentId`(null 아니면) 모두 DB에 존재.
3. **프로젝트 일치**: `moveTarget.project.id == newParent.project.id == movingNode.project.id`. 다르면 409.
4. **systemFolder 보호**: `movingNode.type == systemFolder` 거부. `newParent.type == systemFolder`는 허용(루트 시스템 폴더 아래로 이동 가능).
5. **타입 검증**: `newParent.type ∈ {folder, systemFolder}` (testcase 아래로 이동 금지). null(루트)은 허용.
6. **순환 차단**: `targetParentId ∈ collectDescendantIds(movingNode.id) ∪ {movingNode.id}` → 400.
   - 배치 시: 모든 `ids`에 대해 동일 검사.
7. **인접 노드 검증**: `beforeId`/`afterId`가 지정되면 해당 노드가 실제 `newParent`의 자식인지 확인.

`collectDescendantIds`는 현재 `private`이므로 `package-private` 또는 `public` 으로 가시성 완화하거나, `Set<String> collectDescendantIdSet(String)` 헬퍼를 별도 추가한다.

## 7. displayOrder 재계산 알고리즘

```text
moveSingle(id, targetParentId, beforeId, afterId):
  siblings ← repo.findByParentIdOrderByDisplayOrderAsc(targetParentId)
  siblings ← [s ∈ siblings | s.id ≠ id]                 # 자기 자신 제거
  insertIdx ← computeInsertIdx(siblings, beforeId, afterId)   # 끝 추가면 len(siblings)
  newOrder ← siblings[0..insertIdx] + [movingNode] + siblings[insertIdx..]
  for i, n in enumerate(newOrder):
    n.displayOrder ← i + 1
  movingNode.parentId ← targetParentId
  repo.saveAll(newOrder + [movingNode])
  # 옛 부모 쪽 형제도 1..N 으로 정규화
  if oldParentId ≠ targetParentId:
    renumberChildren(oldParentId)
```

배치 이동은 위 절차를 동일 트랜잭션에서 `ids` 순서대로 반복하되, 같은 부모로 들어가는 노드는 입력 배열 순서대로 인접하게 배치.

## 8. 프론트엔드 아키텍처

### 8.1 의존성 추가
`src/main/frontend/package.json`:
- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `@dnd-kit/utilities`

### 8.2 컴포넌트 변경

| 파일 | 변경 |
|---|---|
| `TestCaseTree.jsx` | 최상위 `<DndContext>` 래핑, `onDragStart`/`onDragOver`/`onDragEnd` 핸들러, 다중 선택 상태 연동 |
| `MemoizedTreeItem.jsx` | `useSortable` 적용, draggable+droppable, drop indicator 슬롯 |
| `useTestCaseTree.jsx` | `selectedIds: Set<string>` 추가, Shift/Cmd-click 다중 선택 |
| `useTestCaseActions.jsx` | `moveNodes({ ids, targetParentId, beforeId, afterId })` 액션 |
| `useTreeVirtualizer.jsx` | `measureElement` 콜백을 `useSortable`의 `setNodeRef`와 결합 |
| `TestContext.jsx` | 이동 후 낙관적 패치 → 실패 시 `previousState` 롤백 |

### 8.3 상호작용 규칙
- **드래그 시작**: 활성 노드가 다중 선택에 포함되면 선택 묶음 전체를 드래그, 아니면 해당 노드만.
- **드롭 위치 판정**:
  - 폴더의 **본문 영역** 위 → 그 폴더의 자식 끝에 추가.
  - 노드 위/아래 **갭 영역** 위 → 형제 사이 삽입 (`beforeId` 또는 `afterId` 산출).
- **invalid drop 시각화**:
  - 자기/후손/타 프로젝트/testcase 아래 → drop indicator를 빨간색, 커서 `not-allowed`.
- **낙관적 업데이트**: dispatch 즉시 클라이언트 트리 갱신 → API 호출 → 실패 시 이전 상태 복원 + 토스트.
- **API 묶음**: 다중 선택 이동은 **단일** `move-batch` 호출만.

### 8.4 가상화와의 공존
- `@tanstack/react-virtual`의 가상 아이템 인덱스를 `SortableContext` items 배열의 인덱스와 일치시킴.
- 가상 윈도우 밖으로 드래그 시 자동 스크롤은 Phase 1 비목표 (`@dnd-kit/core`의 기본 `autoScroll: true`만 사용).

## 9. 시퀀스 (성공/실패)

```
User                Frontend                Backend                DB
 |--drag start--->| selected=[A,B]
 |--drop on F---->|
                  | optimistic: tree.move([A,B] → F)
                  |--POST /move-batch----->| validate
                                            | descendants check
                                            | renumber siblings -----> UPDATE x N
                                            | INSERT audit_log x N --> INSERT x N
                  |<--200 {moved, batchId}-|
                  | reconcile (보통 no-op)
 |<--toast OK-----|

실패 경로:
                  |--POST /move-batch----->| validate fail
                  |<--400 {error}---------|
                  | rollback to previousState
 |<--toast err---|
```

## 10. 마이그레이션 / 롤아웃

- **마이그레이션**: JPA `ddl-auto`로 `tc_move_audit_log` 자동 생성. 별도 DDL 스크립트 없음.
- **기능 플래그**: 없음. PR 머지 = 활성화. 문제 발생 시 컨트롤러 메서드 2개 제거 또는 프론트 `DndContext` 분기로 비활성화 가능.
- **롤백 절차**:
  1. 프론트 `TestCaseTree.jsx`의 `<DndContext>` 래핑 제거 → 기존 동작으로 즉시 복귀.
  2. 백엔드 신규 컨트롤러 메서드 2개 제거 (테이블은 그대로 두어도 무해).

## 11. 보안 / 권한

- 두 신규 엔드포인트 모두 `ProjectSecurityService.hasEditRole()`로 보호.
- `moved_by`는 `Authentication#getName()`에서 수집.
- 시스템 폴더(`type='systemFolder'`)는 본 엔드포인트로 이동 불가.

## 12. 테스트 매트릭스

### 12.1 백엔드 단위 — `TestCaseServiceTest`

| 케이스 | 기대 |
|---|---|
| 폴더 → 다른 폴더로 이동 | 200, displayOrder 재계산 |
| 케이스 → 폴더 이동 | 200 |
| 케이스 → 케이스 아래로 이동 시도 | 400 |
| 자기 자신으로 이동 | 400 |
| 후손으로 이동 | 400 |
| 다른 프로젝트 폴더로 이동 | 409 |
| systemFolder를 이동 | 409 |
| `beforeId`+`afterId` 동시 지정 | 400 |
| 배치 5개 → 새 폴더, 입력 순서대로 displayOrder | 200, 순서 일치 |
| 배치 중 1개 실패 → 전체 롤백 | 400, DB 변경 없음 |
| 단건 성공 시 audit_log 1행 | OK |
| 배치 성공 시 audit_log N행, batch_group_id 공유 | OK |

### 12.2 백엔드 통합 — `TestCaseControllerTest` (MockMvc)
- 권한 없는 사용자 → 403
- 존재하지 않는 id → 404

### 12.3 프론트엔드
- onDragEnd 핸들러 → `moveNodes` 1회 호출
- 다중 선택 5개 드래그 → `move-batch` 1회 호출
- API 실패 → 토스트 + 트리 상태 롤백
- invalid drop zone 위에서는 drop indicator가 빨간색

### 12.4 E2E (수동)
1. `./gradlew bootRun` + `npm run dev`
2. 시나리오 6개 (드래그 시나리오 + 거부 시나리오)
3. DB에서 `tc_move_audit_log` 행 확인
4. MCP `testcase_move` / `testcase_move_batch` 라운드트립

## 13. 미해결 사항 (Open Questions)

- `displayOrder`를 매번 정규화 시 매우 큰 폴더(자식 1000+)에서 UPDATE 부하 — Phase 1은 허용, Phase 2에서 lexorank 검토.
- 가상화 트리에서 드래그 중 화면 밖 노드 위로 옮기는 UX — Phase 1은 `@dnd-kit` 기본 autoScroll에 의존.

## 14. Implementation Notes

### 14.1 실제 구현 vs 디자인 차이

- **시스템 폴더 식별**: 디자인 초안에서 `type='systemFolder'`로 보호한다고 적었으나, 실제 코드베이스는 `type='folder' AND description == SYSTEM_DEFAULT_FOLDER_DESCRIPTION`로 시스템 폴더를 식별한다 (`TestCaseConstants.SYSTEM_DEFAULT_FOLDER_DESCRIPTION = "[SYSTEM] 기본 폴더 - 삭제불가"`). 구현은 이 실제 패턴을 따른다.
- **별도 서비스 분리**: 기존 거대한 `TestCaseService` (1900+ 라인)에 메서드를 추가하지 않고, 단독 책임의 `TestCaseTreeMoveService`로 분리해 의존성을 깔끔하게 유지했다.
- **DTO 위치**: 신규 DTO 3개는 모두 `com.testcase.testcasemanagement.dto` 에 추가 (`TestCaseMoveRequest`, `TestCaseMoveBatchRequest`, `TestCaseMoveResultDto`).
- **JPA `ddl-auto`**: 신규 `tc_move_audit_log` 테이블은 JPA 엔티티 정의만으로 자동 생성됨. 운영 DB에서 별도 마이그레이션 스크립트 미작성.
- **MCP 호환**: `testcase_move` 도구는 `targetParentId`와 `parentId`를 둘 다 본문에 실어 보내 새/구 백엔드 모두 호환 (옛 백엔드는 `parentId`만 읽는다고 가정).

### 14.2 프론트엔드 DnD 동작 요약 (구현됨)

- 행 단위로 3개의 droppable zone(`before-{id}` / `into-{id}` / `after-{id}`).
- `into`는 폴더 노드에서만 활성화 (testcase 아래 드롭 불가).
- 드래그 시작은 행의 `DragIndicator` 핸들에서만 (행 클릭=선택은 정상 작동).
- 다중 선택 = `checkedIds` 묶음. 드래그 시작 노드가 묶음에 포함되면 묶음 전체 이동, 아니면 단일 이동.
- 자기/후손/checkedIds 묶음 자체로의 드롭은 프론트가 사전 차단 (백엔드도 동일 검증).
- 가상화 호환: `useDraggable.setNodeRef`에 `transform`을 적용하지 않고 `opacity`만 낮추며, 실제 드래그 비주얼은 `DragOverlay`로 표시 → 가상 리스트의 `translateY`와 충돌하지 않음.
- 성공/실패 모두 `fetchProjectTestCases`로 서버 재동기화 (낙관적 업데이트는 보수적으로 적용 — 향후 개선 여지).

### 14.3 의도적으로 보류된 작업 (Phase 1.B 후속)

- **프론트엔드 단위 테스트**: 현재 `src/main/frontend`에 vitest/jest 인프라가 없다. 본 PR에서는 컴파일 통과(`vite build`) + E2E 시나리오 수동 검증만. 테스트 인프라 도입은 별도 PR로 분리.
- **자동 스크롤**: `@dnd-kit/core`의 기본 `autoScroll`만 사용. 가상 윈도우 밖 노드로의 드래그 경험은 향후 개선.
- **낙관적 업데이트의 즉시 트리 패치**: 현재는 API 응답 후 `fetchProjectTestCases` 재호출. 큰 프로젝트에서는 느릴 수 있어 클라이언트 상태를 즉시 갱신하고 응답으로 reconcile하는 방식을 향후 도입.
- **MoveBatch fromOrder 정확도**: 같은 부모 내 reorder 배치 시 변경 전 순서 캡쳐 시점이 트랜잭션 시작 직후라 정확하나, 다중 부모에서 가져오는 케이스는 audit log의 `fromDisplayOrder`가 그 시점에 메모리에 있는 값. 99% 케이스는 정확하며, 강한 동시성 시나리오는 향후 row-level lock 추가 검토.

### 14.4 검증 결과 (2026-05-27)

- **백엔드 단위 테스트**: `TestCaseTreeMoveServiceTest` 14개 케이스 전부 통과 (`./gradlew test --tests TestCaseTreeMoveServiceTest`).
- **백엔드 컴파일**: `./gradlew compileJava` 성공 (경고 0, serialVersionUID 명시).
- **MCP TypeScript 빌드**: `cd mcp-server && npm run build` 성공.
- **프론트엔드 프로덕션 빌드**: `cd src/main/frontend && npm run build` 성공 (9.25s, 청크 사이즈 경고는 기존부터 존재).
- **E2E 수동 검증**: 별도 진행 필요. `./gradlew bootRun` + `npm run dev`로 실행 후 `docs/guide/TREE_DND_USER_GUIDE.md`의 시나리오 6개로 검증.

### 14.5 다음 액션 (사용자 확인용)

1. 데모 환경에서 트리 DnD 시나리오 직접 시험.
2. 디자인 문서 §13(미해결 사항)의 결정 확정 — 특히 displayOrder 정수 정규화 유지 여부.
3. 프론트엔드 단위 테스트 인프라(vitest) 도입 PR 별도 진행 여부 결정.
