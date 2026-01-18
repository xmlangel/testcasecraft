# Test Case Management - Spring Boot Only Development Environment

Spring Boot 애플리케이션만 사용하는 간단한 개발 환경입니다. nginx를 사용하지 않고 Spring Boot가 프론트엔드와 백엔드를 모두 제공하며, HTTP와 HTTPS를 모두 지원합니다.

## 🏗️ 구성

- **Spring Boot Application**: 프론트엔드 + 백엔드 통합 서버
- **PostgreSQL**: 데이터베이스
- **HTTP/HTTPS Support**: 가변적 프로토콜 지원
- **SSL Certificate**: HTTPS 사용 시 인증서 지원
- **Custom Domain**: 도메인 설정 가능
- **No nginx**: 리버스 프록시 없음
- **No Redis**: 캐시 시스템 없음

## 🚀 시작하기

### 전제조건
- Docker 및 Docker Compose 설치
- Java keytool (HTTPS 사용 시 자체 서명 인증서 생성용)

### 🔧 설정 방법

#### 1. 기본 HTTP 실행 (포트 80)
```bash
# 간단한 HTTP 실행
./start-http.sh

# 접속: http://localhost
```

#### 2. 기본 HTTPS 실행 (포트 443)
```bash
# 자동 인증서 생성과 함께 HTTPS 실행
./start-https.sh

# 커스텀 도메인으로 HTTPS 실행
./start-https.sh test.com

# 접속: https://localhost 또는 https://test.com
```

#### 3. 커스텀 설정 실행
```bash
# .env 파일 수정 후
./start.sh
```

### 🔧 환경 설정 (.env 파일)

```bash
# Protocol Configuration (http or https)
PROTOCOL=http

# Server Configuration  
HTTP_PORT=80
HTTPS_PORT=443
DOMAIN=localhost

# SSL Configuration (HTTPS 전용)
SSL_KEYSTORE_PATH=/app/ssl/keystore.p12
SSL_KEYSTORE_PASSWORD=changeit
SSL_KEYSTORE_TYPE=PKCS12
```

## 📍 접속 정보

### HTTP 모드
| 서비스 | URL | 설명 |
|--------|-----|------|
| 애플리케이션 | http://localhost | 메인 웹 애플리케이션 |
| Swagger UI | http://localhost/swagger-ui.html | API 문서 |
| Health Check | http://localhost/actuator/health | 서비스 상태 확인 |

### HTTPS 모드  
| 서비스 | URL | 설명 |
|--------|-----|------|
| 애플리케이션 | https://localhost | 메인 웹 애플리케이션 |
| Swagger UI | https://localhost/swagger-ui.html | API 문서 |
| Health Check | https://localhost/actuator/health | 서비스 상태 확인 |

### 공통
| 서비스 | URL | 설명 |
|--------|-----|------|
| PostgreSQL | localhost:5433 | 데이터베이스 |

### 🔐 기본 로그인
- **Username**: `admin`
- **Password**: `admin`

## 🔒 SSL 인증서 설정

### HTTPS 사용을 위한 인증서 준비

HTTPS 모드로 실행하려면 `ssl/keystore.p12` 파일이 필요합니다.

#### 자동 생성 (권장)
```bash
# 자동으로 자체 서명 인증서 생성
./start-https.sh

# 커스텀 도메인용 인증서 생성
./start-https.sh test.com
```

#### 수동 생성
```bash
# localhost용 자체 서명 인증서
keytool -genkeypair -alias testcase -keyalg RSA -keysize 2048 \
        -storetype PKCS12 -keystore ssl/keystore.p12 \
        -dname "CN=localhost,OU=Dev,O=TestCase,L=Seoul,ST=Seoul,C=KR" \
        -storepass changeit -keypass changeit -validity 365

# 커스텀 도메인용 (예: test.com)
keytool -genkeypair -alias testcase -keyalg RSA -keysize 2048 \
        -storetype PKCS12 -keystore ssl/keystore.p12 \
        -dname "CN=test.com,OU=Dev,O=TestCase,L=Seoul,ST=Seoul,C=KR" \
        -storepass changeit -keypass changeit -validity 365
```

#### Let's Encrypt 인증서 사용 (운영용)
```bash
# Let's Encrypt로 발급받은 인증서를 PKCS12로 변환
openssl pkcs12 -export -in fullchain.pem -inkey privkey.pem \
               -out ssl/keystore.p12 -name testcase \
               -passout pass:changeit
```

