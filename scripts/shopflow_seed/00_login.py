#!/usr/bin/env python3
"""ShopFlow seed - Step 0: 로그인 (토큰 발급/저장).

환경변수:
  SHOPFLOW_BASE_URL  (default http://localhost:8080)
  SHOPFLOW_USER      (default admin)
  SHOPFLOW_PASS      (default admin123)
"""

from _lib import login, BASE_URL, USERNAME, TOKEN_FILE

token = login()
print(f"Logged in {USERNAME} @ {BASE_URL}")
print(f"  token: {token[:30]}...")
print(f"  saved: {TOKEN_FILE}")
