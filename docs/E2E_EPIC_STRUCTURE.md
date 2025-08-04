# 🎯 프론트엔드 Playwright E2E 테스트 Epic 구조 (최종 업데이트: 2025-08-03)

## 📋 Epic 구조 완성 현황

**Epic ICT-64: 프론트엔드 Playwright E2E 테스트 케이스 작성** 하위에 체계적인 Story와 Task 구조가 완성되었습니다.

### 🎉 생성된 JIRA 구조

| Story | 이슈 키 | 제목 | Task 개수 | Task 범위 | 상태 |
|-------|---------|------|-----------|-----------|------|
| **Story 1** | ICT-65 | 인증 시스템 E2E 테스트 | 4개 | ICT-66~69 | ✅ 완료 |
| **Story 2** | ICT-70 | 대시보드 관리 E2E 테스트 | 4개 | ICT-71~74 | ✅ 완료 |
| **Story 3** | ICT-81 | 조직 관리 E2E 테스트 | 5개 | ICT-82~86 | ✅ 완료 |
| **Story 4** | ICT-87 | 사용자 관리 E2E 테스트 | 5개 | ICT-88~92 | ✅ 완료 |
| **Story 5** | ICT-75 | 프로젝트 관리 E2E 테스트 | 5개 | ICT-76~80 | ✅ 완료 |
| **Story 6** | ICT-93 | 테스트 케이스 관리 E2E 테스트 | 5개 | ICT-94~98 | ✅ 완료 |
| **Story 7** | ICT-99 | 테스트 플랜 관리 E2E 테스트 | 5개 | ICT-100~104 | ✅ 완료 |
| **Story 8** | ICT-105 | 테스트 실행 관리 E2E 테스트 | 5개 | ICT-106~110 | ✅ 완료 |

### 📊 총 생성 현황
- **Epic**: 1개 (ICT-64)
- **Story**: 8개 (ICT-65, 70, 75, 81, 87, 93, 99, 105)
- **Task**: 38개 (ICT-66~110)

## 🚀 구현 우선순위

### Phase 1 (높은 우선순위)
- **Story 1 (ICT-65)**: 인증 시스템 E2E 테스트
  - 로그인/로그아웃 플로우, JWT 토큰 관리, 세션 처리
- **Story 2 (ICT-70)**: 대시보드 관리 E2E 테스트  
  - 레이아웃, 통계 위젯, 활동 피드, 빠른 액션
- **Story 5 (ICT-75)**: 프로젝트 관리 E2E 테스트
  - 프로젝트 전환, 생성 (조직/독립/전체), 설정

### Phase 2 (중간 우선순위)
- **Story 3 (ICT-81)**: 조직 관리 E2E 테스트
  - CRUD, 멤버 관리, 권한 제어, 삭제 처리
- **Story 4 (ICT-87)**: 사용자 관리 E2E 테스트
  - 사용자 CRUD, 권한 관리, 상태 관리
- **Story 6 (ICT-93)**: 테스트 케이스 관리 E2E 테스트
  - 트리 구조, CRUD, 드래그앤드롭, 실행

### Phase 3 (후순위)
- **Story 7 (ICT-99)**: 테스트 플랜 관리 E2E 테스트
  - 플랜 관리, 케이스 선택, 복제, 실행 준비
- **Story 8 (ICT-105)**: 테스트 실행 관리 E2E 테스트
  - 실행 세션, 진행률 추적, 결과 기록, 리포트

## 📁 테스트 스크립트 위치

각 Task별로 다음과 같은 Playwright 스크립트가 생성될 예정입니다:

