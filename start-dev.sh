#!/bin/bash

# ===================================
# 개발환경 H2 관리 스크립트
# ===================================
# H2 파일 기반 개발환경을 관리합니다
# 사용법: ./start-dev.sh [start|stop|restart|status|logs|test|help]

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

# 환경 파일 로드
ENV_FILE=".env.dev"
if [ -f "$ENV_FILE" ]; then
    log_info ".env.dev 파일에서 환경 변수를 로드합니다..."
    set -a
    source "$ENV_FILE"
    set +a
    log_info "  - JIRA_ENCRYPTION_KEY: $JIRA_ENCRYPTION_KEY"
    log_info "  - JWT_SECRET: ${JWT_SECRET:0:10}..."
else
    log_warning "환경 파일 $ENV_FILE 이 존재하지 않습니다. 일부 환경 변수가 설정되지 않을 수 있습니다."
fi

# 설정 변수
APP_LOG_FILE="h2_app.log"
H2_DB_PATH="./data/testdb"
PROFILE="dev"

# Java 및 환경 확인 함수
check_java() {
    if ! command -v java &> /dev/null; then
        log_error "Java가 설치되지 않았습니다."
        exit 1
    fi
    
    # Java 21 권장
    java_version=$(java -version 2>&1 | head -1 | cut -d'"' -f2 | cut -d'.' -f1)
    if [ "$java_version" -lt 21 ]; then
        log_warning "Java 21 권장 (현재: Java $java_version)"
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
    log_header "H2 개발환경 상태 확인"
    
    echo ""
    log_info "1. Java 환경:"
    java -version 2>&1 | head -1 | sed 's/^/   /'
    echo "   JAVA_HOME: ${JAVA_HOME:-"(설정되지 않음)"}"
    
    echo ""
    log_info "2. 애플리케이션 상태:"
    if check_app_status; then
        log_success "✅ Spring Boot 애플리케이션: 실행 중"
        
        # 웹 서버 응답 확인
        if check_web_response; then
            log_success "✅ 웹 서버 응답: 정상 (http://localhost:8080)"
        else
            log_warning "⚠️  웹 서버 응답: 확인 불가"
        fi
    else
        log_warning "❌ Spring Boot 애플리케이션: 정지됨"
    fi
    
    echo ""
    log_info "3. 데이터베이스 파일:"
    if [ -f "${H2_DB_PATH}.mv.db" ]; then
        DB_SIZE=$(du -h "${H2_DB_PATH}.mv.db" | cut -f1)
        log_success "✅ H2 데이터베이스 파일: 존재 (크기: $DB_SIZE)"
    else
        log_warning "❌ H2 데이터베이스 파일: 없음 (첫 실행 시 생성됨)"
    fi
    
    echo ""
    log_info "4. 포트 사용 현황:"
    log_info "   애플리케이션: localhost:8080"
    log_info "   관리 포트: localhost:8083"
    if lsof -ti:8080 > /dev/null 2>&1; then
        log_success "✅ 포트 8080: 사용 중"
    else
        log_warning "❌ 포트 8080: 미사용"
    fi
    if lsof -ti:8083 > /dev/null 2>&1; then
        log_success "✅ 포트 8083: 사용 중"
    else
        log_warning "❌ 포트 8083: 미사용"
    fi
    
    echo ""
    log_info "5. 접속 정보:"
    log_info "   웹 애플리케이션: http://localhost:8080"
    log_info "   H2 콘솔: http://localhost:8080/h2-console"
    log_info "   Swagger UI: http://localhost:8080/swagger-ui.html"
    log_info "   관리 엔드포인트: http://localhost:8083/actuator"
}

# 시작 명령어
start_command() {
    log_header "H2 개발환경 시작"
    
    check_java
    
    # 환경 변수 설정
    log_info "환경 변수를 설정합니다..."
    export SPRING_PROFILES_ACTIVE=dev
    
    if check_app_status; then
        log_warning "Spring Boot 애플리케이션이 이미 실행 중입니다."
        log_info "현재 실행 중인 프로세스를 종료하려면: ./start-dev.sh stop"
        return 0
    fi
    
    log_success "H2 개발환경 설정 완료!"
    log_info "프로파일: $SPRING_PROFILES_ACTIVE"
    log_info "데이터베이스: H2 파일 기반 (${H2_DB_PATH}.mv.db)"
    log_info "JDBC URL: jdbc:h2:file:$H2_DB_PATH"
    log_info "H2 콘솔: http://localhost:8080/h2-console"
    log_info "로그 레벨: DEBUG"
    
    # 애플리케이션 시작 여부 확인
    echo ""
    read -p "Spring Boot 애플리케이션을 시작하시겠습니까? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_application
    else
        log_info "수동으로 애플리케이션을 시작하려면:"
        echo "export SPRING_PROFILES_ACTIVE=dev"
        echo "export JIRA_ENCRYPTION_KEY=\"5CBRv5FwesBJkQ7ecX1KGCxyUQTcnE1CkkGBYDswb2Y=\""
        echo "./gradlew bootRun"
    fi
}

