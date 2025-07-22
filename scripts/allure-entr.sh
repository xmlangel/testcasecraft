#!/bin/bash

RESULTS_DIR="allure-results"
REPORT_DIR="allure-report"
ALLURE_SERVER_PID=""

# Ctrl+C(SIGINT) 핸들러 등록
cleanup() {
    echo ""
    echo "Ctrl+C 감지: 프로세스 종료 및 정리 중..."
    # 실행 중인 allure open 서버 종료
    if [[ -n "$ALLURE_SERVER_PID" ]] && kill -0 "$ALLURE_SERVER_PID" 2>/dev/null; then
        kill "$ALLURE_SERVER_PID"
        wait "$ALLURE_SERVER_PID" 2>/dev/null
    fi
    exit 0
}
trap cleanup SIGINT

# 최초 리포트 생성 및 오픈
allure generate "$RESULTS_DIR" --clean -o "$REPORT_DIR"
allure open "$REPORT_DIR" &
ALLURE_SERVER_PID=$!

# 파일 변경 감지 및 자동 실행
find "$RESULTS_DIR" -type f | entr -d sh -c '
    echo "변경 감지됨: 리포트 재생성 및 서버 재시작"
    allure generate "'"$RESULTS_DIR"'" --clean -o "'"$REPORT_DIR"'"
    # 기존 allure open 서버 종료
    pkill -f "allure.*server" 2>/dev/null
    sleep 1
    allure open "'"$REPORT_DIR"'" &
    echo $! > .allure_server_pid
'

# entr 종료 후 백그라운드 서버도 정리
if [[ -f .allure_server_pid ]]; then
    kill "$(cat .allure_server_pid)" 2>/dev/null
    rm .allure_server_pid
fi
