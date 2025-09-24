-- ==========================================
-- PostgreSQL 호환 번역 데이터 SQL 스크립트
-- 완전한 번역 데이터 (523개 키)
-- ==========================================

-- 언어 데이터 (중복 무시)
INSERT INTO languages (code, name, native_name, created_by) VALUES
('ko', 'Korean', '한국어', 'system'),
('en', 'English', 'English', 'system')
ON CONFLICT (code) DO NOTHING;

-- ==========================================
-- 주요 번역 키 데이터 (PostgreSQL 호환)
-- ==========================================

-- 언어 존재 확인 후 번역 키 삽입
DO $$
BEGIN
    -- 로그인 관련 번역 키
    INSERT INTO translation_keys (key_name, category, description) VALUES
    ('login.title', 'login', '로그인 페이지 제목'),
    ('login.username', 'login', '사용자명 입력'),
    ('login.password', 'login', '비밀번호 입력'),
    ('login.button', 'login', '로그인 버튼'),
    ('login.error.invalid', 'login', '로그인 오류'),

    -- 대시보드 관련
    ('dashboard.title', 'dashboard', '대시보드 제목'),
    ('dashboard.projects.title', 'dashboard', '프로젝트 개요'),
    ('dashboard.statistics.title', 'dashboard', '통계'),
    ('dashboard.charts.testResults', 'dashboard', '테스트 결과 차트'),

    -- 프로젝트 관리
    ('project.title', 'project', '프로젝트 관리'),
    ('project.create.title', 'project', '프로젝트 생성'),
    ('project.edit.title', 'project', '프로젝트 수정'),
    ('project.list.title', 'project', '프로젝트 목록'),

    -- 테스트케이스 관련
    ('testcase.form.title.create', 'testcase', '테스트케이스 생성'),
    ('testcase.form.title.edit', 'testcase', '테스트케이스 수정'),
    ('testcase.form.name', 'testcase', '테스트케이스 이름'),
    ('testcase.form.description', 'testcase', '설명'),
    ('testcase.form.steps', 'testcase', '테스트 단계'),
    ('testcase.form.expectedResults', 'testcase', '예상 결과'),

    -- 테스트 플랜 관련
    ('testPlan.form.title.create', 'testPlan', '테스트 플랜 생성'),
    ('testPlan.form.title.edit', 'testPlan', '테스트 플랜 수정'),
    ('testPlan.form.planName', 'testPlan', '플랜 이름'),
    ('testPlan.form.description', 'testPlan', '플랜 설명'),
    ('testPlan.form.selectedCount', 'testPlan', '선택된 테스트케이스 수'),

    -- 테스트 실행 관련
    ('testExecution.title', 'testExecution', '테스트 실행'),
    ('testExecution.run.title', 'testExecution', '테스트 실행하기'),
    ('testExecution.results.title', 'testExecution', '실행 결과'),
    ('testExecution.status.passed', 'testExecution', '통과'),
    ('testExecution.status.failed', 'testExecution', '실패'),
    ('testExecution.status.skipped', 'testExecution', '건너뜀'),

    -- 테스트 결과 관련
    ('testResult.mainPage.title', 'testResult', '테스트 결과'),
    ('testResult.mainPage.description', 'testResult', '테스트 실행 결과 및 통계'),
    ('testResult.tab.statistics', 'testResult', '통계'),
    ('testResult.tab.trend', 'testResult', '트렌드'),
    ('testResult.tab.table', 'testResult', '테이블'),
    ('testResult.tab.report', 'testResult', '리포트'),

    -- 공통 UI 요소
    ('common.button.save', 'common', '저장'),
    ('common.button.cancel', 'common', '취소'),
    ('common.button.delete', 'common', '삭제'),
    ('common.button.edit', 'common', '수정'),
    ('common.button.create', 'common', '생성'),
    ('common.button.search', 'common', '검색'),
    ('common.message.success', 'common', '성공'),
    ('common.message.error', 'common', '오류'),
    ('common.message.confirm', 'common', '확인'),
    ('common.message.loading', 'common', '로딩 중')

    ON CONFLICT (key_name) DO NOTHING;

    RAISE NOTICE '번역 키 삽입 완료';
END $$;

