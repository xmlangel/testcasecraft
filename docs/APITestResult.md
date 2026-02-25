# API 테스트 결과 리포트 (APITestResult.md)

이 문서는 `./gradlew test` 실행 결과를 요약하고 정리한 리포트입니다.

## 1. 테스트 실행 요약
- **실행 일시**: 2026-02-25 11:11:54 (KST)
- **환경**: local profile (Docker 인프라 서비스 가동 상태)
- **전체 테스트 수**: 410
- **성공**: 89
- **실패**: 101
- **건너뜀(Skipped)**: 220

## 2. 패키지별 테스트 상세 결과

| 테스트 클래스 | 테스트 내용 | 총계 | 성공 | 실패 | 건너뜀 | 비고 |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **API 패키지** | | | | | | |
| `AuthControllerJsonSchemaTest` | 인증 API JSON 스키마 검증 | 6 | 0 | 1 | 5 | context 설정 오류 가능성 |
| `DashboardControllerJsonSchemaTest` | 대시보드 API 스키마 검증 | 38 | 0 | 1 | 37 | |
| `OrganizationControllerIntegrationTest` | 조직 관리 통합 테스트 | 13 | 0 | 9 | 4 | |
| `SessionControllerApiTest` | 테스트 세션 라이프사이클 관리 | 5 | 5 | 0 | 0 | **정상** |
| `SingleApiTest` | 기본 인증 API 호출 테스트 | 1 | 0 | 1 | 0 | 401 Unauthorized 발생 |
| **Repository 패키지** | | | | | | |
| `GroupRepositoryTest` | 그룹 데이터 접근 테스트 | 17 | 17 | 0 | 0 | **정상** |
| `OrganizationRepositoryTest` | 조직 데이터 접근 테스트 | 11 | 11 | 0 | 0 | **정상** |
| `ProjectRepositoryTest` | 프로젝트 데이터 접근 테스트 | 21 | 21 | 0 | 0 | **정상** |
| `TestResultRepositoryImprovedTest` | 테스트 결과 저장소 테스트 | 2 | 2 | 0 | 0 | **정상** |
| **Service/Function 패키지** | | | | | | |
| `OrganizationServiceTest` | 조직 비즈니스 로직 테스트 | 15 | 10 | 5 | 0 | 일부 실패 |
| `JunitXmlParserServiceTest` | JUnit XML 파싱 서비스 테스트 | 11 | 11 | 0 | 0 | **정상** |
| `ExportServiceComprehensiveTest` | 데이터 내보내기 기능 테스트 | 5 | 5 | 0 | 0 | **정상** |
| `TestCaseDisplayIdServiceTest` | 테스트케이스 ID 생성 서비스 | 12 | 12 | 0 | 0 | **정상** |
| **Performance 패키지** | | | | | | |
| `DashboardApiLoadTest` | 대시보드 API 부하 테스트 | 4 | 4 | 0 | 0 | **정상** |
| `DatabaseIndexPerformanceTest` | DB 인덱스 성능 검증 | 5 | 4 | 1 | 0 | |

### 1. Repository Tests (레포지토리 테스트)
- **상태**: **✅ 100% 통과 (49/49)**
- **실행 방법**:
```bash
./gradlew test --tests "com.testcase.testcasemanagement.repository.*RepositoryTest"
```

#### 상세 테스트 명세

