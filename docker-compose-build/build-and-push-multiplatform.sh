#!/bin/bash

################################################################################
# Unified Multi-platform Docker Image Build & Push Script
# 
# [버전 관리]
# 1. 자동 감지: 현재 커밋의 Git 태그(vX.Y.Z-app)를 우선 사용합니다.
# 2. 태그 추가: 태그가 없으면 대화형으로 생성을 제안합니다 (Interactive 모드).
# 3. 버전 상향: --increment-version (-i) 플래그를 사용하여 Gradle 버전을 올릴 수 있습니다.
################################################################################

set -e  # 오류 발생 시 즉시 종료

# Configuration
VERSION=""
RECENT_VERSION="1.0.41"
DOCKER_USERNAME="xmlangel"
APP_IMAGE="${DOCKER_USERNAME}/testcasecraft"
RAG_IMAGE="${DOCKER_USERNAME}/testcasecraft-rag-service"
PLATFORMS="linux/amd64,linux/arm64"
BUILDER_NAME="testcasecraft-multiplatform"

# Load common utilities
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "$SCRIPT_DIR/common-utils.sh" ]]; then
    source "$SCRIPT_DIR/common-utils.sh"
else
    echo "Error: common-utils.sh not found!"
    exit 1
fi

# Default state
BUILD_TARGET=""
PUSH_MODE=false
INCREMENT_VERSION=false
NON_INTERACTIVE=false

# Function: Show usage
show_usage() {
    print_msg "$BLUE" "Usage: $0 [TARGET] [OPTIONS]"
    echo ""
    print_msg "$YELLOW" "Available targets:"
    echo "  all                        Build both images (default)"
    echo "  app                        Build testcasecraft only"
    echo "  rag                        Build RAG service only"
    echo ""
    print_msg "$YELLOW" "Options:"
    echo "  --push                     Build and push to Docker Hub (multi-platform)"
    echo "  --build-only               Local build & load (current platform only, default)"
    echo "  -i, --increment-version    Run Gradle incrementVersion task"
    echo "  --version VERSION          Force specific version"
    echo "  --non-interactive          Skip all prompts"
    echo "  -h, --help                 Show this help"
    echo ""
    print_msg "$GREEN" "Quick Examples:"
    echo "  $0 app --build-only"
    echo "  $0 all --push"
    echo "  $0 -i"
}

# Function: Parse arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            all|app|rag)
                BUILD_TARGET="$1"
                shift
                ;;
            --push)
                PUSH_MODE=true
                shift
                ;;
            --build-only)
                PUSH_MODE=false
                shift
                ;;
            -i|--increment-version)
                INCREMENT_VERSION=true
                shift
                ;;
            --version)
                VERSION="$2"
                shift 2
                ;;
            --non-interactive)
                NON_INTERACTIVE=true
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            *)
                print_msg "$RED" "❌ Invalid argument: $1"
                show_usage
                exit 1
                ;;
        esac
    done

    # GitHub Actions check
    if [[ "$GITHUB_ACTIONS" == "true" ]]; then
        NON_INTERACTIVE=true
    fi
}

# Function: Step header
print_step() {
    echo ""
    print_msg "$BLUE" "=========================================="
    print_msg "$BLUE" "STEP: $1"
    print_msg "$BLUE" "=========================================="
}

# STEP 1: Check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites"

    # Check Docker
    if ! command -v docker >/dev/null 2>&1; then
        print_msg "$RED" "❌ Error: Docker is not installed"
        exit 1
    fi

    # Check if logged in to Docker Hub if push mode is on
    if [[ "$PUSH_MODE" == "true" && "$NON_INTERACTIVE" == "false" ]]; then
        if ! docker info | grep -q "Username: ${DOCKER_USERNAME}"; then
            print_msg "$YELLOW" "⚠️  You are not logged in to Docker Hub as ${DOCKER_USERNAME}"
            print_msg "$YELLOW" "Please login with: docker login"
            read -r -p "Do you want to login now? (y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                docker login
            else
                print_msg "$RED" "❌ Docker Hub login required to push images"
                exit 1
            fi
        fi
    fi
}

# STEP 3: Build JAR
build_jar_step() {
    print_step "Building JAR file"
    
    # We are currently in docker-compose-build/
    local jar_dest="app.jar"
    backup_jar "$jar_dest"
    
    print_msg "$BLUE" "Running gradle build..."
    # cd .. to project root
    (cd "$SCRIPT_DIR/.." && ./gradlew clean build -x test)
    
    local built_jar
    built_jar=$(find "$SCRIPT_DIR/../build/libs" -name "*.jar" -not -name "*-plain.jar" | head -1)
    if [[ ! -f "$built_jar" ]]; then
        print_msg "$RED" "❌ Error: JAR file not found in build/libs!"
        exit 1
    fi
    
    cp "$built_jar" "$jar_dest"
    print_msg "$GREEN" "✅ JAR file ready: $jar_dest"
}