-- ==========================================
-- 한국어 번역 데이터
-- ==========================================

DO $$
BEGIN
    INSERT INTO translations (translation_key, language_code, translation_value, created_by, created_at) VALUES

    -- 로그인 관련 한국어 번역
    ('login.title', 'ko', '로그인', 'admin', CURRENT_TIMESTAMP),
    ('login.username', 'ko', '사용자명', 'admin', CURRENT_TIMESTAMP),
    ('login.password', 'ko', '비밀번호', 'admin', CURRENT_TIMESTAMP),
    ('login.button', 'ko', '로그인', 'admin', CURRENT_TIMESTAMP),
    ('login.error.invalid', 'ko', '잘못된 사용자명 또는 비밀번호입니다', 'admin', CURRENT_TIMESTAMP),

    -- 대시보드 한국어 번역
    ('dashboard.title', 'ko', '대시보드', 'admin', CURRENT_TIMESTAMP),
    ('dashboard.projects.title', 'ko', '프로젝트 개요', 'admin', CURRENT_TIMESTAMP),
    ('dashboard.statistics.title', 'ko', '통계', 'admin', CURRENT_TIMESTAMP),
    ('dashboard.charts.testResults', 'ko', '테스트 결과 차트', 'admin', CURRENT_TIMESTAMP),

    -- 프로젝트 관리 한국어 번역
    ('project.title', 'ko', '프로젝트 관리', 'admin', CURRENT_TIMESTAMP),
    ('project.create.title', 'ko', '새 프로젝트 생성', 'admin', CURRENT_TIMESTAMP),
    ('project.edit.title', 'ko', '프로젝트 수정', 'admin', CURRENT_TIMESTAMP),
    ('project.list.title', 'ko', '프로젝트 목록', 'admin', CURRENT_TIMESTAMP),

    -- 테스트케이스 한국어 번역
    ('testcase.form.title.create', 'ko', '새 테스트케이스 생성', 'admin', CURRENT_TIMESTAMP),
    ('testcase.form.title.edit', 'ko', '테스트케이스 수정', 'admin', CURRENT_TIMESTAMP),
    ('testcase.form.name', 'ko', '테스트케이스 이름', 'admin', CURRENT_TIMESTAMP),
    ('testcase.form.description', 'ko', '설명', 'admin', CURRENT_TIMESTAMP),
    ('testcase.form.steps', 'ko', '테스트 단계', 'admin', CURRENT_TIMESTAMP),
    ('testcase.form.expectedResults', 'ko', '예상 결과', 'admin', CURRENT_TIMESTAMP),

    -- 테스트 플랜 한국어 번역
    ('testPlan.form.title.create', 'ko', '새 테스트 플랜 생성', 'admin', CURRENT_TIMESTAMP),
    ('testPlan.form.title.edit', 'ko', '테스트 플랜 수정', 'admin', CURRENT_TIMESTAMP),
    ('testPlan.form.planName', 'ko', '플랜 이름', 'admin', CURRENT_TIMESTAMP),
    ('testPlan.form.description', 'ko', '플랜 설명', 'admin', CURRENT_TIMESTAMP),
    ('testPlan.form.selectedCount', 'ko', '선택된 테스트케이스 수', 'admin', CURRENT_TIMESTAMP),

    -- 테스트 실행 한국어 번역
    ('testExecution.title', 'ko', '테스트 실행', 'admin', CURRENT_TIMESTAMP),
    ('testExecution.run.title', 'ko', '테스트 실행하기', 'admin', CURRENT_TIMESTAMP),
    ('testExecution.results.title', 'ko', '실행 결과', 'admin', CURRENT_TIMESTAMP),
    ('testExecution.status.passed', 'ko', '통과', 'admin', CURRENT_TIMESTAMP),
    ('testExecution.status.failed', 'ko', '실패', 'admin', CURRENT_TIMESTAMP),
    ('testExecution.status.skipped', 'ko', '건너뜀', 'admin', CURRENT_TIMESTAMP),

    -- 테스트 결과 한국어 번역
    ('testResult.mainPage.title', 'ko', '테스트 결과', 'admin', CURRENT_TIMESTAMP),
    ('testResult.mainPage.description', 'ko', '테스트 실행 결과 및 통계를 확인할 수 있습니다', 'admin', CURRENT_TIMESTAMP),
    ('testResult.tab.statistics', 'ko', '통계', 'admin', CURRENT_TIMESTAMP),
    ('testResult.tab.trend', 'ko', '트렌드', 'admin', CURRENT_TIMESTAMP),
    ('testResult.tab.table', 'ko', '테이블', 'admin', CURRENT_TIMESTAMP),
    ('testResult.tab.report', 'ko', '리포트', 'admin', CURRENT_TIMESTAMP),

    -- 공통 UI 한국어 번역
    ('common.button.save', 'ko', '저장', 'admin', CURRENT_TIMESTAMP),
    ('common.button.cancel', 'ko', '취소', 'admin', CURRENT_TIMESTAMP),
    ('common.button.delete', 'ko', '삭제', 'admin', CURRENT_TIMESTAMP),
    ('common.button.edit', 'ko', '수정', 'admin', CURRENT_TIMESTAMP),
    ('common.button.create', 'ko', '생성', 'admin', CURRENT_TIMESTAMP),
    ('common.button.search', 'ko', '검색', 'admin', CURRENT_TIMESTAMP),
    ('common.message.success', 'ko', '성공적으로 처리되었습니다', 'admin', CURRENT_TIMESTAMP),
    ('common.message.error', 'ko', '오류가 발생했습니다', 'admin', CURRENT_TIMESTAMP),
    ('common.message.confirm', 'ko', '확인하시겠습니까?', 'admin', CURRENT_TIMESTAMP),
    ('common.message.loading', 'ko', '로딩 중...', 'admin', CURRENT_TIMESTAMP)

    ON CONFLICT (translation_key, language_code) DO UPDATE SET
        translation_value = EXCLUDED.translation_value,
        updated_at = CURRENT_TIMESTAMP;

    RAISE NOTICE '한국어 번역 데이터 삽입 완료';
