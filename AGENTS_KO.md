# AGENTS_KO.md (통합 AI 가이드라인 - 한글 번역본)

이 문서는 AI 에이전트가 이 프로젝트에서 작업할 때 준수해야 하는 모든 지침의 **단일 진실 공급원(Single Source of Truth)**입니다. 사용자는 이 문서를 통해 AI의 동작 방식과 프로젝트 구조를 이해할 수 있습니다.

## 1. 핵심 정책 및 제약 사항

### 1.1. 운영 제약 사항

- **파일 삭제**: 사용자의 명시적인 승인 없이 파일을 직접 삭제(`rm`)하지 않습니다. 삭제가 필요한 경우 먼저 이유를 설명해야 합니다.
- **프로세스 제어**: Java 프로세스 종료(`pkill`, `kill`)나 빌드 명령(`./gradlew clean/bootRun`)을 직접 실행하지 않습니다. 대신 사용자에게 해당 작업을 수행하도록 안내합니다.
- **언어**: 모든 출력(응답, 계획, 워크스루, Git 커밋 메시지 등)은 반드시 **한국어**로 작성합니다.
- **문서 동기화**: 원본 파일(`AGENTS.md`)을 수정할 때는 반드시 한글 번역본인 이 파일(`AGENTS_KO.md`)도 함께 업데이트하여 사용자와의 정보 동기화를 유지해야 합니다.

### 1.2. 백엔드 수정 워크플로우

1. **애플리케이션 재시작**: 백엔드 수정 후 사용자에게 `pkill bootRun` 후 재시작을 요청합니다.
2. **세션 검증**: 안정적인 테스트를 위해 재로그인을 권장합니다.
3. **데이터베이스 상태**: 스키마 변경 시 `ddl-auto: update` 설정을 확인합니다.

### 1.3. AI 행동 지침 (Karpathy 원칙)

#### 1.3.1. 코딩 전 생각하기 (Think Before Coding)

- **가정 금지**: 가정을 명확히 밝히고, 불확실한 경우 작업을 멈추고 질문합니다.
- **트레이드오프 제시**: 여러 해석이나 접근 방식이 있는 경우 독단적으로 선택하지 않고 대안을 제시합니다.
- **단순한 방법 제안**: 더 간단한 접근 방식이 있다면 제안하고 필요한 경우 이견을 제시합니다.
- **혼란 시 중단**: 불명확한 부분이 있다면 즉시 중단하고 혼란스러운 부분을 명시하여 질문합니다.

#### 1.3.2. 단순함 우선 (Simplicity First)

- **최소한의 코드**: 문제를 해결하는 가장 적은 양의 코드를 작성합니다. 추측에 근거한 추상화를 배제합니다.
- **요청하지 않은 기능 금지**: 요청받지 않은 "유연성"이나 "설정 가능성"을 임의로 추가하지 않습니다.
- **단일 용도 추상화 금지**: 일회성 케이스를 위해 범용 컴포넌트나 함수를 만들지 않습니다.
- **필요 시 재작성**: 200줄의 코드가 50줄로 줄어들 수 있다면 단순함을 위해 재작성합니다.

#### 1.3.3. 정교한 수정 (Surgical Changes)

- **표적 수정**: 수정이 필요한 부분만 건드립니다. 주변 코드의 포맷팅이나 주석을 임의로 "개선"하지 않습니다.
- **기존 스타일 준수**: 본인의 선호와 다르더라도 현재 코드베이스의 스타일을 따릅니다.
- **본인이 만든 쓰레기 정리**: 본인의 수정으로 인해 사용되지 않게 된 import, 변수, 함수를 제거합니다. 기존의 죽은 코드는 요청받지 않았다면 건드리지 않습니다.
- **추적 가능성**: 모든 수정된 라인은 사용자의 요청과 직접적으로 연결되어야 합니다.

#### 1.3.4. 목표 중심 실행 (Goal-Driven Execution)

- **성공 기준 정의**: 작업을 검증 가능한 목표로 변환합니다 (예: "버그 수정" → "재현 테스트 작성 후 통과 확인").
- **단계별 검증**: 다단계 작업의 경우 "계획 → 단계 실행 → 검증" 주기를 따릅니다.
- **명확한 기준**: "작동하게 만들기"와 같은 모호한 기준 대신 명확하고 검증 가능한 지표를 사용합니다.

## 2. 아키텍처 및 디자인 패턴

상세한 시스템 아키텍처 및 데이터 모델 정보는 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)를 참고하세요.

### 2.1. 백엔드 계층형 아키텍처

- **Controller**: 요청 검증, DTO 매핑, 엔드포인트 정의. 비즈니스 로직 포함 금지.
- **Service**: 트랜잭션 관리, 비즈니스 로직, 외부 시스템(MinIO, RAG) 호출.
- **Repository**: 데이터베이스 액세스를 위한 Spring Data JPA.
- **Model**: JPA 엔티티. 가능한 경우 감사(Audit) 필드를 사용합니다.

### 2.2. 프론트엔드 패턴

- **상태 관리**: React Context API (`AppContext`, `AuthContext`, `ProjectContext`).
- **데이터 페칭**: `src/main/frontend/src/services/`에 위치한 Axios 서비스 사용.
- **컴포넌트 구조**: 컴포넌트를 집중화하고 복잡한 로직은 `hooks/`나 `utils/`로 추출합니다.

### 2.3. 시스템 구성 요소

