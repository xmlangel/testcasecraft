#!/usr/bin/env python3
"""ShopFlow seed - Step 7: 검증 보고 (i18n)."""

from _lib import get, load_state, LOCALE
from i18n import ROLE_COVERAGE_USERS, USER_PROJECT_ROLES, USERS

pid = load_state("project")["projectId"]
folders = load_state("folders") or {}
cases = load_state("cases") or {}
plans = load_state("plans") or {}
executions = load_state("executions") or {}
results = load_state("results") or []
junit = load_state("junit_uploads") or {}

print(f"┌─ ShopFlow [{LOCALE}] 샘플셋 검증 ────────────────────────")
print(f"│  projectId  : {pid}")
print(f"│  folders    : {len(folders)}  (target ≥10)")
print(f"│  cases      : {len(cases)}    (target ≥100)")
print(f"│  plans      : {len(plans)}    (target ≥10)")
print(f"│  executions : {len(executions)}  (target ≥10)")
print(f"│  results    : {len(results)}    (target ≥100)")
auto = [r for r in results if r.get("isAutomated")]
print(f"│  auto PASS  : {sum(1 for r in auto if r['result'] == 'PASS')}  (≥30)")
print(f"│  auto FAIL  : {sum(1 for r in auto if r['result'] == 'FAIL')}  (≥10)")
print(f"│  junit      : {len(junit)}  (≥3)")
user_counts = {u: sum(1 for r in results if r.get("executedBy") == u) for u in USERS}
distinct = sum(1 for u, c in user_counts.items() if c > 0)
print(f"│  executedBy : {distinct} distinct users  (≥3)")
for u in USERS:
    print(f"│    · {u}: {user_counts[u]}")
print("└────────────────────────────────────────────────────────────")

# 역할별 권한 확인 계정이 제 역할로 붙어 있는지. 여기서 어긋나면 로컬에서 역할을
# 확인할 수 없고, 그러면 "조회 전용인데 버튼이 보인다" 같은 결함을 다시 놓친다.
status, members = get(f"/api/projects/{pid}/members?limit=200")
actual = {}
if status == 200:
    items = members if isinstance(members, list) else (members.get("content") or [])
    for m in items:
        username = (m.get("user") or {}).get("username")
        if username:
            actual[username] = m.get("roleInProject")

print("역할 계정 점검 (프로젝트 역할)")
mismatch = []
for u in USERS + ROLE_COVERAGE_USERS:
    want = USER_PROJECT_ROLES[u]
    got = actual.get(u)
    mark = "OK" if got == want else "어긋남"
    if got != want:
        mismatch.append(f"{u}: 기대 {want} / 실제 {got}")
    print(f"  · {u:<10} {want:<16} {mark}")
if mismatch:
    print("  ! 다음이 어긋난다 — 02b_members.py 를 다시 돌린다")
    for line in mismatch:
        print(f"    - {line}")
else:
    covered = sorted({USER_PROJECT_ROLES[u] for u in USERS + ROLE_COVERAGE_USERS})
    print(f"  프로젝트 역할 {len(covered)}종을 계정으로 덮는다: {', '.join(covered)}")

# 상태 분포
status, items = get(f"/api/test-executions/by-project/{pid}")
items = (
    items
    if isinstance(items, list)
    else items.get("content", []) if isinstance(items, dict) else []
)
ns = sum(1 for i in items if isinstance(i, dict) and i.get("status") == "NOTSTARTED")
ip = sum(1 for i in items if isinstance(i, dict) and i.get("status") == "INPROGRESS")
cp = sum(1 for i in items if isinstance(i, dict) and i.get("status") == "COMPLETED")
print(f"  실행 상태 분포: COMPLETED={cp}  INPROGRESS={ip}  NOTSTARTED={ns}")
print(
    f"\n✓ [{LOCALE}] ShopFlow 샘플셋 준비 완료. 브라우저에서 프로젝트를 열어 확인하세요."
)
