-- ===================================
-- Database Initialization Script
-- ===================================
-- 이 스크립트는 PostgreSQL 컨테이너 시작시 자동 실행됩니다

-- 데이터베이스가 존재하지 않으면 생성 (Docker 환경변수로 자동 생성되므로 주석)
-- CREATE DATABASE testcase_management;

-- 사용자 권한 설정 (이미 환경변수로 설정되므로 추가 권한만)
-- GRANT ALL PRIVILEGES ON DATABASE testcase_management TO testcase_user;

-- 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- 성능 최적화를 위한 설정
-- 이는 테이블 생성 후 적용될 수 있는 인덱스들입니다
-- (Spring Boot JPA가 테이블을 생성한 후 추가로 적용)

-- 세션 설정 최적화
-- ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
-- ALTER SYSTEM SET log_statement = 'all';
-- ALTER SYSTEM SET log_duration = on;

-- 연결 및 성능 설정
-- ALTER SYSTEM SET max_connections = 100;
-- ALTER SYSTEM SET shared_buffers = '256MB';
-- ALTER SYSTEM SET effective_cache_size = '1GB';
-- ALTER SYSTEM SET work_mem = '4MB';
-- ALTER SYSTEM SET maintenance_work_mem = '64MB';

-- 로그 설정
-- ALTER SYSTEM SET log_min_duration_statement = 1000;
-- ALTER SYSTEM SET log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h ';

-- 체크포인트 설정
-- ALTER SYSTEM SET checkpoint_completion_target = 0.9;
-- ALTER SYSTEM SET wal_buffers = '16MB';

COMMIT;

-- 초기 데이터 삽입이 필요한 경우 여기에 추가
-- 예시: 기본 관리자 계정은 Spring Boot에서 자동 생성됨