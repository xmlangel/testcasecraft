#!/bin/bash

# ICT-130: Redis 환경 시작 스크립트

echo "=== ICT-130 Redis 환경 시작 ==="

# Docker가 실행 중인지 확인
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker가 실행되지 않았습니다. Docker를 시작해주세요."
    exit 1
fi

# Docker Compose로 Redis 시작
echo "🚀 Redis 컨테이너 시작 중..."
docker-compose up -d

# 컨테이너가 완전히 시작될 때까지 대기
echo "⏳ Redis 서버 준비 중..."
sleep 10

# Redis 헬스 체크
echo "🔍 Redis 연결 상태 확인..."
if docker-compose exec -T redis redis-cli -a testcase123 ping | grep -q "PONG"; then
    echo "✅ Redis 서버가 정상적으로 시작되었습니다."
    
    echo ""
    echo "📋 연결 정보:"
    echo "   - Redis 서버: localhost:6479"
    echo "   - 비밀번호: testcase123"
    echo "   - Redis Commander: http://localhost:8081 (admin/admin123)"
    echo "   - Redis Insight: http://localhost:8002"
    echo ""
    
    # 캐시 테스트
    echo "🧪 캐시 테스트 수행..."
    docker-compose exec -T redis redis-cli -a testcase123 set test_key "ICT-130 Cache Test" > /dev/null
    CACHED_VALUE=$(docker-compose exec -T redis redis-cli -a testcase123 get test_key | tr -d '\r')
    
    if [ "$CACHED_VALUE" = "ICT-130 Cache Test" ]; then
        echo "✅ 캐시 테스트 성공"
        docker-compose exec -T redis redis-cli -a testcase123 del test_key > /dev/null
    else
        echo "⚠️ 캐시 테스트 실패"
    fi
    
    echo ""
    echo "🎯 다음 단계:"
    echo "   1. Spring Boot 애플리케이션 시작: ./gradlew bootRun"
    echo "   2. 캐시 성능 테스트: ./gradlew loadTest"
    echo "   3. Redis 중지: docker-compose down"
    
else
    echo "❌ Redis 서버 시작에 실패했습니다."
    echo "🔍 로그 확인: docker-compose logs redis"
    exit 1
fi