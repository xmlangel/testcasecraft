# 🚀 Production Deployment Guide

Test Case Management 애플리케이션의 프로덕션 배포 가이드입니다.

## 📋 목차

1. [사전 준비사항](#사전-준비사항)
2. [HTTP 배포 (빠른 시작)](#http-배포-빠른-시작)
3. [HTTPS 배포 (권장)](#https-배포-권장)
4. [도메인 설정](#도메인-설정)
5. [모니터링 및 관리](#모니터링-및-관리)
6. [문제 해결](#문제-해결)
7. [업데이트 및 백업](#업데이트-및-백업)

## 🔧 사전 준비사항

### 시스템 요구사항
- **OS**: Ubuntu 20.04+ / CentOS 8+ / RHEL 8+
- **RAM**: 최소 4GB, 권장 8GB+
- **Storage**: 최소 20GB, 권장 50GB+
- **CPU**: 최소 2 cores, 권장 4 cores+

### 필수 소프트웨어 설치

```bash
# Docker 설치
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 방화벽 설정 (Ubuntu/Debian)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# 방화벽 설정 (CentOS/RHEL)
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

### 도메인 DNS 설정
배포하기 전에 도메인의 A 레코드가 서버 IP를 가리키도록 설정하세요:
```
qaspecialist.uk    A    YOUR_SERVER_IP
xmlangel.uk        A    YOUR_SERVER_IP
```

## 🌐 HTTP 배포 (빠른 시작)

HTTPS 없이 빠르게 테스트해보고 싶은 경우 사용합니다.

### 1. 환경 설정

```bash
# 환경 파일 생성
cp .env.http.example .env.http

# 환경 파일 편집
vi .env.http
```

**중요 설정 항목:**
```bash
DOMAIN_NAME=your-domain.com           # 실제 도메인으로 변경
ENABLE_HTTPS=false                    # HTTP 모드
POSTGRES_PASSWORD=강력한패스워드123      # 데이터베이스 비밀번호
REDIS_PASSWORD=강력한레디스패스워드123    # Redis 비밀번호
JWT_SECRET=매우긴JWT시크릿키여기에입력   # JWT 시크릿 (64자 이상)
JIRA_ENCRYPTION_KEY=5CBRv5FwesBJkQ7ecX1KGCxyUQTcnE1CkkGBYDswb2Y=  # JIRA API 토큰 암호화 키
```

### 2. 배포 실행

```bash
# 배포 스크립트 실행
./deploy-http.sh
```

### 3. 접속 확인

```bash
# 헬스 체크
curl http://your-domain.com/health

# 애플리케이션 접속
# 브라우저에서 http://your-domain.com 접속
# 기본 계정: admin/admin
```

## 🔒 HTTPS 배포 (권장)

Let's Encrypt SSL 인증서를 사용한 보안 배포입니다.

### 1. 환경 설정

```bash
# 환경 파일 생성
cp .env.prod.example .env.prod

# 환경 파일 편집
vi .env.prod
```

**필수 설정 항목:**
```bash
DOMAIN_NAME=qaspecialist.uk           # 메인 도메인
ENABLE_HTTPS=true                     # HTTPS 활성화
CERTBOT_EMAIL=admin@qaspecialist.uk   # Let's Encrypt 이메일
POSTGRES_PASSWORD=매우강력한패스워드123
REDIS_PASSWORD=매우강력한레디스패스워드123
JWT_SECRET=512비트이상의매우긴JWT시크릿키를여기에입력하세요
JIRA_ENCRYPTION_KEY=5CBRv5FwesBJkQ7ecX1KGCxyUQTcnE1CkkGBYDswb2Y=  # JIRA API 토큰 암호화 키
```

### 2. 도메인 확인

배포 전에 도메인이 올바르게 설정되었는지 확인:

```bash
# DNS 설정 확인
nslookup qaspecialist.uk
dig qaspecialist.uk

# 포트 접근 확인
telnet qaspecialist.uk 80
telnet qaspecialist.uk 443
```

### 3. HTTPS 배포 실행

```bash
# HTTPS 배포 스크립트 실행
./deploy-https.sh
```

배포 과정:
1. **1단계**: HTTP로 임시 시작
2. **2단계**: Let's Encrypt 인증서 발급
3. **3단계**: HTTPS 설정으로 전환

### 4. SSL 인증서 자동 갱신

```bash
# Cron 작업 설정
crontab -e

# 매월 1일 새벽 3시에 인증서 갱신
0 3 1 * * /path/to/your/project/ssl-renew.sh >> /path/to/your/project/ssl-renew.log 2>&1
```

## 🌍 도메인 설정

### 단일 도메인 설정
```bash
DOMAIN_NAME=qaspecialist.uk
EXTRA_DOMAINS=
```

### 다중 도메인 설정
```bash
DOMAIN_NAME=qaspecialist.uk
EXTRA_DOMAINS=xmlangel.uk www.qaspecialist.uk
CERTBOT_EXTRA_DOMAINS=-d xmlangel.uk -d www.qaspecialist.uk
```

### 서브도메인 설정
```bash
DOMAIN_NAME=testcase.qaspecialist.uk
```

## 📊 모니터링 및 관리

### 서비스 상태 확인

```bash
# 모든 컨테이너 상태 확인
docker-compose -f docker-compose.yml ps

# 특정 서비스 로그 확인
docker-compose -f docker-compose.yml logs -f app
docker-compose -f docker-compose.yml logs -f nginx
docker-compose -f docker-compose.yml logs -f postgres
docker-compose -f docker-compose.yml logs -f redis

# 실시간 로그 모니터링
docker-compose -f docker-compose.yml logs -f
```

### 시스템 리소스 모니터링

```bash
# 컨테이너 리소스 사용량
docker stats

# 디스크 사용량
df -h
docker system df

# 메모리 사용량
free -h

# 네트워크 연결 상태
netstat -tlnp | grep :80
netstat -tlnp | grep :443
```

### 데이터베이스 관리

```bash
# PostgreSQL 접속
docker-compose -f docker-compose.yml exec postgres psql -U testcase_user -d testcase_management

# 데이터베이스 백업
docker-compose -f docker-compose.yml exec postgres pg_dump -U testcase_user testcase_management > backup_$(date +%Y%m%d_%H%M%S).sql

# 데이터베이스 복원
docker-compose -f docker-compose.yml exec -T postgres psql -U testcase_user -d testcase_management < backup_file.sql
```

### Redis 관리

```bash
# Redis 접속
docker-compose -f docker-compose.yml exec redis redis-cli -a $REDIS_PASSWORD

# Redis 상태 확인
docker-compose -f docker-compose.yml exec redis redis-cli -a $REDIS_PASSWORD info

# 캐시 초기화
docker-compose -f docker-compose.yml exec redis redis-cli -a $REDIS_PASSWORD flushall
```

## 🔧 문제 해결

### 일반적인 문제들

#### 1. 서비스가 시작되지 않는 경우

```bash
# 로그 확인
docker-compose -f docker-compose.yml logs

# 포트 충돌 확인
sudo lsof -i :80
sudo lsof -i :443

# 권한 문제 확인
ls -la uploads_data/
sudo chown -R 1001:1001 uploads_data/
```

#### 2. SSL 인증서 발급 실패

```bash
# DNS 설정 재확인
nslookup $DOMAIN_NAME

# 방화벽 설정 확인
sudo ufw status
sudo firewall-cmd --list-all

# 수동으로 인증서 발급 시도
docker run --rm \
    -v "$(pwd)/certbot/www:/var/www/certbot" \
    -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
    certbot/certbot certonly \
    --webroot --webroot-path=/var/www/certbot \
    --email $CERTBOT_EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN_NAME \
    --dry-run
```

#### 3. 데이터베이스 연결 오류

```bash
# PostgreSQL 컨테이너 상태 확인
docker-compose -f docker-compose.yml exec postgres pg_isready

# 연결 테스트
docker-compose -f docker-compose.yml exec postgres psql -U testcase_user -d testcase_management -c "SELECT 1;"

# 환경변수 확인
docker-compose -f docker-compose.yml exec app env | grep -i postgres
```

#### 4. 성능 문제

```bash
# 메모리 사용량 확인
docker stats --no-stream

# 로그에서 느린 쿼리 확인
docker-compose -f docker-compose.yml logs app | grep -i "slow"

# Redis 메모리 사용량 확인
docker-compose -f docker-compose.yml exec redis redis-cli -a $REDIS_PASSWORD info memory
```

### 응급 복구 절차

#### 전체 서비스 재시작
```bash
docker-compose -f docker-compose.yml restart
```

#### 특정 서비스만 재시작
```bash
docker-compose -f docker-compose.yml restart app
docker-compose -f docker-compose.yml restart nginx
```

#### 데이터 손실 없이 재배포
```bash
# 애플리케이션만 다시 빌드
docker-compose -f docker-compose.yml up -d --build app

# Nginx만 재시작
docker-compose -f docker-compose.yml restart nginx
```

## 📦 업데이트 및 백업

### 애플리케이션 업데이트

```bash
# 1. 현재 상태 백업
docker-compose -f docker-compose.yml exec postgres pg_dump -U testcase_user testcase_management > backup_before_update_$(date +%Y%m%d_%H%M%S).sql

# 2. 새 코드 가져오기
git pull origin main

# 3. 새 이미지 빌드 및 배포
docker-compose -f docker-compose.yml up -d --build app

# 4. 서비스 확인
curl -f https://$DOMAIN_NAME/health
```

### 정기 백업 설정

```bash
# 백업 스크립트 생성
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# 데이터베이스 백업
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U testcase_user testcase_management > $BACKUP_DIR/db_backup_$DATE.sql

# 파일 백업
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz uploads_data/

# 오래된 백업 삭제 (30일 이상)
find $BACKUP_DIR -name "*.sql" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
EOF

chmod +x backup.sh

# Cron 작업 설정 (매일 새벽 2시)
echo "0 2 * * * /path/to/your/project/backup.sh >> /path/to/your/project/backup.log 2>&1" | crontab -
```

## 🔗 유용한 명령어 모음

### 서비스 관리
```bash
# 서비스 시작
docker-compose -f docker-compose.yml up -d

# 서비스 중지
docker-compose -f docker-compose.yml down

# 서비스 재시작
docker-compose -f docker-compose.yml restart

# 볼륨까지 완전 삭제
docker-compose -f docker-compose.yml down -v
```

### 로그 및 모니터링
```bash
# 실시간 로그
docker-compose -f docker-compose.yml logs -f

# 특정 서비스 로그
docker-compose -f docker-compose.yml logs app nginx postgres redis

# 컨테이너 내부 접속
docker-compose -f docker-compose.yml exec app bash
docker-compose -f docker-compose.yml exec postgres bash
```

### 디버깅
```bash
# 네트워크 상태 확인
docker network ls
docker network inspect testcase-network

# 볼륨 상태 확인
docker volume ls
docker volume inspect testcase_postgres_data

# 이미지 상태 확인
docker images
docker image inspect testcase_app
```

## 📞 지원 및 연락처

문제가 발생하거나 도움이 필요한 경우:

1. **로그 파일 확인**: `docker-compose logs`로 상세한 오류 정보 확인
2. **GitHub Issues**: 프로젝트 리포지토리의 Issues 섹션에 문제 보고
3. **문서 참조**: `CLAUDE.md` 파일의 추가 설정 정보 확인

---

**🎉 배포 완료 후 확인사항:**
- [ ] 웹 브라우저에서 도메인 접속 확인
- [ ] HTTPS 인증서 정상 작동 확인 (HTTPS 배포시)
- [ ] 관리자 계정(admin/admin)으로 로그인 확인
- [ ] 기본 기능 동작 확인 (프로젝트 생성, 테스트케이스 관리 등)
- [ ] 자동 백업 및 SSL 갱신 Cron 설정 완료