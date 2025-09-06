#!/bin/bash

# Docker Compose 환경 종합 테스트 스크립트
# 사용법: ./test-docker-compose.sh

echo "🧪 === Docker Compose 환경 종합 테스트 ==="
echo "📅 테스트 시작: $(date)"
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 성공/실패 카운터
SUCCESS_COUNT=0
FAIL_COUNT=0

# 테스트 결과 함수
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2 통과${NC}"
        ((SUCCESS_COUNT++))
    else
        echo -e "${RED}❌ $2 실패${NC}"
        ((FAIL_COUNT++))
    fi
}

echo "🐳 1. Docker Compose 서비스 상태 확인..."
docker-compose ps
echo ""

echo "🔍 2. 개별 서비스 Health Check..."

# Spring Boot Health Check
echo "   - Spring Boot 직접 연결 테스트..."
health_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health)
if [ "$health_status" = "200" ]; then
    test_result 0 "Spring Boot Health Check"
else
    test_result 1 "Spring Boot Health Check (응답 코드: $health_status)"
fi

# Nginx HTTPS Health Check
echo "   - Nginx HTTPS 연결 테스트..."
nginx_status=$(curl -k -s -o /dev/null -w "%{http_code}" https://localhost/actuator/health)
if [ "$nginx_status" = "200" ]; then
    test_result 0 "Nginx HTTPS Health Check"
else
    test_result 1 "Nginx HTTPS Health Check (응답 코드: $nginx_status)"
fi

# HTTP → HTTPS 리디렉션 테스트
echo "   - HTTP → HTTPS 리디렉션 테스트..."
redirect_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/)
if [ "$redirect_status" = "301" ]; then
    test_result 0 "HTTP → HTTPS 리디렉션"
else
    test_result 1 "HTTP → HTTPS 리디렉션 (응답 코드: $redirect_status)"
fi

echo ""
echo "🔐 3. 인증 API 테스트..."

# 로컬호스트 로그인 테스트
echo "   - localhost:8080 로그인 테스트..."
login_result=$(curl -s "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' 2>/dev/null | jq -r '.user.username' 2>/dev/null)
if [ "$login_result" = "admin" ]; then
    test_result 0 "직접 로그인 API"
else
    test_result 1 "직접 로그인 API (결과: $login_result)"
fi

# HTTPS 로그인 테스트
echo "   - HTTPS 로그인 테스트..."
https_login=$(curl -k -s "https://localhost/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' 2>/dev/null | jq -r '.user.username' 2>/dev/null)
if [ "$https_login" = "admin" ]; then
    test_result 0 "HTTPS 로그인 API"
else
    test_result 1 "HTTPS 로그인 API (결과: $https_login)"
fi

# JWT 토큰 테스트
echo "   - JWT 토큰 기반 API 테스트..."
TOKEN=$(curl -k -s "https://localhost/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' 2>/dev/null | jq -r '.accessToken' 2>/dev/null)
if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    # 토큰으로 프로젝트 API 호출
    project_count=$(curl -k -s "https://localhost/api/projects" \
      -H "Authorization: Bearer $TOKEN" 2>/dev/null | jq 'length' 2>/dev/null)
    if [ "$project_count" -gt 0 ] 2>/dev/null; then
        test_result 0 "JWT 토큰 인증 (프로젝트 $project_count개 조회)"
    else
        test_result 1 "JWT 토큰 인증 (프로젝트 조회 실패)"
    fi
else
    test_result 1 "JWT 토큰 발급"
fi

echo ""
echo "🗄️ 4. 데이터베이스 연결 테스트..."

# PostgreSQL 연결 테스트
echo "   - PostgreSQL 연결 테스트..."
db_result=$(docker exec testcase-postgres-dev psql -U testcase_user -d testcase_management -t -c "SELECT count(*) FROM users;" 2>/dev/null | tr -d '[:space:]')
if [ "$db_result" -gt 0 ] 2>/dev/null; then
    test_result 0 "PostgreSQL 데이터베이스 (사용자 $db_result명)"
else
    test_result 1 "PostgreSQL 데이터베이스 연결"
fi

# 데이터베이스 버전 확인
echo "   - 데이터베이스 버전 확인..."
db_version=$(docker exec testcase-postgres-dev psql -U testcase_user -d testcase_management -t -c "SELECT version();" 2>/dev/null | grep PostgreSQL | cut -d' ' -f2)
if [ -n "$db_version" ]; then
    test_result 0 "데이터베이스 버전 (PostgreSQL $db_version)"
else
    test_result 1 "데이터베이스 버전 확인"
fi

echo ""
echo "🌐 5. IP 주소 접속 테스트..."

# IP 주소 접속 테스트 (192.168.29.184)
echo "   - IP 주소 HTTPS 접속 테스트..."
ip_status=$(curl -k -s -o /dev/null -w "%{http_code}" https://192.168.29.184/ 2>/dev/null)
if [ "$ip_status" = "200" ]; then
    test_result 0 "IP 주소 HTTPS 접속 (192.168.29.184)"
else
    test_result 1 "IP 주소 HTTPS 접속 (응답 코드: $ip_status)"
fi

# IP 주소 로그인 테스트
echo "   - IP 주소 로그인 테스트..."
ip_login=$(curl -k -s "https://192.168.29.184/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' 2>/dev/null | jq -r '.user.username' 2>/dev/null)
if [ "$ip_login" = "admin" ]; then
    test_result 0 "IP 주소 로그인 API"
else
    test_result 1 "IP 주소 로그인 API (결과: $ip_login)"
fi

echo ""
echo "📋 6. 시스템 정보 수집..."

# 컨테이너 상태 정보
echo "   - 컨테이너 리소스 사용량..."
echo "$(docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}")" | head -4

# 포트 정보
echo ""
echo "   - 사용 중인 포트..."
netstat -tulpn 2>/dev/null | grep -E ":(80|443|8080|5433)" | grep LISTEN || echo "     포트 정보 조회 실패"

echo ""
echo "📊 === 테스트 결과 요약 ==="
echo -e "📅 테스트 완료: $(date)"
echo -e "✅ 성공: ${GREEN}${SUCCESS_COUNT}${NC}개"
echo -e "❌ 실패: ${RED}${FAIL_COUNT}${NC}개"

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}모든 테스트가 성공적으로 완료되었습니다!${NC}"
    echo -e "🌐 웹사이트 접속: ${BLUE}https://localhost${NC} 또는 ${BLUE}https://192.168.29.184${NC}"
    echo -e "🔐 로그인 정보: admin/admin"
    exit 0
else
    echo -e "\n⚠️  ${YELLOW}일부 테스트가 실패했습니다. 다음 명령으로 로그를 확인하세요:${NC}"
    echo "   docker-compose logs testcraft-app"
    echo "   docker-compose logs testcase-nginx"
    echo "   docker-compose logs testcase-postgres-dev"
    exit 1
fi