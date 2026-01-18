# SSL Certificate Directory

HTTPS를 사용하려면 이 디렉토리에 SSL 인증서를 배치해야 합니다.

## 필수 파일

HTTPS 모드로 실행하려면 다음 파일이 필요합니다:

```
ssl/
└── keystore.p12    # PKCS12 형식의 keystore 파일
```

## 인증서 생성 방법

### 1. 자체 서명 인증서 생성 (개발용)

```bash
# 개발용 자체 서명 인증서 생성
keytool -genkeypair -alias testcase -keyalg RSA -keysize 2048 \
        -storetype PKCS12 -keystore ssl/keystore.p12 \
        -dname "CN=localhost,OU=Dev,O=TestCase,L=Seoul,ST=Seoul,C=KR" \
        -storepass changeit -keypass changeit \
        -validity 365

# 도메인 사용시 (예: test.com)
keytool -genkeypair -alias testcase -keyalg RSA -keysize 2048 \
        -storetype PKCS12 -keystore ssl/keystore.p12 \
        -dname "CN=test.com,OU=Dev,O=TestCase,L=Seoul,ST=Seoul,C=KR" \
        -storepass changeit -keypass changeit \
        -validity 365
```

### 2. Let's Encrypt 인증서 사용 (운영용)

```bash
# 1. Let's Encrypt로 인증서 발급받기
certbot certonly --standalone -d your-domain.com

# 2. PKCS12 형식으로 변환
openssl pkcs12 -export -in /etc/letsencrypt/live/your-domain.com/fullchain.pem \
               -inkey /etc/letsencrypt/live/your-domain.com/privkey.pem \
               -out ssl/keystore.p12 \
               -name testcase \
               -passout pass:changeit
```

### 3. 기존 인증서 변환

```bash
# PEM 형식을 PKCS12로 변환
openssl pkcs12 -export -in certificate.crt -inkey private.key \
               -out ssl/keystore.p12 -name testcase \
               -passout pass:changeit
```

## 비밀번호 변경

기본 비밀번호(`changeit`)를 변경하려면:

1. `.env` 파일에서 `SSL_KEYSTORE_PASSWORD` 수정
2. 인증서 생성시 `-storepass` 및 `-keypass` 값 변경

## 보안 주의사항

⚠️ **중요**: 운영환경에서는 반드시 강력한 비밀번호 사용
⚠️ **주의**: SSL 인증서 파일은 Git에 커밋하지 마세요
⚠️ **권장**: 정기적인 인증서 갱신 (90일마다)