| 레포지토리 테스트 | 테스트 대상 (What) | 주요 테스트 항목 (Which) | 테스트 방법 (How) |
| :--- | :--- | :--- | :--- |
| **GroupRepositoryTest** | `Group` 엔티티 및 멤버/조직/프로젝트 관계 | - CRUD (조회, 저장, 삭제)<br>- 사용자 권한별 그룹 조회 (성공/없음/단일)<br>- 소속/독립 그룹 검색 (조직별, 프로젝트별, 소속 없음)<br>- 연관 관계 연쇄 삭제 (Cascade Delete)<br>- 복합 쿼리 및 대량 데이터 성능 검증 | - `TestEntityManager`를 통한 데이터 직접 적재<br>- 인메모리 DB(H2) 환경에서 실행<br>- `@Transactional`을 통한 테스트 격리 및 롤백<br>- UUID 생성 전략을 고려한 객체 ID 비교 |
| **OrganizationRepositoryTest** | `Organization` 엔티티 및 사용자 관계 | - CRUD (ID/전체 조회, 저장, 삭제)<br>- 사용자별 소속 조직 조회 및 정렬 (성공/없음/성능)<br>- 데이터 무결성 (조직 이름 중복 방지)<br>- 멤버 존재 시 조직 삭제 영향도 검증 | 상동 |
| **ProjectRepositoryTest** | `Project` 엔티티 및 조직/사용자 관계 | - CRUD (ID/코드/전체 조회, 저장, 삭제)<br>- 사용자별 접근 가능 프로젝트 검색 (성공/없음/성능)<br>- 조직별 프로젝트 분류 및 독립 프로젝트 검색<br>- 프로젝트 코드 중복 제약 조건 검증<br>- 검색(이름 패턴) 및 정렬(생성일) 기능<br>- 복합 소속 조건 쿼리 검증 | 상동 |

#### 주요 해결 전략 및 기술적 성과
- **ID 충돌 해결**: JPA UUID 자동 생성 전략 준수를 위해 수동 `setId()` 전면 제거
- **필수 필드 보완**: `User` 엔티티 제약조건 준수를 위해 `password`, `email`, `name` 데이터 추가
- **검증 로직 강화**: 리스트 순서에 무관한 ID 존재 여부 검증 (`anyMatch`) 도입
- **정합성 보장**: `Persistence Context` 최적화 (`entityManager.clear()`)를 통한 DB 직접 조회 유도
- **대상**: `GroupRepositoryTest`, `OrganizationRepositoryTest`, `ProjectRepositoryTest`
- **상태**: **✅ 100% 통과 (49/49)**
- **정기 실행 계획**: 매 빌드 시 전수 실행을 통해 변경 사항에 따른 회귀 테스트 수행

## 4. 주요 실패 원인 분석

1.  **Repository 테스트 완결**:
    *   이전의 `entityManager` 주입 문제 및 객체 ID 충돌 문제를 모두 해결하여 현재 Repository 레이어의 안정성을 확보했습니다.
    *   `@DataJpaTest`와 `TestEntityManager` 기반의 표준 테스트 패턴이 안착되었습니다.

2.  **API 테스트의 401 Unauthorized**:
    *   `SingleApiTest` 등에서 로그인 테스트 시 권한 오류가 발생했습니다. 이는 테스트용 계정 정보가 최신화되지 않았거나 H2 DB 초기화 상태 때문일 수 있습니다.

3.  **JSON Schema Test의 Skip**:
    *   대부분의 JsonSchema 테스트가 첫 번째 테스트 실패 후 나머지가 Skip 되었습니다. 이는 테스트 간 의존성 또는 공통 초기화 로직 실패의 영향입니다.

## 4. 후속 조치 권장 사항
*   인증 테스트용 사용자 정보(Admin/Admin123)가 테스트 DB에 올바르게 적재되는지 확인.
*   실패한 통합 테스트(`OrganizationControllerIntegrationTest` 등)의 상세 로그 분석을 통한 로직 수정.

---

## 📚 관련 문서
- [API 개발 가이드](file:///Users/dicky/kmdata/git/testcase/testcasecraft/docs/API_GUIDE.md): API 설계 및 개발 표준
- [API 테스트 가이드 요약](file:///Users/dicky/kmdata/git/testcase/testcasecraft/docs/API_TESTING_GUIDE_SUMMARY.md): API 테스트 작성 패턴 및 실행 방법
- [테스트 아키텍처 가이드](file:///Users/dicky/kmdata/git/testcase/testcasecraft/docs/TEST_ARCHITECTURE_GUIDE.md): 레이어별(API, Service, Repository) 테스트 표준
- [API 종합 테스트 가이드](file:///Users/dicky/kmdata/git/testcase/testcasecraft/docs/API_COMPREHENSIVE_TEST_README.md): 전체 엔드포인트 커버리지 테스트 안내
- [API 테스트 결과 리포트](file:///Users/dicky/kmdata/git/testcase/testcasecraft/docs/APITestResult.md): 최근 테스트 실행 결과 요약