```
e2e-tests/
├── authentication/
│   ├── login-success-test.js          # ICT-66
│   ├── login-failure-test.js          # ICT-67
│   ├── logout-flow-test.js            # ICT-68
│   └── session-management-test.js     # ICT-69
├── dashboard/
│   ├── dashboard-layout-test.js       # ICT-71
│   ├── statistics-widget-test.js      # ICT-72
│   ├── activity-feed-test.js          # ICT-73
│   └── quick-actions-test.js          # ICT-74
├── organization/
│   ├── organization-list-test.js      # ICT-82
│   ├── organization-create-test.js    # ICT-83
│   ├── organization-edit-test.js      # ICT-84
│   ├── organization-members-test.js   # ICT-85
│   └── organization-delete-test.js    # ICT-86
├── user/
│   ├── user-list-test.js              # ICT-88
│   ├── user-create-test.js            # ICT-89
│   ├── user-profile-test.js           # ICT-90
│   ├── user-permissions-test.js       # ICT-91
│   └── user-status-test.js            # ICT-92
├── project/
│   ├── project-switch-test.js         # ICT-76
│   ├── org-project-create-test.js     # ICT-77
│   ├── independent-project-test.js    # ICT-78
│   ├── global-project-test.js         # ICT-79
│   └── project-settings-test.js       # ICT-80
├── testcase/
│   ├── testcase-tree-test.js          # ICT-94
│   ├── testcase-create-test.js        # ICT-95
│   ├── testcase-edit-test.js          # ICT-96
│   ├── testcase-move-test.js          # ICT-97
│   └── testcase-execution-test.js     # ICT-98
├── testplan/
│   ├── testplan-list-test.js          # ICT-100
│   ├── testplan-create-test.js        # ICT-101
│   ├── testplan-edit-test.js          # ICT-102
│   ├── testplan-clone-test.js         # ICT-103
│   └── testplan-prepare-test.js       # ICT-104
└── execution/
    ├── execution-start-test.js        # ICT-106
    ├── execution-progress-test.js     # ICT-107
    ├── execution-results-test.js      # ICT-108
    ├── execution-pause-test.js        # ICT-109
    └── execution-complete-test.js     # ICT-110
```

## 🔧 각 Task의 주요 기능

### Story 1: 인증 시스템 E2E 테스트 (ICT-65)
- **ICT-66**: 로그인 성공 플로우 테스트 (admin/admin, JWT 토큰, 대시보드 리다이렉션)
- **ICT-67**: 로그인 실패 케이스 테스트 (잘못된 credentials, 오류 메시지, 폼 상태)
- **ICT-68**: 로그아웃 플로우 테스트 (로그아웃 버튼, 토큰 삭제, 리다이렉션)
- **ICT-69**: 세션 관리 테스트 (토큰 만료, 자동 로그아웃, 리프레시 토큰)

### Story 2: 대시보드 관리 E2E 테스트 (ICT-70)
- **ICT-71**: 대시보드 레이아웃 테스트 (헤더/네비게이션, 사이드바, 반응형)
- **ICT-72**: 통계 위젯 테스트 (데이터 로딩, 차트/그래프, 실시간 업데이트)
- **ICT-73**: 최근 활동 피드 테스트 (활동 목록, 페이지네이션, 필터링)
- **ICT-74**: 빠른 액션 테스트 (프로젝트 생성, 테스트 케이스 바로가기, 조직 관리)

### Story 3: 조직 관리 E2E 테스트 (ICT-81)
- **ICT-82**: 조직 목록 및 조회 테스트 (목록 표시, 검색/필터링, 상세 조회)
- **ICT-83**: 조직 생성 테스트 (생성 폼, 유효성 검사, 리스트 업데이트)
- **ICT-84**: 조직 수정 테스트 (수정 폼, 실시간 동기화, 권한별 제한)
- **ICT-85**: 조직 멤버 관리 테스트 (멤버 추가/제거, 역할 변경, 실시간 업데이트)
- **ICT-86**: 조직 삭제 테스트 (삭제 권한, 확인 다이얼로그, 관련 데이터 정리)

### Story 4: 사용자 관리 E2E 테스트 (ICT-87)
- **ICT-88**: 사용자 목록 및 검색 테스트 (목록 표시, 검색/필터링, 페이지네이션)
- **ICT-89**: 사용자 생성 테스트 (생성 폼, 이메일 중복 검사, 초기 권한)
- **ICT-90**: 사용자 프로필 관리 테스트 (정보 수정, 비밀번호 변경, 이미지 업로드)
- **ICT-91**: 사용자 역할 및 권한 테스트 (역할 변경, 권한별 메뉴, 접근 제어)
- **ICT-92**: 사용자 상태 관리 테스트 (활성화/비활성화, 계정 잠금/해제, 삭제)

