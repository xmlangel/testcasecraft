#!/bin/bash
# execute-test-data.sh
# ICT-265: H2 콘솔에서 대량 테스트 데이터 생성 가이드

echo "🚀 ICT-265: 대량 테스트 데이터 생성 가이드"
echo "=" $(printf '%.0s=' {1..60})

echo ""
echo "📋 H2 콘솔 접속 정보:"
echo "  🌐 URL: http://localhost:8080/h2-console"
echo "  📁 JDBC URL: jdbc:h2:file:./data/testdb"  
echo "  👤 User Name: sa"
echo "  🔑 Password: (비워두세요)"

echo ""
echo "📝 실행할 SQL 파일 목록:"
echo "  1️⃣ create-massive-test-data.sql - 대량 테스트 데이터 생성"
echo "  2️⃣ insert-test-execution-data.sql - 중복 테스트 결과 생성"
echo "  3️⃣ create-duplicate-test-results.sql - H2 콘솔용 중복 데이터"

echo ""
echo "🔧 실행 단계:"
echo "  1. 브라우저에서 H2 콘솔 접속 (http://localhost:8080/h2-console)"
echo "  2. 연결 정보 입력 후 Connect 클릭"
echo "  3. create-massive-test-data.sql 파일 내용 복사 붙여넣기"
echo "  4. SQL 실행 (Run 버튼 클릭)"
echo "  5. 결과 확인: 테스트케이스 100개, 테스트플랜 15개, 테스트실행 12개, 테스트결과 1400개+"

echo ""
echo "✅ 검증 쿼리 (실행 후 확인):"
echo "SELECT 'Test Data Summary' as info;"
echo "SELECT 'Test Cases' as table_name, COUNT(*) as count FROM testcases WHERE name LIKE 'ICT265%';"
echo "SELECT 'Test Plans' as table_name, COUNT(*) as count FROM test_plans WHERE name LIKE 'ICT265%';"  
echo "SELECT 'Test Executions' as table_name, COUNT(*) as count FROM test_executions WHERE name LIKE 'ICT265%';"
echo "SELECT 'Test Results' as table_name, COUNT(*) as count FROM test_results WHERE notes LIKE '%ICT-265%';"

echo ""
echo "🎯 ICT-265 중복 데이터 검증:"
echo "-- 중복 데이터 분석 (execution_id + test_case_id 조합별)"
echo "SELECT"
echo "    test_execution_id,"
echo "    test_case_id,"
echo "    COUNT(*) as result_count,"
echo "    MIN(executed_at) as earliest,"
echo "    MAX(executed_at) as latest"
echo "FROM test_results"
echo "WHERE notes LIKE '%ICT-265%'"
echo "GROUP BY test_execution_id, test_case_id"
echo "HAVING COUNT(*) > 1"
echo "ORDER BY result_count DESC;"

echo ""
echo "💡 참고:"
echo "  - 생성된 데이터는 H2 파일 기반 DB에 저장됩니다 (./data/testdb)"
echo "  - 애플리케이션 재시작 후에도 데이터가 유지됩니다"
echo "  - ICT-265 중복 제거 로직 테스트에 적합한 데이터가 포함되어 있습니다"

echo ""
echo "🔗 관련 파일:"
echo "  📄 create-massive-test-data.sql - 주요 데이터 생성 스크립트"
echo "  📄 test-deduplication.sh - API 테스트 스크립트"
echo "  📄 create-test-data.sh - API 기반 데이터 생성"

echo ""
echo "✅ ICT-265 대량 테스트 데이터 생성 가이드 완료"