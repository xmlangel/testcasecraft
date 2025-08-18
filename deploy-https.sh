#!/bin/bash

# ===================================
# HTTPS 배포 스크립트 (Let's Encrypt)
# ===================================
# Let's Encrypt SSL 인증서를 사용한 HTTPS로 애플리케이션 배포

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

log_info "HTTPS 애플리케이션 배포를 시작합니다..."

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
required_vars=("DOMAIN_NAME" "CERTBOT_EMAIL" "POSTGRES_PASSWORD" "REDIS_PASSWORD" "JWT_SECRET" "JIRA_ENCRYPTION_KEY")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        log_error "필수 환경 변수 $var 가 설정되지 않았습니다."
        exit 1
    fi
done

# HTTPS 활성화 확인
if [ "$ENABLE_HTTPS" != "true" ]; then
    log_error "ENABLE_HTTPS=true로 설정해야 합니다."
    exit 1
fi

# Docker 및 Docker Compose 확인
if ! command -v docker &> /dev/null; then
    log_error "Docker 가 설치되지 않았습니다."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose 가 설치되지 않았습니다."
    exit 1
fi

# 도메인 DNS 확인
log_info "도메인 DNS 설정을 확인합니다..."
if ! nslookup $DOMAIN_NAME > /dev/null 2>&1; then
    log_warning "도메인 $DOMAIN_NAME 의 DNS 설정을 확인할 수 없습니다."
    read -p "계속 진행하시겠습니까? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 기존 컨테이너 정리 여부 확인 (선택사항)
read -p "기존 애플리케이션을 종료하고 재배포하시겠습니까? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "기존 컨테이너를 정리합니다..."
    docker-compose -f docker-compose.prod.yml --env-file $ENV_FILE down -v || true
fi

# HTTPS 설정 및 배포
log_info "HTTPS 설정 및 배포를 시작합니다..."

# Nginx HTTPS 설정 생성
log_info "Nginx HTTPS 설정을 생성합니다..."
envsubst '${DOMAIN_NAME},${EXTRA_DOMAINS}' < nginx/conf.d/https.conf.template > nginx/conf.d/default.conf

# 이미지 빌드
log_info "Docker 이미지를 빌드합니다..."
docker-compose -f docker-compose.prod.yml --env-file $ENV_FILE build --no-cache

# 1단계: HTTP로 시작 (Let's Encrypt 인증서 발급 위해)
log_info "1단계: HTTP로 임시 시작합니다..."

# 임시 HTTP 설정
cp nginx/conf.d/default.conf nginx/conf.d/default.conf.backup
cat > nginx/conf.d/default.conf << 'EOF'
server {
    listen 80;
    server_name _;
    
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
        try_files $uri =404;
    }

    location / {
        proxy_pass http://app_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# 서비스 시작 (certbot 제외)
log_info "애플리케이션 서비스를 시작합니다..."
docker-compose -f docker-compose.prod.yml --env-file $ENV_FILE up -d postgres redis app nginx

# 서비스 준비 대기 및 상태 확인을 위한 대기
log_info "서비스 준비 대기 및 상태 확인을 위한 대기합니다..."
sleep 30

# Let's Encrypt 인증서 발급
log_info "2단계: Let's Encrypt 인증서를 발급합니다..."

# Certbot 도메인 옵션 명령어 생성
CERTBOT_DOMAINS="-d $DOMAIN_NAME"
if [ ! -z "$EXTRA_DOMAINS" ]; then
    for domain in $EXTRA_DOMAINS; do
        CERTBOT_DOMAINS="$CERTBOT_DOMAINS -d $domain"
    done
fi

# 인증서 발급
docker run --rm \
    -v "$(pwd)/certbot/www:/var/www/certbot" \
    -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
    certbot/certbot certonly \
    --webroot --webroot-path=/var/www/certbot \
    --email $CERTBOT_EMAIL \
    --agree-tos \
    --no-eff-email \
    $CERTBOT_DOMAINS

if [ $? -ne 0 ]; then
    log_error "SSL 인증서 발급에 실패했습니다."
    log_info "도메인 DNS 설정과 방화벽 설정을 확인하세요."
    exit 1
fi

log_success "SSL 인증서 발급 완료!"

# 3단계: HTTPS 설정으로 전환
log_info "3단계: HTTPS 설정으로 전환합니다..."

# HTTPS 설정 복원
mv nginx/conf.d/default.conf.backup nginx/conf.d/default.conf

# Nginx 재시작
log_info "Nginx를 HTTPS 설정으로 재시작합니다..."
docker-compose -f docker-compose.prod.yml --env-file $ENV_FILE restart nginx

# 상태 점검
log_info "HTTPS 애플리케이션 상태 점검을 수행합니다..."
max_attempts=30
attempt=1

while [ $attempt -le $max_attempts ]; do
    log_info "HTTPS 상태 점검 시도 $attempt/$max_attempts..."
    
    if curl -f -k https://$DOMAIN_NAME/health > /dev/null 2>&1; then
        log_success "HTTPS 애플리케이션이 정상적으로 시작되었습니다!"
        break
    fi
    
    if [ $attempt -eq $max_attempts ]; then
        log_error "HTTPS 애플리케이션 시작에 실패했습니다."
        log_info "로그를 확인하세요:"
        echo "docker-compose -f docker-compose.prod.yml logs nginx"
        exit 1
    fi
    
    sleep 10
    ((attempt++))
done

# SSL 인증서 자동 갱신 스크립트 생성
log_info "SSL 인증서 자동 갱신 스크립트를 생성합니다..."
cat > ssl-renew.sh << 'EOF'
#!/bin/bash
# SSL 인증서 자동 갱신 스크립트

docker run --rm \
    -v "$(pwd)/certbot/www:/var/www/certbot" \
    -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
    certbot/certbot renew --quiet

if [ $? -eq 0 ]; then
    echo "$(date): SSL 인증서 갱신 완료"
    docker-compose -f docker-compose.prod.yml restart nginx
else
    echo "$(date): SSL 인증서 갱신 실패"
fi
EOF

chmod +x ssl-renew.sh

log_info "Cron 스케줄로 자동 갱신을 설정하려면 다음 명령어를 실행하세요:"
echo "crontab -e"
echo "# 매월 1일 새벽 3시에 인증서 갱신"
echo "0 3 1 * * $(pwd)/ssl-renew.sh >> $(pwd)/ssl-renew.log 2>&1"

# 현재 서비스 상태
log_info "현재 서비스 상태:"
docker-compose -f docker-compose.prod.yml ps

log_success "===== HTTPS 애플리케이션 배포 완료 ====="
log_info "HTTPS 접속 URL: https://$DOMAIN_NAME"
log_info "HTTP는 HTTPS로 자동 리다이렉트됩니다"
log_info "기본 계정 정보: admin/admin"
log_info ""
log_info "유용한 명령어:"
echo "  서비스 로그 확인: docker-compose -f docker-compose.prod.yml logs -f"
echo "  서비스 정지: docker-compose -f docker-compose.prod.yml down"
echo "  서비스 재시작: docker-compose -f docker-compose.prod.yml restart"
echo "  SSL 인증서 수동 갱신: ./ssl-renew.sh"