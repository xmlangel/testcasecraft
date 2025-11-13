#!/bin/bash
# Build JAR inside Docker container with network access

set -e

echo "🔨 Building JAR file inside Docker container..."

# Use Gradle Docker image to build the JAR
docker run --rm \
  -v "$(pwd)":/project \
  -w /project \
  gradle:8.5-jdk21 \
  gradle clean bootJar --no-daemon

echo "✅ JAR built successfully!"

# Copy JAR to docker-compose directory
echo "📦 Copying JAR to docker-compose-dev-spring directory..."
cp build/libs/TestCaseCraft-*.jar docker-compose-dev-spring/app.jar

echo "✅ JAR copied successfully!"
echo "📋 JAR file info:"
ls -lh docker-compose-dev-spring/app.jar
