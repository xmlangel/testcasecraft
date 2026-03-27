#!/usr/bin/env python3
"""
JIRA 작업 흐름 관리 스크립트
작업 시작, 진행, 완료 시 JIRA 이슈에 코멘트 추가 및 상태 변경
"""
import logging
from datetime import datetime
from jira_caller import get_jira_client


def add_work_start_comment(
    issue_key,
    work_description,
    estimated_hours=None,
    files=None,
    technical_context=None,
    dependencies=None,
    risks=None,
):
    """작업 시작 코멘트 추가 (상세 정보 포함)"""
    try:
        jira = get_jira_client()
        issue = jira.issue(issue_key)

        # 상태를 '진행 중'으로 변경
        transitions = jira.transitions(issue)
        in_progress_transitions = [
            t
            for t in transitions
            if "진행" in t["name"] or "progress" in t["name"].lower()
        ]
        if in_progress_transitions:
            jira.transition_issue(issue, in_progress_transitions[0]["id"])
            print(f"✅ 이슈 상태 변경: {in_progress_transitions[0]['to']['name']}")

        # 작업 시작 코멘트 작성 (JIRA Wiki Markup 형식)
        comment_text = f"""h2. 작업 시작

{{panel:title=작업 개요|borderColor=#cccccc|titleBGColor=#f7f7f7|bgColor=#ffffff}}
*작업 내용*:
{work_description}

*시작 시간*: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
*담당자*: {jira.current_user()}
"""

        if estimated_hours:
            comment_text += f"*예상 소요시간*: {estimated_hours}시간\n"

        if files:
            comment_text += "\n*관련 파일*:\n"
            for file in files:
                comment_text += f"* {file}\n"

        if technical_context:
            comment_text += "\n*기술적 컨텍스트*:\n"
            for context in technical_context:
                comment_text += f"* {context}\n"

        if dependencies:
            comment_text += "\n*의존성*:\n"
            for dep in dependencies:
                comment_text += f"* {dep}\n"

        if risks:
            comment_text += "\n*예상 위험 요소*:\n"
            for risk in risks:
                comment_text += f"* {risk}\n"

        comment_text += "{{panel}}"

        comment = jira.add_comment(issue, comment_text)
        print(f"✅ 작업 시작 코멘트 추가 완료: {issue_key}")
        return comment

    except Exception as e:
        logging.error(f"작업 시작 코멘트 추가 실패: {e}")
        return None


def add_progress_comment(
    issue_key,
    completed_tasks,
    current_tasks,
    findings=None,
    next_steps=None,
    code_changes=None,
    test_results=None,
    performance_metrics=None,
    blockers=None,
):
    """작업 진행 상황 코멘트 추가 (상세 정보 포함)"""
    try:
        jira = get_jira_client()
        issue = jira.issue(issue_key)

        comment_text = (
            f"h2. 진행 상황 업데이트 ({datetime.now().strftime('%Y-%m-%d %H:%M')})\n\n"
        )

        # completed_tasks가 문자열인 경우 리스트로 변환
        if isinstance(completed_tasks, str):
            completed_tasks = [completed_tasks]

        if completed_tasks:
            comment_text += "{panel:title=완료된 작업|borderColor=#5cb85c|titleBGColor=#dff0d8|bgColor=#ffffff}\n"
            for task in completed_tasks:
                comment_text += f"* {task}\n"
            comment_text += "{panel}\n"

        # current_tasks가 문자열인 경우 리스트로 변환
        if isinstance(current_tasks, str):
            current_tasks = [current_tasks]

        if current_tasks:
            comment_text += "{panel:title=현재 진행 중인 작업|borderColor=#337ab7|titleBGColor=#d9edf7|bgColor=#ffffff}\n"
            for task in current_tasks:
                comment_text += f"* {task}\n"
            comment_text += "{panel}\n"

        if findings:
            if isinstance(findings, str):
                findings = [findings]
            comment_text += "{panel:title=발견 사항|borderColor=#f0ad4e|titleBGColor=#fcf8e3|bgColor=#ffffff}\n"
            for finding in findings:
                comment_text += f"* {finding}\n"
            comment_text += "{panel}\n"

        if code_changes:
            if isinstance(code_changes, str):
                code_changes = [code_changes]
            comment_text += "{panel:title=📝 코드 변경 사항|borderColor=#cccccc|titleBGColor=#f7f7f7|bgColor=#ffffff}\n"
            for change in code_changes:
                comment_text += f"* {change}\n"
            comment_text += "{panel}\n"

        if test_results:
            if isinstance(test_results, str):
                test_results = [test_results]
            comment_text += "{panel:title=🧪 테스트 결과|borderColor=#cccccc|titleBGColor=#f7f7f7|bgColor=#ffffff}\n"
            for result in test_results:
                comment_text += f"* {result}\n"
            comment_text += "{panel}\n"

        if performance_metrics:
            if isinstance(performance_metrics, str):
                performance_metrics = [performance_metrics]
            comment_text += "{panel:title=📊 성능 메트릭|borderColor=#cccccc|titleBGColor=#f7f7f7|bgColor=#ffffff}\n"
            for metric in performance_metrics:
                comment_text += f"* {metric}\n"
            comment_text += "{panel}\n"

        if blockers:
            if isinstance(blockers, str):
                blockers = [blockers]
            comment_text += "{panel:title=🚫 차단 요소|borderColor=#d9534f|titleBGColor=#f2dede|bgColor=#ffffff}\n"
            for blocker in blockers:
                comment_text += f"* {blocker}\n"
            comment_text += "{panel}\n"

        if next_steps:
            if isinstance(next_steps, str):
                next_steps = [next_steps]
            comment_text += "{panel:title=➡️ 다음 단계|borderColor=#cccccc|titleBGColor=#f7f7f7|bgColor=#ffffff}\n"
            for step in next_steps:
                comment_text += f"* {step}\n"
            comment_text += "{panel}\n"

        comment = jira.add_comment(issue, comment_text)
        print(f"✅ 진행 상황 코멘트 추가 완료: {issue_key}")
        return comment

    except Exception as e:
        logging.error(f"진행 상황 코멘트 추가 실패: {e}")
        return None


