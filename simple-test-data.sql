-- simple-test-data.sql
-- ICT-265: 간단한 테스트 데이터 생성

-- 1. 현재 프로젝트 확인
SELECT 'Current Projects' as info;
SELECT id, name FROM projects;

-- 2. 기존 데이터 확인
SELECT 'Existing TestCases' as info;
SELECT COUNT(*) as count FROM testcases;

SELECT 'Existing TestPlans' as info;
SELECT COUNT(*) as count FROM test_plans;

SELECT 'Existing TestExecutions' as info;
SELECT COUNT(*) as count FROM test_executions;

SELECT 'Existing TestResults' as info;
SELECT COUNT(*) as count FROM test_results;

-- 3. 테스트케이스 10개 생성 (9de93d4e-24e7-4237-9f75-23c1522991a3 프로젝트용)
INSERT INTO testcases (id, name, type, description, priority, status, project_id, created_at, updated_at, display_order, execution_time) VALUES
('simple-tc-001', 'SIMPLE-TC-001', 'MANUAL', '간단한 테스트케이스 #1', 'HIGH', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 30),
('simple-tc-002', 'SIMPLE-TC-002', 'MANUAL', '간단한 테스트케이스 #2', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2, 35),
('simple-tc-003', 'SIMPLE-TC-003', 'MANUAL', '간단한 테스트케이스 #3', 'LOW', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 3, 40),
('simple-tc-004', 'SIMPLE-TC-004', 'MANUAL', '간단한 테스트케이스 #4', 'HIGH', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 4, 45),
('simple-tc-005', 'SIMPLE-TC-005', 'MANUAL', '간단한 테스트케이스 #5', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 5, 50),
('simple-tc-006', 'SIMPLE-TC-006', 'MANUAL', '간단한 테스트케이스 #6', 'LOW', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 6, 55),
('simple-tc-007', 'SIMPLE-TC-007', 'MANUAL', '간단한 테스트케이스 #7', 'HIGH', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 7, 60),
('simple-tc-008', 'SIMPLE-TC-008', 'MANUAL', '간단한 테스트케이스 #8', 'MEDIUM', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 8, 65),
('simple-tc-009', 'SIMPLE-TC-009', 'MANUAL', '간단한 테스트케이스 #9', 'LOW', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 9, 70),
('simple-tc-010', 'SIMPLE-TC-010', 'MANUAL', '간단한 테스트케이스 #10', 'HIGH', 'ACTIVE', '9de93d4e-24e7-4237-9f75-23c1522991a3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 10, 75);

-- 4. 테스트플랜 2개 생성
INSERT INTO test_plans (id, name, description, project_id, status, created_at, updated_at) VALUES
('simple-plan-001', 'SIMPLE-플랜-001', '간단한 테스트플랜 #1', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('simple-plan-002', 'SIMPLE-플랜-002', '간단한 테스트플랜 #2', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 5. 테스트실행 2개 생성
INSERT INTO test_executions (id, name, description, project_id, test_plan_id, status, created_at, updated_at) VALUES
('simple-exec-001', 'SIMPLE-실행-001', '간단한 테스트실행 #1', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'simple-plan-001', 'INPROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('simple-exec-002', 'SIMPLE-실행-002', '간단한 테스트실행 #2', '9de93d4e-24e7-4237-9f75-23c1522991a3', 'simple-plan-002', 'INPROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 6. 테스트 결과 생성 (중복 포함)
-- 첫 번째 실행의 결과들 (초기)
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at) VALUES
('simple-result-1-old', 'simple-exec-001', 'simple-tc-001', 'PASS', DATEADD('HOUR', -2, CURRENT_TIMESTAMP), 'ICT-265 테스트 - 초기 결과', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('simple-result-2-old', 'simple-exec-001', 'simple-tc-002', 'FAIL', DATEADD('HOUR', -2, CURRENT_TIMESTAMP), 'ICT-265 테스트 - 초기 결과', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('simple-result-3-old', 'simple-exec-001', 'simple-tc-003', 'BLOCKED', DATEADD('HOUR', -2, CURRENT_TIMESTAMP), 'ICT-265 테스트 - 초기 결과', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('simple-result-4-old', 'simple-exec-001', 'simple-tc-004', 'SKIPPED', DATEADD('HOUR', -2, CURRENT_TIMESTAMP), 'ICT-265 테스트 - 초기 결과', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('simple-result-5-old', 'simple-exec-001', 'simple-tc-005', 'PASS', DATEADD('HOUR', -2, CURRENT_TIMESTAMP), 'ICT-265 테스트 - 초기 결과', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 두 번째 실행의 결과들 (중복 - 제거되어야 함)
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at) VALUES
('simple-result-1-mid', 'simple-exec-001', 'simple-tc-001', 'FAIL', DATEADD('HOUR', -1, CURRENT_TIMESTAMP), 'ICT-265 테스트 - 중간 결과 (중복 제거 대상)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('simple-result-2-mid', 'simple-exec-001', 'simple-tc-002', 'PASS', DATEADD('HOUR', -1, CURRENT_TIMESTAMP), 'ICT-265 테스트 - 중간 결과 (중복 제거 대상)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('simple-result-3-mid', 'simple-exec-001', 'simple-tc-003', 'SKIPPED', DATEADD('HOUR', -1, CURRENT_TIMESTAMP), 'ICT-265 테스트 - 중간 결과 (중복 제거 대상)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 세 번째 실행의 결과들 (최신 - 최종 결과)
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at) VALUES
('simple-result-1-new', 'simple-exec-001', 'simple-tc-001', 'PASS', CURRENT_TIMESTAMP, 'ICT-265 테스트 - 최신 결과 (최종)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('simple-result-2-new', 'simple-exec-001', 'simple-tc-002', 'FAIL', CURRENT_TIMESTAMP, 'ICT-265 테스트 - 최신 결과 (최종)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('simple-result-3-new', 'simple-exec-001', 'simple-tc-003', 'PASS', CURRENT_TIMESTAMP, 'ICT-265 테스트 - 최신 결과 (최종)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('simple-result-4-new', 'simple-exec-001', 'simple-tc-004', 'FAIL', CURRENT_TIMESTAMP, 'ICT-265 테스트 - 최신 결과 (최종)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('simple-result-5-new', 'simple-exec-001', 'simple-tc-005', 'PASS', CURRENT_TIMESTAMP, 'ICT-265 테스트 - 최신 결과 (최종)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('simple-result-6-new', 'simple-exec-001', 'simple-tc-006', 'BLOCKED', CURRENT_TIMESTAMP, 'ICT-265 테스트 - 최신 결과 (최종)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('simple-result-7-new', 'simple-exec-001', 'simple-tc-007', 'SKIPPED', CURRENT_TIMESTAMP, 'ICT-265 테스트 - 최신 결과 (최종)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('simple-result-8-new', 'simple-exec-001', 'simple-tc-008', 'PASS', CURRENT_TIMESTAMP, 'ICT-265 테스트 - 최신 결과 (최종)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 7. 생성 결과 확인
SELECT '=== 데이터 생성 완료 ===' as message;

SELECT 'Created TestCases' as info;
SELECT COUNT(*) as count FROM testcases WHERE name LIKE 'SIMPLE%';

SELECT 'Created TestPlans' as info;
SELECT COUNT(*) as count FROM test_plans WHERE name LIKE 'SIMPLE%';

SELECT 'Created TestExecutions' as info;
SELECT COUNT(*) as count FROM test_executions WHERE name LIKE 'SIMPLE%';

SELECT 'Created TestResults' as info;
SELECT COUNT(*) as count FROM test_results WHERE notes LIKE '%ICT-265%';

-- 8. 중복 데이터 확인
SELECT '=== 중복 데이터 분석 ===' as message;
SELECT 
    test_execution_id,
    test_case_id,
    COUNT(*) as result_count,
    MIN(executed_at) as earliest,
    MAX(executed_at) as latest,
    GROUP_CONCAT(result) as all_results
FROM test_results 
WHERE test_execution_id = 'simple-exec-001'
GROUP BY test_execution_id, test_case_id 
HAVING COUNT(*) > 1
ORDER BY result_count DESC;