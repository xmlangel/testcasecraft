#!/bin/bash
# test-simple-deduplication.sh
# ICT-265: 간단한 중복 제거 로직 검증 테스트

echo "🧪 ICT-265: 간단한 중복 제거 로직 검증 테스트 시작"
echo "=" $(printf '%.0s=' {1..60})

# 1. 인증
echo "🔐 로그인..."
TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' \
  -s | jq -r '.accessToken')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ 로그인 실패"
    exit 1
fi

echo "✅ 인증 완료"

# 2. 프로젝트 정보
PROJECT_ID="9de93d4e-24e7-4237-9f75-23c1522991a3"
echo "🎯 대상 프로젝트 ID: $PROJECT_ID"
echo ""

# 3. 테스트케이스 통계 API 테스트
echo "1️⃣ 테스트케이스 통계 API 테스트"
echo "   - 중복 제거 로직: executionId + testCaseId 조합에서 최신 executed_at 선택"

STATS_RESPONSE=$(curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8080/api/dashboard/projects/$PROJECT_ID/test-case-statistics" \
  -s)

if [ $? -eq 0 ] && [ "$STATS_RESPONSE" != "null" ]; then
    echo "   ✅ API 호출 성공"
    echo "   📈 결과:"
    echo "$STATS_RESPONSE" | jq '.' 2>/dev/null || echo "$STATS_RESPONSE"
else
    echo "   ❌ API 호출 실패"
    echo "   응답: $STATS_RESPONSE"
fi

# 4. 프로젝트 통계 API 테스트  
echo ""
echo "2️⃣ 프로젝트 전체 통계 API 테스트"
echo "   - Repository 쿼리에서 중복 제거 적용"

PROJECT_STATS_RESPONSE=$(curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8080/api/dashboard/projects/$PROJECT_ID/statistics" \
  -s)

if [ $? -eq 0 ] && [ "$PROJECT_STATS_RESPONSE" != "null" ]; then
    echo "   ✅ API 호출 성공"
    echo "   📈 프로젝트 통계:"
    echo "$PROJECT_STATS_RESPONSE" | jq '.' 2>/dev/null || echo "$PROJECT_STATS_RESPONSE"
else
    echo "   ❌ API 호출 실패"
    echo "   응답: $PROJECT_STATS_RESPONSE"
fi

# 5. 대시보드 개요 API 테스트
echo ""
echo "3️⃣ 대시보드 개요 API 테스트"
echo "   - 통합 대시보드 정보"

OVERVIEW_RESPONSE=$(curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8080/api/dashboard/projects/$PROJECT_ID/overview" \
  -s)

if [ $? -eq 0 ] && [ "$OVERVIEW_RESPONSE" != "null" ]; then
    echo "   ✅ API 호출 성공"
    echo "   📈 대시보드 개요:"
    echo "$OVERVIEW_RESPONSE" | jq '.' 2>/dev/null || echo "$OVERVIEW_RESPONSE"
else
    echo "   ❌ API 호출 실패"
    echo "   응답: $OVERVIEW_RESPONSE"
fi

# 6. ICT-265 디버그 로그 확인 안내
echo ""
echo "🔍 ICT-265 디버그 로그 확인"
echo "   애플리케이션 로그에서 'ICT-265 Debug' 메시지를 확인하세요."
echo "   - 중복 제거 전후 개수가 표시됩니다."

echo ""
echo "🎉 ICT-265 간단한 중복 제거 로직 검증 테스트 완료"
echo "=" $(printf '%.0s=' {1..60})

echo ""
echo "💡 데이터 검증 방법:"
echo "1. H2 콘솔에서 simple-test-data.sql 실행 확인"
echo "2. 중복 데이터 분석 쿼리로 중복 확인:"
echo "   SELECT test_case_id, COUNT(*) FROM test_results"
echo "   WHERE test_execution_id = 'simple-exec-001'" 
echo "   GROUP BY test_case_id HAVING COUNT(*) > 1;"
echo ""
echo "3. API 응답에서 중복 제거된 결과 확인"
echo "   - simple-tc-001, simple-tc-002, simple-tc-003: 각각 3번의 결과 → 최신 1개만 사용"
echo "   - simple-tc-004, simple-tc-005: 각각 2번의 결과 → 최신 1개만 사용"

echo ""
echo "✅ ICT-265 간단한 중복 제거 로직 검증 스크립트 완료"