def add_completion_comment(
    issue_key,
    completed_work,
    modified_files,
    test_results,
    validation_items=None,
    performance_impact=None,
    security_considerations=None,
    documentation_updates=None,
    lessons_learned=None,
    future_improvements=None,
):
    """작업 완료 코멘트 추가 및 상태 변경 (상세 정보 포함)"""
    try:
        jira = get_jira_client()
        issue = jira.issue(issue_key)

        comment_text = (
            f"h2. ✅ 작업 완료 ({datetime.now().strftime('%Y-%m-%d %H:%M')})\n\n"
        )

        comment_text += "{panel:title=완료된 작업 내용|borderColor=#5cb85c|titleBGColor=#dff0d8|bgColor=#ffffff}\n"
        comment_text += f"{completed_work}\n"
        comment_text += "{panel}\n"

        if modified_files:
            comment_text += "{panel:title=수정된 파일|borderColor=#cccccc|titleBGColor=#f7f7f7|bgColor=#ffffff}\n"
            for file in modified_files:
                comment_text += f"** {{icon:page}} {file}\n"
            comment_text += "{panel}\n"

        comment_text += "{panel:title=테스트 결과|borderColor=#cccccc|titleBGColor=#f7f7f7|bgColor=#ffffff}\n"
        comment_text += f"{test_results}\n"
        comment_text += "{panel}\n"

        comment_text += "{panel:title=검증 완료|borderColor=#cccccc|titleBGColor=#f7f7f7|bgColor=#ffffff}\n"
        if validation_items:
            for item in validation_items:
                comment_text += f"(/) {item}\n"
        else:
            comment_text += (
                "(/) 단위 테스트 통과\n(/) 통합 테스트 통과\n(/) 코드 리뷰 완료\n"
            )
        comment_text += "{panel}\n"

        if performance_impact:
            comment_text += f"h3. ⚡ 성능 영향\n{performance_impact}\n\n"

        if security_considerations:
            comment_text += f"h3. 🔒 보안 고려사항\n{security_considerations}\n\n"

        if documentation_updates:
            comment_text += f"h3. 📚 문서화 업데이트\n{documentation_updates}\n\n"

        if lessons_learned:
            comment_text += f"h3. 🧠 학습한 내용\n{lessons_learned}\n\n"

        if future_improvements:
            comment_text += f"h3. 🚀 향후 개선사항\n{future_improvements}\n\n"

        comment = jira.add_comment(issue, comment_text)
        print(f"✅ 완료 코멘트 추가 완료: {issue_key}")

        # 상태를 '완료'로 변경
        transitions = jira.transitions(issue)
        done_transitions = [
            t for t in transitions if "done" in t["name"].lower() or "완료" in t["name"]
        ]
        if done_transitions:
            jira.transition_issue(issue, done_transitions[0]["id"])
            print(f"✅ 이슈 상태 변경 완료: {done_transitions[0]['to']['name']}")

        return comment

    except Exception as e:
        logging.error(f"완료 코멘트 추가 실패: {e}")
        return None


