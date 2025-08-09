-- V12: ICT-133 대시보드 쿼리 성능을 위한 DB 인덱스 최적화
-- 대시보드 API의 성능 향상을 위한 특화 인덱스 생성

-- =================================
-- TestResult 테이블 인덱스 최적화
-- =================================

-- 1. 프로젝트별 테스트 결과를 실행 시간 순으로 조회하는 쿼리 최적화
-- 대시보드의 "최근 테스트 결과" API에서 사용
CREATE INDEX IF NOT EXISTS idx_test_result_project_executed_at 
ON test_results(project_id, executed_at DESC);

-- 2. 테스트 실행별 결과 상태 조회 쿼리 최적화  
-- 대시보드의 "테스트 실행 진행률" 및 "테스트 결과 통계" API에서 사용
CREATE INDEX IF NOT EXISTS idx_test_result_execution_result 
ON test_results(test_execution_id, result);

-- 3. 프로젝트별 결과 상태 및 실행 시간 조회 최적화
-- 대시보드의 "테스트 결과 추이" API에서 사용  
CREATE INDEX IF NOT EXISTS idx_test_result_project_result_executed 
ON test_results(project_id, result, executed_at DESC);

-- 4. 담당자별 테스트 결과 조회 최적화
-- 대시보드의 "담당자별 결과" API에서 사용
CREATE INDEX IF NOT EXISTS idx_test_result_assignee_project_executed 
ON test_results(executed_by, project_id, executed_at DESC);

-- =================================
-- TestExecution 테이블 인덱스 최적화
-- =================================

-- 1. 프로젝트별 테스트 실행 상태 및 업데이트 시간 조회 최적화
-- 대시보드의 "진행 중인 테스트 실행" 및 "프로젝트 통계" API에서 사용
CREATE INDEX IF NOT EXISTS idx_test_execution_project_status_updated 
ON test_executions(project_id, status, updated_at DESC);

-- 2. 상태별 테스트 실행을 업데이트 시간 순으로 조회하는 쿼리 최적화
-- 대시보드의 "최근 활동" 및 "진행률 모니터링" API에서 사용
CREATE INDEX IF NOT EXISTS idx_test_execution_status_updated_at 
ON test_executions(status, updated_at DESC);

-- 3. 프로젝트별 테스트 플랜 실행 조회 최적화
-- 대시보드의 "프로젝트 통계" API에서 사용
CREATE INDEX IF NOT EXISTS idx_test_execution_project_testplan_status 
ON test_executions(project_id, test_plan_id, status);

-- =================================
-- 복합 쿼리 최적화 인덱스
-- =================================

-- 1. 프로젝트의 최근 7일간 테스트 결과 분석 최적화
-- ICT-129 프로젝트 통계 API에서 사용
CREATE INDEX IF NOT EXISTS idx_test_result_project_recent_analysis 
ON test_results(project_id, executed_at DESC, result) 
WHERE executed_at >= CURRENT_TIMESTAMP - INTERVAL '7 days';

-- 2. 진행 중인 테스트 실행의 완료율 계산 최적화
-- 대시보드의 "테스트 실행 진행률" API에서 사용
CREATE INDEX IF NOT EXISTS idx_test_result_execution_progress 
ON test_results(test_execution_id, result) 
WHERE result != 'NOT_RUN';

-- =================================
-- 통계 쿼리 최적화 인덱스
-- =================================

-- 1. 일별 테스트 결과 통계 집계 최적화
-- 대시보드의 "테스트 결과 추이" API에서 사용
CREATE INDEX IF NOT EXISTS idx_test_result_daily_stats 
ON test_results(DATE(executed_at), project_id, result);

-- 2. 월별/주별 테스트 실행 통계 집계 최적화
-- 대시보드의 "프로젝트 통계" API에서 사용
CREATE INDEX IF NOT EXISTS idx_test_execution_period_stats 
ON test_executions(project_id, DATE(start_date), status);

-- =================================
-- 성능 모니터링 인덱스
-- =================================

-- 1. 테스트 실행 시간 분석 최적화
-- 성능 모니터링 및 병목 지점 분석용
CREATE INDEX IF NOT EXISTS idx_test_execution_duration_analysis 
ON test_executions(project_id, start_date, end_date) 
WHERE end_date IS NOT NULL;

-- 2. 테스트 결과 응답 시간 분석 최적화
-- API 성능 모니터링용
CREATE INDEX IF NOT EXISTS idx_test_result_response_time_analysis 
ON test_results(project_id, executed_at, test_execution_id);

-- =================================
-- 인덱스 생성 완료 로그
-- =================================

-- 인덱스 생성 통계 출력 (PostgreSQL 전용)
DO $$ 
BEGIN 
    RAISE NOTICE 'ICT-133: 대시보드 성능 최적화 인덱스가 성공적으로 생성되었습니다.';
    RAISE NOTICE '- TestResult 테이블: 6개 인덱스 추가';  
    RAISE NOTICE '- TestExecution 테이블: 3개 인덱스 추가';
    RAISE NOTICE '- 통계 및 성능 모니터링: 4개 인덱스 추가';
    RAISE NOTICE '총 13개의 대시보드 최적화 인덱스가 생성되었습니다.';
END $$;