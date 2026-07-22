-- ============================================================
-- 그래프 스키마 마이그레이션: 이전 관계그래프/저작 모델 → 코어 온톨로지 인스턴스 모델
-- 대상: 이미 운영 중인 기존 tc_graph_db (신규 부팅이 아니라 init 스크립트가 안 도는 DB)
-- 날짜: 2026-07-22
--
-- 배경: 01-init-graph.sql 은 컨테이너 최초 부팅(docker-entrypoint-initdb.d) 때만 실행된다.
-- 기존 DB 에는 옛 레이블(Folder·JunitCase·FailureType·CONTAINS·SIMILAR_TO 등)만 있고
-- 새 온톨로지 레이블(has·parentOf·produces… + Organization·TestStep 등)이 없어
-- GraphSyncService 의 MERGE 가 실패한다. 이 스크립트로 스키마를 전환한다.
--
-- ⚠️ 관계 그래프는 read-model 이다 — 아래 1) 단계에서 그래프 데이터를 전부 비운다.
--    마이그레이션 후 프로젝트별로 재동기화(POST /api/graph/sync?projectId=...)하면
--    메인 DB 로부터 새 온톨로지 인스턴스 그래프가 재구성된다. (원본 손실 없음)
--
-- 적용:  ./apply-graph-migration.sh
--   또는 psql "$GRAPH_DB_URL" -v ON_ERROR_STOP=1 -f 2026-07-22-ontology-instance-model.sql
-- 멱등: 여러 번 실행해도 안전(IF EXISTS / IF NOT EXISTS).
-- ============================================================

CREATE GRAPH IF NOT EXISTS tc_graph;
SET graph_path = tc_graph;

-- ---------- 1) 스테일 데이터 정리 (옛 모델 노드/간선 제거) ----------
-- read-model 이라 안전. 마이그레이션 후 재동기화로 새 인스턴스 그래프가 채워진다.
MATCH (n) DETACH DELETE n;

-- ---------- 2) 신규 온톨로지 스키마 생성 (01-init-graph.sql 과 동일, 멱등) ----------
-- 정점 11
CREATE VLABEL IF NOT EXISTS "Organization";
CREATE VLABEL IF NOT EXISTS "Project";
CREATE VLABEL IF NOT EXISTS "TestCase";
CREATE VLABEL IF NOT EXISTS "TestStep";
CREATE VLABEL IF NOT EXISTS "TestCaseVersion";
CREATE VLABEL IF NOT EXISTS "TestPlan";
CREATE VLABEL IF NOT EXISTS "TestExecution";
CREATE VLABEL IF NOT EXISTS "TestResult";
CREATE VLABEL IF NOT EXISTS "TestCharter";
CREATE VLABEL IF NOT EXISTS "TestSession";
CREATE VLABEL IF NOT EXISTS "User";
-- 간선 15
CREATE ELABEL IF NOT EXISTS "contains";
CREATE ELABEL IF NOT EXISTS "has";
CREATE ELABEL IF NOT EXISTS "hasPlan";
CREATE ELABEL IF NOT EXISTS "hasExecution";
CREATE ELABEL IF NOT EXISTS "hasCharter";
CREATE ELABEL IF NOT EXISTS "hasSession";
CREATE ELABEL IF NOT EXISTS "parentOf";
CREATE ELABEL IF NOT EXISTS "hasStep";
CREATE ELABEL IF NOT EXISTS "hasVersion";
CREATE ELABEL IF NOT EXISTS "references";
CREATE ELABEL IF NOT EXISTS "basedOn";
CREATE ELABEL IF NOT EXISTS "produces";
CREATE ELABEL IF NOT EXISTS "targets";
CREATE ELABEL IF NOT EXISTS "executedBy";
CREATE ELABEL IF NOT EXISTS "runs";
-- 조회 키 인덱스
CREATE PROPERTY INDEX IF NOT EXISTS organization_id_idx ON "Organization" (id);
CREATE PROPERTY INDEX IF NOT EXISTS project_id_idx       ON "Project" (id);
CREATE PROPERTY INDEX IF NOT EXISTS testcase_id_idx      ON "TestCase" (id);
CREATE PROPERTY INDEX IF NOT EXISTS testcase_proj_idx    ON "TestCase" ("projectId");
CREATE PROPERTY INDEX IF NOT EXISTS teststep_id_idx      ON "TestStep" (id);
CREATE PROPERTY INDEX IF NOT EXISTS tcversion_id_idx     ON "TestCaseVersion" (id);
CREATE PROPERTY INDEX IF NOT EXISTS testplan_id_idx      ON "TestPlan" (id);
CREATE PROPERTY INDEX IF NOT EXISTS testexec_id_idx      ON "TestExecution" (id);
CREATE PROPERTY INDEX IF NOT EXISTS testresult_id_idx    ON "TestResult" (id);
CREATE PROPERTY INDEX IF NOT EXISTS testcharter_id_idx   ON "TestCharter" (id);
CREATE PROPERTY INDEX IF NOT EXISTS testsession_id_idx   ON "TestSession" (id);
CREATE PROPERTY INDEX IF NOT EXISTS graphuser_id_idx     ON "User" (id);

