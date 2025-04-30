#!/bin/bash

SRC_DIR="."
DEST_DIR="source"

mkdir -p "$DEST_DIR"

find "$SRC_DIR" -type f ! -path "./$DEST_DIR/*" | while read -r file; do
    # 파일명만 추출
    base_name="$(basename "$file")"
    dest_file="$DEST_DIR/frontend_${base_name}.txt"
    cp "$file" "$dest_file"
done