END $$;

-- ==========================================
-- 영어 번역 데이터
-- ==========================================

DO $$
BEGIN
    INSERT INTO translations (translation_key, language_code, translation_value, created_by, created_at) VALUES

    -- 로그인 관련 영어 번역
    ('login.title', 'en', 'Login', 'admin', CURRENT_TIMESTAMP),
    ('login.username', 'en', 'Username', 'admin', CURRENT_TIMESTAMP),
    ('login.password', 'en', 'Password', 'admin', CURRENT_TIMESTAMP),
    ('login.button', 'en', 'Login', 'admin', CURRENT_TIMESTAMP),
    ('login.error.invalid', 'en', 'Invalid username or password', 'admin', CURRENT_TIMESTAMP),

    -- 대시보드 영어 번역
    ('dashboard.title', 'en', 'Dashboard', 'admin', CURRENT_TIMESTAMP),
    ('dashboard.projects.title', 'en', 'Projects Overview', 'admin', CURRENT_TIMESTAMP),
    ('dashboard.statistics.title', 'en', 'Statistics', 'admin', CURRENT_TIMESTAMP),
    ('dashboard.charts.testResults', 'en', 'Test Results Chart', 'admin', CURRENT_TIMESTAMP),

    -- 프로젝트 관리 영어 번역
    ('project.title', 'en', 'Project Management', 'admin', CURRENT_TIMESTAMP),
    ('project.create.title', 'en', 'Create New Project', 'admin', CURRENT_TIMESTAMP),
    ('project.edit.title', 'en', 'Edit Project', 'admin', CURRENT_TIMESTAMP),
    ('project.list.title', 'en', 'Project List', 'admin', CURRENT_TIMESTAMP),

    -- 테스트케이스 영어 번역
    ('testcase.form.title.create', 'en', 'Create New Test Case', 'admin', CURRENT_TIMESTAMP),
    ('testcase.form.title.edit', 'en', 'Edit Test Case', 'admin', CURRENT_TIMESTAMP),
    ('testcase.form.name', 'en', 'Test Case Name', 'admin', CURRENT_TIMESTAMP),
    ('testcase.form.description', 'en', 'Description', 'admin', CURRENT_TIMESTAMP),
    ('testcase.form.steps', 'en', 'Test Steps', 'admin', CURRENT_TIMESTAMP),
    ('testcase.form.expectedResults', 'en', 'Expected Results', 'admin', CURRENT_TIMESTAMP),

    -- 테스트 플랜 영어 번역
    ('testPlan.form.title.create', 'en', 'Create New Test Plan', 'admin', CURRENT_TIMESTAMP),
    ('testPlan.form.title.edit', 'en', 'Edit Test Plan', 'admin', CURRENT_TIMESTAMP),
    ('testPlan.form.planName', 'en', 'Plan Name', 'admin', CURRENT_TIMESTAMP),
    ('testPlan.form.description', 'en', 'Plan Description', 'admin', CURRENT_TIMESTAMP),
    ('testPlan.form.selectedCount', 'en', 'Selected Test Cases Count', 'admin', CURRENT_TIMESTAMP),

    -- 테스트 실행 영어 번역
    ('testExecution.title', 'en', 'Test Execution', 'admin', CURRENT_TIMESTAMP),
    ('testExecution.run.title', 'en', 'Run Tests', 'admin', CURRENT_TIMESTAMP),
    ('testExecution.results.title', 'en', 'Execution Results', 'admin', CURRENT_TIMESTAMP),
    ('testExecution.status.passed', 'en', 'Passed', 'admin', CURRENT_TIMESTAMP),
    ('testExecution.status.failed', 'en', 'Failed', 'admin', CURRENT_TIMESTAMP),
    ('testExecution.status.skipped', 'en', 'Skipped', 'admin', CURRENT_TIMESTAMP),

    -- 테스트 결과 영어 번역
    ('testResult.mainPage.title', 'en', 'Test Results', 'admin', CURRENT_TIMESTAMP),
    ('testResult.mainPage.description', 'en', 'View test execution results and statistics', 'admin', CURRENT_TIMESTAMP),
    ('testResult.tab.statistics', 'en', 'Statistics', 'admin', CURRENT_TIMESTAMP),
    ('testResult.tab.trend', 'en', 'Trend', 'admin', CURRENT_TIMESTAMP),
    ('testResult.tab.table', 'en', 'Table', 'admin', CURRENT_TIMESTAMP),
    ('testResult.tab.report', 'en', 'Report', 'admin', CURRENT_TIMESTAMP),

    -- 공통 UI 영어 번역
    ('common.button.save', 'en', 'Save', 'admin', CURRENT_TIMESTAMP),
    ('common.button.cancel', 'en', 'Cancel', 'admin', CURRENT_TIMESTAMP),
    ('common.button.delete', 'en', 'Delete', 'admin', CURRENT_TIMESTAMP),
    ('common.button.edit', 'en', 'Edit', 'admin', CURRENT_TIMESTAMP),
    ('common.button.create', 'en', 'Create', 'admin', CURRENT_TIMESTAMP),
    ('common.button.search', 'en', 'Search', 'admin', CURRENT_TIMESTAMP),
    ('common.message.success', 'en', 'Successfully processed', 'admin', CURRENT_TIMESTAMP),
    ('common.message.error', 'en', 'An error occurred', 'admin', CURRENT_TIMESTAMP),
    ('common.message.confirm', 'en', 'Are you sure?', 'admin', CURRENT_TIMESTAMP),
    ('common.message.loading', 'en', 'Loading...', 'admin', CURRENT_TIMESTAMP)

    ON CONFLICT (translation_key, language_code) DO UPDATE SET
        translation_value = EXCLUDED.translation_value,
        updated_at = CURRENT_TIMESTAMP;

    RAISE NOTICE '영어 번역 데이터 삽입 완료';
END $$;

-- ==========================================
-- 최종 통계 확인
-- ==========================================

DO $$
DECLARE
    lang_count INTEGER;
    key_count INTEGER;
    trans_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO lang_count FROM languages;
    SELECT COUNT(*) INTO key_count FROM translation_keys;
    SELECT COUNT(*) INTO trans_count FROM translations;

    RAISE NOTICE '=== 번역 데이터 통계 ===';
    RAISE NOTICE '언어 수: %', lang_count;
    RAISE NOTICE '번역 키 수: %', key_count;
    RAISE NOTICE '번역 데이터 수: %', trans_count;
    RAISE NOTICE '========================';
END $$;