#!/usr/bin/env python3
"""
테스트 결과 상세 리포트 내보내기 기능 JIRA 이슈 생성 스크립트
Priority 필드 문제 해결 및 안전한 이슈 생성
"""

import sys
import os

# JIRA 모듈 경로 추가
sys.path.insert(0, './d_mcpsvr_jira')

from jira_caller import get_jira_client, JIRA_SERVER
from jira_workflow import add_work_start_comment

def create_test_report_export_issue():
    """테스트 결과 상세 리포트 내보내기 기능 JIRA 이슈 생성"""
    try:
        print('=== 테스트 결과 상세 리포트 내보내기 기능 JIRA 이슈 생성 ===')
        jira = get_jira_client()
        
        # 먼저 사용 가능한 이슈 타입 확인
        project = jira.project('ICT')
        issue_types = jira.issue_types()
        print(f"📋 사용 가능한 이슈 타입:")
        for issue_type in issue_types:
            print(f"  - {issue_type.name} (ID: {issue_type.id})")
        
        # 작업 이슈 생성 (Priority 필드 제거, 작업 타입 사용)
        story_dict = {
            'project': {'key': 'ICT'},
            'summary': 'ICT-XXX: 테스트 결과 상세 리포트 내보내기 기능 구현',
            'description': '''## 🎯 기능 개요

테스트 결과 상세 리포트에서 컬럼을 선택하여 내보내기할 수 있는 기능을 구현합니다.

## 📋 요구사항

### ✅ 상세 리포트 표시 기능
- **테스트 플랜별 → 실행별 → 케이스별** 계층 구조로 표시
- **실행결과가 없는 테스트 케이스**도 포함하여 완전한 리포트 제공
- 모든 테스트 케이스의 실행 상태를 명확히 구분 표시

### ✅ 컬럼 선택 내보내기 기능
- **컬럼 선택 UI**: 사용자가 필요한 컬럼만 선택하여 내보내기
- **상세 테이블 형식**: 선택된 컬럼에 따른 맞춤형 테이블 생성
- **번호/순서 컬럼**: 자동 번호 매김 기능
- **다양한 내보내기 형식**: Excel (.xlsx), CSV (.csv), PDF 지원

### ✅ 리포트 구조
```
📊 테스트 결과 상세 리포트
├── 📁 테스트 플랜 A
│   ├── 🚀 실행 1 (2024-08-24)
│   │   ├── ✅ 테스트케이스 1 - PASS
│   │   ├── ❌ 테스트케이스 2 - FAIL  
│   │   └── ⏸️ 테스트케이스 3 - 미실행
│   └── 🚀 실행 2 (2024-08-23)
│       └── ...
└── 📁 테스트 플랜 B
    └── ...
```

### ✅ 내보내기 컬럼 옵션
- **기본 정보**: 번호, 테스트플랜명, 실행명, 실행일시
- **테스트케이스**: 케이스명, 설명, 우선순위, 카테고리
- **실행 정보**: 실행상태, 실행자, 실행일시, 소요시간
- **결과 정보**: 결과상태, 통과/실패, 비고, 이슈ID
- **상세 내용**: 전제조건, 예상결과, 실제결과, 오류메시지

## 🎨 UI/UX 설계

### 상세 리포트 화면
- **계층적 트리 뷰**: 플랜 > 실행 > 케이스 구조
- **필터 기능**: 실행상태, 결과상태, 기간별 필터링
- **정렬 기능**: 실행일시, 결과상태, 우선순위별 정렬
- **검색 기능**: 케이스명, 설명 등 텍스트 검색

### 내보내기 다이얼로그
- **컬럼 선택 체크박스**: 카테고리별 그룹화된 컬럼 선택
- **미리보기 기능**: 선택된 컬럼으로 생성될 테이블 미리보기
- **형식 선택**: Excel, CSV, PDF 선택 옵션
- **파일명 설정**: 자동 생성 + 사용자 수정 가능

## 🔧 기술 구현

### 백엔드 API
- `GET /api/test-results/detailed-report/{projectId}` - 상세 리포트 데이터
- `POST /api/test-results/export` - 내보내기 데이터 생성
- **쿼리 파라미터**: 플랜ID, 실행ID, 컬럼 선택, 형식

### 프론트엔드 컴포넌트
- **TestResultDetailedReport.jsx** - 상세 리포트 메인 화면
- **ExportColumnSelector.jsx** - 컬럼 선택 다이얼로그
- **ReportTreeView.jsx** - 계층적 트리 표시 컴포넌트

### 데이터 처리
- **미실행 케이스 포함**: LEFT JOIN을 통한 완전한 데이터 조회
- **성능 최적화**: 페이징, 지연 로딩, 캐싱 적용
- **메모리 효율성**: 스트리밍 방식의 대용량 내보내기

## ✅ 승인 기준

1. **완전한 리포트**: 실행결과가 없는 테스트케이스도 포함하여 표시
2. **계층적 구조**: 테스트플랜 > 실행 > 케이스 3단계 구조 구현
3. **컬럼 선택**: 사용자가 필요한 컬럼만 선택하여 내보내기 가능
4. **다양한 형식**: Excel, CSV, PDF 내보내기 지원
5. **성능 최적화**: 대용량 데이터도 원활한 내보내기 처리
6. **사용자 친화적**: 직관적인 UI와 명확한 데이터 표시

## 🏷️ 연관 이슈
- 테스트 결과 관리 시스템 개선
- 리포팅 기능 강화
- 사용자 경험 개선

이 기능으로 사용자는 필요한 정보만 선택하여 효율적인 테스트 결과 리포트를 생성할 수 있습니다.''',
            'issuetype': {'id': '10003'}  # ICT 프로젝트 작업 타입, Priority 필드 제거
        }
        
        # 이슈 생성
        new_issue = jira.create_issue(fields=story_dict)
        print(f'✅ JIRA 이슈 생성 성공: {new_issue.key}')
        print(f'이슈 URL: {JIRA_SERVER}/browse/{new_issue.key}')
        
        # 작업 시작 코멘트 추가
        work_description = """테스트 결과 상세 리포트 내보내기 기능을 구현합니다.
        
주요 작업:
- 계층적 테스트 결과 표시 (플랜 > 실행 > 케이스)
- 컬럼 선택 내보내기 UI 구현
- 미실행 케이스 포함 완전한 리포트 생성
- Excel, CSV, PDF 내보내기 지원"""
        
        related_files = [
            'src/main/frontend/src/components/TestResult/TestResultDetailedReport.jsx',
            'src/main/frontend/src/components/TestResult/ExportColumnSelector.jsx', 
            'src/main/frontend/src/components/TestResult/ReportTreeView.jsx',
            'src/main/java/com/testcase/testcasemanagement/controller/TestResultReportController.java',
            'src/main/java/com/testcase/testcasemanagement/service/TestResultReportService.java'
        ]
        
        technical_context = [
            '기존 테스트 결과 화면에 상세 리포트 탭 추가',
            'LEFT JOIN을 사용한 미실행 케이스 포함 쿼리 작성',
            'Apache POI를 사용한 Excel 내보내기 구현',
            '대용량 데이터 스트리밍 처리 최적화'
        ]
        
        dependencies = [
            'TestResult 관련 기존 컴포넌트들과 연동',
            'Material-UI 테이블 및 다이얼로그 컴포넌트 사용',
            'Spring Boot 파일 다운로드 기능 활용'
        ]
        
        risks = [
            '대용량 데이터 내보내기 시 메모리 사용량 증가',
            '복잡한 계층 구조로 인한 성능 저하 가능성',
            '다양한 브라우저에서 파일 다운로드 호환성'
        ]
        
        # 작업 시작 코멘트 추가
        add_work_start_comment(
            issue_key=new_issue.key,
            work_description=work_description,
            estimated_hours=16,
            files=related_files,
            technical_context=technical_context,
            dependencies=dependencies,
            risks=risks
        )
        
        # 생성된 이슈 정보 출력
        print(f'')
        print(f'📋 생성된 이슈 정보:')
        print(f'  - 이슈 키: {new_issue.key}')
        print(f'  - 타입: 작업')
        print(f'  - 제목: 테스트 결과 상세 리포트 내보내기 기능 구현')
        print(f'  - 예상 작업 시간: 16시간')
        print(f'  - 관련 파일: {len(related_files)}개')
        
        return new_issue.key
        
    except Exception as e:
        print(f'❌ JIRA 이슈 생성 실패: {str(e)}')
        return None

if __name__ == "__main__":
    create_test_report_export_issue()