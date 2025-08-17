#!/bin/bash

# ===================================
# 개발환경 PostgreSQL 시작 스크립트
# ===================================
# PostgreSQL과 Redis를 Docker로 실행하고 애플리케이션을 시작합니다

set -e

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_info "개발환경 PostgreSQL 설정을 시작합니다..."

# 환경 파일 확인 및 생성
ENV_FILE=".env.dev"
if [ ! -f "$ENV_FILE" ]; then
    log_warning "환경 파일 $ENV_FILE 이 존재하지 않습니다."
    log_info "PostgreSQL 개발환경 설정 파일을 생성합니다..."
    cp .env.dev.postgresql $ENV_FILE
    log_success "환경 파일 생성: $ENV_FILE"
fi

# Docker 확인
if ! command -v docker &> /dev/null; then
    log_error "Docker가 설치되지 않았습니다."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose가 설치되지 않았습니다."
    exit 1
fi

# 환경 변수 로드
log_info "환경 변수를 로드합니다..."
set -a  # 자동으로 변수를 export
source $ENV_FILE
set +a  # 자동 export 비활성화

# PostgreSQL과 Redis 시작
log_info "PostgreSQL과 Redis를 시작합니다..."
docker-compose -f docker-compose.dev.yml --env-file $ENV_FILE up -d

# 서비스 준비 확인
log_info "데이터베이스 서비스 준비를 확인합니다..."
sleep 10

# PostgreSQL 연결 확인
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    log_info "PostgreSQL 연결 확인 시도 $attempt/$max_attempts..."
    
    if docker exec testcase-postgres-dev pg_isready -U testcase_user -d testcase_management_dev > /dev/null 2>&1; then
        log_success "PostgreSQL이 준비되었습니다!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        log_error "PostgreSQL 연결에 실패했습니다."
        log_info "로그를 확인하세요:"
        echo "docker-compose -f docker-compose.dev.yml logs postgres-dev"
        exit 1
    fi
    
    sleep 2
    ((attempt++))
done

# 현재 서비스 상태
log_info "현재 개발환경 서비스 상태:"
docker-compose -f docker-compose.dev.yml ps

log_success "===== 개발환경 PostgreSQL 준비 완료 ====="
log_info "PostgreSQL: localhost:5433"
log_info "Redis: localhost:6380"
log_info "데이터베이스: testcase_management_dev"
log_info ""

# 애플리케이션 시작 옵션 제공
read -p "애플리케이션을 시작하시겠습니까? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "PostgreSQL 환경으로 애플리케이션을 시작합니다..."
    export SPRING_PROFILES_ACTIVE=dev-postgresql
    ./gradlew bootRun --args="--spring.profiles.active=dev-postgresql"
else
    log_info "다음 명령어로 애플리케이션을 시작할 수 있습니다:"
    echo "export SPRING_PROFILES_ACTIVE=dev-postgresql"
    echo "./gradlew bootRun --args=\"--spring.profiles.active=dev-postgresql\""
fi

log_info ""
log_info "유용한 명령어:"
echo "  서비스 로그 확인: docker-compose -f docker-compose.dev.yml logs -f"
echo "  서비스 정지: docker-compose -f docker-compose.dev.yml down"
echo "  PostgreSQL 접속: docker exec -it testcase-postgres-dev psql -U testcase_user -d testcase_management_dev"