### Story 5: 프로젝트 관리 E2E 테스트 (ICT-75)
- **ICT-76**: 프로젝트 선택 및 전환 테스트 (목록 조회, 검색/필터링, 전환 시 상태 관리)
- **ICT-77**: 조직별 프로젝트 생성 테스트 (조직 선택, 기본 정보, 초기 멤버)
- **ICT-78**: 독립 프로젝트 생성 테스트 (독립 프로젝트 폼, 템플릿 선택, 권한 설정)
- **ICT-79**: 전체 프로젝트 생성 테스트 (전체 접근 설정, 공개 범위, 멤버 자동 추가)
- **ICT-80**: 프로젝트 설정 관리 테스트 (정보 수정, 멤버 관리, 상태 변경)

### Story 6: 테스트 케이스 관리 E2E 테스트 (ICT-93)
- **ICT-94**: 테스트 케이스 목록 및 트리 구조 테스트 (트리 네비게이션, 폴더 확장/축소, 검색)
- **ICT-95**: 테스트 케이스 생성 테스트 (생성 폼, 테스트 단계 추가, 예상 결과)
- **ICT-96**: 테스트 케이스 수정 테스트 (상세 정보 수정, 단계 편집, 첨부파일)
- **ICT-97**: 테스트 케이스 이동/복사 테스트 (드래그앤드롭, 복사, 폴더 구조 변경)
- **ICT-98**: 테스트 케이스 실행 테스트 (개별 실행, 결과 기록, 첨부파일 추가)

### Story 7: 테스트 플랜 관리 E2E 테스트 (ICT-99)
- **ICT-100**: 테스트 플랜 목록 및 조회 테스트 (목록 표시, 상태별 필터링, 상세 조회)
- **ICT-101**: 테스트 플랜 생성 테스트 (기본 정보, 테스트 케이스 선택, 우선순위)
- **ICT-102**: 테스트 플랜 수정 테스트 (정보 수정, 케이스 추가/제거, 순서 변경)
- **ICT-103**: 테스트 플랜 복제 테스트 (복제 기능, 복제 옵션, 복제된 플랜 검증)
- **ICT-104**: 테스트 플랜 실행 준비 테스트 (실행 환경, 담당자 할당, 상태 변경)

### Story 8: 테스트 실행 관리 E2E 테스트 (ICT-105)
- **ICT-106**: 테스트 실행 시작 테스트 (세션 생성, 환경 확인, 대시보드 접속)
- **ICT-107**: 실행 진행 상황 추적 테스트 (실시간 진행률, 개별 상태, 실행 로그)
- **ICT-108**: 테스트 결과 기록 테스트 (Pass/Fail/Skip, 실패 사유, 이슈 생성)
- **ICT-109**: 실행 중단 및 재개 테스트 (일시정지, 중단점 재개, 부분 완료 상태)
- **ICT-110**: 실행 완료 및 리포트 테스트 (완료 처리, 리포트 생성, 데이터 내보내기)

## 🧩 프론트엔드 컴포넌트 매핑

### 📂 현재 컴포넌트 구조 (총 28개 JSX 컴포넌트)

#### 🏗️ 아키텍처 기반 컴포넌트
- **Layout & Navigation**: `ProjectHeader.jsx`, `ProtectedRoute.jsx`
- **Common UI**: `StatusInfoItem.jsx`
- **Enhanced Manager**: `EnhancedProjectManager.jsx`

#### 🔐 인증 관련 컴포넌트 (Story 1: ICT-65)
**테스트 대상 컴포넌트**:
- `Login.jsx` - 로그인 폼 및 인증 처리
- `ProtectedRoute.jsx` - 인증 상태 기반 라우팅
- `UserProfileDialog.jsx` - 사용자 프로필 및 로그아웃

**테스트 포인트**:
- 로그인 폼 렌더링 및 유효성 검사
- JWT 토큰 저장 및 관리
- 인증 실패 시 오류 메시지 표시
- 로그아웃 시 토큰 삭제 및 리다이렉션

