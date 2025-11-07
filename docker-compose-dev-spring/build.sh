#!/bin/bash

set -euo pipefail   # 오류 발생 시 스크립트 종료, 미정의 변수 사용 방지

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# 프로젝트 루트 디렉터리 (docker-compose-dev-spring/ 의 상위)
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

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
# 버전 자동 증가 (프로젝트에 정의된 태스크가 있어야 함)
./gradlew incrementVersion

# clean 후 bootJar 생성, 로그는 build.log 로 저장
./gradlew clean bootJar | tee build.log

echo "Build completed successfully."
