# Development Dockerfile - builds and runs the application
# 보안: JRE 베이스 사용 — JDK 가 동봉하는 binutils(HIGH CVE 3건, alpine fix 없음) 제거 + 이미지 축소
FROM eclipse-temurin:21-jre-alpine

# 보안: curl(HIGH CVE 2건, alpine fix 없음) 미설치 — 헬스체크는 busybox wget 사용
# `apk update` 는 뺀다 — --no-cache 가 어차피 인덱스를 새로 받고,
# update 가 남긴 /var/cache/apk 만 레이어에 그대로 굳는다.
# dumb-init for proper signal handling and create a non-root user
# gnupg 제거 — alpine 에 fix 가 없어 재빌드로는 안 사라지는 CVE 4건을 한 번에 턴다.
#
# 베이스(adoptium/containers 21/jre/alpine/3.23)가 gnupg 를 넣는 이유는 딱 하나,
# "gnupg required to verify the signature" — JDK 다운로드 서명을 **이미지 빌드 시점에**
# 검증하기 위해서다. 검증은 이미 끝났고 런타임에는 쓰이지 않는다.
# gnupg 가 딸고 들어오는 것들이 스캔에 잡힌 나머지다:
#   sqlite-libs  CVE-2026-11824 / CVE-2026-11822 (HIGH 8.5) — gnupg TOFU 신뢰DB용
#   libgcrypt    CVE-2026-41989 (MEDIUM 6.7)
#   gnupg        CVE-2025-30258 (LOW)
# apk 가 고아가 된 의존성을 함께 정리하므로 gnupg 하나만 지정한다.
# (앱은 PostgreSQL 을 쓰고 sqlite 를 타는 코드 경로가 없다)
#
# coreutils 는 남긴다 — 베이스가 CA 인증서 동기화의 csplit 용도로 명시적으로 넣은 것이라
# 지우면 인증서 처리가 깨진다. CVE-2016-2781 은 chroot --userspec 관련으로 실사용 경로가 없다.
#
# 마지막 java -version / command -v 는 가드다. 삭제가 런타임을 깨뜨렸다면
# 깨진 이미지를 푸시하지 말고 이 RUN 에서 빌드를 실패시킨다.
RUN apk upgrade --no-cache && \
    apk add --no-cache dumb-init && \
    apk del --purge gnupg && \
    java -version && \
    command -v wget > /dev/null && \
    command -v sh > /dev/null && \
    addgroup -S appgroup -g 1001 && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# 쓰기가 필요한 디렉터리만 appuser 소유로 둔다. /app 자체는 root:root 유지 —
# 디렉터리에 쓰기 권한이 있으면 파일 퍼미션과 무관하게 unlink 후 재생성이 되므로,
# /app 을 통째로 chown 하면 런타임 유저가 app.jar 를 갈아끼울 수 있다.
# /app/data: JWT_SECRET 자동 생성 시 시크릿 영속화 디렉토리 (볼륨 마운트 권장)
# /app/ssl : TLS 개인키가 놓이는 자리라 0700 (기존 0755 는 컨테이너 내 타 계정에 노출)
RUN mkdir -p /app/uploads/junit /app/logs /app/ssl /app/data /var/log/testcase && \
    chown -R appuser:appgroup /app/uploads /app/logs /app/ssl /app/data /var/log/testcase && \
    chmod 755 /app/uploads /app/uploads/junit /app/logs /var/log/testcase && \
    chmod 700 /app/ssl /app/data

# Copy the pre-built JAR file from current directory
# JAR file is copied here by the start.sh script
#
# 애플리케이션 코드는 root 소유 + 런타임 유저에겐 읽기/실행만 준다.
# 앱이 자기 코드를 덮어쓸 수 없어야 임의쓰기 취약점이 재기동 뒤까지 살아남지 못한다.
COPY --chown=root:root --chmod=444 app.jar app.jar
COPY --chown=root:root --chmod=555 docker-entrypoint.sh /app/docker-entrypoint.sh

# Switch to non-root user
USER appuser

# Health check (busybox wget — curl 미설치)
# 80/443 은 호스트 퍼블리시 포트고 컨테이너 안에서 앱이 듣는 건 SERVER_PORT(기본 8080)다.
# 하드코딩된 80/443 으로는 항상 실패해서, compose 가 healthcheck 를 덮어쓰지 않는
# 단독 실행(docker run)에서는 컨테이너가 영구 unhealthy 로 남았다.
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -q -O /dev/null "http://localhost:${SERVER_PORT:-8080}/actuator/health" || \
    wget -q --no-check-certificate -O /dev/null "https://localhost:${SERVER_PORT:-8080}/actuator/health" || exit 1

# Use dumb-init for proper signal handling; entrypoint generates/persists
# JWT_SECRET when not provided (see docker-entrypoint.sh)
ENTRYPOINT ["dumb-init", "--", "/app/docker-entrypoint.sh"]

# Run the application
CMD ["java", "-jar", "app.jar"]
