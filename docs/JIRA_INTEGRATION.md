# JIRA Integration Guide (최종 업데이트: 2025-08-16)

JIRA 이슈 관리 및 이력 추적 시스템 통합 가이드입니다.

## 📋 목차

1. [JIRA 통합 개요](#-jira-통합-개요)
2. [환경 설정](#-환경-설정)
3. [작업 시작 프로세스](#-작업-시작-프로세스)
4. [이슈 관리 워크플로우](#-이슈-관리-워크플로우)
5. [실용적인 사용법](#-실용적인-사용법)
6. [오류 해결 가이드](#-오류-해결-가이드)

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

**이슈 타입 ID:**
```yaml
Task: 10003 (기본값)
Story: 10042
Bug: 10040
Epic: 10005
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

#### Epic 생성
```python
issue_dict = {
    'project': {'key': 'ICT'},
    'summary': 'ICT-XXX: [EPIC] 대규모_기능_명',
    'description': 'Epic 설명 및 포함되는 Story들 목록',
    'issuetype': {'id': '10005'}
}
```

#### Bug 생성
```python
issue_dict = {
    'project': {'key': 'ICT'},
    'summary': 'ICT-XXX: [BUG] 버그_설명',
    'description': '''## 🐛 문제 설명
- 현재 동작: 
- 예상 동작:
- 재현 방법:

## 🔧 해결 방안
- 수정 계획:''',
    'issuetype': {'id': '10040'}
}
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