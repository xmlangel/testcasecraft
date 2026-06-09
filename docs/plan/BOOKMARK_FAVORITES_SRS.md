# 테스트케이스 즐겨찾기/개인 북마크 — 요구사항 명세서 (SRS)

| 항목 | 내용 |
|------|------|
| 문서 버전 | 0.1 (Draft) |
| 작성일 | 2026-06-09 |
| 대상 제품 | testcasecraft |
| 상태 | 검토 대기 |

---

## 0. 확정된 의도 (요약)

1. **프로젝트별·케이스별 즐겨찾기 토글** — 케이스 행의 별 버튼을 누르면 개인 북마크에 등록.
2. **여러 개의 이름붙은 북마크 모음** — 사용자가 'Regression Set', 'Smoke' 등 다수의 북마크 컬렉션을 만들어 케이스를 분류 관리(플레이리스트 패턴).
3. **북마크 화면은 읽기 전용 참조** — 북마크 화면에서는 케이스를 열람만 가능(편집 버튼 없음). 케이스 내용 수정은 기존 케이스 관리 화면에서만. 단, 북마크/모음 자체의 CRUD(생성·이름변경·메모·이동·삭제)는 가능.
4. **개인 전용** — 북마크는 사용자 본인에게만 보임.

---

## 1. 개요

### 1.1 목적
본 문서는 testcasecraft 에 추가될 **테스트케이스 즐겨찾기/개인 북마크** 기능의 요구사항을 정의한다. 사용자가 자주 참조하는 테스트케이스를 개인 북마크로 등록하고, 여러 개의 이름붙은 모음으로 분류해 빠르게 다시 찾을 수 있게 한다.

### 1.2 범위
- 케이스 단위 즐겨찾기 토글(별 버튼).
- 사용자별·프로젝트별 다수 북마크 모음(컬렉션) 관리(CRUD).
- 모음에 케이스 추가/제거, 케이스별 개인 메모.
- 읽기 전용 북마크 조회 화면.
- **범위 외**: 북마크 화면에서의 케이스 내용 편집, 팀/조직 공유 북마크, 북마크 모음 버전 스냅샷, 케이스 콘텐츠 버전(TestCaseVersion) 지정 북마크.

### 1.3 용어 정의
| 용어 | 정의 |
|------|------|
| 즐겨찾기(Favorite) | 케이스를 빠르게 토글로 등록/해제하는 동작. 기본 모음에 대한 추가/제거로 동작. |
| 북마크 모음(Bookmark Collection) | 사용자가 이름을 붙여 만드는 케이스 묶음. 한 사용자·프로젝트 내 다수 존재. |
| 북마크 항목(Bookmark Item) | 특정 모음에 담긴 하나의 케이스 참조(+개인 메모). |
| 기본 모음(Default Collection) | 별 버튼 토글의 기본 대상이 되는 모음. 사용자·프로젝트별 1개 자동 생성. |
| 읽기 전용 참조 | 북마크 화면에서는 케이스를 열람만 가능하며 편집 UI 가 노출되지 않음. |

### 1.4 참조 (기존 코드 패턴)
- 기존 per-user 엔티티 스택: `UserActivity*` (Model/Repository/Service/Controller/DTO 복제 표준)
- 인증 유틸: `util/SecurityContextUtil` — `getCurrentUserId()`, `getCurrentUser(): Optional<User>`
- 케이스 리스트 UI: `components/TestCase/FolderCaseList.jsx`
- 아이콘 버튼 패턴: `components/TestPlanList.jsx`
- i18n 패턴: `config/i18n/keys/*KeysInitializer.java`, `config/i18n/translations/{Korean,English}*Translations.java`
- API 래퍼: `services/apiService.js` 의 `api(url, opts)`

---

## 2. 전체 설명

### 2.1 제품 관점
기존 프로젝트→폴더→테스트케이스 구조 위에 사용자 개인 레이어로 북마크를 얹는다. 케이스/폴더/프로젝트 엔티티는 변경하지 않고 신규 엔티티 2종(모음, 항목)만 추가한다.

