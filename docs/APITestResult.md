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
| `GroupRepositoryTest` | 그룹 데이터 접근 테스트 | 17 | 0 | 1 | 16 | setUp NPE (entityManager null) |
| `OrganizationRepositoryTest` | 조직 데이터 접근 테스트 | 14 | 0 | 1 | 13 | setUp NPE |
| `ProjectRepositoryTest` | 프로젝트 데이터 접근 테스트 | 21 | 0 | 1 | 20 | setUp NPE |
| `TestResultRepositoryImprovedTest` | 테스트 결과 저장소 테스트 | 2 | 2 | 0 | 0 | **정상** |
| **Service/Function 패키지** | | | | | | |
| `OrganizationServiceTest` | 조직 비즈니스 로직 테스트 | 15 | 10 | 5 | 0 | 일부 실패 |
| `JunitXmlParserServiceTest` | JUnit XML 파싱 서비스 테스트 | 11 | 11 | 0 | 0 | **정상** |
| `ExportServiceComprehensiveTest` | 데이터 내보내기 기능 테스트 | 5 | 5 | 0 | 0 | **정상** |
| `TestCaseDisplayIdServiceTest` | 테스트케이스 ID 생성 서비스 | 12 | 12 | 0 | 0 | **정상** |
| **Performance 패키지** | | | | | | |
| `DashboardApiLoadTest` | 대시보드 API 부하 테스트 | 4 | 4 | 0 | 0 | **정상** |
| `DatabaseIndexPerformanceTest` | DB 인덱스 성능 검증 | 5 | 4 | 1 | 0 | |

## 3. 주요 실패 원인 분석

1.  **Repository 테스트의 `setUp` 실패 (NullPointerException)**:
    *   `entityManager`가 주입되지 않아 대부분의 JPA 레포지토리 테스트가 실행되지 못하고 건너뛰어졌습니다.
    *   `@DataJpaTest` 설정 또는 테스트 환경 구성 문제로 파악됩니다.

2.  **API 테스트의 401 Unauthorized**:
    *   `SingleApiTest` 등에서 로그인 테스트 시 권한 오류가 발생했습니다. 이는 테스트용 계정 정보가 최신화되지 않았거나 H2 DB 초기화 상태 때문일 수 있습니다.

3.  **JSON Schema Test의 Skip**:
    *   대부분의 JsonSchema 테스트가 첫 번째 테스트 실패 후 나머지가 Skip 되었습니다. 이는 테스트 간 의존성 또는 공통 초기화 로직 실패의 영향입니다.

## 4. 후속 조치 권장 사항
*   레포지토리 테스트의 `this.entityManager` 초기화 문제 해결 (Spring context 설정 확인).
*   인증 테스트용 사용자 정보(Admin/Admin123)가 테스트 DB에 올바르게 적재되는지 확인.
*   실패한 통합 테스트(`OrganizationControllerIntegrationTest` 등)의 상세 로그 분석을 통한 로직 수정.

---

## 📚 관련 문서
- [API 개발 가이드](file:///Users/dicky/kmdata/git/testcase/testcasecraft/docs/API_GUIDE.md): API 설계 및 개발 표준
- [API 테스트 가이드 요약](file:///Users/dicky/kmdata/git/testcase/testcasecraft/docs/API_TESTING_GUIDE_SUMMARY.md): API 테스트 작성 패턴 및 실행 방법
- [테스트 아키텍처 가이드](file:///Users/dicky/kmdata/git/testcase/testcasecraft/docs/TEST_ARCHITECTURE_GUIDE.md): 레이어별(API, Service, Repository) 테스트 표준
- [API 종합 테스트 가이드](file:///Users/dicky/kmdata/git/testcase/testcasecraft/docs/API_COMPREHENSIVE_TEST_README.md): 전체 엔드포인트 커버리지 테스트 안내
- [API 테스트 결과 리포트](file:///Users/dicky/kmdata/git/testcase/testcasecraft/docs/APITestResult.md): 최근 테스트 실행 결과 요약
