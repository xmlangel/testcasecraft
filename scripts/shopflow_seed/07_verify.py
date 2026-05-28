#!/usr/bin/env python3
"""ShopFlow seed - Step 7: 검증 보고 (i18n)."""

from _lib import get, load_state, LOCALE
from i18n import USERS

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