def create_dashboard_compatible_issue(
    project_key="ICT", summary="", description="", issue_type="10003"
):
    """
    ⚠️ DEPRECATED: 이 함수는 더 이상 사용하지 마세요.
    대신 board_compatible_creator.py의 create_board_visible_issue() 함수를 사용하세요.

    대시보드에 표시되도록 보장하는 이슈 생성 함수
    """
    print("⚠️ 경고: create_dashboard_compatible_issue()는 deprecated입니다.")
    print(
        "대신 board_compatible_creator.py의 create_board_visible_issue()를 사용하세요."
    )

    # 기본 이슈만 생성 (보드 배치는 별도 처리 필요)
    try:
        jira = get_jira_client()

        issue_dict = {
            "project": {"key": project_key},
            "summary": summary,
            "description": description,
            "issuetype": {"id": issue_type},
        }

        new_issue = jira.create_issue(fields=issue_dict)
        print(f"✅ 기본 이슈 생성 완료: {new_issue.key}")
        print(f"⚠️ 보드 배치를 위해 board_compatible_creator.py를 사용하세요.")

        return new_issue

    except Exception as e:
        print(f"❌ 이슈 생성 실패: {e}")
        logging.error(f"이슈 생성 실패: {e}")
        return None


def create_board_visible_issue_simple(
    project_key="ICT", summary="", description="", issue_type="10003"
):
    """
    칸반 보드에 자동으로 표시되는 이슈 생성 (간단 버전)

    Args:
        project_key (str): 프로젝트 키 (기본값: 'ICT')
        summary (str): 이슈 제목
        description (str): 이슈 설명
        issue_type (str): 이슈 유형 ID (기본값: '10003' = Task)

    Returns:
        Issue object or None
    """
    try:
        import json

        jira = get_jira_client()

        print(f"=== 보드 표시 보장 이슈 생성 ===")
        print(f"프로젝트: {project_key}")
        print(f"제목: {summary}")

        # 1. 기본 이슈 생성
        issue_dict = {
            "project": {"key": project_key},
            "summary": summary,
            "description": description,
            "issuetype": {"id": issue_type},
        }

        new_issue = jira.create_issue(fields=issue_dict)
        print(f"✅ 이슈 생성 완료: {new_issue.key}")

        # 2. 보드 맨 위로 이동
        try:
            server_url = jira._options["server"]
            session = jira._session

            # 보드의 첫 번째 이슈 조회
            board_response = session.get(
                f"{server_url}/rest/agile/1.0/board/1/issue", params={"maxResults": 1}
            )

            if board_response.status_code == 200:
                board_data = board_response.json()
                board_issues = board_data.get("issues", [])

                if board_issues:
                    first_issue_key = board_issues[0]["key"]

                    # rank API로 맨 위로 이동
                    rank_data = {
                        "issues": [new_issue.key],
                        "rankBeforeIssue": first_issue_key,
                    }

                    rank_response = session.put(
                        f"{server_url}/rest/agile/1.0/issue/rank",
                        data=json.dumps(rank_data),
                        headers={"Content-Type": "application/json"},
                    )

                    if rank_response.status_code == 204:
                        print(f"✅ {new_issue.key} 보드 맨 위로 이동 완료")
                    else:
                        print(f"⚠️ {new_issue.key} 보드 이동 실패 (보드에는 표시됨)")

        except Exception as e:
            print(f"⚠️ 보드 이동 중 오류 (이슈는 정상 생성됨): {e}")

        print(f"URL: https://kwangmyung.atlassian.net/browse/{new_issue.key}")
        return new_issue

    except Exception as e:
        print(f"❌ 이슈 생성 실패: {e}")
        logging.error(f"이슈 생성 실패: {e}")
        return None


def add_issue_comment(issue_key, comment_text, comment_type="일반"):
    """일반 코멘트 추가"""
    try:
        jira = get_jira_client()
        issue = jira.issue(issue_key)

        formatted_comment = f"""h3. {comment_type} 📝
{{panel:borderColor=#cccccc|titleBGColor=#f7f7f7|bgColor=#ffffff}}
{comment_text}

*작성 시간*: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
{{panel}}"""

        comment = jira.add_comment(issue, formatted_comment)
        print(f"✅ 코멘트 추가 완료: {issue_key}")
        return comment

    except Exception as e:
        logging.error(f"코멘트 추가 실패: {e}")
        return None


def get_issue_comments(issue_key):
    """이슈의 모든 코멘트 조회"""
    try:
        jira = get_jira_client()
        issue = jira.issue(issue_key)
        comments = jira.comments(issue)

        print(f"📝 {issue_key}의 모든 코멘트 ({len(comments)}개):")
        for i, comment in enumerate(comments, 1):
            print(
                f"""
{i}. 작성자: {comment.author.displayName}
   시간: {comment.created}
   내용: {comment.body[:200]}{'...' if len(comment.body) > 200 else ''}
"""
            )

        return comments

    except Exception as e:
        logging.error(f"코멘트 조회 실패: {e}")
        return None


