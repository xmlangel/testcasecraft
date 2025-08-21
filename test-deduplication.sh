#!/bin/bash
# test-deduplication.sh
# ICT-265: 중복 제거 로직 검증 테스트

echo "🧪 ICT-265: 중복 제거 로직 검증 테스트 시작"
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
PROJECT_ID=$(curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/projects \
  -s | jq -r '.[0].id')

PROJECT_NAME=$(curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/projects \
  -s | jq -r '.[0].name')

echo "🎯 대상 프로젝트: $PROJECT_NAME"
echo ""

# 3. ICT-265 중복 제거가 적용된 대시보드 API들 테스트
echo "📊 ICT-265 중복 제거 로직 적용된 대시보드 API 테스트"
echo "-" $(printf '%.0s-' {1..50})

# 3-1. 테스트케이스 통계 API
echo ""
echo "1️⃣ 테스트케이스 통계 API (getTestCaseStatistics)"
echo "   - 중복 제거 로직: executionId + testCaseId 조합에서 최신 executed_at 선택"

STATS_RESPONSE=$(curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8080/api/dashboard/projects/$PROJECT_ID/test-case-statistics" \
  -s)

if [ $? -eq 0 ] && [ "$STATS_RESPONSE" != "null" ]; then
    echo "   ✅ API 호출 성공"
    echo "   📈 결과:"
    echo "$STATS_RESPONSE" | jq '{
        totalCases: .totalCases,
        PASS: .PASS, 
        FAIL: .FAIL,
        BLOCKED: .BLOCKED,
        SKIPPED: .SKIPPED,
        NOTRUN: .NOTRUN
    }'
else
    echo "   ❌ API 호출 실패"
fi

# 3-2. 테스트결과 추이 API  
echo ""
echo "2️⃣ 테스트결과 추이 API (getTestResultsTrend)"
echo "   - 중복 제거 로직: executionId + testCaseId 조합에서 최신 executed_at 선택"

# 최근 7일간의 추이 조회
START_DATE=$(date -u -v-7d +%Y-%m-%dT00:00:00Z 2>/dev/null || date -u -d '7 days ago' +%Y-%m-%dT00:00:00Z)
END_DATE=$(date -u +%Y-%m-%dT23:59:59Z)

TREND_RESPONSE=$(curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8080/api/dashboard/projects/$PROJECT_ID/test-results-trend?startDate=$START_DATE&endDate=$END_DATE" \
  -s)

if [ $? -eq 0 ] && [ "$TREND_RESPONSE" != "null" ]; then
    echo "   ✅ API 호출 성공"
    TREND_COUNT=$(echo "$TREND_RESPONSE" | jq '. | length')
    echo "   📈 추이 데이터 포인트: $TREND_COUNT개"
    if [ "$TREND_COUNT" -gt 0 ]; then
        echo "   📊 최근 데이터 샘플:"
        echo "$TREND_RESPONSE" | jq '.[0] | {date: .date, totalTests: .totalTests, passedTests: .passedTests, passRate: .passRate}' 2>/dev/null || echo "   (데이터 형식 확인 필요)"
    fi
else
    echo "   ❌ API 호출 실패 또는 데이터 없음"
fi

# 3-3. 프로젝트 전체 통계 API
echo ""  
echo "3️⃣ 프로젝트 전체 통계 API (getProjectStatistics)"
echo "   - Repository 쿼리에서 이미 중복 제거 적용됨 (최신 executed_at 기준)"

PROJECT_STATS_RESPONSE=$(curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8080/api/dashboard/projects/$PROJECT_ID/statistics" \
  -s)

if [ $? -eq 0 ] && [ "$PROJECT_STATS_RESPONSE" != "null" ]; then
    echo "   ✅ API 호출 성공"
    echo "   📈 프로젝트 통계:"
    echo "$PROJECT_STATS_RESPONSE" | jq '{
        projectId: .projectId,
        totalTestCases: .totalTestCases,
        totalTestPlans: .totalTestPlans, 
        executedTestCases: .executedTestCases,
        passedTestCases: .passedTestCases,
        failedTestCases: .failedTestCases,
        passRate: .passRate,
        testCoverage: .testCoverage
    }' 2>/dev/null || echo "$PROJECT_STATS_RESPONSE"
else
    echo "   ❌ API 호출 실패"
fi

# 4. 대시보드 개요 API 
echo ""
echo "4️⃣ 대시보드 개요 API (Dashboard Overview)"
echo "   - 통합 대시보드 정보"

OVERVIEW_RESPONSE=$(curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8080/api/dashboard/projects/$PROJECT_ID/overview" \
  -s)

if [ $? -eq 0 ] && [ "$OVERVIEW_RESPONSE" != "null" ]; then
    echo "   ✅ API 호출 성공"
    echo "   📈 대시보드 개요:"
    echo "$OVERVIEW_RESPONSE" | jq '.basicStatistics // .' 2>/dev/null | head -10
else
    echo "   ❌ API 호출 실패"
fi

# 5. 로그 확인 (ICT-265 디버그 로그)
echo ""
echo "🔍 ICT-265 디버그 로그 확인"
echo "   애플리케이션 로그에서 'ICT-265 Debug' 메시지를 확인하세요."
echo "   - 중복 제거 전후 개수가 표시됩니다."

# 6. 검증 결과 요약
echo ""
echo "🎉 ICT-265 중복 제거 로직 검증 테스트 완료"
echo "=" $(printf '%.0s=' {1..60})

echo ""
echo "💡 검증 포인트:"
echo "1. 테스트케이스 통계: executionId + testCaseId 중복 제거 적용"
echo "2. 테스트결과 추이: 기간별 중복 제거된 데이터 기준 통계"  
echo "3. 프로젝트 통계: Repository 쿼리 레벨에서 중복 제거"
echo "4. 애플리케이션 로그: 'ICT-265 Debug' 메시지로 실제 처리 확인"

echo ""
echo "📋 추가 확인 방법:"
echo "1. H2 콘솔에서 create-duplicate-test-results.sql 실행"
echo "2. 애플리케이션 로그에서 중복 제거 전후 개수 확인"
echo "3. 같은 API를 여러 번 호출하여 일관성 확인"

echo ""
echo "🔗 H2 콘솔: http://localhost:8080/h2-console"
echo "   JDBC URL: jdbc:h2:file:./data/testdb"
echo "   User: sa, Password: (empty)"

echo ""
echo "✅ ICT-265 중복 제거 로직 검증 스크립트 완료"