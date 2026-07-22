-- ============================================================
-- testcasecraft 그래프 스키마 초기화 (AgensGraph v2.16.x / PG16.9)
-- docker-entrypoint-initdb.d 에서 최초 기동 시 1회 실행된다.
-- 대상 DB: POSTGRES_DB(tc_graph_db), 실행 계정: POSTGRES_USER(graph_user)
--
-- 스키마 정본 = 코어 온톨로지(testcasecraft.rdf, JPA 엔티티 근거).
-- 노드 11종 · 간선 15종을 온톨로지 명칭 그대로 쓴다. 그래프는 온톨로지를 그대로
-- 투영한 읽기용 관계망이며, GraphSyncService 가 메인 DB 에서 MERGE 로 재구성한다.
-- ============================================================

CREATE GRAPH IF NOT EXISTS tc_graph;
SET graph_path = tc_graph;

-- ---------- 정점 (온톨로지 owl:Class 11종) ----------
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

-- ---------- 간선 (온톨로지 owl:ObjectProperty 15종) ----------
CREATE ELABEL IF NOT EXISTS "contains";       -- Organization → Project
CREATE ELABEL IF NOT EXISTS "has";            -- Project → TestCase (루트)
CREATE ELABEL IF NOT EXISTS "hasPlan";        -- Project → TestPlan
CREATE ELABEL IF NOT EXISTS "hasExecution";   -- Project → TestExecution
CREATE ELABEL IF NOT EXISTS "hasCharter";     -- Project → TestCharter
CREATE ELABEL IF NOT EXISTS "hasSession";     -- Project → TestSession
CREATE ELABEL IF NOT EXISTS "parentOf";       -- TestCase → TestCase (폴더 트리)
CREATE ELABEL IF NOT EXISTS "hasStep";        -- TestCase → TestStep
CREATE ELABEL IF NOT EXISTS "hasVersion";     -- TestCase → TestCaseVersion
CREATE ELABEL IF NOT EXISTS "references";     -- TestPlan → TestCase
CREATE ELABEL IF NOT EXISTS "basedOn";        -- TestExecution → TestPlan
CREATE ELABEL IF NOT EXISTS "produces";       -- TestExecution → TestResult
CREATE ELABEL IF NOT EXISTS "targets";        -- TestResult → TestCase
CREATE ELABEL IF NOT EXISTS "executedBy";     -- TestResult → User
CREATE ELABEL IF NOT EXISTS "runs";           -- TestSession → TestCharter

-- ---------- 조회 키 인덱스 ----------
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
