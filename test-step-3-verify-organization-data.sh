#!/bin/bash

# Test Step 3: 조직 및 멤버십 데이터 검증
echo "🏢 Step 3: 조직 및 멤버십 데이터 검증"
echo "===================================="

# 로그인 및 토큰 발급
TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' \
  -s | jq -r '.accessToken')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
    echo "❌ 로그인 실패 - Step 2를 먼저 확인하세요"
    exit 1
fi

echo "🏢 조직 목록 조회:"
ORGS_RESPONSE=$(curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/organizations -s)

ORG_COUNT=$(echo "$ORGS_RESPONSE" | jq '. | length' 2>/dev/null || echo "0")

if [ "$ORG_COUNT" -gt 0 ]; then
    echo "✅ 총 $ORG_COUNT개의 조직이 있습니다:"
    echo "$ORGS_RESPONSE" | jq -r '.[] | "  - \(.name): \(.description)"'
else
    echo "❌ 조직 데이터를 찾을 수 없습니다."
    echo "응답 내용: $ORGS_RESPONSE"
    exit 1
fi

echo ""
echo "🔍 예상 조직 확인:"
EXPECTED_ORGS=("QA팀" "개발팀" "데브옵스팀")
for org in "${EXPECTED_ORGS[@]}"; do
    if echo "$ORGS_RESPONSE" | jq -r '.[].name' | grep -q "^$org$"; then
        echo "✅ $org 조직 존재"
        
        # 조직 ID 추출
        ORG_ID=$(echo "$ORGS_RESPONSE" | jq -r ".[] | select(.name==\"$org\") | .id")
        
        # 조직 멤버 확인
        MEMBERS_RESPONSE=$(curl -H "Authorization: Bearer $TOKEN" \
          "http://localhost:8080/api/organizations/$ORG_ID/users" -s)
        
        MEMBER_COUNT=$(echo "$MEMBERS_RESPONSE" | jq '. | length' 2>/dev/null || echo "0")
        echo "   - 멤버 수: $MEMBER_COUNT명"
        
        if [ "$MEMBER_COUNT" -gt 0 ]; then
            echo "$MEMBERS_RESPONSE" | jq -r '.[] | "     → \(.user.username): \(.roleInOrganization)"' 2>/dev/null || \
            echo "$MEMBERS_RESPONSE" | jq -r '.[] | "     → \(.username): \(.role)"' 2>/dev/null || \
            echo "     → 멤버 정보 구조 확인 필요"
        fi
    else
        echo "❌ $org 조직 누락"
    fi
done

echo ""
echo "👥 관리자 멤버십 확인:"
MY_ORGS_RESPONSE=$(curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/users/me/organizations -s)

MY_ORG_COUNT=$(echo "$MY_ORGS_RESPONSE" | jq '. | length' 2>/dev/null || echo "0")

if [ "$MY_ORG_COUNT" -gt 0 ]; then
    echo "✅ 관리자가 $MY_ORG_COUNT개 조직의 멤버입니다:"
    echo "$MY_ORGS_RESPONSE" | jq -r '.[] | "  - \(.organization.name): \(.roleInOrganization)"' 2>/dev/null || \
    echo "$MY_ORGS_RESPONSE" | jq -r '.[] | "  - \(.name): \(.role)"' 2>/dev/null
else
    echo "❌ 관리자 조직 멤버십을 찾을 수 없습니다."
    echo "응답 내용: $MY_ORGS_RESPONSE"
fi

echo ""
echo "Step 3 검증 완료!"
echo "다음 단계: ./test-step-4-verify-project-data.sh"