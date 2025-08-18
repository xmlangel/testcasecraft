#!/bin/bash
# scripts/fix-postgres-auth.sh
# PostgreSQL 인증 문제 해결 스크립트

set -e

echo "🔧 PostgreSQL 인증 문제 해결 시작..."

# .env.prod 파일 존재 확인
if [ ! -f ".env.prod" ]; then
    echo "❌ .env.prod 파일이 없습니다."
    echo "   .env.prod.example을 복사하여 .env.prod를 생성하세요:"
    echo "   cp .env.prod.example .env.prod"
    exit 1
fi

echo "📋 1. 현재 환경변수 확인..."
source .env.prod

echo "   POSTGRES_DB: ${POSTGRES_DB:-'미설정'}"
echo "   POSTGRES_USER: ${POSTGRES_USER:-'미설정'}"
echo "   POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-'미설정 (길이: 0)'}"

# 비밀번호 길이만 표시 (보안)
if [ -n "$POSTGRES_PASSWORD" ]; then
    echo "   POSTGRES_PASSWORD 길이: ${#POSTGRES_PASSWORD}자"
else
    echo "   POSTGRES_PASSWORD: 미설정"
fi

echo ""
echo "🧹 2. 기존 컨테이너 및 볼륨 정리..."
docker-compose -f docker-compose.prod.yml down -v 2>/dev/null || true

echo ""
echo "🗑️ 3. PostgreSQL 데이터 볼륨 완전 제거..."
if [ -d "./docker_prod_data/postgres" ]; then
    echo "   기존 PostgreSQL 데이터 디렉토리 제거 중..."
    sudo rm -rf ./docker_prod_data/postgres
    echo "   ✅ PostgreSQL 데이터 디렉토리 제거 완료"
fi

echo ""
echo "📁 4. 새로운 데이터 디렉토리 생성..."
mkdir -p ./docker_prod_data/postgres
sudo chown -R 999:999 ./docker_prod_data/postgres  # PostgreSQL 컨테이너 기본 UID/GID

echo ""
echo "🔐 5. 환경변수 검증..."
MISSING_VARS=()

if [ -z "$POSTGRES_DB" ]; then
    MISSING_VARS+=("POSTGRES_DB")
fi

if [ -z "$POSTGRES_USER" ]; then
    MISSING_VARS+=("POSTGRES_USER")
fi

if [ -z "$POSTGRES_PASSWORD" ]; then
    MISSING_VARS+=("POSTGRES_PASSWORD")
fi

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "❌ 필수 환경변수가 누락되었습니다:"
    for var in "${MISSING_VARS[@]}"; do
        echo "   - $var"
    done
    echo ""
    echo "🔧 .env.prod 파일을 다음과 같이 수정하세요:"
    echo "   POSTGRES_DB=testcase_management"
    echo "   POSTGRES_USER=testcase_user"
    echo "   POSTGRES_PASSWORD=your_strong_password_here"
    exit 1
fi

if [ ${#POSTGRES_PASSWORD} -lt 8 ]; then
    echo "⚠️  POSTGRES_PASSWORD가 너무 짧습니다 (최소 8자 권장)"
    echo "   현재 길이: ${#POSTGRES_PASSWORD}자"
fi

echo ""
echo "🚀 6. PostgreSQL 컨테이너만 먼저 시작..."
docker-compose -f docker-compose.prod.yml up -d postgres

echo ""
echo "⏳ 7. PostgreSQL 초기화 대기 (최대 60초)..."
for i in {1..60}; do
    if docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; then
        echo "   ✅ PostgreSQL 준비 완료 ($i초 소요)"
        break
    fi
    
    if [ $i -eq 60 ]; then
        echo "   ❌ PostgreSQL 초기화 타임아웃"
        echo "   로그 확인:"
        docker-compose -f docker-compose.prod.yml logs postgres | tail -20
        exit 1
    fi
    
    echo "   대기 중... ($i/60)"
    sleep 1
done

echo ""
echo "🧪 8. 데이터베이스 연결 테스트..."
if docker-compose -f docker-compose.prod.yml exec postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT version();" >/dev/null 2>&1; then
    echo "   ✅ 데이터베이스 연결 성공"
else
    echo "   ❌ 데이터베이스 연결 실패"
    echo "   PostgreSQL 로그:"
    docker-compose -f docker-compose.prod.yml logs postgres | tail -10
    exit 1
fi

echo ""
echo "🎯 9. 전체 서비스 시작..."
docker-compose -f docker-compose.prod.yml up -d

echo ""
echo "⏳ 10. 애플리케이션 시작 대기..."
echo "   애플리케이션이 시작되는 동안 로그를 확인하세요:"
echo "   docker-compose -f docker-compose.prod.yml logs -f app"
echo ""

# 30초 동안 애플리케이션 상태 확인
for i in {1..30}; do
    if docker-compose -f docker-compose.prod.yml exec app curl -f http://localhost:8080/actuator/health >/dev/null 2>&1; then
        echo "   ✅ 애플리케이션 시작 완료 ($i초 소요)"
        break
    fi
    
    if [ $i -eq 30 ]; then
        echo "   ⚠️  애플리케이션 시작 확인 타임아웃 (계속 시작 중일 수 있음)"
        echo "   수동으로 다음 명령어로 확인하세요:"
        echo "   curl http://localhost/actuator/health"
        break
    fi
    
    sleep 1
done

echo ""
echo "🎉 PostgreSQL 인증 문제 해결 완료!"
echo ""
echo "📋 다음 단계:"
echo "   1. 애플리케이션 상태 확인: docker-compose -f docker-compose.prod.yml ps"
echo "   2. 로그 확인: docker-compose -f docker-compose.prod.yml logs app"
echo "   3. 헬스 체크: curl http://localhost/actuator/health"
echo "   4. 로그인 테스트: curl -X POST http://localhost/api/auth/login -H 'Content-Type: application/json' -d '{\"username\":\"admin\",\"password\":\"admin\"}'"
echo ""
echo "📝 참고사항:"
echo "   - PostgreSQL 데이터가 초기화되었습니다"
echo "   - 기본 관리자 계정: admin/admin"
echo "   - 새로운 데이터는 ./docker_prod_data/postgres/ 에 저장됩니다"