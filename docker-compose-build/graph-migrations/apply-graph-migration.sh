#!/usr/bin/env bash
# 그래프 스키마 마이그레이션 적용기 — 기존 tc_graph_db 를 코어 온톨로지 인스턴스 모델로 전환.
# 멱등: 여러 번 실행해도 안전. 적용 후 프로젝트별 재동기화(POST /api/graph/sync)가 필요하다.
#
# 사용:
#   # (A) 도커 컨테이너로 실행 중인 경우 (기본)
#   GRAPH_DB_PASSWORD=changeme-graph ./apply-graph-migration.sh
#
#   # (B) 원격/외부 DB — psql 로 직접
#   GRAPH_DB_URL='postgresql://graph_user:pw@host:5437/tc_graph_db' MODE=psql ./apply-graph-migration.sh
#
# 환경변수:
#   MODE                 docker(기본) | psql
#   GRAPH_CONTAINER      docker 모드 컨테이너명 (기본 testcasecraft-agensgraph)
#   GRAPH_DB_USER        기본 graph_user
#   GRAPH_DB_NAME        기본 tc_graph_db
#   GRAPH_DB_PASSWORD    비밀번호 (docker 모드 필수 — 컨테이너 POSTGRES_PASSWORD 와 동일)
#   GRAPH_DB_URL         psql 모드 접속 문자열
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL="$HERE/2026-07-22-ontology-instance-model.sql"
[ -f "$SQL" ] || { echo "❌ 마이그레이션 SQL 없음: $SQL" >&2; exit 1; }

MODE="${MODE:-docker}"
GRAPH_DB_USER="${GRAPH_DB_USER:-graph_user}"
GRAPH_DB_NAME="${GRAPH_DB_NAME:-tc_graph_db}"

echo "▶ 그래프 마이그레이션 적용 — mode=$MODE, db=$GRAPH_DB_NAME"

if [ "$MODE" = "psql" ]; then
  : "${GRAPH_DB_URL:?psql 모드는 GRAPH_DB_URL 이 필요합니다}"
  command -v psql >/dev/null || { echo "❌ psql 미설치" >&2; exit 1; }
  psql "$GRAPH_DB_URL" -v ON_ERROR_STOP=1 -f "$SQL"
else
  GRAPH_CONTAINER="${GRAPH_CONTAINER:-testcasecraft-agensgraph}"
  : "${GRAPH_DB_PASSWORD:?docker 모드는 GRAPH_DB_PASSWORD 가 필요합니다 (컨테이너 비밀번호와 동일)}"
  docker ps --format '{{.Names}}' | grep -qx "$GRAPH_CONTAINER" \
    || { echo "❌ 실행 중인 컨테이너 없음: $GRAPH_CONTAINER" >&2; exit 1; }
  docker exec -i -e PGPASSWORD="$GRAPH_DB_PASSWORD" "$GRAPH_CONTAINER" \
    psql -U "$GRAPH_DB_USER" -d "$GRAPH_DB_NAME" -v ON_ERROR_STOP=1 -f - < "$SQL"
fi

echo "✅ 마이그레이션 완료."
echo "   다음: 프로젝트별 재동기화 — POST /api/graph/sync?projectId=<id>"
echo "   (또는 GRAPH_SYNC_SCHEDULED_ENABLED=true 로 주기 동기화)"
