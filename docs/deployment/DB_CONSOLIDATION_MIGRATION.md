# DB 통합 마이그레이션 런북 (원격 서버, in-place)

기존 **2개 PostgreSQL**(앱 `postgres:18` + RAG `pgvector/pgvector:pg18`) 배포를
**단일 `pgvector/pgvector:pg18` 인스턴스**(두 DB: `testcase_management` + `rag_db`)로
**같은 서버에서 그대로** 통합한다. **DB만 이관**하며 MinIO 는 기존 그대로 둔다.

> 앱 DB(`testcase_management`)는 기존 볼륨(`./data/postgres`)을 그대로 재사용하므로
> 이관이 필요 없다. 실제로 옮기는 것은 **RAG DB(`rag_db`)** 뿐이다.

- 예상 다운타임: 수 분 (앱/rag-service 정지 구간)
- 되돌리기: 1단계 백업으로 언제든 복구 가능
- 자동화 스크립트: `docker-compose-build/scripts/migrate-consolidate-db.sh`

---

## 0. 사전 확인 (원격 서버에서)

```bash
ssh <remote>
cd <repo>/docker-compose-build

# 현재 컨테이너 확인 — 구 구조(2 postgres)가 맞는지
docker compose ps
docker ps --format "{{.Names}}\t{{.Image}}" | grep -E "postgres|minio|rag"
# 기대: testcasecraft_postgres_spring(postgres:18), testcasecraft-postgres-rag(pgvector), ...
```

`.env` 에 `POSTGRES_PASSWORD`, `POSTGRES_RAG_PASSWORD` 가 있는지 확인한다.

---

## 1. 백업 (필수 · 구 컨테이너가 살아있을 때)

```bash
BK="backups/consolidate-$(date +%Y%m%d)"
mkdir -p "$BK"

# 앱 DB
docker exec testcasecraft_postgres_spring \
  pg_dump -U testcase_user -d testcase_management -Fc > "$BK/app_testcase_management.dump"

# RAG DB  (파일명은 마이그레이션 스크립트가 기대하는 이름과 동일하게)
docker exec testcasecraft-postgres-rag \
  pg_dump -U rag_user -d rag_db -Fc > "$BK/rag_db.dump"

ls -la "$BK"   # 두 dump 파일 크기 > 0 확인
```

---

## 2. 새 구성 코드 반영

통합본 커밋(`docker-compose.yml` · `init-scripts/` · `scripts/migrate-consolidate-db.sh`)을 가져온다.

```bash
cd <repo>
git fetch && git checkout <통합-브랜치 또는 태그>   # 예: release/1.0.93
git pull

cd docker-compose-build
docker compose config >/dev/null && echo "compose OK"   # 문법 검증
```

> git 을 쓰지 않는 서버라면 `docker-compose.yml`, `init-scripts/`, `scripts/` 를 수동으로
> 최신본으로 교체한다.

---

## 3. 쓰기 중단 (앱 · rag-service 정지)

마이그레이션 중 데이터가 바뀌지 않도록 앱과 rag-service 를 멈춘다.
**구 RAG postgres 컨테이너(`testcasecraft-postgres-rag`)는 아직 지우지 않는다** —
마이그레이션 스크립트가 여기서 rag_db 를 덤프한다.

```bash
docker compose stop app rag-service
# postgres / postgres-rag / minio 는 계속 실행 상태로 둔다
```

---

## 4. 통합 postgres 기동 (기존 앱 볼륨 재사용)

새 compose 의 `postgres` 서비스(pgvector 이미지)를 기존 `./data/postgres` 볼륨 위에
재생성한다. **`--remove-orphans` 는 아직 쓰지 않는다** (구 rag 컨테이너를 살려둬야 함).

```bash
docker compose up -d postgres

# healthy 될 때까지 대기
until [ "$(docker inspect testcasecraft-postgres --format '{{.State.Health.Status}}')" = healthy ]; do
  sleep 3; echo "waiting postgres..."; done
echo "postgres healthy"
```

> 이미지가 `postgres:18` → `pgvector/pgvector:pg18` 로 바뀌지만 같은 PG 18 이라 기존
> 데이터 디렉터리를 그대로 읽는다. 앱 DB 는 손대지 않는다.