### 포트 설정

기본 포트는 80(HTTP), 443(HTTPS)이며 변경 가능합니다:

```bash
# .env 파일에서 포트 변경
HTTP_PORT=8080    # HTTP 포트 변경
HTTPS_PORT=8443   # HTTPS 포트 변경
DOMAIN=test.com   # 도메인 변경
```

### 도메인 설정

커스텀 도메인 사용 시:

1. **.env 파일 설정**:
   ```bash
   DOMAIN=test.com
   ```

2. **인증서 생성** (도메인명과 일치해야 함):
   ```bash
   ./start-https.sh test.com
   ```

3. **hosts 파일 설정** (로컬 테스트용):
   ```bash
   # /etc/hosts 또는 C:\Windows\System32\drivers\etc\hosts
   127.0.0.1 test.com
   ```

## 🛠️ 개발 작업

### 로그 확인
```bash
# 모든 서비스 로그
docker-compose logs -f

# 애플리케이션 로그만
docker-compose logs -f app

# PostgreSQL 로그만
docker-compose logs -f postgres
```

### 데이터베이스 접속
```bash
# PostgreSQL 컨테이너 접속
docker-compose exec postgres psql -U testcase_user -d testcase_management
```

### 애플리케이션 재빌드
```bash
# 애플리케이션만 재빌드
docker-compose up -d --build app
```

## 🔍 트러블슈팅

### 자주 발생하는 문제

**포트 충돌**
```bash
# 포트 사용 중인 프로세스 확인 및 종료
lsof -ti:80 | xargs kill -9    # HTTP 포트
lsof -ti:443 | xargs kill -9   # HTTPS 포트
lsof -ti:5433 | xargs kill -9  # PostgreSQL 포트
```

**HTTPS 인증서 문제**
```bash
# 인증서 상태 확인
ls -la ssl/keystore.p12

# 인증서 정보 확인
keytool -list -keystore ssl/keystore.p12 -storepass changeit

# 인증서 재생성
rm ssl/keystore.p12
./start-https.sh
```

**데이터베이스 연결 실패**
```bash
# PostgreSQL 상태 확인
docker-compose exec postgres pg_isready -U testcase_user

# 데이터베이스 로그 확인
docker-compose logs postgres
```

**애플리케이션 시작 실패**
```bash
# 애플리케이션 로그 상세 확인
docker-compose logs app

# HTTP/HTTPS별 헬스체크
curl http://localhost/actuator/health      # HTTP 모드
curl -k https://localhost/actuator/health  # HTTPS 모드 (-k는 자체서명 인증서 허용)
```

**도메인 접속 문제**
```bash
# hosts 파일 확인 (로컬 도메인 매핑)
cat /etc/hosts | grep test.com

# DNS 확인
nslookup test.com
```

## 🆚 다른 환경과의 차이점

| 구성 요소 | docker-compose-dev | docker-compose-dev-spring |
|----------|-------------------|---------------------------|
| nginx | ✅ 사용 | ❌ 사용 안함 |
| Redis | ✅ 사용 | ❌ 사용 안함 |
| Spring Boot | ✅ 백엔드만 | ✅ 프론트+백엔드 |
| HTTPS 지원 | ✅ nginx SSL | ✅ Spring Boot SSL |
| 접속 포트 | 80/443 (nginx) | 80/443 (Spring Boot) |
| 도메인 지원 | ✅ nginx 설정 | ✅ 환경변수 |
| 복잡도 | 높음 | 중간 |

## 📝 장단점

### 장점
- **간단한 구성**: nginx 설정 없음
- **빠른 시작**: 컨테이너 수 최소화
- **개발 편의성**: 하나의 애플리케이션에서 모든 기능 제공
- **HTTP/HTTPS 지원**: 가변적 프로토콜 설정
- **커스텀 도메인**: 도메인명 설정 가능
- **리소스 절약**: 메모리 사용량 감소
- **자동 SSL**: 자체 서명 인증서 자동 생성

### 단점
- **확장성 제한**: 정적 파일 캐싱 없음
- **성능**: nginx보다 정적 파일 서비스 성능 낮음
- **인증서 관리**: 자체 서명 인증서 브라우저 경고