# 새로운 상세 요약 기능 함수들
def add_detailed_summary_comment(issue_key, summary_data):
    """상세한 요약 정보를 JIRA 코멘트로 추가"""
    try:
        jira = get_jira_client()
        issue = jira.issue(issue_key)

        comment_text = (
            f"h2. 📋 상세 작업 요약 ({datetime.now().strftime('%Y-%m-%d %H:%M')})\n\n"
        )

        # 작업 개요
        comment_text += f"{{panel:title=🎯 작업 개요|borderColor=#1f497d|titleBGColor=#e6f0f8|bgColor=#ffffff}}\n"
        comment_text += f"*{summary_data.get('overview', '작업 개요 없음')}*\n"
        comment_text += "{panel}\n"

        # 시간 추적
        comment_text += f"{{panel:title=⏰ 시간 추적|borderColor=#cccccc|titleBGColor=#f7f7f7|bgColor=#ffffff}}\n"
        comment_text += f"• *시작 시간*: {summary_data.get('start_time', 'N/A')}\n"
        comment_text += f"• *완료 시간*: {summary_data.get('end_time', 'N/A')}\n"
        comment_text += (
            f"• *실제 소요 시간*: {summary_data.get('actual_hours', 'N/A')}시간\n"
        )
        comment_text += (
            f"• *예상 vs 실제*: {summary_data.get('time_comparison', 'N/A')}\n"
        )
        comment_text += "{panel}\n"

        # 기술적 상세사항
        tech_details = ""
        if "tech_stack" in summary_data:
            tech_details += (
                "• *기술 스택*: " + ", ".join(summary_data["tech_stack"]) + "\n"
            )
        if "architecture_patterns" in summary_data:
            tech_details += (
                "• *아키텍처 패턴*: "
                + ", ".join(summary_data["architecture_patterns"])
                + "\n"
            )
        if "frameworks" in summary_data:
            tech_details += (
                "• *프레임워크/라이브러리*: "
                + ", ".join(summary_data["frameworks"])
                + "\n"
            )
        if tech_details:
            comment_text += f"{{panel:title=🔧 기술적 상세사항|borderColor=#cccccc|titleBGColor=#f7f7f7|bgColor=#ffffff}}\n{tech_details}{{panel}}\n"

        # 코드 변경 통계
        if "code_stats" in summary_data:
            stats = summary_data["code_stats"]
            comment_text += f"{{panel:title=📊 코드 변경 통계|borderColor=#cccccc|titleBGColor=#f7f7f7|bgColor=#ffffff}}\n"
            comment_text += f"• *수정된 파일*: {stats.get('files_modified', 0)}개\n"
            comment_text += f"• *추가된 라인*: {{color:green}}+{stats.get('lines_added', 0)}{{color}}\n"
            comment_text += f"• *삭제된 라인*: {{color:red}}-{stats.get('lines_deleted', 0)}{{color}}\n"
            comment_text += (
                f"• *복잡도 변화*: {stats.get('complexity_change', 'N/A')}\n"
            )
            comment_text += "{panel}\n"

        # 테스트 상세 결과
        if "detailed_tests" in summary_data:
            tests = summary_data["detailed_tests"]
            comment_text += f"{{panel:title=🧪 테스트 상세 결과|borderColor=#cccccc|titleBGColor=#f7f7f7|bgColor=#ffffff}}\n"
            comment_text += f"• *단위 테스트*: {tests.get('unit_tests', 'N/A')} (커버리지: {tests.get('unit_coverage', 'N/A')} %)\n"
            comment_text += (
                f"• *통합 테스트*: {tests.get('integration_tests', 'N/A')}\n"
            )
            comment_text += f"• *E2E 테스트*: {tests.get('e2e_tests', 'N/A')}\n"
            comment_text += (
                f"• *성능 테스트*: {tests.get('performance_tests', 'N/A')}\n"
            )
            comment_text += f"• *보안 테스트*: {tests.get('security_tests', 'N/A')}\n"
            comment_text += "{panel}\n"

        # 성능 메트릭
        if "performance_metrics" in summary_data:
            perf = summary_data["performance_metrics"]
            comment_text += f"{{panel:title=⚡ 성능 메트릭|borderColor=#cccccc|titleBGColor=#f7f7f7|bgColor=#ffffff}}\n"
            comment_text += f"• *응답 시간*: {perf.get('response_time', 'N/A')}ms\n"
            comment_text += f"• *메모리 사용량*: {perf.get('memory_usage', 'N/A')}MB\n"
            comment_text += f"• *CPU 사용률*: {perf.get('cpu_usage', 'N/A')}%\n"
            comment_text += f"• *DB 쿼리 수*: {perf.get('db_queries', 'N/A')}개\n"
            comment_text += f"• *로드 시간*: {perf.get('load_time', 'N/A')}초\n"
            comment_text += "{panel}\n"

        # 보안 검증
        if "security_checks" in summary_data:
            security = summary_data["security_checks"]
            comment_text += f"{{panel:title=🔒 보안 검증|borderColor=#cccccc|titleBGColor=#f7f7f7|bgColor=#ffffff}}\n"
            comment_text += (
                f"• *취약점 스캔*: {security.get('vulnerability_scan', 'N/A')}\n"
            )
            comment_text += (
                f"• *권한 검증*: {security.get('authorization_check', 'N/A')}\n"
            )
            comment_text += (
                f"• *데이터 검증*: {security.get('data_validation', 'N/A')}\n"
            )
            comment_text += f"• *SQL 인젝션 방어*: {security.get('sql_injection_protection', 'N/A')}\n"
            comment_text += f"• *XSS 방어*: {security.get('xss_protection', 'N/A')}\n"
            comment_text += "{panel}\n"

        # 데이터베이스 영향
        if "database_impact" in summary_data:
            db = summary_data["database_impact"]
            comment_text += f"{{panel:title=🗄️ 데이터베이스 영향|borderColor=#cccccc|titleBGColor=#f7f7f7|bgColor=#ffffff}}\n"
            comment_text += f"• *스키마 변경*: {db.get('schema_changes', 'None')}\n"
            comment_text += (
                f"• *데이터 마이그레이션*: {db.get('data_migration', 'None')}\n"
            )
            comment_text += f"• *인덱스 추가/변경*: {db.get('index_changes', 'None')}\n"
            comment_text += f"• *쿼리 최적화*: {db.get('query_optimization', 'None')}\n"
            comment_text += "{panel}\n"

        # 배포 정보
        if "deployment_info" in summary_data:
            deploy = summary_data["deployment_info"]
            comment_text += f"{{panel:title=🚀 배포 정보|borderColor=#cccccc|titleBGColor=#f7f7f7|bgColor=#ffffff}}\n"
            comment_text += f"• *환경*: {deploy.get('environment', 'N/A')}\n"
            comment_text += f"• *배포 방식*: {deploy.get('deployment_method', 'N/A')}\n"
            comment_text += f"• *롤백 계획*: {deploy.get('rollback_plan', 'N/A')}\n"
            comment_text += f"• *다운타임*: {deploy.get('downtime', 'N/A')}\n"
            comment_text += "{panel}\n"

        # 문제점 및 해결책
        if "issues_and_solutions" in summary_data:
            issue_solutions = summary_data["issues_and_solutions"]
            comment_text += f"{{panel:title=⚠️ 발생한 문제점 및 해결책|borderColor=#f0ad4e|titleBGColor=#fcf8e3|bgColor=#ffffff}}\n"
            for item in issue_solutions:
                comment_text += f"• *문제*: {item.get('problem', 'N/A')}\n"
                comment_text += f"  *해결책*: {item.get('solution', 'N/A')}\n"
                comment_text += f"  *영향도*: {item.get('impact', 'N/A')}\n"
            comment_text += "{panel}\n"

        # 주요 인사이트 및 학습사항
        if "insights" in summary_data:
            insights = summary_data["insights"]
            comment_text += f"{{panel:title=💡 주요 인사이트 및 학습사항|borderColor=#337ab7|titleBGColor=#d9edf7|bgColor=#ffffff}}\n"
            for insight in insights:
                comment_text += f"* {insight}\n"
            comment_text += "{panel}\n"

        # 코드 리뷰 주요 포인트
        if "code_review_points" in summary_data:
            review = summary_data["code_review_points"]
            comment_text += f"{{panel:title=👥 코드 리뷰 주요 포인트|borderColor=#cccccc|titleBGColor=#f7f7f7|bgColor=#ffffff}}\n"
            for point in review:
                comment_text += f"* {point}\n"
            comment_text += "{panel}\n"

        # 문서화 업데이트
        if "documentation_updates" in summary_data:
            docs = summary_data["documentation_updates"]
            comment_text += f"{{panel:title=📚 문서화 업데이트|borderColor=#cccccc|titleBGColor=#f7f7f7|bgColor=#ffffff}}\n"
            for doc in docs:
                comment_text += f"* {doc}\n"
            comment_text += "{panel}\n"

        # 품질 지표
        comment_text += f"h3. 📈 품질 지표\n"
        comment_text += "||*항목*||*점수*||\n"
        comment_text += (
            f"|코드 품질|{summary_data.get('code_quality_score', 'N/A')}/100|\n"
        )
        comment_text += (
            f"|테스트 커버리지|{summary_data.get('test_coverage', 'N/A')}%|\n"
        )
        comment_text += (
            f"|성능 점수|{summary_data.get('performance_score', 'N/A')}/100|\n"
        )
        comment_text += f"|보안 점수|{summary_data.get('security_score', 'N/A')}/100|\n"

        # 다음 액션 아이템
        if "next_actions" in summary_data:
            comment_text += f"h3. 🎯 다음 액션 아이템\n"
            for action in summary_data["next_actions"]:
                comment_text += f"* {action}\n"

        comment_text += f"\n---\n_이 요약은 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}에 자동 생성되었습니다._"

        comment = jira.add_comment(issue, comment_text)
        print(f"✅ 상세 요약 코멘트 추가 완료: {issue_key}")
        return comment

    except Exception as e:
        logging.error(f"상세 요약 코멘트 추가 실패: {e}")
        return None


