#!/bin/bash

# ===================================
# 개발환경 PostgreSQL 관리 스크립트
# ===================================
# Docker PostgreSQL 개발환경을 관리합니다
# 사용법: ./start-dev-postgresql.sh [start|stop|restart|status|logs|help]

set -e

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_header() {
    echo -e "${CYAN}=== $1 ===${NC}"
}

# 설정 변수
COMPOSE_FILE="docker-compose.dev.yml"
ENV_FILE=".env.dev"
CONTAINER_NAME="testcase-postgres-dev"
SERVICE_NAME="postgres-dev"
APP_LOG_FILE="postgresql_app.log"

# Docker 및 환경 확인 함수
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker가 설치되지 않았습니다."
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose가 설치되지 않았습니다."
        exit 1
    fi
}

# 환경 파일 확인 함수
check_env_file() {
    if [ ! -f "$ENV_FILE" ]; then
        log_error "환경 파일 $ENV_FILE 이 존재하지 않습니다."
        log_info "다음 명령어로 PostgreSQL 환경 파일을 생성하세요:"
        echo "cp .env.dev.example .env.dev"
        log_info "또는 다음 내용으로 $ENV_FILE 파일을 생성하세요:"
        echo "POSTGRES_DB=testcase_management_dev"
        echo "POSTGRES_USER=testcase_user"
        echo "POSTGRES_PASSWORD=testcase_dev_password"
        echo "POSTGRES_DEV_PORT=5433"
        echo "SPRING_PROFILES_ACTIVE=dev-postgresql"
        exit 1
    fi
}

# PostgreSQL 컨테이너 상태 확인 함수
check_postgres_status() {
    if docker ps | grep -q $CONTAINER_NAME; then
        return 0  # 실행 중
    else
        return 1  # 정지 상태
    fi
}

# 애플리케이션 상태 확인 함수
check_app_status() {
    if pgrep -f "bootRun" > /dev/null; then
        return 0  # 실행 중
    else
        return 1  # 정지 상태
    fi
}

# PostgreSQL 연결 확인 함수
check_postgres_ready() {
    docker exec $CONTAINER_NAME pg_isready -U testcase_user -d testcase_management_dev > /dev/null 2>&1
}

# 웹 서버 응답 확인 함수
check_web_response() {
    curl -s --max-time 5 http://localhost:8080 > /dev/null 2>&1
}

# 로그인 테스트 함수
test_login() {
    log_info "로그인 기능 테스트를 시작합니다..."
    
    # 로그인 API 호출
    LOGIN_RESPONSE=$(curl -X POST http://localhost:8080/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"username":"admin","password":"admin"}' \
      -s -w "%{http_code}" -o /tmp/login_response.json)
    
    HTTP_CODE="${LOGIN_RESPONSE: -3}"
    
    if [ "$HTTP_CODE" = "200" ]; then
        # JSON 응답에서 accessToken 확인
        if command -v jq &> /dev/null; then
            ACCESS_TOKEN=$(jq -r '.accessToken' /tmp/login_response.json 2>/dev/null)
            if [ "$ACCESS_TOKEN" != "null" ] && [ -n "$ACCESS_TOKEN" ]; then
                log_success "✅ 로그인 테스트 통과!"
                log_info "   - 로그인 계정: admin/admin"
                log_info "   - JWT 토큰 생성: 성공"
                
                # 토큰으로 API 접근 테스트
                ORG_RESPONSE=$(curl -H "Authorization: Bearer $ACCESS_TOKEN" \
                  http://localhost:8080/api/organizations \
                  -s -w "%{http_code}" -o /tmp/org_response.json)
                ORG_HTTP_CODE="${ORG_RESPONSE: -3}"
                
                if [ "$ORG_HTTP_CODE" = "200" ]; then
                    log_success "   - 인증된 API 접근: 성공"
                else
                    log_warning "   - 인증된 API 접근: 실패 (HTTP $ORG_HTTP_CODE)"
                fi
            else
                log_error "❌ 로그인 실패: JWT 토큰을 받을 수 없음"
                cat /tmp/login_response.json 2>/dev/null | head -3
                return 1
            fi
        else
            log_success "✅ 로그인 API 응답 수신 (jq 미설치로 상세 검증 생략)"
        fi
    else
        log_error "❌ 로그인 실패 (HTTP $HTTP_CODE)"
        cat /tmp/login_response.json 2>/dev/null | head -3
        return 1
    fi
    
    # 임시 파일 정리
    rm -f /tmp/login_response.json /tmp/org_response.json
}

