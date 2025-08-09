#!/usr/bin/env python3
import sys
sys.path.insert(0, './d_mcpsvr_jira')
from jira_caller import get_jira_client

print('=== 스프레드시트 스텝 추가 버그 JIRA 이슈 생성 ===')
try:
    jira = get_jira_client()
    
    # 버그 이슈 생성
    bug_dict = {
        'project': {'key': 'ICT'},
        'summary': 'ICT-144: 스프레드시트 테스트케이스 스텝 추가 기능 버그',
        'description': '''## 🐛 문제 상황

스프레드시트 모드에서 테스트케이스 스텝 추가 기능이 정상 작동하지 않는 버그가 발견되었습니다.

### 현재 증상
- 설정 버튼 클릭 → "스텝 추가" 메뉴 클릭
- UI상으로는 클릭 이벤트가 발생하지만 실제 스텝 수가 증가하지 않음
- 현재 3개 스텝에서 4개로 증가해야 하지만 여전히 3개 유지

### 테스트 환경
- URL: http://localhost:3000/projects/f8943e57-9925-4f80-9fc7-61e743c5937f/testcases
- 브라우저: Chrome (Playwright 자동화)
- 사용자: admin/admin
- 프로젝트: 인프라 자동화

### 재현 단계
1. 테스트케이스 페이지 접속
2. "스프레드시트" 모드 활성화
3. 설정 버튼 클릭
4. "스텝 추가" 메뉴 선택
5. 결과: 스텝 수가 증가하지 않음 (3개 → 3개)

### 기대 동작
- 스텝 추가 클릭 시 스텝 수가 1개 증가 (3개 → 4개)
- 스프레드시트에 새로운 Step/Expected 컬럼 추가
- 사용자에게 성공 메시지 표시

### 영향도
- 심각도: Medium (기능적 버그, 사용성 저하)
- 범위: 스프레드시트 모드의 스텝 관리 기능
- 사용자 경험: 테스트케이스 관리 효율성 저하

### 기술적 분석
- 파일: src/main/frontend/src/components/TestCase/TestCaseSpreadsheet.jsx
- 관련 함수: handleQuickStepChange(), handleStepCountChange() 
- UI 요소: 설정 메뉴, 스텝 추가 MenuItem

### 추가 정보
- 코드상으로는 구현이 완료되어 있음
- 이벤트 핸들러와 상태 관리 로직 존재
- 실제 브라우저에서만 작동하지 않는 상황''',
        'issuetype': {'id': '10040'},  # 버그 타입
        'priority': {'id': '3'}  # Medium
    }
    
    new_issue = jira.create_issue(fields=bug_dict)
    print(f'✅ 버그 이슈 생성 성공: {new_issue.key}')
    print(f'이슈 URL: https://kimyoungjin-ho.atlassian.net/browse/{new_issue.key}')
    
except Exception as e:
    print(f'❌ 이슈 생성 실패: {str(e)}')