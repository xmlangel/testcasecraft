#!/bin/bash

# Test Step 1: H2 데이터베이스 파일 및 기본 연결 검증
echo "🔍 Step 1: H2 데이터베이스 파일 및 기본 연결 검증"
echo "=========================================="

# H2 데이터베이스 파일 존재 확인
echo "📁 H2 데이터베이스 파일 확인:"
if [ -f "../h2-database-safe/testdb.mv.db" ]; then
    echo "✅ H2 데이터베이스 파일 존재: ../h2-database-safe/testdb.mv.db"
    ls -la "../h2-database-safe/testdb.mv.db"
else
    echo "❌ H2 데이터베이스 파일이 존재하지 않습니다."
    echo "   예상 위치: ../h2-database-safe/testdb.mv.db"
    exit 1
fi

echo ""
echo "📊 파일 크기 확인:"
FILE_SIZE=$(ls -lh "../h2-database-safe/testdb.mv.db" | awk '{print $5}')
echo "   데이터베이스 파일 크기: $FILE_SIZE"

if [ "${FILE_SIZE//[^0-9]/}" -gt 100 ]; then
    echo "✅ 데이터베이스에 충분한 데이터가 있는 것으로 보입니다."
else
    echo "⚠️  데이터베이스 파일이 작습니다. 초기화가 완료되지 않았을 수 있습니다."
fi

echo ""
echo "🔗 애플리케이션 연결 테스트:"
if curl -s http://localhost:8080/h2-console > /dev/null 2>&1; then
    echo "✅ H2 콘솔 접근 가능: http://localhost:8080/h2-console"
else
    echo "⚠️  애플리케이션이 실행되지 않았거나 H2 콘솔 접근 불가"
    echo "   애플리케이션을 먼저 시작하세요: ./gradlew bootRun --args=\"--spring.profiles.active=dev\""
fi

echo ""
echo "Step 1 검증 완료!"
echo "다음 단계: ./test-step-2-verify-user-data.sh"