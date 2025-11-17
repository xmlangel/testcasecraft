-- V18: 사용량 메트릭 테이블 생성
-- 생성일: 2025-11-18
-- 설명: 페이지 방문 통계 및 일일 요약 테이블 생성

-- page_visit_metrics 테이블 생성
CREATE TABLE page_visit_metrics (
    id VARCHAR(255) PRIMARY KEY,
    visit_date DATE NOT NULL,
    page_path VARCHAR(500) NOT NULL,
    daily_count BIGINT NOT NULL DEFAULT 0,
    total_count BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- page_visit_metrics 유니크 인덱스 생성
CREATE UNIQUE INDEX idx_page_visit_date_page ON page_visit_metrics(visit_date, page_path);

-- page_visit_metrics 조회 성능 인덱스
CREATE INDEX idx_page_visit_date ON page_visit_metrics(visit_date);

-- daily_visit_summaries 테이블 생성
CREATE TABLE daily_visit_summaries (
    id VARCHAR(255) PRIMARY KEY,
    visit_date DATE NOT NULL UNIQUE,
    total_visits BIGINT NOT NULL DEFAULT 0,
    unique_visitors BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- daily_visit_summaries 조회 성능 인덱스
CREATE INDEX idx_daily_visit_date ON daily_visit_summaries(visit_date);

-- 테이블 코멘트
COMMENT ON TABLE page_visit_metrics IS '페이지별 방문 통계 - 날짜와 페이지 경로별로 방문 횟수 추적';
COMMENT ON TABLE daily_visit_summaries IS '일일 방문 요약 - 전체 방문자 수 및 고유 방문자 수 집계';

-- 컬럼 코멘트
COMMENT ON COLUMN page_visit_metrics.visit_date IS '방문 날짜';
COMMENT ON COLUMN page_visit_metrics.page_path IS '페이지 경로';
COMMENT ON COLUMN page_visit_metrics.daily_count IS '일일 방문 횟수';
COMMENT ON COLUMN page_visit_metrics.total_count IS '누적 방문 횟수';

COMMENT ON COLUMN daily_visit_summaries.visit_date IS '방문 날짜';
COMMENT ON COLUMN daily_visit_summaries.total_visits IS '전체 방문 횟수';
COMMENT ON COLUMN daily_visit_summaries.unique_visitors IS '고유 방문자 수';
