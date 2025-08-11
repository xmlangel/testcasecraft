#!/bin/bash
# start-prod.sh - 운영 환경 실행 스크립트

echo "=== 운영 환경으로 애플리케이션 시작 ==="

# 필수 환경 변수 확인
if [ -z "$JWT_SECRET" ]; then
    echo "❌ 오류: JWT_SECRET 환경 변수가 설정되지 않았습니다."
    exit 1
fi

if [ -z "$JIRA_ENCRYPTION_KEY" ]; then
    echo "❌ 오류: JIRA_ENCRYPTION_KEY 환경 변수가 설정되지 않았습니다."
    exit 1
fi

if [ -z "$DATABASE_PASSWORD" ]; then
    echo "❌ 오류: DATABASE_PASSWORD 환경 변수가 설정되지 않았습니다."
    exit 1
fi

# 운영 환경 변수 설정
export SPRING_PROFILES_ACTIVE=prod

echo "✅ 운영 프로파일: $SPRING_PROFILES_ACTIVE"
echo "✅ 데이터베이스: PostgreSQL"
echo "✅ 서버 포트: ${SERVER_PORT:-8080}"
echo "✅ 관리 포트: ${MANAGEMENT_PORT:-8083}"
echo "✅ Redis: ${REDIS_HOST:-localhost}:${REDIS_PORT:-6379}"
echo "✅ HTTPS 강제: true"
echo "✅ 로그 레벨: INFO"
echo ""

# JAR 빌드 및 실행 (운영환경에서는 JAR로 실행)
echo "JAR 파일 빌드 중..."
./gradlew bootJar

if [ $? -eq 0 ]; then
    echo "✅ 빌드 성공"
    echo "운영 환경으로 애플리케이션 시작..."
    java -jar -Xmx2g -Xms1g \
         -Dspring.profiles.active=prod \
         -Dfile.encoding=UTF-8 \
         -Djava.awt.headless=true \
         build/libs/testcasemanagement-0.0.1-SNAPSHOT.jar
else
    echo "❌ 빌드 실패"
    exit 1
fi