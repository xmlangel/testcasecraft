#!/usr/bin/env python3
"""
JIRA 작업 빠른 시작 스크립트
Claude가 작업을 시작할 때 쉽게 사용할 수 있는 헬퍼 스크립트
"""

import sys
from jira_workflow import (
    check_and_start_work, 
    start_work_simple, 
    start_work_with_context,
    get_available_transitions,
    force_transition_to_progress
)

def quick_start(issue_key, work_description=None):
    """
    JIRA 이슈를 빠르게 시작하는 함수
    
    Args:
        issue_key (str): JIRA 이슈 키 (예: ICT-34)
        work_description (str, optional): 작업 설명 (없으면 자동 생성)
    """
    print(f"🚀 {issue_key} 작업 시작 처리...")
    print("=" * 50)
    
    try:
        if work_description:
            # 사용자가 작업 설명을 제공한 경우
            result = start_work_simple(issue_key, work_description)
            if result:
                print(f"✅ 커스텀 작업 설명으로 시작 완료!")
                return True
        else:
            # 자동으로 이슈 정보를 가져와서 시작
            result = check_and_start_work(issue_key)
            print(f"📋 {result}")
            return "작업 시작 완료" in result
            
    except Exception as e:
        print(f"❌ 작업 시작 실패: {e}")
        return False

def show_help():
    """도움말 표시"""
    print("""
🚀 JIRA 작업 빠른 시작 도구

사용법:
  python3 quick_start.py <이슈키>                    # 자동 작업 시작
  python3 quick_start.py <이슈키> "작업 설명"        # 커스텀 작업 설명으로 시작
  python3 quick_start.py --help                     # 도움말 표시

예제:
  python3 quick_start.py ICT-34
  python3 quick_start.py ICT-35 "사용자 권한 관리 기능 구현 시작"

Claude에서 사용하는 방법:
  python3 -c "from quick_start import quick_start; quick_start('ICT-34')"
  python3 -c "from quick_start import quick_start; quick_start('ICT-35', '새로운 기능 구현')"

함수:
  • quick_start(issue_key, work_description=None)
  • check_and_start_work(issue_key) - 자동 시작
  • start_work_simple(issue_key, work_description) - 간단 시작
  • get_available_transitions(issue_key) - 상태 전환 확인
""")

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] in ['--help', '-h', 'help']:
        show_help()
        sys.exit(0)
    
    issue_key = sys.argv[1]
    work_description = sys.argv[2] if len(sys.argv) > 2 else None
    
    print(f"🎯 대상 이슈: {issue_key}")
    if work_description:
        print(f"📝 작업 설명: {work_description}")
    else:
        print(f"📝 작업 설명: 자동 생성")
    
    success = quick_start(issue_key, work_description)
    
    if success:
        print(f"""
✅ 작업 시작 성공!
📋 JIRA URL: https://kwangmyung.atlassian.net/browse/{issue_key}
""")
        sys.exit(0)
    else:
        print(f"""
❌ 작업 시작 실패
📋 이슈 상태를 확인하거나 다른 방법을 시도해보세요.
""")
        sys.exit(1)