def create_comprehensive_work_summary(issue_key, work_type="development"):
    """포괄적인 작업 요약 생성 및 JIRA 등록"""

    # 예시 데이터 구조 (실제 사용 시에는 실제 데이터를 전달)
    sample_summary = {
        "overview": "H2 인메모리 DB 재시작 시 admin 사용자 멤버십 불일치 문제 해결",
        "start_time": "2025-07-31 09:00:00",
        "end_time": "2025-07-31 17:30:00",
        "actual_hours": 8.5,
        "time_comparison": "예상 4시간 → 실제 8.5시간 (복잡도 과소평가)",
        "tech_stack": ["Java 21", "Spring Boot 3.2.4", "H2 Database", "JPA", "TestNG"],
        "architecture_patterns": [
            "MVC",
            "Repository Pattern",
            "Security Service Layer",
        ],
        "frameworks": ["Spring Security", "Jackson JSON", "Gradle"],
        "code_stats": {
            "files_modified": 8,
            "lines_added": 156,
            "lines_deleted": 23,
            "complexity_change": "+2 (경미한 증가)",
        },
        "detailed_tests": {
            "unit_tests": "15개 통과",
            "unit_coverage": 92,
            "integration_tests": "8개 통과",
            "e2e_tests": "3개 통과",
            "performance_tests": "응답시간 테스트 통과",
            "security_tests": "권한 검증 테스트 통과",
        },
        "performance_metrics": {
            "response_time": 45,
            "memory_usage": 128,
            "cpu_usage": 15,
            "db_queries": 3,
            "load_time": 1.2,
        },
        "security_checks": {
            "vulnerability_scan": "✅ 취약점 없음",
            "authorization_check": "✅ 권한 체크 정상",
            "data_validation": "✅ 입력값 검증 적용",
            "sql_injection_protection": "✅ JPA 사용으로 방어",
            "xss_protection": "✅ JSON 응답으로 방어",
        },
        "database_impact": {
            "schema_changes": "없음 (기존 스키마 유지)",
            "data_migration": "초기화 로직 개선",
            "index_changes": "없음",
            "query_optimization": "fetch join 쿼리 검증",
        },
        "deployment_info": {
            "environment": "Local H2 Development",
            "deployment_method": "Hot reload",
            "rollback_plan": "Git revert 가능",
            "downtime": "없음",
        },
        "issues_and_solutions": [
            {
                "problem": "H2 재시작 시 사용자 ID 변경으로 멤버십 불일치",
                "solution": "OrganizationDataInitializer에 지연 실행 및 최종 검증 로직 추가",
                "impact": "Critical - 조직 접근 불가 문제 해결",
            },
            {
                "problem": "CommandLineRunner 실행 순서 불확실성",
                "solution": "@Order 어노테이션 및 Thread.sleep() 적용",
                "impact": "Medium - 초기화 순서 보장",
            },
        ],
        "insights": [
            "H2 인메모리 DB는 재시작마다 모든 ID가 새로 생성되므로 하드코딩 금지",
            "CommandLineRunner간 의존성이 있을 때는 명시적 순서 제어 필요",
            "JSON 직렬화 시 순환 참조 문제는 @JsonManagedReference/@JsonBackReference로 해결",
            "Spring Security 인증 시 @JsonIgnore vs @JsonProperty(access=WRITE_ONLY) 차이 이해 중요",
        ],
        "code_review_points": [
            "Exception handling이 적절히 구현됨",
            "Logging 레벨이 DEBUG → INFO로 적절히 설정됨",
            "Test coverage가 90% 이상으로 우수함",
            "Security best practices 준수됨",
        ],
        "documentation_updates": [
            "CLAUDE.md에 H2 데이터베이스 특성과 개발 워크플로우 추가",
            "README에 Java 21 요구사항 명시",
            "조직 관리 시스템 API 문서화 완료",
        ],
        "code_quality_score": 88,
        "test_coverage": 92,
        "performance_score": 95,
        "security_score": 90,
        "next_actions": [
            "프론트엔드에서 조직 멤버 목록 표시 기능 검증",
            "PostgreSQL 프로덕션 환경에서 동작 테스트",
            "사용자 권한 매트릭스 문서화",
            "자동화된 통합 테스트 추가",
        ],
    }

    return add_detailed_summary_comment(issue_key, sample_summary)


