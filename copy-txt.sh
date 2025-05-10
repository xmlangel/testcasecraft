#!/bin/bash

# 공통 목적지 디렉토리
DEST_DIR="source"
mkdir -p "$DEST_DIR"

# 1. 현재 디렉토리의 모든 파일을 frontend_ 접두사로 복사
SRC_DIR_FRONTEND="backend_for_testcase/src/main/frontend/src"
find "$SRC_DIR_FRONTEND" -type f ! -path "./$DEST_DIR/*" | while read -r file; do
    base_name="$(basename "$file")"
    dest_file="$DEST_DIR/frontend_${base_name}.txt"
    cp "$file" "$dest_file"
done

# 2. src/main/java의 모든 .java 파일을 backend_ 접두사로 복사
SRC_DIR_BACKEND="backend_for_testcase/src/main/java"
find "$SRC_DIR_BACKEND" -type f -name '*.java' | while read -r java_file; do
    base_name="$(basename "$java_file" .java)"
    dest_file="$DEST_DIR/backend_${base_name}.txt"
    cp "$java_file" "$dest_file"
done

# 3. src/test 모든 .java 파일을 backend_ 접두사로 복사
SRC_DIR_BACKEND_TEST="backend_for_testcase/src/test"
find "$SRC_DIR_BACKEND_TEST" -type f ! -path "./$DEST_DIR/*" | while read -r file; do
    base_name="$(basename "$file")"
    dest_file="$DEST_DIR/test_backend_${base_name}.txt"
    cp "$file" "$dest_file"
done