# STEP 4/5: Build Docker
build_docker_image() {
    local image_name=$1
    local context_path=$2
    local dockerfile=$3
    local tag=$4
    
    print_step "Building Docker image: $image_name"
    
    if [[ "$PUSH_MODE" == "true" ]]; then
        print_msg "$YELLOW" "Multi-platform Build & Push for: $PLATFORMS"
        docker buildx build \
            --platform "$PLATFORMS" \
            --tag "$image_name:$tag" \
            --tag "$image_name:latest" \
            --push \
            --file "$dockerfile" \
            "$context_path"
    else
        print_msg "$YELLOW" "Local platform build & load (current architecture only)"
        # Note: --load doesn't support multi-platform
        docker buildx build \
            --load \
            --tag "$image_name:$tag" \
            --tag "$image_name:latest" \
            --file "$dockerfile" \
            "$context_path"
    fi
    
    print_msg "$GREEN" "✅ $image_name built successfully"
}

# STEP 6: Verify images
verify_images_step() {
    if [[ "$PUSH_MODE" == "true" ]]; then
        print_step "Verifying images on Docker Hub"
        [[ "$BUILD_TARGET" == "all" || "$BUILD_TARGET" == "app" ]] && docker pull "$APP_IMAGE:$VERSION" --platform linux/amd64 && print_msg "$GREEN" "✅ App image verified"
        [[ "$BUILD_TARGET" == "all" || "$BUILD_TARGET" == "rag" ]] && docker pull "$RAG_IMAGE:$VERSION" --platform linux/amd64 && print_msg "$GREEN" "✅ RAG image verified"
    fi
}

# Setup Buildx
setup_buildx() {
    print_step "Checking Buildx setup"
    if ! docker buildx ls | grep -q "$BUILDER_NAME"; then
        print_msg "$BLUE" "Creating new builder: $BUILDER_NAME"
        docker buildx create --name "$BUILDER_NAME" --driver docker-container --bootstrap
    fi
    docker buildx use "$BUILDER_NAME"
}

# Main
main() {
    # Print Quick Guide Banner ONLY if no arguments provided
    if [[ $# -eq 0 ]]; then
        print_msg "$BLUE" "--------------------------------------------------------"
        print_msg "$GREEN" "💡 Quick Guide Commands:"
        echo "   Local Build: $0 app --build-only"
        echo "   Push Hub:    $0 all --push"
        echo "   Increment:   $0 -i"
        print_msg "$BLUE" "--------------------------------------------------------"
    fi

    parse_arguments "$@"

    # Interactive Target Selection if empty
    if [[ -z "$BUILD_TARGET" && "$NON_INTERACTIVE" == "false" ]]; then
        print_sep
        echo "Please select build target:"
        echo "1) All (App + RAG)"
        echo "2) Application only"
        echo "3) RAG Service only"
        read -r -p "Enter choice [1-3]: " tc
        case "$tc" in
            2) BUILD_TARGET="app" ;;
            3) BUILD_TARGET="rag" ;;
            *) BUILD_TARGET="all" ;;
        esac

        echo ""
        echo "Please select build mode:"
        echo "1) Local Build (Build & Load to local Docker)"
        echo "2) Multi-platform Push (Build & Push to Docker Hub)"
        read -r -p "Enter choice [1-2]: " mc
        case "$mc" in
            2) PUSH_MODE=true ;;
            *) PUSH_MODE=false ;;
        esac
    fi
    BUILD_TARGET=${BUILD_TARGET:-"all"}

    # Version Increment
    if [[ "$INCREMENT_VERSION" == "true" ]]; then
        run_increment_version "$BUILD_TARGET"
    fi

    # Version Detection
    if [[ -z "$VERSION" ]]; then
        local interactive_flag="true"
        [[ "$NON_INTERACTIVE" == "true" ]] && interactive_flag="false"
        detect_version_interactive "$interactive_flag" "$RECENT_VERSION"
    else
        verify_tag_exists "$VERSION" "$BUILD_TARGET" || exit 1
    fi

    # Prerequisites & Setup
    check_prerequisites
    setup_buildx

    # Process Build
    if [[ "$BUILD_TARGET" == "all" || "$BUILD_TARGET" == "app" ]]; then
        build_jar_step
        build_docker_image "$APP_IMAGE" "." "Dockerfile" "$VERSION"
    fi

    if [[ "$BUILD_TARGET" == "all" || "$BUILD_TARGET" == "rag" ]]; then
        build_docker_image "$RAG_IMAGE" "../rag-service" "../rag-service/Dockerfile" "$VERSION"
    fi

    # Verification
    verify_images_step

    # Cleanup
    [[ -f "app.jar" ]] && rm "app.jar"
    
    print_step "SUMMARY"
    print_msg "$GREEN" "Successfully completed processing for: $BUILD_TARGET"
    print_msg "$YELLOW" "Version: $VERSION"
    print_msg "$YELLOW" "Mode: $( [[ "$PUSH_MODE" == "true" ]] && echo "PUSH (Multi-platform)" || echo "LOCAL (Single-platform)" )"
}

main "$@"
