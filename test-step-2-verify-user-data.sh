#!/bin/bash

# Test Step 2: 사용자 및 인증 데이터 검증
echo "👥 Step 2: 사용자 및 인증 데이터 검증"
echo "=================================="

# 로그인 테스트 및 토큰 발급
echo "🔐 관리자 로그인 테스트:"
TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' \
  -s | jq -r '.accessToken // empty')

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo "✅ 관리자 로그인 성공 - JWT 토큰 발급됨"
    echo "   토큰 시작: ${TOKEN:0:20}..."
else
    echo "❌ 관리자 로그인 실패"
    echo "응답 내용:"
    curl -X POST http://localhost:8080/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"username":"admin","password":"admin"}' -s | jq '.'
    exit 1
fi

echo ""
echo "👤 사용자 정보 조회 (조직 멤버를 통해 확인):"
ORGS_RESPONSE=$(curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/organizations -s)

# 조직에서 사용자 정보 추출
USERS_FROM_ORGS=$(echo "$ORGS_RESPONSE" | jq -r '[.[] | .organizationUsers[] | .user] | unique_by(.username) | .[]')
USER_COUNT=$(echo "$USERS_FROM_ORGS" | jq -s '. | length' 2>/dev/null || echo "0")

if [ "$USER_COUNT" -gt 0 ]; then
    echo "✅ 조직 멤버를 통해 확인된 사용자 수: $USER_COUNT명"
    echo "$USERS_FROM_ORGS" | jq -s '.[] | "  - \(.username): \(.name) (\(.role))"'
else
    echo "❌ 조직을 통해 사용자 정보를 찾을 수 없습니다."
fi

echo ""
echo "🔍 예상 사용자 확인:"
EXPECTED_USERS=("admin" "tester" "developer")
for user in "${EXPECTED_USERS[@]}"; do
    if echo "$USERS_FROM_ORGS" | jq -s -r '.[] | .username' | grep -q "^$user$"; then
        echo "✅ $user 사용자 존재"
    else
        echo "❌ $user 사용자 누락 (현재는 조직 멤버십을 통해서만 확인 가능)"
    fi
done

echo ""
echo "Step 2 검증 완료!"
echo "다음 단계: ./test-step-3-verify-organization-data.sh"