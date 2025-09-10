#!/bin/bash

# =============================================================================
# JUnit XML 파일 업로드 스크립트
# =============================================================================
# 
# 사용법:
#   ./junit-upload.sh <XML파일경로> <프로젝트ID> [실행이름] [설명] [서버URL] [사용자명] [비밀번호]
#
# 예시:
#   ./junit-upload.sh ./test-results.xml project-123 "CI-Build-001" "자동화 테스트 결과"
#   ./junit-upload.sh ./results/junit.xml project-456 "Manual-Test" "수동 실행" http://localhost:8080 admin admin
#
# =============================================================================

set -e  # 오류 발생 시 스크립트 종료

# 기본 설정
DEFAULT_SERVER_URL="http://localhost:8080"
DEFAULT_USERNAME="admin"
DEFAULT_PASSWORD="admin"

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 사용법 출력
show_usage() {
    cat << EOF
=============================================================================
JUnit XML 파일 업로드 스크립트
=============================================================================

사용법:
  $0 <XML파일경로> <프로젝트ID> [실행이름] [설명] [서버URL] [사용자명] [비밀번호]

필수 매개변수:
  XML파일경로    업로드할 JUnit XML 파일의 경로
  프로젝트ID     대상 프로젝트의 ID

선택적 매개변수:
  실행이름       테스트 실행 이름 (기본값: 파일명 기반)
  설명          테스트 실행에 대한 설명
  서버URL       서버 URL (기본값: $DEFAULT_SERVER_URL)
  사용자명       로그인 사용자명 (기본값: $DEFAULT_USERNAME)
  비밀번호       로그인 비밀번호 (기본값: $DEFAULT_PASSWORD)

예시:
  # 기본 설정으로 업로드
  $0 ./test-results.xml project-123

  # 상세 정보와 함께 업로드
  $0 ./results/junit.xml project-456 "CI-Build-001" "자동화 테스트 결과"

  # 다른 서버에 업로드
  $0 ./junit.xml project-789 "Manual-Test" "수동 실행" http://192.168.1.100:8080 testuser testpass

=============================================================================
EOF
}

# 매개변수 검증
if [ $# -lt 2 ]; then
    log_error "필수 매개변수가 부족합니다."
    show_usage
    exit 1
fi

# 매개변수 할당
XML_FILE_PATH="$1"
PROJECT_ID="$2"
EXECUTION_NAME="${3:-$(basename "$XML_FILE_PATH" .xml)-$(date +%Y%m%d-%H%M%S)}"
DESCRIPTION="${4:-JUnit XML 파일 업로드 via Shell Script}"
SERVER_URL="${5:-$DEFAULT_SERVER_URL}"
USERNAME="${6:-$DEFAULT_USERNAME}"
PASSWORD="${7:-$DEFAULT_PASSWORD}"

# 설정 출력
log_info "업로드 설정:"
echo "  파일 경로: $XML_FILE_PATH"
echo "  프로젝트 ID: $PROJECT_ID"
echo "  실행 이름: $EXECUTION_NAME"
echo "  설명: $DESCRIPTION"
echo "  서버 URL: $SERVER_URL"
echo "  사용자명: $USERNAME"
echo "  비밀번호: [보안상 숨김]"
echo

# 파일 존재 여부 확인
if [ ! -f "$XML_FILE_PATH" ]; then
    log_error "XML 파일이 존재하지 않습니다: $XML_FILE_PATH"
    exit 1
fi

# XML 파일 유효성 기본 검사
if [[ ! "$XML_FILE_PATH" =~ \.(xml|XML)$ ]]; then
    log_warn "파일 확장자가 .xml이 아닙니다. 계속 진행하시겠습니까? (y/n)"
    read -r confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        log_info "업로드가 취소되었습니다."
        exit 0
    fi
fi

# curl 설치 확인
if ! command -v curl &> /dev/null; then
    log_error "curl이 설치되어 있지 않습니다. curl을 설치해주세요."
    exit 1
fi

# 임시 파일 생성 (쿠키 저장용)
COOKIE_FILE=$(mktemp)
trap "rm -f $COOKIE_FILE" EXIT

log_info "서버 접속 테스트..."

# 서버 응답 확인
if ! curl -s --max-time 10 "$SERVER_URL/actuator/health" &> /dev/null; then
    log_error "서버에 접속할 수 없습니다: $SERVER_URL"
    log_info "서버가 실행 중인지 확인해주세요."
    exit 1
fi

log_success "서버 접속 성공"

# 로그인 수행
log_info "사용자 인증 중..."

LOGIN_RESPONSE=$(curl -s -X POST "$SERVER_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"username\": \"$USERNAME\", \"password\": \"$PASSWORD\"}" \
    -c "$COOKIE_FILE" \
    -w "HTTPSTATUS:%{http_code}")

# HTTP 상태 코드 추출
HTTP_STATUS=$(echo "$LOGIN_RESPONSE" | sed -e 's/.*HTTPSTATUS://')
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | sed -e 's/HTTPSTATUS:.*//')