### 2.2 사용자 특성
- 모든 인증 사용자(ADMIN/MANAGER/TESTER 무관)가 자신의 북마크를 관리.
- 북마크는 **본인 전용**이며 타인에게 노출되지 않는다.

### 2.3 제약 및 가정
- 신규 테이블은 JPA `spring.jpa.hibernate.ddl-auto: update` 로 자동 생성(별도 마이그레이션 스크립트 없음. Flyway/Liquibase 미사용).
- 모든 신규 API 는 `/api/**` 규칙으로 JWT 인증 필요.
- 케이스/프로젝트/사용자 ID 는 String UUID.
- 케이스가 삭제되면 해당 북마크 항목도 함께 정리(FK on-delete 또는 애플리케이션 정리)되어야 한다.

---

## 3. 기능 요구사항 (FR)

### FR-1. 즐겨찾기 토글
- **FR-1.1** 케이스 리스트(`FolderCaseList`)의 각 테스트케이스 행에 별 아이콘 버튼을 표시한다(폴더 행 제외).
- **FR-1.2** 비활성 별 클릭 시 해당 케이스를 **기본 모음**에 추가하고 아이콘을 채워진 상태로 전환한다.
- **FR-1.3** 활성 별 클릭 시 기본 모음에서 제거한다. 채워진 별은 어느 한 모음에라도 포함되면 활성으로 표시한다.
- **FR-1.4** 토글은 행 클릭(케이스 열기)과 충돌하지 않도록 이벤트 전파를 차단한다.
- **FR-1.5** 즐겨찾기 상태는 케이스 리스트 로드시 일괄 조회되어 즉시 반영된다.

### FR-2. 북마크 모음 관리 (CRUD)
- **FR-2.1** 사용자는 프로젝트 내에서 이름붙은 북마크 모음을 **여러 개** 생성할 수 있다(예: 'Regression Set', 'Smoke').
- **FR-2.2** 모음의 이름·설명을 수정할 수 있다.
- **FR-2.3** 모음을 삭제할 수 있다(포함 항목 cascade 삭제). 기본 모음은 삭제 불가 또는 삭제 시 재생성.
- **FR-2.4** 모음 이름은 사용자·프로젝트 범위에서 중복 불가(`unique(user_id, project_id, name)`).
- **FR-2.5** 기본 모음은 사용자가 해당 프로젝트에서 첫 즐겨찾기를 누를 때(또는 최초 조회 시) 자동 생성된다.

### FR-3. 모음-케이스 멤버십
- **FR-3.1** 한 케이스를 하나 이상의 모음에 담을 수 있다.
- **FR-3.2** 케이스를 특정 모음에 추가/제거할 수 있다(별 토글 외에 명시적 "모음에 담기" 동작 제공).
- **FR-3.3** 항목별 개인 **메모**(선택)를 작성/수정할 수 있다.
- **FR-3.4** 같은 케이스를 같은 모음에 중복 추가할 수 없다(`unique(collection_id, testcase_id)`).

### FR-4. 북마크 조회 화면 (읽기 전용)
- **FR-4.1** "내 북마크" 화면에서 사용자의 모음 목록과 각 모음의 케이스 목록을 본다.
- **FR-4.2** 모음 전환(탭/사이드)으로 모음별 케이스를 필터링한다.
- **FR-4.3** 케이스 항목 클릭 시 케이스 상세를 **열람**한다.
- **FR-4.4** **이 화면에는 케이스 편집/삭제 버튼이 노출되지 않는다**(읽기 전용 참조). 노출되는 행 동작은 모음에서 제거, 메모 편집, 다른 모음으로 이동뿐이다.
- **FR-4.5** 북마크는 항상 현재 케이스의 최신 내용을 가리킨다(스냅샷 아님). 케이스가 수정되면 북마크에서도 최신 내용이 보인다.
- **FR-4.6** 빈 상태(모음 없음/항목 없음) 안내 메시지를 제공한다.

