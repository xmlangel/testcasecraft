#!/usr/bin/env bash
# ShopFlow seed 통합 러너
# 사용법:
#   ./seed.sh ko      # 한국어 셋만
#   ./seed.sh en      # 영어 셋만
#   ./seed.sh both    # 한국어 + 영어 둘 다 (기본)
#   ./seed.sh --help
#
# 환경변수 (선택):
#   SHOPFLOW_BASE_URL  (default http://localhost:8080)
#   SHOPFLOW_USER      (default admin)
#   SHOPFLOW_PASS      (default admin123)

set -euo pipefail
cd "$(dirname "$0")"

LOCALES="${1:-both}"

if [[ "$LOCALES" == "--help" || "$LOCALES" == "-h" ]]; then
  sed -n '2,15p' "$0"
  exit 0
fi

run_one() {
  local loc="$1"
  echo
  echo "════════════════════════════════════════════════════════════════"
  echo "  ShopFlow seed  →  locale=$loc"
  echo "════════════════════════════════════════════════════════════════"
  export SHOPFLOW_LOCALE="$loc"
  python3 00_login.py
  python3 00b_users.py      # 시드 사용자(manager/tester/developer) 자동 등록
  python3 01_project.py
  python3 02_folders.py
  python3 02b_members.py
  python3 03_cases.py
  python3 04_plans.py
  python3 05_executions.py
  # 결과 입력 → 상태 전이 → NOTSTARTED 리셋 (이 순서가 중요)
  python3 06_results.py
  python3 05b_execution_status.py
  python3 05c_reset_notstarted.py
  python3 08_junit_imports.py
  python3 07_verify.py
}

case "$LOCALES" in
  ko)   run_one ko ;;
  en)   run_one en ;;
  both) run_one ko; run_one en ;;
  *)    echo "Unknown arg: $LOCALES  (use ko|en|both)"; exit 1 ;;
esac

echo
echo "✓ 모든 작업 완료"
