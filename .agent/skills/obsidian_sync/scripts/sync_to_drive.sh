#!/bin/bash

# 소스 및 대상 경로 설정
SOURCE="/Users/dicky/kmdata/git/testcase/testcasecraft/docs/obsidian/"
DEST="/Users/dicky/Library/CloudStorage/GoogleDrive-xmlangel.blog@gmail.com/내 드라이브/DriveSyncFiles/00_Project(프로젝트)/테스트케이스관리툴/Working"

# rsync 실행 (상세 모드, 아카이브 모드, 기존 파일 무시)
# --ignore-existing: 대상에 이미 동일한 이름의 파일이 있으면 덮어쓰지 않고 건너뛰어 신규 파일만 복사
rsync -av --ignore-existing "$SOURCE" "$DEST"

echo "Google Drive 동기화 완료: $DEST"
