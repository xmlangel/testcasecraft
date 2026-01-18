#!/bin/bash

#############################################
# Build RAG Service Image Only
# Platform: linux/amd64, linux/arm64
# Image: xmlangel/testcasecraft-rag-service:1.0.11
#############################################

set -e

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

VERSION="1.0.32"
DOCKER_USERNAME="xmlangel"
RAG_IMAGE="${DOCKER_USERNAME}/testcasecraft-rag-service"
PLATFORMS="linux/amd64,linux/arm64"
RAG_SERVICE_PATH="../rag-service"
PUSH_TO_HUB=false  # Default: build only

# Function: Show usage information
show_usage() {
    echo -e "${BLUE}Usage: $0 [OPTIONS]${NC}"
    echo ""
    echo -e "${YELLOW}Options:${NC}"
    echo "  --build-only      Build image only (do not push to Docker Hub)"
    echo "  --push            Build and push to Docker Hub"
    echo "  -h, --help        Show this help message"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0                Interactive menu"
    echo "  $0 --build-only   Build only"
    echo "  $0 --push         Build and push"
}

# Function: Parse command line arguments
parse_arguments() {
    if [ $# -eq 0 ]; then
        return 0  # No arguments, will show interactive menu
    fi

    case "$1" in
        --build-only)
            PUSH_TO_HUB=false
            echo -e "${GREEN}📦 Build only mode (no push)${NC}"
            ;;
        --push)
            PUSH_TO_HUB=true
            echo -e "${GREEN}📦 Build and push mode${NC}"
            ;;
        -h|--help)
            show_usage
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Invalid argument: $1${NC}"
            show_usage
            exit 1
            ;;
    esac
}

# Function: Show interactive menu
show_interactive_menu() {
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║   Select Build Mode                                         ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Please select build mode:${NC}"
    echo ""
    echo "  1) Build only (local build, no push)"
    echo "  2) Build and push to Docker Hub"
    echo "  3) Exit"
    echo ""

    while true; do
        read -p "Enter your choice (1-3): " choice
        case $choice in
            1)
                PUSH_TO_HUB=false
                echo -e "${GREEN}✅ Selected: Build only${NC}"
                break
                ;;
            2)
                PUSH_TO_HUB=true
                echo -e "${GREEN}✅ Selected: Build and push${NC}"
                break
                ;;
            3)
                echo -e "${YELLOW}👋 Exiting...${NC}"
                exit 0
                ;;
            *)
                echo -e "${RED}❌ Invalid choice. Please enter 1, 2, or 3.${NC}"
                ;;
        esac
    done
    echo ""
}

# Function: Check Docker Hub login
check_docker_login() {
    if [ "$PUSH_TO_HUB" = true ]; then
        if ! docker info | grep -q "Username: ${DOCKER_USERNAME}"; then
            echo -e "${YELLOW}⚠️  You are not logged in to Docker Hub${NC}"
            echo -e "${YELLOW}Please login with: docker login${NC}"
            read -p "Do you want to login now? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                docker login
            else
                echo -e "${RED}❌ Docker Hub login required to push images${NC}"
                exit 1
            fi
        fi
        echo -e "${GREEN}✅ Logged in to Docker Hub as ${DOCKER_USERNAME}${NC}"
    fi
}

# Main execution
main() {
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   Build RAG Service Image Only         ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""

    # Parse arguments or show interactive menu
    parse_arguments "$@"

    if [ $# -eq 0 ]; then
        show_interactive_menu
    fi

    # Check if RAG service directory exists
    if [ ! -d "$RAG_SERVICE_PATH" ]; then
        echo -e "${RED}❌ RAG service directory not found at $RAG_SERVICE_PATH${NC}"
        exit 1
    fi

    # Check Docker Hub login if pushing
    check_docker_login

    # Build Docker image
    if [ "$PUSH_TO_HUB" = true ]; then
        echo -e "${BLUE}[1/1] Building and pushing Docker image for platforms: $PLATFORMS${NC}"
        docker buildx build \
            --platform "$PLATFORMS" \
            --tag "$RAG_IMAGE:$VERSION" \
            --tag "$RAG_IMAGE:latest" \
            --push \
            --file "$RAG_SERVICE_PATH/Dockerfile" \
            "$RAG_SERVICE_PATH"

        echo -e "${GREEN}✅ Image built and pushed${NC}"
        echo ""
        echo -e "${GREEN}Image available on Docker Hub:${NC}"
        echo -e "${YELLOW}  - $RAG_IMAGE:$VERSION${NC}"
        echo -e "${YELLOW}  - $RAG_IMAGE:latest${NC}"
    else
        echo -e "${BLUE}[1/1] Building Docker image for local platform${NC}"
        echo -e "${YELLOW}Note: Building for local architecture only (no multi-platform support with --load)${NC}"
        echo ""
        docker buildx build \
            --load \
            --tag "$RAG_IMAGE:$VERSION" \
            --tag "$RAG_IMAGE:latest" \
            --file "$RAG_SERVICE_PATH/Dockerfile" \
            "$RAG_SERVICE_PATH"

        echo -e "${GREEN}✅ Image built and loaded locally${NC}"
        echo ""
        echo -e "${GREEN}Image available locally:${NC}"
        echo -e "${YELLOW}  - $RAG_IMAGE:$VERSION${NC}"
        echo -e "${YELLOW}  - $RAG_IMAGE:latest${NC}"
        echo ""
        echo -e "${YELLOW}To push to Docker Hub, use: $0 --push${NC}"
    fi
}

# Run main function with all arguments
main "$@"