#### 🏠 대시보드 관련 컴포넌트 (Story 2: ICT-70)
**테스트 대상 컴포넌트**:
- `Dashboard.jsx` - 메인 대시보드 레이아웃
- `RecentTestResults.jsx` - 최근 테스트 결과 위젯
- `StatusInfoItem.jsx` - 상태 정보 표시 컴포넌트

**테스트 포인트**:
- 대시보드 레이아웃 및 네비게이션
- 통계 위젯 데이터 로딩 및 표시
- 실시간 데이터 업데이트
- 반응형 디자인 확인

#### 🏢 조직 관리 관련 컴포넌트 (Story 3: ICT-81)
**테스트 대상 컴포넌트**:
- `OrganizationList.jsx` - 조직 목록 표시
- `OrganizationDetail.jsx` - 조직 상세 정보
- `OrganizationDashboard.jsx` - 조직 대시보드

**테스트 포인트**:
- 조직 목록 렌더링 및 검색
- 조직 생성/수정/삭제 폼
- 조직 멤버 관리 인터페이스
- 권한별 UI 표시/숨김

#### 👥 사용자 관리 관련 컴포넌트 (Story 4: ICT-87)
**테스트 대상 컴포넌트**:
- `UserManagement/UserList.jsx` - 사용자 목록
- `UserManagement/UserDetailDialog.jsx` - 사용자 상세 정보
- `UserProfileDialog.jsx` - 사용자 프로필 관리

**테스트 포인트**:
- 사용자 목록 표시 및 검색
- 사용자 생성/수정 폼
- 역할 및 권한 관리 UI
- 사용자 상태 변경 기능

#### 📁 프로젝트 관리 관련 컴포넌트 (Story 5: ICT-75)
**테스트 대상 컴포넌트**:
- `ProjectManager.jsx` - 프로젝트 관리 메인
- `ProjectHeader.jsx` - 프로젝트 헤더 및 네비게이션
- `EnhancedProjectManager.jsx` - 고급 프로젝트 관리

**테스트 포인트**:
- 프로젝트 선택 및 전환
- 프로젝트 생성 (조직별/독립/전체)
- 프로젝트 설정 및 멤버 관리
- 프로젝트 상태 관리

#### 🧪 테스트 케이스 관리 관련 컴포넌트 (Story 6: ICT-93)
**테스트 대상 컴포넌트**:
- `TestCaseTree.jsx` - 테스트 케이스 트리 구조
- `TestCaseForm.jsx` - 테스트 케이스 생성/수정 폼

**테스트 포인트**:
- 계층적 트리 네비게이션
- 폴더 확장/축소 기능
- 테스트 케이스 CRUD 폼
- 드래그앤드롭 이동/복사
- 테스트 단계 동적 추가/수정

#### 📋 테스트 플랜 관리 관련 컴포넌트 (Story 7: ICT-99)
**테스트 대상 컴포넌트**:
- `TestPlanList.jsx` - 테스트 플랜 목록
- `TestPlanForm.jsx` - 테스트 플랜 생성/수정 폼
- `TestPlanSelector.jsx` - 테스트 플랜 선택기

**테스트 포인트**:
- 테스트 플랜 목록 및 필터링
- 플랜 생성/수정 폼 검증
- 테스트 케이스 선택 UI
- 플랜 복제 기능
- 실행 준비 워크플로우

#### ⚡ 테스트 실행 관리 관련 컴포넌트 (Story 8: ICT-105)
**테스트 대상 컴포넌트**:
- `TestExecutionList.jsx` - 테스트 실행 목록
- `TestExecutionForm.jsx` - 테스트 실행 폼
- `TestResultForm.jsx` - 테스트 결과 기록 폼

**테스트 포인트**:
- 실행 세션 시작 및 관리
- 실시간 진행률 표시
- 결과 기록 (Pass/Fail/Skip)
- 실행 중단/재개 기능
- 결과 리포트 생성

#### 🧱 공통 UI 컴포넌트 (모든 Story에서 사용)
**Atoms (원자 컴포넌트)**:
- `atoms/Button/Button.jsx` - 버튼 컴포넌트
- `atoms/Input/Input.jsx` - 입력 필드
- `atoms/LoadingSpinner/LoadingSpinner.jsx` - 로딩 스피너
- `atoms/ErrorMessage/ErrorMessage.jsx` - 오류 메시지

