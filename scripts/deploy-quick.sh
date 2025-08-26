#!/bin/bash
# scripts/deploy-quick.sh
# 빌드 없이 빠른 재배포 스크립트

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
ENV_FILE=".env.prod"

log_info "빠른 재배포를 시작합니다..."

# 환경 파일 확인
if [ ! -f "$ENV_FILE" ]; then
    log_error "환경 파일 $ENV_FILE 이 존재하지 않습니다."
    log_info "다음 명령어로 환경 파일을 생성하세요:"
    echo "cp .env.prod.example $ENV_FILE"
    echo "vi $ENV_FILE  # 값 편집"
    exit 1
fi

# 환경 변수 로드
log_info "환경 변수를 로드합니다..."
set -a  # 자동으로 변수를 export
source $ENV_FILE
set +a  # 자동 export 비활성화

# 필수 환경 변수 확인
log_info "필수 환경 변수를 확인합니다..."
required_vars=("POSTGRES_PASSWORD" "REDIS_PASSWORD" "JWT_SECRET")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        log_error "필수 환경 변수 $var 가 설정되지 않았습니다."
        exit 1
    fi
done

# Docker 확인
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose 가 설치되지 않았습니다."
    exit 1
fi

# 현재 컨테이너 상태 확인
log_info "현재 컨테이너 상태를 확인합니다..."
if docker-compose -f docker-compose.yml ps | grep -q "Up"; then
    log_info "실행 중인 컨테이너가 있습니다."
    
    # 재배포 방식 선택
    echo ""
    echo "재배포 방식을 선택하세요:"
    echo "1) 롤링 재시작 (무중단, 빠름)"
    echo "2) 완전 재배포 (볼륨 유지)"
    echo "3) 완전 초기화 (볼륨 삭제)"
    echo "4) 취소"
    read -p "선택 (1-4): " -n 1 -r
    echo ""
    
    case $REPLY in
        1)
            DEPLOY_MODE="rolling"
            ;;
        2)
            DEPLOY_MODE="restart"
            ;;
        3)
            DEPLOY_MODE="clean"
            ;;
        4)
            log_info "재배포를 취소합니다."
            exit 0
            ;;
        *)
            log_error "잘못된 선택입니다."
            exit 1
            ;;
    esac
else
    log_info "실행 중인 컨테이너가 없습니다. 새로 시작합니다."
    DEPLOY_MODE="start"
fi

# 배포 실행
case $DEPLOY_MODE in
    "rolling")
        log_info "롤링 재시작을 수행합니다... (빌드 없음)"
        
        # 애플리케이션만 재시작 (DB/Redis는 유지)
        log_info "애플리케이션 컨테이너 재시작..."
        docker-compose -f docker-compose.yml --env-file $ENV_FILE restart app
        
        # Nginx 설정 리로드
        log_info "Nginx 설정 리로드..."
        docker-compose -f docker-compose.yml --env-file $ENV_FILE exec nginx nginx -s reload 2>/dev/null || \
        docker-compose -f docker-compose.yml --env-file $ENV_FILE restart nginx
        
        ;;
        
    "restart")
        log_info "완전 재배포를 수행합니다... (볼륨 유지, 빌드 없음)"
        
        # 모든 서비스 중지 (볼륨은 유지)
        log_info "서비스 중지 중..."
        docker-compose -f docker-compose.yml --env-file $ENV_FILE down
        
        # 서비스 시작
        log_info "서비스 시작 중..."
        docker-compose -f docker-compose.yml --env-file $ENV_FILE up -d
        
        ;;
        
    "clean")
        log_info "완전 초기화 재배포를 수행합니다... (볼륨 삭제, 빌드 없음)"
        
        # 확인
        log_warning "⚠️  이 작업은 모든 데이터를 삭제합니다!"
        read -p "정말 계속하시겠습니까? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "작업을 취소합니다."
            exit 0
        fi
        
        # 모든 서비스 중지 및 볼륨 삭제
        log_info "서비스 중지 및 볼륨 삭제 중..."
        docker-compose -f docker-compose.yml --env-file $ENV_FILE down -v
        
        # 데이터 디렉토리 정리
        log_info "데이터 디렉토리 정리 중..."
        sudo rm -rf ./docker_prod_data/postgres/* 2>/dev/null || true
        sudo rm -rf ./docker_prod_data/redis/* 2>/dev/null || true
        
        # 서비스 시작
        log_info "서비스 시작 중..."
        docker-compose -f docker-compose.yml --env-file $ENV_FILE up -d
        
        ;;
        
    "start")
        log_info "새로운 배포를 시작합니다... (빌드 없음)"
        
        # 서비스 시작
        docker-compose -f docker-compose.yml --env-file $ENV_FILE up -d
        
        ;;
esac

# 서비스 상태 확인
log_info "서비스 상태 확인 중..."
sleep 10

# 헬스 체크
log_info "애플리케이션 헬스 체크..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    if docker-compose -f docker-compose.yml --env-file $ENV_FILE exec app curl -f http://localhost:8080/actuator/health >/dev/null 2>&1; then
        log_success "애플리케이션이 정상적으로 시작되었습니다!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        log_error "애플리케이션 헬스 체크 실패"
        log_info "수동으로 확인하세요:"
        echo "  docker-compose -f docker-compose.prod.yml logs app"
        echo "  curl http://localhost/actuator/health"
        exit 1
    fi
    
    log_info "헬스 체크 시도 $attempt/$max_attempts..."
    sleep 2
    ((attempt++))
done

# 최종 상태 확인
log_info "현재 서비스 상태:"
docker-compose -f docker-compose.yml ps

log_success "===== 빠른 재배포 완료 ====="

# 접속 정보 표시
if [ -n "$DOMAIN_NAME" ] && [ "$ENABLE_HTTPS" = "true" ]; then
    log_info "HTTPS 접속 URL: https://$DOMAIN_NAME"
else
    log_info "HTTP 접속 URL: http://localhost"
fi

log_info "기본 계정: admin/admin"
echo ""
log_info "유용한 명령어:"
echo "  로그 확인: docker-compose -f docker-compose.prod.yml logs -f app"
echo "  컨테이너 상태: docker-compose -f docker-compose.prod.yml ps"
echo "  서비스 중지: docker-compose -f docker-compose.prod.yml down"
echo "  헬스 체크: curl http://localhost/actuator/health"

# JUnit 업로드 테스트 안내
echo ""
log_info "JUnit 파일 업로드 테스트:"
echo "  ./scripts/test-upload-setup.sh"