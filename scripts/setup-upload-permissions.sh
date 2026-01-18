#!/bin/bash
# scripts/setup-upload-permissions.sh
# 운영환경 업로드 디렉토리 권한 설정 스크립트

set -e

echo "🚀 운영환경 업로드 디렉토리 설정 시작..."

# 변수 설정
UPLOAD_BASE_DIR="./docker_prod_data/uploads"
JUNIT_UPLOAD_DIR="$UPLOAD_BASE_DIR/junit"
APP_LOGS_DIR="./docker_prod_data/app_logs"

# Docker 컨테이너에서 사용하는 UID/GID (appuser:appgroup)
DOCKER_UID=1001
DOCKER_GID=1001

echo "📁 업로드 디렉토리 생성..."
mkdir -p "$UPLOAD_BASE_DIR"
mkdir -p "$JUNIT_UPLOAD_DIR"
mkdir -p "$APP_LOGS_DIR"

echo "🔧 권한 설정..."
# 호스트에서 Docker 컨테이너와 동일한 UID/GID로 소유권 설정
sudo chown -R $DOCKER_UID:$DOCKER_GID "$UPLOAD_BASE_DIR"
sudo chown -R $DOCKER_UID:$DOCKER_GID "$APP_LOGS_DIR"

# 디렉토리 권한 설정 (읽기/쓰기/실행)
sudo chmod -R 755 "$UPLOAD_BASE_DIR"
sudo chmod -R 755 "$APP_LOGS_DIR"

echo "✅ 디렉토리 권한 확인:"
ls -la ./docker_prod_data/
echo ""
echo "📂 uploads 디렉토리:"
ls -la "$UPLOAD_BASE_DIR"
echo ""
echo "📂 junit 디렉토리:"
ls -la "$JUNIT_UPLOAD_DIR"

echo ""
echo "🎉 업로드 디렉토리 설정 완료!"
echo "   - 업로드 경로: $UPLOAD_BASE_DIR"
echo "   - JUnit 파일 경로: $JUNIT_UPLOAD_DIR"
echo "   - 소유자: UID $DOCKER_UID, GID $DOCKER_GID"
echo "   - 권한: 755 (rwxr-xr-x)"