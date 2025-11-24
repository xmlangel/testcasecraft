#!/bin/bash

#############################################
# Build RAG Service Image Only
# Platform: linux/amd64, linux/arm64
# Image: xmlangel/testcasecraft-rag-service:1.0.6
#############################################

set -e

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

VERSION="1.0.6"
DOCKER_USERNAME="xmlangel"
RAG_IMAGE="${DOCKER_USERNAME}/testcasecraft-rag-service"
PLATFORMS="linux/amd64,linux/arm64"
RAG_SERVICE_PATH="../rag-service"

echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Build RAG Service Image Only         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""

# Check if RAG service directory exists
if [ ! -d "$RAG_SERVICE_PATH" ]; then
    echo -e "${RED}❌ RAG service directory not found at $RAG_SERVICE_PATH${NC}"
    exit 1
fi

# Build Docker image
echo -e "${BLUE}[1/1] Building Docker image for platforms: $PLATFORMS${NC}"

docker buildx build \
    --platform "$PLATFORMS" \
    --tag "$RAG_IMAGE:$VERSION" \
    --tag "$RAG_IMAGE:latest" \
    --push \
    --file "$RAG_SERVICE_PATH/Dockerfile" \
    "$RAG_SERVICE_PATH"

echo -e "${GREEN}✅ Image built and pushed${NC}"

echo ""
echo -e "${GREEN}Image available at:${NC}"
echo -e "${YELLOW}  - $RAG_IMAGE:$VERSION${NC}"
echo -e "${YELLOW}  - $RAG_IMAGE:latest${NC}"
