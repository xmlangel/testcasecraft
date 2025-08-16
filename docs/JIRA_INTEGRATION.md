# JIRA Integration Guide (최종 업데이트: 2025-08-16)

JIRA 이슈 관리 및 이력 추적 시스템 통합 가이드입니다.

## 📋 목차

1. [JIRA 통합 개요](#-jira-통합-개요)
2. [환경 설정](#-환경-설정)
3. [작업 시작 프로세스](#-작업-시작-프로세스)
4. [이슈 관리 워크플로우](#-이슈-관리-워크플로우)
5. [실용적인 사용법](#-실용적인-사용법)
6. [오류 해결 가이드](#-오류-해결-가이드)
   - [JIRA Wiki Markup 형식 가이드](#-jira-wiki-markup-형식-가이드)
   - [테이블 형식 활용 가이드](#jira-테이블-형식-활용-가이드)

## 🎯 JIRA 통합 개요

### 핵심 목적
이 프로젝트는 **d_mcpsvr_jira 모듈을 통한 JIRA 자동 연동**을 지원하여 모든 개발 작업을 체계적으로 추적하고 관리합니다.

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

**이슈 타입 ID (2025-08-16 확인됨):**
```yaml
Task: 10003, 10041 (기본 작업 - 둘 다 사용 가능)
Story: 10042 (스토리)
Bug: 10040 (버그)
Epic: 10005 (에픽 - Epic의 하위 Story 연결 가능)
Sub-task: 10006 (하위 작업)
```

**⚠️ 주의**: 이슈 타입 ID는 JIRA 프로젝트 설정에 따라 달라질 수 있습니다. 확실하지 않은 경우 아래 명령어로 확인하세요:

```bash
PYTHONPATH="./d_mcpsvr_jira" python3 -c "
import sys
sys.path.insert(0, './d_mcpsvr_jira')
from jira_caller import get_jira_client
try:
    jira = get_jira_client()
    project = jira.project('ICT')
    for issue_type in project.issueTypes:
        print(f'• {issue_type.name}: {issue_type.id}')
except Exception as e:
    print(f'❌ 오류: {str(e)}')
"
```

## 🔧 환경 설정

### 프로젝트 구조
```
프로젝트 루트: /Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage/

d_mcpsvr_jira/                    # JIRA 연동 모듈 디렉토리
├── .env                         # JIRA 인증 정보 (중요!)
├── requirements.txt             # Python 의존성
├── jira_caller.py              # JIRA API 호출 모듈
├── jira_workflow.py            # 워크플로우 관리
├── quick_start.py              # 빠른 시작 스크립트
└── create_issues.py            # 일괄 이슈 생성
```

### .env 파일 설정 (필수)

**위치**: `d_mcpsvr_jira/.env`

```bash
# JIRA 연결 정보
JIRA_SERVER=https://kwangmyung.atlassian.net
JIRA_USER=your-email@domain.com
JIRA_API_TOKEN=your-api-token
JIRA_PROJECT_KEY=ICT
```

### ⚠️ 중요: 표준 실행 규칙

**모든 JIRA 명령어는 프로젝트 루트에서 실행하며, 상대경로를 사용합니다.**

**✅ 표준 실행 패턴**
```bash
# 프로젝트 루트 위치 확인
PROJECT_ROOT="/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage"

# 표준 JIRA 명령어 실행 패턴
PYTHONPATH="./d_mcpsvr_jira" python3 -c "
import sys
sys.path.insert(0, './d_mcpsvr_jira')
from jira_workflow import [함수명]
[작업 수행]
"
```

## 🚀 작업 시작 프로세스

### 1. 유사 작업 검색 (권장)

새로운 작업 시작 전 중복 방지를 위한 검색을 수행합니다.

```bash
PYTHONPATH="./d_mcpsvr_jira" python3 -c "
import sys
sys.path.insert(0, './d_mcpsvr_jira')
from jira_caller import get_jira_client

try:
    jira = get_jira_client()
    
    # 작업 키워드 설정 (예: '날짜 오류', 'JUnit', '테스트 결과')
    search_keywords = 'formatDistanceToNow Invalid Date'
    jql = f'project = ICT AND (summary ~ \"{search_keywords}\" OR description ~ \"{search_keywords}\") ORDER BY created DESC'
    issues = jira.search_issues(jql, maxResults=10)

    print(f'🔍 \"{search_keywords}\" 관련 유사 작업 {len(issues)}개 발견:')
    for issue in issues:
        print(f'📋 {issue.key}: {issue.fields.summary}')
        print(f'   상태: {issue.fields.status.name}')
        print(f'   URL: https://kwangmyung.atlassian.net/browse/{issue.key}')
except Exception as e:
    print(f'❌ 검색 실패: {str(e)}')
"
```

### 2. 새로운 이슈 생성

```bash
PYTHONPATH="./d_mcpsvr_jira" python3 -c "
import sys
sys.path.insert(0, './d_mcpsvr_jira')
from jira_caller import get_jira_client

try:
    jira = get_jira_client()

    issue_dict = {
        'project': {'key': 'ICT'},
        'summary': 'ICT-XXX: [작업_유형] 작업_제목',
        'description': '''## 📋 작업 내용
- 구체적인 작업 설명
- 기술적 요구사항
- 수용 기준

## 📁 관련 파일
- src/main/java/...
- src/main/frontend/...

## 🎯 우선순위
High/Medium/Low

## 📊 예상 스토리 포인트
숫자''',
        'issuetype': {'id': '10003'}  # Task
    }

    issue = jira.create_issue(fields=issue_dict)
    print(f'✅ 이슈 생성 완료: {issue.key} - {issue.fields.summary}')
    print(f'URL: https://kwangmyung.atlassian.net/browse/{issue.key}')
except Exception as e:
    print(f'❌ 이슈 생성 실패: {str(e)}')
"
```

### 3. 자동 작업 시작 (권장)

기존 이슈로 작업을 시작할 때 상태를 자동으로 "진행 중"으로 변경하고 작업 시작 코멘트를 추가합니다.

```bash
PYTHONPATH="./d_mcpsvr_jira" python3 -c "
import sys
sys.path.insert(0, './d_mcpsvr_jira')
from quick_start import quick_start

try:
    quick_start('ICT-225')
    print('✅ 작업 시작 처리 완료')
except Exception as e:
    print(f'❌ 작업 시작 실패: {str(e)}')
"
```

**자동으로 수행되는 작업:**
1. ✅ 이슈 상태 확인 ("해야 할 일" → "진행 중")
2. ✅ 상태 자동 변경
3. ✅ 작업 시작 코멘트 자동 추가
4. ✅ 시작 시간 및 담당자 정보 기록

## 🔄 이슈 관리 워크플로우

### 작업 진행 중 업데이트

```bash
PYTHONPATH="./d_mcpsvr_jira" python3 -c "
import sys
sys.path.insert(0, './d_mcpsvr_jira')
from jira_workflow import add_issue_comment

try:
    comment = '''ICT-225 진행 상황 업데이트

## 🔧 수행한 작업
- formatSafeDate 함수 구현
- Java LocalDateTime 배열 형식 처리 추가
- 사용자 친화적 날짜 표시 개선

## 📊 진행률
80% 완료 (테스트 검증 중)

## 🔍 발견 사항
- Java LocalDateTime이 배열 형태로 전달됨
- 월 인덱스 변환 필요 (Java 1-12 → JS 0-11)

## 📝 다음 단계
- E2E 테스트 실행
- 사용자 검증 요청'''

    result = add_issue_comment('ICT-225', comment, '진행 상황')
    print(f'✅ 진행 상황 업데이트 완료: {result}')
except Exception as e:
    print(f'❌ 업데이트 실패: {str(e)}')
"
```

### 작업 완료 처리

**⚠️ 중요 규칙**: 사용자 테스트 확인 후에만 완료 처리

```bash
PYTHONPATH="./d_mcpsvr_jira" python3 -c "
import sys
sys.path.insert(0, './d_mcpsvr_jira')
from jira_workflow import add_completion_comment

try:
    completion_message = '''🎉 ICT-225: JUnit 자동화 테스트 결과 날짜 표시 오류 수정 완료

## 📋 수정 완료 내역
- JUnit 결과 상세보기: \"업로드: 약 15시간 전\" 정상 표시
- 자동화 최근 실행결과: \"08/16\" (툴팁: 전체 날짜 정보)

## 🔧 핵심 기술 구현
- Java LocalDateTime 배열 처리: [year, month, day, hour, minute, second, nanosecond]
- 포괄적 날짜 형식 지원: 문자열, 숫자, 배열, Date 객체
- 안전한 예외 처리 및 fallback 전략

## 📁 수정된 파일
- src/main/frontend/src/components/JUnit/JunitResultDetail.jsx
- src/main/frontend/src/components/JunitResult/JunitResultDashboard.jsx

## 🎯 모든 승인 기준 달성
- [x] JUnit 결과 상세보기 페이지 정상 동작
- [x] formatDistanceToNow 오류 완전 해결
- [x] Invalid Date 오류 완전 해결
- [x] 사용자 친화적 날짜 표시 구현'''

    modified_files = [
        'src/main/frontend/src/components/JUnit/JunitResultDetail.jsx',
        'src/main/frontend/src/components/JunitResult/JunitResultDashboard.jsx'
    ]

    result = add_completion_comment('ICT-225', completion_message, modified_files, {'success': True})
    print(f'✅ 작업 완료 처리 완료: {result}')
except Exception as e:
    print(f'❌ 완료 처리 실패: {str(e)}')
"
```

## 💡 실용적인 사용법

### 빠른 시작 패턴

```bash
# 1. 이슈 시작
PYTHONPATH="./d_mcpsvr_jira" python3 -c "
import sys
sys.path.insert(0, './d_mcpsvr_jira')
from quick_start import quick_start
try:
    quick_start('ICT-XXX')
    print('✅ 이슈 시작 완료')
except Exception as e:
    print(f'❌ 이슈 시작 실패: {str(e)}')
"

# 2. 개발 작업 수행 (예시)
# 코드 수정, 테스트 등

# 3. 진행 상황 업데이트
PYTHONPATH="./d_mcpsvr_jira" python3 -c "
import sys
sys.path.insert(0, './d_mcpsvr_jira')
from jira_workflow import add_issue_comment
try:
    result = add_issue_comment('ICT-XXX', '작업 진행 상황...', '진행 상황')
    print(f'✅ 진행 상황 업데이트: {result}')
except Exception as e:
    print(f'❌ 업데이트 실패: {str(e)}')
"

# 4. 완료 처리 (사용자 확인 후)
PYTHONPATH="./d_mcpsvr_jira" python3 -c "
import sys
sys.path.insert(0, './d_mcpsvr_jira')
from jira_workflow import add_completion_comment
try:
    result = add_completion_comment('ICT-XXX', '작업 완료 내용...', [], {'success': True})
    print(f'✅ 완료 처리 성공: {result}')
except Exception as e:
    print(f'❌ 완료 처리 실패: {str(e)}')
"
```

### 커밋 메시지 규칙

```bash
# 커밋 시 이슈 번호 포함
git commit -m "ICT-225: JUnit 자동화 테스트 결과 날짜 표시 오류 수정"
git commit -m "ICT-XXX: 기능명 구현 완료"
```

### 이슈 유형별 템플릿

#### Epic 생성 (JIRA Wiki Markup 형식)
```bash
PYTHONPATH="./d_mcpsvr_jira" python3 -c "
import sys
sys.path.insert(0, './d_mcpsvr_jira')
from jira_caller import get_jira_client
from jira_templates import format_epic_description_from_data, get_test_report_epic_data

try:
    jira = get_jira_client()
    
    # ✅ Epic 생성 (JIRA Wiki Markup 형식)
    epic_dict = {
        'project': {'key': 'ICT'},
        'summary': 'ICT-XXX: 테스트 결과 상세리포트 출력 기능 구현',
        'description': '''h2. 에픽 개요
Epic의 목적과 범위 설명

h2. 주요 요구사항
* 요구사항 1
* 요구사항 2

h2. 예상 범위
* *백엔드*: 서비스 및 API 구현
* *프론트엔드*: UI 컴포넌트 개발
* *시스템*: 통합 및 배포

h2. 하위 스토리 계획
* Story 1
* Story 2''',
        'issuetype': {'id': '10005'}  # Epic
    }
    
    epic_issue = jira.create_issue(fields=epic_dict)
    print(f'✅ Epic 생성 성공: {epic_issue.key}')
    print(f'URL: https://kwangmyung.atlassian.net/browse/{epic_issue.key}')
    
except Exception as e:
    print(f'❌ Epic 생성 실패: {str(e)}')
"
```

#### Story 생성 (Epic에 연결, JIRA Wiki Markup 형식)
```bash
PYTHONPATH="./d_mcpsvr_jira" python3 -c "
import sys
sys.path.insert(0, './d_mcpsvr_jira')
from jira_caller import get_jira_client

try:
    jira = get_jira_client()
    
    # ✅ Story 생성 (JIRA Wiki Markup 형식)
    story_dict = {
        'project': {'key': 'ICT'},
        'summary': 'ICT-XXX: 스토리 제목',
        'description': '''h2. 스토리 개요
스토리의 목적과 설명

h2. 승인 기준
* 기준 1
* 기준 2  
* 기준 3

h2. 기술 스택
* *백엔드*: Spring Boot
* *프론트엔드*: React

h2. 테스트 계획
* 단위 테스트
* 통합 테스트
* E2E 테스트''',
        'issuetype': {'id': '10042'},  # Story
        'parent': {'key': 'ICT-227'}   # Epic Key로 연결
    }
    
    story_issue = jira.create_issue(fields=story_dict)
    print(f'✅ Story 생성 성공: {story_issue.key}')
    print(f'URL: https://kwangmyung.atlassian.net/browse/{story_issue.key}')
    
except Exception as e:
    print(f'❌ Story 생성 실패: {str(e)}')
"
```

#### Bug 생성 (JIRA Wiki Markup 형식)
```bash
PYTHONPATH="./d_mcpsvr_jira" python3 -c "
import sys
sys.path.insert(0, './d_mcpsvr_jira')
from jira_caller import get_jira_client

try:
    jira = get_jira_client()
    
    # ✅ Bug 생성 (JIRA Wiki Markup 형식)
    bug_dict = {
        'project': {'key': 'ICT'},
        'summary': 'ICT-XXX: 버그_설명',
        'description': '''h2. 문제 설명

h3. 현재 동작
실제로 일어나는 현상

h3. 예상 동작  
원래 일어나야 할 동작

h3. 재현 방법
# 단계 1
# 단계 2
# 단계 3

h2. 해결 방안
수정 계획 및 접근 방법

h2. 영향도
* *심각도*: High/Medium/Low
* *범위*: 특정 기능/전체 시스템''',
        'issuetype': {'id': '10040'}  # Bug
    }
    
    bug_issue = jira.create_issue(fields=bug_dict)
    print(f'✅ Bug 생성 성공: {bug_issue.key}')
    print(f'URL: https://kwangmyung.atlassian.net/browse/{bug_issue.key}')
    
except Exception as e:
    print(f'❌ Bug 생성 실패: {str(e)}')
"
```

#### 기본 Task 생성 (JIRA Wiki Markup 형식)
```bash
PYTHONPATH="./d_mcpsvr_jira" python3 -c "
import sys
sys.path.insert(0, './d_mcpsvr_jira')
from jira_caller import get_jira_client

try:
    jira = get_jira_client()
    
    # ✅ Task 생성 (JIRA Wiki Markup 형식)
    task_dict = {
        'project': {'key': 'ICT'},
        'summary': 'ICT-XXX: 작업 제목',
        'description': '''h2. 작업 내용
구체적인 작업 설명

h2. 수용 기준
* 완료 조건 1
* 완료 조건 2

h2. 관련 파일
* src/main/java/...
* src/main/frontend/...

h2. 예상 작업 시간
시간 (예: 4시간)''',
        'issuetype': {'id': '10003'}  # Task (기본)
    }
    
    task_issue = jira.create_issue(fields=task_dict)
    print(f'✅ Task 생성 성공: {task_issue.key}')
    print(f'URL: https://kwangmyung.atlassian.net/browse/{task_issue.key}')
    
except Exception as e:
    print(f'❌ Task 생성 실패: {str(e)}')
"
```

### 자주 사용하는 함수들

```python
# 이슈 조회
from jira_caller import get_jira_client
jira = get_jira_client()
issue = jira.issue('ICT-XXX')

# 간단한 코멘트 추가
from jira_workflow import add_issue_comment
add_issue_comment('ICT-XXX', 'progress update message', 'progress')

# 완료 처리
from jira_workflow import add_completion_comment
add_completion_comment('ICT-XXX', 'completion message', ['file1.js'], {'success': True})
```

## ❌ 오류 해결 가이드

### 일반적인 오류 유형

#### 1. ModuleNotFoundError: No module named 'jira_workflow'

**원인**: .env 파일이 없거나 Python 경로 설정 문제

**해결방법**:
```bash
# 1. .env 파일 확인
ls -la d_mcpsvr_jira/.env

# 2. .env 파일이 없는 경우 생성
cat > d_mcpsvr_jira/.env << EOF
JIRA_SERVER=https://kwangmyung.atlassian.net
JIRA_USER=your-email@domain.com
JIRA_API_TOKEN=your-api-token
JIRA_PROJECT_KEY=ICT
EOF

# 3. 프로젝트 루트에서 실행 확인
pwd  # 올바른 위치: /Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage
```

#### 2. 인증 오류 (401 Unauthorized)

**원인**: JIRA_API_TOKEN 만료 또는 잘못된 토큰

**해결방법**:
1. JIRA 계정 설정 → 보안 → API 토큰에서 새 토큰 생성
2. .env 파일의 JIRA_API_TOKEN 업데이트

#### 3. 권한 오류 (403 Forbidden)

**원인**: 이슈 생성/수정 권한 부족

**해결방법**:
- JIRA 프로젝트 권한 확인
- 프로젝트 관리자에게 권한 요청

#### 4. 이슈 생성 시 필드 오류들

##### 4.1. Priority 필드 오류
**오류**: `Field 'priority' cannot be set. It is not on the appropriate screen, or unknown.`

**원인**: JIRA 프로젝트 설정에서 Priority 필드가 이슈 생성 화면에 활성화되지 않음

**해결방법**:
```python
# ❌ 잘못된 방법 (priority 필드 포함)
issue_dict = {
    'project': {'key': 'ICT'},
    'summary': '제목',
    'description': '설명',
    'issuetype': {'id': '10003'},
    'priority': {'id': '2'}  # 이 필드가 오류 발생
}

# ✅ 올바른 방법 (priority 필드 제거)
issue_dict = {
    'project': {'key': 'ICT'},
    'summary': '제목', 
    'description': '설명',
    'issuetype': {'id': '10003'}
}
```

##### 4.2. 이슈 타입 ID 오류
**오류**: `선택한 이슈 유형이 올바르지 않습니다.`

**원인**: 잘못된 이슈 타입 ID 사용

**올바른 이슈 타입 ID (확인됨)**:
```yaml
Task: 10003, 10041 (기본 작업)
Story: 10042 (스토리)
Bug: 10040 (버그)
Epic: 10005 (에픽)
Sub-task: 10006 (하위 작업)
```

**사용 예시**:
```python
# Epic 생성
epic_dict = {
    'project': {'key': 'ICT'},
    'summary': 'ICT-XXX: [EPIC] 기능명',
    'description': 'Epic 설명',
    'issuetype': {'id': '10005'}  # Epic
}

# Story 생성 (Epic의 하위)
story_dict = {
    'project': {'key': 'ICT'},
    'summary': 'ICT-XXX: 스토리 제목',
    'description': 'Story 설명',
    'issuetype': {'id': '10042'},  # Story
    'parent': {'key': 'ICT-227'}  # Epic 연결
}

# Bug 생성
bug_dict = {
    'project': {'key': 'ICT'},
    'summary': 'ICT-XXX: [BUG] 버그 제목',
    'description': 'Bug 설명',
    'issuetype': {'id': '10040'}  # Bug
}
```

##### 4.3. 이슈 타입 확인 방법
**항상 사용 가능한 이슈 타입을 먼저 확인**:
```python
PYTHONPATH="./d_mcpsvr_jira" python3 -c "
import sys
sys.path.insert(0, './d_mcpsvr_jira')
from jira_caller import get_jira_client

try:
    jira = get_jira_client()
    project = jira.project('ICT')
    issue_types = project.issueTypes
    
    print('사용 가능한 이슈 타입:')
    for issue_type in issue_types:
        print(f'• ID: {issue_type.id}, 이름: {issue_type.name}')
        
except Exception as e:
    print(f'❌ 이슈 타입 조회 실패: {str(e)}')
"
```

#### 5. Parent 필드 설정 오류

**Epic과 Story 연결 시**:
```python
# ✅ 올바른 방법
story_dict = {
    'project': {'key': 'ICT'},
    'summary': 'Story 제목',
    'description': 'Story 설명',
    'issuetype': {'id': '10042'},  # Story 타입
    'parent': {'key': 'ICT-227'}   # Epic Key로 연결
}

# ❌ 잘못된 방법들
# 'epic_link': {'key': 'ICT-227'}     # 필드명 틀림
# 'parent': {'id': 'ICT-227'}         # key가 아닌 id 사용
# 'customfield_10014': 'ICT-227'     # Epic Link 커스텀 필드 직접 사용
```

### 🔍 빠른 오류 진단 가이드

발생한 오류 메시지에 따른 빠른 해결 방법:

#### "Field 'priority' cannot be set"
```bash
# 해결: priority 필드 제거
issue_dict에서 'priority': {'id': 'X'} 라인 삭제
```

#### "선택한 이슈 유형이 올바르지 않습니다"
```bash
# 해결: 이슈 타입 ID 확인 및 수정
# Epic: 10005, Story: 10042, Bug: 10040, Task: 10003
```

#### "JiraError HTTP 400" 
```bash
# 일반적으로 필드 값 오류 - 오류 메시지의 "errors" 섹션 확인
# 대부분 priority 필드나 잘못된 이슈 타입 ID 문제
```

#### "ModuleNotFoundError"
```bash
# 해결: 프로젝트 루트에서 실행 확인
pwd  # 올바른 위치 확인
ls d_mcpsvr_jira/.env  # .env 파일 존재 확인
```

#### "HTTP 401 Unauthorized"
```bash
# 해결: API 토큰 갱신
# JIRA → 설정 → 보안 → API 토큰 → 새 토큰 생성
```

### 📝 JIRA Wiki Markup 형식 가이드

**⚠️ 중요**: JIRA는 마크다운이 아닌 **Wiki Markup** 형식을 사용합니다.

#### 지원되는 형식
```
✅ 올바른 JIRA Wiki Markup:
h1. 대제목
h2. 중제목  
h3. 소제목
* 불릿 포인트
# 번호 목록
*텍스트* (볼드)
_텍스트_ (이탤릭)
{panel:title=제목|borderColor=#cccccc}내용{panel}

❌ 잘못된 형식 (마크다운):
## 제목  (JIRA에서 지원 안함)
- 불릿  (JIRA에서 지원 안함)  
🎯 이모지 (JIRA에서 깨짐)
**텍스트** (JIRA에서 지원 안함)
```

#### 형식 변환 가이드
| 마크다운 | JIRA Wiki Markup |
|---------|------------------|
| `## 제목` | `h2. 제목` |
| `### 제목` | `h3. 제목` |
| `- 항목` | `* 항목` |
| `1. 항목` | `# 항목` |
| `**굵게**` | `*굵게*` |
| `🎯 이모지` | `이모지 제거` |

#### JIRA 테이블 형식 활용 가이드

**📊 테이블을 사용하면 좋은 상황들:**
- 작업 우선순위 매트릭스
- 기술 스택 비교
- 진행 상황 추적
- 성능 요구사항 정의
- 테스트 결과 요약
- 리스크 평가 매트릭스

#### 테이블 문법
```
||*헤더 1*||*헤더 2*||*헤더 3*||
|데이터 1|데이터 2|데이터 3|
|데이터 4|데이터 5|데이터 6|
```

#### 실제 활용 예시

**1️⃣ 작업 우선순위 매트릭스**
```
||*작업*||*우선순위*||*예상 시간*||*복잡도*||*의존성*||
|백엔드 API|High|3일|Medium|없음|
|프론트엔드 UI|High|2일|Low|API 완료|
|테스트 작성|Medium|1일|Low|구현 완료|
```

**2️⃣ 기술 스택 비교**
```
||*영역*||*현재*||*제안*||*장점*||*단점*||
|백엔드|Spring Boot 2.x|Spring Boot 3.x|성능 향상|마이그레이션 비용|
|프론트엔드|React 17|React 18|동시성 개선|학습 곡선|
|데이터베이스|H2|PostgreSQL|운영 안정성|설정 복잡도|
```

**3️⃣ 테스트 결과 추적**
```
||*테스트 유형*||*총 케이스*||*통과*||*실패*||*성공률*||*비고*||
|단위 테스트|45|43|2|95.6%|2개 수정 필요|
|통합 테스트|12|11|1|91.7%|DB 연결 이슈|
|E2E 테스트|8|8|0|100%|모든 시나리오 통과|
```

**4️⃣ 리스크 평가 매트릭스**
```
||*리스크*||*발생 확률*||*영향도*||*리스크 점수*||*대응 방안*||
|API 성능 저하|Medium|High|6|캐싱 적용|
|브라우저 호환성|Low|Medium|3|크로스 브라우저 테스트|
|데이터 마이그레이션|High|Critical|9|단계별 마이그레이션|
```

**5️⃣ 품질 메트릭 추적**
```
||*지표*||*목표값*||*현재값*||*상태*||*개선 방안*||
|코드 커버리지|80%|92%|✅|현재 수준 유지|
|응답 시간|<200ms|156ms|✅|추가 최적화 불필요|
|메모리 사용량|<500MB|720MB|❌|메모리 누수 확인|
|빌드 시간|<5분|8분|❌|병렬 빌드 적용|
```

#### 테이블 디자인 팁

**📝 테이블 작성 모범 사례:**
```
✅ 좋은 테이블:
- 헤더에 *볼드* 적용 (||*헤더*||)
- 상태는 ✅❌ 기호 사용
- 우선순위는 High/Medium/Low 표준화
- 수치는 단위 명시 (일, 시간, %)

❌ 피해야 할 것:
- 너무 많은 컬럼 (5개 이하 권장)
- 길고 복잡한 셀 내용
- 일관성 없는 데이터 형식
- 이모지 과다 사용
```

**🎨 색상 구분 활용:**
```
테이블 + Panel 조합으로 시각적 구분:

{panel:title=HIGH 우선순위 작업|borderColor=#d9534f}
||*작업*||*담당자*||*마감일*||
|보안 취약점 수정|개발팀|2025-08-20|
|성능 최적화|아키텍트|2025-08-22|
{panel}

{panel:title=MEDIUM 우선순위 작업|borderColor=#f0ad4e}
||*작업*||*담당자*||*마감일*||
|UI 개선|프론트엔드|2025-08-25|
|문서화|전체팀|2025-08-30|
{panel}
```

### 연결 상태 진단

```bash
# JIRA 연결 상태 확인
PYTHONPATH="./d_mcpsvr_jira" python3 -c "
import sys
sys.path.insert(0, './d_mcpsvr_jira')

print('=== JIRA 연결 진단 ===')

# 1. 환경 변수 확인
import os
from dotenv import load_dotenv
load_dotenv('./d_mcpsvr_jira/.env')

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
    
    user = jira.current_user()
    print(f'✅ 현재 사용자: {user}')
    
except Exception as e:
    print(f'❌ JIRA 연결 실패: {str(e)}')
"
```

## ⚠️ 필수 준수사항

### Claude 작업 시 필수 절차

**1. 작업 시작 전:**
- 유사 작업 검색 수행 (선택적)
- 새로운 이슈 생성 또는 기존 이슈 확인

**2. 작업 시작 시 (필수):**
```bash
# 반드시 프로젝트 루트에서 시작
PYTHONPATH="./d_mcpsvr_jira" python3 -c "
import sys
sys.path.insert(0, './d_mcpsvr_jira')
from quick_start import quick_start
try:
    quick_start('ICT-XXX')
    print('✅ 작업 시작 완료')
except Exception as e:
    print(f'❌ 작업 시작 실패: {str(e)}')
"
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
- .env 파일 없이 JIRA 작업 시도
- 존재하지 않는 함수명 사용
- 코드 수정 직후 자동으로 완료 처리
- 사용자 테스트 없이 완료 처리

✅ **올바른 완료 처리:**
1. 작업 완료 후 진행 상황만 업데이트 (`add_issue_comment`)
2. 사용자 테스트 요청
3. 사용자 "정상 동작 확인" 답변 후에만 `add_completion_comment`

## 📚 관련 문서

- **[메인 가이드](../CLAUDE.md)** - 프로젝트 전체 개요
- **[개발 가이드](./DEVELOPMENT_GUIDE.md)** - 개발 환경 설정
- **[API 가이드](./API_GUIDE.md)** - API 개발 가이드라인