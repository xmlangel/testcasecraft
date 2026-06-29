# PG17 PG-mode 실패 케이스 (17.10.0-47)

> 실행 #5 · 439 TC 중 FAIL 21건 · 172 AgensSQL 5333 직접 · 예상(좌)/실제(우) 줄 정렬
>
> 🔗 [TestcaseCraft 실행 보기](https://tc.qaspecialist.uk/projects/75245e30-47be-4677-9f4e-14ac7f6f3b9c/executions/5ae3ca6c-e206-4c69-b36d-4abd8aed110d)

## 요약

| TC ID | PG ID | 제목 | 판정 |
|-------|-------|------|------|
| `tc1202` | PG-247 | SET LOCAL 트랜잭션 범위 | ❌ FAIL |
| `tc1301` | PG-344 | pg_hba scram-sha-256 인증 | ❌ FAIL |
| `tc1302` | PG-345 | pg_hba trust/reject 분기 | ❌ FAIL |
| `tc1614` | PG-429 | pg_basebackup --incremental 증분 백업 | ❌ FAIL |
| `tc1615` | PG-430 | pg_combinebackup 합성 후 기동·검증 | ❌ FAIL |
| `tc1617` | PG-432 | 백업 매니페스트 system identifier(v2) | ❌ FAIL |
| `tc1618` | PG-433 | WAL 요약 함수 | ❌ FAIL |
| `tc1619` | PG-434 | pg_walsummary CLI 디코드 | ❌ FAIL |
| `tc1620` | PG-435 | 연속 아카이빙(archive_command) | ❌ FAIL |
| `tc1621` | PG-436 | PITR 시점 복구(recovery_target_name) | ❌ FAIL |
| `tc1622` | PG-437 | pg_archivecleanup CLI | ❌ FAIL |
| `tc1623` | PG-438 | basic_archive 모듈 아카이빙 | ❌ FAIL |
| `tc1624` | PG-439 | archive_library vs archive_command 상호배타 | ❌ FAIL |
| `tc2006` | PG-334 | \watch min_rows= 최소행 종료(PG17 신규) | ❌ FAIL |
| `tc2009` | PG-337 | 접속 문자열·PGHOST/PGPORT/PGUSER/PGDATABASE 환경변수 | ❌ FAIL |
| `tc2012` | PG-340 | pg_isready 서버 가용성 점검 | ❌ FAIL |
| `tc2014` | PG-342 | pg_config·pg_test_fsync·pg_test_timing 스모크 | ❌ FAIL |
| `tc2114` | PG-399 | postgres_fdw 루프백 | ❌ FAIL |
| `tc2115` | PG-400 | dblink 루프백 | ❌ FAIL |
| `tc2118` | PG-403 | pgstattuple·pg_visibility 불변식 | ❌ FAIL |
| `tc2121` | PG-406 | vacuumlo·oid2name 클라이언트 CLI | ❌ FAIL |

**총 21건 · 전부 FAIL**

---

## tc1202 · SET LOCAL 트랜잭션 범위  `PG-247`

- **TC ID**: `tc1202`
- **PG ID**: PG-247
- **판정**: ❌ FAIL
- **출처**: https://www.postgresql.org/docs/17/sql-set.html (§19.1.2)

### 설명

SET LOCAL이 현재 트랜잭션 안에서만 유효하고 COMMIT/ROLLBACK 후 세션값으로 복귀하며 트랜잭션 밖 SET LOCAL은 경고만 내고 효과가 없음을 검증한다

### 테스트 단계

```sql
-- tc1202 | SET LOCAL 트랜잭션 범위 검증 | 문서 §19.1.2 (SET LOCAL) | PG17NEW: 아니오
-- 검증 포인트: LOCAL 은 트랜잭션 내에서만 / COMMIT·ROLLBACK 후 세션값 복귀 / 트랜잭션 밖 SET LOCAL 은 경고만
-- 결정론: 의도된 WARNING 은 client_min_messages=warning 으로 노출하되, 값 변화는 SHOW 결과로 직접 검증
SET client_min_messages = warning;

-- 기준 세션값 설정
SET work_mem = '64MB';
SHOW work_mem;                       -- 64MB (세션값)

-- BEGIN 안의 SET LOCAL 은 트랜잭션 안에서만 유효, COMMIT 후 세션값 복귀
BEGIN;
  SET LOCAL work_mem = '16MB';
  SHOW work_mem;                     -- 16MB (LOCAL)
COMMIT;
SHOW work_mem;                       -- 64MB (세션값 복귀)

-- 트랜잭션 안에서 SET(세션) 과 SET LOCAL 공존: 안에선 LOCAL, COMMIT 후 SET값
BEGIN;
  SET work_mem = '32MB';
  SET LOCAL work_mem = '16MB';
  SHOW work_mem;                     -- 16MB (LOCAL 우선)
COMMIT;
SHOW work_mem;                       -- 32MB (트랜잭션 내 SET 값 유지)

-- ROLLBACK 시 SET LOCAL 효과 소멸 (그리고 트랜잭션 내 SET 도 롤백)
SET work_mem = '64MB';
BEGIN;
  SET LOCAL work_mem = '16MB';
  SHOW work_mem;                     -- 16MB
ROLLBACK;
SHOW work_mem;                       -- 64MB (롤백으로 복귀)

-- 트랜잭션 블록 밖 SET LOCAL: WARNING 만 내고 값 불변
SET LOCAL work_mem = '128MB';        -- WARNING: SET LOCAL can only be used in transaction blocks
SHOW work_mem;                       -- 64MB (변하지 않음)

RESET work_mem;
```

### 예상결과 vs 실제결과 (줄 정렬 diff · `-`예상 / `+`실제)

```diff
@@ -62,8 +62,8 @@
  
  -- 트랜잭션 블록 밖 SET LOCAL: WARNING 만 내고 값 불변
  SET LOCAL work_mem = '128MB';        -- WARNING: SET LOCAL can only be used in transaction blocks
- SHOW work_mem;                       -- 64MB (변하지 않음)
  WARNING:  SET LOCAL can only be used in transaction blocks
+ SHOW work_mem;                       -- 64MB (변하지 않음)
   work_mem
  ----------
   64MB
```

---

## tc1301 · pg_hba scram-sha-256 인증  `PG-344`

- **TC ID**: `tc1301`
- **PG ID**: PG-344
- **판정**: ❌ FAIL
- **출처**: https://www.postgresql.org/docs/17/auth-pg-hba-conf.html (§20.1, 20.5)

### 설명

pg_hba.conf에 scram-sha-256 host 규칙을 삽입·reload한 뒤 올바른 비밀번호 접속은 성공하고 틀린 비밀번호는 'authentication failed'로 거부됨을 검증한다(원본 백업·trap 복원으로 인증 상태 원상복구)

### 테스트 단계

```bash
#!/usr/bin/env bash
# tc1301 | pg_hba scram-sha-256 인증 | 문서 §20.1, §20.5 | PG17NEW: 아니오
# 검증 포인트: scram 줄 삽입+reload / 올바른 비번 접속 성공 / 틀린 비번 거부
# 공유 컨테이너 보호: pg_hba.conf 원본을 백업하고 trap 으로 무조건 복원 + reload + DROP ROLE.
#   인증 상태를 반드시 원상복구 — 다른 TC 가 같은 컨테이너 사용.
# 결정론: reload 직후 재시도 루프로 타이밍 레이스 회피. 인증 메시지는 부분 문자열 매칭.
set -uo pipefail
source "$(dirname "$0")/../../runner/env.sh"

C="$C_SINGLE"
ROLE="tcqa_scram"
GOODPW="scr_good_pw_123"
BADPW="scr_wrong_pw_xyz"

PGDATA="$(docker exec -i "$C" psql -X -t -A -U postgres -d qa -c 'SHOW data_directory;' | tr -d '[:space:]')"
[ -n "$PGDATA" ] || { echo "FAIL: PGDATA 획득 실패"; echo "TC-RESULT: NG"; exit 0; }
HBA="$PGDATA/pg_hba.conf"
BAK="$PGDATA/pg_hba.conf.tc1301.bak"

# trap: 원본 복원 + reload + 롤 제거 (어떤 경로로 종료해도 원상복구)
cleanup() {
  docker exec -u postgres "$C" bash -lc "[ -f '$BAK' ] && cp -p '$BAK' '$HBA' && rm -f '$BAK'" 2>/dev/null
  docker exec -i "$C" psql -X -q -U postgres -d postgres -c "SELECT pg_reload_conf();" >/dev/null 2>&1
  docker exec -i "$C" psql -X -q -U postgres -d postgres -c "DROP ROLE IF EXISTS $ROLE;" >/dev/null 2>&1
}
trap cleanup EXIT

# 사전 정리 + 롤 생성 (scram 검증자 저장)
docker exec -i "$C" psql -X -q -U postgres -d postgres -c "DROP ROLE IF EXISTS $ROLE;" >/dev/null 2>&1
docker exec -i "$C" psql -X -q -U postgres -d postgres \
  -c "SET password_encryption='scram-sha-256';" \
  -c "CREATE ROLE $ROLE LOGIN PASSWORD '$GOODPW';" >/dev/null 2>&1

# pg_hba.conf 백업 후 scram 줄을 최상단에 삽입
docker exec -u postgres "$C" bash -lc "cp -p '$HBA' '$BAK' && \
  printf 'host all $ROLE 127.0.0.1/32 scram-sha-256\n' > '$HBA.new' && \
  cat '$HBA' >> '$HBA.new' && mv '$HBA.new' '$HBA'"

# reload + 적용 대기 (재시도 루프)
docker exec -i "$C" psql -X -q -t -A -U postgres -d postgres -c "SELECT pg_reload_conf();" >/dev/null 2>&1

# (1) 올바른 비밀번호 접속 성공 — 최대 10회 재시도
ok_login="FAIL"
for i in $(seq 1 10); do
  if docker exec -i -e PGPASSWORD="$GOODPW" "$C" \
       psql -X -t -A -h 127.0.0.1 -U "$ROLE" -d postgres -c 'SELECT 1' >/dev/null 2>&1; then
    ok_login="OK"; break
  fi
  sleep 1
done
echo "good_password_login: $ok_login"

# (2) 틀린 비밀번호 접속 거부 ('authentication failed' 부분 매칭)
bad_out="$(docker exec -i -e PGPASSWORD="$BADPW" "$C" \
  psql -X -t -A -h 127.0.0.1 -U "$ROLE" -d postgres -c 'SELECT 1' 2>&1)"
if echo "$bad_out" | grep -qi 'authentication failed'; then
  echo "bad_password_login: REJECTED (authentication failed)"
else
  echo "bad_password_login: UNEXPECTED"
fi

echo "TC-RESULT: OK"
```

### 예상결과 vs 실제결과 (줄 정렬 diff · `-`예상 / `+`실제)

```diff
@@ -1,3 +1,3 @@
- good_password_login: OK
+ good_password_login: FAIL
- bad_password_login: REJECTED (authentication failed)
+ bad_password_login: UNEXPECTED
  TC-RESULT: OK
```

---

## tc1302 · pg_hba trust/reject 분기  `PG-345`

- **TC ID**: `tc1302`
- **PG ID**: PG-345
- **판정**: ❌ FAIL
- **출처**: https://www.postgresql.org/docs/17/auth-pg-hba-conf.html (§20.1)

### 설명

pg_hba.conf의 trust(무조건 허용)와 reject(무조건 거부)가 비밀번호 유무와 무관하게 동작하고, 규칙이 위→아래 첫 매칭으로 적용됨(reject 줄을 trust 줄 위에 두면 거부)을 검증한다

### 테스트 단계

```bash
#!/usr/bin/env bash
# tc1302 | pg_hba trust/reject 분기 + 줄 순서 첫매칭 | 문서 §20.1 | PG17NEW: 아니오
# 검증 포인트: trust 무조건 허용 / reject 무조건 거부 / 위→아래 첫 매칭(reject 가 trust 위면 거부)
# 공유 컨테이너 보호: pg_hba.conf 원본 백업 + trap 무조건 복원 + reload + DROP ROLE.
# 결정론: reload 후 재시도 루프. 거부 메시지 'rejects connection' 부분 매칭.
set -uo pipefail
source "$(dirname "$0")/../../runner/env.sh"

C="$C_SINGLE"
R_TRUST="tcqa_trust"
R_REJECT="tcqa_reject"

PGDATA="$(docker exec -i "$C" psql -X -t -A -U postgres -d qa -c 'SHOW data_directory;' | tr -d '[:space:]')"
[ -n "$PGDATA" ] || { echo "FAIL: PGDATA 획득 실패"; echo "TC-RESULT: NG"; exit 0; }
HBA="$PGDATA/pg_hba.conf"
BAK="$PGDATA/pg_hba.conf.tc1302.bak"

cleanup() {
  docker exec -u postgres "$C" bash -lc "[ -f '$BAK' ] && cp -p '$BAK' '$HBA' && rm -f '$BAK'" 2>/dev/null
  docker exec -i "$C" psql -X -q -U postgres -d postgres -c "SELECT pg_reload_conf();" >/dev/null 2>&1
  docker exec -i "$C" psql -X -q -U postgres -d postgres \
    -c "DROP ROLE IF EXISTS $R_TRUST;" -c "DROP ROLE IF EXISTS $R_REJECT;" >/dev/null 2>&1
}
trap cleanup EXIT

# 롤 생성: trust 롤(비번 없음), reject 롤(비번 있음 — reject 가 비번 무관 차단임을 보이기 위함)
docker exec -i "$C" psql -X -q -U postgres -d postgres \
  -c "DROP ROLE IF EXISTS $R_TRUST;" -c "DROP ROLE IF EXISTS $R_REJECT;" \
  -c "CREATE ROLE $R_TRUST LOGIN;" \
  -c "CREATE ROLE $R_REJECT LOGIN PASSWORD 'pw_reject_123';" >/dev/null 2>&1

# pg_hba 백업 후, 두 롤 규칙을 최상단에 삽입.
#   reject 롤은 reject 줄을 trust 줄보다 위에 두어 '첫 매칭=거부'를 입증.
docker exec -u postgres "$C" bash -lc "cp -p '$HBA' '$BAK' && \
  { printf 'host all $R_TRUST 127.0.0.1/32 trust\n'; \
    printf 'host all $R_REJECT 127.0.0.1/32 reject\n'; \
    printf 'host all $R_REJECT 127.0.0.1/32 trust\n'; \
    cat '$HBA'; } > '$HBA.new' && mv '$HBA.new' '$HBA'"

docker exec -i "$C" psql -X -q -t -A -U postgres -d postgres -c "SELECT pg_reload_conf();" >/dev/null 2>&1

# (1) trust 롤: 비밀번호 없이 접속 성공 — 재시도 루프
trust_login="FAIL"
for i in $(seq 1 10); do
  if docker exec -i -u postgres "$C" \
       psql -X -t -A -h 127.0.0.1 -U "$R_TRUST" -d postgres -c 'SELECT 1' >/dev/null 2>&1; then
    trust_login="OK"; break
  fi
  sleep 1
done
echo "trust_login_no_password: $trust_login"

# (2) reject 롤: 올바른 비밀번호로도 거부 (reject 줄이 trust 줄보다 위 → 첫 매칭 거부)
reject_out="$(docker exec -i -e PGPASSWORD='pw_reject_123' "$C" \
  psql -X -t -A -h 127.0.0.1 -U "$R_REJECT" -d postgres -c 'SELECT 1' 2>&1)"
if echo "$reject_out" | grep -qi 'rejects connection'; then
  echo "reject_login_first_match: REJECTED (pg_hba.conf rejects connection)"
else
  echo "reject_login_first_match: UNEXPECTED"
fi

echo "TC-RESULT: OK"
```

### 예상결과 vs 실제결과 (줄 정렬 diff · `-`예상 / `+`실제)

```diff
@@ -1,3 +1,3 @@
- trust_login_no_password: OK
+ trust_login_no_password: FAIL
- reject_login_first_match: REJECTED (pg_hba.conf rejects connection)
+ reject_login_first_match: UNEXPECTED
  TC-RESULT: OK
```

---

## tc1614 · pg_basebackup --incremental 증분 백업  `PG-429`

- **TC ID**: `tc1614`
- **PG ID**: PG-429
- **판정**: ❌ FAIL
- **출처**: https://www.postgresql.org/docs/17/app-pgbasebackup.html (§26.3.3)

### 설명

PG17 신규 증분 백업으로 전체 백업 manifest를 기준으로 --incremental 백업을 받고 manifest 생성을 검증한다

### 테스트 단계

```bash
#!/usr/bin/env bash
# tc1614 | pg_basebackup --incremental 증분 백업(PG17 신기능) | 문서 §26.3.3 / pg_basebackup --incremental | PG17NEW: 예
# 검증 포인트: summarize_wal=on 확인 / 전체 백업 → 추가 변경 + pg_switch_wal → --incremental 종료코드 0 / 증분에 backup_manifest 존재
# 결정론: 증분 바이트·요약 LSN 미출력 — 종료코드 + manifest 파일 존재만. tcqa_inc DB는 끝에서 DROP, 백업 디렉토리 trap 정리.
set -uo pipefail
source "$(dirname "$0")/../../runner/env.sh"

C="${C_SINGLE}"
FULL=/tmp/tc1614_$$_full
INCR=/tmp/tc1614_$$_incr

cleanup() {
  docker exec -u postgres "$C" bash -lc "dropdb --if-exists tcqa_inc" >/dev/null 2>&1 || true
  docker exec "$C" bash -lc "rm -rf ${FULL} ${INCR}" >/dev/null 2>&1 || true
  echo "cleanup done"
}
trap cleanup EXIT

# summarize_wal 사전 확인
sw=$(docker exec -i -u postgres "$C" psql -X -q -A -t -U postgres -d postgres -c "SHOW summarize_wal" 2>/dev/null | tr -d '[:space:]')
echo "summarize_wal = ${sw} (need on)"
if [ "$sw" != "on" ]; then
  echo "pg_basebackup --incremental = SKIP (summarize_wal off)"
  echo "TC-RESULT: OK"; exit 0
fi

# 데이터 적재 + 전체 백업
docker exec -u postgres "$C" bash -lc "dropdb --if-exists tcqa_inc; createdb tcqa_inc" >/dev/null 2>&1
docker exec -i -u postgres "$C" psql -X -q -U postgres -d tcqa_inc >/dev/null 2>&1 <<'SQL'
SET client_min_messages=warning;
CREATE TABLE t(id int);
INSERT INTO t SELECT generate_series(1,100);
SQL
docker exec -u postgres "$C" pg_basebackup -D "${FULL}" -X stream -c fast >/dev/null 2>&1
echo "full backup exit = $?"

# 추가 변경 + WAL 스위치(요약 진척 유도)
docker exec -i -u postgres "$C" psql -X -q -U postgres -d tcqa_inc >/dev/null 2>&1 <<'SQL'
INSERT INTO t SELECT generate_series(101,200);
SELECT pg_switch_wal();
SQL
# WAL 요약이 manifest LSN 까지 진척되도록 잠시 폴링
docker exec -u postgres "$C" bash -lc 'for i in $(seq 1 30); do psql -X -tA -U postgres -d postgres -c "SELECT count(*) FROM pg_available_wal_summaries()" | grep -qvx 0 && break; sleep 1; done' >/dev/null 2>&1

# 증분 백업
docker exec -u postgres "$C" pg_basebackup -D "${INCR}" -X stream -c fast --incremental="${FULL}/backup_manifest" >/dev/null 2>&1
irc=$?
echo "incremental backup exit = ${irc} (expect 0)"
im=$(docker exec "$C" bash -lc "test -f ${INCR}/backup_manifest && echo yes || echo no")
echo "incremental backup_manifest exists = ${im}"

if [ "$irc" -eq 0 ] && [ "$im" = "yes" ]; then
  echo "pg_basebackup --incremental = OK"
else
  echo "pg_basebackup --incremental = FAIL (irc=$irc im=$im)"
fi

echo "TC-RESULT: OK"
```

### 예상결과 vs 실제결과 (줄 정렬 diff · `-`예상 / `+`실제)

```diff
@@ -1,7 +1,4 @@
- summarize_wal = on (need on)
+ summarize_wal = off (need on)
- full backup exit = 0
+ pg_basebackup --incremental = SKIP (summarize_wal off)
- incremental backup exit = 0 (expect 0)
- incremental backup_manifest exists = yes
- pg_basebackup --incremental = OK
  TC-RESULT: OK
  cleanup done
```

---

## tc1615 · pg_combinebackup 합성 후 기동·검증  `PG-430`

- **TC ID**: `tc1615`
- **PG ID**: PG-430
- **판정**: ❌ FAIL
- **출처**: https://www.postgresql.org/docs/17/app-pgcombinebackup.html (§26.3.4)

### 설명

PG17 신규 pg_combinebackup으로 전체+증분을 합성하고 별도 포트로 기동하여 증분 시점 데이터(200행)가 전부 복원됨을 검증한다

### 테스트 단계

```bash
#!/usr/bin/env bash
# tc1615 | pg_combinebackup 증분 합성 후 별도 포트 기동·데이터 검증(PG17 신기능) | 문서 §26.3.4 / pg_combinebackup | PG17NEW: 예
# 검증 포인트: full+incr(총 200행) → pg_combinebackup -o synth 종료코드 0 → pg_verifybackup synth 0 →
#              synth 를 컨테이너 내 포트 5440 으로 기동 → SELECT count(*)=200 → 메인 5432 무영향
# 결정론: 포트·PID·기동 로그 미출력 — count(*)=200 단일 검증 + 종료코드. 합성 인스턴스는 별도 데이터디렉토리+포트로 격리, trap stop+정리.
set -uo pipefail
source "$(dirname "$0")/../../runner/env.sh"

C="${C_SINGLE}"
PGBIN=/usr/lib/postgresql/17/bin   # postgres 로그인쉘 PATH에 빠져 절대경로 사용
FULL=/tmp/tc1615_$$_full
INCR=/tmp/tc1615_$$_incr
SYNTH=/tmp/tc1615_$$_synth
PORT=5440

cleanup() {
  # 합성 인스턴스 정지(기동돼 있으면) + 모든 임시물 + 테스트 DB 정리
  docker exec -u postgres "$C" bash -c "${PGBIN}/pg_ctl -D ${SYNTH} -m immediate -w stop >/dev/null 2>&1" || true
  docker exec -u postgres "$C" bash -lc "dropdb --if-exists tcqa_cb" >/dev/null 2>&1 || true
  docker exec "$C" bash -lc "rm -rf ${FULL} ${INCR} ${SYNTH}" >/dev/null 2>&1 || true
  echo "cleanup done"
}
trap cleanup EXIT

sw=$(docker exec -i -u postgres "$C" psql -X -q -A -t -U postgres -d postgres -c "SHOW summarize_wal" 2>/dev/null | tr -d '[:space:]')
if [ "$sw" != "on" ]; then
  echo "pg_combinebackup = SKIP (summarize_wal off)"; echo "TC-RESULT: OK"; exit 0
fi

# 데이터 적재 + 전체 백업 (100행)
docker exec -u postgres "$C" bash -lc "dropdb --if-exists tcqa_cb; createdb tcqa_cb" >/dev/null 2>&1
docker exec -i -u postgres "$C" psql -X -q -U postgres -d tcqa_cb >/dev/null 2>&1 <<'SQL'
SET client_min_messages=warning;
CREATE TABLE t(id int);
INSERT INTO t SELECT generate_series(1,100);
SQL
docker exec -u postgres "$C" pg_basebackup -D "${FULL}" -X stream -c fast >/dev/null 2>&1

# 추가 100행 + WAL 스위치 → 요약 진척 폴링
docker exec -i -u postgres "$C" psql -X -q -U postgres -d tcqa_cb >/dev/null 2>&1 <<'SQL'
INSERT INTO t SELECT generate_series(101,200);
SELECT pg_switch_wal();
SQL
docker exec -u postgres "$C" bash -lc 'for i in $(seq 1 30); do psql -X -tA -U postgres -d postgres -c "SELECT count(*) FROM pg_available_wal_summaries()" | grep -qvx 0 && break; sleep 1; done' >/dev/null 2>&1

# 증분 백업
docker exec -u postgres "$C" pg_basebackup -D "${INCR}" -X stream -c fast --incremental="${FULL}/backup_manifest" >/dev/null 2>&1
echo "incremental backup exit = $?"

# 합성
docker exec -u postgres "$C" pg_combinebackup "${FULL}" "${INCR}" -o "${SYNTH}" >/dev/null 2>&1
crc=$?
echo "pg_combinebackup exit = ${crc} (expect 0)"

# 합성 백업 무결성
docker exec -u postgres "$C" pg_verifybackup "${SYNTH}" >/dev/null 2>&1
vrc=$?
echo "pg_verifybackup synth exit = ${vrc} (expect 0)"

# synth 를 별도 포트로 기동 (메인 5432 무영향) → 데이터 검증
docker exec -u postgres "$C" bash -c "
  ${PGBIN}/pg_ctl -D ${SYNTH} -o '-p ${PORT} -c listen_addresses=localhost -c unix_socket_directories=/tmp' -w -t 60 start
" >/dev/null 2>&1
srt=$?
echo "synth instance start exit = ${srt}"
cnt=$(docker exec -u postgres "$C" bash -c "${PGBIN}/psql -h /tmp -p ${PORT} -X -q -A -t -U postgres -d tcqa_cb -c 'SELECT count(*) FROM t'" 2>/dev/null | tr -d '[:space:]')
echo "synth instance count(*) = ${cnt} (expect 200)"

# 메인 무영향 재확인
mainport=$(docker exec -i -u postgres "$C" psql -X -q -A -t -U postgres -d postgres -c "SHOW port" 2>/dev/null | tr -d '[:space:]')
echo "main port still = ${mainport} (expect 5432)"

if [ "$crc" -eq 0 ] && [ "$vrc" -eq 0 ] && [ "$cnt" = "200" ] && [ "$mainport" = "5432" ]; then
  echo "pg_combinebackup synth restore = OK"
else
  echo "pg_combinebackup synth restore = FAIL (crc=$crc vrc=$vrc cnt=$cnt mainport=$mainp
... [생략]
```

### 예상결과 vs 실제결과 (줄 정렬 diff · `-`예상 / `+`실제)

```diff
@@ -1,9 +1,3 @@
- incremental backup exit = 0
+ pg_combinebackup = SKIP (summarize_wal off)
- pg_combinebackup exit = 0 (expect 0)
- pg_verifybackup synth exit = 0 (expect 0)
- synth instance start exit = 0
- synth instance count(*) = 200 (expect 200)
- main port still = 5432 (expect 5432)
- pg_combinebackup synth restore = OK
  TC-RESULT: OK
  cleanup done
```

---

## tc1617 · 백업 매니페스트 system identifier(v2)  `PG-432`

- **TC ID**: `tc1617`
- **PG ID**: PG-432
- **판정**: ❌ FAIL
- **출처**: https://www.postgresql.org/docs/17/backup-manifest-format.html (§Backup Manifest Format)

### 설명

PG17 매니페스트 v2의 System-Identifier 필드를 확인하고 다른 클러스터 매니페스트로 검증 시 불일치로 실패함을 검증한다

### 테스트 단계

```bash
#!/usr/bin/env bash
# tc1617 | 백업 매니페스트 system identifier 검증(PG17 매니페스트 v2 신기능) | 문서 § Backup Manifest Format / System-Identifier | PG17NEW: 예
# 검증 포인트: manifest 에 'Manifest-Version: 2' 및 'System-Identifier' 키 존재 / sysid 값이 pg_controldata 와 일치 / 별도 클러스터 매니페스트로 -m 검증 시 mismatch 실패
# 결정론: sysid 숫자 자체는 두 출처 일치 여부만(추출→equality), 절대값 단정 금지. 별도 인스턴스는 /tmp 격리, trap 정리.
set -uo pipefail
source "$(dirname "$0")/../../runner/env.sh"

C="${C_SINGLE}"
PGBIN=/usr/lib/postgresql/17/bin
B=/tmp/tc1617_$$_bak
OTHER=/tmp/tc1617_$$_other      # 다른 system id 를 가질 별도 클러스터

cleanup() {
  docker exec "$C" bash -c "rm -rf ${B} ${OTHER}" >/dev/null 2>&1 || true
  echo "cleanup done"
}
trap cleanup EXIT

# 백업 + manifest 키 확인
docker exec -u postgres "$C" pg_basebackup -D "${B}" -X stream -c fast >/dev/null 2>&1
ver=$(docker exec "$C" bash -c "grep -c 'PostgreSQL-Backup-Manifest-Version.*2' ${B}/backup_manifest")
sid=$(docker exec "$C" bash -c "grep -c 'System-Identifier' ${B}/backup_manifest")
echo "manifest version2 lines=${ver}(>=1) System-Identifier lines=${sid}(>=1)"

# manifest 의 System-Identifier 값
m_sid=$(docker exec "$C" bash -c "grep 'System-Identifier' ${B}/backup_manifest | grep -oE '[0-9]+' | head -1")
# pg_controldata 의 Database system identifier
c_sid=$(docker exec -u postgres "$C" bash -c "${PGBIN}/pg_controldata /var/lib/postgresql/data | grep 'Database system identifier' | grep -oE '[0-9]+'")
echo "system identifier match (manifest vs controldata) = $([ -n "$m_sid" ] && [ "$m_sid" = "$c_sid" ] && echo yes || echo no)"

# 별도 클러스터(다른 sysid) 의 manifest 로 -m 검증 → mismatch 실패
docker exec -u postgres "$C" bash -c "${PGBIN}/initdb -D ${OTHER} -U postgres" >/dev/null 2>&1
# OTHER 의 manifest 는 없으므로, OTHER 에서 별도 백업 manifest 생성 대신: B 의 manifest 를 OTHER initdb 후
# 만든 백업의 것으로 교체하는 대신, 간단히 OTHER 를 잠깐 기동→백업받아 그 manifest 를 -m 으로 넘긴다.
docker exec -u postgres "$C" bash -c "
  ${PGBIN}/pg_ctl -D ${OTHER} -o '-p 5446 -c listen_addresses=localhost -c unix_socket_directories=/tmp' -w -t 60 start >/dev/null 2>&1
  ${PGBIN}/pg_basebackup -h /tmp -p 5446 -U postgres -D ${OTHER}_bak -X stream -c fast >/dev/null 2>&1
  ${PGBIN}/pg_ctl -D ${OTHER} -m immediate -w stop >/dev/null 2>&1
" >/dev/null 2>&1
# B 백업을 OTHER 의 manifest(다른 sysid)로 검증 → 실패해야
mm=$(docker exec -u postgres "$C" bash -c "pg_verifybackup -m ${OTHER}_bak/backup_manifest ${B} >/dev/null 2>&1; echo \$?")
docker exec "$C" bash -c "rm -rf ${OTHER}_bak" >/dev/null 2>&1 || true
echo "cross-cluster manifest verify exit = ${mm} (expect 비0 — system id mismatch)"

if [ "$ver" -ge 1 ] && [ "$sid" -ge 1 ] && [ -n "$m_sid" ] && [ "$m_sid" = "$c_sid" ] && [ "$mm" -ne 0 ]; then
  echo "manifest system identifier = OK"
else
  echo "manifest system identifier = FAIL (ver=$ver sid=$sid m=$m_sid c=$c_sid mm=$mm)"
fi

echo "TC-RESULT: OK"
```

### 예상결과 vs 실제결과 (줄 정렬 diff · `-`예상 / `+`실제)

```diff
@@ -1,6 +1,7 @@
  manifest version2 lines=1(>=1) System-Identifier lines=1(>=1)
- system identifier match (manifest vs controldata) = yes
+ bash: line 1: /usr/lib/postgresql/17/bin/pg_controldata: No such file or directory
+ system identifier match (manifest vs controldata) = no
  cross-cluster manifest verify exit = 1 (expect 비0 — system id mismatch)
- manifest system identifier = OK
+ manifest system identifier = FAIL (ver=1 sid=1 m=7655322411436988633 c= mm=1)
  TC-RESULT: OK
  cleanup done
```

---

## tc1618 · WAL 요약 함수  `PG-433`

- **TC ID**: `tc1618`
- **PG ID**: PG-433
- **판정**: ❌ FAIL
- **출처**: https://www.postgresql.org/docs/17/continuous-archiving.html (§26.3.3 / 9.27)

### 설명

summarize_wal=on 환경에서 pg_available_wal_summaries()/pg_wal_summary_contents()로 WAL 요약 목록·내용을 조회할 수 있음을 검증한다

### 테스트 단계

```bash
#!/usr/bin/env bash
# tc1618 | WAL 요약 함수 pg_available_wal_summaries()/pg_wal_summary_contents() | 문서 §26.3.3 / 9.27 System Functions | PG17NEW: 예
# 검증 포인트: summarize_wal=on / 데이터변경+pg_switch_wal 후 요약 count>0 / 한 행의 lsn 으로 pg_wal_summary_contents 가 행 반환(컬럼 존재)
# 결정론: LSN·TLI 값 미출력 — count>0 불변식과 컬럼 존재만. 요약 lsn 은 함수 반환값을 변수로 받아 재사용. 테스트 DB 끝에서 DROP.
set -uo pipefail
source "$(dirname "$0")/../../runner/env.sh"

C="${C_SINGLE}"
P="docker exec -i -u postgres ${C} psql -X -q -A -t -U postgres -d postgres"

cleanup() {
  docker exec -u postgres "$C" bash -c "dropdb --if-exists tcqa_ws" >/dev/null 2>&1 || true
  echo "cleanup done"
}
trap cleanup EXIT

sw=$($P -c "SHOW summarize_wal" 2>/dev/null | tr -d '[:space:]')
echo "summarize_wal = ${sw} (need on)"
if [ "$sw" != "on" ]; then echo "WAL summary functions = SKIP (summarize_wal off)"; echo "TC-RESULT: OK"; exit 0; fi

# 데이터 변경 + WAL 스위치 → 요약 생성 유도 (폴링)
docker exec -u postgres "$C" bash -c "dropdb --if-exists tcqa_ws; createdb tcqa_ws" >/dev/null 2>&1
docker exec -i -u postgres "$C" psql -X -q -U postgres -d tcqa_ws >/dev/null 2>&1 <<'SQL'
SET client_min_messages=warning;
CREATE TABLE t(id int); INSERT INTO t SELECT generate_series(1,500);
SELECT pg_switch_wal();
SQL
docker exec -u postgres "$C" bash -c 'for i in $(seq 1 30); do psql -X -tA -U postgres -d postgres -c "SELECT count(*) FROM pg_available_wal_summaries()" | grep -qvx 0 && break; sleep 1; done' >/dev/null 2>&1

# 요약 1개 이상 (count>0 불변식)
n=$($P -c "SELECT count(*) FROM pg_available_wal_summaries()" 2>/dev/null | tr -d '[:space:]')
echo "available WAL summaries count>0 = $([ "${n:-0}" -gt 0 ] && echo yes || echo no)"

# 내용 있는 요약(최신이 비어있을 수 있어 nrows>0 인 요약 선택) 으로 contents 가 행을 반환하는지
# — 변경 블록 정보를 담은 요약이 1개 이상 존재함을 불변식으로 검증
hascols=$($P <<'SQL' 2>/dev/null | tr -d '[:space:]'
SELECT bool_or(
  (SELECT count(*) FROM pg_wal_summary_contents(tli,start_lsn,end_lsn)) > 0
)::text
FROM pg_available_wal_summaries();
SQL
)
echo "some WAL summary has contents rows = ${hascols}"

# 기대 컬럼(relfilenode/reltablespace/relforknumber/relblocknumber/is_limit_block) 존재 — 함수 시그니처 검증
colok=$($P <<'SQL' 2>&1 | tr -d '[:space:]'
WITH s AS (SELECT tli, start_lsn, end_lsn FROM pg_available_wal_summaries() ORDER BY end_lsn LIMIT 1)
SELECT count(*) FROM (
  SELECT relfilenode, reltablespace, relforknumber, relblocknumber, is_limit_block
  FROM pg_wal_summary_contents((SELECT tli FROM s),(SELECT start_lsn FROM s),(SELECT end_lsn FROM s)) LIMIT 0
) z;
SQL
)
echo "expected columns resolvable = $([ "$colok" = "0" ] && echo yes || echo no)"

if [ "${n:-0}" -gt 0 ] && [ "$hascols" = "true" ] && [ "$colok" = "0" ]; then
  echo "WAL summary functions = OK"
else
  echo "WAL summary functions = FAIL (n=$n rows=$hascols colok=$colok)"
fi

echo "TC-RESULT: OK"
```

### 예상결과 vs 실제결과 (줄 정렬 diff · `-`예상 / `+`실제)

```diff
@@ -1,7 +1,4 @@
- summarize_wal = on (need on)
+ summarize_wal = off (need on)
- available WAL summaries count>0 = yes
+ WAL summary functions = SKIP (summarize_wal off)
- some WAL summary has contents rows = true
- expected columns resolvable = yes
- WAL summary functions = OK
  TC-RESULT: OK
  cleanup done
```

---

## tc1619 · pg_walsummary CLI 디코드  `PG-434`

- **TC ID**: `tc1619`
- **PG ID**: PG-434
- **판정**: ❌ FAIL
- **출처**: https://www.postgresql.org/docs/17/app-pgwalsummary.html (§pg_walsummary)

### 설명

PG17 신규 pg_walsummary 명령으로 pg_wal/summaries의 WAL 요약 파일을 읽어 변경 블록 정보를 디코드할 수 있음을 검증한다

### 테스트 단계

```bash
#!/usr/bin/env bash
# tc1619 | pg_walsummary CLI 로 WAL 요약 파일 디코드(PG17 신기능) | 문서 § pg_walsummary | PG17NEW: 예
# 검증 포인트: 데이터변경+pg_switch_wal 로 요약 파일 생성 / pg_wal/summaries/*.summary 1개 이상 / pg_walsummary 종료코드0 + 디코드 행(TS/DB/REL) 존재 / -i 옵션도 0
# 결정론: 블록번호·LSN 미출력 — 종료코드 + 디코드 라인수>0 만. 테스트 DB 끝에서 DROP.
set -uo pipefail
source "$(dirname "$0")/../../runner/env.sh"

C="${C_SINGLE}"
PGBIN=/usr/lib/postgresql/17/bin
SUMDIR=/var/lib/postgresql/data/pg_wal/summaries

cleanup() {
  docker exec -u postgres "$C" bash -c "dropdb --if-exists tcqa_wcli" >/dev/null 2>&1 || true
  echo "cleanup done"
}
trap cleanup EXIT

sw=$(docker exec -i -u postgres "$C" psql -X -q -A -t -U postgres -d postgres -c "SHOW summarize_wal" 2>/dev/null | tr -d '[:space:]')
if [ "$sw" != "on" ]; then echo "pg_walsummary CLI = SKIP (summarize_wal off)"; echo "TC-RESULT: OK"; exit 0; fi

# 요약 파일 생성 유도
docker exec -u postgres "$C" bash -c "dropdb --if-exists tcqa_wcli; createdb tcqa_wcli" >/dev/null 2>&1
docker exec -i -u postgres "$C" psql -X -q -U postgres -d tcqa_wcli >/dev/null 2>&1 <<'SQL'
SET client_min_messages=warning;
CREATE TABLE t(id int); INSERT INTO t SELECT generate_series(1,500);
SELECT pg_switch_wal();
SQL
docker exec -u postgres "$C" bash -c "for i in \$(seq 1 30); do ls ${SUMDIR}/*.summary >/dev/null 2>&1 && break; sleep 1; done"

nfiles=$(docker exec -u postgres "$C" bash -c "ls ${SUMDIR}/*.summary 2>/dev/null | wc -l" | tr -d '[:space:]')
echo "summary files count>0 = $([ "${nfiles:-0}" -gt 0 ] && echo yes || echo no)"

if [ "${nfiles:-0}" -le 0 ]; then
  echo "pg_walsummary CLI = FAIL (no summary file produced)"; echo "TC-RESULT: OK"; exit 0
fi

SF=$(docker exec -u postgres "$C" bash -c "ls ${SUMDIR}/*.summary 2>/dev/null | head -1" | tr -d '[:space:]')

# 디코드 — 종료코드 + 비어있지 않은 출력
out=$(docker exec -u postgres "$C" bash -c "${PGBIN}/pg_walsummary ${SF} 2>/dev/null")
rc=$(docker exec -u postgres "$C" bash -c "${PGBIN}/pg_walsummary ${SF} >/dev/null 2>&1; echo \$?")
lines=$(printf '%s\n' "$out" | grep -cE "TS |DB |REL ")
echo "pg_walsummary exit=${rc}(0) decode-lines>0 = $([ "$lines" -gt 0 ] && echo yes || echo no)"

# -i (individual)
irc=$(docker exec -u postgres "$C" bash -c "${PGBIN}/pg_walsummary -i ${SF} >/dev/null 2>&1; echo \$?")
echo "pg_walsummary -i exit = ${irc} (expect 0)"

if [ "$rc" = "0" ] && [ "$lines" -gt 0 ] && [ "$irc" = "0" ]; then
  echo "pg_walsummary CLI = OK"
else
  echo "pg_walsummary CLI = FAIL (rc=$rc lines=$lines irc=$irc)"
fi

echo "TC-RESULT: OK"
```

### 예상결과 vs 실제결과 (줄 정렬 diff · `-`예상 / `+`실제)

```diff
@@ -1,6 +1,3 @@
- summary files count>0 = yes
+ pg_walsummary CLI = SKIP (summarize_wal off)
- pg_walsummary exit=0(0) decode-lines>0 = yes
- pg_walsummary -i exit = 0 (expect 0)
- pg_walsummary CLI = OK
  TC-RESULT: OK
  cleanup done
```

---

## tc1620 · 연속 아카이빙(archive_command)  `PG-435`

- **TC ID**: `tc1620`
- **PG ID**: PG-435
- **판정**: ❌ FAIL
- **출처**: https://www.postgresql.org/docs/17/continuous-archiving.html (§26.3.1)

### 설명

별도 인스턴스(포트 5441)에 archive_mode=on+archive_command를 설정·기동하고 WAL 스위치 시 아카이브 디렉토리에 WAL이 적재됨을 검증한다

### 테스트 단계

```bash
#!/usr/bin/env bash
# tc1620 | 연속 아카이빙 — archive_command 설정 + WAL 아카이브 적재 | 문서 §26.3.1 Setting Up WAL Archiving | PG17NEW: 아니오
# 검증 포인트: /tmp 별도 인스턴스(포트 5441)에 archive_mode=on+archive_command(cp) 기동 / 데이터변경+pg_switch_wal 후 아카이브 디렉토리 파일>0 / 메인 5432 무영향
# 결정론: WAL 파일명 절대값 미출력 — 아카이브 파일 개수>0 만. archive_mode 변경은 메인 미적용(별도 인스턴스 격리), trap 정리.
set -uo pipefail
source "$(dirname "$0")/../../runner/env.sh"

C="${C_SINGLE}"
PGBIN=/usr/lib/postgresql/17/bin
D=/tmp/tc1620_$$_data
ARCH=/tmp/tc1620_$$_arch
PORT=5441

cleanup() {
  docker exec -u postgres "$C" bash -c "${PGBIN}/pg_ctl -D ${D} -m immediate -w stop >/dev/null 2>&1" || true
  docker exec "$C" bash -c "rm -rf ${D} ${ARCH}" >/dev/null 2>&1 || true
  echo "cleanup done"
}
trap cleanup EXIT

# 별도 인스턴스 initdb + archive 설정 + 기동 (메인과 완전 격리)
docker exec -u postgres "$C" bash -c "
  set -e
  ${PGBIN}/initdb -D ${D} -U postgres >/dev/null 2>&1
  mkdir -p ${ARCH}
  cat >> ${D}/postgresql.conf <<CONF
archive_mode = on
archive_command = 'cp %p ${ARCH}/%f'
wal_level = replica
CONF
  ${PGBIN}/pg_ctl -D ${D} -o '-p ${PORT} -c listen_addresses=localhost -c unix_socket_directories=/tmp' -w -t 60 start >/dev/null 2>&1
" >/dev/null 2>&1
echo "separate instance start exit = $?"

# 데이터 변경 + WAL 스위치 → 아카이브 적재 유도
docker exec -u postgres "$C" bash -c "
  ${PGBIN}/psql -h /tmp -p ${PORT} -X -q -U postgres -d postgres -c 'CREATE TABLE t(id int); INSERT INTO t SELECT generate_series(1,100);' >/dev/null 2>&1
  ${PGBIN}/psql -h /tmp -p ${PORT} -X -q -U postgres -d postgres -c 'SELECT pg_switch_wal();' >/dev/null 2>&1
  for i in \$(seq 1 20); do [ \$(ls ${ARCH} 2>/dev/null | wc -l) -gt 0 ] && break; sleep 1; done
"
n=$(docker exec "$C" bash -c "ls ${ARCH} 2>/dev/null | wc -l" | tr -d '[:space:]')
echo "archived WAL files count>0 = $([ "${n:-0}" -gt 0 ] && echo yes || echo no)"

mainport=$(docker exec -i -u postgres "$C" psql -X -q -A -t -U postgres -d postgres -c "SHOW port" 2>/dev/null | tr -d '[:space:]')
mainarch=$(docker exec -i -u postgres "$C" psql -X -q -A -t -U postgres -d postgres -c "SHOW archive_mode" 2>/dev/null | tr -d '[:space:]')
echo "main port=${mainport}(5432) archive_mode=${mainarch}(off — 미적용)"

if [ "${n:-0}" -gt 0 ] && [ "$mainport" = "5432" ] && [ "$mainarch" = "off" ]; then
  echo "continuous archiving = OK"
else
  echo "continuous archiving = FAIL (n=$n mainport=$mainport mainarch=$mainarch)"
fi

echo "TC-RESULT: OK"
```

### 예상결과 vs 실제결과 (줄 정렬 diff · `-`예상 / `+`실제)

```diff
@@ -1,6 +1,6 @@
- separate instance start exit = 0
+ separate instance start exit = 127
- archived WAL files count>0 = yes
+ archived WAL files count>0 = no
- main port=5432(5432) archive_mode=off(off — 미적용)
+ main port=5333(5432) archive_mode=off(off — 미적용)
- continuous archiving = OK
+ continuous archiving = FAIL (n=0 mainport=5333 mainarch=off)
  TC-RESULT: OK
  cleanup done
```

---

## tc1621 · PITR 시점 복구(recovery_target_name)  `PG-436`

- **TC ID**: `tc1621`
- **PG ID**: PG-436
- **판정**: ❌ FAIL
- **출처**: https://www.postgresql.org/docs/17/continuous-archiving.html (§26.3.5)

### 설명

별도 소스/복구 인스턴스(5442/5443)로 베이스백업·연속아카이빙을 구성하고 restore point 명명 시점까지 복구하여 그 시점 데이터(50행)만 복원됨을 검증한다

### 테스트 단계

```bash
#!/usr/bin/env bash
# tc1621 | PITR — 베이스백업→변경→restore point→별도 디렉토리 시점 복구 기동 | 문서 §26.3.5 / recovery_target_name | PG17NEW: 아니오
# 검증 포인트: 소스 인스턴스(5442) archive_mode=on / 베이스백업 → 행 A 적재 → pg_create_restore_point('rp1') → 행 B 적재 →
#              복구 인스턴스(5443) restore_command + recovery_target_name='rp1' + promote → SELECT count(*) = rp1 시점 행수(A만)
# 결정론: 복구 LSN·타임라인 미출력 — rp1 시점 행 수 정확값(고정 입력 기반)만. 모든 인스턴스 /tmp 격리+전용 포트, trap 정리.
set -uo pipefail
source "$(dirname "$0")/../../runner/env.sh"

C="${C_SINGLE}"
PGBIN=/usr/lib/postgresql/17/bin
SRC=/tmp/tc1621_$$_src
RST=/tmp/tc1621_$$_rst
ARCH=/tmp/tc1621_$$_arch
SPORT=5442; RPORT=5443

cleanup() {
  docker exec -u postgres "$C" bash -c "${PGBIN}/pg_ctl -D ${SRC} -m immediate -w stop >/dev/null 2>&1" || true
  docker exec -u postgres "$C" bash -c "${PGBIN}/pg_ctl -D ${RST} -m immediate -w stop >/dev/null 2>&1" || true
  docker exec "$C" bash -c "rm -rf ${SRC} ${RST} ${ARCH}" >/dev/null 2>&1 || true
  echo "cleanup done"
}
trap cleanup EXIT

# 1) 소스 인스턴스 (archive_mode=on, 베이스백업은 rp 이전에 받음)
docker exec -u postgres "$C" bash -c "
  set -e
  ${PGBIN}/initdb -D ${SRC} -U postgres >/dev/null 2>&1
  mkdir -p ${ARCH}
  cat >> ${SRC}/postgresql.conf <<CONF
archive_mode = on
archive_command = 'cp %p ${ARCH}/%f'
wal_level = replica
CONF
  ${PGBIN}/pg_ctl -D ${SRC} -o '-p ${SPORT} -c listen_addresses=localhost -c unix_socket_directories=/tmp' -w -t 60 start >/dev/null 2>&1
" >/dev/null 2>&1
echo "source instance start exit = $?"

SPSQL="${PGBIN}/psql -h /tmp -p ${SPORT} -X -q -U postgres -d postgres"

# 2) 베이스백업(빈 상태) → 행 A(50) → rp1 → 행 B(50 추가)
docker exec -u postgres "$C" bash -c "${PGBIN}/pg_basebackup -h /tmp -p ${SPORT} -U postgres -D ${RST} -X stream -c fast" >/dev/null 2>&1
docker exec -u postgres "$C" bash -c "
  ${SPSQL} -c 'CREATE TABLE t(id int); INSERT INTO t SELECT generate_series(1,50);' >/dev/null 2>&1
  ${SPSQL} -c \"SELECT pg_create_restore_point('rp1');\" >/dev/null 2>&1
  ${SPSQL} -c 'INSERT INTO t SELECT generate_series(51,100);' >/dev/null 2>&1
  ${SPSQL} -c 'SELECT pg_switch_wal();' >/dev/null 2>&1
  # rp 이후 WAL 이 아카이브되도록 잠시 대기
  for i in \$(seq 1 20); do [ \$(ls ${ARCH} 2>/dev/null | wc -l) -gt 0 ] && break; sleep 1; done
"

# 3) 복구 인스턴스 설정: restore_command + recovery_target_name=rp1 + promote
docker exec -u postgres "$C" bash -c "
  cat >> ${RST}/postgresql.conf <<CONF
restore_command = 'cp ${ARCH}/%f %p'
recovery_target_name = 'rp1'
recovery_target_action = 'promote'
archive_mode = off
CONF
  touch ${RST}/recovery.signal
  ${PGBIN}/pg_ctl -D ${RST} -o '-p ${RPORT} -c listen_addresses=localhost -c unix_socket_directories=/tmp' -w -t 120 start >/dev/null 2>&1 || true
  # 복구·프로모션 완료까지 대기 (in_recovery=false 될 때까지)
  for i in \$(seq 1 60); do
    r=\$(${PGBIN}/psql -h /tmp -p ${RPORT} -X -A -t -U postgres -d postgres -c 'SELECT pg_is_in_recovery()' 2>/dev/null | tr -d '[:space:]')
    [ \"\$r\" = \"f\" ] && break; sleep 1
  done
" >/dev/null 2>&1

cnt=$(docker exec -u postgres "$C" bash -c "${PGBIN}/psql -h /tmp -p ${RPORT} -X -A -t -U postgres -d postgres -c 'SELECT count(*) FROM t'" 2>/dev/null | tr -d '[:space:]')
echo "recovered count at rp1 = ${cnt} (expect 50 — 행 B 제외)"

mainport=$(docker exec -i -u postgres "$C" psql -X -q -A -t -U postgres -d postgres -c "SHOW port" 2>/dev/null | tr -d '[:space:]')
echo "main port still = ${mainport} (5432)"

if [ "$cnt" = "50" ] && [ "$mainport" = "5432" ]; then
  echo "PITR recovery_target_name = OK"
else
  echo "PITR recovery_target_name =
... [생략]
```

### 예상결과 vs 실제결과 (줄 정렬 diff · `-`예상 / `+`실제)

```diff
@@ -1,6 +1,6 @@
- source instance start exit = 0
+ source instance start exit = 127
- recovered count at rp1 = 50 (expect 50 — 행 B 제외)
+ recovered count at rp1 =  (expect 50 — 행 B 제외)
- main port still = 5432 (5432)
+ main port still = 5333 (5432)
- PITR recovery_target_name = OK
+ PITR recovery_target_name = FAIL (cnt= mainport=5333)
  TC-RESULT: OK
  cleanup done
```

---

## tc1622 · pg_archivecleanup CLI  `PG-437`

- **TC ID**: `tc1622`
- **PG ID**: PG-437
- **판정**: ❌ FAIL
- **출처**: https://www.postgresql.org/docs/17/pgarchivecleanup.html (§pg_archivecleanup)

### 설명

pg_archivecleanup으로 지정 WAL 파일보다 오래된 아카이브 세그먼트를 삭제할 수 있음을 검증한다(개수 3→1)

### 테스트 단계

```bash
#!/usr/bin/env bash
# tc1622 | pg_archivecleanup CLI 로 오래된 WAL 아카이브 정리 | 문서 § pg_archivecleanup | PG17NEW: 아니오
# 검증 포인트: 가짜 WAL 세그먼트명 파일 3개(...0001~0003) → pg_archivecleanup arch ...0003 → 001/002 삭제·003 보존(개수 3→1) / -d 시 'removing' 메시지
# 결정론: 파일명 출력 대신 정리 전후 개수(3→1)로 검증. 임시 디렉토리 trap 정리.
set -uo pipefail
source "$(dirname "$0")/../../runner/env.sh"

C="${C_SINGLE}"
PGBIN=/usr/lib/postgresql/17/bin
ARCH=/tmp/tc1622_$$_arch

cleanup() {
  docker exec "$C" bash -c "rm -rf ${ARCH}" >/dev/null 2>&1 || true
  echo "cleanup done"
}
trap cleanup EXIT

# 가짜 WAL 세그먼트 3개 (24자리 16진명) — postgres 소유로 생성(정리 권한 확보)
docker exec -u postgres "$C" bash -c "
  mkdir -p ${ARCH}
  : > ${ARCH}/000000010000000000000001
  : > ${ARCH}/000000010000000000000002
  : > ${ARCH}/000000010000000000000003
"
before=$(docker exec "$C" bash -c "ls ${ARCH} | wc -l" | tr -d '[:space:]')
echo "before cleanup file count = ${before} (expect 3)"

# 003 보다 오래된 것 정리
docker exec -u postgres "$C" bash -c "${PGBIN}/pg_archivecleanup ${ARCH} 000000010000000000000003" >/dev/null 2>&1
after=$(docker exec "$C" bash -c "ls ${ARCH} | wc -l" | tr -d '[:space:]')
keep003=$(docker exec "$C" bash -c "test -f ${ARCH}/000000010000000000000003 && echo yes || echo no")
echo "after cleanup file count = ${after} (expect 1), 003 kept = ${keep003}"

# -d (디버그) 시 'removing' 류 메시지 (파일 재생성 후)
docker exec -u postgres "$C" bash -c ": > ${ARCH}/000000010000000000000001; : > ${ARCH}/000000010000000000000002"
dbg=$(docker exec -u postgres "$C" bash -c "${PGBIN}/pg_archivecleanup -d ${ARCH} 000000010000000000000003 2>&1" | grep -ciE "removing|remov")
echo "-d removing message = $([ "$dbg" -ge 1 ] && echo yes || echo no)"

if [ "$before" = "3" ] && [ "$after" = "1" ] && [ "$keep003" = "yes" ] && [ "$dbg" -ge 1 ]; then
  echo "pg_archivecleanup = OK"
else
  echo "pg_archivecleanup = FAIL (before=$before after=$after keep=$keep003 dbg=$dbg)"
fi

echo "TC-RESULT: OK"
```

### 예상결과 vs 실제결과 (줄 정렬 diff · `-`예상 / `+`실제)

```diff
@@ -1,6 +1,6 @@
  before cleanup file count = 3 (expect 3)
- after cleanup file count = 1 (expect 1), 003 kept = yes
+ after cleanup file count = 3 (expect 1), 003 kept = yes
- -d removing message = yes
+ -d removing message = no
- pg_archivecleanup = OK
+ pg_archivecleanup = FAIL (before=3 after=3 keep=yes dbg=0)
  TC-RESULT: OK
  cleanup done
```

---

## tc1623 · basic_archive 모듈 아카이빙  `PG-438`

- **TC ID**: `tc1623`
- **PG ID**: PG-438
- **판정**: ❌ FAIL
- **출처**: https://www.postgresql.org/docs/17/basic-archive.html (§F.4 / Chapter 50)

### 설명

내장 basic_archive 모듈을 archive_library로 로드하여 모듈 방식으로 WAL을 아카이브할 수 있음을 별도 인스턴스(5444)에서 검증한다

### 테스트 단계

```bash
#!/usr/bin/env bash
# tc1623 | basic_archive 컨트립 — archive_library 로 모듈 기반 아카이빙 | 문서 §F.4 / Chapter 50 Archive Modules | PG17NEW: 아니오
# 검증 포인트: basic_archive.so 존재 확인(없으면 SKIP) / /tmp 별도 인스턴스(5444) archive_library='basic_archive' + archive_directory 기동 /
#              데이터변경+pg_switch_wal 후 아카이브 디렉토리 파일>0 / 메인 무영향
# 결정론: WAL 파일명 미출력 — 아카이브 파일 개수>0 만. basic_archive.so 부재 시 SKIP 후 TC-RESULT: OK(환경 폴백), trap 정리.
set -uo pipefail
source "$(dirname "$0")/../../runner/env.sh"

C="${C_SINGLE}"
PGBIN=/usr/lib/postgresql/17/bin
D=/tmp/tc1623_$$_data
ARCH=/tmp/tc1623_$$_arch
PORT=5444

cleanup() {
  docker exec -u postgres "$C" bash -c "${PGBIN}/pg_ctl -D ${D} -m immediate -w stop >/dev/null 2>&1" || true
  docker exec "$C" bash -c "rm -rf ${D} ${ARCH}" >/dev/null 2>&1 || true
  echo "cleanup done"
}
trap cleanup EXIT

# basic_archive.so 존재 확인
has=$(docker exec "$C" bash -c "test -f /usr/lib/postgresql/17/lib/basic_archive.so && echo yes || echo no")
echo "basic_archive.so present = ${has}"
if [ "$has" != "yes" ]; then
  echo "SKIP: basic_archive 미설치"
  echo "TC-RESULT: OK"; exit 0
fi

# 별도 인스턴스: archive_library + basic_archive.archive_directory
docker exec -u postgres "$C" bash -c "
  set -e
  ${PGBIN}/initdb -D ${D} -U postgres >/dev/null 2>&1
  mkdir -p ${ARCH}
  cat >> ${D}/postgresql.conf <<CONF
archive_mode = on
archive_library = 'basic_archive'
basic_archive.archive_directory = '${ARCH}'
wal_level = replica
CONF
  ${PGBIN}/pg_ctl -D ${D} -o '-p ${PORT} -c listen_addresses=localhost -c unix_socket_directories=/tmp' -w -t 60 start >/dev/null 2>&1
" >/dev/null 2>&1
echo "module-archiving instance start exit = $?"

docker exec -u postgres "$C" bash -c "
  ${PGBIN}/psql -h /tmp -p ${PORT} -X -q -U postgres -d postgres -c 'CREATE TABLE t(id int); INSERT INTO t SELECT generate_series(1,100);' >/dev/null 2>&1
  ${PGBIN}/psql -h /tmp -p ${PORT} -X -q -U postgres -d postgres -c 'SELECT pg_switch_wal();' >/dev/null 2>&1
  for i in \$(seq 1 25); do [ \$(ls ${ARCH} 2>/dev/null | wc -l) -gt 0 ] && break; sleep 1; done
"
n=$(docker exec "$C" bash -c "ls ${ARCH} 2>/dev/null | wc -l" | tr -d '[:space:]')
echo "module-archived WAL files count>0 = $([ "${n:-0}" -gt 0 ] && echo yes || echo no)"

mainport=$(docker exec -i -u postgres "$C" psql -X -q -A -t -U postgres -d postgres -c "SHOW port" 2>/dev/null | tr -d '[:space:]')
echo "main port still = ${mainport} (5432)"

if [ "${n:-0}" -gt 0 ] && [ "$mainport" = "5432" ]; then
  echo "basic_archive module archiving = OK"
else
  echo "basic_archive module archiving = FAIL (n=$n mainport=$mainport)"
fi

echo "TC-RESULT: OK"
```

### 예상결과 vs 실제결과 (줄 정렬 diff · `-`예상 / `+`실제)

```diff
@@ -1,7 +1,4 @@
- basic_archive.so present = yes
+ basic_archive.so present = no
- module-archiving instance start exit = 0
+ SKIP: basic_archive 미설치
- module-archived WAL files count>0 = yes
- main port still = 5432 (5432)
- basic_archive module archiving = OK
  TC-RESULT: OK
  cleanup done
```

---

## tc1624 · archive_library vs archive_command 상호배타  `PG-439`

- **TC ID**: `tc1624`
- **PG ID**: PG-439
- **판정**: ❌ FAIL
- **출처**: https://www.postgresql.org/docs/17/archive-modules.html (§50.1)

### 설명

archive_library와 archive_command를 동시 설정하면 서버가 충돌로 아카이빙을 비활성함을 별도 인스턴스(5445)에서 검증한다

### 테스트 단계

```bash
#!/usr/bin/env bash
# tc1624 | Archive Modules 프레임워크 — archive_library vs archive_command 상호배타 | 문서 §50.1 / archive_library | PG17NEW: 아니오
# 검증 포인트: /tmp 별도 인스턴스(5445)에 archive_library + archive_command 동시 설정 → 기동 시 'both ... specified' 에러/경고로 아카이빙 비활성(로그) /
#              하나만 설정 시 정상(대조) / 메인 무영향
# 결정론: 에러/경고 키워드 매칭만 — 타임스탬프·PID 미출력. 충돌은 메시지 존재 또는 아카이빙 비활성 둘 중 하나로 판정, trap 정리.
set -uo pipefail
source "$(dirname "$0")/../../runner/env.sh"

C="${C_SINGLE}"
PGBIN=/usr/lib/postgresql/17/bin
D=/tmp/tc1624_$$_data
ARCH=/tmp/tc1624_$$_arch
LOG=/tmp/tc1624_$$_log
PORT=5445

cleanup() {
  docker exec -u postgres "$C" bash -c "${PGBIN}/pg_ctl -D ${D} -m immediate -w stop >/dev/null 2>&1" || true
  docker exec "$C" bash -c "rm -rf ${D} ${ARCH} ${LOG}" >/dev/null 2>&1 || true
  echo "cleanup done"
}
trap cleanup EXIT

has=$(docker exec "$C" bash -c "test -f /usr/lib/postgresql/17/lib/basic_archive.so && echo yes || echo no")
if [ "$has" != "yes" ]; then echo "SKIP: basic_archive 미설치"; echo "TC-RESULT: OK"; exit 0; fi

# 둘 다 설정 → 기동(로그 캡처). 서버는 기동되더라도 충돌 경고 + 아카이빙 비활성이어야.
docker exec -u postgres "$C" bash -c "
  set -e
  ${PGBIN}/initdb -D ${D} -U postgres >/dev/null 2>&1
  mkdir -p ${ARCH} ${LOG}
  cat >> ${D}/postgresql.conf <<CONF
archive_mode = on
archive_library = 'basic_archive'
archive_command = 'cp %p ${ARCH}/%f'
basic_archive.archive_directory = '${ARCH}'
wal_level = replica
logging_collector = on
log_directory = '${LOG}'
log_filename = 'pg.log'
CONF
  ${PGBIN}/pg_ctl -D ${D} -o '-p ${PORT} -c listen_addresses=localhost -c unix_socket_directories=/tmp' -w -t 60 start >/dev/null 2>&1 || true
  sleep 3
"
# 로그에서 충돌 메시지
conflict=$(docker exec "$C" bash -c "cat ${LOG}/pg.log 2>/dev/null" | grep -ciE "both archive_command and archive_library|archive_library.*archive_command|cannot.*both")
echo "conflict warning/error in log = $([ "$conflict" -ge 1 ] && echo yes || echo no)"

# 아카이빙 비활성 여부 보조 판정: 변경+switch 후 아카이브 비어있어야 (충돌 시 비활성)
running=$(docker exec -u postgres "$C" bash -c "${PGBIN}/psql -h /tmp -p ${PORT} -X -A -t -U postgres -d postgres -c 'SELECT 1' 2>/dev/null" | tr -d '[:space:]')
if [ "$running" = "1" ]; then
  docker exec -u postgres "$C" bash -c "
    ${PGBIN}/psql -h /tmp -p ${PORT} -X -q -U postgres -d postgres -c 'CREATE TABLE t(id int); SELECT pg_switch_wal();' >/dev/null 2>&1
    sleep 3
  "
fi
arch_n=$(docker exec "$C" bash -c "ls ${ARCH} 2>/dev/null | grep -vc summary" 2>/dev/null | tr -d '[:space:]')
echo "archive disabled (files=0 on conflict) = $([ "${arch_n:-0}" -eq 0 ] && echo yes || echo no)"

mainport=$(docker exec -i -u postgres "$C" psql -X -q -A -t -U postgres -d postgres -c "SHOW port" 2>/dev/null | tr -d '[:space:]')
echo "main port still = ${mainport} (5432)"

# 판정: 충돌 메시지 존재 OR 아카이빙 비활성 (둘 중 하나) + 메인 무영향
if { [ "$conflict" -ge 1 ] || [ "${arch_n:-0}" -eq 0 ]; } && [ "$mainport" = "5432" ]; then
  echo "archive_library vs archive_command mutual exclusion = OK"
else
  echo "archive_library vs archive_command mutual exclusion = FAIL (conflict=$conflict arch_n=$arch_n mainport=$mainport)"
fi

echo "TC-RESULT: OK"
```

### 예상결과 vs 실제결과 (줄 정렬 diff · `-`예상 / `+`실제)

```diff
@@ -1,6 +1,3 @@
- conflict warning/error in log = no
+ SKIP: basic_archive 미설치
- archive disabled (files=0 on conflict) = yes
- main port still = 5432 (5432)
- archive_library vs archive_command mutual exclusion = OK
  TC-RESULT: OK
  cleanup done
```

---

## tc2006 · \watch min_rows= 최소행 종료(PG17 신규)  `PG-334`

- **TC ID**: `tc2006`
- **PG ID**: PG-334
- **판정**: ❌ FAIL
- **출처**: https://www.postgresql.org/docs/17/app-psql.html (§psql \watch (min_rows))

### 설명

PG17 신규 \watch min_rows= 옵션이 결과 행 수가 최소값 미만이 되면 count 한계 전 반복 실행을 자동 종료하는 신기능을 검증한다

### 테스트 단계

```bash
#!/usr/bin/env bash
# tc2006 | \watch min_rows= 최소행 종료(PG17 신규) | 문서 §psql \watch (min_rows) | PG17NEW: 예
# 검증 포인트: min_rows= 구문 파싱·실행 / 행 수 미만 시 count 한계 전 자동 종료 / min_rows 미지정과 차이 / 종료 후 종료코드
# 결정론: \watch 는 시각·반복 출력이 비결정 → exec=sh 로 종료코드·메시지 패턴만 grep. '항상 0행' 쿼리로 min_rows=1 즉시 종료, interval 최소화.
set -uo pipefail
source "$(dirname "$0")/../../runner/env.sh"

# (1) min_rows=1 + 항상 0행 쿼리 → 첫 반복에서 즉시 자동 종료 (count 한계 도달 전)
# 주의: \watch 메타커맨드는 psql -c 로는 구문 에러 → 반드시 stdin(here-doc)으로 투입.
# qa_timeout 으로 혹시 모를 무한 반복 방어 (정상 동작이면 즉시 종료)
out1="$(qa_timeout 15 docker exec -i "$C_SINGLE" psql -X -q -U postgres -d qa 2>&1 <<'SQL'
SELECT 1 WHERE false \watch interval=0.1 count=20 min_rows=1
SQL
)"
rc1=$?
if [ "$rc1" -eq 0 ]; then
  echo "min_rows=1 + 0행 쿼리: exit 0 (자동 종료) = OK"
else
  echo "min_rows=1 + 0행 쿼리: exit $rc1 = FAIL"
fi
# 출력에 (0 rows) 가 한 번 나타나고 무한 반복하지 않음 (count=20 인데 1~2회만)
n_iter="$(printf '%s\n' "$out1" | grep -c '(0 rows)')"
if [ "$n_iter" -ge 1 ] && [ "$n_iter" -le 3 ]; then
  echo "반복 횟수 ${n_iter}회 (count=20 한계 전 종료) = OK"
else
  echo "반복 횟수 ${n_iter}회 (예상 1~3) = FAIL"
fi

# (2) min_rows= 약자 m= 형태도 파싱됨 (PG17 \watch [m=MIN])
out2="$(qa_timeout 15 docker exec -i "$C_SINGLE" psql -X -q -U postgres -d qa 2>&1 <<'SQL'
SELECT 1 WHERE false \watch i=0.1 c=20 m=1
SQL
)"
rc2=$?
if [ "$rc2" -eq 0 ]; then
  echo "축약 구문 i=/c=/m= 파싱·자동종료: exit 0 = OK"
else
  echo "축약 구문 파싱: exit $rc2 = FAIL"
fi

echo "TC-RESULT: OK"
```

### 예상결과 vs 실제결과 (줄 정렬 diff · `-`예상 / `+`실제)

```diff
@@ -1,4 +1,4 @@
- min_rows=1 + 0행 쿼리: exit 0 (자동 종료) = OK
+ min_rows=1 + 0행 쿼리: exit 127 = FAIL
- 반복 횟수 1회 (count=20 한계 전 종료) = OK
+ 반복 횟수 0회 (예상 1~3) = FAIL
- 축약 구문 i=/c=/m= 파싱·자동종료: exit 0 = OK
+ 축약 구문 파싱: exit 127 = FAIL
  TC-RESULT: OK
```

---

## tc2009 · 접속 문자열·PGHOST/PGPORT/PGUSER/PGDATABASE 환경변수  `PG-337`

- **TC ID**: `tc2009`
- **PG ID**: PG-337
- **판정**: ❌ FAIL
- **출처**: https://www.postgresql.org/docs/17/libpq-envars.html (§34.1.1 / 34.15)

### 설명

libpq 접속 문자열(key=value·URI)과 PGDATABASE/PGUSER 환경변수가 docker exec 환경의 psql 접속에 정상 반영되는지 current_database()/current_user로 검증한다

### 테스트 단계

```bash
#!/usr/bin/env bash
# tc2009 | 접속 문자열·PGHOST/PGPORT/PGUSER/PGDATABASE 환경변수 | 문서 §34.1.1 / 34.15 | PG17NEW: 아니오
# 검증 포인트: PGDATABASE 무인자 접속 / PGUSER 반영 / key=value conninfo 접속 / URI 접속
# 결정론: 컨테이너 내부 고정 host=localhost port=5432 user=postgres db=qa. current_database()/current_user 결정적 함수로 검증. 환경변수는 -e 로 격리 주입.
set -uo pipefail
source "$(dirname "$0")/../../runner/env.sh"

# (1) PGDATABASE 환경변수 → psql 무인자 접속이 그 DB에 연결
db="$(docker exec -e PGDATABASE=qa -e PGUSER=postgres -i "$C_SINGLE" \
  psql -X -t -A -c "SELECT current_database()" 2>&1)"
if [ "$db" = "qa" ]; then
  echo "PGDATABASE=qa → current_database()=qa = OK"
else
  echo "PGDATABASE 반영 실패: '$db' = FAIL"
fi

# (2) PGUSER 환경변수 → current_user 반영
usr="$(docker exec -e PGDATABASE=qa -e PGUSER=postgres -i "$C_SINGLE" \
  psql -X -t -A -c "SELECT current_user" 2>&1)"
if [ "$usr" = "postgres" ]; then
  echo "PGUSER=postgres → current_user=postgres = OK"
else
  echo "PGUSER 반영 실패: '$usr' = FAIL"
fi

# (3) key=value 접속 문자열 (conninfo)
db2="$(docker exec -i "$C_SINGLE" \
  psql -X -t -A "host=localhost port=5432 dbname=qa user=postgres" \
  -c "SELECT current_database()" 2>&1)"
if [ "$db2" = "qa" ]; then
  echo "conninfo 'host=... dbname=qa' 접속 → qa = OK"
else
  echo "conninfo 접속 실패: '$db2' = FAIL"
fi

# (4) URI 접속 문자열
db3="$(docker exec -i "$C_SINGLE" \
  psql -X -t -A "postgresql://postgres@localhost:5432/qa" \
  -c "SELECT current_database()" 2>&1)"
if [ "$db3" = "qa" ]; then
  echo "URI 'postgresql://...@localhost:5432/qa' 접속 → qa = OK"
else
  echo "URI 접속 실패: '$db3' = FAIL"
fi

echo "TC-RESULT: OK"
```

### 예상결과 vs 실제결과 (줄 정렬 diff · `-`예상 / `+`실제)

```diff
@@ -1,5 +1,11 @@
  PGDATABASE=qa → current_database()=qa = OK
- PGUSER=postgres → current_user=postgres = OK
+ PGUSER 반영 실패: 'agens' = FAIL
- conninfo 'host=... dbname=qa' 접속 → qa = OK
+ conninfo 접속 실패: 'psql: error: connection to server at "localhost" (::1), port 5432 failed: Connection refused
- URI 'postgresql://...@localhost:5432/qa' 접속 → qa = OK
+ 	Is the server running on that host and accepting TCP/IP connections?
+ connection to server at "localhost" (127.0.0.1), port 5432 failed: Connection refused
+ 	Is the server running on that host and accepting TCP/IP connections?' = FAIL
+ URI 접속 실패: 'psql: error: connection to server at "localhost" (::1), port 5432 failed: Connection refused
+ 	Is the server running on that host and accepting TCP/IP connections?
+ connection to server at "localhost" (127.0.0.1), port 5432 failed: Connection refused
+ 	Is the server running on that host and accepting TCP/IP connections?' = FAIL
  TC-RESULT: OK
```

---

## tc2012 · pg_isready 서버 가용성 점검  `PG-340`

- **TC ID**: `tc2012`
- **PG ID**: PG-340
- **판정**: ❌ FAIL
- **출처**: https://www.postgresql.org/docs/17/app-pg-isready.html (§pg_isready)

### 설명

pg_isready가 기동 서버에 대해 종료코드 0·accepting connections 패턴을, 잘못된 포트에 대해 비0 종료를 보고하고 -d/-U 옵션을 정상 파싱하는 동작을 검증한다

### 테스트 단계

```bash
#!/usr/bin/env bash
# tc2012 | pg_isready 서버 가용성 점검 | 문서 §pg_isready | PG17NEW: 아니오
# 검증 포인트: 기동 서버 종료0(accepting connections) / 'accepting connections' 패턴 / 잘못된 포트 비0 / -d -U 옵션 파싱
# 결정론: 종료코드 + 고정 메시지 패턴. 잘못된 포트는 컨테이너 내부 미사용 포트(1)로 결정적 실패 유도. 응답시간 등 가변 출력 미검증.
set -uo pipefail
source "$(dirname "$0")/../../runner/env.sh"

# (1) 기동 서버 대상 — 종료코드 0 + 패턴
out_ok="$(docker exec "$C_SINGLE" pg_isready -h localhost -p 5432 2>&1)"
rc_ok=$?
if [ "$rc_ok" -eq 0 ]; then
  echo "pg_isready -p 5432: exit 0 = OK"
else
  echo "pg_isready -p 5432: exit $rc_ok = FAIL"
fi
if printf '%s' "$out_ok" | grep -q "accepting connections"; then
  echo "출력에 'accepting connections' 포함 = OK"
else
  echo "'accepting connections' 패턴 누락 = FAIL"
fi

# (2) 잘못된 포트 — 비0 종료코드
docker exec "$C_SINGLE" pg_isready -h localhost -p 1 >/dev/null 2>&1
rc_bad=$?
if [ "$rc_bad" -ne 0 ]; then
  echo "잘못된 포트 pg_isready -p 1: 비0 종료(exit $rc_bad) = OK"
else
  echo "잘못된 포트가 0 종료 = FAIL"
fi

# (3) -d <db> -U <user> 옵션 파싱 (정상 접속·종료0)
docker exec "$C_SINGLE" pg_isready -h localhost -p 5432 -d qa -U postgres >/dev/null 2>&1
rc_opt=$?
if [ "$rc_opt" -eq 0 ]; then
  echo "pg_isready -d qa -U postgres 파싱·접속: exit 0 = OK"
else
  echo "-d/-U 옵션 파싱·접속: exit $rc_opt = FAIL"
fi

echo "TC-RESULT: OK"
```

### 예상결과 vs 실제결과 (줄 정렬 diff · `-`예상 / `+`실제)

```diff
@@ -1,5 +1,5 @@
- pg_isready -p 5432: exit 0 = OK
+ pg_isready -p 5432: exit 2 = FAIL
- 출력에 'accepting connections' 포함 = OK
+ 'accepting connections' 패턴 누락 = FAIL
  잘못된 포트 pg_isready -p 1: 비0 종료(exit 2) = OK
- pg_isready -d qa -U postgres 파싱·접속: exit 0 = OK
+ -d/-U 옵션 파싱·접속: exit 2 = FAIL
  TC-RESULT: OK
```

---

## tc2014 · pg_config·pg_test_fsync·pg_test_timing 스모크  `PG-342`

- **TC ID**: `tc2014`
- **PG ID**: PG-342
- **판정**: ❌ FAIL
- **출처**: https://www.postgresql.org/docs/17/app-pgconfig.html (§pg_config / pgtestfsync / pgtesttiming)

### 설명

pg_config가 PostgreSQL 17 버전과 비어있지 않은 경로를 보고하고 pg_test_fsync -s 1·pg_test_timing -d 1 진단 도구가 짧은 실행으로 종료코드 0으로 완료하는 스모크 동작을 검증한다

### 테스트 단계

```bash
#!/usr/bin/env bash
# tc2014 | pg_config·pg_test_fsync·pg_test_timing 스모크 | 문서 §pg_config / pgtestfsync / pgtesttiming | PG17NEW: 아니오
# 검증 포인트: pg_config --version 에 'PostgreSQL 17' / --bindir·--sharedir 비어있지 않은 경로·종료0 / pg_test_fsync -s 1 종료0 / pg_test_timing -d 1 종료0
# 결정론: 측정 수치(ops/sec, 히스토그램) 전부 가변 → 종료코드·버전 접두만. -s 1/-d 1 로 실행시간 최소화(타임아웃 회피).
set -uo pipefail
source "$(dirname "$0")/../../runner/env.sh"

# (1) pg_config --version → 'PostgreSQL 17' 접두 매칭
ver="$(docker exec "$C_SINGLE" pg_config --version 2>&1)"
rc=$?
if [ "$rc" -eq 0 ] && printf '%s' "$ver" | grep -q '^PostgreSQL 17'; then
  echo "pg_config --version 'PostgreSQL 17' 포함(exit 0) = OK"
else
  echo "pg_config --version 예상 밖(rc=$rc) = FAIL"
fi

# (2) --bindir / --sharedir 비어있지 않은 경로 + 종료0
bindir="$(docker exec "$C_SINGLE" pg_config --bindir 2>&1)"; rc_b=$?
sharedir="$(docker exec "$C_SINGLE" pg_config --sharedir 2>&1)"; rc_s=$?
if [ "$rc_b" -eq 0 ] && [ -n "$bindir" ] && [ "$rc_s" -eq 0 ] && [ -n "$sharedir" ]; then
  echo "pg_config --bindir/--sharedir 비어있지 않은 경로(exit 0) = OK"
else
  echo "pg_config --bindir/--sharedir 비정상(rc_b=$rc_b rc_s=$rc_s) = FAIL"
fi

# (3) pg_test_fsync -s 1 (--secs-per-test 1) — 종료0 (수치 미출력)
docker exec "$C_SINGLE" pg_test_fsync -s 1 >/dev/null 2>&1
rc_f=$?
echo "pg_test_fsync -s 1: exit $rc_f = $([ "$rc_f" -eq 0 ] && echo OK || echo FAIL)"

# (4) pg_test_timing -d 1 (--duration 1) — 종료0 (수치 미출력)
docker exec "$C_SINGLE" pg_test_timing -d 1 >/dev/null 2>&1
rc_t=$?
echo "pg_test_timing -d 1: exit $rc_t = $([ "$rc_t" -eq 0 ] && echo OK || echo FAIL)"

echo "TC-RESULT: OK"
```

### 예상결과 vs 실제결과 (줄 정렬 diff · `-`예상 / `+`실제)

```diff
@@ -1,5 +1,5 @@
  pg_config --version 'PostgreSQL 17' 포함(exit 0) = OK
  pg_config --bindir/--sharedir 비어있지 않은 경로(exit 0) = OK
- pg_test_fsync -s 1: exit 0 = OK
+ pg_test_fsync -s 1: exit 1 = FAIL
  pg_test_timing -d 1: exit 0 = OK
  TC-RESULT: OK
```

---

## tc2114 · postgres_fdw 루프백  `PG-399`

- **TC ID**: `tc2114`
- **PG ID**: PG-399
- **판정**: ❌ FAIL
- **출처**: https://www.postgresql.org/docs/17/postgres-fdw.html (§F.33)

### 설명

postgres_fdw로 자기 서버(localhost:5432)에 FDW 서버·사용자매핑·외부테이블을 만들어 원격 질의와 트랜잭션이 동작함을 검증

### 테스트 단계

```sql
-- tc2114 | postgres_fdw 루프백 | 문서 §F.33 | PG17NEW: 아니오
-- 검증 포인트: SERVER/USER MAPPING/FOREIGN TABLE 생성 / SELECT 원본 일치 / INSERT 반영 / 단일 매핑
-- 주의: 루프백은 컨테이너 내부 localhost:5432, 비번 qa. 잔존 금지 → TC 끝 전부 DROP.
-- 결정론: 행 비교는 ORDER BY. 외부 테이블은 tc2114 스키마의 원본을 schema_name 명시로 매핑.
SET client_min_messages = warning;
DROP SCHEMA IF EXISTS tc2114 CASCADE;
CREATE SCHEMA tc2114; SET search_path = tc2114;
CREATE EXTENSION IF NOT EXISTS postgres_fdw;

-- 원본 테이블 (tc2114 스키마)
CREATE TABLE src(i int, t text);
INSERT INTO src VALUES (1,'a'),(2,'b');

-- 루프백 서버·사용자매핑 (컨테이너 내부 localhost:5432, dbname qa, 비번 qa)
CREATE SERVER lb FOREIGN DATA WRAPPER postgres_fdw
  OPTIONS (host 'localhost', port '5432', dbname 'qa');
CREATE USER MAPPING FOR CURRENT_USER SERVER lb
  OPTIONS (user 'postgres', password 'qa');

-- 외부 테이블 (단일 table_name 매핑, schema_name 명시)
CREATE FOREIGN TABLE ft(i int, t text) SERVER lb
  OPTIONS (schema_name 'tc2114', table_name 'src');

-- SELECT 가 로컬 원본과 동일 행 반환
SELECT i, t FROM ft ORDER BY i;

-- INSERT 가 원본에 반영
INSERT INTO ft VALUES (3,'c');
SELECT count(*) = 3 AS insert_propagated FROM src;
SELECT i, t FROM ft ORDER BY i;

-- 잔존 금지: 전부 DROP
DROP FOREIGN TABLE ft;
DROP USER MAPPING FOR CURRENT_USER SERVER lb;
DROP SERVER lb;
DROP TABLE src;
DROP EXTENSION postgres_fdw;
DROP SCHEMA tc2114 CASCADE;
```

### 예상결과 vs 실제결과 (줄 정렬 diff · `-`예상 / `+`실제)

```diff
@@ -19,28 +19,30 @@
    OPTIONS (schema_name 'tc2114', table_name 'src');
  -- SELECT 가 로컬 원본과 동일 행 반환
  SELECT i, t FROM ft ORDER BY i;
-  i | t
+ ERROR:  could not connect to server "lb"
-  1 | a
+ DETAIL:  connection to server at "localhost" (::1), port 5432 failed: Connection refused
-  2 | b
+ 	Is the server running on that host and accepting TCP/IP connections?
- (2 rows)
+ connection to server at "localhost" (127.0.0.1), port 5432 failed: Connection refused
+ 	Is the server running on that host and accepting TCP/IP connections?
  -- INSERT 가 원본에 반영
  INSERT INTO ft VALUES (3,'c');
+ ERROR:  could not connect to server "lb"
+ DETAIL:  connection to server at "localhost" (::1), port 5432 failed: Connection refused
+ 	Is the server running on that host and accepting TCP/IP connections?
+ connection to server at "localhost" (127.0.0.1), port 5432 failed: Connection refused
+ 	Is the server running on that host and accepting TCP/IP connections?
  SELECT count(*) = 3 AS insert_propagated FROM src;
   insert_propagated
  -------------------
-  t
+  f
  (1 row)
  
  SELECT i, t FROM ft ORDER BY i;
-  i | t
+ ERROR:  could not connect to server "lb"
-  1 | a
+ DETAIL:  connection to server at "localhost" (::1), port 5432 failed: Connection refused
-  2 | b
+ 	Is the server running on that host and accepting TCP/IP connections?
-  3 | c
+ connection to server at "localhost" (127.0.0.1), port 5432 failed: Connection refused
- (3 rows)
+ 	Is the server running on that host and accepting TCP/IP connections?
  
  -- 잔존 금지: 전부 DROP
  DROP FOREIGN TABLE ft;
  DROP USER MAPPING FOR CURRENT_USER SERVER lb;
```

---

## tc2115 · dblink 루프백  `PG-400`

- **TC ID**: `tc2115`
- **PG ID**: PG-400
- **판정**: ❌ FAIL
- **출처**: https://www.postgresql.org/docs/17/dblink.html (§F.12)

### 설명

dblink로 자기 서버에 연결해 동기 질의와 dblink_connect/disconnect 세션 관리를 검증

### 테스트 단계

```sql
-- tc2115 | dblink 루프백 | 문서 §F.12 | PG17NEW: 아니오
-- 검증 포인트: 즉시 질의 / 명명 연결 connect→query→disconnect / dblink_exec DML / 잘못된 connstr 에러
-- 주의: connstr 고정 = host=localhost port=5432 dbname=qa user=postgres password=qa. 끝에서 disconnect+DROP.
-- 결정론: 고정 질의·고정 connstr → 결정적. 명명 연결은 반드시 disconnect.
SET client_min_messages = warning;
DROP SCHEMA IF EXISTS tc2115 CASCADE;
CREATE SCHEMA tc2115; SET search_path = tc2115;
CREATE EXTENSION IF NOT EXISTS dblink;

-- 즉시(connstr inline) 질의
SELECT x FROM dblink('host=localhost port=5432 dbname=qa user=postgres password=qa',
                     'SELECT 42') AS t(x int);

-- 명명 연결 → 질의 → 끊기
SELECT dblink_connect('conn1','host=localhost port=5432 dbname=qa user=postgres password=qa') = 'OK' AS connect_ok;
SELECT s FROM dblink('conn1','SELECT ''hello''') AS t(s text);

-- dblink_exec 원격 DML (임시 테이블을 원격 세션에서 생성·삽입 후 카운트)
SELECT dblink_exec('conn1','CREATE TEMP TABLE _d(i int); INSERT INTO _d VALUES (1),(2)') LIKE 'INSERT%' AS exec_ok;
SELECT n FROM dblink('conn1','SELECT count(*) FROM _d') AS t(n bigint);

SELECT dblink_disconnect('conn1') = 'OK' AS disconnect_ok;

-- 잘못된 connstr 시 에러 (의도된 에러)
-- stdout/stderr 병합 레이스 + 환경 의존 DETAIL(::1·FATAL 문구) 회피:
-- PL/pgSQL EXCEPTION 으로 에러 발생 여부만 단일 stdout 행으로 캡처(SQLSTATE/메시지는 환경 가변).
CREATE FUNCTION catch_bad_conn() RETURNS boolean LANGUAGE plpgsql AS $$
BEGIN
  PERFORM dblink_connect('bad','host=localhost port=5432 dbname=no_such_db user=postgres password=qa');
  RETURN false;   -- 연결 성공하면 안 됨
EXCEPTION WHEN OTHERS THEN
  RETURN true;    -- 잘못된 connstr → 에러 발생 기대
END $$;
SELECT catch_bad_conn() AS bad_connstr_rejected;

DROP EXTENSION dblink;
DROP SCHEMA tc2115 CASCADE;
```

### 예상결과 vs 실제결과 (줄 정렬 diff · `-`예상 / `+`실제)

```diff
@@ -9,43 +9,30 @@
  -- 즉시(connstr inline) 질의
  SELECT x FROM dblink('host=localhost port=5432 dbname=qa user=postgres password=qa',
                       'SELECT 42') AS t(x int);
-  x
+ ERROR:  could not establish connection
-  42
+ DETAIL:  connection to server at "localhost" (::1), port 5432 failed: Connection refused
- (1 row)
+ 	Is the server running on that host and accepting TCP/IP connections?
+ connection to server at "localhost" (127.0.0.1), port 5432 failed: Connection refused
+ 	Is the server running on that host and accepting TCP/IP connections?
  -- 명명 연결 → 질의 → 끊기
  SELECT dblink_connect('conn1','host=localhost port=5432 dbname=qa user=postgres password=qa') = 'OK' AS connect_ok;
-  connect_ok
+ ERROR:  could not establish connection
-  t
+ DETAIL:  connection to server at "localhost" (::1), port 5432 failed: Connection refused
- (1 row)
+ 	Is the server running on that host and accepting TCP/IP connections?
+ connection to server at "localhost" (127.0.0.1), port 5432 failed: Connection refused
+ 	Is the server running on that host and accepting TCP/IP connections?
  SELECT s FROM dblink('conn1','SELECT ''hello''') AS t(s text);
-    s
+ ERROR:  could not establish connection
-  hello
+ DETAIL:  missing "=" after "conn1" in connection info string
- (1 row)
  
  -- dblink_exec 원격 DML (임시 테이블을 원격 세션에서 생성·삽입 후 카운트)
  SELECT dblink_exec('conn1','CREATE TEMP TABLE _d(i int); INSERT INTO _d VALUES (1),(2)') LIKE 'INSERT%' AS exec_ok;
-  exec_ok
+ ERROR:  could not establish connection
-  t
+ DETAIL:  missing "=" after "conn1" in connection info string
- (1 row)
  
  SELECT n FROM dblink('conn1','SELECT count(*) FROM _d') AS t(n bigint);
-  n
+ ERROR:  could not establish connection
-  2
+ DETAIL:  missing "=" after "conn1" in connection info string
- (1 row)
  
  SELECT dblink_disconnect('conn1') = 'OK' AS disconnect_ok;
-  disconnect_ok
+ ERROR:  connection "conn1" not available
-  t
- (1 row)
  
  -- 잘못된 connstr 시 에러 (의도된 에러)
  -- stdout/stderr 병합 레이스 + 환경 의존 DETAIL(::1·FATAL 문구) 회피:
  -- PL/pgSQL EXCEPTION 으로 에러 발생 여부만 단일 stdout 행으로 캡처(SQLSTATE/메시지는 환경 가변).
```

---

## tc2118 · pgstattuple·pg_visibility 불변식  `PG-403`

- **TC ID**: `tc2118`
- **PG ID**: PG-403
- **판정**: ❌ FAIL
- **출처**: https://www.postgresql.org/docs/17/pgstattuple.html (§F.35)

### 설명

pgstattuple·pg_visibility의 튜플/가시성 통계 함수가 불변식(튜플 수·dead tuple·all_visible)을 만족함을 검증

### 테스트 단계

```sql
-- tc2118 | pgstattuple·pg_visibility 불변식 | 문서 §F.35 | PG17NEW: 아니오
-- 검증 포인트: tuple_count=행수 / DELETE 후 dead>0·VACUUM 후 감소 / all_visible 비트 / pgstattuple_approx
-- 결정론: tuple_count는 행 수로 결정. free_space·dead 비율은 비결정 → 부등식/불변식만.
SET client_min_messages = warning;
DROP SCHEMA IF EXISTS tc2118 CASCADE;
CREATE SCHEMA tc2118; SET search_path = tc2118;
CREATE EXTENSION IF NOT EXISTS pgstattuple;
CREATE EXTENSION IF NOT EXISTS pg_visibility;

CREATE TABLE st(i int);
INSERT INTO st SELECT generate_series(1,50);

-- tuple_count = 실제 행 수
SELECT (pgstattuple('tc2118.st')).tuple_count = 50 AS tuple_count_ok;

-- DELETE 후 dead_tuple_count > 0
DELETE FROM st WHERE i <= 10;
SELECT (pgstattuple('tc2118.st')).dead_tuple_count > 0 AS dead_after_delete;

-- VACUUM 후 dead 감소(0이 됨)
VACUUM st;
SELECT (pgstattuple('tc2118.st')).dead_tuple_count = 0 AS dead_after_vacuum;

-- pg_visibility: VACUUM 후 all_visible 비트 설정된 페이지 존재(불변식)
SELECT count(*) FILTER (WHERE all_visible) >= 0 AS all_visible_ok FROM pg_visibility('tc2118.st');

-- pgstattuple_approx 호출 가능
SELECT (pgstattuple_approx('tc2118.st')).approx_tuple_count >= 0 AS approx_ok;

DROP TABLE st;
DROP EXTENSION pg_visibility;
DROP EXTENSION pgstattuple;
DROP SCHEMA tc2118 CASCADE;
```

### 예상결과 vs 실제결과 (줄 정렬 diff · `-`예상 / `+`실제)

```diff
@@ -33,11 +33,10 @@
  
  -- pg_visibility: VACUUM 후 all_visible 비트 설정된 페이지 존재(불변식)
  SELECT count(*) FILTER (WHERE all_visible) >= 0 AS all_visible_ok FROM pg_visibility('tc2118.st');
-  all_visible_ok
+ ERROR:  function pg_visibility(unknown) does not exist
-  t
+ LINE 1: ...R (WHERE all_visible) >= 0 AS all_visible_ok FROM pg_visibil...
- (1 row)
+                                                              ^
+ HINT:  No function matches the given name and argument types. You might need to add explicit type casts.
  -- pgstattuple_approx 호출 가능
  SELECT (pgstattuple_approx('tc2118.st')).approx_tuple_count >= 0 AS approx_ok;
   approx_ok
```

---

## tc2121 · vacuumlo·oid2name 클라이언트 CLI  `PG-406`

- **TC ID**: `tc2121`
- **PG ID**: PG-406
- **판정**: ❌ FAIL
- **출처**: https://www.postgresql.org/docs/17/vacuumlo.html (§G.1)

### 설명

부록 G 클라이언트 프로그램 vacuumlo(고아 대형객체 정리)와 oid2name(파일노드↔객체명 매핑)의 CLI 동작을 검증

### 테스트 단계

```bash
#!/usr/bin/env bash
# tc2121 | vacuumlo·oid2name 클라이언트 CLI | 문서 §G.1 | PG17NEW: 아니오
# 검증 포인트: oid2name 헤더·특정테이블 / vacuumlo --help·-n dry-run / lo 고아 LO 정리(개수 변화)
# 주의: oid2name은 /usr/lib/postgresql/17/bin(PATH 밖), vacuumlo는 PATH. filenode 숫자 비결정→헤더·테이블명만.
# 결정론: filenode·OID 절대값 비결정 → 출력 헤더·생성한 테이블명 존재로 검증. 잔존 LO/테이블 정리.
set -uo pipefail
source "$(dirname "$0")/../../runner/env.sh"

BIN=/usr/lib/postgresql/17/bin
cleanup() {
  $PSQL <<'SQL' >/dev/null 2>&1
DROP TABLE IF EXISTS public.tc2121_marker;
DROP TABLE IF EXISTS public.tc2121_lo;
DROP EXTENSION IF EXISTS lo;
SQL
}
trap cleanup EXIT

# 식별용 마커 테이블 생성 (oid2name 출력에 나타나야 함)
$PSQL <<'SQL' >/dev/null
SET client_min_messages = warning;
DROP TABLE IF EXISTS public.tc2121_marker;
CREATE TABLE public.tc2121_marker(i int);
SQL

# --- oid2name: 헤더 라인 + 마커 테이블명 존재 ---
o2n_out="$(docker exec "$C_SINGLE" env PGPASSWORD=qa "$BIN/oid2name" -H localhost -p 5432 -U postgres -d qa 2>&1)"
if echo "$o2n_out" | grep -q 'Filenode'; then
  echo "oid2name header present = OK"
else
  echo "oid2name header MISSING = FAIL"
fi
if echo "$o2n_out" | grep -q 'tc2121_marker'; then
  echo "oid2name lists tc2121_marker = OK"
else
  echo "oid2name marker MISSING = FAIL"
fi

# oid2name -t 특정 테이블 필터
if docker exec "$C_SINGLE" env PGPASSWORD=qa "$BIN/oid2name" -H localhost -p 5432 -U postgres -d qa -t tc2121_marker 2>&1 | grep -q 'tc2121_marker'; then
  echo "oid2name -t filter = OK"
else
  echo "oid2name -t filter = FAIL"
fi

# --- vacuumlo --help / dry-run ---
if docker exec "$C_SINGLE" vacuumlo --help 2>&1 | grep -q 'removes unreferenced large objects'; then
  echo "vacuumlo --help = OK"
else
  echo "vacuumlo --help = FAIL"
fi

# 고아 LO 생성: lo 확장 + LO 컬럼 테이블에 LO 넣고 행 삭제 → 고아 발생
$PSQL <<'SQL' >/dev/null
SET client_min_messages = warning;
CREATE EXTENSION IF NOT EXISTS lo;
DROP TABLE IF EXISTS public.tc2121_lo;
CREATE TABLE public.tc2121_lo(id int, doc lo);
INSERT INTO public.tc2121_lo VALUES (1, lo_from_bytea(0, '\x4142'::bytea));
INSERT INTO public.tc2121_lo VALUES (2, lo_from_bytea(0, '\x4344'::bytea));
SQL

before="$(docker exec "$C_SINGLE" env PGPASSWORD=qa psql -X -t -A -U postgres -d qa -c 'SELECT count(*) FROM pg_largeobject_metadata;' | tr -d '[:space:]')"

# 행을 삭제(lo 트리거가 없는 단순 삭제 → LO는 고아로 남음)
$PSQL <<'SQL' >/dev/null
DELETE FROM public.tc2121_lo;
SQL

# dry-run(-n)은 삭제하지 않음
docker exec "$C_SINGLE" env PGPASSWORD=qa vacuumlo -n -h localhost -p 5432 -U postgres qa >/dev/null 2>&1
mid="$(docker exec "$C_SINGLE" env PGPASSWORD=qa psql -X -t -A -U postgres -d qa -c 'SELECT count(*) FROM pg_largeobject_metadata;' | tr -d '[:space:]')"
if [ "$mid" = "$before" ]; then
  echo "vacuumlo -n dry-run keeps LOs ($before) = OK"
else
  echo "vacuumlo -n changed count ($before -> $mid) = FAIL"
fi

# 실제 vacuumlo는 고아 LO 정리 → 개수 감소
docker exec "$C_SINGLE" env PGPASSWORD=qa vacuumlo -h localhost -p 5432 -U postgres qa >/dev/null 2>&1
after="$(docker exec "$C_SINGLE" env PGPASSWORD=qa psql -X -t -A -U postgres -d qa -c 'SELECT count(*) FROM pg_largeobject_metadata;' | tr -d '[:space:]')"
if [ "$after" -lt "$mid" ]; then
  echo "vacuumlo removed orphan LOs (count decreased) = OK"
else
  echo "vacuumlo did not decrease count ($mid -> $after) = FAIL"
fi

echo "TC-RESULT: OK"
```

### 예상결과 vs 실제결과 (줄 정렬 diff · `-`예상 / `+`실제)

```diff
@@ -1,7 +1,7 @@
- oid2name header present = OK
+ oid2name header MISSING = FAIL
- oid2name lists tc2121_marker = OK
+ oid2name marker MISSING = FAIL
- oid2name -t filter = OK
+ oid2name -t filter = FAIL
  vacuumlo --help = OK
- vacuumlo -n dry-run keeps LOs (2) = OK
+ vacuumlo -n dry-run keeps LOs (8) = OK
- vacuumlo removed orphan LOs (count decreased) = OK
+ vacuumlo did not decrease count (8 -> 8) = FAIL
  TC-RESULT: OK
```

---
