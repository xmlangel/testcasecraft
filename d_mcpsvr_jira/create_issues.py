#!/usr/bin/env python3
"""
JIRA 이슈 생성 스크립트 - 조직-프로젝트 관리 시스템
"""
import logging
from jira_caller import get_jira_client

def create_epic(title, description, project_key="ICT"):
    """Epic 이슈 생성"""
    try:
        jira = get_jira_client()
        
        issue_dict = {
            'project': {'key': project_key},
            'summary': title,
            'description': description,
            'issuetype': {'name': 'Epic'},
        }
        
        new_issue = jira.create_issue(fields=issue_dict)
        return new_issue
    except Exception as e:
        logging.error(f"Epic 생성 실패: {e}")
        return None

def create_story(title, description, epic_key=None, project_key="ICT", priority="High"):
    """Story 이슈 생성"""
    try:
        jira = get_jira_client()
        
        issue_dict = {
            'project': {'key': project_key},
            'summary': title,
            'description': description,
            'issuetype': {'name': 'Story'},
            'priority': {'name': priority}
        }
        
        # Epic 링크 추가 (Epic이 있는 경우)
        if epic_key:
            issue_dict['customfield_10014'] = epic_key  # Epic Link field
        
        new_issue = jira.create_issue(fields=issue_dict)
        return new_issue
    except Exception as e:
        logging.error(f"Story 생성 실패: {e}")
        return None

def create_bug(title, description, priority="Medium", project_key="ICT"):
    """Bug 이슈 생성"""
    try:
        jira = get_jira_client()
        
        issue_dict = {
            'project': {'key': project_key},
            'summary': title,
            'description': description,
            'issuetype': {'name': 'Bug'},
            'priority': {'name': priority}
        }
        
        new_issue = jira.create_issue(fields=issue_dict)
        return new_issue
    except Exception as e:
        logging.error(f"Bug 생성 실패: {e}")
        return None

def create_task(title, description, priority="Low", project_key="ICT"):
    """Task 이슈 생성"""
    try:
        jira = get_jira_client()
        
        issue_dict = {
            'project': {'key': project_key},
            'summary': title,
            'description': description,
            'issuetype': {'name': 'Task'},
            'priority': {'name': priority}
        }
        
        new_issue = jira.create_issue(fields=issue_dict)
        return new_issue
    except Exception as e:
        logging.error(f"Task 생성 실패: {e}")
        return None