# 상태 확인 명령어
status_command() {
    log_header "PostgreSQL 개발환경 상태 확인"
    
    echo ""
    log_info "1. Docker 서비스 상태:"
    if check_postgres_status; then
        log_success "✅ PostgreSQL 컨테이너: 실행 중"
        if check_postgres_ready; then
            log_success "✅ PostgreSQL 연결: 정상"
        else
            log_warning "⚠️  PostgreSQL 연결: 대기 중"
        fi
    else
        log_warning "❌ PostgreSQL 컨테이너: 정지됨"
    fi
    
    echo ""
    log_info "2. 애플리케이션 상태:"
    if check_app_status; then
        log_success "✅ Spring Boot 애플리케이션: 실행 중"
        
        # 웹 서버 응답 확인
        if curl -s http://localhost:8080 > /dev/null 2>&1; then
            log_success "✅ 웹 서버 응답: 정상 (http://localhost:8080)"
        else
            log_warning "⚠️  웹 서버 응답: 확인 불가"
        fi
    else
        log_warning "❌ Spring Boot 애플리케이션: 정지됨"
    fi
    
    echo ""
    log_info "3. 컨테이너 상세 정보:"
    if check_postgres_status; then
        docker ps | head -1
        docker ps | grep $CONTAINER_NAME || true
    else
        log_warning "실행 중인 PostgreSQL 컨테이너가 없습니다."
    fi
    
    echo ""
    log_info "4. 포트 사용 현황:"
    log_info "PostgreSQL: localhost:5433"
    log_info "애플리케이션: localhost:8080"
    if lsof -ti:5433 > /dev/null 2>&1; then
        log_success "✅ 포트 5433: 사용 중"
    else
        log_warning "❌ 포트 5433: 미사용"
    fi
    if lsof -ti:8080 > /dev/null 2>&1; then
        log_success "✅ 포트 8080: 사용 중"
    else
        log_warning "❌ 포트 8080: 미사용"
    fi
}

