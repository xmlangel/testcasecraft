#!/bin/bash

# Test Step 4: 프로젝트 및 테스트케이스 데이터 검증
echo "📁 Step 4: 프로젝트 및 테스트케이스 데이터 검증"
echo "========================================"

# 로그인 및 토큰 발급
TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' \
  -s | jq -r '.accessToken')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
    echo "❌ 로그인 실패 - Step 2를 먼저 확인하세요"
    exit 1
fi

echo "📁 프로젝트 목록 조회:"
PROJECTS_RESPONSE=$(curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/projects -s)

PROJECT_COUNT=$(echo "$PROJECTS_RESPONSE" | jq '. | length' 2>/dev/null || echo "0")

if [ "$PROJECT_COUNT" -gt 0 ]; then
    echo "✅ 총 $PROJECT_COUNT개의 프로젝트가 있습니다:"
    echo "$PROJECTS_RESPONSE" | jq -r '.[] | "  - \(.name) (\(.code)): \(.description)"'
else
    echo "❌ 프로젝트 데이터를 찾을 수 없습니다."
    echo "응답 내용: $PROJECTS_RESPONSE"
    exit 1
fi

echo ""
echo "🧪 각 프로젝트별 테스트케이스 확인:"
EXPECTED_PROJECTS=("테스트 관리 시스템" "QA 자동화" "API 서버 개발")
for project in "${EXPECTED_PROJECTS[@]}"; do
    if echo "$PROJECTS_RESPONSE" | jq -r '.[].name' | grep -q "^$project$"; then
        echo "✅ $project 프로젝트 존재"
        
        # 프로젝트 ID 추출
        PROJECT_ID=$(echo "$PROJECTS_RESPONSE" | jq -r ".[] | select(.name==\"$project\") | .id")
        
        # 테스트케이스 확인
        TESTCASES_RESPONSE=$(curl -H "Authorization: Bearer $TOKEN" \
          "http://localhost:8080/api/projects/$PROJECT_ID/testcases" -s)
        
        TESTCASE_COUNT=$(echo "$TESTCASES_RESPONSE" | jq '. | length' 2>/dev/null || echo "0")
        echo "   - 테스트케이스 수: $TESTCASE_COUNT개"
        
        if [ "$TESTCASE_COUNT" -gt 0 ]; then
            echo "$TESTCASES_RESPONSE" | jq -r '.[] | "     → \(.name) (\(.type), \(.priority))"' | head -5
            if [ "$TESTCASE_COUNT" -gt 5 ]; then
                echo "     → ... 및 $(($TESTCASE_COUNT - 5))개 추가"
            fi
        fi
    else
        echo "❌ $project 프로젝트 누락"
    fi
done

echo ""
echo "📊 조직별 프로젝트 분포 확인:"
echo "$PROJECTS_RESPONSE" | jq -r 'group_by(.organizationId) | .[] | "조직 ID: \(.[0].organizationId) → \(length)개 프로젝트"' 2>/dev/null || \
echo "$PROJECTS_RESPONSE" | jq -r 'group_by(.organization.id) | .[] | "조직 ID: \(.[0].organization.id) → \(length)개 프로젝트"' 2>/dev/null || \
echo "조직별 분포 확인을 위해 스키마 구조 확인 필요"

echo ""
echo "Step 4 검증 완료!"
echo "다음 단계: ./test-step-5-verify-test-execution-data.sh"