### FR-5. 권한·가시성
- **FR-5.1** 모든 북마크 API 는 인증 필요하며, 응답은 **현재 사용자 소유 데이터로 한정**된다(서버에서 user_id 필터 강제).
- **FR-5.2** 타 사용자 모음/항목 접근 시 404 또는 403 을 반환한다.

### FR-6. 정합성
- **FR-6.1** 케이스 삭제 시 관련 북마크 항목이 정리되어야 한다(고아 항목 금지).
- **FR-6.2** 프로젝트 삭제 시 관련 모음·항목이 정리되어야 한다.

### FR-7. 다국어(i18n)
- **FR-7.1** 신규 UI 문구는 모두 `t("키","한국어")` + 한/영 시드로 등록한다(즐겨찾기, 모음, 메모, 빈 상태 등).

---

## 4. 비기능 요구사항 (NFR)
- **NFR-1 성능**: 케이스 리스트의 즐겨찾기 상태는 N+1 없이 단일 일괄 조회(케이스 id 집합 → 북마크 여부 map)로 해결.
- **NFR-2 보안**: 모든 조회/변경은 소유자 검증. 경로/ID 추측으로 타인 데이터 접근 불가.
- **NFR-3 일관성**: 기존 컨트롤러/서비스/Repository/DTO/Mapper 관례 준수(UserActivity 스택 모델).
- **NFR-4 호환성**: 기존 테이블·엔티티 비파괴. 신규 테이블만 추가.
- **NFR-5 i18n**: 한/영 무결성 — 영어 모드에서 한국어 잔존 금지.

---

## 5. 데이터 모델 (신규)

### 5.1 `bookmark_collections`
| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | varchar(36) | PK (UUID) |
| user_id | varchar(36) | FK→users, NOT NULL |
| project_id | varchar(36) | FK→projects, NOT NULL |
| name | varchar(100) | NOT NULL |
| description | varchar(500) | NULL |
| is_default | boolean | NOT NULL, default false |
| created_at / updated_at | timestamp | |
- 유니크: `(user_id, project_id, name)`
- 인덱스: `(user_id, project_id)`

### 5.2 `bookmark_items`
| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | varchar(36) | PK (UUID) |
| collection_id | varchar(36) | FK→bookmark_collections (on delete cascade), NOT NULL |
| testcase_id | varchar(36) | FK→testcases, NOT NULL |
| note | varchar(1000) | NULL |
| created_at | timestamp | |
- 유니크: `(collection_id, testcase_id)`
- 인덱스: `(collection_id)`, `(testcase_id)`

> JPA `@Entity` 2종으로 정의하면 `ddl-auto: update` 가 위 테이블을 자동 생성한다. 케이스 삭제 정합성(FR-6.1)은 `testcase_id` FK 또는 케이스 삭제 서비스에서 항목 정리로 보장.

---

## 6. API 명세 (제안)