if [ "$HTTP_STATUS" -ne 200 ]; then
    log_error "로그인 실패 (HTTP $HTTP_STATUS)"
    echo "응답: $LOGIN_BODY"
    exit 1
fi

# JWT 토큰 추출
JWT_TOKEN=$(echo "$LOGIN_BODY" | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$JWT_TOKEN" ]; then
    log_error "JWT 토큰을 추출할 수 없습니다."
    echo "로그인 응답: $LOGIN_BODY"
    exit 1
fi

log_success "인증 완료"

# 파일 크기 확인 및 알림
FILE_SIZE=$(stat -f%z "$XML_FILE_PATH" 2>/dev/null || stat -c%s "$XML_FILE_PATH" 2>/dev/null)
FILE_SIZE_MB=$((FILE_SIZE / 1024 / 1024))

log_info "파일 정보:"
echo "  파일 크기: ${FILE_SIZE_MB}MB (${FILE_SIZE} bytes)"

# 대용량 파일 경고
if [ $FILE_SIZE -gt 52428800 ]; then  # 50MB
    log_warn "대용량 파일입니다 (${FILE_SIZE_MB}MB). 업로드에 시간이 오래 걸릴 수 있습니다."
    log_info "서버에서 백그라운드 처리됩니다."
fi

# 파일 업로드 수행
log_info "JUnit XML 파일 업로드 중..."

UPLOAD_RESPONSE=$(curl -s -X POST "$SERVER_URL/api/junit-results/upload" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -F "file=@$XML_FILE_PATH" \
    -F "projectId=$PROJECT_ID" \
    -F "executionName=$EXECUTION_NAME" \
    -F "description=$DESCRIPTION" \
    -w "HTTPSTATUS:%{http_code}")

# HTTP 상태 코드 추출
UPLOAD_HTTP_STATUS=$(echo "$UPLOAD_RESPONSE" | sed -e 's/.*HTTPSTATUS://')
UPLOAD_BODY=$(echo "$UPLOAD_RESPONSE" | sed -e 's/HTTPSTATUS:.*//')

echo
log_info "업로드 응답 (HTTP $UPLOAD_HTTP_STATUS):"
echo "$UPLOAD_BODY" | python3 -m json.tool 2>/dev/null || echo "$UPLOAD_BODY"

if [ "$UPLOAD_HTTP_STATUS" -eq 200 ]; then
    log_success "JUnit XML 파일 업로드 완료!"
    
    # 응답에서 주요 정보 추출
    TEST_RESULT_ID=$(echo "$UPLOAD_BODY" | grep -o '"testResultId":"[^"]*' | cut -d'"' -f4)
    IS_ASYNC=$(echo "$UPLOAD_BODY" | grep -o '"isAsync":[^,}]*' | cut -d':' -f2)
    
    if [ "$IS_ASYNC" = "true" ]; then
        log_info "대용량 파일로 인해 백그라운드에서 처리됩니다."
        if [ -n "$TEST_RESULT_ID" ]; then
            log_info "처리 진행률 확인: curl -H \"Authorization: Bearer $JWT_TOKEN\" \"$SERVER_URL/api/junit-results/$TEST_RESULT_ID/processing-progress\""
        fi
    fi
    
    echo
    log_info "웹 브라우저에서 결과 확인:"
    echo "  URL: $SERVER_URL/projects/$PROJECT_ID"
    echo "  자동화 테스트 탭에서 업로드된 결과를 확인할 수 있습니다."
    
else
    log_error "업로드 실패 (HTTP $UPLOAD_HTTP_STATUS)"
    
    # 일반적인 오류 메시지 해석
    case $UPLOAD_HTTP_STATUS in
        400)
            log_error "잘못된 요청입니다. 파일 형식이나 매개변수를 확인해주세요."
            ;;
        401)
            log_error "인증이 만료되었거나 유효하지 않습니다."
            ;;
        403)
            log_error "해당 프로젝트에 업로드 권한이 없습니다."
            ;;
        413)
            log_error "파일이 너무 큽니다. 서버의 파일 크기 제한을 확인해주세요."
            ;;
        500)
            log_error "서버 내부 오류가 발생했습니다."
            ;;
    esac
    
    exit 1
fi

# 정리
rm -f "$COOKIE_FILE"

echo
log_success "스크립트 실행 완료!"