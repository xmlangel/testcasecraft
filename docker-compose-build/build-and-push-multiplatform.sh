#!/bin/bash

#############################################
# Multi-platform Docker Image Build & Push
# Platforms: linux/amd64, linux/arm64 (Mac M1/M2)
# Images:
#   - xmlangel/testcasecraft:1.0.32
#   - xmlangel/testcasecraft-rag-service:1.0.11
#############################################

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
VERSION="1.0.32"
DOCKER_USERNAME="xmlangel"
APP_IMAGE="${DOCKER_USERNAME}/testcasecraft"
RAG_IMAGE="${DOCKER_USERNAME}/testcasecraft-rag-service"
PLATFORMS="linux/amd64,linux/arm64"
BUILDER_NAME="testcasecraft-multiplatform"
BUILD_TARGET=""  # Will be set by user input or parameter

# Function: Print colored message
print_msg() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Function: Print step header
print_step() {
    echo ""
    print_msg "$BLUE" "=========================================="
    print_msg "$BLUE" "$1"
    print_msg "$BLUE" "=========================================="
}

# Function: Parse command line arguments
parse_arguments() {
    if [ $# -eq 0 ]; then
        return 0  # No arguments, will show interactive menu
    fi

    case "$1" in
        all|ALL)
            BUILD_TARGET="all"
            print_msg "$GREEN" "📦 Building both images (testcasecraft + testcasecraft-rag-service)"
            ;;
        app|testcasecraft)
            BUILD_TARGET="app"
            print_msg "$GREEN" "📦 Building testcasecraft image only"
            ;;
        rag|testcasecraft-rag-service)
            BUILD_TARGET="rag"
            print_msg "$GREEN" "📦 Building testcasecraft-rag-service image only"
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
}

# Function: Show usage information
show_usage() {
    print_msg "$BLUE" "Usage: $0 [TARGET]"
    echo ""
    print_msg "$YELLOW" "Available targets:"
    echo "  all                        Build and push both images (default)"
    echo "  app | testcasecraft        Build and push testcasecraft image only"
    echo "  rag | testcasecraft-rag-service"
    echo "                             Build and push testcasecraft-rag-service image only"
    echo ""
    print_msg "$YELLOW" "Options:"
    echo "  -h, --help                 Show this help message"
    echo ""
    print_msg "$YELLOW" "Examples:"
    echo "  $0                         Interactive menu"
    echo "  $0 all                     Build both images"
    echo "  $0 app                     Build testcasecraft only"
    echo "  $0 rag                     Build RAG service only"
}

# Function: Show interactive menu
show_interactive_menu() {
    print_msg "$BLUE" "╔════════════════════════════════════════════════════════════╗"
    print_msg "$BLUE" "║   Select Build Target                                      ║"
    print_msg "$BLUE" "╚════════════════════════════════════════════════════════════╝"
    echo ""
    print_msg "$YELLOW" "Please select what to build and push:"
    echo ""
    echo "  1) Both images (testcasecraft + testcasecraft-rag-service)"
    echo "  2) testcasecraft only"
    echo "  3) testcasecraft-rag-service only"
    echo "  4) Exit"
    echo ""

    while true; do
        read -p "Enter your choice (1-4): " choice
        case $choice in
            1)
                BUILD_TARGET="all"
                print_msg "$GREEN" "✅ Selected: Build both images"
                break
                ;;
            2)
                BUILD_TARGET="app"
                print_msg "$GREEN" "✅ Selected: Build testcasecraft only"
                break
                ;;
            3)
                BUILD_TARGET="rag"
                print_msg "$GREEN" "✅ Selected: Build testcasecraft-rag-service only"
                break
                ;;
            4)
                print_msg "$YELLOW" "👋 Exiting..."
                exit 0
                ;;
            *)
                print_msg "$RED" "❌ Invalid choice. Please enter 1, 2, 3, or 4."
                ;;
        esac
    done
    echo ""
}

# Function: Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function: Check prerequisites
check_prerequisites() {
    print_step "STEP 1: Checking prerequisites"

    # Check Docker
    if ! command_exists docker; then
        print_msg "$RED" "❌ Error: Docker is not installed"
        exit 1
    fi
    print_msg "$GREEN" "✅ Docker is installed"

    # Check Docker Buildx
    if ! docker buildx version >/dev/null 2>&1; then
        print_msg "$RED" "❌ Error: Docker Buildx is not available"
        print_msg "$YELLOW" "Please update Docker to a newer version with Buildx support"
        exit 1
    fi
    print_msg "$GREEN" "✅ Docker Buildx is available"

    # Check if logged in to Docker Hub
    if ! docker info | grep -q "Username: ${DOCKER_USERNAME}"; then
        print_msg "$YELLOW" "⚠️  You are not logged in to Docker Hub"
        print_msg "$YELLOW" "Please login with: docker login"
        read -p "Do you want to login now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            docker login
        else
            print_msg "$RED" "❌ Docker Hub login required to push images"
            exit 1
        fi
    fi
    print_msg "$GREEN" "✅ Logged in to Docker Hub as ${DOCKER_USERNAME}"
}

