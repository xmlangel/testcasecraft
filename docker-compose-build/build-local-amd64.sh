#!/bin/bash

################################################################################
# Local AMD64 Docker Build Script (No Push)
#
# 이 스크립트는 AMD64 아키텍처용 이미지를 빌드하여 로컬 Docker 엔진에 로드합니다.
# Docker Hub로 Push하지 않으며, Mac(M1/M2)에서도 AMD64용 빌드가 가능합니다.
#
# 사용법:
#   ./build-local-amd64.sh [app|rag|all] [태그] [--help]
#
#   app: 메인 애플리케이션 이미지만 빌드
#   rag: RAG 서비스 이미지만 빌드
#   all: (또는 인수 없음) 모든 이미지를 빌드
#
#   [태그]: 사용할 이미지 태그 (예: 1.0.43). 지정하지 않으면 기본 버전 사용
#   --help: 이 도움말 메시지를 표시합니다.
################################################################################

set -e  # 오류 발생 시 즉시 종료

# Configuration
DOCKER_USERNAME="xmlangel"
APP_IMAGE="${DOCKER_USERNAME}/testcasecraft"
RAG_IMAGE="${DOCKER_USERNAME}/testcasecraft-rag-service"
PLATFORM="linux/amd64"
VERSION="1.0.71" # 기본 버전
TAG=""             # main 함수에서 설정됨

# Load common utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "$SCRIPT_DIR/common-utils.sh" ]]; then
    source "$SCRIPT_DIR/common-utils.sh"
else
    # Simple fallback colors if common-utils.sh is missing
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    BLUE='\033[0;34m'
    YELLOW='\033[1;33m'
    NC='\033[0m'
    print_msg() { echo -e "${1}${2}${NC}"; }
fi

print_step() {
    echo ""
    print_msg "$BLUE" "=========================================="
    print_msg "$BLUE" "STEP: $1"
    print_msg "$BLUE" "=========================================="
}

# Usage function
usage() {
    print_msg "$YELLOW" "Usage: $0 [app|rag|all] [tag] [--help]"
    print_msg "$YELLOW" "  app: Build only the main application image"
    print_msg "$YELLOW" "  rag: Build only the RAG service image"
    print_msg "$YELLOW" "  all: (or no argument) Build all images"
    print_msg "$YELLOW" "  [tag]: Optional image tag to use (e.g., 1.0.43). Defaults to $VERSION"
    print_msg "$YELLOW" "  --help: Show this help message"
}


# 1. JAR 파일 빌드
build_jar() {
    print_step "Building Application JAR (Gradle)"
    
    # Move to project root
    cd ..
    print_msg "$BLUE" "Running: ./gradlew clean build -x test"
    ./gradlew clean build -x test
    
    # Find built JAR
    local built_jar=$(find build/libs -name "*.jar" -not -name "*-plain.jar" | head -1)
    if [[ ! -f "$built_jar" ]]; then
        print_msg "$RED" "❌ Error: JAR file not found in build/libs!"
        exit 1
    fi
    
    # Copy to docker build directory
    cp "$built_jar" "docker-compose-build/app.jar"
    cd docker-compose-build
    print_msg "$GREEN" "✅ JAR file prepared: app.jar"
}

# 2. 메인 애플리케이션 빌드
build_app_docker() {
    print_step "Building App Image ($APP_IMAGE:$TAG) for $PLATFORM"
    
    docker buildx build \
        --platform "$PLATFORM" \
        --tag "$APP_IMAGE:$TAG" \
        --load \
        .
        
    print_msg "$GREEN" "✅ App image built & loaded: $APP_IMAGE:$TAG"
}

# 3. RAG 서비스 빌드
build_rag_docker() {
    print_step "Building RAG Service Image ($RAG_IMAGE:$TAG) for $PLATFORM"
    
    docker buildx build \
        --platform "$PLATFORM" \
        --tag "$RAG_IMAGE:$TAG" \
        --load \
        --file ../rag-service/Dockerfile \
        ../rag-service
        
    print_msg "$GREEN" "✅ RAG image built & loaded: $RAG_IMAGE:$TAG"
}

# Main Execution
main() {
    local target="all"
    local custom_tag=""
    local show_help=false

    # New: If no arguments are provided, show help message
    if [[ "$#" -eq 0 ]]; then
        show_help=true
    fi

    # Parse arguments
    for arg in "$@"; do
        case $arg in
            --help)
                show_help=true
                ;;
            app|rag|all)
                target=$arg
                ;;
            *)
                # Anything that is not a known target is treated as a tag
                if [[ ! "$arg" =~ ^(app|rag|all)$ ]]; then
                    custom_tag=$arg
                fi
                ;;
        esac
    done

    # If --help was requested (either explicitly or implicitly due to no args), show usage and exit
    if $show_help; then
        usage
        exit 0
    fi

    # Set version and tag
    if [[ -n "$custom_tag" ]]; then
        TAG="$custom_tag"
    else
        TAG="$VERSION"
    fi

    print_msg "$YELLOW" "🚀 Starting local AMD64 build process..."
    print_msg "$YELLOW" "   Platform: $PLATFORM"
    print_msg "$YELLOW" "   Tag:      $TAG"
    
    # Check for buildx
    if ! docker buildx version >/dev/null 2>&1; then
        print_msg "$RED" "❌ Error: Docker buildx is required."
        exit 1
    fi

    # Execute steps based on target
    case "$target" in
        app)
            print_msg "$BLUE" "Building target: app"
            build_jar
            build_app_docker
            ;;
        rag)
            print_msg "$BLUE" "Building target: rag"
            build_rag_docker
            ;;
        all)
            print_msg "$BLUE" "Building targets: app, rag"
            build_jar
            build_app_docker
            build_rag_docker
            ;;
    esac

    # Cleanup
    if [[ -f "app.jar" ]]; then
        rm "app.jar"
        print_msg "$BLUE" "🧹 Cleaned up temporary JAR file."
    fi

    echo ""
    print_msg "$GREEN" "✨ Build process completed for target '$target' with tag '$TAG'!"
    print_msg "$BLUE" "   You can check the images with: docker images | grep '$TAG'"
}

main "$@"
