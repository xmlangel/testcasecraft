#!/usr/bin/env python3
"""
JIRA 보드에 자동으로 표시되는 이슈 생성 스크립트
칸반 보드와 백로그 모두에 정상 표시되도록 보장
"""
import json
from datetime import datetime
from jira_caller import get_jira_client


def create_board_visible_issue(
    project_key="ICT", summary="", description="", issue_type="10003"
):
    """
    칸반 보드에 자동으로 표시되는 이슈를 생성하고 보드 맨 위에 배치

    Args:
        project_key (str): 프로젝트 키 (기본값: 'ICT')
        summary (str): 이슈 제목
        description (str): 이슈 설명
        issue_type (str): 이슈 유형 ID (기본값: '10003' = Task)

    Returns:
        Issue object or None
    """
    try:
        jira = get_jira_client()

        print(f"=== 보드 표시 보장 이슈 생성 ===")
        print(f"프로젝트: {project_key}")
        print(f"제목: {summary}")
        print(f"이슈 유형: {issue_type}")

        # 1. 기본 이슈 생성
        issue_dict = {
            "project": {"key": project_key},
            "summary": summary,
            "description": description,
            "issuetype": {"id": issue_type},
        }

        new_issue = jira.create_issue(fields=issue_dict)
        print(f"✅ 이슈 생성 완료: {new_issue.key}")
        print(f"URL: https://kwangmyung.atlassian.net/browse/{new_issue.key}")

        # 2. 보드에 추가 및 맨 위로 이동
        success = move_issue_to_board_top(new_issue.key)
        if success:
            print(f"✅ {new_issue.key} 보드 맨 위로 이동 완료")
        else:
            print(f"⚠️ {new_issue.key} 보드 이동 실패 (보드에는 표시됨)")

        # 3. 생성된 이슈의 상태 확인
        created_issue = jira.issue(new_issue.key)
        rank = getattr(created_issue.fields, "customfield_10019", "없음")
        status = created_issue.fields.status.name
        print(f"최종 상태: {status}, Rank: {rank}")

        return new_issue

    except Exception as e:
        print(f"❌ 이슈 생성 실패: {e}")
        return None


def move_issue_to_board_top(issue_key):
    """
    기존 이슈를 보드 맨 위로 이동

    Args:
        issue_key (str): 이슈 키 (예: 'ICT-29')

    Returns:
        bool: 성공 여부
    """
    try:
        jira = get_jira_client()
        server_url = jira._options["server"]
        session = jira._session

        # 현재 보드의 첫 번째 이슈 확인
        board_issues_url = f"{server_url}/rest/agile/1.0/board/1/issue"
        board_response = session.get(board_issues_url, params={"maxResults": 1})

        if board_response.status_code == 200:
            board_data = board_response.json()
            board_issues = board_data.get("issues", [])

            if board_issues:
                first_issue_key = board_issues[0]["key"]

                # rank API를 사용해서 첫 번째 이슈 앞으로 이동
                rank_url = f"{server_url}/rest/agile/1.0/issue/rank"
                rank_data = {"issues": [issue_key], "rankBeforeIssue": first_issue_key}

                rank_response = session.put(
                    rank_url,
                    data=json.dumps(rank_data),
                    headers={"Content-Type": "application/json"},
                )

                return rank_response.status_code == 204
            else:
                print("보드에 이슈가 없어서 이동할 수 없습니다.")
                return False
        else:
            print(f"보드 이슈 조회 실패: {board_response.status_code}")
            return False

    except Exception as e:
        print(f"보드 이동 오류: {e}")
        return False


