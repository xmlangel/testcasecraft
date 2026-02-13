#!/usr/bin/env python3
"""
개선된 JIRA 이슈 생성 도구
Priority 필드 문제 해결 및 환경변수 기반 URL 사용
"""

import sys
import os
from jira_caller import get_jira_client, JIRA_SERVER
from jira_workflow import add_work_start_comment

def get_valid_issue_types():
    """ICT 프로젝트에서 사용 가능한 이슈 타입 조회"""
    try:
        jira = get_jira_client()
        create_meta = jira.createmeta(projectKeys='ICT', expand='projects.issuetypes.fields')
        
        if create_meta and 'projects' in create_meta and create_meta['projects']:
            project_meta = create_meta['projects'][0]
            return [(issue_type['id'], issue_type['name']) for issue_type in project_meta['issuetypes']]
        return []
    except Exception as e:
        print(f'❌ 이슈 타입 조회 실패: {str(e)}')
        return []

def create_issue_safe(issue_data, work_start_data=None):
    """
    안전한 JIRA 이슈 생성 함수
    
    Args:
        issue_data (dict): 이슈 생성 데이터
        work_start_data (dict, optional): 작업 시작 코멘트 데이터
            - work_description: 작업 설명
            - estimated_hours: 예상 작업 시간
            - files: 관련 파일 목록
            - technical_context: 기술적 컨텍스트
            - dependencies: 의존성
            - risks: 위험 요소
    
    Returns:
        str: 생성된 이슈 키 또는 None
    """
    try:
        print('=== JIRA 이슈 생성 시작 ===')
        jira = get_jira_client()
        
        # 사용 가능한 이슈 타입 확인
        valid_types = get_valid_issue_types()
        if not valid_types:
            print('❌ 사용 가능한 이슈 타입을 가져올 수 없습니다.')
            return None
            
        print(f"📋 ICT 프로젝트 사용 가능한 이슈 타입:")
        for type_id, type_name in valid_types:
            print(f"  - {type_name} (ID: {type_id})")
        
        # 이슈 생성 데이터 검증
        if 'issuetype' not in issue_data:
            # 기본값으로 첫 번째 사용 가능한 이슈 타입 사용
            issue_data['issuetype'] = {'id': valid_types[0][0]}
            print(f"⚠️ 이슈 타입이 지정되지 않아 기본값 사용: {valid_types[0][1]} (ID: {valid_types[0][0]})")
        
        # Priority 필드 제거 (JIRA 설정 문제로 인해)
        if 'priority' in issue_data:
            del issue_data['priority']
            print("⚠️ Priority 필드가 제거되었습니다 (JIRA 설정 문제)")
        
        # 이슈 생성
        new_issue = jira.create_issue(fields=issue_data)
        print(f'✅ JIRA 이슈 생성 성공: {new_issue.key}')
        print(f'이슈 URL: {JIRA_SERVER}/browse/{new_issue.key}')
        
        # 작업 시작 코멘트 추가 (선택사항)
        if work_start_data:
            add_work_start_comment(
                issue_key=new_issue.key,
                work_description=work_start_data.get('work_description', ''),
                estimated_hours=work_start_data.get('estimated_hours'),
                files=work_start_data.get('files'),
                technical_context=work_start_data.get('technical_context'),
                dependencies=work_start_data.get('dependencies'),
                risks=work_start_data.get('risks')
            )
        
        # 생성된 이슈 정보 출력
        print(f'')
        print(f'📋 생성된 이슈 정보:')
        print(f'  - 이슈 키: {new_issue.key}')
        print(f'  - 타입: {[name for type_id, name in valid_types if type_id == issue_data["issuetype"]["id"]][0]}')
        print(f'  - 제목: {issue_data["summary"]}')
        if work_start_data and work_start_data.get('estimated_hours'):
            print(f'  - 예상 작업 시간: {work_start_data["estimated_hours"]}시간')
        if work_start_data and work_start_data.get('files'):
            print(f'  - 관련 파일: {len(work_start_data["files"])}개')
        
        return new_issue.key
        
    except Exception as e:
        print(f'❌ JIRA 이슈 생성 실패: {str(e)}')
        return None

def create_feature_issue(title, description, estimated_hours=None, related_files=None):
    """
    기능 구현용 이슈 생성 헬퍼 함수
    
    Args:
        title (str): 이슈 제목
        description (str): 이슈 설명
        estimated_hours (int, optional): 예상 작업 시간
        related_files (list, optional): 관련 파일 목록
    
    Returns:
        str: 생성된 이슈 키 또는 None
    """
    issue_data = {
        'project': {'key': 'ICT'},
        'summary': title,
        'description': description,
        'issuetype': {'id': '10003'}  # 작업 타입 (ICT 프로젝트)
    }
    
    work_start_data = None
    if estimated_hours or related_files:
        work_start_data = {
            'work_description': f'{title} 구현 작업',
            'estimated_hours': estimated_hours,
            'files': related_files,
            'technical_context': [
                '기존 시스템과의 호환성 유지',
                '사용자 경험 개선',
                '성능 최적화 고려'
            ],
            'dependencies': [
                '기존 컴포넌트와 연동',
                'Material-UI 컴포넌트 활용',
                'Spring Boot API 연동'
            ],
            'risks': [
                '호환성 문제 가능성',
                '성능 저하 위험',
                '사용자 혼란 가능성'
            ]
        }
    
    return create_issue_safe(issue_data, work_start_data)

def create_bug_issue(title, description, reproduction_steps=None):
    """
    버그 수정용 이슈 생성 헬퍼 함수
    
    Args:
        title (str): 이슈 제목
        description (str): 이슈 설명
        reproduction_steps (list, optional): 재현 단계
    
    Returns:
        str: 생성된 이슈 키 또는 None
    """
    bug_description = description
    if reproduction_steps:
        bug_description += "\n\n## 🔄 재현 단계\n"
        for i, step in enumerate(reproduction_steps, 1):
            bug_description += f"{i}. {step}\n"
    
    issue_data = {
        'project': {'key': 'ICT'},
        'summary': title,
        'description': bug_description,
        'issuetype': {'id': '10040'}  # 버그 타입 (ICT 프로젝트)
    }
    
    work_start_data = {
        'work_description': f'{title} 버그 수정 작업',
        'technical_context': [
            '근본 원인 분석',
            '사이드 이펙트 검토',
            '회귀 테스트 수행'
        ],
        'dependencies': [
            '관련 컴포넌트 영향도 분석',
            '테스트 케이스 업데이트',
            '문서 업데이트'
        ],
        'risks': [
            '다른 기능에 영향 가능성',
            '데이터 손실 위험',
            '사용자 경험 저하'
        ]
    }
    
    return create_issue_safe(issue_data, work_start_data)

if __name__ == "__main__":
    # 사용 예시
    print("개선된 JIRA 이슈 생성 도구")
    print("사용 가능한 이슈 타입을 확인합니다...")
    types = get_valid_issue_types()
    for type_id, type_name in types:
        print(f"  - {type_name} (ID: {type_id})")