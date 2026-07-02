#!/bin/bash
# 통합 postgres 서버 초기화 스크립트 (빈 볼륨 최초 기동 시에만 실행)
# 기존 별도 컨테이너였던 rag_db / rag_user 를 이 서버 안에 재생성한다.
#   - rag_user 롤 (LOGIN, 비밀번호 = POSTGRES_RAG_PASSWORD)
#   - rag_db 데이터베이스 (owner = rag_user)
#   - rag_db 안에 pgvector 확장 + RAG 스키마 (rag-schema.sql.tmpl)
# testcase_management (Spring) 은 공식 엔트리포인트가 이미 생성한 상태.
set -euo pipefail

: "${POSTGRES_RAG_PASSWORD:?POSTGRES_RAG_PASSWORD 환경변수가 필요합니다}"

# 1) rag_user 롤 (없을 때만)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	DO \$do\$
	BEGIN
	   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'rag_user') THEN
	      CREATE ROLE rag_user LOGIN PASSWORD '${POSTGRES_RAG_PASSWORD}';
	   END IF;
	END
	\$do\$;
EOSQL

# 2) rag_db 데이터베이스 (없을 때만)
if ! psql -tAc "SELECT 1 FROM pg_database WHERE datname = 'rag_db'" --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" | grep -q 1; then
	createdb --username "$POSTGRES_USER" --owner rag_user rag_db
fi

# 3) rag_db 안에 pgvector 확장 + RAG 스키마 로드
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname rag_db \
	-f /docker-entrypoint-initdb.d/rag-schema.sql.tmpl

# 4) 스키마 객체 소유권을 rag_user 로 이전 (superuser 가 만든 테이블 접근 보장)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname rag_db <<-EOSQL
	GRANT ALL ON SCHEMA public TO rag_user;
	GRANT ALL ON ALL TABLES IN SCHEMA public TO rag_user;
	GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO rag_user;
	GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO rag_user;
EOSQL

echo "[00-init-rag] rag_user / rag_db / pgvector schema 초기화 완료"
