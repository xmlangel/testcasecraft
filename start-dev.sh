#!/bin/bash
#
# start-dev.sh - 개발 환경 서버 관리 스크립트
#
# 이 스크립트는 개발 환경의 백엔드 서버를 시작, 중지, 재시작하고 상태를 확인합니다.
#

# --- 설정 ---
ENV="dev"
PIDS_DIR="pids"
LOGS_DIR="logs"

PID_FILE="$PIDS_DIR/$ENV.pid"
LOG_FILE="$LOGS_DIR/$ENV.log"

# --- 함수 정의 ---

# 사용법 안내
usage() {
    echo "Usage: $0 {start|stop|restart|status}"
    echo "  start   : 백엔드 개발 서버를 백그라운드로 시작합니다."
    echo "  stop    : 백엔드 개발 서버를 중지합니다."
    echo "  restart : 백엔드 개발 서버를 재시작합니다."
    echo "  status  : 서버의 현재 실행 상태를 확인합니다."
    exit 1
}

# 개발 환경 정보 출력
show_info() {
    echo "=== 개발 환경 정보 ($ENV) ==="
    echo "✅ 개발 프로파일: $ENV"
    echo "   - JIRA 키 생성법: openssl rand -base64 32"
    echo "✅ 데이터베이스: H2 파일 기반 (./data/testdb.mv.db)"
    echo "✅ 서버 포트: 8080"
    echo "✅ H2 콘솔: http://localhost:8080/h2-console (ID: admin, PW: admin)"
    echo "✅ Swagger UI: http://localhost:8080/swagger-ui.html"
    echo ""
    echo "---"
    echo "ℹ️  관련 서비스 정보 및 종료 안내"
    echo "---"
    echo "🔵 Redis (개발용 캐시 - docker-compose.dev.yml):"
    echo "   - 컨테이너 이름: testcase-redis-dev"
    echo "   - 포트: 6380 (호스트)"
    echo "   - 접속: redis-cli -h localhost -p 6380 -a redis_dev_password"
    echo "   - 시작/종료: docker-compose -f docker-compose.dev.yml up/down"
    echo ""
    echo "🖥️  Frontend (개발 서버 - 별도 실행):"
    echo "   - 시작: cd src/main/frontend && npm start"
    echo "   - 종료: 프론트엔드 터미널에서 Ctrl+C 또는 lsof -ti:3000 | xargs kill -9"
    echo ""
}

# 서버 시작
start() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null; then
            echo "⚠️ 서버($ENV)가 이미 PID $PID 로 실행 중입니다."
            exit 1
        else
            echo "⚠️ PID 파일($PID_FILE)이 존재하지만 프로세스가 실행 중이지 않습니다. 파일을 삭제합니다."
            rm "$PID_FILE"
        fi
    fi

    # 로그 및 PID 디렉토리 생성
    mkdir -p "$PIDS_DIR"
    mkdir -p "$LOGS_DIR"

    show_info
    echo "🚀 Spring Boot 애플리케이션($ENV)을 백그라운드로 시작합니다..."

    export SPRING_PROFILES_ACTIVE=$ENV
    export JIRA_ENCRYPTION_KEY="5CBRv5FwesBJkQ7ecX1KGCxyUQTcnE1CkkGBYDswb2Y="

    nohup ./gradlew bootRun --args="--spring.profiles.active=$ENV" > "$LOG_FILE" 2>&1 &
    PID=$!
    echo $PID > "$PID_FILE"

    sleep 5 # 시작할 시간을 줍니다.
    if ps -p $PID > /dev/null; then
        echo "✅ 서버($ENV)가 PID $PID 로 시작되었습니다. 로그는 $LOG_FILE 에 기록됩니다."
        echo "   로그 확인: tail -f $LOG_FILE"
    else
        echo "❌ 서버($ENV) 시작에 실패했습니다. $LOG_FILE 파일을 확인해주세요."
        rm "$PID_FILE"
        exit 1
    fi
}

# 서버 중지
stop() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        echo "🛑 PID $PID 서버($ENV)를 중지합니다..."
        
        # Try to kill gracefully first
        kill "$PID"
        sleep 3

        if ps -p "$PID" > /dev/null; then
            echo "⚠️ 프로세스가 정상적으로 종료되지 않았습니다. 강제 종료합니다."
            kill -9 "$PID"
            sleep 1
        fi
        rm "$PID_FILE"
        echo "✅ 서버($ENV)가 중지되었습니다."
    else
        echo "⚠️ 서버($ENV)가 실행 중이지 않습니다 (PID 파일 없음)."
    fi
    
    echo " 혹시 모를 좀비 프로세스를 정리합니다..."
    pkill -f "bootRun"
    echo "✅ 정리 완료."
}

# 서버 상태 확인
status() {
    echo "--- [Application Status] ---"
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p "$PID" > /dev/null; then
            echo "✅ Spring Boot App (PID: $PID): [RUNNING]"
            echo "  - H2 Database: [RUNNING] (애플리케이션에 내장)"
        else
            echo "❌ Spring Boot App: [STOPPED] (오래된 PID 파일 존재)"
            echo "  - H2 Database: [STOPPED]"
        fi
    else
        echo "❌ Spring Boot App: [STOPPED]"
        echo "  - H2 Database: [STOPPED]"
    fi
    echo ""

    echo "--- [Docker Services Status] ---"
    # Redis 상태 확인
    if docker ps --filter "name=testcase-redis-dev" --filter "status=running" | grep -q "testcase-redis-dev"; then
        echo "🔵 Redis (testcase-redis-dev): [RUNNING]"
    else
        echo "⚪ Redis (testcase-redis-dev): [STOPPED]"
    fi

    # PostgreSQL 상태 확인
    if docker ps --filter "name=testcase-postgres-dev" --filter "status=running" | grep -q "testcase-postgres-dev"; then
        echo "🐘 PostgreSQL (testcase-postgres-dev): [RUNNING]"
    else
        echo "⚪ PostgreSQL (testcase-postgres-dev): [STOPPED]"
    fi
    echo ""

    echo "--- [포트 사용 현황] ---"
    # Backend 포트(8080) 확인
    if lsof -ti:8080 > /dev/null; then
        echo "🔌 포트 8080 (Backend): [사용 중]"
    else
        echo "⚪ 포트 8080 (Backend): [사용 가능]"
    fi

    # Frontend 포트(3000) 확인
    if lsof -ti:3000 > /dev/null; then
        echo "🔌 포트 3000 (Frontend): [사용 중]"
    else
        echo "⚪ 포트 3000 (Frontend): [사용 가능]"
    fi
}

# --- 메인 로직 ---
# 인수가 없으면 사용법 출력
if [ -z "$1" ]; then
    usage
fi

# 명령에 따라 함수 실행
case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        echo "🔄 서버($ENV)를 재시작합니다..."
        stop
        sleep 2
        start
        ;;
    status)
        status
        ;;
    *)
        usage
        ;;
esac

exit 0
