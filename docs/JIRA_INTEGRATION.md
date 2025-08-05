# JIRA Integration Guide (최종 업데이트: 2025-08-04)

JIRA 이슈 관리 및 이력 추적 시스템 통합 가이드입니다.

## 📋 목차

1. [JIRA 통합 개요](#-jira-통합-개요)
2. [MCP 서버 설정](#-mcp-서버-설정)
3. [작업 시작 프로세스](#-작업-시작-프로세스)
4. [이슈 관리 워크플로우](#-이슈-관리-워크플로우)
5. [자동화 시스템](#-자동화-시스템)
6. [실용적인 사용법](#-실용적인-사용법)

## 🎯 JIRA 통합 개요

### 핵심 목적
이 프로젝트는 **MCP (Model Context Protocol)를 통한 JIRA 자동 연동**을 지원하여 모든 개발 작업을 체계적으로 추적하고 관리합니다.

### 주요 기능
- ✅ **자동 이슈 생성**: 개발 작업 시작 시 JIRA 이슈 자동 생성
- ✅ **실시간 상태 관리**: 작업 진행에 따른 이슈 상태 자동 업데이트
- ✅ **진행 상황 추적**: 상세한 작업 로그 및 완료 리포트 자동 생성
- ✅ **통합 워크플로우**: Claude Code와 JIRA 간 완전 통합

### 연결 정보

**프로젝트 설정:**
```yaml
JIRA URL: https://kwangmyung.atlassian.net
Project Key: ICT (테스트관리툴)
Browse URL: https://kwangmyung.atlassian.net/browse/ICT-*
```

**이슈 타입 ID:**
```yaml
Task: 10003 (기본값)
Story: 10042
Bug: 10040
Epic: 10005
```

## 🔧 MCP 서버 설정

### 서버 구조
```
d_mcpsvr_jira/                      # JIRA MCP 서버 디렉토리
├── .env                           # JIRA 연결 정보 (보안)
├── requirements.txt               # Python 의존성
├── jira_caller.py                # JIRA API 호출 모듈
├── jira_workflow.py              # 워크플로우 관리
├── quick_start.py                # 빠른 시작 스크립트
├── server.py                     # MCP 서버 메인
└── create_issues.py              # 일괄 이슈 생성
```

### 환경 설정

#### .env 파일 구성
```bash
# d_mcpsvr_jira/.env
JIRA_SERVER=https://kwangmyung.atlassian.net
JIRA_USERNAME=your-email@domain.com
JIRA_API_TOKEN=your-api-token
JIRA_PROJECT_KEY=ICT
```

#### Python 의존성 설치
```bash
cd d_mcpsvr_jira
pip3 install -r requirements.txt
```

### ⚠️ 중요: 프로젝트 루트 시작 규칙

**모든 JIRA MCP 명령어는 반드시 프로젝트 루트에서 시작**하여 일관성을 유지합니다.

```bash
# 표준 실행 패턴
PROJECT_ROOT="/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage"
cd "$PROJECT_ROOT"

# JIRA MCP 명령어 실행
cd d_mcpsvr_jira && python3 -c "from quick_start import quick_start; quick_start('ICT-XX')" && cd ..
```

## 🚀 작업 시작 프로세스

### 1. 유사 작업 검색 (필수)

새로운 작업 시작 전 중복 방지를 위한 검색을 수행합니다.

```bash
# 프로젝트 루트에서 시작
PROJECT_ROOT="/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage"
cd "$PROJECT_ROOT"

# JIRA MCP로 이동하여 검색
cd d_mcpsvr_jira

# 키워드 기반 유사 작업 검색
python3 -c "
from jira_caller import get_jira_client
jira = get_jira_client()

# 작업 키워드 설정 (예: 'admin 사용자', '조직 관리', 'JWT 토큰')
search_keywords = 'admin user organization JWT'
issues = jira.search_issues(f'project = ICT AND (summary ~ \"{search_keywords}\" OR description ~ \"{search_keywords}\") ORDER BY created DESC', maxResults=10)

print(f'🔍 \"{search_keywords}\" 관련 유사 작업 {len(issues)}개 발견:')
for issue in issues:
    print(f'📋 {issue.key}: {issue.fields.summary}')
    print(f'   상태: {issue.fields.status.name}')
    print(f'   URL: https://kwangmyung.atlassian.net/browse/{issue.key}')
"

# 프로젝트 루트로 복귀
cd ..
```

### 2. 새로운 이슈 생성

```bash
# 프로젝트 루트에서 시작
PROJECT_ROOT="/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage"
cd "$PROJECT_ROOT"

# JIRA MCP 서버 환경에서 이슈 생성
cd d_mcpsvr_jira

python3 -c "
from jira_caller import get_jira_client
jira = get_jira_client()

issue_dict = {
    'project': {'key': 'ICT'},
    'summary': '[작업_유형] 작업_제목',
    'description': '''**작업 내용**:
• 구체적인 작업 설명
• 기술적 요구사항
• 수용 기준

**관련 파일**:
• src/main/java/...
• src/main/frontend/...

**우선순위**: High/Medium/Low
**예상 스토리 포인트**: 숫자''',
    'issuetype': {'id': '10003'}  # Task
}

issue = jira.create_issue(fields=issue_dict)
print(f'이슈 생성 완료: {issue.key} - {issue.fields.summary}')
print(f'URL: {issue.permalink()}')
"

# 프로젝트 루트로 복귀
cd ..
```

### 3. 🌟 자동 작업 시작 (권장)

기존 이슈로 작업을 시작할 때 상태를 자동으로 "진행 중"으로 변경하고 작업 시작 코멘트를 추가합니다.

```bash
# 표준화된 자동 시작 방법
PROJECT_ROOT="/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage"
cd "$PROJECT_ROOT"

# 가장 간단한 자동 시작 (권장)
cd d_mcpsvr_jira && python3 -c "from quick_start import quick_start; quick_start('ICT-34')" && cd ..
```

**자동으로 수행되는 작업:**
1. ✅ 이슈 상태 확인 ("해야 할 일" → "진행 중")
2. ✅ 상태 자동 변경
3. ✅ 작업 시작 코멘트 자동 추가
4. ✅ 시작 시간 및 담당자 정보 기록

## 🔄 이슈 관리 워크플로우

### 작업 진행 중 업데이트

```bash
# 프로젝트 루트에서 시작
PROJECT_ROOT="/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage"
cd "$PROJECT_ROOT"

cd d_mcpsvr_jira

python3 -c "
from jira_workflow import add_progress_comment
add_progress_comment(
    issue_key='ICT-XX',
    completed_tasks=[
        '요구사항 분석 완료',
        '설계 문서 작성 완료'
    ],
    current_tasks=[
        '코드 구현 진행 중',
        '단위 테스트 작성 중'
    ],
    findings=[
        '기존 코드와의 호환성 이슈 발견',
        '성능 최적화 필요 구간 확인'
    ],
    next_steps=[
        '호환성 이슈 해결',
        '성능 최적화 적용',
        '통합 테스트 실행'
    ]
)
"

cd ..
```

### 작업 완료 처리

**⚠️ 중요 규칙**: 사용자 테스트 확인 후에만 완료 처리

```bash
# 프로젝트 루트에서 시작
PROJECT_ROOT="/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage"
cd "$PROJECT_ROOT"

cd d_mcpsvr_jira

# 사용자 확인 후에만 실행
python3 -c "
from jira_workflow import add_completion_comment
add_completion_comment(
    issue_key='ICT-XX',
    completed_work=[
        '새로운 기능 구현 완료',
        '단위 테스트 작성 완료',
        '통합 테스트 작성 완료',
        '코드 리뷰 완료'
    ],
    modified_files=[
        'src/main/java/.../Controller.java',
        'src/main/java/.../Service.java',
        'src/test/java/.../ServiceTest.java'
    ],
    test_results='모든 테스트 통과 (단위 테스트 12개, 통합 테스트 5개)',
    validation_items=[
        'API 응답 스키마 검증 완료',
        '권한 체크 정상 동작 확인',
        '성능 기준 충족 확인'
    ]
)
"

cd ..
```

## 🤖 자동화 시스템

### 상세 요약 시스템

복잡한 작업 완료 시 기술적 상세 정보를 자동으로 생성합니다.

```python
# 자동 요약 생성
from jira_workflow import create_comprehensive_work_summary
create_comprehensive_work_summary("ICT-XX", "development")

# 맞춤형 상세 요약
from jira_workflow import add_detailed_summary_comment
summary_data = {
    'overview': '작업 개요',
    'start_time': '2025-08-04 09:00:00',
    'end_time': '2025-08-04 17:30:00',
    'actual_hours': 8.5,
    'tech_stack': ['Java 21', 'Spring Boot', 'H2'],
    'code_stats': {'files_modified': 8, 'lines_added': 156},
    'performance_metrics': {'response_time': 45, 'memory_usage': 128},
    'security_validation': {'vulnerabilities': 0, 'compliance_score': 95},
    'quality_metrics': {'code_coverage': 87, 'complexity_score': 0.8}
}
add_detailed_summary_comment("ICT-XX", summary_data)
```

### 일괄 이슈 생성

```bash
# 프로젝트 루트에서 시작
PROJECT_ROOT="/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage"
cd "$PROJECT_ROOT"

cd d_mcpsvr_jira
python3 create_issues.py
cd ..
```

## 💡 실용적인 사용법

### 빠른 시작 패턴

```bash
# 모든 작업에 적용 가능한 표준 패턴
PROJECT_ROOT="/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage"
cd "$PROJECT_ROOT"

# 1. 이슈 시작
cd d_mcpsvr_jira && python3 -c "from quick_start import quick_start; quick_start('ICT-XX')" && cd ..

# 2. 개발 작업 수행 (예: Playwright 테스트)
npx playwright test e2e-tests/authentication/login-success-test.js --reporter=html

# 3. 완료 처리 (사용자 확인 후)
cd d_mcpsvr_jira && python3 -c "from jira_workflow import add_completion_comment; add_completion_comment('ICT-XX', {...})" && cd ..
```

### 커밋 메시지 규칙

```bash
# 커밋 시 이슈 번호 포함
git commit -m "[ICT-XX] 로그인 기능 구현 완료"
git commit -m "[ICT-XX] E2E 테스트 케이스 추가"
```

### 이슈 유형별 템플릿

#### Epic 생성
```python
issue_dict = {
    'project': {'key': 'ICT'},
    'summary': '[EPIC] 대규모_기능_명',
    'description': 'Epic 설명 및 포함되는 Story들 목록',
    'issuetype': {'id': '10005'}
}
```

#### Story 생성
```python
issue_dict = {
    'project': {'key': 'ICT'},
    'summary': '[STORY] 기능_설명',
    'description': '''**사용자 스토리**: 
As a [사용자], I want [기능] so that [목적]

**수용 기준**:
• 구체적인 검증 조건들''',
    'issuetype': {'id': '10042'}
}
```

#### Bug 생성
```python
issue_dict = {
    'project': {'key': 'ICT'},
    'summary': '[BUG] 버그_설명',
    'description': '''**문제 설명**:
• 현재 동작
• 예상 동작
• 재현 방법

**해결 방안**:
• 수정 계획''',
    'issuetype': {'id': '10040'}
}
```

### 자주 사용하는 함수들

```python
# 이슈 상태 전환 옵션 조회
from jira_workflow import get_available_transitions
get_available_transitions('ICT-XX')

# 상태 확인 후 자동 시작
from jira_workflow import check_and_start_work
check_and_start_work('ICT-XX')

# 간단한 코멘트 추가
from jira_workflow import add_issue_comment
add_issue_comment('ICT-XX', 'progress update message', 'progress')
```

## ❌ 오류 해결 가이드

### 타임아웃 오류 (Timeout Error)

**오류 메시지:**
```
Error: Command timed out after 2m 0.0s
```

**주요 원인 및 해결방법:**

#### 1. 잘못된 디렉토리에서 실행
```bash
# ❌ 잘못된 방법 - 절대 이렇게 하지 마세요
cd d_mcpsvr_jira  # 현재 디렉토리가 어디인지 불명확
python3 -c "..."  # 환경 변수 로드 실패 가능성

# ✅ 올바른 방법 - 반드시 이렇게 하세요
PROJECT_ROOT="/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage"
cd "$PROJECT_ROOT" && \
cd d_mcpsvr_jira && \
python3 -c "
from jira_workflow import add_completion_comment
# 작업 수행
" && \
cd ..
```

#### 2. 함수명 오류
```bash
# ❌ 존재하지 않는 함수
python3 -c "from jira_caller import safe_add_comment; ..."

# ✅ 올바른 함수명 사용
python3 -c "from jira_workflow import add_completion_comment; ..."
```

**올바른 함수 목록:**
- `jira_workflow.py`: `add_work_start_comment`, `add_progress_comment`, `add_completion_comment`
- `jira_caller.py`: `get_jira_client`, `jql_query`
- `quick_start.py`: `quick_start`

#### 3. 환경 변수 로드 실패
```bash
# 환경 변수 확인
cd d_mcpsvr_jira && python3 -c "
import os
from dotenv import load_dotenv
load_dotenv()
print(f'JIRA_SERVER: {os.getenv(\"JIRA_SERVER\", \"NOT_SET\")}')
print(f'JIRA_USER: {os.getenv(\"JIRA_USER\", \"NOT_SET\")}')
print(f'JIRA_API_TOKEN: {\"SET\" if os.getenv(\"JIRA_API_TOKEN\") else \"NOT_SET\"}')
"
```

#### 4. 네트워크 연결 문제
```bash
# JIRA 서버 연결 테스트
curl -I https://kwangmyung.atlassian.net
```

### 안전한 JIRA 명령 실행 템플릿

#### 표준 실행 패턴
```bash
#!/bin/bash

# 1. 프로젝트 루트 확인 및 이동
PROJECT_ROOT="/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage"

# 현재 위치 확인
echo "🔍 현재 위치: $(pwd)"

# 프로젝트 루트로 이동
if [ "$(pwd)" != "$PROJECT_ROOT" ]; then
    echo "🔄 프로젝트 루트로 이동: $PROJECT_ROOT"
    cd "$PROJECT_ROOT" || { echo "❌ 이동 실패"; exit 1; }
fi

# 필수 디렉토리 확인
if [ ! -d "d_mcpsvr_jira" ]; then
    echo "❌ d_mcpsvr_jira 디렉토리를 찾을 수 없습니다"
    exit 1
fi

echo "✅ 환경 확인 완료"

# 2. JIRA 명령 실행
cd d_mcpsvr_jira && \
python3 -c "
from jira_workflow import add_completion_comment

# 실제 JIRA 작업 수행
result = add_completion_comment(
    issue_key='ICT-75',
    completed_work='작업 내용...',
    modified_files=['file1.js', 'file2.md'],
    test_results='테스트 결과...'
)
print(f'✅ 작업 결과: {result}')
" && \
cd ..

echo "🏁 JIRA 작업 완료"
```

#### 빠른 디버깅 스크립트
```bash
# JIRA 연결 상태 진단
PROJECT_ROOT="/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage"
cd "$PROJECT_ROOT"

cd d_mcpsvr_jira && python3 -c "
print('=== JIRA 연결 진단 ===')

# 1. 환경 변수 확인
import os
from dotenv import load_dotenv
load_dotenv()

jira_server = os.getenv('JIRA_SERVER')  
jira_user = os.getenv('JIRA_USER')
jira_token = os.getenv('JIRA_API_TOKEN')

print(f'✓ JIRA_SERVER: {jira_server}')
print(f'✓ JIRA_USER: {jira_user}')
print(f'✓ JIRA_API_TOKEN: {\"설정됨\" if jira_token else \"미설정\"}')

# 2. JIRA 클라이언트 연결 테스트
try:
    from jira_caller import get_jira_client
    jira = get_jira_client()
    print('✅ JIRA 클라이언트 연결 성공')
    
    # 간단한 쿼리 테스트
    user = jira.current_user()
    print(f'✅ 현재 사용자: {user}')
    
except Exception as e:
    print(f'❌ JIRA 연결 실패: {e}')
" && cd ..
```

### 타임아웃 방지 Best Practices

#### 1. 명령어 분할
```bash
# 긴 작업은 단계별로 분할
# Step 1: 이슈 상태 확인
cd d_mcpsvr_jira && python3 -c "
from jira_caller import get_jira_client
jira = get_jira_client()
issue = jira.issue('ICT-75')
print(f'현재 상태: {issue.fields.status.name}')
" && cd ..

# Step 2: 댓글 추가
cd d_mcpsvr_jira && python3 -c "
from jira_workflow import add_completion_comment
result = add_completion_comment(...)
print(f'댓글 추가: {result}')
" && cd ..
```

#### 2. 타임아웃 설정
```python
# Python 스크립트 내에서 타임아웃 설정
import signal

def timeout_handler(signum, frame):
    raise TimeoutError("작업 시간 초과")

# 60초 타임아웃 설정
signal.signal(signal.SIGALRM, timeout_handler)
signal.alarm(60)

try:
    # JIRA 작업 수행
    result = add_completion_comment(...)
    signal.alarm(0)  # 타임아웃 해제
    print(f"성공: {result}")
except TimeoutError:
    print("❌ 작업 시간 초과")
```

## ⚠️ 필수 준수사항

### Claude 작업 시 필수 절차

**1. 작업 시작 전:**
- 유사 작업 검색 수행
- 새로운 이슈 생성 또는 기존 이슈 확인

**2. 작업 시작 시 (필수):**
```bash
# 반드시 프로젝트 루트에서 시작
PROJECT_ROOT="/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage"
cd "$PROJECT_ROOT"
cd d_mcpsvr_jira && python3 -c "from quick_start import quick_start; quick_start('ICT-XX')" && cd ..
```

**3. 작업 중:**
- 이슈에 진행 상황 코멘트 추가

**4. 작업 완료 후:**
- **사용자 테스트 확인 받은 후에만** 완료 처리
- 자동 완료 처리 금지

**5. 코드 커밋 시:**
- 커밋 메시지에 이슈 번호 포함

### 금지 사항

❌ **절대 하지 말 것:**
- 현재 디렉토리 불확실한 상태에서 `cd d_mcpsvr_jira` 실행
- 존재하지 않는 함수명 사용 (`safe_add_comment` 등)
- 코드 수정 직후 자동으로 완료 처리
- 사용자 테스트 없이 완료 처리
- "수정 완료!"라고 선언 후 바로 완료 처리

✅ **올바른 완료 처리:**
1. 작업 완료 후 진행 상황만 업데이트 (`add_progress_comment`)
2. 사용자 테스트 요청
3. 사용자 "정상 동작 확인" 답변 후에만 `add_completion_comment`

## 📊 이력 관리 및 추적

### 진행 상황 추적
- **JIRA 대시보드**: https://kwangmyung.atlassian.net/jira/dashboards
- **프로젝트 보드**: Kanban 또는 Scrum 보드 활용
- **이슈 링크**: 관련 이슈들 간의 연결 관계 설정

### 보고 및 분석
- **Burndown 차트**: 스프린트 진행 상황 추적
- **Velocity 차트**: 팀 생산성 측정
- **이슈 유형별 통계**: Epic, Story, Bug, Task 비율 분석

## 🛠 고급 활용

### MCP 서버 관리

```bash
# 의존성 설치
cd d_mcpsvr_jira && pip3 install -r requirements.txt

# 서버 연결 테스트
python3 -c "from server import echo; print(echo('test'))"

# 프로젝트 초기화
python3 -c "from server import init_project; print(init_project('ICT'))"

# 이슈 검색
python3 -c "from server import search; print(search('ICT', 'admin user', '', 5, 'readable'))"
```

### 대량 데이터 처리

```python
# 여러 이슈 동시 업데이트
from jira_workflow import batch_update_issues
batch_update_issues(['ICT-1', 'ICT-2', 'ICT-3'], status='In Progress')

# 프로젝트 전체 이슈 분석
from jira_workflow import analyze_project_issues
analyze_project_issues('ICT')
```

---

## 📚 관련 문서

- **[메인 가이드](../CLAUDE.md)** - 프로젝트 전체 개요
- **[개발 가이드](./DEVELOPMENT_GUIDE.md)** - 개발 환
- **[API 가이드](./API_GUIDE.md)** - API 개발 가이드라인

## 📝 업데이트 이력

- **2025-01-05**: 타임아웃 오류 해결 가이드 추가 (ICT-75 관련)
  - Command timeout 오류 원인 분석 및 해결방법 추가
  - 올바른 디렉토리 실행 패턴 상세 가이드
  - 함수명 오류 및 환경 변수 로드 실패 해결책
  - 안전한 JIRA 명령 실행 템플릿 제공
  - 타임아웃 방지 Best Practices 추가

- **2025-08-04**: 초기 문서 작성
  - JIRA MCP 통합 시스템 완전 문서화
  - 자동 작업 시작 시스템 추가
  - 상세 요약 및 워크플로우 자동화 가이드 작성
  - 실용적인 사용 패턴 정리