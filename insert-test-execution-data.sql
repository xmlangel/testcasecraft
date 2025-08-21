-- ICT-265: 테스트 실행 및 결과 데이터 생성

-- 1. 테스트 플랜 생성
INSERT INTO test_plans (id, name, description, project_id, status, created_at, updated_at) 
VALUES 
('ict265-plan-001', 'ICT265_테스트플랜_1', 'ICT-265 중복 검증용 테스트플랜 1', 
 '2c396b54-972d-47e1-9349-5d1994e50952', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ict265-plan-002', 'ICT265_테스트플랜_2', 'ICT-265 중복 검증용 테스트플랜 2', 
 '2c396b54-972d-47e1-9349-5d1994e50952', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. 테스트 실행 생성
INSERT INTO test_executions (id, name, description, project_id, test_plan_id, status, created_at, updated_at)
VALUES 
('ict265-exec-001', 'ICT265_테스트실행_1', 'ICT-265 중복 검증용 테스트실행 1',
 '2c396b54-972d-47e1-9349-5d1994e50952', 'ict265-plan-001', 'INPROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ict265-exec-002', 'ICT265_테스트실행_2', 'ICT-265 중복 검증용 테스트실행 2',
 '2c396b54-972d-47e1-9349-5d1994e50952', 'ict265-plan-002', 'INPROGRESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. 중복 테스트 결과 데이터 생성 (실제 테스트케이스 ID 사용)
-- 첫 번째 실행의 결과들 (초기 실행)
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-1-initial', 'ict265-exec-001', '00753d07-e6fe-4e0c-8ee6-c256128b2258', 'PASS', DATEADD('HOUR', -2, CURRENT_TIMESTAMP), 'ICT-265 초기 실행 결과 #1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-2-initial', 'ict265-exec-001', '09a709ea-1264-4f5f-be16-335b4d447630', 'FAIL', DATEADD('HOUR', -2, CURRENT_TIMESTAMP), 'ICT-265 초기 실행 결과 #2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-3-initial', 'ict265-exec-001', '1c76be25-f6dc-4d41-bd60-ef1ab1d75991', 'BLOCKED', DATEADD('HOUR', -2, CURRENT_TIMESTAMP), 'ICT-265 초기 실행 결과 #3', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-4-initial', 'ict265-exec-001', '25d10988-e562-4a9b-8421-d94fd6b82498', 'SKIPPED', DATEADD('HOUR', -2, CURRENT_TIMESTAMP), 'ICT-265 초기 실행 결과 #4', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-5-initial', 'ict265-exec-001', '3993c635-5499-463b-8204-e744d14baee1', 'PASS', DATEADD('HOUR', -2, CURRENT_TIMESTAMP), 'ICT-265 초기 실행 결과 #5', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-6-initial', 'ict265-exec-001', '3f6d32c6-e92a-4544-82ef-f098620028d6', 'FAIL', DATEADD('HOUR', -2, CURRENT_TIMESTAMP), 'ICT-265 초기 실행 결과 #6', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-7-initial', 'ict265-exec-001', '51a4257a-a54a-4a6d-8749-b9dcc27536ea', 'BLOCKED', DATEADD('HOUR', -2, CURRENT_TIMESTAMP), 'ICT-265 초기 실행 결과 #7', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-8-initial', 'ict265-exec-001', '5e8382d7-2d34-4bb9-b335-b72a758d689b', 'SKIPPED', DATEADD('HOUR', -2, CURRENT_TIMESTAMP), 'ICT-265 초기 실행 결과 #8', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-9-initial', 'ict265-exec-001', '62a440c8-4808-4726-99a2-223a36056e7c', 'PASS', DATEADD('HOUR', -2, CURRENT_TIMESTAMP), 'ICT-265 초기 실행 결과 #9', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-10-initial', 'ict265-exec-001', '65d73cd7-2543-4ba6-8d43-39dd6c9fa5f7', 'FAIL', DATEADD('HOUR', -2, CURRENT_TIMESTAMP), 'ICT-265 초기 실행 결과 #10', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- 두 번째 실행의 결과들 (중복 데이터 - 제거 대상)
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-1-middle', 'ict265-exec-001', '00753d07-e6fe-4e0c-8ee6-c256128b2258', 'FAIL', DATEADD('HOUR', -1, CURRENT_TIMESTAMP), 'ICT-265 중간 실행 결과 #1 (중복 제거 대상)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-2-middle', 'ict265-exec-001', '09a709ea-1264-4f5f-be16-335b4d447630', 'PASS', DATEADD('HOUR', -1, CURRENT_TIMESTAMP), 'ICT-265 중간 실행 결과 #2 (중복 제거 대상)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-3-middle', 'ict265-exec-001', '1c76be25-f6dc-4d41-bd60-ef1ab1d75991', 'BLOCKED', DATEADD('HOUR', -1, CURRENT_TIMESTAMP), 'ICT-265 중간 실행 결과 #3 (중복 제거 대상)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-4-middle', 'ict265-exec-001', '25d10988-e562-4a9b-8421-d94fd6b82498', 'FAIL', DATEADD('HOUR', -1, CURRENT_TIMESTAMP), 'ICT-265 중간 실행 결과 #4 (중복 제거 대상)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-5-middle', 'ict265-exec-001', '3993c635-5499-463b-8204-e744d14baee1', 'PASS', DATEADD('HOUR', -1, CURRENT_TIMESTAMP), 'ICT-265 중간 실행 결과 #5 (중복 제거 대상)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-6-middle', 'ict265-exec-001', '3f6d32c6-e92a-4544-82ef-f098620028d6', 'BLOCKED', DATEADD('HOUR', -1, CURRENT_TIMESTAMP), 'ICT-265 중간 실행 결과 #6 (중복 제거 대상)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-7-middle', 'ict265-exec-001', '51a4257a-a54a-4a6d-8749-b9dcc27536ea', 'FAIL', DATEADD('HOUR', -1, CURRENT_TIMESTAMP), 'ICT-265 중간 실행 결과 #7 (중복 제거 대상)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-8-middle', 'ict265-exec-001', '5e8382d7-2d34-4bb9-b335-b72a758d689b', 'PASS', DATEADD('HOUR', -1, CURRENT_TIMESTAMP), 'ICT-265 중간 실행 결과 #8 (중복 제거 대상)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- 세 번째 실행의 결과들 (최신 - 최종 결과)
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-1-latest', 'ict265-exec-001', '00753d07-e6fe-4e0c-8ee6-c256128b2258', 'PASS', CURRENT_TIMESTAMP, 'ICT-265 최신 실행 결과 #1 (최종 결과)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-2-latest', 'ict265-exec-001', '09a709ea-1264-4f5f-be16-335b4d447630', 'FAIL', CURRENT_TIMESTAMP, 'ICT-265 최신 실행 결과 #2 (최종 결과)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-3-latest', 'ict265-exec-001', '1c76be25-f6dc-4d41-bd60-ef1ab1d75991', 'PASS', CURRENT_TIMESTAMP, 'ICT-265 최신 실행 결과 #3 (최종 결과)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-4-latest', 'ict265-exec-001', '25d10988-e562-4a9b-8421-d94fd6b82498', 'FAIL', CURRENT_TIMESTAMP, 'ICT-265 최신 실행 결과 #4 (최종 결과)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-5-latest', 'ict265-exec-001', '3993c635-5499-463b-8204-e744d14baee1', 'PASS', CURRENT_TIMESTAMP, 'ICT-265 최신 실행 결과 #5 (최종 결과)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-6-latest', 'ict265-exec-001', '3f6d32c6-e92a-4544-82ef-f098620028d6', 'FAIL', CURRENT_TIMESTAMP, 'ICT-265 최신 실행 결과 #6 (최종 결과)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-7-latest', 'ict265-exec-001', '51a4257a-a54a-4a6d-8749-b9dcc27536ea', 'PASS', CURRENT_TIMESTAMP, 'ICT-265 최신 실행 결과 #7 (최종 결과)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-8-latest', 'ict265-exec-001', '5e8382d7-2d34-4bb9-b335-b72a758d689b', 'FAIL', CURRENT_TIMESTAMP, 'ICT-265 최신 실행 결과 #8 (최종 결과)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-9-latest', 'ict265-exec-001', '62a440c8-4808-4726-99a2-223a36056e7c', 'PASS', CURRENT_TIMESTAMP, 'ICT-265 최신 실행 결과 #9 (최종 결과)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-10-latest', 'ict265-exec-001', '65d73cd7-2543-4ba6-8d43-39dd6c9fa5f7', 'FAIL', CURRENT_TIMESTAMP, 'ICT-265 최신 실행 결과 #10 (최종 결과)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-11-latest', 'ict265-exec-001', '863fe099-d5b9-40a6-b6af-00065d1b3332', 'PASS', CURRENT_TIMESTAMP, 'ICT-265 최신 실행 결과 #11 (최종 결과)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO test_results (id, test_execution_id, test_case_id, result, executed_at, notes, created_at, updated_at)
VALUES ('result-12-latest', 'ict265-exec-001', '910acd3d-189f-4d37-9e71-be2e90c0365d', 'FAIL', CURRENT_TIMESTAMP, 'ICT-265 최신 실행 결과 #12 (최종 결과)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 4. 검증 쿼리
SELECT 'ICT-265 테스트 데이터 생성 완료' as message;

SELECT 'Test Plans' as table_name, COUNT(*) as count FROM test_plans WHERE id LIKE 'ict265%'
UNION ALL
SELECT 'Test Executions' as table_name, COUNT(*) as count FROM test_executions WHERE id LIKE 'ict265%'
UNION ALL
SELECT 'Test Results' as table_name, COUNT(*) as count FROM test_results WHERE test_execution_id LIKE 'ict265%';

SELECT 'Duplicate Analysis' as analysis;
SELECT 
    test_case_id,
    COUNT(*) as result_count,
    MIN(executed_at) as earliest,
    MAX(executed_at) as latest,
    STRING_AGG(result, ',') as all_results
FROM test_results 
WHERE test_execution_id = 'ict265-exec-001'
GROUP BY test_case_id 
HAVING COUNT(*) > 1
ORDER BY result_count DESC;