# Function: Setup buildx builder
setup_builder() {
    print_step "STEP 2: Setting up Docker Buildx builder"

    # Check if builder already exists
    if docker buildx ls | grep -q "$BUILDER_NAME"; then
        print_msg "$YELLOW" "Builder '$BUILDER_NAME' already exists, removing..."
        docker buildx rm "$BUILDER_NAME"
    fi

    # Create new builder
    print_msg "$BLUE" "Creating new buildx builder: $BUILDER_NAME"
    docker buildx create --name "$BUILDER_NAME" --driver docker-container --bootstrap

    # Use the builder
    docker buildx use "$BUILDER_NAME"

    # Inspect builder
    docker buildx inspect --bootstrap

    print_msg "$GREEN" "✅ Buildx builder setup complete"
}

# Function: Build JAR file for main application
build_jar() {
    print_step "STEP 3: Building JAR file for main application"

    cd ..

    if [ ! -f "gradlew" ]; then
        print_msg "$RED" "❌ Error: gradlew not found in parent directory"
        exit 1
    fi

    print_msg "$BLUE" "Running gradle build (this may take a few minutes)..."
    ./gradlew clean build -x test

    # Find the built JAR file
    JAR_FILE=$(find build/libs -name "*.jar" -not -name "*-plain.jar" | head -1)

    if [ ! -f "$JAR_FILE" ]; then
        print_msg "$RED" "❌ Error: JAR file not found in build/libs"
        exit 1
    fi

    print_msg "$GREEN" "✅ JAR file built: $JAR_FILE"

    # Copy JAR to docker-compose directory
    cp "$JAR_FILE" "docker-compose-dev-spring/app.jar"
    print_msg "$GREEN" "✅ JAR file copied to docker-compose-dev-spring/app.jar"

    cd docker-compose-dev-spring
}

# Function: Build and push main application image
build_and_push_app() {
    print_step "STEP 4: Building and pushing main application image"

    print_msg "$BLUE" "Building $APP_IMAGE:$VERSION for platforms: $PLATFORMS"
    print_msg "$YELLOW" "This will take several minutes..."

    docker buildx build \
        --platform "$PLATFORMS" \
        --tag "$APP_IMAGE:$VERSION" \
        --tag "$APP_IMAGE:latest" \
        --push \
        --file Dockerfile \
        .

    print_msg "$GREEN" "✅ Main application image built and pushed successfully"
    print_msg "$GREEN" "   - $APP_IMAGE:$VERSION"
    print_msg "$GREEN" "   - $APP_IMAGE:latest"
}

# Function: Build and push RAG service image
build_and_push_rag() {
    print_step "STEP 5: Building and pushing RAG service image"

    RAG_SERVICE_PATH="../rag-service"

    if [ ! -d "$RAG_SERVICE_PATH" ]; then
        print_msg "$RED" "❌ Error: RAG service directory not found at $RAG_SERVICE_PATH"
        exit 1
    fi

    print_msg "$BLUE" "Building $RAG_IMAGE:$VERSION for platforms: $PLATFORMS"
    print_msg "$YELLOW" "This will take several minutes..."

    docker buildx build \
        --platform "$PLATFORMS" \
        --tag "$RAG_IMAGE:$VERSION" \
        --tag "$RAG_IMAGE:latest" \
        --push \
        --file "$RAG_SERVICE_PATH/Dockerfile" \
        "$RAG_SERVICE_PATH"

    print_msg "$GREEN" "✅ RAG service image built and pushed successfully"
    print_msg "$GREEN" "   - $RAG_IMAGE:$VERSION"
    print_msg "$GREEN" "   - $RAG_IMAGE:latest"
}

# Function: Verify images on Docker Hub
verify_images() {
    print_step "STEP 6: Verifying images on Docker Hub"

    print_msg "$BLUE" "Pulling images to verify..."

    # Pull main app image
    print_msg "$BLUE" "Pulling $APP_IMAGE:$VERSION..."
    docker pull "$APP_IMAGE:$VERSION" --platform linux/amd64
    print_msg "$GREEN" "✅ Main app image (amd64) verified"

    # Pull RAG service image
    print_msg "$BLUE" "Pulling $RAG_IMAGE:$VERSION..."
    docker pull "$RAG_IMAGE:$VERSION" --platform linux/amd64
    print_msg "$GREEN" "✅ RAG service image (amd64) verified"
}

