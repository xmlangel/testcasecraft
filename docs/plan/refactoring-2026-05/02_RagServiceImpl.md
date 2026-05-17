# 02. RagServiceImpl 리뷰 & 리팩토링 계획

- **파일**: `src/main/java/com/testcase/testcasemanagement/service/RagServiceImpl.java`
- **라인 수**: 1,846
- **공개 메서드 수**: 약 30개 (7개 책임 영역)

## 1. 책임 맵

| 영역 | 메서드 (라인) |
|---|---|
| 문서 관리 | uploadDocument(64), getDocument(305), listDocuments(345), deleteDocument(398), downloadDocument(433), getDocumentChunks(471) |
| 벡터화 | vectorizeTestCase(638), deleteTestCaseFromRAG(794), isTestCaseVectorized(841) |
| 검색 | searchSimilar(219), searchAdvanced(258) |
| 임베딩 | generateEmbeddings(165), waitForEmbeddingCompletion(580) |
| 분석 | analyzeDocument(117), waitForAnalysisCompletion(523) |
| LLM 분석 | estimateAnalysisCost(1119), analyzeDocumentWithLlm(1212), getLlmAnalysisStatus(1310), getLlmAnalysisResults(1397), pauseAnalysis(1441), resumeAnalysis(1479), cancelAnalysis(1554), listLlmAnalysisJobs(1595) |
| 요약 | createAnalysisSummary(1655), getAnalysisSummary(1692), listAnalysisSummaries(1728), updateAnalysisSummary(1779), deleteAnalysisSummary(1815) |
| 대화 | indexConversationMessage(886), deleteConversationMessage(919) |
| 글로벌 문서 | uploadGlobalDocument(951), listGlobalDocuments(1013), moveDocumentToGlobal(1071) |
| 설정 | checkRagEnabled(1006) |

**판정**: 7개 책임 영역 혼재. SRP 위반.

## 2. 핵심 코드 스멜

| 위치 | 스멜 | 심각도 |
|---|---|---|
| `RagServiceImpl.java:91-102, 134-145, 181-192, 232-243, 274-285` (15+ 반복) | WebClient 에러 처리 패턴 반복 | 높음 |
| `RagServiceImpl.java:638-791` | `vectorizeTestCase()` **154줄** | 높음 |
| `RagServiceImpl.java:523-574` | `waitForAnalysisCompletion()` 52줄, 폴링+예외 중첩 | 중간 |
| `RagServiceImpl.java:131,728,546,606,763` | 매직 스트링: `"pymupdf4llm"`, `"Document not found"` | 중간 |
| `RagServiceImpl.java:564,624` | `Thread.sleep()` 블로킹 폴링 (반응형 아님) | 중간 |
| `RagServiceImpl.java:850-857` | `synchronized(this)` — 객체 전체 락 | 중간 |
| `RagServiceImpl.java:546,606,763` | 문자열 메시지 기반 에러 판단 (`e.getMessage().contains(...)`) — 취약 | 높음 |

## 3. 외부 호출 패턴

- **HTTP 클라이언트**: WebClient 사용하나 `.block()` 호출로 동기화
- **타임아웃**: **거의 모든 호출에 미설정** (라인 106, 194, 245, 287, 422, 457, 505 등) — 1106에서만 `Duration.ofSeconds(30)` 명시
- **재시도/서킷브레이커**: **없음**
- **에러 매핑**: 4xx/5xx 일괄 "RAG API 클라이언트/서버 에러" — 응답 본문 무시
- **폴링**: 10분 타임아웃, 2초 간격 하드코딩

## 4. 트랜잭션 경계

- **`@Transactional` 어노테이션 전무** — Service 계층이지만 트랜잭션 관리 없음
- `vectorizeTestCase` (`@Async`): 비동기 메서드, 트랜잭션 전파 불명확
- `resumeAnalysis`: HTTP 호출 중 DB 연결 점유 가능성

## 5. 예외 처리

| 위치 | 문제 |
|---|---|
| 110, 158, 212, 251, 294, 317, 391, 426, 464, 514, 788 | Generic `catch (Exception)` 만연 |
| 546, 606, 763 | `e.getMessage().contains("Document not found")` — 메시지 변경 시 깨짐 |
| 662-665, 836-837 | RAG 장애 시 무시하고 진행 (의도된 graceful 처리, 명시화 필요) |
| 112, 160, 214 | `throw new RuntimeException("...", e)` — 원인 체인은 유지(양호) |

