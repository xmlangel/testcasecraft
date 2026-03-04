#!/bin/bash

# API 테스트 실행 유틸리티 스크립트
# 사용법: ./run-api-test.sh [옵션]

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 환경 변수 및 설정
PROJECT_ROOT=$(pwd)
GRADLE_CMD="./gradlew"

# gradlew 파일 존재 확인
if [ ! -f "$GRADLE_CMD" ]; then
    echo -e "${RED}오류: $GRADLE_CMD 파일을 찾을 수 없습니다. 프로젝트 루트에서 실행해 주세요.${NC}"
    exit 1
fi

# 도움말 출력
show_help() {
    echo -e "${BLUE}API 테스트 실행 도구${NC}"
    echo "사용법: $0 [옵션]"
    echo ""
    echo "옵션:"
    echo "  --class <ClassName>   특정 테스트 클래스 실행 (패키지명 제외 가능)"
    echo "  --method <MethodName> 특정 테스트 메서드만 실행"
    echo "  --all                 모든 API 테스트 실행"
    echo "  --comprehensive       종합 API 테스트(apiComprehensiveTest) 실행"
    echo "  --report              테스트 후 Allure 리포트 생성 및 오픈"
    echo "  --help                도움말 표시"
    echo ""
    echo "예시:"
    echo "  $0 --class TestCaseControllerJsonSchemaTest"
    echo "  $0 --class SingleApiTest --report"
}

# 기본 변수 초기화
GRADLE_ARGS=()
RUN_COMPREHENSIVE=false
OPEN_REPORT=false
CLASS_NAME=""

# 인자 파싱
while [[ $# -gt 0 ]]; do
    case $1 in
        --class)
            if [[ -n "$2" ]]; then
                CLASS_NAME="$2"
                shift 2
            else
                echo -e "${RED}오류: --class 뒤에 클래스명이 필요합니다.${NC}"
                exit 1
            fi
            ;;
        --method)
            if [[ -n "$2" ]]; then
                if [[ -n "$CLASS_NAME" ]]; then
                    GRADLE_ARGS+=("--tests" "*.${CLASS_NAME}.${2}")
                    CLASS_NAME="" # 메서드와 결합되었으므로 초기화
                else
                    GRADLE_ARGS+=("--tests" "*.*.${2}")
                fi
                shift 2
            else
                echo -e "${RED}오류: --method 뒤에 메서드명이 필요합니다.${NC}"
                exit 1
            fi
            ;;
        --all)
            GRADLE_ARGS+=("--tests" "com.testcase.testcasemanagement.api.*")
            shift
            ;;
        --comprehensive)
            RUN_COMPREHENSIVE=true
            shift
            ;;
        --report)
            OPEN_REPORT=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}알 수 없는 옵션: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# 클래스명만 남은 경우 처리
if [[ -n "$CLASS_NAME" ]]; then
    GRADLE_ARGS+=("--tests" "*.${CLASS_NAME}")
fi

# 실행 로직
echo -e "${YELLOW}>>> API 테스트를 시작합니다...${NC}"

if [ "$RUN_COMPREHENSIVE" = true ]; then
    echo -e "${BLUE}실행 명령: ${GRADLE_CMD} apiComprehensiveTest${NC}"
    ${GRADLE_CMD} apiComprehensiveTest
else
    if [ ${#GRADLE_ARGS[@]} -eq 0 ]; then
        echo -e "${YELLOW}필터가 지정되지 않았습니다. 모든 API 테스트를 실행합니다.${NC}"
        GRADLE_ARGS+=("--tests" "com.testcase.testcasemanagement.api.*")
    fi
    echo -e "${BLUE}실행 명령: ${GRADLE_CMD} test ${GRADLE_ARGS[*]}${NC}"
    ${GRADLE_CMD} test "${GRADLE_ARGS[@]}"
fi

EXIT_CODE=$?

# 결과 처리
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${GREEN}테스트 성공!${NC}"
else
    echo -e "${RED}테스트 실패 (Exit Code: $EXIT_CODE)${NC}"
fi

# 리포트 처리
if [ "$OPEN_REPORT" = true ]; then
    echo -e "${YELLOW}>>> Allure 리포트를 생성하고 서버를 가동합니다...${NC}"
    ${GRADLE_CMD} allureReport
    ${GRADLE_CMD} allureServe
fi

exit $EXIT_CODE