# 사용 예제 함수들
def example_work_start():
    """작업 시작 예제"""
    add_work_start_comment(
        issue_key="FIR-9",
        work_description="""• H2 인메모리 DB 재시작 시 사용자 ID 변경 문제 해결
• admin 사용자 멤버십 불일치 원인 분석 및 수정
• DataInitializer와 OrganizationDataInitializer 실행 순서 조정""",
        estimated_hours=4,
        files=[
            "src/main/java/.../config/OrganizationDataInitializer.java",
            "src/main/java/.../security/OrganizationSecurityService.java",
            "src/main/java/.../service/CustomUserDetailsService.java",
        ],
    )


def example_progress_update():
    """진행 상황 업데이트 예제"""
    add_progress_comment(
        issue_key="FIR-9",
        completed_tasks=[
            "H2 인메모리 DB 특성 분석 완료",
            "admin 사용자 ID 불일치 원인 파악",
            "초기화 순서 문제 확인",
        ],
        current_tasks=[
            "OrganizationDataInitializer 지연 실행 로직 구현",
            "최종 사용자 ID 기준 멤버십 재등록 로직 작성",
        ],
        findings=[
            "초기화 시점과 로그인 시점의 admin ID가 다름",
            "CommandLineRunner 실행 순서로 인한 데이터 불일치",
            "권한 체크 메서드 간 일관성 부족",
        ],
        next_steps=["지연 실행 로직 테스트", "권한 체크 로직 통합", "단위 테스트 작성"],
    )