**Molecules (분자 컴포넌트)**:
- `molecules/ConfirmDialog/ConfirmDialog.jsx` - 확인 다이얼로그
- `molecules/SearchInput/SearchInput.jsx` - 검색 입력

**공통 테스트 포인트**:
- 컴포넌트 렌더링 검증
- Props 전달 및 이벤트 처리
- 스타일링 및 반응형 디자인
- 접근성 (ARIA, 키보드 네비게이션)

### 🎯 E2E 테스트 시 필수 확인 사항

#### 📋 테스트 작업 전 체크리스트
**⚠️ 각 Task 시작 전 반드시 수행**:

1. **컴포넌트 현황 확인**:
   ```bash
   # 최신 컴포넌트 목록 확인
   find src/main/frontend/src/components -name "*.jsx" | sort
   ```

2. **컴포넌트 변경사항 확인**:
   ```bash
   # 최근 수정된 컴포넌트 확인
   git log --oneline --since="1 week ago" -- src/main/frontend/src/components/
   ```

3. **컴포넌트 의존성 확인**:
   - 각 컴포넌트의 import 관계
   - props 인터페이스 변경사항
   - 상태 관리 패턴 변화

4. **라우팅 구조 확인**:
   ```bash
   # App.jsx에서 라우팅 구조 확인
   grep -n "Route" src/main/frontend/src/App.jsx
   ```

#### 🔄 테스트 작업 중 지속적 참조
**각 Task 실행 시**:
1. **해당 Story의 컴포넌트 목록 재확인**
2. **컴포넌트별 테스트 포인트 매핑 검증**
3. **새로 추가된 컴포넌트 반영**
4. **삭제/이동된 컴포넌트 업데이트**
5. **테스트 스크립트 경로 조정**

#### 📊 진행 상황 추적
**Epic ICT-64 진행 시**:
- [ ] Story별 컴포넌트 매핑 완료 여부
- [ ] 신규 컴포넌트 테스트 추가 필요성
- [ ] 공통 컴포넌트 테스트 중복 제거
- [ ] 컴포넌트 리팩토링 시 테스트 업데이트

### 📝 컴포넌트 변경 추적 프로세스

#### 1. 컴포넌트 구조 변경 시
- 이 문서의 컴포넌트 매핑 섹션 업데이트
- 해당 Story의 테스트 스크립트 수정
- 관련 Task 설명 업데이트

#### 2. 새 컴포넌트 추가 시
- 해당 기능 영역의 Story에 테스트 항목 추가
- 컴포넌트 매핑 테이블 업데이트
- E2E 테스트 시나리오 확장

#### 3. 컴포넌트 삭제/이동 시
- 관련 테스트 스크립트 정리
- 매핑 테이블에서 제거
- 중복 테스트 검토 및 정리

## 🎯 다음 단계

1. **Playwright 테스트 스크립트 구현 시작**
2. **Phase 1 우선순위로 진행** (인증, 대시보드, 프로젝트 관리)
3. **각 Task별 상세 테스트 시나리오 구현**
4. **Cross-cutting 테스트** (반응형, 성능, 접근성, 보안)
5. **⭐ 컴포넌트 매핑 기반 테스트 작성** (위 매핑 정보 지속적 참조)

## 📎 관련 파일

- **Epic 계획 문서**: `e2e-tests/test-epic-plan.md`
- **Playwright MCP 설정**: `.claude-mcp.json`
- **테스트 결과 리포트**: `e2e-tests/test-report.html`
- **기존 테스트 스크립트**: `e2e-tests/e2e-testcase-app.js`
- **E2E 테스트 가이드**: [`E2E_TESTING.md`](./E2E_TESTING.md)

## 📝 업데이트 이력

- **2025-08-03**: Epic ICT-64 생성, 8개 Story와 38개 Task 구조 완성
- **2025-08-03**: 우선순위별 Phase 구분 및 구현 계획 수립
- **2025-08-03**: 테스트 스크립트 디렉토리 구조 설계