#!/bin/bash

# 사용법 안내
if [ "$#" -lt 4 ]; then
    echo "사용법: $0 [폴더경로] [출력파일명] [prefix] [합칠 파일1] [합칠 파일2] ..."
    exit 1
fi

folder="$1"
output_file="$2"
prefix="$3"
shift 3

# 폴더 존재 확인
if [ ! -d "$folder" ]; then
    echo "오류: 폴더 '$folder'가 존재하지 않습니다."
    exit 2
fi

output_path="$folder/$output_file"

# 기존 출력파일이 있으면 삭제
if [ -f "$output_path" ]; then
    rm "$output_path"
fi

# 파일 합치기 및 삭제
for file in "$@"; do
    file_path="$folder/$prefix$file"
    if [ -f "$file_path" ]; then
        cat "$file_path" >> "$output_path"
        rm "$file_path"
        echo "$file_path 파일을 합치고 삭제했습니다."
    else
        echo "경고: $file_path 파일이 존재하지 않습니다."
    fi
done

echo "합치기 완료: $output_path"
