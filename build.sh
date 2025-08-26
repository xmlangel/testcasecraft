#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Docker Hub username and image name
DOCKER_USERNAME="xmlangel"
IMAGE_NAME="testcasecraft"
TAG="latest"

# Detect OS and architecture
OS=$(uname -s)
ARCH=$(uname -m)

TARGET_PLATFORM=""

if [ "$OS" == "Linux" ]; then
    if [ "$ARCH" == "x86_64" ]; then
        TARGET_PLATFORM="linux/amd64"
    else
        echo "Unsupported Linux architecture: $ARCH"
        exit 1
    fi
elif [ "$OS" == "Darwin" ]; then
    if [ "$ARCH" == "x86_64" ]; then
        TARGET_PLATFORM="linux/amd64" # Intel Mac, target Linux AMD64
    elif [ "$ARCH" == "arm64" ]; then
        TARGET_PLATFORM="linux/arm64" # Apple Silicon Mac, target Linux ARM64
    else
        echo "Unsupported macOS architecture: $ARCH"
        exit 1
    fi
else
    echo "Unsupported operating system: $OS"
    exit 1
fi

echo "Detected OS: $OS, Architecture: $ARCH"
echo "Targeting Docker platform: $TARGET_PLATFORM"

# Ensure docker buildx builder is set up
echo "Ensuring docker buildx builder is set up..."
docker buildx create --name mybuilder --use || true # Use || true to prevent script from exiting if builder already exists
docker buildx inspect --bootstrap

# Build and push the image
echo "Building and pushing $DOCKER_USERNAME/$IMAGE_NAME:$TAG for platform $TARGET_PLATFORM..."
docker buildx build --platform "$TARGET_PLATFORM" -t "$DOCKER_USERNAME/$IMAGE_NAME:$TAG" --push -f Dockerfile.prod .

echo "Build and push completed successfully!"