# 애플리케이션 시작 함수
start_application() {
    log_info "Spring Boot 애플리케이션을 시작합니다..."
    
    # 환경 설정
    export SPRING_PROFILES_ACTIVE=dev
    
    # 백그라운드에서 애플리케이션 시작
    ./gradlew bootRun > $APP_LOG_FILE 2>&1 &
    APP_PID=$!
    
    log_info "애플리케이션을 시작했습니다 (PID: $APP_PID)"
    log_info "로그 파일: $APP_LOG_FILE"
    
    # 애플리케이션 시작 확인
    log_info "애플리케이션 시작을 확인합니다..."
    sleep 25
    
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
    log_header "H2 개발환경 정지"
    
    # 애플리케이션 정지
    if check_app_status; then
        log_info "Spring Boot 애플리케이션을 정지합니다..."
        pkill -f "bootRun"
        sleep 2
        log_success "Spring Boot 애플리케이션을 정지했습니다."
    else
        log_info "Spring Boot 애플리케이션이 실행되지 않고 있습니다."
    fi
    
    log_success "개발환경이 정지되었습니다."
}

# 재시작 명령어
restart_command() {
    log_header "H2 개발환경 재시작"
    
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
    
    if [ -f "$APP_LOG_FILE" ]; then
        log_info "Spring Boot 애플리케이션 로그를 표시합니다 (Ctrl+C로 종료):"
        tail -f $APP_LOG_FILE
    else
        log_warning "애플리케이션 로그 파일이 존재하지 않습니다: $APP_LOG_FILE"
        log_info "먼저 애플리케이션을 시작하세요: ./start-dev.sh start"
    fi
}

# 테스트 명령어
test_command() {
    log_header "H2 개발환경 테스트"
    
    if ! check_app_status; then
        log_error "애플리케이션이 실행되지 않고 있습니다."
        log_info "먼저 애플리케이션을 시작하세요: ./start-dev.sh start"
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
    log_header "H2 개발환경 관리 스크립트 사용법"
    
    echo ""
    log_info "사용법: ./start-dev.sh [COMMAND]"
    echo ""
    echo "사용 가능한 명령어:"
    echo "  start     H2 개발환경 및 애플리케이션 시작"
    echo "  stop      애플리케이션 정지"
    echo "  restart   애플리케이션 재시작"
    echo "  status    현재 상태 확인"
    echo "  logs      로그 확인"
    echo "  test      로그인 기능 테스트"
    echo "  help      이 도움말 표시"
    echo ""
    echo "명령어 없이 실행하면 대화형 모드로 실행됩니다."
    echo ""
    log_info "참고하는 설정 파일:"
    echo "  1. src/main/resources/application.yml (공통 설정)"
    echo "  2. src/main/resources/application-dev.yml (dev 프로파일 설정)"
    echo ""
    log_info "개발환경 정보:"
    echo "  프로파일: dev"
    echo "  데이터베이스: H2 파일 기반"
    echo "  JDBC URL: jdbc:h2:file:$H2_DB_PATH"
    echo "  웹 애플리케이션: http://localhost:8080"
    echo "  H2 콘솔: http://localhost:8080/h2-console"
    echo "  Swagger UI: http://localhost:8080/swagger-ui.html"
    echo "  관리 포트: http://localhost:8083/actuator"
    echo ""
    log_info "로그인 정보:"
    echo "  사용자명: admin"
    echo "  비밀번호: admin"
    echo ""
    log_info "유용한 명령어:"
    echo "  H2 데이터베이스 초기화:"
    echo "    rm -f ${H2_DB_PATH}.mv.db"
    echo "    ./start-dev.sh restart"
    echo ""
    echo "  로그 실시간 확인:"
    echo "    tail -f $APP_LOG_FILE"
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
            log_info "대화형 모드로 실행합니다. 도움말: ./start-dev.sh help"
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