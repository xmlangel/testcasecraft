#!/bin/bash

START_TIME=$(date +"%Y-%m-%d %H:%M:%S")

set -euo pipefail   # 오류 발생 시 스크립트 종료, 미정의 변수 사용 방지

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# 프로젝트 루트 디렉터리 (docker-compose-dev-spring/ 의 상위)
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 기본 옵션
INCREMENT_VERSION=false

usage() {
    cat <<'EOF'
Usage: ./build.sh [options]

Options:
  -i, --increment-version   Gradle incrementVersion 태스크 실행
  -h, --help                이 도움말 출력

기본 동작은 버전 증분 없이 clean bootJar 를 실행합니다.
EOF
}

while [[ $# -gt 0 ]]; do
    case "$1" in
        -i|--increment-version)
            INCREMENT_VERSION=true
            # Check if next argument exists and is not a flag
            if [[ -n "${2:-}" && ! "$2" =~ ^- ]]; then
                TARGET_COMPONENT="$2"
                shift
            fi
            shift
            ;;
        -h|--help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# 1. 현재 디렉터리(app.jar 가 있는 곳)에서 기존 app.jar 백업
TIMESTAMP=$(date +%Y%m%d%H%M%S%N)   # 나노초까지 포함해 고유한 이름 생성
APP_JAR_PATH="${SCRIPT_DIR}/app.jar"

if [[ -f "$APP_JAR_PATH" ]]; then
    BACKUP_PATH="${SCRIPT_DIR}/app.jar.${TIMESTAMP}"
    echo "Backing up existing app.jar to $(basename "$BACKUP_PATH")"
    mv "$APP_JAR_PATH" "$BACKUP_PATH"
fi

# 2. 프로젝트 루트 디렉터리로 이동
echo "Changing directory to project root: $PROJECT_ROOT"
cd "$PROJECT_ROOT"

# 3. gradlew 존재 여부 확인
if [[ ! -x "./gradlew" ]]; then
    echo "Error: ./gradlew not found or not executable in $PROJECT_ROOT"
    exit 1
fi

# 4. Gradle 빌드 수행
echo "Running Gradle tasks..."
if [[ "$INCREMENT_VERSION" == "true" ]]; then
    if [[ -z "${TARGET_COMPONENT:-}" ]]; then
        echo "Select component to increment version:"
        echo "1) app (Application only)"
        echo "2) rag-service (RAG Service only)"
        echo "3) all (Both - Default)"
        read -r -p "Enter choice [1-3]: " choice
        
        case "$choice" in
            1|app) TARGET_COMPONENT="app" ;;
            2|rag-service|rag) TARGET_COMPONENT="rag-service" ;;
            *) TARGET_COMPONENT="all" ;;
        esac
    fi
    
    echo "Incrementing project version for: $TARGET_COMPONENT"
    ./gradlew incrementVersion -PtargetComponent="$TARGET_COMPONENT"
else
    echo "Skipping version increment (use -i to enable)."
fi

# clean 후 bootJar 생성, 로그는 build.log 로 저장
./gradlew clean bootJar | tee build.log

echo "Build completed successfully."

END_TIME=$(date +"%Y-%m-%d %H:%M:%S")

echo "========================================"
echo "빌드 시작 시간: $START_TIME"
echo "빌드 종료 시간: $END_TIME"
echo "========================================"
