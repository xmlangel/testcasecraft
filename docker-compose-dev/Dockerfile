# Production Dockerfile - runs a pre-built JAR
FROM openjdk:21-jdk-slim

# Install dumb-init for proper signal handling and create a non-root user
RUN apt-get update && \
    apt-get install -y dumb-init && \
    rm -rf /var/lib/apt/lists/* && \
    groupadd --system --gid 1001 appgroup && \
    useradd --system --uid 1001 --gid appgroup appuser

WORKDIR /app

# Create necessary directories and set permissions
RUN mkdir -p /app/uploads /app/uploads/junit /app/logs /var/log/testcase && \
    chown -R appuser:appgroup /app /var/log/testcase && \
    chmod -R 755 /app/uploads /app/logs /var/log/testcase

# Copy the pre-built JAR file from the project's build output directory
# The path is relative to the Dockerfile location in docker-compose-prod/
COPY --chown=appuser:appgroup TestCaseCraft-0.0.2-SNAPSHOT.jar app.jar