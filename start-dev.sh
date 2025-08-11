#!/bin/bash
# start-dev.sh - 개발 환경 실행 스크립트

echo "=== 개발 환경으로 애플리케이션 시작 ==="

# 개발 환경 변수 설정
export SPRING_PROFILES_ACTIVE=dev
export JIRA_ENCRYPTION_KEY="5CBRv5FwesBJkQ7ecX1KGCxyUQTcnE1CkkGBYDswb2Y="

echo "✅ 개발 프로파일: $SPRING_PROFILES_ACTIVE"
echo "✅ 데이터베이스: H2 파일 기반 (./data/testdb.mv.db)"
echo "✅ 서버 포트: 8080"
echo "✅ 관리 포트: 8083"
echo "✅ H2 콘솔: http://localhost:8080/h2-console"
echo "✅ JDBC URL: jdbc:h2:file:./data/testdb"
echo "✅ Swagger UI: http://localhost:8080/swagger-ui.html"
echo "✅ 로그 레벨: DEBUG"
echo "✅ JIRA 암호화: 활성화"
echo ""

# Gradle 빌드 및 실행
./gradlew bootRun --args="--spring.profiles.active=dev"