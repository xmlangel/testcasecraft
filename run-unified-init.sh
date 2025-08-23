#!/bin/bash

# run-unified-init.sh
# ICT-278: 통합 초기화 스크립트 실행 도구

echo "🚀 ICT-278: 통합 데이터 초기화 스크립트 실행"
echo "========================================"

# H2 Console을 통한 SQL 실행
H2_CONSOLE_URL="http://localhost:8080/h2-console"
SQL_FILE="unified-data-init.sql"

if [ ! -f "$SQL_FILE" ]; then
    echo "❌ 오류: $SQL_FILE 파일을 찾을 수 없습니다."
    exit 1
fi

echo "📋 초기화 스크립트 정보:"
echo "   - 파일: $SQL_FILE"
echo "   - 크기: $(wc -l < $SQL_FILE) 줄"
echo "   - H2 콘솔: $H2_CONSOLE_URL"
echo ""

echo "🔧 초기화 방법 안내:"
echo "1. 브라우저에서 H2 콘솔 접속: $H2_CONSOLE_URL"
echo "2. 연결 정보:"
echo "   - JDBC URL: jdbc:h2:file:../h2-database-safe/testdb"  
echo "   - User Name: sa"
echo "   - Password: (비어있음)"
echo "3. Connect 버튼 클릭 후 다음 SQL 실행:"
echo ""

echo "=== SQL 스크립트 미리보기 (처음 20줄) ==="
head -20 "$SQL_FILE"
echo "..."
echo "=== 전체 스크립트는 $SQL_FILE 파일 참조 ==="
echo ""

echo "📊 예상 초기화 결과:"
echo "   - 사용자: 3명 (admin/admin, tester/tester, developer/developer)"  
echo "   - 조직: 3개 (QA팀, 개발팀, 데브옵스팀)"
echo "   - 프로젝트: 3개"
echo "   - 테스트케이스: 30개 (조직별 특성화)"
echo "   - 테스트플랜: 12개"
echo "   - 테스트실행: 13개"
echo "   - JUnit결과: 확장된 결과셋"
echo ""

echo "🎯 초기화 완료 후 확인사항:"
echo "   1. 로그인: admin/admin 또는 tester/tester"
echo "   2. 대시보드에서 데이터 확인"
echo "   3. 각 조직별 프로젝트 및 테스트케이스 확인"
echo "   4. 진행 중인 테스트 실행 상태 확인"
echo ""

echo "✅ 준비 완료! H2 콘솔에서 SQL 스크립트를 실행하세요."