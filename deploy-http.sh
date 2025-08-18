#!/bin/bash

# ===================================
# HTTP 배포 스크립트
# ===================================
# HTTPS 없이 HTTP로만 애플리케이션 배포

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
# 환경 파일 확인
ENV_FILE=".env.http"

log_info "HTTP 애플리케이션 배포를 시작합니다..."

# 환경 파일 확인
if [ ! -f "$ENV_FILE" ]; then
    log_error "환경 파일 $ENV_FILE 이 존재하지 않습니다."
    log_info "다음 명령어로 환경 파일을 생성하세요:"
    echo "cp .env.http.example $ENV_FILE"
    echo "vi $ENV_FILE  # 값 편집"
    exit 1
fi

# 환경 변수 로드
log_info "환경 변수를 로드합니다..."
set -a  # 자동으로 변수를 export
source $ENV_FILE
set +a  # 자동 export 비활성화

# 필수 환경 변수 확인
required_vars=("DOMAIN_NAME" "POSTGRES_PASSWORD" "REDIS_PASSWORD" "JWT_SECRET" "JIRA_ENCRYPTION_KEY")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        log_error "필수 환경 변수 $var 가 설정되지 않았습니다."
        exit 1
    fi
done

# Docker 및 Docker Compose 확인
if ! command -v docker &> /dev/null; then
    log_error "Docker 가 설치되지 않았습니다."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose 가 설치되지 않았습니다."
    exit 1
fi

# 기존 컨테이너 정리 여부 확인 (선택사항)
read -p "기존 애플리케이션을 종료하고 재배포하시겠습니까? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "기존 컨테이너를 정리합니다..."
    docker-compose -f docker-compose.prod.yml --env-file $ENV_FILE down -v || true
fi

# 이미지 빌드
log_info "Docker 이미지를 빌드합니다..."
docker-compose -f docker-compose.prod.yml --env-file $ENV_FILE build --no-cache

# 서비스 시작
log_info "서비스를 시작합니다..."
docker-compose -f docker-compose.prod.yml --env-file $ENV_FILE up -d

# 서비스 준비 확인
log_info "서비스 준비를 확인합니다..."
sleep 10

# 상태 점검
log_info "애플리케이션 상태 점검을 수행합니다..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    log_info "상태 점검 시도 $attempt/$max_attempts..."
    
    if curl -f http://localhost/health > /dev/null 2>&1; then
        log_success "애플리케이션이 정상적으로 시작되었습니다!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        log_error "애플리케이션 시작에 실패했습니다."
        log_info "로그를 확인하세요:"
        echo "docker-compose -f docker-compose.prod.yml logs"
        exit 1
    fi
    
    sleep 10
    ((attempt++))
done

# 현재 서비스 상태
log_info "현재 서비스 상태:"
docker-compose -f docker-compose.prod.yml ps

log_success "===== HTTP 애플리케이션 배포 완료 ====="
log_info "접속 URL: http://$DOMAIN_NAME"
log_info "기본 계정 정보: admin/admin"
log_info ""
log_info "유용한 명령어:"
echo "  서비스 로그 확인: docker-compose -f docker-compose.prod.yml logs -f"
echo "  서비스 정지: docker-compose -f docker-compose.prod.yml down"
echo "  서비스 재시작: docker-compose -f docker-compose.prod.yml restart"