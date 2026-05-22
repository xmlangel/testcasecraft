#!/bin/bash

# API 테스트 결과 분석 스크립트
# 사용법: ./analyze-test-results.sh [결과 디렉토리]

RESULTS_DIR=${1:-"build/test-results/test"}

if [ ! -d "$RESULTS_DIR" ]; then
    echo "오류: 테스트 결과 디렉토리를 찾을 수 없습니다: $RESULTS_DIR"
    exit 1
fi

echo "===================================================="
echo "          API 테스트 결과 요약 분석"
echo "===================================================="
echo "분석 대상: $RESULTS_DIR"
echo ""

# 전체 통계 계산
TOTAL_TESTS=0
TOTAL_FAILURES=0
TOTAL_SKIPPED=0
TOTAL_ERRORS=0

# XML 파일들 순회 분석
while read -r file; do
    TESTS=$(grep -o 'tests="[0-9]*"' "$file" | head -1 | cut -d'"' -f2)
    FAILURES=$(grep -o 'failures="[0-9]*"' "$file" | head -1 | cut -d'"' -f2)
    SKIPPED=$(grep -o 'skipped="[0-9]*"' "$file" | head -1 | cut -d'"' -f2)
    ERRORS=$(grep -o 'errors="[0-9]*"' "$file" | head -1 | cut -d'"' -f2)
    
    TOTAL_TESTS=$((TOTAL_TESTS + TESTS))
    TOTAL_FAILURES=$((TOTAL_FAILURES + FAILURES))
    TOTAL_SKIPPED=$((TOTAL_SKIPPED + SKIPPED))
    TOTAL_ERRORS=$((TOTAL_ERRORS + ERRORS))
done < <(find "$RESULTS_DIR" -name "*.xml")

TOTAL_SUCCESS=$((TOTAL_TESTS - TOTAL_FAILURES - TOTAL_SKIPPED - TOTAL_ERRORS))

echo "총 테스트 수: $TOTAL_TESTS"
echo "성공: $TOTAL_SUCCESS"
echo "실패: $TOTAL_FAILURES"
echo "오류: $TOTAL_ERRORS"
echo "건너뜀: $TOTAL_SKIPPED"
echo "----------------------------------------------------"

# 실패한 테스트 클래스 및 원인 요약 (상위 5개)
echo "주요 실패 케이스 및 원인 (Top 5):"
grep -l 'failures="[1-9]' "$RESULTS_DIR"/*.xml | head -n 5 | while read -r file; do
    CLASSNAME=$(basename "$file" .xml | sed 's/TEST-//')
    FAILURE_MSG=$(grep -o 'message="[^"]*"' "$file" | head -1 | cut -d'"' -f2 | sed 's/&quot;/"/g' | sed 's/&#10;/ /g')
    echo "- $CLASSNAME: ${FAILURE_MSG:-'상세 메시지 없음'}"
done

echo ""
echo "상세 리포트 확인: build/reports/tests/test/index.html"
echo "===================================================="
