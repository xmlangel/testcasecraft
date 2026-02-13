#!/bin/bash

# 공통 목적지 디렉토리
DEST_DIR="source"
rm -rf "$DEST_DIR"
mkdir -p "$DEST_DIR"

# 1. 현재 디렉토리의 모든 파일을 frontend_ 접두사로 복사
SRC_DIR_FRONTEND="../src/main/frontend/src"
find "$SRC_DIR_FRONTEND" -type f ! -path "./$DEST_DIR/*" | while read -r file; do
    base_name="$(basename "$file")"
    dest_file="$DEST_DIR/frontend_${base_name}.txt"
    cp "$file" "$dest_file"
done

# 2. src/main/java의 모든 .java 파일을 backend_ 접두사로 복사
SRC_DIR_BACKEND="../src/main/java"
find "$SRC_DIR_BACKEND" -type f -name '*.java' | while read -r java_file; do
    base_name="$(basename "$java_file" .java)"
    dest_file="$DEST_DIR/backend_${base_name}.txt"
    cp "$java_file" "$dest_file"
done

# 3. src/test 모든 .java 파일을 backend_ 접두사로 복사
SRC_DIR_BACKEND_TEST="../src/test"
find "$SRC_DIR_BACKEND_TEST" -type f ! -path "./$DEST_DIR/*" | while read -r file; do
    base_name="$(basename "$file")"
    test_dest_file="$DEST_DIR/test_backend_${base_name}.txt"
    cp "$file" "$test_dest_file"
done

echo "---Model---"
sh ./file-merge.sh source backend_models.txt backend_ Project.txt Testcase.txt TestExecution.txt TestPlan.txt TestResult.txt User.txt TestStep.txt AuditLog.txt Group.txt GroupMember.txt Organization.txt OrganizationUser.txt ProjectUser.txt

echo "---Repository---"
sh ./file-merge.sh source backend_repository.txt backend_ ProjectRepository.txt TestcaseRepository.txt TestExecutionRepository.txt TestPlanRepository.txt TestResultRepository.txt UserRepository.txt

echo "excel,json,sql,prop file"
rm -f source/*.xlsx.txt source/*.json.txt source/*.csv.txt source/*.*DS_Store*.txt
rm -rf source/*.sql*
rm -rf source/*.prop*

rm -rf changed_files_backup
# 변경내역 파일 목록 추출
git diff --name-only > changed_files.txt

# 복사본 디렉토리 생성
mkdir -p changed_files_backup

# 파일 복사 (디렉토리 구조 유지 없이 파일만 복사)
cat changed_files.txt | xargs -I{} cp {} changed_files_backup/

