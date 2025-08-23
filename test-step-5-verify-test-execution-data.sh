#!/bin/bash

# Test Step 5: 테스트 실행 및 결과 데이터 검증
echo "🧪 Step 5: 테스트 실행 및 결과 데이터 검증"
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

echo "📋 테스트플랜 목록 조회:"
TESTPLANS_RESPONSE=$(curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/testplans -s)

if echo "$TESTPLANS_RESPONSE" | grep -q "<!doctype html>"; then
    echo "⚠️  테스트플랜 API가 아직 활성화되지 않았습니다."
    echo "응답: HTML 페이지"
else
    TESTPLAN_COUNT=$(echo "$TESTPLANS_RESPONSE" | jq '. | length' 2>/dev/null || echo "0")
    if [ "$TESTPLAN_COUNT" -gt 0 ]; then
        echo "✅ 총 $TESTPLAN_COUNT개의 테스트플랜이 있습니다:"
        echo "$TESTPLANS_RESPONSE" | jq -r '.[] | "  - \(.name): \(.status)"' 2>/dev/null || echo "테스트플랜 구조 확인 필요"
    else
        echo "❌ 테스트플랜 데이터를 찾을 수 없습니다."
    fi
fi

echo ""
echo "🔍 테스트 실행 이력 조회:"
EXECUTIONS_RESPONSE=$(curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/test-executions -s)

if echo "$EXECUTIONS_RESPONSE" | grep -q "<!doctype html>"; then
    echo "⚠️  테스트 실행 API가 아직 활성화되지 않았습니다."
    echo "응답: HTML 페이지"
else
    EXECUTION_COUNT=$(echo "$EXECUTIONS_RESPONSE" | jq '. | length' 2>/dev/null || echo "0")
    if [ "$EXECUTION_COUNT" -gt 0 ]; then
        echo "✅ 총 $EXECUTION_COUNT개의 테스트 실행이 있습니다:"
        echo "$EXECUTIONS_RESPONSE" | jq -r '.[] | "  - \(.name): \(.status)"' 2>/dev/null || echo "테스트 실행 구조 확인 필요"
    else
        echo "❌ 테스트 실행 데이터를 찾을 수 없습니다."
    fi
fi

echo ""
echo "📊 테스트 결과 조회:"
RESULTS_RESPONSE=$(curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/test-results -s)

if echo "$RESULTS_RESPONSE" | grep -q "<!doctype html>"; then
    echo "⚠️  테스트 결과 API가 아직 활성화되지 않았습니다."
    echo "응답: HTML 페이지"
else
    RESULT_COUNT=$(echo "$RESULTS_RESPONSE" | jq '. | length' 2>/dev/null || echo "0")
    if [ "$RESULT_COUNT" -gt 0 ]; then
        echo "✅ 총 $RESULT_COUNT개의 테스트 결과가 있습니다:"
        echo "$RESULTS_RESPONSE" | jq -r '.[] | "  - \(.status): \(.notes // "메모 없음")"' 2>/dev/null | head -5
        if [ "$RESULT_COUNT" -gt 5 ]; then
            echo "  ... 및 $(($RESULT_COUNT - 5))개 추가 결과"
        fi
    else
        echo "❌ 테스트 결과 데이터를 찾을 수 없습니다."
    fi
fi

echo ""
echo "🏆 대시보드 통계 조회 (활용 가능한 데이터 확인):"
DASHBOARD_RESPONSE=$(curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/dashboard/statistics -s)

if echo "$DASHBOARD_RESPONSE" | grep -q "<!doctype html>"; then
    echo "⚠️  대시보드 API가 아직 활성화되지 않았습니다."
    echo "응답: HTML 페이지"
else
    echo "✅ 대시보드 통계 API 접근 가능:"
    echo "$DASHBOARD_RESPONSE" | jq '.' 2>/dev/null | head -10 || echo "JSON 파싱 오류 또는 다른 응답 형식"
fi

echo ""
echo "Step 5 검증 완료!"
echo "다음: 전체 검증 요약 보고서 생성"