# 시작 명령어
start_command() {
    log_header "PostgreSQL 개발환경 시작"
    
    check_docker
    check_env_file
    
    # 환경 변수 로드
    log_info ".env.dev 파일에서 환경 변수를 로드합니다..."
    set -a
    source $ENV_FILE
    set +a
    log_info "  - JIRA_ENCRYPTION_KEY: $JIRA_ENCRYPTION_KEY"
    log_info "  - JWT_SECRET: ${JWT_SECRET:0:10}..."
    
    # PostgreSQL 시작
    if check_postgres_status; then
        log_warning "PostgreSQL 컨테이너가 이미 실행 중입니다."
    else
        log_info "PostgreSQL Docker 컨테이너를 시작합니다..."
        docker-compose -f $COMPOSE_FILE --env-file $ENV_FILE up -d $SERVICE_NAME
        
        # PostgreSQL 준비 확인
        log_info "PostgreSQL 연결 준비를 확인합니다..."
        max_attempts=30
        attempt=1
        
        while [ $attempt -le $max_attempts ]; do
            if check_postgres_ready; then
                log_success "PostgreSQL이 준비되었습니다!"
                break
            fi
            
            if [ $attempt -eq $max_attempts ]; then
                log_error "PostgreSQL 연결 준비 시간이 초과되었습니다."
                log_info "로그를 확인하세요: docker-compose -f $COMPOSE_FILE logs $SERVICE_NAME"
                exit 1
            fi
            
            echo -n "."
            sleep 2
            ((attempt++))
        done
        echo ""
    fi
    
    log_success "PostgreSQL 개발환경이 준비되었습니다!"
    log_info "PostgreSQL: localhost:5433"
    log_info "데이터베이스: testcase_management_dev"
    log_info "사용자: testcase_user"
    
    # 애플리케이션 시작 여부 확인
    echo ""
    if check_app_status; then
        log_warning "Spring Boot 애플리케이션이 이미 실행 중입니다."
        log_info "현재 실행 중인 프로세스를 종료하려면: ./start-dev-postgresql.sh stop"
    else
        read -p "Spring Boot 애플리케이션을 시작하시겠습니까? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            start_application
        else
            log_info "수동으로 애플리케이션을 시작하려면:"
            echo "export JAVA_HOME=/Users/dicky/Library/Java/JavaVirtualMachines/corretto-21.0.7/Contents/Home"
            echo "export SPRING_PROFILES_ACTIVE=dev-postgresql"
            echo "export JIRA_ENCRYPTION_KEY=\"5CBRv5FwesBJkQ7ecX1KGCxyUQTcnE1CkkGBYDswb2Y=\""
            echo "./gradlew bootRun"
        fi
    fi
}

# 애플리케이션 시작 함수
start_application() {
    log_info "Spring Boot 애플리케이션을 시작합니다..."
    
    # Java 환경 설정
    export JAVA_HOME=/Users/dicky/Library/Java/JavaVirtualMachines/corretto-21.0.7/Contents/Home
    export SPRING_PROFILES_ACTIVE=dev-postgresql
    
    # 백그라운드에서 애플리케이션 시작
    ./gradlew bootRun > $APP_LOG_FILE 2>&1 &
    APP_PID=$!
    
    log_info "애플리케이션을 시작했습니다 (PID: $APP_PID)"
    log_info "로그 파일: $APP_LOG_FILE"
    
    # 애플리케이션 시작 확인
    log_info "애플리케이션 시작을 확인합니다..."
    sleep 40
    
    if check_web_response; then
        log_success "애플리케이션이 성공적으로 시작되었습니다!"
        log_info "웹 브라우저에서 http://localhost:8080 에 접속하세요"
        log_info "로그인: admin / admin"
        
        # 로그인 테스트 실행
        echo ""
        test_login
    else
        log_warning "애플리케이션 시작을 확인할 수 없습니다."
        log_info "로그를 확인하세요: tail -f $APP_LOG_FILE"
    fi
}

# 정지 명령어
stop_command() {
    log_header "PostgreSQL 개발환경 정지"
    
    # 애플리케이션 정지
    if check_app_status; then
        log_info "Spring Boot 애플리케이션을 정지합니다..."
        pkill -f "bootRun"
        log_success "Spring Boot 애플리케이션을 정지했습니다."
    else
        log_info "Spring Boot 애플리케이션이 실행되지 않고 있습니다."
    fi
    
    # PostgreSQL 정지
    if check_postgres_status; then
        log_info "PostgreSQL 컨테이너를 정지합니다..."
        docker-compose -f $COMPOSE_FILE stop $SERVICE_NAME
        log_success "PostgreSQL 컨테이너를 정지했습니다."
    else
        log_info "PostgreSQL 컨테이너가 실행되지 않고 있습니다."
    fi
    
    log_success "개발환경이 정지되었습니다."
}

# 재시작 명령어
restart_command() {
    log_header "PostgreSQL 개발환경 재시작"
    
    log_info "개발환경을 정지합니다..."
    stop_command
    
    echo ""
    log_info "3초 후 개발환경을 시작합니다..."
    sleep 3
    
    start_command
}

