#!/bin/bash

# 자체 서명 SSL 인증서 생성 스크립트
# 실제 인증서가 있으면 이 스크립트 대신 실제 인증서를 사용하세요

# 환경변수 로드
source ../../.env

echo "🔐 자체 서명 SSL 인증서 생성 중..."

# OpenSSL 설정 파일 생성
cat > openssl.conf << EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C=${SSL_COUNTRY}
ST=${SSL_STATE}
L=${SSL_CITY}
O=${SSL_ORG}
OU=${SSL_UNIT}
CN=${SERVER_IP}

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = testcase.local
DNS.3 = api.testcase.local
IP.1 = 127.0.0.1
IP.2 = ${SERVER_IP}
EOF

# 개인키 생성
openssl genrsa -out key.pem 2048

# 인증서 서명 요청(CSR) 생성
openssl req -new -key key.pem -out cert.csr -config openssl.conf

# 자체 서명 인증서 생성 (1년 유효)
openssl x509 -req -in cert.csr -signkey key.pem -out cert.pem -days 365 -extensions v3_req -extfile openssl.conf

# 임시 파일 정리
rm cert.csr openssl.conf

# 권한 설정
chmod 600 key.pem
chmod 644 cert.pem

echo "✅ SSL 인증서 생성 완료!"
echo "📁 인증서 파일: $(pwd)/cert.pem"
echo "🔑 개인키 파일: $(pwd)/key.pem"
echo ""
echo "⚠️  자체 서명 인증서이므로 브라우저에서 보안 경고가 나타날 수 있습니다."
echo "🔧 실제 인증서가 있으면 cert.pem과 key.pem을 교체하세요."