#!/bin/bash

# 공통 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 메시지 출력 함수
print_msg() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# 구분선 출력 함수
print_sep() {
    echo "========================================"
}

# Git 태그 감지 및 대화형 생성 함수
# Usage: detect_version_interactive [interactive_flag] [fallback_version]
# Result: Sets GLOBAL variable 'VERSION'
detect_version_interactive() {
    local is_interactive=${1:-"true"}
    local fallback_version=$2
    
    # 1. 현재 커밋에 태그가 있는지 확인
    local current_tag=$(git tag --points-at HEAD | grep '^v' | head -1)
    
    if [[ -n "$current_tag" ]]; then
        VERSION=$(echo "$current_tag" | sed -E 's/^v([0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z][0-9A-Za-z.-]*)?).*/\1/')
        print_msg "$GREEN" "✅ Detected version $VERSION from current tag: $current_tag"
        return 0
    fi

    # 2. 태그가 없을 때 대화형 처리
    if [[ "$is_interactive" == "true" && -t 0 ]]; then
        print_msg "$YELLOW" "⚠️ No Git tag found on the current commit."
        echo "Recent tags:"
        git tag -l 'v*' --sort=-v:refname | head -n 5
        echo ""
        read -r -p "Do you want to create a new tag for the current commit? (y/n): " create_tag
        if [[ "$create_tag" =~ ^[Yy]$ ]]; then
            read -r -p "Enter version (e.g., 1.0.40 or 1.0.40-dev): " input_version
            if [[ "$input_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z][0-9A-Za-z.-]*)?$ ]]; then
                local new_tag="v${input_version}-app"
                git tag -a "$new_tag" -m "Release version $input_version"
                VERSION="$input_version"
                print_msg "$GREEN" "✅ Created and using tag: $new_tag"
                return 0
            else
                print_msg "$RED" "❌ Invalid version format. Skipping tag creation."
            fi
        fi
    fi

    # 3. 차선책: 가장 최근 태그 사용
    local latest_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "")
    if [[ -n "$latest_tag" ]]; then
        VERSION=$(echo "$latest_tag" | sed -E 's/^v([0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z][0-9A-Za-z.-]*)?).*/\1/')
        print_msg "$YELLOW" "⚠️ Not on a tag. Using version $VERSION from latest tag: $latest_tag"
    else
        VERSION="$fallback_version"
        print_msg "$RED" "❌ No Git tags found. Using fallback version: $VERSION"
    fi
}

# 태그 존재 여부 검증 함수
# Usage: verify_tag_exists VERSION [TARGET]
# TARGET: all|app|rag (default: all)
verify_tag_exists() {
    local version="$1"
    local target="${2:-all}"
    local base_tag="v${version}"
    local target_tag="${base_tag}-${target}"

    if [[ "$target" == "all" ]]; then
        if git tag -l | grep -q "^${base_tag}$"; then
            print_msg "$GREEN" "✅ Verified Git tag ${base_tag} exists"
            return 0
        fi
        if git tag -l | grep -q "^${target_tag}$"; then
            print_msg "$GREEN" "✅ Verified Git tag ${target_tag} exists"
            return 0
        fi
        print_msg "$RED" "❌ Error: Git tag ${base_tag} or ${target_tag} does not exist!"
        return 1
    fi

    if git tag -l | grep -q "^${target_tag}$"; then
        print_msg "$GREEN" "✅ Verified Git tag ${target_tag} exists"
        return 0
    fi
    if git tag -l | grep -q "^${base_tag}$"; then
        print_msg "$GREEN" "✅ Verified Git tag ${base_tag} exists"
        return 0
    fi

    print_msg "$RED" "❌ Error: Git tag ${target_tag} or ${base_tag} does not exist!"
    return 1
}

# JAR 파일 백업 함수
backup_jar() {
    local jar_path=$1
    if [[ -f "$jar_path" ]]; then
        local timestamp=$(date +%Y%m%d%H%M%S)
        local backup_path="${jar_path}.${timestamp}"
        print_msg "$BLUE" "Backing up existing JAR to $(basename "$backup_path")"
        mv "$jar_path" "$backup_path"
    fi
}

# Gradle 버전 증분 실행 함수
run_increment_version() {
    local target=$1
    local utils_dir
    utils_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local project_root
    project_root="$(cd "$utils_dir/.." && pwd)"
    local gradlew_path="$project_root/gradlew"

    print_msg "$BLUE" "Running Gradle incrementVersion for target: $target"
    if [[ ! -f "$gradlew_path" ]]; then
        print_msg "$RED" "❌ Error: gradlew not found at $gradlew_path"
        return 1
    fi
    if [[ ! -x "$gradlew_path" ]]; then
        chmod +x "$gradlew_path"
    fi
    (cd "$project_root" && bash "$gradlew_path" incrementVersion -PtargetComponent="$target")
}
