#!/bin/bash

# Docker Image Build Script for TestCase Management Application
# Supports both x86_64 and ARM64 architectures with optional tar export

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Default values
IMAGE_NAME="testcasecraft"
VERSION="latest"
EXPORT_TAR=false
BUILD_X86=false
BUILD_ARM=false
BUILD_BOTH=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_help() {
    cat << EOF
🐳 Docker Image Build Script for TestCase Management Application

Usage: $0 [OPTIONS] [COMMAND]

OPTIONS:
    -n, --name NAME         Image name (default: testcasecraft)
    -v, --version VERSION   Image version tag (default: latest)
    -t, --tar              Export images to tar files after building
    -h, --help             Show this help message

COMMANDS:
    x86_64                 Build only x86_64 image
    arm64                  Build only ARM64 image  
    both                   Build both architectures (default)
    clean                  Remove existing images and tar files

EXAMPLES:
    $0                                    # Build both architectures
    $0 x86_64 --tar                     # Build x86_64 and export to tar
    $0 both -v v2.0 -t                  # Build both with version v2.0 and export
    $0 clean                            # Clean up existing images

Built images:
    - ${IMAGE_NAME}:x86_64-{version}
    - ${IMAGE_NAME}:arm64-{version}

Exported files (with --tar):
    - ${IMAGE_NAME}-x86_64-{version}.tar
    - ${IMAGE_NAME}-arm64-{version}.tar
EOF
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed or not in PATH"
        exit 1
    fi
    
    # Check if Docker daemon is running
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running"
        exit 1
    fi
    
    # Check if app.jar exists
    if [ ! -f "app.jar" ]; then
        print_error "app.jar not found in current directory"
        print_warning "Please copy your JAR file as 'app.jar' before building"
        exit 1
    fi
    
    # Check if Dockerfile exists
    if [ ! -f "Dockerfile" ]; then
        print_error "Dockerfile not found in current directory"
        exit 1
    fi
    
    print_success "All prerequisites met"
}

# Function to build Docker image
build_image() {
    local platform=$1
    local arch=$2
    local tag="${IMAGE_NAME}:${arch}-${VERSION}"
    
    print_status "Building ${arch} image: ${tag}"
    print_status "Platform: ${platform}"
    
    if docker build --platform "$platform" -t "$tag" .; then
        print_success "Successfully built ${tag}"
        return 0
    else
        print_error "Failed to build ${tag}"
        return 1
    fi
}

# Function to export image to tar
export_to_tar() {
    local arch=$1
    local tag="${IMAGE_NAME}:${arch}-${VERSION}"
    local tar_file="${IMAGE_NAME}-${arch}-${VERSION}.tar"
    
    print_status "Exporting ${tag} to ${tar_file}..."
    
    if docker save "$tag" -o "$tar_file"; then
        local size=$(ls -lah "$tar_file" | awk '{print $5}')
        print_success "Exported ${tag} to ${tar_file} (${size})"
        return 0
    else
        print_error "Failed to export ${tag}"
        return 1
    fi
}

# Function to clean up
cleanup() {
    print_status "Cleaning up existing images and tar files..."
    
    # Remove Docker images
    for arch in x86_64 arm64; do
        for ver in latest v1 v2 v3; do
            local tag="${IMAGE_NAME}:${arch}-${ver}"
            if docker images -q "$tag" 2> /dev/null; then
                print_status "Removing image: ${tag}"
                docker rmi "$tag" 2>/dev/null || true
            fi
        done
    done
    
    # Remove tar files
    for arch in x86_64 arm64; do
        for file in ${IMAGE_NAME}-${arch}-*.tar; do
            if [ -f "$file" ]; then
                print_status "Removing tar file: ${file}"
                rm -f "$file"
            fi
        done
    done
    
    print_success "Cleanup completed"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--name)
            IMAGE_NAME="$2"
            shift 2
            ;;
        -v|--version)
            VERSION="$2"
            shift 2
            ;;
        -t|--tar)
            EXPORT_TAR=true
            shift
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        x86_64)
            BUILD_X86=true
            shift
            ;;
        arm64)
            BUILD_ARM=true
            shift
            ;;
        both)
            BUILD_BOTH=true
            shift
            ;;
        clean)
            cleanup
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Set default to build both if no specific architecture chosen
if [[ "$BUILD_X86" == false && "$BUILD_ARM" == false && "$BUILD_BOTH" == false ]]; then
    BUILD_BOTH=true
fi

# Main execution
print_status "🐳 Docker Image Build Script Started"
print_status "Image name: ${IMAGE_NAME}"
print_status "Version: ${VERSION}"
print_status "Export to tar: ${EXPORT_TAR}"

check_prerequisites

echo ""
print_status "Starting build process..."

# Build images
BUILD_FAILED=false

if [[ "$BUILD_BOTH" == true || "$BUILD_X86" == true ]]; then
    echo ""
    print_status "========================================="
    print_status "Building x86_64 image..."
    print_status "========================================="
    if ! build_image "linux/amd64" "x86_64"; then
        BUILD_FAILED=true
    fi
fi

if [[ "$BUILD_BOTH" == true || "$BUILD_ARM" == true ]]; then
    echo ""
    print_status "========================================="
    print_status "Building ARM64 image..."
    print_status "========================================="
    if ! build_image "linux/arm64" "arm64"; then
        BUILD_FAILED=true
    fi
fi

# Export to tar if requested
if [[ "$EXPORT_TAR" == true && "$BUILD_FAILED" == false ]]; then
    echo ""
    print_status "========================================="
    print_status "Exporting images to tar files..."
    print_status "========================================="
    
    if [[ "$BUILD_BOTH" == true || "$BUILD_X86" == true ]]; then
        export_to_tar "x86_64"
    fi
    
    if [[ "$BUILD_BOTH" == true || "$BUILD_ARM" == true ]]; then
        export_to_tar "arm64"
    fi
fi

# Final status
echo ""
print_status "========================================="
if [[ "$BUILD_FAILED" == true ]]; then
    print_error "Some builds failed!"
    exit 1
else
    print_success "All builds completed successfully!"
fi

# Show built images
echo ""
print_status "Built Docker images:"
docker images "${IMAGE_NAME}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" | head -10

# Show exported files
if [[ "$EXPORT_TAR" == true ]]; then
    echo ""
    print_status "Exported tar files:"
    ls -lah ${IMAGE_NAME}-*-${VERSION}.tar 2>/dev/null || print_warning "No tar files found"
fi

echo ""
print_success "🎉 Build process completed!"