## 6. 의존성

**생성자 주입 (5개)**:
- WebClient `ragWebClient`
- String `ragApiUrl`
- LlmConfigRepository
- EncryptionUtil
- SystemSettingService

→ 적절한 수준. 순환 의존성 없음.

## 7. 테스트 용이성 블로커

| 블로커 | 위치 |
|---|---|
| `System.currentTimeMillis()` | 525, 582, 847 — Clock 추상화 필요 |
| `Thread.sleep()` | 564, 624 |
| MultipartFile 익명 구현 | 673-713 (vectorizeTestCase) |
| `synchronized(this)` | 850, 878 |
| `WebClient.block()` | 전역 |
| 캐시 검증 위해 실제 API 호출 | 807, 853 |

## 8. 리팩토링 후보 (중간 강도, 7개)

| # | 신규 클래스/변경 | 대상 라인 | 책임 |
|---|---|---|---|
| 1 | `RagHttpClientAdapter` 추출 | 71-104 (+20+ 반복) | WebClient 에러 처리·타임아웃 통일 |
| 2 | `DocumentStatusPoller` 분리 | 523-574, 580-634 | 폴링 로직 별도 클래스 |
| 3 | `TestCaseVectorizer` 추출 | 638-791 | 업로드→분석→임베딩→캐시 무효화 오케스트레이션 |
| 4 | `LlmConfigEnricher` 추출 | 1178-1209, 1269-1307 | 복제된 LlmConfig 보강 로직 통합 |
| 5 | Spring `@Cacheable` 도입 | 44-47, 850-857, 877-883 | 수동 캐시 동기화 제거 |
| 6 | `RagErrorHandler` 전략 | 92-102 (+15 반복) | HTTP 상태별 처리 통일 |
| 7 | `@RagFeatureGate` AOP | 644, 795, 1007 | RAG 활성화 확인 데코레이터 |

## 9. 테스트 타겟

### 단위 테스트 (TestNG + Mockito + MockWebServer) — 10개
1. `uploadDocumentSuccess` — MultipartFile 업로드, 200 응답
2. `analyzeDocumentWithTimeout` — `waitForAnalysisCompletion` 타임아웃
3. `isTestCaseVectorizedWithCache` — 캐시 TTL 10초 내 API 미호출
4. `enrichLlmAnalysisRequest` — LlmConfig 없을 때 원본, 있을 때 복호화 API 키 포함
5. `deleteTestCaseFromRAGWithDuplicates` — 동일 파일명 여러 문서 모두 삭제
6. `resumeAnalysisWithMissingConfig` — llmConfigId 없을 때 graceful 처리
7. `waitForEmbeddingCompletionWithDocumentDelete` — 폴링 중 404 → false 반환
8. `searchAdvancedErrorMapping` — 5xx → "RAG API 서버 에러"
9. `moveDocumentToGlobalWithDuration` — `block(Duration.ofSeconds(30))` 확인
10. `invalidateDocumentListCache` — 동기화된 null 설정 확인

### 통합 테스트 (`@SpringBootTest` + **WireMock**) — 3개
1. **벡터화 E2E**: 업로드 → 분석 폴링(완료) → 임베딩 폴링(완료) → 캐시 무효화
2. **LLM 분석 재개**: 시작 → 일시정지 → 재개 (LlmConfig 복호화 검증)
3. **RAG 비활성화**: `RAG_ENABLED=false` 시 `checkRagEnabled()` → `IllegalStateException`

## 10. 우선순위 액션

| 우선순위 | 항목 |
|---|---|
| **P0** | WebClient 타임아웃 일괄 설정 (무한 대기 위험) |
| **P0** | `Clock` 추상화로 `System.currentTimeMillis()` 제거 |
| **P0** | 메시지 기반 에러 판단 제거 (상태 코드/Enum 기반) |
| **P1** | `RagHttpClientAdapter` 추출 (20+ 반복 제거) |
| **P1** | `DocumentStatusPoller` 분리 |
| **P2** | `@Transactional` 경계 명확화 |
| **P2** | `TestCaseVectorizer` 추출 (vectorizeTestCase 154줄 단순화) |
| **P3** | Spring `@Cacheable`로 수동 동기화 제거 |
