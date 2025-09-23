-- ==========================================
-- 번역 데이터 SQL 스크립트
-- ==========================================

-- 번역 키 데이터
INSERT INTO translation_keys (key_name, category, description) VALUES
-- 공통 번역 키
('common.ok', 'common', '확인 버튼'),
('common.cancel', 'common', '취소 버튼'),
('common.save', 'common', '저장 버튼'),
('common.delete', 'common', '삭제 버튼'),
('common.edit', 'common', '편집 버튼'),
('common.add', 'common', '추가 버튼'),
('common.search', 'common', '검색'),
('common.filter', 'common', '필터'),
('common.refresh', 'common', '새로고침'),
('common.loading', 'common', '로딩 중'),
('common.actions', 'common', '작업'),
('common.status', 'common', '상태'),
('common.date', 'common', '날짜'),
('common.name', 'common', '이름'),
('common.description', 'common', '설명'),

-- 네비게이션
('nav.dashboard', 'navigation', '대시보드'),
('nav.testcases', 'navigation', '테스트케이스'),
('nav.testplans', 'navigation', '테스트플랜'),
('nav.testexecution', 'navigation', '테스트실행'),
('nav.testresults', 'navigation', '테스트결과'),
('nav.automation', 'navigation', '자동화 테스트'),

-- 대시보드 관련 번역 키
('dashboard.title', 'dashboard', '대시보드 제목'),
('dashboard.totalProjects', 'dashboard', '전체 프로젝트 수'),
('dashboard.totalTestCases', 'dashboard', '전체 테스트케이스 수'),
('dashboard.totalTestPlans', 'dashboard', '전체 테스트플랜 수'),
('dashboard.totalTestExecutions', 'dashboard', '전체 테스트실행 수'),
('dashboard.recentActivity', 'dashboard', '최근 활동'),
('dashboard.projectProgress', 'dashboard', '프로젝트 진행률'),
('dashboard.testCasesByCategory', 'dashboard', '카테고리별 테스트케이스'),
('dashboard.testExecutionTrend', 'dashboard', '테스트 실행 추세'),
('dashboard.passFailRatio', 'dashboard', '통과/실패 비율'),
('dashboard.summary', 'dashboard', '요약'),
('dashboard.details', 'dashboard', '세부사항'),
('dashboard.statistics', 'dashboard', '통계'),
('dashboard.chart.passRate', 'dashboard', '통과율'),
('dashboard.chart.failRate', 'dashboard', '실패율'),
('dashboard.chart.pending', 'dashboard', '대기중'),
('dashboard.noData', 'dashboard', '데이터 없음'),
('dashboard.loadingData', 'dashboard', '데이터 로딩 중'),

-- 프로젝트 관련
('project.list', 'project', '프로젝트 목록'),
('project.create', 'project', '프로젝트 생성'),
('project.edit', 'project', '프로젝트 편집'),
('project.delete', 'project', '프로젝트 삭제'),
('project.open', 'project', '프로젝트 열기'),
('project.settings', 'project', '프로젝트 설정'),

-- 테스트케이스 관련
('testcase.list', 'testcase', '테스트케이스 목록'),
('testcase.create', 'testcase', '테스트케이스 생성'),
('testcase.edit', 'testcase', '테스트케이스 편집'),
('testcase.delete', 'testcase', '테스트케이스 삭제'),
('testcase.steps', 'testcase', '테스트 단계'),
('testcase.expectedResult', 'testcase', '예상 결과'),
('testcase.actualResult', 'testcase', '실제 결과'),
('testcase.priority', 'testcase', '우선순위'),
('testcase.category', 'testcase', '카테고리'),

-- 테스트플랜 관련
('testplan.list', 'testplan', '테스트플랜 목록'),
('testplan.create', 'testplan', '테스트플랜 생성'),
('testplan.edit', 'testplan', '테스트플랜 편집'),
('testplan.delete', 'testplan', '테스트플랜 삭제'),
('testplan.execute', 'testplan', '테스트플랜 실행'),

-- 테스트실행 관련
('execution.start', 'execution', '실행 시작'),
('execution.stop', 'execution', '실행 중지'),
('execution.pause', 'execution', '실행 일시정지'),
('execution.resume', 'execution', '실행 재개'),
('execution.pass', 'execution', '통과'),
('execution.fail', 'execution', '실패'),
('execution.skip', 'execution', '건너뛰기'),

-- 사용자 관련
('user.profile', 'user', '사용자 프로필'),
('user.settings', 'user', '사용자 설정'),
('user.logout', 'user', '로그아웃'),
('user.login', 'user', '로그인'),
('user.register', 'user', '회원가입'),

-- 메시지
('message.saveSuccess', 'message', '저장 성공'),
('message.saveError', 'message', '저장 실패'),
('message.deleteSuccess', 'message', '삭제 성공'),
('message.deleteError', 'message', '삭제 실패'),
('message.confirmDelete', 'message', '정말 삭제하시겠습니까?'),