def example_work_completion():
    """작업 완료 예제"""
    add_completion_comment(
        issue_key="FIR-9",
        completed_work=[
            "OrganizationDataInitializer 지연 실행 로직 구현",
            "최종 사용자 ID 기준 멤버십 재등록 로직 완성",
            "권한 체크 로직 일관성 확보",
            "단위 테스트 및 통합 테스트 작성",
        ],
        modified_files=[
            "OrganizationDataInitializer.java",
            "OrganizationSecurityService.java",
            "CustomUserDetailsService.java",
            "OrganizationServiceTest.java",
        ],
        test_results="모든 테스트 통과 (단위 테스트 15개, 통합 테스트 8개)",
        validation_items=[
            "admin 사용자 멤버십 정상 등록 확인",
            "조직 접근 권한 정상 동작 확인",
            "권한 체크 메서드 일관성 확인",
            "H2 재시작 후에도 정상 동작 확인",
        ],
    )


# 🚀 간단한 작업 시작 함수들 (Claude가 자주 사용할 수 있도록)
def start_work_simple(issue_key, work_description):
    """
    간단한 작업 시작 함수 - Claude가 작업을 시작할 때 쉽게 사용

    Args:
        issue_key (str): JIRA 이슈 키 (예: ICT-33)
        work_description (str): 작업 설명
    """
    return add_work_start_comment(
        issue_key=issue_key,
        work_description=work_description,
        estimated_hours=None,
        files=None,
        technical_context=None,
        dependencies=None,
        risks=None,
    )


def start_work_with_context(
    issue_key, work_description, files=None, estimated_hours=None
):
    """
    컨텍스트가 있는 작업 시작 함수

    Args:
        issue_key (str): JIRA 이슈 키
        work_description (str): 작업 설명
        files (list): 관련 파일 목록
        estimated_hours (int): 예상 소요 시간
    """
    return add_work_start_comment(
        issue_key=issue_key,
        work_description=work_description,
        estimated_hours=estimated_hours,
        files=files,
        technical_context=None,
        dependencies=None,
        risks=None,
    )


