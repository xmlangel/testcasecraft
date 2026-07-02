#!/usr/bin/env bash
# =============================================================================
# DB 통합 마이그레이션 — 기존 2개 PostgreSQL(앱 + RAG) → 단일 인스턴스
# =============================================================================
# 배경:
#   과거 배포는 postgres(앱: testcase_management) + postgres-rag(RAG: rag_db)
#   두 컨테이너를 사용했다. 신규 docker-compose.yml 은 pgvector/pgvector:pg18
#   단일 postgres 인스턴스에 두 DB(testcase_management + rag_db)를 함께 둔다.
#
#   신규 배포는 init-scripts/01-init-rag.sh 가 rag_db 를 자동 생성하지만,
#   데이터가 이미 있는 기존 배포는 init 스크립트가 실행되지 않으므로 이 스크립트로
#   RAG 데이터를 통합 인스턴스로 이관한다. 앱 DB(testcase_management)는 기존
#   볼륨(./data/postgres)을 그대로 재사용하므로 이관이 필요 없다.
#
# 전제:
#   1) 두 DB 를 미리 백업했다 (pg_dump). 아래 AUTO_DUMP 로 자동 백업도 가능.
#   2) docker-compose.yml 이 이미 통합본으로 갱신되어 있다.
#   3) 통합 postgres 컨테이너(pgvector)가 기존 ./data/postgres 볼륨으로 떠 있다.
#
# 사용:
#   ./scripts/migrate-consolidate-db.sh                 # 자동: 백업→통합→복원
#   RAG_DUMP=/path/rag_db.dump ./scripts/migrate-consolidate-db.sh   # 기존 덤프 사용
#
# 멱등: 이미 rag_db 가 있으면 건드리지 않는다(중복 복원 방지). 재복원하려면
#       통합 컨테이너에서 rag_db 를 DROP 후 재실행.
# =============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."   # docker-compose-build/

# ── 설정 (환경변수로 override) ───────────────────────────────────────────────
NEW_PG="${NEW_PG:-testcasecraft-postgres}"           # 통합 postgres 컨테이너
OLD_RAG_PG="${OLD_RAG_PG:-testcasecraft-postgres-rag}" # (있으면) 구 RAG 컨테이너
APP_USER="${POSTGRES_USER:-testcase_user}"
APP_DB="${POSTGRES_DB:-testcase_management}"
RAG_USER="${POSTGRES_RAG_USER:-rag_user}"
RAG_DB="${POSTGRES_RAG_DB:-rag_db}"
RAG_PASS="${POSTGRES_RAG_PASSWORD:-rag_dev_password_123}"
BK_DIR="${BK_DIR:-backups/consolidate-$(date +%Y%m%d)}"
RAG_DUMP="${RAG_DUMP:-}"

psql_app() { docker exec -i "$NEW_PG" psql -v ON_ERROR_STOP=1 -U "$APP_USER" -d "$1" ; }

echo "▶ 통합 postgres 컨테이너: $NEW_PG"
docker inspect "$NEW_PG" >/dev/null 2>&1 || { echo "✗ $NEW_PG 컨테이너가 없습니다. 먼저 'docker compose up -d postgres'."; exit 1; }

# ── 1) RAG 덤프 확보 ─────────────────────────────────────────────────────────
if [[ -z "$RAG_DUMP" ]]; then
  mkdir -p "$BK_DIR"
  RAG_DUMP="$BK_DIR/rag_db.dump"
  if [[ -f "$RAG_DUMP" ]]; then
    echo "▶ 기존 덤프 재사용: $RAG_DUMP"
  elif docker inspect "$OLD_RAG_PG" >/dev/null 2>&1; then
    echo "▶ 구 RAG 컨테이너($OLD_RAG_PG)에서 pg_dump → $RAG_DUMP"
    docker exec "$OLD_RAG_PG" pg_dump -U "$RAG_USER" -d "$RAG_DB" -Fc > "$RAG_DUMP"
  else
    echo "✗ RAG 덤프도 없고 구 RAG 컨테이너($OLD_RAG_PG)도 없습니다."
    echo "  RAG_DUMP=/경로/rag_db.dump 로 덤프 파일을 지정하세요."
    exit 1
  fi
fi
echo "  덤프: $RAG_DUMP ($(du -h "$RAG_DUMP" | cut -f1))"

# ── 2) 이미지 교체(postgres:18→pgvector)에 따른 glibc collation 정합성 정리 ──
#      새 DB 생성이 template1 collation 불일치로 막히는 것을 방지 + 앱 인덱스 재구축
echo "▶ collation 정리 (template1/postgres refresh, 앱 DB reindex)"
psql_app postgres <<-SQL || true
	ALTER DATABASE template1 REFRESH COLLATION VERSION;
	ALTER DATABASE postgres  REFRESH COLLATION VERSION;
SQL
docker exec "$NEW_PG" psql -U "$APP_USER" -d "$APP_DB" -c "REINDEX DATABASE $APP_DB;" >/dev/null 2>&1 || true
docker exec "$NEW_PG" psql -U "$APP_USER" -d "$APP_DB" -c "ALTER DATABASE $APP_DB REFRESH COLLATION VERSION;" >/dev/null 2>&1 || true

# ── 3) rag_user + rag_db 생성 (멱등) ─────────────────────────────────────────
echo "▶ rag_user / rag_db 준비"
psql_app postgres <<-SQL
	DO \$\$ BEGIN
	  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='${RAG_USER}') THEN
	    CREATE ROLE ${RAG_USER} LOGIN PASSWORD '${RAG_PASS}';
	  END IF;
	END \$\$;
SQL
if docker exec "$NEW_PG" psql -U "$APP_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${RAG_DB}'" | grep -q 1; then
  echo "  ⚠ ${RAG_DB} 가 이미 존재합니다. 복원을 건너뜁니다(멱등). 재복원하려면 먼저 DROP 하세요."
  exit 0
fi
docker exec "$NEW_PG" psql -U "$APP_USER" -d postgres -c "CREATE DATABASE ${RAG_DB} OWNER ${RAG_USER};"

# ── 4) 복원 (슈퍼유저로 실행 → CREATE EXTENSION vector 가능, 소유권은 덤프대로 rag_user) ─
echo "▶ rag_db 복원"
docker exec -i "$NEW_PG" pg_restore -U "$APP_USER" -d "$RAG_DB" < "$RAG_DUMP"

# ── 5) 검증 ─────────────────────────────────────────────────────────────────
echo "▶ 검증"
docker exec "$NEW_PG" psql -U "$APP_USER" -d "$RAG_DB" -tAc \
  "SELECT 'vector '||extversion FROM pg_extension WHERE extname='vector';"
docker exec "$NEW_PG" psql -U "$APP_USER" -d "$RAG_DB" -tAc \
  "SELECT 'rag_documents='||count(*) FROM rag_documents;" 2>/dev/null || true
echo "✓ 통합 완료: $NEW_PG 안에 $APP_DB + $RAG_DB"
echo "  이제 'docker compose up -d' 로 app/rag-service 를 통합 인스턴스 기준으로 재기동하세요."
