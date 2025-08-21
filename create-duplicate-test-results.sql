-- create-duplicate-test-results.sql
-- ICT-265: 중복 테스트 결과 데이터 생성 (H2 콘솔용)

-- 1. 먼저 현재 데이터 확인
SELECT 'Current Project Data' as info;
SELECT id, name FROM projects;

SELECT 'Current TestCase Data' as info;  
SELECT id, name, project_id FROM testcases WHERE name LIKE 'ICT265%' ORDER BY name;

-- 2. 테스트 플랜 및 실행 데이터 직접 생성
-- 임시 테스트 플랜 생성
INSERT INTO test_plans (id, name, description, project_id, status, created_at, updated_at) 
VALUES 
('ict265-plan-001', 'ICT265_테스트플랜_1', 'ICT-265 중복 검증용 테스트플랜 1', 
 (SELECT id FROM projects LIMIT 1), 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ict265-plan-002', 'ICT265_테스트플랜_2', 'ICT-265 중복 검증용 테스트플랜 2', 
 (SELECT id FROM projects LIMIT 1), 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 테스트 실행 생성
INSERT INTO test_executions (id, name, description, project_id, test_plan_id, status, created_at, updated_at)
VALUES 
('ict265-exec-001', 'ICT265_테스트실행_1', 'ICT-265 중복 검증용 테스트실행 1',
 (SELECT id FROM projects LIMIT 1), 'ict265-plan-001', 'INPROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ict265-exec-002', 'ICT265_테스트실행_2', 'ICT-265 중복 검증용 테스트실행 2',
 (SELECT id FROM projects LIMIT 1), 'ict265-plan-002', 'INPROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. 중복 테스트 결과 데이터 생성
-- 시나리오: 동일한 execution_id + test_case_id 조합에 대해 
-- 다른 시간대에 여러 번 실행된 결과가 있는 상황

-- 첫 번째 실행의 결과들 (초기 실행)
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
SELECT 
    'result-' || ROW_NUMBER() OVER() || '-initial',
    'ict265-exec-001',
    tc.id,
    CASE 
        WHEN ROW_NUMBER() OVER() % 4 = 1 THEN 'PASS'
        WHEN ROW_NUMBER() OVER() % 4 = 2 THEN 'FAIL' 
        WHEN ROW_NUMBER() OVER() % 4 = 3 THEN 'BLOCKED'
        ELSE 'SKIPPED'
    END,
    DATEADD('HOUR', -2, CURRENT_TIMESTAMP), -- 2시간 전 실행
    'ICT-265 초기 실행 결과 #' || ROW_NUMBER() OVER(),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (SELECT id FROM testcases WHERE name LIKE 'ICT265%' LIMIT 10) tc;

-- 두 번째 실행의 결과들 (중간 실행 - 이것들은 중복 제거되어야 함)
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
SELECT 
    'result-' || ROW_NUMBER() OVER() || '-middle',
    'ict265-exec-001',
    tc.id,
    CASE 
        WHEN ROW_NUMBER() OVER() % 3 = 1 THEN 'FAIL'
        WHEN ROW_NUMBER() OVER() % 3 = 2 THEN 'PASS'
        ELSE 'BLOCKED'
    END,
    DATEADD('HOUR', -1, CURRENT_TIMESTAMP), -- 1시간 전 실행
    'ICT-265 중간 실행 결과 #' || ROW_NUMBER() OVER() || ' (중복 제거 대상)',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (SELECT id FROM testcases WHERE name LIKE 'ICT265%' LIMIT 8) tc;

-- 세 번째 실행의 결과들 (최신 실행 - 이것들이 최종 결과로 표시되어야 함)
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
SELECT 
    'result-' || ROW_NUMBER() OVER() || '-latest',
    'ict265-exec-001',
    tc.id,
    CASE 
        WHEN ROW_NUMBER() OVER() % 2 = 1 THEN 'PASS'
        ELSE 'FAIL'
    END,
    CURRENT_TIMESTAMP, -- 현재 시간 (최신)
    'ICT-265 최신 실행 결과 #' || ROW_NUMBER() OVER() || ' (최종 결과)',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (SELECT id FROM testcases WHERE name LIKE 'ICT265%' LIMIT 12) tc;

-- 두 번째 테스트 실행에 대한 결과들
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
SELECT 
    'result-exec2-' || ROW_NUMBER() OVER(),
    'ict265-exec-002',
    tc.id,
    CASE 
        WHEN ROW_NUMBER() OVER() % 4 = 1 THEN 'PASS'
        WHEN ROW_NUMBER() OVER() % 4 = 2 THEN 'FAIL'
        WHEN ROW_NUMBER() OVER() % 4 = 3 THEN 'BLOCKED'
        ELSE 'SKIPPED'
    END,
    DATEADD('MINUTE', -30, CURRENT_TIMESTAMP), -- 30분 전 실행
    'ICT-265 두 번째 실행 결과 #' || ROW_NUMBER() OVER(),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (SELECT id FROM testcases WHERE name LIKE 'ICT265%' LIMIT 15) tc;

-- 4. 생성된 데이터 확인
SELECT 'Test Plans Created' as info;
SELECT id, name FROM test_plans WHERE id LIKE 'ict265%';

SELECT 'Test Executions Created' as info;
SELECT id, name FROM test_executions WHERE id LIKE 'ict265%';

SELECT 'Test Results Summary' as info;
SELECT 
    test_execution_id,
    COUNT(*) as total_results,
    COUNT(DISTINCT test_case_id) as unique_test_cases,
    COUNT(*) - COUNT(DISTINCT test_case_id) as duplicate_count
FROM test_results 
WHERE test_execution_id LIKE 'ict265%' 
GROUP BY test_execution_id;

SELECT 'Duplicate Analysis for ict265-exec-001' as info;
SELECT 
    test_case_id,
    COUNT(*) as result_count,
    MIN(executed_at) as earliest_execution,
    MAX(executed_at) as latest_execution,
    STRING_AGG(result, ',') as all_results
FROM test_results 
WHERE test_execution_id = 'ict265-exec-001'
GROUP BY test_case_id 
HAVING COUNT(*) > 1
ORDER BY result_count DESC;

-- 5. ICT-265 중복 제거 검증용 쿼리
SELECT 'ICT-265 Deduplication Verification Query' as info;

-- 중복 제거 전 전체 결과 수
SELECT 'Before Deduplication' as phase, COUNT(*) as count
FROM test_results tr
JOIN test_executions te ON tr.test_execution_id = te.id
WHERE te.project_id = (SELECT id FROM projects LIMIT 1);

-- 중복 제거 후 결과 수 (최신 executed_at 기준)
WITH latest_results AS (
    SELECT 
        tr.test_execution_id,
        tr.test_case_id,
        tr.result,
        tr.executed_at,
        ROW_NUMBER() OVER (
            PARTITION BY tr.test_execution_id, tr.test_case_id 
            ORDER BY tr.executed_at DESC
        ) as rn
    FROM test_results tr
    JOIN test_executions te ON tr.test_execution_id = te.id
    WHERE te.project_id = (SELECT id FROM projects LIMIT 1)
)
SELECT 'After Deduplication' as phase, COUNT(*) as count
FROM latest_results 
WHERE rn = 1;

SELECT '=== ICT-265 테스트 데이터 생성 완료 ===' as final_message;