def bulk_move_recent_issues_to_board(start_issue_num=25):
    """
    최근 생성된 이슈들을 일괄적으로 보드 상위로 이동

    Args:
        start_issue_num (int): 이동할 시작 이슈 번호

    Returns:
        int: 성공한 이슈 수
    """
    try:
        jira = get_jira_client()

        # 최근 이슈들 조회
        recent_issues = jira.search_issues(
            f"project = ICT AND key >= ICT-{start_issue_num} ORDER BY key ASC",
            maxResults=10,
        )

        print(f"=== {len(recent_issues)}개 최근 이슈를 보드 상위로 이동 ===")

        success_count = 0
        for issue in recent_issues:
            print(f"\\n{issue.key} 이동 시도...")
            if move_issue_to_board_top(issue.key):
                success_count += 1
                print(f"  ✅ {issue.key} 이동 성공")
            else:
                print(f"  ❌ {issue.key} 이동 실패")

            # API 제한 방지
            import time

            time.sleep(0.5)

        print(f"\\n🎯 결과: {success_count}/{len(recent_issues)}개 이슈 이동 완료")
        return success_count

    except Exception as e:
        print(f"일괄 이동 실패: {e}")
        return 0


def verify_board_visibility():
    """
    보드 표시 상태 검증

    Returns:
        tuple: (보드 표시 이슈 수, 전체 이슈 수)
    """
    try:
        jira = get_jira_client()
        server_url = jira._options["server"]
        session = jira._session

        print("=== 보드 표시 상태 검증 ===")

        # 보드에 표시되는 이슈들
        board_issues_url = f"{server_url}/rest/agile/1.0/board/1/issue"
        board_response = session.get(board_issues_url, params={"maxResults": 50})

        if board_response.status_code == 200:
            board_data = board_response.json()
            board_issues = board_data.get("issues", [])
            board_count = len(board_issues)

            print(f"보드 표시 이슈: {board_count}개")

            # 최근 10개 이슈 표시
            print("\\n보드 상위 10개 이슈:")
            for i, issue in enumerate(board_issues[:10], 1):
                status = issue["fields"]["status"]["name"]
                summary = issue["fields"]["summary"][:40]
                print(f"  {i:2d}. {issue['key']}: {status:8s} - {summary}...")

            # 전체 프로젝트 이슈 수
            all_issues = jira.search_issues("project = ICT", maxResults=1)
            total_count = all_issues.total

            print(f"\\n전체 ICT 이슈: {total_count}개")
            print(
                f"보드 표시율: {board_count}/{total_count} = {board_count/total_count*100:.1f}%"
            )

            return board_count, total_count
        else:
            print(f"보드 이슈 조회 실패: {board_response.status_code}")
            return None, None

    except Exception as e:
        print(f"검증 실패: {e}")
        return None, None


# 테스트 및 사용 예제
def test_create_visible_issue():
    """보드 표시 보장 이슈 생성 테스트"""
    return create_board_visible_issue(
        project_key="ICT",
        summary="[TASK] 보드 자동 표시 테스트 이슈",
        description="""**작업 내용**:
• 보드 자동 표시 기능 테스트
• 칸반 보드 맨 위에 자동 배치 확인
• 향후 이슈 생성 시 참고용

**목표**:
• 모든 새 이슈가 보드에 자동 표시되도록 보장
• 사용자 경험 개선

**우선순위**: Medium""",
        issue_type="10003",  # Task
    )


def main():
    """메인 실행 함수"""
    print("🔧 JIRA 보드 표시 보장 시스템")
    print("=" * 50)

    # 1. 현재 상태 확인
    print("\\n1. 현재 보드 상태 확인...")
    board_count, total_count = verify_board_visibility()

    # 2. 테스트 이슈 생성
    print("\\n2. 보드 자동 표시 테스트 이슈 생성...")
    test_issue = test_create_visible_issue()

    if test_issue:
        # 3. 최종 상태 확인
        print("\\n3. 생성 후 보드 상태 재확인...")
        new_board_count, new_total_count = verify_board_visibility()

        if new_board_count and board_count:
            print(f"\\n📊 변화량:")
            print(
                f"  • 보드 이슈: {board_count} → {new_board_count} (+{new_board_count - board_count})"
            )
            if new_total_count and total_count:
                print(
                    f"  • 전체 이슈: {total_count} → {new_total_count} (+{new_total_count - total_count})"
                )
    else:
        print("❌ 테스트 이슈 생성 실패")


if __name__ == "__main__":
    main()