---

## 5. 마이그레이션 스크립트 실행

`rag_db` 를 통합 인스턴스로 이관한다. 스크립트가 자동으로:
구 rag 컨테이너에서 덤프(또는 1단계 덤프 재사용) → **collation 정합성 정리**
(이미지 교체로 인한 glibc 불일치 대비 `REINDEX` + `REFRESH COLLATION`) →
`rag_user`/`rag_db` 생성 → 슈퍼유저로 복원.

```bash
cd <repo>/docker-compose-build
./scripts/migrate-consolidate-db.sh
```

- 1단계에서 만든 `backups/consolidate-YYYYMMDD/rag_db.dump` 를 자동으로 재사용한다.
- 다른 경로의 덤프를 쓰려면: `RAG_DUMP=/path/rag_db.dump ./scripts/migrate-consolidate-db.sh`
- 멱등: `rag_db` 가 이미 있으면 복원을 건너뛴다(중복 방지). 재복원하려면 통합
  컨테이너에서 `DROP DATABASE rag_db` 후 재실행.

스크립트 끝에 `vector` 확장과 `rag_documents` 행 수가 출력되면 정상.

---

## 6. 서비스 재기동 + 구 RAG 컨테이너 제거

```bash
docker compose up -d --remove-orphans
# → app · rag-service 가 통합 postgres 기준으로 기동
#   (rag-service DATABASE_URL = postgres:5432/rag_db)
# → 더 이상 compose 에 없는 testcasecraft-postgres-rag(orphan) 자동 제거
```

> MinIO 는 기존 그대로다. 새 compose 에서 컨테이너명이 `testcasecraft-minio` 로
> 정리되어 재생성될 수 있으나 `./data/minio` 볼륨(버킷 2종)은 보존된다.

---

## 7. 검증

```bash
# 컨테이너: postgres 1개 + rag-service + minio + app
docker compose ps

# 단일 인스턴스 안에 두 DB 존재
docker exec testcasecraft-postgres psql -U testcase_user -d postgres -tAc \
  "select datname from pg_database where datname in ('testcase_management','rag_db') order by 1;"

# 데이터 건수 (백업 전 값과 비교)
docker exec testcasecraft-postgres psql -U testcase_user -d testcase_management -tAc \
  "select 'projects='||count(*) from projects;"
docker exec testcasecraft-postgres psql -U testcase_user -d rag_db -tAc \
  "select 'rag_documents='||count(*) from rag_documents;"

# 헬스 (도메인/포트는 .env 에 맞게)
curl -sk -o /dev/null -w "app  => %{http_code}\n"  https://localhost/actuator/health
curl -s  -o /dev/null -w "rag  => %{http_code}\n"  http://localhost:8001/health
```

앱에서 RAG 문서 목록·검색이 정상 동작하는지 UI 로 최종 확인한다.

---

## 8. 정리 (검증 완료 후, 선택)

구 RAG 데이터 볼륨은 더 이상 쓰이지 않는다. 확신이 서면 백업 후 제거한다.

```bash
# 최종 안전 백업(선택)
tar czf backups/postgres-rag-data-$(date +%Y%m%d).tgz data/postgres-rag
# 제거
rm -rf data/postgres-rag
```

`backups/` 의 dump 파일은 롤백 대비 일정 기간 보관한다.

---

## 롤백 (문제 발생 시)

```bash
# 1) 새 스택 정지
docker compose down

# 2) 구 compose(2 postgres) 로 되돌리기: 이전 커밋으로 체크아웃
git checkout <이전 커밋>   # 통합 이전

# 3) 구 볼륨은 그대로 남아있으므로 그대로 기동
docker compose up -d
# 필요 시 1단계 dump 로 개별 DB 복원:
#   docker exec -i <pg> pg_restore -U <user> -d <db> < backups/.../<db>.dump
```

앱 DB(`./data/postgres`)는 통합 과정에서 **내용이 바뀌지 않고 이미지/인덱스만
갱신**되므로, 구 compose 로 되돌려도 그대로 읽힌다(단 pgvector 이미지로 한 번
기동한 뒤라면 collation 은 이미 현재 OS 기준으로 정리된 상태).
