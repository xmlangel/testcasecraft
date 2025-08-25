#!/usr/bin/env python3
"""
JIRA 모듈 디버깅 스크립트
"""

import sys
import os
from pathlib import Path

def debug_jira_modules():
    """JIRA 모듈 로딩 상태 점검"""
    
    print("=== JIRA 모듈 디버깅 시작 ===")
    print(f"현재 작업 디렉토리: {os.getcwd()}")
    print(f"Python 버전: {sys.version}")
    
    # 경로 설정
    jira_dir = "./d_mcpsvr_jira"
    jira_path = Path(jira_dir)
    
    print(f"\n1. d_mcpsvr_jira 디렉토리 확인:")
    print(f"   경로: {jira_path.absolute()}")
    print(f"   존재: {jira_path.exists()}")
    
    if jira_path.exists():
        print(f"   주요 파일들:")
        for file in ['jira_caller.py', 'jira_workflow.py', '.env']:
            file_path = jira_path / file
            print(f"     {file}: {'✅' if file_path.exists() else '❌'}")
    
    # Python path 설정
    sys.path.insert(0, str(jira_path.absolute()))
    print(f"\n2. Python path에 추가: {str(jira_path.absolute())}")
    
    # 모듈 로딩 테스트
    print(f"\n3. 모듈 로딩 테스트:")
    
    try:
        import jira_caller
        print("   ✅ jira_caller 모듈 로딩 성공")
        
        # 함수 확인
        if hasattr(jira_caller, 'get_jira_client'):
            print("   ✅ get_jira_client 함수 확인")
        else:
            print("   ❌ get_jira_client 함수 없음")
            
    except Exception as e:
        print(f"   ❌ jira_caller 모듈 로딩 실패: {e}")
    
    try:
        import jira_workflow
        print("   ✅ jira_workflow 모듈 로딩 성공")
        
        # 함수 확인
        if hasattr(jira_workflow, 'add_issue_comment'):
            print("   ✅ add_issue_comment 함수 확인")
        else:
            print("   ❌ add_issue_comment 함수 없음")
            
    except Exception as e:
        print(f"   ❌ jira_workflow 모듈 로딩 실패: {e}")
    
    # JIRA 연결 테스트
    print(f"\n4. JIRA 연결 테스트:")
    try:
        from jira_caller import get_jira_client
        jira = get_jira_client()
        user = jira.current_user()
        print(f"   ✅ JIRA 연결 성공 - 사용자: {user}")
        
        # 간단한 이슈 조회 테스트 (존재하는 이슈로 테스트)
        try:
            test_issue = jira.issue('ICT-1')  # 첫 번째 이슈로 테스트
            print(f"   ✅ 이슈 조회 성공 - {test_issue.key}: {test_issue.fields.summary}")
        except:
            print(f"   ℹ️ ICT-1 이슈 조회 실패 (정상적일 수 있음)")
            
    except Exception as e:
        print(f"   ❌ JIRA 연결 실패: {e}")
    
    print(f"\n=== 디버깅 완료 ===")

if __name__ == "__main__":
    debug_jira_modules()