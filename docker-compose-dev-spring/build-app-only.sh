#!/bin/bash

#############################################
# Build Main Application Image Only
# Platform: linux/amd64, linux/arm64
# Image: xmlangel/testcasecraft:1.0.0
#############################################

set -e

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

VERSION="1.0.0"
DOCKER_USERNAME="xmlangel"
APP_IMAGE="${DOCKER_USERNAME}/testcasecraft"
PLATFORMS="linux/amd64,linux/arm64"

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  Build Main Application Image Only    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Build JAR
echo -e "${BLUE}[1/3] Building JAR file...${NC}"
cd ..
./gradlew clean build -x test

JAR_FILE=$(find build/libs -name "*.jar" -not -name "*-plain.jar" | head -1)
if [ ! -f "$JAR_FILE" ]; then
    echo -e "${RED}❌ JAR file not found${NC}"
    exit 1
fi

cp "$JAR_FILE" "docker-compose-dev-spring/app.jar"
echo -e "${GREEN}✅ JAR file ready${NC}"

# Step 2: Build Docker image
echo -e "${BLUE}[2/3] Building Docker image for platforms: $PLATFORMS${NC}"
cd docker-compose-dev-spring

docker buildx build \
    --platform "$PLATFORMS" \
    --tag "$APP_IMAGE:$VERSION" \
    --tag "$APP_IMAGE:latest" \
    --push \
    --file Dockerfile \
    .

echo -e "${GREEN}✅ Image built and pushed${NC}"

# Step 3: Cleanup
echo -e "${BLUE}[3/3] Cleaning up...${NC}"
rm -f app.jar
echo -e "${GREEN}✅ Done!${NC}"

echo ""
echo -e "${GREEN}Image available at:${NC}"
echo -e "${YELLOW}  - $APP_IMAGE:$VERSION${NC}"
echo -e "${YELLOW}  - $APP_IMAGE:latest${NC}"
