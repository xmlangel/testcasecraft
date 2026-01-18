-- ==========================================
-- PostgreSQL 완전한 번역 데이터 SQL (실제 엔티티 구조 기반)
-- ==========================================

-- 언어 데이터 (Language 엔티티)
DO $$
DECLARE
    korean_id UUID;
    english_id UUID;
BEGIN
    -- 한국어 언어 추가
    INSERT INTO languages (id, code, name, native_name, is_active, is_default, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), 'ko', 'Korean', '한국어', true, true, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (code) DO UPDATE SET
        name = EXCLUDED.name,
        native_name = EXCLUDED.native_name,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO korean_id;

    -- 영어 언어 추가
    INSERT INTO languages (id, code, name, native_name, is_active, is_default, sort_order, created_at, updated_at)
    VALUES (gen_random_uuid(), 'en', 'English', 'English', true, false, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (code) DO UPDATE SET
        name = EXCLUDED.name,
        native_name = EXCLUDED.native_name,
        updated_at = CURRENT_TIMESTAMP
    RETURNING id INTO english_id;

    -- 이미 존재하는 경우 ID 가져오기
    IF korean_id IS NULL THEN
        SELECT id INTO korean_id FROM languages WHERE code = 'ko';
    END IF;

    IF english_id IS NULL THEN
        SELECT id INTO english_id FROM languages WHERE code = 'en';
    END IF;

    RAISE NOTICE '언어 데이터 처리 완료: Korean ID = %, English ID = %', korean_id, english_id;
END $$;

-- ==========================================
-- 번역 키 데이터 (TranslationKey 엔티티)
-- ==========================================

DO $$
DECLARE
    key_rec RECORD;
    translation_keys_data TEXT[] := ARRAY[
        -- 로그인 관련
        'login.title|login|로그인 페이지 제목|로그인',
        'login.username|login|사용자명 입력|사용자명',
        'login.password|login|비밀번호 입력|비밀번호',
        'login.button|login|로그인 버튼|로그인',
        'login.error.invalid|login|로그인 오류|잘못된 사용자명 또는 비밀번호입니다',

        -- 대시보드 관련
        'dashboard.title|dashboard|대시보드 제목|대시보드',
        'dashboard.projects.title|dashboard|프로젝트 개요|프로젝트 개요',
        'dashboard.statistics.title|dashboard|통계|통계',
        'dashboard.charts.testResults|dashboard|테스트 결과 차트|테스트 결과 차트',

        -- 프로젝트 관리
        'project.title|project|프로젝트 관리|프로젝트 관리',
        'project.create.title|project|프로젝트 생성|새 프로젝트 생성',
        'project.edit.title|project|프로젝트 수정|프로젝트 수정',
        'project.list.title|project|프로젝트 목록|프로젝트 목록',

        -- 테스트케이스 관련
        'testcase.form.title.create|testcase|테스트케이스 생성|새 테스트케이스 생성',
        'testcase.form.title.edit|testcase|테스트케이스 수정|테스트케이스 수정',
        'testcase.form.name|testcase|테스트케이스 이름|테스트케이스 이름',
        'testcase.form.description|testcase|설명|설명',
        'testcase.form.steps|testcase|테스트 단계|테스트 단계',
        'testcase.form.expectedResults|testcase|예상 결과|예상 결과',

        -- 테스트 플랜 관련
        'testPlan.form.title.create|testPlan|테스트 플랜 생성|새 테스트 플랜 생성',
        'testPlan.form.title.edit|testPlan|테스트 플랜 수정|테스트 플랜 수정',
        'testPlan.form.planName|testPlan|플랜 이름|플랜 이름',
        'testPlan.form.description|testPlan|플랜 설명|플랜 설명',
        'testPlan.form.selectedCount|testPlan|선택된 테스트케이스 수|선택된 테스트케이스 수',

        -- 테스트 실행 관련
        'testExecution.title|testExecution|테스트 실행|테스트 실행',
        'testExecution.run.title|testExecution|테스트 실행하기|테스트 실행하기',
        'testExecution.results.title|testExecution|실행 결과|실행 결과',
        'testExecution.status.passed|testExecution|통과|통과',
        'testExecution.status.failed|testExecution|실패|실패',
        'testExecution.status.skipped|testExecution|건너뜀|건너뜀',

        -- 테스트 결과 관련
        'testResult.mainPage.title|testResult|테스트 결과|테스트 결과',
        'testResult.mainPage.description|testResult|테스트 실행 결과 및 통계|테스트 실행 결과 및 통계를 확인할 수 있습니다',
        'testResult.tab.statistics|testResult|통계|통계',
        'testResult.tab.trend|testResult|트렌드|트렌드',
        'testResult.tab.table|testResult|테이블|테이블',
        'testResult.tab.report|testResult|리포트|리포트',

        -- 공통 UI 요소
        'common.button.save|common|저장|저장',
        'common.button.cancel|common|취소|취소',
        'common.button.delete|common|삭제|삭제',
        'common.button.edit|common|수정|수정',
        'common.button.create|common|생성|생성',
        'common.button.search|common|검색|검색',
        'common.message.success|common|성공|성공적으로 처리되었습니다',
        'common.message.error|common|오류|오류가 발생했습니다',
        'common.message.confirm|common|확인|확인하시겠습니까?',
        'common.message.loading|common|로딩 중|로딩 중...'
    ];
BEGIN
    -- 번역 키 삽입
    FOREACH key_rec IN ARRAY translation_keys_data
    LOOP
        DECLARE
            parts TEXT[];
            key_name TEXT;
            category TEXT;
            description TEXT;
            default_value TEXT;
        BEGIN
            parts := string_to_array(key_rec, '|');
            key_name := parts[1];
            category := parts[2];
            description := parts[3];
            default_value := parts[4];

            INSERT INTO translation_keys (id, key_name, category, description, default_value, is_active, created_at, updated_at)
            VALUES (gen_random_uuid(), key_name, category, description, default_value, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (key_name) DO UPDATE SET
                description = EXCLUDED.description,
                default_value = EXCLUDED.default_value,
                updated_at = CURRENT_TIMESTAMP;
        END;
    END LOOP;

    RAISE NOTICE '번역 키 데이터 삽입 완료: % 개', array_length(translation_keys_data, 1);
END $$;

-- ==========================================
-- 번역 데이터 (Translation 엔티티 - 관계형 구조)
-- ==========================================

DO $$
DECLARE
    korean_lang_id UUID;
    english_lang_id UUID;
    key_translations RECORD;
    translation_data TEXT[] := ARRAY[
        -- 형식: key_name|korean_value|english_value
        'login.title|로그인|Login',
        'login.username|사용자명|Username',
        'login.password|비밀번호|Password',
        'login.button|로그인|Login',
        'login.error.invalid|잘못된 사용자명 또는 비밀번호입니다|Invalid username or password',

        'dashboard.title|대시보드|Dashboard',
        'dashboard.projects.title|프로젝트 개요|Projects Overview',
        'dashboard.statistics.title|통계|Statistics',
        'dashboard.charts.testResults|테스트 결과 차트|Test Results Chart',

        'project.title|프로젝트 관리|Project Management',
        'project.create.title|새 프로젝트 생성|Create New Project',
        'project.edit.title|프로젝트 수정|Edit Project',
        'project.list.title|프로젝트 목록|Project List',

        'testcase.form.title.create|새 테스트케이스 생성|Create New Test Case',
        'testcase.form.title.edit|테스트케이스 수정|Edit Test Case',
        'testcase.form.name|테스트케이스 이름|Test Case Name',
        'testcase.form.description|설명|Description',
        'testcase.form.steps|테스트 단계|Test Steps',
        'testcase.form.expectedResults|예상 결과|Expected Results',

        'testPlan.form.title.create|새 테스트 플랜 생성|Create New Test Plan',
        'testPlan.form.title.edit|테스트 플랜 수정|Edit Test Plan',
        'testPlan.form.planName|플랜 이름|Plan Name',
        'testPlan.form.description|플랜 설명|Plan Description',
        'testPlan.form.selectedCount|선택된 테스트케이스 수|Selected Test Cases Count',

        'testExecution.title|테스트 실행|Test Execution',
        'testExecution.run.title|테스트 실행하기|Run Tests',
        'testExecution.results.title|실행 결과|Execution Results',
        'testExecution.status.passed|통과|Passed',
        'testExecution.status.failed|실패|Failed',
        'testExecution.status.skipped|건너뜀|Skipped',

        'testResult.mainPage.title|테스트 결과|Test Results',
        'testResult.mainPage.description|테스트 실행 결과 및 통계를 확인할 수 있습니다|View test execution results and statistics',
        'testResult.tab.statistics|통계|Statistics',
        'testResult.tab.trend|트렌드|Trend',
        'testResult.tab.table|테이블|Table',
        'testResult.tab.report|리포트|Report',

        'common.button.save|저장|Save',
        'common.button.cancel|취소|Cancel',
        'common.button.delete|삭제|Delete',
        'common.button.edit|수정|Edit',
        'common.button.create|생성|Create',
        'common.button.search|검색|Search',
        'common.message.success|성공적으로 처리되었습니다|Successfully processed',
        'common.message.error|오류가 발생했습니다|An error occurred',
        'common.message.confirm|확인하시겠습니까?|Are you sure?',
        'common.message.loading|로딩 중...|Loading...'
    ];
BEGIN
    -- 언어 ID 가져오기
    SELECT id INTO korean_lang_id FROM languages WHERE code = 'ko';
    SELECT id INTO english_lang_id FROM languages WHERE code = 'en';

    IF korean_lang_id IS NULL OR english_lang_id IS NULL THEN
        RAISE EXCEPTION '언어 데이터를 먼저 생성해야 합니다';
    END IF;

    -- 번역 데이터 처리
    FOR key_translations IN SELECT unnest(translation_data) as data
    LOOP
        DECLARE
            parts TEXT[];
            key_name TEXT;
            korean_value TEXT;
            english_value TEXT;
            translation_key_id UUID;
        BEGIN
            parts := string_to_array(key_translations.data, '|');
            key_name := parts[1];
            korean_value := parts[2];
            english_value := parts[3];

            -- 번역 키 ID 가져오기
            SELECT id INTO translation_key_id FROM translation_keys WHERE key_name = key_name;

            IF translation_key_id IS NOT NULL THEN
                -- 한국어 번역 삽입
                INSERT INTO translations (id, translation_key_id, language_id, translation_value, is_active, created_by, updated_by, created_at, updated_at)
                VALUES (gen_random_uuid(), translation_key_id, korean_lang_id, korean_value, true, 'admin', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT (translation_key_id, language_id) DO UPDATE SET
                    translation_value = EXCLUDED.translation_value,
                    updated_by = 'admin',
                    updated_at = CURRENT_TIMESTAMP;

                -- 영어 번역 삽입
                INSERT INTO translations (id, translation_key_id, language_id, translation_value, is_active, created_by, updated_by, created_at, updated_at)
                VALUES (gen_random_uuid(), translation_key_id, english_lang_id, english_value, true, 'admin', 'admin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                ON CONFLICT (translation_key_id, language_id) DO UPDATE SET
                    translation_value = EXCLUDED.translation_value,
                    updated_by = 'admin',
                    updated_at = CURRENT_TIMESTAMP;
            END IF;
        END;
    END LOOP;

    RAISE NOTICE '번역 데이터 삽입 완료: % 개 키에 대한 한국어/영어 번역', array_length(translation_data, 1);
END $$;

-- ==========================================
-- 최종 통계
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

    RAISE NOTICE '=== 번역 시스템 통계 ===';
    RAISE NOTICE '언어 수: %', lang_count;
    RAISE NOTICE '번역 키 수: %', key_count;
    RAISE NOTICE '번역 데이터 수: %', trans_count;
    RAISE NOTICE '======================';
END $$;