# Docker Compose Development Environment with Nginx

이 디렉토리는 Nginx 리버스 프록시와 PostgreSQL을 포함한 완전한 개발 환경을 제공합니다.

## 🏗️ 구성 요소

- **Nginx**: 리버스 프록시, HTTPS 지원, CORS 처리
- **PostgreSQL**: 데이터베이스 서버
- **SSL 인증서**: 자체 서명 또는 실제 인증서 지원

## 📁 파일 구조

```
docker-compose-dev/
├── docker-compose.yml    # Docker Compose 설정
├── .env                  # 환경 변수
├── manage.sh            # 관리 스크립트
├── nginx/
│   ├── conf/
│   │   └── nginx.conf   # Nginx 설정
│   └── ssl/
│       ├── generate-cert.sh  # 인증서 생성 스크립트
│       ├── cert.pem     # SSL 인증서 (생성됨)
│       └── key.pem      # SSL 개인키 (생성됨)
└── postgres_data/       # PostgreSQL 데이터
```

## 🚀 사용법

### 1. 환경 시작
```bash
# 디렉토리 이동
cd docker-compose-dev

# 서비스 시작 (SSL 인증서 자동 생성)
./manage.sh start
```

### 2. 접속 URL
- **HTTP**: http://192.168.1.120 (HTTPS로 자동 리다이렉트)
- **HTTPS**: https://192.168.1.120
- **API**: https://192.168.1.120/api/
- **데이터베이스**: localhost:5433

### 3. 기타 명령어
```bash
# 서비스 상태 확인
./manage.sh status

# 서비스 재시작
./manage.sh restart

# 서비스 중지
./manage.sh stop

# SSL 인증서 재생성
./manage.sh ssl-cert

# 로그 확인
./manage.sh logs
```

## 🔐 SSL 인증서 설정

### 자체 서명 인증서 (기본)
- 자동으로 생성됩니다
- 브라우저에서 보안 경고가 나타날 수 있습니다

### 실제 인증서 사용
1. 인증서 파일을 `nginx/ssl/` 디렉토리에 복사:
   ```bash
   cp your-cert.pem nginx/ssl/cert.pem
   cp your-key.pem nginx/ssl/key.pem
   ```

2. 서비스 재시작:
   ```bash
   ./manage.sh restart
   ```

## 🌐 네트워크 설정

### IP 주소 변경
`.env` 파일에서 `SERVER_IP` 값을 수정:
```bash
SERVER_IP=192.168.1.120  # 원하는 IP로 변경
```

### 포트 변경
`.env` 파일에서 포트 설정:
```bash
NGINX_HTTP_PORT=80       # HTTP 포트
NGINX_HTTPS_PORT=443     # HTTPS 포트
POSTGRES_DEV_PORT=5433   # PostgreSQL 포트
```

## 🔧 Nginx 설정

- **CORS**: 모든 도메인 허용 (`*`)
- **리버스 프록시**: Spring Boot 애플리케이션 (8080 포트) 연동
- **HTTP → HTTPS**: 자동 리다이렉트
- **API 라우팅**: `/api/*` 요청을 백엔드로 전달
- **정적 파일**: 캐싱 및 압축 지원

## 🐛 문제 해결

### 1. 포트 충돌
```bash
# 사용 중인 포트 확인
sudo lsof -i :80
sudo lsof -i :443

# Docker 서비스 중지
./manage.sh stop
```

### 2. SSL 인증서 문제
```bash
# 인증서 재생성
./manage.sh ssl-cert
```

### 3. 백엔드 연결 문제
- Spring Boot 애플리케이션이 8080 포트에서 실행 중인지 확인
- `host.docker.internal` 접근 가능 여부 확인

### 4. 로그 확인
```bash
# Nginx 로그
docker compose logs nginx

# 전체 로그
./manage.sh logs
```

## 📋 환경 변수

`.env` 파일의 주요 설정:
```bash
# 네트워크
SERVER_IP=192.168.1.120
SERVER_PORT=8080

# 포트
NGINX_HTTP_PORT=80
NGINX_HTTPS_PORT=443

# 데이터베이스
POSTGRES_DB=testcase_management
POSTGRES_USER=testcase_user
POSTGRES_PASSWORD=testcase_password
POSTGRES_DEV_PORT=5433

# SSL 인증서 경로
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
```

## ⚠️ 주의사항

1. **자체 서명 인증서**: 브라우저에서 보안 경고가 표시됩니다
2. **방화벽**: 80, 443 포트가 열려있어야 합니다
3. **IP 주소**: 실제 네트워크 환경에 맞게 설정해야 합니다
4. **백엔드 연동**: Spring Boot 애플리케이션이 먼저 실행되어야 합니다