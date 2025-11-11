#!/bin/bash
# deploy_and_restart.sh - JAR 배포 및 서비스 재시작 자동화 스크립트 (배포 태그 자동 생성)

# 환경 변수 설정
JAR_FILE="TestCaseCraft-0.1.25-SNAPSHOT.jar"
REMOTE_HOST="odroid.qaspecialist.shop"
REMOTE_DIR="git"
LOCAL_BUILD_PATH="backend_for_testcase/build/libs/"

# 0. Git 태그 생성 및 푸시
TAG_DATE=$(date +"%Y%m%d-%H%M%S")
TAG_NAME="deploy-${TAG_DATE}"
TAG_MESSAGE="배포: ${TAG_DATE}"

echo "🏷️  Git 태그 생성: ${TAG_NAME}"
git tag -a "${TAG_NAME}" -m "${TAG_MESSAGE}"
git push origin "${TAG_NAME}"
echo "✅ Git 태그 생성 및 푸시 완료"

# 1. JAR 파일 원격 서버로 복사
echo "⏳ $JAR_FILE 배포 중..."
scp "$LOCAL_BUILD_PATH/$JAR_FILE" "$REMOTE_HOST:$REMOTE_DIR/"
echo "✅ 성공적으로 JAR 파일 배포 완료"

# 2. 원격 서버에서 재시작 명령 실행
echo "🔄 서비스 재시작 시도..."
ssh -t "$REMOTE_HOST" "cd $REMOTE_DIR && ./run.sh restart"
echo "🚀 서비스 재시작 완료"
