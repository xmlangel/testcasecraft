# 📚 테스트 케이스 관리 시스템 문서

이 디렉토리는 테스트 케이스 관리 시스템의 상세 문서들을 체계적으로 관리합니다.

## 🎯 문서 구조 개선 완료 (2025-08-04)

**⚠️ 중요**: 메인 CLAUDE.md 파일이 **1,923줄에서 429줄로 대폭 축소**되었습니다!

### 📊 구조 개선 결과
- **기존**: 단일 거대 파일 (1,923줄) - 관리 및 찾기 어려움
- **개선**: 핵심 정보만 담은 간결한 가이드 (429줄) + 상세 문서 분리

### 🏠 메인 가이드
- **[../CLAUDE.md](../CLAUDE.md)** - ⭐ **Claude Code용 핵심 가이드** (429줄)
  - 프로젝트 개요 및 아키텍처
  - 필수 개발 명령어
  - MCP 서버 통합 규칙
  - 보안 및 JIRA 필수 준수사항
  - 문서 구조 네비게이션

## 📁 상세 문서 구조

### 🏗️ 기본 정보
- **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** - ✅ 프로젝트 전체 개요 및 아키텍처 (완료)
- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - ✅ 개발 환경 설정 및 워크플로우 (완료)
- **[API_GUIDE.md](./API_GUIDE.md)** - ✅ API 개발 가이드라인 및 테스트 (완료)

### 🧪 테스트 & 품질
- **[E2E_TESTING_GUIDE.md](./E2E_TESTING_GUIDE.md)** - ✅ Playwright E2E 테스트 가이드 (완료)
- **[E2E_EPIC_STRUCTURE.md](./E2E_EPIC_STRUCTURE.md)** - ✅ E2E 테스트 Epic 구조 (완료)
- **[TESTING_WORKFLOWS.md](./TESTING_WORKFLOWS.md)** - 테스트 워크플로우 (예정)

### 🔒 보안 & 관리
- **[SECURITY_GUIDE.md](./SECURITY_GUIDE.md)** - ✅ 보안 및 접근 제어 가이드 (완료)
- **[ORGANIZATION_SYSTEM.md](./ORGANIZATION_SYSTEM.md)** - 조직-프로젝트 관리 시스템 (예정)

### 🔧 워크플로우 & 통합
- **[BACKEND_WORKFLOW.md](./BACKEND_WORKFLOW.md)** - 백엔드 개발 워크플로우 (예정)
- **[BUG_FIXING_GUIDE.md](./BUG_FIXING_GUIDE.md)** - 버그 수정 및 문제 해결 프로세스 (예정)
- **[JIRA_INTEGRATION.md](./JIRA_INTEGRATION.md)** - ✅ JIRA 이슈 관리 및 이력 추적 (완료)

## 🚀 빠른 시작

### Claude Code 사용자를 위한 가이드
1. **⭐ 가장 중요**: **[../CLAUDE.md](../CLAUDE.md)** 먼저 읽기 - 모든 필수 정보 포함
2. **E2E 테스트 작업**: [E2E_EPIC_STRUCTURE.md](./E2E_EPIC_STRUCTURE.md) 참조

### 개발자를 위한 가이드
1. **새로운 개발자**: [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) → [DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md) 순서로 읽기
2. **API 개발**: [API_GUIDE.md](./API_GUIDE.md) → [SECURITY_GUIDE.md](./SECURITY_GUIDE.md) 참조
3. **E2E 테스트**: [E2E_TESTING_GUIDE.md](./E2E_TESTING_GUIDE.md) → [E2E_EPIC_STRUCTURE.md](./E2E_EPIC_STRUCTURE.md) 참조
4. **JIRA 통합**: [JIRA_INTEGRATION.md](./JIRA_INTEGRATION.md) 참조

### 현재 사용 가능한 문서 (6개 완료)
- ✅ **[../CLAUDE.md](../CLAUDE.md)** - Claude Code 핵심 가이드 (권장)
- ✅ **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** - 프로젝트 전체 아키텍처
- ✅ **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - 개발 환경 및 워크플로우
- ✅ **[API_GUIDE.md](./API_GUIDE.md)** - API 개발 가이드라인
- ✅ **[SECURITY_GUIDE.md](./SECURITY_GUIDE.md)** - 보안 및 접근 제어
- ✅ **[E2E_TESTING_GUIDE.md](./E2E_TESTING_GUIDE.md)** - Playwright E2E 테스트
- ✅ **[E2E_EPIC_STRUCTURE.md](./E2E_EPIC_STRUCTURE.md)** - E2E 테스트 Epic 구조
- ✅ **[JIRA_INTEGRATION.md](./JIRA_INTEGRATION.md)** - JIRA 이슈 관리

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