-- 폼 검증
('validation.required', 'validation', '필수 입력 항목입니다'),
('validation.invalid', 'validation', '유효하지 않은 값입니다'),
('validation.minLength', 'validation', '최소 길이를 만족해야 합니다'),
('validation.maxLength', 'validation', '최대 길이를 초과했습니다');

-- 한국어 번역 데이터
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
-- 공통 한국어
('ko', 'common.ok', '확인'),
('ko', 'common.cancel', '취소'),
('ko', 'common.save', '저장'),
('ko', 'common.delete', '삭제'),
('ko', 'common.edit', '편집'),
('ko', 'common.add', '추가'),
('ko', 'common.search', '검색'),
('ko', 'common.filter', '필터'),
('ko', 'common.refresh', '새로고침'),
('ko', 'common.loading', '로딩 중...'),
('ko', 'common.actions', '작업'),
('ko', 'common.status', '상태'),
('ko', 'common.date', '날짜'),
('ko', 'common.name', '이름'),
('ko', 'common.description', '설명'),

-- 네비게이션 한국어
('ko', 'nav.dashboard', '대시보드'),
('ko', 'nav.testcases', '테스트케이스'),
('ko', 'nav.testplans', '테스트플랜'),
('ko', 'nav.testexecution', '테스트실행'),
('ko', 'nav.testresults', '테스트결과'),
('ko', 'nav.automation', '자동화 테스트'),

-- 대시보드 한국어
('ko', 'dashboard.title', '프로젝트 대시보드'),
('ko', 'dashboard.totalProjects', '전체 프로젝트'),
('ko', 'dashboard.totalTestCases', '전체 테스트케이스'),
('ko', 'dashboard.totalTestPlans', '전체 테스트플랜'),
('ko', 'dashboard.totalTestExecutions', '전체 테스트실행'),
('ko', 'dashboard.recentActivity', '최근 활동'),
('ko', 'dashboard.projectProgress', '프로젝트 진행률'),
('ko', 'dashboard.testCasesByCategory', '카테고리별 테스트케이스'),
('ko', 'dashboard.testExecutionTrend', '테스트 실행 추세'),
('ko', 'dashboard.passFailRatio', '통과/실패 비율'),
('ko', 'dashboard.summary', '요약'),
('ko', 'dashboard.details', '세부사항'),
('ko', 'dashboard.statistics', '통계'),
('ko', 'dashboard.chart.passRate', '통과율'),
('ko', 'dashboard.chart.failRate', '실패율'),
('ko', 'dashboard.chart.pending', '대기중'),
('ko', 'dashboard.noData', '표시할 데이터가 없습니다'),
('ko', 'dashboard.loadingData', '데이터를 불러오는 중...'),

-- 프로젝트 한국어
('ko', 'project.list', '프로젝트 목록'),
('ko', 'project.create', '새 프로젝트'),
('ko', 'project.edit', '프로젝트 편집'),
('ko', 'project.delete', '프로젝트 삭제'),
('ko', 'project.open', '프로젝트 열기'),
('ko', 'project.settings', '프로젝트 설정'),

-- 테스트케이스 한국어
('ko', 'testcase.list', '테스트케이스 목록'),
('ko', 'testcase.create', '새 테스트케이스'),
('ko', 'testcase.edit', '테스트케이스 편집'),
('ko', 'testcase.delete', '테스트케이스 삭제'),
('ko', 'testcase.steps', '테스트 단계'),
('ko', 'testcase.expectedResult', '예상 결과'),
('ko', 'testcase.actualResult', '실제 결과'),
('ko', 'testcase.priority', '우선순위'),
('ko', 'testcase.category', '카테고리'),

-- 테스트플랜 한국어
('ko', 'testplan.list', '테스트플랜 목록'),
('ko', 'testplan.create', '새 테스트플랜'),
('ko', 'testplan.edit', '테스트플랜 편집'),
('ko', 'testplan.delete', '테스트플랜 삭제'),
('ko', 'testplan.execute', '테스트플랜 실행'),

-- 테스트실행 한국어
('ko', 'execution.start', '시작'),
('ko', 'execution.stop', '중지'),
('ko', 'execution.pause', '일시정지'),
('ko', 'execution.resume', '재개'),
('ko', 'execution.pass', '통과'),
('ko', 'execution.fail', '실패'),
('ko', 'execution.skip', '건너뛰기'),

-- 사용자 한국어
('ko', 'user.profile', '프로필'),
('ko', 'user.settings', '설정'),
('ko', 'user.logout', '로그아웃'),
('ko', 'user.login', '로그인'),
('ko', 'user.register', '회원가입'),

-- 메시지 한국어
('ko', 'message.saveSuccess', '성공적으로 저장되었습니다'),
('ko', 'message.saveError', '저장에 실패했습니다'),
('ko', 'message.deleteSuccess', '성공적으로 삭제되었습니다'),
('ko', 'message.deleteError', '삭제에 실패했습니다'),
('ko', 'message.confirmDelete', '정말 삭제하시겠습니까?'),

