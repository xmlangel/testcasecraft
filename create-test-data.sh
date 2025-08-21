#!/bin/bash
# create-test-data.sh
# ICT-265: 중복 데이터 검증을 위한 테스트 데이터 생성 스크립트

echo "🚀 ICT-265: 테스트 데이터 생성 시작"

# 1. 인증
echo "🔐 로그인 및 인증..."
TOKEN=$(curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' \
  -s | jq -r '.accessToken')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ 로그인 실패"
    exit 1
fi

echo "✅ 인증 완료"

# 2. 프로젝트 정보 확인
echo "📁 프로젝트 정보 확인..."
PROJECT_ID=$(curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/projects \
  -s | jq -r '.[0].id')

if [ "$PROJECT_ID" = "null" ] || [ -z "$PROJECT_ID" ]; then
    echo "❌ 프로젝트 조회 실패"
    exit 1
fi

PROJECT_NAME=$(curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/projects \
  -s | jq -r '.[0].name')

echo "🎯 대상 프로젝트: $PROJECT_NAME ($PROJECT_ID)"

# 3. 테스트케이스 20개 생성
echo ""
echo "📝 테스트케이스 20개 생성 중..."

TEST_CASE_IDS=()
SUCCESS_COUNT=0

for i in $(seq 1 20); do
    PADDED_NUM=$(printf "%02d" $i)
    PRIORITY=(HIGH MEDIUM LOW)
    PRIORITY_IDX=$((i % 3))
    SELECTED_PRIORITY=${PRIORITY[$PRIORITY_IDX]}
    
    TEST_CASE_DATA="{
        \"name\": \"ICT265_테스트케이스_$PADDED_NUM\",
        \"description\": \"ICT-265 중복 데이터 검증용 테스트케이스 #$i\",
        \"projectId\": \"$PROJECT_ID\",
        \"priority\": \"$SELECTED_PRIORITY\",
        \"status\": \"ACTIVE\",
        \"type\": \"MANUAL\",
        \"executionTime\": $((30 + i * 5))
    }"
    
    RESPONSE=$(curl -X POST http://localhost:8080/api/testcases \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "$TEST_CASE_DATA" \
        -s -w "\n%{http_code}")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n -1)
    
    if [ "$HTTP_CODE" = "201" ]; then
        TEST_CASE_ID=$(echo "$BODY" | jq -r '.id')
        TEST_CASE_IDS+=("$TEST_CASE_ID")
        SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        echo "  ✅ 테스트케이스 $i/20 생성 완료: ICT265_테스트케이스_$PADDED_NUM"
    else
        echo "  ⚠️ 테스트케이스 $i 생성 실패: HTTP $HTTP_CODE"
    fi
done

echo "✅ 테스트케이스 $SUCCESS_COUNT개 생성 완료"

# 4. 테스트플랜 3개 생성
echo ""
echo "📋 테스트플랜 3개 생성 중..."

TEST_PLAN_IDS=()
PLAN_SUCCESS_COUNT=0

for i in $(seq 1 3); do
    # 각 플랜에 6-8개의 테스트케이스 할당
    START_IDX=$(( (i - 1) * 6 ))
    END_IDX=$(( START_IDX + 7 ))
    
    # 테스트케이스 ID 배열 구성
    TESTCASE_IDS_JSON="["
    FIRST=true
    for j in $(seq $START_IDX $END_IDX); do
        if [ $j -lt ${#TEST_CASE_IDS[@]} ]; then
            if [ "$FIRST" = true ]; then
                TESTCASE_IDS_JSON="${TESTCASE_IDS_JSON}\"${TEST_CASE_IDS[$j]}\""
                FIRST=false
            else
                TESTCASE_IDS_JSON="${TESTCASE_IDS_JSON},\"${TEST_CASE_IDS[$j]}\""
            fi
        fi
    done
    TESTCASE_IDS_JSON="${TESTCASE_IDS_JSON}]"
    
    TEST_PLAN_DATA="{
        \"name\": \"ICT265_테스트플랜_$i\",
        \"description\": \"ICT-265 중복 데이터 검증용 테스트플랜 #$i\",
        \"projectId\": \"$PROJECT_ID\",
        \"status\": \"ACTIVE\",
        \"testCaseIds\": $TESTCASE_IDS_JSON
    }"
    
    RESPONSE=$(curl -X POST http://localhost:8080/api/testplans \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $TOKEN" \
        -d "$TEST_PLAN_DATA" \
        -s -w "\n%{http_code}")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | head -n -1)
    
    if [ "$HTTP_CODE" = "201" ]; then
        TEST_PLAN_ID=$(echo "$BODY" | jq -r '.id')
        TEST_PLAN_IDS+=("$TEST_PLAN_ID")
        PLAN_SUCCESS_COUNT=$((PLAN_SUCCESS_COUNT + 1))
        echo "  ✅ 테스트플랜 $i/3 생성 완료: ICT265_테스트플랜_$i"
    else
        echo "  ⚠️ 테스트플랜 $i 생성 실패: HTTP $HTTP_CODE"
        echo "     응답: $BODY" | head -c 200
    fi
