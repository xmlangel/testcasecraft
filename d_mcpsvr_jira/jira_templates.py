#!/usr/bin/env python3
"""
JIRA 템플릿 모듈 - JIRA Wiki Markup 형식에 맞춤
이모지와 마크다운을 JIRA 표준 형식으로 변환
"""

def create_epic_description(title, current_situation, requirements, business_value, scope, effects, stories):
    """Epic용 JIRA Wiki Markup 설명 생성"""
    
    description = f"""h2. 에픽 개요

현재 {current_situation}

h2. 현재 상황 분석

{chr(10).join([f"* {item}" for item in current_situation.split('- ') if item.strip()])}

h2. 주요 요구사항

"""

    # 요구사항을 섹션별로 정리
    for i, req_section in enumerate(requirements, 1):
        description += f"""h3. {i}. {req_section['title']}

{chr(10).join([f"* {item}" for item in req_section['items']])}

"""

    description += f"""h2. 비즈니스 가치

{chr(10).join([f"* *{item['category']}*: {item['description']}" for item in business_value])}

h2. 예상 범위

{chr(10).join([f"* *{item['area']}*: {item['description']}" for item in scope])}

h2. 기대 효과

{chr(10).join([f"* *{item['title']}*: {item['description']}" for item in effects])}

h2. 하위 스토리 계획

{chr(10).join([f"* *{item}*" for item in stories])}"""

    return description

def create_story_description(overview, acceptance_criteria, tech_stack, test_plan):
    """Story용 JIRA Wiki Markup 설명 생성"""
    
    description = f"""h2. 스토리 개요

{overview}

h2. 승인 기준

{chr(10).join([f"* {criteria}" for criteria in acceptance_criteria])}

h2. 기술 스택

{chr(10).join([f"* *{item['category']}*: {item['tech']}" for item in tech_stack])}

h2. 테스트 계획

{chr(10).join([f"* {test}" for test in test_plan])}"""

    return description

def create_bug_description(current_behavior, expected_behavior, reproduction_steps, solution_plan, impact):
    """Bug용 JIRA Wiki Markup 설명 생성"""
    
    description = f"""h2. 문제 설명

h3. 현재 동작
{current_behavior}

h3. 예상 동작
{expected_behavior}

h3. 재현 방법
{chr(10).join([f"{i}. {step}" for i, step in enumerate(reproduction_steps, 1)])}

h2. 해결 방안
{solution_plan}

h2. 영향도
* *심각도*: {impact['severity']}
* *범위*: {impact['scope']}"""

    return description

def create_task_description(work_content, acceptance_criteria, related_files, estimated_time):
    """Task용 JIRA Wiki Markup 설명 생성"""
    
    description = f"""h2. 작업 내용

{work_content}

h2. 수용 기준

{chr(10).join([f"* {criteria}" for criteria in acceptance_criteria])}

h2. 관련 파일

{chr(10).join([f"* {file}" for file in related_files])}

h2. 예상 작업 시간

{estimated_time}"""

    return description