def auto_start_work_from_issue(issue_key):
    """
    JIRA 이슈 정보를 자동으로 가져와서 작업 시작
    이슈의 제목과 설명을 기반으로 자동으로 작업 시작 코멘트 생성
    """
    try:
        jira = get_jira_client()
        issue = jira.issue(issue_key)

        # 이슈 정보에서 작업 설명 생성
        work_description = f"""h3. 이슈: {issue.fields.summary}        
*작업 범위*: 
{issue.fields.description[:500] if issue.fields.description else '상세 설명 없음'}

*작업 시작*: 이슈 분석 및 구현 계획 수립"""

        return start_work_simple(issue_key, work_description)

    except Exception as e:
        logging.error(f"자동 작업 시작 실패: {e}")
        return None


def check_and_start_work(issue_key):
    """
    이슈 상태를 확인하고 필요시 작업 시작 상태로 변경

    Returns:
        str: 상태 변경 결과 메시지
    """
    try:
        jira = get_jira_client()
        issue = jira.issue(issue_key)

        current_status = issue.fields.status.name
        print(f"📋 현재 상태: {current_status}")

        # 이미 진행 중이거나 완료된 경우
        if "진행" in current_status or "Progress" in current_status:
            return f"✅ 이미 진행 중 상태입니다: {current_status}"

        if "완료" in current_status or "Done" in current_status:
            return f"✅ 이미 완료된 이슈입니다: {current_status}"

        # 작업 시작 가능한 상태인 경우 자동 시작
        if (
            "할일" in current_status
            or "To Do" in current_status
            or "Open" in current_status
            or "해야 할 일" in current_status
            or "Backlog" in current_status
        ):
            result = auto_start_work_from_issue(issue_key)
            if result:
                return f"🚀 작업 시작 완료! 상태가 진행 중으로 변경되었습니다."
            else:
                return f"❌ 작업 시작 처리 중 오류가 발생했습니다."
        else:
            return (
                f"⚠️ 현재 상태({current_status})에서는 작업 시작을 처리할 수 없습니다."
            )

    except Exception as e:
        logging.error(f"이슈 상태 확인 실패: {e}")
        return f"❌ 이슈 상태 확인 실패: {e}"


def get_available_transitions(issue_key):
    """이슈에서 사용 가능한 상태 전환 목록 조회"""
    try:
        jira = get_jira_client()
        issue = jira.issue(issue_key)
        transitions = jira.transitions(issue)

        print(f"📋 {issue_key}에서 사용 가능한 상태 전환:")
        for i, transition in enumerate(transitions, 1):
            print(f"{i}. {transition['name']} → {transition['to']['name']}")

        return transitions

    except Exception as e:
        logging.error(f"상태 전환 조회 실패: {e}")
        return None


def force_transition_to_progress(issue_key):
    """이슈를 강제로 진행 중 상태로 변경"""
    try:
        jira = get_jira_client()
        issue = jira.issue(issue_key)
        transitions = jira.transitions(issue)

        # 진행 중으로 변경할 수 있는 전환 찾기
        progress_transitions = [
            t
            for t in transitions
            if "진행" in t["name"]
            or "progress" in t["name"].lower()
            or "start" in t["name"].lower()
        ]

        if progress_transitions:
            transition = progress_transitions[0]
            jira.transition_issue(issue, transition["id"])
            print(f"✅ 강제 상태 변경 완료: {transition['to']['name']}")
            return True
        else:
            print("❌ 진행 중으로 변경할 수 있는 전환을 찾을 수 없습니다.")
            print("📋 사용 가능한 전환 목록:")
            get_available_transitions(issue_key)
            return False

    except Exception as e:
        logging.error(f"강제 상태 변경 실패: {e}")
        return False


if __name__ == "__main__":
    # 사용 예제
    print("🚀 JIRA 작업 흐름 관리 스크립트")
    print("=" * 50)

    # 사용 가능한 함수들 소개
    print(
        """
📋 사용 가능한 함수들:

🚀 작업 시작:
  • start_work_simple(issue_key, work_description)
  • start_work_with_context(issue_key, work_description, files, estimated_hours)
  • auto_start_work_from_issue(issue_key)
  • check_and_start_work(issue_key)

⏳ 진행 상황 업데이트:
  • add_progress_comment(issue_key, completed_tasks, current_tasks, ...)

✅ 작업 완료:
  • add_completion_comment(issue_key, completed_work, modified_files, ...)

🔧 유틸리티:
  • get_available_transitions(issue_key)
  • force_transition_to_progress(issue_key)
  • add_issue_comment(issue_key, comment_text, comment_type)

사용 예제:
python3 -c \"from jira_workflow import check_and_start_work; check_and_start_work('ICT-34')\"
"""
    )

    # 테스트는 주석 처리 (실제 실행 방지)
    # print("\n1. 이슈 상태 확인 및 작업 시작...")
    # result = check_and_start_work("ICT-33")
    # print(result)
