#!/usr/bin/env python3
"""
개선된 JIRA 이슈 생성 스크립트
대시보드 표시 문제 해결을 위해 Rank 필드를 적절히 설정하여 이슈 생성
"""
import logging
from datetime import datetime
from jira_caller import get_jira_client

def create_board_compatible_issue(project_key, summary, description, issue_type='10003', priority='3'):
    """
    대시보드에 표시되도록 Rank 필드를 설정하여 이슈 생성
    
    Args:
        project_key (str): 프로젝트 키 (예: 'ICT')
        summary (str): 이슈 제목
        description (str): 이슈 설명
        issue_type (str): 이슈 유형 ID (기본값: '10003' = Task)
        priority (str): 우선순위 ID (기본값: '3' = Medium)
    
    Returns:
        Issue object or None
    """
    try:
        jira = get_jira_client()
        
        # 현재 보드에서 가장 높은 Rank 값 확인
        existing_issues = jira.search_issues(
            f'project = {project_key} ORDER BY Rank DESC', 
            maxResults=1,
            fields='customfield_10019'  # Rank 필드
        )
        
        # 새로운 Rank 값 계산 (기존 최대값보다 큰 값)
        if existing_issues and hasattr(existing_issues[0].fields, 'customfield_10019'):
            current_rank = getattr(existing_issues[0].fields, 'customfield_10019', '')
            print(f"현재 최고 Rank: {current_rank}")
            # 새로운 Rank 값은 현재 시간 기반으로 생성
            new_rank = f"0|i{int(datetime.now().timestamp())}:"
        else:
            # 기본 Rank 값
            new_rank = f"0|i{int(datetime.now().timestamp())}:"
        
        print(f"새로운 Rank 값: {new_rank}")
        
        # 이슈 생성 데이터
        issue_dict = {
            'project': {'key': project_key},
            'summary': summary,
            'description': description,
            'issuetype': {'id': issue_type},
            'priority': {'id': priority},
            'customfield_10019': new_rank  # Rank 필드 설정
        }
        
        print(f"=== 대시보드 호환 이슈 생성 시도 ===")
        print(f"프로젝트: {project_key}")
        print(f"제목: {summary}")
        print(f"이슈 유형: {issue_type}")
        print(f"Rank: {new_rank}")
        
        # 이슈 생성
        new_issue = jira.create_issue(fields=issue_dict)
        
        print(f"✅ 이슈 생성 완료: {new_issue.key}")
        print(f"URL: https://kwangmyung.atlassian.net/browse/{new_issue.key}")
        
        # 생성된 이슈의 Rank 값 확인
        created_issue = jira.issue(new_issue.key)
        actual_rank = getattr(created_issue.fields, 'customfield_10019', '없음')
        print(f"설정된 Rank: {actual_rank}")
        
        return new_issue
        
    except Exception as e:
        print(f"❌ 이슈 생성 실패: {e}")
        logging.error(f"이슈 생성 실패: {e}")
        return None

def fix_existing_issue_rank(issue_key):
    """
    기존 이슈의 Rank 값을 수정하여 대시보드에 표시되도록 함
    
    Args:
        issue_key (str): 수정할 이슈 키 (예: 'ICT-25')
    
    Returns:
        bool: 성공 여부
    """
    try:
        jira = get_jira_client()
        issue = jira.issue(issue_key)
        
        # 새로운 Rank 값 생성
        new_rank = f"0|i{int(datetime.now().timestamp())}:"
        
        print(f"=== 기존 이슈 Rank 수정: {issue_key} ===")
        print(f"현재 Rank: {getattr(issue.fields, 'customfield_10019', '없음')}")
        print(f"새로운 Rank: {new_rank}")
        
        # Rank 필드 업데이트
        issue.update(fields={'customfield_10019': new_rank})
        
        print(f"✅ {issue_key} Rank 수정 완료")
        return True
        
    except Exception as e:
        print(f"❌ {issue_key} Rank 수정 실패: {e}")
        logging.error(f"{issue_key} Rank 수정 실패: {e}")
        return False