# 실제 Epic 생성용 데이터 구조
def get_test_report_epic_data():
    """테스트 결과 상세리포트 Epic용 데이터"""
    
    return {
        'title': '테스트 결과 상세리포트 출력 기능 구현',
        'current_situation': '테스트 결과 상세리포트에 출력하는 기능이 누락되어 있어, 사용자가 테스트 실행 결과를 체계적으로 확인하고 분석하기 어려운 상황입니다.',
        'requirements': [
            {
                'title': '테스트 결과 리포트 생성',
                'items': [
                    '개별 테스트케이스 실행 결과 상세 정보',
                    '테스트 플랜별 통합 리포트', 
                    '실행 시간, 성공/실패 통계, 오류 상세 정보'
                ]
            },
            {
                'title': '다양한 출력 형식 지원',
                'items': [
                    'HTML 리포트 (웹 브라우저 출력)',
                    'PDF 리포트 (문서화 및 공유)',
                    'Excel/CSV 리포트 (데이터 분석)',
                    'JSON 리포트 (API 연동)'
                ]
            },
            {
                'title': '대시보드 통합',
                'items': [
                    '리포트 생성 기능과 대시보드 연동',
                    '실시간 리포트 생성 및 다운로드',
                    '이력 관리 및 비교 분석'
                ]
            },
            {
                'title': '사용자 경험 개선',
                'items': [
                    '직관적인 리포트 UI/UX',
                    '커스터마이징 가능한 리포트 템플릿',
                    '자동 리포트 생성 및 배포'
                ]
            }
        ],
        'business_value': [
            {'category': '품질 관리', 'description': '체계적인 테스트 결과 분석으로 품질 향상'},
            {'category': '효율성', 'description': '자동화된 리포팅으로 수작업 시간 절약'},
            {'category': '투명성', 'description': '명확한 테스트 결과 공유로 팀 협업 향상'},
            {'category': '의사결정', 'description': '데이터 기반 테스트 전략 수립 지원'}
        ],
        'scope': [
            {'area': '백엔드', 'description': '리포트 생성 서비스, 템플릿 엔진, 파일 생성 API'},
            {'area': '프론트엔드', 'description': '리포트 설정 UI, 미리보기, 다운로드 기능'},
            {'area': '시스템', 'description': '리포트 저장소, 템플릿 관리, 스케줄링'}
        ],
        'effects': [
            {'title': '사용자 만족도 향상', 'description': '필요한 리포트를 쉽게 생성하고 활용'},
            {'title': '업무 효율성 증대', 'description': '수동 리포트 작성 시간 단축'},
            {'title': '데이터 활용도 증가', 'description': '테스트 결과 데이터의 체계적 활용'},
            {'title': '의사결정 지원', 'description': '명확한 데이터 기반 품질 관리'}
        ],
        'stories': [
            '리포트 생성 엔진 구현',
            'HTML 리포트 템플릿 개발', 
            'PDF 출력 기능 구현',
            'Excel/CSV 내보내기 기능',
            '대시보드 리포트 연동',
            '리포트 커스터마이징 UI',
            '자동 리포트 생성 스케줄러'
        ]
    }

def format_epic_description_from_data(data):
    """데이터 구조를 JIRA Wiki Markup으로 변환"""
    
    description = f"""h2. 에픽 개요

{data['current_situation']}

h2. 현재 상황 분석
* 테스트 실행은 가능하지만 상세한 결과 리포트 출력 기능 없음
* 테스트 결과 데이터는 저장되지만 사용자 친화적인 리포트 형태로 제공되지 않음
* 테스트 실행 후 결과 분석 및 리포팅에 제약 존재

h2. 주요 요구사항

"""

    for req in data['requirements']:
        description += f"""h3. {req['title']}
{chr(10).join([f"* {item}" for item in req['items']])}

"""

    description += f"""h2. 비즈니스 가치
{chr(10).join([f"* *{item['category']}*: {item['description']}" for item in data['business_value']])}

h2. 예상 범위
{chr(10).join([f"* *{item['area']}*: {item['description']}" for item in data['scope']])}

h2. 기대 효과
{chr(10).join([f"{i}. *{item['title']}*: {item['description']}" for i, item in enumerate(data['effects'], 1)])}

h2. 하위 스토리 계획
{chr(10).join([f"{i}. *{item}*" for i, item in enumerate(data['stories'], 1)])}"""

    return description

if __name__ == "__main__":
    # 테스트용 Epic 설명 생성
    epic_data = get_test_report_epic_data()
    epic_description = format_epic_description_from_data(epic_data)
    
    print("=== JIRA Epic 설명 (Wiki Markup 형식) ===")
    print(epic_description)
    print("\n=== 길이 확인 ===")
    print(f"총 문자 수: {len(epic_description)}")