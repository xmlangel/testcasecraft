#!/bin/bash
# 통합 PostgreSQL 인스턴스 최초 기동 시 RAG 데이터베이스/유저/스키마를 생성한다.
# (docker-entrypoint-initdb.d 는 데이터 디렉터리가 비어 있는 최초 기동에만 실행됨)
#
# 앱 DB(testcase_management)는 이미지 기본 POSTGRES_DB 로 생성되고, 이 스크립트는
# 같은 인스턴스 안에 rag_db + rag_user + pgvector 스키마를 추가한다.
#
# 기존 배포(데이터가 이미 있는 볼륨)는 이 스크립트가 실행되지 않으므로
# scripts/migrate-consolidate-db.sh 로 rag_db 를 이관한다.
set -euo pipefail

RAG_DB="${POSTGRES_RAG_DB:-rag_db}"
RAG_USER="${POSTGRES_RAG_USER:-rag_user}"
RAG_PASSWORD="${POSTGRES_RAG_PASSWORD:?POSTGRES_RAG_PASSWORD 가 필요합니다}"

echo "[init-rag] rag_user/rag_db 생성 시작"

# 1) rag_user 역할 생성 (슈퍼유저로 접속)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${RAG_USER}') THEN
            CREATE ROLE ${RAG_USER} LOGIN PASSWORD '${RAG_PASSWORD}';
        END IF;
    END
    \$\$;
EOSQL

# 2) rag_db 생성 (CREATE DATABASE 는 트랜잭션 밖에서만 가능)
if ! psql -tAc "SELECT 1 FROM pg_database WHERE datname = '${RAG_DB}'" \
        --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" | grep -q 1; then
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
        -c "CREATE DATABASE ${RAG_DB} OWNER ${RAG_USER};"
fi

# 3) pgvector 확장 생성 + rag_user 에 스키마 생성 권한 부여 (확장 생성은 슈퍼유저 권한 필요)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$RAG_DB" <<-EOSQL
    CREATE EXTENSION IF NOT EXISTS vector;
    GRANT USAGE, CREATE ON SCHEMA public TO ${RAG_USER};
EOSQL

# 4) RAG 테이블/인덱스/함수/트리거를 rag_user 소유로 생성
PGPASSWORD="$RAG_PASSWORD" psql -v ON_ERROR_STOP=1 \
    --host /var/run/postgresql --username "$RAG_USER" --dbname "$RAG_DB" \
    -f /docker-entrypoint-initdb.d/sql/rag-schema.sql

echo "[init-rag] 완료: ${RAG_DB} (owner ${RAG_USER}) + pgvector 스키마"
