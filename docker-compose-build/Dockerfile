# Development Dockerfile - builds and runs the application
# 보안: JRE 베이스 사용 — JDK 가 동봉하는 binutils(HIGH CVE 3건, alpine fix 없음) 제거 + 이미지 축소
FROM eclipse-temurin:21-jre-alpine

# 보안: curl(HIGH CVE 2건, alpine fix 없음) 미설치 — 헬스체크는 busybox wget 사용
# dumb-init for proper signal handling and create a non-root user
RUN apk update && \
    apk upgrade --no-cache && \
    apk add --no-cache dumb-init && \
    addgroup -S appgroup -g 1001 && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# Create necessary directories and set permissions
# /app/data: JWT_SECRET 자동 생성 시 시크릿 영속화 디렉토리 (볼륨 마운트 권장)
RUN mkdir -p /app/uploads /app/uploads/junit /app/logs /app/ssl /app/data /var/log/testcase && \
    chown -R appuser:appgroup /app /var/log/testcase && \
    chmod -R 755 /app/uploads /app/logs /app/ssl /var/log/testcase && \
    chmod 700 /app/data

# Copy the pre-built JAR file from current directory
# JAR file is copied here by the start.sh script
COPY --chown=appuser:appgroup app.jar app.jar
COPY --chown=appuser:appgroup --chmod=755 docker-entrypoint.sh /app/docker-entrypoint.sh

# Switch to non-root user
USER appuser

# Health check (busybox wget — curl 미설치)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -q -O /dev/null http://localhost:80/actuator/health || \
    wget -q --no-check-certificate -O /dev/null https://localhost:443/actuator/health || exit 1

# Use dumb-init for proper signal handling; entrypoint generates/persists
# JWT_SECRET when not provided (see docker-entrypoint.sh)
ENTRYPOINT ["dumb-init", "--", "/app/docker-entrypoint.sh"]

# Run the application
CMD ["java", "-jar", "app.jar"]