def main():
    """메인 함수 - 조직-프로젝트 관리 시스템 이슈들 생성"""
    print("🎯 조직-프로젝트 관리 시스템 JIRA 이슈 생성 시작...")
    
    # Epic 1: 조직-프로젝트 데이터 모델 구현 (완료)
    epic1_desc = """조직, 프로젝트, 사용자, 그룹 간의 관계를 표현하는 데이터 모델 및 권한 체계 구현

**포함된 작업들**:
- Entity 클래스 생성 (Organization, Project, User, Group, AuditLog)
- User-Organization 관계 테이블 및 Entity 생성
- User-Project 관계 테이블 및 Entity 생성  
- Group-Member 관계 테이블 및 Entity 생성
- Repository 레이어 구현
- 권한 체계 구현 (SecurityService, 역할 기반 접근 제어)

**상태**: Done ✅
**스토리 포인트**: 21"""
    
    epic1 = create_epic("조직-프로젝트 데이터 모델 구현", epic1_desc)
    if epic1:
        print(f"✅ Epic 1 생성 완료: {epic1.key} - {epic1.fields.summary}")
    
    # Epic 2: 비즈니스 로직 및 API 구현 (완료)
    epic2_desc = """조직-프로젝트 관리를 위한 서비스 로직, API 엔드포인트, 테스트 구현

**포함된 작업들**:
- Service 레이어 권한 검증 로직 구현
- Controller 레이어 접근 제어 적용
- 감사 로그 구현
- 조직 관리 API (CRUD, 멤버 관리, 역할 변경)
- 프로젝트 관리 API (조직별/독립 프로젝트 관리)
- 그룹 관리 API (그룹 CRUD, 멤버 추가/제거)
- DTO 클래스 생성
- 단위 테스트 작성
- 통합 테스트 작성

**상태**: Done ✅
**스토리 포인트**: 34"""
    
    epic2 = create_epic("비즈니스 로직 및 API 구현", epic2_desc)
    if epic2:
        print(f"✅ Epic 2 생성 완료: {epic2.key} - {epic2.fields.summary}")
    
    # Epic 3: 프론트엔드 조직 관리 시스템 (완료)
    epic3_desc = """React 기반 조직-프로젝트 관리 사용자 인터페이스 구현

**포함된 작업들**:
- 테스트 데이터 초기화
- 프론트엔드 조직 관리 화면 구현
- 프론트엔드 프로젝트 관리 화면 구현  
- 프론트엔드 대시보드 구현
- API 문서화

**상태**: Done ✅
**스토리 포인트**: 21"""
    
    epic3 = create_epic("프론트엔드 조직 관리 시스템", epic3_desc)
    if epic3:
        print(f"✅ Epic 3 생성 완료: {epic3.key} - {epic3.fields.summary}")
    
    # Story 1: admin 사용자 멤버십 불일치 문제 해결 (Critical)
    story1_desc = """**문제 설명**:
- H2 인메모리 DB 재시작 시 사용자 ID가 변경됨
- 초기화 시점과 로그인 시점의 admin ID 불일치
- admin 사용자가 조직 멤버로 등록되지 않아 접근 권한 오류 발생

**수용 기준**:
- admin 사용자가 재시작 후에도 모든 조직에 정상적으로 멤버십 등록
- DataInitializer와 OrganizationDataInitializer 실행 순서 보장
- 최종 사용자 ID 기준으로 멤버십 재등록 로직 구현
- 권한 체크 로직 일관성 확보 (canAccessOrganization vs isOrganizationMember)

**기술적 세부사항**:
- 초기화 시점 admin ID: 0adcbfef-d7a7-4778-b946-5b60b801fa76
- 로그인 시점 admin ID: cad38eae-059d-4d7b-a827-d25d0068bc23
- OrganizationDataInitializer에서 지연 실행 및 최종 검증 로직 필요

**우선순위**: Critical
**스토리 포인트**: 8"""
    
    story1 = create_story("admin 사용자 멤버십 불일치 문제 해결", story1_desc, 
                         epic_key=epic2.key if epic2 else None, priority="Highest")
    if story1:
        print(f"🚨 Critical Story 생성 완료: {story1.key} - {story1.fields.summary}")
    
    # Story 2: JSON 직렬화 순환 참조 해결 (완료)
    story2_desc = """**문제 설명**:
- Organization과 OrganizationUser 간 양방향 관계로 인한 JSON 직렬화 오류
- "Unexpected token ']'" JSON 파싱 오류 발생

**해결 방법**:
- Organization.java에 @JsonManagedReference("organization-members") 적용
- OrganizationUser.java에 @JsonBackReference("organization-members") 적용

**상태**: Done ✅
**우선순위**: High
**스토리 포인트**: 5"""
    
    story2 = create_story("JSON 직렬화 순환 참조 해결", story2_desc, 
                         epic_key=epic2.key if epic2 else None, priority="High")
    if story2:
        print(f"✅ Story 2 생성 완료: {story2.key} - {story2.fields.summary}")
    
    # Story 3: 조직 멤버 fetch join 적용
    story3_desc = """**문제 설명**:
- 조직 상세 조회 시 organizationUsers 배열이 비어있음
- OrganizationRepository.findByIdWithMembers에서 fetch join 미적용 또는 데이터 초기화 문제

**수용 기준**:
- 조직 상세 조회 시 멤버 목록 정상 로딩 확인
- fetch join 쿼리 정상 동작 검증
- 프론트엔드 "조직 보기" 클릭 시 멤버 목록 표시

**우선순위**: High
**스토리 포인트**: 3"""
    
    story3 = create_story("조직 멤버 fetch join 적용", story3_desc, 
                         epic_key=epic2.key if epic2 else None, priority="High")
    if story3:
        print(f"🔥 High Priority Story 생성 완료: {story3.key} - {story3.fields.summary}")
    
    # Bug 1: 권한 체크 로직 일관성 문제
    bug1_desc = """**문제 설명**:
- canAccessOrganization: 시스템 관리자 권한 포함 ✅
- isOrganizationMember: 실제 멤버십만 확인 ❌
- 권한 체크 메서드 간 불일치로 인한 접근 오류

**수용 기준**:
- 권한 체크 로직 일관성 확보
- 시스템 관리자 권한 통일적 적용
- 권한 체크 메서드별 역할 명확화

**우선순위**: Medium
**스토리 포인트**: 3"""
    
    bug1 = create_bug("권한 체크 로직 일관성 문제", bug1_desc, priority="Medium")
    if bug1:
        print(f"🐛 Bug 생성 완료: {bug1.key} - {bug1.fields.summary}")
    
    # Task 1: JIRA MCP 서버 활성화
    task1_desc = """**작업 내용**:
- d_mcpsvr_jira 디렉토리의 의존성 설치
- 환경변수 설정 (.env 파일 구성)
- MCP 서버 실행 테스트
- .claude-mcp.json에 JIRA MCP 서버 등록
- JIRA 프로젝트 연동 테스트

**우선순위**: Low
**스토리 포인트**: 5"""
    
    task1 = create_task("JIRA MCP 서버 활성화", task1_desc, priority="Low")
    if task1:
        print(f"📝 Task 생성 완료: {task1.key} - {task1.fields.summary}")
    
    print("\n🎉 JIRA 이슈 생성 완료!")
    print("\n📋 생성된 이슈 요약:")
    print("   Epic: 3개 (완료된 대형 작업들)")
    print("   Story: 3개 (현재 진행중/차단된 작업들)")
    print("   Bug: 1개 (권한 체크 로직 문제)")
    print("   Task: 1개 (JIRA MCP 서버 활성화)")

if __name__ == "__main__":
    main()