# 로그 확인 명령어
logs_command() {
    log_header "로그 확인"
    
    echo ""
    log_info "사용 가능한 로그:"
    echo "1. PostgreSQL 로그"
    echo "2. Spring Boot 애플리케이션 로그"
    echo ""
    
    read -p "확인할 로그를 선택하세요 (1-2): " -n 1 -r
    echo
    
    case $REPLY in
        1)
            log_info "PostgreSQL 로그를 표시합니다 (Ctrl+C로 종료):"
            docker-compose -f $COMPOSE_FILE logs -f $SERVICE_NAME
            ;;
        2)
            if [ -f "$APP_LOG_FILE" ]; then
                log_info "Spring Boot 애플리케이션 로그를 표시합니다 (Ctrl+C로 종료):"
                tail -f $APP_LOG_FILE
            else
                log_warning "애플리케이션 로그 파일이 존재하지 않습니다: $APP_LOG_FILE"
            fi
            ;;
        *)
            log_warning "잘못된 선택입니다."
            ;;
    esac
}

# 테스트 명령어
test_command() {
    log_header "PostgreSQL 개발환경 테스트"
    
    if ! check_app_status; then
        log_error "애플리케이션이 실행되지 않고 있습니다."
        log_info "먼저 애플리케이션을 시작하세요: ./start-dev-postgresql.sh start"
        exit 1
    fi
    
    if ! check_web_response; then
        log_error "웹 서버에 연결할 수 없습니다."
        exit 1
    fi
    
    # 로그인 테스트 실행
    test_login
}

# 도움말 명령어
help_command() {
    log_header "PostgreSQL 개발환경 관리 스크립트 사용법"
    
    echo ""
    log_info "사용법: ./start-dev-postgresql.sh [COMMAND]"
    echo ""
    echo "사용 가능한 명령어:"
    echo "  start     PostgreSQL 컨테이너 및 애플리케이션 시작"
    echo "  stop      PostgreSQL 컨테이너 및 애플리케이션 정지" 
    echo "  restart   PostgreSQL 컨테이너 및 애플리케이션 재시작"
    echo "  status    현재 상태 확인"
    echo "  logs      로그 확인"
    echo "  test      로그인 기능 테스트"
    echo "  help      이 도움말 표시"
    echo ""
    echo "명령어 없이 실행하면 대화형 모드로 실행됩니다."
    echo ""
    log_info "참고하는 설정 파일:"
    echo "  1. src/main/resources/application.yml (공통 설정)"
    echo "  2. src/main/resources/application-dev-postgresql.yml (dev-postgresql 프로파일 설정)"
    echo ""
    log_info "유용한 명령어:"
    echo "  PostgreSQL 직접 접속:"
    echo "    docker exec -it $CONTAINER_NAME psql -U testcase_user -d testcase_management_dev"
    echo ""
    echo "  전체 개발환경 정리:"
    echo "    docker-compose -f $COMPOSE_FILE down"
    echo ""
    echo "  데이터 초기화 (주의!):"
    echo "    rm -rf ./docker_dev_data/postgres/"
    echo "    docker-compose -f $COMPOSE_FILE up -d $SERVICE_NAME"
}

# 메인 실행 로직
main() {
    case "${1:-}" in
        "start")
            start_command
            ;;
        "stop")
            stop_command
            ;;
        "restart")
            restart_command
            ;;
        "status")
            status_command
            ;;
        "logs")
            logs_command
            ;;
        "test")
            test_command
            ;;
        "help"|"-h"|"--help")
            help_command
            ;;
        "")
            # 명령어 없이 실행하면 기존 대화형 모드
            log_info "대화형 모드로 실행합니다. 도움말: ./start-dev-postgresql.sh help"
            start_command
            ;;
        *)
            log_error "알 수 없는 명령어: $1"
            echo ""
            help_command
            exit 1
            ;;
    esac
}

# 스크립트 실행
main "$@"