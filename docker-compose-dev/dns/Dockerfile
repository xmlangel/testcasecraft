FROM alpine:latest

# dnsmasq 설치
RUN apk add --no-cache dnsmasq

# 설정 파일 복사
COPY config/dnsmasq.conf /etc/dnsmasq.conf

# DNS 포트 노출
EXPOSE 53/udp 53/tcp

# dnsmasq 실행
CMD ["dnsmasq", "--no-daemon", "--log-queries", "--log-facility=-"]