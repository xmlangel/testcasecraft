# 테스트 케이스 관리 시스템 문서

이 디렉토리는 테스트 케이스 관리 시스템의 모든 문서를 체계적으로 관리합니다.

## 📁 문서 구조

### 🏗️ 프로젝트 기본 문서
- [`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md) - 프로젝트 전체 개요 및 아키텍처
- [`DEVELOPMENT_GUIDE.md`](./DEVELOPMENT_GUIDE.md) - 개발 환경 설정 및 명령어
- [`API_GUIDE.md`](./API_GUIDE.md) - API 개발 가이드라인 및 테스트

### 🧪 테스트 관련 문서
- [`E2E_TESTING.md`](./E2E_TESTING.md) - Playwright E2E 테스트 가이드
- [`E2E_EPIC_STRUCTURE.md`](./E2E_EPIC_STRUCTURE.md) - E2E 테스트 Epic 구조
- [`TESTING_WORKFLOWS.md`](./TESTING_WORKFLOWS.md) - 테스트 워크플로우

### 🏢 조직-프로젝트 관리
- [`ORGANIZATION_SYSTEM.md`](./ORGANIZATION_SYSTEM.md) - 조직-프로젝트 관리 시스템
- [`SECURITY_GUIDE.md`](./SECURITY_GUIDE.md) - 보안 및 접근 제어 가이드

### 🔧 개발 워크플로우
- [`BACKEND_WORKFLOW.md`](./BACKEND_WORKFLOW.md) - 백엔드 개발 워크플로우
- [`BUG_FIXING.md`](./BUG_FIXING.md) - 버그 수정 및 문제 해결 프로세스

### 📋 프로젝트 관리
- [`JIRA_INTEGRATION.md`](./JIRA_INTEGRATION.md) - JIRA 이슈 관리 및 이력 추적
- [`CONTEXT7_USAGE.md`](./CONTEXT7_USAGE.md) - Context7 사용 규칙

## 🚀 빠른 시작

1. **새로운 개발자**: [`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md) → [`DEVELOPMENT_GUIDE.md`](./DEVELOPMENT_GUIDE.md) 순서로 읽기
2. **API 개발**: [`API_GUIDE.md`](./API_GUIDE.md) → [`SECURITY_GUIDE.md`](./SECURITY_GUIDE.md) 참조
3. **E2E 테스트**: [`E2E_TESTING.md`](./E2E_TESTING.md) → [`E2E_EPIC_STRUCTURE.md`](./E2E_EPIC_STRUCTURE.md) 참조
4. **조직 관리**: [`ORGANIZATION_SYSTEM.md`](./ORGANIZATION_SYSTEM.md) → [`SECURITY_GUIDE.md`](./SECURITY_GUIDE.md) 참조

## 📝 문서 업데이트 가이드

각 문서는 독립적으로 관리되며, 다음 규칙을 따릅니다:

1. **문서 제목**: `# 제목 (최종 업데이트: YYYY-MM-DD)` 형식 사용
2. **섹션 구조**: 일관된 헤더 레벨 사용 (##, ###, ####)
3. **상호 참조**: 관련 문서는 상대 경로로 링크
4. **예제 코드**: 언어별 코드 블록 사용
5. **업데이트 이력**: 주요 변경사항은 문서 하단에 기록

## 🔗 외부 링크

- [프로젝트 JIRA](https://kwangmyung.atlassian.net/browse/ICT)
- [GitHub 저장소](https://github.com/[repository])
- [개발 서버](http://localhost:3000)
- [API 문서](http://localhost:8080/swagger-ui.html)