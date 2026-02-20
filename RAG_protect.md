# RAG 기능 비활성화/활성화 글로벌 토글 구현 및 보호 전략 (RAG_protect)

이 문서는 서비스 불안정 시 RAG(Retrieval-Augmented Generation) 기능을 전체적으로 비활성화할 수 있도록 글로벌 시스템 설정 엔티티를 추가하고, 백엔드/프론트엔드 레벨에서 관련 기능들의 호출 및 UI 접근을 차단하는 실행 계획과 대상 영역을 식별한 자료입니다.

## 1. RAG/LLM 연동 기능 식별 영역 전체 리스트

### 프론트엔드 (UI 영역)
*   **프로젝트 RAG 문서 및 챗 탭** (`RAGDocumentManager`, `RAGChatInterface` 등): 프로젝트 내 RAG 탭에 있는 메인 기능(문서 업로드, 분석, 챗).
*   **테스트 케이스 작성/편집 영역** (`TestCaseForm`, `SimilarTestCases`): 테스트 케이스 입력 시 '유사 테스트 케이스 추천(검색)' 및 'AI 생성' 관련 버튼/기능.
*   **시스템 관리자 페이지** (`CommonDocumentManagement`, `LlmConfigList`, `GlobalDocumentManager` 등): LLM 설정, 템플릿 설정, 전역 문서 관리(Global Document) 기능 영역. (단, 비활성화 토글 관리를 위해 이 UI 화면 자체는 관리자에게 접근 가능해야 함)

### 백엔드 (API 엔드포인트)
*   **일반 RAG 기능** (`RagController`): 문서 업로드, 조회, 상태 처리, 유사도 검색(Similar Search) 처리 API.
*   **RAG 챗 기능** (`RagChatController`, `RagChatConversationController`): 챗 메시지 전송 및 대화 이력 조회 API.
*   **관리자 RAG 기능** (`LlmConfigController`, `LlmTemplateController`, `RagAdminController`): 설정 및 템플릿, 공통 문서 관리 API.

### 백엔드 (서비스/비즈니스 로직) - 실제 차단 로직이 위치할 곳
*   `RagServiceImpl`: 실제 FastAPI RAG 서비스 시스템들과 통신하여 문서를 분석 및 검색하는 메인 진입점.
*   `RagChatServiceImpl`, `RagChatConversationService`: 챗 세션과 질의응답을 처리하는 핵심 서비스 로직.
*   `RagGlobalDocumentRequestService`: 모든 프로젝트 통합 문서(글로벌 문서)를 처리하는 로직.
*   `TestCaseService` 내부 로직: RAG 기능을 호출하여 AI 관련 기능(유사 케이스 추천 등)을 연계 처리하는 부분.


## 2. 수행 계획 (Implementation Plan)

### 단계 1: 백엔드 - 공통 전역 설정(SystemSetting) DB 및 API 구성
- **[NEW] `SystemSetting` 엔티티**: 기존 설정(LlmConfig 설정 정보)과 분리하여, 서비스 재시작 없이 동적으로 Boolean(및 다양한) 설정값을 관리할 전역 Key-Value 테이블 스키마 구성 (`settingKey`, `settingValue`).
- **[NEW] `SystemSettingRepository`**: 기본 JPA Repository 구성 (`findBySettingKey`).
- **[NEW] `SystemSettingService`**: `getBooleanSetting`, `updateSetting` 등 설정값을 캐시 또는 바로 DB에서 조회/업데이트 하는 비즈니스 구현 로직 작성 (`RAG_ENABLED` 키 관할).
- **[NEW] `SystemSettingController`**: 관리자 레벨의 설정 토글(Update)용 관리자 전용 API(`/api/system-settings`) 구성.
- **[UPDATE] `RagController`**: 프론트엔드가 페이지 랜더링 시 곧바로 상태를 파악할 수 있도록 `/api/rag/status` GET 엔드포인트 제공.

### 단계 2: 백엔드 - 핵심 RAG 서비스 호출 원천 차단 적용
- **[MODIFY] `RagServiceImpl`, `RagChatServiceImpl`, `RagGlobalDocumentRequestService`**:
  각 API 호출의 최상단에서 우선 `SystemSettingService.getBooleanSetting("RAG_ENABLED", true)`를 조회합니다. 
  만약 `false`인 경우 통신을 시도하지 않고, 즉시 `IllegalStateException("현재 RAG(AI) 기능이 서비스 안정화를 위해 일시 중지되었습니다.")` 형태의 예외를 발생시키거나 명시적인 에러 형식을 반환하여 외부로의 LLM 호출 자체를 막습니다.

### 단계 3: 프론트엔드 - Context 및 전역 상태화 UI 연동
- **[MODIFY] `src/main/frontend/src/context/RAGContext.jsx`**:
  앱 로딩 및 컨텍스트 초기화 시 `/api/rag/status` API를 호출하여 `isRagEnabled` 상태 값을 컨텍스트 상태로 가져와 유지합니다. 주기점검이나 SSE를 통한 갱신도 고려될 수 있으나 일차적으로는 새로고침 및 첫 진입 시 로드되게 합니다.
- **[MODIFY] `src/main/frontend/src/components/admin/CommonDocumentManagement.jsx`**:
  시스템 설정(LLM 설정) 메뉴 탭 영역 최상단 부근에 **"RAG 서비스 전역 활성화 (긴급 차단용)"** 토글 스위치 UI를 추가합니다. 변경 시 SystemSetting API에 상태 변경을 요청하도록 연동합니다.

### 단계 4: 프론트엔드 - 비활성화 시 UI 접근 및 기능 숨김(Alert 처리)
- **[MODIFY] `RAGDocumentManager.jsx` (RAG 문서/채팅 메인 탭)**:
  `isRagEnabled === false`인 경우 내부의 원래 화면 구성(파일업로드, 문서목록, 채팅창) 랜더링을 막고, 대신 "현재 시스템 이슈로 인해 RAG (AI) 기능이 임시 중단되었습니다."라는 큰 Alert 컴포넌트로 대체 렌더링하도록 합니다.
- **[MODIFY] `TestCaseForm.jsx`, `SimilarTestCases.jsx` 등 (AI 생성, 유사 검색 버튼 부위)**:
  컨텍스트에서 설정이 꺼져있다면 AI 생성 버튼과 유사 테스트케이스 조회 영역을 보이지 않게(숨김 처리) 하거나, `disabled` 상태로 만들고 마우스 오버 시 "기능 일시 중단됨" 툴팁을 표시합니다.

### 단계 5: 테스트 및 검증
1. 로컬 환경에서 백엔드 및 프론트 구동 진행.
2. 관리자 계정으로 로그인 후 `사용자 프로필 메뉴 > 관리 메뉴 > LLM 설정` 화면 확인.
3. 신규 토글 스위치 "RAG 서비스 활성화" 생성 및 `Off` 로 변경 처리.
4. 프로젝트 화면으로 넘어가 RAG 탭이 정상적으로 차단 안내 메시지로 전환되었는지 확인.
5. 테스트케이스 화면의 AI 추천 버튼 영역이 숨겨지거나 막혀있는지 확인.
6. 백엔드 직접 API (스웨거 혹은 cURL) 호출 시 `HTTP 400/500` 및 "일시 중단" 알림 예외를 리턴하고, 실제 외부 LLM 통신이 이뤄지지 않았는지 백엔드 터미널 등에서 검증.
7. 다시 관리자 설정에서 `On`으로 복구 후 기존 RAG 로직 정상 복원 여부 확인.
