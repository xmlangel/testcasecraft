#!/bin/bash

set -e

# Docker Hub username and image name
DOCKER_USERNAME="xmlangel"
IMAGE_NAME="testcasecraft"
TAG="latest"

# 멀티아키 플랫폼 설정
PLATFORMS="linux/amd64,linux/arm64"

# 빌더 세팅
echo "Ensuring docker buildx builder is set up..."
docker buildx create --name mybuilder --use || true
docker buildx inspect --bootstrap

# 빌드 & 푸시
echo "Building and pushing $DOCKER_USERNAME/$IMAGE_NAME:$TAG for platforms $PLATFORMS..."
docker buildx build --platform $PLATFORMS -t $DOCKER_USERNAME/$IMAGE_NAME:$TAG --push -f Dockerfile.prod .

echo "Multi-arch build and push completed successfully!"