def bulk_fix_recent_issues(project_key='ICT', start_issue_num=16):
    """
    최근 생성된 이슈들의 Rank를 일괄 수정
    
    Args:
        project_key (str): 프로젝트 키
        start_issue_num (int): 수정 시작할 이슈 번호
    """
    try:
        jira = get_jira_client()
        
        # 최근 이슈들 조회
        recent_issues = jira.search_issues(
            f'project = {project_key} AND key >= {project_key}-{start_issue_num} ORDER BY key ASC',
            maxResults=20
        )
        
        print(f"=== {len(recent_issues)}개 최근 이슈의 Rank 일괄 수정 ===")
        
        success_count = 0
        for issue in recent_issues:
            print(f"\n처리 중: {issue.key} - {issue.fields.summary}")
            if fix_existing_issue_rank(issue.key):
                success_count += 1
            
            # API 요청 제한을 위한 짧은 대기
            import time
            time.sleep(0.5)
        
        print(f"\n✅ 총 {success_count}/{len(recent_issues)}개 이슈 수정 완료")
        
        return success_count == len(recent_issues)
        
    except Exception as e:
        print(f"❌ 일괄 수정 실패: {e}")
        logging.error(f"일괄 수정 실패: {e}")
        return False

def verify_board_display():
    """
    수정 후 보드 표시 상태 확인
    """
    try:
        jira = get_jira_client()
        
        print("=== 보드 표시 상태 확인 ===")
        
        # 보드 필터와 동일한 JQL로 조회
        board_issues = jira.search_issues(
            'project = ICT ORDER BY Rank ASC',
            maxResults=30
        )
        
        print(f"현재 보드에 표시되는 이슈 {len(board_issues)}개:")
        for issue in board_issues:
            rank = getattr(issue.fields, 'customfield_10019', '없음')
            print(f"  • {issue.key}: {issue.fields.status.name} - Rank: {rank}")
        
        # 전체 이슈와 비교
        all_issues = jira.search_issues('project = ICT ORDER BY key ASC', maxResults=30)
        
        print(f"\n전체 ICT 이슈 {len(all_issues)}개 중 보드 표시 상태:")
        board_keys = [issue.key for issue in board_issues]
        
        for issue in all_issues:
            status = "✅ 표시됨" if issue.key in board_keys else "❌ 숨김"
            rank = getattr(issue.fields, 'customfield_10019', '없음')
            print(f"  {status} {issue.key}: {issue.fields.status.name} - Rank: {rank[:20]}...")
        
        return len(board_issues), len(all_issues)
        
    except Exception as e:
        print(f"보드 표시 확인 실패: {e}")
        return None, None

# 테스트 함수들
def test_create_issue():
    """새로운 이슈 생성 테스트"""
    return create_board_compatible_issue(
        project_key='ICT',
        summary='[TASK] JIRA 대시보드 표시 문제 해결 테스트',
        description='''**작업 내용**:
• 개선된 이슈 생성 스크립트 테스트
• Rank 필드 설정으로 대시보드 표시 문제 해결
• 기존 이슈들의 Rank 값 수정

**목표**:
• 모든 이슈가 대시보드에 표시되도록 수정
• 향후 이슈 생성 시 문제 발생 방지

**우선순위**: High''',
        issue_type='10003',  # Task
        priority='2'  # High
    )

def main():
    """메인 실행 함수"""
    print("🔧 JIRA 대시보드 표시 문제 해결 스크립트")
    print("=" * 50)
    
    # 1. 새로운 이슈 생성 테스트
    print("\n1. 새로운 이슈 생성 테스트...")
    test_issue = test_create_issue()
    
    if test_issue:
        print(f"✅ 테스트 이슈 생성 성공: {test_issue.key}")
        
        # 2. 기존 이슈들 Rank 수정
        print("\n2. 기존 이슈들 Rank 일괄 수정...")
        bulk_success = bulk_fix_recent_issues(start_issue_num=16)
        
        if bulk_success:
            print("✅ 기존 이슈들 수정 완료")
        else:
            print("⚠️ 일부 이슈 수정 실패")
        
        # 3. 결과 확인
        print("\n3. 수정 결과 확인...")
        board_count, total_count = verify_board_display()
        
        if board_count and total_count:
            print(f"\n📊 최종 결과:")
            print(f"  • 전체 이슈: {total_count}개")
            print(f"  • 보드 표시: {board_count}개")
            print(f"  • 표시율: {board_count/total_count*100:.1f}%")
            
            if board_count == total_count:
                print("🎉 모든 이슈가 대시보드에 표시됩니다!")
            else:
                print("⚠️ 일부 이슈가 여전히 표시되지 않습니다.")
        
    else:
        print("❌ 테스트 이슈 생성 실패")

if __name__ == "__main__":
    main()