# Development Dockerfile - builds and runs the application
FROM eclipse-temurin:21-jdk-alpine

# Install curl for health checks, dumb-init for proper signal handling and create a non-root user
# Alpine uses apk instead of apt-get
RUN apk update && \
    apk upgrade --no-cache && \
    apk add --no-cache curl dumb-init && \
    addgroup -S appgroup -g 1001 && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# Create necessary directories and set permissions
RUN mkdir -p /app/uploads /app/uploads/junit /app/logs /app/ssl /var/log/testcase && \
    chown -R appuser:appgroup /app /var/log/testcase && \
    chmod -R 755 /app/uploads /app/logs /app/ssl /var/log/testcase

# Copy the pre-built JAR file from current directory
# JAR file is copied here by the start.sh script
COPY --chown=appuser:appgroup app.jar app.jar

# Switch to non-root user
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f -k http://localhost:80/actuator/health || \
    curl -f -k https://localhost:443/actuator/health || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

# Run the application
CMD ["java", "-jar", "app.jar"]