-- 검증 한국어
('ko', 'validation.required', '필수 입력 항목입니다'),
('ko', 'validation.invalid', '유효하지 않은 값입니다'),
('ko', 'validation.minLength', '최소 길이를 만족해야 합니다'),
('ko', 'validation.maxLength', '최대 길이를 초과했습니다');

-- 영어 번역 데이터
INSERT INTO translations (language_code, translation_key, translation_value) VALUES
-- 공통 영어
('en', 'common.ok', 'OK'),
('en', 'common.cancel', 'Cancel'),
('en', 'common.save', 'Save'),
('en', 'common.delete', 'Delete'),
('en', 'common.edit', 'Edit'),
('en', 'common.add', 'Add'),
('en', 'common.search', 'Search'),
('en', 'common.filter', 'Filter'),
('en', 'common.refresh', 'Refresh'),
('en', 'common.loading', 'Loading...'),
('en', 'common.actions', 'Actions'),
('en', 'common.status', 'Status'),
('en', 'common.date', 'Date'),
('en', 'common.name', 'Name'),
('en', 'common.description', 'Description'),

-- 네비게이션 영어
('en', 'nav.dashboard', 'Dashboard'),
('en', 'nav.testcases', 'Test Cases'),
('en', 'nav.testplans', 'Test Plans'),
('en', 'nav.testexecution', 'Test Execution'),
('en', 'nav.testresults', 'Test Results'),
('en', 'nav.automation', 'Automation Tests'),

-- 대시보드 영어
('en', 'dashboard.title', 'Project Dashboard'),
('en', 'dashboard.totalProjects', 'Total Projects'),
('en', 'dashboard.totalTestCases', 'Total Test Cases'),
('en', 'dashboard.totalTestPlans', 'Total Test Plans'),
('en', 'dashboard.totalTestExecutions', 'Total Test Executions'),
('en', 'dashboard.recentActivity', 'Recent Activity'),
('en', 'dashboard.projectProgress', 'Project Progress'),
('en', 'dashboard.testCasesByCategory', 'Test Cases by Category'),
('en', 'dashboard.testExecutionTrend', 'Test Execution Trend'),
('en', 'dashboard.passFailRatio', 'Pass/Fail Ratio'),
('en', 'dashboard.summary', 'Summary'),
('en', 'dashboard.details', 'Details'),
('en', 'dashboard.statistics', 'Statistics'),
('en', 'dashboard.chart.passRate', 'Pass Rate'),
('en', 'dashboard.chart.failRate', 'Fail Rate'),
('en', 'dashboard.chart.pending', 'Pending'),
('en', 'dashboard.noData', 'No data to display'),
('en', 'dashboard.loadingData', 'Loading data...'),

-- 프로젝트 영어
('en', 'project.list', 'Project List'),
('en', 'project.create', 'New Project'),
('en', 'project.edit', 'Edit Project'),
('en', 'project.delete', 'Delete Project'),
('en', 'project.open', 'Open Project'),
('en', 'project.settings', 'Project Settings'),

-- 테스트케이스 영어
('en', 'testcase.list', 'Test Case List'),
('en', 'testcase.create', 'New Test Case'),
('en', 'testcase.edit', 'Edit Test Case'),
('en', 'testcase.delete', 'Delete Test Case'),
('en', 'testcase.steps', 'Test Steps'),
('en', 'testcase.expectedResult', 'Expected Result'),
('en', 'testcase.actualResult', 'Actual Result'),
('en', 'testcase.priority', 'Priority'),
('en', 'testcase.category', 'Category'),

-- 테스트플랜 영어
('en', 'testplan.list', 'Test Plan List'),
('en', 'testplan.create', 'New Test Plan'),
('en', 'testplan.edit', 'Edit Test Plan'),
('en', 'testplan.delete', 'Delete Test Plan'),
('en', 'testplan.execute', 'Execute Test Plan'),

-- 테스트실행 영어
('en', 'execution.start', 'Start'),
('en', 'execution.stop', 'Stop'),
('en', 'execution.pause', 'Pause'),
('en', 'execution.resume', 'Resume'),
('en', 'execution.pass', 'Pass'),
('en', 'execution.fail', 'Fail'),
('en', 'execution.skip', 'Skip'),

-- 사용자 영어
('en', 'user.profile', 'Profile'),
('en', 'user.settings', 'Settings'),
('en', 'user.logout', 'Logout'),
('en', 'user.login', 'Login'),
('en', 'user.register', 'Register'),

-- 메시지 영어
('en', 'message.saveSuccess', 'Successfully saved'),
('en', 'message.saveError', 'Failed to save'),
('en', 'message.deleteSuccess', 'Successfully deleted'),
('en', 'message.deleteError', 'Failed to delete'),
('en', 'message.confirmDelete', 'Are you sure you want to delete?'),

-- 검증 영어
('en', 'validation.required', 'This field is required'),
('en', 'validation.invalid', 'Invalid value'),
('en', 'validation.minLength', 'Minimum length requirement not met'),
('en', 'validation.maxLength', 'Maximum length exceeded');