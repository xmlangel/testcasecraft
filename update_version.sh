#!/bin/bash

BUILD_GRADLE_PATH="/Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage/build.gradle"

# 현재 버전 추출
CURRENT_VERSION_LINE=$(grep "version =" "$BUILD_GRADLE_PATH")
if [ -z "$CURRENT_VERSION_LINE" ]; then
  echo "❌ build.gradle 파일에서 버전 정보를 찾을 수 없습니다."
  exit 1
fi

# 'version = '0.0.1-SNAPSHOT'' 형태에서 '0.0.1-SNAPSHOT' 부분만 추출
OLD_VERSION=$(echo "$CURRENT_VERSION_LINE" | awk -F"'" '{print $2}')

if [ -z "$OLD_VERSION" ]; then
  echo "❌ 현재 버전 문자열을 파싱할 수 없습니다."
  exit 1
fi

NEW_VERSION=""
MANUAL_MODE=false

# --manual 옵션 처리
if [ "$1" == "--manual" ]; then
  MANUAL_MODE=true
  if [ -z "$2" ]; then
    echo "사용법: $0 --manual <새로운_버전>"
    echo "예시: $0 --manual 1.0.0-SNAPSHOT"
    exit 1
  fi
  NEW_VERSION="$2"
else
  # 자동 버전 증가 (패치 버전 +1)
  # -SNAPSHOT과 같은 접미사 처리
  BASE_VERSION=$(echo "$OLD_VERSION" | sed -E 's/(-SNAPSHOT|-RC[0-9]+|-BETA[0-9]+)?$//')
  SUFFIX=$(echo "$OLD_VERSION" | sed -E 's/^[0-9]+\.[0-9]+\.[0-9]+//')

  IFS='.' read -r MAJOR MINOR PATCH <<< "$BASE_VERSION"
  
  if ! [[ "$PATCH" =~ ^[0-9]+$ ]]; then
    echo "❌ 현재 패치 버전이 숫자가 아닙니다: $PATCH"
    echo "수동으로 버전을 지정해주세요: $0 --manual <새로운_버전>"
    exit 1
  fi

  NEW_PATCH=$((PATCH + 1))
  NEW_VERSION="${MAJOR}.${MINOR}.${NEW_PATCH}${SUFFIX}"
fi

# 버전 업데이트
# macOS와 Linux에서 모두 작동하도록 -i.bak 옵션 사용
sed -i.bak "s/version = '$OLD_VERSION'/version = '$NEW_VERSION'/" "$BUILD_GRADLE_PATH"

if [ $? -eq 0 ]; then
  echo "✅ build.gradle 파일의 버전이 '$OLD_VERSION' 에서 '$NEW_VERSION' 으로 성공적으로 업데이트되었습니다."
  # 백업 파일 삭제
  rm "${BUILD_GRADLE_PATH}.bak"
else
  echo "❌ 버전 업데이트에 실패했습니다."
  echo "원본 버전: $OLD_VERSION"
  echo "새로운 버전 (시도): $NEW_VERSION"
fi

# 스크립트 실행 권한 부여
chmod +x "$BUILD_GRADLE_PATH"
