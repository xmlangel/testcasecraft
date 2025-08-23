#!/bin/bash

# execute-init.sh
# ICT-278: H2 데이터베이스 초기화 자동 실행 도구

echo "🚀 ICT-278: 데이터베이스 초기화 자동 실행"
echo "========================================"

# H2 데이터베이스 파일 위치 확인
if [ ! -f "../h2-database-safe/testdb.mv.db" ]; then
    echo "❌ 오류: H2 데이터베이스 파일을 찾을 수 없습니다."
    echo "   경로: ../h2-database-safe/testdb.mv.db"
    echo "   애플리케이션이 실행 중인지 확인하세요."
    exit 1
fi

echo "✅ H2 데이터베이스 파일 확인됨"

# 애플리케이션 실행 상태 확인
if ! curl -s http://localhost:8080/h2-console > /dev/null; then
    echo "❌ 오류: 애플리케이션이 실행되지 않았거나 H2 콘솔에 접근할 수 없습니다."
    echo "   다음 명령으로 애플리케이션을 시작하세요:"
    echo "   ./gradlew bootRun --args=\"--spring.profiles.active=dev\""
    exit 1
fi

echo "✅ 애플리케이션 실행 상태 확인됨"

echo ""
echo "📋 데이터 초기화 단계:"
echo "1. Step 1: 사용자 데이터 (admin, tester, developer)"
echo "2. Step 2: 조직 데이터 (QA팀, 개발팀, 데브옵스팀)"  
echo "3. Step 3: 프로젝트 데이터 (3개 프로젝트)"
echo "4. Step 4: 테스트케이스 데이터 (30개)"
echo "5. Step 5: 테스트 실행 및 결과 데이터"
echo ""

# 각 단계별 파일 존재 확인
for step in 1 2 3; do
    if [ ! -f "step${step}-*.sql" ]; then
        echo "❌ 단계 ${step} SQL 파일을 찾을 수 없습니다."
    else
        echo "✅ Step ${step} SQL 파일 준비됨"
    fi
done

echo ""
echo "🔧 수동 실행 방법:"
echo "1. 브라우저에서 H2 콘솔 열기:"
echo "   http://localhost:8080/h2-console"
echo ""
echo "2. 연결 설정:"
echo "   JDBC URL: jdbc:h2:file:../h2-database-safe/testdb"
echo "   User Name: sa"
echo "   Password: (비어있음)"
echo ""
echo "3. 다음 순서로 SQL 파일 실행:"
echo "   - step1-users.sql"
echo "   - step2-organizations.sql"
echo "   - step3-projects.sql"
echo "   - 또는 전체 unified-data-init.sql"
echo ""

echo "📊 예상 실행 결과:"
echo "   - 사용자: 3명 (admin/admin, tester/tester, developer/developer)"
echo "   - 조직: 3개"
echo "   - 프로젝트: 3개"
echo "   - 테스트케이스: 30개 (조직별)"
echo "   - 풍부한 테스트 실행 이력"
echo ""

echo "✅ 준비 완료! 위 가이드에 따라 H2 콘솔에서 SQL을 실행하세요."