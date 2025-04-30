#!/bin/bash

SRC_DIR="src/main/java"
DEST_DIR="source"

mkdir -p "$DEST_DIR"

find "$SRC_DIR" -type f -name '*.java' | while read -r java_file; do
    # 파일명만 추출
    base_name="$(basename "$java_file" .java)"
    dest_file="$DEST_DIR/backend_${base_name}.txt"
    cp "$java_file" "$dest_file"
done

