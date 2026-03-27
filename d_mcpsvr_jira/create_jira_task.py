from jira_workflow import create_board_visible_issue_simple
import os

# Set JIRA_SERVER environment variable if not already set
# This is usually set in .env file or by the environment
# For testing, you might need to set it explicitly if not already configured
# os.environ['JIRA_SERVER'] = 'https://kwangmyung.atlassian.net'
# os.environ['JIRA_USER'] = 'your_jira_username'
# os.environ['JIRA_API_TOKEN'] = 'your_jira_api_token'

issue = create_board_visible_issue_simple(
    project_key="ICT",
    summary="ICT-XXX: 테스트 케이스 실행 화면에서 폴더명>>케이스명 표시 기능 구현",
    description="""## 📋 작업 개요
테스트 케이스 실행 화면에서 테스트 케이스를 표시할 때, 해당 테스트 케이스의 상위 폴더가 존재할 경우 '폴더명>>케이스명' 형식으로 표시되도록 기능을 구현합니다.

## 🎯 목표
- 테스트 케이스 실행 화면의 가독성 및 정보 전달력 향상
- 사용자가 테스트 케이스의 계층 구조를 명확하게 인지할 수 있도록 지원

## 🛠️ 구현 계획
### Phase 1: 프론트엔드 수정
- `src/main/frontend/src/components/TestExecutionForm.jsx` 파일 수정
- `renderTree` 함수 내에서 테스트 케이스(`isFolder`가 아닌 경우)의 부모 폴더 정보 확인
- 부모 폴더가 존재하고 폴더 타입인 경우, 테스트 케이스 이름을 '부모폴더명>>테스트케이스명' 형식으로 조합하여 표시

## 📝 승인 기준
- [ ] 테스트 케이스 실행 화면에서 폴더 내의 테스트 케이스가 '폴더명>>케이스명' 형식으로 올바르게 표시되는 것을 확인
- [ ] 폴더가 없는 최상위 테스트 케이스는 기존과 동일하게 테스트 케이스명만 표시되는 것을 확인
- [ ] 기능 구현 후 애플리케이션이 정상적으로 동작하는 것을 확인""",
    issue_type="10003",  # Task
)
if issue:
    print(f"✅ 이슈 생성 성공: {issue.key}")
    print(f"이슈 URL: https://kwangmyung.atlassian.net/browse/{issue.key}")
else:
    print("❌ 이슈 생성 실패")