기준 경로: `/api/bookmarks` (인증 필수, 응답은 현재 사용자로 한정)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/bookmarks/collections?projectId={id}` | 내 모음 목록(프로젝트별) |
| POST | `/api/bookmarks/collections` | 모음 생성 `{projectId,name,description}` |
| PUT | `/api/bookmarks/collections/{collectionId}` | 모음 이름/설명 수정 |
| DELETE | `/api/bookmarks/collections/{collectionId}` | 모음 삭제 |
| GET | `/api/bookmarks/collections/{collectionId}/items` | 모음 내 케이스(읽기 전용 상세 포함) |
| POST | `/api/bookmarks/collections/{collectionId}/items` | 케이스 추가 `{testCaseId,note?}` |
| DELETE | `/api/bookmarks/items/{itemId}` | 항목 제거 |
| PUT | `/api/bookmarks/items/{itemId}` | 메모 수정 `{note}` |
| POST | `/api/bookmarks/testcases/{testCaseId}/toggle?projectId={id}` | 기본 모음 토글(별 버튼) |
| GET | `/api/bookmarks/status?projectId={id}` | 프로젝트 케이스의 즐겨찾기 상태 map(리스트 표시용, FR-1.5/NFR-1) |

- 에러 규약: `ResponseEntity.status(...).body(Map.of("error", msg))` (기존 관례).
- 소유자 아닌 리소스: 404(권장) 반환.

---

## 7. UI/UX 요구사항
- **U-1** 케이스 리스트 행에 별 IconButton(`@mui/icons-material` Star/StarOutline), `TestPlanList.jsx` 의 아이콘 버튼 스타일·`data-testid` 관례 준수.
- **U-2** "내 북마크" 진입점: 프로젝트 헤더 탭 또는 라우트 `/projects/:projectId/bookmarks` 신설.
- **U-3** 북마크 화면 = 좌측 모음 목록 + 우측 선택 모음의 케이스 목록(읽기 전용). 케이스 편집/삭제 버튼 미노출(FR-4.4).
- **U-4** 모음 생성/이름변경/삭제 다이얼로그, 항목 메모 인라인 편집, "모음에 담기" 선택 UI.
- **U-5** 모든 문구 i18n 처리(한/영). 별 버튼 툴팁: 추가/제거 상태별 문구.
- **U-6** 빈 상태 안내.

---

## 8. 수용 기준 (Acceptance Criteria)
1. 케이스 행의 별을 누르면 기본 모음에 추가되고, 새로고침 후에도 채워진 별이 유지된다.
2. 사용자가 같은 프로젝트에서 2개 이상의 이름붙은 모음을 만들고, 케이스를 원하는 모음에 담을 수 있다.
3. 한 케이스를 여러 모음에 담을 수 있고, 같은 모음 중복 추가는 거부된다.
4. "내 북마크" 화면에서 케이스를 열람할 수 있으나 **편집/삭제 버튼이 보이지 않는다**.
5. 케이스 본문을 다른 화면에서 수정하면 북마크 화면에서도 최신 내용이 보인다(스냅샷 아님).
6. 다른 사용자의 모음/항목은 조회·수정 불가(404/403).
7. 케이스 삭제 시 해당 북마크 항목이 사라진다(고아 없음).
8. 영어 모드 전환 시 북마크 관련 한국어 문구가 남지 않는다.

---

## 9. 향후 고려 (범위 외)
- 팀/조직 공유 북마크, 모음 공유 링크.
- 북마크 모음 스냅샷 버전(v1/v2 되돌리기).
- 특정 TestCaseVersion 고정 북마크.
- 북마크 기반 빠른 테스트 실행 셋 구성.

---

## 10. 구현 작업 분해 (WBS)

### 백엔드
1. `model/BookmarkCollection.java`, `model/BookmarkItem.java` (엔티티 2종)
2. `repository/BookmarkCollectionRepository.java`, `BookmarkItemRepository.java`
3. `dto/BookmarkDto.java` (CollectionResponse / ItemResponse / Create·Update 요청, 중첩 DTO)
4. `service/BookmarkService.java` (소유자 검증, 기본 모음 lazy 생성, 토글, 상태 map)
5. `controller/BookmarkController.java` (`/api/bookmarks`, `Authentication` 주입)
6. 케이스/프로젝트 삭제 시 정리 (FR-6) — 기존 삭제 서비스에 정리 호출 또는 FK cascade
7. i18n: `BookmarkKeysInitializer` + `Korean/EnglishBookmarkTranslations` + DataInitializer 등록

### 프런트엔드
8. `services/` 또는 context 에 bookmark API 호출 추가
9. `FolderCaseList.jsx` 별 버튼 + 토글 + 상태 표시
10. "내 북마크" 페이지 컴포넌트(읽기 전용) + 라우트/탭 등록
11. 모음 CRUD UI(다이얼로그) + 메모 편집 + 모음에 담기 선택
12. i18n `t()` 키 적용

### 검증
13. 백엔드 빌드/기동 → 테이블 자동 생성 확인
14. API 라운드트립(토글·모음 CRUD·status map) 검증
15. 프런트 E2E: 별 토글 유지, 읽기 전용 확인, 한/영 전환 무결성