-- ---------- 3) 옛/미사용 레이블 제거 (데이터 비운 뒤라 안전) ----------
-- 옛 간선 21종 (신규는 소문자/camelCase 라 이름 겹침 없음 — 전부 제거)
DROP ELABEL IF EXISTS "CONTAINS";
DROP ELABEL IF EXISTS "PARENT_OF";
DROP ELABEL IF EXISTS "HAS_PLAN";
DROP ELABEL IF EXISTS "INCLUDES";
DROP ELABEL IF EXISTS "FROM_PLAN";
DROP ELABEL IF EXISTS "OF_CASE";
DROP ELABEL IF EXISTS "IN_EXECUTION";
DROP ELABEL IF EXISTS "EXECUTED_BY";
DROP ELABEL IF EXISTS "FAILED_WITH";
DROP ELABEL IF EXISTS "AFFECTS";
DROP ELABEL IF EXISTS "REPORTED_AS";
DROP ELABEL IF EXISTS "LINKED_TO";
DROP ELABEL IF EXISTS "SIMILAR_TO";
DROP ELABEL IF EXISTS "RELATES_TO";
DROP ELABEL IF EXISTS "BLOCKS";
DROP ELABEL IF EXISTS "STARTS_AT";
DROP ELABEL IF EXISTS "NEXT";
DROP ELABEL IF EXISTS "BRANCH_ON";
DROP ELABEL IF EXISTS "VERIFIES";
DROP ELABEL IF EXISTS "TRANSITION";
DROP ELABEL IF EXISTS "DEPENDS_ON";
-- 옛 정점 (신규와 겹치는 Project/TestCase/TestPlan/TestExecution/TestResult/User 는 유지)
DROP VLABEL IF EXISTS "Folder";
DROP VLABEL IF EXISTS "Bug";
DROP VLABEL IF EXISTS "JunitCase";
DROP VLABEL IF EXISTS "FailureType";
DROP VLABEL IF EXISTS "JiraIssue";
DROP VLABEL IF EXISTS "GraphTestCase";
DROP VLABEL IF EXISTS "StepNode";
DROP VLABEL IF EXISTS "Precondition";
DROP VLABEL IF EXISTS "Decision";
DROP VLABEL IF EXISTS "State";
DROP VLABEL IF EXISTS "Expected";

-- ---------- 완료 ----------
-- 다음 단계: 프로젝트별 재동기화 (관리자)
--   POST /api/graph/sync?projectId=<각 프로젝트>
--   또는 GRAPH_SYNC_SCHEDULED_ENABLED=true 로 주기 동기화 활성화 후 대기.