done

echo "✅ 테스트플랜 $PLAN_SUCCESS_COUNT개 생성 완료"

# 5. 테스트실행 2개 생성
echo ""
echo "🔄 테스트실행 2개 생성 중..."

TEST_EXECUTION_IDS=()
EXEC_SUCCESS_COUNT=0

for i in $(seq 1 2); do
    if [ $i -le ${#TEST_PLAN_IDS[@]} ]; then
        TEST_EXECUTION_DATA="{
            \"name\": \"ICT265_테스트실행_$i\",
            \"description\": \"ICT-265 중복 데이터 검증용 테스트실행 #$i\",
            \"projectId\": \"$PROJECT_ID\",
            \"testPlanId\": \"${TEST_PLAN_IDS[$((i-1))]}\",
            \"status\": \"INPROGRESS\",
            \"scheduledStartTime\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\"
        }"
        
        RESPONSE=$(curl -X POST http://localhost:8080/api/executions \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            -d "$TEST_EXECUTION_DATA" \
            -s -w "\n%{http_code}")
        
        HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
        BODY=$(echo "$RESPONSE" | head -n -1)
        
        if [ "$HTTP_CODE" = "201" ]; then
            TEST_EXECUTION_ID=$(echo "$BODY" | jq -r '.id')
            TEST_EXECUTION_IDS+=("$TEST_EXECUTION_ID")
            EXEC_SUCCESS_COUNT=$((EXEC_SUCCESS_COUNT + 1))
            echo "  ✅ 테스트실행 $i/2 생성 완료: ICT265_테스트실행_$i"
        else
            echo "  ⚠️ 테스트실행 $i 생성 실패: HTTP $HTTP_CODE"
            echo "     응답: $BODY" | head -c 200
        fi
    fi
done

echo "✅ 테스트실행 $EXEC_SUCCESS_COUNT개 생성 완료"

# 6. 생성 결과 요약
echo ""
echo "🎉 ICT-265 테스트 데이터 생성 완료!"
echo "=" $(printf '%.0s=' {1..50})
echo "📝 테스트케이스: $SUCCESS_COUNT개"
echo "📋 테스트플랜: $PLAN_SUCCESS_COUNT개" 
echo "🔄 테스트실행: $EXEC_SUCCESS_COUNT개"
echo "🎯 프로젝트: $PROJECT_NAME"

echo ""
echo "💡 다음 단계:"
echo "1. H2 콘솔에서 test_results 테이블에 중복 데이터 직접 삽입"
echo "2. 대시보드 API로 중복 제거 로직 검증"
echo ""
echo "🔗 H2 콘솔: http://localhost:8080/h2-console"
echo "   JDBC URL: jdbc:h2:mem:testdb"
echo "   User: sa, Password: (empty)"

echo ""
echo "📊 생성된 ID들:"
echo "테스트케이스 ID 목록:"
for id in "${TEST_CASE_IDS[@]}"; do
    echo "  - $id"
done

if [ ${#TEST_PLAN_IDS[@]} -gt 0 ]; then
    echo "테스트플랜 ID 목록:"
    for id in "${TEST_PLAN_IDS[@]}"; do
        echo "  - $id"
    done
fi

if [ ${#TEST_EXECUTION_IDS[@]} -gt 0 ]; then
    echo "테스트실행 ID 목록:"
    for id in "${TEST_EXECUTION_IDS[@]}"; do
        echo "  - $id"
    done
fi

echo ""
echo "✅ ICT-265 테스트 데이터 생성 스크립트 완료"