# Function: Cleanup
cleanup() {
    print_step "STEP 7: Cleanup"

    # Remove JAR file
    if [ -f "app.jar" ]; then
        rm app.jar
        print_msg "$GREEN" "✅ Cleaned up app.jar"
    fi

    # Optional: Remove builder (uncomment if you want to remove it)
    # print_msg "$BLUE" "Removing buildx builder..."
    # docker buildx rm "$BUILDER_NAME"
    # print_msg "$GREEN" "✅ Buildx builder removed"
}

# Function: Print summary
print_summary() {
    print_step "BUILD & PUSH COMPLETE!"

    print_msg "$GREEN" "Successfully built and pushed the following images:"
    echo ""

    if [ "$BUILD_TARGET" = "all" ] || [ "$BUILD_TARGET" = "app" ]; then
        print_msg "$GREEN" "Main Application:"
        print_msg "$GREEN" "  - $APP_IMAGE:$VERSION"
        print_msg "$GREEN" "  - $APP_IMAGE:latest"
        echo ""
    fi

    if [ "$BUILD_TARGET" = "all" ] || [ "$BUILD_TARGET" = "rag" ]; then
        print_msg "$GREEN" "RAG Service:"
        print_msg "$GREEN" "  - $RAG_IMAGE:$VERSION"
        print_msg "$GREEN" "  - $RAG_IMAGE:latest"
        echo ""
    fi

    print_msg "$GREEN" "Platforms: $PLATFORMS"
    echo ""
    print_msg "$BLUE" "You can now pull these images on any platform:"

    if [ "$BUILD_TARGET" = "all" ] || [ "$BUILD_TARGET" = "app" ]; then
        print_msg "$YELLOW" "  docker pull $APP_IMAGE:$VERSION"
    fi

    if [ "$BUILD_TARGET" = "all" ] || [ "$BUILD_TARGET" = "rag" ]; then
        print_msg "$YELLOW" "  docker pull $RAG_IMAGE:$VERSION"
    fi

    echo ""
    print_msg "$BLUE" "View on Docker Hub:"

    if [ "$BUILD_TARGET" = "all" ] || [ "$BUILD_TARGET" = "app" ]; then
        print_msg "$YELLOW" "  https://hub.docker.com/r/$APP_IMAGE"
    fi

    if [ "$BUILD_TARGET" = "all" ] || [ "$BUILD_TARGET" = "rag" ]; then
        print_msg "$YELLOW" "  https://hub.docker.com/r/$RAG_IMAGE"
    fi

    echo ""
}

# Main execution
main() {
    print_msg "$GREEN" "╔════════════════════════════════════════════════════════════╗"
    print_msg "$GREEN" "║   Multi-Platform Docker Image Build & Push Script         ║"
    print_msg "$GREEN" "║   Version: $VERSION                                        ║"
    print_msg "$GREEN" "╚════════════════════════════════════════════════════════════╝"

    # Parse arguments or show interactive menu
    parse_arguments "$@"

    if [ -z "$BUILD_TARGET" ]; then
        show_interactive_menu
    fi

    echo ""
    print_msg "$BLUE" "╔════════════════════════════════════════════════════════════╗"
    print_msg "$BLUE" "║   Starting Build Process                                   ║"
    print_msg "$BLUE" "╚════════════════════════════════════════════════════════════╝"
    echo ""

    # Common steps for all builds
    check_prerequisites
    setup_builder

    # Conditional build steps based on target
    if [ "$BUILD_TARGET" = "all" ] || [ "$BUILD_TARGET" = "app" ]; then
        build_jar
        build_and_push_app
    fi

    if [ "$BUILD_TARGET" = "all" ] || [ "$BUILD_TARGET" = "rag" ]; then
        build_and_push_rag
    fi

    # Verification (conditional)
    if [ "$BUILD_TARGET" = "all" ]; then
        verify_images
    elif [ "$BUILD_TARGET" = "app" ]; then
        print_step "STEP 6: Verifying images on Docker Hub"
        print_msg "$BLUE" "Pulling $APP_IMAGE:$VERSION..."
        docker pull "$APP_IMAGE:$VERSION" --platform linux/amd64
        print_msg "$GREEN" "✅ Main app image (amd64) verified"
    elif [ "$BUILD_TARGET" = "rag" ]; then
        print_step "STEP 6: Verifying images on Docker Hub"
        print_msg "$BLUE" "Pulling $RAG_IMAGE:$VERSION..."
        docker pull "$RAG_IMAGE:$VERSION" --platform linux/amd64
        print_msg "$GREEN" "✅ RAG service image (amd64) verified"
    fi

    cleanup
    print_summary

    print_msg "$GREEN" "🎉 All done!"
}

# Trap errors and cleanup
trap 'print_msg "$RED" "❌ Error occurred. Exiting..."; cleanup; exit 1' ERR

# Run main function with all arguments
main "$@"