- **Spring Boot (8080)**: 메인 API 제공 및 프론트엔드 정적 파일 서빙.
- **FastAPI RAG (8001)**: 문서 처리 및 벡터 검색 담당.
- **PostgreSQL (5434)**: 메인 관계형 데이터 저장소.
- **MinIO (9000)**: 첨부 파일 및 RAG 문서용 객체 저장소.

## 3. 프로젝트 개요 및 기술 스택

### 3.1. 핵심 스택

- **프론트엔드**: React 18, Material-UI, React Router, Recharts.
- **백엔드**: Spring Boot 3.4.12, Java 21, PostgreSQL.
- **인증**: JWT (Access/Refresh 토큰) + Spring Security 6.
- **빌드**: Gradle (Vite 빌드 통합).
- **테스트**: TestNG (단위), Playwright (E2E), Allure (리포팅).

### 3.2. 주요 기능

- **테스트케이스 관리**: 계층적 트리 구조 지원.
- **테스트 계획/실행**: 케이스 모음 생성 및 결과 기록.
- **프로젝트 관리**: 멀티 프로젝트 지원.
- **대시보드**: 진행률 차트 및 시스템 지표 제공.

## 4. 디렉터리 구조 및 주요 위치

### 4.1. 프론트엔드

- `src/main/frontend/src/App.jsx`: 메인 라우팅.
- `src/main/frontend/src/context/`: 전역 상태 관리.
- `src/main/frontend/src/components/`: UI 컴포넌트.
- `src/main/frontend/src/services/`: API 클라이언트 서비스.
- `src/main/frontend/src/utils/`: 트리/진척도 로직.

### 4.2. 백엔드

- `src/main/java/com/testcase/testcasemanagement/`: 메인 패키지.
- `controller/`, `service/`, `repository/`, `model/`: 표준 계층 패키지.
- `src/main/resources/application.yml`: 설정 파일.

### 4.3. E2E 테스트 (Playwright)

- `src/test/e2e/e2e-testcase-app.js`: 메인 E2E 스크립트.
- `src/test/e2e/playwright.config.js`: 설정 파일.
- `src/test/e2e/authentication/`, `src/test/e2e/dashboard/`: 모듈 테스트.

## 5. 개발 및 테스트 명령어

### 5.1. 개발

- **프론트엔드**: `cd src/main/frontend && npm install && npm start`
- **백엔드/통합**: `./gradlew bootRun` (8080 포트)

### 5.2. 테스트

- **백엔드 단위 테스트**: `./gradlew test` (TestNG 사용)
- **E2E 테스트 실행**: `npm run test:ict-138 --prefix src/test/e2e`
- **Allure 리포트**: `./gradlew allureReport`

## 6. 다국어(i18n) 시스템

### 6.1. 주요 위치

- **정의**: `src/main/java/com/testcase/testcasemanagement/config/i18n/keys/`
- **초기화**: `src/main/java/com/testcase/testcasemanagement/config/i18n/TranslationKeyDataInitializer.java`

### 6.2. 추가 프로세스 (4단계)

1. **키 추가**: `keys/` 하위의 적절한 `KeysInitializer` 클래스에 키 추가.
2. **한글 번역**: `translations/` 하위의 `Korean...Translations` 클래스에 번역 추가.
3. **영어 번역**: `translations/` 하위의 `English...Translations` 클래스에 번역 추가.
4. **등록 (필수)**: 새로운 `KeysInitializer`를 만든 경우 `TranslationKeyDataInitializer.java`에 등록.

## 7. 인프라 및 구동

### 7.1. 사전 요구사항

- Java 21, Docker, Docker Compose 필요.
- **인프라 구동**: `cd docker-compose-build && docker-compose up -d`
- **초기 계정**: admin / admin123
- **접속 URL**: http://localhost:8080

## 8. 코딩 가이드라인 (Coding Guidelines)

다음 각 기술 영역별 세부 가이드라인을 준수하여 개발을 진행하세요:

- **일반 개발 원칙**: [DEVELOPMENT_GUIDE.md](docs/code-guide-line/DEVELOPMENT_GUIDE.md)
- **백엔드 (Java)**: [JAVA_CODING_GUIDELINES.md](docs/code-guide-line/JAVA_CODING_GUIDELINES.md)
- **백엔드 (FastAPI)**: [FASTAPI_CODING_GUIDELINES.md](docs/code-guide-line/FASTAPI_CODING_GUIDELINES.md)
- **프론트엔드 (React)**: [REACT_CODING_GUIDELINES.md](docs/code-guide-line/REACT_CODING_GUIDELINES.md)
- **API 설계**: [API_GUIDE.md](docs/code-guide-line/API_GUIDE.md)
- **테스트**:
  - [TEST_ARCHITECTURE_GUIDE.md](docs/code-guide-line/TEST_ARCHITECTURE_GUIDE.md)
  - [API_TESTING_GUIDE_SUMMARY.md](docs/code-guide-line/API_TESTING_GUIDE_SUMMARY.md)
  - [E2E_TESTING_GUIDE.md](docs/code-guide-line/E2E_TESTING_GUIDE.md)
- **보안 및 DevOps**:
  - [SECURITY_GUIDE.md](docs/code-guide-line/SECURITY_GUIDE.md)
  - [GITHUB_ACTION_GUIDE.md](docs/code-guide-line/GITHUB_ACTION_GUIDE.md)
